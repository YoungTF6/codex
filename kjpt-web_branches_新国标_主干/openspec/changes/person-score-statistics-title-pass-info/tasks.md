## 1. 接口消费与辅助函数 [FE]

- [x] 1.1 保持 `ps/all/person/support` 调用，请求体 `{ certId, cmeYear }`；在成功回调中同时读取 `scoreTotalList` 与 `passStandardVoList`（验收：Network 面板路径不变，响应含 scoreTotalList）
- [x] 1.2 新增 `buildScoreTotalText(scoreTotalList)`，分组逻辑对齐 `PassForPerson-Default.js` 的 `renderScoreTotal`（验收：用 `ps-all-person-support.json` 本地断点，输出含全部/计入达标两段）
- [x] 1.3 重构 `renderPassStandard`，改用 `standardMsg.split('|')` 解析，对齐 Default 版达标/不达标/达标标准未做要求/未知（验收：mock `达标|`、`不达标|原因`、`达标标准未做要求` 三种）

## 2. titlePassInfo 渲染解耦 [FE]

- [x] 2.1 引入模块级变量 `scoreTotalText`、`passMsg`、`recordCount` 及 `updateTitlePassInfo()` 合并渲染 `#titlePassInfo`（验收：DOM 同时含条数、汇总、达标三段）
- [x] 2.2 表格 `parseData` 移除对 `res.data.scoreText` 的依赖，仅设置 `recordCount` 并调用 `updateTitlePassInfo()`（验收：表格返回无 scoreText 时页头仍正常）
- [x] 2.3 `ps/all/person/support` 回调中设置 `scoreTotalText`、`passMsg` 后调用 `updateTitlePassInfo()`（验收：仅汇总接口返回时也能更新页头）

## 3. 年度切换与查询 [FE]

- [x] 3.1 确认 `form.on('select(statistical-year)')` 已更新 `cmeYear`，查询按钮重载时携带最新 `certId` + `cmeYear` 请求 support 接口（验收：切换年度后汇总数值变化）

## 4. 联调与回归 [Joint]

- [ ] 4.1 从 `personInfoManage.html` →「达标明细查询」打开弹层，对比 PassForPerson 页同一人员同年度汇总与达标结果（验收：数值与结论一致）
- [x] 4.2 验证接口失败降级：断网或 mock 失败时表格条数仍可显示，达标为未知（验收：手动模拟）

## 5. 发布检查 [FE]

- [x] 5.1 发布前：确认仅改动 `personScoreStatistics.html`，无后端变更
- [ ] 5.2 发布后：观察 support 入口打开学分详情是否报错；关注 `ps/all/person/support` 错误日志
