import { notNull } from "../utils.mjs"

export class ShaderProgram {
	#shaderProgram

	/**
	 * A shader program assembling fragment and vertex shaders code
	 *  
	 * @param {WebGL2RenderingContext} gl WebGL2 rendering context
	 * @param {string} fragShaderCode Fragment shader code
	 * @param {string} vertShaderCode Vertex shader code
	 */
	constructor(gl, fragShaderCode, vertShaderCode) {
		this.gl = gl

		this.#shaderProgram = notNull(this.gl.createProgram(), "Can't create program")

		const fragShader = this.#compileShader(this.gl.FRAGMENT_SHADER, fragShaderCode)
		this.gl.attachShader(this.#shaderProgram, fragShader)

		const vertShader = this.#compileShader(this.gl.VERTEX_SHADER, vertShaderCode)
		this.gl.attachShader(this.#shaderProgram, vertShader)

		this.gl.linkProgram(this.#shaderProgram)

		if (!this.gl.getProgramParameter(this.#shaderProgram, this.gl.LINK_STATUS)) {
			throw new Error(
				[
					"Program : " + this.gl.getProgramInfoLog(this.#shaderProgram),
					"Fragment : " + this.gl.getShaderInfoLog(fragShader),
					"Vertex : " + this.gl.getShaderInfoLog(vertShader),
				].join("\n")
			)
		}
	}

	/** Use this program in the WebGL rendering context. */
	use() {
		this.gl.useProgram(this.#shaderProgram)
	}

	/**
	 * Get uniform attribute setter
	 * 
	 * @typedef {Extract<keyof WebGL2RenderingContext, `uniform${string}`>} UniformKeys
	 * @typedef {UniformKeys extends `uniform${infer U}` ? U : never} UniformTypes
	 *
	 * @param {string} name Attribute name
	 * @param {UniformTypes} type Attribute type
	 * @returns Setter
	 */
	getUniformSetter(name, type) {
		const setter = this.gl[`uniform${type}`].bind(this.gl),
			location = this.gl.getUniformLocation(this.#shaderProgram, name)
		return (...args) => setter(location, ...args)
	}

	/**
	 * Get buffer attribute location
	 * @param {string} name Attribute name
	 * @param {Omit<Parameters<WebGL2RenderingContext['vertexAttribPointer']>, 0>} attrParams Attribute params
	 * @returns {WebGLBuffer} Buffer
	 */
	getBuffer(name, ...attrParams) {
		const buffer = notNull(this.gl.createBuffer(), "Can't create buffer")
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
		const attrPointer = this.gl.getAttribLocation(this.#shaderProgram, name)
		this.gl.vertexAttribPointer(attrPointer, ...attrParams)
		this.gl.enableVertexAttribArray(attrPointer)
		return buffer
	}

	/**
	 * Compile a webgl shader
	 * @param {number} type Shader type
	 * @param {string} code Shader source code
	 * @returns {WebGLShader} Compiled shader
	 */
	#compileShader(type, code) {
		const shader = notNull(this.gl.createShader(type), "Can't create shader")
		this.gl.shaderSource(shader, code)
		this.gl.compileShader(shader)
		return shader
	}
}
