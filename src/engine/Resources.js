import Shader from './render/Shader';
import app from './Application';

class Resources {

  constructor () {
    this.shaders = {};
    this.geometry = {};
    this.hierarchy = {};
  }

  addGeometry (name, data) {

  }

  addHierarchy (name, data) {

  }

  addShader (name, src) {
    let shader = new Shader();
    shader.load(src);
    this.shaders[name] = shader;

    return shader;
  }

  getShader (name) {
    return this.shaders[name];
  }

};

export default new Resources();