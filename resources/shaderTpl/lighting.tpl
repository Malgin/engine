{% if MODE == "FRAGMENT_MAIN" %}
{% if not SPECULAR_MAP %}
  float materialSpecular = 1.0;
{% endif %}

  float TILE_SIZE = 32.0;
  vec2 screenSize = vec2(camera.screenSize);
  ivec2 tilesCount = ivec2(ceil(screenSize / TILE_SIZE));

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
  uint pointLightCount = gridItem.g & 0x000fffu;
  uint spotLightCount = gridItem.g >> 16;
  vec3 eyeDir_worldspace = normalize(camera.position - vPosition_worldspace.xyz); // vector to camera
  vec4 lightsColor = vec4(0, 0, 0, 1);

  // Point light
  for (uint i = 0u; i < pointLightCount; i++) {
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
    vec3 lightValue = calculateFragmentDiffuse(distanceToLight, lights[lightIndex].attenuation, normal_worldspace, lightDir, eyeDir_worldspace, lights[lightIndex].color, materialSpecular);
    lightsColor += vec4(lightValue, 0.0);
  }

  // Spot lights
  for (uint i = 0u; i < spotLightCount; i++) {
    uint currentOffset = lightOffset + i + pointLightCount;
{% if USE_BUFFER_TEXTURE %}
    uint lightIndex = texelFetch(uLightIndices, int(currentOffset)).r;
{% else %}
    uint lightIndex = texelFetch(uLightIndices, ivec2(currentOffset % 4096u, int(floor(float(currentOffset) / 4096.0))), 0).r;
{% endif %}
    vec3 lightPosition = lights[lightIndex].position;
    vec3 coneDirection = lights[lightIndex].direction;
    float coneAngle = lights[lightIndex].coneAngle;

    vec3 lightDir = vPosition_worldspace.xyz - lightPosition;
    float distanceToLight = length(lightDir);
    lightDir /= distanceToLight; // normalize
    float lightToSurfaceAngle = acos(dot(lightDir, coneDirection));
    if (lightToSurfaceAngle < coneAngle){
      vec3 lightValue = calculateFragmentDiffuse(distanceToLight, lights[lightIndex].attenuation, normal_worldspace, lightDir, eyeDir_worldspace, lights[lightIndex].color, materialSpecular);
      lightsColor += vec4(lightValue, 0.0);
    }
  }

  lightsColor += ambient;
  fragmentColor *= lightsColor + ambient;
{% endif %}

{% if MODE == "FRAGMENT_UNIFORM_DECLARE" %}
// Uniform ////////////////
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
  vec3 direction;
  float coneAngle;
};

layout (std140) uniform LightBlock {
  Light lights[100];
};

in vec3 vNormal_worldspace;
vec4 ambient = vec4(0.1, 0.1, 0.1, 0.0) * 0.3;

vec3 calculateFragmentDiffuse(float distanceToLight, float attenuation, vec3 normal, vec3 lightDir, vec3 eyeDir, vec3 lightColor, float materialSpecular) {
  float lightValue = clamp(dot(-lightDir, normal), 0.0, 1.0);
  float attenuationValue = 1.0 / (1.0 + attenuation * pow(distanceToLight, 2.0));
  vec3 diffuse = lightColor * lightValue;

  vec3 reflect = reflect(lightDir, normal);
  float cosAlpha = clamp(dot(eyeDir, reflect), 0.0, 1.0);
  vec3 specular = pow(cosAlpha, 32.0) * lightColor * materialSpecular;

  return attenuationValue * (diffuse + specular);
}
{% endif %}