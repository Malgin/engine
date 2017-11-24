import math from 'math';
const { mat4, vec3, quat } = math;

const identityMatrix = mat4.create();

export default class Transform {

  constructor (gameObject) {
    this.gameObject = gameObject;

    this._position = vec3.create();
    this._rotation = quat.create();
    this._scale = vec3.fromValues(1, 1, 1);
    this._transform = mat4.create(); // model space -> object space
    this._worldTransform = mat4.create(); // model space -> world space
  }

  get position () {
    return this._position;
  }

  set position (positon) {
    vec3.copy(this._position, position);
  }

  get rotation () {
    return this._rotation
  }

  get scale () {
    return this._scale;
  }

  get worldTransform () {
    return this._worldTransform;
  }

  setFromMat4 (matrix) {
    mat4.getScaling(this._scale, matrix);
    mat4.getRotation(this._rotation, matrix);
    mat4.getTranslation(this._position, matrix);
  }

  setIdentity () {
    this.setFromMat4(identityMatrix);
  }

  updateTransformMatrices (parentTransform) {
    if (parentTransform) {
      mat4.fromRotationTranslationScale(this._transform, this._rotation, this._position, this._scale);
      mat4.multiply(this._worldTransform, parentTransform, this._transform);
    } else {
      mat4.fromRotationTranslationScale(this._transform, this._rotation, this._position, this._scale);
      mat4.copy(this._worldTransform, this._transform);
    }
  }
}