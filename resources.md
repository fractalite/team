# Project Development Resources & Guidelines

> This is a living document that evolves with our understanding of effective human-AI pair programming. It captures our shared workflow, lessons learned, and best practices as they emerge.

## Developer Context
- Experienced web developer from 90s HTML and 2000s PHP era
- Returning to development after 20-year break
- Learning modern development landscape:
  - Version control (Git/GitHub)
  - Modern JavaScript/TypeScript
  - Contemporary frameworks and tools
- Focus on careful, deliberate learning while leveraging past experience
- Preference for understanding systems before making changes

## Code Change Workflow

### 1. Pre-Change Verification
- Always verify current branch and state:
  ```bash
  git status                    # Check for any uncommitted changes
  git checkout -b feature/name  # Create and switch to new feature branch
  ```
- Never merge branches locally - all merges happen via Pull Requests on github.com
- Before making any code changes:
  1. Verify current state of files to be modified
  2. Document the current state in our discussion
  3. Get explicit approval before proceeding

### 2. Change Proposal Process
1. Show exact current state of relevant files
2. Present specific proposed changes with clear explanations
3. Get explicit approval before proceeding
4. Make minimal, focused changes
5. Verify changes didn't break existing functionality

### 3. Git Workflow
```bash
# Starting new feature
git status                    # Check current state
git checkout -b feature/name  # Create and switch to new feature branch

# During development
git status                    # Check modified files
git add <files>              # Stage changes
git commit -m "type: message" # Commit changes
git push origin feature/name  # Push to GitHub

# All merges happen through Pull Requests on github.com
```

#### Commit Message Format
- feat: New feature
- fix: Bug fix
- refactor: Code restructuring
- docs: Documentation updates
- style: Formatting, missing semicolons, etc.
- test: Adding tests
- chore: Maintenance tasks

### 4. Code Review Checklist
- [ ] Branch is up to date with main
- [ ] Changes are minimal and focused
- [ ] No unintended changes included
- [ ] Existing functionality preserved
- [ ] Code style consistent
- [ ] Documentation updated if needed

### 5. Error Prevention
- Always check file state before editing
- Make one change at a time
- Verify each change before proceeding
- If unsure, ask for clarification
- Document any assumptions

### 6. Recovery Process
If unintended changes occur:
1. Stop immediately
2. Document what happened
3. Create recovery plan
4. Get approval for recovery steps
5. Execute recovery carefully
6. Verify restored state

### 7. Step-by-Step Approval Process
1. Before ANY Code Changes:
   - Show current state of ALL relevant files
   - Explain exactly what changes will be made
   - Get explicit approval before proceeding

2. During Code Changes:
   - Make ONE change at a time
   - Show the exact changes being made
   - Wait for approval before continuing
   - No assumptions, no rushing ahead

3. After Each Change:
   - Verify nothing was unintentionally modified
   - Confirm the change matches what was approved
   - Document what was changed and why

4. Ground Rules:
   - Never work with outdated file versions
   - Never make multiple changes at once
   - Always ask before executing any change
   - If unsure, stop and ask for clarification

## Project-Specific Guidelines

### Supabase Configuration
- This project uses cloud Supabase instance at `bpvgggnklgublivthetn.supabase.co`
- Do NOT attempt to use Supabase CLI or local instance
- ⚠️ CRITICAL DATABASE STABILITY WARNINGS:
  - NO RLS policy changes until Pro upgrade with backup (Dec 1st)
  - Previous RLS changes caused unrecoverable infinite recursion
  - Database changes have previously required full project restart
  - Always prefer temporary frontend solutions until backup available
- All database changes must be made through Supabase dashboard:
  1. Log into dashboard
  2. Use SQL editor for schema changes
  3. Use dashboard UI for RLS policies
- Migration files in `/supabase/migrations/` are for reference only
- Always verify schema changes in dashboard before modifying frontend code

### Field Name Patterns

### Database vs UI Field Names
Some fields have different names between database and UI layers:
- Database uses snake_case: `project_id`, `created_at`
- UI uses camelCase: `projectId`, `createdAt`

Handle both using OR conditions:
```typescript
// Example: task.projectId || task.project_id
// Example: task.createdAt || task.created_at
```

### Feature Branches
- feature/task-archiving
- feature/ui-improvements
- feature/data-persistence
- etc.

### Key Files
- this relates to all files

This document should be updated as new patterns and guidelines emerge.
