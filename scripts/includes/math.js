exports.getMatrix4 = function (data) {
    let matrix = data.split(' ');

    if (matrix.length !== 16) {
        throw new Error('Wrong matrix format. Should be array of 16 float.');
    }

    for (let i = 0; i < matrix.length; i++) {
      matrix[i] = parseFloat(matrix[i]);
      if (isNaN(matrix[i])) {
          throw new Error('Matrix component is not a number');
      }
    }

    this.mat4transpose(matrix); // we need column major matrices

    return matrix;
  }

exports.mat4transpose = function (a) {
    let a01 = a[1], a02 = a[2], a03 = a[3];
    let a12 = a[6], a13 = a[7];
    let a23 = a[11];

    let out = a;

    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
}

exports.getMat4Rotation = function (mat) {
    let out = new Array(4);

    // Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
    let trace = mat[0] + mat[5] + mat[10];
    let S = 0;

    if (trace > 0) {
        S = Math.sqrt(trace + 1.0) * 2;
        out[3] = 0.25 * S;
        out[0] = (mat[6] - mat[9]) / S;
        out[1] = (mat[8] - mat[2]) / S;
        out[2] = (mat[1] - mat[4]) / S;
    } else if ((mat[0] > mat[5])&(mat[0] > mat[10])) {
        S = Math.sqrt(1.0 + mat[0] - mat[5] - mat[10]) * 2;
        out[3] = (mat[6] - mat[9]) / S;
        out[0] = 0.25 * S;
        out[1] = (mat[1] + mat[4]) / S;
        out[2] = (mat[8] + mat[2]) / S;
    } else if (mat[5] > mat[10]) {
        S = Math.sqrt(1.0 + mat[5] - mat[0] - mat[10]) * 2;
        out[3] = (mat[8] - mat[2]) / S;
        out[0] = (mat[1] + mat[4]) / S;
        out[1] = 0.25 * S;
        out[2] = (mat[6] + mat[9]) / S;
    } else {
        S = Math.sqrt(1.0 + mat[10] - mat[0] - mat[5]) * 2;
        out[3] = (mat[1] - mat[4]) / S;
        out[0] = (mat[8] + mat[2]) / S;
        out[1] = (mat[6] + mat[9]) / S;
        out[2] = 0.25 * S;
    }

    return out;
}

exports.getMat4Translation = function (mat) {
    let out = new Array(3);

    out[0] = mat[12];
    out[1] = mat[13];
    out[2] = mat[14];

    return out;
}

exports.getMat4Scaling = function (mat) {
    let out = new Array(3);

    let m11 = mat[0];
    let m12 = mat[1];
    let m13 = mat[2];
    let m21 = mat[4];
    let m22 = mat[5];
    let m23 = mat[6];
    let m31 = mat[8];
    let m32 = mat[9];
    let m33 = mat[10];

    out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
    out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
    out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);

    return out;
}

exports.compare = function (arr1, arr2) {
    if (arr1.length !== arr2.length || arr1.length === 0) {
        throw new Error('Compare array length mismatch');
    }

    for (let i = 0; i < arr1.length; i++) {
        if (Math.abs(arr1[i] - arr2[i]) > 0.0000001) {
            return false;
        }
    }

    return true;
}

exports.addArrayToArray = function (array, arrayToAdd, index, count) {
    for (let i = 0; i < count; i++) {
        array.push(arrayToAdd[index + i]);
    }
}