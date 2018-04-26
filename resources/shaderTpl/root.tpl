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

const int TILE_SIZE = 32;
const vec2 screenSize = vec2(1280, 960);
const ivec2 tilesCount = ivec2(ceil(screenSize / TILE_SIZE));

uniform samplerBuffer uLightGrid;
uniform samplerBuffer uLightIndices;

struct Light {
  vec3 position;
  float attenuation;
  vec3 color;
};

layout (std140) uniform LightBlock {
  Light lights[100];
};

in vec3 vNormal_worldspace;
//in vec3 vEyeDirection_cameraspace;
vec4 ambient = vec4(0.1, 0.1, 0.1, 0.1);

vec3 calculateFragmentDiffuse(float distanceToLight, float attenuation, vec3 normal, vec3 lightDir, vec3 lightColor) {
  float lightValue = clamp(dot(-lightDir, normal), 0.0, 1.0);
  return lightColor * lightValue;
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
  //vec3 E = normalize(vEyeDirection_cameraspace);
  //vec3 reflect = reflect(vLightDir_cameraspace, normal_cameraspace);
  //float cosAlpha = clamp(dot(E, reflect), 0.0, 1.0);
  //vec3 specular = pow(cosAlpha, 8.0) * uLightColor;

  int tileX = int(gl_FragCoord.x / TILE_SIZE);
  int tileY = int(gl_FragCoord.y / TILE_SIZE);
  int tileIndex = tileX + tilesCount.x * tileY;

  //fragmentColor = texelFetch(uLightGrid, tileIndex);
  ivec2 gridItem = ivec2(texelFetch(uLightGrid, 0));
  int lightCount = gridItem.r;
  if (gridItem.r > 0) {
    fragmentColor = vec4(1,1,1,1);
  }
  //fragmentColor = (tileX + tileY) % 2 == 0 ? vec4(0.5 * lightCount, 0, 0, 1) : vec4(0, 0.5 * lightCount, 0, 1);
  //fragmentColor = (tileX + tileY) % 2 == 0 ? vec4(1, 0, 0, 1) : vec4(0, 1, 0, 1);
  /*

  vec3 lightPosition = lights[0].position;
  //vec3 lightPosition = vec3(0, 10, 0);
  vec3 lightDir = normalize(vPosition_worldspace.xyz - lightPosition);
  vec3 lightValue = calculateFragmentDiffuse(0.0, 0.0, lightDir, normal_worldspace, uLightColor);
  fragmentColor = vec4(lightValue, 1.0); */
  fragmentColor += ambient;
{% endif %}

  //vec4 texture0Color = texture(uTexture0, vTexCoord0);
  //fragmentColor = texture0Color;
}