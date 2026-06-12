## Context

### 现状

- 佐证姓名 OCR 已在 `新国标_20260428` 实现：`EvidenceOcrFacade` → `EvidenceOcrFacadeImpl`（Tess4j）、`PersonNameMatchNormalizer`、HTTP 下载佐证 URL、PDFBox 最多 3 页转图。
- 前端 `evidenceOcrVerify.js` 与三角色录入/管理页、审核标红已接入。
- Tess4j 依赖本机 `libtesseract` + `chi_sim.traineddata`，开发机未安装时接口失败。

### 约束

- 继续使用**开源、本地推理**，禁止商业云 OCR。
- **不改变**对外 API 与三态语义；姓名比对仍走 `PersonNameMatchNormalizer`。
- 佐证 `fileUrls` 为文件服务器完整 HTTPS URL，后端 HTTP 下载后识别（已实现）。
- 实施分支：`新国标_20260428`（cloud）；前端仅回归。

## Goals / Non-Goals

**Goals:**

- OCR 推理完全由 Java 服务进程内完成，**无需**运维安装 Tesseract。
- Maven 管理 ONNX Runtime 与 PaddleOCR 模型资源。
- 保持 `EvidenceOcrFacade.verify()` 输入输出不变。
- 提供引擎懒加载、预热与健康检查，失败时返回明确业务错误而非 500。

**Non-Goals:**

- GPU/CUDA 推理、独立 OCR sidecar 微服务。
- 前端改造、DB 变更、新配置字典。
- 多语言 OCR（仅中文场景）。

## Decisions

### D1：引擎选型 — PaddleOCR PP-OCRv4 mobile + ONNX Runtime Java

**选择**：

| 组件 | 选型 | 说明 |
|------|------|------|
| 推理运行时 | `com.microsoft.onnxruntime:onnxruntime`（按 OS/arch classifier） | 官方 Java API，native 随 jar 分发 |
| 模型 | PP-OCRv4 mobile det + rec（中文）ONNX | 体积适中，中文效果好 |
| 前处理/后处理 | 自研或轻量工具类（resize、normalize、CTC 解码） | 避免引入过重 Python 桥 |

**理由**：满足「不额外安装系统组件」；中文姓名场景优于 Tesseract。  
**备选**：继续 Tess4j — 拒绝（运维依赖）；DJL — 备选，依赖更重，本期优先 ONNX Runtime 直连。

### D2：模块划分

```
EvidenceOcrFacadeImpl          # 编排：下载、PDF、聚合文本、姓名比对、三态
  └── PaddleOcrOnnxEngine      # 单例：加载 ONNX Session、det+rec 推理
  └── OcrImagePreprocessor     # 图像缩放、通道、归一化
  └── OcrTextPostProcessor     # 检测框排序、识别结果拼接
```

- **保留** `PersonNameMatchNormalizer`、PDFBox 逻辑、HTTP 下载逻辑。
- **删除** `Tess4jOcrEngine`、`tess4j` 依赖、`TESSDATA_PREFIX` 相关代码。

### D3：模型资源部署

**选择**：

- 模型文件置于 `kjpt-projectscore-service/src/main/resources/paddleocr/`（或 `src/main/resources/models/paddleocr/`）：
  - `ch_PP-OCRv4_det_infer.onnx`
  - `ch_PP-OCRv4_rec_infer.onnx`
  - `ppocr_keys_v1.txt`（字典）
- 可选配置项（`application.yml`，非 `cme_common_config`）：
  - `evidence.ocr.paddle.model-dir`：覆盖 classpath 路径（生产外挂模型目录）。

**理由**：默认开箱即用；大文件可考虑 CI 下载脚本，不强制进 git（design 任务中定稿）。

### D4：推理流程

1. HTTP 下载佐证 → 临时文件（已有）。
2. 若 PDF → PDFBox 渲染为 `BufferedImage` 列表（最多 3 页）。
3. 每张图 → det 模型得文本框 → crop → rec 模型得文本行。
4. 拼接全文 → `PersonNameMatchNormalizer.isExactMatchIgnoreSpaceAndWidth`。
5. 多文件 OR 语义不变。

### D5：引擎生命周期

- **懒加载 + 双重检查锁**：首次 `verify` 时初始化 ONNX `OrtEnvironment` / `OrtSession`。
- **预热**：可选在 `@PostConstruct` 对 32×32 空白图跑一次 det+rec，失败则标记 `engineAvailable=false`。
- **失败策略**：`IllegalStateException` → `CmeSingleprojScoreServiceImpl` 捕获 → `JSONResult.error("OCR 引擎未就绪，请联系管理员")`（与现 Tess4j 处理一致）。

### D6：平台与依赖

```xml
<!-- 示例，实施时锁定版本 -->
<dependency>
  <groupId>com.microsoft.onnxruntime</groupId>
  <artifactId>onnxruntime</artifactId>
  <version>1.17.1</version>
</dependency>
```

- 发布目标：**Linux x86_64**（生产）；开发机 macOS aarch64/x86_64 本地验证。
- 不使用 `tess4j`。

### D7：性能与超时

- 单张图推理目标 &lt; 3s（CPU，1080p 以内）；多文件串行（与现实现一致，后续可并行优化）。
- 总超时 30s（与既有 design 一致，可在 Facade 层计时）。

## 接口契约（不变）

### OCR 校验

`POST /projectscore/cmeSingleprojScore/evidenceOcrVerify`

**请求：**

```json
{
  "personName": "于静",
  "addUnit": "160002",
  "scoreLevel": "2a2b677e-ac75-4442-b9ac-180ec3a188bf",
  "fileUrls": [
    "https://testkjpt.wsglw.net/kjptapi/file/individualScoreManage/.../xxx.png"
  ]
}
```

**响应：**

```json
{
  "status": 200,
  "data": {
    "result": "MATCH",
    "recognizedTextSample": "…",
    "mismatchPromptCount": 0
  }
}
```

引擎不可用：

```json
{
  "status": 500,
  "msg": "OCR 引擎未就绪，请联系管理员"
}
```

## 前端 ↔ 后端对应

| 前端 | 后端 | 本变更 |
|------|------|--------|
| `evidenceOcrVerify.js` | `evidenceOcrVerify` | 无改动 |
| loading / 三态 / 弹框 | `EvidenceOcrFacade` | 仅引擎实现替换 |

## Migration Plan

1. **POC**：在 `kjpt-projectscore-service` 引入 ONNX + 模型，单测/ main 方法验证中文样张。
2. **替换**：删除 Tess4j 实现，切换 `EvidenceOcrFacadeImpl` 至 Paddle 引擎。
3. **打包**：确认模型资源进入部署包或挂载路径文档化。
4. **联调**：开关=1，走 `joint-verification-checklist` 中 OCR 相关项。
5. **发布**：先默认开关=0；目标环境验证后开 1。
6. **回滚**：配置改 0；或回滚 jar 至 Tess4j 版本（需恢复 Tesseract 运维文档）。

## Risks / Trade-offs

- [jar 体积 +20~40MB] → 模型外置目录 + 启动脚本下载（可选）。
- [CPU 占用高于 Tess4j] → 限制并发、总超时、开关默认关。
- [macOS/Windows 开发机 native 库] → 开发文档注明 ONNX Runtime 多平台 jar。
- [模型授权] → 使用 PaddleOCR Apache 2.0 模型，保留 LICENSE 说明。

## Open Questions

1. 模型文件是否进 SVN/Git，还是构建时从 Paddle 官方 release 下载？（建议：`.gitignore` + Maven profile 下载脚本）
2. 生产镜像是否需上调堆内存（建议 +512MB 基准）？
