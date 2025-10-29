# .specify - Project Governance & Templates

This directory contains the project's governance documentation and standardized templates for consistent development practices.

## Directory Structure

```
.specify/
├── memory/
│   └── constitution.md          # Project constitution (principles & governance)
├── templates/
│   ├── plan-template.md         # Implementation plan template
│   ├── spec-template.md         # Technical specification template
│   ├── tasks-template.md        # Task breakdown template
│   └── commands/                # Speckit command definitions
└── README.md                    # This file
```

## Constitution

The **Project Constitution** (`.specify/memory/constitution.md`) is the authoritative source for:

- **Core Principles:** Code quality, testing, UX, performance, type safety
- **Standards:** SOLID principles, Clean Code, AAA testing pattern
- **Governance:** Amendment procedures, compliance reviews, enforcement

**All code must comply with the constitution.** Pull requests violating constitutional principles will not be merged.

### Current Principles (v1.0.0)

1. **Code Quality - SOLID & Clean Code**
   - Single Responsibility Principle
   - Open/Closed Principle
   - Liskov Substitution Principle
   - Interface Segregation Principle
   - Dependency Inversion Principle
   - Clean functions, meaningful names, no magic numbers, DRY

2. **Testing Excellence - AAA Pattern**
   - Arrange-Act-Assert structure
   - Single assertion per test
   - One behavior per test
   - Descriptive test names
   - 80%+ coverage requirement

3. **User Experience Consistency**
   - Design system adherence
   - Responsive design (320px+)
   - WCAG 2.1 Level AA accessibility
   - Loading states and error handling
   - Performance perception

4. **Performance Standards**
   - API: < 200ms (GET), < 500ms (POST)
   - Frontend: FCP < 1.5s, LCP < 2.5s, TTI < 3.5s
   - Bundle size: < 250KB gzipped
   - Database: indexed queries, no N+1

5. **Type Safety & Documentation**
   - TypeScript strict mode
   - No `any` types without justification
   - JSDoc documentation
   - Explicit return types

## Templates

### plan-template.md

Use for creating comprehensive implementation plans:

```bash
cp .specify/templates/plan-template.md docs/plans/my-feature-plan.md
```

**Includes:**
- Constitution compliance checklist
- Architecture overview
- Phase-by-phase breakdown
- Testing strategy
- Performance requirements
- UX specifications

### spec-template.md

Use for detailed technical specifications:

```bash
cp .specify/templates/spec-template.md docs/specs/my-feature-spec.md
```

**Includes:**
- Functional & non-functional requirements
- API specifications
- Data models
- Component specifications
- Testing requirements

### tasks-template.md

Use for granular task breakdowns:

```bash
cp .specify/templates/tasks-template.md docs/tasks/my-feature-tasks.md
```

**Includes:**
- Task categorization by constitutional principle
- Acceptance criteria
- Dependencies
- Time estimates
- Constitutional alignment markers

## Usage Guidelines

### For New Features

1. **Create Plan** using `plan-template.md`
   - Define architecture and phases
   - Document constitutional compliance
   - Get technical lead approval

2. **Create Spec** using `spec-template.md`
   - Detail requirements and design
   - Define APIs and data models
   - Review with team

3. **Break Down Tasks** using `tasks-template.md`
   - Create granular, actionable tasks
   - Mark constitutional alignment
   - Assign owners and estimates

4. **Implement** following constitutional principles
   - SOLID code quality
   - AAA testing pattern
   - UX consistency
   - Performance standards

5. **Review** against constitution
   - Code review checklist
   - Automated compliance checks
   - Manual validation

### For Constitution Amendments

1. **Propose** via pull request to `constitution.md`
2. **Discuss** with team (minimum 3 business days)
3. **Document** impact analysis
4. **Approve** with required stakeholders
5. **Update** version and propagate to templates
6. **Communicate** changes to team

See constitution's Governance section for full amendment procedure.

## Compliance Enforcement

### Automated Checks (CI/CD)

- ✅ Linting (ESLint with SOLID rules)
- ✅ Type checking (TypeScript strict)
- ✅ Test coverage (80% minimum)
- ✅ Performance budgets
- ✅ Accessibility audits

### Manual Review

- Code review against constitutional principles
- Architecture review for SOLID compliance
- UX review for design system consistency
- Security review checklist

### Quarterly Audit

Technical Lead conducts quarterly review of:
- Overall code quality trends
- Test coverage patterns
- Performance metrics
- Technical debt accumulation
- Constitutional effectiveness

## Quick Reference

### Code Quality Keywords
- **SRP:** One reason to change
- **OCP:** Open for extension, closed for modification
- **LSP:** Substitutable derived classes
- **ISP:** Focused interfaces
- **DIP:** Depend on abstractions
- **Clean:** Small functions, clear names, no magic

### Testing Keywords
- **AAA:** Arrange-Act-Assert
- **Single Assert:** One assertion per test
- **Coverage:** 80% minimum, 100% critical paths
- **Naming:** should_ExpectedBehavior_When_StateUnderTest

### Performance Targets
- **API GET:** < 200ms (p95)
- **API POST:** < 500ms (p95)
- **FCP:** < 1.5s
- **LCP:** < 2.5s
- **TTI:** < 3.5s
- **Bundle:** < 250KB gzipped

### Accessibility Standards
- **WCAG:** Level AA
- **Contrast:** 4.5:1 (normal), 3:1 (large)
- **Keyboard:** Full navigation
- **Screen Reader:** Compatible

## Resources

- **Constitution:** `.specify/memory/constitution.md`
- **Templates:** `.specify/templates/`
- **TypeScript Docs:** https://www.typescriptlang.org/docs/handbook/intro.html
- **SOLID Principles:** https://en.wikipedia.org/wiki/SOLID
- **Clean Code:** Robert C. Martin's "Clean Code"
- **AAA Pattern:** https://docs.microsoft.com/en-us/visualstudio/test/unit-test-basics
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/

## Questions?

For questions about:
- **Constitutional principles:** Ask Technical Lead
- **Template usage:** See examples in docs/
- **Compliance issues:** Create issue with `constitution` label
- **Amendments:** Follow Governance section procedures

---

**Last Updated:** 2024-10-29
**Constitution Version:** 1.0.0
**Status:** Active

