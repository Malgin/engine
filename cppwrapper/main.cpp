#include <engine/EngineMain.h>
#include "game/Game.h"

int main(int argc, char *argv[]){
  Game *game = new Game(); // new should be used because current scope will be deleted in the web build

  Engine *engine = getEngine();
  engine->setup(game);

  return 0;
}