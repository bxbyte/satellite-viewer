import { throttleFn, getElement } from "../utils.mjs"
import { createNamedFields } from "./fields.mjs"
import { createEl } from "../utils.mjs"
import { APIs, defaultAPI, matchAPIFromUrl } from "../api/index.mjs"
import { BookmarkHandler } from "./bookmark-handler.mjs"

export class NavigationHandler {
	/**
	 * Form handler, in charge of user interaction with the navigation bar
	 */
	constructor() {
		this.api = defaultAPI

		this.formEl = getElement("form#navigation")
		this.formEl.addEventListener("input", this.updateURL.bind(this))

		this.fieldsEl = getElement("[name=options] ul", this.formEl)
		this.searchResultsEl = getElement("[name=results] ul", this.formEl)
		this.urlInputEl = getElement("input[name=url]")

		this.apiNameEl = getElement("select[name=apiName]", this.formEl)
		this.apiNameEl.append(
			...Object.keys(APIs).map(
				// Set all APIs option
				(apiName) => new Option(apiName, apiName, null, apiName == this.api.name)
			)
		)
		this.apiNameEl.addEventListener("input", this.updateAPI.bind(this)) // Update API on select

		this.addFieldEl = getElement("button[name=add-option]")
		this.addFieldEl.addEventListener("click", this.addField.bind(this)) // Add field

		this.bookmark = new BookmarkHandler(this) // Bookmark sub handler

		this.setDefaultField()
	}

	setDefaultField() {
		this.addField(this.api.defaultField)
		this.updateURL()
	}

	/**
	 * Update generated URL
	 */
	updateURL() {
		const url = this.api.buildURL(this.data.params)
		this.bookmark.updateURLToggle(url)

		// Update URL field
		this.urlInputEl.value = url
		this.urlInputEl.scrollTo({ left: this.urlInputEl.scrollWidth })
	}

	/**
	 * Update API fields
	 */
	updFields() {
		this.addFieldEl.disabled = this.addFieldEl.childElementCount >= this.api.fields.length
	}

	/**
	 * Reset API fields
	 */
	resetFields() {
		this.fieldsEl.innerHTML = ""
	}

	updateAPI() {
		const { apiName } = this.data
		if (this.api.name == apiName) return
		this.api = APIs[apiName]
		this.resetFields()
		this.setDefaultField()
	}

	/**
	 *
	 * @param {URL | string} url
	 */
	updateFromURL(url) {
		url = new URL(url) // Make sure to have an URL

		// Update current API
		const api = matchAPIFromUrl(url)
		if (!api) throw new Error("URL doesn't match any API")
		this.api = api
		this.apiNameEl.value = this.api.name

		// Update fields
		this.resetFields()
		url.searchParams.forEach((v, k) => {
			if (api.entrypoint.searchParams.has(k)) return
			this.addField(k, v)
		})

		// And update URL based on the generated fields,
		// not directly the URL given
		this.updateURL()
	}

	/**
	 *
	 * @param {string?} name
	 * @param {string?} value
	 * @returns
	 */
	addField(name, value) {
		const fieldRow = document.createElement("li")

		let { fieldInputEl, fieldNameEl } = createNamedFields({
			label: "Select API options",
			groupName: "params",
			fields: this.api.fields,
			name,
			value,
		})

		// Update url when field change
		fieldNameEl.addEventListener("change", () => this.updateURL(), true)

		// Delete button
		const optRemoveBtnEl = createEl("button", {
			type: "button",
			onclick: () => {
				fieldRow.remove()
				this.updFields()
				this.updateURL()
			},
		})

		fieldRow.append(fieldNameEl, optRemoveBtnEl, fieldInputEl)
		this.fieldsEl.appendChild(fieldRow)
		this.updFields()

		return fieldRow
	}

	/**
	 * @type {{apiName: string, url: string, search: string, params: Record<string, *>}}
	 */
	get data() {
		const data = {}
		new FormData(this.formEl).forEach((v, k) => {
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

	/**
	 * @param {(satellites: import("../satellite.mjs").Satellite[]) => void} callback
	 */
	set onresults(callback) {
		const search = throttleFn(async () => {
			// API call
			this.isLoading = true
			const satellites = await this.api.search(this.data.url)
			this.isLoading = false

			// Update view
			this.satellites = satellites

			// Update callback
			callback(satellites)
		})

		this.formEl.addEventListener("submit", (ev) => {
			ev.preventDefault()
			search()
		})
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
	 * @param {import("../satellite.mjs").Satellite[]} satellites
	 */
	set satellites(satellites) {
		this.searchResultsEl.parentElement.dataset.totalItems = satellites.length
		const rows = satellites.map(({ name }) => {
			const row = document.createElement("li")
			row.innerText = name
			return row
		})
		this.searchResultsEl.replaceChildren(...rows)
	}
}
