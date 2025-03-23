#version 300 es
precision mediump float;

// Control information
struct Controls {
  float time;
  mat4 projection;
  mat4 view;
  mat4 motion;
  vec2 resolution;
};
uniform Controls ctrl;

// Satellites 2le params
in float semiMajorAxis;
in float eccentricity;
in float inclination;
in float raan;
in float argumentOfPerigee;
in float meanAnomaly;
in float meanMotion;

// Satellites selection color
in float group;

// Displayed point information
out vec4 ptColor;
out vec2 ptPosition;

vec3 computeECI() {

  // Solve kepler
  float M = meanAnomaly + meanMotion * ctrl.time;
  float E = M;
  for (int i = 0; i < 10; i++) {
    E = E - (E - eccentricity * sin(E) - M) / (1.0 - eccentricity * cos(E));
  }

  float v = 2.0 * atan(sqrt((1.0 + eccentricity) / (1.0 - eccentricity)) *
                       tan(E / 2.0));

  float r = semiMajorAxis * (1.0 - eccentricity * cos(E));
  float xSatelliteal = r * cos(v);
  float ySatelliteal = r * sin(v);

  // Rotation matrices
  float cosArgPerigee = cos(argumentOfPerigee);
  float sinArgPerigee = sin(argumentOfPerigee);

  // Apply rotations in the correct order
  float xTemp = xSatelliteal * cosArgPerigee - ySatelliteal * sinArgPerigee;
  float yTemp = xSatelliteal * sinArgPerigee + ySatelliteal * cosArgPerigee;

  float yIncl = yTemp * cos(inclination);
  float cosRAAN = cos(raan);
  float sinRAAN = sin(raan);

  return vec3(xTemp * cosRAAN - yIncl * sinRAAN,
              xTemp * sinRAAN + yIncl * cosRAAN, yTemp * sin(inclination));
}

void main() {
  gl_PointSize = 5.;
  gl_Position = ctrl.projection * ctrl.view * ctrl.motion * vec4(computeECI(), 1.0);
  ptColor = vec4(1, vec2(group), 1);
  ptPosition = ctrl.resolution * ((gl_Position.xy / gl_Position.w) * .5 + .5);
}