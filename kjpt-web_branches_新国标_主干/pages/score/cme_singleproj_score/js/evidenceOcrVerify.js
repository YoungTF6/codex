(function (window, $) {
    const CONFIG_CODE = 'fun_singleproj_evidence_ocr_verify';
    const RESULT_MATCH = 'MATCH';
    const RESULT_NO_TEXT = 'NO_TEXT';
    const RESULT_MISMATCH = 'MISMATCH';
    const ACTION_IGNORE = 'IGNORE';
    const ACTION_AUTO_THIRD = 'AUTO_THIRD';
    const STATUS_NORMAL = 'NORMAL';
    const STATUS_ABNORMAL = 'ABNORMAL';
    const STYLE_ID = 'evidence-ocr-verify-style';
    const UI_DEFER_MS = 80;
    let mismatchSubmitCount = 0;

    /**
     * 注入佐证 OCR 提示样式，仅执行一次。
     */
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '.evidence-ocr-loading-box{padding:30px 20px 24px;text-align:center;}',
            '.evidence-ocr-loading-text{margin-top:14px;font-size:14px;color:#333;line-height:22px;}',
            '.evidence-ocr-tip-box{padding:22px 26px 6px;}',
            '.evidence-ocr-tip-head{display:flex;align-items:flex-start;}',
            '.evidence-ocr-tip-icon{flex:0 0 42px;font-size:40px;line-height:1;color:#FFB800;}',
            '.evidence-ocr-tip-icon.is-error{color:#FF5722;}',
            '.evidence-ocr-tip-main{flex:1;min-width:0;}',
            '.evidence-ocr-tip-title{font-size:16px;font-weight:600;color:#333;line-height:24px;margin-bottom:8px;}',
            '.evidence-ocr-tip-desc{font-size:13px;color:#666;line-height:22px;}',
            '.evidence-ocr-tip-desc ul{margin:0;padding-left:18px;}',
            '.evidence-ocr-tip-desc li{margin:4px 0;}',
            '.evidence-ocr-mismatch-name{color:#1E9FFF;font-weight:600;}',
            '.evidence-ocr-success-box{padding:24px 28px 8px;}',
            '.evidence-ocr-success-head{display:flex;align-items:flex-start;}',
            '.evidence-ocr-success-icon{flex:0 0 42px;font-size:40px;line-height:1;color:#16b777;}',
            '.evidence-ocr-success-main{flex:1;min-width:0;}',
            '.evidence-ocr-success-title{font-size:16px;font-weight:600;color:#333;line-height:24px;margin-bottom:8px;}',
            '.evidence-ocr-success-desc{font-size:13px;color:#666;line-height:22px;}'
        ].join('');
        document.head.appendChild(style);
    }

    /**
     * 延迟执行阻塞任务，确保 layer 弹层先完成渲染。
     */
    function deferTask(task) {
        setTimeout(task, UI_DEFER_MS);
    }

    /**
     * 展示 OCR 识别中的全屏遮罩与进度文案。
     */
    function showRecognizingLoading(personIndex, personTotal) {
        injectStyles();
        const progressText = buildRecognizingText(personIndex, personTotal);
        return layer.open({
            type: 1,
            title: false,
            closeBtn: 0,
            shade: [0.35, '#000'],
            area: ['320px', '140px'],
            content: buildLoadingContent(progressText)
        });
    }

    /**
     * 展示保存学分中的加载提示。
     */
    function showSavingLoading() {
        injectStyles();
        return layer.open({
            type: 1,
            title: false,
            closeBtn: 0,
            shade: [0.35, '#000'],
            area: ['300px', '130px'],
            content: buildLoadingContent('正在保存学分…')
        });
    }

    function buildRecognizingText(personIndex, personTotal) {
        if (personTotal > 1) {
            return '正在识别材料中…（共' + personTotal + '人）';
        }
        return '正在识别材料中…';
    }

    function buildLoadingContent(text) {
        return '<div class="evidence-ocr-loading-box">'
            + '<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop" style="font-size:36px;color:#1E9FFF;"></i>'
            + '<div class="evidence-ocr-loading-text">' + text + '</div>'
            + '</div>';
    }

    /**
     * 更新识别进度文案（多人核验时逐人刷新）。
     */
    function updateRecognizingLoading(loadingIdx, personIndex, personTotal) {
        const layerNode = document.getElementById('layui-layer' + loadingIdx);
        if (!layerNode) {
            return;
        }
        const textNode = layerNode.querySelector('.evidence-ocr-loading-text');
        if (!textNode) {
            return;
        }
        textNode.textContent = buildRecognizingText(personIndex, personTotal);
    }

    /**
     * 关闭指定 layer 弹层。
     */
    function closeLayer(loadingIdx) {
        if (loadingIdx != null) {
            layer.close(loadingIdx);
        }
    }

    /**
     * 重置当前录入批次的姓名不匹配提示次数，避免三次放行状态影响后续新增学分。
     */
    function resetMismatchSubmitCount() {
        mismatchSubmitCount = 0;
    }

    /**
     * 展示未能识别到文字时的引导弹窗。
     */
    function showNoTextAlert(personName, done) {
        injectStyles();
        const nameTip = personName
            ? '<div class="evidence-ocr-tip-desc" style="margin-bottom:8px;">当前人员：<span class="evidence-ocr-mismatch-name">' + personName + '</span></div>'
            : '';
        layer.open({
            type: 1,
            title: '佐证识别提示',
            area: ['460px', 'auto'],
            btn: ['重新上传'],
            btnAlign: 'c',
            content: '<div class="evidence-ocr-tip-box">'
                + '<div class="evidence-ocr-tip-head">'
                + '<div class="evidence-ocr-tip-icon"><i class="layui-icon layui-icon-picture"></i></div>'
                + '<div class="evidence-ocr-tip-main">'
                + '<div class="evidence-ocr-tip-title">未能识别到有效文字</div>'
                + nameTip
                + '<div class="evidence-ocr-tip-desc"><ul>'
                + '<li>请上传包含本人姓名的清晰图片或 PDF</li>'
                + '<li>支持 JPG、PNG、PDF，单文件不超过 25MB</li>'
                + '<li>请避免模糊、过暗、裁剪或遮挡姓名区域</li>'
                + '</ul></div>'
                + '</div></div></div>',
            yes: function (index) {
                layer.close(index);
                if (typeof done === 'function') {
                    done();
                }
            }
        });
    }

    /**
     * 展示 OCR 服务不可用或接口异常时的提示弹窗。
     */
    function showServiceErrorAlert(message, done) {
        injectStyles();
        layer.open({
            type: 1,
            title: '佐证识别提示',
            area: ['420px', 'auto'],
            btn: ['知道了'],
            btnAlign: 'c',
            content: '<div class="evidence-ocr-tip-box">'
                + '<div class="evidence-ocr-tip-head">'
                + '<div class="evidence-ocr-tip-icon is-error"><i class="layui-icon layui-icon-close-fill"></i></div>'
                + '<div class="evidence-ocr-tip-main">'
                + '<div class="evidence-ocr-tip-title">佐证识别暂不可用</div>'
                + '<div class="evidence-ocr-tip-desc">' + (message || '识别服务暂时不可用，请稍后再试。如持续失败，请联系管理员。') + '</div>'
                + '</div></div></div>',
            yes: function (index) {
                layer.close(index);
                if (typeof done === 'function') {
                    done();
                }
            }
        });
    }

    /**
     * 展示姓名不一致时的确认弹窗。
     */
    function showMismatchAlert(personName, options, done) {
        injectStyles();
        const nameHtml = personName
            ? '<span class="evidence-ocr-mismatch-name">「' + personName + '」</span>'
            : '您的姓名';
        layer.open({
            type: 1,
            title: '姓名核验未通过',
            area: ['480px', 'auto'],
            closeBtn: 0,
            btn: ['重新上传', '忽略并继续录入'],
            btnAlign: 'c',
            content: '<div class="evidence-ocr-tip-box">'
                + '<div class="evidence-ocr-tip-head">'
                + '<div class="evidence-ocr-tip-icon"><i class="layui-icon layui-icon-tips"></i></div>'
                + '<div class="evidence-ocr-tip-main">'
                + '<div class="evidence-ocr-tip-desc">系统未在佐证材料中识别到' + nameHtml + '，请核对材料是否为本人的学分证明后再提交。</div>'
                + '<div class="evidence-ocr-tip-desc" style="margin-top:10px;color:#999;">若确认材料无误，可选择忽略并继续录入。</div>'
                + '</div></div></div>',
            yes: function (index) {
                if (typeof options.resetUpload === 'function') {
                    options.resetUpload();
                }
                layer.close(index);
                if (typeof done === 'function') {
                    done({ pass: false });
                }
            },
            btn2: function () {
                if (typeof done === 'function') {
                    done({
                        pass: true,
                        patchFields: {
                            evidenceNameVerifyStatus: STATUS_ABNORMAL,
                            evidenceNameMismatchPromptCount: mismatchSubmitCount,
                            nameVerifyAction: ACTION_IGNORE
                        }
                    });
                }
            }
        });
    }

    /**
     * 从核验结果或已合并的提交字段中提取 OCR 标记信息。
     */
    function extractPatchFields(verifyContext) {
        if (!verifyContext) {
            return {};
        }
        if (verifyContext.patchFields) {
            return verifyContext.patchFields;
        }
        if (verifyContext.evidenceNameVerifyStatus) {
            return verifyContext;
        }
        return {};
    }

    /**
     * 展示保存成功弹窗；统一使用需手动关闭的弹层，避免被 closeAll 误关。
     */
    function showSaveSuccess(verifyContext, onConfirm) {
        injectStyles();
        const patch = extractPatchFields(verifyContext);
        const isAbnormal = patch.evidenceNameVerifyStatus === STATUS_ABNORMAL;
        const isIgnored = patch.nameVerifyAction === ACTION_IGNORE || patch.nameVerifyAction === ACTION_AUTO_THIRD;
        const desc = (isAbnormal && isIgnored)
            // ? '<div class="evidence-ocr-success-desc">佐证材料姓名与录入信息不一致，已标记为异常记录，审核时将重点关注。</div>'
            ? '<div class="evidence-ocr-success-desc">学分信息已成功保存。</div>'
            : '<div class="evidence-ocr-success-desc">学分信息已成功保存。</div>';
        layer.open({
            type: 1,
            title: false,
            area: ['420px', 'auto'],
            btn: ['知道了'],
            btnAlign: 'c',
            closeBtn: 0,
            shade: 0.3,
            content: '<div class="evidence-ocr-success-box">'
                + '<div class="evidence-ocr-success-head">'
                + '<div class="evidence-ocr-success-icon"><i class="layui-icon layui-icon-ok-circle"></i></div>'
                + '<div class="evidence-ocr-success-main">'
                + '<div class="evidence-ocr-success-title">学分保存成功</div>'
                + desc
                + '</div></div></div>',
            yes: function (index) {
                layer.close(index);
                if (typeof onConfirm === 'function') {
                    onConfirm();
                }
            }
        });
    }

    /**
     * 先执行页面清理，再延迟展示保存成功弹窗，避免 closeAll 关闭成功提示。
     */
    function notifySaveSuccess(verifyContext, cleanupFn) {
        resetMismatchSubmitCount();
        if (typeof cleanupFn === 'function') {
            cleanupFn();
        }
        deferTask(function () {
            showSaveSuccess(verifyContext);
        });
    }

    /**
     * 将页面 fileUrls（对象或字符串混合）规范为后端 OCR 接口所需的 URL 字符串列表。
     */
    function normalizeFileUrls(fileUrls) {
        if (!Array.isArray(fileUrls)) {
            return [];
        }
        const urls = [];
        for (let i = 0; i < fileUrls.length; i++) {
            const item = fileUrls[i];
            if (typeof item === 'string' && item) {
                urls.push(item);
            } else if (item && typeof item === 'object') {
                const url = item.scorePhotoUrl || item.url || item.fileUrl || '';
                if (url) {
                    urls.push(url);
                }
            }
        }
        return urls;
    }

    /**
     * 根据穿梭框标题提取人员姓名，兼容“姓名(编号)”与“姓名（编号）”。
     */
    function extractPersonName(title) {
        if (!title) {
            return '';
        }
        return title.split('(')[0].split('（')[0].trim();
    }

    /**
     * 读取 OCR 校验开关；默认关闭，读取失败也按关闭处理，避免阻塞既有流程。
     */
    function isOcrEnabled(unitId, scoreLevel) {
        let enabled = false;
        $.ajax({
            async: false,
            type: 'post',
            url: huayi_sjwh_url + 'cmeCommonConfig/getConfigByUnitFromRedis',
            data: {
                unitId: unitId,
                configNames: CONFIG_CODE,
                scoreLevelId: scoreLevel
            },
            success: function (res) {
                enabled = !!(res && res.success && res.data && res.data[CONFIG_CODE] === '1');
            },
            error: function () {
                enabled = false;
            }
        });
        return enabled;
    }

    /**
     * 对同一批佐证材料执行一次 OCR，并批量比对所有人员姓名。
     */
    function verifyAll(options, personNames) {
        const result = { pass: false, result: RESULT_NO_TEXT, message: '', mismatchPersonName: '' };
        const fileUrlList = normalizeFileUrls(options.fileUrls);
        $.ajax({
            async: false,
            type: 'post',
            url: huayi_projectscore_url + 'cmeSingleprojScore/evidenceOcrVerify',
            data: JSON.stringify({
                addUnit: options.unitId,
                scoreLevel: options.scoreLevel,
                personNames: personNames,
                fileUrls: fileUrlList
            }),
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            success: function (res) {
                if (res && res.status === 200 && res.data && res.data.result) {
                    result.pass = true;
                    result.result = res.data.result;
                    result.mismatchPersonName = res.data.mismatchPersonName || '';
                    return;
                }
                result.message = (res && res.msg) ? res.msg : '佐证核验服务不可用，请稍后再试';
            },
            error: function () {
                result.message = '佐证核验服务不可用，请稍后再试';
            }
        });
        return result;
    }

    /**
     * 执行多人 OCR 校验主流程（单次接口调用，避免重复识别同一批文件）。
     */
    function runVerifyLoop(options, personNames, loadingIdx, callback) {
        const item = verifyAll(options, personNames);
        if (!item.pass) {
            closeLayer(loadingIdx);
            showServiceErrorAlert(item.message, function () {
                callback({ pass: false });
            });
            return;
        }
        if (item.result === RESULT_NO_TEXT) {
            closeLayer(loadingIdx);
            showNoTextAlert(personNames[0] || '', function () {
                if (typeof options.resetUpload === 'function') {
                    options.resetUpload();
                }
                callback({ pass: false });
            });
            return;
        }
        closeLayer(loadingIdx);
        if (item.result !== RESULT_MISMATCH) {
            resetMismatchSubmitCount();
            callback({
                pass: true,
                patchFields: {
                    evidenceNameVerifyStatus: STATUS_NORMAL,
                    evidenceNameMismatchPromptCount: 0,
                    nameVerifyAction: ''
                }
            });
            return;
        }
        const mismatchPersonName = item.mismatchPersonName || personNames[0] || '';
        mismatchSubmitCount += 1;
        if (mismatchSubmitCount >= 3) {
            callback({
                pass: true,
                patchFields: {
                    evidenceNameVerifyStatus: STATUS_ABNORMAL,
                    evidenceNameMismatchPromptCount: 2,
                    nameVerifyAction: ACTION_AUTO_THIRD
                }
            });
            return;
        }
        showMismatchAlert(mismatchPersonName, options, callback);
    }

    /**
     * 执行 OCR 校验并回调提交动作。
     */
    function run(options, done) {
        const callback = typeof done === 'function' ? done : function () {};
        if (!options || !options.unitId || !options.scoreLevel || !Array.isArray(options.fileUrls)) {
            callback({ pass: false });
            return;
        }
        const normalizedFileUrls = normalizeFileUrls(options.fileUrls);
        if (!normalizedFileUrls.length) {
            layer.msg('请上传证明材料', { icon: 0 });
            callback({ pass: false });
            return;
        }
        options = Object.assign({}, options, { fileUrls: normalizedFileUrls });
        if (!isOcrEnabled(options.unitId, options.scoreLevel)) {
            callback({
                pass: true,
                patchFields: {
                    evidenceNameVerifyStatus: STATUS_NORMAL,
                    evidenceNameMismatchPromptCount: 0,
                    nameVerifyAction: ''
                }
            });
            return;
        }
        const personNames = (options.personNames || []).filter(Boolean);
        if (!personNames.length) {
            layer.msg('缺少人员姓名，无法完成佐证核验', { icon: 0 });
            callback({ pass: false });
            return;
        }
        const loadingIdx = showRecognizingLoading(1, personNames.length);
        deferTask(function () {
            runVerifyLoop(options, personNames, loadingIdx, callback);
        });
    }

    window.EvidenceOcrVerify = {
        run: run,
        extractPersonName: extractPersonName,
        showSavingLoading: showSavingLoading,
        closeSavingLoading: closeLayer,
        showSaveSuccess: showSaveSuccess,
        notifySaveSuccess: notifySaveSuccess,
        resetMismatchSubmitCount: resetMismatchSubmitCount
    };
})(window, window.jQuery);
