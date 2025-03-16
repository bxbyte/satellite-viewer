import { notNull } from "./utils.mjs"
import { Renderer } from "./canvas/renderer.mjs"
import { M4x4 } from "./canvas/matrix.mjs"
import { sphere } from "./canvas/shape.mjs"
import { computeOrbit } from "./tle.mjs"

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

    const orbits = [ 
        `ISS (ZARYA)
        1 25544U 98067A   24075.54947917  .0016717  00000+0  30250-3 0  9991
        2 25544  51.6423  98.2213 0004811  93.2234  61.5552 15.49661612394797`,
        `AISSAT 2
        1 40075U 14037G   23362.49933056 .00003465  00000+0  40707-3 0  9994
        2 40075  98.3401 268.4723 0004780 335.0232  25.0749 14.85601820512563`,
        `NORSAT 3
        1 48272U 21034E 23362.43828188 .00004841 00000+0 48553-3 0 9995
        2 48272 97.6838 64.9893 0002115 110.5617 249.5829 14.91778587 144752`
     ].map(computeOrbit)

    console.log(orbits)
    
    /** @constant */
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
        console.log(
            attr,
            (orbits.flatMap(({[attr]: v}) => v)),
            new Float32Array(orbits.flatMap(({[attr]: v}) => v))
        )
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
        r.gl.uniform1f(timeLocation, time);
        r.gl.uniformMatrix4fv(projMatrixLocation, false, projMatrix);
        r.gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
        r.gl.uniformMatrix4fv(motionMatrixLocation, false, motionMatrix);

        // Draw the points
        r.gl.drawArrays(r.gl.POINTS, 0, orbits.length);
    })
})