layui.config({
    base: '/js/layui/ext/'
}).extend({
    xmSelect: 'xm-select',
    lat: 'lat'
}).use(['table', 'layer', 'jquery', 'form', 'laydate', 'element', 'xmSelect', 'lat'], function () {
    let table = layui.table;
    let layer = layui.layer;
    let laydate = layui.laydate;
    let $ = layui.jquery;
    let lat = layui.lat;
    let gDeptTreeData;
    let gDeptTreeSelector;
    let gOrderBy = 'score.person_no asc';
    let drag = {x1: 0, y1: 0, x2: 0, y2: 0, down: false};
    window.refreshTable = refreshTable;
    const _sortField = {
        'personNo': 'score.person_no',
        'personName': 'score.person_name',
        'desCertId': 'score.cert_id',
        'deptName': 'dept.dept_id',
        'titleName': 'title.title_id',
        'studyDate': 'score.study_date',
        'projNo': 'score.proj_no',
        'projName': 'score.proj_name',
        'teachUnitName': 'score.teach_unit',
        // 'scoreLevelName': 'sl.score_level_id',
        // 'holdTypeName': 'ht.hold_type_id',
    };
    $(function () {
        //
    });
    layer.ready(function () {
        _lbl_inst.sdysel = lat.renderDaySelector('input[name="startDate"]', aMonthAgo(), {min: `${_cur_year}-01-01`, max: `${_cur_year}-12-31`});
        _lbl_inst.edysel = lat.renderDaySelector('input[name="endDate"]', today(), {min: `${_cur_year}-01-01`, max: `${_cur_year}-12-31`});
        renderTable();
    });
    table.on('toolbar(cigPersonTable)', function (obj) {
        if ('export_excel' === obj.event) {
            let visit = huayi_projectscore_url + 'pgsi/check/glance/down';
            downloadFile(visit, getSifter(), '学分审核情况.xlsx');
        }
    });
    function bindSort() {
        $('.layui-edge.layui-table-sort-asc').on('click', function () {
            let field = $(this).parents('th').data('field');
            let f = _sortField[field];
            if (f) {
                gOrderBy = `${f} ASC, score.person_no asc`;
                refreshTable({page: {curr: 1}});
            }
        });
        $('.layui-edge.layui-table-sort-desc').on('click', function () {
            let field = $(this).parents('th').data('field');
            let f = _sortField[field];
            if (f) {
                gOrderBy = `${f} DESC, score.person_no asc`;
                refreshTable({page: {curr: 1}});
            }
        });
        let $th = $('th');
        $th.on('click', function () {
            let field = $(this).data('field');
            let f = _sortField[field];
            let $span = $(this).find('span.layui-table-sort.layui-inline');
            let ad = $span.attr('lay-sort');
            if (f && ad) {
                gOrderBy = `${f} ${ad}, score.person_no asc`;
                refreshTable({page: {curr: 1}});
            }
            if (f && !ad) {
                gOrderBy = 'score.person_no asc';
                refreshTable({page: {curr: 1}});
            }
        });
        $th.on('mousedown', function (e) {
            drag.down = true;
            drag.x1 = e.offsetX;
            drag.y1 = e.offsetY;
        });
        $th.on('mousemove', function (e) {
        });
        $th.on('mouseup', function (e) {
            drag.down = false;
            drag.x2 = e.offsetX;
            drag.y2 = e.offsetY;
            let dif = Math.sqrt((drag.x1 - drag.x2) * (drag.x1 - drag.x2) + (drag.y1 - drag.y2) * (drag.y1 - drag.y2));
            if (dif < 2) {
                // click
            }
        });
        if ('score.person_no asc' === gOrderBy) {
            $('th[data-field=personNo]').find('span.layui-table-sort.layui-inline').attr('lay-sort', 'asc');
        }
    }
    function getSifter() {
        let queryOption = $('#queryOption').val();
        let queryContent = $('#queryContent').val();
        let res = {
            'scoreTypeVal': 7, // getOrDefault($('#scoreTypeValSelector').val(), 7),
            'unitId': _unitId,
            'checkState': $('#checkStateSelector').val(),
            'startDate': toDayHeader($('input[name="startDate"]').val()),
            'endDate': toDayTail($('input[name="endDate"]').val()),
            'projName': $('input[name=projName]').val(),
            'scoreModes': $('select[name=scoreModes]').val(),
            // 'deptIds': idsFromTree(gDeptTreeSelector, gDeptTreeData, 'deptId'),
            'deptName': $('input[name=deptName]').val(),
            'teachUnitType': $('select[name=teachUnitType]').val(),
            'orderBy': gOrderBy,
            'scoreLevelIds': _lbl_inst.getVal('lblScoreLevel_ids'),
            'knowledgeIds': _lbl_inst.getVal('lblKnowledge_ids'),
            'holdType': _lbl_inst.getVal('lblActivityForm_id'),
            'projType': _lbl_inst.getVal('lblActivityType_id'),
            'scoreType': _lbl_inst.getVal('lblActivityContent_id'),
            'medicalType': _lbl_inst.getVal('lblMedicalSystem_id'),
        };
        queryOption && (res[queryOption] = queryContent);
        return res;
    }
    function refreshTable(ec) {
        let c = {where: getSifter()};
        ec ? $.extend(true, c, ec) : '';
        table.reload('cigPersonTable', c);
    }
    function renderTable() {
        table.render({
            id: 'cigPersonTable',
            elem: '#cigPersonTable',
            page: true,
            height: 'full-100',
            url: huayi_projectscore_url + 'pgsi/score/page/byunit', // byUnit
            method: 'post',
            contentType: 'application/json',
            headers: {
                'Authorization': localStorage.getItem('token'),
                'KJPT-USER-ID': localStorage.getItem('user-id')
            },
            where: getSifter(),
            parseData: function (res) {
                return {
                    'code': res.status === 200 ? 0 : res.status, // 解析接口状态
                    'msg': res.message, // 解析提示文本
                    'count': res.data.recordsTotal, // 解析数据长度
                    'data': res.data.records, // 解析数据列表
                    'page': res.data.pageNum, // 当前页
                    'limit': res.data.pageSize // 每页条数
                }
            },
            request: {
                pageName: 'pageNum',  // 页码的参数名称，默认：page
                limitName: 'pageSize'  // 每页数据量的参数名，默认：limit
            },
            defaultToolbar: [],
            toolbar: '#glanceToolbar',
            cols: [[
                {field: 'personName', title: '姓名', width: 100, align: 'center', sort: true, fixed: 'left'},
                {field: 'desCertId', title: '身份证号', width: 190, align: 'center', sort: true, fixed: 'left'},
                {field: 'personNo', title: '人员编号', width: 120, align: 'center', sort: true},
                {field: 'deptName', title: '科室', width: 120, align: 'center', sort: true},
                {field: 'titleName', title: '职称', width: 120, align: 'center', sort: true},
                {field: 'studyDate', title: '活动日期', width: 120, align: 'center', sort: true},
                {field: 'projNo', title: '项目编号', width: 180, align: 'center', sort: true},
                {field: 'projName', title: '项目名称', width: 180, align: 'center', sort: true},
                {field: 'extdata', title: '详细信息', width: 180, align: 'center', sort: true, templet: data => _txt.ext__data(data)},
                {field: 'scoreLevelName', title: projectLabels.lblScoreLevel, width: 160, align: 'center', sort: false},
                {field: 'knowledgeName', title: '学科', width: 120, align: 'center', sort: false},
                {field: 'holdTypeName', title: projectLabels.lblActivityForm, width: 120, align: 'center', sort: false},
                {field: 'projType', title: projectLabels.lblActivityType, width: 120, align: 'center', sort: false, templet: data => _txt.projType(data.projType)},
                {field: 'scoreType', title: projectLabels.lblActivityContent, width: 120, align: 'center', sort: false, templet: data => _txt.scoreType(data.scoreType)},
                {field: 'medicalType', title: projectLabels.lblMedicalSystem, width: 120, align: 'center', sort: false, templet: data => _txt.medicalType(data.medicalType)},
                {
                    field: 'teachUnitName', title: '学分录入单位', width: 160, align: 'center', sort: true, templet: data => {
                        if (1 === data.scoreTypeVal) return getOrDefault(coalesce(data.teachUnitText, data.teachUnitName), '');
                        return getOrDefault(coalesce(data.teachUnitText, data.teachUnitName), '');
                    }
                },
                {
                    field: 'checkState',
                    title: '审核状态',
                    width: 120,
                    align: 'center',
                    sort: false,
                    templet: (data) => getOrDefault(CheckStateEnum[data.checkState], '')
                },
                {field: 'checkTime', title: '审核时间', width: 180, align: 'center', sort: false},
                {field: 'checkUnitName', title: '审核单位', width: 200, align: 'center', sort: false},
                {
                    field: 'checkMemo',
                    title: '审核意见',
                    width: 200,
                    align: 'center',
                    sort: false,
                    templet: (data) => (data.checkMemo && data.checkMemo !== '.') ? data.checkMemo : ''
                },
                {field: 'remark', title: '备注', width: 120, align: 'center', sort: false}
            ]],
            done: function () {
                bindSort();
            }
        });
    }
});