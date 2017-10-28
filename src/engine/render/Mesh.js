import app from '../Application';
import math from 'math';
const { vec3 } = math;

const { floor } = Math;

let helperVec = vec3.create();
let normal = vec3.create();
let a = vec3.create();
let b = vec3.create();
let c = vec3.create();

export default class Mesh {

  constructor (opts) {
    this.gl = app.gl;

    this.indices = null;
    this.vertices = null;
    this.normals = null;
    this.texCoords = null;
    this.colors = null;
    this.faceCount = 0;
    this.componentCount = opts && opts.componentCount || 3;
  }

  setVertexBuffer (buffer) {
    this.vertexBuffer = buffer;
  }

  setColorBuffer (buffer) {
    this.colorBuffer = buffer;
  }

  setVertices (vertices, calculateNormals = false) {
    let gl = this.gl;
    this.vertices = new Float32Array(vertices);
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    if (!this.indices) {
      this.faceCount = floor(vertices.length / this.componentCount / 3);
    }
  }

  setIndices (indices) {
    let gl = this.gl;
    this.indices = new Uint16Array(indices);
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    this.faceCount = floor(this.indices.length / this.componentCount);
  }

  setColors (colors) {
    let gl = this.gl;
    this.colors = new Float32Array(colors);
    this.colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
  }

  calculateNormals () {
    let gl = this.gl;
    let normals = new Float32Array(this.vertices.length);
    let vertices = this.vertices;
    let indices = this.indices;
    let faceCount = this.faceCount;

    for (let i = 0; i < faceCount; i++) {
      let faceOffset = i * 3;
      let indexA = indices ? indices[faceOffset] * 3 : faceOffset * 3;
      let indexB = indices ? indices[faceOffset + 1] * 3 : faceOffset * 3 + 3;
      let indexC = indices ? indices[faceOffset + 2] * 3 : faceOffset * 3 + 6;

      vec3.set(a, vertices[indexA], vertices[indexA + 1], vertices[indexA + 2]);
      vec3.set(b, vertices[indexB], vertices[indexB + 1], vertices[indexB + 2]);
      vec3.set(c, vertices[indexC], vertices[indexC + 1], vertices[indexC + 2]);
      vec3.subtract(b, b, a);
      vec3.subtract(c, c, a);
      vec3.cross(normal, b, c);
      for (let j = 0; j < 3; j++) {
        normals[indexA + j] += normal[j];
        normals[indexB + j] += normal[j];
        normals[indexC + j] += normal[j];
      }
    }

    for (let i = 0; i < normals.length / 3; i++) {
      vec3.set(normal, normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]);
      vec3.normalize(normal, normal);
      for (let j = 0; j < 3; j++) {
        normals[i * 3 + j] = normal[j];
      }
    }

    this.normals = normals;
    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
  }

}