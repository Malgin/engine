import Shader from './render/Shader';
import app from './Application';
import Promise from 'bluebird';
import TextureLoader from './loader/TextureLoader';

const RETRY_MAP = {
  '598': true,
  '599': true,
  '429': true
};

const RETRY_COUNT = 5;
const RETRY_INTERVAL = 200;
const TEXTURE_EFFECTS = ['diffuse', 'bump'];

class Resources {

  constructor () {
    this.missingAssets = {};
    this.shaders = {};
    this.meshes = {};
    this.hierarchy = {};
    this.animations = {};
    this.skinning = {};
    this.textures = {};
    this.objectTextures = {}; // textures that referenced by the objects

    this.basePath = window.location.pathname ? window.location.pathname : '/';

    this.animationUrls = {};
    this.skinningUrls = {};
  }

  //------------------------------------------------------------------------
  // Load files
  //------------------------------------------------------------------------

  loadFileList (fileList, loader, opts) {
    let promises = [];

    for (let i = 0; i < fileList.length; i++) {
      promises.push(this.loadFile(fileList[i], loader, opts));
    }

    return Promise.all(promises);
  }

  loadFile (file, loader, opts = {}, responseType = 'arraybuffer') {
    return new Promise ((resolve, reject) => {
      var oReq = new XMLHttpRequest();
      oReq.open("GET", this.basePath + file, true);
      oReq.responseType = responseType;

      oReq.onload = function (oEvent) {
        if (oReq.status === 200) {
          opts.url = file;
          let result = loader.loadRequestResponse(oReq, opts);
          resolve(result);
        } else {
          reject(oReq);
        }
      };

      oReq.onError = function (error) {
        this.missingAssets[file] = true;
        reject(error);
      }

      oReq.send(null);
    });
  }

  //------------------------------------------------------------------------
  // Load images
  //------------------------------------------------------------------------

  loadObjectTextures () {
    let list = [];
    for (let texture in this.objectTextures) {
      list.push(texture);
    }

    this.objectTextures = {};
    return this.loadImageList(list);
  }

  loadImageList (imageList, opts) {
    if (!imageList.length) {
      return true;
    }

    let promises = [];
    for (let i = 0; i < imageList.length; i++) {
      promises.push(this.loadImage(imageList[i], opts));
    }

    return Promise.all(promises);
  }

  loadImage (url, opts) {
    let image = new Image();
    image.crossOrigin = 'anonymous';
    let remainingTries = RETRY_COUNT;
    let retryInterval = RETRY_INTERVAL;

    function clearImageCallbacks (image) {
      image.onload = null;
      image.onerror = null;
    }

    image.src = this.basePath + url;

    return new Promise((resolve, reject) => {
      image.onload = () => {
        // Make sure that width is defined
        if (!image.width) {
          let errCount = 0;
          let intervalID = setInterval(() => {
            if (image.width) {
              clearInterval(intervalID);
              image.onload();
              return;
            } else {
              errCount += 1;
              if (errCount >= 5) {
                clearInterval(intervalID);
                reject(new Error(`Can't load image (${url}). Width is 0.`));
                clearImageCallbacks(image);
                return;
              }
            }
          }, 0);
          return;
        }

        // Success
        clearImageCallbacks(image);
        TextureLoader.load(url, image, opts);
        resolve(url);
      }

      image.onerror = (error) => {
        if (!window.navigator.onLine) {
          // While offline, retry, don't decrease remainingTries
          setTimeout(() => {
            image.src = url;
          }, RETRY_INTERVAL);
          return;
        }

        // Retry unsuccessful loads for RETRY_COUNT times
        if (RETRY_MAP[error.status] && remainingTriesCount > 0) {
          remainingTries -= 1;
          setTimeout(() => {
            image.src = url;
          }, retryInterval);
          retryInterval *= 2;
          return;
        }

        clearImageCallbacks(image);
        this.missingAssets[url] = true;
        reject(new Error(`Can't load image (${url}). Status: ${error.status}\nReason: ${error.reason}\nResponse: ${error.response}`));
      }
    });

  }

  //------------------------------------------------------------------------
  // Shader
  //------------------------------------------------------------------------

  addShader (name, src) {
    let shader = new Shader();
    shader.load(src);
    this.shaders[name] = shader;

    return shader;
  }

  getShader (name) {
    return this.shaders[name];
  }

  //------------------------------------------------------------------------
  // Texture
  //------------------------------------------------------------------------

  addTexture (name, texture) {
    if (this.textures[name]) {
      throw new Error('Texture already exists:' + name);
    }

    this.textures[name] = texture;
  }

  getTexture (name) {
    let texture = this.textures[name] || null;

    if (!texture) {
      if (this.missingAssets[texture]) {
        console.error('Texture loading error', name);
      } else {
        console.error('Texture not found', name);
      }
    }

    return texture;
  }

  //------------------------------------------------------------------------
  // Hierarchy
  //------------------------------------------------------------------------

  addHierarchy (name, data) {
    if (this.hierarchy[name]) {
      throw new Error('Hierarchy already exists:' + name);
    }

    this.hierarchy[name] = data;
    this.addObjectTexture(data);
  }

  addObjectTexture (data) {
    let material = data.material;
    if (material) {
      for (let i = 0; i < TEXTURE_EFFECTS.length; i++) {
        let effectName = TEXTURE_EFFECTS[i];
        let materialEffect = material[effectName];
        if (materialEffect) {
          for (let j = 0; j < materialEffect.length; j++) {
            let texture = materialEffect[j].texture;
            this.objectTextures[texture] = true;
          }
        }
      }

    }

    let children = data.children;
    if (children) {
      for (let i = 0; i < children.length; i++) {
        this.addObjectTexture(children[i]);
      }
    }
  }

  getHierarchy (name) {
    return this.hierarchy[name];
  }

  //------------------------------------------------------------------------
  // Geometry
  //------------------------------------------------------------------------

  addMesh (name, mesh) {
    if (this.meshes[name]) {
      throw new Error('Mesh already exists:' + name);
    }
    this.meshes[name] = mesh;
  }

  getMesh (name, url) {
    let key = url ? `${url}:${name}` : name;
    return this.meshes[key];
  }

  //------------------------------------------------------------------------
  // Animation
  //------------------------------------------------------------------------

  addSkinnedMeshData (skinnedMeshData, name, url) {
    let key = url ? `${url}:${name}` : name;
    if (this.skinning[key]) {
      throw new Error('Skinning data already exists:' + key);
    }

    this.skinning[key] = skinnedMeshData;
    this.animationUrls[url] = true;
    this.skinningUrls[url] = true;
  }

  getSkinnedMeshData (name, url) {
    let key = url ? `${url}:${name}` : name;
    return this.skinning[key];
  }

  addAnimationData (animationData, name, url) {
    let key = url ? `${url}:${name}` : name;
    if (this.animations[key]) {
      throw new Error('Animation already exists:' + key);
    }
    this.animationUrls[url] = true;
    this.animations[key] = animationData;
  }

  getAnimationData (name, url) {
    let key = url ? `${url}:${name}` : name;
    return this.animations[key];
  }

};

export default new Resources();