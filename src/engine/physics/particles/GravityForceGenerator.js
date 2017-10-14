import ParticleForceGenerator from './ParticleForceGenerator';
import { vec3 } from 'math';

let helperVec = vec3.create();

export default class GravityForceGenerator extends ParticleForceGenerator {

  constructor (x = 0, y = 10, z = 0) {
    this.gravity = vec3.create();
    vec3.set(this.gravity, x, y, z);
  }

  updateForce (particle, dt) {
    if (particle.inverseMass === 0) {
      return;
    }

    vec3.scale(helperVec, this.gravity, particle.mass);
    particle.addForce(helperVec);
  }

}