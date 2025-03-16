import { notNull, load } from "./utils.mjs"
import { Renderer } from "./renderer.mjs"
import { M4x4 } from "./matrix.mjs"
import { sphere } from "./shape.mjs"

document.addEventListener("DOMContentLoaded", async () => {
    const r = new Renderer(
        notNull(document.getElementById("cvs"), "Canvas not found")
    )

    const shader = r.createShader(...(await Promise.all(([
        "./shaders/shader.frag", 
        "./shaders/shader.vert", 
    ]).map(f => load(new URL(f, import.meta.url))))))
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


    const points = sphere({
        lat: 16,
        lon: 8
    })

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
        motionMatrix.rotateZ(dt * .001)
        motionMatrix.rotateY(dt * .001)
        motionMatrix.rotateX(dt * .001)

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
        r.gl.drawArrays(r.gl.LINE_STRIP, 0, points.length);
        // r.gl.drawArrays(r.gl.TRIANGLE_FAN, 0, points.length);
        r.gl.drawArrays(r.gl.POINTS, 0, points.length);
    })
})