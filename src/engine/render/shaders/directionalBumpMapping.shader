[vertex]

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aTangent;
attribute vec3 aBitangent;
attribute vec2 aTexCoord0;

uniform mat4 uMVMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uLightDir;

varying vec3 vNormal_cameraspace;
varying vec3 vTangent_cameraspace;
varying vec3 vBitangent_cameraspace;
varying vec3 vLightDir_cameraspace;
varying vec3 vEyeDirection_cameraspace;
varying vec2 vTexCoord0;

void main(void) {
  vec4 position_cameraspace = uMVMatrix * vec4(aPosition, 1.0);

  vNormal_cameraspace = normalize(vec3(uNormalMatrix * vec4(aNormal, 0.0)));
  vTangent_cameraspace = normalize(vec3(uNormalMatrix * vec4(aTangent, 0.0)));
  vBitangent_cameraspace = normalize(vec3(uNormalMatrix * vec4(aBitangent, 0.0)));

  vLightDir_cameraspace = normalize(vec3(uViewMatrix * vec4(uLightDir, 0.0)));
  vEyeDirection_cameraspace = vec3(0, 0, 0) - position_cameraspace.xyz; // vector to the camera

  vTexCoord0 = aTexCoord0;
  gl_Position = uPMatrix * position_cameraspace;
}

[fragment]

precision highp float;

uniform mat4 uNormalMatrix;

uniform sampler2D uTexture0;
uniform sampler2D uNormalMap;
uniform vec3 uLightDir;

varying vec3 vNormal_cameraspace;
varying vec3 vTangent_cameraspace;
varying vec3 vBitangent_cameraspace;

varying vec3 vEyeDirection_cameraspace;
varying vec3 vLightDir_cameraspace;
varying vec2 vTexCoord0;

void main(void) {

  // Hard coded light
  vec3 uLightColor = vec3(1.0, 1.0, 1.0);
  vec4 ambient = vec4(0.1, 0.1, 0.1, 0.1);

  // Textures
  vec4 texture0 = texture2D(uTexture0, vec2(vTexCoord0.s, vTexCoord0.t));
  vec4 normalMap = texture2D(uNormalMap, vec2(vTexCoord0.s, vTexCoord0.t));

  // Normal
  mat3 TBN = mat3(
    vTangent_cameraspace,
    vBitangent_cameraspace,
    vNormal_cameraspace
  );

  vec3 normal_tangentspace = normalMap.rgb * 2.0 - 1.0;
  vec3 normal_cameraspace = TBN * normal_tangentspace;

  vec3 E = normalize(vEyeDirection_cameraspace);
  vec3 reflect = reflect(vLightDir_cameraspace, normal_cameraspace);
  float cosAlpha = clamp(dot(E, reflect), 0.0, 1.0);
  vec3 specular = pow(cosAlpha, 8.0) * uLightColor;

  float lightValue = clamp(dot(-vLightDir_cameraspace, normal_cameraspace), 0.0, 1.0);

  gl_FragColor = (ambient + vec4(uLightColor * lightValue, 1.0)) * texture0 + vec4(specular, 1.0);
}
