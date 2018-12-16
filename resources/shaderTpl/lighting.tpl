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
  uint projectorCount = gridItem.b & 0x000fffu;
  uint decalCount = gridItem.b >> 16;
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
    float linearAttenuation = lights[lightIndex].linearAttenuation;
    float squareAttenuation = lights[lightIndex].squareAttenuation;
    vec3 lightValue = calculateFragmentDiffuse(distanceToLight, linearAttenuation, squareAttenuation, normal_worldspace, lightDir, eyeDir_worldspace, lights[lightIndex].color, materialSpecular);

    vec3 coneDirection = lights[lightIndex].direction;
    float coneAngle = lights[lightIndex].coneAngle;
    float lightToSurfaceAngle = dot(lightDir, coneDirection);
    float innerLightToSurfaceAngle = lightToSurfaceAngle * 1.03;
    float epsilon = innerLightToSurfaceAngle - lightToSurfaceAngle;

    if (lightToSurfaceAngle > coneAngle && lights[lightIndex].shadowmapScale.x > 0) {
      vec4 position_lightspace = lights[lightIndex].projectionMatrix * vPosition_worldspace;
      vec4 position_lightspace_normalized = position_lightspace / position_lightspace.w;
      position_lightspace_normalized = (position_lightspace_normalized + 1.0) / 2.0;
      vec2 shadowmapUV = position_lightspace_normalized.xy * lights[lightIndex].shadowmapScale + lights[lightIndex].shadowmapOffset;
      float shadow = calculateFragmentShadow(shadowmapUV, position_lightspace_normalized.z);
      lightValue *= 1.0 - shadow;
    }

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
    float linearAttenuation = lights[lightIndex].linearAttenuation;
    float squareAttenuation = lights[lightIndex].squareAttenuation;

    vec3 lightDir = vPosition_worldspace.xyz - lightPosition;
    float distanceToLight = length(lightDir);
    lightDir /= distanceToLight; // normalize
    float lightToSurfaceAngle = dot(lightDir, coneDirection);
    float innerLightToSurfaceAngle = lightToSurfaceAngle * 1.03;
    float epsilon = innerLightToSurfaceAngle - lightToSurfaceAngle;

    if (lightToSurfaceAngle > coneAngle) {
      vec3 lightValue = calculateFragmentDiffuse(distanceToLight, linearAttenuation, squareAttenuation, normal_worldspace, lightDir, eyeDir_worldspace, lights[lightIndex].color, materialSpecular);
      float intensity = clamp((lightToSurfaceAngle - coneAngle) / epsilon, 0.0, 1.0);

      if (lights[lightIndex].shadowmapScale.x > 0) {
        vec4 position_lightspace = lights[lightIndex].projectionMatrix * vPosition_worldspace;
        vec4 position_lightspace_normalized = position_lightspace / position_lightspace.w;
        position_lightspace_normalized = (position_lightspace_normalized + 1.0) / 2.0;
        vec2 shadowmapUV = position_lightspace_normalized.xy * lights[lightIndex].shadowmapScale + lights[lightIndex].shadowmapOffset;
        float shadow = calculateFragmentShadow(shadowmapUV, position_lightspace_normalized.z);
        lightValue *= 1.0 - shadow;
      }

      lightsColor += vec4(lightValue * intensity, 0.0);
    }
  }

  // Projectors
  for (uint i = 0u; i < projectorCount; i++) {
    uint currentOffset = lightOffset + i + pointLightCount + spotLightCount;
    {% if USE_BUFFER_TEXTURE %}
        uint projectorIndex = texelFetch(uLightIndices, int(currentOffset)).r;
    {% else %}
        uint projectorIndex = texelFetch(uLightIndices, ivec2(currentOffset % 4096u, int(floor(float(currentOffset) / 4096.0))), 0).r;
    {% endif %}

    vec4 projectedTextureUV = projectors[projectorIndex].projectionMatrix * vPosition_worldspace;
    projectedTextureUV /= projectedTextureUV.w;
    projectedTextureUV = (projectedTextureUV + 1.0) / 2.0;
    if (projectedTextureUV.x >= 0.0 && projectedTextureUV.x < 1.0
        && projectedTextureUV.y >= 0.0 && projectedTextureUV.y < 1.0
        && projectedTextureUV.z >= 0.0 && projectedTextureUV.z < 1.0) {
      vec2 spritesheetUV = projectedTextureUV.xy * projectors[projectorIndex].scale + projectors[projectorIndex].offset;
      vec4 projectedTexture = texture(uProjectorTexture, spritesheetUV) * projectors[projectorIndex].color;

      vec3 lightPosition = projectors[projectorIndex].position;
      float linearAttenuation = projectors[projectorIndex].linearAttenuation;
      float squareAttenuation = projectors[projectorIndex].squareAttenuation;

      vec3 lightDir = vPosition_worldspace.xyz - lightPosition;
      float distanceToLight = length(lightDir);
      lightDir /= distanceToLight; // normalize
      vec3 lightColor = projectedTexture.rgb * projectedTexture.a;
      vec3 lightValue = calculateFragmentDiffuse(distanceToLight, linearAttenuation, squareAttenuation, normal_worldspace, lightDir, eyeDir_worldspace, lightColor, materialSpecular);

      if (projectors[projectorIndex].shadowmapScale.x > 0) {
        vec2 shadowmapUV = projectedTextureUV.xy * projectors[projectorIndex].shadowmapScale + projectors[projectorIndex].shadowmapOffset;
        float shadow = calculateFragmentShadow(shadowmapUV, projectedTextureUV.z);
        lightValue *= 1.0 - shadow;
      }

      lightsColor += vec4(lightValue, 0.0);
    }
  }

  // Decals
  for (uint i = 0u; i < decalCount; i++) {
    uint currentOffset = lightOffset + i + pointLightCount + spotLightCount + projectorCount;
    {% if USE_BUFFER_TEXTURE %}
        uint projectorIndex = texelFetch(uLightIndices, int(currentOffset)).r;
    {% else %}
        uint projectorIndex = texelFetch(uLightIndices, ivec2(currentOffset % 4096u, int(floor(float(currentOffset) / 4096.0))), 0).r;
    {% endif %}

    vec4 projectedTextureUV = projectors[projectorIndex].projectionMatrix * vPosition_worldspace;
    projectedTextureUV /= projectedTextureUV.w;
    projectedTextureUV = (projectedTextureUV + 1.0) / 2.0;
    if (projectedTextureUV.x >= 0.0 && projectedTextureUV.x < 1.0
        && projectedTextureUV.y >= 0.0 && projectedTextureUV.y < 1.0
        && projectedTextureUV.z >= 0.0 && projectedTextureUV.z < 1.0) {
      vec2 spritesheetUV = projectedTextureUV.xy * projectors[projectorIndex].scale + projectors[projectorIndex].offset;
      vec4 projectedTexture = texture(uProjectorTexture, spritesheetUV) * projectors[projectorIndex].color;
      fragmentColor = vec4(mix(fragmentColor.rgb, projectedTexture.rgb, projectedTexture.a), fragmentColor.a);
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

uniform highp sampler2D uProjectorTexture;
uniform highp sampler2D uShadowMap;

struct Light {
  vec3 position;
  float squareAttenuation;
  vec3 color;
  float linearAttenuation;
  vec3 direction;
  float coneAngle;
  mat4 projectionMatrix;
  vec2 shadowmapScale;
  vec2 shadowmapOffset;
};

layout (std140) uniform LightBlock {
  Light lights[100];
};

struct Projector {
  vec3 position;
  float squareAttenuation;
  vec4 color;
  vec2 scale;
  vec2 offset;
  vec2 shadowmapScale;
  vec2 shadowmapOffset;
  mat4 projectionMatrix;
  float linearAttenuation;
};

layout (std140) uniform ProjectorBlock {
  Projector projectors[100];
};

in vec3 vNormal_worldspace;
vec4 ambient = vec4(0.1, 0.1, 0.1, 0.0) * 0.0;

float LinearizeDepth(float depth) {
  vec2 uNearFar = vec2(0.05, 40.0);
  float z = depth * 2.0 - 1.0; // Back to NDC
  return (2.0 * uNearFar.x * uNearFar.y) / (uNearFar.y + uNearFar.x - z * (uNearFar.y - uNearFar.x)) / uNearFar.y;
}

float calculateFragmentShadow(vec2 uv, float fragmentDepth) {
  float shadow = 0.0;
  vec2 texelSize = 1.0 / textureSize(uShadowMap, 0);
  for(int x = -1; x <= 1; x++) {
    for(int y = -1; y <= 1; y++) {
      float closestDepth = texture(uShadowMap, uv + vec2(x, y) * texelSize).r;
      shadow += fragmentDepth > closestDepth ? 1.0 : 0.0;
    }
  }

  shadow /= 9.0;
  return shadow;
}

vec3 calculateFragmentDiffuse(float distanceToLight, float linearAttenuation, float squareAttenuation, vec3 normal, vec3 lightDir, vec3 eyeDir, vec3 lightColor, float materialSpecular) {
  float lightValue = clamp(dot(-lightDir, normal), 0.0, 1.0);
  float attenuationValue = 1.0 / (1.0 + linearAttenuation * distanceToLight + squareAttenuation * distanceToLight * distanceToLight);
  vec3 diffuse = lightColor * lightValue;

  // TODO: conditionnaly skip specular
  vec3 reflect = reflect(lightDir, normal);
  float cosAlpha = clamp(dot(eyeDir, reflect), 0.0, 1.0);
  vec3 specular = pow(cosAlpha, 32.0) * lightColor * materialSpecular;

  return attenuationValue * (diffuse + specular);
}
{% endif %}