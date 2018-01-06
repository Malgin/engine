import Shader from './Shader';
import math from 'math';
import enginePool from '../enginePool';
import ShaderAssembler from './ShaderAssembler';

const { mat4, vec3 } = math;

let identityMatrix = mat4.create();
let modelViewMatrix = mat4.create();
let normalMatrix = mat4.create();

const UNIFORM_LIGHT_DIR = Shader.UNIFORM_LIGHT_DIR;
const UNIFORM_PROJECTION_MATRIX = Shader.UNIFORM_PROJECTION_MATRIX;
const UNIFORM_MODELVIEW_MATRIX = Shader.UNIFORM_MODELVIEW_MATRIX;
const UNIFORM_VIEW_MATRIX = Shader.UNIFORM_VIEW_MATRIX;
const UNIFORM_TEXTURE0 = Shader.UNIFORM_TEXTURE0;
const UNIFORM_TEXTURE1 = Shader.UNIFORM_TEXTURE1;
const UNIFORM_NORMAL_MAP = Shader.UNIFORM_NORMAL_MAP;
const UNIFORM_NORMAL_MATRIX = Shader.UNIFORM_NORMAL_MATRIX;
const UNIFORM_JOINT_TRANSFORMS = Shader.UNIFORM_JOINT_TRANSFORMS;

const ATTRIBUTE_POSITION = Shader.ATTRIBUTE_POSITION;
const ATTRIBUTE_NORMAL = Shader.ATTRIBUTE_NORMAL;
const ATTRIBUTE_TANGENT = Shader.ATTRIBUTE_TANGENT;
const ATTRIBUTE_BITANGENT = Shader.ATTRIBUTE_BITANGENT;
const ATTRIBUTE_TEXCOORD0 = Shader.ATTRIBUTE_TEXCOORD0;
const ATTRIBUTE_TEXCOORD1 = Shader.ATTRIBUTE_TEXCOORD1;
const ATTRIBUTE_COLOR = Shader.ATTRIBUTE_COLOR;
const ATTRIBUTE_JOINT_WEIGHTS = Shader.ATTRIBUTE_JOINT_WEIGHTS;
const ATTRIBUTE_JOINT_INDEXES = Shader.ATTRIBUTE_JOINT_INDEXES;

const MAX_JOINTS = 60;

export default class Renderer {

  constructor (opts = {}) {
    this.gl = opts.gl;
    this.shaderAssembler = new ShaderAssembler();
    this.scene = opts.scene;

    this.viewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
    this.lightDir = vec3.fromValues(-1, -1, -1);
    this.renderOps = [];
    this.jointTransforms = new Float32Array(16 * MAX_JOINTS);
  }

  render () {
    // Free render operations
    let renderOps = this.renderOps;
    for (let i = 0, len = renderOps.length; i < len; i++) {
      enginePool.releaseRenderOp(renderOps[i]);
    }
    this.renderOps.length = 0;

    // Get new render operations from the scene
    if (this.scene) {
      this.scene.setupRenderOps(this);
    }

    this.setupRenderOps();
    this.sortRenderOps();
    this.processRenderOps();
  }

  setupRenderOps () {
    let renderOps = this.renderOps;
    for (let i = 0, len = renderOps.length; i < len; i++) {
      let renderOp = renderOps[i];
      if (!renderOp.mesh) { continue; }
      // Appropriate shader for the render operation
      renderOp.shader = this.shaderAssembler.getShaderForROP(renderOp);
    }
  }

  addRenderOp () {
    let renderOp = enginePool.obtainRenderOp();
    this.renderOps.push(renderOp);
    return renderOp;
  }

  sortRenderOps () {

  }

  applyState (renderOp) {

  }

  processRenderOps () {
    let renderOps = this.renderOps;
    for (let i = 0, len = renderOps.length; i < len; i++) {
      let renderOp = renderOps[i];
      if (!renderOp.mesh) { continue; }
      this.renderMesh(renderOp.mesh, renderOp.shader, renderOp.transform, renderOp);
    }
  }

  setMatrices (view, projection) {
    mat4.copy(this.viewMatrix, view);
    mat4.copy(this.projectionMatrix, projection);
  }

  setJointTransforms (transformList) {
    let jointTransforms = this.jointTransforms;

    for (let i = 0; i < transformList.length; i++) {
      for (let j = 0; j < 16; j++) {
        jointTransforms[i * 16 + j] = transformList[i][j];
      }
    }

    return jointTransforms;
  }

  renderMesh (mesh, shader, transform, renderOpts) {
    if (!mesh.hasVertices) {
      console.error('Mesh data incomplete');
      return;
    }

    let indexCount = mesh.faceCount * mesh.componentCount;
    let stride = mesh.strideBytes;
    if (!indexCount) {
      return; // Empty mesh
    }

    let gl = this.gl;

    let material = renderOpts && renderOpts.material;
    let texture0 = material && material.texture0;
    let texture1 = material && material.texture1;
    let normalMap = material && material.normalMap;

    let renderMode = gl.TRIANGLES;
    if (renderOpts && renderOpts.renderMode !== undefined) {
      renderMode = renderOpts.renderMode;
    }

    if (!transform) {
      transform = identityMatrix;
    }

    // Getting modelview matrix
    mat4.multiply(modelViewMatrix, this.viewMatrix, transform);

    // Getting normal matrix
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // Shader uniforms
    shader.use();
    shader.setUniformMat4(UNIFORM_PROJECTION_MATRIX, this.projectionMatrix);
    shader.setUniformMat4(UNIFORM_MODELVIEW_MATRIX, modelViewMatrix);
    // TODO: add conditions for shader support of these features
    shader.setUniformMat4(UNIFORM_VIEW_MATRIX, this.viewMatrix);

    let currentTexture = 0;

    // Textures
    if (texture0) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture0);
      shader.setUniform1i(UNIFORM_TEXTURE0, 0);
      currentTexture += 1;
    }

    if (normalMap) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, normalMap);
      shader.setUniform1i(UNIFORM_NORMAL_MAP, 1);
      currentTexture += 1;
    }

    // Vertex attribs

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo);

    // Vertices
    if (mesh.hasVertices) {
      gl.enableVertexAttribArray(ATTRIBUTE_POSITION);
      gl.vertexAttribPointer(ATTRIBUTE_POSITION, 3, gl.FLOAT, false, stride, mesh.vertexOffsetBytes);
    }

    // TexCoord0
    if (mesh.hasTexCoord0) {
      gl.enableVertexAttribArray(ATTRIBUTE_TEXCOORD0);
      gl.vertexAttribPointer(ATTRIBUTE_TEXCOORD0, 2, gl.FLOAT, false, stride, mesh.texCoord0OffsetBytes);
    }

    if (mesh.hasNormals) {
      // Set normal matrix and light dir
      shader.setUniformMat4(UNIFORM_NORMAL_MATRIX, normalMatrix);
      shader.setUniform3(UNIFORM_LIGHT_DIR, this.lightDir);

      // Normals
      gl.enableVertexAttribArray(ATTRIBUTE_NORMAL);
      gl.vertexAttribPointer(ATTRIBUTE_NORMAL, 3, gl.FLOAT, false, stride, mesh.normalOffsetBytes);
    }

    // TBN
    if (mesh.hasTBN) {
      // Tangents
      gl.enableVertexAttribArray(ATTRIBUTE_TANGENT);
      gl.vertexAttribPointer(ATTRIBUTE_TANGENT, 3, gl.FLOAT, false, stride, mesh.tangentOffsetBytes);
      // Bitangents
      gl.enableVertexAttribArray(ATTRIBUTE_BITANGENT);
      gl.vertexAttribPointer(ATTRIBUTE_BITANGENT, 3, gl.FLOAT, false, stride, mesh.bitangentOffsetBytes);
    }

    // Joint transforms
    if (renderOpts.jointTransforms) {
      let jointTransforms = this.setJointTransforms(renderOpts.jointTransforms);
      shader.setUniformMat4(UNIFORM_JOINT_TRANSFORMS, jointTransforms);
    }

    // Joint weights
    if (mesh.hasWeights) {
      gl.enableVertexAttribArray(ATTRIBUTE_JOINT_WEIGHTS);
      gl.vertexAttribPointer(ATTRIBUTE_JOINT_WEIGHTS, 3, gl.FLOAT, false, stride, mesh.weightOffsetBytes);

      gl.enableVertexAttribArray(ATTRIBUTE_JOINT_INDEXES);
      gl.vertexAttribPointer(ATTRIBUTE_JOINT_INDEXES, 3, gl.FLOAT, false, stride, mesh.jointIndexOffsetBytes);
    }

    // Colors
    if (mesh.hasColors) {
      gl.enableVertexAttribArray(ATTRIBUTE_COLOR);
      gl.vertexAttribPointer(ATTRIBUTE_COLOR, 4, gl.FLOAT, false, stride, mesh.colorOffsetBytes);
    }

    // Draw
    if (mesh.hasIndices) {
      // Indices
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
      gl.drawElements(renderMode, indexCount, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.drawArrays(renderMode, 0, indexCount);
    }

  }

}

Renderer.UNIFORM_PROJECTION_MATRIX = UNIFORM_PROJECTION_MATRIX;
Renderer.UNIFORM_MODELVIEW_MATRIX = UNIFORM_MODELVIEW_MATRIX;
Renderer.ATTRIBUTE_POSITION = ATTRIBUTE_POSITION;
Renderer.ATTRIBUTE_COLOR = ATTRIBUTE_COLOR;
