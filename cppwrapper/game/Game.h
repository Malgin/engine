//
// Created by Sidorenko Nikita on 3/30/18.
//

#ifndef CPPWRAPPER_GAME_H
#define CPPWRAPPER_GAME_H

#include "EngineMain.h"
#include <memory>

class Game: public IGame {

public:
  void init(std::shared_ptr<Engine> engine) override;
  void update(float dt) override;

private:
  std::shared_ptr<Engine> _engine = nullptr;
  std::shared_ptr<Scene> _scene;

private:
  void _updateGameLogic(float dt);

  void _updateInput(float dt);
};


#endif //CPPWRAPPER_GAME_H
