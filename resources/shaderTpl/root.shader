[vertex]
#version {{ version }}

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

in vec3 aPosition;

void main(void) {
  gl_PointSize = 5.0;
  gl_Position = uPMatrix * uMVMatrix * vec4(aPosition, 1.0);
}

[fragment]
#version {{ version }}
{% if WEBGL %}precision highp float;{% endif %}
out vec4 fragmentColor;

void main(void) {
  fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
}