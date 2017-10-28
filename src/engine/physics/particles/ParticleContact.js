import math from 'math';
const { vec3 } = math;

let helperVec = vec3.create();
let impulsePerInvMass = vec3.create();
let movePerInvMass = vec3.create();
let accCausedVelocity = vec3.create();

export default class ParticleContact {

  constructor () {
    this.particle1 = null
    this.particle2 = null
    this.restitution = 1;
    this.contactNormal = vec3.create();
    this.penetration = 0;
  }

  setup (particle1, particle2, restitution, contactNormal) {
    this.particle1 = particle1;
    this.particle2 = particle2;
    this.restitution = restitution;
    vec3.copy(this.contactNormal, contactNormal);
  }

  resolve (dt) {
    this.resolveVelocity(dt);
  }

  calculateSeparatingSpeed () {
    if (this.particle2) {
      vec3.subtract(helperVec, this.particle1.velocity, this.particle2.velocity);
      return vec3.dot(helperVec, this.contactNormal);
    } else {
      return vec3.dot(this.particle1.velocity, this.contactNormal);
    }
  }

  resolveVelocity (dt) {
    let particle1 = this.particle1;
    let particle2 = this.particle2;

    let separatingSpeed = this.calculateSeparatingSpeed();

    if (separatingSpeed > 0) {
      return;
    }

    let newSepSpeed = -separatingSpeed * this.restitution;

    // Correct separating speed if movement was caused by acceleration from the rest position (zero relative speed)
    vec3.copy(accCausedVelocity, particle1.acceleration);
    if (particle2) {
      vec3.subtract(accCausedVelocity, accCausedVelocity, particle2.acceleration);
    };

    // Acceleration value towards the contact normal
    let accCausedSepVelocity = vec3.dot(accCausedVelocity, this.contactNormal) * dt;
    if (accCausedSepVelocity < 0) { // Amount of acceleration
      newSepSpeed += this.restitution * accCausedSepVelocity;
      if (newSepSpeed < 0) {
        newSepSpeed = 0;
      }
    }

    let deltaSpeed = newSepSpeed - separatingSpeed;
    let totalInvMass = particle1.inverseMass;
    if (particle2) {
      totalInvMass += particle2.inverseMass;
    }

    if (totalInvMass <= 0) {
      return;
    }

    // Total impulse
    let impulse = deltaSpeed / totalInvMass; // same as deltaSpeed * (p1.mass + p2.mass)
    vec3.scale(impulsePerInvMass, this.contactNormal, impulse);

    vec3.scaleAndAdd(particle1.velocity, particle1.velocity, impulsePerInvMass, particle1.inverseMass);
    if (particle2) {
      vec3.scaleAndAdd(particle2.velocity, particle2.velocity, impulsePerInvMass, -particle2.inverseMass);
    }

    // Also resolve penetration
    if (this.penetration > 0) {
      vec3.scale(movePerInvMass, this.contactNormal, this.penetration / totalInvMass);

      // Shift for particle1
      vec3.scale(helperVec, movePerInvMass, particle1.inverseMass);
      vec3.add(particle1.position, particle1.position, helperVec);

      // Shift for particle2
      if (particle2) {
        // Shift for particle1
        vec3.scale(helperVec, movePerInvMass, particle2.inverseMass);
        vec3.add(particle2.position, particle2.position, helperVec);
      }
    }

  }

}