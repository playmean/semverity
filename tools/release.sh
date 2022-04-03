#!/bin/sh

VERSION=$(node dist/index.min.js bump)

node dist/index.min.js patch --files package.json package-lock.json tools/copyright.txt

./tools/copyright.sh

git add .
git commit -m "bump: $VERSION"
