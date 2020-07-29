if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/public/sw.js', { scope: '/' }).then(function (registration) {
		document.addEventListener('warmup', (event) => {
			registration.active.postMessage({ ...event.detail, type: 'warmup' });
		});
	});
}
