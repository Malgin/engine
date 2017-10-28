import app from 'src/engine/Application';
import math from 'math';
const { mat4, vec3 } = math;

const UP_DIRECTION = vec3.fromValues(0, 1, 0);
const RIGHT_DIRECTION = vec3.fromValues(1, 0, 0);

export default class Camera {

  constructor () {
    this.projectionMatrix = mat4.create();
    this.matrix = mat4.create();
    this.normalMatrix = mat4.create();
    this.outMatrix = mat4.create();

    this.position = vec3.create();

    this.xAngle = 0;
    this.yAngle = 0;

    this.forward = vec3.fromValues(0, 0, -1);
    this.left = vec3.fromValues(-1, 0, 0);
    this.up = vec3.fromValues(0, 1, 0);
  }

  setPosition (x, y, z) {
    vec3.set(this.position, x, y, z);
  }

  move (side, up, forward) {
    vec3.scaleAndAdd(this.position, this.position, this.left, side);
    vec3.scaleAndAdd(this.position, this.position, this.up, up);
    vec3.scaleAndAdd(this.position, this.position, this.forward, forward);
  }

  rotate (horizontal, vertical) {
    this.yAngle += horizontal;
    this.xAngle += vertical;
  }

  recalculate () {
    mat4.perspective(this.projectionMatrix, Math.PI / 2, app.instance.width / app.instance.height, 0.1, 1000);

    let m = this.matrix;

    mat4.identity(m);
    mat4.translate(m, m, this.position);
    mat4.rotate(m, m, this.yAngle, UP_DIRECTION);
    mat4.rotate(m, m, this.xAngle, RIGHT_DIRECTION);

    vec3.set(this.left, m[0], m[1], m[2]);
    vec3.set(this.up, m[4], m[5], m[6]);
    vec3.set(this.forward, m[8], m[9], m[10]);

    mat4.invert(this.outMatrix, m);
  }

  get worldMatrix () {
    return this.outMatrix;
  }

}