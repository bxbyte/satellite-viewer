export class API {
	/**
	 * @param {{
	 *  name: string,
	 *  entrypoint: URL,
	 *  load: (res: Response) => Promise<Satellite[]>
	 *  defaultParams: Record<string, string>
	 *  defaultField: string
	 *  fields: import("../form/fields.mjs").NamedFields['fields']
	 * }}
	 */
	constructor({ name, entrypoint, defaultField, fields, load, defaultParams = {} }) {
		this.name = name
		this.entrypoint = entrypoint
		Object.entries(defaultParams).forEach(([k, v]) => this.entrypoint.searchParams.set(k, v))
		this.load = load
		this.defaultField = defaultField
		this.fields = fields
	}

	/**
	 *
	 * @param {URL} url
	 */
	async search(url) {
		return await this.load(await fetch(url))
	}

	/**
	 *
	 * @param {*} params
	 */
	buildURL(params = {}) {
		const url = new URL(this.entrypoint)
		Object.entries(params).forEach(([k, v]) => {
			if (v != "") url.searchParams.set(k, v)
		})
		return url
	}
}
