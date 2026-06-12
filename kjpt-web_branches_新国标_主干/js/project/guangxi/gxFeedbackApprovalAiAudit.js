/**
 * 广西套省厅 · AI 审核参考意见 tab（渲染 + 轮询）
 */
(function (window) {
    'use strict';

    var host = null;
    var pollTimer = null;
    var pollStartAt = 0;
    var pollIntervalMs = 5000;
    var pollMaxMs = 300000;

    function init(hostApi) {
        host = hostApi;
    }

    function escapeHtml(str) {
        if (str == null) {
            return '';
        }
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function renderEmpty(msg) {
        host.$('#gxAiAuditContent').html(
            '<div class="gx-ai-audit-empty">' + (msg || '暂无数据') + '</div>'
        );
    }

    function buildMetrics(leftLabel, leftValue, rightLabel, rightValue, withPersonUnit, rightValueClass, leftValueClass) {
        var suffix = withPersonUnit === false ? '' : '人';
        var fmt = function (v) {
            if (v == null || v === '') {
                return suffix ? '0' + suffix : '—';
            }
            return escapeHtml(String(v)) + suffix;
        };
        var leftClass = 'gx-ai-audit-metric-value' + (leftValueClass ? ' ' + leftValueClass : '');
        var rightClass = 'gx-ai-audit-metric-value' + (rightValueClass ? ' ' + rightValueClass : '');
        return '<div class="gx-ai-audit-metrics">' +
            '<div class="gx-ai-audit-metric"><span class="gx-ai-audit-metric-label">' + escapeHtml(leftLabel) + '</span>' +
            '<span class="' + leftClass + '">' + fmt(leftValue) + '</span></div>' +
            '<div class="gx-ai-audit-metric"><span class="gx-ai-audit-metric-label">' + escapeHtml(rightLabel) + '</span>' +
            '<span class="' + rightClass + '">' + fmt(rightValue) + '</span></div>' +
            '</div>';
    }

    /** 红色三角警告图标（内含叹号） */
    function buildWarnTriangleIcon() {
        return '<span class="gx-ai-audit-warn-triangle" aria-hidden="true">' +
            '<span class="gx-ai-audit-warn-triangle-mark">!</span></span>';
    }

    /** 明细卡卡头左侧小图标（与汇总区风格一致） */
    function buildCardHeadIcon(cardClass, itemCode) {
        var wrapClass = 'gx-ai-audit-card-icon-wrap-normal';
        if (cardClass.indexOf('gx-ai-audit-card-abnormal') >= 0) {
            wrapClass = 'gx-ai-audit-card-icon-wrap-abnormal';
        } else if (cardClass.indexOf('gx-ai-audit-card-pending') >= 0) {
            wrapClass = 'gx-ai-audit-card-icon-wrap-pending';
        }
        var iconHtml = '';
        if (itemCode === 'UNIT_SCORE_RATIO') {
            iconHtml = '<span class="gx-ai-audit-card-icon-text">%</span>';
        } else if (itemCode === 'TEACHER_PHOTO_UPLOAD') {
            iconHtml = '<i class="layui-icon layui-icon-camera"></i>';
        } else if (itemCode === 'TEACHER_TURNOVER') {
            iconHtml = '<i class="layui-icon layui-icon-user"></i>';
        } else if (itemCode === 'PROJECT_MANAGER_IN_LIST') {
            iconHtml = '<i class="layui-icon layui-icon-vercode"></i>';
        } else {
            iconHtml = '<i class="layui-icon layui-icon-form"></i>';
        }
        return '<span class="gx-ai-audit-card-icon-wrap ' + wrapClass + '">' + iconHtml + '</span>';
    }

    function wrapInnerPanel(contentHtml, isAbnormal) {
        var panelClass = isAbnormal
            ? 'gx-ai-audit-inner-panel-abnormal'
            : 'gx-ai-audit-inner-panel-normal';
        return '<div class="gx-ai-audit-inner-panel ' + panelClass + '">' + contentHtml + '</div>';
    }

    function buildProgressScale(labels) {
        if (!labels || !labels.length) {
            return '';
        }
        var html = '<div class="gx-ai-audit-progress-scale">';
        for (var i = 0; i < labels.length; i++) {
            html += '<span>' + escapeHtml(labels[i]) + '</span>';
        }
        html += '</div>';
        return html;
    }

    function buildAlert(mainText, extraRight) {
        var extraHtml = extraRight
            ? '<span class="gx-ai-audit-alert-extra">' + escapeHtml(extraRight) + '</span>'
            : '';
        return '<div class="gx-ai-audit-alert">' +
            buildWarnTriangleIcon() +
            '<span class="gx-ai-audit-alert-text">' + escapeHtml(mainText) + '</span>' +
            extraHtml + '</div>';
    }

    function buildPrincipalAbnormalPanel(principals) {
        var html = buildAlert('项目负责人未在授课教师列表中', '');
        html += '<div class="gx-ai-audit-principal-list">';
        for (var i = 0; i < principals.length; i++) {
            var p = principals[i];
            html += '<div class="gx-ai-audit-principal-line">负责人姓名：' +
                escapeHtml(p.personName || '—') + '</div>';
            html += '<div class="gx-ai-audit-principal-line">身份证号：' +
                escapeHtml(p.idcardno || '—') + '</div>';
        }
        html += '</div>';
        return wrapInnerPanel(html, true);
    }

    function buildProgressBlock(progressLabel, rate, scaleLabels, showThresholdTick, isAbnormal, overThresholdTag) {
        var safeRate = rate == null ? 0 : rate;
        var width = Math.min(100, Math.max(0, safeRate));
        var barClass = isAbnormal ? 'gx-ai-audit-bar-abnormal' : 'gx-ai-audit-bar-normal';
        var titleClass = isAbnormal
            ? 'gx-ai-audit-progress-title-abnormal'
            : 'gx-ai-audit-progress-title-normal';
        var labelText = (progressLabel || '') + ': ' + safeRate + '%';
        var tickHtml = '';
        if (showThresholdTick) {
            tickHtml = '<span class="gx-ai-audit-threshold-tick" style="left:30%"></span>';
            if (overThresholdTag) {
                tickHtml += '<span class="gx-ai-audit-threshold-label" style="left:30%">已超30%</span>';
            }
        }
        return '<div class="gx-ai-audit-progress-wrap">' +
            '<div class="gx-ai-audit-progress-title ' + titleClass + '">' + escapeHtml(labelText) + '</div>' +
            '<div class="gx-ai-audit-progress gx-ai-audit-progress-thick">' +
            '<div class="gx-ai-audit-bar ' + barClass + '" style="width:' + width + '%"></div>' +
            tickHtml + '</div>' +
            buildProgressScale(scaleLabels) +
            '</div>';
    }

    function buildItemCard(item) {
        if (!item) {
            return '';
        }
        var isAbnormal = item.status === 'ABNORMAL';
        var cardClass = isAbnormal ? 'gx-ai-audit-card-abnormal' : 'gx-ai-audit-card-normal';
        var ruleDesc = item.ruleDescription || '';
        var bodyHtml = '';
        var headTagsHtml = '';

        if (item.code === 'TEACHER_TURNOVER') {
            var showOverTag = isAbnormal && item.tags && item.tags.indexOf('已超30%') >= 0;
            if (showOverTag) {
                headTagsHtml = '<span class="gx-ai-audit-tag">已超30%</span>';
            }
            var changeCountClass = isAbnormal
                ? 'gx-ai-audit-metric-value-abnormal'
                : 'gx-ai-audit-metric-value-normal';
            bodyHtml += wrapInnerPanel(buildProgressBlock(
                item.progressLabel || '当前变动率', item.rate,
                ['0%', '30%', '100%'], true, isAbnormal, showOverTag), isAbnormal);
            bodyHtml += buildMetrics(
                '项目申报书教师人数', item.declarationTeacherCount,
                '实际变动人数', item.changeCount, true, changeCountClass);
            if (item.message) {
                bodyHtml += '<div class="gx-ai-audit-boundary-hint">' + escapeHtml(item.message) + '</div>';
            }
        } else if (item.code === 'ATTENDANCE_CONSISTENCY') {
            var recStatus = item.attendanceRecognizeStatus || '';
            if (recStatus === 'PENDING') {
                isAbnormal = false;
                cardClass = 'gx-ai-audit-card-normal gx-ai-audit-card-pending';
                var progressHint = item.attendanceRecognizeProgress
                    ? '（' + escapeHtml(item.attendanceRecognizeProgress) + '）' : '';
                bodyHtml += wrapInnerPanel(
                    '<div class="gx-ai-audit-attendance-pending">' +
                    escapeHtml(item.message || '签到表识别中…') + progressHint +
                    '</div>', false);
            } else if (recStatus === 'FAILED') {
                isAbnormal = false;
                cardClass = 'gx-ai-audit-card-normal';
                bodyHtml += wrapInnerPanel(
                    '<div class="gx-ai-audit-attendance-failed">' +
                    escapeHtml(item.message || '签到表暂无法识别，请人工核对') + '</div>', false);
            } else {
                if (isAbnormal) {
                    bodyHtml += wrapInnerPanel(
                        buildAlert('人数不一致',
                            '差异: ' + (item.attendanceDiffCount == null ? 0 : item.attendanceDiffCount) + '人'),
                        true);
                }
                var leftIdentifiedClass = isAbnormal ? 'gx-ai-audit-metric-value-abnormal' : '';
                bodyHtml += buildMetrics(
                    '签到表识别人数', item.attendanceIdentifiedCount,
                    '授分人员名单人数', item.scoreListCount, true, '', leftIdentifiedClass);
                if (item.message && !isAbnormal) {
                    bodyHtml += '<div class="gx-ai-audit-boundary-hint">' + escapeHtml(item.message) + '</div>';
                }
            }
        } else if (item.code === 'PROJECT_MANAGER_IN_LIST') {
            if (isAbnormal && item.abnormalPrincipals && item.abnormalPrincipals.length) {
                bodyHtml += buildPrincipalAbnormalPanel(item.abnormalPrincipals);
            } else if (item.message) {
                bodyHtml += wrapInnerPanel(
                    '<div class="gx-ai-audit-boundary-hint">' + escapeHtml(item.message) + '</div>', false);
            }
        } else if (item.code === 'TEACHER_PHOTO_UPLOAD') {
            var uploadedClass = isAbnormal
                ? 'gx-ai-audit-metric-value-abnormal'
                : 'gx-ai-audit-metric-value-normal';
            bodyHtml += wrapInnerPanel(buildProgressBlock(
                item.progressLabel || '上传完成率', item.completionRate,
                ['0%', '50%', '100%'], false, isAbnormal, false), isAbnormal);
            bodyHtml += buildMetrics(
                '应上传教师数', item.requiredUploadCount,
                '已上传人数', item.uploadedCount, true, uploadedClass);
            if (item.message) {
                bodyHtml += '<div class="gx-ai-audit-boundary-hint">' + escapeHtml(item.message) + '</div>';
            }
        } else if (item.code === 'UNIT_SCORE_RATIO') {
            var ratioOverTag = isAbnormal && item.tags && item.tags.indexOf('已超30%') >= 0;
            if (ratioOverTag) {
                headTagsHtml = '<span class="gx-ai-audit-tag">已超30%</span>';
            }
            bodyHtml += wrapInnerPanel(buildProgressBlock(
                item.progressLabel || '当前占比', item.rate,
                ['0%', '30%', '100%'], true, isAbnormal, ratioOverTag), isAbnormal);
            bodyHtml += buildMetrics(
                '本单位授分人数', item.unitScoreCount,
                '总授分人数', item.totalScoreCount);
            if (item.message) {
                bodyHtml += '<div class="gx-ai-audit-boundary-hint">' + escapeHtml(item.message) + '</div>';
            }
        } else if (item.message) {
            bodyHtml += '<div class="gx-ai-audit-boundary-hint">' + escapeHtml(item.message) + '</div>';
        }

        var statusLabel = isAbnormal ? '异常' : '正常';
        if (item.code === 'ATTENDANCE_CONSISTENCY') {
            if (item.attendanceRecognizeStatus === 'PENDING') {
                statusLabel = '识别中';
            } else if (item.attendanceRecognizeStatus === 'FAILED') {
                statusLabel = '—';
            }
        }
        return '<div class="gx-ai-audit-card ' + cardClass + '">' +
            '<div class="gx-ai-audit-card-head">' +
            buildCardHeadIcon(cardClass, item.code) +
            '<span class="gx-ai-audit-card-title">' + escapeHtml(item.title) + '</span>' +
            '<span class="gx-ai-audit-card-status">' + statusLabel + '</span>' +
            headTagsHtml +
            '</div>' +
            (ruleDesc ? '<div class="gx-ai-audit-rule-desc">' + escapeHtml(ruleDesc) + '</div>' : '') +
            bodyHtml + '</div>';
    }

    function stopPoll() {
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
    }

    function needsAttendancePoll(data) {
        var items = data && data.items ? data.items : [];
        for (var i = 0; i < items.length; i++) {
            if (items[i].code === 'ATTENDANCE_CONSISTENCY'
                && items[i].attendanceRecognizeStatus === 'PENDING') {
                return true;
            }
        }
        return false;
    }

    function renderOpinion(data, event) {
        if (!data || data.snapshotExists === false) {
            stopPoll();
            renderEmpty(data && data.message ? data.message : '暂无审核意见');
            return;
        }
        var summary = data.summary || { normalCount: 0, abnormalCount: 0 };
        var html = '';
        if (data.regenerated === true) {
            html += '<div class="gx-ai-audit-regenerated-hint">本次已根据最新数据更新审核意见</div>';
        }
        html += '<div class="gx-ai-audit-summary">' +
            '<div class="gx-ai-audit-summary-card gx-ai-audit-summary-normal">' +
            '<div class="gx-ai-audit-summary-main">' +
            '<span class="gx-ai-audit-summary-icon-wrap gx-ai-audit-icon-wrap-ok"><span class="gx-ai-audit-summary-icon gx-ai-audit-icon-ok">✓</span></span>' +
            '<div class="gx-ai-audit-summary-text">' +
            '<div class="gx-ai-audit-summary-label">正常项</div>' +
            '<div class="gx-ai-audit-summary-num">' + (summary.normalCount || 0) + '</div>' +
            '<div class="gx-ai-audit-summary-hint">符合标准要求</div>' +
            '</div></div></div>' +
            '<div class="gx-ai-audit-summary-card gx-ai-audit-summary-abnormal">' +
            '<div class="gx-ai-audit-summary-main">' +
            '<span class="gx-ai-audit-summary-icon-wrap gx-ai-audit-icon-wrap-warn"><span class="gx-ai-audit-summary-icon gx-ai-audit-icon-warn">▲</span></span>' +
            '<div class="gx-ai-audit-summary-text">' +
            '<div class="gx-ai-audit-summary-label">异常项</div>' +
            '<div class="gx-ai-audit-summary-num">' + (summary.abnormalCount || 0) + '</div>' +
            '<div class="gx-ai-audit-summary-hint">需重点关注</div>' +
            '</div></div></div></div>';
        var items = data.items || [];
        html += '<div class="gx-ai-audit-items">';
        for (var j = 0; j < items.length; j++) {
            html += buildItemCard(items[j]);
        }
        html += '</div>';
        host.$('#gxAiAuditContent').html(html);
        if (needsAttendancePoll(data)) {
            startPoll(event);
        } else {
            stopPoll();
        }
    }

    function loadSilent(event) {
        var downId = host.getNowDownId();
        if (!downId) {
            return;
        }
        var readOnly = event !== 'approval';
        host.commonAjaxSilent('post', huayi_projectscore_url + 'cmeProjFeedbackFile/getAiAuditOpinion',
            { downId: downId, readOnly: readOnly },
            function () { },
            function (res) {
                if (!host.isSuccessResponse(res)) {
                    return;
                }
                renderOpinion(res.data || {}, event);
            }
        );
    }

    function startPoll(event) {
        stopPoll();
        pollStartAt = Date.now();
        pollTimer = setInterval(function () {
            if (Date.now() - pollStartAt >= pollMaxMs) {
                stopPoll();
                return;
            }
            loadSilent(event);
        }, pollIntervalMs);
    }

    function loadOpinion(event) {
        var downId = host.getNowDownId();
        if (!downId) {
            return;
        }
        var readOnly = event !== 'approval';
        stopPoll();
        renderEmpty('加载中…');
        host.commonAjaxSilent('post', huayi_projectscore_url + 'cmeProjFeedbackFile/getAiAuditOpinion',
            { downId: downId, readOnly: readOnly },
            function () { renderEmpty('加载失败'); },
            function (res) {
                if (!host.isSuccessResponse(res)) {
                    renderEmpty(host.getResponseMsg(res, '加载失败'));
                    return;
                }
                renderOpinion(res.data || {}, event);
            }
        );
    }

    /** 在授分人员与教材 tab 之间插入 AI 审核 tab */
    function ensureTab() {
        var $tabs = host.$('.js-tabs');
        var $existing = $tabs.find('li[data-type="js-project-ai-audit"]');
        if ($existing.length) {
            return;
        }
        var $peopleTab = $tabs.find('li[data-type="js-project-people"]');
        if (!$peopleTab.length) {
            return;
        }
        $peopleTab.after('<li class="tab-default gx-ai-audit-tab" data-type="js-project-ai-audit">AI审核参考意见</li>');
        host.element.render('tab');
    }

    function removeTab() {
        host.$('.js-tabs li[data-type="js-project-ai-audit"]').remove();
    }

    function handleTabDataLoad(dataType) {
        if (dataType !== 'js-project-ai-audit') {
            return false;
        }
        host.$('.js-project-ai-audit').attr('data-id', host.getNowDownId());
        return true;
    }

    function cleanup() {
        stopPoll();
        removeTab();
        host.$('#gxAiAuditContent').empty();
        host.$('.js-project-ai-audit').addClass('js-hidden');
    }

    window.GxFeedbackApprovalAiAudit = {
        init: init,
        ensureTab: ensureTab,
        loadOpinion: loadOpinion,
        handleTabDataLoad: handleTabDataLoad,
        cleanup: cleanup,
        stopPoll: stopPoll
    };
})(window);
