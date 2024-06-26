#!/usr/bin/env zsh

# 确保脚本抛出遇到的错误
set -e

# 查看当前目录
pwd

# 生成静态文件
pnpm run build

# 进入生成的文件夹
cd .vitepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy to the gh-pages'

# 如果发布到 https://<USERNAME>.github.io
git push -f git@github.com:xinlei3166/vue-virtual-components.git master:gh-pages
