attribute vec4 aPosition;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform float uScreenHeight;

void main() {
    float pointSize = 1.45 * uScreenHeight;
    float growDist = 2.5;
    gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
    if (gl_Position.w < growDist) {
        gl_PointSize = pointSize / (growDist + 1.125*(gl_Position.w - growDist));
    } else {
        gl_PointSize = pointSize / gl_Position.w;
    }
}
