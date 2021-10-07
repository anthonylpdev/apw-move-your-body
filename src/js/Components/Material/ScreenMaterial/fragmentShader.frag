precision highp float;

varying vec2 vUv;

uniform sampler2D uMap;
uniform float uRatio;

void main() {
  vec2 uv = vUv;
  uv.y *= uRatio;

  vec3 color = texture2D(uMap, vUv).rgb;
  uv = fract(uv * 100.);

  float d = length(uv - 0.5);
  d = smoothstep(0.46, 0.41, d);
  gl_FragColor = vec4(color * d * 2., 1.);
  // gl_FragColor = vec4(uColor, decay);
  // gl_FragColor = vec4(vec3(vUv, 0.),1.);
}
