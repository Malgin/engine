import math from 'math';
import Contact from './Contact';
const { mat4, vec3 } = math;
const { sqrt, abs } = Math;

let p1 = vec3.create();
let p2 = vec3.create();
let helperVec = vec3.create();
let midline = vec3.create();
let relativeCenter = vec3.create();
let normal = vec3.create();
let closestPoint = vec3.create();
let tryAxisData = { smallestPenetration: 0, smallestIndex: 0 };
let toSt = vec3.create();
let cOne = vec3.create();
let cTwo = vec3.create();
let boxAxis = vec3.create();
let boxAxis2 = vec3.create();
let toCentre = vec3.create();

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

  static boxVsBox (one, two, collisionData) {

    function transformToAxis (box, axis) {
      let result =  0;

      box.getAxis(helperVec, 0);
      result += box.halfSize[0] * abs(vec3.dot(axis, helperVec));
      box.getAxis(helperVec, 1);
      result += box.halfSize[1] * abs(vec3.dot(axis, helperVec));
      box.getAxis(helperVec, 2);
      result += box.halfSize[2] * abs(vec3.dot(axis, helperVec));

      return result;
    }

    function overlapOnAxis (boxOne, boxTwo, axis,toCentre) {
      // Project the half-size of one onto axis
      let oneProject = transformToAxis(one, axis);
      let twoProject = transformToAxis(two, axis);

      // Project this onto the axis
      let distance = abs(vec3.dot(toCentre, axis));

      // Check for overlap
      return (distance < oneProject + twoProject);
    }

  /*
    * This function checks if the two boxes overlap
    * along the given axis, returning the ammount of overlap.
    * The final parameter toCentre
    * is used to pass in the vector between the boxes centre
    * points, to avoid having to recalculate it each time.
    */
    function penetrationOnAxis(one, two, axis, toCentre) {
      // Project the half-size of one onto axis
      let oneProject = transformToAxis(one, axis);
      let twoProject = transformToAxis(two, axis);

      // Project this onto the axis
      let distance = abs(vec3.dot(toCentre, axis));

      // Return the overlap (i.e. positive indicates
      // overlap, negative indicates separation).
      return oneProject + twoProject - distance;
    }

    function tryAxis (one, two, axis, toCentre, index, outData) {
      // Make sure we have a normalized axis, and don't check almost parallel axes
      if (vec3.squaredLength(axis) < 0.0001) return true;
      vec3.normalize(axis, axis);

      let penetration = penetrationOnAxis(one, two, axis, toCentre);

      if (penetration < 0) return false;
      if (penetration < outData.penetration) {
          outData.penetration = penetration;
          outData.best = index;
      }
      return true;
    }

    function fillPointFaceBoxBox(one, two, toCentre, collisionData, best, penetration) {
      // This method is called when we know that a vertex from
      // box two is in contact with box one.

      let contact = collisionData.contacts[collisionData.contactsCount];

      // We know which axis the collision is on (i.e. best),
      // but we need to work out which of the two faces on
      // this axis.
      one.getAxis(normal, best);
      if (vec3.dot(normal, toCentre) > 0) {
          vec3.scale(normal, normal, -1);
      }

      // Work out which vertex of box two we're colliding with.
      // Using toCentre doesn't work!
      vec3.copy(helperVec, two.halfSize);
      two.getAxis(p1, 0);
      if (vec3.dot(p1, normal) < 0) helperVec.x = -helperVec.x;
      two.getAxis(p1, 1);
      if (vec3.dot(p1, normal) < 0) helperVec.y = -helperVec.y;
      two.getAxis(p1, 2);
      if (vec3.dot(p1, normal) < 0) helperVec.z = -helperVec.z;

      // Create the contact data
      vec3.copy(contact.contactNormal, normal);
      contact.penetration = penetration;
      vec3.transformMat4(contact.contactPoint, helperVec, two.transform);
      contact.setBodyData(one.body, two.body, collisionData.friction, collisionData.restitution);
      collisionData.contactAdded();
    }

    // If useOnce is true, and the contact point is outside
    // the edge (in the case of an edge-face contact) then
    // we use one's midpoint, otherwise we use two's.

    function contactPoint(pOne, dOne, oneSize, pTwo, dTwo, twoSize, useOne, result) {
      let smOne = vec3.squaredLength(dOne);
      let smTwo = vec3.squaredLength(dTwo);
      let dpOneTwo = vec3.dot(dTwo, dOne);

      vec3.subtract(toSt, pOne, pTwo);
      let dpStaOne = vec3.dot(dOne, toSt);
      let dpStaTwo = vec3.dot(dTwo, toSt);

      let denom = smOne * smTwo - dpOneTwo * dpOneTwo;

      // Zero denominator indicates parrallel lines
      if (abs(denom) < 0.0001) {
          return useOne ? vec3.copy(result, pOne) : vec3.copy(result, pTwo);
      }

      let mua = (dpOneTwo * dpStaTwo - smTwo * dpStaOne) / denom;
      let mub = (smOne * dpStaTwo - dpOneTwo * dpStaOne) / denom;

      // If either of the edges has the nearest point out
      // of bounds, then the edges aren't crossed, we have
      // an edge-face contact. Our point is on the edge, which
      // we know from the useOne parameter.
      if (mua > oneSize ||
          mua < -oneSize ||
          mub > twoSize ||
          mub < -twoSize) {
        return useOne ? vec3.copy(result, pOne) : vec3.copy(result, pTwo);
      } else {
        vec3.scaleAndAdd(cOne, pOne, dOne, mua * 0.5);
        vec3.scaleAndAdd(pTwo, dTwo, dOne, mub * 0.5);
        return vec3.add(result, cOne, cTwo);
      }
    }

    function CHECK_OVERLAP(axis, index) {
      if (!tryAxis(one, two, axis, toCentre, index, tryAxisData)) return true;
      else return false;
    }

    //if (!IntersectionTests::boxAndBox(one, two)) return 0;

    // Find the vector between the two centres
    one.getAxis(p1, 3);
    two.getAxis(p2, 3);
    vec3.subtract(toCentre, p2, p1);

    // We start assuming there is no contact
    tryAxisData.penetration = Infinity;
    tryAxisData.best = 0xffffff;

    // Now we check each axes, returning if it gives us
    // a separating axis, and keeping track of the axis with
    // the smallest penetration otherwise.

    one.getAxis(boxAxis, 0);
    if (CHECK_OVERLAP(boxAxis, 0)) { return 0; };
    one.getAxis(boxAxis, 1);
    if (CHECK_OVERLAP(boxAxis, 1)) { return 0; };
    one.getAxis(boxAxis, 2);
    if (CHECK_OVERLAP(boxAxis, 2)) { return 0; };

    two.getAxis(boxAxis, 0);
    if (CHECK_OVERLAP(boxAxis, 3)) { return 0; };
    two.getAxis(boxAxis, 1);
    if (CHECK_OVERLAP(boxAxis, 4)) { return 0; };
    two.getAxis(boxAxis, 2);
    if (CHECK_OVERLAP(boxAxis, 5)) { return 0; };

    // Store the best axis-major, in case we run into almost
    // parallel edge collisions later
    let bestSingleAxis = tryAxisData.best;

    one.getAxis(boxAxis, 0);

    two.getAxis(boxAxis2, 0);
    vec3.cross(normal, boxAxis, boxAxis2);
    if (CHECK_OVERLAP(normal, 6)) { return 0; };
    two.getAxis(boxAxis2, 1);
    vec3.cross(normal, boxAxis, boxAxis2);
    if (CHECK_OVERLAP(normal, 7)) { return 0; };
    two.getAxis(boxAxis2, 2);
    vec3.cross(normal, boxAxis, boxAxis2);
    if (CHECK_OVERLAP(normal, 8)) { return 0; };

    one.getAxis(boxAxis, 1);

    two.getAxis(boxAxis2, 0);
    vec3.cross(normal, boxAxis, boxAxis2);
    if (CHECK_OVERLAP(normal, 9)) { return 0; };
    two.getAxis(boxAxis2, 1);
    vec3.cross(normal, boxAxis, boxAxis2);
    if (CHECK_OVERLAP(normal, 10)) { return 0; };
    two.getAxis(boxAxis2, 2);
    vec3.cross(normal, boxAxis, boxAxis2);
    if (CHECK_OVERLAP(normal, 11)) { return 0; };

    one.getAxis(boxAxis, 2);

    two.getAxis(boxAxis2, 0);
    vec3.cross(normal, boxAxis, boxAxis2);
    if (CHECK_OVERLAP(normal, 12)) { return 0; };
    two.getAxis(boxAxis2, 1);
    vec3.cross(normal, boxAxis, boxAxis2);
    if (CHECK_OVERLAP(normal, 13)) { return 0; };
    two.getAxis(boxAxis2, 2);
    vec3.cross(normal, boxAxis, boxAxis2);
    if (CHECK_OVERLAP(normal, 14)) { return 0; };

    let best = tryAxisData.best;
    let pen = tryAxisData.penetration;

    // Make sure we've got a result.
    if (best === 0xffffff) {
      return 0;
    }

    // We now know there's a collision, and we know which
    // of the axes gave the smallest penetration. We now
    // can deal with it in different ways depending on
    // the case.
    if (best < 3) {
      // We've got a vertex of box two on a face of box one.
      fillPointFaceBoxBox(one, two, toCentre, collisionData, best, pen);
      return 1;
    }
    else if (best < 6)
    {
      // We've got a vertex of box one on a face of box two.
      // We use the same algorithm as above, but swap around
      // one and two (and therefore also the vector between their
      // centres).
      vec3.scale(toCentre, toCentre, -1);
      fillPointFaceBoxBox(two, one, toCentre, collisionData, best-3, pen);
      return 1;
    }
    else
    {
      let contact = collisionData.contacts[collisionData.contactsCount];

      // We've got an edge-edge contact. Find out which axes
      best -= 6;
      let oneAxisIndex = best / 3;
      let twoAxisIndex = best % 3;
      one.getAxis(boxAxis, oneAxisIndex);
      two.getAxis(boxAxis2, twoAxisIndex);
      vec3.cross(normal, boxAxis, boxAxis2);
      vec3.normalize(normal, normal);

      // The axis should point from box one to box two.
      if (vec3.dot(normal, toCentre) > 0) {
        vec3.scale(normal, normal, -1);
      }

      vec3.copy(contact.contactNormal, normal);

      // We have the axes, but not the edges: each axis has 4 edges parallel
      // to it, we need to find which of the 4 for each object. We do
      // that by finding the point in the centre of the edge. We know
      // its component in the direction of the box's collision axis is zero
      // (its a mid-point) and we determine which of the extremes in each
      // of the other axes is closest.
      vec3.copy(p1, one.halfSize);
      vec3.copy(p2, two.halfSize);
      for (let i = 0; i < 3; i++)
      {
        if (i == oneAxisIndex) p1[i] = 0;
        else {
          one.getAxis(helperVec, i);
          if (vec3.dot(helperVec, normal) > 0) p1[i] = -p1[i];
        }

        if (i == twoAxisIndex) p2[i] = 0;
        else {
          two.getAxis(helperVec, i);
          if (vec3.dot(helperVec, normal < 0)) p2[i] = -p2[i];
        }
      }

      // Move them into world coordinates (they are already oriented
      // correctly, since they have been derived from the axes).      vec3.transformMat4(p1, p1, one.transform);
      vec3.transformMat4(p2, p2, two.transform);

      // So we have a point and a direction for the colliding edges.
      // We need to find out point of closest approach of the two
      // line-segments.
      contactPoint(
          p1, boxAxis, one.halfSize[oneAxisIndex],
          p2, boxAxis2, two.halfSize[twoAxisIndex],
          bestSingleAxis > 2,
          contact.contactPoint
          );

      // We can fill the contact.
      contact.penetration = pen;
      contact.setBodyData(one.body, two.body, collisionData.friction, collisionData.restitution);
      collisionData.contactAdded();
      return 1;
    }
    return 0;
  }

}