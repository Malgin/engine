import Resources from 'engine/Resources';
const { floor } = Math;
import math from 'math';
const { mat4, vec3, quat } = math;

const position1 = vec3.create();
const position2 = vec3.create();
const scale1 = vec3.create();
const scale2 = vec3.create();
const rotation1 = quat.create();
const rotation2 = quat.create();

export default class AnimationController {

  constructor (gameObject) {
    this.gameObject = gameObject;
    this.animatedObjects = [];
    this.currentTime = 0;
    this.currentFrame = 0;
  }

  loadAnimations (animationPath) {
    this.animationPath = animationPath;
    this.animatedObjects.length = 0;

    this._appendAnimationObjects(this.gameObject.children);

    if (this.animatedObjects.length > 0) {
      this.frameCount = this.animatedObjects[0].animationData.frameCount;
      this.fps = this.animatedObjects[0].animationData.fps;
    }
  }

  _appendAnimationObjects (list) {
    for (let i = 0; i < list.length; i++) {
      let child = list[i];
      let anim = Resources.getAnimationData(child.name, this.animationPath);
      if (anim) {
        this.animatedObjects.push({
          object: child,
          animationData: anim
        });
      }

      this._appendAnimationObjects(child.children);
    }
  }

  tick (dt) {
    this.currentTime += dt;
    let currentFrameFloat = this.currentTime * this.fps;
    let frameProgress = currentFrameFloat - floor(currentFrameFloat);
    let currentFrame = floor(currentFrameFloat) % this.frameCount;
    let nextFrame = currentFrame + 1;
    if (nextFrame >= this.frameCount) {
      nextFrame = currentFrame;
    }

    let objects = this.animatedObjects;
    for (let i = 0, len = objects.length; i < len; i++) {
      let object = objects[i].object;
      let animationData = objects[i].animationData;

      this.setObjectTransformInterpolated(object, animationData, currentFrame, nextFrame, frameProgress);
    }
  }

  setObjectTransformInterpolated (object, animationData, frame1, frame2, progress) {
    let transform = object.transform;

    if (animationData.hasPosition) {
      animationData.getPosition(position1, frame1);
      animationData.getPosition(position2, frame2);
      vec3.lerp(transform._position, position1, position2, progress);
    }
    if (animationData.hasRotation) {
      animationData.getRotation(rotation1, frame1);
      animationData.getRotation(rotation2, frame2);
      quat.slerp(transform._rotation, rotation1, rotation2, progress);
    }
    if (animationData.hasScale) {
      animationData.getScale(scale1, frame1);
      animationData.getScale(scale2, frame2);
      vec3.lerp(transform._scale, position1, position2, progress);
    }
  }

}