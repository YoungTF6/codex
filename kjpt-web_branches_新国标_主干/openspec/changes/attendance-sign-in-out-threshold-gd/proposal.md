## Why

广东套项目/活动采用「签到 + 签退」分时段考勤（见 `AttendanceProjChooseSignInOut.html`、`AttendanceGroupChooseSignInOut.html`）。当前打开签到/签退二维码时，前端 `validateCurrentTimeInBatchRange` 要求当前时间严格落在批次 `startDate`～`endDate` 内，无法按本省政策在批次开始前或结束后适度放宽操作窗口。需在**后台按学分子分类**配置可提前/可推迟的分钟数，且学习时长计算口径保持不变。

## What Changes

- 新增系统配置：按**学分子分类**分别维护「签到可提前分钟数」「签退可推迟分钟数」；未配置视为 `0`（与现网一致）。
- 打开签到二维码：当前时间须在 `[批次开始时间 − 签到提前分钟, 批次结束时间]` 内（签退二维码窗口见 spec）。
- 打开签退二维码：当前时间须在 `[批次开始时间, 批次结束时间 + 签退推迟分钟]` 内。
- **不**校验相邻考勤周期签退与签到时间是否重叠。
- **学习时长**：每个考勤周期仍按「该周期内最早签到时间」与「最晚签退时间」之差计算，逻辑不变。
- 仅**广东套**；角色：**单位、科室**；菜单：**已公布项目管理**（`CmeCmeProjList.html` / `CmeCmeProjListDept.html`）、**活动管理**（`CmeGroupproj.html`、`deptGroupproj.html` 等跳转至 SignInOut 考勤页）。
- **仅前端**在点击「签到/签退二维码」时做时间窗校验（读取公共配置阈值）；**本期后端不做**开码/扫码时间窗校验（后续可再补）。

## 业务目标

- 单位/科室管理员可在政策允许的时间窗内提前打开签到码、延后打开签退码（示例：阈值均为 60 分钟时，批次 09:00–12:00 可在 08:00 打开签到码、13:00 前打开签退码）。
- 配置由技术支持在既有后台「**公共配置**」页维护（复用 `CmeCommonConfig`，仅新增字典项，不新建专用配置页），业务侧只读使用。

## Non-goals

- 不调整学习时长、授分策略（`CmeProjAttendanceResultServiceImpl.fillMeetingDuration`）的计算公式。
- 不处理跨批次时间重叠、交叉考勤等既有规则（除非与本次窗口校验冲突的独立需求）。
- 不扩展至非广东套省份。
- 不在本次变更中改造考勤机（POS）刷卡逻辑。
- **本期不做**后端 `getAttendanceCode`、学员扫码登记链路的时间窗校验（非目标，避免与前端重复且本期不交付）。

## Capabilities

### New Capabilities

- `attendance-threshold-config`：按学分子分类维护签到提前/签退推迟阈值（后台 `CmeCommonConfig` + 配置字典）。
- `attendance-qr-open-window`：项目/活动签到签退二维码可打开时间窗口（前端 + projectscore 后端校验）。

### Modified Capabilities

- （无既有 openspec spec）

## 代码分支（实施范围）

本变更**前后端代码均提交在 `新国标_20260428` 分支**，不落在 `新国标_主干` 等业务分支：

| 端 | 仓库路径 |
|----|----------|
| 前端 | `kjpt-web_branches/新国标_20260428` |
| 后端 | `kjpt_cloud_branches/新国标_20260428`（含 `sjwh`、`projectscore` 等子模块） |

联调、提测、发布均按上述分支成对交付。

## Impact

| 范围 | 说明 |
|------|------|
| **前端（web）** | `kjpt-web_branches/新国标_20260428`：`AttendanceProjChooseSignInOut.html`、`AttendanceGroupChooseSignInOut.html` 等；抽取/复用阈值读取与窗口校验 |
| **后端（sjwh）** | `kjpt_cloud_branches/新国标_20260428`：`ConfigDictEnum`、配置字典；既有「公共配置」页按学分子分类维护（仅增字典项） |
| **后端（projectscore）** | 本期无考勤逻辑改动 |
| **契约** | fe-only：前端经 sjwh `getConfigByUnitFromRedis` 读阈值 |

### 接口清单（规划）

| 方法 | 路径（示例） | 请求 | 响应 | 说明 |
|------|----------------|------|------|------|
| POST | `sjwh/cmeCommonConfig/getConfigByKind`（既有，按字典名扩展） | `cmeStandardKindId`, `configDictCode`, `scoreLevelId?` | 配置值（分钟，非负整数） | 读取单条阈值 |
| POST | `sjwh/cmeCommonConfig/save`（既有） | 配置实体列表 | 成功/失败 | 后台维护阈值 |
| GET/POST | `projectscore/.../attendThreshold`（新增，可选） | `scoreLevelId` 或 `projId` | `{ signInEarlyMinutes, signOutLateMinutes }` | 考勤页批量加载，减少多次 sjwh 调用 |
| GET | `sjwh/.../cmeCommonConfig/getConfigByUnitFromRedis`（既有） | `unitId`、`scoreLevelId`、`configNames` | 含两项阈值字典 | 前端读配置 |

（本期无 projectscore 考勤接口契约变更。）

### 兼容策略

- 未配置或配置值为空/非法：按 `0` 处理，与现网「必须在批次起止时间内」一致。
- 配置字典新增项，不修改既有配置编码语义。
- 前端可先兼容接口未部署：阈值为 0 时行为不变。

### 风险与回滚

| 风险 | 缓解 / 回滚 |
|------|-------------|
| 仅前端校验可被绕过直接调开码接口 | 本期接受；后续若需加固再补后端校验 |
| 阈值过大导致与相邻批次重叠 | 需求明确不校验重叠；文档提示配置宜合理 |
| 非广东误开配置 | 字典与接口仅广东套 `cmeStandardKindId` 使用；代码侧 `GUANGDONG` 守卫 |
| 回滚 | 配置置 0 或下线字典项；还原校验函数为 `validateCurrentTimeInBatchRange` 原实现 |
