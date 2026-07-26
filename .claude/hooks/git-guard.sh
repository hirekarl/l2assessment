#!/usr/bin/env bash
cmd=$(jq -r '.tool_input.command // empty')

has_git_push=false
case "$cmd" in
  *git\ push*) has_git_push=true ;;
esac

has_git_reset=false
case "$cmd" in
  *git\ reset*) has_git_reset=true ;;
esac

has_force_with_lease=false
case "$cmd" in
  *--force-with-lease*) has_force_with_lease=true ;;
esac

has_force_flag=false
case "$cmd" in
  *--force*) has_force_flag=true ;;
esac
case "$cmd" in
  *' -f '* | *' -f') has_force_flag=true ;;
esac

has_hard_flag=false
case "$cmd" in
  *--hard*) has_hard_flag=true ;;
esac

reason=""
if [ "$has_git_push" = true ] && [ "$has_force_flag" = true ] && [ "$has_force_with_lease" = false ]; then
  reason="git push --force (without --force-with-lease) can silently overwrite remote commits."
fi
if [ "$has_git_reset" = true ] && [ "$has_hard_flag" = true ]; then
  reason="$reason${reason:+ }git reset --hard discards uncommitted working-tree changes irreversibly."
fi

if [ -n "$reason" ]; then
  jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"ask",permissionDecisionReason:$r}}'
fi
exit 0
