#!/bin/bash

if [ $# -lt 1 ] ; then

echo "Provide a commit message as the first parameter"

fi

git commit -am "$1"
gulp patch
git push origin master --tags
npm publish
