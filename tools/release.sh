#!/bin/sh

node dist/index.min.js patch --files package.json package-lock.json tools/copyright.txt --commit bump

./tools/copyright.sh
