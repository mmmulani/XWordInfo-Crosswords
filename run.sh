#!/bin/bash

cleanup() {
  echo
  echo "PIDS: Node.JS ($nodepid) Python ($pypid)"
  echo "Cleaning up Node"
  kill $nodepid

  echo "Cleaning up Python"
  kill $pypid
  exit 1
}

trap cleanup SIGINT

node crossword.js &
nodepid=$!
python -m SimpleHTTPServer > /dev/null &
pypid=$!

echo $nodepid
echo $pypid

while :
do
    sleep 100
done

