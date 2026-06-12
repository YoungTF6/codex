function createBaseHtml() {
    var html = `<div class="layui-fluid">
        <div class="layui-card">

            <div class="layui-form layui-card-header layuiadmin-card-header-auto" style="background-color: #f5f5f5;">
                <div class="layui_mess">
                    <div class="layui_display">
                        <div class="layui-inline layui-col-xs12 layui-col-sm6 layui-col-md3">
                            <label class="layui-form-label">时间范围</label>
                            <div class="layui-input-block">
                                <input type="text" class="layui-input" id="studyDateCollection" readonly=""
                                       placeholder="请选择">
                            </div>
                        </div>
                        <div class="layui-inline layui-form tree-select layui-col-xs12 layui-col-sm6 layui-col-md3" lay-filter="deptSelectArea" id="deptTreeSelectId">
                            <label class="layui-form-label">科室</label>
                            <div class="layui-input-block">
                                <input type="text" autocomplete="off" class="layui-input" disabled lay-filter="deptSelect" id="deptSelect" name="deptId" placeholder="请选择单位">
                            </div>
                        </div>
                        <div class="layui-inline layui-col-xs12 layui-col-sm6 layui-col-md3">
                            <label class="layui-form-label">姓名</label>
                            <div class="layui-input-block">
                                <input type="text" id="personName" placeholder="请输入" autocomplete="off" class="layui-input">
                            </div>
                        </div>
                        <div class="layui-inline layui-col-xs12 layui-col-sm6 layui-col-md3">
                            <label class="layui-form-label">证件号</label>
                            <div class="layui-input-block">
                                <input type="text" id="certId" placeholder="请输入" autocomplete="off" class="layui-input">
                            </div>
                        </div>
                        <div class="layui-inline layui-col-xs12 layui-col-sm6 layui-col-md3">
                            <label class="layui-form-label">人员编号</label>
                            <div class="layui-input-block">
                                <input type="text" id="personNo" placeholder="请输入" autocomplete="off" class="layui-input">
                            </div>
                        </div>

                        <div class="layui-inline layui-col-xs12 layui-col-sm6 layui-col-md3" lay-filter="personStateSelectArea">
                            <label class="layui-form-label">审核状态</label>
                            <div class="layui-input-block">
                                <select id="checkStateSelect">
                                    <option value="">全部</option>
                                    <option value="0">未审核</option>
                                    <option value="4">审核中</option>
                                    <option value="3">审核通过</option>
                                    <option value="1">审核不通过</option>
                                </select>
                            </div>
                        </div>

                        <div class="layui-inline layui-col-xs12 layui-col-sm6 layui-col-md3">
                            <label class="layui-form-label">职称级别</label>
                            <div class="layui-input-block">
                                <select id="titleLevel">
                                    <option value="">全部</option>
                                </select>
                            </div>
                        </div>

                        <div class="layui-inline layui-col-xs12 layui-col-sm6 layui-col-md3">
                            <label class="layui-form-label">职称</label>
                            <div class="layui-input-block">
                                <input type="text" autocomplete="off" class="layui-input" lay-filter="text_title_names" id="text_title_names" placeholder="请选择">
                                <input type="hidden" autocomplete="off" class="layui-input" lay-filter="hidden_title_ids " id="hidden_title_ids">
                            </div>
                        </div>
                        <div class="layui-inline layui-form tree-select layui-col-xs12 layui-col-sm6 layui-col-md3" lay-filter="specSelectArea">
                            <label class="layui-form-label">专业</label>
                            <div class="layui-input-block">
                                <input type="text" autocomplete="off" class="layui-input" disabled lay-filter="specSelect" id="specSelect" name="specId" placeholder="请选择">
                            </div>
                            <input type="hidden" id="hidden_spec">
                        </div>
                        <div class="layui-inline layui-col-xs12 layui-col-sm6 layui-col-md3">
                            <label class="layui-form-label">人员状态</label>
                            <div class="layui-input-block">
                                <select id="personStateId">
                                    <option value="">全部</option>
                                </select>
                            </div>
                        </div>
                        <div class="layui-inline layui-col-xs12 layui-col-sm6 layui-col-md3 zhejiang_show">
                            <label class="layui-form-label">人员类型</label>
                            <div class="layui-input-block">
                                <select class="con_sel" id="select_medical_type">
                                    <option value="">请选择</option>
                                    <option value="1">西医</option>
                                    <option value="2">中医</option>
                                    <option value="3">疾控</option>
                                </select>
                            </div>
                        </div>

                    </div>
                    <div class="layui_display">
                        <div class="layui-inline">
                            <a class="layui-btn layui-btn-sm" id="searchBtn" lay-submit lay-filter="LAY-app-order-search">
                                <i class="layui-icon layui-icon-search layuiadmin-button-btn"></i>查询
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!--        表格区域-->
            <div class="layui-card-body layui_body_box">
                <div class="layui-tab-content">
                    <div class="layui-tab-item layui-show">
                        <table class="layui-table" id="personCredit" lay-filter="personCredit" style="margin: 0px 0px;"></table>
                    </div>
                </div>

            </div>
        </div>
    </div>`;
    $('body').html(html);
}
createBaseHtml();


layui.config({
    base: '/js/layui/ext/'
}).extend({
    treeSelect: 'treeSelect',
    personCreditStatusCommon: 'score/creditstatus/personCreditStatusCommon'
});
// 全局配置及引入相关的模块
layui.use(['table', 'form', 'element', 'laydate', 'treeSelect', 'personCreditStatusCommon'], function () {
    var table = layui.table;
    var form = layui.form;
    var $ = layui.jquery, laydate = layui.laydate;
    var layer = layui.layer, treeSelect = layui.treeSelect;
    var element = layui.element;
    var personCreditStatusCommon = layui.personCreditStatusCommon;
    var year = $('#holdYear').val();
    var my = new Date();
    var status = -1;
    var usertype = localStorage.getItem("user-type");
    var cmeStandardKindId = localStorage.getItem("standardkind-id");
    var menuUnitId;

    const IS_ZHEJIANG = StandardKind.ZHE_JIANG == cmeStandardKindId;

    // 日期范围
    personCreditStatusCommon.ininDateInstance('studyDateCollection');

    function loadColArry(timestamp) {
        // 重置 window.colArray
        window.colArray = [
            {   //这里使用layui给我们提供的自定义模版功能来达到checkbox控制效果
                field: 'CheckCustom', title: '选择', align: 'center', width: 80, templet: function (d) {
                    var templateHtml = ' <input type="checkbox" name="layTableCheckbox" lay-skin="primary" value="' + d.com_person_id + '"><i class="layui-icon"></i>';
                    return templateHtml;
                }
            },
            {
                field: 'center', width: 120, title: '详细情况明细', align: 'center', templet: function () {
                    return '<a class="layui-btn layui-btn-xs" lay-event="viewPersonScoreDetail" style="color: #27b1a2;background-color: transparent;">查看</a>';
                }
            },
            {
                field: 'center', width: 120, title: '各类学分汇总', align: 'center', templet: function () {
                    return '<a class="layui-btn layui-btn-xs" lay-event="viewPersonScoreStatistic" style="color: #27b1a2;background-color: transparent;">查看</a>';
                }
            },
            { field: 'person_name', title: '姓名', sort: true, align: 'center' },
            { field: 'cert_id', width: 180, title: '证件号', sort: true, align: 'center' },
            { field: 'sex', title: '性别', sort: true, align: 'center' },
            { field: 'birthday', title: '出生日期', sort: true, align: 'center', width: 140 },
            { field: 'person_no', title: '人员编号', sort: true, align: 'center', width: 140 },
            { field: 'person_state_name', title: '人员状态', sort: true, width: 120, align: 'center' },
            { field: 'is_intheseries', title: '在编状态', sort: true, align: 'center', hide: IS_ZHEJIANG },
            {
                field: 'medical_type', title: '人员类型', sort: true, width: 120, align: 'center', hide: !IS_ZHEJIANG,
                templet: function (row) {
                    let medicalType = row.medical_type;
                    return medicalType == 1 ? "西医" : medicalType == 2 ? "中医" : medicalType == 3 ? "疾控" : "";

                }
            },
            { field: 'unit_name', title: '单位', sort: true, align: 'center', width: 190 },
            { field: 'dept_name', title: '科室', sort: true, align: 'center', width: 190 },
            { field: 'title_name', title: '职称', sort: true, align: 'center', width: 190 },
            { field: 'person_spec_name', title: '专业', sort: true, align: 'center', width: 170 },
            { field: 'sumscore', title: '总学分', sort: true, align: 'center' },
            { field: 'sumperiod', title: '总学时', sort: true, align: 'center' }
        ];
        //如果timestamp>2024年，则显示项目学分和非项目学分
        if (timestamp > 2024) {
            if (IS_ZHEJIANG) {
                window.colArray.push({ field: '专业课', title: '专业科目', sort: true, align: 'center' });
                window.colArray.push({ field: '公需课', title: '公需科目', sort: true, align: 'center' });
            } else {
                window.colArray.push({ field: '项目类学分', title: '项目类学分', sort: true, align: 'center' });
                window.colArray.push({ field: '非项目学分', title: '非项目类学分', sort: true, align: 'center' });
            }
        }

        $.ajax({
            type: "POST",
            async: false,
            url: huayi_projectscore_url + "comPersonCredit/getCmeComScoreKind",
            data: { cmeStandardKindId: localStorage.getItem("standardkind-id"), cmeYear: timestamp },
            dataType: 'json',
            success: function (data) {
                $.each(data.data.records, function (index, item) {
                    var name = item.kindName;
                    let column = {
                        field: name, title: name, sort: true, align: 'center', testName: name,
                        templet: function (d) {
                            const name = this.testName;
                            if (d[name] == null) return 0;
                            return d[name];
                        }
                    };
                    window.colArray.push(column);
                });
            },
            error: function (data, xhr, stus) {
                layer.msg("响应失败");
            }
        });
    }


    // 表格相关操作
    // 表格配置
    function loaderTable() {
        menuUnitId = localStorage.getItem("menu-unit-id");
        menuUnitId = menuUnitId == '' || menuUnitId == null ? localStorage.getItem("unit-id") : menuUnitId;
        window.mainTable = table.render({
            elem: '#personCredit',
            url: huayi_projectscore_url + 'comPersonCredit/getComPersonCreditList',
            title: '用户表',
            method: 'post',
            defaultToolbar: [],
            where: {
                personName: $('#personName').val(),
                certId: $('#certId').val(),
                sex: $('#sex').val(),
                birthday: $('#birthday').val(),
                personNo: $('#personNo').val(),
                personStateId: $('#personStateId').val(),
                isIntheseries: $('#isIntheseries').val(),
                deptId: $('#deptSelect').val(),
                titleId: $('#hidden_title_ids').val(),
                studyDateCollection: $('#studyDateCollection').val(),
                checkStateSelect: $("#checkStateSelect").val(),
                spec: $("#hidden_spec").val(),
                titleLevel: $("#titleLevel").val(),
                medicalType: $("#select_medical_type").val(),
                cmeStandardKindId: localStorage.getItem("standardkind-id"),
                userCreate: localStorage.getItem("user-id"),
                unitId: menuUnitId
            },

            cols: [
                window.colArray
            ],
            done: function (res, curr, count) {
                if (!res.data) {
                    return;
                }
                for (var i = 0; i < res.data.length; i++) {
                    var state = res.data[i].isPass; //根据status状态判断，不为0时，禁止勾选
                    var checkallinfo = $("#checkboxAll").is(":checked");
                    var checkboxCurrent = $("#checkboxCurrent").is(":checked");
                    var templateHtml = "";
                    //如果全选
                    if (checkallinfo || checkboxCurrent) {
                        var index = res.data[i]['LAY_TABLE_INDEX'];
                        if (state == null) {
                            $(".layui-table tr[data-index=" + index + "] input[type='checkbox']").prop('checked', true);
                            $(".layui-table tr[data-index=" + index + "] input[type='checkbox']").next().addClass('layui-form-checked');
                        }
                    }
                }
            },
            toolbar: personCreditStatusCommon.generateTableBar(),
            cellMinWidth: 100,
            id: "personCredit",
            height: 'full-210',
            page: true,
            limit: 10,
            limits: [10, 50, 100, 150, 200],
            parseData: function (res) {
                return {
                    "code": res.status === 200 ? 0 : res.status, //解析接口状态
                    "msg": res.message, //解析提示文本
                    "count": res.data.recordsTotal, //解析数据长度
                    "data": res.data.records, //解析数据列表
                    "page": res.data.pageNum, //当前页
                    "limit": res.data.pageSize, //每页条数
                }

            },
            request: {
                pageName: 'pageNum', //页码的参数名称，默认：page
                limitName: 'pageSize' //每页数据量的参数名，默认：limit
            }
        });
    };

    function reloadTabletitle() {
        window.mainTable.reload({
            method: 'post',
            url: huayi_projectscore_url + 'comPersonCredit/getComPersonCreditList',
            defaultToolbar: [],
            where: {
                personName: $('#personName').val(),
                certId: $('#certId').val(),
                sex: $('#sex').val(),
                birthday: $('#birthday').val(),
                personNo: $('#personNo').val(),
                personStateId: $('#personStateId').val(),
                isIntheseries: $('#isIntheseries').val(),
                deptId: $('#hidden_dept_id').val(),
                titleId: $('#hidden_title_ids').val(),
                studyDateCollection: $('#studyDateCollection').val(),
                checkStateSelect: $("#checkStateSelect").val(),
                medicalType: $("#select_medical_type").val(),
                cmeStandardKindId: localStorage.getItem("standardkind-id"),
                userCreate: localStorage.getItem("user-id"),
                unitId: localStorage.getItem("unit-id")
            },

            cols: [
                //{field: 'center', width: 160, toolbar: '#rowBar', title: '操作', fixed: 'left'},
                window.colArray
            ],
            parseData: function (res) {
                return {
                    "code": res.status === 200 ? 0 : res.status, //解析接口状态
                    "msg": res.message, //解析提示文本
                    "count": res.data.recordsTotal, //解析数据长度
                    "data": res.data.records, //解析数据列表
                    "page": res.data.pageNum, //当前页
                    "limit": res.data.pageSize, //每页条数
                }

            },
            request: {
                pageName: 'pageNum', //页码的参数名称，默认：page
                limitName: 'pageSize' //每页数据量的参数名，默认：limit
            }
        }, true);
    };
    window.colSettingClaaback = function (obj) {
        var str = {
            "module_name": "Project"
        };
        $.ajax({
            type: "POST",
            headers: {
                "Accept": 'application/json',
                "Authorization": localStorage.getItem("token"),
                "KJPT-USER-ID": localStorage.getItem("user-id"),
                "cmestandard-id": localStorage.getItem("standardkind-id")
            },
            async: false,
            url: huayi_projectscore_url + "project/comcolumnList",
            data: JSON.stringify(str),
            contentType: "application/json",
            success: function (data) {
                window.colArray = [{
                    field: 'center',
                    width: 160,
                    toolbar: '#rowBar',
                    title: '操作',
                    fixed: 'left'
                }, {
                    field: 'center',
                    width: 100,
                    toolbar: '#rowCheckBar',
                    title: '审批进度',
                    fixed: 'left'
                }, {
                    field: 'status',
                    title: '状态',
                    hide: true
                }];
                $.each(data.data, function (index, item) {
                    let column = {
                        field: item.columnCamelCase,
                        title: item.columnName,
                        sort: item.orderable
                    };
                    window.colArray.push(column);
                })
                reloadTabletitle();
                if (obj && obj.success) {
                    layer.close(window.colLayerIndex);
                } else {
                    layui.msg(obj.msg);
                }
            },
            error: function (data, xhr, stus) {
                layer.msg("响应失败");
            }
        })
    }


    $(function () {
        var today = new Date();
        var beginDate = today.getFullYear() + '-01-01';

        var tYear = today.getFullYear();
        var tMonth = today.getMonth();
        var tDate = today.getDate();
        tMonth = personCreditStatusCommon.formatMonthOrDay(tMonth + 1);
        tDate = personCreditStatusCommon.formatMonthOrDay(tDate);

        $('#studyDateCollection').val(beginDate + ' - ' + tYear + "-" + tMonth + "-" + tDate);
        loadColArry(tYear);

        loaderTable();
        ddlList();

    });
    $(".tab_others").on("click", function () {
        var index = $(this).index();
        $(this).addClass("tab_this").siblings().removeClass("tab_this");

    });



    /* 专业树初始化 */
    setTimeout(() => {
        var specTreeSelect = treeSelect.render({
            elem: '#specSelect',
            data: huayi_sjwh_url + 'comPersonSpec/tree',
            type: 'get',
            search: true,
            style: {
                folder: { // 父节点图标
                    enable: true // 是否开启：true/false
                },
                line: { // 连接线
                    enable: true // 是否开启：true/false
                }
            },
            click: function (data) {
                $("#hidden_spec").val(data.current.id);
            }
        });
    }, 400);
    // 职称选择
    $("#text_title_names").click(function () {
        var titleIds = $("#hidden_title_ids").val();
        layer.open({
            type: 2,
            content: "../../controls/selectTitle/selectTitles.html?titleIds=" + titleIds,
            area: ['700px', '480px'],
            scrollbar: false
        });
    });

    if (usertype == '12') {
        // 科室树初始化
        var deptTreeSelect = treeSelect.render({
            elem: '#deptSelect',
            data: huayi_personorg_url + 'comdept/tree/unit?unitId=' + localStorage.getItem("unit-id"),
            type: 'get',
            search: true,
            style: {
                folder: { // 父节点图标
                    enable: true // 是否开启：true/false
                },
                line: { // 连接线
                    enable: true // 是否开启：true/false
                }
            }
        });
    } else {
        $('#deptSelect').attr("value", localStorage.getItem("dept-id"));
        $("#deptTreeSelectId").attr("style", "display:none");
        //$('#deptSelect').append(new Option(localStorage.getItem("realname"),localStorage.getItem("dept-id")));
    }

    function ddlList() {
        //加载举办单位
        $.ajax({
            type: "post",
            url: huayi_projectscore_url + "comPersonCredit/getPersonStateList",
            data: {
                cmeStandardKindId: localStorage.getItem("standardkind-id")
            },
            dataType: 'json',
            success: function (data) {
                $.each(data.data.records, function (index, item) {
                    if (IS_ZHEJIANG) {
                        if (item.person_state_name.indexOf('产假') < 0) {
                            $('#personStateId').append(new Option(item.person_state_name, item.person_state_id)); //往下拉菜单里添加元素
                        }
                    } else {
                        $('#personStateId').append(new Option(item.person_state_name, item.person_state_id)); //往下拉菜单里添加元素
                    }

                })
                form.render('select'); //刷新select选择框渲染
            },
            error: function (data) {
                layer.msg("响应失败");
            }
        });

        //加载职称级别
        $.ajax({
            type: "post",
            url: huayi_projectscore_url + "comPersonCredit/getTitleLevel",
            dataType: 'json',
            success: function (data) {
                $.each(data.data.records, function (index, item) {
                    $('#titleLevel').append(new Option(item.title_name, item.title_id)); //往下拉菜单里添加元素
                })
                form.render('select'); //刷新select选择框渲染
            },
            error: function (data) {
                layer.msg("响应失败");
            }
        });

    }




    // 监听头部新增按钮
    table.on('toolbar(personCredit)', function (obj) {
        var datas = obj.data;
        //document.getElementById("form-Project").reset();
        if (obj.event === 'add') {
            layer.open({
                title: '选择您要申报的项目级别',
                content: "AddProject.html",
                type: 2,
                area: ['400px', '270px'],
                end: function (index, layero) {
                    loaderTable();
                }
            })
        } else if (obj.event === 'excel') {
            var personIdLists = '';
            var child = $("input[name='layTableCheckbox']");
            child.each(function (index, item) {
                if (item.checked === true) {
                    personIdLists += item.defaultValue + ',';
                }
            });
            if (personIdLists.length > 0) {
                personIdLists = personIdLists.substring(0, personIdLists.length - 1);
            } else {
                layer.alert("请选择需要导出的人员");
                return;
            }
            var loading = layer.load(0, {
                shade: false
            });
            //判断是否全选
            var checkallinfo = $("#checkboxAll").is(":checked");
            var checkallstatustest;
            if (checkallinfo) {
                checkallstatustest = 1;
            } else {
                checkallstatustest = 0;
            }
            //导出excel
            axios({
                method: 'POST',
                url: huayi_projectscore_url + "projectExclel/excelPersonCredit",
                responseType: 'blob',
                headers: {
                    "Accept": 'application/json',
                    "Authorization": localStorage.getItem("token"),
                    "KJPT-USER-ID": localStorage.getItem("user-id"),
                    "cmestandard-id": localStorage.getItem("standardkind-id")
                },
                data: {
                    personName: $('#personName').val(),
                    certId: $('#certId').val(),
                    sex: $('#sex').val(),
                    birthday: $('#birthday').val(),
                    personNo: $('#personNo').val(),
                    personStateId: $('#personStateId').val(),
                    isIntheseries: $('#isIntheseries').val(),
                    deptId: $('#deptSelect').val(),
                    titleId: $('#hidden_title_ids').val(),
                    studyDateCollection: $('#studyDateCollection').val(),
                    checkStateSelect: $("#checkStateSelect").val(),
                    spec: $("#hidden_spec").val(),
                    titleLevel: $("#titleLevel").val(),
                    personIdList: personIdLists,
                    checkallstatus: checkallstatustest,

                    cmeStandardKindId: localStorage.getItem("standardkind-id"),
                    userCreate: localStorage.getItem("user-id"),
                    unitId: localStorage.getItem("unit-id")
                }
            }).then(function (res) {
                layer.close(loading);
                var data = res.data;
                var blob = new Blob([data], { type: 'application/octet-stream' });
                var url = URL.createObjectURL(blob);
                var exportLink = document.createElement('a');
                exportLink.setAttribute("download", "人员学分情况.xlsx");
                exportLink.href = url;
                document.body.appendChild(exportLink);
                exportLink.click();
            })
        } else if (obj.event === 'pdf') {

            var personIdLists = '';
            var child = $("input[name='layTableCheckbox']");
            child.each(function (index, item) {
                if (item.checked === true) {
                    personIdLists += item.defaultValue + ',';
                }
            });
            if (personIdLists.length > 0) {
                personIdLists = personIdLists.substring(0, personIdLists.length - 1);
            } else {
                layer.alert("请选择需要导出的人员");
                return;
            }
            var loading = layer.load(0, {
                shade: false
            });
            //判断是否全选
            var checkallinfo = $("#checkboxAll").is(":checked");
            var checkallstatustest;
            if (checkallinfo) {
                checkallstatustest = 1;
            } else {
                checkallstatustest = 0;
            }
            //导出pdf
            axios({
                method: 'POST',
                url: huayi_projectscore_url + "projectExclel/pdfPersonCredit",
                responseType: 'blob',
                headers: {
                    "Accept": 'application/json',
                    "Authorization": localStorage.getItem("token"),
                    "KJPT-USER-ID": localStorage.getItem("user-id"),
                    "cmestandard-id": localStorage.getItem("standardkind-id")
                },
                data: {
                    personName: $('#personName').val(),
                    certId: $('#certId').val(),
                    sex: $('#sex').val(),
                    birthday: $('#birthday').val(),
                    personNo: $('#personNo').val(),
                    personStateId: $('#personStateId').val(),
                    isIntheseries: $('#isIntheseries').val(),
                    deptId: $('#deptSelect').val(),
                    titleId: $('#hidden_title_ids').val(),
                    studyDateCollection: $('#studyDateCollection').val(),
                    checkStateSelect: $("#checkStateSelect").val(),
                    checkallstatus: checkallstatustest,
                    spec: $("#hidden_spec").val(),
                    titleLevel: $("#titleLevel").val(),
                    personIdList: personIdLists,

                    cmeStandardKindId: localStorage.getItem("standardkind-id"),
                    userCreate: localStorage.getItem("user-id"),
                    unitId: localStorage.getItem("unit-id"),
                    //获取地址栏url
                    servletUrl: window.location.protocol + '//' + window.location.host
                }
            }).then(function (res) {
                layer.close(loading);
                var data = res.data;
                var blob = new Blob([data], { type: 'application/octet-stream' });
                var url = URL.createObjectURL(blob);
                var exportLink = document.createElement('a');
                exportLink.setAttribute("download", "人员学分情况.pdf");
                exportLink.href = url;
                document.body.appendChild(exportLink);
                exportLink.click();
            })
        } else if (obj.event === 'visbale') {
            window.colLayerIndex = layer.open({
                content: "../../column_setting.html?module_name=Project&callBack=colSettingClaaback",
                type: 2,
                area: ['600px', '600px']
            })
        }
    });

    // 监听行内按钮
    table.on('tool(personCredit)', function (obj) {
        var datas = obj.data;
        if (obj.event === 'edit1') {
            form.val('add-filter', datas);
            layer.open({
                type: 1,
                title: '修改',
                content: $('#add-project'),
                skin: '',
                area: ['400px', '400px'],
            })
        } else if (obj.event === 'del') {
            layer.confirm('确定要删除吗', {
                icon: 3,
                title: '提示'
            }, function () {
                $.ajax({
                    type: 'get',
                    url: huayi_projectscore_url + 'project/delete',
                    data: {
                        projectId: datas.projectId
                    },
                    dataType: 'json',
                    success: function (res) {
                        if (res.status === 200) {
                            layer.msg("删除成功");
                            loadReport();
                            table.reload('project');
                        }
                    }
                });
            })
        } else if (obj.event === 'viewPersonScoreDetail') {
            var Str = $("#studyDateCollection").val().lastIndexOf(" - ");
            var startDt = $("#studyDateCollection").val().split(" - ")[0];
            var endDt = $("#studyDateCollection").val().split(" - ")[1];
            var datas = obj.data;
            layer.open({
                type: 2,
                title: '详细情况明细',
                content: '../../score/proj_statistics/personScoreStatistics.html?personId=' +
                    datas.com_person_id + '&startDt=' + startDt + '&endDt=' + endDt + '&checkState=' + $("#checkStateSelect").val(),
                btn: ['关闭'],
                btnAlign: 'c',
                yes: function () {
                    layer.closeAll();
                },
                area: ['100%', '100%'],
                // end: function(index, layero){
                //     loaderTable();
                // }
            })

        } else if (obj.event === 'viewPersonScoreStatistic') {
            var Str = $("#studyDateCollection").val().lastIndexOf(" - ");
            var startDt = $("#studyDateCollection").val().split(" - ")[0];
            var endDt = $("#studyDateCollection").val().split(" - ")[1];
            var datas = obj.data;
            layer.open({
                type: 2,
                title: '各类学分汇总',
                content: '../../score/proj_statistics/personScoreDetails.html?personId=' +
                    datas.com_person_id + '&startDt=' + startDt + '&endDt=' + endDt + '&checkState=' + $("#checkStateSelect").val(),
                btn: ['关闭'],
                btnAlign: 'c',
                yes: function () {
                    layer.closeAll();
                },
                area: ['100%', '100%'],
                // end: function(index, layero){
                //     loaderTable();
                // }
            })
        }
    });

    //下拉框值改变
    form.on('select(loadReport)', function (data) {
        loadReport();
        loaderTable();
    })
    //鼠标悬停提示特效
    $("#hint").hover(function () {
        openMsg();
    }, function () {
        layer.close(subtips);
    });

    //全选
    form.on('checkbox(checkboxAll)', function (data) {
        // console.log(data.elem); //得到checkbox原始DOM对象
        // console.log(data.elem.checked); //是否被选中，true或者false
        // console.log(data.value); //复选框value值，也可以通过data.elem.value得到
        // console.log(data.othis); //得到美化后的DOM对象
        if (data.elem.checked) {
            $("#checkboxCurrent").prop("checked", false);
            var child = $("input[name='layTableCheckbox']");
            child.each(function (index, item) {
                item.checked = true;
            });
        } else {
            var child = $("input[name='layTableCheckbox']");
            child.each(function (index, item) {
                item.checked = false;
            });
        }
        form.render('checkbox');
    });
    //本页全选
    form.on('checkbox(checkboxCurrent)', function (data) {
        if (data.elem.checked) {
            $("#checkboxAll").prop("checked", false);
            var child = $("input[name='layTableCheckbox']");
            child.each(function (index, item) {
                item.checked = true;
            });
        } else {
            var child = $("input[name='layTableCheckbox']");
            child.each(function (index, item) {
                item.checked = false;
            });
        }
        form.render('checkbox');
    });
    function openMsg() {
        subtips = layer.tips('提示信息', '#hint', {
            tips: [1, '#ff6700'],
            time: 30000
        });
    }
    element.on('tab(tabcheck)', function (data) {
        var nums = data.index;
        status = nums;
        loaderTable();
    });

    //点击查询按钮，重载表格
    $('#searchBtn').on('click', function () {
        if ($('#studyDateCollection').val() == "") {
            layer.msg("请先选择时间范围");
            return;
        }
        var tYear = $('#studyDateCollection').val().split(" - ")[1].split("-")[0];
        loadColArry(tYear);
        loaderTable();
    });


});
// 职称选择
function getChildTitles(hidden_title_ids, titleNames) {
    $("#text_title_names").val(titleNames);
    $("#hidden_title_ids").val(hidden_title_ids);
}
