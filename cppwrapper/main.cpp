#include <engine/EngineMain.h>
#include "game/Game.h"

int main(int argc, char *argv[]){
  Game game;

  Engine *engine = getEngine();
  engine->setup(&game);

  return 0;
}