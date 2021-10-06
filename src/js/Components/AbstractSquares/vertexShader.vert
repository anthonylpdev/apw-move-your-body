attribute vec3 normal;
attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute float aIndex;

uniform float uMaxDistance;
uniform float uMinDistance;
uniform float uSquareAmounts;
uniform float uTime;

varying vec2 vUv;
varying float vProg;
varying float vFogDepth;

#define PI 3.14159265359

mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}


void main() {
  float progress = aIndex / uSquareAmounts;
  vec4 transformed = vec4( position, 1.0 );
  float moveProg = fract(progress - uTime * 0.08);
  transformed.z = mix(uMinDistance, -uMaxDistance, moveProg);

  mat4 rotation = rotationMatrix(vec3(0., 0., -1.), progress * PI * 10.);
  transformed *= rotation;
  vec4 mvPosition = modelViewMatrix * transformed;
  gl_Position = projectionMatrix * mvPosition;

  vFogDepth = - mvPosition.z;
  vUv = uv;
  vProg = progress;
}
