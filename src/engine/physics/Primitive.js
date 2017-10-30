import ObjectPool from 'engine/lib/ObjectPool';
import math from 'math';
const { mat4, vec3 } = math;

export class CollisionPrimitive {

  constructor () {
    this.offset = mat4.create();
    this.transform = mat4.create();
    this.body = null;
    this.type = 0;
  }

  claculateInternals () {
    mat4.multiply(this.transform, this.body.transformMatrix, this.offset);
  }

  setup (body, offset) {
    this.body = body;

    if (offset) {
      mat4.copy(this.offset, offset);
    } else {
      mat4.identity(this.offset);
    }
  }

  getAxis (out, axis) {
    mat4.getAxis(out, this.transform, axis);
  }
}

export class CollisionSphere extends CollisionPrimitive {

  constructor () {
    super();
    this.radius = 0;
    this.type = CollisionPrimitive.SPHERE;
  }

  setup (radius, body, offset) {
    this.radius = radius;
    super.setup(body, offset);
  }

}

export class CollisionPlane extends CollisionPrimitive {

  constructor () {
    super();
    this.normal = vec3.create();
    this.distance = 0;
    this.type = CollisionPrimitive.PLANE;
  }

  setup (normal, distance, body, offset) {
    vec3.copy(this.normal, normal);
    this.distance = distance;
    super.setup(body, offset);
  }

}

export class CollisionBox extends CollisionPrimitive {

    constructor () {
      super();
      this.halfSize = vec3.create();
      this.type = CollisionPrimitive.BOX;
    }

    setup (size, body, offset) {
      vec3.scale(this.halfSize, size, 0.5);
      super.setup(body, offset);
    }

  }

CollisionPrimitive.SPHERE = 1;
CollisionPrimitive.BOX = 2;
CollisionPrimitive.PLANE = 3;

// export class PrimitiveInSet {
//   constructor () {
//     this.primitive = null;
//     this.transform = mat4.create();
//   }
// }

// export class PrimitiveSet extends Primitive {

//   constructor () {
//     this.primitives = []; // array of PrimitiveInSet
//   }
