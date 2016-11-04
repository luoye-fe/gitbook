require('shelljs/global');

import fs from 'fs';
import path from 'path';

import inquirer from 'inquirer';

const booksList = fs.readdirSync(path.join(__dirname, '../src'));

function filter(array) {
	array.forEach((item, index) => {
		if (/^\./.test(item)) {
			array.splice(index, 1);
		}
	})
	return array;
}

inquirer.prompt([{
	type: 'list',
	name: 'book',
	message: 'which book?',
	choices: filter(booksList)
}]).then((answers) => {
	exec(`gitbook serve ${path.join(__dirname, '../src/', answers.book)} ${path.join(__dirname, '../dist/', answers.book)}`);
});
