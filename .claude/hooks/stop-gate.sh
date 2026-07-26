#!/usr/bin/env bash
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 0

changed=$(git status --porcelain -- src shared api package.json package-lock.json vite.config.js eslint.config.js 2>/dev/null)
[ -z "$changed" ] && exit 0

lint_out=$(npm run lint 2>&1)
lint_status=$?
if [ "$lint_status" -ne 0 ]; then
  jq -n --arg r "ESLint failed — fix before finishing this turn:
$lint_out" '{decision:"block",reason:$r}'
  exit 0
fi

test_out=$(npm run test:coverage 2>&1)
test_status=$?
if [ "$test_status" -ne 0 ]; then
  jq -n --arg r "Tests or coverage thresholds failed — fix before finishing this turn:
$test_out" '{decision:"block",reason:$r}'
  exit 0
fi

exit 0
