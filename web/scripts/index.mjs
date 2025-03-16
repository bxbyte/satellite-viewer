import { notNull } from "./utils.mjs"
import { Renderer } from "./canvas/renderer.mjs"
import { M4x4 } from "./canvas/matrix.mjs"
import { computeOrbit } from "./tle.mjs"
import { getTLE } from "./api.mjs"

document.addEventListener("DOMContentLoaded", async () => {
    const r = new Renderer(
        notNull(document.getElementById("cvs"), "Canvas not found")
    )

    const shader = r.createShader(...(await Promise.all(([
        "./shaders/orbits.frag", 
        "./shaders/orbits.vert", 
    ]).map(async f => {
        const res = await fetch(new URL(f, import.meta.url))
        return await res.text()
    }))))

    shader.use()

    let projMatrix = M4x4.projection(40, r.cvs.width / r.cvs.height, 0, 100)
    addEventListener("resize", () => {
        projMatrix = M4x4.projection(40, r.cvs.width / r.cvs.height, 1, 100)
    })
    const projMatrixLocation = shader.getUniform("projection")

    const viewMatrix = M4x4.identity()
    viewMatrix[14] = viewMatrix[14]-4; //zoom
    const viewMatrixLocation = shader.getUniform("view")

    const motionMatrix = M4x4.identity()
    const motionMatrixLocation = shader.getUniform("motion")

    const timeLocation = shader.getUniform("time")

    const orbits = await getTLE()

    const schema = [
        'eccentricity',
        'semiMajorAxis',
        'inclination',
        'raan',
        'argumentOfPerigee',
        'meanAnomaly',
        'meanMotion'
    ]

    const binds = schema.map(attr => {
        const attrLocation = shader.getBuffer(attr, 1, r.gl.FLOAT, false, 0, 0);
        return () => {
            r.gl.bindBuffer(r.gl.ARRAY_BUFFER, attrLocation)
            r.gl.bufferData(
                r.gl.ARRAY_BUFFER,
                new Float32Array(orbits.flatMap(({[attr]: v}) => v)),
                r.gl.STATIC_DRAW
            )
        }
    })
    
    const bind = () => binds.forEach(b => b())
    bind()

    r.render((time) => {
        // Enable the depth test
        r.gl.enable(r.gl.DEPTH_TEST);
        r.gl.depthFunc(r.gl.LEQUAL);

        // Clear canvas
        r.gl.clearColor(0, 0, 0, 0);
        r.gl.clearDepth(1)
        r.gl.clear(r.gl.COLOR_BUFFER_BIT | r.gl.DEPTH_BUFFER_BIT);

        // Pass uniform data
        r.gl.uniform1f(timeLocation, time * 10);
        r.gl.uniformMatrix4fv(projMatrixLocation, false, projMatrix);
        r.gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
        r.gl.uniformMatrix4fv(motionMatrixLocation, false, motionMatrix);

        // Draw the points
        r.gl.drawArrays(r.gl.POINTS, 0, orbits.length);
    })
})