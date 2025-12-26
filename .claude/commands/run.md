# Run Command

Execute the task file from `.claude/commands/run/{{TASK}}.md` where {{TASK}} is the provided argument.

## Usage
```
/run <task-name>
```

## Available Tasks

Check `.claude/commands/run/` directory for available tasks. Current tasks:

- **maintenance** - Update all documentation to match current codebase

## Examples
```
/run maintenance   # Updates documentation
```

If the specified task file exists, execute its instructions. If not, show an error message.