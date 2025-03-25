import { getElement } from "../utils.mjs"

export class SatelliteListView {
	/** API results list */
	#satellitesEl = getElement("[name=satellites] ul")

	/** @param {import("../satellite.mjs").Satellite[]} satellites */
	set satellites(satellites) {
		this.#satellitesEl.parentElement.dataset.totalItems = satellites.length
		const rows = satellites.map(({ name }) => {
			const row = document.createElement("li")
			row.innerText = name
			return row
		})
		this.#satellitesEl.replaceChildren(...rows)
	}
}
