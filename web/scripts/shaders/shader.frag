#version 300 es
precision highp float;

in vec4 color_pt;
out vec4 color;

void main() {
    color = color_pt;
}