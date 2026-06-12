"use strict";

const SCORE_RULE_PREFIX = "score:";
const PERIOD_RULE_PREFIX = "period:";

/**
 * 根据系统配置计算项目考勤批次数。
 *
 * 支持三类配置：
 * 1. 正整数：固定考勤批次数，例如 "3" 表示固定 3 批。
 * 2. 历史负数：-11 到 -19 按学时除数计算，-21 到 -29 按学分除数计算。
 * 3. 区间规则：score:1-3=2,4-6=4 或 period:1-4=2,5-8=4。
 *
 * @param {string | number | null | undefined} configValue 系统配置值
 * @param {number | string | null | undefined} score 项目学分
 * @param {number | string | null | undefined} period 项目学时
 * @param {number} defaultValue 配置为空、格式错误或未命中规则时返回的默认值
 * @returns {number} 考勤批次数
 */
function resolve(configValue, score, period, defaultValue) {
    if (configValue == null || String(configValue).trim() === "") {
        return defaultValue;
    }

    const value = String(configValue).trim();
    try {
        // 兼容历史配置：正整数表示固定批次数，负数表示按学分或学时除数计算。
        if (/^-?\d+$/.test(value)) {
            return resolveLegacyNumber(parseInt(value, 10), score, period, defaultValue);
        }

        const lowerValue = value.toLowerCase();
        // 新配置格式：根据项目学分或学时落入的区间返回对应考勤批次数。
        if (lowerValue.startsWith(SCORE_RULE_PREFIX)) {
            return resolveRangeRule(value.substring(SCORE_RULE_PREFIX.length), score, defaultValue);
        }
        if (lowerValue.startsWith(PERIOD_RULE_PREFIX)) {
            return resolveRangeRule(value.substring(PERIOD_RULE_PREFIX.length), period, defaultValue);
        }
    } catch (error) {
        warn("Failed to resolve project attend batch count config", configValue, error);
        return defaultValue;
    }

    warn("Unsupported project attend batch count config", configValue);
    return defaultValue;
}

/**
 * 兼容旧版数字配置。
 *
 * - conVal > 0：直接作为固定批次数。
 * - -11 到 -19：个位数作为学时除数，例如 -12 表示 Math.ceil(period / 2)。
 * - -21 到 -29：个位数作为学分除数，例如 -22 表示 Math.ceil(score / 2)。
 */
function resolveLegacyNumber(conVal, score, period, defaultValue) {
    if (conVal > 0) {
        return conVal;
    }

    if (conVal > -20 && conVal < -10) {
        const divisor = Math.abs(conVal % 10);
        if (isFiniteNumber(period) && divisor > 0) {
            return Math.ceil(period / divisor);
        }
    } else if (conVal > -30 && conVal < -20) {
        const divisor = Math.abs(conVal % 10);
        if (isFiniteNumber(score) && divisor > 0) {
            return Math.ceil(score / divisor);
        }
    }

    return defaultValue;
}

/**
 * 解析区间规则。
 *
 * 规则格式固定为：最小值-最大值=批次数，多个规则用英文逗号分隔。
 * 例如：1-3=2,4-6=4,7-10=8。
 *
 * 注意：这里按业务注释和原单测处理为左右闭区间，1-3 可以匹配 1、2.5、3。
 */
function resolveRangeRule(ruleBody, sourceValue, defaultValue) {
    if (!isFiniteNumber(sourceValue) || ruleBody == null || String(ruleBody).trim() === "") {
        return defaultValue;
    }

    const value = Number(sourceValue);
    const rules = String(ruleBody).split(",");
    for (const rule of rules) {
        const rangeAndCount = rule.trim().split("=");
        if (rangeAndCount.length !== 2) {
            return defaultValue;
        }

        const range = rangeAndCount[0].trim().split("-");
        if (range.length !== 2) {
            return defaultValue;
        }

        const min = toFiniteNumber(range[0].trim());
        const max = toFiniteNumber(range[1].trim());
        const count = toPositiveInteger(rangeAndCount[1].trim());

        if (count == null) {
            return defaultValue;
        }

        // 区间左右边界都包含。
        if (value >= min && value <= max) {
            return count;
        }
    }

    return defaultValue;
}

// 将字符串或数字转换为有限数字；非法值交给外层 catch 后返回默认值。
function toFiniteNumber(value) {
    if (value === "") {
        throw new Error("Number value is empty");
    }
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
        throw new Error(`Invalid number value: ${value}`);
    }
    return numberValue;
}

// 批次数必须是正整数，0、负数、小数和非数字都视为非法配置。
function toPositiveInteger(value) {
    if (!/^\d+$/.test(value)) {
        throw new Error(`Invalid count value: ${value}`);
    }
    const count = parseInt(value, 10);
    return count > 0 ? count : null;
}

// JS 的 Number(null) 为 0，所以这里先排除 null 和空字符串。
function isFiniteNumber(value) {
    return value != null && value !== "" && Number.isFinite(Number(value));
}

// 保持工具函数可独立使用：没有 console 的运行环境中静默降级。
function warn(message, configValue, error) {
    if (typeof console === "undefined" || typeof console.warn !== "function") {
        return;
    }
    if (error) {
        console.warn(`${message}, configValue=${configValue}`, error);
        return;
    }
    console.warn(`${message}, configValue=${configValue}`);
}

const ProjectAttendBatchCountResolver = {
    resolve,
};

// 浏览器环境使用：window.ProjectAttendBatchCountResolver.resolve(...)
if (typeof window !== "undefined") {
    window.ProjectAttendBatchCountResolver = ProjectAttendBatchCountResolver;
}
