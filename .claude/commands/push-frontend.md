---
allowed-tools: Bash(cd frontend && git checkout -b:*), Bash(cd frontend && git add:*), Bash(cd frontend && git status:*), Bash(cd frontend && git push:*), Bash(cd frontend && git commit:*), Bash(cd frontend && gh pr create:*), Bash(cd frontend && git merge:*), Bash(cd frontend && git branch:*)
description: Push /frontend directory to frontend repo with commit and PR
---

## Context

- Current git status: !`cd frontend && git status`
- Current git diff (staged and unstaged changes): !`cd frontend && git diff HEAD`
- Current branch: !`cd frontend && git branch --show-current`

## Your task

Based on the above changes in the /frontend directory:
1. All commands must be run from the `frontend` directory using `cd frontend && ...`
2. If on main branch, switch to dev branch
3. Merge main into dev
4. Add all changes from /frontend directory
5. Create a single commit with an appropriate message describing the frontend changes
6. Push the branch to origin with -u flag
7. Create a pull request using `gh pr create` with a descriptive title and body
8. You have the capability to call multiple tools in a single response. You MUST do all of the above in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
