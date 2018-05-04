import math from 'math';
const { vec2 } = math;

export default class Input {

  constructor () {
    this.keyMap = {};
    this.mouseMap = {};
    this.mousePos = vec2.create();
    this.lastMousePos = vec2.create();
    this.mouseDelta = vec2.create();

    window.addEventListener('keydown', (e) => this.onKeyDown(e), true);
    window.addEventListener('keyup', (e) => this.onKeyUp(e), true);
    window.addEventListener('mousemove', (e) => this.onMouseMove(e), true);
    window.addEventListener('mousedown', (e) => this.onMouseDown(e), true);
    window.addEventListener('mouseup', (e) => this.onMouseUp(e), true);
  }

  update () {
    vec2.subtract(this.mouseDelta, this.mousePos, this.lastMousePos);
    vec2.copy(this.lastMousePos, this.mousePos);
  }

  onMouseMove (e) {
    this.mousePos[0] = e.clientX;
    this.mousePos[1] = e.clientY;
    // e.stopPropagation();
  }

  onMouseDown (e) {
    this.mouseMap[e.button] = true;
    // e.preventDefault();
    // e.stopPropagation();
  }

  onMouseUp (e) {
    this.mouseMap[e.button] = false;
    // e.stopPropagation();
  }

  onKeyDown (e) {
    this.keyMap[e.keyCode] = true;
    // e.stopPropagation();
  }

  onKeyUp (e) {
    this.keyMap[e.keyCode] = false;
    // e.stopPropagation();
  }

  keyDown (key) {
    return !!this.keyMap[key];
  }

  mouseDown (button = Input.MOUSE_LEFT) {
    return !!this.mouseMap[button];
  }

}

Input.KEY_LEFT = 37;
Input.KEY_UP = 38;
Input.KEY_RIGHT = 39;
Input.KEY_DOWN = 40;
Input.KEY_SPACE = 32;
Input.MOUSE_LEFT = 0;
Input.MOUSE_MIDDLE = 1;
Input.MOUSE_RIGHT = 2;