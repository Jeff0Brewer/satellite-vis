precision highp float;

varying vec3 vNormal;

uniform int uLighting;
uniform vec3 uSunNormal;
uniform samplerCube uEarthMap;

void main() {
    vec4 texColor = textureCube(uEarthMap, normalize(vNormal));
    if (uLighting == 1) {
        float shade = .5 + .8*clamp(dot(normalize(vNormal), uSunNormal), .0, 1.0);
        gl_FragColor = vec4(texColor.xyz*shade, 1.0);
    }
    else {
        gl_FragColor = texColor;
    }
}
