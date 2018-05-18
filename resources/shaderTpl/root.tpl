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
{% endif %}

{% if NORMAL_MAP %}
in vec3 aTangent;
out vec3 vTangent_worldspace;
in vec3 aBitangent;
out vec3 vBitangent_worldspace;
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
{% endif %}
{% if NORMAL_MAP %}
  vTangent_worldspace = normalize(transform.model * vec4(aTangent, 0)).xyz;
  vBitangent_worldspace = normalize(transform.model * vec4(aBitangent, 0)).xyz;
{% endif %}

  gl_Position = uPMatrix * position_cameraspace;
}

[fragment]
#version {{ version }}
{% if WEBGL %}precision highp float; precision highp int;{% endif %}
out vec4 fragmentColor;

in vec2 vTexCoord0;
{% if TEXTURE0 %}
uniform highp sampler2D uTexture0;
{% endif %}

{% if COLOR %}uniform vec4 uColor;{% endif %}
in vec4 vPosition_worldspace;

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

{% if TERRAIN_LAYER0 %}{{ terrain("FRAGMENT_MAIN") }}{% endif %}

{% if NORMAL_MAP %}
  mat3 TBN = mat3(
    vTangent_worldspace,
    vBitangent_worldspace,
    vNormal_worldspace
  );
  // normal_tangentspace should be defined BEFORE (fetch the normal map sampler)
  vec3 normal_worldspace = normalize(transpose(TBN) * normal_tangentspace);
{% else %}
{% if LIGHTING %}  vec3 normal_worldspace = normalize(vNormal_worldspace);{% endif %}
{% endif %}

{% if LIGHTING %}
{{ lighting("FRAGMENT_MAIN") }}
{% endif %}

{% if TEXTURE0 %}
  vec4 texture0Color = texture(uTexture0, vTexCoord0);
  fragmentColor *= texture0Color;
{% endif %}

}