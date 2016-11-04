// babel entrance
require('babel-core/register')();

var minimist = require('minimist')

var argv = minimist(process.argv.slice(2));

require('./' + argv.file + '.js');
