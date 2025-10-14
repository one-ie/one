---
allowed-tools: Bash(cd backend && git checkout -b:*), Bash(cd backend && git add:*), Bash(cd backend && git status:*), Bash(cd backend && git push:*), Bash(cd backend && git commit:*), Bash(cd backend && gh pr create:*), Bash(cd backend && git merge:*), Bash(cd backend && git branch:*)
description: Push /backend directory to backend repo with commit and PR
---

## Context

- Current git status: !`cd backend && git status`
- Current git diff (staged and unstaged changes): !`cd backend && git diff HEAD`
- Current branch: !`cd backend && git branch --show-current`

## Your task

Based on the above changes in the /backend directory:
1. All commands must be run from the `backend` directory using `cd backend && ...`
2. If on main branch, switch to dev branch
3. Merge main into dev
4. Add all changes from /backend directory
5. Create a single commit with an appropriate message describing the backend changes
6. Push the branch to origin with -u flag
7. Create a pull request using `gh pr create` with a descriptive title and body
8. You have the capability to call multiple tools in a single response. You MUST do all of the above in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
