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
 * @template {keyof HTMLElementTagNameMap} T
 * @param {T | `${T}[${string}]` | `${T}#${string}` | `${string} ${T}`} selector
 * @param {HTMLElement} parent
 * @returns {HTMLElementTagNameMap[T]}
 */
export function getElement(selector, parent = document) {
	return notNull(parent.querySelector(selector), `"${selector}" not found`)
}

/**
 * @template {keyof HTMLElementTagNameMap} T
 * @param {T} type
 * @param {HTMLElementTagNameMap[T]} params
 * @returns {HTMLElementTagNameMap[T]}
 */
export function createEl(type, params) {
	const el = document.createElement(type)
	Object.entries(params)
		.filter(([k, v]) => v != undefined)
		.forEach(([k, v]) => (el[k] = v))
	return el
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

/**
 * @template {(...args) => void} T
 * @param {T} callback
 * @returns {T}
 */
export function throttleFn(callback, minDeltaTime = 300) {
	let lastCallTime = 0
	return (...args) => {
		const now = Date.now()
		if (now - lastCallTime > minDeltaTime) {
			callback(...args)
			lastCallTime = now
		}
	}
}
