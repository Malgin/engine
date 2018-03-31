//
// Created by Sidorenko Nikita on 3/30/18.
//

#include "Game.h"
#include "objects/Sprite.h"

GameObjectPtr rootObj;
GameObjectPtr sprite1;
GameObjectPtr sprite2;

void Game::init(Engine *engine) {
  _engine = engine;

  rootObj = CreateGameObject<GameObject>();

  sprite1 = CreateGameObject<Sprite>();
  sprite1->transform()->position(vec3(0, 0, -10));
  sprite1->transform()->scale(vec3(0.3, 0.3, 0.3));

  sprite2 = CreateGameObject<Sprite>();
  sprite2->transform()->position(vec3(0, 8, 0));
  sprite2->transform()->scale(vec3(2, 2, 2));
  sprite2->transform()->setParent(sprite1->transform());
}

void Game::update(float dt) {
  _updateGameLogic(dt);
  _scene.update(dt);
  _engine->renderScene(_scene);
}

void Game::_updateGameLogic(float dt) {
  sprite1->transform()->rotate(vec3(0, 0, 1), dt * PI);
  sprite2->transform()->rotate(vec3(0, 0, 1), dt * PI * 2);
}
