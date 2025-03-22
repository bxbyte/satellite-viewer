// Clean workers on hard reload
if (!navigator.serviceWorker.controller) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map(r => r.unregister()))
}

// Load cache worker
await navigator.serviceWorker.register(new URL("../cache-sw.mjs", import.meta.url), {})