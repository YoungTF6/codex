## ADDED Requirements

### Requirement: 按学分子分类配置签到提前与签退推迟阈值

系统 SHALL 在广东套下，通过后台公共配置（`CmeCommonConfig`）按**学分子分类**（`scoreLevelId`）分别维护两项非负整数配置：签到二维码可提前打开的分钟数、签退二维码可推迟打开的分钟数。配置字典编码 SHALL 为 `value_attend_sign_in_early_minutes` 与 `value_attend_sign_out_late_minutes`（实施时以 `ConfigDictEnum` 登记为准）。

#### Scenario: 已配置某学分子分类阈值

- **WHEN** 技术支持为学分子分类 A 配置签到提前 60 分钟、签退推迟 60 分钟
- **THEN** 查询该 `scoreLevelId` 时分别返回 `60` 与 `60`

#### Scenario: 未配置阈值

- **WHEN** 某学分子分类未维护上述任一项配置
- **THEN** 系统 SHALL 将该缺失项视为 `0`

#### Scenario: 配置值非法

- **WHEN** 配置值为空、非数字或负数
- **THEN** 系统 SHALL 按 `0` 使用并记录告警日志（不阻断其他合法配置）

### Requirement: 复用既有公共配置页维护

阈值 SHALL 由技术支持在既有后台「公共配置」页（`CmeCommonConfig` 通用维护能力）按学分子分类录入与修改；系统 MUST NOT 为本需求单独新增考勤阈值专用配置页面。

#### Scenario: 技术支持维护阈值

- **WHEN** 技术支持在公共配置页选择广东套、学分子分类及字典项 `value_attend_sign_in_early_minutes` 或 `value_attend_sign_out_late_minutes` 并保存
- **THEN** 考勤流程读取到更新后的分钟数

### Requirement: 阈值仅用于广东套签到签退考勤

上述配置 SHALL 仅被广东套项目/活动 SignInOut 考勤流程读取；其他省份套别 MUST NOT 因该配置改变二维码打开规则。

#### Scenario: 非广东套项目

- **WHEN** 非广东套项目打开考勤页
- **THEN** 系统 MUST NOT 应用本变更的阈值扩展窗口（保持原有校验）
