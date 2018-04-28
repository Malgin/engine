[vertex]
#version {{ version }}

struct Transform {
  mat4 model;
  mat4 normalMatrix;
};

layout (std140) uniform TransformBlock {
  Transform transform;
};

uniform mat4 uViewMatrix;
uniform mat4 uPMatrix;

{% if LIGHTING %}
//uniform mat4 uViewMatrix;
uniform mat3 uNormalMatrix;
//uniform vec3 uLightDir;
vec3 uLightDir = vec3(1, -1, -1);
in vec3 aNormal;

out vec3 vNormal_worldspace;
//out vec3 vEyeDirection_cameraspace;
{% endif %}

in vec3 aPosition;
in vec2 aTexCoord0;
out vec2 vTexCoord0;
out vec4 vPosition_worldspace;

void main(void) {
  gl_PointSize = 5.0;

  vTexCoord0 = aTexCoord0;

  vPosition_worldspace = transform.model * vec4(aPosition, 1.0);
  vec4 position_cameraspace = uViewMatrix * vPosition_worldspace;

{% if LIGHTING %}
  vNormal_worldspace = normalize(transform.model * vec4(aNormal, 0)).xyz;
  //vEyeDirection_cameraspace = vec3(0, 0, 0) - position_cameraspace.xyz; // vector to the camera
{% endif %}

  gl_Position = uPMatrix * position_cameraspace;
}

[fragment]
#version {{ version }}
{% if WEBGL %}precision highp float;{% endif %}
out vec4 fragmentColor;

in vec2 vTexCoord0;
uniform sampler2D uTexture0;
{% if COLOR %}uniform vec4 uColor;{% endif %}

in vec4 vPosition_worldspace;

{% if LIGHTING %}

uniform usamplerBuffer uLightGrid;
uniform usamplerBuffer uLightIndices;

struct Light {
  vec3 position;
  float attenuation;
  vec3 color;
};

layout (std140) uniform LightBlock {
  Light lights[100];
};

struct Camera {
  vec3 position;
  uvec2 screenSize;
};

layout (std140) uniform CameraBlock {
  Camera camera;
};

const int TILE_SIZE = 32;
vec2 screenSize = vec2(camera.screenSize);
ivec2 tilesCount = ivec2(ceil(screenSize / TILE_SIZE));

in vec3 vNormal_worldspace;
//in vec3 vEyeDirection_cameraspace;
vec4 ambient = vec4(0.1, 0.1, 0.1, 0.1) * 0.0;

vec3 calculateFragmentDiffuse(float distanceToLight, float attenuation, vec3 normal, vec3 lightDir, vec3 eyeDir, vec3 lightColor) {
  float lightValue = clamp(dot(-lightDir, normal), 0.0, 1.0);
  float attenuationValue = 1.0 / (1.0 + attenuation * pow(distanceToLight, 2));
  vec3 diffuse = lightColor * lightValue;

  //vec3 E = normalize(vEyeDirection_cameraspace);
  //vec3 reflect = reflect(vLightDir_cameraspace, normal_cameraspace);
  //float cosAlpha = clamp(dot(E, reflect), 0.0, 1.0);
  //vec3 specular = pow(cosAlpha, 8.0) * uLightColor;

  vec3 reflect = reflect(lightDir, normal);
  float cosAlpha = clamp(dot(eyeDir, reflect), 0.0, 1.0);
  vec3 specular = pow(cosAlpha, 8.0) * lightColor;

  return attenuationValue * (diffuse + specular);
}
{% endif %}

void main(void) {
  {% if COLOR %}
  fragmentColor = uColor;
  {% else %}
  fragmentColor = vec4(0.0, 0.0, 0.0, 1.0);
  {% endif %}

{% if LIGHTING %}
  vec3 uLightColor = vec3(1.0, 1.0, 1.0);

  vec3 normal_worldspace = normalize(vNormal_worldspace);

  int tileX = int(gl_FragCoord.x / TILE_SIZE);
  int tileY = int(gl_FragCoord.y / TILE_SIZE);
  int tileIndex = tileX + tilesCount.x * tileY;

  uvec4 gridItem = texelFetch(uLightGrid, tileIndex);
  uint lightOffset = gridItem.r;
  uint lightCount = gridItem.g;
  vec3 eyeDir_worldspace = normalize(camera.position - vPosition_worldspace.xyz); // vector to camera

  for (uint i = 0u; i < lightCount; i++) {
    uint lightIndex = texelFetch(uLightIndices, int(lightOffset + i)).r;
    vec3 lightPosition = lights[lightIndex].position;
    vec3 lightDir = vPosition_worldspace.xyz - lightPosition;
    float distanceToLight = length(lightDir);
    lightDir /= distanceToLight; // normalize
    vec3 lightValue = calculateFragmentDiffuse(distanceToLight, lights[lightIndex].attenuation, normal_worldspace, lightDir, eyeDir_worldspace, lights[lightIndex].color);
    fragmentColor += vec4(lightValue, 1.0);
  }

  fragmentColor += ambient;
{% endif %}

  //vec4 texture0Color = texture(uTexture0, vTexCoord0);
  //fragmentColor = texture0Color;
}