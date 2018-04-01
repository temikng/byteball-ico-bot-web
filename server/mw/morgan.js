const config = require('config');
const morgan = require('morgan');
const log = require('./../libs/logger')(module);

exports.out = morgan(config.debug ? 'dev' : 'combined', {
    skip: (req, res) => res.statusCode >= 400,
    stream: log.stream('info')
});

exports.err = morgan(config.debug ? 'dev' : 'combined', {
    skip: (req, res) => res.statusCode < 400,
    stream: log.stream('error')
});