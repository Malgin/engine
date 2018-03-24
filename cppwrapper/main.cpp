#include <engine/EngineMain.h>
#include <Resources.h>

int main(int argc, char *argv[]){
  Engine *engine = GetEngine();

  engine->setupSDL();

  return 0;
}