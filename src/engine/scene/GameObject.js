import math from 'math';
import app from '../Application';
import Resources from '../Resources';
import Material from 'engine/render/Material';

const { quat, vec3, mat4 } = math;

let objectIDCounter = 1;

const identityMatrix = mat4.create();

export default class GameObject {

  constructor (opts) {
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

  //------------------------------------------------------------------------
  // Loading
  //------------------------------------------------------------------------

  loadHierarchy (hierarchy, opts) {
    if (!hierarchy) {
      throw new Error('hierarchy can\'t be null');
    }

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
      mat4.copy(this.transform, hierarchy.transform);
    } else {
      mat4.copy(this.transform, identityMatrix);
    }

    this.updatePosRotScaleFromTransform();

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

    if (hierarchy.children) {
      for (let i = 0; i < hierarchy.children.length; i++) {
        let child = new GameObject();
        child.url = this.url;
        this.addChild(child);
        child.loadHierarchy(hierarchy.children[i], opts);
      }
    }
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
      mat4.fromRotationTranslationScale(this.transform, this.rotation, this.position, this.scale);
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

  updatePosRotScaleFromTransform () {
    mat4.getScaling(this.scale, this.transform);
    mat4.getRotation(this.rotation, this.transform);
    mat4.getTranslation(this.position, this.transform);
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