import ObjectPool from 'engine/lib/ObjectPool';

class FPPair {
  setup (particle, forceGenerator) {
    this.particle = particle;
    this.forceGenerator = forceGenerator;
  }

  prepareForPool () {
    this.setup(null, null);
  }
}

export default class ParticleForceRegistry {

  constructor () {
    this.pool = new ObjectPool(FPPair);
    this.pairList = [];
  }

  add (particle, forceGenerator) {
    let pair = this.pool.obtain();
    pair.setup(particle, forceGenerator);
    this.pairList.push(pair);
  }

  removePair (particle, forceGenerator) {
    let list = this.pairList;
    let len = list.length;

    for (let i = len - 1; i >= 0; i--) {
      let pair = list[i];
      if (pair.particle === particle && pair.forceGenerator === forceGenerator) {
        this.pool.release(pair);
        list[i] = list[--len];
        list.length = len;
        return;
      }
    }
  }

  removeParticle (particle) {
    let list = this.pairList;
    let len = list.length;

    for (let i = len - 1; i >= 0; i--) {
      let pair = list[i];
      if (pair.particle === particle) {
        this.pool.release(pair);
        list[i] = list[--len];
      }
    }

    list.length = len;
  }

  clear () {
    for (let pair of this.pairList) {
      this.pool.release(pair);
    }
    this.pairList.length = 0;
  }

  updateForces (dt) {
    let list = this.pairList;
    let len = list.length;

    for (let i = 0; i < len; i++) {
      let pair = list[i];
      pair.forceGenerator.updateForce(pair.particle, dt);
    }
  }

}