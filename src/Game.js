import Application from 'src/engine/Application';
import Resources from 'engine/Resources';
import ModelLoader from 'engine/loader/ModelLoader';

import whiteShader from 'resources/shaders/white.shader';
import vertexColorShader from 'resources/shaders/vertexColor.shader';
import directionalLightingShader from 'resources/shaders/directionalLighting.shader';
import pyramidModel from 'resources/models/pyramid.bin';

import ParticleScene from './scenes/ParticleScene';
import RigidbodyScene from './scenes/RigidbodyScene';
import GameObjectScene from './scenes/GameObjectScene';


export default class Game extends Application {

  constructor (data) {
    super(data);

    this.loadResources();
    this.initEntities();
  }

  loadResources () {
    Resources.addShader('whiteShader', whiteShader);
    Resources.addShader('vertexColorShader', vertexColorShader);
    Resources.addShader('directionalLightingShader', directionalLightingShader);

    // ModelLoader.load(new DataView(new Uint8Array(pyramidModel)));

    var oReq = new XMLHttpRequest();
    oReq.open("GET", pyramidModel, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function (oEvent) {
      var arrayBuffer = oReq.response; // Note: not oReq.responseText
      if (arrayBuffer) {
        ModelLoader.load(new DataView(arrayBuffer));
      }
    };

    oReq.send(null);

    // console.info('PYRAMID', typeof(pyramidModel));
    // console.info(pyramidModel);
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
    this.scenes[this.currentScene].render(dt, gl);

    let error = gl.getError();
    if (error !== gl.NO_ERROR) {
      console.error('GL error: ' + error);
    }
  }


}