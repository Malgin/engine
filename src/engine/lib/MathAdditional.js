import math from './gl-matrix.js';
const { vec3, mat4, mat3, quat } = math;

let helperVec = vec3.create();
let helperQuat = quat.create();

/**
 * Adds rotation component to the quaternion (length of the axis vector is the angle)
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the quaternion operand
 * @param {vec3} v rotation vector

 * @returns {quat} out
 */
quat.rotateByVector = function (out, a, v) {
  helperQuat[0] = v[0];
  helperQuat[1] = v[1];
  helperQuat[2] = v[2];
  helperQuat[3] = 0;

  quat.multiply(out, a, helperQuat);
  return out;
}

/**
 * Adds scaled rotation component to the quaternion
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the quaternion operand
 * @param {vec3} v rotation vector
 * @param {Number} scale the amount to scale b by before adding
 * @returns {quat} out
 */
quat.addScaledRotaton = function (out, a, v, scale) {
  helperQuat[0] = v[0];
  helperQuat[1] = v[1];
  helperQuat[2] = v[2];
  helperQuat[3] = 0;

  quat.multiply(helperQuat, helperQuat, a);

  out[0] = a[0] + helperQuat[0] * 0.5;
  out[1] = a[1] + helperQuat[1] * 0.5;
  out[2] = a[2] + helperQuat[2] * 0.5;
  out[3] = a[3] + helperQuat[3] * 0.5;
}

vec3.transformMat4Direction = function (out, a, m) {
  let x = a[0], y = a[1], z = a[2];
  out[0] = x * m[0] + y * m[4] + z * m[8];
  out[1] = x * m[1] + y * m[5] + z * m[9];
  out[2] = x * m[2] + y * m[6] + z * m[10];
  return out;
}

vec3.transformInvertMat4 = function (out, a, m) {
  let x = a[0] - m[12], y = a[1] - m[13], z = a[2] - m[14];
  out[0] = x * m[0] + y * m[1] + z * m[2];
  out[1] = x * m[4] + y * m[5] + z * m[6];
  out[2] = x * m[8] + y * m[9] + z * m[10];
  return out;
}

vec3.transformInvertMat4Direction = function (out, a, m) {
  let x = a[0], y = a[1], z = a[2];
  out[0] = x * m[0] + y * m[1] + z * m[2];
  out[1] = x * m[4] + y * m[5] + z * m[6];
  out[2] = x * m[8] + y * m[9] + z * m[10];
  return out;
}

// 3 for position
mat4.getAxis = function (out, m, axis) {
  out[0] = m[axis * 4];
  out[1] = m[axis * 4 + 1];
  out[2] = m[axis * 4 + 2];
}

mat3.getAxis = function (out, m, axis) {
  out[0] = m[axis * 3];
  out[1] = m[axis * 3 + 1];
  out[2] = m[axis * 3 + 2];
}

mat4.normalizeAxes = function (out, m) {
  mat4.copy(out, m);

  vec3.set(helperVec, m[0], m[1], m[2]);
  vec3.normalize(helperVec, helperVec);
  out[0] = helperVec[0];
  out[1] = helperVec[1];
  out[2] = helperVec[2];

  vec3.set(helperVec, m[4], m[5], m[6]);
  vec3.normalize(helperVec, helperVec);
  out[4] = helperVec[0];
  out[5] = helperVec[1];
  out[6] = helperVec[2];

  vec3.set(helperVec, m[8], m[9], m[10]);
  vec3.normalize(helperVec, helperVec);
  out[8] = helperVec[0];
  out[9] = helperVec[1];
  out[10] = helperVec[2];
}