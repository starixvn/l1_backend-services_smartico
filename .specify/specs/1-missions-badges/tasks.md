# Missions & Badges - Task Breakdown

**Epic:** Missions & Badges Feature  
**Sprint:** TBD  
**Created:** 2024-10-29  
**Owner:** Development Team  
**Total Estimate:** 291 hours (≈7-8 weeks with 2-person team)

## Task Categorization

Tasks are organized according to constitutional principles:

- **[CQ]** Code Quality (SOLID & Clean Code)
- **[TS]** Testing (AAA Pattern)
- **[UX]** User Experience
- **[PF]** Performance
- **[TY]** Type Safety & Documentation
- **[SC]** Security
- **[DV]** DevOps
- **[RV]** Review/Validation

## Epic Overview

**Goal:** Implement complete Missions & Badges gamification feature with mobile-first responsive design, real-time updates, and exceptional UX.

**Business Value:**
- Increase user engagement by 40%
- Drive specific user behaviors (deposits, game plays, etc.)
- Improve user retention through achievement progression
- Provide clear value proposition for new users

**Success Criteria:**
- ✅ Mission list loads in < 1.5s on 3G connection
- ✅ Real-time progress updates appear within 2s
- ✅ 80%+ code coverage with AAA pattern tests
- ✅ WCAG 2.1 Level AA accessibility compliance
- ✅ Mobile-first design tested on 320px+ screens
- ✅ Zero TypeScript `any` types in production code
- ✅ All constitutional principles met

---

## Phase 1: Foundation & Setup (24 hours)

### TASK-001: Project Setup & Configuration [DV]
**Type:** DevOps  
**Priority:** Critical  
**Estimate:** 4 hours  
**Dependencies:** None  
**Constitutional Alignment:** Type Safety, Code Quality

**Description:**
Initialize React/TypeScript project with strict mode, ESLint, Prettier, and all development tooling.

**Acceptance Criteria:**
- [ ] React 18+ with TypeScript 5+
- [ ] TypeScript configured with `strict: true`
- [ ] ESLint configured with recommended + SOLID rules
- [ ] Prettier configured for consistent formatting
- [ ] Husky + lint-staged for pre-commit hooks
- [ ] Jest + React Testing Library configured
- [ ] Package.json with all dependencies
- [ ] README.md with setup instructions
- [ ] @smartico/public-api installed and configured

**Implementation Notes:**
```bash
npx create-react-app smartico-missions --template typescript
npm install @smartico/public-api @reduxjs/toolkit react-redux
npm install -D eslint prettier husky lint-staged
```

**Files to Create:**
- `tsconfig.json` (strict mode enabled)
- `.eslintrc.js` (SOLID + React rules)
- `.prettierrc`
- `.husky/pre-commit`
- `README.md`

---

### TASK-002: Define Project Structure [CQ]
**Type:** Code Quality  
**Priority:** Critical  
**Estimate:** 3 hours  
**Dependencies:** TASK-001  
**Constitutional Alignment:** Code Quality (SRP), Clean Architecture

**Description:**
Create clean architecture folder structure with clear separation of concerns.

**Acceptance Criteria:**
- [ ] Folder structure follows clean architecture layers
- [ ] Each layer has clear responsibilities
- [ ] README.md in each major directory explaining purpose
- [ ] Barrel exports (index.ts) for clean imports
- [ ] No circular dependencies

**Directory Structure:**
```
src/
├── presentation/          # UI Layer
│   ├── pages/            # Route pages
│   ├── components/       # Presentational components
│   ├── containers/       # Smart components
│   └── styles/           # Theme, breakpoints
├── application/          # App Layer
│   ├── store/            # Redux store setup
│   ├── slices/           # Redux slices
│   ├── middleware/       # Custom middleware
│   └── selectors/        # Memoized selectors
├── domain/               # Domain Layer
│   ├── services/         # Business logic services
│   ├── usecases/         # Use case implementations
│   └── types/            # Domain types (re-exports from @smartico/public-api)
├── infrastructure/       # Infrastructure Layer
│   ├── api/              # API client wrappers
│   ├── websocket/        # WebSocket management
│   └── storage/          # Cache/storage
└── shared/               # Shared utilities
    ├── utils/            # Helper functions
    ├── constants/        # Constants
    └── hooks/            # Custom React hooks
```

---

### TASK-003: Setup Redux Store with TypeScript [TY]
**Type:** Type Safety & Documentation  
**Priority:** Critical  
**Estimate:** 5 hours  
**Dependencies:** TASK-002  
**Constitutional Alignment:** Type Safety, Code Quality (DIP)

**Description:**
Configure Redux Toolkit with full TypeScript support, type-safe hooks, and middleware.

**Acceptance Criteria:**
- [ ] Redux store configured with TypeScript
- [ ] RootState and AppDispatch types exported
- [ ] Type-safe useSelector and useDispatch hooks
- [ ] Redux DevTools enabled (development only)
- [ ] Logger middleware configured
- [ ] All types explicitly defined (no `any`)
- [ ] JSDoc comments for all public APIs

**Files to Create:**
- `src/application/store/store.ts`
- `src/application/store/hooks.ts`
- `src/application/store/types.ts`

**Implementation:**
```typescript
// src/application/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import missionsReducer from '../slices/missionsSlice';
import badgesReducer from '../slices/badgesSlice';

export const store = configureStore({
  reducer: {
    missions: missionsReducer,
    badges: badgesReducer,
    ui: uiReducer,
    connection: connectionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loggerMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

### TASK-004: Create Mission Service with DI [CQ]
**Type:** Code Quality  
**Priority:** Critical  
**Estimate:** 6 hours  
**Dependencies:** TASK-003  
**Constitutional Alignment:** Code Quality (SRP, DIP), Type Safety

**Description:**
Implement MissionService following SOLID principles with dependency injection for @smartico/public-api.

**Acceptance Criteria:**
- [ ] Service follows Single Responsibility Principle
- [ ] Dependencies injected via constructor (DIP)
- [ ] All methods < 20 lines
- [ ] No magic numbers (use named constants)
- [ ] Full TypeScript types from @smartico/public-api
- [ ] JSDoc comments for all public methods
- [ ] Error handling with typed errors
- [ ] Repository pattern for data access

**Files to Create:**
- `src/domain/services/MissionService.ts`
- `src/domain/services/IMissionService.ts` (interface)
- `src/domain/services/index.ts`

**Implementation:**
```typescript
/**
 * Service for mission-related operations.
 * Implements repository pattern for clean separation from infrastructure.
 */
export class MissionService implements IMissionService {
  constructor(private wsApi: WSAPI) {}

  /**
   * Fetches all missions for the authenticated user.
   * @returns Promise resolving to array of missions
   * @throws {ApiError} If API call fails
   */
  async getMissions(): Promise<TMissionOrBadge[]> {
    return this.wsApi.getMissions();
  }

  // ... other methods
}
```

---

### TASK-005: Create Badge Service [CQ]
**Type:** Code Quality  
**Priority:** High  
**Estimate:** 4 hours  
**Dependencies:** TASK-004  
**Constitutional Alignment:** Code Quality (SRP, DIP), Type Safety

**Description:**
Implement BadgeService similar to MissionService with same SOLID principles.

**Acceptance Criteria:**
- [ ] Service follows Single Responsibility Principle
- [ ] Dependencies injected via constructor
- [ ] Methods < 20 lines
- [ ] Full TypeScript types
- [ ] JSDoc documentation
- [ ] Error handling

**Files to Create:**
- `src/domain/services/BadgeService.ts`
- `src/domain/services/IBadgeService.ts`

---

### TASK-006: Setup Theme & Design Tokens [UX]
**Type:** User Experience  
**Priority:** High  
**Estimate:** 2 hours  
**Dependencies:** TASK-002  
**Constitutional Alignment:** UX Consistency

**Description:**
Create design system tokens (colors, spacing, typography, breakpoints) for consistent UI.

**Acceptance Criteria:**
- [ ] Color palette defined (primary, secondary, success, error, etc.)
- [ ] Typography scale defined (font sizes, weights, line heights)
- [ ] Spacing scale defined (4px base unit)
- [ ] Breakpoints defined (320, 480, 768, 1024, 1440px)
- [ ] Shadow/elevation tokens defined
- [ ] All tokens exported as TypeScript constants
- [ ] Documentation with examples

**Files to Create:**
- `src/presentation/styles/theme.ts`
- `src/presentation/styles/breakpoints.ts`
- `src/presentation/styles/typography.ts`
- `src/presentation/styles/colors.ts`

---

## Phase 1B: Backend Setup (Node.js/Express) (48 hours)

### TASK-007: Backend Project Initialization [DV]
**Type:** DevOps  
**Priority:** Critical  
**Estimate:** 4 hours  
**Dependencies:** None  
**Constitutional Alignment:** Type Safety, Code Quality

**Description:**
Initialize Node.js/Express backend with TypeScript, proper project structure, and development tooling.

**Acceptance Criteria:**
- [ ] Node.js project initialized with TypeScript
- [ ] Express 4+ configured
- [ ] TypeScript strict mode enabled
- [ ] ESLint + Prettier configured
- [ ] Nodemon for development
- [ ] Environment variable management (.env)
- [ ] Package.json with all dependencies
- [ ] README.md with setup instructions
- [ ] @smartico/public-api installed

**Implementation Notes:**
```bash
mkdir smartico-backend
cd smartico-backend
npm init -y
npm install express @smartico/public-api
npm install -D typescript @types/node @types/express ts-node nodemon
npx tsc --init --strict
```

**Files to Create:**
- `package.json`
- `tsconfig.json` (strict mode)
- `.env.example`
- `.gitignore`
- `README.md`
- `nodemon.json`

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  }
}
```

---

### TASK-008: Backend Architecture & Folder Structure [CQ]
**Type:** Code Quality  
**Priority:** Critical  
**Estimate:** 3 hours  
**Dependencies:** TASK-007  
**Constitutional Alignment:** Code Quality (SRP), Clean Architecture

**Description:**
Create clean architecture folder structure for backend following SOLID principles.

**Acceptance Criteria:**
- [ ] Folder structure follows clean architecture
- [ ] Clear separation of concerns
- [ ] README.md in each directory
- [ ] Barrel exports (index.ts)
- [ ] No circular dependencies

**Directory Structure:**
```
backend/
├── src/
│   ├── api/                  # API Layer (Controllers)
│   │   ├── controllers/      # Route controllers
│   │   │   ├── MissionController.ts
│   │   │   ├── BadgeController.ts
│   │   │   └── HealthController.ts
│   │   ├── middleware/       # Express middleware
│   │   │   ├── authMiddleware.ts
│   │   │   ├── errorMiddleware.ts
│   │   │   ├── validationMiddleware.ts
│   │   │   └── rateLimitMiddleware.ts
│   │   ├── routes/          # Route definitions
│   │   │   ├── missionRoutes.ts
│   │   │   ├── badgeRoutes.ts
│   │   │   └── index.ts
│   │   └── validators/      # Request validators
│   │       ├── missionValidators.ts
│   │       └── badgeValidators.ts
│   │
│   ├── application/         # Application Layer
│   │   ├── services/        # Business logic services
│   │   │   ├── MissionService.ts
│   │   │   ├── BadgeService.ts
│   │   │   └── WebSocketService.ts
│   │   ├── usecases/       # Use case implementations
│   │   │   ├── GetMissionsUseCase.ts
│   │   │   ├── OptInMissionUseCase.ts
│   │   │   └── ClaimRewardUseCase.ts
│   │   └── dtos/           # Data Transfer Objects
│   │       ├── MissionDTO.ts
│   │       └── BadgeDTO.ts
│   │
│   ├── infrastructure/      # Infrastructure Layer
│   │   ├── smartico/       # Smartico API client wrapper
│   │   │   ├── SmarticoClient.ts
│   │   │   └── SmarticoConfig.ts
│   │   ├── cache/          # Caching implementation
│   │   │   ├── CacheService.ts
│   │   │   └── RedisCacheAdapter.ts (optional)
│   │   └── websocket/      # WebSocket server
│   │       └── WebSocketServer.ts
│   │
│   ├── domain/             # Domain Layer
│   │   ├── entities/       # Domain entities
│   │   ├── interfaces/     # Domain interfaces
│   │   └── types/          # Domain types (re-export @smartico/public-api)
│   │
│   ├── shared/             # Shared utilities
│   │   ├── config/         # Configuration
│   │   │   └── config.ts
│   │   ├── errors/         # Custom error classes
│   │   │   ├── ApiError.ts
│   │   │   ├── ValidationError.ts
│   │   │   └── UnauthorizedError.ts
│   │   ├── utils/          # Utility functions
│   │   │   ├── logger.ts
│   │   │   └── asyncHandler.ts
│   │   └── constants/      # Constants
│   │       └── httpStatus.ts
│   │
│   ├── app.ts              # Express app configuration
│   └── server.ts           # Server entry point
│
├── tests/                  # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── package.json
└── README.md
```

---

### TASK-009: Configure Express App & Middleware [SC]
**Type:** Security & Code Quality  
**Priority:** Critical  
**Estimate:** 5 hours  
**Dependencies:** TASK-008  
**Constitutional Alignment:** Security, Code Quality

**Description:**
Configure Express application with security middleware, CORS, rate limiting, and error handling.

**Acceptance Criteria:**
- [ ] Express app configured with TypeScript
- [ ] Helmet.js for security headers
- [ ] CORS configured properly
- [ ] Body parser for JSON
- [ ] Compression middleware
- [ ] Rate limiting per route
- [ ] Request logging (Morgan)
- [ ] Global error handler
- [ ] 404 handler
- [ ] Health check endpoint

**Files to Create:**
- `src/app.ts`
- `src/server.ts`
- `src/api/middleware/errorMiddleware.ts`
- `src/api/middleware/rateLimitMiddleware.ts`

**Implementation (`src/app.ts`):**
```typescript
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { errorMiddleware } from './api/middleware/errorMiddleware';
import { rateLimitMiddleware } from './api/middleware/rateLimitMiddleware';
import routes from './api/routes';

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }));

  // Request parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Compression
  app.use(compression());

  // Logging
  app.use(morgan('combined'));

  // Rate limiting
  app.use(rateLimitMiddleware);

  // Routes
  app.use('/api', routes);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handling (must be last)
  app.use(errorMiddleware);

  return app;
};
```

**Dependencies to install:**
```bash
npm install helmet cors compression morgan express-rate-limit
npm install -D @types/cors @types/compression @types/morgan
```

---

### TASK-010: Implement Authentication Middleware [SC]
**Type:** Security  
**Priority:** Critical  
**Estimate:** 6 hours  
**Dependencies:** TASK-009  
**Constitutional Alignment:** Security, Code Quality (SRP)

**Description:**
Implement authentication middleware to validate user sessions and extract user information.

**Acceptance Criteria:**
- [ ] JWT validation (if using JWT)
- [ ] Session validation (if using sessions)
- [ ] User ID extraction from token/session
- [ ] Attach user to request object
- [ ] Handle expired tokens gracefully
- [ ] 401 response for unauthorized requests
- [ ] TypeScript types for authenticated requests
- [ ] No password/sensitive data in logs

**Files to Create:**
- `src/api/middleware/authMiddleware.ts`
- `src/shared/types/AuthenticatedRequest.ts`

**Implementation:**
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    extUserId: string;
    brandKey: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    req.user = {
      id: decoded.id,
      extUserId: decoded.extUserId,
      brandKey: decoded.brandKey,
    };

    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};
```

---

### TASK-011: Create Smartico API Client Wrapper [CQ]
**Type:** Code Quality  
**Priority:** Critical  
**Estimate:** 8 hours  
**Dependencies:** TASK-008  
**Constitutional Alignment:** Code Quality (DIP, SRP), Type Safety

**Description:**
Create a wrapper service for @smartico/public-api with dependency injection and error handling.

**Acceptance Criteria:**
- [ ] Service follows Single Responsibility Principle
- [ ] Dependency injection for configuration
- [ ] All methods have explicit return types
- [ ] Error handling with typed errors
- [ ] JSDoc documentation
- [ ] Retry logic for failed requests
- [ ] Request/response logging
- [ ] No `any` types

**Files to Create:**
- `src/infrastructure/smartico/SmarticoClient.ts`
- `src/infrastructure/smartico/ISmarticoClient.ts`
- `src/infrastructure/smartico/SmarticoConfig.ts`

**Implementation:**
```typescript
import { SmarticoAPI, WSAPI, TMissionOrBadge } from '@smartico/public-api';
import { Logger } from '../../shared/utils/logger';
import { ApiError } from '../../shared/errors/ApiError';

export interface ISmarticoClient {
  getMissions(extUserId: string): Promise<TMissionOrBadge[]>;
  getBadges(extUserId: string): Promise<TMissionOrBadge[]>;
  optInToMission(extUserId: string, missionId: number): Promise<TMissionOptInResult>;
  claimReward(extUserId: string, missionId: number): Promise<TMissionClaimRewardResult>;
}

/**
 * Wrapper service for Smartico API.
 * Provides type-safe access to missions and badges functionality.
 */
export class SmarticoClient implements ISmarticoClient {
  private wsApi: WSAPI;

  constructor(
    private readonly config: SmarticoConfig,
    private readonly logger: Logger
  ) {
    this.wsApi = new WSAPI({
      apiKey: config.apiKey,
      brandKey: config.brandKey,
      environment: config.environment,
    });
  }

  /**
   * Fetches all missions for a user.
   * @param extUserId - External user ID
   * @returns Promise resolving to array of missions
   * @throws {ApiError} If API call fails
   */
  async getMissions(extUserId: string): Promise<TMissionOrBadge[]> {
    try {
      this.logger.info('Fetching missions', { extUserId });
      
      const missions = await this.wsApi.getMissions();
      
      this.logger.info('Missions fetched successfully', { 
        extUserId, 
        count: missions.length 
      });
      
      return missions;
    } catch (error) {
      this.logger.error('Failed to fetch missions', error, { extUserId });
      throw new ApiError('Failed to fetch missions from Smartico API');
    }
  }

  // ... similar implementations for getBadges, optInToMission, claimReward
}
```

---

### TASK-012: Implement Mission Controller [CQ]
**Type:** Code Quality  
**Priority:** Critical  
**Estimate:** 6 hours  
**Dependencies:** TASK-010, TASK-011  
**Constitutional Alignment:** Code Quality (SRP), Type Safety

**Description:**
Implement REST controller for mission endpoints with request validation.

**Acceptance Criteria:**
- [ ] GET /api/missions - List all missions
- [ ] GET /api/missions/:id - Get mission by ID
- [ ] POST /api/missions/:id/opt-in - Opt into mission
- [ ] POST /api/missions/:id/claim - Claim mission reward
- [ ] Request validation with express-validator
- [ ] Proper HTTP status codes
- [ ] Error handling
- [ ] TypeScript types
- [ ] JSDoc documentation

**Files to Create:**
- `src/api/controllers/MissionController.ts`
- `src/api/routes/missionRoutes.ts`
- `src/api/validators/missionValidators.ts`

**Implementation (`MissionController.ts`):**
```typescript
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { MissionService } from '../../application/services/MissionService';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  /**
   * GET /api/missions
   * Fetches all missions for authenticated user
   */
  getMissions = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const missions = await this.missionService.getMissions(req.user!.extUserId);
      
      res.status(200).json({
        success: true,
        data: missions,
        count: missions.length,
      });
    }
  );

  /**
   * POST /api/missions/:id/opt-in
   * Opts user into a mission
   */
  optInToMission = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const missionId = parseInt(req.params.id, 10);
      
      const result = await this.missionService.optIn(
        req.user!.extUserId,
        missionId
      );
      
      res.status(200).json({
        success: true,
        data: result,
      });
    }
  );

  /**
   * POST /api/missions/:id/claim
   * Claims reward for completed mission
   */
  claimReward = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const missionId = parseInt(req.params.id, 10);
      
      const result = await this.missionService.claimReward(
        req.user!.extUserId,
        missionId
      );
      
      res.status(200).json({
        success: true,
        data: result,
      });
    }
  );
}
```

**Routes (`missionRoutes.ts`):**
```typescript
import { Router } from 'express';
import { MissionController } from '../controllers/MissionController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateMissionId, validateOptIn } from '../validators/missionValidators';

const router = Router();
const missionController = new MissionController(/* inject dependencies */);

router.get('/', authMiddleware, missionController.getMissions);
router.post('/:id/opt-in', authMiddleware, validateMissionId, missionController.optInToMission);
router.post('/:id/claim', authMiddleware, validateMissionId, missionController.claimReward);

export default router;
```

---

### TASK-013: Implement Badge Controller [CQ]
**Type:** Code Quality  
**Priority:** High  
**Estimate:** 4 hours  
**Dependencies:** TASK-012  
**Constitutional Alignment:** Code Quality (SRP)

**Description:**
Implement REST controller for badge endpoints.

**Acceptance Criteria:**
- [ ] GET /api/badges - List all badges
- [ ] GET /api/badges/:id - Get badge by ID
- [ ] Request validation
- [ ] Error handling
- [ ] TypeScript types

**Files to Create:**
- `src/api/controllers/BadgeController.ts`
- `src/api/routes/badgeRoutes.ts`
- `src/api/validators/badgeValidators.ts`

---

### TASK-014: Implement Caching Layer [PF]
**Type:** Performance  
**Priority:** High  
**Estimate:** 6 hours  
**Dependencies:** TASK-011  
**Constitutional Alignment:** Performance, Code Quality (Strategy Pattern)

**Description:**
Implement server-side caching with configurable TTL to reduce API calls to Smartico backend.

**Acceptance Criteria:**
- [ ] In-memory cache (node-cache)
- [ ] Optional Redis support (Strategy pattern)
- [ ] Configurable TTL per endpoint
- [ ] Cache invalidation on mutations (opt-in, claim)
- [ ] Cache hit/miss logging
- [ ] TypeScript types

**Files to Create:**
- `src/infrastructure/cache/CacheService.ts`
- `src/infrastructure/cache/ICacheService.ts`
- `src/infrastructure/cache/MemoryCacheAdapter.ts`
- `src/infrastructure/cache/RedisCacheAdapter.ts` (optional)

**Implementation:**
```typescript
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class CacheService implements ICacheService {
  constructor(
    private readonly adapter: ICacheAdapter,
    private readonly logger: Logger
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.adapter.get<T>(key);
      
      if (value) {
        this.logger.debug('Cache hit', { key });
      } else {
        this.logger.debug('Cache miss', { key });
      }
      
      return value;
    } catch (error) {
      this.logger.error('Cache get error', error, { key });
      return null;
    }
  }
  
  // ... other methods
}
```

**Dependencies:**
```bash
npm install node-cache
npm install redis # optional
```

---

### TASK-015: Implement WebSocket Server [CQ]
**Type:** Code Quality  
**Priority:** High  
**Estimate:** 8 hours  
**Dependencies:** TASK-009, TASK-011  
**Constitutional Alignment:** Code Quality, Performance

**Description:**
Implement WebSocket server for real-time mission progress updates.

**Acceptance Criteria:**
- [ ] WebSocket server using `ws` library
- [ ] Authentication on connection
- [ ] Subscribe to Smartico WebSocket events
- [ ] Broadcast updates to connected clients
- [ ] Handle connection/disconnection
- [ ] Heartbeat mechanism
- [ ] Error handling
- [ ] TypeScript types

**Files to Create:**
- `src/infrastructure/websocket/WebSocketServer.ts`
- `src/infrastructure/websocket/IWebSocketServer.ts`

**Implementation:**
```typescript
import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { Server } from 'http';
import { WSAPI } from '@smartico/public-api';

export class WebSocketServer {
  private wss: WSServer;
  private clients: Map<string, WebSocket> = new Map();

  constructor(
    private readonly server: Server,
    private readonly wsApi: WSAPI,
    private readonly logger: Logger
  ) {
    this.wss = new WSServer({ server });
    this.initialize();
  }

  private initialize(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      this.handleConnection(ws, req);
    });

    // Subscribe to Smartico events
    this.wsApi.on('missionsUpdate', (missions) => {
      this.broadcast('missions:update', missions);
    });
  }

  private handleConnection(ws: WebSocket, req: any): void {
    const userId = this.extractUserId(req); // From auth token
    
    if (!userId) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    this.clients.set(userId, ws);
    this.logger.info('WebSocket client connected', { userId });

    ws.on('close', () => {
      this.clients.delete(userId);
      this.logger.info('WebSocket client disconnected', { userId });
    });

    ws.on('error', (error) => {
      this.logger.error('WebSocket error', error, { userId });
    });
  }

  private broadcast(event: string, data: any): void {
    const message = JSON.stringify({ event, data });
    
    this.clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
```

**Dependencies:**
```bash
npm install ws
npm install -D @types/ws
```

---

### TASK-016: Backend Unit Tests [TS]
**Type:** Testing  
**Priority:** Critical  
**Estimate:** 8 hours  
**Dependencies:** TASK-012, TASK-013, TASK-014  
**Constitutional Alignment:** Testing Excellence (AAA, Single Assert)

**Description:**
Write unit tests for backend services, controllers, and middleware following AAA pattern.

**Acceptance Criteria:**
- [ ] AAA pattern strictly followed
- [ ] Single assertion per test
- [ ] All services covered
- [ ] All controllers covered
- [ ] All middleware covered
- [ ] Mock external dependencies
- [ ] Coverage > 90%

**Files to Create:**
- `tests/unit/services/MissionService.test.ts`
- `tests/unit/services/BadgeService.test.ts`
- `tests/unit/controllers/MissionController.test.ts`
- `tests/unit/controllers/BadgeController.test.ts`
- `tests/unit/middleware/authMiddleware.test.ts`

**Example:**
```typescript
describe('MissionService', () => {
  describe('getMissions', () => {
    it('should_return_missions_array_when_smartico_api_succeeds', async () => {
      // Arrange
      const mockSmarticoClient = createMockSmarticoClient();
      const expectedMissions = [createMockMission()];
      mockSmarticoClient.getMissions.mockResolvedValue(expectedMissions);
      const service = new MissionService(mockSmarticoClient, mockCache, mockLogger);

      // Act
      const result = await service.getMissions('user123');

      // Assert
      expect(result).toEqual(expectedMissions);
    });

    it('should_call_smartico_client_once_when_invoked', async () => {
      // Arrange
      const mockSmarticoClient = createMockSmarticoClient();
      const service = new MissionService(mockSmarticoClient, mockCache, mockLogger);

      // Act
      await service.getMissions('user123');

      // Assert
      expect(mockSmarticoClient.getMissions).toHaveBeenCalledTimes(1);
    });
  });
});
```

---

### TASK-017: Backend Integration Tests [TS]
**Type:** Testing  
**Priority:** High  
**Estimate:** 6 hours  
**Dependencies:** TASK-016  
**Constitutional Alignment:** Testing Excellence

**Description:**
Write integration tests for API endpoints using supertest.

**Acceptance Criteria:**
- [ ] All endpoints tested
- [ ] Authentication tested
- [ ] Error scenarios tested
- [ ] Response validation
- [ ] AAA pattern followed

**Files to Create:**
- `tests/integration/missions.test.ts`
- `tests/integration/badges.test.ts`
- `tests/integration/auth.test.ts`

**Example:**
```typescript
describe('Mission API', () => {
  describe('GET /api/missions', () => {
    it('should_return_200_and_missions_array_when_authenticated', async () => {
      // Arrange
      const authToken = await getAuthToken();

      // Act
      const response = await request(app)
        .get('/api/missions')
        .set('Authorization', `Bearer ${authToken}`);

      // Assert
      expect(response.status).toBe(200);
    });

    it('should_return_missions_with_correct_structure', async () => {
      // Arrange
      const authToken = await getAuthToken();

      // Act
      const response = await request(app)
        .get('/api/missions')
        .set('Authorization', `Bearer ${authToken}`);

      // Assert
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });
});
```

**Dependencies:**
```bash
npm install -D supertest @types/supertest
```

---

### TASK-018: Backend Documentation [TY]
**Type:** Type Safety & Documentation  
**Priority:** Medium  
**Estimate:** 4 hours  
**Dependencies:** TASK-017  
**Constitutional Alignment:** Documentation

**Description:**
Write comprehensive backend documentation including API reference and setup guide.

**Acceptance Criteria:**
- [ ] README.md with setup instructions
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Environment variables documented
- [ ] Architecture documentation
- [ ] Deployment guide

**Files to Create:**
- `backend/README.md`
- `backend/docs/API.md`
- `backend/docs/ARCHITECTURE.md`
- `backend/swagger.yaml` (optional)

---

## Phase 2: Redux State Management (30 hours)

### TASK-019: Create Missions Redux Slice [CQ]
**Type:** Code Quality  
**Priority:** Critical  
**Estimate:** 8 hours  
**Dependencies:** TASK-003, TASK-004  
**Constitutional Alignment:** Code Quality (SRP), Type Safety

**Description:**
Implement missions Redux slice with normalized state, actions, and reducers.

**Acceptance Criteria:**
- [ ] Normalized state structure (byId, allIds)
- [ ] Separate arrays for each status (active, available, completed, expired)
- [ ] Loading, error, lastFetched state
- [ ] Filter state (search, categories, sort)
- [ ] Async thunks for API calls
- [ ] Immutable state updates
- [ ] Full TypeScript types
- [ ] JSDoc documentation

**Files to Create:**
- `src/application/slices/missionsSlice.ts`
- `src/application/slices/missionsSlice.types.ts`

**State Shape:**
```typescript
interface MissionsState {
  byId: Record<number, TMissionOrBadge>;
  allIds: number[];
  active: number[];
  available: number[];
  completed: number[];
  expired: number[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  filters: MissionFilters;
}
```

---

### TASK-008: Create Mission Selectors with Memoization [PF]
**Type:** Performance  
**Priority:** High  
**Estimate:** 5 hours  
**Dependencies:** TASK-007  
**Constitutional Alignment:** Performance, Code Quality

**Description:**
Implement memoized selectors using Reselect for efficient derived state computation.

**Acceptance Criteria:**
- [ ] Base selectors (no computation)
- [ ] Memoized computed selectors
- [ ] Filter/search selectors
- [ ] Sort selectors
- [ ] No recomputation unless dependencies change
- [ ] Full TypeScript types
- [ ] JSDoc comments

**Files to Create:**
- `src/application/selectors/missionSelectors.ts`

**Implementation:**
```typescript
export const selectFilteredMissions = createSelector(
  [selectAllMissions, selectFilters],
  (missions, filters) => {
    // Only recomputes when missions or filters change
    return applyFilters(missions, filters);
  }
);
```

---

### TASK-009: Create Badges Redux Slice [CQ]
**Type:** Code Quality  
**Priority:** High  
**Estimate:** 6 hours  
**Dependencies:** TASK-007  
**Constitutional Alignment:** Code Quality (SRP), Type Safety

**Description:**
Implement badges Redux slice similar to missions slice.

**Acceptance Criteria:**
- [ ] Normalized state structure
- [ ] Loading, error states
- [ ] Filter state
- [ ] Async thunks
- [ ] Immutable updates
- [ ] Full types
- [ ] Documentation

**Files to Create:**
- `src/application/slices/badgesSlice.ts`

---

### TASK-010: Create Badge Selectors [PF]
**Type:** Performance  
**Priority:** High  
**Estimate:** 3 hours  
**Dependencies:** TASK-009  
**Constitutional Alignment:** Performance

**Description:**
Implement memoized selectors for badges with filtering.

**Files to Create:**
- `src/application/selectors/badgeSelectors.ts`

---

### TASK-011: Create Connection State Slice [CQ]
**Type:** Code Quality  
**Priority:** High  
**Estimate:** 4 hours  
**Dependencies:** TASK-003  
**Constitutional Alignment:** Code Quality, Type Safety

**Description:**
Implement Redux slice for tracking WebSocket/polling connection state.

**Acceptance Criteria:**
- [ ] Connection type tracked (websocket, polling, disconnected)
- [ ] Connection status (connected, disconnected)
- [ ] Last heartbeat timestamp
- [ ] Actions for connection events
- [ ] Full types

**Files to Create:**
- `src/application/slices/connectionSlice.ts`

---

### TASK-012: Create UI State Slice [CQ]
**Type:** Code Quality  
**Priority:** Medium  
**Estimate:** 4 hours  
**Dependencies:** TASK-003  
**Constitutional Alignment:** Code Quality

**Description:**
Implement Redux slice for UI-specific state (modals, toasts, loading overlays).

**Acceptance Criteria:**
- [ ] Modal state (open/closed, content)
- [ ] Toast/notification state
- [ ] Loading overlay state
- [ ] Actions for UI events
- [ ] Full types

**Files to Create:**
- `src/application/slices/uiSlice.ts`

---

## Phase 3: Infrastructure Layer (28 hours)

### TASK-013: Implement WebSocket Manager [CQ]
**Type:** Code Quality  
**Priority:** Critical  
**Estimate:** 10 hours  
**Dependencies:** TASK-004, TASK-011  
**Constitutional Alignment:** Code Quality (Strategy Pattern), Performance

**Description:**
Implement WebSocket manager with automatic fallback to polling using Strategy pattern.

**Acceptance Criteria:**
- [ ] Strategy pattern for connection types
- [ ] WebSocket strategy implementation
- [ ] Polling strategy implementation (15s interval)
- [ ] Automatic fallback on WebSocket failure
- [ ] Event subscription/unsubscription
- [ ] Reconnection logic with exponential backoff
- [ ] Heartbeat mechanism
- [ ] Full error handling
- [ ] TypeScript types
- [ ] JSDoc documentation

**Files to Create:**
- `src/infrastructure/websocket/WebSocketManager.ts`
- `src/infrastructure/websocket/IConnectionStrategy.ts`
- `src/infrastructure/websocket/WebSocketStrategy.ts`
- `src/infrastructure/websocket/PollingStrategy.ts`

---

### TASK-014: Create Cache Service [PF]
**Type:** Performance  
**Priority:** High  
**Estimate:** 8 hours  
**Dependencies:** TASK-002  
**Constitutional Alignment:** Performance, Code Quality (SRP)

**Description:**
Implement caching service with LocalStorage persistence and TTL management.

**Acceptance Criteria:**
- [ ] In-memory cache (Map-based)
- [ ] LocalStorage persistence
- [ ] TTL management (24 hours for LocalStorage)
- [ ] Cache invalidation methods
- [ ] Stale data handling
- [ ] Size limit enforcement
- [ ] Error handling (quota exceeded)
- [ ] TypeScript types
- [ ] JSDoc documentation

**Files to Create:**
- `src/infrastructure/storage/CacheService.ts`
- `src/infrastructure/storage/ICacheService.ts`

**Implementation:**
```typescript
export class CacheService implements ICacheService {
  private memoryCache: Map<string, CacheEntry> = new Map();
  
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memEntry = this.memoryCache.get(key);
    if (memEntry && !this.isExpired(memEntry)) {
      return memEntry.data as T;
    }
    
    // Check LocalStorage
    const lsEntry = this.getFromLocalStorage(key);
    if (lsEntry && !this.isExpired(lsEntry)) {
      return lsEntry.data as T;
    }
    
    return null;
  }
  
  async set<T>(key: string, data: T, ttl: number): Promise<void> {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    
    this.memoryCache.set(key, entry);
    this.setToLocalStorage(key, entry);
  }
}
```

---

### TASK-015: Create Error Handler Service [SC]
**Type:** Security & Quality  
**Priority:** High  
**Estimate:** 6 hours  
**Dependencies:** TASK-002  
**Constitutional Alignment:** Code Quality, Security, UX

**Description:**
Implement centralized error handling service with retry logic and user-friendly messages.

**Acceptance Criteria:**
- [ ] Typed error classes (ApiError, NetworkError, ValidationError)
- [ ] Automatic retry logic (1 retry with delay)
- [ ] Error message sanitization (no technical details to users)
- [ ] Error logging to console (development) and service (production)
- [ ] User-friendly error messages
- [ ] TypeScript types
- [ ] JSDoc documentation

**Files to Create:**
- `src/infrastructure/error/ErrorHandler.ts`
- `src/infrastructure/error/ErrorTypes.ts`
- `src/infrastructure/error/errorMessages.ts`

---

### TASK-016: Create Logger Service [DV]
**Type:** DevOps  
**Priority:** Medium  
**Estimate:** 4 hours  
**Dependencies:** TASK-002  
**Constitutional Alignment:** Monitoring & Observability

**Description:**
Implement logging service for debugging and monitoring.

**Acceptance Criteria:**
- [ ] Log levels (debug, info, warn, error)
- [ ] Contextual logging (include relevant data)
- [ ] Environment-aware (verbose in dev, minimal in prod)
- [ ] Integration with error tracking service
- [ ] Performance logging support
- [ ] TypeScript types

**Files to Create:**
- `src/shared/utils/Logger.ts`
- `src/shared/utils/ILogger.ts`

---

## Phase 4: UI Components - Presentational (38 hours)

### TASK-017: Create Design System Base Components [UX]
**Type:** User Experience  
**Priority:** Critical  
**Estimate:** 8 hours  
**Dependencies:** TASK-006  
**Constitutional Alignment:** UX Consistency, Code Quality (SRP)

**Description:**
Implement reusable base components (Button, Card, Badge, Input, etc.) with accessibility.

**Acceptance Criteria:**
- [ ] Button component (variants, sizes, loading state)
- [ ] Card component
- [ ] Input component with validation
- [ ] Badge component
- [ ] Modal component
- [ ] Toast/notification component
- [ ] Spinner/loader component
- [ ] All components accessibility compliant (ARIA, keyboard nav)
- [ ] Minimum touch target: 44x44px
- [ ] Color contrast: WCAG AA
- [ ] Styled with design tokens
- [ ] TypeScript types
- [ ] Storybook stories for each component

**Files to Create:**
- `src/presentation/components/Button/Button.tsx`
- `src/presentation/components/Card/Card.tsx`
- `src/presentation/components/Input/Input.tsx`
- `src/presentation/components/Badge/Badge.tsx`
- `src/presentation/components/Modal/Modal.tsx`
- `src/presentation/components/Toast/Toast.tsx`
- `src/presentation/components/Spinner/Spinner.tsx`

---

### TASK-018: Create Tab Component [UX]
**Type:** User Experience  
**Priority:** High  
**Estimate:** 5 hours  
**Dependencies:** TASK-017  
**Constitutional Alignment:** UX Consistency, Accessibility

**Description:**
Implement accessible tab component for mission status navigation.

**Acceptance Criteria:**
- [ ] Tabs with badge counts
- [ ] Keyboard navigation (arrow keys)
- [ ] ARIA roles (tablist, tab, tabpanel)
- [ ] Active state styling
- [ ] Mobile-responsive (scrollable on small screens)
- [ ] Touch-optimized (swipe gestures)
- [ ] TypeScript types

**Files to Create:**
- `src/presentation/components/Tabs/Tabs.tsx`
- `src/presentation/components/Tabs/Tab.tsx`
- `src/presentation/components/Tabs/TabPanel.tsx`

---

### TASK-019: Create Progress Bar Component [UX]
**Type:** User Experience  
**Priority:** High  
**Estimate:** 4 hours  
**Dependencies:** TASK-017  
**Constitutional Alignment:** UX Consistency, Performance

**Description:**
Implement animated progress bar with percentage display.

**Acceptance Criteria:**
- [ ] Smooth animation (CSS transitions)
- [ ] Percentage display
- [ ] Color variants (success, warning, danger)
- [ ] Accessibility (ARIA role="progressbar")
- [ ] Mobile-optimized
- [ ] TypeScript types

**Files to Create:**
- `src/presentation/components/ProgressBar/ProgressBar.tsx`

---

### TASK-020: Create Mission Card Component [UX]
**Type:** User Experience  
**Priority:** Critical  
**Estimate:** 8 hours  
**Dependencies:** TASK-017, TASK-019  
**Constitutional Alignment:** UX Consistency, Code Quality (SRP)

**Description:**
Implement presentational mission card component.

**Acceptance Criteria:**
- [ ] Mission image with lazy loading
- [ ] Mission name, description
- [ ] Progress bar with percentage
- [ ] Task list with completion indicators
- [ ] Reward display
- [ ] Action buttons (opt-in, claim)
- [ ] Time remaining countdown (for time-limited missions)
- [ ] Recurring mission indicator
- [ ] Responsive layout (mobile/desktop)
- [ ] Accessibility compliant
- [ ] TypeScript types
- [ ] No business logic (pure presentation)

**Files to Create:**
- `src/presentation/components/MissionCard/MissionCard.tsx`
- `src/presentation/components/MissionCard/MissionCard.styles.ts`
- `src/presentation/components/MissionCard/MissionCard.stories.tsx`

---

### TASK-021: Create Badge Card Component [UX]
**Type:** User Experience  
**Priority:** High  
**Estimate:** 5 hours  
**Dependencies:** TASK-017  
**Constitutional Alignment:** UX Consistency

**Description:**
Implement presentational badge card for grid gallery.

**Acceptance Criteria:**
- [ ] Badge image (color if earned, greyscale if locked)
- [ ] Badge name
- [ ] Earned indicator
- [ ] Hover effects
- [ ] Click handler for details modal
- [ ] Responsive sizing
- [ ] Accessibility (alt text, keyboard focus)
- [ ] TypeScript types

**Files to Create:**
- `src/presentation/components/BadgeCard/BadgeCard.tsx`

---

### TASK-022: Create Mission Detail Modal [UX]
**Type:** User Experience  
**Priority:** High  
**Estimate:** 6 hours  
**Dependencies:** TASK-017, TASK-020  
**Constitutional Alignment:** UX Consistency, Accessibility

**Description:**
Implement modal for detailed mission view.

**Acceptance Criteria:**
- [ ] Full mission information display
- [ ] All tasks with progress indicators
- [ ] Reward details
- [ ] Related games list
- [ ] Action buttons
- [ ] Close button (X) and backdrop click
- [ ] Keyboard navigation (ESC to close, focus trap)
- [ ] ARIA modal attributes
- [ ] Mobile-responsive
- [ ] TypeScript types

**Files to Create:**
- `src/presentation/components/MissionDetailModal/MissionDetailModal.tsx`

---

### TASK-023: Create Badge Detail Modal [UX]
**Type:** User Experience  
**Priority:** Medium  
**Estimate:** 4 hours  
**Dependencies:** TASK-017, TASK-021  
**Constitutional Alignment:** UX Consistency

**Description:**
Implement modal for badge details.

**Acceptance Criteria:**
- [ ] Large badge image
- [ ] Badge name and description
- [ ] Completion criteria
- [ ] Progress indicator (if in progress)
- [ ] Earn date (if earned)
- [ ] Close functionality
- [ ] Keyboard navigation
- [ ] TypeScript types

**Files to Create:**
- `src/presentation/components/BadgeDetailModal/BadgeDetailModal.tsx`

---

### TASK-024: Create Filter Controls Component [UX]
**Type:** User Experience  
**Priority:** Medium  
**Estimate:** 5 hours  
**Dependencies:** TASK-017  
**Constitutional Alignment:** UX Consistency

**Description:**
Implement filter and sort controls for missions.

**Acceptance Criteria:**
- [ ] Search input with debounce
- [ ] Category filter (multi-select)
- [ ] Sort dropdown (name, progress, reward, expiry)
- [ ] Clear filters button
- [ ] Mobile-responsive (collapsible on small screens)
- [ ] Accessibility compliant
- [ ] TypeScript types

**Files to Create:**
- `src/presentation/components/FilterControls/FilterControls.tsx`
- `src/presentation/components/FilterControls/SearchBar.tsx`
- `src/presentation/components/FilterControls/CategoryFilter.tsx`
- `src/presentation/components/FilterControls/SortControl.tsx`

---

### TASK-025: Create Empty State Component [UX]
**Type:** User Experience  
**Priority:** Low  
**Estimate:** 3 hours  
**Dependencies:** TASK-017  
**Constitutional Alignment:** UX Consistency

**Description:**
Implement empty state component for no missions/badges scenarios.

**Acceptance Criteria:**
- [ ] Illustration or icon
- [ ] Message text
- [ ] Optional CTA button
- [ ] Different variants (no active missions, no completed missions, etc.)
- [ ] Mobile-responsive
- [ ] TypeScript types

**Files to Create:**
- `src/presentation/components/EmptyState/EmptyState.tsx`

---

## Phase 5: UI Components - Containers (Smart) (26 hours)

### TASK-026: Create Mission List Container [CQ]
**Type:** Code Quality  
**Priority:** Critical  
**Estimate:** 10 hours  
**Dependencies:** TASK-020, TASK-007, TASK-008  
**Constitutional Alignment:** Code Quality (SRP), Performance

**Description:**
Implement container component connecting MissionCard to Redux store.

**Acceptance Criteria:**
- [ ] Connected to Redux store via hooks
- [ ] Fetches missions on mount
- [ ] Handles loading state
- [ ] Handles error state with retry
- [ ] Implements virtualization for large lists (react-window)
- [ ] Dispatches opt-in/claim actions
- [ ] No presentation logic (delegates to MissionCard)
- [ ] TypeScript types
- [ ] Performance optimized (useCallback, useMemo)

**Files to Create:**
- `src/presentation/containers/MissionListContainer/MissionListContainer.tsx`

**Implementation:**
```typescript
export const MissionListContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const missions = useAppSelector(selectFilteredActiveMissions);
  const loading = useAppSelector(selectMissionsLoading);
  const error = useAppSelector(selectMissionsError);

  useEffect(() => {
    dispatch(fetchMissions());
  }, [dispatch]);

  const handleOptIn = useCallback((missionId: number) => {
    dispatch(optInToMission(missionId));
  }, [dispatch]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={() => dispatch(fetchMissions())} />;
  if (missions.length === 0) return <EmptyState variant="no-active-missions" />;

  return (
    <FixedSizeList
      height={800}
      itemCount={missions.length}
      itemSize={200}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <MissionCard
            mission={missions[index]}
            onOptIn={handleOptIn}
            onClaim={handleClaim}
          />
        </div>
      )}
    </FixedSizeList>
  );
};
```

---

### TASK-027: Create Badge Grid Container [CQ]
**Type:** Code Quality  
**Priority:** High  
**Estimate:** 8 hours  
**Dependencies:** TASK-021, TASK-009, TASK-010  
**Constitutional Alignment:** Code Quality (SRP), Performance

**Description:**
Implement container component connecting BadgeCard to Redux store.

**Acceptance Criteria:**
- [ ] Connected to Redux store
- [ ] Fetches badges on mount
- [ ] Handles loading/error states
- [ ] Applies filters
- [ ] Responsive grid layout
- [ ] Opens badge detail modal on click
- [ ] TypeScript types
- [ ] Performance optimized

**Files to Create:**
- `src/presentation/containers/BadgeGridContainer/BadgeGridContainer.tsx`

---

### TASK-028: Create Mission Tabs Container [CQ]
**Type:** Code Quality  
**Priority:** High  
**Estimate:** 6 hours  
**Dependencies:** TASK-018, TASK-026  
**Constitutional Alignment:** Code Quality, UX

**Description:**
Implement container managing tab state and mission list rendering.

**Acceptance Criteria:**
- [ ] Tab state management (active tab)
- [ ] Tab counts from Redux selectors
- [ ] Renders MissionListContainer for each tab
- [ ] URL sync (tab selection in URL)
- [ ] TypeScript types

**Files to Create:**
- `src/presentation/containers/MissionTabsContainer/MissionTabsContainer.tsx`

---

### TASK-029: Create Connection Status Indicator [UX]
**Type:** User Experience  
**Priority:** Medium  
**Estimate:** 2 hours  
**Dependencies:** TASK-011  
**Constitutional Alignment:** UX, Code Quality

**Description:**
Implement component showing WebSocket/polling connection status.

**Acceptance Criteria:**
- [ ] Connected to connection Redux state
- [ ] Shows "Real-time" for WebSocket
- [ ] Shows "Updates every 15s" for polling
- [ ] Shows "Offline" for disconnected
- [ ] Subtle UI (corner indicator)
- [ ] TypeScript types

**Files to Create:**
- `src/presentation/containers/ConnectionStatusIndicator/ConnectionStatusIndicator.tsx`

---

## Phase 6: Pages & Routing (12 hours)

### TASK-030: Create Missions Page [UX]
**Type:** User Experience  
**Priority:** Critical  
**Estimate:** 6 hours  
**Dependencies:** TASK-028, TASK-024  
**Constitutional Alignment:** UX Consistency

**Description:**
Implement main missions page with tabs and filters.

**Acceptance Criteria:**
- [ ] Page layout (header, tabs, filters, content)
- [ ] SEO metadata (title, description)
- [ ] Mobile-responsive
- [ ] Loading state
- [ ] Error handling
- [ ] TypeScript types

**Files to Create:**
- `src/presentation/pages/MissionsPage/MissionsPage.tsx`

---

### TASK-031: Create Badges Page [UX]
**Type:** User Experience  
**Priority:** High  
**Estimate:** 4 hours  
**Dependencies:** TASK-027  
**Constitutional Alignment:** UX Consistency

**Description:**
Implement badges page with grid gallery.

**Acceptance Criteria:**
- [ ] Page layout (header, filters, grid)
- [ ] Badge count display
- [ ] SEO metadata
- [ ] Mobile-responsive
- [ ] TypeScript types

**Files to Create:**
- `src/presentation/pages/BadgesPage/BadgesPage.tsx`

---

### TASK-032: Setup React Router [DV]
**Type:** DevOps  
**Priority:** Critical  
**Estimate:** 2 hours  
**Dependencies:** TASK-030, TASK-031  
**Constitutional Alignment:** Code Quality

**Description:**
Configure React Router with lazy loading and code splitting.

**Acceptance Criteria:**
- [ ] React Router v6+ configured
- [ ] Lazy loading for routes
- [ ] Code splitting per route
- [ ] 404 page
- [ ] TypeScript types

**Files to Create:**
- `src/App.tsx`
- `src/routes.tsx`

---

## Phase 7: Testing (40 hours)

### TASK-033: Unit Tests - Services [TS]
**Type:** Testing  
**Priority:** Critical  
**Estimate:** 10 hours  
**Dependencies:** TASK-004, TASK-005  
**Constitutional Alignment:** Testing Excellence (AAA, Single Assert)

**Description:**
Write unit tests for MissionService and BadgeService following AAA pattern.

**Acceptance Criteria:**
- [ ] AAA pattern strictly followed
- [ ] Single assertion per test
- [ ] Test naming: `should_expectedBehavior_when_condition`
- [ ] All public methods covered
- [ ] Error scenarios tested
- [ ] Mock @smartico/public-api WSAPI
- [ ] Coverage > 95%

**Files to Create:**
- `src/domain/services/MissionService.test.ts`
- `src/domain/services/BadgeService.test.ts`

**Example:**
```typescript
describe('MissionService', () => {
  describe('getMissions', () => {
    it('should_return_missions_array_when_api_call_succeeds', async () => {
      // Arrange
      const mockWsApi = createMockWsApi();
      const expectedMissions = [createMockMission()];
      mockWsApi.getMissions.mockResolvedValue(expectedMissions);
      const service = new MissionService(mockWsApi);

      // Act
      const result = await service.getMissions();

      // Assert
      expect(result).toEqual(expectedMissions);
    });

    it('should_call_wsApi_getMissions_once_when_invoked', async () => {
      // Arrange
      const mockWsApi = createMockWsApi();
      const service = new MissionService(mockWsApi);

      // Act
      await service.getMissions();

      // Assert
      expect(mockWsApi.getMissions).toHaveBeenCalledTimes(1);
    });
  });
});
```

---

### TASK-034: Unit Tests - Redux Slices [TS]
**Type:** Testing  
**Priority:** Critical  
**Estimate:** 10 hours  
**Dependencies:** TASK-007, TASK-009  
**Constitutional Alignment:** Testing Excellence

**Description:**
Write unit tests for all Redux slices and async thunks.

**Acceptance Criteria:**
- [ ] AAA pattern followed
- [ ] Single assertion per test
- [ ] All actions tested
- [ ] All reducers tested
- [ ] All thunks tested
- [ ] Coverage > 95%

**Files to Create:**
- `src/application/slices/missionsSlice.test.ts`
- `src/application/slices/badgesSlice.test.ts`
- `src/application/slices/connectionSlice.test.ts`

---

### TASK-035: Unit Tests - Selectors [TS]
**Type:** Testing  
**Priority:** High  
**Estimate:** 6 hours  
**Dependencies:** TASK-008, TASK-010  
**Constitutional Alignment:** Testing Excellence

**Description:**
Write unit tests for all Redux selectors with memoization validation.

**Acceptance Criteria:**
- [ ] AAA pattern followed
- [ ] Single assertion per test
- [ ] Memoization tested (no recompute on same input)
- [ ] Filter logic tested
- [ ] Sort logic tested
- [ ] Coverage > 95%

**Files to Create:**
- `src/application/selectors/missionSelectors.test.ts`
- `src/application/selectors/badgeSelectors.test.ts`

---

### TASK-036: Component Tests - Presentational [TS]
**Type:** Testing  
**Priority:** Critical  
**Estimate:** 10 hours  
**Dependencies:** TASK-020, TASK-021  
**Constitutional Alignment:** Testing Excellence

**Description:**
Write tests for all presentational components using React Testing Library.

**Acceptance Criteria:**
- [ ] AAA pattern followed
- [ ] Single assertion per test
- [ ] Render tests
- [ ] User interaction tests (click, input)
- [ ] Accessibility tests (keyboard nav, ARIA)
- [ ] No Redux mocking (pure components)
- [ ] Coverage > 90%

**Files to Create:**
- `src/presentation/components/MissionCard/MissionCard.test.tsx`
- `src/presentation/components/BadgeCard/BadgeCard.test.tsx`
- `src/presentation/components/Tabs/Tabs.test.tsx`
- (etc. for all components)

**Example:**
```typescript
describe('MissionCard', () => {
  it('should_display_mission_name_when_rendered', () => {
    // Arrange
    const mission = createMockMission({ name: 'Daily Login' });

    // Act
    render(<MissionCard mission={mission} />);

    // Assert
    expect(screen.getByText('Daily Login')).toBeInTheDocument();
  });

  it('should_call_onOptIn_when_opt_in_button_clicked', () => {
    // Arrange
    const mockOnOptIn = jest.fn();
    const mission = createMockMission({ id: 1 });
    render(<MissionCard mission={mission} onOptIn={mockOnOptIn} />);

    // Act
    fireEvent.click(screen.getByRole('button', { name: /opt in/i }));

    // Assert
    expect(mockOnOptIn).toHaveBeenCalledWith(1);
  });
});
```

---

### TASK-037: Integration Tests [TS]
**Type:** Testing  
**Priority:** High  
**Estimate:** 4 hours  
**Dependencies:** TASK-026, TASK-027  
**Constitutional Alignment:** Testing Excellence

**Description:**
Write integration tests for Redux + component integration.

**Acceptance Criteria:**
- [ ] Tests with real Redux store
- [ ] Tests API integration with MSW (Mock Service Worker)
- [ ] User flows tested (fetch, opt-in, claim)
- [ ] AAA pattern followed
- [ ] Coverage for critical paths

**Files to Create:**
- `src/__tests__/integration/missionsFlow.test.tsx`
- `src/__tests__/integration/badgesFlow.test.tsx`

---

## Phase 8: Performance Optimization & Polish (15 hours)

### TASK-038: Implement Image Optimization [PF]
**Type:** Performance  
**Priority:** High  
**Estimate:** 4 hours  
**Dependencies:** TASK-020, TASK-021  
**Constitutional Alignment:** Performance

**Description:**
Optimize image loading with modern formats and lazy loading.

**Acceptance Criteria:**
- [ ] WebP/AVIF support with JPEG fallback
- [ ] Lazy loading for below-fold images
- [ ] Responsive images (srcset)
- [ ] Blur placeholder while loading
- [ ] Optimized dimensions

**Files to Update:**
- `src/presentation/components/MissionCard/MissionImage.tsx`
- `src/presentation/components/BadgeCard/BadgeImage.tsx`

---

### TASK-039: Bundle Size Optimization [PF]
**Type:** Performance  
**Priority:** High  
**Estimate:** 5 hours  
**Dependencies:** TASK-032  
**Constitutional Alignment:** Performance

**Description:**
Analyze and optimize bundle size to meet < 250KB per route target.

**Acceptance Criteria:**
- [ ] Webpack Bundle Analyzer configured
- [ ] Code splitting implemented
- [ ] Tree shaking verified
- [ ] Duplicate dependencies removed
- [ ] Bundle size < 250KB per route (gzipped)
- [ ] Performance budget configured in CI

**Tools:**
- `webpack-bundle-analyzer`
- `source-map-explorer`

---

### TASK-040: Implement Error Boundaries [SC]
**Type:** Security & Quality  
**Priority:** High  
**Estimate:** 3 hours  
**Dependencies:** TASK-030, TASK-031  
**Constitutional Alignment:** UX, Code Quality

**Description:**
Add React Error Boundaries for graceful error handling.

**Acceptance Criteria:**
- [ ] Error boundary component
- [ ] Fallback UI for errors
- [ ] Error logging to service
- [ ] Wrap route components
- [ ] TypeScript types

**Files to Create:**
- `src/presentation/components/ErrorBoundary/ErrorBoundary.tsx`

---

### TASK-041: Accessibility Audit & Fixes [UX]
**Type:** User Experience  
**Priority:** Critical  
**Estimate:** 3 hours  
**Dependencies:** TASK-030, TASK-031  
**Constitutional Alignment:** UX (Accessibility)

**Description:**
Run accessibility audit and fix all WCAG 2.1 Level AA violations.

**Acceptance Criteria:**
- [ ] Lighthouse accessibility score: 100
- [ ] axe DevTools: zero violations
- [ ] Keyboard navigation fully functional
- [ ] Screen reader tested (NVDA/JAWS)
- [ ] Color contrast verified
- [ ] Focus indicators visible

**Tools:**
- Lighthouse
- axe DevTools
- Screen reader (NVDA/JAWS)

---

## Phase 9: Deployment & Documentation (15 hours)

### TASK-042: Write Developer Documentation [TY]
**Type:** Type Safety & Documentation  
**Priority:** High  
**Estimate:** 6 hours  
**Dependencies:** All previous tasks  
**Constitutional Alignment:** Documentation

**Description:**
Create comprehensive developer documentation.

**Acceptance Criteria:**
- [ ] README.md with setup instructions
- [ ] Architecture documentation
- [ ] Component documentation (with examples)
- [ ] State management guide
- [ ] Testing guide
- [ ] Deployment guide
- [ ] Contributing guide

**Files to Create:**
- `docs/ARCHITECTURE.md`
- `docs/COMPONENTS.md`
- `docs/STATE_MANAGEMENT.md`
- `docs/TESTING.md`
- `docs/DEPLOYMENT.md`
- `CONTRIBUTING.md`

---

### TASK-043: Setup CI/CD Pipeline [DV]
**Type:** DevOps  
**Priority:** Critical  
**Estimate:** 6 hours  
**Dependencies:** TASK-001  
**Constitutional Alignment:** DevOps, Testing

**Description:**
Configure GitHub Actions for automated testing and deployment.

**Acceptance Criteria:**
- [ ] Lint on every PR
- [ ] Type check on every PR
- [ ] Unit tests on every PR
- [ ] Integration tests on every PR
- [ ] Coverage report
- [ ] Build verification
- [ ] Performance budget check
- [ ] Accessibility audit
- [ ] Deploy to staging on merge to develop
- [ ] Deploy to production on merge to main

**Files to Create:**
- `.github/workflows/ci.yml`
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-production.yml`

---

### TASK-044: Performance Monitoring Setup [DV]
**Type:** DevOps  
**Priority:** Medium  
**Estimate:** 3 hours  
**Dependencies:** TASK-030, TASK-031  
**Constitutional Alignment:** Performance, Monitoring

**Description:**
Setup performance monitoring and alerting.

**Acceptance Criteria:**
- [ ] Lighthouse CI configured
- [ ] Real User Monitoring (RUM) configured
- [ ] Core Web Vitals tracked
- [ ] Custom metrics tracked (mission load time, etc.)
- [ ] Alerts configured for performance regressions

**Tools:**
- Lighthouse CI
- Google Analytics / Vercel Analytics
- Sentry Performance

---

## Phase 10: Final Review & Launch (5 hours)

### TASK-045: Constitutional Compliance Review [RV]
**Type:** Review/Validation  
**Priority:** Critical  
**Estimate:** 3 hours  
**Dependencies:** All tasks  
**Constitutional Alignment:** All principles

**Description:**
Final review to ensure all constitutional principles are met.

**Review Checklist:**

**Code Quality (SOLID & Clean Code):**
- [ ] All classes follow Single Responsibility Principle
- [ ] Dependency Injection used throughout
- [ ] Functions < 20 lines
- [ ] No magic numbers
- [ ] Meaningful names throughout
- [ ] DRY principle applied

**Testing Excellence:**
- [ ] All tests follow AAA pattern
- [ ] Single assertion per test
- [ ] Test coverage > 80% (business logic > 95%)
- [ ] Test naming convention followed

**User Experience:**
- [ ] WCAG 2.1 Level AA compliant
- [ ] Mobile-first design implemented
- [ ] Loading states < 1.5s
- [ ] Error messages clear and actionable

**Performance:**
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s
- [ ] TTI < 3.5s
- [ ] Bundle size < 250KB per route
- [ ] API responses < 200ms (p95)

**Type Safety:**
- [ ] TypeScript strict mode enabled
- [ ] Zero `any` types (except justified)
- [ ] All public APIs documented with JSDoc

---

### TASK-046: User Acceptance Testing (UAT) [RV]
**Type:** Review/Validation  
**Priority:** Critical  
**Estimate:** 2 hours  
**Dependencies:** TASK-045  
**Constitutional Alignment:** UX, Testing

**Description:**
Conduct user acceptance testing with stakeholders.

**Test Scenarios:**
- [ ] Mission discovery and browsing
- [ ] Mission opt-in flow
- [ ] Mission completion and reward claiming
- [ ] Badge collection viewing
- [ ] Filtering and searching
- [ ] Mobile experience
- [ ] Error handling scenarios

---

## Summary

### Total Effort: 203 hours

| Phase | Hours | Tasks |
|-------|-------|-------|
| 1. Foundation & Setup | 24 | 6 |
| 2. Redux State Management | 30 | 6 |
| 3. Infrastructure Layer | 28 | 4 |
| 4. UI Components - Presentational | 38 | 9 |
| 5. UI Components - Containers | 26 | 4 |
| 6. Pages & Routing | 12 | 3 |
| 7. Testing | 40 | 5 |
| 8. Performance & Polish | 15 | 4 |
| 9. Deployment & Documentation | 15 | 3 |
| 10. Final Review & Launch | 5 | 2 |

### Timeline (2-person team)

- **Week 1-2:** Phases 1-3 (Foundation, Redux, Infrastructure)
- **Week 3-4:** Phases 4-5 (UI Components)
- **Week 5:** Phases 6-7 (Pages, Testing)
- **Week 6:** Phases 8-10 (Polish, Deployment, Launch)

### Critical Path

```
TASK-001 → TASK-002 → TASK-003 → TASK-004 → TASK-007 → TASK-008 →
TASK-013 → TASK-020 → TASK-026 → TASK-028 → TASK-030 → TASK-033 →
TASK-036 → TASK-045 → TASK-046
```

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| WebSocket integration complexity | Start early (Phase 3), allocate buffer time |
| Performance budget exceeded | Continuous monitoring, bundle analyzer in CI |
| Accessibility issues discovered late | Daily audits with axe DevTools |
| Test coverage below target | Write tests alongside implementation, not after |
| @smartico/public-api breaking changes | Lock version, test updates in isolated branch |

---

**Document Status:** Ready for Implementation  
**Next Action:** Team assignment and sprint planning  
**Approval Required:** Technical Lead, Product Owner


