attribute vec3 aPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform float uScale;

void main() {
    gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * vec4(aPosition * uScale, 1.0);
    float scale = length(uModelMatrix[0].xyz);
    gl_PointSize = pow(scale, 0.5)*8.0/gl_Position.w;
}
