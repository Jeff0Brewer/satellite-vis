attribute vec3 aPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

void main() {
    gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
    float scale = length(uModelMatrix[0].xyz);
    gl_PointSize = pow(scale, 0.5)*800.0/gl_Position.w;
}
