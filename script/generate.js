import fs from 'fs';
import path from 'path';

import pinyin from 'pinyin';
import { js as jsbeautify } from 'js-beautify';

let book = '绘事后素';
let catlog = '鲜衣怒马少年时';

var pkg = require(`../src/${book}/${catlog}/catlog.json`);

let index = 0;

function write() {
	if (index >= pkg.length) {
		// fs.writeFileSync(path.join(__dirname, `../src/${book}/${catlog}/catlog.json`), jsbeautify(JSON.stringify(pkg)), {
		// 	'indent_with_tabs': true,
		// 	'indent_size': 4,
		// });
		return;
	}
	// let pinyintitle = pinyin(pkg[index].title.replace(/，|·/g, '')).join('-');
	fs.writeFile(path.join(__dirname, `../src/${book}/${catlog}/${pkg[index].title}.md`), `# ${pkg[index].title}\n\n> ${pkg[index].author}\n`,() => {
		// pkg[index].pinyin = pinyintitle;
		index ++;
		write();
	})
}

write();
