#extension GL_OES_standard_derivatives : enable
precision highp float;

varying vec4 vColor;

void main() {
    vec2 coord = 2.0 * gl_PointCoord - 1.0;
    float radius = dot(coord, coord);
    float delta = fwidth(radius);
    float alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, radius);
    if (radius > 1.0 + .2 * delta) {
        discard;
    }
    gl_FragColor = vec4(vColor.xyz, alpha);
}
