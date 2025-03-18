#version 300 es
precision highp float;

in vec4 g_Color;
out vec4 g_OutColor;

void main() {
    g_OutColor = g_Color;
}