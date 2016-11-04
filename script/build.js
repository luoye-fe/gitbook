import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

import ora from 'ora';

import logger from './logger.js';

let booksList = fs.readdirSync(path.join(__dirname, '../src'));

function filter(array) {
	array.forEach((item, index) => {
		if (/^\./.test(item)) {
			array.splice(index, 1);
		}
	})
	return array;
}

booksList = filter(booksList);

function build() {
	if (!booksList[0]) {
		logger.success(`All succeed.`);
		return;
	};
	let spinner = ora(`Building ${booksList[0]}`).start();
	exec(`gitbook build ${path.join(__dirname, '../src/', booksList[0])} ${path.join(__dirname, '../dist/', booksList[0])}`, (err, stdout, stderr) => {
		if (err) {
			logger.fatal(err);
			return;
		}
		spinner.stop();
		logger.success(`Building ${booksList[0]} succeed.`);
		booksList.splice(0, 1);
		build();
	})
}

build();
