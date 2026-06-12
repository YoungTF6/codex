## ADDED Requirements

### Requirement: OCR 引擎随 Java 服务集成部署

系统 SHALL 使用 PaddleOCR ONNX 模型与 ONNX Runtime Java 在 `kjpt-projectscore-service` 进程内完成 OCR 推理。部署 OCR 功能时 MUST NOT 要求宿主机额外安装 Tesseract、`chi_sim` 语言包或 `TESSDATA_PREFIX` 环境变量。

#### Scenario: 新环境仅部署 Java 服务

- **WHEN** 运维在干净 Linux 服务器上部署 `kjpt-projectscore-service` 且未安装 Tesseract
- **THEN** 在 `fun_singleproj_evidence_ocr_verify=1` 时 OCR 校验接口仍可完成推理（模型与 native 库由应用依赖提供）

#### Scenario: 不依赖 TESSDATA_PREFIX

- **WHEN** 服务器未配置 `TESSDATA_PREFIX`
- **THEN** OCR 引擎仍可初始化并成功识别中文样张

### Requirement: Paddle OCR 模型资源可加载

系统 SHALL 在应用启动或首次 OCR 调用时加载 PaddleOCR 检测与识别 ONNX 模型及中文字典。模型加载失败时 MUST 标记引擎不可用，并 MUST NOT 因未捕获异常导致接口 500。

#### Scenario: 模型资源完整

- **WHEN** 模型文件位于约定 classpath 或配置的 `evidence.ocr.paddle.model-dir` 目录
- **THEN** 引擎初始化成功并可对图片返回识别文本

#### Scenario: 模型资源缺失

- **WHEN** 检测或识别 ONNX 模型文件不存在
- **THEN** 接口返回明确业务错误（如「OCR 引擎未就绪」），且不抛出未处理异常

### Requirement: 引擎健康检查与预热

系统 SHOULD 在首次 OCR 请求前完成引擎可用性探测（预热）。引擎不可用时，后续 `evidenceOcrVerify` 请求 MUST 快速失败并返回友好错误信息。

#### Scenario: 首次调用成功预热

- **WHEN** 应用启动后首次调用 OCR 校验且引擎可用
- **THEN** 完成预热后正常返回 MATCH/NO_TEXT/MISMATCH 之一

#### Scenario: 引擎不可用

- **WHEN** ONNX Runtime 或模型加载失败
- **THEN** 返回业务错误提示，前端展示「佐证核验服务不可用」类文案
