#version 300 es
precision highp float;

// Point information
in vec4 ptColor;
in vec2 ptPosition;

// Output pixel color
out vec4 pxColor;

const float radius = 2.5;
const float threshold = .5;

void main() {
    float d = distance(gl_FragCoord.xy, ptPosition);
    if (d > radius) discard;
    pxColor = vec4(
        mix(ptColor.rgb, vec3(0.0), step(1.0 - threshold, d / radius)),
        1.
    );
}