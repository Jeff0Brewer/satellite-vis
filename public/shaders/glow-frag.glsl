precision highp float;

varying vec2 vTexCoord;

void main() {
    float radius = dot(vTexCoord, vTexCoord);
    float glow = 1.0 - pow(radius, 5.0);
    gl_FragColor = vec4(.3, .6, 1.0, glow);
}
