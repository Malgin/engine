import app from '../Application';
import math from 'math';
const { vec3 } = math;

const { floor } = Math;

let helperVec = vec3.create();
let normal = vec3.create();
let a = vec3.create();
let b = vec3.create();
let c = vec3.create();

const VERTEX_SIZE = 3;
const NORMAL_SIZE = 3;
const COLOR_SIZE = 4;
const TEXCOORD_SIZE = 2;

export default class Mesh {

  constructor (opts) {
    this.gl = app.gl;

    this.keepData = opts && opts.keepData;
    this.componentCount = opts && opts.componentCount || 3;
    this.bufferUsage = opts && opts.bufferUsage || this.gl.STATIC_DRAW;

    this.vbo = null;
    this.hasIndices = false;
    this.indexBuffer = null;
    this.indices = null;
    this.faceCount = 0;

    this.hasVertices = false;
    this.vertices = null;
    this.vertexOffset = 0;
    this.vertexOffsetBytes = 0;

    this.hasNormals = false;
    this.normals = null;
    this.normalOffset = 0;
    this.normalOffsetBytes = 0;

    this.hasTexCoord0 = false;
    this.texCoord0 = null;
    this.texCoord0Offset = 0;
    this.texCoord0OffsetBytes = 0;

    this.hasColors = false;
    this.colors = null;
    this.colorOffset = 0;
    this.colorOffsetBytes = 0;
  }

  deleteBuffer () {
    let gl = this.gl;
    if (this.vbo) {
      gl.deleteBuffer(this.vbo);
    }
  }

  createBuffer () {
    let gl = this.gl;
    this.deleteBuffer();

    this.stride = this.getStrideSize();
    this.strideBytes = this.stride * 4;

    let currentOffset = 0;
    if (this.hasVertices) {
      this.vertexOffset = currentOffset;
      this.vertexOffsetBytes = currentOffset * 4;
      currentOffset += VERTEX_SIZE;
      this.vertexCount = floor(this.vertices.length / 3);
    }
    if (this.hasNormals) {
      this.normalOffset = currentOffset;
      this.normalOffsetBytes = currentOffset * 4;
      currentOffset += NORMAL_SIZE;
    }
    if (this.hasTexCoord0) {
      this.texCoord0Offset = currentOffset;
      this.texCoord0OffsetBytes = currentOffset * 4;
      currentOffset += TEXCOORD_SIZE;
    }
    if (this.hasColors) {
      this.colorOffset = currentOffset;
      this.colorOffsetBytes = currentOffset * 4;
      currentOffset += COLOR_SIZE;
    }

    let bufferData = new Float32Array(floor(this.stride * this.vertexCount));

    for (let i = 0; i < this.vertexCount; i++) {
      let offset = i * this.stride;
      if (this.hasVertices) {
        currentOffset = offset + this.vertexOffset;
        bufferData[currentOffset] = this.vertices[i * 3];
        bufferData[currentOffset + 1] = this.vertices[i * 3 + 1];
        bufferData[currentOffset + 2] = this.vertices[i * 3 + 2];
      }

      if (this.hasNormals) {
        currentOffset = offset + this.normalOffset;
        bufferData[currentOffset] = this.normals[i * 3];
        bufferData[currentOffset + 1] = this.normals[i * 3 + 1];
        bufferData[currentOffset + 2] = this.normals[i * 3 + 2];
      }

      if (this.hasColors) {
        currentOffset = offset + this.colorOffset;
        bufferData[currentOffset] = this.colors[i * 4];
        bufferData[currentOffset + 1] = this.colors[i * 4 + 1];
        bufferData[currentOffset + 2] = this.colors[i * 4 + 2];
        bufferData[currentOffset + 3] = this.colors[i * 4 + 3];
      }
    }

    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, bufferData, this.bufferUsage);

    if (this.hasIndices) {
      let indices = new Uint16Array(this.indices);
      this.indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, this.bufferUsage);
    }

    // Free data arrays
    if (!this.keepData) {
      this.vertices = null;
      this.normals = null;
      this.texCoord0 = null;
      this.colors = null;
      this.indices = null;
    }
  }

  getStrideSize () {
    let result = 0;
    if (this.hasVertices) result += VERTEX_SIZE;
    if (this.hasNormals) result += NORMAL_SIZE;
    if (this.hasColors) result += COLOR_SIZE;
    if (this.hasTexCoord0) result += TEXCOORD_SIZE;
    return result;
  }

  setVBO (buffer) {
    this.vbo = buffer;
  }

  setVertices (vertices) {
    let gl = this.gl;
    this.vertices = vertices;
    this.hasVertices = vertices && !!vertices.length;

    if (!this.hasIndices) {
      this.faceCount = floor(vertices.length / this.componentCount / 3);
    }
  }

  setIndices (indices) {
    this.indices = indices;
    this.hasIndices = indices && !!indices.length;

    if (this.hasIndices) {
      this.faceCount = floor(this.indices.length / this.componentCount);
    }
  }

  setColors (colors) {
    this.colors = colors;
    this.hasColors = colors && !!colors.length;
  }

  calculateNormals () {
    let gl = this.gl;
    let normals = new Array(this.vertices.length);
    for (let i = 0; i < normals.length; i++) {
      normals[i] = 0;
    }

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
    this.hasNormals = true;
  }

}