const storageKey = "BOOKMARKS"

export const bookmarks = {
    /**
     * @type {Set<string>}
     */
    get bookmarks() {
        const saved = JSON.parse(localStorage.getItem(storageKey))
        return new Set(saved instanceof Array ? saved : [])
    },
    /**
     * @param {Set<string>} bookmarks
     */
    set bookmarks(bookmarks) {
        return localStorage.setItem(storageKey, JSON.stringify([...bookmarks.values()]))
    },
    /**
     * 
     * @param {URL | string} url 
     */
    has(url) {
        return this.bookmarks.has(url.toString())
    },
    /**
     * 
     * @param {URL | string} url 
     */
    add(url) {
        this.bookmarks = this.bookmarks.add(url.toString())
    },
    /**
     * 
     * @param {URL | string} url 
     */
    delete(url) {
        const bookmarks = this.bookmarks
        bookmarks.delete(url.toString())
        this.bookmarks = bookmarks
    },
    /**
     * 
     * @param {URL | string} url 
     */
    toggle(url) {
        const bookmarks = this.bookmarks,
            isBookmarked = bookmarks.has(url.toString())

        if (isBookmarked) bookmarks.delete(url)
        else bookmarks.add(url)
        this.bookmarks = bookmarks

        return !isBookmarked
    }
}