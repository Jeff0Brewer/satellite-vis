attribute vec4 aPosition;

uniform mat4 uProjMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

varying vec3 vNormal;

void main() {
    gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
    vNormal = aPosition.xyz;
}
