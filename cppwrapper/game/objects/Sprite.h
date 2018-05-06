//
// Created by Sidorenko Nikita on 3/30/18.
//

#ifndef CPPWRAPPER_SPRITE_H
#define CPPWRAPPER_SPRITE_H

#include "engine/EngineMain.h"
#include <memory>

class Sprite : public MeshObject {
public:
  explicit Sprite();
  MaterialSingleColor *materialColor() { return (MaterialSingleColor *)(_material.get()); }
};


#endif //CPPWRAPPER_SPRITE_H
