import { defaultAPI, APIs, matchApiFromUrl } from "../api/index.mjs"
import { bookmarks } from "../bookmark.mjs"
import { throttleFn } from "../utils.mjs";

import { ApiView } from "./api-view.mjs";
import { BookmarkView } from "./bookmark-view.mjs";

export class SearchController {
    /** 
     * Current API used
     * @type {typeof defaultAPI}
     */
    #api

    /** View handling the API */
    #apiView = new ApiView(Object.keys(APIs))

    /** View handling bookmark */
    #bookmarkView = new BookmarkView() 

    /** @type {(results: Awaited<ReturnType<import("../api/api.mjs").API['search']>>)} */
    onResults = () => {}

    /**
     * Controller handling the API navigation.
     */
    constructor() {
        this.api = defaultAPI
        this.#apiView.addParamField(this.#api.params, this.#api.requiredParam)

        this.#apiView.onParamsChange = this.updateFromParams.bind(this)

        this.#apiView.onApiChange = (apiName) => {
            this.api = APIs[apiName]
            this.#apiView.addParamField(this.#api.params, this.#api.requiredParam)
        } 

        this.#apiView.onSearch = throttleFn(async (url) => {
            this.#apiView.isLoading = true
            const results = await this.#api.search(url)
            this.#apiView.isLoading = false
            this.onResults(results)
        }, 300)

        this.#bookmarkView.onOpenDialog = () => {
            this.#bookmarkView.showDialog([...bookmarks.bookmarks].map(v => new URL(v)))
        }

        this.#bookmarkView.onSelectBookmark = this.updateFromURL.bind(this)

        this.#bookmarkView.onRemoveBookmark = (url) => {
            bookmarks.delete(url)
            this.#bookmarkView.isBookmarked = bookmarks.has(this.#apiView.data.url)
        }

        this.#bookmarkView.onToggleBookmark = () => {
            this.#bookmarkView.isBookmarked = bookmarks.toggle(this.#apiView.data.url)
        }
    }

    /** @param {(typeof APIs)[number]} api */
    set api(api) {
        this.#api = api
        this.#apiView.apiName = api.name
        this.#apiView.url = api.entrypoint
        this.#apiView.params = api.params
        this.#bookmarkView.isBookmarkable = false;
    }

    /**
     * Update controller based on url parameters. 
     * 
     * @param {Record<string, *>} params 
     */
    updateFromParams(params) {
        const url = this.#api.buildURL(params)
        this.#apiView.url = url
        this.#bookmarkView.isBookmarked = bookmarks.has(url)
        this.#bookmarkView.isBookmarkable = this.#apiView.hasValidParams;
    }

    /**
     * Update controller values from url.
     * 
     * @param {URL} url 
     */
    updateFromURL(url) {
        // Update current API
        const api = matchApiFromUrl(url)
        if (!api) throw new Error("URL doesn't match any API")
        this.api = api
        this.#apiView.url = url // Overwrite url

        // Update fields
        url.searchParams.forEach((v, k) => {
            if (api.entrypoint.searchParams.has(k)) return
            this.#apiView.addParamField(this.#api.params, k, v)
        })
        
        this.#bookmarkView.isBookmarkable = this.#apiView.hasValidParams;
        this.#bookmarkView.isBookmarked = bookmarks.has(url);
    }
}