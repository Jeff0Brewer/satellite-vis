precision highp float;

varying vec3 vNormal;

uniform vec3 uSunNormal;
uniform samplerCube uEarthMap;

void main() {
    float shade = .5 + .8*clamp(dot(normalize(vNormal), uSunNormal), .0, 1.0);
    gl_FragColor = vec4(textureCube(uEarthMap, normalize(vNormal)).xyz*shade, 1.0);
}
