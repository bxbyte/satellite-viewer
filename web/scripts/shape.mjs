/**
 * 
 * @param  {...number} shape 
 * @returns {number[]}
 */
export function card(...shape) {
    const n = shape.shift()
    let set = Array.from({length: n}, (_, i) => [i])

    if (shape.length) {
        const subSet = card(...shape)
        set = set.flatMap(a => subSet.map((b) => [...a, ...b]))
    }

    return set
}

export function sphere({lon = 100, lat = 100, layer = 1} = {}) {
    const shape = [lon, lat, layer]

    const c = card(...shape)
    return c.map(c => {
        const r = (c[2] + 1) / shape[2],
            x = c[0] / shape[0] * Math.PI * 2,
            y = c[1] / shape[1] * Math.PI * 2,
            sy = Math.sin(y)

        return { 
            coord: ([
                r * Math.cos(x) * sy,
                r * Math.sin(x) * sy,
                r * Math.cos(y),
            ]),
            /** @type {number[]} */
            color: c.map((v, i) => (1 + v) / shape[i])
        }
    })
}