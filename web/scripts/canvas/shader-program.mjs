import { notNull } from "../utils.mjs";

export class ShaderProgram {
  #shaderProgram;

  /**
   *
   * @param {WebGL2RenderingContext} gl
   * @param {string} fragShaderCode
   * @param {string} vertShaderCode
   */
  constructor(gl, fragShaderCode, vertShaderCode) {
    this.gl = gl;

    this.#shaderProgram = notNull(
      this.gl.createProgram(),
      "Can't create program",
    );

    const fragShader = this.#compileShader(
      this.gl.FRAGMENT_SHADER,
      fragShaderCode,
    );
    this.gl.attachShader(this.#shaderProgram, fragShader);

    const vertShader = this.#compileShader(
      this.gl.VERTEX_SHADER,
      vertShaderCode,
    );
    this.gl.attachShader(this.#shaderProgram, vertShader);

    this.gl.linkProgram(this.#shaderProgram);

    if (
      !this.gl.getProgramParameter(this.#shaderProgram, this.gl.LINK_STATUS)
    ) {
      throw new Error(
        [
          "Program : " + this.gl.getProgramInfoLog(this.#shaderProgram),
          "Fragment : " + this.gl.getShaderInfoLog(fragShader),
          "Vertex : " + this.gl.getShaderInfoLog(vertShader),
        ].join("\n"),
      );
    }
  }

  use() {
    this.gl.useProgram(this.#shaderProgram);
  }

  /**
   *
   * @typedef {Extract<keyof WebGL2RenderingContext, `uniform${string}`>} UniformKeys
   * @typedef {UniformKeys extends `uniform${infer U}` ? U : never} UniformTypes
   *
   * @param {string} name
   * @param {UniformTypes} type
   */
  getUniformSetter(name, type) {
    const setter = this.gl[`uniform${type}`].bind(this.gl),
      location = this.gl.getUniformLocation(this.#shaderProgram, name);
    return (...args) => setter(location, ...args);
  }

  /**
   *
   * @param {string} name
   * @param {Omit<Parameters<WebGL2RenderingContext['vertexAttribPointer']>, 0>} pointerParams
   */
  getBuffer(name, ...pointerParams) {
    const buffer = notNull(this.gl.createBuffer(), "Can't create buffer");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    const attrPointer = this.gl.getAttribLocation(this.#shaderProgram, name);
    this.gl.vertexAttribPointer(attrPointer, ...pointerParams);
    this.gl.enableVertexAttribArray(attrPointer);
    return buffer;
  }

  /**
   *
   * @param {number} type
   * @param {string} code
   * @returns
   */
  #compileShader(type, code) {
    const shader = notNull(this.gl.createShader(type), "Can't create shader");
    this.gl.shaderSource(shader, code);
    this.gl.compileShader(shader);
    return shader;
  }
}
