import Application from 'src/engine/Application';
import Resources from 'engine/Resources';
import ModelLoader from 'engine/loader/ModelLoader';

import ParticleScene from './scenes/ParticleScene';
import RigidbodyScene from './scenes/RigidbodyScene';
import GameObjectScene from './scenes/GameObjectScene';

export default class Game extends Application {

  constructor (data) {
    super(data);
    this.setupModule();

    this.loadScript('cppwrapper.js')
    // Promise.resolve()
      // .then(() => this.loadResources())
      // .then(() => this.initEntities())
      .catch((e) => { throw e });
  }

  setupModule () {
    window.Module = {
      preRun: [],
      postRun: [],
      print: (text) => console.log(text),
      printErr: (error) => console.error(error),
      canvas: this.canvas,
      setStatus: function(text) {
        console.info(text);
      },
      totalDependencies: 0,
      monitorRunDependencies: function(left) {
        this.totalDependencies = Math.max(this.totalDependencies, left);
        Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
      }
    };
  }

  loadResources () {
    // return Promise.resolve();
    return this.loadModels()
             .then(() => this.loadTextures());
  }

  loadModels () {
    return Resources.loadFileList([
      // 'resources/models/group.mdl',
      // 'resources/models/textureTest/textured_cube.mdl',
      // 'resources/models/skin_cilynder.mdl',
      'resources/models/girl.mdl',
      // 'resources/models/girl_my.mdl',
      // 'resources/models/soldier.mdl',
      // 'resources/models/textureTest/textured_plane.mdl'
    ], ModelLoader, { keepData: true });
  }

  loadTextures () {
    return Resources.loadObjectTextures();
  }

  loadScript(url) {
    let script = document.createElement("script");

    let promise = new Promise ((resolve, reject) => {
      script.onreadystatechange = resolve;
      script.onload = resolve;
    });

    script.src = url;
    document.head.appendChild(script);

    return promise;
  }

  initEntities () {
    // this.scenes = [
    //   new GameObjectScene()
    // ];

    // this.setScene(0);
  }

  setScene (scene) {
    this.currentScene = scene;
    this.scenes[this.currentScene].reset();
  }

  render (dt, gl) {
    gl.clearColor(0.0, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (!this.scenes) return;

    this.scenes[this.currentScene].render(dt, gl);

    let error = gl.getError();
    if (error !== gl.NO_ERROR) {
      console.error('GL error: ' + error);
    }
  }


}