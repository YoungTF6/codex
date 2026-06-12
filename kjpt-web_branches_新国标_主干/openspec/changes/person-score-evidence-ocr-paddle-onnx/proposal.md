## Why

个人学分佐证姓名 OCR 功能已在 `person-score-evidence-ocr-name-verify` 变更中落地，当前实现采用 **Tess4j（Tesseract 原生库）**。联调与本地开发暴露出问题：运行 OCR 的服务器必须额外安装 Tesseract 及 `chi_sim` 语言包，否则出现 `Could not initialize class net.sourceforge.tess4j.TessAPI`，运维成本高、环境不一致风险大。

现需将 OCR 引擎替换为 **PaddleOCR + ONNX Runtime（Java）**，使模型与推理运行时随 Maven 依赖集成进 `kjpt-projectscore-service`，**无需在宿主机 apt/brew 安装 Tesseract**。业务三态（MATCH / NO_TEXT / MISMATCH）、姓名规范化、配置开关、前端交互与审核标红逻辑保持不变。

## What Changes

- **移除** `tess4j` Maven 依赖及 `Tess4jOcrEngine` 相关实现、`TESSDATA_PREFIX` 部署要求。
- **新增** ONNX Runtime Java 依赖、PaddleOCR 中文 ONNX 模型（检测 + 识别，或 PP-OCRv4 mobile 组合）及模型加载/推理封装。
- **重构** `EvidenceOcrFacadeImpl`：保留 HTTP 下载佐证、PDFBox 转图、姓名比对与三态输出；仅替换 OCR 推理层为 Paddle ONNX。
- **保持** `POST .../evidenceOcrVerify` 请求/响应契约不变；前端 `evidenceOcrVerify.js` **无需改动**（be-only）。
- **更新** 发布检查表：模型文件打包/挂载方式、JVM 内存建议、Linux x86_64 平台 native 库验证。
- **不改动** 数据库字段、`cme_common_config` 开关、审核 UI、保存与标记逻辑。

## 业务目标

- 开发/测试/生产环境「只部署 Java 服务」即可启用 OCR，消除 Tesseract 系统级依赖。
- 中文姓名识别准确率不低于或优于 Tess4j（POC 样张验收）。
- 对外接口与产品行为与现实现完全一致，用户无感知切换。

## Non-goals

- 不改造前端页面、弹框、三态交互、审核标红（除非联调发现契约问题）。
- 不引入商业云 OCR API。
- 不新增 OCR 相关配置项（模型路径可沿用 classpath 或 `application` 默认，高级覆盖放 design）。
- 不对历史学分批量重跑 OCR。
- 不在本期支持 GPU 推理（仅 CPU ONNX，后续可扩展）。

## Capabilities

### New Capabilities

- `person-score-evidence-paddle-onnx-ocr`：PaddleOCR ONNX 推理封装、模型资源管理、引擎健康检查与部署约束。

### Modified Capabilities

- `person-score-evidence-ocr-name-verify`：OCR 引擎实现由 Tess4j 改为 PaddleOCR + ONNX Runtime；部署要求从「系统安装 Tesseract」改为「Maven 集成模型与运行时」。

## 代码分支（实施范围）

| 端 | 仓库路径 |
|----|----------|
| 前端 | `kjpt-web_branches/新国标_20260428`（**无改动，仅回归**） |
| 后端 | `kjpt_cloud_branches/新国标_20260428`（`kjpt-projectscore-service`） |

提案存放于 `新国标_主干/openspec`。

## Impact

| 范围 | 说明 |
|------|------|
| **后端** | `EvidenceOcrFacadeImpl`、新增 `PaddleOcrOnnxEngine`（或等价类）、`pom.xml` 依赖调整 |
| **前端** | 无契约变更；开关=1 时回归 OCR 提交流程 |
| **部署** | 移除 Tesseract 安装步骤；增加 ONNX 模型资源（约 10–30MB）与 CPU/内存基线 |
| **接口** | `evidenceOcrVerify`、save 扩展字段、审核列表字段 — **不变** |

### 接口清单（无变更，兼容确认）

| 方法 | 路径 | 变更 |
|------|------|------|
| POST | `projectscore/cmeSingleprojScore/evidenceOcrVerify` | 无；`result` 仍为 MATCH/NO_TEXT/MISMATCH/SKIPPED |
| POST | 既有 save 接口 | 无 |
| 审核列表 | 既有扩展字段 | 无 |

错误语义保持：`开关=0` → SKIPPED；引擎不可用 → `JSONResult.error` 友好提示（文案可微调为「OCR 引擎未就绪」）。

### 兼容策略

- **接口双版本**：不需要；响应结构不变。
- **并行运行**：不支持 Tess4j 与 Paddle 并存；替换后全量使用 Paddle ONNX。
- **回滚**：代码回滚至 Tess4j 版本 + 恢复 `tess4j` 依赖；或配置开关置 `0` 即时关闭 OCR 功能。

### 风险与回滚

| 风险 | 缓解 / 回滚 |
|------|-------------|
| jar 体积增大 | 模型放独立资源目录或发布包外挂载 |
| 首次推理慢 | 应用启动时预热（warm-up） |
| Linux ARM 与 x86 native 库差异 | 发布矩阵仅声明已测平台（x86_64）；CI 验证 |
| 识别准确率回归 | POC 对比 Tess4j 样张；保留开关默认 0 |
| ONNX 初始化失败 | 启动/首次调用健康检查 + 明确错误返回，不 500 |
