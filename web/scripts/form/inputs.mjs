/**
 * @typedef {Record<string, string | import("./api/api.mjs").BaseOptions>} Options
 *
 * @param {string} displayedName
 * @param {string} name
 * @param {Options} options
 * @returns {HTMLSelectElement & { setOptions: (options: Options) => void }}
 */
export function createSelect(displayedName, name, options = []) {
  const el = document.createElement("select");
  el.required = true;
  el.name = name;

  const defaultOption = new Option(displayedName, "", true);
  defaultOption.hidden = true;

  /**
   * @param {Record<string, string | import("./api/api.mjs").BaseOptions>} options
   */
  el.setOptions = (options) => {
    el.replaceChildren(
      defaultOption,
      ...el.selectedOptions,
      ...Object.entries(options).map(([k, v]) =>
        typeof v == "string"
          ? new Option(v, k)
          : new Option(v.label, k, false, v.default),
      ),
    );
  };
  el.setOptions(options);
  return el;
}

/**
 *
 * @param {Record<string, *>} attr
 * @returns
 */
export function createInput(attr) {
  const el = document.createElement("input");
  el.required = true;
  Object.entries(attr).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}
