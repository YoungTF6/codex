(function (window) {
    var STATE = {
        NOT_SUBMITTED: null,
        COUNTY_PENDING: 30,
        COUNTY_BACK: 31,
        CITY_PENDING: 40,
        CITY_BACK: 41,
        CITY_PASS: 43
    };

    var STATE_TEXT = {};
    STATE_TEXT[STATE.COUNTY_PENDING] = "待区县审核";
    STATE_TEXT[STATE.COUNTY_BACK] = "区县退回";
    STATE_TEXT[STATE.CITY_PENDING] = "待市级审核";
    STATE_TEXT[STATE.CITY_BACK] = "市级退回";
    STATE_TEXT[STATE.CITY_PASS] = "终审通过";

    function normalize(row) {
        if (!row) {
            return null;
        }
        if (row.flowChainState !== undefined && row.flowChainState !== null && row.flowChainState !== "") {
            return parseInt(row.flowChainState, 10);
        }
        if (row.memberState !== undefined && row.memberState !== null && row.memberState !== "") {
            var legacy = parseInt(row.memberState, 10);
            if (legacy === 0) {
                return STATE.CITY_PENDING;
            }
            if (legacy === 1) {
                return STATE.CITY_PASS;
            }
            if (legacy === 2) {
                return STATE.CITY_BACK;
            }
            return legacy;
        }
        return STATE.NOT_SUBMITTED;
    }

    function hasBoolean(row, field) {
        return row && (row[field] === true || row[field] === "true");
    }

    function hasField(row, field) {
        return row && row[field] !== undefined && row[field] !== null;
    }

    function text(row) {
        if (row && row.memberStateName) {
            return row.memberStateName;
        }
        var state = normalize(row);
        if (state === STATE.NOT_SUBMITTED) {
            return "未上报";
        }
        return STATE_TEXT[state] || "";
    }

    function canSubmit(row) {
        if (hasField(row, "canSubmit")) {
            return hasBoolean(row, "canSubmit");
        }
        return normalize(row) === STATE.NOT_SUBMITTED;
    }

    function canResubmit(row) {
        if (hasField(row, "canResubmit")) {
            return hasBoolean(row, "canResubmit");
        }
        var state = normalize(row);
        return state === STATE.COUNTY_BACK || state === STATE.CITY_BACK;
    }

    function canCancel(row) {
        if (hasField(row, "canCancel")) {
            return hasBoolean(row, "canCancel");
        }
        var state = normalize(row);
        return state === STATE.COUNTY_PENDING || state === STATE.CITY_PENDING;
    }

    function canCheck(row) {
        return hasBoolean(row, "canCheck");
    }

    function buildPayload(comPersonId, year, isPass, content) {
        return {
            com_person_id: comPersonId,
            year: year,
            is_pass: isPass,
            content: content || "",
            unit_id: localStorage.getItem("unit-id"),
            userId: localStorage.getItem("user-id")
        };
    }

    function openProgress(row, year, layer, $) {
        if (!row || !row.comPersonId) {
            layer.msg("请选择人员");
            return;
        }
        $.ajax({
            type: "post",
            url: huayi_personorg_url + "memberSubmit/query/progress",
            data: JSON.stringify(buildPayload(row.comPersonId, year, null, "")),
            contentType: "application/json",
            success: function (res) {
                if (res.status !== 200) {
                    layer.msg(res.msg || "获取审核流程失败");
                    return;
                }
                layer.open({
                    type: 1,
                    title: false,
                    area: ["560px", "380px"],
                    content: renderProgress(res.data || [])
                });
            },
            error: function () {
                layer.msg("响应失败");
            }
        });
    }

    function renderProgress(list) {
        if (!list || list.length === 0) {
            return '<div style="padding:36px;text-align:center;color:#999;">暂无审批进度</div>';
        }
        var html = '<style>'
            + '.member-submit-progress{padding:20px 28px 22px 28px;}'
            + '.member-submit-progress-title{text-align:center;font-size:16px;font-weight:600;color:#333;padding-bottom:14px;border-bottom:1px solid #f2f2f2;}'
            + '.member-submit-progress-body{margin:20px auto 0 auto;width:380px;max-width:100%;}'
            + '.member-submit-progress-step{position:relative;display:flex;min-height:70px;}'
            + '.member-submit-progress-step:before{content:"";position:absolute;left:164px;top:18px;bottom:-18px;width:1px;background:#e5e5e5;}'
            + '.member-submit-progress-step:last-child:before{display:none;}'
            + '.member-submit-progress-left{width:150px;padding-right:22px;text-align:right;}'
            + '.member-submit-progress-state{font-size:14px;line-height:20px;color:#999;}'
            + '.member-submit-progress-date{margin-top:5px;font-size:12px;line-height:18px;color:#999;}'
            + '.member-submit-progress-axis{position:relative;z-index:1;width:28px;text-align:center;}'
            + '.member-submit-progress-dot{display:inline-block;width:12px;height:12px;border:2px solid #d8d8d8;border-radius:50%;background:#fff;}'
            + '.member-submit-progress-right{flex:1;padding-left:14px;color:#999;line-height:20px;}'
            + '.member-submit-progress-content{margin-top:6px;color:#d22525;word-break:break-all;}'
            + '.member-submit-progress-step.done .member-submit-progress-state,.member-submit-progress-step.done .member-submit-progress-right{color:#009688;}'
            + '.member-submit-progress-step.done .member-submit-progress-dot{border-color:#009688;}'
            + '.member-submit-progress-step.back .member-submit-progress-state,.member-submit-progress-step.back .member-submit-progress-right{color:#d22525;}'
            + '.member-submit-progress-step.back .member-submit-progress-dot{border-color:#d22525;}'
            + '</style><div class="member-submit-progress">'
            + '<div class="member-submit-progress-title">审批进度</div>'
            + '<div class="member-submit-progress-body">';
        $.each(list, function (_, item) {
            var state = progressText(item.isPass);
            var css = progressClass(item.isPass);
            html += '<div class="member-submit-progress-step ' + css + '">'
                + '<div class="member-submit-progress-left">'
                + '<div class="member-submit-progress-state">' + escapeHtml(state) + '</div>'
                + '<div class="member-submit-progress-date">' + escapeHtml(formatDate(item.updateTime)) + '</div>'
                + '</div>'
                + '<div class="member-submit-progress-axis"><span class="member-submit-progress-dot"></span></div>'
                + '<div class="member-submit-progress-right">'
                + '<div>' + escapeHtml(item.unitname || "") + '</div>'
                + (item.content ? '<div class="member-submit-progress-content">' + escapeHtml(item.content) + '</div>' : '')
                + '</div>'
                + '</div>';
        });
        return html + '</div></div>';
    }

    function progressText(state) {
        if (state === 0) {
            return "已提交";
        }
        if (state === 1 || state === 31 || state === 41) {
            return "退回修改";
        }
        if (state === 2) {
            return "审核不通过";
        }
        if (state === 3 || state === 33 || state === 43) {
            return "审核通过";
        }
        return "待审核";
    }

    function progressClass(state) {
        if (state === 0 || state === 3 || state === 33 || state === 43) {
            return "done";
        }
        if (state === 1 || state === 2 || state === 31 || state === 41) {
            return "back";
        }
        return "pending";
    }

    function formatDate(value) {
        if (!value) {
            return "";
        }
        return String(value).substring(0, 10);
    }

    function escapeHtml(value) {
        if (value === undefined || value === null) {
            return "";
        }
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    window.MemberSubmitState = {
        STATE: STATE,
        normalize: normalize,
        text: text,
        canSubmit: canSubmit,
        canResubmit: canResubmit,
        canCancel: canCancel,
        canCheck: canCheck,
        openProgress: openProgress,
        canSelectForSubmit: function (row) {
            return canSubmit(row);
        },
        canSelectForCheck: function (row) {
            return canCheck(row);
        },
        buildPayload: buildPayload
    };
})(window);
