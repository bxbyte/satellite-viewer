#version 300 es
precision mediump float;

uniform float time;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 motion;

in float semiMajorAxis;
in float eccentricity;
in float inclination;
in float raan;
in float argumentOfPerigee;
in float meanAnomaly;
in float meanMotion;     

out vec4 color;

vec3 computeECI() {
    
    // Solve kepler
    float M = meanAnomaly + meanMotion * time;
    float E = M;
    for (int i = 0; i < 10; i++) {
        E = E - (E - eccentricity * sin(E) - M) / (1.0 - eccentricity * cos(E));
    }

    float v = 2.0 * atan(sqrt((1.0 + eccentricity) / (1.0 - eccentricity)) * tan(E / 2.0));

    float r = semiMajorAxis * (1.0 - eccentricity * cos(E));
    float xOrbital = r * cos(v);
    float yOrbital = r * sin(v);

    // Rotation matrices
    float cosArgPerigee = cos(argumentOfPerigee);
    float sinArgPerigee = sin(argumentOfPerigee);

    // Apply rotations in the correct order
    float xTemp = xOrbital * cosArgPerigee - yOrbital * sinArgPerigee;
    float yTemp = xOrbital * sinArgPerigee + yOrbital * cosArgPerigee;

    float yIncl = yTemp * cos(inclination);
    float cosRAAN = cos(raan);
    float sinRAAN = sin(raan);

    return vec3(
        xTemp * cosRAAN - yIncl * sinRAAN,
        xTemp * sinRAAN + yIncl * cosRAAN,
        yTemp * sin(inclination)
    );
}

void main() {
    vec4 viewportCoord = motion * vec4(computeECI(), 1.0);
    gl_Position = projection * view * viewportCoord;
    gl_PointSize = gl_Position[2] * .1; // Size of the point
    color = vec4(1, viewportCoord[2], 1, 1);
}