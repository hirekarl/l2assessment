#!/usr/bin/env bash
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 0

f=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')

case "$f" in
  *.js | *.jsx) ;;
  *) exit 0 ;;
esac

case "$f" in
  */node_modules/* | */dist/* | */coverage/* | */playwright-report/* | */test-results/* | */.vercel/*) exit 0 ;;
esac

[ -f "$f" ] || exit 0

before=$(cat "$f")
npx eslint --fix "$f" >/dev/null 2>&1
npx prettier --write "$f" >/dev/null 2>&1
after=$(cat "$f")

remaining=$(npx eslint "$f" 2>&1)
remaining_status=$?

msg=""
if [ "$before" != "$after" ]; then
  msg="File auto-formatted (eslint --fix + prettier) after your edit; re-read before further edits to this file, since whitespace/quotes may have changed."
fi
if [ "$remaining_status" -ne 0 ]; then
  msg="$msg
Remaining ESLint issues that could not be auto-fixed:
$remaining"
fi

if [ -n "$msg" ]; then
  jq -n --arg msg "$msg" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$msg}}'
fi
exit 0
