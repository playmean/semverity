#!/bin/sh

VERSION=$(node dist/index.min.js bump)

node dist/index.min.js patch --files package.json package-lock.json copyright.txt

for filename in ./dist/*.js
do
    cat copyright.txt >> ${filename}
done

git add .
git commit -m "bump: $VERSION"
