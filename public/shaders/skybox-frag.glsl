precision mediump float;

uniform samplerCube uSkybox;
uniform mat4 uViewProjInverse;

varying vec4 vPosition;

void main() {
    vec4 texNormal = uViewProjInverse * vPosition;
    gl_FragColor = textureCube(uSkybox, normalize(texNormal.xyz / texNormal.w));
}
