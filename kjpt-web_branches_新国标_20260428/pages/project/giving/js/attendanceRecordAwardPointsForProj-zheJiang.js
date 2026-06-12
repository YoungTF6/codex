let createBaseHtml = function () {
    let html = `
    <div class="layui-fluid" >
    
    <button style="width: 15%; float: left;display: none" type="button" class="layui-btn">返回授分</button>

    <div class="layui-card" style="text-align: center">
        <!--        表格区域-->
        <div class="layui-card-body layui_body_box">
            <table class="layui-table" id="batchList" lay-filter="teachListFilter" style="margin: 0px 0px;">
            </table>
        </div>
        <div style="padding-bottom: 15px;">
            <button type="button" id="btnFilterScorePerson" class="layui-btn layui-btn-sm" onclick="creditAnalysisFunction()">筛选授分人员</button>
            <button type="button" class="layui-btn layui-btn-sm" onclick="closeMyMSG()">返回</button>
        </div>
    </div>
    <div id="creditAnalysisDiv" style="display: none" class="layui-card">
        <!--    搜索栏-->
        <div class="layui-form layui-card-header layuiadmin-card-header-auto" lay-filter="searchForQualifiedPersonnel" style="background: #f5f5f5;">
            <div class="layui_mess">
                <div class="layui_display">
                <div class="layui-inline">
                    <label class="layui-form-label"><span style="color: red">*</span>授分策略</label>
                    <div class="layui-input-block">
                        <select name="creditStrategy" id="creditStrategy_id" lay-filter="creditStrategy_id" lay-verify="required">
                            <option value="4">有考勤就授予全部学分</option>
                            <option value="0">任意课程考勤有效就授予全部学分</option>
                            <option value="1">所有课程考勤有效就授予全部学分</option>
                            <option value="2">按所参加课程的学时比例授予学分</option>
                            <option value="5">海南省国家级省级项目授分策略</option>
                            <option value="6">按考勤次数授分</option>
                            <option value="7">按考勤有效人员授分</option>
                        </select>
                    </div>
                </div>
                <div class="layui-inline">
                    <label class="layui-form-label">项目评价</label>
                    <div class="layui-input-block">
                        <select name="evaluationResults" id="evaluationResults_id" lay-verify="required">
                            <option value="">请选择</option>
                            <option value="0">完成</option>
                            <option value="1">未完成</option>
                        </select>
                    </div>
                </div>
                <div class="layui-inline">
                    <label class="layui-form-label">考试</label>
                    <div class="layui-input-block">
                        <select name="passResult" id="passResult_id" lay-verify="required">
                            <option value="">请选择</option>
                            <option value="1">通过</option>
                            <option value="0">不通过</option>
                        </select>
                    </div>
                </div>
                <div class="layui-inline">
                    <label class="layui-form-label">姓名</label>
                    <div class="layui-input-block">
                        <input type="text" name="personName" id="personName_id" autocomplete="off" class="layui-input">
                    </div>
                </div>
                <div class="layui-inline">
                    <label class="layui-form-label">所在单位</label>
                    <div class="layui-input-block" >
                        <input type="text" name="unitName" id="unitName_id" autocomplete="off" class="layui-input">
                    </div>
                </div>
                <div class="layui-inline">
                    <label class="layui-form-label">科室</label>
                    <div class="layui-input-block" >
                        <input type="text" name="deptName" id="deptName_id" autocomplete="off" class="layui-input">
                    </div>
                </div>
                <div class="layui-inline">
                    <label class="layui-form-label">职称</label>
                    <div class="layui-input-block" >
                        <input type="text" name="titleName" id="titleName_id" autocomplete="off" class="layui-input">
                    </div>
                </div>
                <div class="layui-inline">
                    <label class="layui-form-label">专业</label>
                    <div class="layui-input-block" >
                        <input type="text" name="personSpecName" id="personSpecName_id" autocomplete="off" class="layui-input">
                    </div>
                </div>
                <div class="layui-inline" style="display: none">
                    <label class="layui-form-label">考勤地址</label>
                    <div class="layui-input-block" >
                        <input type="text" name="attendanceAddress" id="attendanceAddress_id" autocomplete="off" class="layui-input">
                    </div>
                </div>
                <div class="layui-inline" id="attendTimesDiv">
                    <label class="layui-form-label"><span style="color: red">*</span>考勤次数 ≥</label>
                    <div class="layui-input-block" >
                        <input type="number" step="1" name="attendTimes" value="2" id="attendTimes_id" autocomplete="off" class="layui-input">
                    </div>
                </div>
                <div class="layui-inline" id="attendTimesMaxDiv" style="display: none;">
                    <label class="layui-form-label">考勤次数 ≤</label>
                    <div class="layui-input-block" >
                        <input type="number" step="1" name="attendTimesMax" id="attendTimesMax_id" autocomplete="off" class="layui-input" placeholder="选填">
                    </div>
                </div>
                <div class="layui-inline" id="notScoreStatusDiv" style="display: none;">
                    <label class="layui-form-label">未授分状态</label>
                    <div class="layui-input-block">
                        <select name="notScoreStatus" id="notScoreStatus_id" lay-verify="required">
                            <!-- <option value="0">请选择</option> -->
                            <option value="0">全部</option>
                            <option value="1">未授分</option>
                            <option value="2">不授分</option>
                        </select>
                    </div>
                </div>
                </div>
                    <div class="layui_display">
                        <div class="layui-inline">
                            <a class="layui-btn layui-btn-sm" id="searchBtn" onclick="searchToScorePersons()"
                            lay-filter="LAY-app-order-search"
                            data-type="reload">
                                <i class="layui-icon layui-icon-search layuiadmin-button-btn"></i>查询
                            </a>
                        </div>
                    </div>
                </div>
        </div>

        <div style="padding:15px 15px 0 15px;"  class="layui-row">
            <div class="layui-col-md8">
                <button type="button" class="layui-btn layui-btn-sm" onclick="openAwardDate()">授分</button>
                <button type="button" id="allChooseBtn" class="layui-btn layui-btn-sm" onclick="openAllChoose()">已选中(0)人</button>
                <button type="button" id="TableCheckOff" class="layui-btn layui-btn-sm" >取消全部选中人员</button>                
                <button type="button" id="noScoreButton" class="layui-btn layui-btn-sm hide" onclick="openReson()">不予授分</button>
            </div>
            <div class="layui-col-md4">
                <label style="color:red;display:none" class="guangdong-show" >“学员参会时长不足项目总时长80%”或“学员参加不同项目（活动）的举办时间存在时间重叠”时，不能授予学分</label>
                <button type="button" id="exportAll" class="layui-btn layui-btn-sm" style="float: right;" >导出本批次全部考勤</button>
                <label style="color:red; display: none;" class="guangxi-show" >授分后必须填写相应的执行情况反馈，以完成学习记录。无反馈将影响上级部门审核。感谢配合！</label>
            </div>
        </div>
        <!--        表格区域-->
        <div class="layui-card-body layui_body_box">
            <table class="layui-table" id="creditAnalysis" lay-filter="creditAnalysisFilter" style="margin: 0px 0px;">
            </table>
        </div>

    </div>
    
    <!-- 已选择待授分人员 -->
    <div style="display: none" id="creditAnalysisCheckedDiv" class="layui-card-body layui_body_box">
        <table class="layui-table" id="creditAnalysisChecked" lay-filter="creditAnalysisCheckedFilter"
             style="margin: 0px 0px;" >
        </table>
    </div>
    <form class="layui-form zjAwardScoreForm" style="display: none" id="fromForCreditStrategy">
        <div class="layui-form-item">
            <label class="layui-form-label">请选择授分日期</label>
            <div class="layui-input-block">
                <input type="text" name="title" id="creditStrategyDate_ids" required lay-verify="required" placeholder="请选择授分日期" autocomplete="off" class="layui-input" readonly="readonly" style="cursor:pointer;">
            </div>
        </div>
        <div class="layui-form-item">
            <label class="layui-form-label zjAwardScoreLabel">授予学分</label>
            <div class="layui-input-block">
                <input type="number" step="0.5" id="zjAwardScoreInput" autocomplete="off" class="layui-input zjAwardScoreInput" placeholder="请输入" />
                <div class="layui-word-aux" style="margin-top:6px;">本周期满分 <span id="zjCycleMaxScoreDisplay">--</span>；须大于 0、不超过满分、为 0.5 的倍数</div>
            </div>
        </div>
    </form>

</div>
    `
    $('body').html(html);
}

createBaseHtml();


// 全局配置及引入相关的模块

layui.config({
    base: '/js/layui/ext/'
}).extend({
    myTable: 'table',
    excel: 'excel',
    tool: 'tool',
    attendanceRecordAwardPointsCommon: '/services/project/giving/attendanceRecordAwardPointsCommon'
}).use(['myTable', 'form', 'laydate', 'excel', 'tool', 'attendanceRecordAwardPointsCommon'], function () {
    var table = layui.myTable;
    var form = layui.form;
    var $ = layui.jquery;
    var layer = layui.layer;
    var laydate = layui.laydate;
    var openChannelId = false;
    var excel = layui.excel;
    var tool = layui.tool;
    var checkedPersonIds = [], isReload = false, checkedTableInfo = new Map();
    var attendanceRecordAwardPointsCommon = layui.attendanceRecordAwardPointsCommon;
    window.closeAllForgivingForTeachers = attendanceRecordAwardPointsCommon.closeAllForgivingForTeachers;
    window.exportByDown = function (downId, projectType, personIds) {
        attendanceRecordAwardPointsCommon.exportByDown(downId, projectType, personIds, openChannelId);
    };
    window.getDownChannel = function () {
        attendanceRecordAwardPointsCommon.getDownChannel(down_id, function (v) {
            openChannelId = v;
        });
    };
    window.openReson = function () {
        attendanceRecordAwardPointsCommon.openReson({
            downId: down_id,
            checkedPersonIds: checkedPersonIds,
            cmeStandardKindId: cmeStandardKindId,
            table: table
        });
    };
    var teacherPersonList = [], singleScoreList = [];
    var allTeachData = null;
    /** 当前周期满分（来自 getListForProj 匹配 downId 的 score） */
    var zjCycleMaxScoreNum = score;
    var showNotScore = [ZHEJIANG].includes(cmeStandardKindId);
    if (showNotScore) {
        $("#noScoreButton,#notScoreStatusDiv").show();
    }

    /** 考勤次数下限：业务至少 2，且不低于配置 min_value_when_find_by_attend_times */
    function getAttendTimesEffectiveMin() {
        var configMin = parseInt(window["min_value_when_find_by_attend_times"], 10);
        if (isNaN(configMin) || configMin < 1) {
            configMin = 1;
        }
        return Math.max(2, configMin);
    }

    /**
     * 拉取项目周期列表，解析当前 downId 的周期满分 score
     * @param {function(boolean)} callback 参数为是否解析到有效正数满分
     */
    function loadZjCycleMaxScore(callback) {
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: huayi_projectscore_url + 'cmeProjPosDownload/getListForProj',
            data: { projId: pro_id },
            success: function (res) {
                if (res.status == 200 && res.data && res.data.length) {
                    for (var i = 0; i < res.data.length; i++) {
                        var row = res.data[i];
                        if (row && String(row.downId) === String(down_id)) {
                            break;
                        }
                    }
                }
                if (typeof callback === 'function') {
                    callback(zjCycleMaxScoreNum != null);
                }
            },
            error: function () {
                if (typeof callback === 'function') {
                    callback(false);
                }
            }
        });
    }

    function renderAttenInfoTable() {
        let tableConfig = attendanceRecordAwardPointsCommon.getTopTableConfig(down_id);
        table.render(tableConfig);
    }

    // 监听行内按钮
    table.on('tool(teachListFilter)', function (obj) {
        // 考勤分析
        if (obj.event === 'analyzedForStudent') {
            layer.open({
                closeBtn: false,
                title: false,
                type: 2,
                content: 'attendanceAnalysis.html?downId=' + down_id,
                area: ['100%', '100%'],
                cancel: function (index, layero) {
                    table.reload("batchListTable");
                }
            })
        }
        // 考勤有效人员
        else if (obj.event === 'effectivAttendance') {
            layer.open({
                type: 2,
                content: 'teachIdAttendanceResult.html?downId=' + down_id,
                area: ['100%', '100%'],
                title: '考勤有效人员',
                cancel: function (index, layero) {
                    table.reload("batchListTable");
                }
            })
        }
        // 考勤明细
        else if (obj.event === 'attendanceList') {
            layer.open({
                type: 2,
                content: 'attendanceDetails.html?batchId=' + obj.data.batchId + '&downId=' + down_id,
                area: ['100%', '100%'],
                title: '考勤人员列表',
                cancel: function (index, layero) {
                    table.reload("batchListTable");
                }
            })
        }

    })

    // 按钮{已完成全部课程考勤分析，进入下一步}
    window.creditAnalysisFunction = function () {
        $("#creditAnalysisDiv").show();
        searchToScorePersons();
    }
    // 返回刀考勤周期页面
    window.closeMyMSG = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭   
    }
    // 授分有效人员列表
    window.searchToScorePersons = function () {
        //按照考勤次数授分
        if ($("#creditStrategy_id").val() == "6") {
            if (checkAttendTimes() == false) {
                initTeachTable([]);
                return false;
            }
        }

        var qdata = {
                downId: down_id,
                creditStrategy: $('#creditStrategy_id').val(),
                evaluationResults: $('#evaluationResults_id').val(),
                passResult: $('#passResult_id').val(),
                personName: $('#personName_id').val(),
                unitId: localStorage.getItem("unit-id"),
                unitName: $('#unitName_id').val(),
                deptName: $('#deptName_id').val(),
                titleName: $('#titleName_id').val(),
                attendanceAddress: $('#attendanceAddress_id').val(),
                personSpecName: $('#personSpecName_id').val(),
                scoreLevelId: getUrlParam("scoreLevel"),
                notScoreStatus: $('#notScoreStatus_id').val(),
                attendTimes: $("#attendTimes_id").val(),
                cmeStandardKindId: cmeStandardKindId
            };
        if ($("#creditStrategy_id").val() == "6") {
            var maxTrim = $("#attendTimesMax_id").val().toString().trim();
            if (maxTrim !== "") {
                qdata.attendTimesMax = maxTrim;
            }
        }
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: huayi_projectscore_url + 'cmeProjAttendanceResult/getQualifiedPersonnel',
            data: qdata,
            success: (res) => {
                if (res.status == 200) {
                    allTeachData = res.data;
                    allTeachData.sort(
                        function compareFunction(param1, param2) {
                            let sortIndex = param1.personName.localeCompare(param2.personName, 'zh-Hans-CN', { sensitivity: 'accent' });
                            return sortIndex;
                        }
                    );
                    initTeachTable(res.data);
                } else {
                    layer.msg(res.msg)
                }
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
                layer.msg("请求失败")
            }
        })

    }

    let initTeachTable = function (data) {
        var scoredComPersonIdMap = {};
        layui.each(singleScoreList || [], function (_, s) {
            if (s && s.comPersonId != null && s.comPersonId !== '') {
                scoredComPersonIdMap[String(s.comPersonId)] = true;
            }
        });
        var tableData = [];
        layui.each(data || [], function (_, item) {
            var row = $.extend({}, item);
            if (row.meetingDuration == null) {
                row.meetingDuration = 0;
            }
            var rowPersonId = row.comPersonId != null ? row.comPersonId : row.personId;
            var disabledByScore = scoredComPersonIdMap[String(rowPersonId)] === true;
            var disabledByDuration = row.downDuringInHours * 0.8 > row.meetingDuration;
            var disabledByCross = !!(row.attendanceCross && row.hasScoredForCorssAtten);
            var disabledByAttend = disabledByDuration || disabledByCross;
            row.myDisableStatus = !!(disabledByScore || disabledByAttend);
            row.myDisableScoreTeacher = !!disabledByScore;
            row.myDisableDurationLow = !!disabledByDuration;
            row.myDisableAttendanceCross = !!disabledByCross;
            tableData.push(row);
        });
        table.render({
            elem: '#creditAnalysis',
            title: '符合授分人员',
            defaultToolbar: [],
            toolbar: attendanceRecordAwardPointsCommon.createTopTableToolBar6(),
            data: tableData,
            cols: [[
                // {align: 'center', type: 'checkbox', title: '选择'},
                {
                    align: 'center', title: '选择', fixed: 'left', templet: function (d) {
                        return attendanceRecordAwardPointsCommon.templetQualifiedPersonSelectCell(d);
                    }
                },
                { field: 'comPersonId', align: 'center', width: 250, title: '主键', hide: true },
                { field: 'personNo', align: 'center', width: 120, title: '人员编号' },
                { field: 'personName', align: 'center', width: 120, title: '姓名', sort: true },
                { field: 'unitName', align: 'center', title: '所在单位', sort: true },
                { field: 'deptName', align: 'center', title: '科室', sort: true },
                { field: 'titleName', align: 'center', title: '职称', sort: true },
                {
                    field: 'passResult', align: 'center', title: '考试结果', width: 100, templet: function (data) {
                        if (data.passResult == '1') {
                            return '通过';
                        } else {
                            return '未通过';
                        }
                    }
                },
                {
                    field: 'evaluationResults', align: 'center', title: '评价结果', width: 100, templet: function (data) {
                        if (data.evaluationResults == '0') {
                            return '完成';
                        } else {
                            return '未完成';
                        }
                    }
                },
                { field: 'playDurations', align: 'center', title: '观看时长', sort: true, hide: !((localStorage.getItem("standardkind-id") == "6427ddba-c02f-4229-bd73-49fc1c5d21f6") && openChannelId) },
                { field: 'remark', align: 'center', width: 200, title: '不授分原因', sort: true, hide: !showNotScore },
                { field: 'posTime', align: 'center', width: 200, title: '首次考勤时间', sort: true },
                { field: 'attendTimes', align: 'center', title: '考勤次数', sort: true, hide: $("#creditStrategy_id").val() != "6" },
                {
                    field: 'meetingDuration', align: 'center', title: '参会时长', hide: attendanceRecordAwardPointsCommon.hideGuangdongExtraColumns(), templet: (d) => {
                        if (d.meetingDuration == null) {
                            return 0;
                        }
                        if (d.downDuringInHours * 0.8 > d.meetingDuration) {
                            return `<span style='color:red;'> ${d.meetingDuration} </span>`;
                        } else {
                            return d.meetingDuration;
                        }
                    }
                },
                { align: 'center', title: '考勤信息', templet: attendanceRecordAwardPointsCommon.createTopTableToolBar5() },
                {
                    title: "考勤时间是否与其他项目重叠", align: 'center', hide: attendanceRecordAwardPointsCommon.hideGuangdongExtraColumns(), width: 220, templet: (d) => {
                        if (d.attendanceCross) {
                            return `<span style='color:red;'>是</span>`;
                        } else {
                            return "否";
                        }
                    }
                }
            ]],
            cellMinWidth: 100,
            id: "comPersonIdListTable",
            page: false,
            limit: 10000,
            autoSort: false,
            parseData: function (res) {

                res.data.forEach(e => {
                    if (e.meetingDuration == null) {
                        e.meetingDuration = 0;
                    }
                });

                console.log(res.data);
                return {
                    "code": res.status === 200 ? 0 : res.status, //解析接口状态
                    "msg": res.msg, //解析提示文本
                    "data": res.data, //解析数据列表
                }

            },
            done: function (res, curr, count) {
                $("#peopleScoreTitle").html(`待授分人数: (${res.data.length}人)`);
                if (checkedPersonIds != undefined) {
                    //遍历集合
                    layui.each(res.data, function (index, item) {
                        //将获取的选中行数据进行遍历
                        if (checkedPersonIds.indexOf('' + item.comPersonId + '') > -1) {
                            //点击去属性 lay-id='表格id'； index：要回显的行数下标，从0开始
                            $("div[lay-id='comPersonIdListTable'] td .layui-form-checkbox").eq(index).click();
                        }
                    });
                }
            }
        })
    }


    function checkAttendTimes() {
        var effectiveMin = getAttendTimesEffectiveMin();
        var intRe = /^[1-9]\d*$/;
        var minStr = $("#attendTimes_id").val().toString().trim();
        if (!intRe.test(minStr)) {
            layer.alert("请输入正确的考勤次数下限（正整数）", { icon: 2 });
            $("#attendTimes_id").focus();
            return false;
        }
        var minVal = parseInt(minStr, 10);
        if (minVal < effectiveMin) {
            layer.alert("考勤次数下限不能小于 " + effectiveMin + " 次", { icon: 2 });
            $("#attendTimes_id").focus();
            return false;
        }
        var maxStr = $("#attendTimesMax_id").val().toString().trim();
        if (maxStr !== "") {
            if (!intRe.test(maxStr)) {
                layer.alert("请输入正确的考勤次数上限（正整数或留空）", { icon: 2 });
                $("#attendTimesMax_id").focus();
                return false;
            }
            var maxVal = parseInt(maxStr, 10);
            if (maxVal < minVal) {
                layer.alert("考勤次数上限不能小于下限", { icon: 2 });
                $("#attendTimesMax_id").focus();
                return false;
            }
        }
        return true;
    }

    table.on('sort(creditAnalysisFilter)', function (obj) {
        if (allTeachData == null || allTeachData.length == 0) return;
        let type = obj.type;
        allTeachData.sort(
            function compareFunction(param1, param2) {
                let sortIndex = param1[obj.field].toString().localeCompare(param2[obj.field.toString()], 'zh-Hans-CN', { sensitivity: 'accent' });
                if (type == "asc") return 0 - sortIndex;
                return sortIndex;
            }
        );
        table.reload('comPersonIdListTable', {
            data: allTeachData,
            initSort: obj,
        });
    })


    //以复选框事件为例
    table.on('checkbox(creditAnalysisFilter)', function (obj) {

        let indx = checkedPersonIds.indexOf(obj.data.comPersonId);
        if (obj.checked) {
            if (indx < 0) {
                checkedPersonIds.push(obj.data.comPersonId);
            }
        } else {
            if (indx >= 0) {
                checkedPersonIds.splice(indx, 1);
                $("#pageCheckbox").prop("checked", false);
                form.render();
            }
        }
        $("#allChooseBtn").html(`已选中(${checkedPersonIds.length})人`);
    });

    //表格的全选复选框
    form.on('checkbox(pageCheckbox)', function (data) {
        let check = data.elem.checked;
        if (check) {
            $('.layui-table-fixed input[name="layTableCheckbox"]').prop("checked", true);
            var $checkeds = $('.layui-table-fixed input[name="layTableCheckbox"]:checked');
            $checkeds.each((i, e) => {
                let comPersonId = $(e).attr("data-pid");
                let indx = checkedPersonIds.indexOf(comPersonId);
                if (indx < 0) {
                    checkedPersonIds.push(comPersonId);
                }
            });
        } else {
            $('.layui-table-fixed input[name="layTableCheckbox"]').prop("checked", false);
            checkedPersonIds = [];
        }
        form.render();
        $("#allChooseBtn").html(`已选中(${checkedPersonIds.length})人`);
    });


    window.openAllChoose = function () {
        // $("#creditAnalysisCheckedDiv").show();
        layer.open({
            type: 1,
            title: '所有选中人员',
            content: $('#creditAnalysisCheckedDiv'),
            area: ['90%', '90%'],
            shadeClose: true
        });
        function getSelectData() {
            let datas = table.cache["comPersonIdListTable"];
            datas = datas.filter(e => checkedPersonIds.indexOf(e.comPersonId) > -1);
            console.log("datas:")
            console.log(datas);
            return datas;
        };
        let datas = getSelectData();
        table.render({
            elem: '#creditAnalysisChecked',
            data: datas,
            title: '符合授分人员',
            defaultToolbar: [],
            toolbar: attendanceRecordAwardPointsCommon.createTopTableToolBar7(),
            cols: [[
                // {align: 'center', type: 'checkbox', title: '选择'},
                { field: 'comPersonId', align: 'center', width: 250, title: '主键', hide: true },
                { field: 'personNo', align: 'center', width: 250, title: '卡号', hide: true },
                { field: 'personName', align: 'center', width: 250, title: '姓名', sort: true },
                { field: 'unitName', align: 'center', title: '所在单位', sort: true },
                { field: 'deptName', align: 'center', title: '科室', sort: true },
                { field: 'titleName', align: 'center', title: '职称', sort: true },
                { field: 'posTime', align: 'center', width: 180, title: '首次考勤时间', sort: true },
                {
                    field: 'meetingDuration', align: 'center', title: '参会时长', hide: true, templet: (d) => {
                        if (d.downDuringInHours * 0.8 > d.meetingDuration) {
                            return `<span style='color:red;'> ${d.meetingDuration} </span>`;
                        } else {
                            return d.meetingDuration;
                        }
                    }
                },
                { field: 'playDurations', align: 'center', title: '观看时长', hide: !((localStorage.getItem("standardkind-id") == "6427ddba-c02f-4229-bd73-49fc1c5d21f6") && openChannelId) },
                { field: 'attendTimes', align: 'center', title: '考勤次数', sort: true, hide: $("#creditStrategy_id").val() != "6" },
                { align: 'center', title: '考勤信息', templet: attendanceRecordAwardPointsCommon.createTopTableToolBar5() },
                {
                    title: "考勤时间是否与其他项目重叠", align: 'center', hide: true, width: 220, templet: (d) => {
                        if (d.attendanceCross) {
                            return `<span style='color:red;'>是</span>`;
                        } else {
                            return "否";
                        }
                    }
                }
            ]],
            cellMinWidth: 100,
            id: "checkedComPersonIdListTable",
            page: false,
            parseData: function (res) {
                return {
                    "code": res.status === 200 ? 0 : res.status, //解析接口状态
                    "msg": res.msg, //解析提示文本
                    "data": res.data, //解析数据列表
                }

            },
            request: {
                pageName: 'pageNum', //页码的参数名称，默认：page
                limitName: 'pageSize' //每页数据量的参数名，默认：limit
            },
        })
    }

    // 所有选中人员表格
    table.on('tool(creditAnalysisCheckedFilter)', function (obj) {
        var comPersonId = obj.data.comPersonId;
        if (obj.event === 'effectivAttendance') {
            layer.open({
                title: '考勤详细信息',
                content: 'attendanceInfo.html?comPersonId=' + comPersonId + '&downId=' + down_id + '&type=1',
                type: 2,
                area: ['550px', '300px'],
                shadeClose: true
            })
        }
    })
    // 所有选中人员表格导出
    table.on('toolbar(creditAnalysisCheckedFilter)', function (obj) {
        if (obj.event === 'exportAttendance') {
            // 获取表格的全部数据。
            var personIds = '';
            var datas = checkedPersonIds;
            if (datas.length <= 0) {
                layer.msg("当前数据为空");
                return;
            }
            for (i = 0; i < datas.length; i++) {
                personIds = personIds + datas[i] + ',';
            }
            exportByDown(down_id, 1, personIds);
        }
    })

    // 变更授分策略时清空已选中人员
    form.on('select(creditStrategy_id)', function (data) {
        attendanceRecordAwardPointsCommon.syncAttendTimesRangeVisibility();
        document.getElementById("TableCheckOff").click();
    });

    // 取消全选
    $("#TableCheckOff").click(function () {

        $("input:checkbox").each(function () {
            $(this).removeAttr('checked');
        });
        $(".layui-form-checkbox").each(function () {
            $(this).removeClass('layui-form-checked');
        });
        var chooseBtn = $("#allChooseBtn");
        chooseBtn[0].innerHTML = '已选中(0)人';
        // 清空数据
        checkedPersonIds = [];
        checkedTableInfo = new Map();

        searchToScorePersons();
    })

    // 导出本批次全部考勤
    $("#exportAll").click(function () {
        exportByDown(down_id, 1, '');
    })

    // （行内按钮）查看考勤详细信息
    table.on('tool(creditAnalysisFilter)', function (obj) {
        var comPersonId = obj.data.comPersonId;
        if (obj.event === 'effectivAttendance') {
            layer.open({
                title: '考勤详细信息',
                content: 'attendanceInfo.html?comPersonId=' + comPersonId + '&downId=' + down_id + '&type=1',
                type: 2,
                area: ['550px', '300px'],
            })
        }
    })
    // 监听表头按钮
    table.on('toolbar(creditAnalysisFilter)', function (obj) {
        if (obj.event === 'exportAttendance') {
            // 获取表格的全部数据。
            var personIds = '';
            var datas = table.cache["comPersonIdListTable"]
            if (datas.length <= 0) {
                layer.msg("当前数据为空");
                return;
            }
            for (i = 0; i < datas.length; i++) {
                personIds = personIds + datas[i].comPersonId + ',';
            }
            exportByDown(down_id, 1, personIds);
        }


        if (obj.event === 'exportToScorePerson') {
            let datas = obj.config.data;
            datas.forEach(e => {
                e.attendanceCross = e.attendanceCross ? "是" : "否";
            })

            var origCols = ['personNo', 'personName', 'unitName', 'deptName', 'titleName', 'passResult', 'evaluationResults', 'posTime', 'attendTimes', 'meetingDuration', 'attendanceCross']
            var transCols = {
                'personNo': '人员编号',
                'personName': '姓名',
                'unitName': '所在单位',
                'deptName': '科室',
                'titleName': '职称',
                'passResult': '考试结果',
                'evaluationResults': '评价结果',
                'posTime': '首次考勤时间',
                'attendTimes': '考勤次数',
                'meetingDuration': '参会时长',
                'attendanceCross': '考勤时间是否与其他项目重叠'
            };
            delete transCols.attendTimes;

            datas.forEach((e) => {
                e.passResult = (e.passResult == "1") ? "通过" : "未通过";
                e.evaluationResults = (e.evaluationResults == "0") ? "完成" : "未完成";
            });
            datas = excel.filterExportData(datas, origCols);
            datas.unshift(transCols);
            excel.exportExcel(datas, '待授分人员.xlsx', 'xlsx');
        }

    })


    laydate.render({
        elem: '#creditStrategyDate_ids', //指定元素
        min: startDate.substring(0, 10),
        max: endDate.substring(0, 10),
        value: endDate.substring(0, 10),
        btns: ['clear', 'confirm']
    });

    // 授分按钮（与 tool.confirmThen 共用 #fromForCreditStrategy：含「请选择授分日期」+ 授予学分）
    window.openAwardDate = function () {

        if (checkedPersonIds.length <= 0) {
            layer.msg("请选择授分人员");
            return;
        }
        function submitGivingFromAwardLayer() {
            var dt = $("#creditStrategyDate_ids").val();
            if (!dt) {
                layer.msg('请选择授分日期', { icon: 2 });
                return;
            }
            var raw = $("#zjAwardScoreInput").val();
            var err = attendanceRecordAwardPointsCommon.validateZjAwardScore(raw, zjCycleMaxScoreNum);
            if (err) {
                layer.msg(err, { icon: 2 });
                return;
            }
            var awardScore = parseFloat(raw);
            $(".layui-layer-btn0").prop("disabled", "disabled").addClass("layui-disabled").addClass("no-click");
            $.ajax({
                type: 'post',
                url: huayi_projectscore_url + 'cmeProjScore/giving',
                data: JSON.stringify({
                    downId: down_id,
                    creditStrategy: $("#creditStrategy_id").val(),
                    comPersonIds: checkedPersonIds,
                    creditStrategyDate: $("#creditStrategyDate_ids").val(),
                    studyDate: $("#creditStrategyDate_ids").val(),
                    unitId: localStorage.getItem("unit-id"),
                    cmeStandardKindId: cmeStandardKindId,
                    awardScore: awardScore
                }),
                contentType: "application/json",
                success: function (res) {
                    if (res.success == true) {
                        $("#TableCheckOff").click();
                        layer.closeAll();
                        layer.msg(res.data);
                    } else {
                        layer.msg(res.msg);
                        $(".layui-layer-btn0").removeAttr("disabled", "disabled").removeClass("layui-disabled").removeClass("no-click");
                    }
                },
                error: function (res) {
                    layer.msg("请求失败");
                    $(".layui-layer-btn0").removeAttr("disabled", "disabled").removeClass("layui-disabled").removeClass("no-click");
                }
            });
        }
        loadZjCycleMaxScore(function (ok) {
            if (!ok || zjCycleMaxScoreNum == null) {
                layer.msg('未获取到本周期学分上限，无法授分，请稍后重试或联系管理员', { icon: 2 });
                return;
            }
            $("#zjCycleMaxScoreDisplay").text(zjCycleMaxScoreNum);
            $("#zjAwardScoreInput").val("");
            var baseMsg = tool.buildAwardConfirmMessage(teacherPersonList, checkedPersonIds, checkedTableInfo);
            function openAwardFormLayer() {
                setTimeout(function () {
                    tool.confirmThen('', submitGivingFromAwardLayer);
                }, 50);
            }
            if (baseMsg) {
                layer.confirm(baseMsg + '<br/><br/>请在下一窗口<strong>选择授分日期</strong>并填写<strong>授予学分</strong>。', {
                    title: '授分确认',
                    btn: ['继续', '取消'],
                    area: ['520px', 'auto']
                }, function (cidx) {
                    layer.close(cidx);
                    openAwardFormLayer();
                });
            } else {
                openAwardFormLayer();
            }
        });
    }

    /* 获取配置 */
    window.getConfig = function (configNames, scoreLevel) {
        $.ajax({
            async: false,
            type: 'post',
            url: huayi_sjwh_url + 'cmeCommonConfig/getConfigByUnitFromRedis',
            data: {
                unitId: localStorage.getItem("unit-id"),
                configNames: configNames,
                scoreLevelId: scoreLevel
            },
            traditional: true,    //确保数组被正确序列化为 a=1&a=2...
            success: function (res) {
                if (res.success == true) {
                    configNames.forEach(configName => {
                        window[configName] = res.data[configName];
                    });
                } else {
                    layer.msg('获取配置失败');
                }
            },
            error: function () {
                layer.msg('获取配置失败');
            }
        });
    }

    layer.ready(function () {

        getDownChannel();
        let configNames = [
            'range_give_score_policy',
            'value_batch_count_when_proj_attend',
            'fun_exam_must_pass_when_award_score',
            'fun_proj_exam',
            'fun_proj_exam_force',
            'fun_proj_evaluate',
            'fun_proj_evaluate_force'
        ];
        getConfig(configNames, getUrlParam("scoreLevel"));


        let awardPolicyInProj;
        if (HENAN == cmeStandardKindId) {
            awardPolicyInProj = getAwardPolicyInProj();
        }
        let policyHtml = awardPolicyInProj ? awardPolicyInProj : window["range_give_score_policy"];
        $("#creditStrategy_id").html(policyHtml);


        let effectiveMin = getAttendTimesEffectiveMin();
        console.log(effectiveMin);
        let timeout;
        $("#attendTimes_id").val(effectiveMin).off("input.zjAttMin").on("input.zjAttMin", function () {
            const $this = $(this);
            clearTimeout(timeout);
            var v = $this.val();
            if (v !== '' && v !== null && parseInt(v, 10) < effectiveMin) {
                timeout = setTimeout(() => {
                    $this.val("");
                    layer.msg("考勤次数下限不能小于 " + effectiveMin + " 次", { icon: 2 });
                }, 400);
            }
        });

        attendanceRecordAwardPointsCommon.syncAttendTimesRangeVisibility();

        loadZjCycleMaxScore(function () { /* 预拉周期满分，失败不阻断进入页面 */ });
        if (window["fun_exam_must_pass_when_award_score"] == "1"
            || (window["fun_proj_exam"] == "1" && window["fun_proj_exam_force"] == "1")) {
            $("#passResult_id").find("option[value=1]").prop("selected", "selected");
            $("#passResult_id").prop("disabled", "disabled");
        }

        if (window["fun_proj_evaluate"] == "1" && window["fun_proj_evaluate_force"] == "1") {
            $("#evaluationResults_id").find("option[value=0]").prop("selected", "selected");
            $("#evaluationResults_id").prop("disabled", "disabled");
        }

        form.render("select");
        teacherPersonList = tool.getTeacherListByDownId(down_id, 1);
        singleScoreList = tool.getSingleScoreListByDownId(down_id);
        renderAttenInfoTable();
    });

    function getAwardPolicyInProj() {
        let html;
        let asstrCommon = AwardScoreStrategy.common;
        let asstrTao = AwardScoreStrategy.tao;

        let url = huayi_projectscore_url + 'cmeCmeProj/getOne';
        let data = { projId: pro_id };
        $.ajax({
            async: false,
            url: url,
            type: 'post',
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json',
            success: (res) => {
                if (res.success) {
                    let extendData = res.data.extendData;
                    extendDataJsonObj = JSON.parse(extendData);
                    if (extendDataJsonObj != null) {
                        let values = extendDataJsonObj["range_give_score_policy"];
                        if (values != null) {
                            values.split(',').forEach(x => {
                                // <option value="4">有考勤就授予全部学分</option>
                                for (let i = 0; i < asstrCommon.length; i++) {
                                    if (asstrCommon[i].value == x) {
                                        html += `<option value="${asstrCommon[i].value}">${asstrCommon[i].title}</option>`
                                    }
                                }
                                for (let i = 0; i < asstrTao.length; i++) {
                                    if (asstrTao[i].value == x) {
                                        html += `<option value="${asstrTao[i].value}">${asstrTao[i].title}</option>`
                                    }
                                }
                            });
                        }
                    }
                }
            },
        });
        return html;

    }

})
