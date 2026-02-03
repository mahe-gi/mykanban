# Custom Kanban Task Board for Microsoft Teams

A native Kanban task board that integrates directly into Microsoft Teams as a configurable tab application. Users can manage tasks visually within Teams channels without switching to external tools.

## 🚀 Features

- **Native Teams Integration**: Loads directly in Teams channels as a configurable tab
- **Visual Task Management**: Drag-and-drop Kanban board with three columns (To Do, In Progress, Done)
- **Real-time Persistence**: Tasks are saved via REST API with automatic persistence
- **Channel-Scoped Boards**: Each Teams channel maintains its own isolated task board
- **Responsive Design**: Works on desktop and mobile Teams clients
- **Error Handling**: Graceful error handling with user feedback and automatic retry

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 14+ with App Router and TypeScript
- **UI**: TailwindCSS for styling, @dnd-kit for drag-and-drop
- **Teams SDK**: Microsoft Teams JavaScript SDK v2.48.0
- **Port**: 3000 (development)

### Backend (Express.js)
- **Framework**: Node.js with Express and CORS support
- **Storage**: In-memory Map (demo), MySQL ready for production
- **API**: RESTful endpoints for task CRUD operations
- **Port**: 3001

### Teams Integration
- **Type**: Configurable Tab App (not personal tab)
- **Manifest**: v1.17 schema with stable GUID
- **Context**: Channel ID used as board identifier
- **Hosting**: Requires HTTPS (ngrok for development)

## 📋 Prerequisites

- Node.js 16+ and npm
- Microsoft Teams (desktop or web)
- ngrok or similar tunneling tool
- Teams admin permissions (for app upload)

## 🛠️ Quick Setup

1. **Run the setup script**:
   ```bash
   ./setup.sh
   ```

2. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Start the frontend server** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

4. **Set up Teams integration**:
   ```bash
   # Start ngrok tunnel
   ./ngrok http 3000
   # or if installed globally:
   ngrok http 3000
   ```

## 📱 Teams App Setup

### 1. Configure the Manifest
Update `manifest/manifest.json` with your ngrok URL:
```json
{
  "configurableTabs": [{
    "configurationUrl": "https://your-ngrok-url.ngrok-free.app/config",
    "contentUrl": "https://your-ngrok-url.ngrok-free.app",
    "validDomains": ["your-ngrok-url.ngrok-free.app"]
  }]
}
```

### 2. Package the App
```bash
cd manifest
zip ../kanban-teams-app.zip manifest.json icon-color.png icon-outline.png
```

### 3. Upload to Teams
1. Open Microsoft Teams
2. Go to **Apps** → **Manage your apps** → **Upload a custom app**
3. Select `kanban-teams-app.zip`
4. Add to a channel and configure

## 🔧 Development Workflow

### Local Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev

# Terminal 3: ngrok (for Teams testing)
./ngrok http 3000
```

### Testing in Teams
1. Update manifest with current ngrok URL
2. Re-zip and re-upload to Teams
3. Test configuration page (`/config`)
4. Test main board functionality
5. Verify drag-and-drop and persistence

## 🌐 API Endpoints

### Board Operations
- `GET /api/boards/:channelId/tasks` - Fetch all tasks for a channel
- `POST /api/boards/:channelId/tasks` - Create a new task

### Task Operations
- `GET /api/tasks/:taskId` - Get specific task
- `PATCH /api/tasks/:taskId` - Update task (title, description, column)
- `DELETE /api/tasks/:taskId` - Delete task

### Health Check
- `GET /health` - API health status

## 📊 Data Model

### Task Structure
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  column: 'todo' | 'in-progress' | 'done';
  channelId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Storage Strategy
- **Demo**: In-memory Map with channel-scoped isolation
- **Production**: MySQL with connection pooling (ready to implement)

## 🎯 Usage

### Creating Tasks
1. Click **"Add Task"** button
2. Enter task title and description
3. Select initial column
4. Click **"Create Task"**

### Moving Tasks
1. **Drag** any task card
2. **Drop** on desired column or another task
3. Changes save automatically
4. Visual feedback shows valid drop zones

### Managing Tasks
- **Delete**: Click trash icon on task card
- **Edit**: Click edit icon (future enhancement)
- **View**: All task details displayed on card

## 🔒 Security & Configuration

### Environment Variables
```bash
# Backend (.env)
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Teams Context
- Channel ID automatically detected from Teams SDK
- Isolated boards per channel
- No authentication required (Teams provides identity context)

## 🚀 Production Deployment

### Database Migration
Replace in-memory storage with MySQL:
1. Update `backend/store.js` with MySQL connection
2. Run database migrations
3. Update environment variables

### Hosting Requirements
- HTTPS endpoint for Teams integration
- CORS configured for Teams domains
- Persistent storage (MySQL/PostgreSQL)
- Process management (PM2/Docker)

## 🧪 Testing

### Manual Testing Checklist
- [ ] App loads in Teams channel
- [ ] Configuration page works
- [ ] Tasks load from API
- [ ] Drag-and-drop between columns
- [ ] Task creation and deletion
- [ ] Error handling with API failures
- [ ] Multiple channel isolation

### Browser Testing
Test outside Teams at `http://localhost:3000` with demo channel ID.

## 📁 Project Structure

```
├── backend/
│   ├── routes/
│   │   ├── boards.js      # Board API endpoints
│   │   └── tasks.js       # Task API endpoints
│   ├── server.js          # Express server
│   ├── store.js           # In-memory data store
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── page.tsx       # Main Kanban view
│   │   ├── config/
│   │   │   └── page.tsx   # Teams configuration
│   │   └── layout.tsx
│   ├── components/
│   │   ├── KanbanBoard.tsx
│   │   └── TaskCard.tsx
│   ├── lib/
│   │   ├── apiClient.ts   # API client functions
│   │   └── teamsClient.ts # Teams SDK wrapper
│   └── package.json
├── manifest/
│   ├── manifest.json      # Teams app manifest
│   ├── icon-color.png     # 192x192 app icon
│   └── icon-outline.png   # 32x32 outline icon
└── setup.sh              # Automated setup script
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test Teams integration thoroughly
4. Submit pull request with detailed description

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### "App won't load in Teams"
- Check HTTPS requirement (ngrok running?)
- Verify `validDomains` in manifest matches ngrok URL
- Ensure Teams SDK initializes before API calls

### "Tasks not saving"
- Check backend server is running on port 3001
- Verify API client points to correct backend URL
- Check browser network tab for failed requests

### "Drag and drop not working"
- Ensure @dnd-kit packages are installed
- Check console for JavaScript errors
- Verify DroppableColumn components are rendered

### "Configuration page fails"
- Must call `microsoftTeams.pages.config.setValidityState(true)`
- Register save handler before configuration completes
- Check Teams SDK initialization

---

**Built for Microsoft Teams** | **Next.js + Express** | **Drag & Drop Ready** 🎯
# mykanban
# mykanban
