#version 300 es

uniform mat4 projection;
uniform mat4 view;
uniform mat4 motion;

in vec3 coord;

in vec3 color;
out vec4 color_pt;

void main() {
    gl_Position = projection * view * motion * vec4(coord, 1.);
    // color_pt = vec4(color, .5);
    color_pt = vec4(color, pow(gl_Position[3], 2.));
    gl_PointSize = 10.0;
}