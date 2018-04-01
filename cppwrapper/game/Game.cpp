//
// Created by Sidorenko Nikita on 3/30/18.
//

#include "Game.h"
#include "objects/Sprite.h"

GameObjectPtr rootObj;
std::shared_ptr<Sprite> sprite1;
std::shared_ptr<Sprite> sprite2;
std::shared_ptr<Sprite> sprite3;

float ang = 0;

void Game::init(Engine *engine) {
  _engine = engine;

  sprite1 = CreateGameObject<Sprite>();
  sprite1->transform()->position(vec3(0, 0, -10));
  sprite1->transform()->scale(vec3(0.3, 0.3, 0.3));
  sprite1->materialColor()->color(vec4(1, 1, 0, 1));

  sprite2 = CreateGameObject<Sprite>();
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
  _updateGameLogic(dt);
  _scene.update(dt);
  _engine->renderScene(_scene);
}

void Game::_updateGameLogic(float dt) {
  ang += dt * PI;
  sprite2->materialColor()->color(vec4((sin(ang) + 1) / 2, (cos(ang) + 1) / 2, cos(ang * 0.5) + sin(ang * 0.2), 1));
  sprite1->transform()->rotate(vec3(0, 0, 1), dt * PI);
  sprite2->transform()->rotate(vec3(0, 0, 1), dt * PI * 2);
}
