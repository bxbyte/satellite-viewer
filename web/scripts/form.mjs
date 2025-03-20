import { throttleFn, getElement } from "./utils.mjs";
import { APIs, defaultAPI } from "./api/index.mjs"

/**
 * 
 * @param {string} displayedName 
 * @param {string} name 
 * @param {string[]} options 
 * @returns 
 */
function createSelect(displayedName, name, options = []) {
    const el = document.createElement("select")
    el.required = true
    el.name = name

    const defaultOption = new Option(displayedName, '', true)
    defaultOption.hidden = true

    const select = {
        el,
        /**
         * @param {string[]} options
         */
        set options(options) {
            el.replaceChildren(
                defaultOption,
                ...el.selectedOptions,
                ...options.map(option => new Option(option))
            )
        }
    }
    select.options = options
    
    return select
}

/**
 * 
 * @param {Record<string, *>} attr 
 * @returns 
 */
function createInput(attr) {
    const el = document.createElement("input")
    el.required = true
    Object.entries(attr).forEach(([k, v]) => el.setAttribute(k, v))
    return el
}

export class SearchForm {

    /**
     * 
     * @param {HTMLFormElement} formEl 
     */
    constructor(formEl) {
        this.api = defaultAPI
        this.formEl = formEl
        
        this.optionsEl = this.#getFieldEl("options", true)
        this.searchResultsEl = this.#getFieldEl("results", true)
        this.urlInputEl = this.#getFieldEl("url")

        this.addOptionEl = this.#getFieldEl("add-option")
        this.addOptionEl.addEventListener("click", () => {
            this.addOption()
        })

        const apiNameEl = this.#getFieldEl("apiName")
        apiNameEl.append(...Object.keys(APIs).map((apiName) => 
            new Option(apiName, apiName, null, apiName == this.api.name)
        ))
        apiNameEl.addEventListener("input", () => this.refreshAPI())

        this.formEl.addEventListener("input", () => this.refreshURL())

        this.refreshAPI()
        this.refreshURL()
    }

    /**
     * 
     * @template {boolean} T
     * @param {string} fieldName 
     * @param {T} list 
     * @returns {T extends true ? HTMLUListElement : (HTMLInputElement | HTMLSelectElement)}
     */
    #getFieldEl(fieldName, list = false) {
        return getElement(`[name='${fieldName}']` + (list ? ' ul' : ''), this.formEl)
    }

    refreshURL() {
        const { params } = this.data
        this.urlInputEl.value = this.api.buildURL(params)
        this.urlInputEl.scrollTo({left: this.urlInputEl.scrollWidth})
    }

    refreshOptions() {
        this.addOptionEl.disabled = this.optionsEl.childElementCount >=  this.api.optionsName.size
        this.refreshURL()
    }

    resetOptions() {
        this.optionsEl.innerHTML = ''
        this.refreshOptions()
    }

    refreshAPI() {
        const { apiName } = this.data
        if (this.api.name == apiName) return
        this.api = APIs[apiName]
        this.resetOptions()
    }

    addOption() {
        const optRowEl = document.createElement("li")

        // Placeholder before choosing option
        let optInputEl = createInput({ disabled: true, placeholder: 'value' })

        const select = createSelect("option", '*')
        optRowEl.appendChild(select.el)
        
        select.el.addEventListener("focus", () => {
            const { params } = this.data
            select.options = [...this.api.optionsName.difference(new Set(Object.keys(params)))]
        }, false)
        
        select.el.addEventListener("change", () => {
            const optInputAttrs = this.api.options[select.el.value]
            const newOptInputEl = 
                optInputAttrs instanceof Array 
                ? createSelect(
                    "value", 
                    `params.${select.el.value}`, 
                    optInputAttrs
                ).el
                : createInput({
                    name: `params.${select.el.value}`,
                    ...this.api.options[select.el.value]
                })
            optInputEl.replaceWith(newOptInputEl)
            optInputEl = newOptInputEl
        })

        optRowEl.appendChild(optInputEl)
        
        const optRemoveBtnEl = document.createElement("button")
        optRowEl.appendChild(optRemoveBtnEl)

        optRemoveBtnEl.type = "button"
        optRemoveBtnEl.addEventListener("click", () => {
            optRowEl.remove()
            this.refreshOptions()
        })

        this.optionsEl.appendChild(optRowEl)
        this.refreshOptions()
    }

    /**
     * @type {{apiName: string, url: string, search: string, params: Record<string, *>}}
     */
    get data() {
        const data = {};
        new FormData(this.formEl).forEach((v, k) => {
            const keys = k.split('.');
            keys.reduce((acc, name, index) => {
            if (index === keys.length - 1) {
                acc[name] = v;
            } else {
                acc[name] = acc[name] || {};
            }
            return acc[name];
            }, data);
        })
        return data
    }

    /**
     * @param {(satellites: import("./satellite.mjs").Satellite[]) => void} callback 
     */
    set onresults(callback) {
        this.formEl.addEventListener("submit", throttleFn(async () => {
            const { url } = this.data
            if (!url) return

            // API call
            this.isLoading = true
            const satellites = await this.api.search(url);
            this.isLoading = false

            // Update view
            this.satellites = satellites

            // Update callback
            callback(satellites)
        }))
    }

    /**
     * 
     * @param {boolean} isLoading 
     */
    set isLoading(isLoading) {
        this.formEl.classList.toggle("loading", isLoading)
    }

    /**
     * 
     * @param {import("./satellite.mjs").Satellite[]} satellites 
     */
    set satellites(satellites) {
        this.searchResultsEl.parentElement.dataset.totalItems = satellites.length
        const rows = satellites.map(({ name }) => {
            const row = document.createElement("li");
            row.innerText = name;
            return row;
        });
        this.searchResultsEl.replaceChildren(...rows);
    }
}