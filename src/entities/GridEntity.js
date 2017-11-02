import Mesh from 'engine/render/Mesh';
import math from 'math';
const { mat4 } = math;
import app from 'engine/Application';
import Resources from 'engine/Resources';

const { floor } = Math;

export default class GridEntity {

  constructor (opts) {
    this.renderer = app.instance.renderer;
    let gl = app.gl;

    this.transform = mat4.create();

    this.mesh = new Mesh({
      componentCount: 2
    });

    this.cols = floor(opts.cols) || 10;
    this.rows = floor(opts.rows) || 10;
    this.step = opts.step || 1;

    this.offsetX = (this.cols % 2) * this.step / 2;
    this.offsetY = (this.rows % 2) * this.step / 2;

    this.renderOpts = {
      renderMode: gl.LINES
    };

    this.generateMesh();

    this.shader = Resources.getShader('whiteShader');
  }

  generateMesh () {
    const width = this.cols * this.step;
    const height = this.rows * this.step;

    let vertices = [];
    let indices = [];
    let currentIndex = 0;

    function addLine(x1, z1, x2, z2) {
      vertices.push(x1, 0, z1, x2, 0, z2);
      indices.push(currentIndex, currentIndex + 1);
      currentIndex += 2;
    }

    let originX = -width / 2;
    let originY = -height / 2;

    for (let i = 0; i <= this.cols; i++) {
      let x = originX + i * this.step + this.offsetX;
      addLine(x, -height / 2 + this.offsetY, x, height / 2 + this.offsetY);
    }

    for (let i = 0; i <= this.rows; i++) {
      let y = originY + i * this.step + this.offsetY;
      addLine(-width / 2 + this.offsetX, y, width / 2 + this.offsetX, y);
    }

    this.mesh.setVertices(vertices);
    this.mesh.setIndices(indices);
    this.mesh.createBuffer();
  }

  render () {
    this.renderer.renderMesh(this.mesh, this.shader, this.transform, this.renderOpts);
  }

}