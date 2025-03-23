import { getElement } from "../utils.mjs"
import { createEl } from "../utils.mjs"
import { bookmarks } from "../bookmark.mjs"

export class BookmarkHandler {
	/** 
	 * Bookmark handler in charge of handling bookmarks
	 * @param {import("./api-handler.mjs").APIHandler} api Parent handler
	 */
	constructor(api) {
		/** Parent handler */
		this.api = api

		/** Bookmarks dialog */
		this.dialogEl = getElement("dialog")
		/** Bookmarks list */
		this.bookmarksEl = getElement("ul", this.dialogEl)

		/** Bookmarks add/remove button */
		this.toggleBtn = getElement("button[name=toggle-bookmark]", this.api.explore.formEl)
		this.toggleBtn.addEventListener("click", this.toggleURL.bind(this))

		/** Bookmark open dialog button */
		const openBtnEl = getElement("button[name=open-bookmark]", this.api.explore.formEl)
		openBtnEl.addEventListener("click", this.openDialog.bind(this))
	}

	/** Add / remove current url in bookmark */
	toggleURL() {
		this.isBookmarked = bookmarks.toggle(this.api.data.url)
	}

	/** Open bookmarks dialog */
	openDialog() {
		const rows = [...bookmarks.bookmarks].map((url) => {
			const row = createEl("li", {
				textContent: url,
				// Set clicked url
				onclick: () => {
					this.api.updateFromURL(url)
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

	/**
	 * Update toggle button status based on current url
	 * @param {URL?} url URL to compare to set toggle status
	 */
	updateToggleStatus(url = this.api.data.url) {
		this.isBookmarked = bookmarks.has(url)
		this.toggleBtn.disabled = url.toString() == this.api.currentAPI.entrypoint.toString() // Shouldn't be markable when the url is the default
	}

	/**
	 * Fill toggle button if bookmarked, outline otherwise
	 * @param {boolean} isBookmarked 
	 */
	set isBookmarked(isBookmarked) {
		this.toggleBtn.classList.toggle("bookmarked", isBookmarked)
	}
}
