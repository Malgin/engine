import ObjectPool from './lib/ObjectPool';
import Material from './render/Material';
import RenderOperation from './render/RenderOperation';

const renderOpPool = new ObjectPool(RenderOperation);

export default {

  obtainRenderOp: function () {
    let renderOp = renderOpPool.obtain();
    return renderOp;
  },

  releaseRenderOp: function (object) {
    renderOpPool.release(object);
  }

}