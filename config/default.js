const fs = require('fs');
const path = require('path');

const env = process.env;
if (!env.NODE_ENV) {
	env.NODE_ENV = 'development';
}
const DEBUG = env.NODE_ENV !== 'production';

let config = {
	env    : env.NODE_ENV,
	debug  : DEBUG,
	port   : env.PORT || 8080,
	pathToRootDir: path.join(__dirname, '..')
};

/**
 * ssl
 */
const ssl = {
	use: env.SSL === 'true' || env.SSL === 't' || false,
};
if (ssl.use) {
	const PATH_TO_SSL_DIR = path.join(__dirname, '..', 'ssl');
	ssl.key = fs.readFileSync(path.join(PATH_TO_SSL_DIR, env.SSL_KEY || 'ca.key'));
	ssl.crt = fs.readFileSync(path.join(PATH_TO_SSL_DIR, env.SSL_CRT || 'ca.crt'));
}
config.ssl = ssl;

/**
 * storage
 */
const storage = {
	sqlite: {
		main: {
      filename: env.DB_FILENAME || '~/.config/ico-bot/byteball.sqlite'
		}
	},
};
config.storage = storage;

module.exports = config;