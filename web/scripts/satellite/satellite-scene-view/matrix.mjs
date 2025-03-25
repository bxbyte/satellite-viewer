/**
 * Matrix of 4 by 4
 */
export class M4x4 extends Array {
	/**
	 * Create identity matrix
	 * @returns {M4x4} Identity matrix
	 */
	static identity() {
		return M4x4.from([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
	}

	/**
	 * Create projection matrix
	 * @param {number} angle FOV
	 * @param {number} a Aspect ratio
	 * @param {number} zMin Min distance
	 * @param {number} zMax Max distance
	 * @returns {M4x4} Projection matrix
	 */
	static projection(angle, a, zMin, zMax) {
		const ang = Math.tan((angle * 0.5 * Math.PI) / 180)
		return M4x4.from([
			0.5 / ang,
			0,
			0,
			0,
			0,
			(0.5 * a) / ang,
			0,
			0,
			0,
			0,
			-(zMax + zMin) / (zMax - zMin),
			-1,
			0,
			0,
			(-2 * zMax * zMin) / (zMax - zMin),
			0,
		])
	}

	/**
	 * Set aspect ratio of projection matrix
	 * @param {number} a Aspect ratio
	 */
	setAspectRatio(a) {
		const oldA = this[5] / this[0]
		this[5] *= a / oldA
	}

	/**
	 * Rotate matrix on z-axis
	 * @param {number} angle Rotation angle
	 */
	rotateZ(angle) {
		const c = Math.cos(angle),
			s = Math.sin(angle),
			mv0 = this[0],
			mv4 = this[4],
			mv8 = this[8]

		this[0] = c * this[0] - s * this[1]
		this[4] = c * this[4] - s * this[5]
		this[8] = c * this[8] - s * this[9]

		this[1] = c * this[1] + s * mv0
		this[5] = c * this[5] + s * mv4
		this[9] = c * this[9] + s * mv8
	}

	/**
	 * Rotate matrix on x-axis
	 * @param {number} angle Rotation angle
	 */
	rotateX(angle) {
		const c = Math.cos(angle),
			s = Math.sin(angle),
			mv1 = this[1],
			mv5 = this[5],
			mv9 = this[9]

		this[1] = this[1] * c - this[2] * s
		this[5] = this[5] * c - this[6] * s
		this[9] = this[9] * c - this[10] * s

		this[2] = this[2] * c + mv1 * s
		this[6] = this[6] * c + mv5 * s
		this[10] = this[10] * c + mv9 * s
	}

	/**
	 * Rotate matrix on y-axis
	 * @param {number} angle Rotation angle
	 */
	rotateY(angle) {
		const c = Math.cos(angle),
			s = Math.sin(angle),
			mv0 = this[0],
			mv4 = this[4],
			mv8 = this[8]

		this[0] = c * this[0] + s * this[2]
		this[4] = c * this[4] + s * this[6]
		this[8] = c * this[8] + s * this[10]

		this[2] = c * this[2] - s * mv0
		this[6] = c * this[6] - s * mv4
		this[10] = c * this[10] - s * mv8
	}
}
