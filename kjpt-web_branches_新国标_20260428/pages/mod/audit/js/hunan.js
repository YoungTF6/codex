layui.config({
    base: '/js/layui/ext/'
}).extend({
    xmSelect: 'xm-select',
    lat: 'lat'
}).use(['table', 'layer', 'jquery', 'form', 'laydate', 'element', 'xmSelect', 'lat'], function () {
    let table = layui.table;
    let layer = layui.layer;
    let form = layui.form;
    let laydate = layui.laydate;
    let dropdown = layui.dropdown;
    let element = layui.element;
    let $ = layui.jquery;
    let xmSelect = layui.xmSelect;
    let lat = layui.lat;
    let gLayerIndex = -1;
    let gUdTreeSelector;
    let gUdTreeData;
    if (_isPhUnit) {
        $('.ph_unit_hide').attr('disabled', 'true').addClass('layui-btn-disabled');
        $('.check_state_item dd[lay-value^=4]').attr('disabled', 'true').addClass('layui-btn-disabled');
        form.render('select');
    }
    window.refreshTable = refreshTable;
    layer.ready(function () {
        // lat.verifyTenancy(_isHunan);
        watermark.set('湖南省');
        lat.renderCmeYear('select[name=cmeYear]');
        lat.renderDayRangeSel('#rangeSel', null, null, {btns: ['clear', 'now', 'confirm']});
        // renderSel();
        if (_isGov) {
            $('.only_gov').show();
            getUnitTreeData(_unitId).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    gUdTreeData = jsonRes.data;
                    gUdTreeSelector = lat.renderUnitTreeSelector('#udIdSelector', gUdTreeData);
                }
            }).catch(error => {
                layer.msg('error:加载unitTreeData');
            }).finally(() => {
                //
            });
        }
        if (_isUnit) {
            $('.only_unit').show();
            getDeptTreeData(_unitId, 9).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    gUdTreeData = jsonRes.data;
                    gUdTreeSelector = lat.renderDeptTreeSelector('#udIdSelector', gUdTreeData);
                }
            }).catch(error => {
                layer.msg('error:加载deptTreeData');
            }).finally(() => {
                //
            });
            renderTable();
        }
        if (_isPerson) {
            $('.only_not_person').hide();
            $('input[name=personNo]').val(_pno).attr('disabled', 'true').toggleClass('layui-disabled');
            $('input[name=personName]').val(_pname).attr('disabled', 'true').toggleClass('layui-disabled');
            $('input[name=certId]').val(_pcid).attr('disabled', 'true').toggleClass('layui-disabled');
            refreshTable();
        }
    });
    $(function () {
        renderTable();
    });
    function renderSel() {
        let str;
        if (_isUnit || _isPerson) {
            str = `<option value=""></option>
                    <option value="0#39" class="only_unit only_person hide">未上报</option>
                    <option value="40#999" class="only_unit only_person hide">已上报</option>`;
        }
        if (_isGov) {
            str = `<option value=""></option>
                    <option value="0#_uut9" class="only_gov hide">下级单位已上报</option>
                    <option value="_uut10#999" class="only_gov hide">本级单位已上报</option>`;
        }
        $('select[name=reportState]').append(str);
        form.render('select');
    }
    table.on('toolbar(table_id)', function (obj) {
        let checkStatus = table.checkStatus(obj.config.id);
        let selectedRowArr = checkStatus.data;
        selectedRowArr = selectedRowArr.filter(row => {
            return _isGov ? !canCheck(row) : !canReport(row);
        });
        if (selectedRowArr.length < 1) {
            lat.failMsg('先选择数据');
            return;
        }
        if ('report' === obj.event) {
            report($('select[name=cmeYear]').val(), selectedRowArr.map(r => r.comPersonId).join(','));
        }
        if ('approve' === obj.event) {
            check(selectedRowArr.map(r => r.id).join(','), CheckStateEnum.APPROVE);
        }
        if ('reject' === obj.event) {
            check(selectedRowArr.map(r => r.id).join(','), CheckStateEnum.REJECT);
        }
    });
    form.on('select(reportState)', function (data) {
        let val = data.value;
        let $sel = $('select[name=checkState]');
        if ('0#39' === val) {
            $sel.val('');
            $sel.attr('disabled', 'true').toggleClass('layui-disabled');
        } else {
            $sel.removeAttr('disabled').toggleClass('layui-disabled');
        }
        form.render('select');
    });
    function canReport(row) {
        if (1 !== row.passResult) {
            return '不达标';
        }
        if (row.id) {
            return '已上报';
        }
        return ''; // true
    }
    function canCheck(row) {
        if (!row.id) {
            return '未上报';
        }
        let reportState = row.reportState;
        let cityCheckState = row.cityCheckState;
        let provinceCheckState = row.provinceCheckState;
        let lt = _uut * 10;
        let gt = _uut * 10 + 9;
        if (_isGovCity && reportState > gt) {
            return '省委审核中';
        }
        if (_isGovProvince) {
            if (reportState < lt) return '市委审核中';
            if (reportState === 60) return '等待推送人社';
            if (reportState > gt) return '已推送至人社';
        }
        return '';
    }
    function report(cmeYear, comPersonIds) {
        let reportState = 40;
        _isPhUnit && (reportState = 50);
        let params = {
            'standardKindId': _skId,
            'cmeYear': cmeYear,
            'comPersonIds': comPersonIds,
            'unitId': _unitId,
            'unitName': _unitName,
            'reportState': reportState
        };
        postAction(`${huayi_sjwh_url}hunan/report`, params).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                lat.okMsg('上报完成');
            }
        }).catch(error => {
            lat.errMsg('error:上报');
        }).finally(() => {
            renderTable();
        });
    }
    function check(ids, checkState) {
        let rs;
        if (CheckStateEnum.APPROVE === checkState) {
            rs = (_uut + 1) * 10;
        } else {
            rs = _uut * 10 + checkState;
        }
        let cs = _uut * 10 + checkState;
        let params = {
            'ids': ids,
            'reportState': rs,
            'checkState': cs,
            'unitId': _unitId,
            'unitName': _unitName,
            'uut': _uut
        };
        postAction(`${huayi_sjwh_url}hunan/check`, params).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                lat.okMsg('审核完成');
            }
        }).catch(error => {
            lat.errMsg('error:审核');
        }).finally(() => {
            refreshTable();
        });
    }
    function getSifter() {
        let selUnitId = (_isGov && gUdTreeSelector) ? gUdTreeSelector.getValue('valueStr') : '';
        let selRs = $('select[name=reportState]').val();
        let state1, state2;
        if (selRs) {
            let a = selRs.split('#')[0]
            let b = selRs.split('#')[1];
            state1 = a.includes('_uut') ? (_uut * 10 + toNum(a.replace('_uut', ''))) : toNum(a);
            state2 = b.includes('_uut') ? (_uut * 10 + toNum(b.replace('_uut', ''))) : toNum(b);
        }
        let checkState = toNum($('select[name=checkState]').val());
        if (99 === checkState) {
            checkState = null;
            state1 = 99;
            state2 = 999;
        }
        return {
            'standardKindId': _skId,
            'unitId': pickUnitId(getOrDefault(selUnitId, _unitId)),
            'depth': _depth,
            'comPersonId': _pid,
            'cmeYear': $('select[name=cmeYear]').val(),
            'personNo': $('input[name=personNo]').val(),
            'personName': $('input[name=personName]').val(),
            'certId': _isPerson ? '' : $('input[name=certId]').val(),
            'deptIds': _isGov ? '' : idsFromTree(gUdTreeSelector, gUdTreeData, 'deptId'),
            'passResult': _isPerson ? null : 1, // $('select[name=passResult]').val(),
            // 'reportState': '',
            'state1': state1,
            'state2': state2,
            'checkState': checkState,
            'startTime': toDayHeader(lat.parseDayRange('#rangeSel').start),
            'endTime': toDayTail(lat.parseDayRange('#rangeSel').end),
        };
    }
    function renderTable() {
        table.render({
            id: 'table_id',
            elem: '#table_id',
            height: 'full-100',
            toolbar: _isPerson ? '' : '#tableToolbar',
            defaultToolbar: [],
            url: `${huayi_sjwh_url}hunan/page`,
            method: 'POST',
            contentType: 'application/json',
            loading: true,
            page: true,
            limit: 10,
            limits: [10, 50, 100, 150, 200],
            headers: {
                'Authorization': localStorage.getItem('token'),
                'KJPT-USER-ID': localStorage.getItem('user-id')
            },
            where: getSifter(),
            request: {
                pageName: 'pageNum', // 页码的参数名称，默认：page
                limitName: 'pageSize' // 每页数据量的参数名，默认：limit
            },
            parseData: function (res) {
                let page = res.data || {};
                return {
                    'code': res.status === 200 ? 0 : res.status, // 解析接口状态
                    'msg': res.message || res.msg, // 解析提示文本
                    'count': page.recordsTotal, // 解析数据长度
                    'data': page.records, // 解析数据列表
                    'page': page.pageNum, // 当前页
                    'limit': page.pageSize // 每页条数
                }
            },
            cols: [[
                {
                    title: '选择',
                    width: 60,
                    align: 'center',
                    fixed: 'left',
                    hide: _isPerson,
                    templet: (data) => {
                        let msg = _isGov ? canCheck(data) : canReport(data);
                        if (!msg) {
                            return '<input type="checkbox" name="layTableCheckbox" lay-skin="primary">';
                        } else {
                            return '<img src="/img/checkbox-disable.png" style="width:24px;" alt="' + msg + '" onmouseenter="showTips(this)" onmouseleave="closeTips()"/>';
                        }
                    }
                },
                {title: '选择1', width: 60, align: 'center', type: 'checkbox', hide: true},
                {field: 'cmeYear', title: '年度', minWidth: 76, align: 'center', sort: true, fixed: "left"},
                {field: 'personNo', title: '人员编号', minWidth: 120, align: 'center', sort: true, fixed: "left"},
                {field: 'personName', title: '姓名', minWidth: 100, align: 'center', sort: true, fixed: "left"},
                {field: 'titleName', title: '职称', minWidth: 120, align: 'center', sort: true},
                {field: 'unitId', title: '单位编号', minWidth: 102, align: 'center', sort: true},
                {field: 'unitName', title: '单位名称', minWidth: 200, align: 'center', sort: true},
                {field: 'deptName', title: '科室', minWidth: 120, align: 'center', sort: true},
                {field: 'totalScore', title: '总学分', minWidth: 88, align: 'center', sort: true},
                {field: 'totalPeriod', title: '总学时', minWidth: 88, align: 'center', sort: true},
                {
                    field: 'passResult',
                    title: '达标结果',
                    minWidth: 102,
                    align: 'center',
                    sort: true,
                    templet: (data) => PassResultEnum[data.passResult]
                },
                {
                    field: 'id',
                    title: '上报状态',
                    minWidth: 102,
                    align: 'center',
                    sort: true,
                    templet: (data) => data.id ? '已上报' : '未上报'
                },
                {field: 'createTime', title: '上报时间', minWidth: 163, align: 'center', sort: true},
                {
                    field: 'cityCheckState',
                    title: '市卫健委审核状态',
                    minWidth: 130,
                    align: 'center',
                    sort: true,
                    hide: _isPhUnit,
                    templet: (data) => getOrDefault(CheckStateEnum[data.cityCheckState % 10], '')
                },
                {field: 'cityCheckTime', title: '市卫健委审核时间', minWidth: 163, align: 'center', sort: true, hide: _isPhUnit},
                {
                    field: 'provinceCheckState',
                    title: '省卫健委审核状态',
                    minWidth: 130,
                    align: 'center',
                    sort: true,
                    templet: (data) => getOrDefault(CheckStateEnum[data.provinceCheckState % 10], '')
                },
                {field: 'provinceCheckTime', title: '省卫健委审核时间', minWidth: 163, align: 'center', sort: true},
            ]],
            data: [{
                personNo: "123"
            }],
            done: function (res, curr, count) {
                if (_isGov) {
                    $('.only_gov').show().css("display", "inline-block");
                } else {
                    $('.only_unit').show().css("display", "inline-block");
                }
            }
        });
    }
    function refreshTable(mf) {
        let a = {
            where: getSifter()
        };
        mf && (a.page = {curr: 1});
        table.reload('table_id', a);
    }
});