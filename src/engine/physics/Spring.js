import math from 'math';
const { vec3 } = math;
const { abs } = Math;

let localBodyPosition = vec3.create();
let targetBodyPosition = vec3.create();
let force = vec3.create();

export default class Spring {

  constructor (localBodyPoint, targetBodyPoint, localBody, springConstant = 1, restLength = 1) {
    this.localBodyPoint = vec3.create();
    this.targetBodyPoint = vec3.create();
    if (localBodyPoint) {
      vec3.copy(this.localBodyPoint, localBodyPoint);
    }
    if (targetBodyPoint) {
      vec3.copy(this.targetBodyPoint, targetBodyPoint);
    }

    this.localBody = localBody;

    this.springConstant = springConstant;
    this.restLength = restLength;
  }

  updateForce (body, duration) {
    body.localPointToWorldSpace(targetBodyPosition, this.targetBodyPoint);

    if (this.localBody) {
      this.localBody.localPointToWorldSpace(localBodyPosition, this.localBodyPoint);
    } else {
      vec3.copy(localBodyPosition, this.localBodyPoint);
    }

    // Vector of the spring
    vec3.subtract(force, targetBodyPosition, localBodyPosition);

    let magnitude = vec3.length(force);
    let springDelta = abs(magnitude - this.restLength) * this.springConstant;
    vec3.scale(force, force, 1 / magnitude * (-springDelta)); // normalize force and multiply it by spring delta
    body.addForceAtLocalPoint(force, this.targetBodyPoint);
  }

}