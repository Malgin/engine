import app from 'src/engine/Application';
import Resources from 'engine/Resources';
import whiteShader from 'resources/shaders/white.shader';
import vertexColorShader from 'resources/shaders/vertexColor.shader';
import AxisBasisObject from './entities/AxisBasisObject';
import GridEntity from './entities/GridEntity';
import Camera from './entities/Camera';
import Input from 'engine/Input';
import utils from 'src/utils';
import Mesh from 'engine/render/Mesh';

import { mat4, vec3 } from 'math';

export default class BaseScene {

  constructor () {
    this.renderer = app.instance.renderer;
    this.initEntities();
  }

  initEntities () {
    this.axisBasis = new AxisBasisObject();
    this.grid = new GridEntity({
      cols: 12,
      rows: 12,
      step: 1
    });

    this.camera = new Camera();
    this.cameraMoveVector = vec3.create();
  }

  reset () {
    this.camera.setPosition(0, 5, 12);
    this.camera.rotate(0, -Math.PI / 7);
    vec3.set(this.cameraMoveVector, 0, 0, 0);
  }

  render (dt, gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.handleInput(dt);

    this.camera.recalculate();
    this.renderer.setMatrices(this.camera.worldMatrix, this.camera.projectionMatrix);

    gl.depthMask(false);
    this.grid.render();
    this.axisBasis.render();
    gl.depthMask(true);
  }

  handleInput (dt) {
    const MOVE_SPEED = 10 * dt;
    const ROTATE_SPEED = Math.PI / 2 * dt;
    let rotateH = 0;
    let rotateV = 0;
    let input = app.instance.input;

    vec3.set(this.cameraMoveVector, 0, 0, 0);
    if (input.keyDown('A'.charCodeAt(0))) {
      this.cameraMoveVector[0] -= 1;
    }
    if (input.keyDown('D'.charCodeAt(0))) {
      this.cameraMoveVector[0] += 1;
    }
    if (input.keyDown('S'.charCodeAt(0))) {
      this.cameraMoveVector[2] += 1;
    }
    if (input.keyDown('W'.charCodeAt(0))) {
      this.cameraMoveVector[2] -= 1;
    }
    if (input.keyDown('Q'.charCodeAt(0))) {
      this.cameraMoveVector[1] -= 1;
    }
    if (input.keyDown('E'.charCodeAt(0))) {
      this.cameraMoveVector[1] += 1;
    }

    if (input.mouseDown()) {
      rotateH -= input.mouseDelta[0] * 0.006;
      rotateV -= input.mouseDelta[1] * 0.006;
    }

    vec3.normalize(this.cameraMoveVector, this.cameraMoveVector);
    vec3.scale(this.cameraMoveVector, this.cameraMoveVector, MOVE_SPEED);

    this.camera.move(this.cameraMoveVector[0], this.cameraMoveVector[1], this.cameraMoveVector[2]);
    this.camera.rotate(rotateH, rotateV);
  }

}