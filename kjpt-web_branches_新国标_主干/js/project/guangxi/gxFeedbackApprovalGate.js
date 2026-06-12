/**
 * 广西套省厅 · 执行情况反馈审批扩展 gate
 */
(function (window) {
    'use strict';

    var guangxiStandardKindId = '4a6d91fb-8ba4-4560-a801-9c6f00e6d999';
    var provinceUnitUserType = 5;

    /** 解析单位用户类型：优先表格行，其次 localStorage */
    function resolveUnitUserType(unitUserType) {
        var rowType = parseInt(unitUserType, 10);
        if (!isNaN(rowType) && rowType > 0) {
            return rowType;
        }
        var ls = parseInt(localStorage.getItem('unit-user-type'), 10);
        return isNaN(ls) ? 0 : ls;
    }

    /** 是否广西套省厅（现场照 AI + AI 审核参考意见） */
    function isEnabled(userStandardkindId, unitUserType) {
        return userStandardkindId === guangxiStandardKindId
            && resolveUnitUserType(unitUserType) === provinceUnitUserType;
    }

    window.GxFeedbackApprovalGate = {
        guangxiStandardKindId: guangxiStandardKindId,
        provinceUnitUserType: provinceUnitUserType,
        resolveUnitUserType: resolveUnitUserType,
        isEnabled: isEnabled
    };
})(window);
