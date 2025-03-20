export class API {
    /**
     * 
     * @param {{ name: string, entrypoint: URL, options: *, load: (res: Response) => Promise<Satellite[]>}}
     * @param {string} name 
     * @param {URL} entrypoint 
     * @param {*} options 
     * @param {} load 
     * @param {Record<string, string>} defaultParams 
     * @param {Record<string, string>} renamedParams 
     */
    constructor({name, entrypoint, options, load, defaultParams = {}, renamedParams = {}}) {
        this.name = name
        this.entrypoint = entrypoint
        Object.entries(defaultParams).forEach(([k, v]) => this.entrypoint.searchParams.set(k, v))
        this.options = options
        this.optionsName = new Set(Object.keys(options))
        this.load = load
        this.renamedParams = renamedParams
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
    buildURL(params) {
        const url = new URL(this.entrypoint)
        Object.entries(params)
            .forEach(([k, v]) => {
                if (v != "") {
                    url.searchParams.set(this.renamedParams[k] || k, v)
                }
            })
        return url
    }
}
