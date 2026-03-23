# AGENTS.md — Team Structure & Conventions

**Project**: Chinese Chess (中国象棋)  
**Created**: 2026-03-23  
**Status**: Draft (to be finalized in Formation Session)

---

## Team Structure

### Team Member Profiles

Team member profiles are located in `.team/`:

| Profile | Role | Expertise |
|---------|------|-----------|
| marty-cagan.md | Product Manager | Product discovery, user value |
| chess-ai-expert.md | Domain SME | Chinese Chess AI, game theory |
| julie-zhuo.md | UI/UX Designer | Interface design, skin system |
| kent-beck.md | Software Engineer | TDD, code quality |
| martin-fowler.md | Software Engineer | Architecture, refactoring |
| james-bach.md | QA Analyst | Testing strategy, quality |

### Project Owner Constraints

Project owner constraints are defined in `PROJECT.md`.

### Domain Glossary

Domain terminology is maintained in `docs/glossary.md`.

---

## Working Conventions

**Formation Session Date**: 2026-03-23  
**Status**: ✅ Complete (10/10 decisions approved)

---

### Decision 1.1: Feature Priority Framework

**Framework**: Opportunity Assessment + Walking Skeleton First

**Evaluation Dimensions**:
| Dimension | Weight | Description |
|-----------|--------|-------------|
| User Value | 30% | Problem solved, users impacted |
| Technical Feasibility | 20% | Implementation difficulty, technical risk |
| UX Impact | 20% | Accessibility, usability, delight |
| Dependency Order | 20% | Is this a prerequisite for other features |
| Quality Risk | 10% | Test complexity, failure impact |

**Rules**:
1. Walking Skeleton is always Slice 1
2. Dependency order > value order (infrastructure first)
3. High-risk features validated early

---

### Decision 2.1: Driver-Reviewer Workflow

**TDD Pair Structure**:
- 1 Driver (implementation) + 1-2 Reviewers
- Pipeline auto-schedules pairs

**Driver Responsibilities**:
- Execute full TDD cycle (RED-DOMAIN-GREEN-DOMAIN-COMMIT)
- Submit evidence per cycle (test results, code diff)
- Address reviewer feedback
- Request re-review or push

**Reviewer Responsibilities**:
- Complete review within 24 hours
- Write to `.reviews/<reviewer>-<task>.md`
- Classify findings (blocking/non-blocking)
- Approve after fixes confirmed

**Rotation Rules**:
| Rule | Description |
|------|-------------|
| Per-slice rotation | New Driver each slice |
| Consecutive limit | Max 2 consecutive as Driver |
| Newcomer pairing | First-time Driver paired with senior Reviewer |
| Reviewer continuity | Keep Reviewers continuous when possible |

---

### Decision 3.1: Definition of Done

**Slice Completion Checklist**:
- [ ] All acceptance tests pass (100%)
- [ ] Code coverage met (core >90%, overall >70%)
- [ ] Mutation kill rate >80%
- [ ] Zero blocking review issues
- [ ] CI build green
- [ ] Accessibility compliant (WCAG AA)
- [ ] Refactoring step completed
- [ ] Responsive tests pass (if UI)
- [ ] Documentation updated (if applicable)
- [ ] Retrospective complete (if applicable)

**Failure Handling**:
- Slice cannot be marked Completed
- Pipeline enters rework flow
- 3 rework failures → escalate to Product Owner

---

### Decision 4.1: Commit & Integration Flow

**Commit Flow**:
```
TDD Cycle Complete → Atomic Commit → Review → Fix → Push → CI → Merge
```

**Commit Message Format**:
```
[TDD] {slice-id}: {description}
Example: "[TDD] S1: Implement horse movement generation"
```

**Branch Strategy**:
- `main` — production branch
- `feature/slice-{n}-{name}` — feature branches

---

### Decision 5.1: Disagreement Resolution

**Escalation Flow**:
1. **Step 1**: Technical discussion (data-driven, 30 min limit)
2. **Step 2**: Robert's Rules vote (4/6 to pass)
3. **Step 3**: Product Owner decides (recorded as ADR)

**Documentation**: All disagreements recorded in `docs/ARCHITECTURE.md`

---

### Decision 6.1: Code Conventions

| Aspect | Rule |
|--------|------|
| **Lint** | ESLint + Prettier default config |
| **TypeScript** | Strict mode (`strict: true`) |
| **Function Length** | Max 20 lines (ideal <10) |
| **File Length** | Max 300 lines (split if larger) |
| **Naming** | Intent-revealing, no abbreviations |
| **Comments** | Explain "why", not "what" |
| **Format** | 2-space indent, no semicolons |

---

### Decision 7.1: Retrospectives

**Trigger**: After each PR merged to `main`

**Four Phases**:
1. **Previous Action Item Audit** — Status all prior items
2. **Individual Observations** — Write to `.reviews/retro/` files
3. **Team Discussion** — Real exchange, not summaries
4. **Consensus & Record** — Consent protocol, named owners

**Action Item Rule**: Implemented before next work item starts

---

### Decision 8.1: Architectural Principles

| Principle | Description | Violation Example |
|-----------|-------------|-------------------|
| **Layered Architecture** | Presentation → Application → Domain → Infrastructure | UI directly calls storage |
| **Domain Purity** | Domain layer has no external dependencies | Domain imports React |
| **Immutable State** | All state updates produce new objects | Direct state mutation |
| **AI Isolation** | AI runs in Web Worker | AI blocks main thread |
| **Progressive Enhancement** | Core works without advanced features | First screen waits for AI |
| **Performance First** | 60fps render, <5s AI response | Lag, long waits |
| **Accessibility Built-In** | Not an afterthought | Adding aria labels last |

---

### Decision 9.1: Communication Norms

**Follow Skill**: `agent-coordination` v2.1.0

| Rule | Description | Violation Example |
|------|-------------|-------------------|
| **One Message Then Wait** | Send complete message, wait for reply | Sending multiple messages |
| **Idle = Heartbeat** | Idle notifications default no action | "Are you there?" polling |
| **No Polling** | Event-driven, no periodic checks | `while(!done) sleep()` |
| **No Fabrication** | Wait for system events, don't invent | Writing "received reply" yourself |
| **Sequential Spawning** | Spawn agents one at a time | Spawning all at once |

---

### Decision 10.1: Toolchain

| Category | Tool | Version | Purpose |
|----------|------|---------|---------|
| **Frontend** | React | 18.x | UI components |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 3.x | Atomic CSS |
| **State** | Zustand | 4.x | Lightweight state |
| **Build** | Vite | 5.x | Fast builds |
| **Unit Test** | Vitest | 1.x | Unit testing |
| **E2E Test** | Playwright | 1.x | End-to-end testing |
| **Lint** | ESLint | 8.x | Code quality |
| **Format** | Prettier | 3.x | Code formatting |
| **Audio** | Howler.js | 2.x | Sound playback |
| **Deploy** | Vercel | — | Static hosting |

---

## Retrospective Schedule

- **Trigger**: After each PR merged to `main`
- **Format**: Event-driven (not time-based)
- **Output**: Action items with named owners
- **Implementation**: Action items done before next work item

---

## Review Protocol

- **File-Based Reviews**: All reviews written to `.reviews/` directory
- **Review Naming**: `<reviewer>-<task-slug>.md`
- **Re-Reviews**: Increment pass number (`-pass2.md`, `-pass3.md`)
- **Blocking Issues**: Must be addressed before approval
- **Non-Blocking**: Can be deferred with tracking

---

## Driver-Reviewer Mob Model

*(To be finalized in Formation Session)*

### Expected Flow
1. Driver implements with TDD
2. Driver commits locally
3. Reviewers review `.reviews/` files
4. Driver addresses feedback
5. Team consents → Push
6. CI waits → Merge

---

## Decision Log

*(To be populated during Formation Session)*

Decisions will be recorded with:
- Date
- Motion
- Category (standard/major/critical)
- Consent count
- Stand-aside details
- Outcome

---

## Action Items

### From Retrospective 1 (2026-03-25) - COMPLETED

| ID | Item | Owner | Status | Due | Notes |
|----|------|-------|--------|-----|-------|
| AI-1 | Domain expert reviews all move generation | Chess AI Expert | ✅ DONE | Slice 2 start | Reviewed all 6 piece types |
| AI-2 | Add 30-min TDD cycle limit to AGENTS.md | Kent Beck | ✅ DONE | 2026-03-26 | Added to conventions |
| AI-3 | Refactor board.ts (<300 lines) | Kent Beck | ✅ DONE | Slice 2 start | Now 245 lines |
| AI-4 | Optimize E2E tests (<30s) | James Bach | ⚠️ PARTIAL | Slice 2 start | Down to 38s |
| AI-5 | Add drag support for pieces (not deferred) | Julie Zhuo | ➡️ MOVED | Slice 2 | Moved to Slice 4 |
| AI-6 | Create color palette template | Julie Zhuo | ✅ DONE | Slice 2 start | Template in docs/ |

---

### From Retrospective 2 (2026-03-27) - COMPLETED

| ID | Item | Owner | Status | Due | Notes |
|----|------|-------|--------|-----|-------|
| AI-7 | Add check indicator (red glow on general) | Julie Zhuo | ✅ DONE | Slice 3 start | Implemented |
| AI-8 | Optimize move generation (<50ms) | Kent Beck | ✅ DONE | Slice 3 mid | Down to 38ms |
| AI-9 | Optimize E2E tests (<30s) | James Bach | ✅ DONE | Slice 3 start | Down to 28s |
| AI-10 | Implement drag support for pieces | Julie Zhuo | ✅ DONE | Slice 3 | Tests stable |
| AI-11 | Add long check rule detection | Chess AI Expert | ➡️ DEFERRED | Slice 3 | Moved to Slice 6 |
| AI-12 | Create known position test database | James Bach | ✅ DONE | Slice 3 | 50 positions |
| AI-13 | Enforce 30-min TDD cycle limit | Kent Beck | ✅ DONE | Immediately | All cycles <30min |
| AI-14 | Extract move generator factory | Martin Fowler | ✅ DONE | Slice 3 start | Factory pattern |

---

### From Retrospective 3 (2026-04-01) - COMPLETED

| ID | Item | Owner | Status | Due | Notes |
|----|------|-------|--------|-----|-------|
| AI-15 | Add transposition table | Chess AI Expert | ➡️ DEFERRED | Slice 4 | Moved to Slice 6 |
| AI-16 | Move AI to Web Worker | Kent Beck | ➡️ DEFERRED | Slice 4 | Moved to Slice 6 |
| AI-17 | Fix drag support tests | Julie Zhuo | ✅ DONE | Slice 4 start | Tests stable |
| AI-18 | Add evaluation bar | Julie Zhuo | ✅ DONE | Slice 4 | Added to UI |
| AI-19 | Expand opening book (50+) | Chess AI Expert | ⚠️ PARTIAL | Slice 4 | Expanded to 25 |
| AI-20 | Add performance regression tests | James Bach | ✅ DONE | Slice 4 | Added to CI |
| AI-21 | Refactor AI engine for testability | Kent Beck | ✅ DONE | Slice 4 | Interfaces extracted |
| AI-22 | Endgame tablebases research | Chess AI Expert | ✅ DONE | Slice 6 prep | Research complete |

---

### From Retrospective 4 (2026-04-05)

| ID | Item | Owner | Status | Due | Priority |
|----|------|-------|--------|-----|----------|
| AI-23 | Implement transposition table | Chess AI Expert | NOT-STARTED | Slice 6 | High |
| AI-24 | Move AI to Web Worker | Kent Beck | NOT-STARTED | Slice 6 | High |
| AI-25 | Add skin presets | Julie Zhuo | NOT-STARTED | Slice 5 | Medium |
| AI-26 | Add visual regression tests | James Bach | NOT-STARTED | Slice 5 | Medium |
| AI-27 | Expand opening book to 50+ | Chess AI Expert | NOT-STARTED | Slice 6 | Medium |
| AI-28 | Triaging deferred items (27) | Coordinator | IN-PROGRESS | Before Slice 5 | High |
| AI-29 | Add guided color palettes | Julie Zhuo | NOT-STARTED | Slice 5 | Low |
| AI-30 | Tech debt dashboard | Martin Fowler | NOT-STARTED | Slice 5 | Low |

**Audit**: Items NOT-STARTED for 2+ retros escalate to blocking

---

### Completion Summary

| Retro | Total Items | Complete | Deferred | In Progress | Pending |
|-------|-------------|----------|----------|-------------|---------|
| Retro 1 | 6 | 5 | 1 | 0 | 0 |
| Retro 2 | 8 | 6 | 1 | 0 | 1 |
| Retro 3 | 8 | 5 | 2 | 0 | 1 |
| Retro 4 | 8 | 0 | 0 | 1 | 7 |
| **Total** | **30** | **16** | **4** | **1** | **9** |

**Completion Rate**: 53% (16/30)  
**On Track**: 70% (21/30)  
**Deferred**: 13% (4/30)

---

### Completion Summary

| Retro | Total Items | Complete | In Progress | Moved | Partial |
|-------|-------------|----------|-------------|-------|---------|
| Retro 1 | 6 | 4 | 1 | 1 | 1 |
| Retro 2 | 8 | 0 | 1 | 0 | 0 |
| **Total** | **14** | **4** | **2** | **1** | **1** |

**Completion Rate**: 29% (4/14)  
**On Track**: 71% (10/14)

---

*This document evolves during the Formation Session and retrospectives.*
