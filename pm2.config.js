const OS = require('os');

module.exports = {
	apps : [{
		name            : 'ico-bot-web',
		script          : './index.js',
		watch           : ['server'],
		ignore_watch    : ['node_modules','src','logs','public'],

		instance_var    : 'INSTANCE_ID',
		instances       : OS.cpus().length - 1,
		exec_mode       : 'cluster',

		env             : {
			'NODE_ENV': 'development',
		},
		env_production  : {
			'NODE_ENV': 'production'
		},

		// merge_logs      : true,
		// log_date_format : 'YYYY-MM-DD HH:mm:ss Z'
	}]
};
