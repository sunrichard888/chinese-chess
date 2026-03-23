# Architecture Decision Records (ADRs)

**Project**: Chinese Chess (中国象棋)  
**Created**: 2026-03-23  
**Status**: Draft (to be finalized in Formation Session)

---

## Architectural Principles

**Decision 8.1**: Approved 2026-03-23 (6/6 consent + Product Owner)

| Principle | Description | Violation Example |
|-----------|-------------|-------------------|
| **Layered Architecture** | Clear separation of concerns | UI directly calls storage |
| **Pure Domain** | Domain layer has no external dependencies | Domain imports React |
| **Immutable State** | All state updates produce new objects | Direct state mutation |
| **AI Isolation** | AI runs in Web Worker (non-blocking) | AI blocks main thread |
| **Progressive Enhancement** | Core works without advanced features | First screen waits for AI |
| **Performance First** | 60fps render, <5s AI response | Lag, long waits |
| **Accessibility Built-In** | Not an afterthought | Adding aria labels last |

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ BoardView   │  │ Controls    │  │ SkinThemeProvider   │  │
│  │ (Canvas)    │  │ (Buttons)   │  │ (Context)           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                   Application Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ GameState   │  │ MoveHandler │  │ GameModeManager     │  │
│  │ (Zustand)   │  │ (Commands)  │  │ (PvP, PvAI, AIvAI)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     Domain Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Board       │  │ Rules       │  │ AIEngine            │  │
│  │ (Entity)    │  │ (Service)   │  │ (Interface)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Storage     │  │ Audio       │  │ UCIAdapter          │  │
│  │ (LocalStorage)│ │ (Howler)   │  │ (Web Worker)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Strategy

*(To be finalized in Formation Session)*

### Draft: Static Hosting

- **Platform**: Vercel
- **Build**: `npm run build`
- **Output**: Static files (SPA)
- **CDN**: Vercel Edge Network
- **AI**: Client-side only (no server)

---

## State Management

*(To be finalized in Formation Session)*

### Draft: Zustand

```typescript
// Game state shape
interface GameState {
  board: Board;
  status: GameStatus;
  turn: Color;
  moveHistory: Move[];
  settings: GameSettings;
  
  // Actions
  makeMove: (move: Move) => void;
  undo: () => void;
  reset: () => void;
  setDifficulty: (level: number) => void;
}
```

---

## Testing Strategy

*(To be finalized in Formation Session)*

### Draft: Test Pyramid

```
        /\
       /  \      E2E (Playwright) — Critical user flows
      /----\     
     /      \    Integration — AI interface, storage
    /--------\   
   /          \  Unit (Vitest) — Domain logic, rules
  /------------\
```

---

## Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Initial Load | < 3s | Code splitting, lazy loading |
| Board Render | 60fps | Canvas, requestAnimationFrame |
| AI Response | < 5s | Web Worker, iterative deepening |
| Bundle Size | < 500KB | Tree shaking, compression |

---

## Security Considerations

- **Client-Side Only**: No server, minimal attack surface
- **No User Data**: Local storage only, no PII
- **Asset Validation**: Validate uploaded skins (future feature)
- **XSS Prevention**: Sanitize any user input

---

## ADR Template

*(For future decisions)*

```markdown
### ADR-NNN: [Title]

**Date**: YYYY-MM-DD  
**Status**: Proposed | Accepted | Rejected | Superseded  
**Deciders**: [Team members]  
**Technical Story**: [Link if applicable]

#### Context
What is the issue that we're seeing that is motivating this decision?

#### Decision
What is the change that we're proposing and/or doing?

#### Consequences
- What becomes easier or more difficult?
- What are the risks?
- How does this affect the team?
```

---

## Open Questions

*(To be resolved in Formation Session)*

1. State management: Zustand vs Redux vs Context?
2. Board rendering: Canvas vs SVG vs DOM?
3. AI engine: Pure TypeScript vs WebAssembly?
4. Audio: Howler.js vs Web Audio API?
5. Testing: Playwright vs Cypress for E2E?

---

*This document evolves during the Formation Session and as architectural decisions are made.*
