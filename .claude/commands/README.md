# Claude Slash Commands

This directory contains custom slash commands for Claude sessions.

## Available Commands

### /run
Executes predefined tasks and maintenance routines.

**Usage:**
```
/run <task-name>
```

**Available Tasks:**
- `maintenance` - Updates all documentation to match current codebase

**Example:**
```
/run maintenance
```

## Command Structure

```
.claude/commands/
├── run.md              # Main run command (shows help if no task specified)
├── run/                # Sub-commands for run
│   └── maintenance.md  # Documentation update task
└── README.md          # This file
```

## How Commands Work

1. When you type `/run maintenance`, Claude will:
   - First execute `run.md` to understand the command
   - Then execute `run/maintenance.md` for the specific task

2. Each command file contains instructions that Claude will follow

## Adding New Commands

### Simple Command
Create a file like `commandname.md` in `.claude/commands/`:
```
/commandname
```

### Command with Sub-tasks
1. Create main command file: `command.md`
2. Create directory: `command/`
3. Add sub-task files: `command/subtask.md`

```
/command subtask
```

## Best Practices

- Keep commands focused on specific tasks
- Include clear instructions in command files
- Document expected outcomes
- Add new commands to this README

## Maintenance Commands

The `/run maintenance` command is particularly useful for:
- Keeping documentation synchronized with code
- Identifying outdated examples
- Finding broken links
- Ensuring consistency across all docs