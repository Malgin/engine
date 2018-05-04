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
{% if WEBGL %}precision highp float; precision highp int;{% endif %}
out vec4 fragmentColor;

in vec2 vTexCoord0;
uniform highp sampler2D uTexture0;
{% if COLOR %}uniform vec4 uColor;{% endif %}

in vec4 vPosition_worldspace;

{% if LIGHTING %}

{% if USE_BUFFER_TEXTURE %}
uniform usamplerBuffer uLightGrid;
uniform usamplerBuffer uLightIndices;
{% else %}
uniform highp usampler2D uLightGrid;
uniform highp usampler2D uLightIndices;
{% endif %}

struct Light {
  vec3 position;
  float attenuation;
  vec3 color;
};

layout (std140) uniform LightBlock {
  Light lights[1000];
};


struct Camera {
  vec3 position;
  uvec2 screenSize;
};


layout (std140) uniform CameraBlock {
  Camera camera;
};

in vec3 vNormal_worldspace;
//in vec3 vEyeDirection_cameraspace;
vec4 ambient = vec4(0.1, 0.1, 0.1, 0.0) * 0.0;

vec3 calculateFragmentDiffuse(float distanceToLight, float attenuation, vec3 normal, vec3 lightDir, vec3 eyeDir, vec3 lightColor) {
  float lightValue = clamp(dot(-lightDir, normal), 0.0, 1.0);
  float attenuationValue = 1.0 / (1.0 + attenuation * pow(distanceToLight, 2.0));
  vec3 diffuse = lightColor * lightValue;

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

  float TILE_SIZE = 32.0;
  vec2 screenSize = vec2(camera.screenSize);
  ivec2 tilesCount = ivec2(ceil(screenSize / TILE_SIZE));

  vec3 normal_worldspace = normalize(vNormal_worldspace);

  int tileX = int(floor(gl_FragCoord.x / TILE_SIZE));
  int tileY = int(floor(gl_FragCoord.y / TILE_SIZE));
  vec2 tileCount = ceil(vec2(screenSize / TILE_SIZE));

{% if USE_BUFFER_TEXTURE %}
  int tileIndex = tileX + tilesCount.x * tileY;
  uvec4 gridItem = texelFetch(uLightGrid, tileIndex);
{% else %}
  uvec4 gridItem = texture(uLightGrid, vec2(float(tileX) / tileCount.x, float(tileY) / tileCount.y));
{% endif %}

  uint lightOffset = gridItem.r;
  uint lightCount = gridItem.g;
  vec3 eyeDir_worldspace = normalize(camera.position - vPosition_worldspace.xyz); // vector to camera

  for (uint i = 0u; i < lightCount; i++) {
    uint currentOffset = lightOffset + i;
{% if USE_BUFFER_TEXTURE %}
    uint lightIndex = texelFetch(uLightIndices, int(currentOffset)).r;
{% else %}
    uint lightIndex = texelFetch(uLightIndices, ivec2(currentOffset % 4096u, int(floor(float(currentOffset) / 4096.0))), 0).r;
{% endif %}
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