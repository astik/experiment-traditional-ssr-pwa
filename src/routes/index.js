import express from 'express';

const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/content1', function (req, res, next) {
	res.render('content1', { title: 'Content 1' });
});

router.get('/content2', function (req, res, next) {
	res.render('content2', { title: 'Content 2' });
});

router.get('/content3', function (req, res, next) {
	res.render('content3', { title: 'Content 3' });
});

export default router;
