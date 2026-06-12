> **分支约定**：BE 代码提交在 **`新国标_20260428`** — `kjpt_cloud_branches/新国标_20260428`。前端无契约变更，仅 Joint 回归。

> **前置**：`person-score-evidence-ocr-name-verify` 功能已落地（Tess4j 版本）。

## 1. 依赖与模型资源（BE）

- [x] 1.1 【BE】`kjpt-projectscore-service/pom.xml` 移除 `tess4j`，新增 `onnxruntime` 依赖（验收：`mvn dependency:tree` 无 tess4j）
- [x] 1.2 【BE】确定 PP-OCRv4 mobile det/rec ONNX 模型来源与存放路径（`resources/paddleocr/` 或构建下载脚本）（验收：目录结构文档 + 样张可加载）
- [x] 1.3 【BE】添加模型 LICENSE 说明文件（验收：合规检查）

## 2. Paddle OCR 引擎封装（BE）

- [x] 2.1 【BE】新增 `PaddleOcrOnnxEngine`：加载 det/rec Session、字典、懒加载与预热（验收：单测或 main 对本地 PNG 输出文本）
- [x] 2.2 【BE】新增图像前处理与检测框后处理（resize、normalize、行文本拼接）（验收：与 Paddle 官方推理结果一致或可接受偏差）
- [x] 2.3 【BE】引擎不可用时不抛未捕获异常，抛出可识别 `IllegalStateException`（验收：故意删模型文件时接口返回 error 非 500）

## 3. Facade 替换（BE）

- [x] 3.1 【BE】重构 `EvidenceOcrFacadeImpl`：删除 Tess4j/`Tess4jOcrEngine`，接入 `PaddleOcrOnnxEngine`（验收：代码评审）
- [x] 3.2 【BE】保留 HTTP 下载佐证、PDFBox 最多 3 页、多文件 OR、`PersonNameMatchNormalizer` 三态逻辑（验收：与变更前行为一致）
- [x] 3.3 【BE】确认 `CmeSingleprojScoreServiceImpl.evidenceOcrVerify` 错误捕获仍生效（验收：引擎失败返回 `JSONResult.error`）

## 4. 测试与 POC（BE）

- [x] 4.1 【BE】准备中文姓名样张（含空格/全角变体）对比 MATCH 结果（验收：「张 三」材料识别包含「张三」）
- [x] 4.2 【BE】NO_TEXT / MISMATCH 样张各 1（验收：三态正确）
- [ ] 4.3 【BE】PDF 佐证转图识别（验收：至少首页可识别姓名）

## 5. 部署与文档（BE）

- [x] 5.1 【BE】更新发布检查表：移除 Tesseract 安装步骤，增加模型包大小与 JVM 内存建议（验收：发布 checklist）
- [x] 5.2 【BE】记录支持平台：Linux x86_64（生产）、macOS 开发验证（验收：README 或 design 链接）
- [ ] 5.3 【BE】可选 `application.yml`：`evidence.ocr.paddle.model-dir` 覆盖路径（验收：外挂目录可加载）

## 6. 联调回归（Joint）

- [ ] 6.1 【Joint】开关=0：无 OCR 请求（验收：Network，沿用既有清单）
- [ ] 6.2 【Joint】开关=1：MATCH / NO_TEXT / MISMATCH / 弹框 2 次 / 第 3 次静默（验收：`joint-verification-checklist.md` 6.2）
- [ ] 6.3 【Joint】干净服务器无 Tesseract 环境下 OCR 可用（验收：新环境部署后单条录入通过）

## 7. 发布与回滚

- [ ] 7.1 【Joint】目标环境开关=1 观察 OCR 耗时与错误日志 24h（验收：日志无 TessAPI/ONNX 异常风暴）
- [ ] 7.2 【BE/FE】回滚演练：配置改 0 即时关闭；代码回滚至 Tess4j 版本步骤记录（验收：演练记录）
