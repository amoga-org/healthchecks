# Agent Instructions

This file defines how AI agents (Claude, GPT, etc.) should work on this project.

> **If you are a Claude agent (for example, `claude-3.5-sonnet`):**  
> Treat any mention of "Claude" or `.claude/commands/` as applying to you and follow all instructions in this file.  
> Other agents should ignore any Claude-only notes.

---

## Project Context

Read **[`README.md`](README.md)** first to understand what this project does, the tech stack, and key constraints before making any changes.

---

## Approach

When working on this project:

1. **Read README.md first**  
   Understand the project context, tech stack, and constraints.

2. **Check instructions**  
   Follow the guidelines in `.github/instructions/`.

3. **Read documentation**  
   Check `.github/docs/` before making changes.

4. **Follow existing patterns**  
   Maintain consistency with the current codebase.

5. **Use provided commands**  
   Use custom commands defined in `.claude/commands/` (read-only).

---

## What NOT to Do

Unless explicitly requested in the prompt:

❌ **Never generate** test files unless explicitly requested.
❌ **Never update** or modify existing tests unless requested.
❌ **Never maintain** backward compatibility unless specified.
❌ **Never upgrade** frameworks, libraries, or dependencies unless requested.
❌ **Never add** features beyond the request's scope.
❌ **Never change** existing documentation unless asked.
➡️ **Exception:** You may create missing `.github/docs/*` files that are explicitly referenced in this file (see **Missing Documentation Files**).
❌ **Never modify** the following AI-related files or directories (read-only for AI agents):
`AGENTS.md`, `CLAUDE.md`, `.github/instructions/`, `.github/prompts/`, `.claude/commands/`.

---

## Communication

### Response Format

-   Be concise, minimize prose.
-   Say **"I don't know"** rather than guess.
-   Confirm understanding **before coding when requirements are ambiguous or when you must make assumptions**.
-   Be explicit about what changes you're making.

### For Code Changes

```text
I'll [brief action description].

Changes made:
- [Specific change 1] in [file path]
- [Specific change 2] in [file path]
```

### For Errors

```text
Issue: [Problem statement]
Solution: [Proposed fix]
```

---

## Development Process

### File Structure

-   Add file path at top of each file.
    Example:
    `// src/modules/example.js - Module for handling user authentication`
-   Add a 1-line **function description** as a comment above each function.
    Example:
    `// Extract JWT token from request based on endpoint type`
-   Keep related code together.
-   Organize in a logical hierarchy.
-   Use consistent file and folder naming conventions.

### Code Quality

-   Plan step-by-step in detailed pseudocode **before** coding.
-   Write correct, functional, secure, and efficient code.
-   Prioritize readability over performance.
-   Include all imports and proper component naming.
-   No todos, placeholders, or missing pieces.
-   Do not create redundant code; extend the existing codebase.

### Single Responsibility Principle

-   Each function should do exactly one thing.
-   Functions should be small and focused.
-   If a function needs **multiple comments** to explain different concerns or steps, it should probably be split into smaller functions.

---

# Documentation Structure

> ⚠️ **ROOT DIRECTORY:**
> Only `CLAUDE.md`, `AGENTS.md`, and `README.md` are allowed in the repository root.
> All other docs belong in subdirectories (primarily under `.github/`).

## Reference Docs

-   **[`README.md`](README.md)**
    Project context, tech stack, features, quick-start setup (4–6 steps), basic usage, troubleshooting links.

-   **[`overview.md`](.github/docs/overview.md)**
    Combined product and architecture reference:

    -   **Product:** Problem statement, goals, user personas, feature checklist.
    -   **Architecture:** System design, components, module interactions, data flow, patterns.

-   **[`setup.md`](.github/docs/setup.md)**
    Installation: step-by-step setup, configuration, quick-start commands.

-   **[`codebase.md`](.github/docs/codebase.md)**
    Directory structure, file descriptions, function summaries.

-   **[`faq.md`](.github/docs/faq.md)**
    Common errors and fixes.

## Change History

-   **[`.github/changelog/`](.github/changelog/)**
    Individual dated change files with detailed notes.

-   **[`CHANGELOG.md`](.github/changelog/CHANGELOG.md)**
    High-level summary of changes.

**Update when:** After significant features or changes.

**Work summaries:** If you need to document work done during a session (summary of changes, decisions made, implementation notes), create a dated file in `.github/changelog/` using format `YYYY-MM-DD-description.md`. Do not create summary docs elsewhere in the project.

## AI Config (Read-only)

> ⚠️ **WARNING: Do not modify any files in this section.**
> They are read-only and managed by maintainers, not by AI agents.

-   **[`CLAUDE.md`](CLAUDE.md)** – Agent-specific instructions.
-   **[`AGENTS.md`](AGENTS.md)** – Shared agent instructions (this file).
-   **[`.github/instructions/`](.github/instructions/)** – Coding conventions and patterns.
-   **[`.github/prompts/`](.github/prompts/)** – System prompts and templates.
-   **[`.claude/commands/`](.claude/commands/)** – Custom slash commands for Claude.

---

## Making Changes

When implementing any change:

1. **Read README.md**
   Understand project context and tech stack.

2. **Review relevant documentation**
   Start with `.github/instructions/`, then `.github/docs/`.

3. **Understand existing patterns**
   Look at similar modules/files and follow established conventions.

4. **Make changes consistently**
   Keep behavior and style aligned with the rest of the codebase.

5. **Test the changes**
   Run relevant commands or tests.
   Do **not** create or modify tests unless explicitly requested.

6. **Documentation updates**
    - Do **not** change existing documentation in `.github/docs/` unless the user explicitly asks.
    - The only automatic exception is **creating missing documentation files** that this `AGENTS.md` explicitly references (see below).
    - If creating work summaries, place them in `.github/changelog/` only.

---

## Missing Documentation Files

If any documentation files referenced above do not exist:

1. **Create the missing file** at the specified path with content matching its description in this document.

    - Example: If `.github/docs/setup.md` is missing → create it with installation playbook content as described under `setup.md`.

2. **Use existing docs as templates**
   Match structure, tone, headings, and style of current `.github/docs/` files.

3. **Do not modify AI instruction files to remove references**
   These are read-only and managed by maintainers.
