> **分支约定**：FE/BE 代码提交在 **`新国标_20260428`** — 前端 `kjpt-web_branches/新国标_20260428`，后端 `kjpt_cloud_branches/新国标_20260428`。

> **已确认**：`cme_common_config` 开关默认关；姓名比对忽略空格/全半角；开源 OCR；单位/科室/个人逻辑一致。

## 1. 数据库与配置（BE）

- [x] 1.1 【BE】`cme_singleproj_score`、`cme_dept_singleproj_score`（若科室代录独立落库）增加核验字段及 DDL（验收：测试库执行成功）
- [x] 1.2 【BE】`ConfigDictEnum` 新增 `fun_singleproj_evidence_ocr_verify`，字典说明「个人学分佐证姓名 OCR 校验」；**默认值 0**（验收：公共配置页可维护，未配置读为 0）
- [x] 1.3 【BE】`PersonNameMatchNormalizer` 单测：去空格、全半角、子串包含（验收：「张 三」与「张三」为 MATCH）

## 2. 开源 OCR 服务（BE）

- [x] 2.1 【BE】POC 选型 Tess4j 或 PaddleOCR（中文样张），确定 `pom` 依赖与部署物（语言包/模型）（验收：POC 记录）
- [x] 2.2 【BE】实现独立 `EvidenceOcrFacade`：多 URL 并行、PDF 转图、开源 OCR、规范化姓名比对、三态（验收：单元测试 mock + 真实样张各 1）
- [x] 2.3 【BE】暴露 `POST .../evidenceOcrVerify`；开关为 0 时接口可返回跳过或前端不调（验收：Postman）
- [ ] 2.4 【BE】移除/禁止商业云 OCR 配置项（验收：代码评审）

## 3. 学分保存与标记（BE）

- [x] 3.1 【BE】保存主流程仅在校验开关=1 时调用 Facade；`nameVerifyAction`（`IGNORE`/`AUTO_THIRD`）写异常标记（验收：DB 字段）
- [x] 3.2 【BE】开关=1 时无 MATCH 且非 IGNORE/AUTO_THIRD 拒绝保存（验收：接口测试）
- [x] 3.3 【BE】审核通过清除 `evidence_name_verify_status`（验收：通过后 `evidenceNameVerifyAbnormal=false`）

## 4. 审核列表（BE + FE）

- [x] 4.1 【BE】审核列表 DTO 增加 `evidenceNameVerifyAbnormal`（验收：异常学分 true）
- [x] 4.2 【FE】`s1check.html` / `s1check2.html` 标红 + 叹号角标 Tooltip（验收：截图）
- [x] 4.3 【FE】`SingleScoreModal.html`、`ByPersonModal.html` 一致（验收：抽检）

## 5. 共用前端模块（FE）

- [x] 5.1 【FE】新增 `evidenceOcrVerify.js`：读 `fun_singleproj_evidence_ocr_verify`、loading、三态、弹框、第 3 次静默（验收：模块单测或手工清单）
- [x] 5.2 【FE】上传共用：JPG/PNG/PDF、25MB、「重新上传」清空（验收：非法格式/超限提示）
- [x] 5.3 【FE】**单位**入口接入：`grant_score_singleproj.html`、`grant_score_manage.html`（验收：提交链路）
- [x] 5.4 【FE】**科室**入口接入：`dept_score_singleproj.html`、`dept_score_manage.html`（验收：与 5.3 行为一致）
- [x] 5.5 【FE】**个人**入口接入：`individual_score_singleproj.html`、`individual_score_manage.html`（验收：与 5.3 行为一致）

## 6. 联调与回归（Joint）

- [ ] 6.1 【Joint】开关=0：三角色提交均无 OCR 请求（验收：Network）
- [ ] 6.2 【Joint】开关=1：MATCH / NO_TEXT / MISMATCH / 弹框 2 次 / 第 3 次静默 / 忽略继续标红（验收：标准 4–15）
- [ ] 6.3 【Joint】全半角与空格：「张 三」材料识别为「张三」通过（验收：标准 5）
- [ ] 6.4 【Joint】审核通过解除标红；驳回无新通知（验收：标准 16–17）
- [ ] 6.5 【Joint】三角色各走通一条完整录入（验收：单位/科室/个人 checklist）

## 7. 发布

- [ ] 7.1 【BE】DDL + 开源 OCR 部署物 + 配置字典默认 0（验收：发布检查表）
- [ ] 7.2 【Joint】目标环境配置开关=1 后观察 OCR 耗时与错误日志（验收：24h）
- [ ] 7.3 【BE/FE】回滚：配置改 0 即可，无需卸依赖（验收：演练记录）
