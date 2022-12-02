precision highp float;

void main() {
    vec2 coord = 2.0 * gl_PointCoord - 1.0;
    float radius = dot(coord, coord);
    float glow = 1.0 - pow(radius, 5.0);

    gl_FragColor = vec4(.3, .6, 1.0, glow);
}
