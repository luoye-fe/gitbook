import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

import ora from 'ora';
import inquirer from 'inquirer';

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

const htmlTemplate = 
`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Gitbooks · luoye-fe</title>
	<style type="text/css">
		.booklist {

		}
		.booklist li {
			font-style: normal;
			list-style: none;
			line-height: 24px;
		}
		.booklist li a {
			color: #333;
			text-decoration: none;
		}
		.booklist li a:hover {
			color: #000;
			text-decoration: underline;
		}
	</style>
</head>
<body>
	<ul class="booklist">
		{{template}}
	</ul>
</body>
</html>
`;

let index = 0;
let bookTitle = {};
function analyseBook() {
	let spinner = ora(`Analysing books ...`).start();
	return new Promise((resolve, reject) => {
		function loop() {
			if (index >= booksList.length) {
				index = 0;
				spinner.stop();
				logger.success(`Analyse books succeed.`);
				resolve();
				return;
			}
			fs.readFile(path.join(__dirname, '../src/', booksList[index], 'book.json'), 'utf-8', (err, data) => {
				let bookJson = JSON.parse(data);
				bookTitle[booksList[index]] = bookJson.title;
				index ++;
				loop();
			})
		}
		loop();
	});
}

function generateIndexHTML() {
	let spinner = ora(`Generating index HTMl file ...`).start();
	return new Promise((resolve, reject) => {
		let template = '';
		let cur = '';
		Object.keys(bookTitle).forEach((item) => {
			cur += `<li><a href="${item}/">${bookTitle[item]}</a></li>`
		})
		template = htmlTemplate.replace(/{{template}}/, cur);
		fs.writeFile(path.join(__dirname, '../dist/index.html'), template, (err) => {
			if (err) {
				logger.fatal(err);
				reject();
				return;
			}
			spinner.stop();
			logger.success(`Generate index HTMl file succeed.`);
			resolve();
		})
	});
}

function build() {
	return new Promise((resolve, reject) => {
		function loop() {
			if (index >= booksList.length) {
				index = 0;
				resolve();
				return;
			}
			let spinner = ora(`Building ${booksList[index]} ...`).start();
			exec(`gitbook build ${path.join(__dirname, '../src/', booksList[index])} ${path.join(__dirname, '../dist/', booksList[index])}`, (err, stdout, stderr) => {
				if (err) {
					logger.fatal(err);
					reject();
					return;
				}
				spinner.stop();
				logger.success(`Building ${booksList[index]} succeed.`);
				index ++;
				loop();
			})
		}
		loop();
	});	
}

function publish() {
	let spinner = ora(`Pushing to github ...`).start();
	return new Promise((resolve, reject) => {
		exec('git subtree push --prefix=dist/ origin gh-pages', (err) => {
			if (err) {
				logger.fatal(err);
				reject();
				return;
			}
			spinner.stop();
			logger.success(`Push to github succeed.`);
			resolve();
		})
	});
}

inquirer.prompt([{
	type: 'confirm',
	name: 'publish',
	message: 'push to gh-pages?',
	default: false
}]).then((answers) => {
	analyseBook()
		.then(() => {
			return generateIndexHTML();
		})
		.then(() => {
			return build();
		})
		.then(() => {
			if (answers.publish) {
				return publish();
			}
		})
		.then(() => {
			logger.success(`All succeed.`);
		})
});
