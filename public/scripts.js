if ('serviceWorker' in navigator) {
	console.log('serviceWorker is available');
	navigator.serviceWorker.register('/public/sw.js', { scope: '/' }).then(function (reg) {
		console.log('reg', reg);
		// suivre l'état de l'enregistrement du Service Worker : `installing`, `waiting`, `active`
	});
}
