import app from '../Application';

const { floor } = Math;

let helperArray = [];

export default class Mesh {

  constructor (opts) {
    this.gl = app.gl;

    this.indices = null;
    this.vertices = null;
    this.texCoords = null;
    this.colors = null;
    this.faceCount = 0;
    this.componentCount = opts && opts.componentCount || 3;
  }

  setVertices (vertices) {
    let gl = this.gl;
    this.vertices = new Float32Array(vertices);
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
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

}