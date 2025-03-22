const MAX_CACHED_LIVE = 3 * 60 * 60 * 1e3 // 3h hours max live

function getCurrentHour() {
	return Math.floor(Date.now() / MAX_CACHED_LIVE) * MAX_CACHED_LIVE
}

async function cleanCache() {
	return Promise.all((await caches.keys()).filter((k) => getCurrentHour() > parseInt(k)).map((k) => caches.delete(k)))
}

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
			const cache = await caches.open(getCurrentHour())
			let res = await cache.match(ev.request)

			if (!res) {
				res = await fetch(ev.request)
				await cache.put(ev.request, res.clone())
			}

			return res
		})()
	)
)
