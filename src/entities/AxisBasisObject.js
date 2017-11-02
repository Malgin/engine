import Mesh from 'engine/render/Mesh';
import math from 'math';
const { mat4 } = math;

import app from 'engine/Application';
import Resources from 'engine/Resources';

let sharedMesh = null;

export default class AxisBasisObject {

  constructor () {
    this.renderer = app.instance.renderer;
    let gl = app.gl;

    this.transform = mat4.create();

    if (!sharedMesh) {
      sharedMesh = new Mesh();
      sharedMesh.setVertices([
        0, 0, 0,
        1, 0, 0,
        0, 0, 0,
        0, 1, 0,
        0, 0, 0,
        0, 0, 1
      ]);

      sharedMesh.setColors([
        1, 0, 0, 1,
        1, 0, 0, 1,
        0, 1, 0, 1,
        0, 1, 0, 1,
        0, 0, 1, 1,
        0, 0, 1, 1
      ]);

      sharedMesh.setIndices([
        0, 1, 2, 3, 4, 5
      ]);

      sharedMesh.createBuffer();
    }

    this.mesh = sharedMesh;

    this.renderOpts = {
      renderMode: gl.LINES
    };

    this.shader = Resources.getShader('vertexColorShader');
  }

  render () {
    this.renderer.renderMesh(this.mesh, this.shader, this.transform, this.renderOpts);
  }

}