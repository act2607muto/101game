#!/usr/bin/env bash
# Loads database.rules.json into the Realtime Database emulator, which refuses rules it cannot parse or compile.
# Used by .github/workflows/firebase-rules.yml; needs Node and Java 11+.
set -euo pipefail
cd "$(dirname "$0")/.."
PORT=9000
FIREBASE="npx --yes firebase-tools@15.34.2"
# its own config, so the emulator starts empty and the rules go in through the request below, whose answer we can check
$FIREBASE emulators:start --only database --project demo-101 --config scripts/firebase.emulator.json > emulator.log 2>&1 &
pid=$!
trap 'kill $pid 2>/dev/null || true' EXIT
for _ in $(seq 1 90); do
  curl -s -o /dev/null "http://127.0.0.1:$PORT/.json?ns=demo-101" && break
  kill -0 $pid 2>/dev/null || { cat emulator.log; exit 1; }
  sleep 2
done
res=$(curl -s -X PUT --data-binary @database.rules.json -H 'Authorization: Bearer owner' "http://127.0.0.1:$PORT/.settings/rules.json?ns=demo-101")
echo "$res"
[[ "$res" == *'"status":"ok"'* ]]
