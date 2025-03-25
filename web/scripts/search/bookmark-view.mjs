import { getElement } from "../utils.mjs"
import { createEl } from "../utils.mjs"

/**
 * Form view handling bookmark related manipulation
 */
export class BookmarkView {
	/** Bookmarks dialog */
	#dialogEl = getElement("dialog")

	/** Bookmarks list */
	#bookmarksEl = getElement("ul", this.#dialogEl)

	/** Bookmarks add/remove button */
	#toggleEl = getElement("button[name=toggle-bookmark]")

	/** Bookmark open dialog button */
	#openDialogEl = getElement("button[name=open-bookmark]")

	/** @type {(url: URL) => void} */
	onSelectBookmark = () => {}

	/** @type {(url: URL) => void} */
	onRemoveBookmark = () => {}

	/** @param {() => void} onOpenDialog */
	set onOpenDialog(onOpenDialog) {
		this.#openDialogEl.addEventListener("click", onOpenDialog)
	}

	/** @param {() => void} onToggleBookmark */
	set onToggleBookmark(onToggleBookmark) {
		this.#toggleEl.addEventListener("click", onToggleBookmark)
	}

	/**
	 * Open bookmarks dialog
	 *
	 * @param {URL[]} bookmarkedURLs
	 */
	showDialog(bookmarkedURLs) {
		const rows = bookmarkedURLs.map((url) => {
			const row = createEl("li", {
				textContent: url,
				// Set clicked url
				onclick: () => {
					this.onSelectBookmark(url)
					this.#dialogEl.close()
				},
			})

			// Append "remove from bookmark" button
			row.appendChild(
				createEl("button", {
					onclick: (ev) => {
						ev.stopPropagation() // Prevent triggering the row onclick
						this.onRemoveBookmark(url)
						row.remove()
					},
				})
			)

			return row
		})

		this.#bookmarksEl.replaceChildren(...rows)
		this.#dialogEl.showModal()
	}

	/** @param {boolean} isBookmarked */
	set isBookmarked(isBookmarked) {
		this.#toggleEl.classList.toggle("bookmarked", isBookmarked)
	}

	/** @param {boolean} isBookmarkable */
	set isBookmarkable(isBookmarkable) {
		this.#toggleEl.disabled = !isBookmarkable
	}
}
