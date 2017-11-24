import engineUtils from 'engine/lib/engineUtils';
const { addArrayToArray } = engineUtils;

export default class AnimationData {

  constructor (opts) {
    this.name = opts.name;
    this.hasPosition = opts.hasPosition;
    this.hasRotation = opts.hasRotation;
    this.hasScale = opts.hasScale;
    this.duration = opts.duration;
    this.fps = opts.fps;
    this.frameCount = opts.frameCount;
    this.isMatrix = opts.isMatrix;

    if (this.hasPosition) {
      this.positions = [];
    }

    if (this.hasRotation) {
      this.rotations = [];
    }

    if (this.hasScale) {
      this.scales = [];
    }

    this.stride = this.getStride();
  }

  get bytesPerFrame () {
    return this.stride * 4;
  }

  getStride () {
    let result = 0;
    if (this.hasPosition) result += 3;
    if (this.hasRotation) result += 4;
    if (this.hasScale) result += 3;
    if (this.isMatrix) result += 16;

    return result;
  }

  getElementCount () {
    if (this.isMatrix) {
      return this.frameCount * 16;
    } else {
      let result = 0;
      if (this.hasPosition) result += this.frameCount * 3;
      if (this.hasRotation) result += this.frameCount * 4;
      if (this.hasScale) result += this.frameCount * 3;
      return result;
    }
  }

  loadFrames (frameList) {
    let stride = this.stride;

    if (this.isMatrix) {
      this.matrices = frameList;
    } else {
      let addedCount = 0;
      if (this.hasPosition) {
        this.positions.length = 0;
        addedCount += addArrayToArray(this.positions, frameList, addedCount, this.frameCount * 3);
      }
      if (this.hasRotation) {
        this.rotations.length = 0;
        addedCount += addArrayToArray(this.rotations, frameList, addedCount, this.frameCount * 4);
      }
      if (this.hasScale) {
        this.scales.length = 0;
        addedCount += addArrayToArray(this.scales, frameList, addedCount, this.frameCount * 3);
      }
    }
  }

  getMatrix(result, frame) {
    this._getArray(result, this.matrices, frame * 16, 16);
  }

  getPosition (result, frame) {
    this._getArray(result, this.positions, frame * 3, 3);
  }

  getRotation (result, frame) {
    this._getArray(result, this.rotations, frame * 4, 4);
  }

  getScale (result, frame) {
    this._getArray(result, this.scales, frame * 3, 3);
  }

  _getArray (result, array, index, count) {
    for (let i = 0; i < count; i++) {
      result[i] = array[index + i];
    }
  }


}