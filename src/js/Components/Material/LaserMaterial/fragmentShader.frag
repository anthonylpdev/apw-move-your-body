precision highp float;

varying vec2 vUv;

uniform float uDecay;
uniform float uBlur;
uniform vec3 uColor;

float quarticOut(float t) {
  return pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;
}

float remap(float value, float start1, float stop1, float start2, float stop2)
{
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

float cremap(float value, float start1, float stop1, float start2, float stop2) {
    float r = remap(value, start1, stop1, start2, stop2);
    return clamp(r, min(start2, stop2), max(start2, stop2));
}

void main() {
  float y = quarticOut(vUv.y);
  float blur = cremap(vUv.y, 0., 1., 0.01, (1. - uBlur) / 4.);
  float decay = cremap(vUv.y, 0., 1., 1., 1. - uDecay);

  float a = abs(vUv.x - 0.5);
  a = smoothstep(0.25 + blur, 0.25 - blur, a);
  gl_FragColor = vec4(uColor, a * decay);
  // gl_FragColor = vec4(uColor, decay);
  // gl_FragColor = vec4(vec3(vUv, 0.),1.);
}
