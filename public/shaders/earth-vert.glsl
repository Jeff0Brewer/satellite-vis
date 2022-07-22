attribute vec3 aPosition;

uniform mat4 uProjMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

varying vec3 vNormal;

void main() {
    gl_Position = uProjMatrix * uViewMatrix * uModelMatrix *  vec4(aPosition, 1.0);
    vNormal = aPosition;
}
