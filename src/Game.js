import Application from 'src/engine/Application';
import Resources from 'engine/Resources';
import ModelLoader from 'engine/loader/ModelLoader';

import ParticleScene from './scenes/ParticleScene';
import RigidbodyScene from './scenes/RigidbodyScene';
import GameObjectScene from './scenes/GameObjectScene';

export default class Game extends Application {

  constructor (data) {
    super(data);

    this.loadResources()
      .then(() => this.initEntities())
      .catch((e) => { throw e });
  }

  loadResources () {
    return this.loadModels()
             .then(() => this.loadTextures());
  }

  loadModels () {
    return Resources.loadFileList([
      // 'resources/models/group.mdl',
      'resources/models/textureTest/textured_cube.mdl',
      'resources/models/skin_cilynder.mdl',
      // 'resources/models/anim1.mdl',
      // 'resources/models/textureTest/textured_plane.mdl'
    ], ModelLoader, { keepData: true });
  }

  loadTextures () {
    return Resources.loadObjectTextures();
  }

  initEntities () {
    this.scenes = [
      new GameObjectScene()
    ];

    this.setScene(0);
  }

  setScene (scene) {
    this.currentScene = scene;
    this.scenes[this.currentScene].reset();
  }

  render (dt, gl) {
    if (!this.scenes) return;

    this.scenes[this.currentScene].render(dt, gl);

    let error = gl.getError();
    if (error !== gl.NO_ERROR) {
      console.error('GL error: ' + error);
    }
  }


}