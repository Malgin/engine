import GameObject from 'engine/scene/GameObject';
import app from 'engine/Application';
import math from 'math';
import Resources from 'engine/Resources';
const { vec3, vec4, mat4 } = math;
const { floor } = Math;

let helperVec = vec3.create();
let helperVec4 = vec4.create();
let helperNormalVec = vec4.create();
let normal = vec3.create();
let position = vec3.create();
let helperMat4 = mat4.create();

const JOINT_KNEE_LEFT = 14;
const JOINT_KNEE_RIGHT = 11;

export default class SkinObject extends GameObject {

  constructor (opts) {
    super(opts);
    this.debugDraw = app.instance.debugDraw;
    this.newVertices = [];
    this.tempMaterial = {};

    this.boneMatrices = [];

    this.skinShader = Resources.getShader('skinnedMeshShader');

    this.red = [1, 0, 0];
    this.green = [0, 1, 0];
    this.blue = [0, 0, 1];
  }

  updateMatrixList () {
    let skinData = this.animationController.skinningData;

    if (!skinData) {
      return;
    }

    let boneList = skinData.boneList;
    let bindPoses = skinData.bindPoses;
    this.boneMatrices.length = boneList.length;

    for (let i = 0; i < boneList.length; i++) {
      if (!this.boneMatrices[i]) {
        this.boneMatrices[i] = mat4.create();
      }

      let bone = boneList[i].object;
      mat4.getTranslation(helperVec, bone.transform.worldTransform);
      this.debugDraw.addPoint(helperVec, this.green);

      mat4.multiply(this.boneMatrices[i], boneList[i].object.transform.worldTransform, bindPoses[i]);

      // let logData = [0,0,0];

      // if (i === JOINT_KNEE_LEFT) {
      //   mat4.getScaling(logData, bindPoses[i]);
      //   console.info('BROKEN BIND', logData);
      // }
      // if (i === JOINT_KNEE_RIGHT) {
      //   mat4.getScaling(logData, bindPoses[i]);
      //   console.info('NORMAL BIND', logData);
      // }
    }
  }

  setupRenderOp (renderOp) {
    let mesh = this.mesh;
    this.updateMatrixList();

    // for (let i = 0; i < boneList.length; i++) {
    //   let bone = boneList[i].object;
    //   mat4.getTranslation(helperVec, bone.transform.worldTransform);
    //   this.debugDraw.addPoint(helperVec, this.green);
    // }

    // this.newVertices.length = mesh.vertices.length;

    for (let i = 0; i < mesh.vertices.length / 3; i++) {

      vec3.set(position, 0,0,0);
      vec3.set(normal, 0,0,0);
      mat4.set(helperMat4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ,0, 0, 0, 0, 0, 0);

      let shouldDraw = false;
      let weight = 0;

      for (let j = 0; j < 3; j++) {
        vec3.set(helperVec, mesh.vertices[i * 3], mesh.vertices[i * 3 + 1], mesh.vertices[i * 3 + 2]);
        vec4.set(helperNormalVec, mesh.normals[i * 3], mesh.normals[i * 3 + 1], mesh.normals[i * 3 + 2], 0);

        let jointIndex = floor(mesh.jointIndexes[i * 3 + j]);
        let jointWeight = mesh.weights[i * 3 + j];

        // mat4.copy(helperMat4, this.boneMatrices[jointIndex]);
        // mat4.invert(helperMat4, helperMat4);
        // mat4.transpose(helperMat4, helperMat4);

        // mat4.multiplyScalarAndAdd(helperMat4, helperMat4, this.boneMatrices[jointIndex], jointWeight);

        // if (jointIndex === JOINT_KNEE_LEFT && jointWeight > 0.1) {
        // if (i === 1037) {
          shouldDraw = true;
          weight = jointWeight;

          let logData = [0, 0, 0];
          // console.log('VERTEX', i, weight, jointIndex);
          mat4.getScaling(logData, this.boneMatrices[jointIndex]);
          // console.log('SCALE', logData);
          mat4.getTranslation(logData, this.boneMatrices[jointIndex]);
          // console.log('TRANSLATION', logData);
          // console.log('DIST', Math.round(vec3.length(logData) * 100) / 100);
        // }

        vec3.transformMat4(helperVec, helperVec, this.boneMatrices[jointIndex]);
        vec3.scaleAndAdd(position, position, helperVec, jointWeight);

        // vec4.transformMat4(helperNormalVec, helperNormalVec, helperMat4);
        // vec3.scaleAndAdd(normal, normal, helperNormalVec, jointWeight);

        // vec3.copy(normal, helperNormalVec);
        // vec3.copy(position, helperVec);
      }

      // vec3.normalize(normal, normal);
      // vec3.scale(normal, normal, 0.5);
      // vec3.add(normal, position, normal);

      // shouldDraw && this.debugDraw.addPoint(position, [weight, 0.05, 0.05]);
      // this.debugDraw.addLine(position, normal, this.red);
    }

    //   this.newVertices[i * 3] = position[0];
    //   this.newVertices[i * 3 + 1] = position[1];
    //   this.newVertices[i * 3 + 2] = position[2];
    // }

    // for (let i = 0; i < this.newVertices.length / 3; i++) {
    //   let x = this.newVertices[i * 3];
    //   let y = this.newVertices[i * 3 + 1];
    //   let z = this.newVertices[i * 3 + 2];
    //   this.debugDraw.addPointXYZ(x, y, z, this.red);
    // }

    renderOp.mesh = this.mesh;
    renderOp.material = this.material || this.tempMaterial;
    renderOp.jointTransforms = this.boneMatrices;
  }

}