import app from '../Application';
import math from 'math';
import Mesh from 'engine/render/Mesh';
const { vec3 } = math;
const { floor } = Math;

const MAX_VERTICES = 10000;
const VERTEX_COMPONENT_COUNT = 3;
const COLOR_COMPONENT_COUNT = 4;
const COMPONENT_COUNT = VERTEX_COMPONENT_COUNT + COLOR_COMPONENT_COUNT;
const DEFAULT_POINT_SIZE = 4;

export default class DebugDraw {

  constructor (opts) {
    let gl = this.gl = app.gl;
    this.renderer = app.instance.renderer;

    this.shader = opts.shader;
    this.renderOpts = { renderMode: gl.LINES };

    this.linesMesh = new Mesh({
      componentCount: 2
    });

    this.pointsMesh = new Mesh({
      componentCount: 1
    });

    this.lineCount = 0;
    this.pointCount = 0;
    this.pointVertexCount = 0;

    this.pointVertexData = new Float32Array(MAX_VERTICES * COMPONENT_COUNT);
    this.lineVertexData = new Float32Array(MAX_VERTICES * COMPONENT_COUNT);

    this.pointVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pointVbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.pointVertexData, gl.DYNAMIC_DRAW);

    this.linesVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.linesVbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.lineVertexData, gl.DYNAMIC_DRAW);

    this.linesMesh.setVBO(this.linesVbo);
    this.linesMesh.strideBytes = COMPONENT_COUNT * 4;
    this.linesMesh.colorOffsetBytes = VERTEX_COMPONENT_COUNT * 4;
    this.linesMesh.hasColors = true;
    this.linesMesh.hasVertices = true;
    this.lineVertexCount = 0;

    this.pointsMesh.setVBO(this.pointVbo);
    this.pointsMesh.strideBytes = COMPONENT_COUNT * 4;
    this.pointsMesh.colorOffsetBytes = VERTEX_COMPONENT_COUNT * 4;
    this.pointsMesh.hasColors = true;
    this.pointsMesh.hasVertices = true;

    this.pointVertexCount = 0;
  }

  addPoint (p, color, size = DEFAULT_POINT_SIZE) {
    this.addPointXYZ(p[0], p[1], p[2], color, size);
  }

  addPointXYZ (x, y, z, color, size = DEFAULT_POINT_SIZE) {
    let count = this.pointVertexCount;

    this.pointVertexData[count * COMPONENT_COUNT] = x;
    this.pointVertexData[count * COMPONENT_COUNT + 1] = y;
    this.pointVertexData[count * COMPONENT_COUNT + 2] = z;
    this.pointVertexData[count * COMPONENT_COUNT + 3] = color[0];
    this.pointVertexData[count * COMPONENT_COUNT + 4] = color[1];
    this.pointVertexData[count * COMPONENT_COUNT + 5] = color[2];
    this.pointVertexData[count * COMPONENT_COUNT + 6] = size;

    this.pointVertexCount += 1;
    this.pointCount += 1;
  }

  addLine (p1, p2, color) {
    this.addLineXYZ(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], color);
  }

  addLineXYZ(x1, y1, z1, x2, y2, z2, color) {
    let count = this.lineVertexCount;

    for (let i = 0; i < 2; i++) {
      this.lineVertexData[count * COMPONENT_COUNT] = arguments[i * VERTEX_COMPONENT_COUNT];
      this.lineVertexData[count * COMPONENT_COUNT + 1] = arguments[i * VERTEX_COMPONENT_COUNT + 1];
      this.lineVertexData[count * COMPONENT_COUNT + 2] = arguments[i * VERTEX_COMPONENT_COUNT + 2];
      this.lineVertexData[count * COMPONENT_COUNT + 3] = color[0];
      this.lineVertexData[count * COMPONENT_COUNT + 4] = color[1];
      this.lineVertexData[count * COMPONENT_COUNT + 5] = color[2];
      this.lineVertexData[count * COMPONENT_COUNT + 6] = 1;
      count++;
    }

    this.lineCount += 1;
    this.lineVertexCount = count;
  }

  clear () {
    this.pointVertexCount = 0;
    this.lineVertexCount = 0;
    this.lineCount = 0;
    this.pointCount = 0;
  }

  updateBuffer () {
    let gl = this.gl;

    if (this.pointVertexCount > 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.pointVbo);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.pointVertexData, 0, this.pointVertexCount * COMPONENT_COUNT * 4);
      this.pointsMesh.faceCount = this.pointCount;
    }

    if (this.lineVertexCount > 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.linesVbo);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.lineVertexData, 0, this.lineVertexCount * COMPONENT_COUNT * 4);
      this.linesMesh.faceCount = this.lineCount;
    }

  }

  render () {
    let gl = this.gl;
    gl.disable(gl.DEPTH_TEST);
    this.updateBuffer();

    if (this.lineCount) {
      this.renderOpts.renderMode = gl.LINES;
      this.renderer.renderMesh(this.linesMesh, this.shader, null, this.renderOpts);
    }

    if (this.pointCount) {
      this.renderOpts.renderMode = gl.POINTS;
      this.renderer.renderMesh(this.pointsMesh, this.shader, null, this.renderOpts);
    }

    this.clear();
  }
}

DebugDraw.GREEN = [0.1, 9.8, 0.1];
DebugDraw.RED = [0.8, 0.1, 0.1];
DebugDraw.BLUE = [142/255, 208/255, 255/255];
DebugDraw.ORANGE = [1, 161/255, 40/255];
DebugDraw.LIME = [224/255, 234/255, 180/255];