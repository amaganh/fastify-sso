# fastify-sso

## User Management

### User Types
- **Generic Users**: Not tied to any project (`project: null`). Can self-register and self-delete.
- **Project-Specific Users**: Linked to a specific project (`project: 'projectName'`).
- **Admin-Only Users**: Marked with `adminOnly: true`. Only admins can create or delete these users.

### Rules
- Only admins can create or delete project-specific or admin-only users.
- Generic users can self-register and self-delete.
- Admins can manage all users.

### API Usage
- To create a project-specific or admin-only user, include `project` and/or `adminOnly` in the request body. Admin authentication is required.
- To delete a user:
  - Generic users can delete themselves.
  - Only admins can delete project-specific or admin-only users.

### Example: Register Project-Specific User (Admin Only)
```json
POST /register
{
  "username": "user1",
  "password": "pass",
  "project": "dgg",
  "adminOnly": true
}
```

### Example: Delete User
```
DELETE /user/:username
```

Admin authentication is required for restricted actions.