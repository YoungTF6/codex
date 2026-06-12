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
    let tool=layui.tool,excel=layui.excel;
    let standardkindId = localStorage.getItem("standardkind-id");
    const colsArr = [[
        {field: 'name', title: '名称',minWidth: 300,align: 'center',
            templet:function(d){
                if(d.level == 2) {
                    return `<div class="score-kind-cell">${d.name}</div>`;
                }else if(d.level == 3){
                    return `<div class="score-level-cell">${d.name}</div>`;
                }
                return d.name;
            }},
        {field: 'score', title: '学分',align: 'center',width: 80},
        {field: 'period', title: '学时',align: 'center',width: 80}
    ]];


    let getTableToolbar = function(){
        return `<div><button class="layui-btn layui-btn-sm" lay-event="excel" style="float: right;">导出Excel</button></div>`;
    }

    //获取学分审核情况数据
    let getPersonScoreDetails = function(personId,startDt,endDt,checkState,cmeYear){
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
            elem    :   "#personScoreTable",
            id      :   "scoreTable",
            url     :   huayi_projectscore_url+'projectScoreStatistis/getPersonScoreOrPassSummary',
            toolbar :   getTableToolbar(),
            defaultToolbar  :   [],
            height  :   height,
            page    :   false,
            limit   :   10,
            limits  :   [10, 50, 100, 150, 200],
            where   :   params,
            cols    :   colsArr,
            parseData: function (res) {
                return {
                    "code"  :   res.status === 200 ? 0 : res.status,
                    "msg"   :   res.message,
                    "data"  :   res.data
                };
            }
        });
    }

    //导出excel文件
    table.on('toolbar(personScoreTable)', function (obj) {
        let exportArr = [];
        let titleArr = [];
        for (const tempObj of colsArr[0]) { titleArr.push(tempObj.title); }
        exportArr.push(titleArr);
        for (const objData of table.cache['scoreTable']) {
            let tempDataArr = [];
            for (const tempObj of colsArr[0]) { 
                let tempValue = " "+objData[tempObj.field];
                if(objData.level==1&&tempObj.title=="名称") tempValue = tempValue;
                if(objData.level==2&&tempObj.title=="名称") tempValue = "  "+tempValue;
                if(objData.level==3&&tempObj.title=="名称") tempValue = "    "+tempValue;
                tempDataArr.push(tempValue);
            }
            exportArr.push(tempDataArr);
        }
        excel.exportExcel(exportArr, '个人各类学分汇总.xlsx', 'xlsx');
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
        getPersonScoreDetails(personId,startDt,endDt,checkState,cmeYear);
    }
    htmlInit();
});