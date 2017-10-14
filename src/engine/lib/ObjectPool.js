export default class ObjectPool {

  constructor (constructor, defaultOpts) {
    this.constructMethod = constructor;
    this.pool = [];
    this.availableCount = 0;
    this.defaultOpts = defaultOpts;
  }

  obtain () {
    if (this.availableCount > 0) {
      let index = this.availableCount - 1;
      let object = this.pool[index];
      this.pool[index] = null;
      this.availableCount = index;
      return object;
    }

    return new this.constructMethod(this.defaultOpts);
  }

  release (object) {
    this.pool[this.availableCount] = object;
    this.availableCount += 1;
    if (object.prepareForPool) {
      object.prepareForPool();
    }
  }

}