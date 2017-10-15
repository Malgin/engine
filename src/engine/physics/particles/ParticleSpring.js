import ParticleForceGenerator from './ParticleForceGenerator';
import { vec3 } from 'math';

let force = vec3.create();

const { abs } = Math;

export default class ParticleSpring extends ParticleForceGenerator {

  constructor (otherParticle, springConstant = 0.5, restLength = 2) {
    this.setup(otherParticle, springConstant, restLength);
  }

  setup (otherParticle, springConstant, restLength) {
    this.otherParticle = otherParticle;
    this.springConstant = springConstant;
    this.restLength = restLength;
  }

  updateForce (particle, dt) {
    vec3.subtrace(force, particle.position, this.otherParticle.position);
    let magnitude = vec3.length(force);
    magnitude = abs(magnitude - this.restLength); // delta l
    magnitude *= this.springConstant; // multiplied by spring value

    // Normalize force and multiply by -magnitude
    force.scale(-length * magnitude);
    particle.addForce(force);
  }

}