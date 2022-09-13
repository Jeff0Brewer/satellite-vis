attribute vec4 aPosition;
attribute vec4 aColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

varying vec4 vColor;

void main() {
    gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
    gl_PointSize = 10.0/pow(gl_Position.w, 0.5);
    vColor = aColor;
}
