function createBaseHtml() {
    var html = `
    <div class="layui-fluid">
        <div class="layui-card" style="text-align: center">
            <div class="layui-card-body layui_body_box">
                <table class="layui-table" id="teachersList" lay-filter="teachersList_filter" style="margin: 0px 0px;"></table>
            </div>
            <div class="layui-card">
                <button type="button" class="layui-btn" id="btnGiving">授分</button>
                <button type="button" class="layui-btn" onclick="closeOpen()">取消</button>
            </div>
        </div>
    </div>`;
    $('body').html(html);
}
createBaseHtml();


var downId = getUrlParam("downId");
var teachId = getUrlParam("teachId");
var projNo = getUrlParam("projNo");
var projName = getUrlParam("projName");
var startDate = getUrlParam("startDate");
var endDate = getUrlParam("endDate");
let tabledata;
// 学分等级
var creditLevelSelecteds = '';
// 二级学科
var secondaryDisciplineSelecteds = '';
// 三级学科
var tertiarySubjectsSelecteds = '';
// 举办方式
var holdTypeSelecteds = '<option value="">请选择</option>';
layui.config({
    base: '/js/layui/ext/'
}).extend({
    opTable: 'opTable/opTable'
}).use(['table', 'form', 'laydate', 'laytpl', 'table', 'opTable'], function () {
    var table = layui.table;
    var form = layui.form;
    var $ = layui.jquery;
    var layer = layui.layer;
    var laydate = layui.laydate;

    let cmeStandardKindId = localStorage.getItem('standardkind-id');

    var dataList = [];

    // 课程申报时长：优先 teachPeriod，无则兜底 period
    function resolveTeachPeriod(row) {
        if (row == null) {
            return null;
        }
        return row.teachPeriod != null ? row.teachPeriod : row.period;
    }

    // 已授分时取学分记录中的授分学时
    function resolveGrantedPeriod(groupedItems) {
        var sourceList = Array.isArray(groupedItems) ? groupedItems : [];
        for (var i = 0; i < sourceList.length; i++) {
            var row = sourceList[i];
            if (row.hasScored && row.period != null) {
                var grantedNum = Number(row.period);
                if (!isNaN(grantedNum)) {
                    return grantedNum;
                }
            }
        }
        return null;
    }

    function buildTeacherTreeData(flatList) {
        var teacherMap = {};
        var teacherOrder = [];
        var sourceList = Array.isArray(flatList) ? flatList : [];
        sourceList.forEach(function (item, index) {
            var teacherIdKey = item.teacherId != null ? String(item.teacherId).trim() : '';
            var teachNoKey = item.teachNo != null ? String(item.teachNo).trim() : '';
            var groupKey = teacherIdKey || teachNoKey || ('__EMPTY__' + index);
            if (!teacherMap[groupKey]) {
                teacherMap[groupKey] = [];
                teacherOrder.push(groupKey);
            }
            teacherMap[groupKey].push(item);
        });
        var result = teacherOrder.map(function (groupKey) {
            var groupedItems = teacherMap[groupKey];
            var firstItem = groupedItems[0] || {};
            var parentRow = $.extend({}, firstItem);
            var totalTeachPeriod = 0;
            parentRow.teachVoList = groupedItems.map(function (row) {
                var childTeachPeriod = resolveTeachPeriod(row);
                var teachPeriodNum = Number(childTeachPeriod);
                if (!isNaN(teachPeriodNum)) {
                    totalTeachPeriod += teachPeriodNum;
                }
                return {
                    teachName: row.teachName,
                    creditLevelName: row.creditLevelName,
                    holdTypeName: row.holdTypeName,
                    period: childTeachPeriod,
                    teachPeriod: childTeachPeriod,
                    secondaryDisciplineName: row.secondaryDisciplineName,
                    tertiarySubjectsName: row.tertiarySubjectsName
                };
            });
            var grantedPeriod = resolveGrantedPeriod(groupedItems);
            if (grantedPeriod != null) {
                parentRow.period = grantedPeriod;
            } else {
                parentRow.period = totalTeachPeriod;
            }
            parentRow.teachPeriod = totalTeachPeriod;
            if (!parentRow.studyDate && typeof endDate === 'string' && endDate.length >= 10) {
                parentRow.studyDate = endDate.substr(0, 10);
            }
            return parentRow;
        });

        setDefault(result);
        globalTreeData = result;
        return result;
    }

    function fetchTeacherTreeData(callback) {
        $.ajax({
            type: 'get',
            url: huayi_projectscore_url + 'cmeCmeProjTeacher/selectTeacherListForGiving',
            data: {
                pageNum: 1,
                pageSize: 100,
                downId: downId
            },
            dataType: 'json',
            success: function (res) {
                if (res && res.status === 200) {
                    var listData = Array.isArray(res.data) ? res.data : [];
                    // setDefault(listData);
                    callback(buildTeacherTreeData(listData));
                    return;
                }
                layer.msg((res && res.msg) || '获取讲师列表失败');
                callback([]);
            },
            error: function () {
                layer.msg('获取讲师列表失败');
                callback([]);
            }
        });
    }


    function renderChildCourseTable(parentRowData) {
        return {
            elem: '#courseTable_' + parentRowData.LAY_INDEX,
            id: 'courseTable_' + parentRowData.LAY_INDEX,
            page: false,
            openVisible: false,
            cols: [[
                { field: 'teachName', align: 'center', title: '课程名称', minWidth: '150', edit: 'text' },
                { field: 'creditLevelName', title: '学分分类', align: 'center', minWidth: '150' },
                { field: 'secondaryDisciplineName', align: 'center', title: '二级学科' },
                { field: 'tertiarySubjectsName', align: 'center', title: '三级学科', },
                { field: 'holdTypeName', align: 'center', title: "活动形式"},
                { field: 'period', align: 'center', title: '时长（小时）'}
            ]],
            data: parentRowData.teachVoList || []
        };
    }


    window.loadTable = function () {
        fetchTeacherTreeData(function (treeData) {
            tabledata = treeData;
            layui.opTable.render({
                elem: '#teachersList',
                id: 'teachersListTable',
                layFilter: 'teachersList_filter',
                title: '课程讲师列表',
                page: false,
                limit: 100,
                height: 'full-90',
                defaultToolbar: [],
                openType: 1,
                isAloneColumn: false,
                openColumnIndex: 1,
                cols: [[
                    { align: 'center', type: 'checkbox', title: '选择', width: 50 },
                    {
                        field: 'courseListLabel', align: 'center', title: '展开全部', width: 115, onDraw: function (d) {
                            return '课程列表';
                        }
                    },
                    {
                        align: 'center', title: '是否主讲人授分', width: '150', templet: function (d) {
                            return (d.needScore) ? "<span>是</span>" : "<span style='color:red'>否</span>";
                        }
                    },
                    {
                        align: 'center', title: '是否已授分', hide: false,width: '120', templet: function (d) {
                            return (d.hasScored) ? "<span style='color:red'>是</span>" : "<span>否</span>";
                        }
                    },
                    { field: 'teacherName', align: 'center',width: '120', title: '主讲人姓名' },
                    { field: 'projName', align: 'center',minWidth: '160', title: '项目名称', minWidth: 160 },
                    { field: 'studyDate', align: 'center', title: '授分日期',minWidth:'120', event: 'setDate' },
                    {
                        field: 'score', align: 'center', title: '学分', width: 90, templet: function (d) {
                            return d.score == null ? '' : d.score;
                        }
                    },
                    { field: 'period', align: 'center', title: '时长（小时）',minWidth:'120', width: 120 }

                ]],
                openTable: function (parentRowData) {
                    return renderChildCourseTable(parentRowData);
                },
                onOpen: function (itemData, itemIndex, dom, childTable) {
                    table.on('tool(' + childTable.config.id + ')', function (obj) { });
                },
                data: treeData,
                done: function (res, curr, count) {

                    // 调用通用的禁用函数
                    disableCheckboxByCondition(res.data, function (data) {
                        return data.myDisableStatus === true;
                    });

                    var $view = $("[lay-id='teachersListTable']");
                    $view.off('click.stopExpandOnCheckbox')
                        .on('click.stopExpandOnCheckbox', 'input[name="layTableCheckbox"], input[name="layTableCheckbox"] + div', function (e) {
                            e.stopPropagation();
                        });
                }
            });
        })

    }


    // 日期选择框
    table.on('tool(teachersList_filter)', function (obj) {
        var data = obj.data;
        let studyDate = data.studyDate != null ? data.studyDate : endDate.substr(0, 10);
        if (obj.event === 'setDate') {
            var field = $(this).data('field');
            laydate.render({
                elem: this.firstChild,
                show: true,
                type: 'date',
                format: 'yyyy-MM-dd',
                value: studyDate,
                min: startDate != null ? startDate.substr(0, 10) : (new Date()).getFullYear() + '-01-01',
                max: endDate != null ? endDate.substr(0, 10) : (new Date()).getFullYear() + '-12-31 23:59:59',
                show: true,
                closeStop: this,
                done: function (value, date) {
                    data[field] = value;
                    obj.update(data);
                },
                change: function (value, date, endDate) {
                    data.field = value;
                }
            })
        }
    });


    

    // 封装的通用禁用函数
    function disableCheckboxByCondition(dataList, conditionFunc) {
        layui.each(dataList, function (index, data) {
            if (conditionFunc(data)) {
                var $checkbox = $('.layui-table tr[data-index="' + index + '"] input[name="layTableCheckbox"]');
                if ($checkbox.length) {
                    $checkbox.prop('disabled', true);
                    $checkbox.next().addClass('layui-btn-disabled');
                }

            }
        });
        form.render('checkbox');
    }

    // 监听表格的复选框事件
    table.on('checkbox(teachersList_filter)', function (obj) {
        // ============== 【全选操作】 ==============
        if (obj.type === 'all') {
            // 全选框当前状态：true=勾选，false=取消
            var isChecked = obj.checked;

            globalTreeData.forEach(function (item, index) {
                console.log(index);
                if (item.myDisableStatus == true) {
                    layui.table.setRowChecked('teachersListTable', { index: index, checked: false });
                } else {
                    item.LAY_CHECKED = isChecked;
                }
            });
            return;
        }

    });

    let createGivingEntity = function (data) {
        var givingEntity = {};
        givingEntity.projectType = 1;
        givingEntity.downId = downId;
        givingEntity.projTeachId = data.projTeachId;
        givingEntity.projScore = data.projScore;
        givingEntity.score = data.score;
        givingEntity.period = data.period;
        givingEntity.comPersonId = data.teacherId;
        givingEntity.scoreLevel = data.creditLevel;
        givingEntity.holdType = data.holdType;
        givingEntity.studyDate = data.studyDate;
        givingEntity.remark = data.remark;
        givingEntity.knowledgeId = data.tertiarySubjects;
        givingEntity.singleProjNo = data.projNo;
        givingEntity.singleProjName = data.projName + '-' + data.teachName;
        givingEntity.cmeStandardKindId = cmeStandardKindId;
        givingEntity.teachUnit = localStorage.getItem("unit-id");
        givingEntity.addUnit = localStorage.getItem("unit-id");
        givingEntity.endDate = endDate;
        if(!data.projectPublishId) {
            givingEntity.scoreType = data.scoreType;
        }
        return givingEntity;
    }

    // 授分按钮，获取列表数据并提交后台
    window.givingForTeachers = function () {

        var tableList = table.checkStatus("teachersListTable");
        var dataForgiving = [];
        if (tableList.data.length > 0) {
            for (var j = 0; j < tableList.data.length; j++) {
                if (tableList.data[j].score == null || tableList.data[j].period == null || tableList.data[j].studyDate == null || tableList.data[j].teachName == null || tableList.data[j].teachName == '') {
                    layer.msg("所选数据学分、学时、授分日期、课程名称不能为空");
                    return false;
                }

                let score = tableList.data[j].score;
                let period = tableList.data[j].period;
                let teachPeriod = tableList.data[j].teachPeriod;

                if (score < 0) {
                    layer.msg('主讲人授分分值不能小于0')
                    return false;
                }
                if (period < 0) {
                    layer.msg('主讲人授分时长不能小于0')
                    return false;
                }
                // if (period > teachPeriod) {
                //     layer.msg('主讲人授分时长不能大于课程时长')
                //     return false;
                // }

                let givingEntity = createGivingEntity(tableList.data[j]);
                dataForgiving.push(givingEntity);

            }
            $.ajax({
                type: 'post',
                url: huayi_projectscore_url + 'cmeSingleprojScore/insertList',
                data: JSON.stringify(dataForgiving),
                contentType: 'application/json;charset=UTF-8',
                dataType: 'json',
                success: function (res) {
                    if (res.status === 200) {
                        layer.msg(res.data, { time: 5000 });
                        window.loadTable();
                    } else {
                        layer.msg(res.msg);

                    }
                }
            });
        } else {
            layer.msg("所选数据为空");
        }
    }



    // 广东市/区县级学分级别：不足3小时0.5分，每满3小时1分
    var guangdongCityCountyScoreLevels = [
        '95b9ef88-7265-11f0-adb9-005056a64c01',
        '95b9efce-7265-11f0-adb9-005056a64c01',
        '3037222a-2e5d-11f1-a586-005056a64c01'
    ];

    function calcDefaultScore(period, creditLevel) {
        var periodNum = Number(period);
        if (isNaN(periodNum) || periodNum <= 0) {
            return null;
        }
        if (guangdongCityCountyScoreLevels.indexOf(creditLevel) >= 0) {
            return periodNum < 3 ? 0.5 : Math.floor(periodNum / 3);
        }
        return Math.floor(periodNum) * 2;
    }

    function setDefault(datas) {
        for (let i = 0; i < datas.length; i++) {
            if (datas[i].hasScored) {
                continue;
            }
            var defaultScore = calcDefaultScore(datas[i].period, datas[i].creditLevel);
            if (defaultScore != null) {
                datas[i].score = defaultScore;
            }
        }
    }

    $("#btnGiving").click(function () {
        noRepeat(givingForTeachers);
    });

    window.loadTable();


    // 关闭父页所有探窗
    window.closeOpen = function () {
        window.parent.closeAllForgivingForTeachers();
    }
})