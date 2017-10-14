import Application from 'src/engine/Application';
import Resources from 'engine/Resources';
import whiteShader from 'resources/shaders/white.shader';
import vertexColorShader from 'resources/shaders/vertexColor.shader';
import ParticleScene from './scenes/ParticleScene';

export default class Game extends Application {

  constructor (data) {
    super(data);

    this.loadResources();
    this.initEntities();
  }

  loadResources () {
    Resources.addShader('whiteShader', whiteShader);
    Resources.addShader('vertexColorShader', vertexColorShader);
  }

  initEntities () {
    this.scenes = [
      new ParticleScene()
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