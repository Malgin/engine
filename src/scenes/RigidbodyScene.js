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

import { CollisionPrimitive, CollisionPlane } from 'engine/physics/Primitive';
import { CollisionData, CollisionDetector } from 'engine/physics/CollisionNarrow';

let p = vec3.create();
let helperVec = vec3.create();
let helperMatrix = mat4.create();

export default class RigidbodyScene extends BaseScene {

  initEntities () {
    this.isHolding = false;
    this.distance = 0;

    super.initEntities();

    this.bodyAxis = new AxisBasisObject();

    this.whiteShader = Resources.getShader('whiteShader');
    this.directionalLightingShader = Resources.getShader('directionalLightingShader');

    this.sphereMesh = new Mesh();
    utils.generateSphere(this.sphereMesh, 30, 30, 0.5);
    this.sphereMesh.calculateNormals();

    this.boxMesh = new Mesh();
    utils.generateBox(this.boxMesh, 1, 1, 1);
    this.boxMesh.calculateNormals();

    this.collisionData = new CollisionData(256);

    this.bodies = [];

    this.floorPlane = new CollisionPlane();
    this.floorPlane.setup([0, 1, 0], 0);

    this.body = this.addBody(-1, 2, 3);
    this.body.acceleration[1] = 0;
    this.body.angularDamping = 0.2;
    this.body.linearDamping = 0.2;
    // this.body.setSphere(0.5);
    this.body.setBox([0.1, 4, 2]);

    this.collisionBody = this.addBody(1, 2, 3);
    this.collisionBody.acceleration[1] = 0;
    this.collisionBody.angularDamping = 0.2;
    this.collisionBody.linearDamping = 0.2;
    this.collisionBody.setSphere(0.5);


    // this.spring = new Spring([0, 3, 3], [0.0, 0.4, 0.4], null, 20, 1);
  }

  render (dt, gl) {
    super.render(dt, gl);

    // this.spring.updateForce(this.body, dt);

    this.collisionData.clear();

    // this.debugDraw.addLineXYZ(0, 2, 0, 2, 2, 2, DebugDraw.LIME);
    // this.debugDraw.addLineXYZ(0, 3, 0, 0, 4, 0, DebugDraw.LIME);
    // this.debugDraw.addLineXYZ(-2, 2, -2, -2, 4, 1, DebugDraw.RED);

    this.integrate(dt);
    this.processCollision();

    for (let i = 0; i < this.bodies.length; i++) {
      let body = this.bodies[i];

      this.drawBody(body);
    }

    this.drawContacts();

    // mat4.fromTranslation(helperMatrix, this.spring.localBodyPoint);
    // this.renderer.renderMesh(this.sphereMesh, this.whiteShader, helperMatrix);
  }

  integrate (dt) {
    for (let i = 0; i < this.bodies.length; i++) {
      let body = this.bodies[i];

      body.integrate(dt);
    }
  }

  processCollision () {
    let bodies = this.bodies;
    let count = bodies.length;
    let collisionData = this.collisionData;

    for (let i = 0; i < count; i++) {
      let body1 = bodies[i];
      for (let j = i + 1; j < count; j++) {
        let body2 = bodies[j];
        this.collideBodies(body1.shape, body2.shape, collisionData);
      }

      this.collideBodies(body1.shape, this.floorPlane, collisionData);
    }
  }

  collideBodies (shape1, shape2, collisionData) {
    if (shape1.type > shape2.type) {
      let temp = shape1;
      shape1 = shape2;
      shape2 = temp;
    }

    let type1 = shape1.type;
    let type2 = shape2.type;

    if (type1 === CollisionPrimitive.SPHERE && type2 === CollisionPrimitive.SPHERE) {
      CollisionDetector.sphereVsSphere(shape1, shape2, collisionData);
    } else if (type1 === CollisionPrimitive.SPHERE && type2 === CollisionPrimitive.PLANE) {
      CollisionDetector.sphereVsHalfSpace(shape1, shape2, collisionData);
    } else if (type1 === CollisionPrimitive.SPHERE && type2 === CollisionPrimitive.BOX) {
      CollisionDetector.sphereVsBox(shape1, shape2, collisionData);
    } else if (type1 === CollisionPrimitive.BOX && type2 === CollisionPrimitive.PLANE) {
      CollisionDetector.boxVsHalfSpace(shape1, shape2, collisionData);
    }
  }

  addBody (x, y, z) {
    let body = new RigidBody();
    body.setPosition(x, y, z);
    this.bodies.push(body);
    return body;
  }

  //------------------------------------------------------------------------
  // Render
  //------------------------------------------------------------------------

  drawContacts () {
    let contacts = this.collisionData.contacts;
    let count = this.collisionData.contactsCount;
    for (let i = 0; i < count; i++) {
      let contact = contacts[i];
      vec3.scaleAndAdd(p, contact.contactPoint, contact.contactNormal, contact.penetration);
      this.debugDraw.addLine(contact.contactPoint, p, DebugDraw.RED);
    }
  }

  drawBody (body) {
    // mat4.copy(this.bodyAxis.transform, body.transformMatrix);
    // this.bodyAxis.render();

    if (body.shape.type === CollisionPrimitive.SPHERE) {
      this.drawSphere(body);
    } else if (body.shape.type === CollisionPrimitive.BOX) {
      this.drawBox(body);
    }
  }

  drawSphere (body) {
    vec3.set(helperVec, body.shape.radius * 2, body.shape.radius * 2, body.shape.radius * 2);
    mat4.fromScaling(helperMatrix, helperVec);
    mat4.multiply(helperMatrix, body.transformMatrix, helperMatrix);
    this.renderer.renderMesh(this.sphereMesh, this.directionalLightingShader, helperMatrix);
  }

  drawBox (body) {
    vec3.scale(helperVec, body.shape.halfSize, 2);
    mat4.fromScaling(helperMatrix, helperVec);
    mat4.multiply(helperMatrix, body.transformMatrix, helperMatrix);
    this.renderer.renderMesh(this.boxMesh, this.directionalLightingShader, helperMatrix);
  }

  handleInput (dt) {
    super.handleInput(dt);
    let input = app.instance.input;

    if (input.keyDown(32)) {
      if (!this.isHolding) {
        this.distance = vec3.distance(this.camera.position, this.body.position);
      }
      vec3.scaleAndAdd(helperVec, this.camera.position, this.camera.forward, -this.distance);
      this.body.setPosition(helperVec);
    } else {
      this.isHolding = false;
    }

    if (input.keyDown('C'.charCodeAt(0))) {
      this.body.addTorque(this.camera.forward);
    }
  }


}