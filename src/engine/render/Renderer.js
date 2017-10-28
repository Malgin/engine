import Shader from './Shader';
import math from 'math';
const { mat4, vec3 } = math;

let identityMatrix = mat4.create();
let modelViewMatrix = mat4.create();
let normalMatrix = mat4.create();

const UNIFORM_LIGHT_DIR = Shader.UNIFORM_LIGHT_DIR;
const UNIFORM_PROJECTION_MATRIX = Shader.UNIFORM_PROJECTION_MATRIX;
const UNIFORM_MODELVIEW_MATRIX = Shader.UNIFORM_MODELVIEW_MATRIX;
const UNIFORM_NORMAL_MATRIX = Shader.UNIFORM_NORMAL_MATRIX;

const ATTRIBUTE_POSITION = Shader.ATTRIBUTE_POSITION;
const ATTRIBUTE_NORMAL = Shader.ATTRIBUTE_NORMAL;
const ATTRIBUTE_COLOR = Shader.ATTRIBUTE_COLOR;

export default class Renderer {

  constructor (gl) {
    this.gl = gl;
    this.worldMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
    this.lightDir = vec3.fromValues(1, -4, -3);
  }

  prepare () {

  }

  setMatrices (world, projection) {
    mat4.copy(this.worldMatrix, world);
    mat4.copy(this.projectionMatrix, projection);
  }

  renderMesh (mesh, shader, transform, renderOpts) {
    if (!mesh.vertexBuffer) {
      console.error('Mesh data incomplete');
      return;
    }

    let indexCount = mesh.faceCount * mesh.componentCount;
    if (!indexCount) {
      return; // Empty mesh
    }

    let gl = this.gl;

    let renderMode = gl.TRIANGLES;
    if (renderOpts && renderOpts.renderMode !== undefined) {
      renderMode = renderOpts.renderMode;
    }

    if (!transform) {
      transform = identityMatrix;
    }

    // Getting modelview matrix
    mat4.multiply(modelViewMatrix, this.worldMatrix, transform);

    // Getting normal matrix
    mat4.invert(normalMatrix, transform);
    mat4.transpose(normalMatrix, normalMatrix);

    // Shader uniforms
    shader.use();
    shader.setUniformMat4(UNIFORM_PROJECTION_MATRIX, this.projectionMatrix);
    shader.setUniformMat4(UNIFORM_MODELVIEW_MATRIX, modelViewMatrix);

    // Vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
    gl.enableVertexAttribArray(ATTRIBUTE_POSITION);
    gl.vertexAttribPointer(ATTRIBUTE_POSITION, 3, gl.FLOAT, false, 0, 0);

    if (mesh.normalBuffer) {
      // Set normal matrix and light dir
      shader.setUniformMat4(UNIFORM_NORMAL_MATRIX, normalMatrix);
      shader.setUniform3(UNIFORM_LIGHT_DIR, this.lightDir);

      // Normals
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
      gl.enableVertexAttribArray(ATTRIBUTE_NORMAL);
      gl.vertexAttribPointer(ATTRIBUTE_NORMAL, 3, gl.FLOAT, false, 0, 0);
    }

    // Vertices
    if (mesh.colorBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.colorBuffer);
      gl.enableVertexAttribArray(ATTRIBUTE_COLOR);
      gl.vertexAttribPointer(ATTRIBUTE_COLOR, 4, gl.FLOAT, false, 0, 0);
    }

    // Draw
    if (mesh.indexBuffer) {
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
