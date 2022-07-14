attribute float aEpoch;
attribute float aAxis;
attribute float aEccentricity;
attribute float aPeriapsis;
attribute float aInclination;
attribute float aLngAcendingNode;
attribute float aAnomoly;

uniform float uTime;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

void main() {
    float u = 3.986004418 * pow(10.0, 14.0);
    float dt = (uTime - aEpoch)*86400.0;
    float a = aAxis;
    float e = aEccentricity;
    float w = aPeriapsis;
    float i = aInclination;
    float o = aLngAcendingNode;
    
    float M = aAnomoly + dt*sqrt(u/pow(a, 3.0));
    M = mod(M, 2.0*3.1415926535);
    float E = M;
    for (int i = 0; i < 10; i++) {
        E = E - (E - e*sin(E) - M)/(1.0 - e*cos(E));
    }
    float v = 2.0*atan(sqrt(1.0 + e)*sin(E/2.0), sqrt(1.0 - e)*cos(E/2.0));
    float r = a * (1.0 - e*cos(E));

    float Ox = r * cos(v);
    float Oy = r * sin(v);
    vec3 pos = .0000001 * vec3(
        Ox*(cos(w)*cos(o) - sin(w)*cos(i)*sin(o)) - Oy*(sin(w)*cos(o) + cos(w)*cos(i)*sin(o)),
        Ox*(cos(w)*sin(o) + sin(w)*cos(i)*cos(o)) + Oy*(cos(w)*cos(i)*cos(o) - sin(w)*sin(o)),
        Ox*(sin(w)*sin(i)) + Oy*(cos(w)*sin(i))
    );

    gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    gl_PointSize = 7.0/gl_Position.w;
}
