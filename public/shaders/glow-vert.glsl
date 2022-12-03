attribute vec4 aPosition;
attribute vec2 aTexCoord;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

varying vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    gl_Position = uProjMatrix * uViewMatrix * aPosition;

    float growDist = 2.3;
    if (gl_Position.w < growDist) {
        float grow = pow(growDist / gl_Position.w, 3.0);
        vec4 scaledPos = vec4(aPosition.xyz * (.97 + .03*grow), 1.0);
        gl_Position = uProjMatrix * uViewMatrix * scaledPos;
    }
}
