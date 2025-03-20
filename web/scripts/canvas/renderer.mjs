import { notNull } from "../utils.mjs";
import { ShaderProgram } from "./shader-program.mjs";

export class Renderer {
  #renderRequestId;

  /**
   *
   * @param {HTMLCanvasElement} cvs
   */
  constructor(cvs) {
    this.cvs = cvs;
    this.gl = notNull(
      cvs.getContext("webgl2", {
        premultipliedAlpha: false, // Use alpha
        powerPreference: "high-performance",
        preserveDrawingBuffer: true,
      }),
      "Your browser doesn't support the Webgl2 API"
    );
    // Set size
    this.updateSize();
  }

  /**
   *
   * @param  {...Omit<ConstructorParameters<ShaderProgram>, 0>} params
   * @returns
   */
  createShader(...params) {
    return new ShaderProgram(this.gl, ...params);
  }

  /**
   *
   * @param {(time: number, deltaTime: number) => void} callback
   */
  render(callback, maxFPS = 120) {
    const timeout = 1000 / maxFPS;
    let lastTime = 0;
    const frameCallback = (time) => {
      const deltaTime = time - lastTime;
      if (timeout <= deltaTime) {
        callback(time, deltaTime);
        lastTime = time;
      }
      this.#renderRequestId = requestAnimationFrame(frameCallback);
    };
    this.#renderRequestId = requestAnimationFrame(frameCallback);
  }

  pause() {
    cancelAnimationFrame(this.#renderRequestId);
  }

  updateSize() {
    const s = 1;
    this.cvs.width = Math.floor(this.cvs.clientWidth * s);
    this.cvs.height = Math.floor(this.cvs.clientHeight * s);
    this.gl.viewport(0, 0, this.cvs.width, this.cvs.height);
  }
}
