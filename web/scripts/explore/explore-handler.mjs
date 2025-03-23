import { throttleFn, getElement } from "../utils.mjs"
import { APIHandler } from "./api-handler.mjs"

export class ExploreHandler {
    /** Search handler in charge of exploring satellites */
    constructor() {
		this.formEl = getElement("form#explore")
		this.satellitesEl = getElement("[name=results] ul", this.formEl)
		/** API sub-handler */
		this.api = new APIHandler(this)
    }

	/**
     * "Event" triggered on search result 
	 * @param {(satellites: import("../satellite.mjs").Satellite[]) => void} callback
	 */
	set onresults(callback) {
		const search = throttleFn(async () => {
			// API call
			this.isLoading = true
			const satellites = await this.api.loadSatellites()
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
	 * Set loading status
	 * @param {boolean} isLoading
	 */
	set isLoading(isLoading) {
		this.formEl.classList.toggle("loading", isLoading)
	}

	/**
	 * Set satellites lists
	 * @param {import("../satellite.mjs").Satellite[]} satellites
	 */
	set satellites(satellites) {
		this.satellitesEl.parentElement.dataset.totalItems = satellites.length
		const rows = satellites.map(({ name }) => {
			const row = document.createElement("li")
			row.innerText = name
			return row
		})
		this.satellitesEl.replaceChildren(...rows)
	}
}