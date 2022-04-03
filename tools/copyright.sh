#!/bin/sh

for filename in ./dist/*.js
do
    cat ./tools/copyright.txt >> ${filename}
done
