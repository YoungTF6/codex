/**
 * 广东套签到/签退二维码时间窗：读取公共配置阈值，仅在前端校验开码时间（本期后端不做时间窗校验）。
 */
(function (global) {
    var GUANG_DONG_KIND_ID = '289bf0ca-52cb-4b19-b737-9bd200a69ce1';
    var CONFIG_SIGN_IN_EARLY = 'value_attend_sign_in_early_minutes';
    var CONFIG_SIGN_OUT_LATE = 'value_attend_sign_out_late_minutes';

    function parseMinutes(val) {
        var n = parseInt(val, 10);
        return isNaN(n) || n < 0 ? 0 : n;
    }

    function parseAttendTimeToMillis(timeValue) {
        if (timeValue === null || timeValue === undefined || timeValue === '') {
            return NaN;
        }
        if (/^\d+$/.test(String(timeValue))) {
            return parseInt(timeValue, 10);
        }
        var m = moment(timeValue);
        return m.isValid() ? m.valueOf() : NaN;
    }

    function isGuangdongSignInOutPage(standardKindId) {
        return String(standardKindId) === GUANG_DONG_KIND_ID;
    }

    /**
     * 从 getConfig 写入的全局变量读取阈值（需在 configNames 中包含两项字典编码）。
     */
    function getThresholdMinutes() {
        return {
            signInEarlyMinutes: parseMinutes(global[CONFIG_SIGN_IN_EARLY]),
            signOutLateMinutes: parseMinutes(global[CONFIG_SIGN_OUT_LATE])
        };
    }

    function isWithinSignInWindow(nowMillis, startMillis, endMillis, signInEarlyMinutes) {
        var earlyMs = signInEarlyMinutes * 60000;
        return nowMillis >= startMillis - earlyMs && nowMillis <= endMillis;
    }

    function isWithinSignOutWindow(nowMillis, startMillis, endMillis, signOutLateMinutes) {
        var lateMs = signOutLateMinutes * 60000;
        return nowMillis >= startMillis && nowMillis <= endMillis + lateMs;
    }

    /**
     * 校验是否允许打开签到二维码。
     */
    function validateSignInQrOpenWindow(projAttendBatch, standardKindId, layer) {
        if (!isGuangdongSignInOutPage(standardKindId)) {
            return validateLegacyBatchRange(projAttendBatch, layer);
        }
        return validateBatchWindow(projAttendBatch, 'signIn', standardKindId, layer);
    }

    /**
     * 校验是否允许打开签退二维码。
     */
    function validateSignOutQrOpenWindow(projAttendBatch, standardKindId, layer) {
        if (!isGuangdongSignInOutPage(standardKindId)) {
            return validateLegacyBatchRange(projAttendBatch, layer);
        }
        return validateBatchWindow(projAttendBatch, 'signOut', standardKindId, layer);
    }

    function validateBatchWindow(projAttendBatch, mode, standardKindId, layer) {
        if (!projAttendBatch) {
            layer.msg('当前时间段数据异常', { icon: 2, time: 1500 });
            return false;
        }
        var startMillis = parseAttendTimeToMillis(projAttendBatch.startDate);
        var endMillis = parseAttendTimeToMillis(projAttendBatch.endDate);
        if (isNaN(startMillis) || isNaN(endMillis)) {
            layer.msg('当前时间段时间格式有误', { icon: 2, time: 1500 });
            return false;
        }
        var thresholds = getThresholdMinutes();
        var nowMillis = new Date().getTime();
        var ok = mode === 'signIn'
            ? isWithinSignInWindow(nowMillis, startMillis, endMillis, thresholds.signInEarlyMinutes)
            : isWithinSignOutWindow(nowMillis, startMillis, endMillis, thresholds.signOutLateMinutes);
        if (!ok) {
            layer.msg(mode === 'signIn'
                ? '当前时间不在允许打开签到二维码的时间范围内'
                : '当前时间不在允许打开签退二维码的时间范围内', { icon: 2, time: 2000 });
            return false;
        }
        return true;
    }

    /**
     * 举办/考勤设置：当前时间是否已超过最后批次可操作截止（广东套含签退推迟分钟）。
     */
    function isBeyondLastBatchHoldWindow(lastBatch, standardKindId) {
        if (!lastBatch) {
            return false;
        }
        var endMillis = typeof lastBatch.endDate === 'number'
            ? lastBatch.endDate
            : parseAttendTimeToMillis(lastBatch.endDate);
        if (isNaN(endMillis)) {
            return false;
        }
        var nowMillis = new Date().getTime();
        if (isGuangdongSignInOutPage(standardKindId)) {
            var thresholds = getThresholdMinutes();
            return nowMillis > endMillis + thresholds.signOutLateMinutes * 60000;
        }
        return nowMillis > endMillis;
    }

    /**
     * 考勤设置：按批次（含广东签到提前/签退推迟）解析当前应关联的 batchId。
     */
    function resolveCurrentBatchIdForAttendConfig(attendBatchList, standardKindId) {
        if (!attendBatchList || !attendBatchList.length) {
            return null;
        }
        var nowMillis = new Date().getTime();
        var gd = isGuangdongSignInOutPage(standardKindId);
        var thresholds = getThresholdMinutes();
        var i;
        for (i = 0; i < attendBatchList.length; i++) {
            var startMillis = parseAttendTimeToMillis(attendBatchList[i].startDate);
            var endMillis = parseAttendTimeToMillis(attendBatchList[i].endDate);
            if (isNaN(startMillis) || isNaN(endMillis)) {
                continue;
            }
            var windowStart = gd ? startMillis - thresholds.signInEarlyMinutes * 60000 : startMillis;
            var windowEnd = gd ? endMillis + thresholds.signOutLateMinutes * 60000 : endMillis;
            if (nowMillis >= windowStart && nowMillis <= windowEnd) {
                return attendBatchList[i].batchId;
            }
        }
        if (!gd) {
            for (i = 0; i < attendBatchList.length; i++) {
                if (i === 0) {
                    if (nowMillis < parseAttendTimeToMillis(attendBatchList[0].startDate)) {
                        return attendBatchList[0].batchId;
                    }
                } else {
                    var prevEnd = parseAttendTimeToMillis(attendBatchList[i - 1].endDate);
                    var nextStart = parseAttendTimeToMillis(attendBatchList[i].startDate);
                    if (nowMillis > prevEnd && nowMillis < nextStart) {
                        return attendBatchList[i].batchId;
                    }
                }
            }
        }
        return null;
    }

    /** 非广东套：保持原严格批次内校验 */
    function validateLegacyBatchRange(projAttendBatch, layer) {
        if (!projAttendBatch) {
            layer.msg('当前时间段数据异常', { icon: 2, time: 1500 });
            return false;
        }
        var startMillis = parseAttendTimeToMillis(projAttendBatch.startDate);
        var endMillis = parseAttendTimeToMillis(projAttendBatch.endDate);
        if (isNaN(startMillis) || isNaN(endMillis)) {
            layer.msg('当前时间段时间格式有误', { icon: 2, time: 1500 });
            return false;
        }
        var nowMillis = new Date().getTime();
        if (nowMillis < startMillis || nowMillis > endMillis) {
            layer.msg('当前时间不在本时间段开始和结束时间范围内', { icon: 2, time: 1500 });
            return false;
        }
        return true;
    }

    global.AttendSignInOutThreshold = {
        CONFIG_SIGN_IN_EARLY: CONFIG_SIGN_IN_EARLY,
        CONFIG_SIGN_OUT_LATE: CONFIG_SIGN_OUT_LATE,
        isGuangdongSignInOutPage: isGuangdongSignInOutPage,
        isBeyondLastBatchHoldWindow: isBeyondLastBatchHoldWindow,
        resolveCurrentBatchIdForAttendConfig: resolveCurrentBatchIdForAttendConfig,
        validateSignInQrOpenWindow: validateSignInQrOpenWindow,
        validateSignOutQrOpenWindow: validateSignOutQrOpenWindow,
        validateLegacyBatchRange: validateLegacyBatchRange
    };
})(window);
