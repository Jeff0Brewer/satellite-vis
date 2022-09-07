precision mediump float;

uniform samplerCube uSkybox;
uniform mat4 uViewProjInverse;

varying vec4 vPosition;

void main() {
    vec4 t = uViewProjInverse * vPosition;
    gl_FragColor = textureCube(uSkybox, normalize(t.xyz / t.w));
}
