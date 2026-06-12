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
    myTable: 'table'
}).use(['table', 'form', 'laydate', 'laytpl', 'myTable', 'laytpl'], function () {
    var table = layui.myTable;
    var form = layui.form;
    var $ = layui.jquery;
    var layer = layui.layer;
    var laydate = layui.laydate;
    const HUBEI = "73ba18db-33fd-4746-ab41-9beb009f69a1";
    const GUANGDONG = "289bf0ca-52cb-4b19-b737-9bd200a69ce1";
    const GUANGXI = "4a6d91fb-8ba4-4560-a801-9c6f00e6d999";
    const ZHEJIANG = "190c480d-d43c-450b-8472-a6fd00a6729d";

    const cmeStandardKindId = localStorage.getItem('standardkind-id');

    //接口数据有字段：myDisableStatus---该字段为true表示不能勾选，原因该人不是该机构的人
    window.loadTable = function () {
        table.render({
            url: huayi_projectscore_url + 'giving/getTeacherList',
            elem: '#teachersList',
            title: '课程讲师列表',
            defaultToolbar: [],
            where: {
                projectType: projectType,
                downId: downId
            },
            cols: [[
                { align: 'center', type: 'checkbox', title: '选择', fixed: "left" }, {
                    field: 'needScore', align: 'center', title: '是否主讲人授分', width: '150', hide: false, templet: function (d) {
                        return (d.needScore) ? "<span>是</span>" : "<span style='color:red'>否</span>";
                    }
                },
                {
                    field: 'hasScored', align: 'center', title: '是否已授分', hide: false, templet: function (d) {
                        return (d.hasScored) ? "<span style='color:red'>是</span>" : "<span>否</span>";
                    }
                },
                {
                    align: 'center', title: '是否本省', hide: false, templet: function (d) {
                        return (d.teacherId) ? "<span>是</span>" : "<span style='color:red'>否</span>";
                    }
                },
                { field: 'teacherId', align: 'center', title: '主讲人id', hide: true },
                { field: 'teacherName', align: 'center', title: '主讲人姓名' },
                { field: 'projName', align: 'center', title: '项目名称', width: 210 },
                { field: 'teachName', align: 'center', title: '课程名称', edit: 'text', width: 210 },
                { field: 'creditLevel', align: 'center', title: '学分级别id', hide: true },
                { field: 'creditLevelName', title: projectLabels.lblScoreLevel, align: 'center', width: 200 },
                // { field: 'secondaryDiscipline', align: 'center', title: '二级学科id', hide: true },
                // { field: 'secondaryDisciplineName', align: 'center', title: '二级学科', },
                // { field: 'tertiarySubjects', align: 'center', title: '三级学科id', hide: true },
                // { field: 'tertiarySubjectsName', align: 'center', title: '三级学科', },
                { field: 'holdType', align: 'center', title: '举办方式id', hide: true },
                { field: 'holdTypeName', align: 'center', title: projectLabels.lblActivityForm, hide: false },
                { field: 'studyDate', align: 'center', title: '授分日期', event: 'setDate', edit: 'text' },
                {
                    field: 'score', align: 'center', title: '学分', edit: 'text', templet(d) {
                        return d.score ? d.score : "";
                    }
                },
                { field: 'period', align: 'center', title: '学时', edit: 'text' }
            ]],
            cellMinWidth: 110,
            id: "teachersListTable",
            page: false,
            limit: 100,
            height: getHeight("teachersList"),
            done: function (res, curr, count) {
                tabledata = res.data;
                let scoreLevelId = tabledata.length > 0 ? tabledata[0].creditLevel : "";
                //授分按钮复位
                $("#btnGiving").removeClass("layui-disabled").removeAttr("disabled", "disabled");

                //湖北的学分默认不可编辑
                if (cmeStandardKindId == HUBEI || cmeStandardKindId == ZHEJIANG) {
                    $("[lay-id='teachersListTable']").find("td[data-field='score']").removeAttr("data-edit");
                }
                // adaa9cac-0792-4461-9d78-9c6f00e943d1	科室组织的活动
                // a3f4af93-e123-4e4e-8e10-9c6f00e94109	单位组织的活动
                if (cmeStandardKindId == GUANGXI &&
                    (scoreLevelId.toLowerCase() == "adaa9cac-0792-4461-9d78-9c6f00e943d1" || scoreLevelId.toLowerCase() == "a3f4af93-e123-4e4e-8e10-9c6f00e94109")) {
                    $("[lay-id='teachersListTable']").find("td[data-field='score']").removeAttr("data-edit");
                }
            },
            parseData: function (res) {
                //部分身份给予默认的学分
                setDefault(res.data);
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
        });
    }

    window.getHeight = function (id) {
        var windowHeight = $(window).height();
        var divTop = $('#' + id).offset().top;
        var divHeight = windowHeight - divTop;
        return divHeight - 82;
    }

    window.loadTable();

    // 日期选择框
    table.on('tool(teachersList_filter)', function (obj) {
        var data = obj.data;
        let startDate = data.startDate;
        let endDate = data.endDate;
        if (obj.event === 'setDate') {
            var field = $(this).data('field');
            laydate.render({
                elem: this.firstChild,
                show: true,
                type: 'date',
                format: 'yyyy-MM-dd',
                value: startDate != null ? startDate.substr(0, 10) : '',
                min: startDate != null ? startDate.substr(0, 10) : (new Date()).getFullYear() + '-01-01',
                max: endDate != null ? endDate : (new Date()).getFullYear() + '-12-31 23:59:59',
                show: true,
                closeStop: this,
                done: function (value, date) {
                    data[field] = value;
                    obj.update(data)
                    //$("#"+this.firstChild).val(value)
                },
                change: function (value, date, endDate) {
                    data.field = value;
                }
            })
        }
    });


    //设置学分默认值
    function setDefault(datas) {

        let defaultScore;
        for (let i = 0; i < datas.length; i++) {
            if (i == 0) {
                let configName = 'value_default_in_teacher_score_group';
                getConfig(configName, localStorage.getItem("unit-id"), datas[0].creditLevel);
                defaultScore = window[configName];
            }
            defaultScore && (datas[i].score = defaultScore);
            if (!datas[i].hasScored) {
                datas[i].teachPeriod && (datas[i].period = datas[i].teachPeriod);
                datas[i].endDate && (datas[i].studyDate = datas[i].endDate.substr(0, 10));
            }

        }
    }


    // 授分按钮，获取列表数据并提交后台
    window.givingForTeachers = function () {
        var tableList = table.checkStatus("teachersListTable");
        var dataForgiving = [];
        if (tableList.data.length > 0) {
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
                if (cmeStandardKindId == HUBEI && Math.floor(score) != score) {
                    layer.msg('主讲人授分分值只能填写整数')
                    $("#btnGiving").removeClass("layui-disabled").removeAttr("disabled");
                    return false;
                }
                if (tableList.data[j].period < 0) {
                    layer.msg('主讲人授分学时不能小于0')
                    $("#btnGiving").removeClass("layui-disabled").removeAttr("disabled");
                    return false;
                }
                var givingEntity = {};
                //如果是科室角色(13)，那么projectType就是科室院内活动(5)
                let projectType = localStorage.getItem("user-type") == 13 ? 5 : 2;
                givingEntity.projectType = projectType;
                givingEntity.downId = downId;
                givingEntity.projTeachId = tableList.data[j].projTeachId;
                givingEntity.score = tableList.data[j].score;
                givingEntity.period = tableList.data[j].period;
                givingEntity.comPersonId = tableList.data[j].teacherId;
                givingEntity.scoreLevel = tableList.data[j].creditLevel;
                givingEntity.holdType = tableList.data[j].holdType;
                givingEntity.studyDate = tableList.data[j].studyDate;
                givingEntity.remark = tableList.data[j].remark;
                givingEntity.knowledgeId = tableList.data[j].tertiarySubjects;
                givingEntity.singleProjName = tableList.data[j].projName + '-' + tableList.data[j].teachName;
                givingEntity.singleProjNo = tableList.data[j].projNo;
                if (cmeStandardKindId == ZHEJIANG || cmeStandardKindId == GUANGDONG) {
                    givingEntity.cmeStandardKindId = cmeStandardKindId;
                }
                givingEntity.teachUnit = localStorage.getItem("unit-id");
                givingEntity.addUnit = localStorage.getItem("unit-id");
                dataForgiving.push(givingEntity)
            }
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
        } else {
            layer.msg("所选数据为空");
        }
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