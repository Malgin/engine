import app from '../Application';
import GameObject from './GameObject';

export default class Scene {

  constructor () {
    this.objects = [];
    this.rootObject = new GameObject();
  }

  update (dt) {
    this.rootObject.update(dt);
    this.rootObject.updateTransform();
  }

  setupRenderOps (renderer, gameObject) {
    if (!gameObject) {
      gameObject = this.rootObject;
    }

    let children = gameObject.children;
    for (let i = 0, len = children.length; i < len; i++) {
      let renderOp = renderer.addRenderOp();
      children[i].setupRenderOp(renderOp);
      this.setupRenderOps(renderer, children[i]);
    }
  }

  addChild (gameObject) {
    this.rootObject.addChild(gameObject);
  }

}