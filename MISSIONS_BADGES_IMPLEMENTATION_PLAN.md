# Missions & Badges Module - Implementation Plan

## 📋 Executive Summary

This document outlines the complete implementation plan for building a Missions and Badges system using the Smartico API. The plan covers both back-end (Node.js/Express) and front-end (React/Vue/Angular) implementations with real-time updates.

---

## 🎯 Project Goals

- ✅ Display missions and badges with real-time progress tracking
- ✅ Support mission opt-in and prize claiming
- ✅ Category-based filtering and organization
- ✅ Real-time WebSocket updates
- ✅ Time-limited and scheduled missions
- ✅ Recurring missions support
- ✅ Related games integration
- ✅ Responsive UI with animations
- ✅ Comprehensive error handling

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONT-END LAYER                           │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐          │
│  │ Components │  │ State Mgmt  │  │  WebSocket   │          │
│  │  - Mission │  │ (Redux/Pinia│  │   Client     │          │
│  │  - Badge   │  │  /Context)  │  │              │          │
│  │  - Category│  │             │  │              │          │
│  └────────────┘  └─────────────┘  └──────────────┘          │
└────────────┬─────────────────┬────────────────┬──────────────┘
             │                 │                │
             │ REST API        │ GraphQL        │ WebSocket
             │                 │ (Optional)     │
             ▼                 ▼                ▼
┌──────────────────────────────────────────────────────────────┐
│                      BACK-END LAYER                           │
│  ┌────────────────────────────────────────────────────┐      │
│  │              API Routes / Controllers               │      │
│  │  - GET  /api/missions                              │      │
│  │  - GET  /api/badges                                │      │
│  │  - POST /api/missions/:id/optin                    │      │
│  │  - POST /api/missions/:id/claim                    │      │
│  │  - GET  /api/missions/categories                   │      │
│  └────────────────────────────────────────────────────┘      │
│  ┌────────────────────────────────────────────────────┐      │
│  │              Services Layer                         │      │
│  │  - MissionService                                  │      │
│  │  - BadgeService                                    │      │
│  │  - CategoryService                                 │      │
│  │  - WebSocketService                                │      │
│  └────────────────────────────────────────────────────┘      │
│  ┌────────────────────────────────────────────────────┐      │
│  │           Smartico API Integration                  │      │
│  │  - SmarticoAPI wrapper                             │      │
│  │  - WSAPI for real-time updates                     │      │
│  │  - Caching layer                                   │      │
│  └────────────────────────────────────────────────────┘      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                  SMARTICO BACKEND                             │
│             (papi.smartico.ai)                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 📦 Phase 1: Back-End Implementation

### 1.1 Project Setup

**Tech Stack:**
- Node.js 18+ / TypeScript 5+
- Express.js 4.18+
- Socket.io 4.5+ (for WebSocket)
- @smartico/public-api
- Redis (optional, for caching)
- PM2 (for production)

**Directory Structure:**
```
backend/
├── src/
│   ├── config/
│   │   ├── smartico.config.ts      # Smartico API configuration
│   │   └── app.config.ts            # App configuration
│   ├── services/
│   │   ├── smartico.service.ts     # Smartico API wrapper
│   │   ├── mission.service.ts      # Mission business logic
│   │   ├── badge.service.ts        # Badge business logic
│   │   ├── category.service.ts     # Category logic
│   │   └── websocket.service.ts    # WebSocket handler
│   ├── controllers/
│   │   ├── mission.controller.ts   # Mission endpoints
│   │   ├── badge.controller.ts     # Badge endpoints
│   │   └── category.controller.ts  # Category endpoints
│   ├── routes/
│   │   └── api.routes.ts           # Route definitions
│   ├── middleware/
│   │   ├── auth.middleware.ts      # Authentication
│   │   ├── validation.middleware.ts # Request validation
│   │   └── error.middleware.ts     # Error handling
│   ├── types/
│   │   └── mission.types.ts        # Type definitions
│   ├── utils/
│   │   ├── cache.util.ts           # Caching utilities
│   │   └── logger.util.ts          # Logging
│   └── app.ts                      # Express app
├── package.json
└── tsconfig.json
```

---

### 1.2 Core Services Implementation

#### **smartico.service.ts**
```typescript
import { SmarticoAPI } from '@smartico/public-api';
import { logger } from '../utils/logger.util';

export class SmarticoService {
  private api: SmarticoAPI;
  
  constructor() {
    this.api = new SmarticoAPI(
      process.env.SMARTICO_LABEL_API_KEY!,
      process.env.SMARTICO_BRAND_API_KEY!,
      this.messageSender.bind(this),
      {
        logger: logger,
        logCIDs: [], // Add ClassIds for debugging
        logHTTPTiming: true
      }
    );
  }

  private async messageSender(
    message: any,
    publicApiUrl?: string,
    expectCID?: any
  ): Promise<any> {
    // Implement HTTP request logic
    const response = await fetch(publicApiUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });
    
    return await response.json();
  }

  // Expose API methods
  getAPI() {
    return this.api;
  }

  // Create WSAPI instance for WebSocket
  getWSAPI() {
    return this.api.getWSCalls();
  }
}

export const smarticoService = new SmarticoService();
```

#### **mission.service.ts**
```typescript
import { smarticoService } from './smartico.service';
import { TMissionOrBadge } from '@smartico/public-api';
import { CacheService } from '../utils/cache.util';

export class MissionService {
  private cache: CacheService;

  constructor() {
    this.cache = new CacheService();
  }

  /**
   * Get all missions for a user
   */
  async getMissions(userId: string): Promise<TMissionOrBadge[]> {
    const cacheKey = `missions:${userId}`;
    
    // Check cache
    const cached = await this.cache.get<TMissionOrBadge[]>(cacheKey);
    if (cached) return cached;

    // Fetch from Smartico
    const api = smarticoService.getAPI();
    const missions = await api.missionsGetItemsT(userId);
    
    // Cache for 30 seconds
    await this.cache.set(cacheKey, missions, 30);
    
    return missions;
  }

  /**
   * Get missions with real-time updates
   */
  async getMissionsWithUpdates(
    userId: string,
    onUpdate: (missions: TMissionOrBadge[]) => void
  ): Promise<TMissionOrBadge[]> {
    const wsapi = smarticoService.getWSAPI();
    
    return await wsapi.getMissions({
      onUpdate: (updatedMissions) => {
        onUpdate(updatedMissions);
      }
    });
  }

  /**
   * Filter missions by status
   */
  filterMissions(
    missions: TMissionOrBadge[],
    filter: 'active' | 'completed' | 'locked' | 'all'
  ): TMissionOrBadge[] {
    switch (filter) {
      case 'active':
        return missions.filter(m => !m.is_completed && !m.is_locked);
      case 'completed':
        return missions.filter(m => m.is_completed);
      case 'locked':
        return missions.filter(m => m.is_locked);
      default:
        return missions;
    }
  }

  /**
   * Filter missions by category
   */
  filterByCategory(
    missions: TMissionOrBadge[],
    categoryId: number
  ): TMissionOrBadge[] {
    return missions.filter(m => m.category_ids.includes(categoryId));
  }

  /**
   * Opt-in to a mission
   */
  async optInToMission(userId: string, missionId: number) {
    const wsapi = smarticoService.getWSAPI();
    const result = await wsapi.requestMissionOptIn(missionId);
    
    // Clear cache
    await this.cache.delete(`missions:${userId}`);
    
    return result;
  }

  /**
   * Claim mission reward
   */
  async claimMissionReward(
    userId: string,
    missionId: number,
    completedId: number
  ) {
    const wsapi = smarticoService.getWSAPI();
    const result = await wsapi.requestMissionClaimReward(
      missionId,
      completedId
    );
    
    // Clear cache
    await this.cache.delete(`missions:${userId}`);
    
    return result;
  }

  /**
   * Get mission by ID
   */
  async getMissionById(
    userId: string,
    missionId: number
  ): Promise<TMissionOrBadge | undefined> {
    const missions = await this.getMissions(userId);
    return missions.find(m => m.id === missionId);
  }

  /**
   * Check if mission is claimable
   */
  isClaimable(mission: TMissionOrBadge): boolean {
    return (
      mission.is_completed &&
      mission.requires_prize_claim &&
      !mission.prize_claimed_date_ts
    );
  }

  /**
   * Calculate time remaining for time-limited missions
   */
  getTimeRemaining(mission: TMissionOrBadge): number | null {
    if (!mission.time_limit_ms || !mission.dt_start) return null;
    
    const endTime = mission.dt_start + mission.time_limit_ms;
    const remaining = endTime - Date.now();
    
    return remaining > 0 ? remaining : 0;
  }
}

export const missionService = new MissionService();
```

#### **badge.service.ts**
```typescript
import { smarticoService } from './smartico.service';
import { TMissionOrBadge } from '@smartico/public-api';
import { CacheService } from '../utils/cache.util';

export class BadgeService {
  private cache: CacheService;

  constructor() {
    this.cache = new CacheService();
  }

  /**
   * Get all badges for a user
   */
  async getBadges(userId: string): Promise<TMissionOrBadge[]> {
    const cacheKey = `badges:${userId}`;
    
    const cached = await this.cache.get<TMissionOrBadge[]>(cacheKey);
    if (cached) return cached;

    const api = smarticoService.getAPI();
    const badges = await api.badgetsGetItemsT(userId);
    
    await this.cache.set(cacheKey, badges, 30);
    
    return badges;
  }

  /**
   * Get badges with real-time updates
   */
  async getBadgesWithUpdates(
    userId: string,
    onUpdate: (badges: TMissionOrBadge[]) => void
  ): Promise<TMissionOrBadge[]> {
    const wsapi = smarticoService.getWSAPI();
    return await wsapi.getBadges();
  }

  /**
   * Get earned badges
   */
  getEarnedBadges(badges: TMissionOrBadge[]): TMissionOrBadge[] {
    return badges.filter(b => b.is_completed);
  }

  /**
   * Get badge progress
   */
  getBadgeProgress(badge: TMissionOrBadge): number {
    return badge.progress || 0;
  }

  /**
   * Group badges by category
   */
  groupByCategory(badges: TMissionOrBadge[]): Map<number, TMissionOrBadge[]> {
    const grouped = new Map<number, TMissionOrBadge[]>();
    
    badges.forEach(badge => {
      badge.category_ids.forEach(catId => {
        if (!grouped.has(catId)) {
          grouped.set(catId, []);
        }
        grouped.get(catId)!.push(badge);
      });
    });
    
    return grouped;
  }
}

export const badgeService = new BadgeService();
```

#### **category.service.ts**
```typescript
import { smarticoService } from './smartico.service';
import { TAchCategory } from '@smartico/public-api';
import { CacheService } from '../utils/cache.util';

export class CategoryService {
  private cache: CacheService;

  constructor() {
    this.cache = new CacheService();
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<TAchCategory[]> {
    const cacheKey = 'categories:all';
    
    const cached = await this.cache.get<TAchCategory[]>(cacheKey);
    if (cached) return cached;

    const wsapi = smarticoService.getWSAPI();
    const categories = await wsapi.getAchCategories();
    
    // Cache for 5 minutes (categories don't change often)
    await this.cache.set(cacheKey, categories, 300);
    
    return categories;
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: number): Promise<TAchCategory | undefined> {
    const categories = await this.getCategories();
    return categories.find(c => c.id === categoryId);
  }
}

export const categoryService = new CategoryService();
```

---

### 1.3 API Controllers

#### **mission.controller.ts**
```typescript
import { Request, Response, NextFunction } from 'express';
import { missionService } from '../services/mission.service';
import { categoryService } from '../services/category.service';

export class MissionController {
  /**
   * GET /api/missions
   */
  async getMissions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id; // From auth middleware
      const { filter, categoryId, status } = req.query;

      let missions = await missionService.getMissions(userId);

      // Apply filters
      if (status) {
        missions = missionService.filterMissions(
          missions,
          status as any
        );
      }

      if (categoryId) {
        missions = missionService.filterByCategory(
          missions,
          parseInt(categoryId as string)
        );
      }

      res.json({
        success: true,
        data: missions,
        count: missions.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/missions/:id
   */
  async getMissionById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const missionId = parseInt(req.params.id);

      const mission = await missionService.getMissionById(userId, missionId);

      if (!mission) {
        return res.status(404).json({
          success: false,
          error: 'Mission not found'
        });
      }

      res.json({
        success: true,
        data: mission
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/missions/:id/optin
   */
  async optInToMission(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const missionId = parseInt(req.params.id);

      const result = await missionService.optInToMission(userId, missionId);

      if (result.err_code !== 0) {
        return res.status(400).json({
          success: false,
          error: result.err_message,
          code: result.err_code
        });
      }

      res.json({
        success: true,
        message: 'Successfully opted in to mission'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/missions/:id/claim
   */
  async claimReward(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const missionId = parseInt(req.params.id);
      const { completedId } = req.body;

      if (!completedId) {
        return res.status(400).json({
          success: false,
          error: 'completedId is required'
        });
      }

      const result = await missionService.claimMissionReward(
        userId,
        missionId,
        completedId
      );

      if (result.err_code !== 0) {
        return res.status(400).json({
          success: false,
          error: result.err_message,
          code: result.err_code
        });
      }

      res.json({
        success: true,
        message: 'Reward claimed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/missions/categories
   */
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getCategories();

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }
}

export const missionController = new MissionController();
```

---

### 1.4 WebSocket Service

#### **websocket.service.ts**
```typescript
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { smarticoService } from './smartico.service';
import { missionService } from './mission.service';
import { badgeService } from './badge.service';

export class WebSocketService {
  private io: SocketIOServer;

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
      }
    });

    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Authenticate user
      const userId = socket.handshake.auth.userId;
      if (!userId) {
        socket.disconnect();
        return;
      }

      // Join user-specific room
      socket.join(`user:${userId}`);

      // Subscribe to mission updates
      socket.on('subscribe:missions', async () => {
        await this.subscribeMissions(userId, socket.id);
      });

      // Subscribe to badge updates
      socket.on('subscribe:badges', async () => {
        await this.subscribeBadges(userId, socket.id);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  private async subscribeMissions(userId: string, socketId: string) {
    await missionService.getMissionsWithUpdates(
      userId,
      (updatedMissions) => {
        // Emit to specific user room
        this.io.to(`user:${userId}`).emit('missions:updated', {
          missions: updatedMissions,
          timestamp: Date.now()
        });
      }
    );
  }

  private async subscribeBadges(userId: string, socketId: string) {
    await badgeService.getBadgesWithUpdates(
      userId,
      (updatedBadges) => {
        this.io.to(`user:${userId}`).emit('badges:updated', {
          badges: updatedBadges,
          timestamp: Date.now()
        });
      }
    );
  }

  // Emit mission completion
  emitMissionCompleted(userId: string, missionId: number) {
    this.io.to(`user:${userId}`).emit('mission:completed', {
      missionId,
      timestamp: Date.now()
    });
  }

  // Emit badge earned
  emitBadgeEarned(userId: string, badgeId: number) {
    this.io.to(`user:${userId}`).emit('badge:earned', {
      badgeId,
      timestamp: Date.now()
    });
  }
}

export const websocketService = new WebSocketService();
```

---

### 1.5 API Routes

#### **api.routes.ts**
```typescript
import { Router } from 'express';
import { missionController } from '../controllers/mission.controller';
import { badgeController } from '../controllers/badge.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Mission routes
router.get('/missions', missionController.getMissions.bind(missionController));
router.get('/missions/:id', missionController.getMissionById.bind(missionController));
router.post('/missions/:id/optin', missionController.optInToMission.bind(missionController));
router.post('/missions/:id/claim', missionController.claimReward.bind(missionController));
router.get('/missions/categories', missionController.getCategories.bind(missionController));

// Badge routes
router.get('/badges', badgeController.getBadges.bind(badgeController));
router.get('/badges/:id', badgeController.getBadgeById.bind(badgeController));

export default router;
```

---

### 1.6 Utilities

#### **cache.util.ts**
```typescript
import NodeCache from 'node-cache';

export class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 30, // 30 seconds default
      checkperiod: 60,
      useClones: false
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    return this.cache.set(key, value, ttl || 30);
  }

  async delete(key: string): Promise<number> {
    return this.cache.del(key);
  }

  async clear(): Promise<void> {
    this.cache.flushAll();
  }
}
```

---

## 📱 Phase 2: Front-End Implementation (React)

### 2.1 Project Setup

**Tech Stack:**
- React 18+
- TypeScript 5+
- Redux Toolkit / Zustand (state management)
- Socket.io-client (WebSocket)
- Axios (HTTP)
- TailwindCSS / Material-UI (styling)
- Framer Motion (animations)
- React Query (optional, for caching)

**Directory Structure:**
```
frontend/
├── src/
│   ├── api/
│   │   ├── missions.api.ts         # API client
│   │   └── websocket.client.ts     # WebSocket client
│   ├── store/
│   │   ├── missionsSlice.ts        # Redux slice
│   │   ├── badgesSlice.ts          # Redux slice
│   │   └── index.ts                # Store config
│   ├── components/
│   │   ├── missions/
│   │   │   ├── MissionCard.tsx     # Individual mission
│   │   │   ├── MissionList.tsx     # List view
│   │   │   ├── MissionDetail.tsx   # Detail modal
│   │   │   ├── MissionProgress.tsx # Progress bar
│   │   │   └── MissionFilters.tsx  # Filters
│   │   ├── badges/
│   │   │   ├── BadgeCard.tsx       # Individual badge
│   │   │   ├── BadgeGrid.tsx       # Grid view
│   │   │   └── BadgeDetail.tsx     # Detail modal
│   │   ├── common/
│   │   │   ├── ProgressBar.tsx     # Progress component
│   │   │   ├── Timer.tsx           # Countdown timer
│   │   │   ├── CategoryFilter.tsx  # Category filter
│   │   │   └── StatusBadge.tsx     # Status indicator
│   │   └── layouts/
│   │       └── MissionsLayout.tsx  # Main layout
│   ├── hooks/
│   │   ├── useMissions.ts          # Mission hooks
│   │   ├── useBadges.ts            # Badge hooks
│   │   └── useWebSocket.ts         # WebSocket hook
│   ├── types/
│   │   └── mission.types.ts        # TypeScript types
│   ├── utils/
│   │   ├── time.utils.ts           # Time utilities
│   │   └── format.utils.ts         # Formatting
│   └── App.tsx
├── package.json
└── tsconfig.json
```

---

### 2.2 API Client

#### **missions.api.ts**
```typescript
import axios, { AxiosInstance } from 'axios';

export interface Mission {
  id: number;
  name: string;
  description: string;
  image: string;
  is_completed: boolean;
  is_locked: boolean;
  is_requires_optin: boolean;
  is_opted_in: boolean;
  progress: number;
  reward: string;
  time_limit_ms?: number;
  dt_start?: number;
  tasks: Task[];
  category_ids: number[];
  ach_completed_id?: number;
  requires_prize_claim?: boolean;
  prize_claimed_date_ts?: number;
}

export interface Task {
  id: number;
  name: string;
  is_completed: boolean;
  progress: number;
  execution_count_expected: number;
  execution_count_actual: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

class MissionsAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token interceptor
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Get all missions
  async getMissions(params?: {
    status?: 'active' | 'completed' | 'locked';
    categoryId?: number;
  }) {
    const response = await this.client.get<{
      success: boolean;
      data: Mission[];
    }>('/missions', { params });
    return response.data.data;
  }

  // Get mission by ID
  async getMissionById(id: number) {
    const response = await this.client.get<{
      success: boolean;
      data: Mission;
    }>(`/missions/${id}`);
    return response.data.data;
  }

  // Opt-in to mission
  async optInToMission(id: number) {
    const response = await this.client.post<{
      success: boolean;
      message: string;
    }>(`/missions/${id}/optin`);
    return response.data;
  }

  // Claim mission reward
  async claimReward(id: number, completedId: number) {
    const response = await this.client.post<{
      success: boolean;
      message: string;
    }>(`/missions/${id}/claim`, { completedId });
    return response.data;
  }

  // Get categories
  async getCategories() {
    const response = await this.client.get<{
      success: boolean;
      data: Category[];
    }>('/missions/categories');
    return response.data.data;
  }

  // Get badges
  async getBadges() {
    const response = await this.client.get<{
      success: boolean;
      data: Mission[];
    }>('/badges');
    return response.data.data;
  }
}

export const missionsAPI = new MissionsAPI();
```

---

### 2.3 WebSocket Client

#### **websocket.client.ts**
```typescript
import { io, Socket } from 'socket.io-client';

export class WebSocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(userId: string) {
    this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:3000', {
      auth: {
        userId
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    // Missions updated
    this.socket.on('missions:updated', (data) => {
      this.emit('missions:updated', data);
    });

    // Badges updated
    this.socket.on('badges:updated', (data) => {
      this.emit('badges:updated', data);
    });

    // Mission completed
    this.socket.on('mission:completed', (data) => {
      this.emit('mission:completed', data);
    });

    // Badge earned
    this.socket.on('badge:earned', (data) => {
      this.emit('badge:earned', data);
    });
  }

  subscribeMissions() {
    this.socket?.emit('subscribe:missions');
  }

  subscribeBadges() {
    this.socket?.emit('subscribe:badges');
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
  }
}

export const wsClient = new WebSocketClient();
```

---

### 2.4 Redux Store

#### **missionsSlice.ts**
```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { missionsAPI, Mission, Category } from '../api/missions.api';

interface MissionsState {
  missions: Mission[];
  badges: Mission[];
  categories: Category[];
  selectedCategory: number | null;
  filter: 'all' | 'active' | 'completed' | 'locked';
  loading: boolean;
  error: string | null;
}

const initialState: MissionsState = {
  missions: [],
  badges: [],
  categories: [],
  selectedCategory: null,
  filter: 'all',
  loading: false,
  error: null
};

// Async thunks
export const fetchMissions = createAsyncThunk(
  'missions/fetchMissions',
  async (params?: { status?: string; categoryId?: number }) => {
    return await missionsAPI.getMissions(params as any);
  }
);

export const fetchBadges = createAsyncThunk(
  'missions/fetchBadges',
  async () => {
    return await missionsAPI.getBadges();
  }
);

export const fetchCategories = createAsyncThunk(
  'missions/fetchCategories',
  async () => {
    return await missionsAPI.getCategories();
  }
);

export const optInToMission = createAsyncThunk(
  'missions/optIn',
  async (missionId: number) => {
    await missionsAPI.optInToMission(missionId);
    return missionId;
  }
);

export const claimMissionReward = createAsyncThunk(
  'missions/claimReward',
  async ({ missionId, completedId }: { missionId: number; completedId: number }) => {
    await missionsAPI.claimReward(missionId, completedId);
    return missionId;
  }
);

// Slice
const missionsSlice = createSlice({
  name: 'missions',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<number | null>) => {
      state.selectedCategory = action.payload;
    },
    setFilter: (state, action: PayloadAction<MissionsState['filter']>) => {
      state.filter = action.payload;
    },
    updateMissions: (state, action: PayloadAction<Mission[]>) => {
      state.missions = action.payload;
    },
    updateBadges: (state, action: PayloadAction<Mission[]>) => {
      state.badges = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch missions
    builder.addCase(fetchMissions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMissions.fulfilled, (state, action) => {
      state.loading = false;
      state.missions = action.payload;
    });
    builder.addCase(fetchMissions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch missions';
    });

    // Fetch badges
    builder.addCase(fetchBadges.fulfilled, (state, action) => {
      state.badges = action.payload;
    });

    // Fetch categories
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
    });

    // Opt-in
    builder.addCase(optInToMission.fulfilled, (state, action) => {
      const mission = state.missions.find(m => m.id === action.payload);
      if (mission) {
        mission.is_opted_in = true;
      }
    });

    // Claim reward
    builder.addCase(claimMissionReward.fulfilled, (state, action) => {
      const mission = state.missions.find(m => m.id === action.payload);
      if (mission) {
        mission.prize_claimed_date_ts = Date.now();
      }
    });
  }
});

export const {
  setSelectedCategory,
  setFilter,
  updateMissions,
  updateBadges,
  clearError
} = missionsSlice.actions;

export default missionsSlice.reducer;
```

---

### 2.5 React Components

#### **MissionCard.tsx**
```typescript
import React from 'react';
import { Mission } from '../api/missions.api';
import { ProgressBar } from '../components/common/ProgressBar';
import { Timer } from '../components/common/Timer';
import { motion } from 'framer-motion';

interface MissionCardProps {
  mission: Mission;
  onOptIn: (id: number) => void;
  onClaim: (id: number, completedId: number) => void;
  onClick: (mission: Mission) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onOptIn,
  onClaim,
  onClick
}) => {
  const isClaimable = mission.is_completed && 
                      mission.requires_prize_claim && 
                      !mission.prize_claimed_date_ts;

  const isOptInRequired = mission.is_requires_optin && !mission.is_opted_in;

  return (
    <motion.div
      className="mission-card bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
      onClick={() => onClick(mission)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={mission.image}
          alt={mission.name}
          className="w-full h-full object-cover"
        />
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-2">
          {mission.is_completed && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              ✓ Completed
            </span>
          )}
          {mission.is_locked && (
            <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              🔒 Locked
            </span>
          )}
        </div>

        {/* Timer */}
        {mission.time_limit_ms && mission.dt_start && !mission.is_completed && (
          <div className="absolute bottom-2 left-2">
            <Timer
              startTime={mission.dt_start}
              duration={mission.time_limit_ms}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {mission.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {mission.description}
        </p>

        {/* Progress */}
        {!mission.is_completed && !mission.is_locked && (
          <div className="mb-4">
            <ProgressBar progress={mission.progress} />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Progress</span>
              <span>{Math.round(mission.progress)}%</span>
            </div>
          </div>
        )}

        {/* Reward */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 text-xl">🏆</span>
            <span className="font-semibold text-gray-700">
              {mission.reward}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isOptInRequired && (
            <button
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onOptIn(mission.id);
              }}
            >
              Opt In
            </button>
          )}

          {isClaimable && (
            <button
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors animate-pulse"
              onClick={(e) => {
                e.stopPropagation();
                onClaim(mission.id, mission.ach_completed_id!);
              }}
            >
              Claim Reward
            </button>
          )}

          {!isOptInRequired && !isClaimable && (
            <button className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded">
              View Details
            </button>
          )}
        </div>
      </div>

      {/* Tasks indicator */}
      {mission.tasks.length > 0 && (
        <div className="px-4 pb-4">
          <div className="text-xs text-gray-500">
            {mission.tasks.filter(t => t.is_completed).length} / {mission.tasks.length} tasks completed
          </div>
        </div>
      )}
    </motion.div>
  );
};
```

#### **MissionList.tsx**
```typescript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchMissions,
  fetchCategories,
  optInToMission,
  claimMissionReward,
  setFilter,
  setSelectedCategory,
  updateMissions
} from '../store/missionsSlice';
import { MissionCard } from './MissionCard';
import { MissionFilters } from './MissionFilters';
import { wsClient } from '../api/websocket.client';

export const MissionList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    missions,
    categories,
    selectedCategory,
    filter,
    loading,
    error
  } = useSelector((state: RootState) => state.missions);

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchMissions());
    dispatch(fetchCategories());

    // Connect WebSocket
    const userId = 'user123'; // Get from auth
    wsClient.connect(userId);
    wsClient.subscribeMissions();

    // Listen for updates
    const handleMissionsUpdated = (data: any) => {
      dispatch(updateMissions(data.missions));
    };

    wsClient.on('missions:updated', handleMissionsUpdated);

    return () => {
      wsClient.off('missions:updated', handleMissionsUpdated);
      wsClient.disconnect();
    };
  }, [dispatch]);

  const handleOptIn = (id: number) => {
    dispatch(optInToMission(id));
  };

  const handleClaim = (id: number, completedId: number) => {
    dispatch(claimMissionReward({ missionId: id, completedId }));
  };

  const handleMissionClick = (mission: Mission) => {
    // Open detail modal
    console.log('Open mission detail:', mission);
  };

  const filteredMissions = missions.filter(mission => {
    // Filter by status
    if (filter === 'active' && (mission.is_completed || mission.is_locked)) {
      return false;
    }
    if (filter === 'completed' && !mission.is_completed) {
      return false;
    }
    if (filter === 'locked' && !mission.is_locked) {
      return false;
    }

    // Filter by category
    if (selectedCategory && !mission.category_ids.includes(selectedCategory)) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="missions-container">
      <MissionFilters
        categories={categories}
        selectedCategory={selectedCategory}
        filter={filter}
        onCategoryChange={(id) => dispatch(setSelectedCategory(id))}
        onFilterChange={(f) => dispatch(setFilter(f))}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredMissions.map(mission => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onOptIn={handleOptIn}
            onClaim={handleClaim}
            onClick={handleMissionClick}
          />
        ))}
      </div>

      {filteredMissions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">No missions found</p>
        </div>
      )}
    </div>
  );
};
```

---

## 🎯 Phase 3: Implementation Timeline

### Week 1: Back-End Foundation
- ✅ Project setup and configuration
- ✅ Smartico API integration
- ✅ Core services (Mission, Badge, Category)
- ✅ Basic API endpoints
- ✅ Testing with Postman

### Week 2: Back-End Advanced Features
- ✅ WebSocket service implementation
- ✅ Real-time updates
- ✅ Caching layer
- ✅ Error handling
- ✅ API documentation

### Week 3: Front-End Foundation
- ✅ Project setup
- ✅ Redux store configuration
- ✅ API client and WebSocket client
- ✅ Basic components (MissionCard, BadgeCard)
- ✅ Routing

### Week 4: Front-End Advanced Features
- ✅ Advanced components (Filters, Detail modals)
- ✅ Real-time updates integration
- ✅ Animations and transitions
- ✅ Error handling
- ✅ Responsive design

### Week 5: Testing & Optimization
- ✅ Unit tests (Jest)
- ✅ Integration tests
- ✅ E2E tests (Cypress/Playwright)
- ✅ Performance optimization
- ✅ Security audit

### Week 6: Deployment & Documentation
- ✅ Production build
- ✅ Docker containerization
- ✅ CI/CD pipeline
- ✅ User documentation
- ✅ Developer documentation

---

## 🧪 Testing Strategy

### Back-End Tests
```typescript
// mission.service.test.ts
describe('MissionService', () => {
  it('should fetch missions for a user', async () => {
    const missions = await missionService.getMissions('user123');
    expect(missions).toBeInstanceOf(Array);
  });

  it('should filter missions by status', () => {
    const missions = [/* mock data */];
    const active = missionService.filterMissions(missions, 'active');
    expect(active.every(m => !m.is_completed && !m.is_locked)).toBe(true);
  });

  it('should handle opt-in', async () => {
    const result = await missionService.optInToMission('user123', 1);
    expect(result.err_code).toBe(0);
  });
});
```

### Front-End Tests
```typescript
// MissionCard.test.tsx
describe('MissionCard', () => {
  it('should render mission details', () => {
    const mission = {/* mock data */};
    render(<MissionCard mission={mission} />);
    expect(screen.getByText(mission.name)).toBeInTheDocument();
  });

  it('should show opt-in button when required', () => {
    const mission = {
      is_requires_optin: true,
      is_opted_in: false,
      /* other fields */
    };
    render(<MissionCard mission={mission} />);
    expect(screen.getByText('Opt In')).toBeInTheDocument();
  });
});
```

---

## 🚀 Deployment Checklist

### Back-End
- [ ] Environment variables configured
- [ ] Smartico API keys secured
- [ ] Redis/cache configured
- [ ] WebSocket server tested
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Health check endpoint
- [ ] Docker image built
- [ ] Deployed to server

### Front-End
- [ ] Environment variables set
- [ ] API URLs configured
- [ ] WebSocket connection tested
- [ ] Build optimized
- [ ] Assets compressed
- [ ] CDN configured (optional)
- [ ] Service worker (optional)
- [ ] Analytics integrated
- [ ] Error tracking (Sentry)
- [ ] Deployed to hosting

---

## 📊 Success Metrics

- **Performance**: API response < 200ms
- **Real-time**: WebSocket latency < 100ms
- **Uptime**: 99.9% availability
- **User Engagement**: Mission completion rate
- **Error Rate**: < 0.1% of requests

---

## 🔒 Security Considerations

1. **Authentication**: JWT tokens with refresh mechanism
2. **Authorization**: User can only access their own data
3. **Rate Limiting**: Prevent API abuse
4. **Input Validation**: Validate all user inputs
5. **XSS Protection**: Sanitize rendered content
6. **CSRF Protection**: Use tokens for state-changing operations
7. **WebSocket Auth**: Verify user identity on connection

---

## 📝 Next Steps

1. Review and approve this implementation plan
2. Set up development environment
3. Create project repositories
4. Begin Phase 1 (Back-End Foundation)
5. Weekly progress reviews
6. Iterative development with user feedback

---

**Estimated Total Time**: 6 weeks  
**Team Size**: 2-3 developers (1 back-end, 1-2 front-end)  
**Budget**: Medium (depending on hosting and tools)

