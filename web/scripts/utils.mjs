/**
 *
 * @template T
 * @param {T} value
 * @param {string} errorMsg
 * @returns {NonNullable<T>}
 */
export function notNull(value, errorMsg) {
  if (value == null) throw new Error(errorMsg);
  return value;
}

/**
 *
 * @param {string} selector
 * @param {HTMLElement} parent
 * @returns {HTMLElement}
 */
export function getElement(selector, parent = document) {
  return notNull(parent.querySelector(selector), `"${selector}" not found`);
}

/**
 *
 * @param {Parameters<typeof fetch>['0']} url
 * @returns
 */
export async function load(url) {
  const res = await fetch(url);
  return await res.text();
}

/**
 * @template {(...args) => void} T
 * @param {T} callback
 * @returns {T}
 */
export function throttleFn(callback, minDeltaTime = 300) {
  let lastCallTime = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCallTime > minDeltaTime) {
      callback(...args);
      lastCallTime = now;
    }
  };
}
