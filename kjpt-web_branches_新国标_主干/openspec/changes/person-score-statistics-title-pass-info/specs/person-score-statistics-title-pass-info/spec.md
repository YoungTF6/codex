## ADDED Requirements

### Requirement: 页头学分汇总取自 ps/all/person/support 的 scoreTotalList

人员学分详情页 SHALL 通过 `POST ps/all/person/support`（入参 `certId`、`cmeYear`）获取 `scoreTotalList`，并按与 `PassForPerson-Default.js` 中 `renderScoreTotal` 相同的分组规则拼装 `#titlePassInfo` 中的学分汇总文案。

#### Scenario: 成功加载学分汇总

- **WHEN** 页面携带有效 `certId`、`cmeYear` 并完成 `ps/all/person/support` 请求
- **THEN** `#titlePassInfo` SHALL 展示包含「全部学分」与「计入达标学分」两段的汇总文本
- **AND** 各段数值 SHALL 分别对应 `scoreType=1,kind=1`、`scoreType=2,kind=2` 及 `kind=0` 分类明细项

#### Scenario: 接口失败时的降级

- **WHEN** `ps/all/person/support` 请求失败或返回 `success=false`
- **THEN** 学分汇总段落 SHALL 为空或省略
- **AND** 页面 SHALL 仍展示表格明细条数（若表格接口成功）

### Requirement: 页头达标结果取自 passStandardVoList

人员学分详情页 SHALL 从同一 `ps/all/person/support` 响应的 `passStandardVoList` 中 `kind >= 3` 的首条记录的 `standardMsg` 解析达标结果，规则与 `PassForPerson-Default.js` 的 `renderPassStandard` 一致。

#### Scenario: 达标

- **WHEN** `standardMsg` 为 `达标|` 或 `达标|{原因}`
- **THEN** `#titlePassInfo` SHALL 包含「达标结果: 达标」

#### Scenario: 不达标

- **WHEN** `standardMsg` 为 `不达标|{原因}`
- **THEN** `#titlePassInfo` SHALL 包含「达标结果: 不达标」及「不达标原因: {原因}」

#### Scenario: 达标标准未做要求

- **WHEN** `standardMsg` 以 `达标标准未做要求` 为结果段（`|` 前）
- **THEN** `#titlePassInfo` SHALL 展示「达标结果: 达标标准未做要求」

#### Scenario: 无达标结论项

- **WHEN** `passStandardVoList` 中不存在 `kind >= 3` 的项
- **THEN** `#titlePassInfo` SHALL 展示「达标结果: 未知」

### Requirement: 不再依赖 scoreText

人员学分详情页 MUST NOT 使用 `getPeopleScoreStatistics` 响应中的 `scoreText` 填充 `#titlePassInfo`。

#### Scenario: 表格 parseData 解耦

- **WHEN** 表格接口返回数据
- **THEN** 系统 SHALL 仅用 `recordsTotal` 更新记录条数部分
- **AND** SHALL NOT 读取 `res.data.scoreText`

#### Scenario: 年度切换刷新

- **WHEN** 用户切换「查询年度」下拉框并触发查询
- **THEN** 系统 SHALL 使用新的 `cmeYear` 重新请求 `ps/all/person/support` 并刷新 `#titlePassInfo`
