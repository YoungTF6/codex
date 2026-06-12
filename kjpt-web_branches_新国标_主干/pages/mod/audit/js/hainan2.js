layui.config({
    base: '/js/layui/ext/'
}).extend({
    xmSelect: 'xm-select',
    lat: 'lat',
    eleTree: 'eleTree'
}).use(['table', 'layer', 'jquery', 'form', 'transfer', 'tree', 'xmSelect', 'lat', 'eleTree'], function () {
    let table = layui.table, layer = layui.layer, form = layui.form, transfer = layui.transfer, dropdown = layui.dropdown, tree = layui.tree, $ = layui.jquery, xmSelect = layui.xmSelect, lat = layui.lat, eleTree = layui.eleTree;
    let gPersonStateSel;
    _tsf.loadTransferDataPersonList = function (source) {
        postAction(`${huayi_personorg_url}omme/person/list/year`, getSifter()).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                let newList = jsonRes.data;
                _tsf.reloadTransfer(source, newList);
                if (newList && newList.length > 0) {
                    //
                } else {
                    layer.msg('暂无人员数据');
                }
            }
        }).catch(error => {
            layer.msg('error:加载personList');
        });
    }
    window.loadTransferData = _tsf.loadTransferData;
    window.exportHaiNanPdf = exportHaiNanPdf;
    window.exportHaiNanXlsx = exportHaiNanXlsx;
    $(function () {
        if (_isGov) {
            $('#tree_transfer_container_gov').show();
            $('.only_gov').show();
            $('.only_unit').hide();
        } else {
            $('#tree_transfer_container_unit').show();
            $('.only_gov').hide();
            $('.only_unit').show();
        }
        _tsf.loadTreeData();
        _tsf.renderTransfer();
    });
    layer.ready(function () {
        lat.verifyTenancy(_isHainan);
        watermark.set('海南省卫生健康委员会');
        lat.renderCmeYear('#cmeYearSelector');
        getPersonStateOption().then(response => {
            let initValArr = ["9e2fc29c-78c9-4f36-90f2-9b2d011fe1d3", "3e75e52c-7c72-447c-bc38-9b4d00f331c3"];
            let jsonRes = response.data;
            let psData = jsonRes.data.map(ps => {
                return {
                    'name': ps.personStateName,
                    'value': ps.personStateId,
                    selected: initValArr.includes(ps.personStateId)
                };
            });
            gPersonStateSel = lat.renderMultiSelector('#personStateIdSelector', psData, {initValue: initValArr});
            layui.form.render('select');
        }).catch(error => {
            layer.msg('error:加载personState');
        }).finally(() => {
        });
    });
    function getSifter() {
        let pr = $('select[name=passResult]').val();
        let deptIds = null;
        if (!_isGov) {
            let subTree = subTreeById(_tsf.gTreeData, (node) => {
                return node.deptId === _tsf.gTreeSelId;
            });
            let ids = flat2val(Array(subTree), 'deptId');
            deptIds = (_tsf.gTreeSelId === _tsf._pseudoAllDeptId) ? null : ids;
        }
        return {
            scoreTypeVal: 7,
            pdfType: 2,
            standardKindId: _standardKindId,
            unitId: _unitId, // _isGov ? gTreeSelId : _unitId,
            depth: _depth,
            // deptId: _isGov ? null : (_tsf._pseudoAllDeptId === gTreeSelId ? null : gTreeSelId),
            deptIds: deptIds,
            unitName: _unitName,
            cmeYear: $('select[name=cmeYear]').val(),
            personNo: $('input[name=personNo]').val(),
            personName: $('input[name=personName]').val(),
            personStateIds: gPersonStateSel ? gPersonStateSel.getValue('valueStr') : null,
            personStateIdList: gPersonStateSel ? gPersonStateSel.getValue('value') : null,
            passResult: pr ? Number(pr) : null,
            checkState: 1,
        };
    }
    // ========================== export
    function exportHaiNanPdf() {
        let visit = huayi_sjwh_url + 'audit/pdf/down'; // 海南-2 comPersonIds/unitIds
        exportHaiNan(visit, 'pdf');
    }
    function exportHaiNanXlsx() {
        let visit = huayi_sjwh_url + 'audit/pdf/down/hainan/xlsx'; // 海南-2 comPersonIds/unitIds
        exportHaiNan(visit, 'xlsx');
    }
    function exportHaiNan(visit, ext) {
        let operatorName = $('input[name=operatorName]').val();
        if (!operatorName) {
            layer.msg('请输入校验负责人');
            return false;
        }
        let transferSelList = transfer.getData(_tsf._transfer_id);
        if (transferSelList && transferSelList.length > 0) {
            let transferSelIds = transferSelList.map(item => item.value).join(',');
            // let transferSelIds = gTransferSelList.map(i => i[_transferKey]).join(',');
            let params = getSifter();
            let selYear = $('select[name=cmeYear]').val();
            params.scoreTypeVal = 7;
            params.pdfType = 2;
            params.standardKindId = _standardKindId;
            params.cmeYear = selYear;
            params.cmeYears = selYear;
            params.multiYear = true;
            params.operatorName = operatorName;
            params.loy = 'year';
            if (_isGov) {
                // params.unitId = null;
                params.unitIds = transferSelIds;
            } else {
                params.comPersonIds = transferSelIds;
            }
            lat.downloadWithProgress(visit, params, getFileName(ext));
        } else {
            layer.msg('先选择' + (_isGov ? '单位' : '人员'));
        }
    }
    function getFileName(ext) {
        let inputName = $('input[name=fileName]').val();
        return (inputName ? inputName : '继续医学教育情况校验表') + '.' + ext;
    }
});