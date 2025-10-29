# Smartico Missions & Badges - Frontend MVP

Minimal React + TypeScript frontend for testing the .NET 9 backend API.

## 🚀 Quick Start

### Prerequisites
- **Node.js 20.19+ or 22.12+** installed (current: 20.18.2 - needs upgrade)
- Backend API running at `http://localhost:5227`

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will start at: **http://localhost:3000**

## 🎯 Features

- ✅ Display missions from backend API
- ✅ Real-time updates via SignalR
- ✅ Opt-in to missions
- ✅ Claim rewards
- ✅ Mission progress tracking
- ✅ Responsive design with Tailwind CSS

## 🔧 Configuration

### Test User ID
Currently hardcoded as: `test-user-123`

You can change this in `src/App.tsx`:
```typescript
const TEST_USER_ID = 'test-user-123';
```

### Backend URL
Configured in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:5227/api';
```

## 📡 API Endpoints Used

- `GET /api/missions?userId={id}` - List missions
- `GET /api/missions/{id}?userId={id}` - Get mission details
- `POST /api/missions/{id}/opt-in?userId={id}` - Opt into mission
- `POST /api/missions/{id}/claim?userId={id}` - Claim reward
- `WS /hubs/progress?userId={id}` - Real-time updates

## 🐛 Troubleshooting

### Backend Not Running
Make sure your backend is running:
```bash
cd ../backend
dotnet run --project src/Smartico.Missions.Api

# Should see: Now listening on: http://localhost:5227
```

### Connection Errors
If you see "Failed to load missions" error:
1. Verify backend is running: http://localhost:5227/api/health
2. Check browser console for CORS or network errors
3. Ensure no firewall blocking localhost connections

### CORS Issues
The backend is configured to allow requests from:
- `http://localhost:3000`
- `http://localhost:5173`

If using a different port, update `backend/src/Smartico.Missions.Api/appsettings.Development.json`:
```json
"Cors": {
  "AllowedOrigins": ["http://localhost:YOUR_PORT"]
}
```

## 📦 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Axios** - HTTP client
- **SignalR** - Real-time WebSocket communication
- **Tailwind CSS** - Styling

## 🎨 Project Structure

```
src/
├── components/
│   ├── MissionCard.tsx      # Individual mission display
│   └── MissionList.tsx      # Mission grid layout
├── services/
│   ├── api.ts               # REST API client
│   └── signalr.ts           # SignalR WebSocket client
├── types.ts                 # TypeScript type definitions
├── App.tsx                  # Main application component
└── main.tsx                 # Entry point
```

## 🔄 Real-Time Updates

The app connects to SignalR and listens for:
- **MissionProgressUpdated** - Progress changes
- **MissionCompleted** - Mission completion
- **BadgeEarned** - Badge earned notifications

Connection status is shown in the header (green = connected, red = disconnected).

## 🧪 Testing

### Manual Testing Steps
1. ✅ Start backend (`dotnet run`)
2. ✅ Start frontend (`npm run dev`)
3. ✅ Open http://localhost:3000
4. ✅ Verify missions load
5. ✅ Click "Opt In" on an available mission
6. ✅ Verify mission status changes to "Active"
7. ✅ Click "Claim Reward" on a completed mission
8. ✅ Verify success message appears

### Swagger Testing
You can also test the backend directly:
- Open https://localhost:5001/swagger
- Test endpoints with userId: `test-user-123`

---

**Status:** ✅ MVP Complete - Ready for Testing  
**Created:** 2024-10-29

