const config = require('config');
const log = require('../libs/logger')(module);
const appPort = config.port;

const {server: appServer} = require('../server');
let appKey = 'app';

appServer.listen(appPort);
appServer.on('error', onError(appKey, appPort));
appServer.on('listening', onListening(appKey, appServer));

process.on('unhandledRejection', onUnhandledRejection);

/**
 * Event listener for unhandled errors
 */
function onUnhandledRejection(error) {
	log.error(error, () => {
		process.exit(1);
	});
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(key, port) {
	return (error) => {
		if (error.syscall !== 'listen') {
			throw error;
		}

		let bind = typeof port === 'string'
			? 'Pipe ' + port
			: 'Port ' + port;

		// handle specific listen errors with friendly messages
		switch (error.code) {
			case 'EACCES':
				log.error(`Server "${key}" ${bind} requires elevated privileges`);
				process.exit(1);
				break;
			case 'EADDRINUSE':
				log.error(`Server "${key}" ${bind} is already in use`);
				process.exit(1);
				break;
			default:
				throw error;
		}
	};
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(key, Server) {
	return () => {
		let addr = Server.address();
		let bind = typeof addr === 'string'
			? 'pipe ' + addr
			: 'port ' + addr.port;
		log.info(`Server '${key}' ${process.env.pm_id ? `instance ${process.env.pm_id} ` : ''}(${config.env}) start listening on ${bind}`);
	};
}