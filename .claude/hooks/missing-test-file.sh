#!/usr/bin/env bash
f=$(jq -r '.tool_input.file_path // empty')

case "$f" in
  */src/*.js | */src/*.jsx) ;;
  *) exit 0 ;;
esac

case "$f" in
  *.test.js | *.test.jsx) exit 0 ;;
esac

case "$f" in
  */src/test/* | */src/main.jsx) exit 0 ;;
esac

ext="${f##*.}"
base="${f%.*}"
testfile="${base}.test.${ext}"

if [ ! -f "$testfile" ]; then
  jq -n --arg m "New source file $f has no sibling test file ($testfile). This repo enforces 100% coverage — add tests before finishing." \
    '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$m}}'
fi
exit 0
