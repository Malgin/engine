import GameObject from 'engine/scene/GameObject';
import app from 'engine/Application';
import math from 'math';
const { vec3, mat4 } = math;
const { floor } = Math;

let helperVec = vec3.create();
let position = vec3.create();

export default class SkinObject extends GameObject {

  constructor (opts) {
    super(opts);
    this.debugDraw = app.instance.debugDraw;
    this.newVertices = [];
    this.red = [1, 0, 0];
    this.green = [0, 1, 0];
    this.blue = [0, 0, 1];
  }

  setupRenderOp () {
    let mesh = this.children[0].mesh;
    let skinData = this.animationController.skinningData;
    let boneList = skinData.boneList;
    let bindPoses = skinData.bindPoses;

    for (let i = 0; i < boneList.length; i++) {
      let bone = boneList[i].object;
      mat4.getTranslation(helperVec, bone.transform.worldTransform);
      this.debugDraw.addPoint(helperVec, this.green);
    }

    // this.debugDraw.addLine([0, 0, 0], [10, 10, 10], [1, 0, 0]);

    this.newVertices.length = mesh.vertices.length;

    for (let i = 0; i < mesh.vertices.length / 3; i++) {
      vec3.set(position, 0, 0, 0);
      for (let j = 0; j < 3; j++) {
        vec3.set(helperVec, mesh.vertices[i * 3], mesh.vertices[i * 3 + 1], mesh.vertices[i * 3 + 2]);

        let jointIndex = floor(mesh.weights[i * 6 + j * 2]);
        let jointWeight = mesh.weights[i * 6 + j * 2 + 1];
        vec3.transformMat4(helperVec, helperVec, bindPoses[jointIndex]);
        vec3.transformMat4(helperVec, helperVec, boneList[jointIndex].object.transform.worldTransform);
        vec3.scaleAndAdd(position, position, helperVec, jointWeight);
      }

      this.newVertices[i * 3] = position[0];
      this.newVertices[i * 3 + 1] = position[1];
      this.newVertices[i * 3 + 2] = position[2];
    }

    for (let i = 0; i < this.newVertices.length / 3; i++) {
      let x = this.newVertices[i * 3];
      let y = this.newVertices[i * 3 + 1];
      let z = this.newVertices[i * 3 + 2];
      this.debugDraw.addPointXYZ(x, y, z, this.red);
    }
  }

}