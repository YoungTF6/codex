## Context

`pages/support/person/personScoreStatistics.html` 为技术支持入口打开的「人员学分详情」弹层页。当前实现：

1. 表格：`GET projectScoreStatistis/getPeopleScoreStatistics`，`parseData` 中用 `res.data.scoreText` 填充 `#titlePassInfo`。
2. 达标：`POST ps/all/person/support`（`certId` + `cmeYear`），仅解析 `passStandardVoList` 中 `kind>=3` 项生成 `passMsg`，**未使用**响应中的 `scoreTotalList`。

参考实现 `PassForPerson-Default.js` 通过 `renderScoreTotal` / `renderPassStandard` 分别消费 `scoreTotalList` 与 `passStandardVoList`。support 接口返回结构与 `ps/all/person` 一致（另含 `checkStatus`、`addTime`），见 `pages/support/person/ps-all-person-support.json`。

页面 URL 已携带 `certId`、`cmeYear`，满足 support 接口入参要求。

## Goals / Non-Goals

**Goals:**

- `#titlePassInfo` 学分汇总文案由 support 接口的 `scoreTotalList` 前端拼装，口径与 `renderScoreTotal` 一致。
- 达标文案由 `passStandardVoList` 解析，口径与 `renderPassStandard`（Default 版 `|` 分隔）一致。
- **保持** `ps/all/person/support` 接口与 `{ certId, cmeYear }` 入参不变。

**Non-Goals:**

- 不切换至 `ps/all/person`。
- 不改后端、不改表格接口、不新增 UI 组件块（仍用 `#titlePassInfo` 文本区）。
- 本变更不展示 `checkStatus` / `addTime`（support 接口额外字段，留待后续需求）。

## Decisions

### D1：接口继续选用 `ps/all/person/support`

**选择**：`POST huayi_projectscore_url + 'ps/all/person/support'`

**理由**：技术支持场景已通过网关白名单；以 `certId` 查人，无需 `comPersonId` / `userId` 登录态；与现有页面调用方式一致。

**请求体**：

```json
{
  "certId": "360782198804223316",
  "cmeYear": "2026"
}
```

**响应示例**（见 `pages/support/person/ps-all-person-support.json`）：

```json
{
  "success": true,
  "data": {
    "personName": "范存建",
    "certId": "360782198804223316",
    "checkStatus": 1,
    "addTime": "2015-10-21 10:52:51",
    "passStandardVoList": [ "... kind=3: standardMsg=达标|" ],
    "scoreTotalList": [
      { "scoreType": 2, "kind": 2, "score": 53.0, "period": 159.0 },
      { "scoreType": 2, "kind": 0, "listOrder": 1, "scoreKindName": "项目学分", "score": 53.0 },
      { "scoreType": 1, "kind": 1, "score": 53.0, "period": 159.0 },
      { "scoreType": 1, "kind": 0, "listOrder": 1, "scoreKindName": "项目学分", "score": 53.0 }
    ]
  }
}
```

**错误语义**：`success=false` 或「未查到该人员信息」→ 汇总文案为空，达标显示「未知」。

### D2：`scoreTotalList` → 页头文案格式

**选择**：新增 `buildScoreTotalText(scoreTotalList)`，复用 `renderScoreTotal` 的分组规则，输出紧凑 HTML 文本：

```
全部学分：总学分 {totalScore}，总学时 {totalPeriod}，{label1} {score1}，…
计入达标学分：总学分 {totalScore_y}，总学时 {totalPeriod_y}，{label1} {score1_y}，…
```

**分组规则**（与 PassForPerson-Default.js 一致）：

| scoreType | kind | 含义 |
|-----------|------|------|
| 1 | 1 | 全部学分合计 |
| 1 | 0 | 全部分类明细（listOrder 1/2/3 + scoreKindName） |
| 2 | 2 | 计入达标合计 |
| 2 | 0 | 计入达标分类明细 |

### D3：`passStandardVoList` → 达标文案

**选择**：对齐 Default 版 `renderPassStandard`：

- 取 `kind >= 3` 的首项 `standardMsg`，按 `|` 分割：`psr = parts[0]`，`reason = parts[1]`。
- `psr === '不达标'` → `达标结果: 不达标 &nbsp; 不达标原因: {reason}`
- `psr === '达标'` → `达标结果: 达标`
- `psr === '达标标准未做要求'` → `达标结果: 达标标准未做要求`
- 无 k3 项 → `达标结果: 未知`

替换当前 `startsWith('不达标')` 等字符串前缀判断。

### D4：`#titlePassInfo` 更新时机

**选择**：模块级变量 `scoreTotalText`、`passMsg`、`recordCount`，`updateTitlePassInfo()` 合并渲染：

```
#titlePassInfo.innerHTML = (recordCount != null ? '共' + recordCount + '条记录<br>' : '') + scoreTotalText + '<br>' + passMsg
```

表格 `parseData` 仅设置 `recordCount`，不再读 `scoreText`。

### D5：前端改动点 ↔ 后端对应

| 前端 | 后端 |
|------|------|
| 保持 `ps/all/person/support` 调用，补充消费 `scoreTotalList` | `CmePs4HstsController.allForSupport` → `cmePs4HstsService.all` |
| `buildScoreTotalText` | `PassDetailVO.scoreTotalList`（已有） |
| `renderPassStandard` 逻辑调整 | `PassDetailVO.passStandardVoList`（已有） |
| 表格 `getPeopleScoreStatistics` | 无变更 |

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 页头文案与旧 `scoreText` 字面不同 | 以 PassForPerson 为准，用 `ps-all-person-support.json` 验收 |
| 异步竞态导致条数与汇总不同步 | `updateTitlePassInfo` 统一合并 |

## Migration Plan

1. 修改 `personScoreStatistics.html` JS 逻辑。
2. 本地用 `ps-all-person-support.json` 验证文案拼装。
3. 联调：从 `personInfoManage.html` 打开学分详情，切换年度，核对 `#titlePassInfo`。
4. 回滚：git revert 单文件即可。

## Open Questions

- 无（接口路径与入参已确认保持 support 不变）。
