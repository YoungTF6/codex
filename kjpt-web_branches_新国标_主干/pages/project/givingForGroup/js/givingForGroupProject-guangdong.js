var projectId=getUrlParam("projectId");
var projectType=getUrlParam("projectType");
var scoreLevel = getUrlParam('scoreLevel');

// 全局配置及引入相关的模块
layui.use(['table', 'form'], function () {
    var table = layui.table;
    var form = layui.form;
    var $ = layui.jquery;
    var layer = layui.layer;

// 表格相关操作
    // 表格配置
    function loadTable() {
        table.render({
            elem: '#cmeProjPosDownload',
            url: huayi_projectscore_url + 'giving/getDownList',
            title: '周期表',
            defaultToolbar: [],
            where: {
                projectId: projectId,
                projectType: projectType,
            },
            cols: [[
                {align: 'center', width: 300, toolbar: '#rowBar', title: '操作'},
                {field: 'downId', title: '周期主键',hide : true},
                {field: 'projectOn', title: '项目编号', hide: true },
                {field: 'projectName', title: '项目名称 ', },
                {title: '批次 ',toolbar: '#rowBarForDownId', },
                {field: 'startDate', title: '开始时间', },
                {field: 'endDate', title: '截止时间', },
                {field: 'givingStatus', title: '是否已授分', templet: function (d) {
                        if (d.givingStatus){
                            return '是'
                        }else {
                            return '否'
                        }
                    }
                }
            ]],
            cellMinWidth: 100,
            id: "cmeProjPosDownload",
            //height: 'full-155',
            page: false,
            limit: 10,
            limits: [10, 50, 100, 150, 200],
            parseData: function (res) {
                // handleTime(res.data);
                return {
                    "code": res.status === 200 ? 0 : res.status, //解析接口状态
                    "msg": res.msg, //解析提示文本
                    "data": res.data, //解析数据列表
                }

            },
            request: {
                pageName: 'pageNum', //页码的参数名称，默认：page
                limitName: 'pageSize' //每页数据量的参数名，默认：limit
            }
        });
    }



    // 监听行内按钮
    table.on('tool(cmeProjPosDownload)', function (obj) {
        var datas = obj.data;

        if (obj.event === 'attendanceRecordAwardPoints') {
            let url;
            if(window['value_qrcode_attend_mode'] == '2') {
                url = '/pages/project/givingForGroup/attendanceRecordAwardPointsForProj.html?downId='+obj.data.downId+'&projectId='+projectId+'&projectType='+projectType+'&scoreLevel='+scoreLevel+'&startDate='+obj.data.startDate+'&endDate='+obj.data.endDate;
            } else {
                url = '/pages/project/givingForGroup/attendanceRecordAwardPoints.html?downId='+obj.data.downId+'&projectId='+projectId+'&projectType='+projectType+'&startDate='+obj.data.startDate+'&endDate='+obj.data.endDate;
            }
            // 考勤分析
            var index = layer.open({
                type: 2,
                title: "考勤记录授分",
                content: url,
                skin: '',
                area: ['100%', '100%'],
            });
        } else if (obj.event === 'manualCredits') {
            var index = layer.open({
                type: 2,
                title: '手工补录学分',
                content: '/pages/project/givingForGroup/ManualEntryPoints.html?downId='+obj.data.downId+'&projectType='+projectType+'&startDate='+obj.data.startDate+'&endDate='+obj.data.endDate+'&projectId='+projectId,
                area: ['100%', '100%'],
                skin: '',
            });
        } else if (obj.event === 'teacherScore') {
            var index = layer.open({
                type: 2,
                title: '主讲人授分',
                content: '/pages/project/givingForGroup/GivingForTeachers.html?downId='+obj.data.downId+'&projectType='+projectType+'&startDate='+obj.data.startDate+'&endDate='+obj.data.endDate,
                area: ['100%', '100%'],
                skin: ''
            });
        }
    });

    window.checkBeforeStartDate = function(startDateStr) {
        let now = new Date();
        let startDate = new Date(startDateStr);
        console.log(startDateStr);
        console.log(startDate);
        return now < startDate;
    }

    /* 获取配置 */
    window.getConfig = function (config_name, scoreLevel) {
        $.ajax({
            async: false,
            type: 'post',
            url: huayi_sjwh_url + 'cmeCommonConfig/getConfigByUnitFromRedis',
            data: {
                unitId: localStorage.getItem('unit-id'),
                configNames: config_name,
                scoreLevelId: scoreLevel
            },
            success: function (res) {
                if (res.success == true) {
                    window[config_name] = res.data[config_name];
                } else {
                    layer.msg('获取配置失败');
                }
            },
            error: function () {
                layer.msg('获取配置失败');
            }
        });
    }
    $(function() {
        window.getConfig('fun_must_apply_before_hold', scoreLevel);
        window.getConfig('fun_close_bulu_proj_groupproj_score', null);
        window.getConfig('value_qrcode_attend_mode', null);
        loadTable();
    })
    

});
