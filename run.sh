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

# Run the script from the script's own directory
cd `dirname $0`

node crossword.js &
nodepid=$!
cd client
python -m SimpleHTTPServer > /dev/null &
pypid=$!

echo "Node PID: $nodepid"
echo "Python PID: $pypid"

while :
do
  sleep 100
done

