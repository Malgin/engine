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

struct Camera {
  vec3 position;
  uvec2 screenSize;
  mat4 viewMatrix;
  mat4 projectionMatrix;
};

layout (std140) uniform CameraBlock {
  Camera camera;
};

{% if LIGHTING %}
in vec3 aNormal;
out vec3 vNormal_worldspace;
{% endif %}

{% if SKINNING %}
in vec3 aJointWeights;
in vec3 aJointIndices;

struct SkinningMatrices {
  mat4 matrices[60];
};

layout (std140) uniform SkinningMatricesBlock {
  SkinningMatrices skinningMatrices;
};
{% endif %}

{% if NORMAL_MAP %}
in vec3 aTangent;
out vec3 vTangent_worldspace;
in vec3 aBitangent;
out vec3 vBitangent_worldspace;
{% endif %}

{% if VERTEX_COLOR %}{{ vertexColor("VERTEX_ATTRIBUTES_DECLARE") }}{% endif %}

in vec3 aPosition;
in vec2 aTexCoord0;
out vec2 vTexCoord0;
out vec4 vPosition_worldspace;

void main(void) {
  gl_PointSize = 5.0;

  vTexCoord0 = aTexCoord0;

{% if VERTEX_COLOR %}{{ vertexColor("VERTEX_MAIN") }}{% endif %}

  {% if SKINNING %}
  mat4 modelMatrix = mat4(0);
  for (int i = 0; i < 3; i++) {
    int jointIndex = int(aJointIndices[i]);
    float jointWeight = aJointWeights[i];
    modelMatrix += skinningMatrices.matrices[jointIndex] * jointWeight;
  }
  {% else %}
  mat4 modelMatrix = transform.model;
  {% endif %}

  vPosition_worldspace = modelMatrix * vec4(aPosition, 1.0);
  vec4 position_cameraspace = camera.viewMatrix * vPosition_worldspace;

{% if LIGHTING %}
  vNormal_worldspace = normalize(modelMatrix * vec4(aNormal, 0)).xyz;
{% endif %}
{% if NORMAL_MAP %}
  vTangent_worldspace = normalize(modelMatrix * vec4(aTangent, 0)).xyz;
  vBitangent_worldspace = normalize(modelMatrix * vec4(aBitangent, 0)).xyz;
{% endif %}

  gl_Position = camera.projectionMatrix * position_cameraspace;
}

[fragment]
#version {{ version }}
{% if WEBGL %}precision highp float; precision highp int;{% endif %}
out vec4 fragmentColor;

struct Camera {
  vec3 position;
  uvec2 screenSize;
  mat4 viewMatrix;
  mat4 projectionMatrix;
};

layout (std140) uniform CameraBlock {
  Camera camera;
};

{% if VERTEX_COLOR %}{{ vertexColor("FRAGMENT_ATTRIBUTES_DECLARE") }}{% endif %}
in vec2 vTexCoord0;
{% if TEXTURE0 %}
uniform highp sampler2D uTexture0;
{% endif %}

{% if COLOR %}uniform vec4 uColor;{% endif %}
in vec4 vPosition_worldspace;

{% if PROJECTED_TEXTURE %}{{ projectedTexture("FRAGMENT_UNIFORM_DECLARE") }}{% endif %}
{% if TERRAIN_LAYER0 %}{{ terrain("FRAGMENT_UNIFORM_DECLARE") }}{% endif %}

{% if LIGHTING %}
{{ lighting("FRAGMENT_UNIFORM_DECLARE") }}
{% endif %}

{% if NORMAL_MAP %}
in vec3 vTangent_worldspace;
in vec3 vBitangent_worldspace;
{% endif %}

void main(void) {
{% if COLOR %}
  fragmentColor = uColor;
{% else %}
  fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
{% endif %}

{% if VERTEX_COLOR %}{{ vertexColor("FRAGMENT_MAIN") }}{% endif %}
{% if TERRAIN_LAYER0 %}{{ terrain("FRAGMENT_MAIN") }}{% endif %}
{% if PROJECTED_TEXTURE %}{{ projectedTexture("FRAGMENT_MAIN") }}{% endif %}

{% if NORMAL_MAP %}
  mat3 TBN = mat3(
    vTangent_worldspace,
    vBitangent_worldspace,
    vNormal_worldspace
  );
  // normal_tangentspace should be defined BEFORE (fetch the normal map sampler)
  vec3 normal_worldspace = normalize(TBN * normal_tangentspace);
{% else %}
{% if LIGHTING %}  vec3 normal_worldspace = normalize(vNormal_worldspace);{% endif %}
{% endif %}

{% if LIGHTING %}
  //fragmentColor = vec4((normal_worldspace + 0.5) / 2.0, 1);
{{ lighting("FRAGMENT_MAIN") }}
{% endif %}

{% if TEXTURE0 %}
  vec4 texture0Color = texture(uTexture0, vTexCoord0);
  fragmentColor *= texture0Color;
{% endif %}

// Gamma correction
  float gamma = 2.2;
  fragmentColor.rgb = pow(fragmentColor.rgb, vec3(1.0/gamma));
}
