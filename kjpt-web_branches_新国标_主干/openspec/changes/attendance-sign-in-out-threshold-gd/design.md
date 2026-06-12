## Context

### 现状

- 广东套已公布项目、院内活动考勤使用 SignInOut 页面，子表每行一个考勤批次，操作列含「签到二维码」「签退二维码」。
- 点击前调用 `validateCurrentTimeInBatchRange`：要求 `now ∈ [startDate, endDate]`（见 `AttendanceProjChooseSignInOut.html` 约 880–903 行）。
- 学习时长在 `CmeProjAttendanceResultServiceImpl.fillMeetingDuration` 中按 `comPersonId + batchId` 分组，取 `signType=1` 最早签到、`signType=2` 最晚签退后求差，本次**不改**。
- 系统参数惯例：广东套学分子分类级配置走 `sjwh` 的 `CmeCommonConfig` + `ConfigDictEnum`（如 `value_batch_count_when_proj_attend`）。

### 约束

- **代码分支**：前端 `kjpt-web_branches/新国标_20260428`，后端 `kjpt_cloud_branches/新国标_20260428`；实现与联调不得提交到其他分支（如 `新国标_主干`）。
- 套别：仅广东（`GUANGDONG` / `getCmeStandardKindId()`）。
- 角色：单位、科室（菜单入口已存在，无新菜单）。
- 不判断批次间签退/签到是否重叠。

## Goals / Non-Goals

**Goals:**

- 按学分子分类配置 `signInEarlyMinutes`、`signOutLateMinutes`（非负整数，默认 0）。
- 签到码：`now >= startDate - signInEarlyMinutes` 且 `now <= endDate`。
- 签退码：`now >= startDate` 且 `now <= endDate + signOutLateMinutes`。
- 前后端一致校验；学习时长逻辑不变。

**Non-Goals:**

- 不改扫码登记后写入的 `posTime` 规则（仍记录实际扫码时间）。
- 不改非广东套、非 SignInOut 考勤页。
- 不在本设计内新增复杂的批次重叠检测。

## Decisions

### D1：阈值存储 — `CmeCommonConfig` + 两个配置字典

**选择**：在 `ConfigDictEnum` 新增两项（示例编码，实施时可与 DBA/产品确认）：

| 字典编码 | 含义 | configValue |
|----------|------|-------------|
| `value_attend_sign_in_early_minutes` | 签到二维码可提前分钟数 | 非负整数，按 `scoreLevelId` 分行配置 |
| `value_attend_sign_out_late_minutes` | 签退二维码可推迟分钟数 | 非负整数，按 `scoreLevelId` 分行配置 |

**理由**：与现有「按学分子分类 + 套别」配置模式一致。  
**维护入口（已确认）**：复用现有技术支持后台「公共配置」页（`CmeCommonConfig` 通用维护能力），仅新增上述两条配置字典项，**不**单独开发广东考勤阈值配置页。  
**备选**：项目级自定义阈值 — 拒绝；独立配置页 — 拒绝。

### D2：阈值读取 — 考勤页加载时缓存

**选择**：进入 `AttendanceProjChooseSignInOut` / `AttendanceGroupChooseSignInOut` 时，根据当前项目/活动的 `scoreLevel`（页面已有 `scoreLevel` 变量）调用配置接口一次，缓存至 `layui.data` 或模块级变量；切换项目时重新加载。

**可选增强**：`projectscore` 提供 `GET attendThreshold?scoreLevelId=` 聚合接口，内部调 `sjwh` Feign，减少前端跨服务次数。

### D3：前端校验函数拆分

**选择**：将 `validateCurrentTimeInBatchRange(projAttendBatch)` 拆为：

- `validateSignInQrOpenWindow(batch, signInEarlyMinutes)`
- `validateSignOutQrOpenWindow(batch, signOutLateMinutes)`

`signInQrCode` / `signOutQrCode` 事件分别调用；提示文案区分「未到签到开放时间」「已过签退码关闭时间」等。

分钟换算：`windowStart = startMillis - signInEarly * 60000`，比较使用毫秒，与现有 `parseAttendTimeToMillis` 一致。

### D4：后端兜底校验 — 开码与扫码登记共用同一窗口

**选择**：抽取公共组件 `AttendQrWindowValidator`（命名可调整），统一计算签到/签退允许时间窗；以下入口 **MUST** 调用同一实现：

| 场景 | 入口（示例） |
|------|----------------|
| 打开签到/签退二维码 | `setAttendanceInfoForProj` 及院内活动等价方法 |
| 学员扫码登记 | `ProjAttendance` / `GroupAttendance`（广东 SignInOut，`projectType` 11/12/21/22）登记校验 |

窗口规则与 D3 一致；失败返回明确业务错误（如 `ATTEND_QR_WINDOW_NOT_OPEN` 或登记侧等价文案）。

**已确认**：打开签退码与学员扫码签退的允许时间窗 **完全一致**；签到同理。禁止「码已打开但扫码被拒」或反之。

**理由**：防止绕过前端；保证管理员开码与学员扫码体验一致。

### D5：学习时长 — 无代码变更

**选择**：不修改 `fillMeetingDuration`；spec 中声明为约束性需求，回归测试验证即可。

### D6：配置默认值

未配置、`configValue` 为空或非数字：视为 `0`。解析使用 `Number.parseInt`，负数按 `0` 处理并打 warn 日志。

## 接口契约

### 读取阈值（复用 sjwh）

**请求**（既有 `getConfigByKind` 形态，示意）：

```json
{
  "cmeStandardKindId": "<广东套ID>",
  "configDictCode": "value_attend_sign_in_early_minutes",
  "scoreLevelId": "<学分子分类ID>"
}
```

**响应**：

```json
{
  "status": 200,
  "data": {
    "configValue": "60"
  }
}
```

签退推迟字典同理，`configDictCode` 为 `value_attend_sign_out_late_minutes`。

### 聚合查询（可选，projectscore 新增）

`GET /attendance/threshold?scoreLevelId={id}`

**响应**：

```json
{
  "status": 200,
  "data": {
    "signInEarlyMinutes": 60,
    "signOutLateMinutes": 60
  }
}
```

缺省字段视为 `0`。

### setAttendanceInfoForProj 增强

失败示例：

```json
{
  "status": 500,
  "msg": "当前时间不在允许打开签到二维码的时间范围内",
  "code": "ATTEND_QR_WINDOW_NOT_OPEN"
}
```

## 前端 / 后端对应关系

| 前端 | 后端 |
|------|------|
| 加载阈值 | sjwh `CmeCommonConfig` 或 projectscore 聚合 API |
| `signInQrCode` 点击校验 | `AttendQrWindowValidator` ← `setAttendanceInfoForProj` |
| `signOutQrCode` 点击校验 | 同上 |
| 学员扫码（APP/微信等） | 同上 ← `ProjAttendance` / `GroupAttendance` 登记链路 |
| 无改动 | `fillMeetingDuration` 不变 |

## 数据迁移

1. 在配置字典表插入两条字典定义（广东套可用）。
2. 技术支持在既有「公共配置」页按学分子分类录入分钟数；未录入则行为与现网一致。
3. **回滚**：删除或清零配置值；还原前端/后端校验函数。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 配置错误导致窗口过长 | 后台说明 + 可选最大值校验（如 ≤ 180） |
| 前后端阈值不一致 | 同一套工具类/服务方法计算窗口 |
| 科室/单位入口遗漏 | tasks 中逐项列页面联调 |

## Resolved Decisions（产品已确认）

| 议题 | 结论 |
|------|------|
| 后台配置维护 | **复用**现有「公共配置」页（`CmeCommonConfig`），仅增字典项，不新建专用页 |
| 签退/签到时间窗 | **打开二维码**与**学员扫码登记**使用同一套窗口规则，共用 `AttendQrWindowValidator` |
