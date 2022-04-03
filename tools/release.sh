#!/bin/sh

VERSION=$(node dist/index.min.js bump)

node dist/index.min.js patch --files package.json package-lock.json tools/copyright.txt

sed -i '1s/^/#!\/usr\/bin\/env node\n/' dist/index.min.js

./tools/copyright.sh

git add .
git commit -m "bump: $VERSION"
