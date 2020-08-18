import { extractResourcesUrl } from './extractResourcesUrl';

test('extract nothing', () => {
	const htmlAsStr = `
<html>
	<head>
		<title>Title</title>
	</head>
	<body>
		FOOBAR
	</body>
</html>
`;
	const result = extractResourcesUrl(htmlAsStr);
	expect(result).toBeDefined();
	expect(result.length).toBe(0);
});

test('do not extract not needed resource', () => {
	const htmlAsStr = `
<html>
	<head>
		<title>Title</title>
		<link rel="apple-touch-icon" sizes="180x180" href="/public/apple-touch-icon.png">
	</head>
	<body>
		FOOBAR
	</body>
</html>
`;
	const result = extractResourcesUrl(htmlAsStr);
	expect(result).toBeDefined();
	expect(result.length).toBe(0);
});

test('extract images', () => {
	const imageSrc = ['./foo.png', './bar.jpg'];
	const htmlAsStr = `
<html>
	<head>
		<title>Title</title>
	</head>
	<body>
		<img src="${imageSrc[0]}" />
		<img src="${imageSrc[1]}" />
	</body>
</html>
`;
	const result = extractResourcesUrl(htmlAsStr);
	expect(result).toBeDefined();
	expect(result.length).toBe(imageSrc.length);
	expect(result).toEqual(expect.arrayContaining(imageSrc));
});

test('extract distinct resources', () => {
	const resourcesUrl = ['./foo.png', './bar.js'];
	const htmlAsStr = `
<html>
	<head>
		<title>Title</title>
	</head>
	<body>
		<img src="${resourcesUrl[0]}" />
		<img src="${resourcesUrl[0]}" />
		<img src="${resourcesUrl[0]}" />
		<script src="${resourcesUrl[1]}"></script>
	</body>
</html>
`;
	const result = extractResourcesUrl(htmlAsStr);
	expect(result).toBeDefined();
	expect(result.length).toBe(resourcesUrl.length);
	expect(result).toEqual(expect.arrayContaining(resourcesUrl));
});

test('extract stylesheets', () => {
	const stylesheetHref = ['./foo.js', './bar.js'];
	const htmlAsStr = `
<html>
	<head>
		<title>Title</title>
		<link rel="stylesheet" href="${stylesheetHref[0]}" />
		<link rel="stylesheet" href="${stylesheetHref[1]}" />
	</head>
	<body>
		FOOBAR
	</body>
</html>
`;
	const result = extractResourcesUrl(htmlAsStr);
	expect(result).toBeDefined();
	expect(result.length).toBe(stylesheetHref.length);
	expect(result).toEqual(expect.arrayContaining(stylesheetHref));
});

test('extract scripts in head', () => {
	const scriptSrc = ['./foo.js', './bar.js'];
	const htmlAsStr = `
<html>
	<head>
		<title>Title</title>
		<script src="${scriptSrc[0]}"></script>
		<script src="${scriptSrc[1]}"></script>
	</head>
	<body>
		FOOBAR
	</body>
</html>
`;
	const result = extractResourcesUrl(htmlAsStr);
	expect(result).toBeDefined();
	expect(result.length).toBe(scriptSrc.length);
	expect(result).toEqual(expect.arrayContaining(scriptSrc));
});

test('extract scripts in body', () => {
	const scriptSrc = ['./foo.js', './bar.js'];
	const htmlAsStr = `
<html>
	<head>
		<title>Title</title>
	</head>
	<body>
		FOOBAR
		<script src="${scriptSrc[0]}"></script>
		<script src="${scriptSrc[1]}"></script>
	</body>
</html>
`;
	const result = extractResourcesUrl(htmlAsStr);
	expect(result).toBeDefined();
	expect(result.length).toBe(scriptSrc.length);
	expect(result).toEqual(expect.arrayContaining(scriptSrc));
});
