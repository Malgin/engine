import app from '../Application';

const VERTEX_START = '[vertex]';
const FRAGMENT_START = '[fragment]';

export default class Shader {

  constructor () {
    let gl = this.gl = app.gl;

    this.errorStrings = {
      [gl.VERTEX_SHADER]: 'vertex',
      [gl.FRAGMENT_SHADER]: 'fragment'
    };

    this.program = null;
    this.loaded = false;
    this.attribLocations = {};
    this.uniformLocations = {};
  }

  load (dataString) {
    let lines = dataString.match(/[^\r\n]+/g); // split by line break
    let fragmentLines = [];
    let vertexLines = [];

    let currentArray = null;

    let vertexExist = false;
    let fragmentExist = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      if (line === VERTEX_START) {
        currentArray = vertexLines;
        vertexExist = true;
        continue;
      }
      if (line === FRAGMENT_START) {
        currentArray = fragmentLines;
        fragmentExist = true;
        continue;
      }

      if (currentArray) {
        currentArray.push(line);
      }
    }

    if (!fragmentExist) {
      console.error('Shader error: [fragment] definition not found');
      return;
    }

    if (!vertexExist) {
      console.error('Shader error: [vertex] definition not found');
      return;
    }

    let fragmentString = fragmentLines.join('\n');
    let vertexString = vertexLines.join('\n');

    this.compileShader(vertexString, fragmentString);
  }

  loadShader (source, type) {
    let gl = this.gl;
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      var compilationLog = gl.getShaderInfoLog(shader);
      console.error(`${this.errorStrings[type]} shader compile error: ` + compilationLog);
      shader = null;
    }

    return shader;
  }

  use () {
    let gl = this.gl;
    gl.useProgram(this.program);
  }

  compileShader (vertexSource, fragmentSource) {
    let gl = this.gl;

    let vertexCompiled = this.loadShader(vertexSource, gl.VERTEX_SHADER);
    let fragmentCompiled = this.loadShader(fragmentSource, gl.FRAGMENT_SHADER);

    if (!vertexCompiled || !fragmentCompiled) {
      return;
    }

    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexCompiled);
    gl.attachShader(this.program, fragmentCompiled);
    gl.linkProgram(this.program);
    let success = gl.getProgramParameter(this.program, gl.LINK_STATUS);
    if (success) {
      this.loaded = true;
      gl.useProgram(this.program);
    } else {
      var compilationLog = gl.getShaderInfoLog(this.program);
      console.error('Shader link error: ' + compilationLog);
    }
  }

  getAttribLocation (name) {
    let gl = this.gl;

    let result = this.attribLocations[name];

    if (!result) {
      result = gl.getAttribLocation(this.program, name);
      if (result !== -1) {
        this.attribLocations[name] = result;
      } else {
        console.error(`Can't get shader attrib: ${name}`);
      }
    }

    return result;
  }

  getUniformLocation (name) {
    let gl = this.gl;

    let result = this.uniformLocations[name];

    if (!result) {
      result = gl.getUniformLocation(this.program, name);
      if (result !== -1) {
        this.uniformLocations[name] = result;
      } else {
        console.error(`Can't get shader uniform: ${name}`);
      }
    }

    return result;
  }

  setUniformMat4 (name, value) {
    let gl = this.gl;

    let location = this.getUniformLocation(name);
    if (location === -1) {
      return;
    }

    gl.uniformMatrix4fv(location, false, value);
  }

}