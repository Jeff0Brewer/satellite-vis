precision highp float;

void main() {
    vec2 coord = 2.0 * gl_PointCoord - 1.0;
    float invRadius = 1.0 - dot(coord, coord);
    float glow = sign(invRadius)*abs(pow(invRadius, .5));

    gl_FragColor = vec4(.4, .7, 1.0, glow);
}
