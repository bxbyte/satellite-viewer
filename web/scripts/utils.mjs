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