import { notNull } from "./utils.mjs"
import { Renderer } from "./renderer.mjs"
import { M4x4 } from "./matrix.mjs"

document.addEventListener("DOMContentLoaded", () => {
    const r = new Renderer(
        notNull(document.getElementById("cvs"), "Canvas not found")
    )

    console.log(r) 

    const shader = r.createShader(
        `#version 300 es
        precision highp float;

        in vec4 color_pt;
        out vec4 color;

        void main() {
            color = color_pt;
        }`,
        `#version 300 es
        
        uniform mat4 projection;
        uniform mat4 view;
        uniform mat4 motion;

        in vec3 coord;
        
        in vec3 color;
        out vec4 color_pt;

        void main() {
            color_pt = vec4(color, 1);
            gl_Position = projection * view * motion * vec4(coord, 1.);
            gl_PointSize = 5.0;
        }`
    )
    shader.use()
    
    const vao = r.gl.createVertexArray()
    r.gl.bindVertexArray(vao)

    let projMatrix = M4x4.projection(
        40,
        Math.max(r.cvs.width, r.cvs.height) / Math.min(r.cvs.width, r.cvs.height),
        1,
        100
    )
    addEventListener("resize", () => {
        projMatrix = M4x4.projection(
            40,
            Math.max(r.cvs.width, r.cvs.height) / Math.min(r.cvs.width, r.cvs.height),
            1,
            100
        )
    })
    const projMatrixLocation = shader.getUniform("projection")

    const viewMatrix = M4x4.identity()
    viewMatrix[14] = viewMatrix[14]-6; //zoom
    const viewMatrixLocation = shader.getUniform("view")

    const motionMatrix = M4x4.identity()
    const motionMatrixLocation = shader.getUniform("motion")

    /**
     * 
     * @param  {...number} shape 
     * @returns {number[]}
     */
    function card(...shape) {
        const n = shape.shift()
        let set = Array.from({length: n}, (_, i) => [i])
    
        if (shape.length) {
            const subSet = card(...shape)
            set = set.flatMap(a => subSet.map((b) => [...a, ...b]))
        }

        return set
    }

    const points = (() => { // Grid mesh
        const shape = [20, 20, 20],
            origin = [0, 0, 0],
            scale = [.1, .1, .1]


        const c = card(...shape)
        return c.map(c => ({ 
            coord: c.map((v, i) => 
                (v - (shape[i] - 1) / 2) * scale[i] + origin[i]
            ), 
            color: c.map((v, i) => v / (shape[i] - 1))
        }))
    })()

    const vertexs = shader.getBuffer("coord", 3, r.gl.FLOAT, false, 0, 0);
    r.gl.bindBuffer(r.gl.ARRAY_BUFFER, vertexs)
    r.gl.bufferData(
        r.gl.ARRAY_BUFFER,
        new Float32Array(points.flatMap(({coord}) => coord)),
        r.gl.STATIC_DRAW
    )

    const colors = shader.getBuffer("color", 3, r.gl.FLOAT, false, 0, 0);
    r.gl.bindBuffer(r.gl.ARRAY_BUFFER, colors)
    r.gl.bufferData(
        r.gl.ARRAY_BUFFER,
        new Float32Array(points.flatMap(({color}) => color)),
        r.gl.STATIC_DRAW
    )
    
    r.render((dt) => {
        motionMatrix.rotateZ(dt * .005)
        motionMatrix.rotateY(dt * .002)
        motionMatrix.rotateX(dt * .003)

        // Enable the depth test
        r.gl.enable(r.gl.DEPTH_TEST);
        r.gl.depthFunc(r.gl.LEQUAL);

        // Clear canvas
        r.gl.clearColor(0, 0, 0, 0);
        r.gl.clearDepth(1)
        r.gl.clear(r.gl.COLOR_BUFFER_BIT | r.gl.DEPTH_BUFFER_BIT);

        r.gl.uniformMatrix4fv(projMatrixLocation, false, projMatrix);
        r.gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
        r.gl.uniformMatrix4fv(motionMatrixLocation, false, motionMatrix);

        // Draw the points
        // r.gl.drawArrays(r.gl.LINE_LOOP, 0, points.length);
        r.gl.drawArrays(r.gl.POINTS, 0, points.length);
        // r.gl.drawArrays(r.gl.TRIANGLE_FAN, 0, points.length);
    })
})