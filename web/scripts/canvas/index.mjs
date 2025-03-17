import { notNull, load } from "../utils.mjs"
import { Renderer } from "./renderer.mjs"
import { M4x4 } from "./matrix.mjs"
import { ORBITS_PARAMS } from "../tle.mjs"

/** WebGL fragment and vertex shaders code */
const orbitsShadersCode = await Promise.all(([
    "./shaders/orbits.frag", 
    "./shaders/orbits.vert", 
]).map(async f => load(new URL(f, import.meta.url))))

export class OrbitsCanvas {
    /** @type {Record<typeof ORBITS_PARAMS, number>[]} */
    #orbits = []

    constructor() {
        const r = this.r = new Renderer(
            notNull(document.getElementById("cvs"), "Canvas not found")
        )

        this.orbitsShader = r.createShader(...orbitsShadersCode)
        this.orbitsShader.use()

        this.setProjectionMatrix = this.orbitsShader.getUniformSetter("projection", "Matrix4fv")
        this.setViewMatrix = this.orbitsShader.getUniformSetter("view", "Matrix4fv")
        this.setMotionMatrix = this.orbitsShader.getUniformSetter("motion", "Matrix4fv")
        this.setTime = this.orbitsShader.getUniformSetter("time", "1f")

        /** @type {(() => void)[]} */
        this.orbitsBinds = ORBITS_PARAMS.map(paramName => {
            const attrLocation = this.orbitsShader.getBuffer(paramName, 1, r.gl.FLOAT, false, 0, 0);

            return () => {
                r.gl.bindBuffer(r.gl.ARRAY_BUFFER, attrLocation)
                r.gl.bufferData(
                    r.gl.ARRAY_BUFFER,
                    new Float32Array(this.#orbits.flatMap(({[paramName]: v}) => v)),
                    r.gl.STATIC_DRAW
                )
            }
        })
                        
        const projectionMatrix = M4x4.projection(40, r.cvs.width / r.cvs.height, 0, 100)
        addEventListener("resize", () => {
            projectionMatrix = M4x4.projection(40, r.cvs.width / r.cvs.height, 1, 100)
        })

        const viewMatrix = M4x4.identity()
        viewMatrix[14] = viewMatrix[14] - 15; // zoom    

        const motionMatrix = M4x4.identity()
        motionMatrix.rotateX(Math.PI / 4)
        motionMatrix.rotateY(Math.PI / 4)

        r.render((time) => {
            // Enable the depth test
            r.gl.enable(r.gl.DEPTH_TEST);
            r.gl.depthFunc(r.gl.LEQUAL);

            // Clear canvas
            r.gl.clearColor(0, 0, 0, 0);
            r.gl.clearDepth(1)
            r.gl.clear(r.gl.COLOR_BUFFER_BIT | r.gl.DEPTH_BUFFER_BIT);

            // Pass uniform data
            this.setTime(time);
            this.setProjectionMatrix(false, projectionMatrix);
            this.setMotionMatrix(false, motionMatrix);
            this.setViewMatrix(false, viewMatrix);

            // Draw the points
            r.gl.drawArrays(r.gl.POINTS, 0, this.#orbits.length);
        })
    }

    setOrbits(v) {
        this.#orbits = v;
        this.orbitsBinds.forEach(b => b())
    }
}