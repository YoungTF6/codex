## ADDED Requirements

### Requirement: 经 cme_common_config 控制启用且默认关闭

佐证姓名 OCR 校验 SHALL 作为独立能力实现；是否启用 MUST 由 `cme_common_config` 配置项（字典编码 `fun_singleproj_evidence_ocr_verify`）控制。配置值为 `1` 时启用；`0`、空值或未配置时 MUST 视为关闭。**系统默认 MUST 为关闭（0）**，关闭时 MUST NOT 调用 OCR、MUST NOT 写入姓名核验异常标记，行为与现网一致。

#### Scenario: 配置未启用

- **WHEN** `fun_singleproj_evidence_ocr_verify` 为 0 或未配置
- **THEN** 用户提交学分时不触发 OCR，流程与变更前相同

#### Scenario: 配置已启用

- **WHEN** 技术支持将 `fun_singleproj_evidence_ocr_verify` 配置为 1
- **THEN** 提交时按本 spec 执行 OCR 与姓名比对

### Requirement: 单位科室个人录入逻辑一致

当 OCR 功能开启时，单位角色、科室角色、个人角色的个人学分录入 MUST 使用同一套佐证 OCR 与姓名比对逻辑（共用前端模块与同一后端接口），三者在弹框文案、三态判定、弹框次数、异常标记语义上 MUST 一致。

#### Scenario: 科室角色提交

- **WHEN** 科室用户在科室代录入口提交且开关为 1
- **THEN** OCR 与弹框行为与单位/个人入口相同

### Requirement: 提交时触发 OCR 识别

当 OCR 功能开关开启时，系统 SHALL 在用户点击「下一步」或「提交」时触发佐证材料 OCR 识别流程；识别进行期间，页面 MUST 展示进度提示「正在识别材料中…」，并 MUST NOT 重复提交。

#### Scenario: 用户提交且存在已上传佐证

- **WHEN** 用户点击提交且已上传至少一份佐证材料
- **THEN** 系统显示「正在识别材料中…」并调用 OCR 校验接口

### Requirement: 后端使用开源 OCR 组件

OCR 识别 MUST 在后端通过**开源 OCR 组件**完成（如 Tess4j/Tesseract 或 PaddleOCR 等可本地部署方案），MUST NOT 依赖需商业 API Key 的第三方云 OCR 服务。

#### Scenario: 识别请求处理

- **WHEN** 开关开启且前端调用 OCR 校验接口
- **THEN** 后端使用已集成的开源 OCR 引擎本地识别文件内容

### Requirement: 姓名规范化后精确匹配

系统 SHALL 在比对前对学分所属人员姓名与 OCR 识别文本进行相同规范化处理：去除全部空白字符（含半角空格与全角空格），并将全角字符转换为半角。规范化后，若识别文本**包含**规范化后的姓名字符串，则视为匹配通过。系统 MUST NOT 做别名、拼音或繁简体转换。

#### Scenario: 材料中包含本人姓名

- **WHEN** OCR 返回结果且某文件识别文本经规范化后包含规范化后的所属人员姓名
- **THEN** 校验通过，无弹框，正常完成提交

#### Scenario: 仅空格或全半角差异

- **WHEN** 录入姓名为「张 三」且 OCR 文本为「张三」或「张　三」（全角空格）
- **THEN** 校验通过（MATCH）

#### Scenario: 姓名确实不同

- **WHEN** 规范化后 OCR 文本不包含规范化后的所属人员姓名，但识别到其他文字
- **THEN** 判定为 MISMATCH 并进入弹框流程

### Requirement: 完全无法识别

当 OCR 对所有佐证材料均完全识别不到任何文字或姓名时，系统 SHALL 展示专属页面提示「无法识别，请重新上传清晰图片」，且 MUST NOT 弹出「识别到姓名但未匹配」的提示框。

#### Scenario: OCR 无任何文字

- **WHEN** OCR 对所有文件均无有效文字或未识别到姓名
- **THEN** 页面展示「无法识别，请重新上传清晰图片」，提交被阻断

### Requirement: 识别到姓名但不匹配时弹框

当 OCR 识别到文字/姓名，但规范化后的识别结果中不包含规范化后的学分所属人员姓名时，系统 SHALL 弹出提示框，文案为：「您上传的佐证材料中并未识别到您的姓名，请查验后重新上传」。

#### Scenario: 有文字但不包含本人姓名

- **WHEN** OCR 识别到姓名或文字，但无任何文件包含学分所属人员姓名
- **THEN** 弹出上述文案的提示框

### Requirement: 不匹配提示框按钮与忽略继续

提示框 MUST 包含【重新上传】与【忽略并继续录入】两个按钮。【忽略并继续录入】 MUST 对所有录入人员开放。点击【忽略并继续录入】后，学分 MUST 提交成功，且后台 MUST 将该学分标记为姓名核验异常。

#### Scenario: 点击忽略并继续录入

- **WHEN** 用户在 mismatch 弹框点击「忽略并继续录入」
- **THEN** 学分保存成功且 `evidence_name_verify_status` 为异常

#### Scenario: 点击重新上传

- **WHEN** 用户在 mismatch 弹框点击「重新上传」
- **THEN** 提示框关闭，原佐证文件被清除，用户回到上传步骤

### Requirement: 不匹配弹框最多两次

对同一次学分录入流程，姓名不匹配提示框 MUST 最多弹出 2 次。第 2 次重新上传后仍不匹配时，MAY 再弹出 1 次（合计最多 2 次弹框）。第 3 次提交时无论匹配结果如何，系统 MUST NOT 再弹出提示框，MUST 直接提交并将该学分标记为姓名核验异常。

#### Scenario: 第三次提交仍不匹配

- **WHEN** 用户第 3 次提交且 OCR 仍为 MISMATCH
- **THEN** 无弹框，静默提交成功，学分标记为异常

#### Scenario: 第二次不匹配

- **WHEN** 用户第 2 次提交且 OCR 为 MISMATCH 且弹框次数未达上限
- **THEN** 再次弹出 mismatch 提示框
