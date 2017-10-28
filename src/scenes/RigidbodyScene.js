import app from 'engine/Application';
import BaseScene from '../BaseScene';
import Resources from 'engine/Resources';
import RigidBody from 'engine/physics/RigidBody';
import ParticleForceRegistry from 'engine/physics/particles/ParticleForceRegistry';
import GravityForceGenerator from 'engine/physics/particles/GravityForceGenerator';
import AxisBasisObject from 'src/entities/AxisBasisObject';
import ParticleContact from 'engine/physics/particles/ParticleContact';
import math from 'math';
const { mat4, vec3 } = math;
import utils from 'src/utils';
import Mesh from 'engine/render/Mesh';
import Spring from 'engine/physics/Spring';
import DebugDraw from 'engine/render/DebugDraw';

let helperVec = vec3.create();
let helperMatrix = mat4.create();

export default class RigidbodyScene extends BaseScene {

  initEntities () {
    super.initEntities();

    this.bodyAxis = new AxisBasisObject();

    this.whiteShader = Resources.getShader('whiteShader');
    this.directionalLightingShader = Resources.getShader('directionalLightingShader');
    this.sphereMesh = new Mesh();
    utils.generateSphere(this.sphereMesh, 10, 10, 0.15);

    this.boxMesh = new Mesh();
    utils.generateBox(this.boxMesh, 0.8, 0.8, 0.8);
    this.boxMesh.calculateNormals();


    this.gravityGenerator = new GravityForceGenerator(0, -10, 0);
    this.particleRegistry = new ParticleForceRegistry();
    this.bodies = [];

    this.body = this.addBody(0, 2, 3);
    this.body.acceleration[1] = -10;
    this.body.angularDamping = 0.5;
    this.body.linearDamping = 0.5;

    this.spring = new Spring([0, 3, 3], [0.0, 0.4, 0.4], null, 20, 1);
  }

  render (dt, gl) {
    super.render(dt, gl);

    this.spring.updateForce(this.body, dt);

    this.debugDraw.addLineXYZ(0, 2, 0, 2, 2, 2, DebugDraw.LIME);
    this.debugDraw.addLineXYZ(0, 3, 0, 0, 4, 0, DebugDraw.LIME);
    this.debugDraw.addLineXYZ(-2, 2, -2, -2, 4, 1, DebugDraw.RED);

    for (let i = 0; i < this.bodies.length; i++) {
      let body = this.bodies[i];

      body.integrate(dt);

      mat4.copy(this.bodyAxis.transform, body.transformMatrix);
      this.bodyAxis.render();
      this.renderer.renderMesh(this.boxMesh, this.directionalLightingShader, body.transformMatrix);
    }

    mat4.fromTranslation(helperMatrix, this.spring.localBodyPoint);
    this.renderer.renderMesh(this.sphereMesh, this.whiteShader, helperMatrix);
  }

  addBody (x, y, z) {
    let body = new RigidBody();
    body.setPosition(x, y, z);
    this.bodies.push(body);
    return body;
  }

  handleInput (dt) {
    super.handleInput(dt);
    let input = app.instance.input;

    if (input.keyDown(32)) {
      vec3.copy(helperVec, this.body.position);
      // helperVec[1] -= 0.5;
      this.body.addForceAtPoint([10, 0, 0], helperVec);
    }

    if (input.keyDown('C'.charCodeAt(0))) {
      this.body.addTorque([0, 1, 0]);
    }
  }


}