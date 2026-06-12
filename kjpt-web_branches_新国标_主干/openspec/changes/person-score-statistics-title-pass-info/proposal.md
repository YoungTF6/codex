## Why

`personScoreStatistics.html`（技术支持-人员学分详情）页头 `#titlePassInfo` 当前混用两个数据源：`getPeopleScoreStatistics` 返回的 `scoreText` 与 `ps/all/person/support` 返回的达标信息（仅解析 `passStandardVoList`，未消费 `scoreTotalList`）。与「达标情况明细查询-个人」（`PassForPerson-Default.js`）展示口径不一致，学分汇总文案来源不统一。

## What Changes

- **继续**使用 `POST ps/all/person/support`（入参 `certId` + `cmeYear`），从同一响应中同时消费 `scoreTotalList` 与 `passStandardVoList`。
- 参照 `renderScoreTotal(scoreTotalList)` 逻辑，由 `scoreTotalList` 在前端拼装 `#titlePassInfo` 学分汇总文案，不再依赖表格接口 `scoreText`。
- 参照 `renderPassStandard(passStandardVoList)` 逻辑，统一达标结果解析（`kind>=3` 的 `standardMsg` 按 `|` 分隔判定达标/不达标/达标标准未做要求）。
- 表格明细仍走 `getPeopleScoreStatistics`，`parseData` 中仅展示记录条数，学分汇总与达标改由 `ps/all/person/support` 回调更新。
- 年度切换时同步刷新 `ps/all/person/support` 请求（随 `cmeYear` 变化）。

## 业务目标

- 技术支持人员查看学分详情时，页头达标结果与学分汇总与 PC 端个人达标明细页（PassForPerson）口径一致。
- 保持 support 场景既有白名单与 `certId` 查人方式不变。

## Non-goals

- 不切换至 `ps/all/person`（PC 端个人页接口）。
- 不改动 `getPeopleScoreStatistics` 后端实现及表格列定义。
- 不改动 `PassForPerson.html` / `PassForPerson-Default.js` 本体。

## Capabilities

### New Capabilities

- `person-score-statistics-title-pass-info`: 技术支持人员学分详情页 `#titlePassInfo` 文案的数据源与展示规则（基于 `ps/all/person/support` 的 `scoreTotalList` 与 `passStandardVoList`）。

### Modified Capabilities

- （无既有 spec）

## Impact

| 范围 | 说明 |
|------|------|
| **前端** | `pages/support/person/personScoreStatistics.html` |
| **后端** | 无改动（复用现有 `POST /projectscore/ps/all/person/support`） |
| **契约** | fe-only；消费既有 `PassDetailVO`（含 support 扩展字段 `checkStatus`、`addTime`），无新字段 |

### 接口清单（消费侧，无变更）

| 方法 | 路径 | 请求 | 响应 | 说明 |
|------|------|------|------|------|
| POST | `ps/all/person/support` | `{ certId, cmeYear }` | `PassDetailVO`（含 `passStandardVoList`、`scoreTotalList`、`checkStatus`、`addTime`） | 页头汇总与达标 |
| GET | `projectScoreStatistis/getPeopleScoreStatistics` | 既有查询参数 | 明细列表 + `recordsTotal` | 表格数据，不再用于 `scoreText` |

### 兼容策略

- 页面 URL 参数保持不变（`certId`、`cmeYear` 等）。
- 接口失败时 `#titlePassInfo` 降级为「共 N 条记录 + 达标结果: 未知」。

### 风险与回滚

| 风险 | 缓解 / 回滚 |
|------|-------------|
| 文案格式与旧 `scoreText` 不完全相同 | 以 PassForPerson `renderScoreTotal` 口径为准，属预期行为变更 |
| 年度切换 `cmeYear` 未同步 | 切换年度时重调 support 接口 |
| 回滚 | 恢复 `scoreText` 拼接、移除 `buildScoreTotalText` 即可 |
