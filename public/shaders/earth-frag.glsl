precision highp float;

uniform int uLighting;
uniform vec3 uSunNormal;
uniform samplerCube uEarthMap;

varying vec3 vNormal;

void main() {
    vec4 texColor = textureCube(uEarthMap, normalize(vNormal));
    if (uLighting == 1) {
        float shade = .3 + 1.2*clamp(dot(normalize(vNormal), uSunNormal), .0, 1.0);
        gl_FragColor = vec4(texColor.xyz*shade, 1.0);
    }
    else {
        gl_FragColor = texColor;
    }
}
