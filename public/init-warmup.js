const delayOnHover = 65;
let mouseoverTimer;

function mouseoutListener(event) {
	if (mouseoverTimer) {
		clearTimeout(mouseoverTimer);
		mouseoverTimer = undefined;
	}
}

function warmup(url) {
	var event = new CustomEvent('warmup', { detail: { url } });
	document.dispatchEvent(event);
}

function mouseoverListener(event) {
	const linkElement = event.target.closest('a');
	linkElement.addEventListener('mouseout', mouseoutListener);
	mouseoverTimer = setTimeout(() => {
		warmup(linkElement.getAttribute('href'));
		mouseoverTimer = undefined;
	}, delayOnHover);
}

document
	.querySelectorAll('.nav a')
	.forEach((link) => link.addEventListener('mouseover', mouseoverListener));
