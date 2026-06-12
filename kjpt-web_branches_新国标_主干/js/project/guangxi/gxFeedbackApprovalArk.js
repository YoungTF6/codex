/**
 * 广西套省厅 · 现场照方舟 AI 识别人数
 */
(function (window) {
    'use strict';

    var host = null;
    var sceneFileType = 2;
    var pollIntervalMs = 20000;
    var pollMaxMs = 120000;
    var minDisplayDelayMs = 15000;
    var hintText = '受照片拍摄质量影响，识别人数略有出入，仅供参考';

    var pollTimer = null;
    var pollDelayTimer = null;
    var pollStartAt = 0;
    var clickAt = 0;
    var dialogEvent = '';
    var recognizing = false;
    var lastListItems = [];
    var revealedBeforeClick = {};

    function init(hostApi) {
        host = hostApi;
    }

    function stopPoll() {
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
        if (pollDelayTimer) {
            clearTimeout(pollDelayTimer);
            pollDelayTimer = null;
        }
    }

    function snapshotRevealedIds(items) {
        var map = {};
        if (!items || !items.length) {
            return map;
        }
        for (var i = 0; i < items.length; i++) {
            if (items[i].headCountRevealed == 1) {
                map[items[i].feedbackFileId] = true;
            }
        }
        return map;
    }

    function shouldShowArkButton(event, data) {
        if (event === 'approval') {
            return true;
        }
        if (event === 'view' && data) {
            return !!(data.hasUnrecognized || data.hasUnrevealedSuccess);
        }
        return false;
    }

    function shouldShowArkItem(item) {
        if (!item || item.headCountRevealed != 1) {
            return false;
        }
        if (dialogEvent === 'view') {
            return true;
        }
        if (clickAt === 0 || revealedBeforeClick[item.feedbackFileId]) {
            return true;
        }
        return Date.now() - clickAt >= minDisplayDelayMs;
    }

    function getSceneSection() {
        return host.$('.js-project-image ul.js-feedback' + sceneFileType).closest('.meeting-notice');
    }

    function unwrapTitleRow() {
        getSceneSection().find('.js-ark-title-row').each(function () {
            var $row = host.$(this);
            $row.find('.js-ark-head-count-actions, .js-ark-head-count-btn, .js-ark-head-count-hint-title').remove();
            $row.children('.file-title').insertBefore($row);
            $row.remove();
        });
    }

    function ensureButton(showButton) {
        var $section = getSceneSection();
        if (!$section.length) {
            return;
        }
        $section.find('.js-ark-head-count-actions, .js-ark-head-count-btn, .js-ark-head-count-hint-title').remove();
        var $title = $section.find('.file-title').first();
        if (!$title.length) {
            return;
        }
        var $row = $title.parent('.js-ark-title-row');
        if (!$row.length) {
            $title.wrap('<span class="js-ark-title-row"></span>');
            $row = $title.parent();
        }
        if (showButton) {
            $title.after(
                '<span class="js-ark-head-count-actions">' +
                '<button type="button" class="layui-btn layui-btn-xs layui-btn-normal js-ark-head-count-btn">AI识别人数</button>' +
                '</span>'
            );
            $row.find('.js-ark-head-count-btn').off('click').on('click', onHeadCountClick);
        }
        var $anchor = showButton ? $row.find('.js-ark-head-count-actions') : $title;
        $anchor.after(
            '<span class="js-ark-head-count-hint js-ark-head-count-hint-title">' + hintText + '</span>'
        );
    }

    function formatCountLabel(item) {
        if (!item || item.headCountRevealed != 1) {
            return '';
        }
        if (item.status === 'SUCCESS') {
            if (item.headCount === null || item.headCount === undefined) {
                return '0人';
            }
            return item.headCount + '人';
        }
        if (item.status === 'FAILED' || item.status === 'EXPIRED') {
            return '识别失败';
        }
        return '';
    }

    function renderHeadCounts(items) {
        if (!items || !items.length) {
            return;
        }
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var $li = host.$('li[file-id="' + item.feedbackFileId + '"]');
            if (!$li.length) {
                continue;
            }
            var $span = $li.find('.js-ark-head-count');
            if (!$span.length) {
                $li.append('<span class="js-ark-head-count" style="margin-left:8px;color:#d9001b;"></span>');
                $span = $li.find('.js-ark-head-count');
            }
            if (!shouldShowArkItem(item)) {
                $span.text('');
                continue;
            }
            $span.text(formatCountLabel(item));
        }
    }

    function updateButtonState(data) {
        if (!data) {
            return;
        }
        var $btn = getSceneSection().find('.js-ark-head-count-btn');
        if (!$btn.length) {
            return;
        }
        if (recognizing) {
            $btn.text('识别中').addClass('layui-btn-disabled').prop('disabled', true);
            return;
        }
        if (data.retryExhausted && !data.hasUnrecognized) {
            $btn.text('已达重试上限').addClass('layui-btn-disabled').prop('disabled', true);
            return;
        }
        if (!data.hasUnrecognized && !data.hasUnrevealedSuccess) {
            $btn.text('已识别').addClass('layui-btn-disabled').prop('disabled', true);
            return;
        }
        $btn.text('AI识别人数').removeClass('layui-btn-disabled').prop('disabled', false);
    }

    function applyListData(data) {
        if (!data) {
            return;
        }
        var items = data.items || [];
        lastListItems = items;
        renderHeadCounts(items);
        var showBtn = shouldShowArkButton(dialogEvent, data);
        ensureButton(showBtn);
        if (showBtn) {
            updateButtonState(data);
        }
    }

    function fetchList(successFun) {
        host.commonAjaxSilent('post', huayi_projectscore_url + 'cmeProjFeedbackFile/listArkHeadCount',
            { downId: host.getNowDownId() },
            function () { },
            function (res) {
                successFun(res.data || {});
            }
        );
    }

    function loadHeadCount(event) {
        var downId = host.getNowDownId();
        if (!downId) {
            return;
        }
        dialogEvent = event || dialogEvent;
        fetchList(function (data) {
            applyListData(data);
        });
    }

    function refreshAfterClick() {
        host.commonAjaxSilent('post', huayi_projectscore_url + 'cmeProjFeedbackFile/revealArkHeadCount',
            { downId: host.getNowDownId() },
            function () {
                recognizing = false;
                loadHeadCount('approval');
            },
            function () {
                fetchList(function (data) {
                    applyListData(data);
                    var terminal = !data.hasUnrecognized && !data.hasUnrevealedSuccess;
                    if (terminal || Date.now() - pollStartAt >= pollMaxMs) {
                        recognizing = false;
                        stopPoll();
                        if (!terminal && Date.now() - pollStartAt >= pollMaxMs) {
                            host.layer.msg('识别超时，请稍后刷新重试');
                        }
                    }
                });
            }
        );
    }

    function startPoll() {
        stopPoll();
        pollStartAt = Date.now();
        var tick = function () {
            if (Date.now() - clickAt < minDisplayDelayMs) {
                return;
            }
            refreshAfterClick();
        };
        pollDelayTimer = setTimeout(tick, minDisplayDelayMs);
        pollTimer = setInterval(tick, pollIntervalMs);
    }

    function onHeadCountClick() {
        if (recognizing) {
            return;
        }
        revealedBeforeClick = snapshotRevealedIds(lastListItems);
        recognizing = true;
        clickAt = Date.now();
        var $btn = getSceneSection().find('.js-ark-head-count-btn');
        $btn.text('识别中').addClass('layui-btn-disabled').prop('disabled', true);
        var ut = window.GxFeedbackApprovalGate.resolveUnitUserType(host.getUnitUserType());
        host.commonAjaxSilent('post', huayi_projectscore_url + 'cmeProjFeedbackFile/revealArkHeadCount',
            { downId: host.getNowDownId() },
            function () {
                recognizing = false;
                host.layer.msg('揭示失败');
                loadHeadCount('approval');
            },
            function () {
                host.commonAjaxSilent('post', huayi_projectscore_url + 'cmeProjFeedbackFile/triggerArkHeadCount',
                    { downId: host.getNowDownId(), unitUserType: ut },
                    function () {
                        recognizing = false;
                        host.layer.msg('识别触发失败');
                        loadHeadCount('approval');
                    },
                    function () {
                        startPoll();
                    }
                );
            }
        );
    }

    function onFeedbackFilesLoaded(event) {
        dialogEvent = event;
        ensureButton(event === 'approval');
        loadHeadCount(event);
    }

    function cleanup() {
        stopPoll();
        recognizing = false;
        clickAt = 0;
        dialogEvent = '';
        lastListItems = [];
        revealedBeforeClick = {};
        host.$('.js-ark-head-count-actions, .js-ark-head-count-btn, .js-ark-head-count-hint-title').remove();
        unwrapTitleRow();
    }

    window.GxFeedbackApprovalArk = {
        init: init,
        onFeedbackFilesLoaded: onFeedbackFilesLoaded,
        cleanup: cleanup,
        stopPoll: stopPoll
    };
})(window);
