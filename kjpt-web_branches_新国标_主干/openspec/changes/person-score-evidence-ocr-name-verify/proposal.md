## Why

个人学分录入依赖佐证材料证明真实性，但当前缺少对材料中「归属人姓名」的自动核验能力，审核人员只能人工翻看图片，合规风险高、效率低。需在提交环节引入 OCR 与学分所属人员姓名的精确比对，对不匹配情形形成录入端预警 + 审核端标红闭环，提升学分数据可信度（优先级 P1）。

## What Changes

- **佐证材料上传增强**：学分录入向导页支持 JPG/PNG/PDF，单文件 ≤25MB；每条学分可关联多份佐证；「重新上传」清除原文件后可重选。
- **提交时 OCR 校验**：用户点击「下一步/提交」触发后端 OCR；前端展示「正在识别材料中…」；三种结果：匹配通过、完全无法识别、识别到姓名但不匹配。
- **不匹配交互**：专属弹框（文案固定）+【重新上传】/【忽略并继续录入】；弹框最多 2 次，第 3 次静默提交并标记异常；忽略或第 3 次提交均落库「姓名核验异常」标记。
- **审核模块联动**：异常学分在「个人活动学分审核」列表整行标红、佐证列红色叹号角标 + Tooltip；审核通过后自动解除；驳回不通知录入人。
- **数据与接口**：`cme_singleproj_score`（及科室代录等价表）新增姓名核验状态字段；新增 OCR 识别与提交校验契约接口；审核列表查询返回异常标记。
- **可配置、可独立**：OCR 与姓名比对逻辑独立封装，是否启用由 `cme_common_config` 配置项控制，**默认不启用**（与现网一致）。
- **姓名比对规则**：精确匹配前对姓名与 OCR 文本做规范化（**忽略空格、全角/半角差异**）；不做别名/拼音/繁简转换。
- **OCR 引擎**：后端使用**开源 OCR 组件**（本地部署，不依赖商业云 API）。
- **多角色一致**：**单位、科室、个人**三种角色的个人学分录入链路共用同一套上传、OCR、弹框与标记逻辑。

## 业务目标

- 录入人在提交前即知佐证材料是否包含本人姓名，减少无效提交。
- 审核人员一眼识别需重点核查的学分行，降低漏审风险。
- 全流程可审计：忽略继续、第三次静默提交均留有后台异常标记直至审核通过。

## Non-goals

- 不做别名、繁简体转换或拼音比对；比对前仅做**去空格 + 全半角归一**后的精确子串匹配。
- 不改造非「个人学分录入」链路（如项目授分、远程学分、院内活动授分等），除非产品另行扩大范围。
- 不新增向录入人发送审核驳回/通过的消息通知（驳回本需求明确不发；通过沿用现有流程，不额外加 OCR 相关通知）。
- 不在前端做 OCR；商业 OCR 云服务不在本期范围（仅用开源组件）。
- 不要求对历史已录入学分批量回溯 OCR（仅新提交/重新提交触发）。

## Capabilities

### New Capabilities

- `person-score-evidence-upload`：佐证材料多文件上传、格式/大小校验、重新上传清除。
- `person-score-evidence-ocr-name-verify`：提交时 OCR、三种判定、弹框交互与提交次数计数、异常标记落库。
- `person-activity-score-audit-evidence-alert`：个人活动学分审核列表标红、叹号角标、审核通过解除。

### Modified Capabilities

- （无既有 openspec baseline spec）

## 代码分支（实施范围建议）

与近期变更惯例一致，建议前后端均在 **`新国标_20260428`** 成对交付；是否在某套别/单位启用由 `cme_common_config` 控制，**不限定单一省份**：

| 端 | 仓库路径 |
|----|----------|
| 前端 | `kjpt-web_branches/新国标_20260428` |
| 后端 | `kjpt_cloud_branches/新国标_20260428`（`projectscore` 等） |

提案文档存放于 `新国标_主干/openspec`，不代表运行分支。

## Impact

| 范围 | 说明 |
|------|------|
| **前端 - 录入** | **单位**：`grant_score_singleproj.html`、`grant_score_manage.html`；**科室**：`dept_score_singleproj.html`、`dept_score_manage.html`；**个人**：`individual_score_singleproj.html`、`individual_score_manage.html`；共用独立模块（如 `evidenceOcrVerify.js`）+ `singleproj.js`；上传扩展 PDF、25MB、多文件 |
| **前端 - 审核** | `pages/mod/check/s1check.html`、`s1check2.html`、`SingleScoreModal.html`、`ByPersonModal.html` 等个人活动学分审核页 |
| **后端** | `CmeSingleprojScore` 实体与 DAO；学分保存/提交 API；新增 OCR 服务封装；审核列表查询 DTO |
| **数据库** | `cme_singleproj_score` 增加姓名核验相关字段（如 `evidence_name_verify_status`、`mismatch_prompt_count` 等，design 定稿） |
| **外部依赖** | 开源 OCR（如 Tess4j / PaddleOCR 本地库）+ PDF 转图；无第三方 API 密钥 |
| **配置** | `sjwh` `CmeCommonConfig`：`fun_singleproj_evidence_ocr_verify`（默认 `0`） |

### 接口清单（规划）

| 方法 | 路径（示例） | 请求 | 响应 | 说明 |
|------|----------------|------|------|------|
| POST | `projectscore/.../evidence/ocrVerify` | `personName`, `fileUrls[]` 或 `scoreId`+临时附件 ID | `{ result: MATCH \| NO_TEXT \| MISMATCH, recognizedNames?: string[] }` | 提交前 OCR；`NO_TEXT` 表示完全无文字/姓名 |
| POST | `projectscore/.../singleproj/save`（既有，扩展） | 原学分实体 + `nameVerifyAction?: IGNORE \| AUTO_THIRD` | 成功/失败 | 忽略继续或第 3 次提交时写入异常标记 |
| GET/POST | `projectscore/.../check/list`（审核列表，既有扩展） | 原筛选参数 | 行数据含 `evidenceNameVerifyAbnormal: boolean` | 供前端标红与角标 |
| POST | `projectscore/.../check/approve`（既有，扩展） | 原审核通过参数 | 成功 | 通过时清除异常标记 |

错误码示例：`EVIDENCE_OCR_TIMEOUT`、`EVIDENCE_OCR_SERVICE_ERROR`（服务不可用时的友好提示，design 细化）。

### 兼容策略

- 新字段默认「未校验/正常」；`fun_singleproj_evidence_ocr_verify` **默认 0（不启用）**，未配置视同 0，行为与现网完全一致。
- OCR/姓名比对为独立模块，保存主流程仅在开关为 1 时挂载校验；关闭开关不调用 OCR、不写异常标记。
- 前端对审核列表新字段做可选判断：无字段或开关关闭时不展示角标。

### 风险与回滚

| 风险 | 缓解 / 回滚 |
|------|-------------|
| OCR 误识导致误弹框 | 精确匹配 + 最多 2 次弹框 + 忽略继续；可配置关闭 OCR |
| OCR 服务超时阻塞提交 | 超时降级策略（design：是否允许重试或提示稍后再试） |
| 多文件串行识别耗时长 | 后端并行识别、前端统一 loading |
| PDF 识别质量差 | 转图 DPI 参数可调；提示用户上传清晰图片 |
| DB 字段误标红 | 审核通过清除；回滚版本时字段可忽略 |
