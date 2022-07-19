attribute float aAxis;
attribute float aEccentricity;
attribute float aPeriapsis;
attribute float aInclination;
attribute float aLngAcendingNode;
attribute float aAnomaly;
attribute float aYear;
attribute float aDay;
attribute float aSecond;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform float uYear;
uniform float uDay;
uniform float uSecond;
uniform float uScale;

void main() {
    float a = aAxis;
    float e = aEccentricity;
    float w = aPeriapsis;
    float i = aInclination;
    float o = aLngAcendingNode;
    
    float M = aAnomaly;
    float ua3 = sqrt((3.986004418 * pow(10.0, 14.0))/pow(a, 3.0));
    float pi2 = 3.1415926535*2.0;
    M = mod(M + ua3*365.0*86400.0*(uYear - aYear), pi2);
    M = mod(M + ua3*86400.0*(uDay - aDay), pi2);
    M = mod(M + ua3*(uSecond - aSecond), pi2);

    float E = M;
    for (int i = 0; i < 10; i++) {
        E = E - (E - e*sin(E) - M)/(1.0 - e*cos(E));
    }
    float v = 2.0*atan(sqrt(1.0 + e)*sin(E/2.0), sqrt(1.0 - e)*cos(E/2.0));
    float r = a * (1.0 - e*cos(E));

    float Ox = r * cos(v);
    float Oy = r * sin(v);
    vec3 pos = uScale * vec3(
        Ox*(cos(w)*cos(o) - sin(w)*cos(i)*sin(o)) - Oy*(sin(w)*cos(o) + cos(w)*cos(i)*sin(o)),
        Ox*(cos(w)*sin(o) + sin(w)*cos(i)*cos(o)) + Oy*(cos(w)*cos(i)*cos(o) - sin(w)*sin(o)),
        Ox*(sin(w)*sin(i)) + Oy*(cos(w)*sin(i))
    );

    gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    float scale = length(uModelMatrix[0].xyz);
    gl_PointSize = pow(scale, 0.5)*8.0/gl_Position.w;
}
