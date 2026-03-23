# Slice 5: Audio System - Execution Plan

**严格执行 Factory Mode 正确流程**

---

## 🏭 执行流程 (严格按顺序)

### Stage 1: 任务分解 ✅
- [x] 创建任务分解文档
- [ ] 团队评审任务分解

### Stage 2: 就绪评审 ⏳
- [ ] 全员投票 (4/6 同意)
- [ ] 记录评审意见

### Stage 3: TDD 循环执行 ⭐ (关键 - 实际运行测试)

**每个 TDD 循环必须**:
```bash
# 1. 写测试
# 编辑测试文件...

# 2. 运行测试 (必须失败)
npm test -- --run
# ❌ 预期：测试失败

# 3. 写实现代码
# 编辑源文件...

# 4. 运行测试 (必须通过)
npm test -- --run
# ✅ 预期：测试通过

# 5. 重构
# 优化代码...

# 6. 运行测试 (必须仍通过)
npm test -- --run
# ✅ 预期：测试仍通过

# 7. 记录 TDD 循环
# 创建 audit-trail/tdd-cycle-5.X.Y.md
```

### Stage 4: 代码评审 ⭐ (实际运行工具)

**每个任务完成后**:
```bash
# 1. 运行 ESLint
npm run lint

# 2. 运行 Prettier
npm run format:check

# 3. Reviewers 实际审查代码
# 4. 修复所有阻塞问题
# 5. 重审直到通过
```

### Stage 5: 质量门禁 ⭐ (本 Slice 完成后立即执行)

**Slice 5 完成后**:
```bash
# 立即运行质量门禁 (不能等到所有 Slice 完成!)
./scripts/quality-gates.sh

# 必须所有门禁通过才能继续 Slice 6
```

### Stage 6: 集成推送 ⭐

```bash
# 提交 Slice 5
git add .
git commit -m "Slice 5: Audio System complete - all gates passed"
git push

# 监控 GitHub Actions
# 必须 CI 通过才能继续
```

### Stage 7: 回顾会议 ⭐

```bash
# 1. 审计上次行动项 (Slice 4 的行动项)
# 2. 个人观察写入 .reviews/retro/slice-5-*.md
# 3. 团队讨论
# 4. 创建新行动项
# 5. 行动项必须在 Slice 6 前完成
```

---

## 📋 Slice 5 任务列表

| Task | TDD Cycles | 状态 | 质量门禁 |
|------|-----------|------|---------|
| 5.1 音频管理器核心 | 3 | ⏳ | ⏳ |
| 5.2 落子音效实现 | 3 | ⏳ | ⏳ |
| 5.3 将军音效实现 | 2 | ⏳ | ⏳ |
| 5.4 胜负音效实现 | 2 | ⏳ | ⏳ |
| 5.5 音量控制 UI | 3 | ⏳ | ⏳ |
| 5.6 音效主题系统 | 3 | ⏳ | ⏳ |
| 5.7 音效持久化 | 2 | ⏳ | ⏳ |
| 5.8 音频测试 | 2 | ⏳ | ⏳ |
| 5.9 代码评审 | 1 | ⏳ | ⏳ |

**完成条件**: 所有任务完成 + 质量门禁通过

---

## ⚠️ 严格执行规则

1. **TDD 循环必须实际运行测试** - 不能仅文档化
2. **每个任务后必须运行 lint/format** - 不能累积到最后
3. **Slice 完成后立即运行质量门禁** - 不能等到所有 Slice
4. **质量门禁不通过不能继续** - 必须修复所有问题
5. **必须推送和运行 CI/CD** - 不能仅本地执行
6. **回顾行动项必须跟踪** - 下次回顾首先审计

---

**执行状态**: ⏳ READY TO START
