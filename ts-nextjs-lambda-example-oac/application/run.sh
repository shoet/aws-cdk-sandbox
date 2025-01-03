#!/bin/bash -x

# Next.jsのcacheディレクトリをLambdaで使えるようにするための起動スクリプト

if [ ! -d '/tmp/cache' ]; then
  mkdir -p /tmp/cache
fi

exec node server.js

