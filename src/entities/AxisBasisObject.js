import Mesh from 'engine/render/Mesh';
import { mat4 } from 'math';
import app from 'engine/Application';
import Resources from 'engine/Resources';

let shaderMesh = null;

export default class AxisBasisObject {

  constructor () {
    this.renderer = app.instance.renderer;
    let gl = app.gl;

    this.transform = mat4.create();

    if (!shaderMesh) {
      shaderMesh = new Mesh();
      shaderMesh.setVertices([
        0, 0, 0,
        1, 0, 0,
        0, 0, 0,
        0, 1, 0,
        0, 0, 0,
        0, 0, 1
      ]);

      shaderMesh.setColors([
        1, 0, 0, 1,
        1, 0, 0, 1,
        0, 1, 0, 1,
        0, 1, 0, 1,
        0, 0, 1, 1,
        0, 0, 1, 1
      ]);

      shaderMesh.setIndices([
        0, 1, 2, 3, 4, 5
      ]);
    }

    this.mesh = shaderMesh;

    this.renderOpts = {
      renderMode: gl.LINES
    };

    this.shader = Resources.getShader('vertexColorShader');
  }

  render () {
    this.renderer.renderMesh(this.mesh, this.shader, this.transform, this.renderOpts);
  }

}