import Resources from 'engine/Resources';
const { floor } = Math;
import math from 'math';
import SkinningData from './SkinningData';
import GameObject from '../scene/GameObject';

const { mat4, vec3, quat } = math;

const position1 = vec3.create();
const position2 = vec3.create();
const scale1 = vec3.create();
const scale2 = vec3.create();
const rotation1 = quat.create();
const rotation2 = quat.create();

export default class AnimationController {

  constructor (gameObject, opts) {
    this.gameObject = gameObject;
    this.isSkinnedMesh = opts.isSkinnedMesh;
    this.rootJoint = null;
    this.animatedObjects = [];
    this.animations = {};
    this.currentTime = 0;
    this.currentFrame = 0;
    this.isPlaying = false;
    this.frameStart = 0;
    this.frameStart = 0;
    this.animFrameCount = 0;

    this.gameObject.loopHierarchy((child) => {
      child.animationController = this;
    });
  }

  loadAnimations (animationPath) {
    this.animationPath = animationPath;
    this.animatedObjects.length = 0;

    this._appendAnimationObjects(this.gameObject.children);

    if (this.animatedObjects.length > 0) {
      this.frameCount = this.animatedObjects[0].animationData.frameCount;
      this.fps = this.animatedObjects[0].animationData.fps;
      this.animEnd = this.frameCount - 1;

      this.addAnimation('_default', 0, this.animEnd);
    }
  }

  addAnimation (name, frameStart, frameEnd) {
    this.animations[name] = {
      frameStart, frameEnd
    }
  }

  _appendSkinning (object, skinData) {
    let boneMap = {};
    this.rootJoint = this._createBones(this.gameObject, skinData.joints, boneMap);
    this.skinningData = new SkinningData(boneMap, skinData);
  }

  _createBones (parent, bone, boneMap) {
    let boneObject = new GameObject({ name: bone.name });
    boneObject.transform.setFromMat4(bone.transform);
    boneMap[bone.name] = {
      object: boneObject
    };

    parent.addChild(boneObject);
    let childCount = bone.children && bone.children.length;
    for (let i = 0; i < childCount; i++) {
      this._createBones(boneObject, bone.children[i], boneMap);
    }

    return boneObject;
  }

  _appendAnimationObjects (list) {
    for (let i = 0; i < list.length; i++) {
      let child = list[i];

      // If child has the skinning data - create bones as child objects
      let skinning = Resources.getSkinnedMeshData(child.name, this.animationPath);
      if (skinning) {
        this._appendSkinning(child, skinning);
      }

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

  play (animationName = '_default') {
    this.isPlaying = true;
    let animation = this.animations[animationName];
    this.frameStart = animation.frameStart;
    this.frameEnd = animation.frameEnd;
    this.animFrameCount = this.frameEnd - this.frameStart + 1;
  }

  tick (dt) {
    if (!this.isPlaying) {
      return;
    }

    this.currentTime += dt;
    let currentFrameFloat = this.currentTime * this.fps;
    let frameProgress = currentFrameFloat - floor(currentFrameFloat);
    let currentFrame = floor(currentFrameFloat) % (this.animFrameCount);
    let nextFrame = currentFrame + 1;

    if (nextFrame >= this.animFrameCount) {
      nextFrame = this.frameStart;
      currentFrame = this.frameStart;
    } else {
      nextFrame += this.frameStart;
      currentFrame += this.frameStart;
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
    let name = object.name;

    if (animationData.hasPosition) {
      animationData.getPosition(position1, frame1);
      animationData.getPosition(position2, frame2);
      vec3.lerp(transform._position, position1, position2, progress);
    }
    if (animationData.hasRotation) {
      animationData.getRotation(rotation1, frame1);
      animationData.getRotation(rotation2, frame2);

      quat.slerp(transform._rotation, rotation1, rotation2, progress);
      quat.normalize(transform._rotation, transform._rotation);
    }
    if (animationData.hasScale) {
      animationData.getScale(scale1, frame1);
      animationData.getScale(scale2, frame2);
      vec3.lerp(transform._scale, scale1, scale2, progress);
    }
  }

}