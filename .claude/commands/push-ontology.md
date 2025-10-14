---
allowed-tools: Bash(cd one && git checkout -b:*), Bash(cd one && git add:*), Bash(cd one && git status:*), Bash(cd one && git push:*), Bash(cd one && git commit:*), Bash(cd one && gh pr create:*), Bash(cd one && git merge:*), Bash(cd one && git branch:*)
description: Push /one directory to one-ontology repo with commit and PR
---

## Context

- Current git status: !`cd one && git status`
- Current git diff (staged and unstaged changes): !`cd one && git diff HEAD`
- Current branch: !`cd one && git branch --show-current`

## Your task

Based on the above changes in the /one directory:
1. All commands must be run from the `one` directory using `cd one && ...`
2. If on main branch, switch to dev branch
3. Merge main into dev
4. Add all changes from /one directory
5. Create a single commit with an appropriate message describing the ontology changes
6. Push the branch to origin with -u flag
7. Create a pull request using `gh pr create` with a descriptive title and body
8. You have the capability to call multiple tools in a single response. You MUST do all of the above in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
