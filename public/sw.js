console.log('[SW] service workers');

self.addEventListener('install', function (event) {
	console.log('[SW] service worker install', event);
});

self.addEventListener('fetch', function (event) {
	console.log('[SW] fetch', event);
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
