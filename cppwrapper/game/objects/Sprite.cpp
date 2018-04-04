//
// Created by Sidorenko Nikita on 3/30/18.
//

#include "Sprite.h"


Material createMaterial() {
//  ShaderCapsSetPtr caps(new ShaderCapsSet());
//  auto engine = getEngine();
//
//  auto shader = _renderer->getShaderWithCaps(caps).get();
//  shader->addUniform(UniformName::ProjectionMatrix);
//  shader->addUniform(UniformName::ModelViewMatrix);
//  shader->addUniform(UniformName::Texture0);

}

Sprite::Sprite() : MeshObject() {
  GLushort indices[] = {0, 1, 2, 0, 2, 3};
  float vertices[] = {    -1.0f, -1.0f, 0.0f,
                          1.0f, -1.0f, 0.0f,
                          1.0f, 1.0f, 0.0f,
                          -1.0f,  1.0f, 0.0f };

  float texcoords[] = {   0, 0,
                          1.0f, 0,
                          1.0f, 1.0f,
                          0,  1.0f };

  _mesh = std::make_shared<Mesh>();
  _mesh->setVertices(vertices, 4);
  _mesh->setIndices(indices, 6);
  _mesh->setTexCoord0(texcoords, 4);
  _mesh->createBuffer();

  _material = std::make_shared<MaterialSingleColor>();
}
