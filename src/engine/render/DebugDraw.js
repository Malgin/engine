import app from '../Application';
import math from 'math';
import Mesh from 'engine/render/Mesh';
const { vec3 } = math;
const { floor } = Math;

const MAX_VERTICES = 1000;
const VERTEX_COMPONENT_COUNT = 3;
const COLOR_COMPONENT_COUNT = 4;
const COMPONENT_COUNT = VERTEX_COMPONENT_COUNT;

export default class DebugDraw {

  constructor (opts) {
    let gl = this.gl = app.gl;
    this.renderer = app.instance.renderer;

    this.shader = opts.shader;
    this.renderOpts = { renderMode: gl.LINES };

    this.linesMesh = new Mesh({
      componentCount: 2
    });

    this.vertexCount = 0;

    this.vertexData = new Float32Array(MAX_VERTICES * VERTEX_COMPONENT_COUNT);
    this.colorData = new Float32Array(MAX_VERTICES * COLOR_COMPONENT_COUNT);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.DYNAMIC_DRAW);

    this.colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.colorData, gl.DYNAMIC_DRAW);

    this.linesMesh.setVertexBuffer(this.vertexBuffer);
    this.linesMesh.setColorBuffer(this.colorBuffer);

    this.vertexCount = 0;
  }

  addLine (p1, p2, color) {
    this.addLineXYZ(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], color);
  }

  addLineXYZ(x1, y1, z1, x2, y2, z2, color) {
    let count = this.vertexCount;

    for (let i = 0; i < 2; i++) {
      this.vertexData[count * COMPONENT_COUNT] = arguments[i * VERTEX_COMPONENT_COUNT];
      this.vertexData[count * COMPONENT_COUNT + 1] = arguments[i * VERTEX_COMPONENT_COUNT + 1];
      this.vertexData[count * COMPONENT_COUNT + 2] = arguments[i * VERTEX_COMPONENT_COUNT + 2];
      this.colorData[count * COLOR_COMPONENT_COUNT] = color[0];
      this.colorData[count * COLOR_COMPONENT_COUNT + 1] = color[1];
      this.colorData[count * COLOR_COMPONENT_COUNT + 2] = color[2];
      this.colorData[count * COLOR_COMPONENT_COUNT + 3] = 1;
      count++;
    }

    this.vertexCount = count;
  }

  clear () {
    this.vertexCount = 0;
  }

  updateBuffer () {
    let gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexData, 0, this.vertexCount * VERTEX_COMPONENT_COUNT * 4);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.colorData, 0, this.vertexCount * COLOR_COMPONENT_COUNT * 4);

    this.linesMesh.faceCount = floor(this.vertexCount / 2);
  }

  render () {
    if (this.vertexCount === 0) {
      return;
    }

    let gl = this.gl;
    gl.disable(gl.DEPTH_TEST);
    this.updateBuffer();
    this.linesMesh.faceCount = floor(this.vertexCount / 2);
    this.renderer.renderMesh(this.linesMesh, this.shader, null, this.renderOpts);
    this.clear();
  }

}

DebugDraw.GREEN = [0.1, 9.8, 0.1];
DebugDraw.RED = [0.8, 0.1, 0.1];
DebugDraw.BLUE = [142/255, 208/255, 255/255];
DebugDraw.ORANGE = [1, 161/255, 40/255];
DebugDraw.LIME = [224/255, 234/255, 139/255];