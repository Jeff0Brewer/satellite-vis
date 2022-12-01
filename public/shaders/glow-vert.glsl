attribute vec4 aPosition;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform float uScreenHeight;

void main() {
    gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
    gl_PointSize = 2.0 * uScreenHeight / gl_Position.w;
}
