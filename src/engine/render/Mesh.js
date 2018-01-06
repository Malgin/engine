import app from '../Application';
import math from 'math';
const { vec3, vec2 } = math;

const { floor } = Math;

let normal = vec3.create();
let a = vec3.create();
let b = vec3.create();
let c = vec3.create();
let deltaPos1 = vec3.create();
let deltaPos2 = vec3.create();
let tangent = vec3.create();
let bitangent = vec3.create();

let uvA = vec2.create();
let uvB = vec2.create();
let uvC = vec2.create();
let deltaUV1 = vec2.create();
let deltaUV2 = vec2.create();

const JOINT_PER_VERTEX_MAX = 3;
const JOINTS_MAX = 30;

const VERTEX_SIZE = 3;
const NORMAL_SIZE = 3;
const TEXCOORD_SIZE = 2;
const JOINT_INDEX_SIZE = JOINT_PER_VERTEX_MAX;
const WEIGHT_SIZE = JOINT_PER_VERTEX_MAX;
const COLOR_SIZE = 4;

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

    this.hasWeights = false;
    this.weights = null;
    this.jointIndexOffset = 0;
    this.jointIndexOffsetBytes = 0;
    this.weightOffset = 0;
    this.weightOffsetBytes = 0;
    this.jointsPerVertex = JOINT_PER_VERTEX_MAX;

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
    if (this.hasTBN) {
      this.tangentOffset = currentOffset;
      this.tangentOffsetBytes = currentOffset * 4;
      currentOffset += NORMAL_SIZE;

      this.bitangentOffset = currentOffset;
      this.bitangentOffsetBytes = currentOffset * 4;
      currentOffset += NORMAL_SIZE;
    }
    if (this.hasTexCoord0) {
      this.texCoord0Offset = currentOffset;
      this.texCoord0OffsetBytes = currentOffset * 4;
      currentOffset += TEXCOORD_SIZE;
    }
    if (this.hasWeights) {
      this.weightOffset = currentOffset;
      this.weightOffsetBytes = currentOffset * 4;
      currentOffset += WEIGHT_SIZE;

      this.jointIndexOffset = currentOffset;
      this.jointIndexOffsetBytes = currentOffset * 4;
      currentOffset += JOINT_INDEX_SIZE;
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

      if (this.hasTBN) {
        currentOffset = offset + this.tangentOffset;
        bufferData[currentOffset] = this.tangents[i * 3];
        bufferData[currentOffset + 1] = this.tangents[i * 3 + 1];
        bufferData[currentOffset + 2] = this.tangents[i * 3 + 2];

        currentOffset = offset + this.bitangentOffset;
        bufferData[currentOffset] = this.bitangents[i * 3];
        bufferData[currentOffset + 1] = this.bitangents[i * 3 + 1];
        bufferData[currentOffset + 2] = this.bitangents[i * 3 + 2];
      }

      if (this.hasTexCoord0) {
        currentOffset = offset + this.texCoord0Offset;
        bufferData[currentOffset] = this.texCoord0[i * 2];
        bufferData[currentOffset + 1] = this.texCoord0[i * 2 + 1];
      }

      if (this.hasWeights) {
        currentOffset = offset + this.jointIndexOffset;
        for (let j = 0; j < JOINT_INDEX_SIZE; j++) {
          bufferData[currentOffset + j] = this.jointIndexes[i * JOINT_INDEX_SIZE + j];
        }

        currentOffset = offset + this.weightOffset;
        for (let j = 0; j < WEIGHT_SIZE; j++) {
          bufferData[currentOffset + j] = this.weights[i * WEIGHT_SIZE + j];
        }
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
      this.tangents = null;
      this.bitangents = null;
      this.texCoord0 = null;
      this.weights = null;
      this.jointIndexes = null;
      this.colors = null;
      this.indices = null;
    }
  }

  getStrideSize () {
    let result = 0;
    if (this.hasVertices) result += VERTEX_SIZE;
    if (this.hasNormals) result += NORMAL_SIZE;
    if (this.hasTBN) result += NORMAL_SIZE * 2;
    if (this.hasColors) result += COLOR_SIZE;
    if (this.hasTexCoord0) result += TEXCOORD_SIZE;
    if (this.hasWeights) result += JOINT_INDEX_SIZE + WEIGHT_SIZE;
    return result;
  }

  setVBO (buffer) {
    this.vbo = buffer;
  }

  setVertices (vertices) {
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

  setTexCoord0 (texcoord) {
    this.texCoord0 = texcoord;
    this.hasTexCoord0 = texcoord && texcoord.length > 0;
  }

  setNormals (normals) {
    this.normals = normals;
    this.hasNormals = normals && !!normals.length;
  }

  calculateNormals () {
    if (!this.vertices || !this.vertices.length) {
      return;
    }

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

  // Tangent space calculation
  calculateTBN () {
    if (!this .hasTexCoord0) {
      throw new Error('Can\'t calculate tangent space without TexCoord0');
    }

    let vertices = this.vertices;
    let texcoords = this.texCoord0;
    let indices = this.indices;
    let faceCount = this.faceCount;

    let tangents = new Array(this.vertices.length);
    let bitangents = new Array(this.vertices.length);

    for (let i = 0; i < this.vertices.length; i++) {
      tangents[i] = 0;
      bitangents[i] = 0;
    }

    for (let i = 0; i < faceCount; i++) {
      let faceOffset = i * 3;
      let indexA = indices ? indices[faceOffset] * 3 : faceOffset * 3;
      let indexB = indices ? indices[faceOffset + 1] * 3 : faceOffset * 3 + 3;
      let indexC = indices ? indices[faceOffset + 2] * 3 : faceOffset * 3 + 6;

      let indexUVA = indices ? indices[faceOffset] * 2 : faceOffset * 2;
      let indexUVB = indices ? indices[faceOffset + 1] * 2 : faceOffset * 2 + 2;
      let indexUVC = indices ? indices[faceOffset + 2] * 2 : faceOffset * 2 + 4;

      vec3.set(a, vertices[indexA], vertices[indexA + 1], vertices[indexA + 2]);
      vec3.set(b, vertices[indexB], vertices[indexB + 1], vertices[indexB + 2]);
      vec3.set(c, vertices[indexC], vertices[indexC + 1], vertices[indexC + 2]);

      vec2.set(uvA, texcoords[indexUVA], texcoords[indexUVA + 1]);
      vec2.set(uvB, texcoords[indexUVB], texcoords[indexUVB + 1]);
      vec2.set(uvC, texcoords[indexUVC], texcoords[indexUVC + 1]);

      vec3.subtract(deltaPos1, b, a);
      vec3.subtract(deltaPos2, c, a);

      vec2.subtract(deltaUV1, uvB, uvA);
      vec2.subtract(deltaUV2, uvC, uvA);

      let r = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV1[1] * deltaUV2[0]);
      vec3.scale(a, deltaPos1, deltaUV2[1] * r);
      vec3.scale(b, deltaPos2, deltaUV1[1] * r);
      vec3.subtract(tangent, a, b);

      vec3.scale(a, deltaPos2, deltaUV1[0] * r);
      vec3.scale(b, deltaPos1, deltaUV2[0] * r);
      vec3.subtract(bitangent, a, b);

      for (let j = 0; j < 3; j++) {
        tangents[indexA + j] += tangent[j];
        tangents[indexB + j] += tangent[j];
        tangents[indexC + j] += tangent[j];
        bitangents[indexA + j] += bitangent[j];
        bitangents[indexB + j] += bitangent[j];
        bitangents[indexC + j] += bitangent[j];
      }
    }

    for (let i = 0; i < this.vertices.length / 3; i++) {
      vec3.set(a, tangents[i * 3], tangents[i * 3 + 1], tangents[i * 3 + 2]);
      vec3.set(b, bitangents[i * 3], bitangents[i * 3 + 1], bitangents[i * 3 + 2]);
      vec3.set(c, this.normals[i * 3], this.normals[i * 3 + 1], this.normals[i * 3 + 2]);

      // Orthonormalize matrix. Since it's almost orthonormal we can just correct tangent a little.
      // t = normalize(t - n * dot(n, t));
      let dot = vec3.dot(c, a);
      vec3.scaleAndAdd(a, a, c, -dot);

      // Chesk the tangent direction
      vec3.cross(normal, c, a);
      if (vec3.dot(normal, b) >= 0) {
        vec3.scale(a, a, -1); // invert tangent
      }

      vec3.normalize(a, a);
      vec3.normalize(b, b);

      for (let j = 0; j < 3; j++) {
        tangents[i * 3 + j] = a[j];
        bitangents[i * 3 + j] = b[j];
      }
    }

    this.tangents = tangents;
    this.bitangents = bitangents;
    this.hasTBN = true;
  }

  setWeights (weights) {
    this.weights = [];
    this.jointIndexes = [];
    this.hasWeights = weights && !!weights.length;

    if (this.hasWeights) {
      for (let i = 0; i < weights.length / 2; i++) {
        this.jointIndexes[i] = weights[i * 2];
        this.weights[i] = weights[i * 2 + 1];
      }
    }
  }

}