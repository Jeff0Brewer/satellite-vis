precision highp float;

uniform int uLighting;
uniform vec3 uSunNormal;
uniform vec3 uCameraDirection;
uniform samplerCube uEarthMap;

varying vec3 vNormal;

float getShade(vec3 vertexNormal, vec3 lightNormal) {
    return .3 + 1.2*clamp(dot(vertexNormal, uSunNormal), .0, 1.0);
}

vec3 getAtmosphere(vec3 vertexNormal, vec3 cameraDirection) {
    float intensity = 1.05 - dot(vertexNormal, cameraDirection);
    return vec3(.3, .6, 1.0) * pow(intensity, 1.5);
}

void main() {
    vec3 vertexNormal = normalize(vNormal);
    vec4 texColor = textureCube(uEarthMap, vertexNormal);
    vec3 atmosphere = getAtmosphere(vertexNormal, uCameraDirection);
    float shade = 1.0;
    if (uLighting == 1) {
        shade = getShade(vertexNormal, uSunNormal);
    }
    gl_FragColor = vec4((texColor.xyz + atmosphere)*shade, 1.0);
}
