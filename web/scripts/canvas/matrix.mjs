export class M4x4 extends Array {
  /**
   *
   * @returns {M4x4}
   */
  static identity() {
    return M4x4.from([
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
    ]);
  }

  /**
   *
   * @param {number} angle
   * @param {number} a
   * @param {number} zMin
   * @param {number} zMax
   * @returns {M4x4}
   */
  static projection(angle, a, zMin, zMax) {
    const ang = Math.tan((angle * 0.5 * Math.PI) / 180);
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
    ]);
  }

  /**
   *
   * @param {number} a
   */
  updateProjectionRatio(a) {
    const oldA = this[5] / this[0];
    this[5] *= a / oldA;
  }

  /**
   *
   * @param {number} angle
   */
  rotateZ(angle) {
    const c = Math.cos(angle),
      s = Math.sin(angle),
      mv0 = this[0],
      mv4 = this[4],
      mv8 = this[8];

    this[0] = c * this[0] - s * this[1];
    this[4] = c * this[4] - s * this[5];
    this[8] = c * this[8] - s * this[9];

    this[1] = c * this[1] + s * mv0;
    this[5] = c * this[5] + s * mv4;
    this[9] = c * this[9] + s * mv8;
  }

  /**
   *
   * @param {number} angle
   */
  rotateX(angle) {
    const c = Math.cos(angle),
      s = Math.sin(angle),
      mv1 = this[1],
      mv5 = this[5],
      mv9 = this[9];

    this[1] = this[1] * c - this[2] * s;
    this[5] = this[5] * c - this[6] * s;
    this[9] = this[9] * c - this[10] * s;

    this[2] = this[2] * c + mv1 * s;
    this[6] = this[6] * c + mv5 * s;
    this[10] = this[10] * c + mv9 * s;
  }

  /**
   *
   * @param {number} angle
   */
  rotateY(angle) {
    const c = Math.cos(angle),
      s = Math.sin(angle),
      mv0 = this[0],
      mv4 = this[4],
      mv8 = this[8];

    this[0] = c * this[0] + s * this[2];
    this[4] = c * this[4] + s * this[6];
    this[8] = c * this[8] + s * this[10];

    this[2] = c * this[2] - s * mv0;
    this[6] = c * this[6] - s * mv4;
    this[10] = c * this[10] - s * mv8;
  }
}
