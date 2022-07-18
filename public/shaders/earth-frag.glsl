precision highp float;

varying vec3 vNormal;

uniform samplerCube uEarthMap;

void main() {
    gl_FragColor = textureCube(uEarthMap, normalize(vNormal));
}
