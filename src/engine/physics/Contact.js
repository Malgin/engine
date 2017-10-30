import math from 'math';
const { vec3 } = math;

export default class Contact {

  constructor () {
    this.contactPoint = vec3.create();
    this.contactNormal = vec3.create();
    this.penetration = 0;
    this.friction = 0;
    this.restitution = 0;
    this.body1 = null;
    this.body2 = null;
  }

  setBodyData (body1, body2, friction, restitution) {
    this.body1 = body1;
    this.body2 = body2;
    this.friction = friction;
    this.restitution = restitution;
  }

}