/**
 * 
 * 
 * @param {Object} exports 
 * @returns 
 */

layui.define(['jquery', 'form', 'layer', 'laydate', 'table', 'excel'], function (exports) {
    let $ = layui.jquery;
    let form = layui.form;
    let layer = layui.layer;
    let table = layui.table;
    let laydate = layui.laydate;
    let excel = layui.excel;


    let attendanceRecordAwardPointsCommon = {
        createTopTableToolBar4: function() {
            return `<div>
                <a class="layui-btn layui-btn-xs layui-btn-normal btn-normal-row" lay-event="attendanceList">考勤明细</a>
                </div>
            `;
        },
        createTopTableToolBar: function() {
            return `<div>
                <a class="layui-btn layui-btn-xs layui-btn-normal btn-normal-row" lay-event="analyzedForStudent">考勤分析</a>
                </div>
            `;
        },
        createTopTableToolBar3: function() {
            return `<div>
                <a class="layui-btn layui-btn-xs layui-btn-normal btn-normal-row" lay-event="effectivAttendance">考勤有效人员</a>
                </div>
            `;
        },
        createTopTableToolBar5: function() {
            return `<div>
                <a class="layui-btn layui-btn-xs layui-btn-normal btn-normal-row" lay-event="effectivAttendance">考勤信息</a>
                </div>
            `;
        },
        createTopTableToolBar6: function() {
            return `<div>
                <input type="checkbox" id="pageCheckbox" lay-filter="pageCheckbox"  title="全选" style="margin-left:20px;"> 
                <a class="layui-btn layui-btn-xs layui-btn-normal btn-normal-row" lay-event="exportToScorePerson">导出EXECL</a>
                <label style="font-size:15px;float: right;padding-right: 40%;color: #1E9FFF;" id="peopleScoreTitle"></label>
                </div>
            `;
        },
        createTopTableToolBar7: function() {
            return `<div>
                <a class="layui-btn layui-btn-xs layui-btn-normal btn-normal-row"  lay-event="exportAttendance">导出EXECL</a>
                </div>
            `;
        },

        getTopTableConfig : function(down_id) {
            return {
                elem: '#batchList',
                url: huayi_projectscore_url + 'cmeProjPosDownload/cmeProjAttendBatchList/' + down_id,
                title: '课程列表',
                defaultToolbar: [],
                cols: [[
                    { align: 'center', toolbar: attendanceRecordAwardPointsCommon.createTopTableToolBar4(), title: '考勤明细' },
                    { align: 'center', field: 'group1', toolbar: attendanceRecordAwardPointsCommon.createTopTableToolBar(), title: '考勤分析' },
                    { align: 'center', field: 'group2', toolbar: attendanceRecordAwardPointsCommon.createTopTableToolBar3(), title: '考勤有效人员' },
                    { align: 'center', field: 'startDate', title: '开始时间' },
                    { align: 'center', field: 'endDate', title: '结束时间' },
                ]],
                cellMinWidth: 100,
                id: "batchListTable",
                page: false,
                limit: 10,
                limits: [10, 50, 100, 150, 200],
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
                done: function (res, curr, count) {
                    var data = res.data;
                    for (var i = 0; i < data.length; i++) {
                        if (i == 0) {
                            $('tr[data-index="' + 0 + '"] td[data-field="group1"]').attr('rowspan', data.length);
                            $('tr[data-index="' + 0 + '"] td[data-field="group2"]').attr('rowspan', data.length);
                        }
                        if (i > 0) {
                            $('tr[data-index="' + i + '"] td[data-field="group1"]').remove();
                            $('tr[data-index="' + i + '"] td[data-field="group2"]').remove();
                        }
                    }
                }
            }
        },
        syncAttendTimesRangeVisibility: function () {
            var show = $("#creditStrategy_id").val() == "6";
            if (show) {
                $("#attendTimesDiv,#attendTimesMaxDiv").show();
            } else {
                $("#attendTimesDiv,#attendTimesMaxDiv").hide();
            }
        },
        hideGuangdongExtraColumns: function () {
            return !(_isGuangdong && ($("#creditStrategy_id").val() == "9" || $("#creditStrategy_id").val() == "10"));
        },
        /**
         * 符合授分人员表「选择」列：禁用态展示原因图标，否则展示复选框。
         * @param {Object} d 行数据（需含 myDisableStatus、myDisableScoreTeacher、myDisableDurationLow、myDisableAttendanceCross）
         * @param {Object} [options]
         * @param {string} [options.idField] 复选框 data-pid 对应字段，默认 comPersonId（集团页传 personId）
         * @param {boolean} [options.wrapDataPidInQuotes] 是否为 data-pid 加引号（集团页为 true，与原先 HTML 一致）
         */
        templetQualifiedPersonSelectCell: function (d, options) {
            if (d.myDisableStatus) {
                if (d.myDisableScoreTeacher) {
                    return '<img src="/img/score/disableIcon.png" style="width:20px;" alt="已完成主讲人授分" title="已完成主讲人授分">';
                }
                if (d.myDisableDurationLow) {
                    return '<img src="/img/score/disableIcon.png" style="width:20px;" alt="参会时长不足80%" title="参会时长不足80%">';
                }
                if (d.myDisableAttendanceCross) {
                    return '<img src="/img/score/disableIcon.png" style="width:20px;" alt="考勤时间与其他项目重叠" title="考勤时间与其他项目重叠">';
                }
                if (d.myDisabledUnitLimit) {
                    console.log("d.unitLimitRemark: "+d.unitLimitRemark);
                    return '<img src="/img/score/disableIcon.png" style="width:20px;" alt="'+d.unitLimitRemark+'" title="'+d.unitLimitRemark+'">';
                }
                return '<img src="/img/score/disableIcon.png" style="width:20px;" alt="不可选" title="不可选">';
            }
            return `<input type="checkbox" name="layTableCheckbox" lay-skin="primary" data-pid=${d.comPersonId}><i class="layui-icon"></i>`;
        },
        exportByDown: function (downId, projectType, personIds, openChannelId) {
            $.ajax({
                type: 'POST',
                contentType: 'application/json',
                url: huayi_projectscore_url + 'attendance/ExportExeclForAttendanceByDownVO',
                data: JSON.stringify({ "downId": downId, "personIds": personIds, "projectType": projectType }),
                success: (data, textStatus, xhr) => {
                    if (data.status == 200) {

                        // 导出execl
                        var datas = data.data
                        var aa = ['name', 'personNo', 'unit', 'dept', 'title', 'posTime', 'isPassExam', 'isEvaluation']
                        var bb = { name: '人员姓名', personNo: '人员编号', unit: '单位', dept: '科室', title: '职称', posTime: '考勤时间', appAddress: '考勤地址', isPassExam: '考试结果', isEvaluation: '评价结果' }
                        if (openChannelId) {
                            aa = ['name', 'personNo', 'unit', 'dept', 'title', 'posTime', 'playDurations', 'isPassExam', 'isEvaluation']
                            bb = { name: '人员姓名', personNo: '人员编号', unit: '单位', dept: '科室', title: '职称', posTime: '考勤时间', appAddress: '考勤地址', playDurations: '观看时长', isPassExam: '考试结果', isEvaluation: '评价结果' }
                        }
                        datas = excel.filterExportData(datas, aa);
                        datas.unshift(bb);

                        excel.exportExcel(datas, '考勤详情.xlsx', 'xlsx');
                    } else {
                        layer.msg(data.msg)
                    }
                },
                error: (XMLHttpRequest, textStatus, errorThrown) => {
                    layer.msg("请求失败")
                }
            })
        },
        getDownChannel: function (downId, onOpenChannelResult) {
            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: huayi_projectscore_url + 'projPolyv/getDownIdChannel?downId=' + downId,
                // data 		: {"downId": datas.downId},
                success: (data, textStatus, xhr) => {
                    ;
                    if (data.status == 200) {
                        onOpenChannelResult(data.data);
                    } else {
                        layer.msg(data.msg)
                    }
                },
                error: (XMLHttpRequest, textStatus, errorThrown) => {
                    layer.msg("周期是否开启直播失败")
                }
            })
        },
        openReson: function (ctx) {
            var comPersonId = [];
            var checkStatus = ctx.table.checkStatus('comPersonIdListTable');
            if (ctx.checkedPersonIds.length <= 0) {
                layer.msg("请选择授分人员");
                return;
            }
            layer.prompt({
                formType: 2,
                title: '不授分原因',
            }, function (value, index, elem) {
                console.log(value);
                $.ajax({
                    type: 'post',
                    url: huayi_projectscore_url + 'cmeProjScore/notGiving',
                    data: JSON.stringify({
                        // 周期id
                        downId: ctx.downId,
                        // 授分人员
                        comPersonIds: ctx.checkedPersonIds,
                        unitId: localStorage.getItem("unit-id"),
                        cmeStandardKindId: ctx.cmeStandardKindId,
                        creditStrategy: $("#creditStrategy_id").val(),
                        creditStrategyDate: new Date().getTime(),
                        // 不授分原因
                        remark: value
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
                })
            });
        },
        /** @returns {string|null} 错误文案，null 表示通过 */
        validateZjAwardScore: function (raw, maxScore) {
            if (raw == null || String(raw).trim() === '') {
                return '请输入授予学分';
            }
            var v = parseFloat(raw);
            if (!isFinite(v)) {
                return '请输入有效数字';
            }
            if (v <= 0) {
                return '学分须大于 0';
            }
            if (v > maxScore) {
                return '学分不能超过本周期满分 ' + maxScore;
            }
            if (Math.abs(Math.round(v * 2) / 2 - v) > 1e-6) {
                return '学分须为 0.5 的倍数';
            }
            return null;
        },
        closeAllForgivingForTeachers: function () {
            layer.closeAll();
        }
    }

    exports('attendanceRecordAwardPointsCommon', attendanceRecordAwardPointsCommon);
})
