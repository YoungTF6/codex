/**
 * 广西套省厅 · 执行情况反馈审批扩展桥接层
 */
(function (window) {
    'use strict';

    var host = null;
    var gate = window.GxFeedbackApprovalGate;
    var aiAudit = window.GxFeedbackApprovalAiAudit;
    var ark = window.GxFeedbackApprovalArk;

    function bindHost(hostApi) {
        host = hostApi;
        if (aiAudit && aiAudit.init) {
            aiAudit.init(host);
        }
        if (ark && ark.init) {
            ark.init(host);
        }
    }

    function isEnabled() {
        if (!host || !gate) {
            return false;
        }
        return gate.isEnabled(host.getUserStandardkindId(), host.getUnitUserType());
    }

    /** 打开弹窗前：插入 AI tab（仅广西省厅） */
    function prepareDialogOpen() {
        if (!isEnabled() || !aiAudit) {
            host.$('.js-tabs li[data-type="js-project-ai-audit"]').remove();
            return;
        }
        aiAudit.ensureTab();
    }

    /** 弹窗打开后：加载 AI 审核意见 */
    function loadAiAuditOnOpen(event) {
        if (!isEnabled() || !aiAudit) {
            return;
        }
        aiAudit.loadOpinion(event);
    }

    /** 附件加载完成后：现场照 AI 识别人数 */
    function onFeedbackFilesLoaded(event) {
        if (!isEnabled() || !ark) {
            return;
        }
        ark.onFeedbackFilesLoaded(event);
    }

    /**
     * 显式激活第一个 tab（修复多 tab 内容同时显示）
     * @param {Function} handlerNextAndLastBtns 主页面分页按钮回调
     */
    function activateFirstTab(handlerNextAndLastBtns) {
        var $ = host.$;
        var $tabs = $('.js-tabs').children();
        if (!$tabs.length) {
            return;
        }
        var firstType = $tabs[0].getAttribute('data-type');
        $('.js-tab-page').addClass('js-hidden');
        if (firstType) {
            $('.' + firstType).removeClass('js-hidden');
        }
        try {
            host.element.tabChange('tabcheck', 0);
        } catch (e) {
            /* layui tabChange 失败时仍保留 js-hidden 切换 */
        }
        if (typeof handlerNextAndLastBtns === 'function') {
            handlerNextAndLastBtns(1);
        }
    }

    /** tab 切换时懒加载（授分人员仍由主页面处理） */
    function handleTabDataLoad(dataType) {
        if (!isEnabled() || !aiAudit) {
            return false;
        }
        return aiAudit.handleTabDataLoad(dataType);
    }

    /** 关闭弹窗清理 */
    function onDialogClose() {
        if (aiAudit) {
            aiAudit.cleanup();
        }
        if (ark) {
            ark.cleanup();
        }
    }

    window.GxFeedbackApprovalExt = {
        bindHost: bindHost,
        isEnabled: isEnabled,
        prepareDialogOpen: prepareDialogOpen,
        loadAiAuditOnOpen: loadAiAuditOnOpen,
        onFeedbackFilesLoaded: onFeedbackFilesLoaded,
        activateFirstTab: activateFirstTab,
        handleTabDataLoad: handleTabDataLoad,
        onDialogClose: onDialogClose
    };
})(window);
