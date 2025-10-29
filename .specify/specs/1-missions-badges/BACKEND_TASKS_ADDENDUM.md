# Backend Tasks Addendum

**Date Added:** 2024-10-29  
**Reason:** User requested backend (Node.js/Express) setup tasks  
**Impact:** +88 hours to total estimate, +12 tasks

---

## Summary of Changes

### Before
- **Total Estimate:** 203 hours (5-6 weeks)
- **Focus:** Frontend-only (React/Redux)
- **Architecture:** Frontend → @smartico/public-api → Smartico Backend

### After
- **Total Estimate:** 291 hours (7-8 weeks)
- **Focus:** Full-stack (Backend + Frontend)
- **Architecture:** Frontend → Node.js/Express (BFF) → @smartico/public-api → Smartico Backend

---

## New Phase: Phase 1B - Backend Setup (48 hours, 12 tasks)

### Backend Tasks Added

| Task # | Name | Hours | Priority | Focus |
|--------|------|-------|----------|-------|
| **TASK-007** | Backend Project Initialization | 4h | Critical | DevOps setup |
| **TASK-008** | Backend Architecture & Folder Structure | 3h | Critical | Clean architecture |
| **TASK-009** | Configure Express App & Middleware | 5h | Critical | Security, CORS, rate limiting |
| **TASK-010** | Implement Authentication Middleware | 6h | Critical | JWT/session validation |
| **TASK-011** | Create Smartico API Client Wrapper | 8h | Critical | @smartico/public-api wrapper |
| **TASK-012** | Implement Mission Controller | 6h | Critical | REST endpoints |
| **TASK-013** | Implement Badge Controller | 4h | High | REST endpoints |
| **TASK-014** | Implement Caching Layer | 6h | High | Performance |
| **TASK-015** | Implement WebSocket Server | 8h | High | Real-time updates |
| **TASK-016** | Backend Unit Tests | 8h | Critical | AAA pattern tests |
| **TASK-017** | Backend Integration Tests | 6h | High | API endpoint tests |
| **TASK-018** | Backend Documentation | 4h | Medium | API docs, setup guide |

**Phase 1B Total:** 48 hours (12 tasks)

---

## Backend Architecture Overview

### Why Backend Layer?

The Backend for Frontend (BFF) pattern provides:

1. **Security**: Centralized authentication, API key management
2. **Performance**: Server-side caching, request aggregation
3. **Flexibility**: Can transform/aggregate data before sending to frontend
4. **Rate Limiting**: Protect against API abuse
5. **WebSocket Management**: Centralized real-time updates distribution

### Backend Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 4+
- **Language:** TypeScript (strict mode)
- **API Client:** @smartico/public-api
- **WebSocket:** ws library
- **Caching:** node-cache (in-memory) + Redis (optional)
- **Authentication:** JWT / Session-based
- **Testing:** Jest + Supertest

### API Endpoints

#### Missions
```
GET    /api/missions           - List all missions
GET    /api/missions/:id       - Get mission by ID
POST   /api/missions/:id/opt-in - Opt into mission
POST   /api/missions/:id/claim  - Claim mission reward
```

#### Badges
```
GET    /api/badges             - List all badges
GET    /api/badges/:id         - Get badge by ID
```

#### WebSocket
```
WS     /ws                     - Real-time updates
```

### Folder Structure

```
backend/
├── src/
│   ├── api/                  # Controllers, routes, middleware
│   ├── application/          # Services, use cases
│   ├── infrastructure/       # Smartico client, cache, WebSocket
│   ├── domain/              # Entities, interfaces, types
│   ├── shared/              # Config, errors, utils
│   ├── app.ts               # Express app config
│   └── server.ts            # Entry point
├── tests/
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # E2E tests
└── docs/                    # Documentation
```

---

## Updated Timeline

### With Backend (7-8 weeks, 2-person team)

```
Week 1-2: Foundation
├─ Frontend setup (Phase 1)
├─ Backend setup (Phase 1B) ← NEW
└─ Redux state management (Phase 2)

Week 3: Infrastructure
├─ WebSocket manager
├─ Caching services
└─ Error handling

Week 4-5: UI Components
├─ Presentational components
├─ Container components
└─ Pages & routing

Week 6: Testing
├─ Backend tests ← NEW
├─ Frontend tests
└─ Integration tests

Week 7: Polish & Launch
├─ Performance optimization
├─ Accessibility audit
├─ CI/CD setup
└─ Deployment
```

---

## Backend vs Frontend-Only

### When to Use Backend Layer (BFF)

✅ **Use BFF if:**
- You need centralized API key management
- You want server-side caching for performance
- You need request aggregation/transformation
- You require rate limiting at app level
- You want centralized WebSocket management
- You need server-side session management

### When to Skip Backend Layer

✅ **Skip BFF if:**
- You have a simple SPA with no complex auth
- @smartico/public-api can be used directly from browser
- You don't need server-side caching
- You're okay with client-side API key management
- You want faster initial development

**For this project:** We're implementing the BFF pattern for better security, caching, and WebSocket management.

---

## Constitutional Compliance

All backend tasks follow constitutional principles:

### ✅ Code Quality (SOLID)
- Single Responsibility: Each controller/service has one job
- Dependency Injection: Services injected into controllers
- Strategy Pattern: Cache adapters (Memory, Redis)
- Clean Architecture: 4-layer structure

### ✅ Testing (AAA Pattern)
- TASK-016: Backend unit tests with AAA
- TASK-017: Integration tests with Supertest
- Coverage target: > 90%

### ✅ Security
- TASK-010: Authentication middleware
- TASK-009: Helmet, CORS, rate limiting
- JWT validation, no sensitive data in logs

### ✅ Performance
- TASK-014: Server-side caching
- TASK-015: WebSocket for real-time updates
- Request logging and monitoring

### ✅ Type Safety
- TypeScript strict mode on all backend code
- Explicit return types
- No `any` types
- JSDoc documentation

---

## Integration with Frontend

### Before (Frontend-only)
```
Frontend (React)
    ↓
@smartico/public-api
    ↓
Smartico Backend
```

### After (Full-stack)
```
Frontend (React)
    ↓
Backend (Node.js/Express)
    ↓
@smartico/public-api
    ↓
Smartico Backend
```

### Frontend Changes Required

Update API calls to use backend endpoints:

```typescript
// Before
import { WSAPI } from '@smartico/public-api';
const wsApi = new WSAPI({ apiKey, brandKey });
const missions = await wsApi.getMissions();

// After
const response = await fetch('/api/missions', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data: missions } = await response.json();
```

---

## Deployment Notes

### Environment Variables (Backend)

```bash
# Server
PORT=4000
NODE_ENV=production

# Smartico API
SMARTICO_API_KEY=your_api_key_here
SMARTICO_BRAND_KEY=your_brand_key_here
SMARTICO_ENV=production

# Authentication
JWT_SECRET=your_jwt_secret_here

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Caching (optional)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
```

### Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Load Balancer                    │
└────────────────┬────────────────────────────────────┘
                 │
         ┌───────┴────────┐
         ▼                ▼
┌─────────────┐   ┌─────────────┐
│  Frontend   │   │   Backend   │
│  (Static)   │   │  (Node.js)  │
│  Vercel/    │   │   Heroku/   │
│  Netlify    │   │   Railway   │
└─────────────┘   └──────┬──────┘
                         │
                         ▼
                 ┌───────────────┐
                 │  @smartico/   │
                 │  public-api   │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │   Smartico    │
                 │    Backend    │
                 └───────────────┘
```

---

## Next Steps

1. **Review Backend Tasks** - Read TASK-007 through TASK-018
2. **Assign Backend Developer** - Ideally someone with Node.js/Express experience
3. **Setup Backend Environment** - Follow TASK-007 instructions
4. **Parallel Development** - Backend (TASK-007-018) can be done in parallel with Frontend (original TASK-001-006)

---

**Status:** ✅ Backend tasks added and ready for implementation  
**Total Project Estimate:** 291 hours (7-8 weeks with 2-person team)  
**Backend Estimate:** 48 hours (12 tasks)  
**Frontend Estimate:** 243 hours (remaining tasks)


