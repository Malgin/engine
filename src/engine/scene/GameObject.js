import math from 'math';
import app from '../Application';

const { quat, vec3, mat4 } = math;

const identityMatrix = mat4.create();

export default class GameObject {

  constructor () {
    this.gl = app.gl;
    this.parent = null;
    this.children = [];
    this.position = vec3.create();
    this.rotation = quat.create();
    this.scale = vec3.fromValues(1, 1, 1);
    this.transform = mat4.create();
    this.worldTransform = mat4.create();
    this.mesh = null;
    this.enabled = true;
    this.material = null;
  }

  //------------------------------------------------------------------------
  // Parent / child
  //------------------------------------------------------------------------

  removeFromParent () {
    if (this.parent) {
      this.parent.removeChild(this);
    }
  }

  removeChild (child) {
    let index = this.children.indexOf(child);
    if (index >= 0) {
      child.parent = null;
      this.children[index] = this.children[this.children.length - 1];
      this.children.length -= 1;
    }
  }

  addChild (gameObject) {
    if (this.children.indexOf(gameObject) !== -1) {
      return;
    }

    gameObject.removeFromParent();

    this.children.push(gameObject);
  }

  //------------------------------------------------------------------------
  // Transformation
  //------------------------------------------------------------------------

  updateTransform (parentTransform) {
    if (this.rigidbody) {
      mat4.copy(this.transform, this.rigidbody.transformMatrix);
      mat4.copy(this.worldTransform, this.rigidbody.transformMatrix);
    } else if (parentTransform) {
      mat4.fromRotationTranslationScale(this.transform, this.rotation, this.position, this.scale);
      mat4.multiply(this.worldTransform, parentTransform, this.transform);
    } else {
      mat4.copy(this.worldTransform, this.transform);
    }

    let children = this.children;
    let length = children.length;
    let worldTransform = this.worldTransform;
    for (let i = 0; i < length; i++) {
      let child = children[i];
      child.updateTransform(worldTransform);
    }
  }

  //------------------------------------------------------------------------
  // Update
  //------------------------------------------------------------------------

  update (dt) {
    let children = this.children;
    for (let i = 0, len = children.length; i < len; i++) {
      let child = children[i];
      child.update(dt);
    }
  }

  setupRenderOp (renderOp) {
    if (!this.material || !this.mesh) {
      return;
    }

    renderOp.mesh = this.mesh;
    renderOp.material = this.material;
    renderOp.transform = this.worldTransform;
  }

}