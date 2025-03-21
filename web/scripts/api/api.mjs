/**
 *
 * @typedef {{label: string, default: boolean}} BaseOptions
 * @typedef {BaseOptions & {attrs: *}} InputOptions
 * @typedef {BaseOptions  &{values: *}} SelectOptions
 *
 */

export class API {
  /**
   *
   * @template {string} T
   * @param {{
   *  name: string,
   *  entrypoint: URL,
   *  load: (res: Response) => Promise<Satellite[]>
   *  defaultParams: Record<string, string>
   *  options: Record<T, InputOptions | SelectOptions>,
   * }}
   */
  constructor({ name, entrypoint, options, load, defaultParams = {} }) {
    this.name = name;
    this.entrypoint = entrypoint;
    Object.entries(defaultParams).forEach(([k, v]) =>
      this.entrypoint.searchParams.set(k, v),
    );
    this.load = load;
    this.options = options;
    this.optionsName = new Set(Object.keys(options));
    this.optionsName.delete(this.defaultOption);
  }

  /**
   *
   * @param {URL} url
   */
  async search(url) {
    return await this.load(await fetch(url));
  }

  /**
   *
   * @param {*} params
   */
  buildURL(params) {
    const url = new URL(this.entrypoint);
    Object.entries(params).forEach(([k, v]) => {
      if (v != "") url.searchParams.set(k, v);
    });
    return url;
  }
}
