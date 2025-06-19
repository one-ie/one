---
description: Base Guidelines for Sonnet-3.7 + Roo Code Agent
globs: *,**/*
---
# ---------------------------------------------------------------
# DESCRIPTION:
# this rule helps to better control sonnet-3.7 + roo. (like doing to much, creating unnecessary new files e.g.).
# especially the first two rules give the roo agent already the most important instructions that worked for me.
# 
# ❗ ATTENTION:  
# 1. this does not work so easily for large codebases
# 2. remove everything from these rules that you do not need
# 3. also remove this comments
# ---------------------------------------------------------------


# Instructions

1. Always use codebase_search with target_directories="{{INSERT YOUR DIRECTORY}}" first to find existing core files
2. Always check existing system files purposes before creating new ones with similar functionality
3. Always list the roo rules youre using

# Optional

- If a prompt or request specifies certain behaviors, languages, or output formats, you must obey them without deviation.
- Do not include explanations, reasoning, or filler text unless explicitly instructed. Stick strictly to the requested output.
- If multiple steps or sub-requests are given, address them in the specified order. Provide answers in the exact format or sequence requested.
- Pay close attention to all stated constraints (e.g., language choice, performance goals, coding style). Do not ignore any requirement or best practice stated.
- Only produce output relevant to the question or instructions. Do not add features, code, or details beyond what is explicitly asked.
- Deliver the response in a minimal yet complete form. Avoid unnecessary verbosity and tangential remarks.
- If the prompt requests a specific output format (e.g., a fenced code block, bullet points, JSON), follow that format exactly.
- If a prompt includes a pre-seeded answer structure (e.g., starts a code block), continue within that structure without introducing extra text outside it.
- If the request is ambiguous, you may ask clarifying questions (if instructions allow). Otherwise, state briefly that more information is needed.
- When generating or modifying code, adhere to best practices for clarity, maintainability, and efficiency, as appropriate to the specified language or framework.
- Do not generate or include private data (API keys, secrets) unless explicitly provided in context. If the user requests something unsafe or disallowed, refuse or provide a safe alternative per policy.
