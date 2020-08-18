import parse5 from 'parse5';

function extract(root) {
	if (root.nodeName === 'img') {
		return root.attrs.filter((attr) => attr.name === 'src').map((attr) => attr.value);
	}
	if (
		root.nodeName === 'link' &&
		root.attrs.filter((attr) => attr.name === 'rel' && attr.value === 'stylesheet').length > 0
	) {
		return root.attrs.filter((attr) => attr.name === 'href').map((attr) => attr.value);
	}
	if (root.nodeName === 'script') {
		return root.attrs.filter((attr) => attr.name === 'src').map((attr) => attr.value);
	}
	if (!!root.childNodes) {
		return root.childNodes.reduce((accu, childNode) => {
			return [...accu, ...extract(childNode)];
		}, []);
	}
	return [];
}

export function extractResourcesUrl(htmlAsStr) {
	const document = parse5.parse(htmlAsStr);
	const result = extract(document);
	return [...new Set(result)];
}
