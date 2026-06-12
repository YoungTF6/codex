    function addScript(url){
        document.write("<script language=javascript src="+url+"></script>");
    }
    addScript('/js/constantPage/projectConstant.js');
    addScript('/pages/score/cme_singleproj_score/js/singleScoreExtData.js');
    addScript('/pages/score/cme_singleproj_score/js/zjExtToCommonMap.js');

    var cmeStandardKindId = localStorage.getItem("standardkind-id");

    // 湖北个人活动学分录入，项目编号添加提示
    if(cmeStandardKindId == '73ba18db-33fd-4746-ab41-9beb009f69a1'){
        $("#projNoRemark").show();
    }else{
        $("#projNoRemark").hide();
    }

    // 全局配置及引入相关的模块
    layui.config({
        base        : '/js/layui/ext/'
    }).extend({
        treeSelect  : 'treeSelect',
    }).use(['table', 'form', 'laydate', 'upload','treeSelect','laydate', 'tool'  ], function () {
        var $ = layui.jquery, table = layui.table, tool=layui.tool,laydate = layui.laydate
            , form = layui.form,  layer = layui.layer, treeSelect=layui.treeSelect
            ;
        var layActivityDate, layPatentTime, layPaperTime;  
        var cmeYear, scoreLevel;
        var lastLoadedScoreLevelForContent = '';
        window.getCmeStandardKindId = () => localStorage.getItem('standardkind-id');
        window.getUnitId = () => localStorage.getItem('unit-id');
        window.getUnitName = () => localStorage.getItem('unit-name');

        // 往年学分控制
        let cmeYearInit = function() {
            var currentYear = (new Date()).getFullYear();
            $.ajax({
                url     : huayi_sjwh_url + 'cmeInputSingleprojscoreControlConfig/list',
                data    : { unitId: getUnitId(), validState: 1 },
                async   : false,
                success : re => {
                    if (re.status == 200) {
                        let $item = $('#cmeYear');
                        $item.empty().append($('<option value="' + currentYear + '" selected>' + currentYear +'</option>'));
                        for (let i = re.data.records.length - 1; i >= 0; i--) {
                            let d = re.data.records[i];
                            $item.append($('<option value="' + d.cmeYear + '">' + d.cmeYear + '</option>'));
                        }
                        form.render("select");
                        loaderTableT();
                    } else layer.msg(keyName + '加载失败', { icon: 7 });
                },
                error   : () => layer.msg(keyName + '加载失败', { icon: 7 })
            });
        }
        //时间组件绑定
        let dateInit = function(){
            if ($('#activityDate').length < 1) {
                return;
            }
            cmeYear = cmeYear ? cmeYear : window.getCmeYear();
            if(cmeYear){
                // if(layActivityDate){
                //     layActivityDate.config.min =  '' + cmeYear + '-1-1';
                //     layActivityDate.config.max =  '' + cmeYear + '-12-31';
                //     // $("#activityDate").remove();//删除input框重新append否则laydate不会重新渲染
                //     // $("#activityDateDiv").append('<input type="text" name="studyDate" id="activityDate" placeholder="请输学分证上项目举办日期" autocomplete="off" class="layui-input" readonly lay-verify="required" required>');
                // }else{
                //     layActivityDate = laydate.render({elem: '#activityDate',type: 'date', min: cmeYear+'-1-1',max: cmeYear+'-12-31',btns: ['clear', 'confirm'] });
                // }
                    layActivityDate = laydate.render({elem: '#activityDate',type: 'date', min: cmeYear+'-1-1',max: cmeYear+'-12-31',btns: ['clear', 'confirm'] });
            }else{
            layActivityDate = laydate.render({elem: '#activityDate',type: 'date',min: minDate(), max: maxDate(), value: new Date(),btns: ['clear', 'confirm'] });
            }
        }
        // 活动日期限制
        let getCmeYearStartEnd = function(){
            if ($('#activityDate').length < 1) {
                return;
            }
            let minMaxObj ;
            let url = huayi_sjwh_url + "cmeYear";
            $.ajax({
                async: false,
                url:url,
                data: { cmeYear:window.getCmeYear() , cmeStandardKindId: cmeStandardKindId },
                success: function(res) {
                    let data = res.data;
                    let startDate, endDate;
                    if(data != null && data.length > 0) {
                        startDate = data[0].startDate;
                        endDate = data[0].endDate;
                    }else {
                        startDate = cmeYear + '-01-01';
                        endDate = cmeYear + '-12-31';
                    }
                    let startD = new Date(startDate);
                    let endD = new Date(endDate);
                    let now = new Date();
                    if(!$("#activityDate").val()){
                        if(endD > now){
                            let formattedDate = now.toISOString().split('T')[0]; // 得到 YYYY-MM-DD 格式
                            $("#activityDate").val(formattedDate);
                        }else {
                            $("#activityDate").val(startDate);
                        }
                    }
                    minMaxObj = {
                        min:{ year: startD.getFullYear(),month: startD.getMonth(), date: startD.getDate()}, 
                        max:{ year: endD.getFullYear(),month: endD.getMonth(), date:  endD.getDate()}
                    };
                    layActivityDate.config.min =  minMaxObj.min;
                    layActivityDate.config.max =  minMaxObj.max;
                    layPatentTime && (layPatentTime.config.min =  minMaxObj.min);
                    layPatentTime && (layPatentTime.config.max =  minMaxObj.max);
                    layPaperTime && (layPaperTime.config.min =  minMaxObj.min);
                    layPaperTime && (layPaperTime.config.max =  minMaxObj.max);
                }
            });
        }

              // 初始化表单名称: 学分级别/举办方式等
        $('label').each((i, d) => {
            let name = $(d).attr('name');
            if (name){
                let currentHtml = $(d).html();
                let newLabel = projectLabels[name] || '';
                $(d).html(currentHtml + newLabel);
                // $(d).text(projectLabels[name] || '');
            } 
        });
        form.on('select(cmeYear)', function(data){
            cmeYear = data.value;
            initScoreLevelSel();
            getCmeYearStartEnd();
            initKnowledgeSelBatch();
            // loaderTable?.();
            loaderTableT();
        });
        let loaderTableT = () => {
            if (typeof loaderTable === 'function') {
                loaderTable();
            } else {
                console.warn('loaderTable 方法未定义');
            }
        };
        // 初始化学分级别
        // window.initScoreLevelSel = () => {
        //     if($('#scoreLevel').length < 1){
        //         return;
        //     }
        //     let year = window.getCmeYear(); 
        //     window.scoreLevelSel && (treeSelect.destroy('scoreLevel'), $('#scoreLevel').val(''));
        //     window.scoreLevelSel = treeSelect.render({
        //         elem    : '#scoreLevel',
        //         data    : huayi_sjwh_url + 'option/scoreLevel/tree/' + getCmeStandardKindId() + '/' + year + '/__1',
        //         type    : 'get',
        //         search  : true,
        //         style   : {
        //             folder  : { enable : false }, // 父节点图标
        //             line    : { enable : true} // 连接线
        //         },
        //         click   : d => (initHoldTypeSel(), initScoreLevelContentSel()),
        //         success : d => (initHoldTypeSel(), initScoreLevelContentSel())
        //     });
        // }
        // 初始化学分级别
        window.initScoreLevelSel = () => {
            if ($('#scoreLevel').length < 1) {
                if(window.getScoreLevel){
                    initHoldTypeSel();
                }
                return;
            }
            let keyName     = projectLabels.lblProjectLevel;
            let year = window.getCmeYear(); 
            if (!year) {
                return;
            }
            if($('#scoreLevel').val()){
                scoreLevel = $('#scoreLevel').val();
            }
            window.scoreLevelSel && (treeSelect.destroy('scoreLevel'), $('#scoreLevel').val(''));
            window.scoreLevelSel = treeSelect.render({
                elem: '#scoreLevel',
                data: huayi_sjwh_url + 'option/scoreLevel/tree/' + getCmeStandardKindId() + '/' + year + '/__1',
                type: 'get',
                search: true,
                disabledParent : window.disabledParent == false ? false : true,
                style: {
                    folder: { enable: false }, // 父节点图标
                    line: { enable: true } // 连接线
                },
                click: d => (initHoldTypeSel(), initScoreLevelContentSel(), initProjectTypeSel(),uploadTipsInit()),
                success: d => (initHoldTypeSel(), initProjectTypeSel(), treeSelect.checkNode('scoreLevel', scoreLevel))
            });
        };
      
        // 举办方式
        window.initHoldTypeSel = () => {
            let keyName     = projectLabels.lblActivityForm,
                scoreLevel  = window.getScoreLevel();
                if (!scoreLevel) {
                    return;
                }
            $.ajax({
                url     : huayi_sjwh_url + 'option/holdType/list/' + getCmeStandardKindId() + '/' + scoreLevel + '/__1',
                async   : false,
                success : re => {
                    if (re.status == 200) {
                        let $item = $('#holdType');
                        $item.empty().append($('<option value="">请选择</option>'));
                        $.each(re.data, (i, d) => $item.append($('<option value="' + d.holdTypeId + '">' + d.holdTypeName + '</option>')));
                    } else layer.msg(keyName + '加载失败', { icon: 7 });
                },
                error   : () => layer.msg(keyName + '加载失败', { icon: 7 })
            });
            form.render();
        }

        // 活动内容
        window.initScoreLevelContentSel = () => {
            let keyName = projectLabels.lblActivityContent,
                scoreLevel = window.getScoreLevel();
            let $item = $('#scoreLevelContent');
            if (!$item.length) return;
            // 依赖未就绪时不覆盖已有选项，避免空参数请求清空下拉
            if (!scoreLevel) return;
            // 同一学分级别已加载且已有业务选项时跳过，避免重复覆盖
            if (lastLoadedScoreLevelForContent === scoreLevel && $item.find('option').length > 1) {
                return;
            }
            $.ajax({
                url: huayi_sjwh_url + 'option/scoreLevelContent/list',
                data: { scoreLevel: scoreLevel },
                async: false,
                success: re => {
                    if (re.status == 200) {
                        $item.empty().append($('<option value="">请选择</option>'));
                        $.each(re.data, (i, d) => $item.append($('<option value="' + d.value + '">' + d.scoreLevelContentName + '</option>')));
                        lastLoadedScoreLevelForContent = scoreLevel;
                    } else {
                        layer.msg(keyName + '加载失败', { icon: 7 });
                    }
                },
                error: () => layer.msg(keyName + '加载失败', { icon: 7 })
            });
            form.render('select');
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
                success: function (res) {
                    if (res.success == true) {
                        window[configNames] = res.data[configNames];
                    } else {
                        layer.msg('获取配置失败');
                    }
                },
                error: function () {
                    layer.msg('获取配置失败');
                }
            });
        }

        // 项目类别
        window.initProjectTypeSel = () => {
            getConfig("value_proj_type_for_score_level", getScoreLevel());
            $("#projType").empty();
            if (window["value_proj_type_for_score_level"]) {
                $("#projTypeSpan").show();
                $("#projType").removeAttr("disabled");
                // projType添加必选
                $("#projType").attr("lay-verify", "required");
                $("#projType").append(`<option value="">请选择</option>`);
                let projTypes = window["value_proj_type_for_score_level"]
                projTypes.split(",").forEach(item => {
                    if (item == "1") {
                        $("#projType").append(`<option value="1">推荐项目</option>`);
                    } else if (item == "2") {
                        $("#projType").append(`<option value="2">推广项目</option>`);
                    }
                });
            }else{
                $("#projType").append(`<option value="0" >/</option>`);
                // 使用 jQuery 选择器并隐藏 span 元素
                $('#projType').closest('.layui-form-item').find('label > span').hide();
                // 禁用projType, 并赋默认值0
                $("#projType").val("0");
                $("#projType").attr("disabled", "disabled");
                $("#projTypeSpan").hide();
            }
            // $("#projType").next().find('input[type="text"]').attr('placeholder', '');

            getConfig("value_proj_type_kind_in_cme_singleproj_score", getScoreLevel());
            let projTypeKind = window["value_proj_type_kind_in_cme_singleproj_score"];
            if (projTypeKind) {
                $("#projTypeKind").val(projTypeKind);
            }else{
                $("#projTypeKind").val(2);
            }
            form.render();
        };
       

        // 学科
        window.initKnowledgeSel = (sel, name, data, callback) => {
            if ($('#knowledgeTwo').length < 1) {
                return;
            }
            if (!window.getCmeYear()) {
                return;
            }
            $.ajax({
                async   : false,
                url     : huayi_sjwh_url + 'comKnowledge',
                data    : { ...data, ...getVerParams() },
                success : re => {
                    if (re.success == true) {
                        let data = re.data;
                        $(sel).find('option:gt(0)').remove();
                        data.forEach(item => $(sel).append(`<option value="${item.knowledgeId}">${item.knowledgeName}</option>`));
                        if (typeof callback == 'function') callback(data);
                        form.render('select');
                    }
                    else layer.msg(name + '加载失败', { icon: 7, time: 1500 });
                },
                error   : () => layer.msg(name + '加载失败', { icon: 7, time: 1500 })
            });
        }
        // 三级学科
        window.initKnowledgeSelBatch = () => {
            $('#knowledgeThree').find('option:gt(0)').remove();
            initKnowledgeSel('#knowledgeTwo', '二级学科', { knowledgeType: 2 });
            form.on('select(knowledgeTwo)', data => initKnowledgeSel('#knowledgeThree', '三级学科', { knowledgeType: 3, knowledgeTwoId: data.value }));
        }

        window.getVerParams = () => {
            return {
                cmeStandardKindId   : getCmeStandardKindId(),
                // versionYear         : $('#cmeYear').val()
                versionYear         : window.getCmeYear()
            };
        }
        window.getCmeYear = () => {
            if(cmeYear){ 
                return cmeYear;
            }else if($('#cmeYear').val()){
                return $('#cmeYear').val();
            }
            return '';
        }
        window.getScoreLevel = () => {
            if($('#scoreLevel').val()){
                return $('#scoreLevel').val();
            }else if(scoreLevel){
                return scoreLevel;
            } 
            return '';
        }

        // ========== 广东套：标签/文案替换（发证机构→期刊名称、小时→学习时长） ==========
        var GUANGDONG_SUITE_ID = '289bf0ca-52cb-4b19-b737-9bd200a69ce1';
        var GUANGDONG_SCORE_LEVEL_ID = 'cefbb3ca-ccc1-11ef-800f-005056a64c01';
        var GUANGDONG_PROJECT_INFO_SCORE_LEVEL_ID = '488e0162-ccc1-11ef-800f-005056a64c01';
        function applyGuangdongLabelReplace(scoreLevel) {
            if (getCmeStandardKindId() !== GUANGDONG_SUITE_ID) return;
            tool.replaceTextInDocument({"小时": "学习时长（小时）"});
            if (scoreLevel === GUANGDONG_SCORE_LEVEL_ID) {
                tool.replaceTextInDocument({"发证机构": "期刊名称"});
            }
        }
        /**
         * 广东套指定学分级别下，基本信息切换为“项目名称/项目编号”
         */
        function isGuangdongProjectInfoScoreLevel(scoreLevelId) {
            return getCmeStandardKindId() === GUANGDONG_SUITE_ID && scoreLevelId === GUANGDONG_PROJECT_INFO_SCORE_LEVEL_ID;
        }
        /**
         * 广东套指定学分级别下，切换“活动名称/活动编号”为“项目名称/项目编号”。
         */
        window.applyBaseInfoConfigByScoreLevel = (scoreLevelId, mode) => {
            var isProjectInfo = isGuangdongProjectInfoScoreLevel(scoreLevelId);
            if (mode === 'edit') {
                $("#singleProjNameLabelEdit").html('<font color="red">*&nbsp;</font>' + (isProjectInfo ? '项目名称' : '活动名称'));
                $("#singleProjNoLabelEdit").html((isProjectInfo ? '<font color="red">*&nbsp;</font>' : '') + (isProjectInfo ? '项目编号' : '活动编号'));
                $("#editScore input[name='singleProjName']").attr("placeholder", isProjectInfo ? "请输入项目名称" : "请输入活动名称");
                $("#singleProjNoEdit").attr("placeholder", isProjectInfo ? "请输入项目编号" : "请输入活动编号");
                if (isProjectInfo) {
                    $("#singleProjNoEdit").attr("lay-verify", "singleProjNoVerify|required");
                } else {
                    $("#singleProjNoEdit").attr("lay-verify", "singleProjNoVerify");
                }
            } else if (mode === 'view') {
                $("#singleProjNameLabelView").text(isProjectInfo ? "项目名称" : "活动名称");
                $("#singleProjNoLabelView").text(isProjectInfo ? "项目编号" : "活动编号");
            }
        }
        /**
         * 根据学分级别设置基本信息文案与项目编号是否必填
         */
        function applyBaseInfoConfigByScoreLevel(scoreLevelId) {
            var isProjectInfoLabel = isGuangdongProjectInfoScoreLevel(scoreLevelId);
            var needProjectNoRequired = isProjectInfoLabel || scoreLevelId === '4d7dc9b4-a099-4999-8fbc-9beb00a2eac1';
            $("#singleProjNameLabel").html('<font color="red">*&nbsp;</font>' + (isProjectInfoLabel ? '项目名称' : '活动名称'));
            $("#singleProjNoLabel").html('<font color="red" id="projectNoSpan" style="display: none;">*&nbsp;</font>' + (isProjectInfoLabel ? '项目编号' : '活动编号'));
            $("input[name='singleProjName']").attr("placeholder", isProjectInfoLabel ? "请输入项目名称" : "请输入活动名称");
            $("#singleProjNo").attr("placeholder", isProjectInfoLabel ? "请输入项目编号" : "请输入活动编号");
            if (needProjectNoRequired) {
                $("#singleProjNo").attr("lay-verify", "singleProjNoVerify|required");
                $("#projectNoSpan").show();
            } else {
                $("#singleProjNo").attr("lay-verify", "singleProjNoVerify");
                $("#projectNoSpan").hide();
            }
        }
        window.applyGuangdongTeachUnitLabel = function (scoreLevelId, scopeElement) {
            if (typeof getCmeStandardKindId !== 'function' || getCmeStandardKindId() !== GUANGDONG_SUITE_ID || scoreLevelId !== GUANGDONG_SCORE_LEVEL_ID) return;
            if (scopeElement && scopeElement.length && scopeElement[0]) {
                tool.replaceTextInElement(scopeElement[0], {"发证机构": "期刊名称"});
            } else {
                tool.replaceTextInDocument({"发证机构": "期刊名称"});
            }
        };
        // ========== 以上广东套 ==========

        // 内蒙学分级别对应项目编号
        const scoreLevelReversed = {
        // 住院医师规范化培训
        "2da92130-2272-11f1-8a80-005056a64c01": "ZX-01",
        // 专科医师规范化培训
        "2da92162-2272-11f1-8a80-005056a64c01": "ZX-02",
        // 公共卫生医师规范化培训
        "2da9219e-2272-11f1-8a80-005056a64c01": "ZX-03",
        // 助理全科医生培训
        "2da921da-2272-11f1-8a80-005056a64c01": "ZX-04",
        // 精神科医师转岗培训
        "2da9220c-2272-11f1-8a80-005056a64c01": "ZX-05",
        // 儿科医师转岗培训
        "2da92248-2272-11f1-8a80-005056a64c01": "ZX-06",
        // 心理援助热线咨询员培训
        "2da9227a-2272-11f1-8a80-005056a64c01": "ZX-07",
        // 癌症筛查与早诊培训
        "2da922b6-2272-11f1-8a80-005056a64c01": "ZX-08",
        // 院前急救医务人员培训
        "2da922f2-2272-11f1-8a80-005056a64c01": "ZX-09",
        // 全科医生转岗培训项目
        "2da9232e-2272-11f1-8a80-005056a64c01": "ZX-10",
        // 麻醉科医师培训
        "2da92360-2272-11f1-8a80-005056a64c01": "ZX-11",
        // 康复科医师培训
        "2da9239c-2272-11f1-8a80-005056a64c01": "ZX-12",
        // 临床药师培训
        "2da923d8-2272-11f1-8a80-005056a64c01": "ZX-13",
        // 病原微生物实验室生物安全人员培训
        "2da92414-2272-11f1-8a80-005056a64c01": "ZX-14",
        // 临床药师培训(药师岗位培训)
        "2da92450-2272-11f1-8a80-005056a64c01": "ZX-15",
        // 出生缺陷防治人员培训
        "2da92482-2272-11f1-8a80-005056a64c01": "ZX-16",
        // 基层产科医师培训
        "2da924be-2272-11f1-8a80-005056a64c01": "ZX-17",
        // 老年医学人才培训(包括骨干医师、医养结合机构医生培训)
        "2da924fa-2272-11f1-8a80-005056a64c01": "ZX-18",
        // 老年医学科和医养结合机构护士培训
        "2da92540-2272-11f1-8a80-005056a64c01": "ZX-19",
        // 职业病防治人才培训
        "2da9257c-2272-11f1-8a80-005056a64c01": "ZX-20",
        // 县级医院骨干专科医师培训(呼吸与危重症医学、心血管病学、妇产科学、超声诊断学、普通外科学、神经外科学、重症医学、精神医学)
        "2da925ae-2272-11f1-8a80-005056a64c01": "ZX-21",
        // 县级医院骨干专科医师培训(新生儿医学专业)
        "2da925ea-2272-11f1-8a80-005056a64c01": "ZX-22",
        // 中西部地区县级儿童保健人员培训
        "2da92626-2272-11f1-8a80-005056a64c01": "ZX-23",
        // 乡镇卫生院和社区卫生服务中心骨干全科医生培训
        "2da92662-2272-11f1-8a80-005056a64c01": "ZX-24",
        // 乡镇卫生院和社区卫生服务中心骨干人员培训
        "2da9269e-2272-11f1-8a80-005056a64c01": "ZX-25",
        // 乡村医生培训(含大学生乡村医生)
        "2da926da-2272-11f1-8a80-005056a64c01": "ZX-26",
        // 万名医师支援农村工程
        "2da92716-2272-11f1-8a80-005056a64c01": "ZX-27"
        };

        const _isGuangdong = cmeStandardKindId === '289bf0ca-52cb-4b19-b737-9bd200a69ce1';
        window.init = () => {

            
            let grantName = decodeURIComponent(getParamFromUrl("grantName") || '');
            if (_isGuangdong && grantName) {
                $(".stepTitle").text(grantName);
            }
            cmeYear = getParamFromUrl('cmeYear');
            cmeYear = cmeYear ? cmeYear : window.getCmeYear();
            // 浙江套移除 id="activityDate"元素
            if(cmeStandardKindId == '190c480d-d43c-450b-8472-a6fd00a6729d' && cmeYear >= '2026'){
                $('#activityDate').remove();
            }
            scoreLevel = getParamFromUrl('scoreLevel');
            applyGuangdongLabelReplace(scoreLevel);
            // 向导录入会传输学分级别
            if(scoreLevel){
                initProjectTypeSel();
                initScoreLevelContentSel();

                // 内蒙套；根据学分级别生成项目编号，并禁用项目编号输入框
                if(scoreLevelReversed[scoreLevel]){
                    $('#singleProjNo').val(scoreLevelReversed[scoreLevel]);
                    $('#singleProjNo').attr('disabled', true);
                }
            }
            cmeYearInit();
            initScoreLevelSel();
            initKnowledgeSelBatch();
            dateInit();
            if(cmeYear){
                getCmeYearStartEnd();
            }


            function waitForLabelInstanceAndExecute(maxRetries = 10, currentRetry = 0) {
                // 判断$(".js-photo-box")是否存在hidden-el类
                if ($(".js-photo-box").hasClass("hidden-el")) {
                     getConfig("fun_singleproj_photo_upload", getScoreLevel());
                    if (window["fun_singleproj_photo_upload"] == "0" && window.getCmeStandardKindId() == '190c480d-d43c-450b-8472-a6fd00a6729d') {
                        // setTimeout(() => {
                            $(".js-photo-box").removeClass("hidden-el");
                            $(".layui-upload").find("font")[0].style.display = "none";
                        // }, 100);
                    }
                } else {
                    console.warn('fun_singleproj_photo_upload 第 ' + currentRetry + ' 次尝试');
                    // 检查是否达到最大重试次数
                    if (currentRetry >= maxRetries) {
                        console.warn('fun_singleproj_photo_upload 在 ' + maxRetries + ' 次尝试后仍未加载完成');
                        return;
                    }
                    
                    // 如果实例尚未创建，稍后再试
                    setTimeout(() => {
                        waitForLabelInstanceAndExecute(maxRetries, currentRetry + 1);
                    }, 50);
                }
            }
            
            waitForLabelInstanceAndExecute();
           
        }

        //解析url参数
        let getParamFromUrl = function (paramName) {
            let urlStr = location.search;
            if (urlStr.indexOf(paramName) < 0 || urlStr.indexOf("?") < 0) return;
            let paramKV = urlStr.substr(1).split("&");
            for (let i = 0; i < paramKV.length; i++) {
                if (paramKV[i].indexOf(paramName) >= 0) {
                    return paramKV[i].split("=")[1];
                }
            }
        }

        init();

        //表单校验
        form.verify({
           // 重写required校验规则
            required: function (value, item) {
                // 判断元素是否可见
                // 如果是下拉框，则判断同级class="layui-form-select"元素
                if ($(item)[0].tagName == 'SELECT') {
                    // 获取下拉框的layui渲染容器
                    var selectContainer = $(item).next('.layui-form-select');
                    // 如果容器存在且不可见，则跳过校验
                    if (selectContainer.length && selectContainer.is(':hidden')) return;
                }else{
                    if ($(item).is(':hidden')) return;
                }
                // 原始required校验逻辑
                var tip = item.getAttribute('lay-reqText') || '必填项不能为空';
                if (typeof value === 'number') {
                    value = value.toString();
                }
                if (value === '' || value === null || value === undefined) {
                    return tip;
                }
            },
            singleProjNameVerify: function(value,item){
                if ($(item).is(':hidden')) return;
                if(null==value || value=="" || value.trim()=="") return "必填字段不能为空";
                if(value.length > 300) return "超出最大限定字数";
            },
            singleProjNoVerify : function(value,item){
                if(value.length > 30) return "超出最大限定字数";
            },
            periodVerify:function(value,item){
                if ($(item).is(':hidden')) return;
                // if(null==value || value=="" || value.trim()=="") return "必填字段不能为空";
                // 湖北套学分级别为 发表论文著作
                if(value <= 0 &&  $('#scorelevel').val() != 'dadfc350-24e4-46ee-81b4-9beb00a2fccb') return "学分学时不满足要求，无法保存。";
                // 湖北套限定学分90
                if(cmeStandardKindId == '73ba18db-33fd-4746-ab41-9beb009f69a1'){
                    if(value > 90) {
                        return "超出最大限定学时:90";
                    }
                }
                if(value > 150) return "超出最大限定学时";
            },
            scoreVerify:function(value,item){
                if ($(item).is(':hidden')) return;
                if(null==value || value=="" || value.trim()=="") return "必填字段不能为空";
                if(value < 0) return "小于最小限定学分";
                // 广西限制不超过25分
                if(cmeStandardKindId == '4a6d91fb-8ba4-4560-a801-9c6f00e6d999'){
                    if(value > 25) {
                        return "超出最大限定学分:25";
                    }
                }else{
                    if(value > 99) {
                        return "超出最大限定学分";
                    }
                }            
            },
            remarkVerify:function(value,item){
                if(value.length > 180) return "超出最大限定字数";
            },
            unitNameVerify:function(value,item){
                if ($(item).is(':hidden')) return;
                if(null==value || value=="" || value.trim()=="") return "必填字段不能为空";
                if(value.length > 100) return "超出最大限定字数";
            },
            pub_unit_name:function(value,item){
                if ($(item).is(':hidden')) return;
                if($("#pub_unit").val() == '省卫健委公布项目' || $("#pub_unit").val() == '2'){
                    if(null==value || value=="" || value.trim()=="") return "必填字段不能为空";
                }
            },
        });

            
        var completePeriod = getParamFromUrl("completePeriod");
        var unitNum = getParamFromUrl("unitNum");
        var unitName = getParamFromUrl("unitName");
        unitName = decodeURIComponent(unitName);
        var unitScore = getParamFromUrl("unitScore");
        var unitMaxscore = getParamFromUrl("unitMaxscore");
        // let scoreLevel = tool.getParamFromUrl('scoreLevel');
        // let cmeYear = tool.getParamFromUrl('cmeYear');
        $("#scoreLevelHide").val(scoreLevel);

        if(scoreLevel === '4d7dc9b4-a099-4999-8fbc-9beb00a2eac1'){
            // 项目编号 必填
            $("#singleProjNo").attr("lay-verify", "singleProjNoVerify|required");
            $("#projectNoSpan").show();
        }else{
            $("#singleProjNo").attr("singleProjNoVerify");
            $("#projectNoSpan").hide();
        }
        applyBaseInfoConfigByScoreLevel(scoreLevel);

        // 浙江
        let scoreTypeId = '';
        // 加载浙江套个人学分表单
        window.loadZjScoreForm = function(formId, data, type){
            fetch('/pages/score/cme_singleproj_score/grant_score_singleproj_ext.html')
            .then(response => response.text())
            .then(html => {
                if(type == 'view'){
                    $("#content_ext_view").html(html);
                    $("#content_ext_edit").html('');
                }else{
                    $("#content_ext_edit").html(html);
                    $("#content_ext_view").html('');
                }
                $("#scoreType").hide();
                switch(scoreLevel){
                    // 外出进修、援疆援藏
                    case '976f78c8-1152-4e32-8572-658a1cdb5fa4':
                    case '78a943c6-84e6-45ab-8e1f-81a446d39bea':
                    case '8bf82417-9da7-4925-9324-75fd9a560169':
                        scoreTypeId = 'scoreType1';
                        $(".jx_item").hide();
                        $(".jx_item_1").show();
                        break;
                    // 在职学历（学位）教育
                    case '0988b09a-cbd0-414f-9d6d-d1cabb5e4439':
                        scoreTypeId = 'scoreType2';
                        break;
                    // 发表论文
                    case '0b964e89-d463-4775-9f8e-7daab5167132':
                        scoreTypeId = 'scoreType3';
                        break;
                    // 科研项目
                    case 'a99440b7-29b3-4fee-ad61-2acfe57c05cd':
                        scoreTypeId = 'scoreType5';
                        $("#activityDateDiv").show();
                        break;
                    // 科技成果奖
                    case 'f9ea93aa-3e2b-4511-9d6c-df1ea3e25b03':
                        scoreTypeId = 'scoreType6';
                        $("#activityDateDiv").show();
                        break;
                    // 发明专利
                    case '77efa4d0-8cbf-42ab-8d60-a8635c541bc1':
                    // 标准、技术规范
                    case '7b8eae75-4be2-43a9-8f79-7c120231a5a6':
                        scoreTypeId = 'scoreType7';
                        break;
                    // 出版著作 编译本专业学术著作
                    case 'b6cdcb4f-6792-4f80-ae86-442dddb2287f':
                        scoreTypeId = 'scoreType8';
                        $("#activityDateDiv").show();
                        break;
                    // 赴外省学分-国家级
                    case '67457a63-55a1-43db-ae50-8bc748e15626':
                    // 赴外省学分-省级
                    case '1afdcb1c-4a7d-11f0-97e2-005056a64c01':
                        scoreTypeId = 'scoreType10';
                        // 上传文件提示
                        $("#uploadTips").show();
                        break;
                }
                if(scoreTypeId){
                    $("#"+scoreTypeId).show();
                }
                if(type){
                    $(".scoreDiv").show();
                }
              
                formInit();
             
                if(formId && data){
                    // 根据jx_item事项，显示对应的input
                    let jxItem = data.jx_item;
                    if(jxItem){
                        $(".jx_item_"+jxItem).show();
                        $(".jx_item_0").hide();
                    }
                    if(type == 'view'){
                        // 禁用formId下的所有input和select
                        $("#content_ext_view").find("input,select").prop("disabled", true);
                    }
                    form.val(formId, data);
                    $("#content_edit,#content_view").hide();
                    $("#content_ext_edit,#content_ext_view").show();
                   
                    form.render();
                    layer.open({
                        type: 1,
                        title: '个人录入学分详情',
                        content: type == 'view' ? $('#scoreInfoWindow') : $('#editScore'),
                        area: ($(window).width() < 1100) ? ['90%', '540px'] : ['1000px','540px'],
                        cancel: function(index, layero){ $("#viewFileList").html(""); },
                        done: function(index, layero){
                        }
                    })
                }
            
                form.render();
                dateInit();
                getCmeYearStartEnd();
            })
            .catch(error => console.error('Error loading the HTML file:', error));
        };

        // 加载广东套个人学分表单
        window.loadGdScoreForm = function(){
            //广东只能选择面授
            
            $("#uploadTips").html("提示：请上传jpg,pdf格式");
            $("#uploadTips").show();
            $("#scoreType").show();
        }
        if(cmeStandardKindId == '190c480d-d43c-450b-8472-a6fd00a6729d' && scoreLevel){
            loadZjScoreForm();
            
        } else if(cmeStandardKindId == '289bf0ca-52cb-4b19-b737-9bd200a69ce1'){
            loadGdScoreForm();
        } else{
            $("#scoreType").show();
        }
        form.on('select(jx_item)', function (data) {
            console.log(data);
            // 根据选项联动显示不同的输入框
            let value = data.value;
            // 隐藏所有jx_item，并清空内容
            $(".jx_item").hide();
            $(".jx_item").find("input").val('');
            if(value){
                $(".jx_item_"+value).show();
                $(".jx_item_0").hide();
            }else{
                $(".jx_item_0").show();
            }
            form.render();
        });

        var scoreInit = function () {
            if(!unitName || !completePeriod) return;
            // 计算学分
            var score = completePeriod / unitNum * unitScore;
            if (unitMaxscore > 0 && score > unitMaxscore) {
                score = unitMaxscore;
            }
            let tempScore ;
            // 根据字数计算的学分向下取整
            if (cmeStandardKindId == '73ba18db-33fd-4746-ab41-9beb009f69a1' && unitName.trim() == '字' ) {
                tempScore = Math.floor(score);
            }else{
                tempScore = (1.0*score).toFixed(2);
            }
            $("#score").val(tempScore);
            $(".scoreDiv").show();
            $("#score_zj").val(tempScore);
            if (tool.isEmpty(completePeriod)) {
                completePeriod = '';
                $("#score").val('');
            };
            // 判断学分类型
            // unitName = unitName.slice(0,2);
            if(unitName.trim() == '学时' || unitName.trim() == '小时'){
                if (cmeStandardKindId == '73ba18db-33fd-4746-ab41-9beb009f69a1' && completePeriod > 90 ) {
                    completePeriod = 90;
                }
                $("#period").val(completePeriod);
            }else {
                // 根据配置计算学时
                getConfig("fn_singlescore_period_ratio", getScoreLevel());
                var periodRatio = window['fn_singlescore_period_ratio'];
                let tempPeriod = 0;
                if(periodRatio){
                    tempPeriod = (periodRatio * tempScore).toFixed(2);
                }else{
                    tempPeriod = (6 * tempScore).toFixed(2);
                }
                if (cmeStandardKindId == '73ba18db-33fd-4746-ab41-9beb009f69a1' && tempPeriod > 90 ) {
                    tempPeriod = 90;
                }
                $("#period").val(tempPeriod);
            }
            console.log(completePeriod + '----' + score);
        }
        scoreInit();


        window.setExtData = function(data){
            if(cmeStandardKindId != '190c480d-d43c-450b-8472-a6fd00a6729d' || !scoreTypeId){
                return;
            }
            // 获取<div>id=scoreType表单下的所有字段
            let extData = {};
            let scoreTypeDiv = $("#"+scoreTypeId);
            let scoreTypeFields = scoreTypeDiv.find("input,select");
            for(let i=0;i<scoreTypeFields.length;i++){
                let field = scoreTypeFields[i];
                if(!field.name) continue;
                extData[field.name] = field.value;
            }
            // 授予时间等在扩展区公共块（不在 scoreTypeId 内），一并写入 ext_data
            let $extRoot = $("#content_ext_edit");
            if($extRoot.length){
                let actVal = $extRoot.find("#activityDate").val();
                if(actVal){
                    extData.studyDate = actVal;
                }
            }
            console.log(extData);

            //  默认授分日期
            let studyDate = data.field.studyDate;
            data.field.studyDate = studyDate ? studyDate : new Date();
            let extStudyDate = extData.studyDate;
            data.field.studyDate = extStudyDate ? extStudyDate : studyDate;
            // 设置默认授分单位
            data.field.teachUnitName = window.getUnitName();
            data.field.teachUnit = window.getUnitId();
            let extTeachUnitName = extData.teachUnitName;
            if(extTeachUnitName){
                data.field.teachUnitName = extTeachUnitName;
                data.field.teachUnit = '';
            }
            data.field.scoreType = data.field.scoreType || 1;
            data.field.holdType = data.field.holdType || null;
            data.field.knowledgeId = data.field.knowledgeId || null;
            data.field.isYes = 1; // 忽略是否存在该学分

            var sl = data.field.scoreLevel;
            if(typeof applyZhejiangExtToCommonFields === 'function' && sl){
                applyZhejiangExtToCommonFields(sl, extData, data.field);
            }
            if(data.field.single_proj_name && !data.field.singleProjName){
                data.field.singleProjName = data.field.single_proj_name;
            }
            if(data.field.single_proj_no && !data.field.singleProjNo){
                data.field.singleProjNo = data.field.single_proj_no;
            }
            delete data.field.single_proj_name;
            delete data.field.single_proj_no;

            let jsonExtData = JSON.stringify(extData);
            console.log(jsonExtData);
            data.field.extData = jsonExtData;

            var periodVal = $("#period").val();
            if(periodVal !== undefined && periodVal !== null && periodVal !== ''){
                var pNum = parseFloat(periodVal);
                if(!isNaN(pNum)){
                    data.field.period = pNum;
                }
            }
            var scoreFromMain = $("#score").val();
            var scoreFromZj = $("#score_zj").val();
            var sv = (scoreFromZj !== undefined && scoreFromZj !== null && scoreFromZj !== '') ? scoreFromZj : scoreFromMain;
            if(sv !== undefined && sv !== null && sv !== ''){
                var sc = parseFloat(sv);
                if(!isNaN(sc)){
                    data.field.score = sc;
                }
            }

        }


        // 查看详情
        window.viewScoreDetail = function(formId, data, type){
            scoreLevel = data.scoreLevel;
            let extData = JSON.parse(data.extData);
            console.log(extData);
            console.log(data);
            if(extData){
                extData.scoreId = data.scoreId;
                extData.score = data.score;
                extData.studyDate = data.studyDate;
                loadZjScoreForm(formId, extData, type);
               
            }else{
                form.val(type == 'edit' ? 'edit-score' : 'score-info-form', data);
                $("#content_ext_edit,#content_ext_view").hide();
                $("#content_edit,#content_view").show();
                layer.open({
                    type: 1,
                    title: '个人录入学分详情',
                    content: type == 'edit' ? $('#editScore') : $('#scoreInfoWindow'),
                    area: ($(window).width() < 1100) ? ['90%', '540px'] : ['1000px','540px'],
                    cancel: function(index, layero){ 
                        if(type == 'edit'){
                            // removeFormValue();
                        }else if(type == 'view'){
                            $("#viewFileList").html(""); 
                        }
                    }
                })
            }
            
        }

        var grantName = getParamFromUrl("grantName");
        // 根据授分标准名称grantName，默认选中下拉框
        window.selectByGrantName = function(){
            if(!grantName) return;
            grantName = decodeURIComponent(grantName);
            if(grantName.indexOf('-') == -1){return;}
            // grantName = '2025发表论文（发表当年）-SCI收录期刊'
            grantName = grantName.split('-')[1];

            if(grantName == '市厅级或国家级行业组织设立' || grantName == '市厅级或省级以上行业组织设立'){
                grantName = '市厅级项目或省级以上行业组织设立的课题';
            }
            let selectIds = ['paper_level', 'proj_level', 'reward_level'];
            for(let i=0;i<selectIds.length;i++){
                let select = $("#"+selectIds[i]);
                select.find("option").each(function(){
                    if($(this).text().indexOf(grantName) != -1){
                        $(this).prop("selected", true);
                        select.prop("disabled", true);
                        form.render();
                        return;
                    }
                });
            }
        }
/**
 * 佐证材料提示：
1.进修学习。
单位同意外派审批单、交通佐证、报到通知、进修鉴定表、
2.专项培训。
省级卫生健康行政部门组织的培训班红头文件、培训合格证明
3.在职学历（学位）教育。
单位同意在职学历（学位）教育佐证、成绩合格单、学信网学籍认证报告
4.有组织的继续医学教育实践活动。
医疗卫生单位、行业组织发布的红头通知、日程、照片
5.政府指令性医疗卫生任务
政府要求的援派医疗卫生任务的红头文件、任务结束鉴定表
6、发表论文、综述，
科技查新机构出具的检索报告、文章
7.已批准的科研、教学项目，
公布立项红头文件、申报书
8.获得科技、教学成果奖励，
公布科技、教学成果奖励红头文件
9.授权职务发明专利并完成转化
专利认证证书、成果转化证书
10.公开出版本专业学术专著、教材、科普书籍等
封面、目录

 */
        let scoreLevelTipMap = {
            // 进修学习-"脱产到其他医疗卫生机构、出国进修"
            "0cd9a4f5-dd91-423d-8321-8ca47fa94233": "单位同意外派审批单、交通佐证、报到通知、进修鉴定表、",
            // 专项培训-助理全科医生培训
            "23a8bb5c-74b8-41a0-b177-0455b0a6c8b6": "省级卫生健康行政部门组织的培训班红头文件、培训合格证明",
            // 专项培训-住院医师规范化培训
            "4cf4df6d-8b4f-4508-9d7f-ee8a8d3e0ffe": "省级卫生健康行政部门组织的培训班红头文件、培训合格证明",
            // 专项培训-监测预警后备人才培训等
            "7a0fe405-fa35-49d6-82f6-51db5978ac08": "省级卫生健康行政部门组织的培训班红头文件、培训合格证明",
            // 专项培训-专科医师规范化培训
            "bf5b006f-7d30-4266-8f64-f1bfe208f42a": "省级卫生健康行政部门组织的培训班红头文件、培训合格证明",
            // 专项培训-师承教育
            "d27a9dd8-1fd3-4af0-ac31-646543d4ae55": "省级卫生健康行政部门组织的培训班红头文件、培训合格证明",
            // 专项培训-公共卫生人才培养
            "eea4a256-d56f-4f37-91e9-100f8bd629ad": "省级卫生健康行政部门组织的培训班红头文件、培训合格证明",
            // 在职学历（学位）教育-参加脱产或半脱产学历(学位)教育
            "457727f9-f364-42f7-97df-ba5182873546": "单位同意在职学历（学位）教育佐证、成绩合格单、学信网学籍认证报告",
            // 有组织的继续医学教育实践活动-市级组织的继续医学教育培训班
            "057cd830-0b28-4f2b-9e5b-cf22f5098367": "医疗卫生单位、行业组织发布的红头通知、日程、照片",
            // 有组织的继续医学教育实践活动-"单位组织的其他形式实践锻炼"
            "4a772c7e-67af-4622-a7e7-628e3679f272": "医疗卫生单位、行业组织发布的红头通知、日程、照片",
            // 有组织的继续医学教育实践活动-"单位组织的病例讨论、大查房"
            "55da6452-a7f0-498d-8690-303de51250ba": "医疗卫生单位、行业组织发布的红头通知、日程、照片",
            // 有组织的继续医学教育实践活动-"单位组织的学术研讨活动等"
            "72fffa07-aaad-4f27-8516-bd1361fa66f2": "医疗卫生单位、行业组织发布的红头通知、日程、照片",
            // 有组织的继续医学教育实践活动-"单位组织的继教实操培训班"
            "8e72276b-ced5-4852-956b-67da0ea2c3ef": "医疗卫生单位、行业组织发布的红头通知、日程、照片",
            // 有组织的继续医学教育实践活动-"市级组织专题讲座、学术研讨活动"
            "bd076e7d-23d4-4321-83f0-f4831db4d862": "医疗卫生单位、行业组织发布的红头通知、日程、照片",
            // 有组织的继续医学教育实践活动-""市级组织适宜技术推广培训班""
            "fa4a1489-8553-4b82-af7a-6505da7800cb": "医疗卫生单位、行业组织发布的红头通知、日程、照片",
            // 政府指令性医疗卫生任务-"对中西部欠发达、脱贫地区帮扶"
            "142ac743-13be-4c61-8f05-2b05bdfda7c6": "政府要求的援派医疗卫生任务的红头文件、任务结束鉴定表",
            // 政府指令性医疗卫生任务-""对口支援帮扶基层医疗卫生机构""
            "428834f2-18e6-4488-bd4e-d50973414ff4": "政府要求的援派医疗卫生任务的红头文件、任务结束鉴定表",
            // 政府指令性医疗卫生任务-"""援藏、援疆、援青等援派工作"""
            "83a1d85e-51a9-45e6-83f1-2e1a367d2569": "政府要求的援派医疗卫生任务的红头文件、任务结束鉴定表",
            // "发表论文、综述"
            "8dba35a7-6b12-4128-a076-8ef72036bb3b": "科技查新机构出具的检索报告、文章",
            // "已批准的科研、教学项目"
            "2fd33f34-edad-4c86-9bea-2b0113cfda00": "公布立项红头文件、申报书",
            // ""获得科技、教学成果奖励""
            "75dad497-1541-49b1-9d16-0b4eef687240": "获得科技、教学成果奖励红头文件",
            // "授权职务发明专利完成转化，相应机构批准"
            "ae3ac1a4-3019-4a39-8a48-72623ebb3b24": "专利认证证书、成果转化证书",
            // "公开编译本专业专著教材科普书籍等"
            "cd69aa59-c6f1-4950-9180-657d8b4fac2e": "封面、目录"
        }

        /** 广西套：学分子级 ID → 上传附件材料文字提醒（学分录入材料要求） */
        let guangxiScoreLevelTipMap = {
            // 继教项目-参加外省国家级继续教育项目
            "1682d44c-2cef-11f1-8d9a-005056a64c01": "国家级学分证书：带有（国）字编号学分证。",
            // 进修学习-到其他医疗卫生机构进修
            "1682d532-2cef-11f1-8d9a-005056a64c01": "满3个月：结业证。不满3个月：文件、成绩单、学时、单位证明等（体现时长至少两份）",
            // 进修学习-出国学习
            "1682d5aa-2cef-11f1-8d9a-005056a64c01": "上传官方文件/通知。",
            // 在职学历（学位）教育-参加脱产学历(学位)教育
            "1682d618-2cef-11f1-8d9a-005056a64c01": "毕业证、学籍、学生证、成绩单、合同、通知书、请假单等（至少两份）。",
            // 在职学历（学位）教育-参加半脱产学历(学位)教育
            "1682d690-2cef-11f1-8d9a-005056a64c01": "毕业证、学籍、学生证、成绩单、合同、通知书、请假单等（至少两份）。",
            // 师承教育-师徒相传继承中医知识和技能
            "1682d6fe-2cef-11f1-8d9a-005056a64c01": "通知、名单、文件、学习记录、成绩等（仅自治区中管局师承教育）",
            // 有组织的继续医学教育实践活动-单位(科室)组织的继续医学教育实践活动
            "1682d76c-2cef-11f1-8d9a-005056a64c01": "会议通知、日程、签到表、会议照片等。",
            // 政府指令性医疗卫生任务-对口支援帮扶基层医疗卫生机构
            "1682d8d4-2cef-11f1-8d9a-005056a64c01": "官方文件/通知、接收方鉴定、荣誉证书。",
            // 政府指令性医疗卫生任务-对口支援帮扶发展薄弱地区
            "1682d942-2cef-11f1-8d9a-005056a64c01": "官方文件/通知、接收方鉴定、荣誉证书。",
            // 政府指令性医疗卫生任务-援外等援派工作
            "1682d9ba-2cef-11f1-8d9a-005056a64c01": "官方文件/通知、接收方鉴定、荣誉证书。",
            // 有计划的自学及其他-发表论文、综述
            "1682da28-2cef-11f1-8d9a-005056a64c01": "上传封面、目录、完整正文页；国外刊物需全文。",
            // 有计划的自学及其他-科研立项
            "1682daa0-2cef-11f1-8d9a-005056a64c01": "当年度获批项目书/合同/通知，含名字，水印页码完整。",
            // 有计划的自学及其他-科技奖励（科研成果）
            "1682db18-2cef-11f1-8d9a-005056a64c01": "当年度获科技奖证书或文件，须含授分人姓名。",
            // 有计划的自学及其他-专利授权
            "1682db86-2cef-11f1-8d9a-005056a64c01": "当年度获批国家专利证书。",
            // 有计划的自学及其他-发布标准
            "1682dbf4-2cef-11f1-8d9a-005056a64c01": "当年度获批标准正式文件，须含起草人姓名。",
            // 有计划的自学及其他-出版著作
            "1682dc62-2cef-11f1-8d9a-005056a64c01": "当年度出版物：封面、目录、完整正文。",
            // 有计划的自学及其他-发表科普或专业知识文章
            "1682dcd0-2cef-11f1-8d9a-005056a64c01": "需上传封面、目录、完整正文页。",
            // 有计划的自学及其他-录制医学科普或专业知识视频
            "1682dd48-2cef-11f1-8d9a-005056a64c01": "科普全文+官方公众号/正规宣传视频截图。",
            // 有计划的自学及其他-参与国家或自治区级教学活动
            "1682ddb6-2cef-11f1-8d9a-005056a64c01": "考务佐证：通知、名单、签到、日程、考勤、照片。",
            // 有计划的自学及其他-开展义诊或健康宣教
            "1682de24-2cef-11f1-8d9a-005056a64c01": "义诊佐证：文件、通知、签到、安排、照片、新闻稿。"
        };

        /**
         * 按套别与学分子级更新上传附件区材料提示；仅海南/广西套处理，其它套别不改动既有提示。
         */
        window.uploadTipsInit = function () {
            var scoreLevel = window.getScoreLevel();
            var tip = '';
            if (cmeStandardKindId === '6eec6713-670a-43cc-ad4d-9bd700a92928') {
                tip = scoreLevelTipMap[scoreLevel] || '';
            } else if (cmeStandardKindId === '4a6d91fb-8ba4-4560-a801-9c6f00e6d999') {
                tip = guangxiScoreLevelTipMap[scoreLevel] || '';
            } else {
                return;
            }
            if (tip) {
                $("#uploadTips").show().html("佐证材料提示：" + tip);
            } else {
                $("#uploadTips").hide();
            }
        };
        uploadTipsInit();

        window.formInit = function(){
            scoreInit();
            selectByGrantName();
            // 完成转化或通过批准时间
            layPatentTime =  laydate.render({
                elem: '#patent_time',
                type: 'date',
                trigger: 'click',
                btns: ['now', 'confirm']
            })
            // 任务时间段
            laydate.render({
                elem: '#task_time'
                ,type: 'date'
                ,range: '~'
                ,format: 'yyyy-M-d'
              });
            layPaperTime = laydate.render({
                elem: '#paper_no',
                type: 'date',
                trigger: 'click',
                btns: ['now', 'confirm']
            })
        }

        if(cmeStandardKindId == '190c480d-d43c-450b-8472-a6fd00a6729d'){
            $("#chooseFileBtn").html("佐证材料");
            // 查找class="layui-table-box"下data-field="photo"的<th>下的<span>,修改内容为佐证材料
            $(".layui-form .layui-table-box").find("[data-field='photo']").find("span").html("佐证材料");
            
            setTimeout(function(){
                $(".layui-form .layui-table-box").find("[data-field='photo']").find("span").html("佐证材料");
            },800);
        }       


         // Esc关闭弹窗
         window.onkeyup = function (ev) {
            var key = ev.keyCode || ev.which;
            if (key == 27) {
                layer.close(layer.index);
                console.log('layer.index = ' + layer.index)
                // $("#viewFileList").html("");
            }
        }
    });
