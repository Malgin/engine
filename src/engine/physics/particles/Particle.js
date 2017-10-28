import math from 'math';
const { vec3 } = math;
const { pow } = Math;

let resultingAcc = vec3.create(); // Helper object

export default class Particle {

  constructor () {
    this.position = vec3.create();
    this.velocity = vec3.create();
    this.acceleration = vec3.create();
    this.forceAccum = vec3.create();

    this.damping = 0.98;

    this.setInveseMass(1);
  }

  setPosition (position) {
    vec3.copy(this.position, position);
  }

  setVelocity (velocity) {
    vec3.copy(this.velocity, velocity);
  }

  setMass (mass) {
    this.inverseMass = 1 / mass;
    this.mass = mass;
  }

  setInveseMass (inverseMass) {
    this.inverseMass = inverseMass;
    this.mass = 1 / inverseMass;
  }

  setAcceleration (x, y, z) {
    vec3.set(this.acceleration, x, y, z);
  }

  integrate (dt) {
    if (this.inverseMass <= 0) { // infinite mass
      return;
    }

    // Position
    vec3.scaleAndAdd(this.position, this.position, this.velocity, dt);

    // Acceleration
    vec3.add(resultingAcc, this.acceleration, this.forceAccum);
    vec3.scaleAndAdd(this.velocity, this.velocity, resultingAcc, dt);

    // Drag
    vec3.scale(this.velocity, this.velocity, pow(this.damping, dt));

    this.clearAccumulator();
  }

  addForce (force) {
    vec3.add(this.forceAccum, this.forceAccum, force);
  }

  get kineticEnergy () {
    return 1 / this.inverseMass * vec3.squaredLength(this.velocity) * 0.5;
  }

  clearAccumulator () {
    let v = this.forceAccum;
    v[0] = v[1] = v[2] = 0;
  }

}