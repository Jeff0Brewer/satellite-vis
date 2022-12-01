attribute vec4 aPosition;
attribute vec4 aColor;
attribute vec4 aSelectColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform mat4 uInvMatrix;
uniform vec2 uMousePos;
uniform float uPointSize;

varying vec4 vColor;

float distLinePoint(vec3 line0, vec3 line1, vec3 point) {
    return length(cross(point - line0, point - line1))/length(line1 - line0);
}

void main() {
    vColor = aColor;
    gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
    float depthScale = pow(gl_Position.w, 0.4);
    gl_PointSize = uPointSize/depthScale;

    // calculate dist from mouse to vertex
    vec4 mouseNear = uInvMatrix * vec4(uMousePos, 0.0, 1.0);
    vec4 mouseFar = uInvMatrix * vec4(uMousePos, 1.0, 1.0);
    float mouseDist = distLinePoint(mouseNear.xyz/mouseNear.w, mouseFar.xyz/mouseFar.w, aPosition.xyz);

    // resize and highlight point on hover
    float mouseRange = 100.0*depthScale;
    if (mouseDist < mouseRange) {
        vColor = aSelectColor;
        gl_PointSize = gl_PointSize + uPointSize*abs((mouseDist - mouseRange)/mouseRange);
    }
}
