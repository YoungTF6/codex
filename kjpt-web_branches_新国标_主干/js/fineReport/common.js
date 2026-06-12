// common.js

// convention
// 1.template param: under_line
// 2.url param: hump CamelCase

const coalesce = (...args) => args.find(v => ![undefined, null].includes(v));
const toLine = (text) => text.replace(/([A-Z])/g, "_$1").toLowerCase();

const accAdd = (arg1, arg2) => {
    let r1, r2, m;
    try {
        r1 = arg1.toString().split(".")[1].length
    } catch (e) {
        r1 = 0
    }
    try {
        r2 = arg2.toString().split(".")[1].length
    } catch (e) {
        r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2))
    return (arg1 * m + arg2 * m) / m
}

const daysBetween = (headDate, tailDate) => {
    return Math.ceil((tailDate.getTime() - headDate.getTime()) / 1000 / 60 / 60 / 24) + 1;
}


const isBlank = (str) => (!str || str.toString().trim().length < 1);
const isNotBlank = (str) => !isBlank(str);

const limitLength = (str, minLen, maxLen) => {
    if (str) {
        return (minLen <= str.length) && (str.length <= maxLen);
    } else {
        return false;
    }
}

const limitRange = (n, min, max) => {
    return (min <= n) && (n <= max);
}

const isNumber = (val) => {
    let regexp = /^[0-9]+.?[0-9]*/;
    return regexp.test(val);
}

const isInt = (val) => {
    return Number.isInteger(val) && (val >= 0);
}

const isFloat1 = (val) => {
    if (isInt(val)) {
        return true;
    }
    let regexp = /^[0-9]+.?[0-9]$/;
    return regexp.test(val);
}

const isMobile = (mobile) => {
    let regexp = /^1[3-9]\d{9}$/;
    return regexp.test(mobile);
}

const isEmail = (email) => {
    let regexp = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    return regexp.test(email);
}

const isIdCardNo = (idCardNo) => {
    let regexp = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    return regexp.test(idCardNo);
}


// $('.parameter-container').css('visibility','visible');
// $('.parameter-container').css('visibility','hidden');
// $(".parameter-container-collapseimg-up").click();
// $('.parameter-container-collapseimg-up').hide();
// $('.parameter-container-collapseimg-down').show();
// $('.parameter-container-collapseimg-down').click();

function hideParamContainer(frg) {
    setTimeout(function () {
        frg.parameterCommit();
        $(".parameter-container-collapseimg-up").click();
        $('.parameter-container-collapseimg-up').hide();
    }, 100);
}

// get template param
function getTplParam(pName) {
    let widget = window.contentPane.parameterEl.getWidgetByName(pName);
    let val = (widget && widget.isVisible) ? widget.getValue() : '';
    return (val && 'undefined' !== val && 'null' !== val) ? val : '';
}

// set template param
function setTplParam(frg, pName, val) {
    let widget = window.contentPane.parameterEl.getWidgetByName(pName);
    if (widget && widget.isVisible) {
        widget.setValue(val);
        //
        // frg.parameterCommit();
    }
}

function tplParams() {
    let res = {
        'project_id': getTplParam('project_id'),
        'standard_kind_id': getTplParam('standard_kind_id'),
        'unit_id': getTplParam('unit_id'),
        'user_id': getTplParam('user_id'),
        'score_level_id': getTplParam('score_level_id'),
        'hold_year': getTplParam('hold_year'),
        'zh_cn': getTplParam('zh_cn'),
        'source': getTplParam('source'),
        'period': getTplParam('period'),
        'theory_period': getTplParam('theory_period'),
        'experiment_period': getTplParam('experiment_period'),
        'score': getTplParam('score'),
    };
    return res;
}

function isValidWidget(widget) {
    // 这里只验证visible,不验证enabled
    return widget && widget.isVisible(); // && widget.isEnabled();
}

function switchBtn(frg, status) {
    console.info('switchBtn to %s', status);
    let b11 = frg.getWidgetByName('xm_save');
    isValidWidget(b11) && b11.setEnable(status);
    let b12 = frg.getWidgetByName('xm_save_next');
    isValidWidget(b12) && b12.setEnable(status);
    let b21 = frg.getWidgetByName('fzr_save');
    isValidWidget(b21) && b21.setEnable(status);
    let b22 = frg.getWidgetByName('fzr_save_next');
    isValidWidget(b22) && b22.setEnable(status);
    let b31 = frg.getWidgetByName('kc_save');
    isValidWidget(b31) && b31.setEnable(status);
    let b32 = frg.getWidgetByName('kc_save_next');
    isValidWidget(b32) && b32.setEnable(status);
    let b41 = frg.getWidgetByName('zq_save');
    isValidWidget(b41) && b41.setEnable(status);
    let b42 = frg.getWidgetByName('zq_save_report');
    isValidWidget(b42) && b42.setEnable(status);
}


function toNextPage() {
    // fr-sheetbutton-container为sheet页的集合,获取集合长度
    let $frsc = $(".fr-sheetbutton-container");
    let len = $frsc.length;
    // 获取当前选中sheet所在下标（下标从0开始）
    let index = $frsc.index($(".fr-sheetbutton-container-active"));
    if (index < len) {
        //如果当前下标index比len长度小1 表示已经为最后一页。
        if (index === (len - 1)) {
            //当前为最后一页。跳转到首页
            $frsc.eq(0).trigger("click");
        } else {
            // 不为最后一页。跳转到下一页
            $frsc.eq(index + 1).trigger("click");
        }
    }
}

function showToast(type, text) {
    // type: success info warning error
    new NoticeJs({
        title: '',
        type: type,
        text: text,
        position: 'topCenter',
        closeWith: ['button', 'click'],
        timeout: 20,
        modal: false,
        progressBar: true,
        callbacks: {
            beforeShow: [],
            onShow: [],
            afterShow: [],
            onClose: [],
            afterClose: [],
            onClick: [],
            onHover: [function () {
                console.log("success");
            }]
        },
        animation: {
            open: 'animated bounceInRight',
            close: 'animated bounceOutLeft'
        }
    }).show();
}


// ==============================
function ajaxGet(url, params) {
    console.info('url: %s', url);
    console.info('params: %s', JSON.stringify(params));

    $.ajax({
        url: url,
        method: 'get',
        data: JSON.stringify(params),
        dataType: 'json',
        success: function (data, textStatus, xhr) {
            if (!data.success) {
                alert('error');
            } else {
                showToast('success', '已完成');
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            alert('error');
        },
        beforeSend: function (xhr) {
        }
    });

}

function ajaxPost(url, params, finalFun, frg) {
    console.info('url: %s', url);
    console.info('params: %s', JSON.stringify(params));

    $.ajax({
        url: url,
        method: 'post',
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8',
        success: function (data, textStatus, xhr) {
            if (!data.success) {
                alert('error');
            } else {
                if (frg) {
                    setTplParam(frg, 'project_id', data.data.projectId);
                }
                if (finalFun && (typeof finalFun === 'function')) {
                    finalFun();
                }
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            alert('error');
        },
        beforeSend: function (xhr) {
        }
    });
}

function ajaxPut(url, params) {
    console.info('url: %s', url);
    console.info('params: %s', JSON.stringify(params));

    $.ajax({
        url: url,
        method: 'put',
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8',
        success: function (data, textStatus, xhr) {
            if (!data.success) {
                alert('error');
            } else {
                showToast('success', '已保存');
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            alert('error');
        },
        beforeSend: function (xhr) {
        }
    });
}

