//页面基础html结构
function createBaseHtml() {
    var html = `
    <div class="layui-fluid">
        <div class="layui-card" style="text-align: center">
            <!--        表格区域-->
            <div class="layui-card-body layui_body_box">
                <table class="layui-table" id="teachersList" lay-filter="teachersList_filter" style="margin: 0px 0px;">
                </table>
            </div>
            <div style="padding-bottom: 15px">
                <button type="button" class="layui-btn" onclick="givingForTeachers()" id="btnGiving">授分</button>
                <button type="button" class="layui-btn" onclick="closeOpen()">取消</button>
            </div>
        </div>
    </div>`;
    $('body').html(html);
}
createBaseHtml();

var downId = getUrlParam("downId");
var projectType = getUrlParam("projectType");
var startDate = getUrlParam("startDate");
var endDate = getUrlParam("endDate");
let tabledata;
layui.config({
    base: '/js/layui/ext/'
}).extend({
    opTable: 'opTable/opTable'
}).use(['table', 'form', 'laydate', 'laytpl', 'opTable'], function () {
    var table = layui.table;
    var form = layui.form;
    var $ = layui.jquery;
    var layer = layui.layer;
    var laydate = layui.laydate;
    var globalTreeData = [];

    const cmeStandardKindId = localStorage.getItem('standardkind-id');


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
                    teachPeriod: childTeachPeriod
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
            url: huayi_projectscore_url + 'giving/getTeacherList',
            data: {
                pageNum: 1,
                pageSize: 100,
                projectType: projectType,
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
                { field: 'teachName', align: 'center', title: '课程名称' },
                { field: 'creditLevelName', align: 'center', title: '学分分类' },
                { field: 'holdTypeName', align: 'center', title: '举办方式' },
                { field: 'teachPeriod', align: 'center', title: '时长（小时）' }
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
                height: getHeight("teachersList"),
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
                        field: 'needScore', align: 'center', title: '是否主讲人授分', width: 130, templet: function (d) {
                            return (d.needScore) ? "<span style='color:red'>是</span>" : "<span>否</span>";
                        }
                    },
                    {
                        field: 'hasScored', align: 'center', title: '是否已授分', width: 100, templet: function (d) {
                            return d.hasScored ? "<span style='color:red'>是</span>" : "<span>否</span>";
                        }
                    },
                    { field: 'teacherName', align: 'center', title: '主讲人姓名', width: 110 },
                    { field: 'projName', align: 'center', title: '项目名称', minWidth: 160 },
                    { field: 'studyDate', align: 'center', title: '授分日期', event: 'setDate' },
                    {
                        field: 'score', align: 'center', title: '学分', width: 90, templet: function (d) {
                            return d.score == null ? '' : d.score;
                        }
                    },
                    { field: 'period', align: 'center', title: '时长（小时）', width: 120 }

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
        });
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




    window.getHeight = function (id) {
        var windowHeight = $(window).height();
        var divTop = $('#' + id).offset().top;
        var divHeight = windowHeight - divTop;
        return divHeight - 82;
    }

    window.loadTable();


    //设置学分默认值
    function setDefault(datas) {

        let defaultScore;
        for (let i = 0; i < datas.length; i++) {
            if(datas[i].period <3) {
                defaultScore = 0.5;
            } else {
                defaultScore = Math.floor(datas[i].period / 3);
            }
            datas[i].score = defaultScore;
        }
    }


    let createGivingEntity = function (data) {
        var givingEntity = {};
        //如果是科室角色(13)，那么projectType就是科室院内活动(5)
        //如果是科室角色(12)，那么projectType就是科室院内活动(2)
        let projectType = localStorage.getItem("user-type") == 13 ? 5 : 2;
        givingEntity.projectType = projectType;
        givingEntity.downId = downId;
        givingEntity.projTeachId = data.projTeachId;
        givingEntity.score = data.score;
        givingEntity.period = data.period;
        givingEntity.comPersonId = data.teacherId;
        givingEntity.scoreLevel = data.creditLevel;
        givingEntity.holdType = data.holdType;
        givingEntity.studyDate = data.studyDate;
        givingEntity.remark = data.remark;
        givingEntity.knowledgeId = data.tertiarySubjects;
        givingEntity.singleProjName = data.projName + '-' + data.teachName;
        givingEntity.singleProjNo = data.projNo;
        givingEntity.cmeStandardKindId = cmeStandardKindId;
        givingEntity.teachUnit = localStorage.getItem("unit-id");
        givingEntity.addUnit = localStorage.getItem("unit-id");
        return givingEntity;
    }

    // 授分按钮，获取列表数据并提交后台
    window.givingForTeachers = function () {
        var tableList = table.checkStatus("teachersListTable");
        if (tableList.data.length <= 0) {
            layer.msg("所选数据为空");
            return;
        }
        var dataForgiving = [];
        for (var j = 0; j < tableList.data.length; j++) {
            $("#btnGiving").addClass("layui-disabled").prop("disabled", "disabled");
            if (tableList.data[j].score == null || tableList.data[j].period == null || tableList.data[j].studyDate == null || tableList.data[j].teachName == null || tableList.data[j].teachName == '') {
                layer.msg("所选数据学分、学时、授分日期、课程名称不能为空")
                $("#btnGiving").removeClass("layui-disabled").removeAttr("disabled");
                return;
            }

            let score = tableList.data[j].score;
            if (score <= 0) {
                layer.msg('主讲人授分分值应该大于0')
                $("#btnGiving").removeClass("layui-disabled").removeAttr("disabled");
                return false;
            }
            if (tableList.data[j].period < 0) {
                layer.msg('主讲人授分学时不能小于0')
                $("#btnGiving").removeClass("layui-disabled").removeAttr("disabled");
                return false;
            }
            //如果是科室角色(13)，那么projectType就是科室院内活动(5)
            //如果是科室角色(12)，那么projectType就是科室院内活动(2)
            let givingEntity = createGivingEntity(tableList.data[j]);
            dataForgiving.push(givingEntity)
        }
        debugger
        $.ajax({
            type: 'post',
            url: huayi_projectscore_url + 'cmeSingleprojScore/insertList',
            data: JSON.stringify(dataForgiving),
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            success: function (res) {
                if (res.status === 200) {
                    layer.msg(res.data, { time: 2000 });
                    window.loadTable();
                }
                else {
                    layer.msg(res.msg);
                    $("#btnGiving").removeClass("layui-disabled").removeAttr("disabled");
                }

            }
        });
    }



    //获取第几行
    function getLine(element) {
        if (!element.hasAttribute("data-index")) {
            return getLine(element.parentElement);
        } else {
            return element.getAttribute("data-index")
        }
    }
    // 关闭父页所有探窗
    window.closeOpen = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭 
    }
})