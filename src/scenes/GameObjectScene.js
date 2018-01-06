import app from 'engine/Application';
import BaseScene from '../BaseScene';
import Resources from 'engine/Resources';
import RigidBody from 'engine/physics/RigidBody';
import ParticleForceRegistry from 'engine/physics/particles/ParticleForceRegistry';
import GravityForceGenerator from 'engine/physics/particles/GravityForceGenerator';
import AxisBasisObject from 'src/entities/AxisBasisObject';
import ParticleContact from 'engine/physics/particles/ParticleContact';
import math from 'math';
const { mat4, vec3, quat } = math;
import utils from 'src/utils';
import Mesh from 'engine/render/Mesh';
import Spring from 'engine/physics/Spring';
import DebugDraw from 'engine/render/DebugDraw';
import Material from 'engine/render/Material';
import GameObject from 'engine/scene/GameObject';

import { CollisionPrimitive, CollisionPlane } from 'engine/physics/Primitive';
import { CollisionData, CollisionDetector } from 'engine/physics/CollisionNarrow';

let p = vec3.create();
let helperVec = vec3.create();
let helperMatrix = mat4.create();

export default class GameObjectScene extends BaseScene {

  initEntities () {
    this.scene = app.instance.scene;

    this.isHolding = false;
    this.distance = 0;

    this.setupMaterials();
    super.initEntities();

    this.bodyAxis = new AxisBasisObject();

    this.sphereMesh = new Mesh();
    utils.generateSphere(this.sphereMesh, 30, 30, 0.5);
    this.sphereMesh.calculateNormals();
    this.sphereMesh.createBuffer();

    this.boxMesh = new Mesh();
    utils.generateBox(this.boxMesh, 1, 1, 1);
    this.boxMesh.calculateNormals();
    this.boxMesh.createBuffer();

    // this.boxObject = new GameObject();
    // this.scene.addChild(this.boxObject);
    // this.boxObject.loadHierarchy(
    //   Resources.getHierarchy('resources/models/group.mdl'), {
    //     material: this.directionalMaterial
    //   }
    // );

    this.animObject = new GameObject();
    this.scene.addChild(this.animObject);
    this.animObject.loadHierarchy(
      // Resources.getHierarchy('resources/models/girl.mdl')
      // Resources.getHierarchy('resources/models/skin_cilynder.mdl')
      Resources.getHierarchy('resources/models/soldier.mdl')
    );
    this.animObject.transform.scale[0] = 0.01;
    this.animObject.transform.scale[1] = 0.01;
    this.animObject.transform.scale[2] = 0.01;
    // quat.fromEuler(this.animObject.transform.rotation, 40, 30, 0) ;
    // this.animObject.transform.position[0] = 1.5;

    // this.animObject.animationController.addAnimation('anim1', 0, 54);
    // this.animObject.animationController.addAnimation('anim2', 55, 79);
    this.animObject.animationController.play();

    this.object2 = new GameObject();
    this.scene.addChild(this.object2);
    // this.object2.loadHierarchy(
    //   Resources.getHierarchy('resources/models/textureTest/textured_cube.mdl')
    // );
    this.object2.transform.position[1] = 3;

    // this.object2.scale[0] = 0.01;
    // this.object2.scale[1] = 0.01;
    // this.object2.scale[2] = 0.01;

    // this.boxObject.mesh = Resources.meshes["pPyramid1-lib"];
    // this.boxObject.material = this.directionalMaterial;


    // this.sphereObject = new GameObject();
    // this.sphereObject.mesh = Resources.meshes['resources/models/girl.bin:polySurface3-lib'];
    // this.sphereObject.material = this.directionalMaterial;
    // vec3.set(this.sphereObject.scale, 0.3, 0.3, 0.3);
    // vec3.set(this.sphereObject.position, 0, 1, 0);
    // this.boxObject.addChild(this.sphereObject);

    // this.smallBoxObject = new GameObject();
    // this.smallBoxObject.mesh = this.boxMesh;
    // this.smallBoxObject.material = this.directionalMaterial;
    // vec3.set(this.smallBoxObject.scale, 0.5, 0.5, 0.5);
    // vec3.set(this.smallBoxObject.position, 2, 0, 0);
    // this.sphereObject.addChild(this.smallBoxObject);
  }

  setupMaterials () {
    this.whiteShader = Resources.getShader('whiteShader');
    this.directionalLightingShader = Resources.getShader('directionalLightingShader');

    this.whiteMaterial = new Material();
    this.whiteMaterial.shader = this.whiteShader;
    this.directionalMaterial = new Material();
    this.directionalMaterial.shader = this.directionalLightingShader;
  }

  render (dt, gl) {
    super.render(dt, gl);
  }

  //------------------------------------------------------------------------
  // Render
  //------------------------------------------------------------------------

  drawBody (body) {
    // mat4.copy(this.bodyAxis.transform, body.transformMatrix);
    // this.bodyAxis.render();

    if (body.shape.type === CollisionPrimitive.SPHERE) {
      this.drawSphere(body);
    } else if (body.shape.type === CollisionPrimitive.BOX) {
      this.drawBox(body);
    }
  }

  drawSphere (body) {
    vec3.set(helperVec, body.shape.radius * 2, body.shape.radius * 2, body.shape.radius * 2);
    mat4.fromScaling(helperMatrix, helperVec);
    mat4.multiply(helperMatrix, body.transformMatrix, helperMatrix);
    this.renderer.renderMesh(this.sphereMesh, this.directionalLightingShader, helperMatrix);
  }

  drawBox (body) {
    vec3.scale(helperVec, body.shape.halfSize, 2);
    mat4.fromScaling(helperMatrix, helperVec);
    mat4.multiply(helperMatrix, body.transformMatrix, helperMatrix);
    this.renderer.renderMesh(this.boxMesh, this.directionalLightingShader, helperMatrix);
  }

  handleInput (dt) {
    super.handleInput(dt);

    let input = app.instance.input;

    if (input.keyDown('C'.charCodeAt(0))) {
      quat.rotateX(this.animObject.transform.rotation, this.animObject.transform.rotation, Math.PI * dt);
    }
    if (input.keyDown('X'.charCodeAt(0))) {
      quat.rotateY(this.animObject.transform.rotation, this.animObject.transform.rotation, Math.PI * dt);
    }

  }


}