[vertex]
#version {{ version }}
in vec3 aPosition;
in vec2 aTexCoord0;
out vec2 vTexCoord0;

struct Transform {
  mat4 model;
  mat4 normalMatrix;
};

layout (std140) uniform TransformBlock {
  Transform transform;
};

uniform mat4 uViewMatrix;
uniform mat4 uPMatrix;

struct Camera {
  vec3 position;
  uvec2 screenSize;
  mat4 viewMatrix;
  mat4 projectionMatrix;
};

layout (std140) uniform CameraBlock {
  Camera camera;
};

void main()
{
  vec4 position_cameraspace = camera.viewMatrix * transform.model * vec4(aPosition, 1.0);

  gl_Position = camera.projectionMatrix * position_cameraspace;
  vTexCoord0 = aTexCoord0;
}

[fragment]
#version {{ version }}

in vec2 vTexCoord0;
out vec4 fragmentColor;

uniform highp sampler2D uTexture0;
uniform vec2 uNearFar;

float LinearizeDepth(float depth)
{
  float z = depth * 2.0 - 1.0; // Back to NDC
  return (2.0 * uNearFar.x * uNearFar.y) / (uNearFar.y + uNearFar.x - z * (uNearFar.y - uNearFar.x)) / uNearFar.y;
}

void main()
{
  float depthValue = texture(uTexture0, vTexCoord0).r;

  //if (uNearFar.x > 0) {
    depthValue = LinearizeDepth(depthValue);
  //}

  fragmentColor = vec4(vec3(depthValue), 1.0);
}
