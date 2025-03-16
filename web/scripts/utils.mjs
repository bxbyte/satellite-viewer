/**
 * 
 * @template T
 * @param {T} value 
 * @param {string} errorMsg 
 * @returns {NonNullable<T>}
 */
export function notNull(value, errorMsg) {
    if (value == null) throw new Error(errorMsg)
    return value
}

/**
 * 
 * @param {string} url 
 */
export async function load(url) {
    const res = await fetch(url)
    return await res.text()
}