# Slice 2: Complete Rules - Progress Dashboard

**Status**: 🟡 In Progress (8% complete)  
**Started**: 2026-03-23  
**Estimated Completion**: 2026-03-27  

---

## Task Completion Status

| ID | Task | Status | TDD Cycles | Driver | Reviewers |
|----|------|--------|------------|--------|-----------|
| 2.1 | 实现马的走法生成 | 🟡 In Progress | 1/4 | Kent | Martin, Chess AI |
| 2.2 | 实现炮的走法生成 | ⏳ Pending | 0/4 | - | - |
| 2.3 | 实现士的走法生成 | ⏳ Pending | 0/2 | - | - |
| 2.4 | 实现象的走法生成 | ⏳ Pending | 0/4 | - | - |
| 2.5 | 实现将/帅的走法 | ⏳ Pending | 0/3 | - | - |
| 2.6 | 实现兵的走法生成 | ⏳ Pending | 0/3 | - | - |
| 2.7 | 实现完整将军检测 | ⏳ Pending | 0/4 | - | - |
| 2.8 | 实现合法移动过滤 | ⏳ Pending | 0/3 | - | - |
| 2.9 | 实现将死检测 | ⏳ Pending | 0/3 | - | - |
| 2.10 | 实现和棋检测 | ⏳ Pending | 0/2 | - | - |
| 2.11 | 编写所有棋子走法测试 | ⏳ Pending | 0/3 | - | - |
| 2.12 | 编写将军/将死测试 | ⏳ Pending | 0/2 | - | - |
| 2.13 | 集成测试和 E2E 测试 | ⏳ Pending | 0/2 | - | - |
| 2.14 | 代码审查和修复 | ⏳ Pending | 0/1 | - | - |

---

## Current TDD Cycle

**Cycle**: 2.1.1  
**Task**: 2.1 (马的走法)  
**Phase**: RED ✅ Complete  
**Next**: GREEN (Implementation)

---

## Quality Metrics (from Slice 1)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Test Coverage (Core) | >90% | 95% | ✅ Carry over |
| Test Coverage (Overall) | >70% | 81% | ✅ Carry over |
| Blocking Issues | 0 | 0 | ✅ |
| Action Items from Retro 1 | 6 | 0 complete | 🟡 6 pending |

---

## Action Items Status (from Retro 1)

| ID | Item | Owner | Status | Notes |
|----|------|-------|--------|-------|
| AI-1 | Domain expert reviews all move generation | Chess AI Expert | ✅ Active | Reviewing task 2.1 |
| AI-2 | Add 30-min TDD cycle limit | Kent Beck | ✅ Done | Added to AGENTS.md |
| AI-3 | Refactor board.ts (<300 lines) | Kent Beck | ⏳ Pending | Scheduled for Slice 2 mid |
| AI-4 | Optimize E2E tests (<30s) | James Bach | ⏳ Pending | After Slice 2 complete |
| AI-5 | Add drag support for pieces | Julie Zhuo | ⏳ Backlog | Moved to Slice 3 |
| AI-6 | Create color palette template | Julie Zhuo | ✅ Done | Template created |

---

## Upcoming TDD Cycles

### Task 2.1: 马的走法 (4 cycles remaining)
1. **Cycle 2.1.2**: GREEN - Implement basic L-shaped movement
2. **Cycle 2.1.3**: RED+GREEN - Hobbling leg detection (蹩马腿)
3. **Cycle 2.1.4**: REFACTOR - Extract helper functions

### Task 2.2: 炮的走法 (4 cycles)
1. **Cycle 2.2.1**: RED - Test for cannon movement
2. **Cycle 2.2.2**: RED - Test for cannon capture (requires screen)
3. **Cycle 2.2.3**: GREEN - Implement both modes
4. **Cycle 2.2.4**: REFACTOR - Extract line-scanning logic

---

## Blockers & Risks

| Risk | Impact | Probability | Mitigation | Status |
|------|--------|-------------|------------|--------|
| Complex rule interactions | High | Medium | Domain expert review all moves | ✅ Active |
| Task dependencies (2.7-2.10) | High | High | Daily sync on critical path | 🟡 Monitoring |
| Test coverage gaps | Medium | Medium | Coverage reports per cycle | ✅ Active |
| Performance with full rules | Medium | Low | Profile after each task | ✅ Active |

---

## Architecture Decisions (Slice 2)

### Decision 2.1: Move Generator Pattern

**Proposed by**: Martin Fowler  
**Status**: ✅ Approved

```typescript
// Strategy pattern for move generation
interface MoveGenerator {
  getMoves(board: Board, position: Position): Position[];
}

class HorseMoveGenerator implements MoveGenerator {
  getMoves(board: Board, position: Position): Position[] {
    // L-shaped movement with hobbling leg detection
  }
}

class CannonMoveGenerator implements MoveGenerator {
  getMoves(board: Board, position: Position): Position[] {
    // Line movement + capture with screen
  }
}

// Factory for getting the right generator
function getMoveGenerator(pieceType: PieceType): MoveGenerator {
  // Return appropriate generator
}
```

---

## Next Action

**Driver**: Kent Beck  
**Task**: Continue Task 2.1 (马的走法)  
**Cycle**: 2.1.2 (GREEN phase - Implement L-shaped movement)

---

*Last Updated: 2026-03-23*
