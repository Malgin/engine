import Resources from 'engine/Resources';
import Mesh from 'engine/render/Mesh';
import AnimationData from 'engine/animation/AnimationData';

const ATTRIB_POSITION = 'POSITION';
const ATTRIB_NORMAL = 'NORMAL';
const ATTRIB_TEXCOORD0 = 'TEXCOORD0';

const ATTRIB_COUNT = {
  [ATTRIB_POSITION]: 3,
  [ATTRIB_NORMAL]: 3,
  [ATTRIB_TEXCOORD0]: 2
};

const { floor } = Math;

export default class ModelLoader {

  static loadRequestResponse (request, opts) {
    this.load(request.response, opts);
  }

  static load (buffer, opts) {
    let dataView = new DataView(buffer);

    let offset = 0;

    // File header byte length
    let len = dataView.getUint16(0);
    offset += 2;

    // Getting JSON file header
    let stringArr = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      stringArr[i] = dataView.getUint8(offset + i);
    }
    offset += len;
    var encodedString = String.fromCharCode.apply(null, stringArr);
    let modelData = JSON.parse(encodedString);
    console.info('JSON:', modelData);

    // Hierarchy
    if (modelData.hierarchy) {
      modelData.hierarchy.url = opts.url;
      Resources.addHierarchy(opts.url, modelData.hierarchy);
    }

    // Geometry
    if (modelData.geometry) {
      offset += this.loadGeometry(modelData.geometry, dataView, offset, opts);
    }

    let animations = null;
    if (modelData.animation) {
      console.info('animation', modelData.animation);
      offset += this.loadAnimation(modelData.animation, dataView, offset, opts);
    }
  }

  static loadGeometry (geometry, dataView, offset, opts) {
    let bytesRead = 0;

    for (let i = 0; i < geometry.length; i++) {
      let mesh = new Mesh();
      let geomData = geometry[i];
      let { indexCount, vertexCount, attributes, name, caps } = geomData;

      let indices = [];
      for (let j = 0; j < indexCount; j++) {
        indices.push(dataView.getUint16(offset + bytesRead));
        bytesRead += 2;
      }
      mesh.setIndices(indices);

      for (let k = 0; k < attributes.length; k++) {
        let attribName = attributes[k];
        let count = ATTRIB_COUNT[attribName];
        if (!count) {
          throw new Error('Attrib not supported:', attribName, opts);
        }

        let attribArray = [];
        let totalCount = count * vertexCount;

        bytesRead += this.readFloatArray(attribArray, totalCount, dataView, offset + bytesRead);

        switch (attribName) {
          case ATTRIB_POSITION:
            mesh.setVertices(attribArray);
            break;
          case ATTRIB_NORMAL:
            mesh.setNormals(attribArray);
            break;
          case ATTRIB_TEXCOORD0:
            mesh.setTexCoord0(attribArray);
            break;
        }
      }

      if (!mesh.hasNormals) {
        mesh.calculateNormals();
      }

      if (caps && caps.bump) {
        mesh.calculateTBN();
      }

      mesh.createBuffer();
      Resources.addMesh(`${opts.url}:${name}`, mesh);
    }

    return bytesRead;
  }

  static loadAnimation (animations, dataView, offset, opts) {
    let bytesRead = 0;

    for (let i = 0; i < animations.length; i++) {
      let anim = animations[i];
      let frameData = [];
      let animationData = new AnimationData(anim);
      let readCount = animationData.getElementCount();
      // let readCount = animationData.stride * animationData.frameCount;
      bytesRead += this.readFloatArray(frameData, readCount, dataView, offset + bytesRead);
      animationData.loadFrames(frameData);
      animationData.url = opts.url;
      Resources.addAnimationData(animationData, animationData.name, opts.url);
    }

    return bytesRead;
  }

  static readFloatArray (result, count, dataView, offset) {
    let bytesRead = 0;

    for (let i = 0; i < count; i++) {
      result.push(dataView.getFloat32(offset + bytesRead));
      bytesRead += 4;
    }

    return bytesRead;
  }

}