## Context

### 现状

- 个人学分录入向导（`grant_score_singleproj.html` 等）已有佐证/学分证明上传：`chooseFileBtn` + `fileList` 表格，关联表 `cme_singleproj_score_mobile_photo` 存 `score_photo_url`。
- 提交走 `projectscore` 保存个人活动学分；审核在 `pages/mod/check/s1check.html`（个人活动学分审核），佐证列字段 `photo`，浙江套文案为「佐证材料」。
- 代码库内**尚无**佐证姓名 OCR 能力；需新增后端服务封装与 DB 标记字段。

### 约束

- 姓名比对：规范化后的**精确子串匹配**（见 D8）；不做别名/拼音/繁简。
- OCR/比对逻辑与学分保存主流程**解耦**，经 `cme_common_config` 开关挂载，**默认不启用**。
- 单位、科室、个人三种录入角色**共用**同一套前端模块与后端服务。
- 弹框最多 2 次；第 3 次不匹配静默提交并标异常。
- 审核驳回**不**向录入人发通知。
- 实施分支：`新国标_20260428`（web + cloud）。

## Goals / Non-Goals

**Goals:**

- 多格式（JPG/PNG/PDF）、多文件、25MB 前端校验与列表展示。
- 提交前 OCR 聚合所有佐证 URL，返回三态结果。
- 持久化「姓名核验异常」状态，审核列表可展示标红与叹号角标，审核通过清除。

**Non-Goals:**

- 别名/拼音/繁简匹配、商业云 OCR、批量历史 OCR、非个人学分录入入口（项目授分等）。

## Decisions

### D1：独立模块 + 配置开关（默认关）

**选择**：

- 后端：`EvidenceOcrFacade`（OCR + 姓名比对 + 三态）独立于 `CmeSingleprojScoreService` 保存逻辑；保存前由门面根据开关决定是否调用。
- 配置：`CmeCommonConfig` / `ConfigDictEnum` 字典 **`fun_singleproj_evidence_ocr_verify`**，`configValue`：`0` 关 / `1` 开；**缺省、空值、未配置均视为 `0`**。
- 前端：独立 `evidenceOcrVerify.js`（或 `pages/score/cme_singleproj_score/js/evidenceOcrVerify.js`），各角色录入页仅 `import`/引用，不在各 HTML 内复制 OCR 分支。
- 读取方式：与现网一致，经 `getConfigByUnitFromRedis` / `getConfig` 在页面初始化或提交前读取一次。

**理由**：判定逻辑可测、可关；默认不启用保障现网零影响。  
**备选**：写死在浙江套 if 分支 — 拒绝。

### D2：OCR 由后端统一调用（开源组件）

**选择**：前端仅在开关开启且用户点击提交时调用 `POST .../evidenceOcrVerify`；后端使用**开源 OCR** 本地识别：

| 候选 | 说明 |
|------|------|
| **Tess4j**（Tesseract） | Maven 依赖简单，中文需 `chi_sim` 训练包 |
| **PaddleOCR**（Java/ONNX 或 sidecar） | 中文场景准确率较好，部署稍重 |

实施阶段 POC 二选一后写入 `pom`；**禁止**接入需 API Key 的商业云服务。

PDF：Apache PDFBox / iText 转图后送同一 OCR 引擎。

**理由**：满足「开源组件」、数据不出域。  
**备选**：前端 Tesseract.js — 拒绝（体积与 PDF 处理差）；商业 OCR — 拒绝。

### D3：三态结果枚举

| 值 | 含义 | 前端行为 |
|----|------|----------|
| `MATCH` | 任一文件 OCR 文本经规范化后包含规范化 `personName` 子串 | 继续原提交流程 |
| `NO_TEXT` | 所有文件均无有效文字或未识别到姓名 | 页面提示「无法识别，请重新上传清晰图片」，**不**弹不匹配框 |
| `MISMATCH` | 有文字/姓名但无文件包含 `personName` | 按弹框规则处理 |

多文件逻辑：**OR** — 任一张匹配即 `MATCH`；全部无文字才 `NO_TEXT`；有文字且全部不匹配为 `MISMATCH`。

### D4：弹框次数 — 服务端 + 会话双轨

**选择**：

- DB 字段 `evidence_name_mismatch_prompt_count`（0–2，每次展示弹框后 +1；忽略继续或重新上传策略见 spec）。
- 前端会话内 `sessionMismatchSubmitCount`：同一「录入批次」（向导未关闭）内，第 3 次触达 `MISMATCH` 时不再弹框，请求带 `nameVerifyAction: AUTO_THIRD`。

重新上传：清除 `fileList` 与临时 URL，**不**重置 DB 已保存 score 的 count（若尚未落库则仅会话计数）。

**第 3 次**：`MISMATCH` 且 `prompt_count >= 2`（或会话第 3 次）→ 直接 `save` + `evidence_name_verify_status = ABNORMAL`。

### D5：异常标记字段

`cme_singleproj_score` 新增（命名实施可微调）：

| 字段 | 类型 | 说明 |
|------|------|------|
| `evidence_name_verify_status` | varchar/tinyint | `NORMAL` / `ABNORMAL` / `NULL`(历史) |
| `evidence_name_mismatch_prompt_count` | int | 已弹框次数 |

`ABNORMAL` 触发条件：`IGNORE` 提交、或第 3 次静默提交。

审核通过（既有 `check_state` 变为通过）：`evidence_name_verify_status` → `NORMAL`，`prompt_count` 可清零或保留审计日志表（建议保留 count 仅清 status）。

### D6：三角色录入一致

**选择**：单位 / 科室 / 个人入口统一接入同一 `evidenceOcrVerify.js` + 同一后端 API；差异仅限各自页面原有的保存 URL/参数封装，**OCR 三态、弹框、计数、标记字段语义完全一致**。

| 角色 | 典型页面 |
|------|----------|
| 单位 | `grant_score_singleproj.html`、`grant_score_manage.html` |
| 科室 | `dept_score_singleproj.html`、`dept_score_manage.html` |
| 个人 | `individual_score_singleproj.html`、`individual_score_manage.html` |

科室代录若落库 `cme_dept_singleproj_score`，同步增加与 `cme_singleproj_score` 相同的核验字段，审核列表统一读异常标记。

### D7：PDF 处理

**选择**：后端 OCR 前将 PDF 首页（或前 N 页，默认 3） rasterize 为图片再送开源 OCR；单 PDF 超时计入总超时。

### D8：姓名规范化后精确匹配

**选择**：公共工具类 `PersonNameMatchNormalizer`（前后端规则一致；**以后端为准**）：

1. `trim`
2. 全角字符转半角（`Fullwidth.toHalfwidth` / JDK `Normalizer` 或项目已有工具）
3. 移除所有空白字符（含半角空格、全角空格 `\u3000`、制表符等）

比对：对 OCR 全文做同样规范化后，判断 `normalizedOcrText.contains(normalizedPersonName)`，且 `normalizedPersonName` 非空。

**示例**：录入「张 三」、OCR「张三」或「张　三」（全角空格）→ `MATCH`。

**不做**：繁简转换、别名、拼音、仅忽略中间点等。

### D9：审核 UI

- 列表行：`evidenceNameVerifyAbnormal === true` → `tr` 增加 class `score-evidence-name-abnormal`（红色背景/文字）。
- 佐证列：在「查看」链接旁渲染 `<span class="evidence-verify-warn">!</span>` + `layui-tips` 固定文案。
- 修改点：`s1check.html`、`s1check2.html` 及 `SingleScoreModal.html` / `ByPersonModal.html` 中 `photo` 列 templet。

## 接口契约

### OCR 校验

`POST /projectscore/cmeSingleprojScore/evidenceOcrVerify`

**请求：**

```json
{
  "personName": "张三",
  "fileUrls": [
    "https://.../a.jpg",
    "https://.../b.pdf"
  ],
  "scoreId": null
}
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "result": "MISMATCH",
    "recognizedTextSample": "…可选，调试用…",
    "mismatchPromptCount": 1
  }
}
```

**错误：**

| code | 含义 |
|------|------|
| `EVIDENCE_OCR_TIMEOUT` | 识别超时，提示稍后重试 |
| `EVIDENCE_OCR_SERVICE_ERROR` | OCR 服务不可用 |

### 保存学分（扩展）

既有 save 接口增加可选字段：

```json
{
  "nameVerifyAction": "IGNORE",
  "evidenceNameVerifyStatus": "ABNORMAL"
}
```

后端以服务端计算为准，防止前端伪造 `NORMAL` 绕过。

### 审核列表（扩展）

行对象增加：

```json
{
  "evidenceNameVerifyAbnormal": true
}
```

由 `evidence_name_verify_status === 'ABNORMAL' && check_state 待审` 推导（已通过后为 false）。

## 前端 ↔ 后端对应

| 前端 | 后端 |
|------|------|
| 上传扩展 accept/size | 文件存储服务（既有） |
| 读 `fun_singleproj_evidence_ocr_verify` | `CmeCommonConfig` 默认 0 |
| 提交前 `evidenceOcrVerify` | `EvidenceOcrFacade` + 开源 OCR |
| 三角色页面引用同一 JS | 无重复 OCR 分支 |
| 弹框/loading 文案 | 三态 + count |
| `nameVerifyAction` on save | 写 `evidence_name_verify_*` |
| 审核表样式 | 列表 DTO 字段 + approve 清标记 |

## Migration Plan

1. 执行 DDL 增加字段，默认 `NULL`/`NORMAL`。
2. 部署开源 OCR 依赖（语言包/模型）；`fun_singleproj_evidence_ocr_verify` 默认 0。
3. 部署前端共用模块；联调后在目标单位/套别配置为 1。
4. **回滚**：关开关；前端兼容无新字段；不回滚 DDL 亦可（字段闲置）。

## Risks / Trade-offs

- [OCR 误识] → 精确子串匹配 + 忽略继续 + 审核标红二次把关。
- [耗时] → 多文件并行、总超时 30s（可配置）、loading 文案。
- [PDF 质量] → 转图 DPI、专属 NO_TEXT 提示。
- [绕过 OCR] → 开关为 1 时保存接口强制校验（无 `MATCH` 且非 `IGNORE`/`AUTO_THIRD` 拒绝保存）。
- [开源 OCR 中文准确率] → 优先 POC PaddleOCR；必要时提示用户上传更清晰图片（`NO_TEXT`）。

## 已确认决策（产品）

| # | 决策 |
|---|------|
| 1 | 判定逻辑独立，经 `cme_common_config` 启用，**默认不启用** |
| 2 | 姓名精确匹配前**忽略空格与全半角差异** |
| 3 | OCR 使用**开源组件**（Tess4j / PaddleOCR 等），不用商业云 API |
| 4 | **单位、科室、个人**录入逻辑一致，共用模块与 API |
