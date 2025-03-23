import { getElement } from "../utils.mjs"
import { createEl } from "../utils.mjs"
import { bookmarks } from "../bookmark.mjs"

export class BookmarkHandler {
	/** @param {import("./form.mjs").NavigationHandler} nav */
	constructor(nav) {
		this.nav = nav

		this.bookmarksEl = getElement("ul", this.dialogEl)
		this.dialogEl = getElement("dialog")

		this.toggleBtn = getElement("button[name=toggle-bookmark]", nav.formEl)
		this.toggleBtn.addEventListener("click", this.#toggleURL.bind(this)) // Toggle url

		const openBtnEl = getElement("button[name=open-bookmark]", nav.formEl)
		openBtnEl.addEventListener("click", this.#openDialog.bind(this)) // Open dialog
	}

	#openDialog() {
		const rows = [...bookmarks.bookmarks].map((url) => {
			const row = createEl("li", {
				textContent: url,
				// Set clicked url
				onclick: () => {
					this.nav.updateFromURL(url)
					this.dialogEl.close()
				},
			})

			// Append "remove from bookmark" button
			row.appendChild(
				createEl("button", {
					onclick: (ev) => {
						ev.stopPropagation() // Prevent triggering the row onclick
						bookmarks.delete(url)
						row.remove()
						this.isBookmarked = bookmarks.has(url)
					},
				})
			)

			return row
		})

		this.bookmarksEl.replaceChildren(...rows)
		this.dialogEl.showModal()
	}

	#toggleURL() {
		this.isBookmarked = bookmarks.toggle(this.nav.data.url)
	}

	updateURLToggle(url = this.nav.data.url) {
		this.isBookmarked = bookmarks.has(url)
		this.toggleBtn.disabled = url.toString() == this.nav.api.entrypoint.toString() // Shouldn't be markable when the url is the default
	}

	/** @param {boolean} isBookmarked */
	set isBookmarked(isBookmarked) {
		this.toggleBtn.classList.toggle("bookmarked", isBookmarked)
	}
}
