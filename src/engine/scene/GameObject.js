import math from 'math';
import app from '../Application';
import Resources from '../Resources';
import Material from 'engine/render/Material';
import Transform from './Transform';
import AnimationController from '../animation/AnimationController';

const { quat, vec3, mat4 } = math;

let objectIDCounter = 1;

const identityMatrix = mat4.create();

export default class GameObject {

  constructor (opts) {
    this.gl = app.gl;
    this.parent = null;
    this.children = [];
    this.transform = new Transform(this);

    this.mesh = null;
    this.enabled = true;
    this.material = null;
    this.shouldRender = false;
    this.name = opts && opts.name || 'Object' + objectIDCounter++;
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

  loopHierarchy (iteratorFunction, depth = 0, skipSelf = true) {
    if (!skipSelf) {
      iteratorFunction(this);
    }

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].loopHierarchy(iteratorFunction, depth + 1, false);
    }
  }

  //------------------------------------------------------------------------
  // Loading
  //------------------------------------------------------------------------

  loadHierarchy (hierarchy, opts, depth = 0) {
    if (!hierarchy) {
      throw new Error('hierarchy can\'t be null');
    }

    let skipAnimation = opts && opts.skipAnimation;
    let material = opts && opts.material;
    if (!material && hierarchy.material) {
      material = new Material();
      material.setFromHierarchy(hierarchy.material);
    }

    let skipOwnerGeometry = opts && opts.skipOwnerGeometry;

    if (hierarchy.url) {
      this.url = hierarchy.url;
    }

    let geomURLs = null;
    if (opts && opts.geometryURLs) {
      geomURLs = opts.geometryURLs;
    }

    if (hierarchy.name) {
      this.name = hierarchy.name;
    }

    if (hierarchy.transform) {
      this.transform.setFromMat4(hierarchy.transform);
    } else {
      this.transform.setIdentity();
    }

    if (hierarchy.geometry) {
      let mesh = null;

      if (!skipOwnerGeometry) {
        mesh = Resources.getMesh(hierarchy.geometry, this.url);
      }

      if (!mesh && geomURLs) {
        for (let i = 0; i < geomURLs.length; i++) {
          mesh = Resources.getMesh(hierarchy.geometry, geomURLs[i]);
        }
      }

      if (!mesh) {
        throw new Error('Mesh not found:', hierarchy.geometry, this.url);
      }

      this.mesh = mesh;
      this.material = material;
    }

    let isSkinnedMesh = !!Resources.skinningUrls[this.url];
    let hasAnimation = depth === 0 && !skipAnimation && Resources.animationUrls[this.url];

    if (hierarchy.children) {
      for (let i = 0; i < hierarchy.children.length; i++) {
        let child = this.createChildObject(hasAnimation, isSkinnedMesh, depth);
        child.url = this.url;
        this.addChild(child);
        child.loadHierarchy(hierarchy.children[i], opts, depth + 1);
      }
    }

    if (hasAnimation) {
      this.animationController = new AnimationController(this, { isSkinnedMesh });
      this.animationController.loadAnimations(this.url);
    }
  }

  createChildObject (hasAnimation, isSkinnedMesh, depth) {
    if (isSkinnedMesh) {
      let SkinObject = require('engine/animation/SkinObject').default;
      return new SkinObject();
    } else {
      return new GameObject();
    }
  }

  //------------------------------------------------------------------------
  // Transformation
  //------------------------------------------------------------------------

  updateTransform (parentTransform) {
    if (this.rigidbody) {
      // TODO: implement using Transaform class
      // mat4.copy(this.transform, this.rigidbody.transformMatrix);
      // mat4.copy(this.worldTransform, this.rigidbody.transformMatrix);
    } else {
      this.transform.updateTransformMatrices(parentTransform);
    }

    let children = this.children;
    let length = children.length;
    let worldTransform = this.transform._worldTransform;
    for (let i = 0; i < length; i++) {
      let child = children[i];
      child.updateTransform(worldTransform);
    }
  }

  //------------------------------------------------------------------------
  // Update
  //------------------------------------------------------------------------

  update (dt) {
    if (this.animationController) {
      this.animationController.tick(dt);
    }

    if (this.tick) {
      this.tick(dt);
    }

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
    renderOp.transform = this.transform._worldTransform;
  }

}