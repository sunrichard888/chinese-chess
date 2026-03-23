# Coordinator Instructions

**Project**: Chinese Chess (中国象棋)  
**Mode**: Factory Mode (Pipeline Automated)  
**Team Size**: 6 (Lean Preset)

---

## Team Roster

| Profile | Role | Responsibility |
|---------|------|----------------|
| marty-cagan.md | Product Manager | User value, scope definition |
| chess-ai-expert.md | Domain SME | AI engine, game rules |
| julie-zhuo.md | UI/UX Designer | Interface, skin system |
| kent-beck.md | Software Engineer | TDD, code quality |
| martin-fowler.md | Software Engineer | Architecture, refactoring |
| james-bach.md | QA Analyst | Testing strategy, quality |

---

## Factory Mode Configuration

This project uses **Factory Mode** with the `pipeline` skill managing the build phase.

### Autonomy Level: **Balanced**

- Slices are processed sequentially
- Full team review before each push
- Human reviews merged PRs in batch (Phase 3)
- Quality gates enforce standards

### Quality Gates

| Gate | Threshold | Action on Failure |
|------|-----------|-------------------|
| Tests | 100% pass | Rework (max 3 cycles) |
| Review | No blocking issues | Address feedback |
| Mutation | 80% kill rate | Add tests |
| CI | Green build | Fix build |
| Accessibility | WCAG AA | Fix violations |

---

## Slice Queue (Priority Order)

1. **Slice 1**: Walking Skeleton — Minimal playable game
2. **Slice 2**: Complete Rules — All piece movements, checkmate
3. **Slice 3**: AI Basic — Minimax + Alpha-Beta
4. **Slice 4**: Skin System — Theme switching
5. **Slice 5**: Audio System — Sound effects
6. **Slice 6**: AI Enhanced — Opening book, better evaluation
7. **Slice 7**: Game Modes — PvP, PvAI, AI vs AI, undo/redo

---

## Project References

The pipeline will read these for context:

- **Architecture**: `docs/ARCHITECTURE.md`
- **Glossary**: `docs/glossary.md`
- **Project Constraints**: `PROJECT.md`
- **Team Conventions**: `AGENTS.md`

---

## Coordinator Role by Phase

### Phase 1: Understand + Decide (ACTIVE)

**Your Responsibilities**:
- Facilitate team formation session
- Guide discussion on the 10 standard topics
- Record decisions in AGENTS.md and docs/ARCHITECTURE.md
- Ensure human participates as tie-breaker
- Configure Factory Mode settings

**Exit Criteria**:
- All 10 topics discussed and documented
- Factory config validated
- Human consents to proceed

---

### Phase 1.5: Factory Configuration (ACTIVE)

**Your Responsibilities**:
- Guide team through `.factory/config.yaml` options
- Explain autonomy levels (conservative/balanced/autonomous)
- Validate configuration consistency
- Record decision using Robert's Rules

---

### Phase 2: Build (INACTIVE)

**Pipeline Takes Over**:
- You do NOT manage handoffs
- You do NOT spawn TDD pairs
- You do NOT facilitate reviews
- Pipeline handles all operational tasks

**Your State**: Dormant — wait for pipeline completion signal

---

### Phase 3: Review (ACTIVE)

**Your Responsibilities**:
- Receive pipeline summary report
- Present audit trail to human
- Relay human feedback to team
- Facilitate retrospective
- Record retrospective outputs

---

## Handoff Protocol

### To Pipeline (Phase 1 → Phase 2)

Provide:
1. Slice queue (ordered, with acceptance criteria)
2. Factory config path (`.factory/config.yaml`)
3. Team roster (profile paths)
4. Decision context (ARCHITECTURE.md, glossary.md)

### From Pipeline (Phase 2 → Phase 3)

Receive:
1. Summary report (slices completed, rework cycles)
2. Pending escalations (if any)
3. Audit trail location (`.factory/audit-trail/`)

---

## Escalation Handling

If pipeline escalates a slice:
1. Read escalation context from audit trail
2. Reactivate team for that slice
3. Facilitate diagnosis using Robert's Rules
4. Resolve issue or adjust scope
5. Hand back to pipeline or continue supervised

---

## Communication Rules

Follow `agent-coordination` skill:
- One message then wait
- Idle notifications are heartbeats (do not act)
- No polling loops
- Never fabricate agent responses
- Sequential spawning with acknowledgment

---

## Files to Create (Phase 1)

- [x] `.team/*.md` — Team profiles (DONE)
- [ ] `.team/coordinator-instructions.md` — This file (DONE)
- [ ] `AGENTS.md` — Team conventions (Formation Session output)
- [ ] `PROJECT.md` — Project constraints (DONE)
- [ ] `docs/ARCHITECTURE.md` — Architecture decisions (Formation Session output)
- [ ] `docs/glossary.md` — Domain terminology (Formation Session output)
- [ ] `docs/deferred-items.md` — Deferred items tracker
- [ ] `docs/future-ideas.md` — Parking lot
- [ ] `.factory/config.yaml` — Factory configuration

---

## Next Action

**Begin Formation Session** — Activate the full team and discuss Topic 1:

> "How do we decide what to build?"

Spawn team members sequentially, present each topic, facilitate discussion using Robert's Rules, and record outputs to the appropriate files.

---

*Coordinator Instructions Version: 1.0*  
*Created: 2026-03-23*
