# Project Development Resources & Guidelines

## Git Workflow Lessons Learned

### Branch Management
- Always verify the exact branch name when pushing changes
- Common pitfalls:
  - Similar branch names (e.g., feature/task-archiving vs feature/task-archive-v2)
  - Pushing to wrong branch creates new branch silently
  - Changes can be lost if wrong branch is merged

### Best Practices
1. Before pushing:
   ```bash
   git branch  # Verify current branch
   git status  # Check changes to be pushed
   ```
2. Double-check branch name in push command:
   ```bash
   git push origin EXACT-BRANCH-NAME
   ```
3. If mistake happens:
   - Check git log to understand merge history
   - Compare file contents between branches
   - Create new PR from correct branch
   - Clean up incorrect branches after fix

## Field Name Patterns

### Database vs UI Field Names
Some fields have different names between database and UI layers:
- Database uses snake_case: `project_id`, `created_at`
- UI uses camelCase: `projectId`, `createdAt`

Handle both using OR conditions:
```typescript
// Example: task.projectId || task.project_id
// Example: task.createdAt || task.created_at
```
