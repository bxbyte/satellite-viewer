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

// Satellites color
in vec3 color;

// Displayed point information
out vec4 ptColor;
out vec2 ptPosition;

/** Implementation of the TLE to ECI conversion */
vec3 computeECI() {
  // Step 1 is skipped as it's prepare before
  float M = meanAnomaly + meanMotion * ctrl.time;

  // Step 2: Solve Kepler's equation M = E - eccentricity * sin(E)
  // with the Newton-Raphson method
  float E = M;
  for (int i = 0; i < 10; i++) {
    E = E - (E - eccentricity * sin(E) - M) / (1. - eccentricity * cos(E));
  }

  // Step 3: Get true anomaly with an equivalent formula
  float v = 2. * atan(
    sqrt((1. + eccentricity) / (1. - eccentricity)) 
    * tan(E / 2.)
  );

  // Step 4: Get distance relative to earth
  float r = semiMajorAxis * (1. - eccentricity * cos(E));

  // Step 5:
  vec2 o = vec2(r * cos(v), r * sin(v));

  // Step 6. Optimized version of the final transformation
  float cosArgPerigee = cos(argumentOfPerigee);
  float sinArgPerigee = sin(argumentOfPerigee);

  float tempX = o.x * cosArgPerigee - o.y * sinArgPerigee;
  float tempY = o.x * sinArgPerigee + o.y * cosArgPerigee;

  float yIncl = tempY * cos(inclination);
  float cosRAAN = cos(raan);
  float sinRAAN = sin(raan);

  return vec3(
    tempX * cosRAAN - yIncl * sinRAAN,
    tempX * sinRAAN + yIncl * cosRAAN,
    tempY * sin(inclination)
  );
}

void main() {
  gl_PointSize = 3.;
  gl_Position = ctrl.projection * ctrl.view * ctrl.motion * vec4(computeECI(), 1.);
  ptColor = vec4(color, 1);
  ptPosition = ctrl.resolution * ((gl_Position.xy / gl_Position.w) * .5 + .5);
}