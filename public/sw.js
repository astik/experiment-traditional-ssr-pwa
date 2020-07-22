console.log('service worker');

self.addEventListener('install', function (event) {
	console.log('service worker install', event);
});

self.addEventListener('fetch', function (event) {
	console.log('fetch', event);
});
