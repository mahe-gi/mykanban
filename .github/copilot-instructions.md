# Copilot Instructions - Custom Kanban Board for Microsoft Teams

## Project Overview
A custom Kanban task board that integrates natively into Microsoft Teams as a configurable tab application. Users can manage tasks visually within Teams channels without switching to external tools.

## Architecture

### Teams Integration
- **App Type**: Configurable Tab App (not personal or static tab)
- **Manifest**: `manifest.json` with stable GUID, valid domains, and configurable tab definition
- **SDK**: Microsoft Teams JavaScript SDK for iframe communication and context
- **Hosting**: HTTPS-hosted web app (required for Teams embedding)
- **Scope**: One board per Teams channel, identified by channel ID from Teams context

### Tech Stack
- **Frontend**: Next.js 14+ with App Router, Microsoft Teams JavaScript SDK
- **Backend**: Node.js/Express REST API (separate service)
- **Data Persistence**: In-memory Map for demo, MySQL for production
- **Data Model**: Channel-scoped boards with tasks belonging to columns (To Do, In Progress, Done)
- **Drag & Drop**: @dnd-kit/core for task movement

## Key Development Workflows

### Local Development with Teams
1. Start Express backend: `cd backend && npm run dev` (port 3001)
2. Start Next.js frontend: `npm run dev` (port 3000)
3. Use `ngrok http 3000` to expose frontend via HTTPS
4. Update `manifest/manifest.json` `validDomains` and `contentUrl` with ngrok URL
5. Zip manifest: `cd manifest && zip ../app.zip manifest.json icon-*.png`
6. Sideload app in Teams: Apps → Manage apps → Upload custom app
7. Test configuration page (`/config`) and main board view
8. Use Teams DevTools (F12) to debug iframe context

### Configuration Flow
- Configuration page must call `microsoftTeams.pages.config.setValidityState(true)` when ready
- Must call `microsoftTeams.pages.config.registerOnSaveHandler()` to persist settings
- Save `contentUrl` and `entityId` (use channel ID as entity ID)

### Testing in Teams
- Always test in both Teams desktop and web client
- Verify iframe communication using `microsoftTeams.app.initialize()`
- Check context retrieval: `microsoftTeams.app.getContext()` for channel ID

## Code Patterns

### Teams SDK Initialization (React)
```javascript
// Initialize Teams SDK before any API calls
useEffect(() => {
  microsoftTeams.app.initialize().then(() => {
    microsoftTeams.app.getContext().then(context => {
      // Use context.channel.id as board identifier
      setChannelId(context.channel.id);
    });
  });
}, []);
```

### API Endpoint Structure (Express Backend)
- `GET /api/boards/:channelId/tasks` - Fetch all tasks for a channel
- `POST /api/boards/:channelId/tasks` - Create new task
- `PATCH /api/tasks/:taskId` - Update task (title, description, column)
- `DELETE /api/tasks/:taskId` - Delete task

### Data Persistence Strategy
**Demo (In-Memory)**:
```javascript
// backend/store.js
const boards = new Map(); // channelId -> tasks[]
```

**Production (MySQL)**:
```sql
CREATE TABLE tasks (
  id VARCHAR(36) PRIMARY KEY,
  channel_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  column_type ENUM('todo', 'in-progress', 'done'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_channel (channel_id)
);
```
- Use `mysql2` package with connection pool
- Abstract data access via repository pattern for easy swap

### Task Data Model
```javascript
{
  id: string,
  title: string,
  description: string,
  column: 'todo' | 'in-progress' | 'done',
  channelId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Project Conventions

### MVP Scope - Explicitly Excluded
- **No authentication/SSO** - Teams context provides identity (post-MVP)
- **No role-based permissions** - All channel members can edit
- **No notifications, mentions, or activity feeds**
- **Static columns** - No custom column creation in MVP
- **No task assignments, comments, or attachments**

### File Structure (Expected)
```
/manifest/              # Teams app manifest and icons
  manifest.json
  icon-color.png        # 192x192 color icon
  icon-outline.png      # 32x32 outline icon
/src/
  /app/                 # Next.js App Router
    page.tsx            # Main Kanban board view
    config/
      page.tsx          # Tab configuration page
    layout.tsx          # Root layout with Teams SDK
  /components/
    KanbanBoard.tsx
    TaskCard.tsx
    Column.tsx
  /lib/
    teamsClient.ts      # Teams SDK wrapper
    apiClient.ts        # Express API client
/backend/
  server.js             # Express entry point
  routes/
    boards.js           # Board/task endpoints
  store.js              # In-memory data store
  db/
    mysql.js            # MySQL connection (production)
  package.json
/public/
```

### Manifest Requirements
- Unique GUID for `id` field (generate once, never change)
- `configurableTabs` section with `/config` path
- `validDomains` must include hosting domain (no wildcards for tunnels)
- Version follows semantic versioning

## Critical Integration Points

### Channel ID as Board Identifier
Always use `context.channel.id` from Teams SDK to scope boards. Never use hardcoded IDs or session storage.

### Drag and Drop
Use `@dnd-kit/core` with `@dnd-kit/sortable` for task movement:
```javascript
import { DndContext, closestCenter } from '@dnd-kit/core';

function handleDragEnd(event) {
  const { active, over } = event;
  // Update task column via Express API
  fetch(`${API_URL}/api/tasks/${active.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ column: over.id })
  });
}
```

### Error Boundaries
Wrap main app in error boundary - Teams iframe failures should show user-friendly message, not break Teams UI.

### HTTPS Requirement
Teams will not load HTTP content. Use ngrok/serveo/cloudflare tunnels for local dev, proper SSL for production.

## Build & Deploy Commands

### Frontend (Next.js)
- `npm run dev` - Development server (port 3000)
- `npm run build` - Production build
- `npm run start` - Start production server
- Environment: Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3001`

### Backend (Express)
- `cd backend && npm run dev` - Development with nodemon (port 3001)
- `npm start` - Production server
- Environment: Create `backend/.env` with `DB_HOST`, `DB_USER`, `DB_PASS` for MySQL

### Teams App Package
- `cd manifest && zip ../app.zip manifest.json icon-color.png icon-outline.png`
- Upload `app.zip` to Teams via Apps → Manage apps → Upload custom app

## Testing Checklist
- [ ] App appears in Teams "Apps" section
- [ ] Configuration page loads and saves successfully
- [ ] Board loads with correct channel context
- [ ] Create, edit, move, delete tasks work
- [ ] Multiple boards (different channels) remain isolated
- [ ] Works in both Teams desktop and web client

## Common Issues
- **"App won't load"**: Check HTTPS, validDomains in manifest, Teams SDK initialization
- **"Context is undefined"**: Ensure `microsoftTeams.app.initialize()` completes before calling `getContext()`
- **"Can't save configuration"**: Verify `setValidityState(true)` is called and save handler registered
- **"Tasks show in wrong channel"**: Verify channel ID from context, not hardcoded

## References
- Teams JS SDK: https://learn.microsoft.com/javascript/api/@microsoft/teams-js/
- App Manifest Schema: https://learn.microsoft.com/microsoftteams/platform/resources/schema/manifest-schema
- Tab Apps Guide: https://learn.microsoft.com/microsoftteams/platform/tabs/what-are-tabs
