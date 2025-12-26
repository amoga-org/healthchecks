# SessionStop Hook

Before ending this session, please create a changelog entry for the work completed.

## Changelog Guidelines

When completing coding tasks or making significant changes:

### 1. Create Detailed Summary

Create a file in `.github/changelog/` with format: `yyyy-mm-dd-hhmm-brief-description.md`

**Required Content:**
- Changes Made (files created/modified/deleted)
- Implementation approach and details
- Key decisions and architectural choices
- Testing notes and validation
- Related documentation updates

### 2. Update CHANGELOG.md

Update `.github/changelog/CHANGELOG.md` by adding entry at top:
- Date and descriptive title
- One paragraph summary of changes
- Reference to detailed summary file
- Keep reverse chronological order (latest first)

This maintains both detailed work logs and a high-level changelog for quick reference.

## Example Entry Format

### Detailed Summary File
`.github/changelog/2025-11-14-1030-claude-md-refactoring.md`

### CHANGELOG.md Entry
```markdown
## 2025-11-14: CLAUDE.md Refactoring and Hook Implementation

Refactored CLAUDE.md to be more generic and reference-based, moving detailed documentation to the docs folder. Implemented sessionStart and sessionStop hooks for better Claude session management and automatic changelog creation. Created development guide and updated documentation structure for improved maintainability.

[Detailed Summary](./2025-11-14-1030-claude-md-refactoring.md)
```

Please ensure all significant changes from this session are documented before ending.