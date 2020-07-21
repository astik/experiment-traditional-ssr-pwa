import express from 'express';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static('public'));
app.use(cookieParser());

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}.`);
});

app.on('error', (error) => {
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
});
