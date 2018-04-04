//
// Created by Sidorenko Nikita on 3/30/18.
//

#ifndef CPPWRAPPER_GAME_H
#define CPPWRAPPER_GAME_H

#include "engine/EngineMain.h"

class Game: public IGame {

public:
  void init(Engine *engine) override;
  void update(float dt) override;

private:
  Engine *_engine = nullptr;
  Scene _scene;

private:
  void _updateGameLogic(float dt);

  void _updateInput(float dt);
};


#endif //CPPWRAPPER_GAME_H
