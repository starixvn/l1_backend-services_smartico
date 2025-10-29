<!--
SYNC IMPACT REPORT
==================
Version Change: None → 1.0.0 (Initial Constitution)
Action: Initial creation
Rationale: Establishing foundational governance for Smartico Gamification Platform

Modified Principles:
- NEW: Code Quality (SOLID & Clean Code)
- NEW: Testing Excellence (AAA Pattern)
- NEW: User Experience Consistency
- NEW: Performance Standards
- NEW: Type Safety & Documentation

Added Sections:
- All core principles established
- Governance framework defined
- Amendment procedures established

Templates Status:
⚠ .specify/templates/plan-template.md - TO BE CREATED
⚠ .specify/templates/spec-template.md - TO BE CREATED
⚠ .specify/templates/tasks-template.md - TO BE CREATED
⚠ .specify/templates/commands/*.md - TO BE CREATED

Follow-up TODOs:
- Create supporting template files
- Establish CI/CD pipeline for automated compliance checks
- Document compliance review process
-->

# Smartico Gamification Platform - Project Constitution

**Version:** 1.0.0
**Ratified:** 2024-10-29
**Last Amended:** 2024-10-29
**Status:** Active

## Preamble

This constitution establishes the foundational principles, standards, and governance framework for the Smartico Gamification Platform project. It serves as the authoritative guide for all development activities, ensuring consistency, quality, and maintainability across the codebase.

All contributors, maintainers, and stakeholders MUST adhere to these principles. This document is binding and forms the basis for code review decisions, architecture choices, and technical debt management.

## Core Principles

### Principle 1: Code Quality - SOLID & Clean Code

**Statement:**
All code MUST adhere to SOLID principles and Clean Code standards. Code is written once but read many times; therefore, clarity and maintainability take precedence over cleverness.

**Rules:**
- **Single Responsibility Principle (SRP):** Each class, function, or module MUST have one and only one reason to change. A class should do one thing and do it well.
- **Open/Closed Principle (OCP):** Software entities MUST be open for extension but closed for modification. Use abstractions and dependency injection.
- **Liskov Substitution Principle (LSP):** Derived classes MUST be substitutable for their base classes without altering correctness.
- **Interface Segregation Principle (ISP):** Clients MUST NOT be forced to depend on interfaces they do not use. Create focused, role-specific interfaces.
- **Dependency Inversion Principle (DIP):** High-level modules MUST NOT depend on low-level modules. Both should depend on abstractions.
- **Clean Functions:** Functions MUST be small (< 20 lines preferred), do one thing, have descriptive names, and have minimal parameters (≤ 3 preferred).
- **Meaningful Names:** Use intention-revealing names. Avoid abbreviations except widely recognized ones (ID, API, HTTP, etc.).
- **No Magic Numbers:** All numeric literals MUST be named constants with clear purpose.
- **DRY Principle:** Do Not Repeat Yourself. Extract common logic into reusable functions or classes.

**Rationale:**
SOLID principles create flexible, maintainable systems that are easier to understand, test, and extend. Clean Code practices reduce cognitive load and prevent defects by making code self-documenting.

**Non-Compliance Examples:**
```typescript
// ❌ BAD: Violates SRP, unclear naming, magic numbers
class UserManager {
  saveUser(u: any) {
    if (u.age < 18) return false;
    this.db.save(u);
    this.sendEmail(u.email, 'Welcome!');
    this.logActivity(u.id, 1);
    return true;
  }
}

// ✅ GOOD: Single responsibilities, clear names, no magic
interface UserRepository { save(user: User): Promise<void>; }
interface EmailService { sendWelcome(email: string): Promise<void>; }
interface ActivityLogger { log(userId: string, event: ActivityEvent): void; }

class UserRegistrationService {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService,
    private activityLogger: ActivityLogger
  ) {}

  async registerUser(user: User): Promise<RegistrationResult> {
    if (!this.isEligibleForRegistration(user)) {
      return RegistrationResult.ageBelowMinimum();
    }

    await this.userRepo.save(user);
    await this.emailService.sendWelcome(user.email);
    this.activityLogger.log(user.id, ActivityEvent.userRegistered());

    return RegistrationResult.success();
  }

  private isEligibleForRegistration(user: User): boolean {
    const MINIMUM_AGE = 18;
    return user.age >= MINIMUM_AGE;
  }
}
```

### Principle 2: Testing Excellence - AAA Pattern with Single Assert

**Statement:**
All code MUST have comprehensive unit tests following the Arrange-Act-Assert (AAA) pattern. Each test MUST verify exactly one behavior with a single assertion to ensure clarity and precise failure diagnosis.

**Rules:**
- **AAA Structure:** Every test MUST be structured in three distinct sections:
  - **Arrange:** Set up test data and dependencies
  - **Act:** Execute the unit under test
  - **Assert:** Verify ONE expected outcome
- **Single Assert:** Each test function MUST contain exactly ONE assertion (except for guard assertions on setup).
- **One Behavior per Test:** Each test MUST verify one specific behavior or outcome.
- **Test Naming:** Test names MUST follow the pattern: `should_ExpectedBehavior_When_StateUnderTest` or `methodName_should_expectedBehavior_when_condition`.
- **No Logic in Tests:** Tests MUST NOT contain conditional statements, loops, or complex logic.
- **Test Independence:** Tests MUST be able to run in any order without dependencies on other tests.
- **Coverage Threshold:** Minimum 80% code coverage for all business logic. Critical paths require 100% coverage.
- **Test Pyramid:** Follow the test pyramid: Many unit tests, fewer integration tests, minimal E2E tests.

**Rationale:**
The AAA pattern provides structure and readability. Single assertions prevent ambiguity when tests fail—you know exactly what broke. This discipline forces clear thinking about what you're testing and makes tests serve as living documentation.

**Compliance Examples:**
```typescript
// ❌ BAD: Multiple asserts, unclear what's being tested
describe('MissionService', () => {
  it('works correctly', async () => {
    const service = new MissionService(mockRepo);
    const result = await service.getMissions('user1');
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('Daily Login');
    expect(result[0].progress).toBe(50);
  });
});

// ✅ GOOD: AAA pattern, single assert, clear intent
describe('MissionService', () => {
  describe('getMissions', () => {
    it('should_return_array_of_missions_when_user_has_active_missions', async () => {
      // Arrange
      const mockRepo = createMockRepository();
      const mockMissions = [createMockMission({ id: 1 })];
      mockRepo.findByUserId.mockResolvedValue(mockMissions);
      const service = new MissionService(mockRepo);
      const userId = 'user123';

      // Act
      const result = await service.getMissions(userId);

      // Assert
      expect(result).toEqual(mockMissions);
    });

    it('should_return_mission_with_correct_name_when_mission_exists', async () => {
      // Arrange
      const expectedName = 'Daily Login';
      const mockMission = createMockMission({ name: expectedName });
      const mockRepo = createMockRepository([mockMission]);
      const service = new MissionService(mockRepo);

      // Act
      const result = await service.getMissions('user123');

      // Assert
      expect(result[0].name).toBe(expectedName);
    });

    it('should_return_mission_with_progress_50_when_half_completed', async () => {
      // Arrange
      const expectedProgress = 50;
      const mockMission = createMockMission({ progress: expectedProgress });
      const mockRepo = createMockRepository([mockMission]);
      const service = new MissionService(mockRepo);

      // Act
      const result = await service.getMissions('user123');

      // Assert
      expect(result[0].progress).toBe(expectedProgress);
    });
  });
});
```

### Principle 3: User Experience Consistency

**Statement:**
The user interface MUST provide a consistent, predictable, and accessible experience across all features and platforms. UX patterns, components, and interactions MUST follow established design systems and accessibility standards.

**Rules:**
- **Design System Adherence:** All UI components MUST use the approved design system (colors, typography, spacing, components).
- **Responsive Design:** All interfaces MUST be fully responsive and functional on mobile (320px+), tablet (768px+), and desktop (1024px+) viewports.
- **Accessibility (WCAG 2.1 Level AA):**
  - All interactive elements MUST be keyboard accessible
  - Color contrast MUST meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
  - All images MUST have descriptive alt text
  - Forms MUST have proper labels and error messages
  - ARIA attributes MUST be used appropriately
- **Loading States:** All asynchronous operations MUST show loading indicators within 200ms.
- **Error Handling:** User-facing errors MUST be clear, actionable, and never expose technical details.
- **Performance Perception:** Initial content MUST appear within 1 second. Interactive elements MUST respond within 100ms.
- **Consistency:** Same actions MUST produce same results across the application. Button positions and labels MUST be consistent.

**Rationale:**
Consistent UX reduces cognitive load, builds user trust, and prevents frustration. Accessibility ensures the platform is usable by everyone. Predictable interactions lead to confident users who accomplish tasks efficiently.

**Compliance Checklist:**
- [ ] Uses approved design tokens/variables for colors, spacing, typography
- [ ] Tested on minimum supported screen sizes
- [ ] Passes automated accessibility audit (axe, Lighthouse)
- [ ] Keyboard navigation tested for all interactive flows
- [ ] Loading states implemented for all async operations
- [ ] Error messages reviewed for clarity and actionability
- [ ] Component matches design system specifications

### Principle 4: Performance Standards

**Statement:**
The application MUST meet strict performance benchmarks to ensure smooth user experience. Performance is a feature, not an afterthought.

**Rules:**
- **API Response Times:**
  - GET requests: < 200ms (p95)
  - POST/PUT requests: < 500ms (p95)
  - Real-time updates: < 100ms latency
- **Frontend Performance:**
  - First Contentful Paint (FCP): < 1.5s
  - Largest Contentful Paint (LCP): < 2.5s
  - Time to Interactive (TTI): < 3.5s
  - Cumulative Layout Shift (CLS): < 0.1
  - First Input Delay (FID): < 100ms
- **Bundle Size:** JavaScript bundle MUST be < 250KB (gzipped) per route.
- **Database Queries:** All queries MUST be indexed. N+1 queries are prohibited. Complex queries MUST be profiled and optimized.
- **Caching:** Implement appropriate caching strategies (in-memory, CDN, browser cache) for frequently accessed data.
- **Monitoring:** All critical paths MUST have performance monitoring and alerting.
- **Resource Optimization:**
  - Images MUST be optimized and served in modern formats (WebP, AVIF)
  - Lazy loading MUST be implemented for below-the-fold content
  - Code splitting MUST be used for route-based chunks

**Rationale:**
Performance directly impacts user satisfaction, conversion rates, and operational costs. Slow applications lead to user abandonment. Meeting these standards ensures a competitive, professional product.

**Measurement:**
- Use Lighthouse for frontend metrics
- Use APM tools (New Relic, DataDog) for backend metrics
- Implement synthetic monitoring for critical user journeys
- Track performance budgets in CI/CD pipeline

### Principle 5: Type Safety & Documentation

**Statement:**
All code MUST be fully typed using TypeScript with strict mode enabled. Types serve as inline documentation and prevent entire classes of bugs.

**Rules:**
- **Strict TypeScript:** `strict: true` in tsconfig.json is mandatory. No `any` types except where absolutely necessary with explicit justification.
- **Type Completeness:**
  - All function parameters MUST be typed
  - All function return values MUST be explicitly typed
  - All interfaces MUST be documented with JSDoc
  - Generics MUST have meaningful constraint types
- **API Contracts:** All API requests and responses MUST have corresponding TypeScript interfaces.
- **Documentation Standards:**
  - All public APIs MUST have JSDoc comments
  - Complex algorithms MUST have explanatory comments
  - README files MUST be present in major directories
  - Architecture decisions MUST be documented in ADRs
- **No Type Assertions:** Avoid type assertions (`as`) unless absolutely necessary. Prefer type guards.

**Rationale:**
TypeScript catches errors at compile-time rather than runtime. Strong typing enables better IDE support, safer refactoring, and serves as always-up-to-date documentation. Explicit types make code self-explanatory.

**Compliance Examples:**
```typescript
// ❌ BAD: Any types, no documentation, implicit returns
function processMission(data: any) {
  return data.missions.filter(m => m.active);
}

// ✅ GOOD: Explicit types, documented, clear intent
/**
 * Filters missions to return only active ones for the specified user.
 * 
 * @param userId - The unique identifier of the user
 * @param missions - Array of missions to filter
 * @returns Array containing only active missions
 * @throws {ValidationError} If userId is invalid
 */
function getActiveMissions(
  userId: string,
  missions: readonly Mission[]
): Mission[] {
  if (!isValidUserId(userId)) {
    throw new ValidationError('Invalid user ID format');
  }

  return missions.filter((mission): mission is Mission => 
    mission.isActive && !mission.isCompleted
  );
}

/**
 * Represents a mission in the gamification system.
 */
interface Mission {
  /** Unique mission identifier */
  readonly id: number;
  /** User-facing mission name */
  name: string;
  /** Current progress percentage (0-100) */
  progress: number;
  /** Whether the mission is currently active */
  isActive: boolean;
  /** Whether the mission has been completed */
  isCompleted: boolean;
}
```

## Governance

### Amendment Procedure

1. **Proposal:** Any team member may propose an amendment via pull request to this document.
2. **Discussion:** Proposal MUST be discussed in team meeting or asynchronous review period (minimum 3 business days).
3. **Impact Analysis:** Proposer MUST document:
   - Rationale for change
   - Affected principles or sections
   - Impact on existing codebase
   - Migration path if breaking change
4. **Approval:** Requires approval from:
   - Technical Lead
   - At least 2 senior developers
   - Product Owner (if affects user-facing principles)
5. **Version Update:** Constitution version MUST be incremented per semantic versioning:
   - MAJOR: Breaking changes to principles, removed principles
   - MINOR: New principles added, significant expansions
   - PATCH: Clarifications, typo fixes, non-semantic changes
6. **Propagation:** All dependent templates and documentation MUST be updated before merge.
7. **Communication:** Amendment MUST be announced to entire team with summary of changes.

### Versioning Policy

This constitution follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR (X.0.0):** Backward-incompatible changes, principle removals, fundamental redefinitions
- **MINOR (x.Y.0):** New principles, new sections, material expansions that don't break existing compliance
- **PATCH (x.y.Z):** Clarifications, wording improvements, typo fixes, non-semantic refinements

### Compliance Review

- **Code Review:** All pull requests MUST be reviewed for constitutional compliance before merge.
- **Automated Checks:** CI/CD pipeline MUST include:
  - Linting for code quality standards
  - Test coverage checks (min 80%)
  - TypeScript strict mode compilation
  - Performance budget checks
  - Accessibility audits (for UI changes)
- **Quarterly Audit:** Technical Lead MUST conduct quarterly audit of:
  - Overall code quality adherence
  - Test coverage trends
  - Performance metrics
  - Technical debt accumulation
- **Exception Process:** Exceptions to principles require:
  - Written justification in code comments
  - Approval from Technical Lead
  - Created technical debt ticket for remediation
  - Documentation of rationale and timeline

### Enforcement

- **Pull Request Gate:** PRs violating constitutional principles MUST NOT be merged until resolved.
- **Technical Debt:** Constitutional violations discovered in existing code MUST be tracked as technical debt with priority based on severity.
- **Continuous Improvement:** Constitution MUST be reviewed and potentially amended quarterly based on team feedback and lessons learned.

## Definitions

- **MUST/REQUIRED/SHALL:** Absolute requirement, non-negotiable
- **MUST NOT/SHALL NOT:** Absolute prohibition
- **SHOULD/RECOMMENDED:** Strong recommendation, exceptions require justification
- **SHOULD NOT:** Strong discouragement, exceptions require justification
- **MAY/OPTIONAL:** Truly optional, discretionary

## Adoption

This constitution has been ratified on 2024-10-29 and takes immediate effect for all new code. Existing code SHOULD be brought into compliance during normal maintenance activities.

---

**Document Status:** Active
**Authority:** Binding on all project contributors
**Review Cycle:** Quarterly
**Next Review:** 2025-01-29

