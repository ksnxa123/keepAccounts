#!/usr/bin/env sh

# 当发生错误时中止脚本
set -e

# 构建
npm run build

# cd 到构建输出的目录下
cd dist


git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:ksnxa123/keepAcounts-web.git master:gh-pages

cd -
