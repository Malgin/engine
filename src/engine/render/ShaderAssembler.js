import Resources from 'engine/Resources';

import whiteShader from './shaders/white.shader';
import vertexColorShader from './shaders/vertexColor.shader';
import skinnedMeshShader from './shaders/skinnedMesh.shader';
import directionalLightingShader from './shaders/directionalLighting.shader';
import directionalLightingTextureShader from './shaders/directionalLightingTexture.shader';
import directionalBumpMapping from './shaders/directionalBumpMapping.shader';

let dataObject = {};

function clearDataObject () {
  dataObject.light0 = false;
  dataObject.texture0 = false;
  dataObject.texture1 = false;
  dataObject.normalMap = false;
  dataObject.skinning = false;
}

export default class ShaderAssembler {

  constructor () {
    this.whiteShader = Resources.addShader('whiteShader', whiteShader);
    this.vertexColorShader = Resources.addShader('vertexColorShader', vertexColorShader);
    this.skinnedMeshShader = Resources.addShader('skinnedMeshShader', skinnedMeshShader);
    this.directionalLightingShader = Resources.addShader('directionalLightingShader', directionalLightingShader);
    this.directionalLightingTextureShader = Resources.addShader('directionalLightingTextureShader', directionalLightingTextureShader);
    this.directionalBumpMapping = Resources.addShader('directionalBumpMapping', directionalBumpMapping);
  }

  getShaderForROP (renderOperation) {
    let material = renderOperation.material;
    if (!material) {
      return this.whiteShader;
    }

    let shader = material.shader;
    if (shader) {
      return shader;
    }

    let mesh = renderOperation.mesh;

    clearDataObject();
    dataObject.light0 = mesh.hasNormals;
    dataObject.texture0 = material.texture0 && mesh.hasTexCoord0;
    dataObject.texture1 = material.texture1 && mesh.hasTexCoord1;
    dataObject.normalMap = material.normalMap && mesh.hasNormals;
    dataObject.skinning = renderOperation.jointTransforms && mesh.hasWeights;

    return this.getShaderWithCaps(dataObject);
  }

  getShaderWithCaps (data) {
    if (dataObject.skinning) {
      return this.skinnedMeshShader;
    } else if (dataObject.normalMap && dataObject.texture0 && dataObject.light0) {
      return this.directionalBumpMapping;
    } else if (dataObject.texture0 && dataObject.light0) {
      return this.directionalLightingTextureShader;
    } else if (dataObject.light0) {
      return this.directionalLightingShader;
    }
  }

}