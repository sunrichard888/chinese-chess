# PROJECT.md — Project Owner Constraints

**Project**: Chinese Chess (中国象棋)  
**Version**: 1.0  
**Last Updated**: 2026-03-23

---

## Product Vision

Create an accessible yet deep Chinese Chess experience that serves both beginners learning the game and experienced players seeking a challenging AI opponent, with beautiful visuals and immersive audio.

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React 18 + TypeScript | Component architecture, type safety |
| **Styling** | Tailwind CSS | Rapid UI development, theming |
| **State** | Zustand | Lightweight, simple API |
| **Build** | Vite | Fast HMR, optimized builds |
| **Testing** | Vitest + Playwright | Fast unit tests, reliable E2E |
| **AI** | WebAssembly + TypeScript | Performance for search algorithms |
| **Audio** | Howler.js | Cross-browser audio |
| **Deployment** | Vercel | Zero-config deployment |

---

## Scope (MoSCoW)

### Must Have (MVP)

- [x] Complete 8x10 board rendering
- [x] All 7 piece types with correct movements
- [x] Rule validation (check, checkmate, stalemate)
- [x] Basic AI opponent (Minimax + Alpha-Beta)
- [x] 3 difficulty levels
- [x] Turn-based gameplay (red moves first)
- [x] Game over detection and display
- [x] Responsive design (desktop + mobile)

### Should Have

- [ ] 5 difficulty levels (Beginner to Expert)
- [ ] Skin system (2+ board skins, 2+ piece skins)
- [ ] Sound effects (move, capture, check, game over)
- [ ] Move history display
- [ ] Undo/redo (unlimited)
- [ ] Game save/load (local storage)
- [ ] AI move hints (for learners)
- [ ] Takeback request (vs AI)

### Could Have

- [ ] Opening book (common openings)
- [ ] Endgame tablebases (basic endgames)
- [ ] Puzzle mode (tactical challenges)
- [ ] AI analysis mode (post-game review)
- [ ] Tutorial system (piece movements, rules)
- [ ] Custom skin upload
- [ ] Sound theme selection
- [ ] Move animation speed control

### Out of Scope (v1.0)

- [ ] Online multiplayer
- [ ] User accounts
- [ ] Leaderboards
- [ ] Social features (friends, chat)
- [ ] Mobile native apps (iOS/Android)
- [ ] Live tournaments
- [ ] Video streaming integration

---

## Development Mandates

### Code Quality

- **TDD Required**: All core logic must be test-driven
- **Coverage**: >90% for core, >70% overall
- **Review**: All code requires peer review before merge
- **Refactor**: Every commit includes refactoring step

### Architecture

- **Layered**: Clear separation (Presentation → Application → Domain → Infrastructure)
- **Pure Domain**: Domain layer has no external dependencies
- **Immutable State**: Game state updates are immutable
- **AI Isolation**: AI runs in Web Worker (non-blocking)

### User Experience

- **Performance**: 60fps board rendering
- **Load Time**: < 3s initial load
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsive**: Works on 320px+ screens

### AI Behavior

- **Response Time**: < 5s for any difficulty level
- **Strength Progression**: Clear skill difference between levels
- **No Illegal Moves**: AI never makes invalid moves
- **Human-Like**: Lower levels make believable mistakes

---

## Development Environment

### Prerequisites

```bash
# Node.js 18+ required
node --version  # >= 18.0.0

# Package manager
npm --version   # >= 9.0.0 (or pnpm, yarn)
```

### Setup

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Run tests
npm test

# Build production
npm run build

# E2E tests
npm run test:e2e
```

### Repository Conventions

- **Branch**: `main` for production, feature branches for work
- **Commits**: Atomic, descriptive messages
- **PRs**: Small, focused changes with clear description

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Engagement** | Avg session > 10 min | Analytics |
| **Retention** | 40% return within 7 days | Analytics |
| **Performance** | Lighthouse score > 90 | Lighthouse CI |
| **Accessibility** | 0 critical violations | axe-core |
| **Bug Rate** | < 5 bugs per slice | Bug tracker |
| **Test Coverage** | > 90% core, > 70% overall | Vitest |
| **AI Strength** | Expert beats 80% of test players | User testing |

---

## Constraints

### Technical

- Must run in modern browsers (Chrome, Firefox, Safari, Edge)
- No server-side components (static hosting only)
- AI must run client-side (no API calls)
- Maximum bundle size: 500KB (gzipped)

### Business

- v1.0 launch in 8-10 weeks
- Team capacity: 6 AI agents + human oversight
- Budget: $0 (open source, free hosting)

### Legal

- Use CC0 or MIT licensed assets only
- No copyrighted piece designs without permission
- Attribute all third-party libraries

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI too weak for advanced players | High | Medium | Plan NNUE upgrade for v2.0 |
| Performance issues on mobile | High | Medium | Early performance testing |
| Rule bugs in edge cases | High | Low | Extensive testing, exploratory sessions |
| Skin system too complex | Medium | Medium | Start simple, iterate |
| Scope creep | High | High | Strict MoSCoW prioritization |

---

## Stakeholders

| Role | Name | Responsibility |
|------|------|----------------|
| Product Owner | (Human) | Final decisions, tie-breaker |
| Coordinator | AI | Facilitate team, manage process |
| Development Team | 5 AI agents | Implementation |

---

*This document is a living artifact. Update as the project evolves.*
