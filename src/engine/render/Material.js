import Resources from 'engine/Resources';

export default class Material {

  constructor () {
    this.shader = null;
    this.texture0 = null;
    this.texture1 = null;
    this.normalMap = null;
  }

  setFromHierarchy (data) {
    if (data.diffuse) {
      this.texture0 = Resources.getTexture(data.diffuse[0].texture);
      if (data.diffuse[1]) {
        this.texture1 = Resources.getTexture(data.diffuse[1].texture);
      }
    }

    if (data.bump) {
      this.normalMap = Resources.getTexture(data.bump[0].texture);
    }
    console.info('setting mat', this);
  }

}