precision highp float;

varying vec4 vColor;

void main() {
    vec2 r = 2.0 * gl_PointCoord - 1.0;
    if (dot(r, r) > 1.0) {
        discard;
    }
    gl_FragColor = vColor;
}
