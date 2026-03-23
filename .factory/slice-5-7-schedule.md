# Slice 5-7 Execution Schedule

**严格按照正确 Factory Mode 流程执行**

---

## 📅 执行时间表

### Slice 5: Audio System (3 天)

```
Day 1:
├─ 09:00 - Slice 5 就绪评审 (全员投票)
├─ 10:00 - Task 5.1: 音频管理器核心 (TDD 3 cycles)
│          └─ 每个 cycle 实际运行测试
├─ 14:00 - Task 5.2: 落子音效实现 (TDD 3 cycles)
│          └─ 每个 cycle 实际运行测试
└─ 17:00 - 日常站会 + 代码提交

Day 2:
├─ 09:00 - Task 5.3: 将军音效实现 (TDD 2 cycles)
├─ 11:00 - Task 5.4: 胜负音效实现 (TDD 2 cycles)
├─ 14:00 - Task 5.5: 音量控制 UI (TDD 3 cycles)
└─ 17:00 - 日常站会 + 代码提交

Day 3:
├─ 09:00 - Task 5.6: 音效主题系统 (TDD 3 cycles)
├─ 11:00 - Task 5.7: 音效持久化 (TDD 2 cycles)
├─ 14:00 - Task 5.8: 音频测试 (TDD 2 cycles)
├─ 16:00 - Task 5.9: 代码评审 (实际运行工具)
├─ 17:00 - ⭐ 质量门禁 (./scripts/quality-gates.sh)
│          └─ 必须通过才能继续
└─ 18:00 - Slice 5 回顾会议 + 行动项

完成条件:
✅ 所有 TDD 循环实际运行测试
✅ 质量门禁 100% 通过
✅ CI/CD 推送并运行
✅ 回顾会议完成
```

---

### Slice 6: AI Enhanced (5-6 天)

```
Day 4-5: Task 6.1-6.3 (AI 优化核心)
Day 6-7: Task 6.4-6.6 (性能优化)
Day 8: Task 6.7-6.8 (测试 + 评审)
Day 9: ⭐ 质量门禁 + 回顾会议

关键任务:
- 6.1 置换表实现 (TDD 5 cycles)
- 6.2 Web Worker 隔离 (TDD 5 cycles)
- 6.3 开局库扩展 (TDD 5 cycles)
- 6.4 终局表基础 (TDD 5 cycles)
- 6.5 AI 评估可视化 (TDD 3 cycles)
- 6.6 性能优化 (TDD 5 cycles)
- 6.7 性能测试 (TDD 2 cycles)
- 6.8 代码评审 (TDD 1 cycle)

完成条件:
✅ 置换表实际运行测试
✅ Web Worker 实际运行
✅ 性能提升可测量
✅ 质量门禁通过
✅ CI/CD 通过
```

---

### Slice 7: Game Modes (4-5 天)

```
Day 10-11: Task 7.1-7.4 (游戏模式)
Day 12-13: Task 7.5-7.7 (额外功能)
Day 14: Task 7.8-7.9 (测试 + 评审)
Day 15: ⭐ 质量门禁 + 回顾会议 + 项目收尾

关键任务:
- 7.1 悔棋功能 (TDD 3 cycles)
- 7.2 保存/加载 (TDD 4 cycles)
- 7.3 AI vs AI 观战 (TDD 4 cycles)
- 7.4 游戏模式选择 UI (TDD 3 cycles)
- 7.5 完整游戏流 E2E (TDD 3 cycles)
- 7.6 性能回归测试 (TDD 2 cycles)
- 7.7 用户文档 (TDD 1 cycle)
- 7.8 代码评审 (TDD 1 cycle)
- 7.9 最终质量门禁 (TDD 1 cycle)

完成条件:
✅ 所有游戏模式可玩
✅ 保存/加载实际工作
✅ E2E 测试通过
✅ 质量门禁通过
✅ CI/CD 通过
✅ 项目可部署
```

---

## 🎯 关键里程碑

| Milestone | Date | Deliverables |
|-----------|------|--------------|
| **Slice 5 Complete** | Day 3 | 音效系统完整 |
| **Slice 6 Complete** | Day 9 | AI 优化完整 |
| **Slice 7 Complete** | Day 15 | 所有功能完整 |
| **Production Ready** | Day 15 | 可部署版本 |

---

## ⚠️ 严格执行规则

### 每个 Slice 必须:

1. ✅ **就绪评审** - 全员投票 4/6 同意
2. ✅ **TDD 循环** - 实际运行测试，不能仅文档化
3. ✅ **代码评审** - 实际运行 ESLint/Prettier
4. ✅ **质量门禁** - Slice 完成后立即运行
5. ✅ **CI/CD** - 推送到 GitHub，运行 Actions
6. ✅ **回顾会议** - 创建行动项并跟踪

### 禁止行为:

❌ TDD 循环仅文档化，不实际运行测试  
❌ 质量门禁累积到最后执行  
❌ CI/CD 仅配置不运行  
❌ 回顾行动项不跟踪  
❌ 质量门禁不通过就继续下一个 Slice  

---

## 📊 进度追踪

### 每日更新

```markdown
## Day X - YYYY-MM-DD

### Completed
- [ ] Task X.X (TDD N cycles) - 实际运行测试 ✅
- [ ] 质量门禁 - 通过 ✅
- [ ] CI/CD - 通过 ✅

### Issues
- [问题描述]

### Next
- [明日计划]
```

### Slice 完成检查清单

```markdown
## Slice N Complete ✅

- [ ] 所有 TDD 循环实际运行测试
- [ ] 所有任务完成
- [ ] 质量门禁通过 (./scripts/quality-gates.sh)
- [ ] CI/CD 通过 (GitHub Actions)
- [ ] 代码评审完成
- [ ] 回顾会议完成
- [ ] 行动项创建并跟踪
- [ ] Git tag 创建
```

---

**执行状态**: ⏳ READY TO START  
**开始日期**: 2026-03-23  
**预计完成**: 2026-04-06
