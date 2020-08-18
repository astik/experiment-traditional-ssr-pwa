import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import babelify from 'express-babelify-middleware';
import fs from 'fs';
import createError from 'http-errors';
import https from 'https';
import sassMiddleware from 'node-sass-middleware';
import path from 'path';
import url from 'url';
import indexRouter from './routes/index.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3443;

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser());

app.use('/', indexRouter);

app.use(
	'/public',
	sassMiddleware({
		src: path.join(__dirname, 'scss'),
		dest: 'public',
		indentedSyntax: false,
		sourceMap: true,
	})
);

app.use('/public/sw.js', function (req, res, next) {
	res.set('Service-Worker-Allowed', '/');
	return next();
}, babelify('src-front/sw.js'));

app.use('/public', express.static('public'));

app.post(`/csp/report`, bodyParser.json({ type: 'application/csp-report' }), (req, res) => {
	console.log('CSP header violation', req.body[`csp-report`]);
	res.status(204).end();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	// render the error page
	res.status(err.status || 500);
	res.render('error', { title: 'Error' });
});

https
	.createServer(
		{
			key: fs.readFileSync('server.key'),
			cert: fs.readFileSync('server.pem'),
		},
		app
	)
	.on('error', (error) => {
		if (error.syscall !== 'listen') {
			throw error;
		}
		switch (error.code) {
			case 'EACCES':
				console.error(`${PORT} requires elevated privileges`);
				process.exit(1);
				break;
			case 'EADDRINUSE':
				console.error(`${PORT} is already in use`);
				process.exit(1);
				break;
			default:
				throw error;
		}
	})
	.on('listening', () => {
		console.log(`Listening on port ${PORT}.`);
	})
	.listen(PORT);
