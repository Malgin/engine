import app from 'engine/Application';
import BaseScene from '../BaseScene';
import Resources from 'engine/Resources';
import Particle from 'engine/physics/particles/Particle';
import ParticleForceRegistry from 'engine/physics/particles/ParticleForceRegistry';
import GravityForceGenerator from 'engine/physics/particles/GravityForceGenerator';
import { vec3, mat4 } from 'math';
import utils from 'src/utils';
import Mesh from 'engine/render/Mesh';

let helperVec = vec3.create();
let helperMatrix = mat4.create();

export default class ParticleScene extends BaseScene {

  initEntities () {
    super.initEntities();

    this.whiteShader = Resources.getShader('whiteShader');
    this.particleMesh = new Mesh();
    utils.generateSphere(this.particleMesh, 8, 8, 0.5);

    this.gravityGenerator = new GravityForceGenerator(0, -10, 0);
    this.particleRegistry = new ParticleForceRegistry();
    this.particles = [];
  }

  render (dt, gl) {
    super.render(dt, gl);

    this.particleRegistry.updateForces(dt);
    for (let i = 0; i < this.particles.length; i++) {
      let particle = this.particles[i];
      particle.integrate(dt);

      mat4.fromTranslation(helperMatrix, particle.position);
      this.renderer.renderMesh(this.particleMesh, this.whiteShader, helperMatrix);
    }
  }

  handleInput (dt) {
    super.handleInput(dt);
    let input = app.instance.input;

    if (input.keyDown(32)) {
      this.spawnParticle();
    }
  }

  spawnParticle () {
    vec3.scaleAndAdd(helperVec, this.camera.position, this.camera.forward, -4);

    let particle = new Particle();
    particle.setPosition(helperVec);
    this.particleRegistry.add(particle, this.gravityGenerator);
    this.particles.push(particle);
  }

}