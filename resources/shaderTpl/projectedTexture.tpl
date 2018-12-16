{% if MODE == "FRAGMENT_UNIFORM_DECLARE" %}
uniform highp sampler2D uProjectedTexture;
uniform mat4 uProjectedTextureMatrix;
{% endif %}

{% if MODE == "FRAGMENT_MAIN" %}
vec4 projectedTextureUV = uProjectedTextureMatrix * vPosition_worldspace;
projectedTextureUV /= projectedTextureUV.w;
projectedTextureUV = (projectedTextureUV + 1.0) / 2.0;
if (projectedTextureUV.x >= 0.0 && projectedTextureUV.x < 1.0
    && projectedTextureUV.y >= 0.0 && projectedTextureUV.y < 1.0
    && projectedTextureUV.z >= 0.0 && projectedTextureUV.z < 1.0) {
  vec4 projectedTexture = texture(uProjectedTexture, projectedTextureUV.xy);
  fragmentColor *= projectedTexture;
}
{% endif %}