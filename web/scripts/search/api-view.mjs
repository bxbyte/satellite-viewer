import { createNamedFields } from "./fields.mjs"
import { createEl, getElement } from "../utils.mjs"

export class ApiView {
	/** Form with API entry */
	#formEl = getElement("form[role=search]")

	/** API url "input" */
	#urlEl = getElement("input[name=url]", this.#formEl)

	/** API selection input */
	#apiNameEl = getElement("select[name=apiName]", this.#formEl)

	/** API params list */
	#paramsEl = getElement("[name=options] ul", this.#formEl)

	/** API add field button  */
	#addFieldEl = getElement("button[name=add-option]", this.#formEl)

	/**
	 * Form view handling the API
	 * @param {string[]} apiNames
	 */
	constructor(apiNames) {
		// Set all APIs option
		this.#apiNameEl.append(...apiNames.map((v) => new Option(v, v)))
	}

	/** @param {boolean} isLoading */
	set isLoading(isLoading) {
		this.#formEl.classList.toggle("loading", isLoading)
	}

	/** @param {string} apiName */
	set apiName(apiName) {
		this.#apiNameEl.value = apiName
		this.#paramsEl.innerHTML = ""
	}

	/** @param {(params: ApiView['data']['params']) => void} onParamsChange */
	set onParamsChange(onParamsChange) {
		this.#formEl.addEventListener("input", () => onParamsChange(this.data.params))
	}

	/** @param {() => void} onAddParam */
	set onAddParam(onAddParam) {
		this.#addFieldEl.addEventListener("click", onAddParam)
	}

	/** @param {(apiName: string) => void} onApiChange */
	set onApiChange(onApiChange) {
		this.#apiNameEl.addEventListener("input", () => onApiChange(this.data.apiName))
	}

	/** @param {(url: URL) => void} onSearch */
	set onSearch(onSearch) {
		this.#formEl.addEventListener("submit", (ev) => {
			ev.preventDefault()
			onSearch(new URL(this.#urlEl.value))
		})
	}

	get hasValidParams() {
		return this.#formEl.checkValidity()
	}

	/** @param {URL} url */
	set url(url) {
		this.#urlEl.value = url
		this.#urlEl.scrollTo({ left: this.#urlEl.scrollWidth })
	}

	/**
	 * Add a new parameter field
	 *
	 * @param {Parameters<typeof createNamedFields>['0']['fields']} params Parameters' field definition
	 * @param {string?} name Default param name
	 * @param {string?} value Default param value
	 */
	addParamField(params, name, value) {
		const fieldRow = document.createElement("li")

		let { fieldInputEl, fieldNameEl } = createNamedFields({
			label: "Select API options",
			groupName: "params",
			fields: params,
			name,
			value,
		})

		// Delete button
		const optRemoveBtnEl = createEl("button", {
			type: "button",
			onclick: () => {
				fieldRow.remove()
				this.#formEl.dispatchEvent(new InputEvent("input")) // Fix to notify a change in parameters
				this.#addFieldEl.disabled = this.#paramsEl.childElementCount >= params.length
			},
		})

		fieldRow.append(fieldNameEl, optRemoveBtnEl, fieldInputEl)
		this.#paramsEl.appendChild(fieldRow)
		this.#addFieldEl.disabled = this.#paramsEl.childElementCount >= params.length

		return fieldRow
	}

	/**
	 * Get aggregated form data
	 *
	 * @type {{apiName: string, url: string, params: Record<string, *>}}
	 */
	get data() {
		const data = {}
		new FormData(this.#formEl).forEach((v, k) => {
			const keys = k.split(".")
			keys.reduce((acc, name, index) => {
				if (index === keys.length - 1) {
					acc[name] = v
				} else {
					acc[name] = acc[name] || {}
				}
				return acc[name]
			}, data)
		})
		return data
	}
}
