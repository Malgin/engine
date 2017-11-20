var util = require('util');
var math = require('./math');

module.exports = class ColladaAnimation {

  constructor (root, opts = {}) {
    this.root = root;
    this.libraryAnimations = this.root.library_animations;

    this.animations = {}; // Maps objectID -> animation

    if (this.libraryAnimations) {
      this.addAnimation(this.libraryAnimations[0].animation);
    }

    this.channels = {};
  }

  addAnimation (animationList) {
    if (!animationList || !animationList.length) {
      return;
    }

    for (let i = 0; i < animationList.length; i++) {
      let animationData = animationList[i];
      let animationID = animationData.$.id;
      let samplers = this.getSamplers(animationData);
      let sources = this.getSources(animationData);
      let channels = this.getChannels(animationData);

      if (channels.length > 0) {
        // console.log('channels', util.inspect(channels, false, null));
        // console.log('samplers', util.inspect(samplers, false, null));
        // console.log('sources', util.inspect(sources, false, null));

        if (channels.length > 1) {
          throw new Error('Only 1 channel per animation is supported. ' + util.inspect(channels, false, null));
        }

        let channel = channels[0];
        let sampler = samplers[channel.source];
        let transforms = sources[sampler.outputSource];
        let time = sources[sampler.inputSource];
        let duration = time.array[time.array.length - 1];
        let fps = Math.round(time.array.length / duration);

        let animation = {
          duration, fps
        };

        this.addPosRotScale(transforms.array, animation);

        let animTarget = channel.target;

        if (this.animations[animTarget]) {
          throw new Error('Animation target already exists: ' + animTarget);
        }

        this.animations[animTarget] = animation;
        // console.log('ANIM', animTarget, util.inspect(this.animations, false, null));
      }

      if (animationData.animation) {
        this.addAnimation(animationData.animation);
      }
    }
  }

  addPosRotScale (matrixArray, animation) {
    let position = [];
    let rotation = [];
    let scale = [];
    let scaleList = []

    if (matrixArray.length % 16 !== 0) {
      throw new Error('Matrix list has invalid size: ' + matrixArray.length);
    }

    let count = Math.floor(matrixArray.length / 16);

    for (let i = 0; i < count; i++) {
      let matrix = matrixArray.slice(i * 16, (i + 1) * 16 - 1);
      math.mat4transpose(matrix);
      let pos = math.getMat4Translation(matrix);
      let rot = math.getMat4Rotation(matrix);
      let s = math.getMat4Scaling(matrix);

      Array.prototype.push.apply(position, pos);
      Array.prototype.push.apply(rotation, rot);
      Array.prototype.push.apply(scale, s);
      scaleList.push(s);
    }

    let firstScale = scaleList[0];
    let hasOtherScale = false;
    for (let i = 0; i < scaleList.length; i++) {
      if (!math.compare(firstScale, scaleList[i])) {
        hasOtherScale = true;
        break;
      }
    }

    let resultList = [];
    for (let i = 0; i < count; i++) {
      math.addArrayToArray(resultList, position, i * 3, 3);
      math.addArrayToArray(resultList, rotation, i * 4, 4);
      if (hasOtherScale) {
        math.addArrayToArray(resultList, scale, i * 3, 3);
      }
    }

    animation.hasPosition = true;
    animation.hasRotation = true;
    animation.hasScale = hasOtherScale;
    animation.data = resultList;
  }

  getChannels (animation) {
    let result = [];

    if (animation.channel) {
      result = animation.channel.map(function (channel) {
        let source = channel.$.source.slice(1);
        let target = channel.$.target;
        let targetItems = target.split('/');
        if (targetItems.length !== 2) {
          throw new Error('Unsupported animation channel target' + target);
        }

        return {
          source,
          target: targetItems[0] // id of the animated object
        }
      });
    }

    return result;
  }

  getSources (animation) {
    let result = {};

    if (animation.source) {
      animation.source.reduce(function (prev, sourceData) {
        let id = sourceData.$.id;
        let source = {};
        if (sourceData.float_array) {
          let arrayString = sourceData.float_array[0]._;

          // Remove line breaks
          arrayString = arrayString.replace(/\n/g, " ");
          let array = arrayString.split(" ");

          // We need array of float
          for (let j = 0; j < array.length; j++) {
            array[j] = parseFloat(array[j]);
          }

          source.array = array;
        }

        result[id] = source;
      }, result);
    }

    return result;
  }

  getSamplers (animation) {
    let result = {};

    if (animation.sampler) {
      animation.sampler.reduce(function (prev, samplerData) {
        let id = samplerData.$.id;
        let sampler = {};

        let input = samplerData.input;
        for (let i = 0; i < input.length; i++) {
          let inputData = input[i];
          let semantic = inputData.$.semantic;
          if (semantic === 'OUTPUT') {
            sampler.outputSource = inputData.$.source.slice(1);
          }
          if (semantic === 'INPUT') {
            sampler.inputSource = inputData.$.source.slice(1);
          }
          // Skip INTERPOLATION, support LINEAR only
        }

        result[id] = sampler;
      }, result);
    }

    return result;
  }

}
