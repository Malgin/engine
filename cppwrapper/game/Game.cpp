//
// Created by Sidorenko Nikita on 3/30/18.
//

#include "Game.h"
#include "objects/Sprite.h"
#include "objects/Terrain.h"
#include "objects/Projector.h"
#include "loader/HierarchyLoader.h"
#include <vector>
#include "EngMath.h"
#include "loader/TextureLoader.h"
#include "loader/SpritesheetLoader.h"
#include "EngTypes.h"
#include "render/material/MaterialTypes.h"
#include "objects/Camera.h"
#include "objects/LightObject.h"
#include "render/renderer/Renderer.h"

GameObjectPtr rootObj;
std::shared_ptr<Sprite> sprite1;
std::shared_ptr<Sprite> sprite2;
std::shared_ptr<Sprite> sprite3;
CameraPtr camera;

TerrainPtr terrain;

SpriteSheetPtr spritesheet;

LightObjectPtr light;
LightObjectPtr light2;
GameObjectPtr lightRing1;
ProjectorPtr flashLight;
MaterialTextureProjectionPtr materialTexProj;
//ProjectorPtr projector;

float ang = 0;
float camXAngle = 0;
float camYAngle = 0;
ModelBundlePtr bundle;

mat4 projMatrix;
double drawTime = 0;

void Game::init(Engine *engine) {
  _engine = engine;

  camera = CreateGameObject<Camera>();
  camera->transform()->position(vec3(0, 5, 15));
  camXAngle = -M_PI / 8;

  spritesheet = loader::loadSpritesheet("resources/common/decals.json");
  auto projectorTexture = loader::loadTexture("resources/common/flashlight.jpg", true);
  engine->renderer()->projectorTexture(projectorTexture);

//  materialTexProj = std::make_shared<MaterialTextureProjection>();
//  materialTexProj->projectedTexture(projectorTexture );

//  projector = CreateGameObject<Projector>();
//  projector->type(ProjectorType::Projection);
//  projector->setDebugEnabled(true);
//  projector->zFar(3);

  terrain = CreateGameObject<Terrain>();
  terrain->loadHeightmap("resources/terrain/terrain.raw");
//  terrain->addTextures("resources/terrain/snow2_d.jpg", "resources/terrain/normal_test.jpg");

  terrain->addTextures("resources/terrain/snow_mud_d.jpg", "resources/terrain/snow_mud_n.jpg");
  terrain->addTextures("resources/terrain/snow2_d.jpg", "resources/terrain/snow2_n.jpg");
  terrain->addTextures("resources/terrain/snow_mntn2_d.jpg", "resources/terrain/snow_mntn2_n.jpg");
  terrain->loadSplatmap("resources/terrain/splatmap.png");
  terrain->loadSpecularmap("resources/terrain/specular.jpg");
  terrain->transform()->position(vec3(-15, 0,-15));

  bundle = Resources::loadModel("resources/models/group.mdl");
//  loader::MaterialPicker texProjPicker(materialTexProj);
  loader::MaterialPicker texProjPicker(std::make_shared<MaterialLighting>());
//  rootObj = loader::loadHierarchy(bundle, nullptr, &texProjPicker);
  rootObj = loader::loadHierarchy(bundle, nullptr, nullptr);
  rootObj->transform()->position(vec3(0, 3, 0));

//  light = CreateGameObject<LightObject>();
//  light->transform()->position(vec3(0, 4, 0));
//  light->attenuation(0.0, 0.9);
//  light->color(vec3(1, 1, 1));
//  light->enableDebug();

//  light2 = CreateGameObject<LightObject>();
//  light2->transform()->position(vec3(0, 4, 0));
//  light2->radius(30);
//  light2->color(vec3(1, 0, 0));
//  light2->enableDebug();

  lightRing1 = CreateGameObject<GameObject>();
  lightRing1->transform()->rotation(glm::angleAxis((float)M_PI / 2, vec3(0, 1, 0)));
  lightRing1->transform()->position(vec3(1.2, 3, 1));
  int ringCount = 8;
//  int ringCount = 0;
  for (int i = 0; i < ringCount; i++) {
//    if (i % 2 != 0) continue;

    auto lightInRing = CreateGameObject<LightObject>();
    float ang = M_PI * 2 * i / ringCount;
    lightInRing->transform()->position(vec3(cosf(ang) * 7, 0, sinf(ang) * 7));
    lightInRing->type(i % 2 == 0 ? LightObjectType::Point : LightObjectType::Spot);
    lightInRing->coneAngle(30);
    lightInRing->transform()->rotate(vec3(1, 0, 0), -M_PI / 4.0f);
//    lightInRing->radius(7);
    lightInRing->color(i % 2 == 0 ? vec3(0, 1, 1) : vec3(0.8, 0.2, 0.5));
//    lightInRing->radius(15);
//    lightInRing->color(vec3(1,1,1));
    lightInRing->enableDebug();
    lightInRing->transform()->parent(lightRing1->transform());
  }

//  flashLight = CreateGameObject<Projector>();
//  flashLight->transform()->parent(camera->transform());
//  flashLight->type(ProjectorType::Projection);
//  flashLight->zFar(40);
//  flashLight->zNear(0.05);
//  flashLight->attenuation(0.0, 0.1);
//  flashLight->fov(50);
//  flashLight->transform()->position(vec3(0,0,-0.1));
//  flashLight->enableDebug();

  auto texture1 = loader::loadTexture("resources/lama.jpg");
  auto materialTexture1 = std::make_shared<MaterialTexture>();
  materialTexture1->texture(texture1);
  sprite1 = CreateGameObject<Sprite>();
  sprite1->material(materialTexture1);
  sprite1->transform()->position(vec3(0, 0, -10));
  sprite1->transform()->scale(vec3(0.3, 0.3, 0.3));

  auto texture2 = loader::loadTexture("resources/platform.png");
  auto materialTexture2 = std::make_shared<MaterialTexture>();
  materialTexture2->texture(texture2);
  sprite2 = CreateGameObject<Sprite>();
  sprite2->material(materialTexture2);
  sprite2->transform()->position(vec3(0, 8, 0));
  sprite2->transform()->scale(vec3(2, 2, 2));
  sprite2->transform()->setParent(sprite1->transform());

  sprite3 = CreateGameObject<Sprite>();
  sprite3->transform()->position(vec3(3, 0, 0));
  sprite3->transform()->scale(vec3(0.5, 0.5, 0.5));
  sprite3->transform()->setParent(sprite2->transform());
  sprite3->materialColor()->color(vec4(1, 0, 1, 1));
}

void Game::update(float dt) {
  _updateInput(dt);
  _updateGameLogic(dt);

  _scene.update(dt);
  _engine->renderScene(_scene);
}

void Game::_updateInput(float dt) {
  auto input = getEngine()->input();

  vec3 posDelta = vec3(0, 0, 0);
  if (input->keyDown(Key::Left) || input->keyDown(Key::A)) {
    posDelta += camera->transform()->left();
  }

  if (input->keyDown(Key::Right) || input->keyDown(Key::D)) {
    posDelta += camera->transform()->right();
  }

  if (input->keyDown(Key::Up) || input->keyDown(Key::W)) {
    posDelta += camera->transform()->forward();
  }

  if (input->keyDown(Key::Down) || input->keyDown(Key::S)) {
    posDelta += camera->transform()->backward();
  }

  if (input->keyDown(Key::E)) {
    posDelta += camera->transform()->up();
  }

  if (input->keyDown(Key::Q)) {
    posDelta += camera->transform()->down();
  }


  if (input->keyDown(Key::Space)) {
//    projector->transform()->position(camera->transform()->position());
//    projector->transform()->rotation(camera->transform()->rotation());

//    projMatrix = glm::ortho(-0.5f, 0.5f, -0.5f, 0.5f, -0.5f, 2.0f);
//    projMatrix = glm::perspective(RAD(30), 1.0f, 1.0f, 4.0f);
//    projMatrix *= camera->viewMatrix();
      projMatrix = camera->viewProjectionMatrix();
//
//    materialTexProj->projectedTextureMatrix(projMatrix);

//    light->transform()->position(camera->transform()->position() + camera->transform()->forward() * 2.5f);
//    rootObj->transform()->rotate(vec3(0, 0, 1), dt * PI);
  }

  if (input->keyDown(Key::C) && getEngine()->time() - drawTime > 0.3) {
    auto proj = CreateGameObject<Projector>();
    drawTime = getEngine()->time();
    proj->setDebugEnabled(true);
    proj->type(ProjectorType::Projection);
    proj->zFar(3);
    proj->orthographicSize(1);
    proj->transform()->position(camera->transform()->position());
    proj->transform()->rotation(camera->transform()->rotation());
  }

  if (input->keyDown(Key::MouseLeft)) {
    camXAngle -= input->mouseDelta().y * 0.008;
    camYAngle -= input->mouseDelta().x * 0.008;
  }

  if (input->keyDown(Key::MouseLeft)) {
    camXAngle -= input->mouseDelta().y * 0.008;
    camYAngle -= input->mouseDelta().x * 0.008;
  }

  camera->transform()->translate(posDelta * dt * 20.0f);
}

void Game::_updateGameLogic(float dt) {
//  dt *= 0.05;
  ang += dt * PI;

  quat rotation(vec3(camXAngle, camYAngle, 0));
  camera->transform()->rotation(rotation);

  sprite3->materialColor()->color(vec4((sin(ang) + 1) / 2, (cos(ang) + 1) / 2, cos(ang * 0.5) + sin(ang * 0.2), 1));
  sprite1->transform()->rotate(vec3(0, 0, 1), dt * PI);
  sprite2->transform()->rotate(vec3(0, 0, 1), dt * PI * 2);

//  light->transform()->setPosition(vec3(cos(ang) * 9, 3, sin(ang) * 9));
//  lightRing1->transform()->rotate(vec3(0, 1, 0), dt * PI * 0.2);

  auto debugDraw = getEngine()->debugDraw();
  debugDraw->drawFrustum(projMatrix, glm::vec4(1, 1, 0, 1));

//  OBB obb(vec3(10, 0, 5), vec3(6, 3, 1));
//  debugDraw->drawOBB(obb, vec4(1, 0, 1, 1));
//  auto debugDraw = getEngine()->debugDraw();
//  debugDraw->drawFrustum(projMatrix);
}
