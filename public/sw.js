console.log('[SW] service workers');
const CACHE = 'my-cache';

self.addEventListener('install', function (event) {
	console.log('[SW] service worker install', event);
	event.waitUntil(
		caches.open(CACHE).then(function (cache) {
			return cache.addAll(['/offline']);
		})
	);
});

self.addEventListener('fetch', function (event) {
	console.log('[SW] fetch', event);
	const request = event.request;
	const url = request.url;
	event.respondWith(
		caches.open(CACHE).then(function (cache) {
			return cache.match(url).then(function (response) {
				let fetchAndCache;
				const isOnline = navigator.onLine;
				console.log('isOnline', isOnline);
				if (isOnline) {
					fetchAndCache = fetch(request).then(function (networkResponse) {
						const url = request.url;
						console.log('[SW] fetch: put in cache', url);
						cache.put(url, networkResponse.clone());
						return networkResponse;
					});
				}
				if (response) {
					console.log('[SW] fetch: cache hit', url);
					return response;
				}
				if (isOnline) {
					console.log('[SW] fetch: get it from network first', url);
					return fetchAndCache;
				}
				return cache.match('/offline');
			});
		})
	);
});

self.addEventListener('message', function (event) {
	const type = event.data.type;
	if (type === 'warmup') {
		const url = event.data.url;
		console.log('[SW] warmup url', url);
	} else {
		console.info('[SW] unknown message type', type);
	}
});
