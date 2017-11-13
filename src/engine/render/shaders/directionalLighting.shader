[vertex]

attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNormalMatrix;

varying vec3 vNormal;

void main(void) {
  gl_Position = uPMatrix * uMVMatrix * vec4(aPosition, 1.0);
  vNormal = normalize(vec3(uNormalMatrix * vec4(aNormal, 1.0)));
}

[fragment]

precision highp float;

uniform vec3 uLightDir;
varying vec3 vNormal;

void main(void) {
  vec3 lightDir = normalize(uLightDir);
  vec3 uLightColor = vec3(1.0, 1.0, 1.0);
  vec3 ambient = vec3(0.2, 0.2, 0.2);

  float lightValue = max(dot(-lightDir, vNormal), 0.0);

  gl_FragColor = vec4(uLightColor * lightValue + ambient, 1.0);
}