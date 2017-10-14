import { mat4 } from 'math';

let helperMatrix = mat4.create();

const UNIFORM_PROJECTION_MATRIX = 'uPMatrix';
const UNIFORM_MODELVIEW_MATRIX = 'uMVMatrix';
const ATTRIBUTE_POSITION = 'aPosition';
const ATTRIBUTE_COLOR = 'aColor';

export default class Renderer {

  constructor (gl) {
    this.gl = gl;
    this.modelViewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
  }

  setMatrices (modelView, projection) {
    mat4.copy(this.modelViewMatrix, modelView);
    mat4.copy(this.projectionMatrix, projection);
  }

  renderMesh (mesh, shader, transform, renderOpts) {
    if (!mesh.indices || !mesh.vertices) {
      console.error('Mesh data incomplete');
      return;
    }

    let gl = this.gl;

    let renderMode = gl.TRIANGLES;
    if (renderOpts && renderOpts.renderMode !== undefined) {
      renderMode = renderOpts.renderMode;
    }

    // Object position
    mat4.multiply(helperMatrix, this.modelViewMatrix, transform);

    // Shader uniforms
    shader.use();
    shader.setUniformMat4(UNIFORM_PROJECTION_MATRIX, this.projectionMatrix);
    shader.setUniformMat4(UNIFORM_MODELVIEW_MATRIX, helperMatrix);

    // Indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);

    // Vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
    let positionAttribute = shader.getAttribLocation(ATTRIBUTE_POSITION);
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);

    // Vertices
    if (mesh.colors) {
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.colorBuffer);
      let colorAttribute = shader.getAttribLocation(ATTRIBUTE_COLOR);
      gl.enableVertexAttribArray(colorAttribute);
      gl.vertexAttribPointer(colorAttribute, 4, gl.FLOAT, false, 0, 0);
    }

    // Draw
    gl.drawElements(renderMode, mesh.faceCount * mesh.componentCount, gl.UNSIGNED_SHORT, 0);
  }

}

Renderer.UNIFORM_PROJECTION_MATRIX = UNIFORM_PROJECTION_MATRIX;
Renderer.UNIFORM_MODELVIEW_MATRIX = UNIFORM_MODELVIEW_MATRIX;
Renderer.ATTRIBUTE_POSITION = ATTRIBUTE_POSITION;
Renderer.ATTRIBUTE_COLOR = ATTRIBUTE_COLOR;
