import app from '../Application';

const VERTEX_START = '[vertex]';
const FRAGMENT_START = '[fragment]';
const MAX_UNIFORMS = 20;
const NO_UNIFORM = -2;

const UNIFORM_LIGHT_DIR = 15;
const UNIFORM_PROJECTION_MATRIX = 0;
const UNIFORM_MODELVIEW_MATRIX = 1;
const UNIFORM_VIEW_MATRIX = 2;
const UNIFORM_NORMAL_MATRIX = 3;
const UNIFORM_TEXTURE0 = 4;
const UNIFORM_TEXTURE1 = 5;
const UNIFORM_NORMAL_MAP = 6;
const UNIFORM_JOINT_TRANSFORMS = 7;

const ATTRIBUTE_POSITION = 0;
const ATTRIBUTE_NORMAL = 1;
const ATTRIBUTE_TEXCOORD0 = 2;
const ATTRIBUTE_TEXCOORD1 = 3;
const ATTRIBUTE_COLOR = 4;
const ATTRIBUTE_TANGENT = 5;
const ATTRIBUTE_BITANGENT = 6;
const ATTRIBUTE_JOINT_WEIGHTS = 7;
const ATTRIBUTE_JOINT_INDEXES = 8;

const UNIFORM_NAMES = {
  [UNIFORM_LIGHT_DIR]: 'uLightDir',
  [UNIFORM_PROJECTION_MATRIX]: 'uPMatrix',
  [UNIFORM_MODELVIEW_MATRIX]: 'uMVMatrix',
  [UNIFORM_VIEW_MATRIX]: 'uViewMatrix',
  [UNIFORM_NORMAL_MATRIX]: 'uNormalMatrix',
  [UNIFORM_TEXTURE0]: 'uTexture0',
  [UNIFORM_TEXTURE1]: 'uTexture1',
  [UNIFORM_NORMAL_MAP]: 'uNormalMap',
  [UNIFORM_JOINT_TRANSFORMS]: 'uJointTransforms',
};

const ATTRIBUTE_NAMES = {
  [ATTRIBUTE_POSITION]: 'aPosition',
  [ATTRIBUTE_NORMAL]: 'aNormal',
  [ATTRIBUTE_TANGENT]: 'aTangent',
  [ATTRIBUTE_BITANGENT]: 'aBitangent',
  [ATTRIBUTE_TEXCOORD0]: 'aTexCoord0',
  [ATTRIBUTE_TEXCOORD1]: 'aTexCoord1',
  [ATTRIBUTE_COLOR]: 'aColor',
  [ATTRIBUTE_JOINT_WEIGHTS]: 'aJointWeights',
  [ATTRIBUTE_JOINT_INDEXES]: 'aJointIndexes',
};

export default class Shader {

  constructor () {
    let gl = this.gl = app.gl;

    this.errorStrings = {
      [gl.VERTEX_SHADER]: 'vertex',
      [gl.FRAGMENT_SHADER]: 'fragment'
    };

    this.uniformLocations = new Array(MAX_UNIFORMS);
    for (let i = 0; i < this.uniformLocations.length; i++) {
      this.uniformLocations[i] = NO_UNIFORM;
    }

    this.program = null;
    this.loaded = false;
    this.attribLocations = {};
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

  bindAttribLocations (program) {
    let gl = this.gl;
    for (let attribID in ATTRIBUTE_NAMES) {
      gl.bindAttribLocation(program, parseInt(attribID), ATTRIBUTE_NAMES[attribID]);
    }
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
    this.bindAttribLocations(this.program);
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

  getUniformLocation (id) {
    let gl = this.gl;

    let result = this.uniformLocations[id];

    if (result === NO_UNIFORM) {
      result = gl.getUniformLocation(this.program, UNIFORM_NAMES[id]);
      this.uniformLocations[id] = result;
      if (!result) {
        console.error(`Can't get shader uniform: ${UNIFORM_NAMES[id]}`);
      }
    }

    return result;
  }

  setUniform1i (name, value) {
    let gl = this.gl;

    let location = this.getUniformLocation(name);
    if (!location) {
      return;
    }

    gl.uniform1i(location, value);
  }

  setUniformMat4 (name, value) {
    let gl = this.gl;

    let location = this.getUniformLocation(name);
    if (!location) {
      return;
    }

    gl.uniformMatrix4fv(location, false, value);
  }

  setUniform3 (name, value) {
    let gl = this.gl;

    let location = this.getUniformLocation(name);
    if (!location) {
      return;
    }

    gl.uniform3fv(location, value);
  }

  setUniform4 (name, value) {
    let gl = this.gl;

    let location = this.getUniformLocation(name);
    if (!location) {
      return;
    }

    gl.uniform4fv(location, value);
  }

}

Shader.UNIFORM_LIGHT_DIR = UNIFORM_LIGHT_DIR;
Shader.UNIFORM_PROJECTION_MATRIX = UNIFORM_PROJECTION_MATRIX;
Shader.UNIFORM_MODELVIEW_MATRIX = UNIFORM_MODELVIEW_MATRIX;
Shader.UNIFORM_VIEW_MATRIX = UNIFORM_VIEW_MATRIX;
Shader.UNIFORM_NORMAL_MATRIX = UNIFORM_NORMAL_MATRIX;
Shader.UNIFORM_TEXTURE0 = UNIFORM_TEXTURE0;
Shader.UNIFORM_TEXTURE1 = UNIFORM_TEXTURE1;
Shader.UNIFORM_NORMAL_MAP = UNIFORM_NORMAL_MAP;
Shader.UNIFORM_JOINT_TRANSFORMS = UNIFORM_JOINT_TRANSFORMS;

Shader.ATTRIBUTE_POSITION = ATTRIBUTE_POSITION;
Shader.ATTRIBUTE_TEXCOORD0 = ATTRIBUTE_TEXCOORD0;
Shader.ATTRIBUTE_TEXCOORD1 = ATTRIBUTE_TEXCOORD1;
Shader.ATTRIBUTE_NORMAL = ATTRIBUTE_NORMAL;
Shader.ATTRIBUTE_TANGENT = ATTRIBUTE_TANGENT;
Shader.ATTRIBUTE_BITANGENT = ATTRIBUTE_BITANGENT;
Shader.ATTRIBUTE_JOINT_WEIGHTS = ATTRIBUTE_JOINT_WEIGHTS;
Shader.ATTRIBUTE_JOINT_INDEXES = ATTRIBUTE_JOINT_INDEXES;
Shader.ATTRIBUTE_COLOR = ATTRIBUTE_COLOR;
