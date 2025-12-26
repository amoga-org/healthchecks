# Maintenance Task: Update Documentation

Please perform the following maintenance tasks to ensure all documentation is up-to-date with the current project state:

## Documentation Review Checklist

### 1. Review Reference Documentation

-   [ ] **[`README.md`](README.md)** - Verify project context, tech stack, features, quick-start setup (4–6 steps), basic usage, and troubleshooting links
-   [ ] **[`.github/docs/overview.md`](.github/docs/overview.md)** - Combined product and architecture reference:
    -   Product: Problem statement, goals, user personas, feature checklist
    -   Architecture: System design, components, module interactions, data flow, patterns
-   [ ] **[`.github/docs/setup.md`](.github/docs/setup.md)** - Verify installation steps, configuration, and quick-start commands
-   [ ] **[`.github/docs/codebase.md`](.github/docs/codebase.md)** - Verify directory structure, file descriptions, and function summaries
-   [ ] **[`.github/docs/faq.md`](.github/docs/faq.md)** - Update common errors and fixes based on recent issues

### 2. Review Change Management

-   [ ] **[`.github/changelog/`](.github/changelog/)** - Verify individual dated change files have detailed notes
-   [ ] **[`.github/changelog/CHANGELOG.md`](.github/changelog/CHANGELOG.md)** - Ensure high-level summary is up-to-date

### 3. Code-Documentation Alignment

-   [ ] Review all exported functions against documentation
-   [ ] Check that documented APIs match implementation
-   [ ] Verify documented patterns match code behavior
-   [ ] Ensure error handling aligns with documentation

### 4. Validate Examples and Usage

-   [ ] Test all code examples in documentation
-   [ ] Verify API call examples with current endpoints
-   [ ] Check configuration examples are valid
-   [ ] Ensure quick-start snippets work correctly

### 5. Missing Documentation Files

If any documentation files referenced above do not exist:

-   [ ] Create the missing file at the specified path with content matching its description
-   [ ] Use existing docs as templates - match structure, tone, headings, and style
-   [ ] Do not modify AI instruction files to remove references

### 6. Documentation Cleanup

1. **Delete unreferenced docs**
   Remove any documentation files in `.github/docs/` that are not referenced in this structure.

    - Exception: Do not delete files in AI Config (read-only) directories.

2. **Preserve manual sections**
   When updating existing documentation files, do not remove any sections that may have been manually added. Only add missing sections or update existing ones as needed.

## Actions to Take

1. **Compare documentation with implementation** - Read each doc file and verify against code
2. **Update discrepancies** - Fix any mismatches between docs and actual behavior
3. **Add missing content** - Document any undocumented features or changes
4. **Remove outdated content** - Clean up obsolete information
5. **Fix broken references** - Update links to moved or renamed files
6. **Test documented commands** - Ensure all examples work as shown

## Special Considerations

-   Focus on areas with recent changes
-   Priority on user-facing documentation accuracy
-   Verify all file paths and links are valid
-   Check consistency across all documentation
-   Ensure terminology is used consistently

## AI-Related Files (Read-only)

> ⚠️ **Do not modify any files in this section.**

-   `.github/instructions/` - Coding conventions and patterns
-   `.github/prompts/` - System prompts and templates
-   `CLAUDE.md` - Agent-specific instructions
-   `AGENTS.md` - Shared agent instructions
-   `.claude/commands/` - Custom slash commands

## Completion Criteria

After maintenance, confirm:

-   [ ] No files modified in `.github/instructions/`, `.github/prompts/`, or `.claude/commands/`
-   [ ] `CLAUDE.md` and `AGENTS.md` remain unchanged
-   [ ] No duplicate documentation exists
-   [ ] All links and references are valid
-   [ ] Commands and examples are tested and working
-   [ ] Documentation structure follows established patterns
-   [ ] Changelog updated if significant changes made

## Post-Maintenance Cleanup

-   [ ] Move any temporary notes to `.github/changelog/`
-   [ ] Remove any draft files from root directory
-   [ ] Ensure only `README.md`, `CLAUDE.md`, and `AGENTS.md` remain at root
-   [ ] Verify no redundant documentation files exist
-   [ ] Delete unreferenced documentation files in `.github/docs/`
-   [ ] Confirm all remaining docs are referenced in the documentation structure

Please proceed with the maintenance review and update documentation as needed while respecting the read-only sections.
