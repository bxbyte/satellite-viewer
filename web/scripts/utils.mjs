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
 * @param {Parameters<typeof fetch>['0']} url 
 * @returns 
 */
export async function load(url) {
    const res = await fetch(url)
    return await res.text()
}