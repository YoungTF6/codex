//内蒙古的js逻辑都在这里，尽情的改吧，不用判断各种套了

function createBaseHtml() {
    var html = `
    <div class="layui-fluid">
        <div class="layui-card">
            <!--        搜索框区域-->
            <div class="layui-form layui-card-header layuiadmin-card-header-auto" style="background-color: #f5f5f5;">
                <div class="layui_mess">
                    <div class="layui_display">
                        <div class="layui-inline layui-col-md3">
                            <label class="layui-form-label">年度</label>
                            <div class="layui-input-block">
                                <select name="year" lay-filter="layui-select-year" id="year" lay-verify="1"></select>
                            </div>
                        </div>
                        <div id="deptSelectArea" style="display: none;" class="layui-inline layui-form  tree-select layui-col-md3" lay-filter="deptSelectArea">
                            <label class="layui-form-label">科室</label>
                            <div class="layui-input-block">
                                <input type="text" autocomplete="off" class="layui-input" disabled lay-filter="deptSelect" id="deptSelect" name="deptId"
                                    placeholder="请选择单位">
                            </div>
                        </div>
                        <!-- <blockquote class="layui-form layui-form-item layui-elem-quote one-btn" lay-filter="query-form"> -->
                        <div class="layui-inline layui-col-md3">
                            <label class="layui-form-label">姓名</label>
                            <div class="layui-input-block">
                                <input type="text" id="personName" placeholder="姓名" autocomplete="off" class="layui-input">
                            </div>
                        </div>
                        <div class="layui-inline layui-col-md3">
                            <label class="layui-form-label">证件号</label>
                            <div class="layui-input-block">
                                <input type="text" id="certId" placeholder="证件号" autocomplete="off" class="layui-input">
                            </div>
                        </div>
                        <div class="layui-inline layui-col-md3">
                            <label class="layui-form-label">人员编号</label>
                            <div class="layui-input-block">
                                <input type="text" id="personNo" placeholder="人员编号" autocomplete="off" class="layui-input">
                            </div>
                        </div>
                        <div class="layui-inline layui-col-md3">
                            <label class="layui-form-label">人员状态</label>
                            <div  id="personStateId" class="layui-input-block" data-name="personStates"></div>
                        </div>
                        <div class="layui-inline layui-col-md3">
                            <label class="layui-form-label">职称</label>
                            <div class="layui-input-block">
                                <input type="text" autocomplete="off" class="layui-input" lay-filter="text_title_names" id="text_title_names" placeholder="请选择">
                                <input type="hidden" autocomplete="off" class="layui-input" lay-filter="hidden_title_ids " id="hidden_title_ids">
                            </div>
                        </div>
                        <div class="layui-inline layui-col-md3">
                            <label class="layui-form-label">达标结果</label>
                            <div class="layui-input-block">
                                <select id="passResultSelect">
                                    <option value="">全部</option>
                                    <option value="1">达标</option>
                                    <option value="0">不达标</option>
                                    <option value="2">达标标准未做要求</option>
                                </select>
                            </div>
                        </div>
                        <div class="layui-inline layui-col-md3">
                            <label class="layui-form-label">职称级别</label>
                            <div class="layui-input-block">
                                <select id="titleLevelSelect">
                                    <option value="">全部</option>
                                    <option value="7acab84c-e870-4a4d-90ea-9b2f01271376">初级职称</option>
                                    <option value="da42823c-796c-4377-a616-9b2f01271376">中级职称</option>
                                    <option value="6351aa8b-bba0-4805-99ca-9b2f01271376">副高级职称</option>
                                    <option value="3d5f8e06-1274-454c-9c55-9b2f01271376">正高级职称</option>
                                </select>
                            </div>
                        </div>
                        <div class="layui-inline  layui-col-md3 zhejiang_show">
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
                        <!-- todo 达标情况 -->
                    </div>
                    <div class="layui_display">
                        <div class="layui-inline">
                            <!-- <div class="layui-input-block"> -->
                            <a class="layui-btn layui-btn-sm" id="searchBtn" onclick="loaderTable()" lay-filter="table-search" data-type="reload">
                                <i class="layui-icon layui-icon-search layuiadmin-button-btn"></i>查询
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="layui-card-body layui_body_box">
                    <table class="layui-table" id="searchPersonScoreList" lay-filter="searchPersonScoreList" style="margin: 5px 0px;"></table>
            </div>
        </div>
    </div>
    `;
    $('body').html(html);
}
createBaseHtml();


layui.config({
    base: '/js/layui/ext/'
}).extend({
    treeSelect: 'treeSelect',
    xmSelect: 'xm-select',
    eleTree: 'eleTree',
    tool: 'tool',
    personCreditStatusCommon: 'score/creditstatus/personCreditStatusCommon'
});
layui.use(['table', 'form', 'element', 'laydate', 'tool', 'treeSelect', 'xmSelect', 'personCreditStatusCommon'], function () {
    var $ = layui.jquery
        , table = layui.table
        , form = layui.form
        , laydate = layui.laydate
        , layer = layui.layer
        , treeSelect = layui.treeSelect
        , xmSelect = layui.xmSelect
        , tool = layui.tool
        , personCreditStatusCommon = layui.personCreditStatusCommon;

    var unitId = localStorage.getItem("unit-id")
        , menuUnitId = tool.isEmpty(localStorage.getItem("menu-unit-id"))?unitId: localStorage.getItem("menu-unit-id")
        , cmeStandardKindId = localStorage.getItem("standardkind-id")
        , userType = localStorage.getItem("user-type")
        , recordsTotal
        , pageSize
        , xmSelectPersonState
        ;

    var scoreLevelCols = []; // 学分级别表头
    var scoreKindCols = []; // 学分类别表头


    $(() => {

        // 年度下拉框
        var date = new Date();
        var year = date.getFullYear();
        var options;
        for (var i = 0; i < 10; i++) {
            options += '<option value="' + year + '">' + year + '年</option>';
            year = year - 1;
        }
        $('#year').append(options);
        form.render('select');

        laydate.render({
            elem: '#startDate',
            type: 'date'
        });
        laydate.render({
            elem: '#endDate',
            type: 'date'
        });

        // 人员状态
        ddlList();

        getScoreLevel();
    });


    // 根据taoId获取学分级别表头
    let getScoreLevel = function () {
        $.ajax({
            type: "get",
            url: huayi_sjwh_url + "cmecomscorelevel/taoIdAndYear",
            dataType: 'json',
            data: {
                cmeStandardKindId: cmeStandardKindId,
                cmeYear: $('#year').val()
            },
            success: function (res) {
                if (res.status == 200) {
                    scoreLevelCols = res.data;
                    getColsData();
                    // loaderTable();
                }
            },
            error: function (res) {
                layer.msg("响应失败" + res.msg);
            }
        });
    }
    // 根据taoId获取学分类别表头
    let getScoreKind = function () {
        $.ajax({
            type: "get",
            url: huayi_sjwh_url + "cmecomscorekind/list",
            dataType: 'json',
            data: {
                cmeStandardKindId: cmeStandardKindId,
                cmeYear: $('#year').val()
            },
            success: function (res) {
                if (res.status == 200) {
                    scoreKindCols = res.data;
                    getScoreLevel();
                    // getColsData();
                    // loaderTable();
                }
            },
            error: function (res) {
                layer.msg("响应失败" + res.msg);
            }
        });
    }

    // 组装表头模板
    let tempArr = [];
    let getColsData = function () {
        if (tool.isEmpty(scoreLevelCols)) {
            layer.msg("必要参数未加载");
            return;
        }
        let fieldArr = [];
        fieldArr.push({   //这里使用layui给我们提供的自定义模版功能来达到checkbox控制效果
            field: 'CheckCustom', title: '选择', align: 'center', width: 80, templet: function (d) {
                var templateHtml = ' <input type="checkbox"  lay-filter="layTableCheckbox" name="layTableCheckbox" lay-skin="primary" totalSco="' + d.totalScore + '" value="' + d.comPersonId + '"><i class="layui-icon"></i>';
                return templateHtml;
            }
        });
        fieldArr.push({ field: 'center', width: 120, title: '详细情况明细', align: 'center' ,templet: function(d){
            return `<a class="layui-btn layui-btn-xs" lay-event="viewPersonScoreDetail" style="color: #27b1a2;background-color: transparent;">查看</a>`;
        } },
        );
        fieldArr.push({ field: 'center', width: 120, title: '各类学分汇总', align: 'center',templet: function(d) {
            return `<a class="layui-btn layui-btn-xs" lay-event="viewPersonScoreStatistic" style="color: #27b1a2;background-color: transparent;">查看</a>`;
        } },
        );
        fieldArr.push({
            filed: "personNo", title: "人员编号", align: 'center', minWidth: 160,
            templet: function (d) { return d["personNo"] }
        });
        fieldArr.push({
            filed: "personName", title: "姓名", align: 'center', minWidth: 90,
            templet: function (d) { return d["personName"] }
        });
        fieldArr.push({
            filed: "deptName", title: "科室", align: 'center', minWidth: 160,
            templet: function (d) { return d["deptName"] }
        });
        fieldArr.push({
            filed: "titleName", title: "职称", align: 'center', minWidth: 160,
            templet: function (d) { return d["titleName"] }
        });
        fieldArr.push({
            filed: "personStateName", title: "人员状态", align: 'center', minWidth: 140,
            templet: function (d) { return d["personStateName"] }
        });
        fieldArr.push({
            filed: "isIntheseries", title: "在编状态", align: 'center', minWidth: 100,
            templet: function (d) { if (d["isIntheseries"] == '0') return '在编'; return '不在编' },
            hide: false
        });
        fieldArr.push({
            title: "人员类型", align: 'center', minWidth: 100,
            templet: function (d) {   
                let medicalType = d["medicalType"];
                return medicalType == 1 ? "西医"  : medicalType == 2 ? "中医"  : medicalType == 3 ? "疾控" : ""; },
            hide: true
        });
        fieldArr.push({
            filed: "passResult", title: "达标情况", align: 'center', minWidth: 150,
            templet: function (d) {
                let psr = d["passResult"];
                let re = "";
                if(psr == "1") re = "达标";
                if(psr == "0") re = "不达标";
                if(psr == "2") re = "达标标准未做要求";
                return re;
            }
        });
        fieldArr.push({
            filed: "reason", title: "不达标原因", align: 'center', minWidth: 150,
            // templet: function (d) { return '单位级学分不足10分省级学分不足10分总学分不足25学分' }
            templet: function (d) { if (d["totalPeriod"] == null) return ''; return d["reason"] }
        });
        // 管理机构角色显示单位列
        if (userType == 11){
            fieldArr.push({
                filed: "unitName", title: "单位", align: 'center', minWidth: 160,
                templet: function (d) { return d["unitName"] }
            });
        }
        fieldArr.push({
            filed: "totalScore", title: "总学分", align: 'center', minWidth: 80,
            templet: function (d) { if (d["totalScore"] == null) return 0; return d["totalScore"] }
        });

        fieldArr.push({
            filed: "totalPeriod", title: "学习时长", align: 'center', minWidth: 110,
            templet: function (d) { if (d["totalPeriod"] == null) return 0; return d["totalPeriod"] }
        });
        fieldArr.push({
            filed: "totalPeriod", title: "总学时", align: 'center', minWidth: 80,
            templet: function (d) { 
                if (d["totalPeriod"] == null) return 0; 
                return personCreditStatusCommon.generateStudyTimeLength(d["totalPeriod"],$('#year').val());
            }
        });
        if($('#year').val() >= '2025'){
            fieldArr.push({
                filed: "projTotalScore", title: "项目类学分", align: 'center', minWidth: 80,
                templet: function (d) { if (d["projTotalScore"] == null) return 0; return d["projTotalScore"] }
            });
            fieldArr.push({
                filed: "notProjTotalScore", title: "非项目类学分", align: 'center', minWidth: 80,
                templet: function (d) { if (d["notProjTotalScore"] == null) return 0; return d["notProjTotalScore"] }
            });
        }
        for (const obj of scoreKindCols) {
            fieldArr.push({ filed: "tt", minWidth: 100, title: obj["kindName"], align: 'center', factorId: 'Z' + obj["kindId"], templet: setTemplate });
        }
        for (const obj of scoreLevelCols) {
            fieldArr.push({ filed: "tt", minWidth: 100, title: obj["scoreLevelName"], align: 'center', factorId: 'F' + obj["scoreLevelId"], templet: setTemplate });
        }


        tempArr[0] = fieldArr;
        return tempArr;
    }

    //动态标签页方法
    let setTemplate = function (data) {
        if (data.scoreKindMap != null && data.scoreKindMap.hasOwnProperty(this.factorId)) {
            var value = data.scoreKindMap[this.factorId];
            var s = value.toString().split(".");
            if (s.length == 1) {
                value = value.toString() + ".00";
                return value;
            }
            if (s.length > 1) {
                if (s[1].length < 2) {
                    value = value.toString() + "0";
                }
                return value;
            }
        }
        return 0;
    }

    var deptSelectDis = function () {
        // 科室账号 隐藏科室搜索条件, 仅显示本科室数据
        if (userType == 13) {
            var el = $("#deptSelectArea");
            el[0].style.display = "none";
            $('#deptSelect').val(localStorage.getItem("dept-id"));
        } else if (userType == 11) {
            var el = $("#deptSelectArea");
            el[0].style.display = "none";
        } else {
            $("#deptSelectArea")[0].style.display = "inline-block";
        }
    }


    let cretaeToolBar = function () {
        let btnStr = `<div><input type="checkbox" name="like1[read]" id="checkboxCurrent" style="float: left;" lay-filter="checkboxCurrent"  title="本页全选">
              <input type="checkbox" name="like1[read]" id="checkboxAll"  lay-filter="checkboxAll"  title="所有全选">`;
        
        if(localStorage.getItem("unit-user-type")==2 || localStorage.getItem("standardkind-id") == "08e44437-5789-44e0-8ff8-9ecb00a6348a"){
            btnStr += `<button class="layui-btn layui-btn-sm btnRounded" id="excelExport" lay-event="excel" style="float: right;">导出Excel</button>`;
        }

        btnStr += `<div style="float:right;">&nbsp;</div>
        <button class="layui-btn layui-btn-sm btnRounded" lay-event="visbale" style="float: right;">导出PDF</button></div>`;
        return btnStr;
    }


    // 表格配置
    window.loaderTable = function () {
        // 获取人员状态
        var personStateCheck =  xmSelectPersonState.getValue();
        var personStateIds = '';
        $.each(personStateCheck, function (index, item) {
            personStateIds += item.value + ',' ;
        });

        if (window.TextReplaceTool && typeof window.TextReplaceTool.changeYear === 'function') {
            window.TextReplaceTool.changeYear($('#year').val());
        }

        deptSelectDis();
        menuUnitId = tool.isEmpty(localStorage.getItem("menu-unit-id"))?unitId: localStorage.getItem("menu-unit-id")
        table.render({
            elem: '#searchPersonScoreList',
            id: 'searchPersonScoreList',
            url: huayi_projectscore_url + 'cmeSearchPeopleScore/searchPeoplePass',
            // toolbar: toolbar,
            defaultToolbar: [],
            toolbar: cretaeToolBar(),
            cellMinWidth: '80px',
            height: 'full-200',
            page: true,
            limit: 10,
            limits: [10, 50, 100, 150, 200],
            where: {
                passResult: $('#passResultSelect').val(),
                deptId: $('#deptSelect').val(),
                personName: $('#personName').val(),
                personNo: $('#personNo').val(),
                personStateId: personStateIds,
                titleId: $('#hidden_title_ids').val(),
                titleLevelId: $('#titleLevelSelect').val(),
                certId: $('#certId').val(),
                cmeStandardKindId: cmeStandardKindId,
                cmeYear: $('#year').val(),
                medicalType: $('#select_medical_type').val(),
                unitId: menuUnitId,
            },
            done: function (res, curr, count) {
                for (var i = 0; i < res.data.length; i++) {
                    var state = res.data[i].isPass; //根据status状态判断，不为0时，禁止勾选
                    var checkallinfo = $("#checkboxAll").is(":checked");
                    var checkboxCurrent = $("#checkboxCurrent").is(":checked");
                    var templateHtml = "";
                    //如果全选
                    if (checkallinfo || checkboxCurrent) {
                        var index = res.data[i]['LAY_TABLE_INDEX'];
                        $(".layui-table tr[data-index=" + index + "] input[type='checkbox']").prop('checked', true);
                        $(".layui-table tr[data-index=" + index + "] input[type='checkbox']").next().addClass('layui-form-checked');
                    }
                }
            },
            cols: tempArr,
            parseData: function (res) {
                if (res.status === 200) {
                    recordsTotal = res.data.recordsTotal;
                    pageSize = res.data.pageSize;
                    return {
                        "code": res.status === 200 ? 0 : res.status, //解析接口状态
                        "msg": res.message, //解析提示文本
                        "count": res.data.recordsTotal, //解析数据长度
                        "data": res.data.records, //解析数据列表
                        "page": res.data.pageNum, //当前页
                        "limit": res.data.pageSize, //每页条数
                    }
                } else {
                    layer.msg("请求失败");
                    console.log(res);
                }
            },
            request: {
                pageName: 'pageNum', //页码的参数名称，默认：page
                limitName: 'pageSize' //每页数据量的参数名，默认：limit
            }
        });

    };

    table.on('tool(searchPersonScoreList)', function (obj) {
        var datas = obj.data;
        if (obj.event === 'viewPersonScoreDetail') {
            var year = $("#year").val();
            var datas = obj.data;
            layer.open({
                type: 2,
                title: '详细情况明细',
                content: '../../score/proj_statistics/personScoreStatistics.html?checkMemo=hide&personId=' +
                    datas.comPersonId + '&cmeYear=' + year,
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
            var year = $("#year").val();
            var startDt = year + '-01-01';
            var endDt = year + '-12-31';
            var datas = obj.data;
            layer.open({
                type: 2,
                title: '各类学分汇总',
                content: '../../score/proj_statistics/personScoreDetails.html?personId=' +
                    datas.comPersonId + '&cmeYear=' + year,
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
    // 监听头部导出按钮
    table.on('toolbar(searchPersonScoreList)', function (obj) {
        var datas = obj.data;
        var personIds = [];
        menuUnitId = tool.isEmpty(localStorage.getItem("menu-unit-id"))?unitId: localStorage.getItem("menu-unit-id")

        console.log(personIds);
        var data;
        // 全部导出
        var checkallinfo = $("#checkboxAll").is(":checked");
        if (checkallinfo) {
            // 获取人员状态
            var personStateCheck =  xmSelectPersonState.getValue();
            var personStateIds = '';
            $.each(personStateCheck, function (index, item) {
                personStateIds += item.value + ',' ;
            });

            data = {
                deptId: $('#deptSelect').val(),
                personName: $('#personName').val(),
                personNo: $('#personNo').val(),
                personStateId: personStateIds,
                // personStateId: $('#personStateId').val(),
                titleId: $('#hidden_title_ids').val(),
                titleLevelId: $('#titleLevelSelect').val(),
                certId: $('#certId').val(),
                cmeStandardKindId: cmeStandardKindId,
                cmeYear: $('#year').val(),
                passResult: $('#passResultSelect').val(),
                unitId: menuUnitId,
            };
        } else {
            var haveScore = false;
            var child = $('input[name="layTableCheckbox"]');
            child.each(function (index, item) {
                if (item.checked === true) {
                    personIds.push(item.defaultValue);
                    var totalSc = item.getAttribute("totalSco");
                    if (totalSc > 0) {
                        haveScore = true;
                    }
                }
            });
            if (personIds.length == 0) {
                layer.msg("请至少勾选一个");
                return;
            }
            // 判断选中人员是否有学分
            if (!haveScore && obj.event === 'visbale') {
                layer.msg("所选人员无可导出学分")
                return;
            }
            // 导出选中项
            data = {
                comPersonIdList: personIds,
                cmeStandardKindId: localStorage.getItem("standardkind-id"),
                unitId: menuUnitId,
                cmeYear: $('#year').val(),
            };
        }
        if (obj.event === 'excel') {
            layer.msg('正在导出')
            //导出excel
            axios({
                method: 'post',
                url: huayi_projectscore_url + 'cmeSearchPeopleScore/peoplePassExcel',
                responseType: 'blob',
                headers: {
                    "Accept": 'application/json',
                    "Authorization": localStorage.getItem("token"),
                    "KJPT-USER-ID": localStorage.getItem("user-id"),
                    "cmestandard-id": localStorage.getItem("standardkind-id")
                },
                data: data,
            }).then(function (res) {
                var data = res.data;
                var blob = new Blob([data], { type: 'application/octet-stream' });
                var url = URL.createObjectURL(blob);
                var exportLink = document.createElement('a');
                exportLink.setAttribute("download", "人员达标情况.xlsx");
                exportLink.href = url;
                document.body.appendChild(exportLink);
                exportLink.click();
                layer.msg("导出成功")
            })
        } else if (obj.event === 'visbale') {
            debugger
            var nids = [];
            var child = $("input[name='layTableCheckbox']");
            child.each(function (index, item) {
                nids.push(item)
            });
            var checkedNum = nids.length;
            var allChecked = recordsTotal - pageSize + checkedNum;
            if (checkallinfo && allChecked >= 500){
                layer.msg("由于PDF文件的特殊限制，导出时请选择小于500人以下完成导出");
            } else {
                layer.msg("正在导出");
                let visit = huayi_projectscore_url + 'cmeSearchPeopleScore/peoplePassPdf';
                downloadFile(visit, data);
            }
        }
    });
    // 所有全选
    form.on('checkbox(checkboxAll)', function (data) {
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



    //加载人员状态
    function ddlList() {
        $.ajax({
            type: "post",
            url: huayi_projectscore_url + "comPersonCredit/getPersonStateList",
            data: {
                cmeStandardKindId: localStorage.getItem("standardkind-id")
            },
            dataType: 'json',
            success: function (data) {
                // 复选框
                xmSelectPersonState = xmSelect.render({
                    el: '#personStateId',
                    // autoRow: true,
                    name: 'personStates',
                    data: function () {
                        var personStates = new Array();
                        if (data.data.records != null && data.data.records.length > 0) {
                        for (var i = 0; i < data.data.records.length; i++) {
                            if(data.data.records[i].person_state_name == '注销'){
                                personStates.push({ "name": data.data.records[i].person_state_name, "value": data.data.records[i].person_state_id });
                            }else{
                                personStates.push({ "name": data.data.records[i].person_state_name, "value": data.data.records[i].person_state_id, selected: true });
                            }
                        }
                        }
                        return personStates;
                    },
                });
                // 单选框
                // $.each(data.data.records, function (index, item) {
                //     $('#personStateId').append(new Option(item.person_state_name, item.person_state_id)); //往下拉菜单里添加元素
                // })
                form.render('select'); //刷新select选择框渲染
            },
            error: function (data) {
                layer.msg("响应失败");
            }
        });
    }

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

    // 职称选择
    $("#text_title_names").click(function () {
        var titleIds = $("#hidden_title_ids").val();
        console.log(titleIds);
        layer.open({
            type: 2,
            content: "../../controls/selectTitle/selectTitles.html?titleIds=" + titleIds,
            area: ['700px', '480px'],
            scrollbar: false
        });
    });

    // 职称选择
    window.getChildTitles = (hidden_title_ids, titleNames) => {
        $("#text_title_names").val(titleNames);
        $("#hidden_title_ids").val(hidden_title_ids);
    }

    form.on('select(layui-select-year)', function(data){
        if(data.value < '2025'){
            scoreLevelCols = [];
            getScoreKind();
        }else{
            scoreKindCols = [];
            getScoreLevel();
        }
        
    });
    //页面加载入口
    let htmlInit = function () {
        deptSelectDis();

    }
    htmlInit();
    // Esc关闭弹窗
    window.onkeyup = function (ev) {
        var key = ev.keyCode || ev.which;
        if (key == 27) {
            layer.close(layer.index);
            console.log('layer.index = ' + layer.index)
        }
    }
});