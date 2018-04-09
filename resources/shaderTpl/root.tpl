[vertex]
#version {{ version }}

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

{% if LIGHTING %}
//uniform mat4 uViewMatrix;
uniform mat3 uNormalMatrix;
//uniform vec3 uLightDir;
vec3 uLightDir = vec3(1, -1, -1);
in vec3 aNormal;

out vec3 vNormal_cameraspace;
out vec3 vLightDir_cameraspace;
//out vec3 vEyeDirection_cameraspace;
{% endif %}

in vec3 aPosition;
in vec2 aTexCoord0;
out vec2 vTexCoord0;

void main(void) {
  gl_PointSize = 5.0;

  vTexCoord0 = aTexCoord0;

{% if LIGHTING %}
  vec4 position_cameraspace = uMVMatrix * vec4(aPosition, 1.0);
  vNormal_cameraspace = normalize(uNormalMatrix * aNormal);
  vLightDir_cameraspace = normalize(uNormalMatrix * vec3(1.5, -2, -1));
  //vEyeDirection_cameraspace = vec3(0, 0, 0) - position_cameraspace.xyz; // vector to the camera
{% endif %}

  gl_Position = uPMatrix * uMVMatrix * vec4(aPosition, 1.0);
}

[fragment]
#version {{ version }}
{% if WEBGL %}precision highp float;{% endif %}
out vec4 fragmentColor;

in vec2 vTexCoord0;
uniform sampler2D uTexture0;
{% if COLOR %}uniform vec4 uColor;{% endif %}

{% if LIGHTING %}
in vec3 vNormal_cameraspace;
//in vec3 vEyeDirection_cameraspace;
in vec3 vLightDir_cameraspace;
vec4 ambient = vec4(0.1, 0.1, 0.1, 0.1);
{% endif %}

void main(void) {
  {% if COLOR %}
  fragmentColor = uColor;
  {% else %}
  fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
  {% endif %}

{% if LIGHTING %}
  vec3 uLightColor = vec3(1.0, 1.0, 1.0);

  vec3 normal_cameraspace = vNormal_cameraspace;
  //vec3 E = normalize(vEyeDirection_cameraspace);
  //vec3 reflect = reflect(vLightDir_cameraspace, normal_cameraspace);
  //float cosAlpha = clamp(dot(E, reflect), 0.0, 1.0);
  //vec3 specular = pow(cosAlpha, 8.0) * uLightColor;

  float lightValue = clamp(dot(-vLightDir_cameraspace, normal_cameraspace), 0.0, 1.0);
  fragmentColor = vec4(fragmentColor.xyz * lightValue, 1.0);
  fragmentColor += ambient;
{% endif %}

  //vec4 texture0Color = texture(uTexture0, vTexCoord0);
  //fragmentColor = texture0Color;
}