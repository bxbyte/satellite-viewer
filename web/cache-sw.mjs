/** Maximum cached live duration (3h) */
const MAX_CACHED_LIVE = 3 * 60 * 60 * 1e3

/** Get current time rounded with @see MAX_CACHED_LIVE */
function getCacheTime() {
	return Math.floor(Date.now() / MAX_CACHED_LIVE) * MAX_CACHED_LIVE
}

/** Clean cache storage (remove dead cache) */
async function cleanCache() {
	return Promise.all((await caches.keys()).filter((k) => getCacheTime() > parseInt(k)).map((k) => caches.delete(k)))
}

// Setup worker
addEventListener("activate", (ev) => {
	// Take control of the current window
	ev.waitUntil(clients.claim())
	// Cache cleaning
	ev.waitUntil(cleanCache())
	setTimeout(cleanCache, MAX_CACHED_LIVE)
})

// Handle fetch request
addEventListener("fetch", (ev) =>
	ev.respondWith(
		(async () => {
			const cache = await caches.open(getCacheTime())
			let res = await cache.match(ev.request)

			if (!res) {
				res = await fetch(ev.request)
				await cache.put(ev.request, res.clone())
			}

			return res
		})()
	)
)
