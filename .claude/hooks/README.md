# Claude Hooks

This directory contains hooks that run at various points during a Claude session.

## SessionStop Hook

The `sessionstop` hook runs when a Claude session ends. It provides changelog guidelines to ensure all work is properly documented.

### Files:

1. **sessionstop** - Plain text changelog guidelines
2. **sessionstop.md** - Markdown version with examples

## Purpose

The sessionStop hook ensures that:
- Changes are documented in a detailed summary file
- The main CHANGELOG.md is updated with a high-level entry
- Both detailed and summary documentation are maintained for future reference

This creates a complete audit trail of all changes made during the session.