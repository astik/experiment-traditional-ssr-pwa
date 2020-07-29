if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/public/sw.js', { scope: '/' }).then(function (registration) {
		console.log('register registration', registration);
		document.addEventListener('warmup', (event) => {
			registration.active.postMessage({ ...event.detail, type: 'warmup' });
		});
	});
}
