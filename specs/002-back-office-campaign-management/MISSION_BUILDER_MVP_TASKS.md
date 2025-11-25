# Mission Builder MVP with Visual Rule Builder - Task Breakdown

**Feature:** Mission Builder MVP with Drag-and-Drop Rule Builder
**Epic:** 002-back-office-campaign-management (FR-1)
**Created:** 2025-01-25
**Last Updated:** 2025-01-25
**Owner:** Development Team
**Status:** Ready for Implementation

## MVP Scope

This task breakdown focuses on delivering a **Mission Builder MVP** with a **visual drag-and-drop rule builder** as the standout demo feature. The MVP will demonstrate:

1. **Backend**: Clean Architecture (.NET 9) with Mission CRUD operations
2. **Frontend**: React 19 visual rule builder with drag-and-drop blocks
3. **Multi-Tenant**: Operator-level data isolation with MongoDB
4. **Demo-Ready**: Impressive visual mission creation with React Flow

**MVP Features:**
- Visual drag-and-drop rule builder (similar to Zapier/n8n)
- 3 trigger types: Bet Placed, Deposit Made, Game Played
- Count-based goals only (complete N times)
- 2 reward types: Free Spins, Cash Bonus
- Basic targeting: All Players, VIP Only
- Mission list with filtering
- Status management: Draft, Active, Completed, Cancelled

**Out of Scope for MVP:**
- Additional trigger types (login, win amount, etc.)
- Value-based goals (wager total amount)
- Complex player segmentation
- Recurring schedules
- Auto-save functionality
- Mission preview for players
- Analytics dashboard

## Success Criteria

The MVP will be considered complete when:

- [X] Backend Mission CRUD API endpoints functional
- [ ] Visual rule builder with drag-and-drop blocks works smoothly
- [ ] Users can create missions by dragging trigger → goal → reward blocks
- [ ] Missions save correctly to MongoDB with operator isolation
- [ ] Mission list displays all operator missions with status filtering
- [ ] Demo can be shown to stakeholders (impressive visual experience)

---

## Phase 1: Backend Foundation

### Domain Layer

- [ ] T001 Create Mission entity in backoffice-api/src/Smartico.BackOffice.Domain/Entities/Mission.cs
- [ ] T002 [P] Create MissionConfig value objects in backoffice-api/src/Smartico.BackOffice.Domain/ValueObjects/MissionConfig.cs (TriggerType, GoalType, RewardType, MissionStatus, PlayerSegment enums)
- [ ] T003 [P] Create MissionRule value object in backoffice-api/src/Smartico.BackOffice.Domain/ValueObjects/MissionRule.cs (for storing visual flow structure)
- [ ] T004 Create IMissionRepository interface in backoffice-api/src/Smartico.BackOffice.Domain/Repositories/IMissionRepository.cs

### Infrastructure Layer

- [ ] T005 Implement MissionRepository in backoffice-api/src/Smartico.BackOffice.Infrastructure/Repositories/MissionRepository.cs
- [ ] T006 Add Mission collection indexes to backoffice-api/src/Smartico.BackOffice.Infrastructure/Data/MongoDbIndexSetup.cs

### Application Layer

- [ ] T007 Create CreateMissionCommand in backoffice-api/src/Smartico.BackOffice.Application/Missions/Commands/CreateMissionCommand.cs
- [ ] T008 [P] Create MissionDto in backoffice-api/src/Smartico.BackOffice.Application/Missions/DTOs/MissionDto.cs
- [ ] T009 [P] Create MissionValidator in backoffice-api/src/Smartico.BackOffice.Application/Missions/Validators/MissionValidator.cs
- [ ] T010 Create IMissionService interface in backoffice-api/src/Smartico.BackOffice.Application/Missions/Interfaces/IMissionService.cs
- [ ] T011 Implement MissionService in backoffice-api/src/Smartico.BackOffice.Application/Missions/Services/MissionService.cs

### API Layer

- [ ] T012 Create MissionsController in backoffice-api/src/Smartico.BackOffice.Api/Controllers/MissionsController.cs (POST, GET, GET/:id, PUT/:id, DELETE/:id endpoints)
- [ ] T013 Register Mission services in backoffice-api/src/Smartico.BackOffice.Api/Program.cs (DI configuration)

### Backend Testing

- [ ] T014 Test Mission CRUD endpoints with Swagger/Postman
- [ ] T015 Verify operator isolation (Casino A cannot see Casino B missions)
- [ ] T016 Test validation rules (required fields, date ranges, etc.)

---

## Phase 2: Frontend Foundation - Type Definitions & API

### Type Definitions

- [ ] T017 Add Mission enums to backoffice-frontend/src/services/api.types.ts (TriggerType, GoalType, RewardType, MissionStatus, PlayerSegment)
- [ ] T018 [P] Add Mission interface to backoffice-frontend/src/services/api.types.ts
- [ ] T019 [P] Add MissionRule interface to backoffice-frontend/src/services/api.types.ts (nodes, edges structure for visual builder)

### API Service

- [ ] T020 Create missionApi service in backoffice-frontend/src/services/missionApi.ts (createMission, getMissions, getMissionById, updateMission, deleteMission)

### Validation Schema

- [ ] T021 Create missionSchema in backoffice-frontend/src/features/missions/schemas/missionSchema.ts (Zod validation for mission form)

---

## Phase 3: Visual Rule Builder Components

**Goal:** Create the impressive drag-and-drop rule builder using React Flow

### Install React Flow

- [ ] T022 Install React Flow library: `cd backoffice-frontend && npm install reactflow`

### Custom Node Components

- [ ] T023 [P] Create TriggerNode component in backoffice-frontend/src/features/missions/components/nodes/TriggerNode.tsx (blue block for triggers)
- [ ] T024 [P] Create GoalNode component in backoffice-frontend/src/features/missions/components/nodes/GoalNode.tsx (purple block for goals)
- [ ] T025 [P] Create RewardNode component in backoffice-frontend/src/features/missions/components/nodes/RewardNode.tsx (green block for rewards)

### Rule Builder Core

- [ ] T026 Create RuleBuilder component in backoffice-frontend/src/features/missions/components/RuleBuilder.tsx (main React Flow canvas with controls and background)
- [ ] T027 Create RuleBuilderToolbox component in backoffice-frontend/src/features/missions/components/RuleBuilderToolbox.tsx (draggable blocks palette)
- [ ] T028 Create NodeConfigPanel component in backoffice-frontend/src/features/missions/components/NodeConfigPanel.tsx (side panel for configuring selected node)

### Rule Builder Logic

- [ ] T029 Implement drag-and-drop handler in RuleBuilder.tsx (onDrop, onDragOver)
- [ ] T030 Implement node connection logic in RuleBuilder.tsx (onConnect, validate connections)
- [ ] T031 Implement node selection and configuration in RuleBuilder.tsx (onClick node, update NodeConfigPanel)
- [ ] T032 Add rule validation logic (must have trigger → goal → reward flow)
- [ ] T033 Add visual feedback for invalid connections (highlight errors, show warnings)

### Data Transformation

- [ ] T034 Create rule serialization utility in backoffice-frontend/src/features/missions/utils/ruleSerializer.ts (convert React Flow nodes/edges to backend MissionRule format)
- [ ] T035 Create rule deserialization utility in backoffice-frontend/src/features/missions/utils/ruleDeserializer.ts (convert backend MissionRule to React Flow nodes/edges)

---

## Phase 4: Mission Form Integration

**Goal:** Integrate the visual rule builder into the mission creation flow

### Mission Form Components

- [ ] T036 Create MissionForm component in backoffice-frontend/src/features/missions/components/MissionForm.tsx (react-hook-form wrapper with Zod validation)
- [ ] T037 Create MissionFormFields component in backoffice-frontend/src/features/missions/components/MissionFormFields.tsx (basic info: name, description, schedule, targeting)
- [ ] T038 Integrate RuleBuilder into MissionForm (add rule builder section, connect to form state)

### Form State Management

- [ ] T039 Add RuleBuilder value to react-hook-form state (custom field registration)
- [ ] T040 Add validation for rule builder (ensure valid flow exists before submission)
- [ ] T041 Handle form submission (serialize rule builder, call API, navigate on success)

---

## Phase 5: Mission List & Details

**Goal:** Display missions in a list and show detailed view

### Mission List Components

- [ ] T042 [P] Create MissionCard component in backoffice-frontend/src/features/missions/components/MissionCard.tsx (display mission summary with status badge)
- [ ] T043 [P] Create MissionList component in backoffice-frontend/src/features/missions/components/MissionList.tsx (grid of cards with loading/empty states)

### Mission Details Components

- [ ] T044 Create MissionDetails component in backoffice-frontend/src/features/missions/components/MissionDetails.tsx (read-only view with all mission info)
- [ ] T045 Add visual rule flow display to MissionDetails (render rule as read-only React Flow diagram)

### Pages

- [ ] T046 Create MissionsPage in backoffice-frontend/src/features/missions/pages/MissionsPage.tsx (list page with filter buttons)
- [ ] T047 Create MissionCreatePage in backoffice-frontend/src/features/missions/pages/MissionCreatePage.tsx (create mission with rule builder)
- [ ] T048 Create MissionDetailsPage in backoffice-frontend/src/features/missions/pages/MissionDetailsPage.tsx (view mission details)
- [ ] T049 Create MissionEditPage in backoffice-frontend/src/features/missions/pages/MissionEditPage.tsx (edit mission with pre-loaded rule builder)

### Routing

- [ ] T050 Add mission routes to backoffice-frontend/src/App.tsx (/missions, /missions/create, /missions/:id, /missions/:id/edit)
- [ ] T051 Add "Missions" navigation link to backoffice-frontend/src/components/Layout.tsx sidebar

---

## Phase 6: Polish & Demo Preparation

### Status Filtering

- [X] T052 Add status filter buttons to MissionsPage (All, Draft, Active, Completed, Cancelled)
- [X] T053 Implement client-side filtering logic in MissionList
- [X] T053a Create MissionCard component with consistent styling to match TournamentCard
- [X] T053b Update MissionsPage to use grid layout (2 columns) matching tournaments
- [X] T053c Add semantic colors (success, warning, error, info) to tokens.css
- [X] T053d Ensure consistent status badge colors across Missions and Tournaments (Draft=yellow)

### Visual Polish

- [ ] T054 Add smooth animations to rule builder (node movement, connection drawing)
- [ ] T055 Add zoom controls and mini-map to rule builder (React Flow built-in features)
- [ ] T056 Style node blocks with proper colors and icons (trigger=blue, goal=purple, reward=green)
- [ ] T057 Add loading states to all async operations (spinners, skeleton screens)
- [ ] T058 Add success/error toast notifications for CRUD operations

### Delete Functionality

- [ ] T059 Add delete button to MissionDetailsPage with confirmation dialog
- [ ] T060 Implement deleteMission API call with error handling

### End-to-End Testing

- [ ] T061 Test complete mission creation flow (drag blocks → configure → save → verify in list)
- [ ] T062 Test mission edit flow (load existing → modify rule → save → verify changes)
- [ ] T063 Test mission delete flow (delete → verify removed from list)
- [ ] T064 Test validation scenarios (invalid connections, missing configurations, date errors)
- [ ] T065 Test multi-operator isolation (create mission as Operator A, verify not visible to Operator B)

---

## Implementation Strategy

### Recommended Order

1. **Backend First (T001-T016)**: Get API working and tested with Swagger
2. **Frontend Foundation (T017-T021)**: Set up types and API client
3. **Visual Rule Builder (T022-T035)**: Build the impressive drag-and-drop experience
4. **Integration (T036-T041)**: Connect rule builder to mission form
5. **List & Details (T042-T051)**: Complete CRUD UI
6. **Polish (T052-T065)**: Make it demo-ready

### Parallel Execution Opportunities

**Phase 1 (Backend):**
- T002, T003 can run parallel (different value object files)
- T008, T009 can run parallel (DTO and Validator)

**Phase 2 (Frontend Foundation):**
- T017, T018, T019 can run parallel (all in api.types.ts, different sections)

**Phase 3 (Visual Builder):**
- T023, T024, T025 can run parallel (different node components)

**Phase 5 (UI):**
- T042, T043, T044 can run parallel (different components)
- T046, T047, T048, T049 can run parallel (different pages)

### MVP Delivery

**Week 1 Goal**: Backend + Visual Rule Builder working
- Complete Phase 1 (Backend Foundation)
- Complete Phase 2 (Frontend Foundation)
- Complete Phase 3 (Visual Rule Builder)

**Week 2 Goal**: Full CRUD + Demo Polish
- Complete Phase 4 (Form Integration)
- Complete Phase 5 (List & Details)
- Complete Phase 6 (Polish & Testing)

---

## Dependency Graph

```
Phase 1: Backend Foundation (T001-T016)
  ├─ Domain (T001-T004) → Infrastructure (T005-T006)
  └─ Infrastructure → Application (T007-T011) → API (T012-T013)
          ↓
Phase 2: Frontend Foundation (T017-T021)
  ├─ Types (T017-T019) → API Service (T020) → Validation (T021)
          ↓
Phase 3: Visual Rule Builder (T022-T035)
  ├─ Install ReactFlow (T022)
  ├─ Node Components (T023-T025) [PARALLEL]
  ├─ Core Components (T026-T028)
  ├─ Logic (T029-T033)
  └─ Utilities (T034-T035)
          ↓
Phase 4: Form Integration (T036-T041)
  ├─ Form Components (T036-T037)
  ├─ Integration (T038)
  └─ State Management (T039-T041)
          ↓
Phase 5: List & Details (T042-T051)
  ├─ Components (T042-T045) [PARALLEL]
  ├─ Pages (T046-T049) [PARALLEL]
  └─ Routing (T050-T051)
          ↓
Phase 6: Polish & Testing (T052-T065)
  ├─ Filtering (T052-T053)
  ├─ Visual Polish (T054-T058)
  ├─ Delete (T059-T060)
  └─ Testing (T061-T065)
```

---

## Summary

**Total Tasks:** 65
**Parallel Opportunities:** 12 tasks can run in parallel
**Estimated Duration:** 2 weeks (1 developer) or 1 week (2 developers working in parallel)

**By Phase:**
- Phase 1 (Backend Foundation): 16 tasks (3 days)
- Phase 2 (Frontend Foundation): 5 tasks (1 day)
- Phase 3 (Visual Rule Builder): 14 tasks (3 days)
- Phase 4 (Form Integration): 6 tasks (1 day)
- Phase 5 (List & Details): 10 tasks (2 days)
- Phase 6 (Polish & Testing): 14 tasks (2 days)

**Key Deliverables:**
1. Working Mission CRUD API with operator isolation
2. **Impressive visual drag-and-drop rule builder** (main demo feature)
3. Complete mission management UI (list, create, edit, delete)
4. End-to-end tested MVP ready for stakeholder demo

**Next Steps After MVP:**
1. Add more trigger types (Login, WinAmount, etc.)
2. Add value-based goals
3. Add advanced player segmentation
4. Add recurring schedules
5. Add mission analytics dashboard
6. Add auto-save functionality
7. Add player-facing mission preview

---

**Last Updated:** 2025-01-25
**Status:** Ready for Implementation
**Owner:** Development Team
