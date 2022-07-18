attribute vec3 aPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform float uYear;
uniform float uDay;
uniform float uSecond;

varying vec3 vNormal;

void main() {
    gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
    vNormal = aPosition;
}
