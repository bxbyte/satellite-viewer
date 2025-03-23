/**
 * Type-safe shorthand to ensure a value isn't null
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
 * Type-safe shorthand to get document element
 *
 * @template {keyof HTMLElementTagNameMap} T
 * @param {T | `${T}[${string}]` | `${T}#${string}` | `${string} ${T}`} selector
 * @param {HTMLElement} parent
 * @returns {HTMLElementTagNameMap[T]}
 */
export function getElement(selector, parent = document) {
	return notNull(parent.querySelector(selector), `"${selector}" not found`)
}

/**
 * Type-safe shorthand to create element
 *
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
 * Shorthand to fetch text
 * @param {Parameters<typeof fetch>['0']} url
 * @returns
 */
export async function load(url) {
	const res = await fetch(url)
	return await res.text()
}

/**
 * Wrapper to add throttling functionality to a function
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
