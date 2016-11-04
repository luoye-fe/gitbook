require('shelljs/global');

exec('git subtree push --prefix=dist/ origin gh-pages');
