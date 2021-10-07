precision highp float;

varying vec2 vUv;
uniform sampler2D uFbo;
uniform float uTime;
uniform float uBeatArray[8];
uniform float uMaxDistance;
uniform float uMinDistance;

#define PI 3.14159265359

float remap(float value, float start1, float stop1, float start2, float stop2)
{
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

float cremap(float value, float start1, float stop1, float start2, float stop2) {
    float r = remap(value, start1, stop1, start2, stop2);
    return clamp(r, start2, stop2);
}
float exponentialOut(float t) {
  return t == 1.0 ? t : 1.0 - pow(2.0, -10.0 * t);
}


void main() {
  float prog = vUv.x;
  vec4 prevValues = texture2D(uFbo, vUv);
  
  

  // prevValues.y += 0.1;
  float moveProg = remap(prevValues.y, -uMinDistance, -uMaxDistance, 0., 1.);
  moveProg = fract(moveProg);
  
  prevValues.y = mix(-uMinDistance, -uMaxDistance, moveProg);

  float dist = 1.;
  for (int i = 0; i < 8; i++) {
    float editedTime = uTime - prog * 0.5;
    float diff = editedTime - uBeatArray[i];
    if (diff >= 0.)
    dist = min(cremap(diff, 0., 0.2, 0., 1.), dist);
  }
  prevValues.x += exponentialOut(1. - dist) * 0.2;

  gl_FragColor = vec4(prevValues.rgb, 0.);
}
