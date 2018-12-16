import math from 'math';
const { mat3 } = math;

import MathAdditional from './lib/MathAdditional';
import Shader from './render/Shader';
import Renderer from './render/Renderer';
import Mesh from './render/Mesh';
import Input from './Input';
import DebugDraw from './render/DebugDraw';
import Scene from './scene/Scene';

export default class Application {

  constructor (data) {

    if (Application.instance) {
      throw new Error('Application already instantiated');
    }

    Application.instance = this;

    this.element = window.document.body;
    this.devicePixelRatio = window.devicePixelRatio || 1;

    window.addEventListener('resize', () => this.onResize());
    this.createCanvas(this.element);
    this.onResize();
    this.setupWebGL();

    this.input = new Input();

    if (this.gl) {
      Application.gl = this.gl;
      this.scene = new Scene();
      this.renderer = new Renderer({
        gl: this.gl,
        scene: this.scene
      });

      this.startRenderLoop();
    }
  }

  createCanvas (element) {
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('id', 'canvas');
    element.appendChild(this.canvas);
  }

  onResize () {
    let dpr = this.dpr = this.devicePixelRatio;
    let doc = window.document;
    let width = (window.innerWidth || doc.clientWidth);
    let height = (window.innerHeight || doc.clientHeight);

    // if (width !== this.width || height !== this.height) {
    //   this.width = width;
    //   this.height = height;

    //   this.canvas.width = width;
    //   this.canvas.height = height;
    // }
  }

  setupWebGL () {
    let gl = null;

    try {
      gl = this.canvas.getContext("webgl2");
    }
    catch(e) {}

    if (!gl) {
      gl = null;
      console.error('Can\'t get WebGL 2 context');
      return;
    }

    this.gl = gl;
  }

  startRenderLoop () {
    this.lastTime = 0;
    this.renderFunc = () => this.onAnimationFrame();
    window.requestAnimationFrame(this.renderFunc);
  }

  onAnimationFrame () {
    // window.requestAnimationFrame(this.renderFunc);
  }

  setupDebugDraw (shader) {
    this.debugDraw = new DebugDraw({
      shader: shader
    });

    return this.debugDraw;
  }

  render (dt, gl) {
    // override
  }

  // Public

  createShader (source) {
    let shader = new Shader(this.gl);
    shader.load(source);
    return shader;
  }

  createMesh () {
    let mesh = new Mesh(this.gl);
    return mesh;
  }

}
