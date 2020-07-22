import express from 'express';

const cspMiddleware = function (req, res, next) {
	res.set(
		'Content-Security-Policy',
		`default-src 'none'; child-src 'none'; img-src 'self'; object-src 'none'; script-src 'self'; style-src 'self'; worker-src 'self'; manifest-src 'self'; report-uri /csp/report`
	);
	return next();
};

const router = express.Router();

/* GET home page. */
router.get('/', cspMiddleware, function (req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/content1', cspMiddleware, function (req, res, next) {
	res.render('content1', { title: 'Content 1' });
});

router.get('/content2', cspMiddleware, function (req, res, next) {
	res.render('content2', { title: 'Content 2' });
});

router.get('/content3', cspMiddleware, function (req, res, next) {
	res.render('content3', { title: 'Content 3' });
});

export default router;
