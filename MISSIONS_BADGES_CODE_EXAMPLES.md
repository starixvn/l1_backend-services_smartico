# Missions & Badges - Code Examples & Patterns

## 🚀 Quick Start Examples

### Backend Setup (5 minutes)

#### 1. **Install Dependencies**
```bash
npm install @smartico/public-api express socket.io node-cache dotenv
npm install -D @types/node @types/express typescript ts-node nodemon
```

#### 2. **Create .env File**
```env
# Smartico Configuration
SMARTICO_LABEL_API_KEY=your-label-api-key-here
SMARTICO_BRAND_API_KEY=your-brand-api-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

#### 3. **Minimal Working Server** (app.ts)
```typescript
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { SmarticoAPI } from '@smartico/public-api';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL }
});

// Middleware
app.use(cors());
app.use(express.json());

// Smartico API Setup
const api = new SmarticoAPI(
  process.env.SMARTICO_LABEL_API_KEY!,
  process.env.SMARTICO_BRAND_API_KEY!,
  async (message: any, publicApiUrl?: string) => {
    const response = await fetch(publicApiUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    return await response.json();
  }
);

const wsapi = api.getWSCalls();

// Routes
app.get('/api/missions', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const missions = await wsapi.getMissions();
    res.json({ success: true, data: missions });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/missions/:id/optin', async (req, res) => {
  try {
    const missionId = parseInt(req.params.id);
    const result = await wsapi.requestMissionOptIn(missionId);
    
    if (result.err_code === 0) {
      res.json({ success: true, message: 'Opted in successfully' });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.err_message 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// WebSocket
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('subscribe:missions', async () => {
    await wsapi.getMissions({
      onUpdate: (missions) => {
        socket.emit('missions:updated', missions);
      }
    });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

### Frontend Setup (React + TypeScript)

#### 1. **Install Dependencies**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install axios socket.io-client @reduxjs/toolkit react-redux framer-motion
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 2. **API Client** (api/missions.ts)
```typescript
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Mission {
  id: number;
  name: string;
  description: string;
  image: string;
  progress: number;
  reward: string;
  is_completed: boolean;
  is_locked: boolean;
  is_requires_optin: boolean;
  is_opted_in: boolean;
}

export const missionsAPI = {
  async getMissions(): Promise<Mission[]> {
    const { data } = await axios.get(`${API_URL}/missions`);
    return data.data;
  },

  async optIn(missionId: number) {
    const { data } = await axios.post(`${API_URL}/missions/${missionId}/optin`);
    return data;
  },

  async claimReward(missionId: number, completedId: number) {
    const { data } = await axios.post(`${API_URL}/missions/${missionId}/claim`, {
      completedId
    });
    return data;
  }
};
```

#### 3. **Simple Mission Component** (components/MissionCard.tsx)
```typescript
import React from 'react';
import { Mission } from '../api/missions';

interface Props {
  mission: Mission;
  onOptIn: (id: number) => void;
}

export const MissionCard: React.FC<Props> = ({ mission, onOptIn }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header with image */}
      <div className="relative mb-4">
        <img
          src={mission.image}
          alt={mission.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        {mission.is_completed && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            ✓ Completed
          </div>
        )}
      </div>

      {/* Title and description */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {mission.name}
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        {mission.description}
      </p>

      {/* Progress bar */}
      {!mission.is_completed && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${mission.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {Math.round(mission.progress)}%
          </p>
        </div>
      )}

      {/* Reward */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🏆</span>
        <span className="font-semibold text-gray-700">{mission.reward}</span>
      </div>

      {/* Action button */}
      {mission.is_requires_optin && !mission.is_opted_in && (
        <button
          onClick={() => onOptIn(mission.id)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Opt In to Mission
        </button>
      )}

      {mission.is_locked && (
        <div className="w-full bg-gray-200 text-gray-600 font-bold py-2 px-4 rounded text-center">
          🔒 Locked
        </div>
      )}
    </div>
  );
};
```

#### 4. **Mission List with State** (pages/Missions.tsx)
```typescript
import React, { useEffect, useState } from 'react';
import { missionsAPI, Mission } from '../api/missions';
import { MissionCard } from '../components/MissionCard';
import { io, Socket } from 'socket.io-client';

export const MissionsPage: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Fetch initial missions
    loadMissions();

    // Setup WebSocket for real-time updates
    const ws = io('http://localhost:3000');
    
    ws.on('connect', () => {
      console.log('Connected to WebSocket');
      ws.emit('subscribe:missions');
    });

    ws.on('missions:updated', (updatedMissions: Mission[]) => {
      console.log('Missions updated via WebSocket');
      setMissions(updatedMissions);
    });

    setSocket(ws);

    return () => {
      ws.disconnect();
    };
  }, []);

  const loadMissions = async () => {
    try {
      setLoading(true);
      const data = await missionsAPI.getMissions();
      setMissions(data);
    } catch (error) {
      console.error('Failed to load missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptIn = async (missionId: number) => {
    try {
      await missionsAPI.optIn(missionId);
      await loadMissions(); // Refresh missions
    } catch (error) {
      console.error('Failed to opt in:', error);
      alert('Failed to opt in to mission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        My Missions
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {missions.map(mission => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onOptIn={handleOptIn}
          />
        ))}
      </div>

      {missions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">No missions available</p>
        </div>
      )}
    </div>
  );
};
```

---

## 🎨 Common UI Patterns

### 1. **Progress Indicator**
```typescript
export const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  const getColor = (progress: number) => {
    if (progress < 33) return 'bg-red-500';
    if (progress < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className={`h-3 rounded-full transition-all duration-500 ${getColor(progress)}`}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
};
```

### 2. **Countdown Timer**
```typescript
import React, { useEffect, useState } from 'react';

interface TimerProps {
  endTime: number; // Unix timestamp in milliseconds
}

export const CountdownTimer: React.FC<TimerProps> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  if (timeLeft <= 0) {
    return <span className="text-red-500 font-bold">Expired</span>;
  }

  return (
    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
      ⏱️ {formatTime(timeLeft)}
    </div>
  );
};
```

### 3. **Category Filter**
```typescript
interface CategoryFilterProps {
  categories: Array<{ id: number; name: string }>;
  selected: number | null;
  onChange: (id: number | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selected,
  onChange
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-2 rounded-full font-semibold transition-colors ${
          selected === null
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        All
      </button>
      
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={`px-4 py-2 rounded-full font-semibold transition-colors ${
            selected === category.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
```

### 4. **Mission Status Badge**
```typescript
interface StatusBadgeProps {
  mission: Mission;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ mission }) => {
  if (mission.is_completed) {
    return (
      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
        <span>✓</span>
        <span>Completed</span>
      </span>
    );
  }

  if (mission.is_locked) {
    return (
      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
        <span>🔒</span>
        <span>Locked</span>
      </span>
    );
  }

  if (mission.is_requires_optin && !mission.is_opted_in) {
    return (
      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
        <span>⚠️</span>
        <span>Opt-In Required</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
      <span>🎯</span>
      <span>Active</span>
    </span>
  );
};
```

---

## 🔧 Advanced Patterns

### 1. **Custom Hook for Missions**
```typescript
import { useState, useEffect, useCallback } from 'react';
import { missionsAPI, Mission } from '../api/missions';
import { io, Socket } from 'socket.io-client';

export const useMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Load missions
  const loadMissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await missionsAPI.getMissions();
      setMissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load missions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup WebSocket
  useEffect(() => {
    const ws = io('http://localhost:3000');
    
    ws.on('connect', () => {
      ws.emit('subscribe:missions');
    });

    ws.on('missions:updated', (updatedMissions: Mission[]) => {
      setMissions(updatedMissions);
    });

    ws.on('mission:completed', async (data) => {
      // Reload missions when one is completed
      await loadMissions();
      // Show notification
      console.log('Mission completed!', data);
    });

    setSocket(ws);

    return () => {
      ws.disconnect();
    };
  }, [loadMissions]);

  // Initial load
  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  // Opt-in to mission
  const optIn = useCallback(async (missionId: number) => {
    try {
      await missionsAPI.optIn(missionId);
      await loadMissions();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to opt in'
      };
    }
  }, [loadMissions]);

  // Claim reward
  const claimReward = useCallback(async (missionId: number, completedId: number) => {
    try {
      await missionsAPI.claimReward(missionId, completedId);
      await loadMissions();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to claim reward'
      };
    }
  }, [loadMissions]);

  // Filter missions
  const getActiveMissions = useCallback(() => {
    return missions.filter(m => !m.is_completed && !m.is_locked);
  }, [missions]);

  const getCompletedMissions = useCallback(() => {
    return missions.filter(m => m.is_completed);
  }, [missions]);

  const getLockedMissions = useCallback(() => {
    return missions.filter(m => m.is_locked);
  }, [missions]);

  return {
    missions,
    loading,
    error,
    optIn,
    claimReward,
    reload: loadMissions,
    getActiveMissions,
    getCompletedMissions,
    getLockedMissions
  };
};
```

### 2. **Usage of Custom Hook**
```typescript
export const MissionsPage: React.FC = () => {
  const {
    missions,
    loading,
    error,
    optIn,
    claimReward,
    getActiveMissions
  } = useMissions();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const displayedMissions = filter === 'active' 
    ? getActiveMissions() 
    : missions;

  const handleOptIn = async (missionId: number) => {
    const result = await optIn(missionId);
    if (result.success) {
      alert('Successfully opted in!');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <FilterButtons
          current={filter}
          onChange={setFilter}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedMissions.map(mission => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onOptIn={handleOptIn}
          />
        ))}
      </div>
    </div>
  );
};
```

---

## 🎯 Real-World Use Cases

### 1. **Daily Login Mission**
```typescript
// Detect and highlight daily login missions
const isDailyLogin = (mission: Mission) => {
  return mission.name.toLowerCase().includes('daily login') ||
         mission.description.toLowerCase().includes('login every day');
};

// Show special UI for daily missions
{isDailyLogin(mission) && (
  <div className="absolute top-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 text-xs font-bold">
    DAILY
  </div>
)}
```

### 2. **Recurring Missions**
```typescript
interface RecurringMissionProps {
  mission: Mission & {
    next_recurrence_date_ts?: number;
    completion_count?: number;
    max_completion_count?: number;
  };
}

export const RecurringMissionCard: React.FC<RecurringMissionProps> = ({ mission }) => {
  const canRepeat = mission.completion_count! < mission.max_completion_count!;
  const timeToNext = mission.next_recurrence_date_ts! - Date.now();

  return (
    <div className="mission-card">
      {/* Regular mission content */}
      
      {/* Recurring info */}
      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-purple-700 font-semibold">
            🔄 Recurring Mission
          </span>
          <span className="text-xs text-purple-600">
            {mission.completion_count} / {mission.max_completion_count}
          </span>
        </div>
        
        {mission.is_completed && canRepeat && (
          <div className="mt-2 text-xs text-purple-600">
            Next available in: {formatTime(timeToNext)}
          </div>
        )}
      </div>
    </div>
  );
};
```

### 3. **Mission with Multiple Tasks**
```typescript
interface TaskProgressProps {
  tasks: Array<{
    id: number;
    name: string;
    is_completed: boolean;
    execution_count_actual: number;
    execution_count_expected: number;
  }>;
}

export const TaskProgress: React.FC<TaskProgressProps> = ({ tasks }) => {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-gray-700 text-sm">Tasks:</h4>
      
      {tasks.map((task, index) => (
        <div key={task.id} className="flex items-center gap-3">
          {/* Checkbox */}
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            task.is_completed 
              ? 'bg-green-500 border-green-500' 
              : 'border-gray-300'
          }`}>
            {task.is_completed && (
              <span className="text-white text-xs">✓</span>
            )}
          </div>

          {/* Task details */}
          <div className="flex-1">
            <p className={`text-sm ${
              task.is_completed ? 'text-gray-500 line-through' : 'text-gray-700'
            }`}>
              {index + 1}. {task.name}
            </p>
            
            {!task.is_completed && (
              <p className="text-xs text-gray-500">
                {task.execution_count_actual} / {task.execution_count_expected}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
```

### 4. **Game-Related Missions**
```typescript
interface GameMissionProps {
  mission: Mission & {
    related_games?: Array<{
      ext_game_id: string;
      game_public_meta: {
        name: string;
        image: string;
        link: string;
      };
    }>;
  };
}

export const GameRelatedMission: React.FC<GameMissionProps> = ({ mission }) => {
  if (!mission.related_games || mission.related_games.length === 0) {
    return <MissionCard mission={mission} />;
  }

  return (
    <div className="mission-card">
      {/* Regular mission content */}
      
      {/* Related games section */}
      <div className="mt-4 border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Play these games:
        </h4>
        
        <div className="grid grid-cols-3 gap-2">
          {mission.related_games.map(game => (
            <a
              key={game.ext_game_id}
              href={game.game_public_meta.link}
              className="block hover:opacity-80 transition-opacity"
            >
              <img
                src={game.game_public_meta.image}
                alt={game.game_public_meta.name}
                className="w-full h-20 object-cover rounded"
              />
              <p className="text-xs text-center mt-1 truncate">
                {game.game_public_meta.name}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 🚨 Error Handling Patterns

### 1. **API Error Handler**
```typescript
export class APIError extends Error {
  constructor(
    message: string,
    public code: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: any) => {
  if (error.response) {
    // Server responded with error
    throw new APIError(
      error.response.data.error || 'Server error',
      error.response.status,
      error.response.data
    );
  } else if (error.request) {
    // Request made but no response
    throw new APIError('No response from server', 0);
  } else {
    // Something else happened
    throw new APIError(error.message || 'Unknown error', -1);
  }
};

// Usage
try {
  await missionsAPI.getMissions();
} catch (error) {
  const apiError = handleAPIError(error);
  if (apiError.code === 401) {
    // Redirect to login
  } else if (apiError.code === 500) {
    // Show server error message
  }
}
```

### 2. **Error Boundary Component**
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <MissionsPage />
</ErrorBoundary>
```

---

## ✅ Testing Examples

### 1. **Backend Unit Test**
```typescript
// mission.service.test.ts
import { missionService } from '../services/mission.service';

describe('MissionService', () => {
  describe('getMissions', () => {
    it('should return array of missions', async () => {
      const missions = await missionService.getMissions('user123');
      expect(Array.isArray(missions)).toBe(true);
    });

    it('should cache missions', async () => {
      const first = await missionService.getMissions('user123');
      const second = await missionService.getMissions('user123');
      // Should be same reference if cached
      expect(first).toEqual(second);
    });
  });

  describe('filterMissions', () => {
    const mockMissions = [
      { id: 1, is_completed: false, is_locked: false },
      { id: 2, is_completed: true, is_locked: false },
      { id: 3, is_completed: false, is_locked: true },
    ] as any[];

    it('should filter active missions', () => {
      const active = missionService.filterMissions(mockMissions, 'active');
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe(1);
    });

    it('should filter completed missions', () => {
      const completed = missionService.filterMissions(mockMissions, 'completed');
      expect(completed).toHaveLength(1);
      expect(completed[0].id).toBe(2);
    });
  });
});
```

### 2. **Frontend Component Test**
```typescript
// MissionCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MissionCard } from './MissionCard';

describe('MissionCard', () => {
  const mockMission = {
    id: 1,
    name: 'Test Mission',
    description: 'Test description',
    image: '/test.jpg',
    progress: 50,
    reward: '100 points',
    is_completed: false,
    is_locked: false,
    is_requires_optin: false,
    is_opted_in: false,
  };

  it('renders mission details', () => {
    render(<MissionCard mission={mockMission} onOptIn={jest.fn()} />);
    
    expect(screen.getByText('Test Mission')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('100 points')).toBeInTheDocument();
  });

  it('shows opt-in button when required', () => {
    const mission = {
      ...mockMission,
      is_requires_optin: true,
      is_opted_in: false,
    };
    
    const onOptIn = jest.fn();
    render(<MissionCard mission={mission} onOptIn={onOptIn} />);
    
    const button = screen.getByText('Opt In to Mission');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(onOptIn).toHaveBeenCalledWith(1);
  });

  it('shows completed badge', () => {
    const mission = { ...mockMission, is_completed: true };
    render(<MissionCard mission={mission} onOptIn={jest.fn()} />);
    
    expect(screen.getByText('✓ Completed')).toBeInTheDocument();
  });
});
```

---

## 🎨 Styling Tips

### 1. **Tailwind Configuration**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        mission: {
          active: '#3B82F6',
          completed: '#10B981',
          locked: '#6B7280',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
};
```

### 2. **CSS Animations**
```css
/* Custom animations */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.mission-card-loading {
  animation: shimmer 2s infinite;
  background: linear-gradient(to right, #f0f0f0 4%, #f8f8f8 25%, #f0f0f0 36%);
  background-size: 1000px 100%;
}

@keyframes celebrate {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.mission-completed {
  animation: celebrate 0.5s ease-in-out;
}
```

---

This comprehensive guide provides ready-to-use code examples for implementing the Missions & Badges module! 🚀

