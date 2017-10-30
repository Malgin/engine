import math from 'math';
import Contact from './Contact';
const { mat4, vec3 } = math;
const { sqrt, abs } = Math;

let p1 = vec3.create();
let p2 = vec3.create();
let midline = vec3.create();
let relativeCenter = vec3.create();
let normal = vec3.create();
let closestPoint = vec3.create();

const BOX_MULTIPLIERS = [
  [1,1,1], [-1,1,1], [1,-1,1], [-1,-1,1],
  [1,1,-1], [-1,1,-1], [1,-1,-1], [-1,-1,-1]
];

export class CollisionData {

  constructor (maxContacts = 256) {
    this.contacts = [];
    this.maxContacts = maxContacts;

    for (let i = 0; i < maxContacts; i++) {
      this.contacts.push(new Contact());
    }

    this.clear();
  }

  clear () {
    this.contactsLeft = this.maxContacts;
    this.contactsCount = 0;
    this.friction = 0;
    this.restitution = 0;
  }

  contactAdded () {
    this.contactsLeft -= 1;
    this.contactsCount += 1;
  }

}

//------------------------------------------------------------------------
// CollisionDetector
//------------------------------------------------------------------------

export class CollisionDetector {

  static sphereVsHalfSpace (sphere, plane, collisionData) {
    if (collisionData.contactsLeft <= 0) {
      return 0;
    }

    sphere.getAxis(p1, 3);

    // Distance from plane
    let distance = vec3.dot(p1, plane.normal) - sphere.radius - plane.distance;

    if (distance >= 0) return 0;

    let contact = collisionData.contacts[collisionData.contactsCount]; // Free contact
    vec3.copy(contact.contactNormal, plane.normal);
    vec3.scaleAndAdd(contact.contactPoint, p1, plane.normal, -distance - sphere.radius);
    contact.penetration = -distance;

    contact.setBodyData(sphere.body, plane.body, collisionData.friction, collisionData.restitution);
    collisionData.contactAdded();

    return 1;
  }

  static sphereVsSphere (one, two, collisionData) {
    if (collisionData.contactsLeft <= 0) {
      return 0;
    }

    // Getting positions
    one.getAxis(p1, 3);
    two.getAxis(p2, 3);
    vec3.subtract(midline, p1, p2);
    let sqMagnitude = vec3.squaredLength(midline);
    let r1r2 = one.radius + two.radius;

    if (sqMagnitude > r1r2 * r1r2 || sqMagnitude <= 0) {
      return 0;
    }

    let magnitude = sqrt(sqMagnitude);
    let contact = collisionData.contacts[collisionData.contactsCount]; // Free contact
    vec3.scale(contact.contactNormal, midline, 1 / magnitude);
    vec3.scaleAndAdd(contact.contactPoint, p2, midline, 0.5);
    contact.penetration = r1r2 - magnitude;

    contact.setBodyData(one.body, two.body, collisionData.friction, collisionData.restitution);
    collisionData.contactAdded();

    return 1;
  }

  static boxVsHalfSpace (box, plane, collisionData) {
    let contactsUsed = 0;
    for (let i = 0; i < 8; i++) {
      if (collisionData.contactsLeft <= 0) {
        return contactsUsed;
      }

      vec3.multiply(p1, box.halfSize, BOX_MULTIPLIERS[i]);
      vec3.transformMat4(p1, p1, box.transform);

      let distance = vec3.dot(p1, plane.normal);

      if (distance <= plane.distance) {
        let contact = collisionData.contacts[collisionData.contactsCount];
        let penetration = plane.distance - distance;
        vec3.scaleAndAdd(contact.contactPoint, p1, plane.normal, -penetration * 0.5);
        vec3.copy(contact.contactNormal, plane.normal);
        contact.penetration = penetration;

        contact.setBodyData(box.body, plane.body, collisionData.friction, collisionData.restitution);
        collisionData.contactAdded();
        contactsUsed += 1;
      }
    }

    return contactsUsed;
  }

  static sphereVsBox (sphere, box, collisionData) {
    if (collisionData.contactsLeft <= 0) {
      return 0;
    }

    const halfSizeX = box.halfSize[0];
    const halfSizeY = box.halfSize[1];
    const halfSizeZ = box.halfSize[2];
    const radius = sphere.radius;

    sphere.getAxis(p1, 3);
    vec3.transformInvertMat4(relativeCenter, p1, box.transform);

    if (abs(relativeCenter[0]) - radius > halfSizeX ||
        abs(relativeCenter[1]) - radius > halfSizeY ||
        abs(relativeCenter[2]) - radius > halfSizeZ) {

      return 0;
    }

    let dist = relativeCenter[0];
    if (dist > halfSizeX) dist = halfSizeX;
    if (dist < -halfSizeX) dist = -halfSizeX;
    closestPoint[0] = dist;

    dist = relativeCenter[1];
    if (dist > halfSizeY) dist = halfSizeY;
    if (dist < -halfSizeY) dist = -halfSizeY;
    closestPoint[1] = dist;

    dist = relativeCenter[2];
    if (dist > halfSizeZ) dist = halfSizeZ;
    if (dist < -halfSizeZ) dist = -halfSizeZ;
    closestPoint[2] = dist;

    dist = vec3.squaredDistance(closestPoint, relativeCenter);
    if (dist > radius * radius) {
      return 0;
    }

    dist = sqrt(dist);
    vec3.transformMat4(p2, closestPoint, box.transform);
    let contact = collisionData.contacts[collisionData.contactsCount];
    vec3.subtract(contact.contactNormal, p2, p1);
    vec3.scale(contact.contactNormal, contact.contactNormal, 1 / dist);
    vec3.copy(contact.contactPoint, p2);
    contact.penetration = radius - dist;

    contact.setBodyData(box.body, sphere.body, collisionData.friction, collisionData.restitution);
    collisionData.contactAdded();
  }

}