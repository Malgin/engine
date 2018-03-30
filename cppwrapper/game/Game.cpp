//
// Created by Sidorenko Nikita on 3/30/18.
//

#include "Game.h"
#include "objects/Sprite.h"

GameObjectPtr rootObj;
GameObjectPtr sprite;

void Game::init(Engine *engine) {
  _engine = engine;

  rootObj = CreateGameObject<GameObject>();
//  sprite = CreateGameObject<Sprite>();
}

void Game::update(float dt) {
  _updateGameLogic(dt);
  _scene.update(dt);
  _engine->renderScene(_scene);
}

void Game::_updateGameLogic(float dt) {

}
