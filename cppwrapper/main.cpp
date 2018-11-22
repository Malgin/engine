#include <EngineMain.h>
#include "game/Game.h"

int main(int argc, char *argv[]){
  auto game = std::make_shared<Game>(); // new should be used because current scope will be deleted in the web build

  auto engine = getEngine();
  engine->setup(game);

  return 0;
}