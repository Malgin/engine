[vertex]
#version {{ version }}

{{ uniforms_vs }}

in vec3 aPosition;
in vec2 aTexCoord0;
out vec2 vTexCoord0;

void main(void) {
  gl_PointSize = 5.0;

  vTexCoord0 = aTexCoord0;
  gl_Position = uPMatrix * uMVMatrix * vec4(aPosition, 1.0);
}

[fragment]
#version {{ version }}
{% if WEBGL %}precision highp float;{% endif %}
out vec4 fragmentColor;

in vec2 vTexCoord0;
uniform sampler2D uTexture0;
{% if COLOR %}uniform vec4 uColor;{% endif %}

void main(void) {
  {% if COLOR %}
  fragmentColor = uColor;
  {% else %}
  fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
  {% endif %}

  //vec4 texture0Color = texture(uTexture0, vTexCoord0);
  //fragmentColor = texture0Color;
}