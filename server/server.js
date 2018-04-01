const http = require('http');
const https = require('https');
const config = require('config');

const app = require('./app');
let server;

if (config.ssl.use) {
	server = https.createServer({
		key: config.ssl.key,
		cert: config.ssl.crt
	}, app);
} else {
	server = http.createServer(app);
}

module.exports = { server, app };
