layui.config({
    base: '/js/layui/ext/'
}).extend({
    xmSelect: 'xm-select',
    eleTree: 'eleTree',
    lat: 'lat'
}).use(['table', 'layer', 'jquery', 'form', 'laydate', 'transfer', 'element', 'xmSelect', 'eleTree', 'lat'], function () {
    let table = layui.table, layer = layui.layer, form = layui.form, laydate = layui.laydate, dropdown = layui.dropdown, element = layui.element, transfer = layui.transfer, $ = layui.jquery, xmSelect = layui.xmSelect,
        eleTree = layui.eleTree, lat = layui.lat;
    let gLayerIndex = -1;
    layer.ready(function () {
        $('#tree_box div:first-child span').text(_isGov ? '选择单位' : '选择科室');
        lat.verifyTenancy(_isNingxia);
        watermark.set('宁夏回族自治区');
    });
    _tsf._tree_id = 'tree_content';
    _tsf._transfer_id = 'transfer_box';
    _tsf._transfer_key = 'comPersonId';
    _tsf._transfer_name = 'personName';
    _tsf._transfer_title = '人员';
    _tsf.right_unit = false;
    _tsf.loadTransferDataPersonList = function (source) {
        let personNo = $('input[name=personNo]').val();
        let personName = $('input[name=personName]').val();
        let certId = $('input[name=certId]').val();
        if (('query' === source) && (personNo + personName + certId).length < 1) {
            lat.failMsg('输入查询条件');
            return false;
        }
        let visit = huayi_personorg_url + 'omme/person/page/last/lite';
        postAction(visit, getPersonSifter(source)).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                let personList = jsonRes.data.records;
                if (personList && personList.length > 0) {
                    _tsf.reloadTransfer(source, personList);
                } else {
                    lat.failMsg('tree' === source ? `【${_tsf.gTreeSelName}】未查询到人员信息` : '根据查询条件未查询到人员信息');
                    _tsf.reloadTransfer(source, []);
                }
            } else {
                lat.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            lat.errorMsg('error:加载人员列表');
        });
    }
    window.loadTransferDataPersonList = _tsf.loadTransferDataPersonList;
    window.exportPdf = exportPdf;
    $(function () {
        _tsf.loadTreeData();
        _tsf.renderTransfer();
        const _renderYearBox = (_selector, begin = 2025, cnt = 7) => {
            let $bx = $(_selector);
            let str = '';
            Array(cnt).fill(0).forEach((_, idx) => {
                let year = begin - idx;
                let checked = idx < 3 ? "checked" : "";
                str += `<input type="checkbox" name="cmeYear[${year}]" value="${year}" title="${year}" ${checked} lay-skin="primary" lay-filter="cmeYearCheckBox">`;
            });
            $bx.html(str);
            form.render('checkbox');
        };
        _renderYearBox('#year_checkbox_container', 2025);
    });
    function getPersonSifter(source) {
        let fromTree = 'tree' === source;
        let fromQuery = 'query' === source;
        //
        let personNo = '';
        let personName = '';
        let certId = '';
        if (fromQuery) {
            personNo = $('input[name=personNo]').val();
            personName = $('input[name=personName]').val();
            certId = $('input[name=certId]').val();
        }
        return {
            'scoreTypeVal': 7,
            'standardKindId': _standardKindId,
            'unitId': fromQuery ? _unitId : (_isGov ? _tsf.gTreeSelId : _unitId),
            'depth': _depth,
            'pageNum': 1,
            'pageSize': 9999,
            'personNo': personNo,
            'personName': personName,
            'certId': certId,
            'passResult': 1,
            'deptIds': _tsf.gTreeSel_ids.replace(_tsf._pseudoAllDeptId, ''),
        };
    }
    form.on('checkbox(cmeYearCheckBox)', function (data) {
        // console.log(data.elem.checked);
        // console.log(data.value);
    });
    // pdf
    function exportPdf() {
        let cmeYears = checkboxVals('cmeYear');
        if (!cmeYears) {
            lat.failMsg('请选择年度');
            return false;
        }
        if (cmeYears.length > (5 * 3 - 1)) {
            lat.failMsg('最多选择三个年度');
            return false;
        }
        let transferSelList = transfer.getData('transfer_box');
        let comPersonIds = transferSelList.map(i => i.value).join(',');
        if (!comPersonIds) {
            lat.failMsg('请选择人员');
            return false;
        }
        if (comPersonIds.length > 37000) {
            lat.failMsg('超过每次导出1000人数限制');
            return false;
        }
        let visit = huayi_sjwh_url + 'audit/pdf/down'; // 宁夏-2 comPersonIds
        let params = {
            'pdfType': 2,
            'standardKindId': _standardKindId,
            'comPersonIds': comPersonIds,
            'cmeYear': '2023',
            'cmeYears': cmeYears,
            'multiYear': true,
            'unitId': _unitId,
            'depth': _depth
        }
        lat.downloadWithProgress(visit, params, '多年度学分审验.pdf');
    }
});