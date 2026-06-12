## MODIFIED Requirements

### Requirement: 后端使用开源 OCR 组件

OCR 识别 MUST 在后端通过**开源 OCR 组件**完成，MUST NOT 依赖需商业 API Key 的第三方云 OCR 服务。引擎实现 MUST 使用 **PaddleOCR（ONNX 模型）+ ONNX Runtime（Java）** 在应用进程内本地推理；MUST NOT 依赖宿主机安装 Tesseract 或 Tess4j。PDF 佐证 MUST 在识别前通过 Apache PDFBox 转为图片后送入同一 OCR 引擎。

#### Scenario: 识别请求处理

- **WHEN** 开关开启且前端调用 OCR 校验接口并传入 HTTPS 佐证 URL
- **THEN** 后端下载文件后使用 PaddleOCR ONNX 引擎本地识别文本内容

#### Scenario: 无系统级 Tesseract 依赖

- **WHEN** 服务器未安装 Tesseract 可执行文件及语言包
- **THEN** OCR 校验仍可正常工作（仅凭 Java 服务依赖）

## REMOVED Requirements

### Requirement: Tess4j 作为 OCR 实现

**Reason**: Tess4j 依赖系统级 Tesseract 原生库，运维成本高且开发环境易失败（`TessAPI` 初始化错误）。

**Migration**: 由 PaddleOCR + ONNX Runtime Java 替代；对外接口与三态语义不变；移除 `tess4j` Maven 依赖与 `TESSDATA_PREFIX` 部署文档。
