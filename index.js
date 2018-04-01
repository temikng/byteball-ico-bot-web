#!/usr/bin/env node
/**
 * check node.js version
 */
let nodeVersion = process.versions.node;
let majorNodeVersion = Number(nodeVersion[0]);
if (majorNodeVersion < 8) {
	throw new Error('The version of Node.js must be 8.x.x or greater');
}

require('dotenv').config();
require('./server/bin/www');