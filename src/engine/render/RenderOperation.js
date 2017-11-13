export default class RenderOperation {

  constructor () {
    this.prepareForPool();
  }

  prepareForPool () {
    this.mesh = null;
    this.shader = null;
    this.lightEnabled = true;
    this.renderMode = undefined;
    this.renderMethod = 0; // 0 is renderMesh
    this.depthTest = true;
    this.blend = false;
    this.blendFunc = 0;
    this.material = null;
    this.transform = null;
  }


}