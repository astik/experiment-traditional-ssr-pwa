const CACHE = 'my-cache';

self.addEventListener('install', function (event) {
	self.skipWaiting();
	event.waitUntil(
		caches.open(CACHE).then(function (cache) {
			return cache.addAll(['/offline', '/public/offline.png']);
		})
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(clients.claim());
});

self.addEventListener('fetch', function (event) {
	const request = event.request;
	const url = request.url;
	event.respondWith(
		caches.open(CACHE).then(function (cache) {
			return cache.match(url).then(function (response) {
				const isOnline = navigator.onLine;
				if (response) {
					if (isOnline) {
						fetchAndCache(request);
					}
					return response;
				}
				if (isOnline) {
					return fetchAndCache(request);
				}
				if (request.destination === 'image') {
					return cache.match('/public/offline.png');
				}
				if (request.destination === 'document') {
					return cache.match('/offline');
				}
				console.log('offline and request destination not managed', request);
			});
		})
	);
});

self.addEventListener('message', function (event) {
	const type = event.data.type;
	if (type === 'warmup') {
		const url = event.data.url;
		caches.open(CACHE).then(function (cache) {
			cache.match(url).then(function (response) {
				if (response) {
					// no need to warmup again
					return;
				}
				console.log('[SW] warmup url', url);
				fetch(url).then(function (networkResponse) {
					// TODO enable cache
					// cache.put(url, networkResponse.clone());
					networkResponse.text().then((text) => {
						// TODO process html stream
						console.log('TODO process html stream', text);
					});
				});
			});
		});
	} else {
		console.info('[SW] unknown message type', type);
	}
});

function fetchAndCache(request) {
	return caches.open(CACHE).then(function (cache) {
		return fetch(request).then(function (networkResponse) {
			cache.put(request.url, networkResponse.clone());
			return networkResponse;
		});
	});
}
