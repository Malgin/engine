{% if MODE == "VERTEX_ATTRIBUTES_DECLARE" %}
in vec4 aVertexColor;
out vec4 vVertexColor;
{% endif %}

{% if MODE == "VERTEX_MAIN" %}
  vVertexColor = aVertexColor;
{% if POINT_SIZE %}  gl_PointSize = aVertexColor.a;{% endif %}
{% endif %}

{% if MODE == "FRAGMENT_ATTRIBUTES_DECLARE" %}
in vec4 vVertexColor;
{% endif %}

{% if MODE == "FRAGMENT_MAIN" %}
  fragmentColor *= vVertexColor;
{% endif %}