# MASTER_ORCHESTRATOR_PROMPT.md

# Claude Code Enterprise Master Orchestrator

## Objective
Build a production-grade application with:

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Backend: NestJS
- Database: PostgreSQL + Prisma ORM
- Responsive UI
- SonarQube Certified
- Clean Architecture

---

# Multi-Agent Workflow

1. Requirement Analysis Agent
2. Architecture & Planning Agent
3. Frontend Agent
4. Backend Agent
5. Integration Agent
6. Internal Review Agent
7. Looping Verification Agent
8. QA Agent
9. Automation Agent
10. Gap Analysis Agent
11. Documentation Agent
12. Release Readiness Agent

Each agent must complete its task, validate its own output, and block downstream work until quality gates pass.

---

# Looping Rules

Repeat continuously:

Review → Detect Issues → Fix → Re-test → Re-review

Stop ONLY when:

- Critical Issues = 0
- High Issues = 0
- ESLint = 0
- TypeScript = 0
- SonarQube Quality Gate = PASS
- Tests = PASS
- Build = PASS
- Security Scan = PASS

---

# Additional Global Standards

## Architecture
- Clean Architecture
- SOLID
- DRY
- KISS
- Feature-first folder structure
- Dependency Injection
- Repository pattern
- DTO validation
- Modular design
- Domain-driven naming

## Frontend
- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui
- Mobile-first
- WCAG 2.2 AA accessibility
- SEO metadata
- Dynamic imports
- Server Components by default
- Client Components only when required
- TanStack Query
- React Hook Form + Zod
- Axios abstraction
- Reusable hooks/components
- No inline styles
- No duplicated code

## Backend
- NestJS
- PostgreSQL
- Prisma
- JWT + Refresh Tokens
- RBAC
- Swagger
- Validation Pipes
- Exception Filters
- Guards
- Interceptors
- Winston logging
- Redis caching
- BullMQ queues
- Health checks
- Docker support

## Code Quality
- Maximum 500 lines per source file
- Maximum 40 lines per function (target)
- Cyclomatic complexity <= 10
- No any unless documented
- No dead code
- No magic numbers
- Shared constants
- Shared interfaces
- Shared utilities
- Strict linting
- Strict formatting

## Security
- OWASP Top 10
- CSRF/XSS/SQL Injection protection
- Rate limiting
- Secure headers
- Input validation
- Output sanitization
- Secrets via environment variables
- No secrets in code
- Audit logging

## Performance
- Lazy loading
- Pagination
- Query optimization
- Proper DB indexes
- Image optimization
- Compression
- Caching strategy
- Lighthouse target >95

## Testing
- Unit tests
- Integration tests
- API tests
- Playwright E2E
- Regression suite
- Smoke suite
- Accessibility tests
- Performance tests

## Documentation
Generate:
- Swagger
- ER Diagram
- Architecture
- Deployment
- Environment variables
- API collection
- Release notes
- Changelog
- QA reports
- Gap analysis
- Production checklist

## Final Deliverables
- Complete source code
- Passing build
- Passing tests
- SonarQube clean
- QA report
- Automation report
- Gap analysis
- Deployment guide
- Production-ready release
