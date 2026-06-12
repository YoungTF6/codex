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
    base: '../../../js/layui/ext/'
}).extend({
    myTable: 'table'
}).use(['table', 'form', 'laydate', 'laytpl', 'myTable'], function () {
    var table = layui.myTable;
    var form = layui.form;
    var $ = layui.jquery;
    var layer = layui.layer;
    var laydate = layui.laydate;

    let cmeStandardKindId = localStorage.getItem('standardkind-id');
    const IS_HUBEI = cmeStandardKindId == StandardKind.HU_BEI;
    const IS_ZHEJIANG = cmeStandardKindId == StandardKind.ZHE_JIANG;
    const IS_GUANGDONG = cmeStandardKindId == StandardKind.GUANG_DONG;
    const IS_GUANGXI = cmeStandardKindId == StandardKind.GUANG_XI;
    const IS_HAINAN = cmeStandardKindId == StandardKind.HAI_HAN;
    const IS_FUJIAN = cmeStandardKindId == StandardKind.FU_JIAN;

    var dataList = [];
    // 后台请求表单下拉框内容并处理select
    function getData() {
        $.ajax({
            async: false,
            type: 'get',
            url: huayi_projectscore_url + 'cmeCmeProjTeacher/selectTeacherListForGiving',
            data: {
                projTeachId: teachId,
                downId: downId
            },
            success: function (res) {
                if (res.success) {
                    dataList = res.data;
                }
            }
        })
    }



    window.loadTable = function () {
        getData();
        setDefault(dataList);

        table.render({
            data: dataList,
            elem: '#teachersList',
            title: '课程讲师列表',
            defaultToolbar: [],
            cols: [[
                { align: 'center', toolbar: '#rowBar', type: 'checkbox', title: '选择', fixed: "left" },
                {
                    align: 'center', title: '是否主讲人授分', width: '150', hide: false, templet: function (d) {
                        return (d.needScore) ? "<span>是</span>" : "<span style='color:red'>否</span>";
                    }
                },
                {
                    align: 'center', title: '是否已授分', hide: false, templet: function (d) {
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
                { field: 'projName', align: 'center', title: '项目名称', width: '250' },
                { field: 'teachName', align: 'center', title: '课程名称', width: '250', edit: 'text' },
                { field: 'creditLevel', align: 'center', title: '学分级别id', hide: true, },
                { field: 'creditLevelName', title: projectLabels.lblScoreLevel, align: 'center', hide: false, width: '200' },
                { field: 'secondaryDiscipline', align: 'center', title: '二级学科id', hide: true, },
                { field: 'secondaryDisciplineName', align: 'center', title: '二级学科', hide: false, },
                { field: 'tertiarySubjects', align: 'center', title: '三级学科id', hide: true, },
                { field: 'tertiarySubjectsName', align: 'center', title: '三级学科', hide: false, },
                { field: 'holdType', align: 'center', title: '举办方式id', hide: true, },
                { field: 'holdTypeName', align: 'center', title: projectLabels.lblActivityForm, hide: false, },
                { field: 'studyDate', align: 'center', title: '授分日期', event: 'setDate', edit: 'text', },
                { field: 'score', align: 'center', title: '学分', edit: 'text', },
                { field: 'period', align: 'center', title: (IS_GUANGXI ? '时长' : '学时'), edit: 'text' },
                { field: 'remark', align: 'center', title: '备注', width: '200', edit: 'text', hide: true },
                { field: 'projTeachId', title: '课程id', hide: true }

            ]],
            cellMinWidth: 110,
            id: "teachersListTable",
            page: false,
            limit: 100,
            height: 'full-90',
        });
    }

    window.loadTable();

    // 日期选择框
    table.on('tool(teachersList_filter)', function (obj) {
        var data = obj.data;
        let startDate = obj.data.startDate;
        let endDate = obj.data.endDate;
        if (obj.event === 'setDate') {
            var field = $(this).data('field');
            laydate.render({
                elem: this.firstChild,
                show: true,
                type: 'date',
                format: 'yyyy-MM-dd',
                value: endDate.substr(0, 10),
                min: startDate.substr(0, 10),
                max: endDate.substr(0, 10),
                btns: ['clear', 'confirm'],
                done: function (value, date) {
                    data[field] = value;
                    obj.update(data);
                }
            })
        }
    })


    table.on('edit(teachersList_filter)', function (obj) {
        if (IS_ZHEJIANG) {
            let projTeachId = obj.data.projTeachId;
            let teacherId = obj.data.teacherId;
            for (let i = 0; i < dataList.length; i++) {
                if (dataList[i].projTeachId == projTeachId && dataList[i].teacherId == teacherId) {
                    dataList[i] = obj.data;
                    if (obj.field == 'period') {
                        dataList[i].score = Math.floor(obj.value) * 2;
                    }
                }
            }
            table.reload('teachersListTable', {
                data: dataList,
            })

        }
    });

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
                let projScore = tableList.data[j].projScore;
                let period = tableList.data[j].period;
                let teachPeriod = tableList.data[j].teachPeriod;
                let creditLevelName = tableList.data[j].creditLevelName;



                if (score < 0) {
                    layer.msg('主讲人授分分值不能小于0')
                    return false;
                }
                if (score > projScore) {
                    let haiNanNotCheckScoreLevels = ['市级组织的继续医学教育培训班', '市级组织专题讲座、学术研讨活动', '市级组织适宜技术推广培训班'];
                    let fuJianNotCheckScoreLevels = ['地市、区、县继续医学教育活动', '单位组织的继续医学教育实践活动'];
                    let check = (IS_HAINAN && !(haiNanNotCheckScoreLevels.includes(creditLevelName))) ||
                        (IS_FUJIAN && !(fuJianNotCheckScoreLevels.includes(creditLevelName)));

                    if (check) {
                        layer.msg('主讲人授分分值不能大于项目学分')
                        return false;
                    }

                }
                if (Math.floor(score) != score) {
                    if (IS_HUBEI) {
                        layer.msg('主讲人授分分值只能填写整数')
                        return false;
                    }
                }
                if (period < 0) {
                    layer.msg('主讲人授分时长不能小于0')
                    return false;
                }
                if (period > teachPeriod) {
                    layer.msg('主讲人授分时长不能大于课程时长')
                    return false;
                }



                var givingEntity = {};
                givingEntity.projectType = 1;
                givingEntity.downId = downId;
                givingEntity.projTeachId = tableList.data[j].projTeachId;
                givingEntity.projScore = tableList.data[j].projScore;
                givingEntity.score = tableList.data[j].score;
                givingEntity.period = tableList.data[j].period;
                givingEntity.comPersonId = tableList.data[j].teacherId;
                givingEntity.scoreLevel = tableList.data[j].creditLevel;
                givingEntity.holdType = tableList.data[j].holdType;
                givingEntity.studyDate = tableList.data[j].studyDate;
                givingEntity.remark = tableList.data[j].remark;
                givingEntity.knowledgeId = tableList.data[j].tertiarySubjects;
                givingEntity.singleProjNo = tableList.data[j].projNo;
                givingEntity.singleProjName = tableList.data[j].projName + '-' + tableList.data[j].teachName;
                if (IS_ZHEJIANG || IS_GUANGDONG) {
                    givingEntity.cmeStandardKindId = cmeStandardKindId;
                }
                givingEntity.teachUnit = localStorage.getItem("unit-id");
                givingEntity.addUnit = localStorage.getItem("unit-id");
                givingEntity.endDate = endDate;
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


    function setDefault(datas) {
        for (let i = 0; i < datas.length; i++) {
            let defaultScore;
            let defaultPeriod;
            let defaultStudyDate;

            if (!datas[i].hasScored) {
                //浙江如此，其他省份以后再说
                if (IS_ZHEJIANG) {
                    defaultScore = Math.floor(datas[i].teachPeriod) * 2;
                    defaultScore && (datas[i].score = defaultScore);
                } else if (IS_GUANGDONG) {
                    defaultScore = Math.floor(datas[i].teachPeriod) * 2;
                    defaultScore && (datas[i].score = defaultScore);
                }
                defaultPeriod = datas[i].teachPeriod;
                defaultStudyDate = datas[i].endDate != null ? datas[i].endDate.substr(0, 10) : "";
                defaultPeriod && (datas[i].period = defaultPeriod);
                defaultStudyDate && (datas[i].studyDate = defaultStudyDate);
            }

        }
    }

    $("#btnGiving").click(function () {
        noRepeat(givingForTeachers);
    });


    // 关闭父页所有探窗
    window.closeOpen = function () {
        window.parent.closeAllForgivingForTeachers();
    }
})
