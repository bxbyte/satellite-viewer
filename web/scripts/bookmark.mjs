/** Bookmark local storage key */
const storageKey = "BOOKMARKS"

export const bookmarks = {
	/**
	 * Get bookmarks from local storage
	 * @type {Set<string>}
	 */
	get bookmarks() {
		const saved = JSON.parse(localStorage.getItem(storageKey))
		return new Set(saved instanceof Array ? saved : [])
	},
	/**
	 * Set bookmarks in local storage
	 * @param {Set<string>} bookmarks
	 */
	set bookmarks(bookmarks) {
		return localStorage.setItem(storageKey, JSON.stringify([...bookmarks.values()]))
	},
	/**
	 * Check if url is already bookmarked
	 * @param {URL | string} url
	 */
	has(url) {
		return this.bookmarks.has(url.toString())
	},
	/**
	 * Add bookmark
	 * @param {URL | string} url
	 */
	add(url) {
		this.bookmarks = this.bookmarks.add(url.toString())
	},
	/**
	 * Delete bookmark
	 * @param {URL | string} url
	 */
	delete(url) {
		const bookmarks = this.bookmarks
		bookmarks.delete(url.toString())
		this.bookmarks = bookmarks
	},
	/**
	 * Add/remove url in bookmarks
	 * @param {URL | string} url
	 */
	toggle(url) {
		const bookmarks = this.bookmarks,
			isBookmarked = bookmarks.has(url.toString())

		if (isBookmarked) bookmarks.delete(url)
		else bookmarks.add(url)
		this.bookmarks = bookmarks

		return !isBookmarked
	},
}
