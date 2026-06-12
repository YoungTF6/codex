//
layui.config({
    base: '/js/layui/ext/'
}).extend({
    xmSelect: 'xm-select',
    lat: 'lat'
}).use(['table', 'layer', 'jquery', 'form', 'laydate', 'element', 'xmSelect', 'lat'], function () {
    let layer = layui.layer;
    let form = layui.form;
    let $ = layui.jquery;
    let lat = layui.lat;

    const _phase = +getOrDefault(getUrlParamByName('phase'), 1);
    const _state = +getOrDefault(getUrlParamByName('state'), 1);
    const _isApprove = 3 === _state;
    let gRegexp = /^[\s\S]{1,200}$/;

    layer.ready(function () {
        if (_isApprove) {
            let $t = $('textarea[name=reason]');
            $t.parent().prev().find('span').hide();
            gRegexp = /^[\s\S]{0,200}$/;
        }
        renderSelect();
    });

    form.on('select(reason_sel)', function (data) {
        let val = data.value;
        $('textarea[name=reason]').val(val);
    });

    form.on('submit(cancel)', function (data) {
        parent.solveReason('', ModalActionEnum.CANCEL);
    });

    form.on('submit(confirm)', function (data) {
        submit(data.field.reason);
    });

    function submit(reason, confirm) {
        if (gRegexp.test(reason)) {
            parent.solveReason(reason, ModalActionEnum.CONFIRM);
        } else {
            let msg;
            if (_isApprove) {
                msg = '超过200字';
            } else {
                msg = reason ? '超过200字' : '请编辑原因';
            }
            lat.failMsg(msg);
        }
    }

    function renderSelect() {
        let visit = huayi_sjwh_url + 'reason/page';
        let params = {
            'pageNum': 1,
            'pageSize': 9999,
            'unitId': _unitId,
            'phase': _phase,
            'state': _state
        };
        postAction(visit, params).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                let reasonArr = jsonRes.data.records;
                if (reasonArr.length > 0) {
                    reasonArr.forEach(reason => {
                        $('select[name=reason2]').append(new Option(reason.reason, reason.reason));
                    });
                    form.render('select');
                }
                $('.layui-input.layui-unselect').attr('placeholder', `选择在“系统设置及信息浏览->审核意见维护”菜单填写的“${CheckStateEnum[_state]}”意见`);
            } else {
                lat.failMsg('fail:获取审核原因');
            }
        }).catch(error => {
            lat.errorMsg('error:获取审核原因');
        }).finally(() => {

        });
    }

});