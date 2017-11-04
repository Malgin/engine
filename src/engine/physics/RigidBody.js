import { CollisionSphere, CollisionBox } from './Primitive';

import math from 'math';
const { vec3, mat4, mat3, quat } = math;

let { pow } = Math;

let convertPoint = vec3.create();
let deltaPoint = vec3.create();
let helperPoint = vec3.create();
let angularAcceleration = vec3.create();

export default class RigidBody {

  constructor () {
    this.position = vec3.create();
    this.orientation = quat.create();

    this.velocity = quat.create();
    this.rotation = vec3.create(); // angular velocity

    this.acceleration = vec3.create();

    this.transformMatrix = mat4.create();
    this.lastFrameAcceleration = vec3.create();

    this.inverseMass = 1;
    this.inverseInertiaTensor = mat3.create();
    this.inverseInertiaTensorWorld = mat3.create();

    this.forceAccum = vec3.create();
    this.torqueAccum = vec3.create();

    this.angularDamping = 0.98;
    this.linearDamping = 0.98;

    this.isAwake = true;
    this.isFiniteMass = true;

    this.shape = null;
  }

  //------------------------------------------------------------------------
  // Geometry
  //------------------------------------------------------------------------

  setSphere (radius) {
    this.shape = new CollisionSphere();
    this.shape.setup(radius, this);
  }

  setBox (size) {
    this.shape = new CollisionBox();
    this.shape.setup(size, this);
  }

  //------------------------------------------------------------------------
  // Setters, body manipulation
  //------------------------------------------------------------------------

  setPosition (position) {
    if (arguments.length === 3) {
      this.position[0] = arguments[0];
      this.position[1] = arguments[1];
      this.position[2] = arguments[2];
    } else {
      vec3.copy(this.position, position);
    }
  }

  setVelocity (velocity) {
    if (arguments.length === 3) {
      this.velocity[0] = arguments[0];
      this.velocity[1] = arguments[1];
      this.velocity[2] = arguments[2];
    } else {
      vec3.copy(this.velocity, velocity);
    }
  }

  setMass (mass) {
    this.inverseMass = 1 / mass;
  }

  setInveseMass (inverseMass) {
    this.inverseMass = inverseMass;
    this.isFiniteMass = inverseMass > 0;
  }

  setInertiaTensor (inertiaTensor) {
    mat3.invert(this.inverseInertiaTensor, inertiaTensor);
  }

  addForce (force) {
    vec3.add(this.forceAccum, this.forceAccum, force);
    this.isAwake = true;
  }

  addTorque (torque) {
    vec3.add(this.torqueAccum, this.torqueAccum, torque);
    this.isAwake = true;
  }

  addForceAtLocalPoint (force, localPoint) {
    vec3.transformMat4(convertPoint, localPoint, this.transformMatrix);
    this.addForceAtPoint(force, convertPoint);
  }

  addForceAtPoint (force, worldPoint) {
    vec3.subtract(deltaPoint, worldPoint, this.position); // get vector from body origin to force application point

    vec3.add(this.forceAccum, this.forceAccum, force); // add force
    vec3.cross(helperPoint, deltaPoint, force); // Calculate torque
    vec3.add(this.torqueAccum, this.torqueAccum, helperPoint); // add torque
  }

  integrate (dt) {
    vec3.copy(this.lastFrameAcceleration, this.acceleration);
    vec3.scaleAndAdd(this.lastFrameAcceleration, this.lastFrameAcceleration, this.forceAccum, this.inverseMass);

    vec3.transformMat3(angularAcceleration, this.torqueAccum, this.inverseInertiaTensorWorld);
    vec3.scaleAndAdd(this.velocity, this.velocity, this.lastFrameAcceleration, dt);
    vec3.scaleAndAdd(this.rotation, this.rotation, angularAcceleration, dt);

    vec3.scale(this.velocity, this.velocity, pow(this.linearDamping, dt));
    vec3.scale(this.rotation, this.rotation, pow(this.angularDamping, dt));

    vec3.scaleAndAdd(this.position, this.position, this.velocity, dt);
    quat.addScaledRotaton(this.orientation, this.orientation, this.rotation, dt);

    this.calculateDerivedData();
    this.clearAccumulators();
  }

  //------------------------------------------------------------------------
  // Getters
  //------------------------------------------------------------------------

  localPointToWorldSpace (out, localPoint) {
    vec3.transformMat4(out, localPoint, this.transformMatrix);
  }

  worldPointToLocalSpace (out, worldPoint) {
    vec3.transformInvertMat4(out, worldPoint, this.transformMatrix);
  }

  //------------------------------------------------------------------------
  // Internal
  //------------------------------------------------------------------------

  clearAccumulators () {
    let fa = this.forceAccum;
    fa[0] = fa[1] = fa[2] = 0;

    let ta = this.torqueAccum;
    ta[0] = ta[1] = ta[2] = 0;
  }

  calculateDerivedData () {
    quat.normalize(this.orientation, this.orientation);
    this.calculateTransformMatrix();
    this.transformInertiaTensor();
    if (this.shape) {
      this.shape.claculateInternals();
    }
  }

  calculateTransformMatrix () {
    mat4.fromRotationTranslation(this.transformMatrix, this.orientation, this.position);
  }

  transformInertiaTensor () {
    // return;
    // TODO: try to replace this with high level functions calls (to understand the process)
    let iitBody = this.inverseInertiaTensor;
    let iitWorld = this.inverseInertiaTensorWorld;
    let rotmat = this.transformMatrix;

    let t4  = rotmat[0]*iitBody[0] + rotmat[1]*iitBody[3] + rotmat[2]*iitBody[6];
    let t9  = rotmat[0]*iitBody[1] + rotmat[1]*iitBody[4] + rotmat[2]*iitBody[7];
    let t14 = rotmat[0]*iitBody[2] + rotmat[1]*iitBody[5] + rotmat[2]*iitBody[8];
    let t28 = rotmat[4]*iitBody[0] + rotmat[5]*iitBody[3] + rotmat[6]*iitBody[6];
    let t33 = rotmat[4]*iitBody[1] + rotmat[5]*iitBody[4] + rotmat[6]*iitBody[7];
    let t38 = rotmat[4]*iitBody[2] + rotmat[5]*iitBody[5] + rotmat[6]*iitBody[8];
    let t52 = rotmat[8]*iitBody[0] + rotmat[9]*iitBody[3] + rotmat[10]*iitBody[6];
    let t57 = rotmat[8]*iitBody[1] + rotmat[9]*iitBody[4] + rotmat[10]*iitBody[7];
    let t62 = rotmat[8]*iitBody[2] + rotmat[9]*iitBody[5] + rotmat[10]*iitBody[8];

    iitWorld[0] = t4*rotmat[0]  + t9*rotmat[1]  + t14*rotmat[2];
    iitWorld[1] = t4*rotmat[4]  + t9*rotmat[5]  + t14*rotmat[6];
    iitWorld[2] = t4*rotmat[8]  + t9*rotmat[9]  + t14*rotmat[10];
    iitWorld[3] = t28*rotmat[0] + t33*rotmat[1] + t38*rotmat[2];
    iitWorld[4] = t28*rotmat[4] + t33*rotmat[5] + t38*rotmat[6];
    iitWorld[5] = t28*rotmat[8] + t33*rotmat[9] + t38*rotmat[10];
    iitWorld[6] = t52*rotmat[0] + t57*rotmat[1] + t62*rotmat[2];
    iitWorld[7] = t52*rotmat[4] + t57*rotmat[5] + t62*rotmat[6];
    iitWorld[8] = t52*rotmat[8] + t57*rotmat[9] + t62*rotmat[10];
  }

}