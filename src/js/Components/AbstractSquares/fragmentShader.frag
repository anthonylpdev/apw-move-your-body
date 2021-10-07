precision highp float;

uniform sampler2D uGradient;
uniform float uFogDensity;
uniform vec3 uFogColor;

varying float vProg;
varying vec2 vUv;
varying float vFogDepth;


vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  // gl_FragColor = vec4(vNormal, 1.);
    vec2 uv = abs(0.5 - vUv);
    float v = max(step(0.45, uv.x), step(0.45, uv.y));
  // gl_FragColor = vec4(vec3(vUv, 1.), 1.);
  // gl_FragColor = vec4(hsv2rgb(vec3(vProg, 1., 1.) * v), 1.);
  vec2 gradientUv =  vec2(fract(vProg * 3.), 0.);

  gl_FragColor = vec4(texture2D(uGradient, gradientUv).rgb * v, 1.);
  float fogFactor = 1.0 - exp( - uFogDensity * uFogDensity * vFogDepth * vFogDepth );
  gl_FragColor.rgb = mix( gl_FragColor.rgb, uFogColor, fogFactor );
  // gl_FragColor = vec4(vec3(step(vProg, 0.1)), 1.);
}