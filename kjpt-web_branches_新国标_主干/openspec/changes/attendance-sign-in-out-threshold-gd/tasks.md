> **分支约定**：所有 FE/BE 代码改动提交在 **`新国标_20260428`** — 前端 `kjpt-web_branches/新国标_20260428`，后端 `kjpt_cloud_branches/新国标_20260428`。

## 1. 配置与字典（BE）

- [x] 1.1 【BE】在 `ConfigDictEnum` 新增 `value_attend_sign_in_early_minutes`、`value_attend_sign_out_late_minutes` 及说明文案（验收：编译通过、编码与 proposal 一致）
- [x] 1.2 【BE】配置字典表/初始化脚本插入两条字典（广东套可用）；在既有「公共配置」页可选中维护，无需新页面（验收：公共配置页按学分子分类保存/读取成功）
- [x] 1.3 【BE】确认 `CmeCommonConfig` 按 `scoreLevelId` 维护与查询路径可用；补充单测或接口测试读取未配置→0（验收：接口测试）

## 2. 阈值读取（FE，经 sjwh）

- [x] 2.1 【FE】经 `getConfigByUnitFromRedis` 加载 `value_attend_sign_in_early_minutes`、`value_attend_sign_out_late_minutes`（验收：未配置为 0）
- [ ] 2.2 【BE】（延后）`projectscore` 开码/扫码时间窗校验 — 本期不做

## 3. 二维码打开窗口校验（BE，本期跳过）

- [ ] 3.1 【BE】（延后）`AttendQrWindowValidator` 及开码/扫码接入
- [ ] 3.2 【BE】（延后）`getAttendanceCode` / `distributedAttBeginForProj`
- [ ] 3.3 【BE】（延后）学员扫码登记与开码规则对齐

## 4. 前端考勤页（FE）

- [x] 4.1 【FE】进入 `AttendanceProjChooseSignInOut.html` 时加载当前 `scoreLevel` 对应阈值并缓存（验收：网络面板可见配置请求，未配置为 0）
- [x] 4.2 【FE】同上改造 `AttendanceGroupChooseSignInOut.html`（验收：活动管理入口行为一致）
- [x] 4.3 【FE】拆分 `validateCurrentTimeInBatchRange` 为签到/签退两个函数，分别绑定 `signInQrCode` / `signOutQrCode`（验收：阈值 60、批次 09:00–12:00 时 08:00 可开签到、13:00 可开签退、07:59/13:01 拦截）
- [x] 4.4 【FE】错误提示区分签到/签退场景（验收：页面验收截图或录屏）

## 5. 联调与回归（Joint）

- [ ] 5.1 【Joint】已公布项目管理 — 单位角色（`CmeCmeProjList.html`）完整流程：配置阈值→保存预设→开码（验收：checklist）
- [ ] 5.2 【Joint】已公布项目管理 — 科室角色（`CmeCmeProjListDept.html`）同上（验收：checklist）
- [ ] 5.3 【Joint】活动管理 — `CmeGroupproj.html` / `deptGroupproj.html` 入口（验收：checklist）
- [ ] 5.4 【Joint】仅验证前端开码：签退推迟 60min 时 12:45 可点签退码、13:01 拦截（扫码行为仍按原后端规则，本期不要求一致）
- [ ] 5.5 【Joint】学习时长：周期内早签晚退记录授分/统计结果与变更前公式一致（验收：对比 `fillMeetingDuration` 输出样例）
- [ ] 5.6 【Joint】非广东套项目回归：二维码规则不变（验收：抽检一个非粤省份）
## 6. 发布

- [ ] 6.1 【BE】发布前：配置字典 SQL 已执行、默认值为空（验收：生产配置检查表）
- [ ] 6.2 【Joint】发布后观察前端开码拦截是否符合预期（验收：业务抽测）
- [ ] 6.3 【BE/FE】回滚预案：阈值清零 + 还原校验函数（验收：演练文档已归档）
