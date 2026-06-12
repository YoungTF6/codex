function createBaseHtml() {
    var html = `<div class="layui-fluid">
        <div class="layui-card">
            <div class="layui-card-body layui_body_box ">
                <table class="layui-table" id="personScoreTable" lay-filter="personScoreTable">
                </table>
            </div>
        </div>
    </div>`;
    $('body').html(html);
}
createBaseHtml();


layui.config({
    base: '/js/layui/ext/'
}).extend({
    tool    :   'tool',
    excel   :   'excel'
});

// 全局配置及引入相关的模块
layui.use(['table','tool','excel'], function () {
    let table = layui.table,$ = layui.jquery,layer = layui.layer;
    let tool=layui.tool,excel = layui.excel;
    let standardkindId = localStorage.getItem("standardkind-id");
    let qing_hai_tao = "6427ddba-c02f-4229-bd73-49fc1c5d21f6";
    let zhe_jiang_tao = "190c480d-d43c-450b-8472-a6fd00a6729d";
    let isGuangDong = standardkindId === StandardKind.GUANG_DONG;
    let isZheJiang = standardkindId === StandardKind.ZHE_JIANG;
    // 活动内容列：广东 + 浙江显示
    let projScoreTypeNameHideFlag = !(isGuangDong || isZheJiang);
    const colsArr = [[
            {field: 'person_name', title: '姓名',align: 'center',width:80},
            {field: 'person_no', title: '人员编号',align: 'center',minWidth: 180},
            {field: 'study_date', title: '授分日期',align: 'center',sort: true,minWidth: 200,templet:function(d){
                if(d["study_date"]==null) return "";
                if(d["study_date"].indexOf("T")>=0) {
                    return d["study_date"].substr(0,d["study_date"].indexOf("T"));
                }
                if(d["study_date"].indexOf(" ")>=0) {
                    return d["study_date"].substr(0,d["study_date"].indexOf(" "));
                }
                return d["study_date"].substr(0,10);
            }},
            {field: 'proj_no', title: '项目编号',align: 'center',sort: true,minWidth: 160},
            {field: 'proj_score_type_name', title: '活动内容',align: 'center',sort: true,minWidth: 240 , hide: projScoreTypeNameHideFlag},
            {field: 'proj_name', title: '活动名称',align: 'center',sort: true,minWidth: 240},
            {
                field: '',
                title: '学分证明照片',
                minWidth: 130,
                align: 'center',
                sort: true,
                templet: function(d) {
                    return `<a class="layui-btn layui-btn-xs btn-row" lay-event="showThumb">查看</a>`;
                }
            },
            {field:'ext_data',title: '详细信息',align:"center",minWidth:300,
                    templet:function(d){
                        // 单元格鼠标悬浮显示
                        // 构建单元格内容 HTML
                        var cellValue = buildExtDataHtml(d.ext_data);
                        var cellId = 'ext-data-cell-' + d.LAY_TABLE_INDEX;
                        return `<div id="${cellId}" class="layui-table-cell layui-ext-data-cell">${cellValue}</div>`;
                    }
                },
            {field: 'score', title: '学分',align: 'center',sort: true,minWidth: 90},
            {field: 'period', title: '学时',align: 'center',sort: true,minWidth: 90},
            {title: '是否项目类学分',align: 'center',minWidth: 140,templet: function(d){ 
                return d.proj_type_kind == 1 ?"是":"否"
                }
            },
            {field: 'score_kind_name', title: projectLabels.lblScoreLevel,align: 'center',sort: true,minWidth: 150},
            {field: 'score_level_name', title: projectLabels.lblScoreLevelChild,align: 'center',sort: true,minWidth: 150},
            {field: 'knowledge_name', title: '三级学科',align: 'center',sort: true,minWidth: 150},
            {field: 'hold_type_name', title: projectLabels.lblActivityForm,align: 'center',sort: true,minWidth: 150, hide: standardkindId === qing_hai_tao},
            {field: 'score_input_unit_name', title: '学分录入单位',align: 'center',sort: true,minWidth: 150},
            {field: 'score_cert_unit_name', title: '发证机构',align: 'center',sort: true,minWidth: 150},
            {field: 'add_time', title: '录入时间',align: 'center',sort: true,minWidth: 190,templet:function(d){
                if(d["add_time"]==null) return "";
                return d["add_time"].replace("T"," ");
            }},
            {field: 'check_time', title: '审核时间',align: 'center',sort: true,minWidth: 190,templet:function(d){
                if(d["check_time"]==null) return "";
                return d["check_time"].replace("T"," ");
            }},
            {field: 'check_state_name', title: '审核状态',align: 'center',sort: true,minWidth: 150},
            {field: 'check_memo', title: '审核意见',align: 'center',sort: true,minWidth: 150,
            hide: tool.getParamFromUrl("checkMemo")==="hide"  },
            {field: 'if_avail_name', title: '学分是否有效',align: 'center',sort: true,minWidth: 150},
            {field: 'score_mode_name', title: '录入方式',align: 'center',sort: true,minWidth: 150, hide: standardkindId === qing_hai_tao},
            {field: 'remark', title: '备注',align: 'center',minWidth: 150, hide: standardkindId === zhe_jiang_tao}
        ]];

    let getTableToolbar = function(){
        return `<div><div class="table-tool-title">
        <div id="tableTitle"></div>
        <button class="layui-btn layui-btn-sm" lay-event="excel">导出Excel</button>
    </div></div>`;
    }

    //获取学分审核情况数据
    let getPersonScoreStatistics = function(personId,startDt,endDt,checkState,cmeYear){
        const height = document.documentElement.clientHeight - 60;
        let params="";
        if(cmeYear==undefined || cmeYear=="" || cmeYear==null){
            params = {standardKindId:standardkindId,
            personId:personId,checkState:checkState,
            startDt:startDt,endDt:endDt,kind:1};
        }
        else{
            params = {standardKindId:standardkindId,
            personId:personId,cmeYear:cmeYear,kind:2};
        }
        table.render({
            elem    :   '#personScoreTable',
            id      :   'scoreTable',
            url     :   huayi_projectscore_url+'projectScoreStatistis/getPersonScoreOrPassDetails',
            toolbar :   getTableToolbar(),
            defaultToolbar  :   [],
            cellMinWidth    :   60,
            height  :   height,
            page    :   false,
            limit   :   10,
            limits  :   [10, 50, 100, 150, 200],
            where   :   params,
            cols    :   colsArr,
            parseData: function (res) {
                if(res.status == 200 && !tool.isEmpty(res.data)) {
                    $("#tableTitle").html(res.data["scoreText"]);
                }

                return {
                    "code"  :   res.status === 200 ? 0 : res.status,
                    "msg"   :   res.message,
                    "data"  :   (res.data==null) ? res.data : res.data.recordsTotal,
                };
            },
            done:function(res,curr,count){
                
                // 绑定单元格悬浮事件
                bindExtDataTips();
            
            }
        });
    }

    //导出excel文件
    table.on('toolbar(personScoreTable)', function (obj) {
        let exportArr = [];
        let titleArr = [];
        debugger
        for (const tempObj of colsArr[0]) {
            if(!tempObj.hide){
                titleArr.push(tempObj.title); 
            }
        }
        exportArr.push(titleArr);
        for (const objData of table.cache['scoreTable']) {
            let tempDataArr = [];
            for (const tempObj of colsArr[0]) {
                if(tempObj.hide) {
                    continue;
                }
                let tempValue = (tool.isEmpty(objData[tempObj.field])) ? "" : objData[tempObj.field];
                if(tempObj.title.indexOf("时间")>0||tempObj.title.indexOf("日期")>0) {
                    // tempValue = tempValue.replaceAll("T"," ");
                    if(tempValue.indexOf("T")>0) {
                        tempValue = tempValue.substr(0,tempValue.indexOf("T"));
                    }
                    if(tempValue.indexOf(" ")>0) {
                        tempValue = tempValue.substr(0,tempValue.indexOf(" "));
                    }
                    if(tempValue.length > 10) {
                        tempValue = tempValue.substr(0,10);
                    }
                }
                // 处理详细信息json串
                if(tempObj.field == 'ext_data'){
                    tempValue = buildExtDataHtml(tempValue);
                }
                tempDataArr.push(tempValue);
            }
            exportArr.push(tempDataArr);
        }
        excel.exportExcel(exportArr, '个人学分详细情况明细.xlsx', 'xlsx');
    });

    table.on('tool(personScoreTable)', function (obj) {
        let rowData = obj.data;
        if ('showThumb' === obj.event) {
            if (rowData.scoreTypeVal === 4 || rowData.scoreTypeVal === 2) {
                layer.msg('继教项目和院内活动无学分证明照片');
                return false;
            }
            let visit = huayi_projectscore_url + 's1/single/photo/' + rowData.score_id;
            getAction(visit).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success && jsonRes.data.length > 0) {
                    localStorage.setItem('tmp_single_photo', JSON.stringify(jsonRes.data));
                    parent.layer.open({
                        type: 2,
                        shade: 0.4,
                        shadeClose: true,
                        title: '学分证明照片',
                        content: '/pages/mod/check/modals/SinglePhotoModal_2.html?score_id=1',
                        area: ['100%', '100%'],
                        end: function (layero, index) {
                            localStorage.removeItem('tmp_single_photo');
                        }
                    });
                } else {
                    layer.msg('未查询到该个人活动相关的照片');
                }
            }).catch(error => {
                layer.msg('error:加载学分证明照片');
            }).finally(() => {
                //
            });
        }
    });

    //页面加载入口
    let htmlInit = function(){
        const personId = tool.getParamFromUrl("personId");
        const startDt = tool.getParamFromUrl("startDt");
        const endDt = tool.getParamFromUrl("endDt");
        const checkState = tool.getParamFromUrl("checkState");
        const cmeYear = tool.getParamFromUrl("cmeYear");
        if(tool.isEmpty(personId)) {
            layer.msg("缺少必要参数");
            return;
        }
        getPersonScoreStatistics(personId,startDt,endDt,checkState,cmeYear);
    }

    htmlInit();
});