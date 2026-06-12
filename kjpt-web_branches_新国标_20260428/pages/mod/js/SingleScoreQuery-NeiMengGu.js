function createBaseHtml() {
    var html = `<div class="layui-fluid">
    <div class="layui-card">
        <!-- 查询区域 -->
        <div class="layui-form layui-card-header layuiadmin-card-header-auto" id="queryArea"
             style="background-color: #f5f5f5;">
            <div class="layui_mess">
                <div class="layui_display">
                    <div class="layui-inline">
                        <label class="layui-form-label">活动名称</label>
                        <div class="layui-input-block">
                            <input type="text" name="projName" placeholder="请填写活动名称"
                                   autocomplete="off" class="layui-input"/>
                        </div>
                    </div>
                    <div class="layui-inline">
                        <label class="layui-form-label">开始日期</label>
                        <div class="layui-input-inline" style="float: left;">
                            <input type="text" name="startDate" class="layui-input" id="startDateSelector"
                                   autocomplete="off" placeholder="选择开始日期">
                        </div>
                    </div>
                    <div class="layui-inline">
                        <label class="layui-form-label">结束日期</label>
                        <div class="layui-input-inline" style="float: left;">
                            <input type="text" name="endDate" class="layui-input" id="endDateSelector"
                                   autocomplete="off" placeholder="选择结束日期">
                        </div>
                    </div>
                    <div class="layui-inline">
                        <label class="layui-form-label">人员编号</label>
                        <div class="layui-input-block">
                            <input type="number" name="personNo" placeholder="请填写人员编号"
                                   autocomplete="off" class="layui-input"/>
                        </div>
                    </div>
                    <div class="layui-inline">
                        <label class="layui-form-label">人员姓名</label>
                        <div class="layui-input-block">
                            <input type="text" name="personName" placeholder="请填写人员姓名"
                                   autocomplete="off" class="layui-input"/>
                        </div>
                    </div>
                    <div class="layui-inline only_unit">
                        <label class="layui-form-label">科室</label>
                        <div class="layui-input-block">
                            <div id="deptIdSelector" data-name="" style="width: 166px;"></div>
                        </div>
                    </div>
                    <div class="layui-inline">
                        <label class="layui-form-label">审核状态</label>
                        <div class="layui-input-block">
                            <select name="checkStates">
                                <option value="">全部</option>
                                <option value="0,4">未审核</option>
                                <option value="3">审核通过</option>
                                <option value="2">审核不通过</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="layui_display">
                    <div class="layui-inline">
                        <button class="layui-btn layui-btn-sm btnRounded" lay-submit
                                onclick="refreshSingleScoreTable()">
                            <i class="layui-icon layui-icon-search layuiadmin-button-btn"></i>查询
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <!-- 数据表格 -->
        <div class="layui-card-body layui_body_box" style="padding-left: 0;padding-right: 0">
            <table class="layui-table" id="singleScoreTable" lay-filter="singleScoreTable"
                   style="margin: 0;"></table>
        </div>
    </div>
</div>
<div style="display: none" id="dldp">
    <div class="layui-progress layui-progress-big" lay-showpercent="true" lay-filter="dldp">
        <div class="layui-progress-bar" lay-percent="0%"></div>
    </div>
</div>`;
    $('body').html(html);
}
createBaseHtml();


layui.config({
    base: '/js/layui/ext/'
}).extend({
    xmSelect: 'xm-select',
    lat: 'lat',
    personCreditStatusCommon: 'score/creditstatus/personCreditStatusCommon'
}).use(['table', 'layer', 'jquery', 'form', 'laydate', 'element', 'xmSelect', 'lat', 'personCreditStatusCommon'], function () {
    let table = layui.table;
    let layer = layui.layer;
    let form = layui.form;
    let laydate = layui.laydate;
    let dropdown = layui.dropdown;
    let element = layui.element;
    let $ = layui.jquery;
    let xmSelect = layui.xmSelect;
    let lat = layui.lat;
    let personCreditStatusCommon = layui.personCreditStatusCommon;
    let gLayerIndex = -1;
    let gDeptTreeData;
    let gDeptTreeSelector;
    window.refreshSingleScoreTable = refreshSingleScoreTable;

    layer.ready(function () {
        lat.renderDaySelector('#startDateSelector', oneYearAgo());
        lat.renderDaySelector('#endDateSelector', today());
        getDeptTreeData(_unitId, 9).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                gDeptTreeData = jsonRes.data;
                gDeptTreeSelector = lat.renderDeptTreeSelector('#deptIdSelector', gDeptTreeData);
            }
        }).catch(error => {
            layer.msg('error:加载deptTreeData');
        }).finally(() => {
            //
        });
    });
    $(function () {
        form.render();
        renderSingleScoreTable();
    });
    table.on('toolbar(singleScoreTable)', function (obj) {
        if ('exportExcel' === obj.event) {
            let visit = huayi_projectscore_url + 's1/score/down/xlsx';
            lat.downloadWithProgress(visit, getScoreSifter(), '个人活动学分.xlsx');
        }
    });
    function renderSingleScoreTable() {
        table.render({
            id: 'singleScoreTable',
            elem: '#singleScoreTable',
            height: 'full-100',
            toolbar: '#tableToolbar',
            defaultToolbar: [],
            url: huayi_projectscore_url + 's1/score/page',
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
            where: getScoreSifter(),
            request: {
                pageName: 'pageNum', // 页码的参数名称，默认：page
                limitName: 'pageSize' // 每页数据量的参数名，默认：limit
            },
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
            cols: [[
                {field: 'projName', title: '活动名称', minWidth: 240, align: 'center', sort: true},
                {field: 'projNo', title: '活动编号', minWidth: 240, align: 'center', sort: true},
                // {field: 'addUnitName', title: '举办单位', minWidth: 240, align: 'center', sort: true},
                {field: 'teachUnitName', title: '授分单位', minWidth: 110, align: 'center', sort: true},
                {field: 'personNo', title: '人员编号', minWidth: 110, align: 'center', sort: true},
                {field: 'personName', title: '姓名', minWidth: 80, align: 'center', sort: true},
                {field: 'deptName', title: '科室', minWidth: 100, align: 'center', sort: true},
                {field: 'studyDate', title: '授分日期', minWidth: 110, align: 'center', sort: true},
                {field: 'scoreKindName', title: '学分分类', minWidth: 104, align: 'center', sort: true},
                {field: 'scoreLevelName', title: '学分子分类', minWidth: 200, align: 'center', sort: true},
                {field: 'score', title: '学分', minWidth: 80, align: 'center', sort: true},
                {field: 'period', title: '学习时长', minWidth: 110, align: 'center', sort: true},
                {field: 'checkState', title: '审核状态', minWidth: 110, align: 'center', sort: true, templet: (data) => getOrDefault(CheckStateEnum[data.checkState], '')},
                {field: 'checkUnitName', title: '审核单位', minWidth: 200, align: 'center', sort: true},
                {field: 'checkTime', title: '审核时间', minWidth: 110, align: 'center', sort: true},
            ]],
            done: function (res, curr, count) {
            }
        });
    }
    function getScoreSifter() {
        return {
            "unitId": _unitId,
            "depth": 1,
            "standardKindId": _standardKindId,
            "projName": $('input[name=projName]').val(),
            "personNo": $('input[name=personNo]').val(),
            "personName": $('input[name=personName]').val(),
            "checkStates": $('select[name=checkStates]').val(),
            "deptIds": idsFromTree(gDeptTreeSelector, gDeptTreeData, 'deptId'),
            "startDate": toDayHeader($('#startDateSelector').val()),
            "endDate": toDayTail($('#endDateSelector').val()),
            // "downId": PseudoNull.UUID,
        }
    }
    function refreshSingleScoreTable() {
        table.reload('singleScoreTable', {
            where: getScoreSifter()
        });
    }
});