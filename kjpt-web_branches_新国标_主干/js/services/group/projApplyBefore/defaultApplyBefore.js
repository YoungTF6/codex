layui.config({
    base: '/js/layui/ext/'
}).extend({
    treeSelect: 'treeSelect',
    opTable: '/opTable/opTable',
    selectInput: '/selectInput/selectInput'
});
// 全局配置及引入相关的模块
layui.use(['table', 'form', 'laydate', 'element', 'upload', 'opTable', 'treeSelect', 'tool', 'selectInput'], function () {
    var table = layui.table
        , form = layui.form
        , layer = layui.layer
        , laydate = layui.laydate
        , element = layui.element //Tab的切换功能
        , upload = layui.upload
        , util = layui.util
        , treeSelect = layui.treeSelect
        , tool = layui.tool
        , opTable = null
        , selectInput = layui.selectInput
        , infoIndex = null
        , uploadInst = null
        ;
    const HAINAN = "6eec6713-670a-43cc-ad4d-9bd700a92928";
    let tempDeptId = (userType == 13) ? myDeptId : "";
    let tempUnitId = (userType == 12) ? myUnitId : "";

    window.getUnitId = function () {
        return localStorage.getItem("unit-id");
    }
    window.getCmeStandardKindId = function () {
        return localStorage.getItem("standardkind-id");
    }
    var standardkindId = localStorage.getItem("standardkind-id");
    var downId = "";
    var projId = ""; // 非国家级
    // var groupProjTeachId = '';
    var groupProjTeachId = guid();

    let isGuangdongTeacherCard = standardkindId == '289bf0ca-52cb-4b19-b737-9bd200a69ce1';
    let trimTeacherVal = function (value) {
        return value == null ? "" : String(value).trim();
    }
    let hasTeacherIdentifier = function () {
        let teachNo = trimTeacherVal($("#teachNo").val());
        let personNo = trimTeacherVal($("#personNo").val());
        if (isGuangdongTeacherCard) {
            return !!(teachNo || personNo);
        }
        return !!teachNo;
    }
    let toggleTeacherNoStatus = function () {
        let teachNo = trimTeacherVal($("#teachNo").val());
        let personNo = trimTeacherVal($("#personNo").val());
        
        if (personNo) {
            $("#teachNo").prop("disabled", true).attr("disabled", "disabled").attr("placeholder", "");
        } else {
            $("#teachNo").prop("disabled", false).removeAttr("disabled").attr("placeholder", "请输入身份证号");
        }
        
        if (teachNo) {
            $("#personNo").prop("disabled", true).attr("disabled", "disabled").attr("placeholder", "");
        } else {
            $("#personNo").prop("disabled", false).removeAttr("disabled").attr("placeholder", "请输入医通卡号");
        }
    }
    let initTeacherCardLayout = function () {
        if (isGuangdongTeacherCard) {
            $("#personNoBlock").show().insertBefore("#teachNoBlock");
            $("[data-id='spanOnCert']").hide();
        } else {
            $("#personNoBlock").hide();
            // 非广东：级联补齐每行3列（一次性）
            if (!$("#teacherRowTwo #specBlock").length) {
                $("#specBlock").appendTo("#teacherRowTwo");
                $("#dutyBlock").appendTo("#teacherRowThree");
                $("#remarkBlock").appendTo("#teacherRowFour");
            }
        }
        toggleTeacherNoStatus();
    }

    $(function() {
        $("#teachNo").on("input", function () {
            if (trimTeacherVal($(this).val()) && trimTeacherVal($("#personNo").val())) {
                $(this).val('');
                layer.msg("已填写医通卡号，不能再填写证件号码");
            }
            toggleTeacherNoStatus();
        }).on("blur", function () {
            teachNoBlur(this);
        });
        $("#personNo").on("input", function () {
            if (trimTeacherVal($(this).val()) && trimTeacherVal($("#teachNo").val())) {
                $(this).val('');
                layer.msg("已填写证件号码，不能再填写医通卡号");
            }
            toggleTeacherNoStatus();
        }).on("blur", function () {
            personNoBlur(this);
        });
        layui.form.on('select(needScore)', function (data) {
            if (isGuangdongTeacherCard) {
                $("[data-id='spanOnCert']").hide();
            }
            toggleTeacherNoStatus();
            
            let needScore = data.value !== "false";
            initCertVerifyInfo(needScore);
            if (needScore && hasTeacherIdentifier()) {
                matchTeacherPerson({
                    certId: trimTeacherVal($("#teachNo").val()),
                    personNo: trimTeacherVal($("#personNo").val()),
                    needWarn: true
                });
            }
        });
    });

    // 课程开始结束时间状态, 用于上报校验
    var teachDateStatus = "0";
    // 教师信息弹窗index
    var teacherWindowIndex, addTeachIndex;
    var unitUserType =  localStorage.getItem('unit-user-type');
    var nowFlowChainState;
    var setTemplate, maxWatchNum, defaultholdForm = '7f3d28dd-1a63-4bbc-8b3d-d5ca8312d707'
        , qing_hai_tao_id = '6427ddba-c02f-4229-bd73-49fc1c5d21f6'
        , hu_bei_tao_id = '73ba18db-33fd-4746-ab41-9beb009f69a1'
        , he_nan_tao_id = 'a6280900-a9c2-11ec-84d6-fa163e9b64fb'
        , gan_su_tao_id = '7068a5c0-2cd3-471a-90b9-9bf100aec95a'
        , guang_xi_tao_id = '4a6d91fb-8ba4-4560-a801-9c6f00e6d999'
        , ji_lin_tao_id = 'acd09b62-333b-4aee-934f-9ec500a9d46d'
        , isLoadApplProj = false
        , isApplPaper = false
        , isTeachDateEqualDowndate = false
        , isHoldeFormPlus = false
        , personLimitCeiling = 0
        , isCheckTitleTeachingMethod
        , projectPublishId
        , downStartDate
        , downEndDate
        , downloadUrl = ''
        , applScore
        , applTeachObject
        , unitId = localStorage.getItem("unit-id");
    let configName1 = "fun_group_apply_file_upload";
    let configMap = {};
    let fileUpObj = [{ "fileName": "", "require": false, "fileType": 1 }];
    let applyApiUrl = huayi_projectscore_url + 'cmeGroupProjCycleApplication/';

    // 7acab84c-e870-4a4d-90ea-9b2f01271376	初级职称
    // da42823c-796c-4377-a616-9b2f01271376	中级职称
    // 6351aa8b-bba0-4805-99ca-9b2f01271376	副高级职称
    // 3d5f8e06-1274-454c-9c55-9b2f01271376	正高级职称
    let titleForTheory = ['3d5f8e06-1274-454c-9c55-9b2f01271376', '6351aa8b-bba0-4805-99ca-9b2f01271376', 'da42823c-796c-4377-a616-9b2f01271376']
        , titleForExperiment = ['3d5f8e06-1274-454c-9c55-9b2f01271376', '6351aa8b-bba0-4805-99ca-9b2f01271376', 'da42823c-796c-4377-a616-9b2f01271376'];

    // 湖北套修改表头文案
    if (standardkindId == hu_bei_tao_id) {
        // $('#projectInfo').text('项目公布信息');
        $('#teachInfo').text('课程及教师信息');
        $('#filesTitle').text('会议通知、会议日程及异地备案表').removeClass("title").addClass("title2");
    } 

    if (standardkindId == guang_xi_tao_id) {
        $("#periodLabel").text("时长");
    }
    //公共ajax
    let commonAjax = function (type = "get", url, data, failFun, successFun) {
        $.ajax({
            async: false,
            type: type,
            url: url,
            data: data,
            success: function (res) {
                successFun(res);
            },
            error: function (res) {
                failFun();
            }
        });
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
    var nowProjectId = getParamFromUrl("projectId");
    var scoreLevelId = getParamFromUrl("scoreLevel");
    var cmeYear = getParamFromUrl("cmeYear");

    if (nowProjectId != null && nowProjectId != "" && nowProjectId != undefined) {
        projId = nowProjectId;
    }
        /* 获取配置 */
    window.getConfig = function (config_name, scoreLevel) {
        $.ajax({
            async: false,
            type: 'post',
            url: huayi_sjwh_url + 'cmeCommonConfig/getConfigByUnitFromRedis',
            data: {
                unitId: unitId,
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
    
        // 根据角色和学分级别配置，是否可修改项目信息
    if (localStorage.getItem('unit-user-type') == 2) {
        window.getConfig('fn_city_update_apply_before', scoreLevelId);
    }

    laydate.render({
        elem: '#startDate',
        type: 'datetime'
    });
    laydate.render({
        elem: '#endDate',
        type: 'datetime'
    });

    let viewFlowProgress = function (data) {
        layer.open({
            type: 2,
            title: '',
            content: '../projectProgress/projApplyBeforeHoldProgress.html?downId=' + data.downId + '&applyApiUrl=' + applyApiUrl + 'getApprovalStep',
            area: ['560px', '380px'],
        })
    }
    let viewFlowProgressLog = function (data) {
        layer.open({
            type: 2,
            title: '',
            content: '../projectProgress/projApplyBeforeHoldProgressLog.html?downId=' + data.downId + '&applyApiUrl=' + applyApiUrl + 'getApprovalStep',
            area: ['560px', '500px'],
        })
    }

    // 表格相关操作
    // 表格配置
    window.loaderTable = function () {
        table.render({
            elem: '#applyBeforeHold',
            async: false,
            url: applyApiUrl + 'getApprovalApplListForProj',
            // data: tempData,
            title: '项目批次',
            defaultToolbar: [],
            where: {
                projId: projId,
                userType: localStorage.getItem('user-type'),
                unitUserType: localStorage.getItem('unit-user-type'),
                // unitId: localStorage.getItem('unit-id'),
                unitId: tempUnitId,
                deptId: tempDeptId
            },
            cols: [[
                // { field: 'row', type: "numbers", width: 50, fixed: 'left', title: '序号' },
                { align: 'center', minWidth: 200, toolbar: '#barDemo', title: '操作' },
                { field: 'status', title: '审批步骤', align: 'center', toolbar: '#viewBar', width: 120 },
                {
                    field: 'approvalContent', title: '审核意见', sort: true, align: "center", minWidth: 150,
                    templet: function (data) {
                        let textVal = '';
                        if (data.checkState == 1 || data.checkState == 2) {
                            if (data.checkMemo) {
                                textVal = data.checkMemo;
                            } else if (data.approvalContent) {
                                textVal = data.approvalContent;
                            }
                        }
                        return textVal;
                    }
                },
                { field: 'downId', title: '主键', hide: true },
                // {
                //     field: 'batch', title: '举办批次', sort: true, align: "center",
                //     templet: function (data) {
                //         unitUserType = data.unitUserType;
                //         return "第" + data.batch + "批次";
                //     }
                // },
                // { field: 'projNo', title: '项目编号', sort: true, align: "center", minWidth: 120 },
                { field: 'projName', title: '活动名称', sort: true, align: "center"  },
                { field: 'startDt', title: '开始日期', sort: true, align: "center" },
                { field: 'endDt', title: '结束日期', sort: true, align: "center" },
                {
                    field: 'status', title: '审核状态', sort: true, align: 'center',
                    templet: function (data) {
                        if (!data.hasOwnProperty("checkState")) return "未申请";
                        let state = data.checkState;
                        if (tool.isEmpty(state)) return "未申请";
                        if (state == 0) return "未审核";
                        if (state == 1) return "已退回";
                        if (state == 2) return "审批不通过";
                        if (state == 3) return "审批通过";
                        if (state == 4) return "审核中";
                        return "未申请";
                    }
                },
            ]],
            toolbar: '#bar',
            cellMinWidth: 100,
            id: "applyBeforeHold",
            // height: 'full-167',
            height: 'full-60',
            parseData: function (res) {
                if (res.status != 200) {
                    layer.msg(res.msg)
                    return;
                }
                //如果
                if (ableOperateLastYearData(cmeYear) == false) {
                    res.data.forEach(d => { d.canApproval = 0 });
                }
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
                applProjDetail(res.data[0].projectPublishId);
                bindViewFlowBtn();
                getTitleTeachingMethodConfig();
            },
        });
    };


    window.initTable = function (toolbarId, isHidenTool) {
        // var projId = getQueryString("projId");

        opTable = layui.opTable.render({
            elem: '.cmeProjPosDownList'
            , id: 'cmeProjPosDownList'
            , url: huayi_projectscore_url + 'cmeGroupprojTeach'
            , where: {
                downId: downId
            }
            , defaultToolbar: []
            , cols: [[
                { title: '操作', toolbar: '#cmeProjTeachRowBar', width: 250, align: "center", hide: isHidenTool },
                { field: 'startDate', title: '课程开始时间', align: "center", sort: true, hide: isTeachDateEqualDowndate },
                { field: 'endDate', title: '课程结束时间', align: "center", sort: true, hide: isTeachDateEqualDowndate },
                { field: 'teachSubject', title: '讲授题目', align: "center", sort: true, cellMinWidth: 180 },
                { field: 'period', title: standardkindId == guang_xi_tao_id ? '时长' : '学时', align: "center", width: 60 },
                // {
                //     field: 'teachingMethod', title: '教学方法', align: "center"
                //     , templet: function (data) {
                //         if (data.teachingMethod == '面授') {
                //             return '理论';
                //         }
                //         if (!data.teachingMethod) {
                //             return '';
                //         }
                //         return data.teachingMethod;
                //     }
                // }
            ]],
            toolbar: toolbarId,
            cellMinWidth: 170,
            // height: 'full-450',
            page: false,
            parseData: function (res) {
                // 保存课程开始结束时间, 用于上报校验
                if (res.data.length < 1) {
                    teachDateStatus = "1";
                } else if (res.data[0].startDate == null || res.data[0].startDate == ''
                    || res.data[0].endDate == null || res.data[0].endDate == '') {
                    teachDateStatus = "2";
                } else {
                    teachDateStatus = "0";
                }
                return {
                    'code': res.status === 200 ? 0 : res.status,  // 解析接口状态
                    'msg': res.msg,                          // 解析提示文本
                    'count': res.data.length,                // 解析数据长度
                    'data': res.data                    // 解析数据列表
                }
            }, done: function () {
                opTable.openAll();
            }, onOpen: function (itemData, itemIndex, dom, childTable) {
                console.log("onOpen", '行数据：', itemData, "行下标：" + itemIndex, "行dom元素", dom, "子表实例：", childTable)
                //保存展开行的数据
                openRoWData = itemData;
                //监听子表的行工具栏
                table.on('tool(' + childTable.config.id + ')', function (obj) {
                    var data = obj.data;
                    if (obj.event === 'addCourse') {
                        alert(JSON.stringify(obj.data));
                    } else if (obj.event === 'editTeacher') {
                        form.val('add-teacher', obj.data);
                        specTreeSelect.checkNode('specSelect', obj.data.dept);

                        if (obj.data.titleName != null && obj.data.titleName != undefined && obj.data.titleName != "") {
                            $("#text_title_name").val(obj.data.titleName);
                        }
                        initCertVerifyInfo(obj.data.needScore !== false && obj.data.needScore !== "false");
            $("#needScore").val(String(!(obj.data.needScore === false || obj.data.needScore === "false")));
                        form.render('select');
                        initTeacherCardLayout();
                        teacherWindowIndex = layer.open({
                            type: 1,
                            title: '修改教师',
                            content: $('#addTeacher'),
                            skin: '',
                            area: ['90%', 'auto'],
                        })
                    } else if (obj.event === 'delTeacher') {
                        layer.confirm('确认删除', { icon: 3, title: '提示' }, function () {
                            $.ajax({
                                type: 'get',
                                url: huayi_projectscore_url + 'cmeGroupprojTeacher/deleted',
                                data: {
                                    groupProjTeacherId: obj.data.groupProjTeacherId
                                },
                                contentType: 'application/json;charset=UTF-8',
                                dataType: 'json',
                                success: function (res) {
                                    if (res.status === 200) {
                                        layer.msg("删除成功");
                                        table.reload('cmeProjPosDownList');
                                    }
                                }
                            });
                        })
                    }
                });
            }
            , openTable: function (itemData) {
                var groupProjTeachId = itemData.groupProjTeachId;
                return {
                    elem: '#cmeCmeProjTeach_' + itemData.LAY_INDEX
                    , id: 'cmeCmeProjTeach_' + itemData.LAY_INDEX
                    , url: huayi_projectscore_url + 'cmeGroupprojTeacher/selectAllTeachers'
                    , page: false
                    , openVisible: false
                    , cellMinWidth: 100
                    , where: {
                        projTeachId: groupProjTeachId
                    }
                    //授课教师,授课教师证件号,性别,出生日期,最高学历,专业,职称,是否为项目负责人,职务,所在单位,联系方式,备注
                    , cols: [[
                        { title: '操作', toolbar: '#cmeProjTeacherRowBar', width: "120", align: "center", hide: isHidenTool },
                        { field: 'groupProjTeacherId', title: '主键', hide: true },
                        { field: 'groupProjTeachId', title: '课程id', hide: true },
                        { field: 'teacherName', title: '授课教师', align: "center" },
                        {
                            field: 'teachNo', title: '证件号码', align: "center", width: 180
                        },
                        {
                            field: 'needScore', title: '是否主讲人授分', align: "center", width: 150,
                            templet: function (data) {
                                return (data.needScore === true || data.needScore === "true") ? "是" : "否";
                            }
                        },
                        {
                            field: 'sex', title: '性别', align: "center",
                            templet: function (data) {
                                let sexText = '';
                                if (data.sex == 1) {
                                    sexText = "男";
                                } else if (data.sex == 0) {
                                    sexText = "女";
                                }
                                return sexText;
                            }
                        },
                        // { field: 'birthday', title: '出生日期', width: "120", align: "center" },
                        { field: 'educationName', title: '最高学历', align: "center", hide: standardkindId == hu_bei_tao_id },
                        { field: 'personSpecName', title: '专业', align: "center" },
                        { field: 'titleName', title: '职称', align: "center" },
                        {
                            field: 'ifProjManager', title: '是否为项目负责人', align: "center", width: 150,
                            templet: function (data) {
                                let ifProjManagerText = '否';
                                if (data.ifProjManager == 1) {
                                    ifProjManagerText = "是";
                                }
                                return ifProjManagerText;
                            }
                        },
                        { field: 'dutyName', title: '职务', align: "center" },
                        { field: 'unitName', title: '所在单位', align: "center" },
                        { field: 'telephone', title: '联系方式', align: "center", width: 120 },
                        { field: 'remark', title: '备注', align: "center" }
                    ]]
                    , parseData: function (res) {
                        return {
                            'code': res.status === 200 ? 0 : res.status,  // 解析接口状态
                            'msg': res.msg,                          // 解析提示文本
                            'count': res.data.length,                // 解析数据长度
                            'data': res.data                    // 解析数据列表
                        }
                    }

                }
            }
        })
    }

    //给按钮增加上传功能
    window.renderUpdateTeachBtn = function () {
        let url = applyApiUrl + 'uploadTeach';
        //如果已经render,不能再次render,否则第二次上传不起效
        if (!uploadInst) {
            //上传文件
            uploadInst = upload.render({
                elem: '#btnUploadTeach',
                url: url,
                data: {
                    //此处不能直接获取 $("#hdnDownId").val(); 如果直接获取，调试发现一旦render,这里的值不会发生变化；
                    downId: function () {
                        return $("#hdnDownId").val();
                    },
                    projId: projId,
                    cmeStandardKindId: window.getCmeStandardKindId()
                },
                exts: 'xls|xlsx',
                size: 10 * 1024,//大小小于10M
                accept: 'file',
                choose: function (obj) {
                    //layer.close(infoIndex);
                    loading = layer.msg('加载中', { icon: 16, shade: 0.3, time: 0 });
                },
                done: function (res) {
                    layer.close(loading);
                    if (res.success == true) {
                        layer.msg("上传成功");
                        table.reload('cmeProjPosDownList');
                    } else {
                        layer.alert(res.msg);
                    }
                    layer.close(infoIndex);
                }
            });
        }
    }

    $("#btnInfoConfirm").click(function () {
        layer.close(infoIndex);
    });

    // 监听头部新增按钮
    table.on('toolbar(cmeProjPosDownList)', function (obj) {
        document.getElementById("form-addTeach").reset();
        if (obj.event == "addTeach") {
            // 湖北隐藏课程时间, 默认取批次时间
            if (isTeachDateEqualDowndate) {
                $('#teachDateDiv').css("display", "none");
                laydate.render({
                    elem: '#startDate',
                    type: 'datetime',
                    value: downStartDate
                });
                laydate.render({
                    elem: '#endDate',
                    type: 'datetime',
                    value: downEndDate
                });
            } else {
                $('#teachDateDiv').css("display", "block");
            }

            addTeachIndex = layer.open({
                type: 1,
                title: '新增课程',
                content: $('#addTeach'),
                skin: '',
                area: ['710px', '80%'],
            });
        }
        if (obj.event == "uploadTeach") {
            //判断周期下是否存在课程
            //如果存在，弹窗
            //如果不存在，直接导入
            let url = huayi_projectscore_url + "/cmeGroupprojTeach";
            commonAjax("get", url, { downId: $("#hdnDownId").val() },
                function () {
                    layer.msg("系统报错，请联系管理员");
                }, function (res) {
                    if (res.success) {
                        if (res.data.length == 0) {
                            $("#btnUploadTeach").click();
                        } else {
                            infoIndex = layer.open({
                                type: 1,
                                content: $("#uploadInfo")
                            });
                        }
                    } else {
                        layer.msg("系统报错，请联系管理员");
                    }
                });
        }
        if (obj.event == "downloadExcel") {
            //下载模板
            let downloadUrl = "/file/课程及教师信息导入模板.xlsx";
            if (isTeachDateEqualDowndate) {
                downloadUrl = "/file/hubei/课程及教师信息导入模板.xlsx";
            }
            var iframe = document.createElement("iframe");
            iframe.src = downloadUrl;
            iframe.style.display = "none";
            document.body.appendChild(iframe);
        }

    });

    // select下拉框选中触发事件
    form.on("select(holdForm)", function (data) {
        if (standardkindId == qing_hai_tao_id
            && data.value == defaultholdForm) {
            $('#setTemplateDiv').css("display", "block");
        } else {
            $('#setTemplateDiv, #maxWatchNumBlock').css("display", "none");
        }
    });
    // 监听行内按钮
    table.on('tool(applyBeforeHold)', function (obj) {
        var datas = obj.data;
        console.log(datas)
        downId = obj.data.downId;
        obj.event === "viewProgress" && viewFlowProgress(datas);
        obj.event === "viewProgressLog" && viewFlowProgressLog(datas);

        // 河南套显示“举办地点”
        if (standardkindId == he_nan_tao_id) {
            $('#holdPlaceBlock').css("display", "block");
        } else {
            $('#holdPlaceBlock').css("display", "none");
        }
        // 浙江套显示“活动内容”，并把 score_type 翻译为名称
        if (standardkindId == zhe_jiang_tao_id) {
            $('#scoreTypeNameBlock').css("display", "block");
            var _scoreTypeMap = {1: '专业课', 2: '选修课', 3: '公需课'};
            datas.scoreTypeName = _scoreTypeMap[Number(datas.scoreType)] || '';
        } else {
            $('#scoreTypeNameBlock').css("display", "none");
        }

        projectPublishId = datas.projectPublishId;
        getPolyvSetById();
        datas.maxWatchNum = maxWatchNum;
        if (!datas.teachObject) {
            datas.teachObject = applTeachObject;
        }
        if (setTemplate) {
            datas.setTemplate = setTemplate;
        }
        // 青海直播, 举办形式可修改且必选
        if (standardkindId == qing_hai_tao_id
            && datas.holdForm == defaultholdForm) {
            // 举办形式必选
            $('#holdForm').attr("lay-verify", "required");
            $('#setTemplateDiv').css("display", "block");
        } else {
            $('#setTemplateDiv, #maxWatchNumBlock').css("display", "none");
        }
        // 判断当前时间是否在举办周期内
        var endDate = datas.endDt;
        if(endDate.length == 10){
            endDate = endDate + ' 00:00:00';
        }
        var startDate = datas.startDt;
        if(startDate.length == 10 ){ 
            startDate = startDate + ' 00:00:00';
        }
        downStartDate = startDate;
        downEndDate = endDate;
        var downCurDate = new Date();

        // 若批次拟授分人数为空，则取项目拟授分人数limitPerson
        if (!datas.limitPerson) {
            datas.limitPerson = datas.limitPersonProj;
        }
        
        if (obj.event === 'apply' || obj.event === 'applyAgain' || obj.event === 'update') {
            
            // 判断该项目是否设置了试题
            if (isApplPaper && !getPaperInfo(datas.projId)) {
                layer.msg('请维护试卷后，再进行举办前申请');
                return false;
            }
            $('#submitAndResetApply').css("display", "inline-block");
            $('#submitAndResetApproval').css("display", "none");
            form.val('add-filter', datas);
            // 可编辑项目信息
            $("#holdForm,#projManager,#projManagerTelephone,#holdPlace").removeClass("layui-disabled").removeAttr("disabled", "none");
            // 青海直播, 举办形式可修改
            if (standardkindId == qing_hai_tao_id) {
                $("#emcee,#teachObject,#mainContent").removeClass("layui-disabled").removeAttr("disabled", "none");
                $('#limitPerson').addClass("layui-disabled").attr("disabled", "true");
                $("#setTemplate").removeClass("layui-disabled").removeAttr("disabled", "none");
            } else {
                $('#setTemplate,#maxWatchNum').addClass("layui-disabled").attr("disabled", "true");
            }

            // 可更新字段 
            let updateFields = window['fn_groupapply_update_field'] ? window['fn_groupapply_update_field'].split(',') : [];
            updateFields.forEach(field => {
                $(`#${field}`).removeClass("layui-disabled").removeAttr("disabled");
            });

            commonAjax("post", applyApiUrl + 'getFilesByDownId', { downId: downId }, function () { },
                function (res) { createTabPage(res.data, 1) });

            layer.open({
                type: 1,
                title: '申请',
                content: $('#add-applyBeforeHold'),
                skin: '',
                area: ['100%', '100%'],
                success: function (layero, index) {
                    form.render();
                    $("#hdnDownId").val(downId);
                    window.renderUpdateTeachBtn();
                },
                cancel: function () {
                    form.render();
                    table.reload('applyBeforeHold');
                }
            });
            form.render();
            // 加载课程列表
            initTable('#addTeachBar', false);
            // $('#addTeachBar').css("display", "inline-block");
        } else if (obj.event === 'detail') {
            // 禁用所有表单
            $('input, select, textarea').addClass("layui-disabled").attr("disabled", "true");
            $('#submitAndResetApply,#submitAndResetApproval').css("display", "none");
            // 禁用操作按钮
            $('#barDemo,#addTeachBar').css("display", "none");
            // 禁用可编辑项目信息
            $("#holdForm,#setTemplate,#maxWatchNum,#projManager,#projManagerTelephone,#holdPlace,#limitPerson,#score,#periodProj,#holdDay")
                .addClass("layui-disabled").attr("disabled", "true");

            // 附件渲染
            // var fileUrls = obj.data.fileUrls;
            // var fileUrlArr, fileNameArr;
            // if (fileUrls != undefined || fileUrls != null) {
            //     fileUrls = fileUrls.substring(0, fileUrls.length - 1)
            //     fileUrlArr = fileUrls.split('|');
            // }
            // createImageTab(datas.fileUrls, datas.fileNames);
            commonAjax("post", applyApiUrl + 'getFilesByDownId', { downId: downId }, function () { },
                function (res) { createTabPage(res.data, 0) });

            form.val('add-filter', datas);
            $(".js-upload-btn-box").addClass("js-hidden");
            $(".remove-image").addClass("js-hidden");

            layer.open({
                type: 1,
                title: '查看',
                content: $('#add-applyBeforeHold'),
                skin: '',
                area: ['100%', '100%'],
            })
            // 加载课程列表
            initTable('', true);

        } else if (obj.event === 'recall') {
            layer.confirm('确认撤回', { icon: 3, title: '提示' }, function () {
                $.ajax({
                    type: 'post',
                    url: applyApiUrl + 'back',
                    data: {
                        approvalId: downId
                    },
                    success: function (res) {
                        if (res.status === 200) {
                            layer.close(layer.index);
                            layer.msg("撤回成功");
                            parent.onlyRefreshTable();
                            table.reload('applyBeforeHold');
                            // parent.location.reload();
                        }
                    }
                });
            })
        } else if (obj.event === 'report') {
            // if (downStartDate > downCurDate || downEndDate < downCurDate) {
            //     layer.alert("不在举办时间范围内");
            //     return;
            // }
            let canApply = judgeAndApply(downId);
            if (!canApply) {
                return;
            }
            if (isTeachDateEqualDowndate) {
                // 更新课程时间
                updateTeachDate();
                if (!datas.projManager) {
                    layer.msg('请填写活动负责人');
                    return false;
                }
                if (!datas.projManagerTelephone) {
                    layer.msg('请填写活动负责人联系电话');
                    return false;
                }
            }
            canApply = teachDateApply(downId);
            if (!isTeachDateEqualDowndate && !canApply && standardkindId != zhe_jiang_tao_id) { layer.msg('需要填写课程开始、结束时间'); return false; }
            canApply = teacherApply(downId);
            if (!canApply) { layer.msg('每个课程下面至少要维护一个授课教师'); return false; }
            layer.confirm('确认上报', { icon: 3, title: '提示' }, function () {
                $.ajax({
                    type: 'get',
                    url: applyApiUrl + 'report/' + obj.data.keyId,
                    data: {
                        deptId: (userType == 13) ? userName : null
                    },
                    success: function (res) {
                        if (res.status === 200) {
                            layer.close(layer.index);
                            layer.msg("上报成功");
                            parent.onlyRefreshTable();
                            table.reload('applyBeforeHold');
                            
                            // parent.location.reload();
                        } else if (res.status === 500) {
                            // layer.close(parent.layer.index);
                            layer.msg(res.msg);
                        } else if (res.status === 10006) {
                            layer.close(layer.index);
                            // parent.layer.close(parent.layer.index);
                            layer.msg(res.msg);
                        }
                    }
                });
            })
        } else if (obj.event === 'approval') {
            nowFlowChainState = datas["flowChainState"];

            // createImageTab(datas.fileUrls, datas.fileNames);
            commonAjax("post", applyApiUrl + 'getFilesByDownId', { downId: downId }, function () { },
                function (res) { createTabPage(res.data, 0) });
            // 加载课程列表
            initTable('', true);
            // 禁用可编辑项目信息
            $("#holdForm,#setTemplate,#maxWatchNum,#projManager,#projManagerTelephone,#holdPlace,#limitPerson,#score,#periodProj,#holdDay")
                .addClass("layui-disabled").attr("disabled", "true");
            $('#submitAndResetApply').css("display", "none");
            $('#submitAndResetApproval').css("display", "inline-block");
            form.val('add-filter', datas);
            $(".js-upload-btn-box").addClass("js-hidden");
            $(".remove-image").addClass("js-hidden");
            layer.open({
                type: 1,
                title: '审核',
                content: $('#add-applyBeforeHold'),
                skin: '',
                area: ['100%', '100%'],
            })
        } else if (obj.event === 'download') {
            // layer.confirm('确认导出', { icon: 3, title: '提示' }, function () {
            layer.msg("正在导出");
            let visit = applyApiUrl + 'exportBeianPdf';
            downloadFile(visit, { keyId: obj.data.keyId });
            // });
        } else if (obj.event === 'edit') {
            // 禁用可编辑项目信息
            $("#holdForm,#setTemplate,#maxWatchNum,#projManager,#projManagerTelephone,#holdPlace,#limitPerson,#score,#periodProj,#holdDay")
                .addClass("layui-disabled").attr("disabled", "true");
            $('#submitAndResetApply').css("display", "inline-block");
            $('#submitAndResetApproval,#filesDiv,#teachInfoDiv,#saveAndReport').css("display", "none");
            // 设置可编辑项
            //  配置可更新字段 window['fn_city_update_apply_before']='limitPerson'
            let updateFieldsCity = window['fn_city_update_apply_before'] ? window['fn_city_update_apply_before'].split(',') : [];
            updateFieldsCity.forEach(field => {
                $(`#${field}`).removeClass("layui-disabled").removeAttr("disabled");
            });

            form.val('add-filter', datas);
            layer.open({
                type: 1,
                title: '申请',
                content: $('#add-applyBeforeHold'),
                skin: '',
                area: ['100%', '100%'],
                success: function (layero, index) {
                },
                cancel: function () {
                    table.reload('applyBeforeHold');
                }
            });
            form.render();
        }
    });

    // 审核通过
    form.on('submit(pass)', function (data) {
        console.log(data)
        const tempFlowChainState = unitUserType * 10 + 3;
        parent.layer.confirm('确认通过', { icon: 3, title: '提示' }, function (index) {
            console.log("审核通过")
            approvalAjax(data.field.keyId,downId, 6, tempFlowChainState, "");
            parent.layer.close(index)
        })
    });
    // 审核不通过
    form.on('submit(notPass)', function (data) {
        console.log(data)
        approvalType = unitUserType * 10 + 2;
        layer.prompt({
            formType: 2,
            title: '审核意见',
        }, function (value, index, elem) {
            console.log(value);
            let targetFlowChainState = nowFlowChainState + 2;
            // 浙江套: 当前已通过(x3)再改为不通过时，必须传本级x2，避免出现25等非法状态
            if (standardkindId == '190c480d-d43c-450b-8472-a6fd00a6729d' && nowFlowChainState % 10 == 3) {
                targetFlowChainState = approvalType;
            }
            approvalAjax(data.field.keyId,downId, 5, targetFlowChainState, value);
        });
        return false;
    });
    // 退回修改
    form.on('submit(back)', function (data) {
        console.log(data)
        approvalType = unitUserType * 10 + 1;
        layer.prompt({
            formType: 2,
            title: '审核意见',
        }, function (value, index, elem) {
            console.log(value);
            approvalAjax(data.field.keyId,downId, 4, approvalType, value);
        });
        return false;
    });

    //审批通过，不通过，或者退回需要添加
    let approvalAjax = function (keyId, downId ,checkState, flowChainState, checkMemo) {
        $.ajax({
            type: 'post',
            url: applyApiUrl + 'approval',
            data: {
                keyId: downId,
                flowChainState: flowChainState,
                approvalContent: checkMemo,
                unitId: localStorage.getItem("unit-id")
            },
            dataType: 'json',
            success: function (res) {
                if (res.status === 200) {
                    // 保存审核意见
                    if (checkMemo != '') {
                        $.ajax({
                            type: 'post',
                            url: applyApiUrl + 'update',
                            data: JSON.stringify({
                                keyId: keyId,
                                checkMemo: checkMemo
                            }),
                            contentType: 'application/json;charset=UTF-8',
                            dataType: 'json',
                            success: function (res) {
                                if (res.status === 500) {
                                    layer.msg(res.msg);
                                }
                            },
                            error: function () {
                                layer.msg("发送请求失败");
                            }
                        })
                    }
                    layer.msg("提交审核成功");
                    table.reload('applyBeforeHold');
                } else if (res.status === 500) {
                    layer.msg(res.msg);
                }
            },
            error: function () {
                layer.msg("发送请求失败");
            }
        })
        layer.closeAll();
        return false;
    }

    table.on('tool(cmeProjPosDownList)', function (obj) {
        var datas = obj.data;
        groupProjTeachId = obj.data.groupProjTeachId;

        // 湖北套学历非必填
        if (window.getCmeStandardKindId().toLowerCase() == hu_bei_tao_id) {
            $("#select_education").removeAttr("lay-verify");
            $("#spanOnEducation").hide();
        } else {
            $("#select_education").attr("lay-verify", "required");
            $("#spanOnEducation").show();
        }

        if (obj.event === 'edit') {
            $('#submitAndResetTeach').css("display", "block");
            // if (datas.teachingMethod == '面授') {
            //     datas.teachingMethod = '理论';
            // }
            form.val('add-teach', datas);
            // 湖北隐藏课程时间, 默认取批次时间
            if (isTeachDateEqualDowndate) {
                $('#teachDateDiv').css("display", "none");
                laydate.render({
                    elem: '#startDate',
                    type: 'datetime',
                    value: downStartDate
                });
                laydate.render({
                    elem: '#endDate',
                    type: 'datetime',
                    value: downEndDate
                });
            } else {
                $('#teachDateDiv').css("display", "block");
            }
            form.render('select');
            addTeachIndex = layer.open({
                type: 1,
                title: '修改课程',
                content: $('#addTeach'),
                skin: '',
                area: ['710px', '80%']
            })
        } else if (obj.event === 'addTeacher') {
            document.getElementById("form-addTeacher").reset();
            let needScore = $("#needScore").val() !== "false";
            initCertVerifyInfo(needScore);
            $('#form-addTeacher [name=groupProjTeachId]').val(groupProjTeachId);
            initTeacherCardLayout();
            teacherWindowIndex = layer.open({
                type: 1,
                title: '添加教师',
                content: $('#addTeacher'),
                skin: '',
                area: ['1020px', 'auto'],
            })
        } else if (obj.event === 'del') {
            layer.confirm('确认删除', { icon: 3, title: '提示' }, function () {
                $.ajax({
                    type: 'get',
                    url: huayi_projectscore_url + 'cmeGroupprojTeach/deleted',
                    data: {
                        groupProjTeachId: groupProjTeachId
                    },
                    // contentType: 'application/json;charset=UTF-8',
                    dataType: 'json',
                    success: function (res) {
                        if (res.status === 200) {
                            layer.msg("删除成功");
                            table.reload('cmeProjPosDownList');
                        } else {
                            layer.msg(res.msg);
                            table.reload('cmeProjPosDownList');
                        }
                    }
                });
            })

        }
    });

    //判断并上报
    let judgeAndApply = function (downId, updateProjInfo, data) {
        //判断文件
        let canApply = false;
        let tempUrl = applyApiUrl + 'getFilesByDownId';
        commonAjax("post", tempUrl, { downId: downId }, function () { },
            function (res) {
                if (res.status != 200) {
                    layer.msg("申请失败");
                    return;
                }
                let tempArr = [];
                for (let tempFile of res.data) {
                    tempArr.push(tempFile.fileType);
                }
                //查看图片是否上传
                for (let tempObj of fileUpObj) {
                    console.log(tempObj);
                    if (tempObj.require !== true) continue;
                    if (tempArr.indexOf(tempObj.fileType) < 0) {
                        let tempMsg = `${tempObj.fileName}未上传文件`;
                        layer.msg(tempMsg, { icon: 5 });
                        return;
                    }
                }
                canApply = true;
            });
        return canApply;
    }

    // 判断是否填写课程时间
    let teachDateApply = function (downId) {
        //判断文件
        let canApply = false;
        let tempUrl = huayi_projectscore_url + 'cmeGroupprojTeach';
        commonAjax("get", tempUrl, { downId: downId }, function () { },
            function (res) {
                if (res.status != 200) {
                    layer.msg("申请失败");
                    return;
                }

                let teachArr = res.data;
                if (teachArr.length < 1) {
                    return;
                }
                for (let teach of teachArr) {
                    if (teach.startDate == null || teach.startDate == ''
                        || teach.endDate == null || teach.endDate == '') {
                        canApply = false;
                        return;
                    }
                }
                canApply = true;
            });
        return canApply;
    }

    // 判断课程下是否存在教师
    let teacherApply = function (downId) {
        let canApply = true;
        let tempUrl = huayi_projectscore_url + 'cmeGroupprojTeach';
        commonAjax("get", tempUrl, { downId: downId }, function () { },
            function (res) {
                if (res.status != 200) {
                    layer.msg("申请失败");
                    return;
                }
                let teachArr = res.data;
                if (teachArr.length < 1) {
                    return;
                }

                for (let teach of teachArr) {
                    if (!canApply) return;
                    // 查询课程下教师
                    commonAjax("get", huayi_projectscore_url + 'cmeGroupprojTeacher/selectAllTeachers'
                        , { projTeachId: teach.groupProjTeachId }
                        , function () { }
                        , function (res) {
                            if (res.status != 200) {
                                layer.msg("查询失败");
                                return;
                            }
                            let teacherArr = res.data;
                            // 判断该课程是否添加教师
                            if (teacherArr.length < 1) {
                                canApply = false;
                                return;
                            }
                        }
                    );
                }
            }
        );
        return canApply;
    }

    // 保存教师信息时, 判断职称与教学方法是否匹配
    // let titleAndTeachingMethod = function (titleId, teachId) {
    //     debugger
    //     let canApply = false;
    //     let tempUrlTitle = huayi_sjwh_url + 'comTitle/list/all';
    //     let titleLevel = '', teachingMethod = '';
    //     // 获取职称
    //     commonAjax("get", tempUrlTitle, { titleId: titleId }, function () { },
    //         function (res) {
    //             if (res.status != 200) {
    //                 layer.msg("获取职称失败");
    //                 return;
    //             }

    //             let titleArr = res.data;
    //             if (titleArr.length < 1) {
    //                 return;
    //             }
    //             titleLevel = titleArr[0].titleLevel;
    //         });
    //     // 获取课程教学方法
    //     let tempUrlTeach = huayi_projectscore_url + 'cmeGroupprojTeach';
    //     commonAjax("get", tempUrlTeach, { groupProjTeachId: teachId }, function () { },
    //         function (res) {
    //             if (res.status != 200) {
    //                 layer.msg("获取课程失败");
    //                 return;
    //             }

    //             let teachArr = res.data;
    //             if (teachArr.length < 1) {
    //                 return;
    //             }
    //             teachingMethod = teachArr[0].teachingMethod;
    //         });
    //     if (teachingMethod == '面授' || teachingMethod == '理论') {
    //         // 教学方法为理论，编辑授课教师职称时只能选择高级、副高级职称。
    //         canApply = titleForTheory.includes(titleLevel);
    //     } else if (teachingMethod == '实验（技术示范）') {
    //         // 教学方法为实验技术，可以选择高级、副高级、中级职称。
    //         canApply = titleForExperiment.includes(titleLevel);
    //     } else if (!teachingMethod) {
    //         canApply = true;
    //     }
    //     return canApply;
    // }

    // 保存课程信息时, 判断职称与教学方法是否匹配
    // let titleAndTeachingMethodForTeach = function (teachId, teachingMethod) {
    //     debugger
    //     let canApply = true;
    //     let tempUrlTeacher = huayi_projectscore_url + 'cmeGroupprojTeacher/selectAllTeachers';
    //     let teacherArr = [], titleLevel = '';

    //     // 获取课程下所有教师
    //     commonAjax("get", tempUrlTeacher, { projTeachId: teachId }, function () { },
    //         function (res) {
    //             if (res.status != 200) {
    //                 layer.msg("获取教师失败");
    //                 return;
    //             }

    //             teacherArr = res.data;
    //             if (teacherArr.length < 1) {
    //                 return;
    //             }
    //         });

    //     let tempUrlTitle = huayi_sjwh_url + 'comTitle/list/all';
    //     // 遍历教师获取职称级别
    //     teacherArr.forEach(teacher => {
    //         if (!canApply) return;
    //         commonAjax("get", tempUrlTitle, { titleId: teacher.title }, function () { },
    //             function (res) {
    //                 if (res.status != 200) {
    //                     layer.msg("获取职称失败");
    //                     return;
    //                 }

    //                 let titleArr = res.data;
    //                 if (titleArr.length < 1) {
    //                     return;
    //                 }
    //                 let titleLevel = titleArr[0].titleLevel;
    //                 if (!titleLevel) {
    //                     return;
    //                 }
    //                 if (teachingMethod == '面授' || teachingMethod == '理论') {
    //                     // 教学方法为理论，编辑授课教师职称时只能选择高级、副高级职称。
    //                     canApply = titleForTheory.includes(titleLevel);
    //                 } else if (teachingMethod == '实验（技术示范）') {
    //                     // 教学方法为实验技术，可以选择高级、副高级、中级职称。
    //                     canApply = titleForExperiment.includes(titleLevel);
    //                 }
    //             });

    //     });

    //     return canApply;
    // }
    //上报
    let applyAjax = function (updateProjInfo, data) {
        $.ajax({
            type: 'post',
            url: applyApiUrl + 'application',
            data: JSON.stringify(updateProjInfo),
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            success: function (res) {
                if (res.status === 200) {
                    if (data.field.holdForm == defaultholdForm && standardkindId == qing_hai_tao_id) {
                        savePolyvProjApplyBefore(data.field.maxWatchNum, data.field.setTemplate);
                    } else {
                        delPolyvProjApplyBefore();
                    }
                    layer.closeAll();
                    // parent.layer.closeAll();
                    // parent.layer.close(parent.layer.index);
                    // layer.close(layer.index);
                    layer.msg("提交申请成功");
                } else if (res.status === 500) {
                    layer.closeAll();
                    // parent.layer.close(parent.layer.index);
                    layer.msg(res.msg);
                } else if (res.status === 10006) {
                    layer.close(layer.index);
                    // parent.layer.close(parent.layer.index);
                    layer.msg(res.msg);
                }
                parent.onlyRefreshTable();
                table.reload('applyBeforeHold');
                
            },
            error: function () {
                layer.msg("发送请求失败");
                table.reload('applyBeforeHold');
            }
        })
    }

    let updateTeachDate = function () {
        $.ajax({
            type: 'get',
            url: huayi_projectscore_url + 'cmeGroupprojTeach/updateTeachDate?downId=' + downId,
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            async: false,
            success: function (res) {
                if (res.status === 200) {
                    console.log('更新课程时间成功')
                }
            },
            error: function () {
            }
        })
    }

    form.on('submit(application)', function (data) {
        var limitPerson = $('#limitPerson').val();
        if (limitPerson <= 0) {
            layer.msg('拟授分人数必须大于0')
            return false;
        } else if (parseInt(personLimitCeiling, 10) > 0 && parseInt(limitPerson, 10) > parseInt(personLimitCeiling, 10)) {
            layer.msg('拟授分人数超出设置上限：' + personLimitCeiling)
            return false;
        }
        // 判断课程开始/结束时间
        if (teachDateStatus != "0" && isTeachDateEqualDowndate == false) {
            layer.msg("请添加课程开始和结束时间");
            return false;
        }
        if (data.field.holdForm == defaultholdForm && standardkindId == qing_hai_tao_id) {
            if (!data.field.setTemplate) {
                layer.msg('请选择直播类型')
                return false;
            }
            // if (!data.field.maxWatchNum) {
            //     layer.msg('请输入直播观看人数上限')
            //     return false;
            // }
        }
        let canApply = judgeAndApply(downId);
        if (!canApply) { return false; }
        if (isTeachDateEqualDowndate) {
            // 更新课程时间
            updateTeachDate();
            if (!data.field.projManager) {
                layer.msg('请填写活动负责人');
                return false;
            }
            if (!data.field.projManagerTelephone) {
                layer.msg('请填写活动负责人联系电话');
                return false;
            }
        }
        canApply = teachDateApply(downId);
        //浙江套不判断课程开始、结束时间
        if (!isTeachDateEqualDowndate && !canApply && standardkindId != '190c480d-d43c-450b-8472-a6fd00a6729d') { layer.msg('需要填写课程开始、结束时间'); return false; }
        canApply = teacherApply(downId);
        if (!canApply) { layer.msg('每个课程下面至少要维护一个授课教师'); return false; }
        layer.confirm('确认申请', { icon: 3, title: '提示' }, function () {
            let meetNoticeUrlList = $('[name=meetNoticeUrl]'), meetNoticeUrls = '';
            $(meetNoticeUrlList).each((i, item) => {
                meetNoticeUrls += $(item).val() + '|';
            });
            meetNoticeUrls = '' == meetNoticeUrls ?
                meetNoticeUrls : meetNoticeUrls.substring(0, meetNoticeUrls.length - 1);

            let meetNoticeNameList = $('[name=meetNoticeName]'), meetNoticeNames = '';
            $(meetNoticeNameList).each((i, item) => {
                meetNoticeNames += $(item).val() + '|';
            });
            meetNoticeNames = '' == meetNoticeNames ?
                meetNoticeNames : meetNoticeNames.substring(0, meetNoticeNames.length - 1);

            console.log(meetNoticeUrls);
            console.log(meetNoticeNames);

            let updateProjInfo = {
                keyId: data.field.keyId,
                projManager: $('#projManager').val(),
                projManagerTelephone: $('#projManagerTelephone').val(),
                holdPlace: $('#holdPlace').val(),
                limitPerson: $('#limitPerson').val(),
                holdForm: data.field.holdForm,
                teachObject: data.field.teachObject,
                emcee: data.field.emcee,
                mainContent: data.field.mainContent,
                // content: data.field.content,
                downId: downId,
                groupProjId: projId,
                deptId: localStorage.getItem('dept-id'),
                userType: localStorage.getItem('user-type'),
                unitId: getUnitId(),
                // fileUrls: meetNoticeUrls,
                // fileNames: meetNoticeNames
            };
            if (isLoadApplProj) {
                updateProjInfo.planScore = data.field.planScore;
                updateProjInfo.planPeriod = data.field.planPeriod;
                updateProjInfo.holdDay = data.field.holdDay;
            }
            applyAjax(updateProjInfo, data)
        })
        return false;
    });
    form.on('submit(saveInfo)', function (data) {
        var limitPerson = $('#limitPerson').val();
        if (limitPerson <= 0) {
            layer.msg('拟授分人数必须大于0')
            return false;
        } else if (parseInt(personLimitCeiling, 10) > 0 && parseInt(limitPerson, 10) > parseInt(personLimitCeiling, 10)) {
            layer.msg('拟授分人数超出设置上限：' + personLimitCeiling)
            return false;
        }
        let meetNoticeUrlList = $('[name=meetNoticeUrl]'), meetNoticeUrls = '';
        $(meetNoticeUrlList).each((i, item) => {
            meetNoticeUrls += $(item).val() + '|';
        });
        meetNoticeUrls = '' == meetNoticeUrls ?
            meetNoticeUrls : meetNoticeUrls.substring(0, meetNoticeUrls.length - 1);

        let meetNoticeNameList = $('[name=meetNoticeName]'), meetNoticeNames = '';
        $(meetNoticeNameList).each((i, item) => {
            meetNoticeNames += $(item).val() + '|';
        });
        meetNoticeNames = '' == meetNoticeNames ?
            meetNoticeNames : meetNoticeNames.substring(0, meetNoticeNames.length - 1);

        console.log(meetNoticeUrls);
        console.log(meetNoticeNames);
        if (data.field.holdForm == defaultholdForm && standardkindId == qing_hai_tao_id) {
            if (!data.field.setTemplate) {
                layer.msg('请选择直播类型')
                return false;
            }
            // if (!data.field.maxWatchNum) {
            //     layer.msg('请输入直播观看人数上限')
            //     return false;
            // }
        }

        let updateProjInfo = {
            keyId: data.field.keyId,
            projManager: $('#projManager').val(),
            projManagerTelephone: $('#projManagerTelephone').val(),
            holdPlace: $('#holdPlace').val(),
            limitPerson: $('#limitPerson').val(),
            holdForm: data.field.holdForm,
            content: data.field.content,
            joinPerson: data.field.joinPerson,
            addressWay: data.field.addressWay,
            roomBoard: data.field.roomBoard,
            other: data.field.other,
            teachObject: data.field.teachObject,
            emcee: data.field.emcee,
            mainContent: data.field.mainContent,
            downId: downId,
            groupProjId: projId,
            deptId: localStorage.getItem('dept-id'),
            userType: localStorage.getItem('user-type'),
            unitId: getUnitId(),
            // checkState: 1,
            fileUrls: meetNoticeUrls,
            fileNames: meetNoticeNames
            // flowChainState: 2
        };
        if (isLoadApplProj) {
            updateProjInfo.planScore = data.field.planScore;
            updateProjInfo.planPeriod = data.field.planPeriod;
            updateProjInfo.holdDay = data.field.holdDay;
        }
        if (isTeachDateEqualDowndate) {
            // 湖北套, 更新课程时间取批次时间
            updateTeachDate();
        }

            // TODO 配置可更新字段 window['fn_city_update_apply_before']='limitPerson'
        if (window['fn_city_update_apply_before']) {
            // 河南：市级行政修改市级项目的拟授分人数
            let updateFields = window['fn_city_update_apply_before'].split(',');
            updateFields.forEach(field => {
                updateProjInfo[field] = data.field[field];
            });
        }
        $.ajax({
            type: 'post',
            url: applyApiUrl + 'saveInfo',
            data: JSON.stringify(updateProjInfo),
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            success: function (res) {
                if (res.status === 200) {
                    if (data.field.holdForm == defaultholdForm && standardkindId == qing_hai_tao_id) {
                        savePolyvProjApplyBefore(data.field.maxWatchNum, data.field.setTemplate);
                    } else {
                        delPolyvProjApplyBefore();
                    }
                    // layer.close(layer.index);
                    layer.closeAll();
                    layer.msg("保存成功");
                } else if (res.status === 500) {
                    layer.closeAll();
                    // layer.close(parent.layer.index);
                    layer.msg(res.msg);
                }
                table.reload('applyBeforeHold');
            },
            error: function () {
                layer.msg("发送请求失败");
                table.reload('applyBeforeHold');
            }
        })
        return false;
    });


    // 提交课程信息
    form.on('submit(submitTeach)', function (data) {
        var start_date = $("#startDate").val();
        var end_date = $("#endDate").val();

        if (Date.parse(start_date) >= Date.parse(end_date)) {
            layer.msg("课程结束日期应该大于课程开始日期");
            return false;
        }


        // 用于判断是新增还是修改
        data.groupProjTeachId = groupProjTeachId;
        data.field.groupProjId = projId;
        data.field.downId = downId;
        data.field.score = '23';
        data.field.remark = '备注.';
        var datas = JSON.stringify(data.field);
        // alert(datas);
        var formTableId = $("#addTeach input[name='groupProjTeachId']").val();
        var msg;
        var URL;
        if (formTableId === '' || formTableId === undefined) {
            //课程的时间范围不能有交叉，并且课程的时间范围应该在周期的时间范围内
            if (isTeachDateEqualDowndate == false) {
                let startDateEndDateCheckResultObj = isTeachStartDateAndEndDateCorrect(downId,
                groupProjTeachId, start_date, end_date, "add");
                if (startDateEndDateCheckResultObj.code != 0) {
                    layer.msg(startDateEndDateCheckResultObj.msg);
                    return false;
                }
            }

            // 走新增逻辑
            URL = huayi_projectscore_url + 'cmeGroupprojTeach/save';
            msg = '新增课程信息成功';
        } else {
            //课程的时间范围不能有交叉，并且课程的时间范围应该在周期的时间范围内
            if (isTeachDateEqualDowndate == false) {
                let startDateEndDateCheckResultObj = isTeachStartDateAndEndDateCorrect(downId,
                groupProjTeachId, start_date, end_date, "edit");
                if (startDateEndDateCheckResultObj.code != 0) {
                    layer.msg(startDateEndDateCheckResultObj.msg);
                    return false;
                }
            }

            // 走修改逻辑
            URL = huayi_projectscore_url + 'cmeGroupprojTeach/update';
            msg = '修改课程信息成功';

            // 授课形式与授课教师职称的关联
            // if (standardkindId == hu_bei_tao_id && isCheckTitleTeachingMethod) {
            //     let teachingMethod = data.field.teachingMethod;
            //     let canApply = true;
            //     canApply = titleAndTeachingMethodForTeach(data.field.groupProjTeachId, teachingMethod);

            //     if (!canApply) {
            //         layer.msg("教学方法与教师职称不匹配");
            //         return false;
            //     }
            // }
        }
        $.ajax({
            type: 'post',
            url: URL,
            data: datas,
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            success: function (res) {
                if (res.status === 200) {
                    layer.close(addTeachIndex);
                    layer.msg(msg);
                    table.reload('cmeProjPosDownList');
                } else if (res.status === 500) {
                    layer.msg(res.msg);
                }
                console.log(layer.index);
            },
            error: function () {
                layer.msg("发送请求失败");
            }
        })
        return false;
    });

    window.isTeachStartDateAndEndDateCorrect = function (downId, groupProjTeachId, startDateStr, endDateStr, operate) {
        let resultObj = {};
        let url = huayi_projectscore_url + 'cmeGroupprojTeach/isTeachStartDateAndEndDateCorrect';
        $.ajax({
            async: false,
            type: 'get',
            url: url,
            data: { downId: downId, groupProjTeachId: groupProjTeachId, startDateStr: startDateStr, endDateStr: endDateStr, operate: operate },
            success: function (res) {
                if (res.success == true) {
                    resultObj = res.data;
                } else {
                    resultObj = {
                        "msg": "程序出现未知错误，请联系管理员",
                        "code": 3
                    };
                }
            },
            error: function () {
                resultObj = {
                    "msg": "发送信息失败",
                    "code": 3
                };
            }
        });
        return resultObj;
    }

    // 提交教师信息
    form.on('submit(submitTeacher)', function (data) {
        // 用于判断是新增还是修改
        // data.field.groupProjTeachId = groupProjTeachId;
        data.field.groupProjTeachId = $('#addTeacher [name=groupProjTeachId]').val();
        data.field.cmeStandardKindId = window.getCmeStandardKindId();

        let teacherName = data.field.teacherName;
        if (teacherName == "" || teacherName == undefined || teacherName == null) {
            layer.msg("请输入授课教师姓名");
            return false;
        }

        let needScore = $("#needScore").val() !== "false";
        if (needScore) {
            data.field.needScore = true;
        } else {
            data.field.needScore = false;
        }

        if (data.field.teachNo && data.field.personNo) {
            layer.msg("证件号和医通卡号只能填写一个");
            return false;
        }
        if (isGuangdongTeacherCard) {
            if (!data.field.teachNo && !data.field.personNo) {
                layer.msg("请填写证件号码或医通卡号");
                return false;
            }
        } else if (needScore && !data.field.teachNo) {
            layer.msg("请填写证件号码");
            return false;
        }

        let sex = data.field.sex;
        if (sex == "" || sex == undefined || sex == null) {
            layer.msg("请选择性别");
            return false;
        }

        let education = data.field.education;
        if (education == "" || education == undefined || education == null) {
            layer.msg("请选择学历");
            return false;
        }

        let dept = data.field.dept;
        if (dept == "" || dept == undefined || dept == null) {
            layer.msg("请选择专业");
            return false;
        }

        let title = data.field.title;
        if (title == "" || title == undefined || title == null) {
            layer.msg("请选择职称");
            return false;
        }

        let ifProjManager = data.field.ifProjManager;
        if (ifProjManager == "" || ifProjManager == undefined || ifProjManager == null) {
            layer.msg("请选择是否为项目负责人");
            return false;
        }

        let unitName = data.field.unitName;
        if (unitName == "" || unitName == undefined || unitName == null) {
            layer.msg("请输入单位名称");
            return false;
        }

        // 授课形式与授课教师职称的关联
        // if (standardkindId == hu_bei_tao_id && isCheckTitleTeachingMethod) {
        //     let canApply = titleAndTeachingMethod(title, data.field.groupProjTeachId);
        //     if (!canApply) {
        //         layer.msg("职称与课程教学方法不匹配");
        //         return false;
        //     }
        // }

        var datas = JSON.stringify(data.field);
        console.log(data.field);
        // alert(datas);
        var formTableId = $("#addTeacher input[name='groupProjTeacherId']").val();
        var msg;
        var URL;
        if (formTableId === '' || formTableId === undefined) {
            // 走新增逻辑
            URL = huayi_projectscore_url + 'cmeGroupprojTeacher/save';
            msg = '新增教师信息成功';
        } else {
            // 走修改逻辑
            URL = huayi_projectscore_url + 'cmeGroupprojTeacher/update';
            msg = '修改教师信息成功';
        }
        $.ajax({
            type: 'post',
            url: URL,
            data: datas,
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            success: function (res) {
                if (res.status === 200) {
                    layer.close(teacherWindowIndex);
                    layer.msg(msg);
                    table.reload('cmeProjPosDownList');
                } else if (res.status === 500) {
                    layer.msg(res.msg);
                }
                // location.reload();
            },
            error: function () {
                layer.msg("发送请求失败");
            }
        })
        return false;
    });

    // 获取申报项目信息
    function applProjDetail(projectPublishId) {
        if (!projectPublishId) {
            return;
        }
        $.ajax({
            async: false,
            type: "get",
            url: huayi_projectscore_url + "declare/detail/" + projectPublishId,
            dataType: 'json',
            success: function (data) {
                console.log(data.data);
                if (data && data.data) {
                    applScore = data.data.score;
                    applTeachObject = data.data.teachObject;
                }
            },
            error: function (data) {
                layer.msg("响应失败");
            }
        });
    }

    //获取试卷信息
    let getPaperInfo = function (projectId = "") {
        // 获取配置

        if (projectId == "") {
            layer.msg("缺少必要参数");
        }
        let hasPaper = false;
        $.ajax({
            type: 'post',
            async: false,
            url: huayi_projectscore_url + 'cmeExamQuestion/getExamPaper',
            data: { projectId: projectId },
            success: function (res) {
                if (res.status == 200 && res.data) {
                    hasPaper = true;
                }
            }
        });
        return hasPaper;
    }
    let bindViewFlowBtn = function () {
        $('.js-view-flow').click(function (e) {
            let downId = this.getAttribute("data-id");
            let unitId = this.getAttribute("apply-unit-id");
            loading = layer.msg('加载中', { icon: 16, shade: 0.3, time: 0 });
            // ajaxNum++
            $.ajax({
                url: applyApiUrl + 'getApprovalStep',
                type: 'post',
                data: {
                    downId: downId,
                    unitId: unitId,
                    userType: localStorage.getItem('user-type')
                },
                success: function (res) {
                    layer.close(loading);
                    if (res.status === 200) {
                        createFlowStep(res.data);
                    } else {
                        layer.msg("获取流程步骤失败");
                    }
                },
                fail: function () {
                    layer.close(loading);
                }
            });

        })
    }
    //创建审批步骤弹窗
    let createFlowStep = function (data) {
        if (data == null || data == "" || data.length == 0) {
            layer.msg("获取数据为0");
            return;
        }
        let tipHtml = '<div class="flow-detail-window"><div>审批步骤</div><ul>';
        for (let i = 0; i < data.length; i++) {
            let stateText = "";
            let goApprovalText = (data[i]["flowChainState"] % 10 == 0) ? "审批中" : "";
            let passClass = (data[i]["flowChainState"] != null && data[i]["flowChainState"] != "" && data[i]["flowChainState"] % 10 != 0) ? "approval-pass" : "";
            let tipMsg = "";
            if (data[i]["approvalContent"] != null && data[i]["approvalContent"] != "") {
                tipMsg = `msg="${data[i]["approvalContent"]}" onmouseover="mouseoverImageName(this)" onmouseout="mouseoutImageName(this)"`;
            }

            if (data[i]["flowChainState"] % 10 == 1) stateText = "已退回";
            if (data[i]["flowChainState"] % 10 == 2) stateText = "审批不通过";
            if (data[i]["flowChainState"] % 10 == 3 || data[i]["flowChainState"] == 99) stateText = "审批通过";
            if (data[i]["flowChainState"] % 10 == 0) stateText = "进行中";
            if (data[i]["flowChainState"] == 1) stateText = "已提交";
            if (data[i]["updateTime"] == null || data[i]["updateTime"] == "null") data[i]["updateTime"] = "";
            tipHtml += '<li class="' + passClass + '"><div>' + stateText + '</div><div ' + tipMsg + '>' + data[i]["updateTime"] + '  ' + data[i]["unitName"] + goApprovalText + '</div></li>';
        }
        tipHtml += '</ul></div>';
        openApprovalTextWindow(false, tipHtml, '400px', true, 0);
    }
    let openApprovalTextWindow = function (title = "审批意见", content = false, area, shadeClose = false, closeBtn = 1) {
        approvalIndex = layer.open({
            type: 1,
            title: title,
            content: content,
            skin: '',
            closeBtn: closeBtn,
            area: area,
            shadeClose: shadeClose,
            success: function () { },
            fail: function () { },
            cancel: function (index, layero) { }
        })
    }

    //创建项目上传图片的tab页
    let createTabPage = function (datas, isSubmit) {
        //ajax请求获取该页面的数据
        let hiddenHtml = "";
        // var isSubmit = 1;
        if (isSubmit == 0) {
            $(".js-choose-file").addClass("js-hidden");
            $(".js-upload-btn-box").addClass("js-hidden");
            hiddenHtml = " js-hidden ";
        } else {
            $(".js-choose-file").removeClass("js-hidden");
            $(".js-upload-btn-box").removeClass("js-hidden");
        }
        let meetingNoticeHtml = "";
        $(".js-meeting-notice").html(meetingNoticeHtml);
        $(`.js-feedback1`).html('');
        $(`.js-feedback2`).html('');
        $(`.js-feedback3`).html('');
        $(`.js-feedback4`).html('');

        if (datas == null) return;
        //图片渲染
        for (let i = 0; i < datas.length; i++) {
            let htmlText = `<li file-id="${datas[i]["fileId"]}">` +
                `<a class="layui-btn layui-btn-xs btn-normal-row js-file-name" msg="${datas[i]["fileName"]}" filePath="${datas[i]["filePath"]}" 
                    onmouseover="mouseoverImageName(this)" onmouseout="mouseoutImageName(this)" onclick="downloadFeedFile(this)">${datas[i]["fileName"]}</a>` +
                `<a class="layui-btn layui-btn-xs btn-danger-row ${hiddenHtml}" onclick="deleteImage(this)">移除</a></li>`;
            $(`.js-feedback${datas[i].fileType}`).append(htmlText);
        }
        //图片渲染
        // for (let i = 0; i < datas.length; i++) {
        //     let fileUrl = datas[i].filePath;
        //     if ('' != fileUrl) {
        //         let ext = fileUrl.substring(fileUrl.lastIndexOf('.') + 1);
        //         let fileName = null != datas[i].fileName ? datas[i].fileName : '会议通知.' + ext;
        //         meetingNoticeHtml += '<li file-url="' + fileUrl + '" ' +
        //             'file-id="' + datas[i].fileId + '">' +
        //             '<a class="layui-btn layui-btn-xs btn-normal-row js-file-name"' +
        //             ' msg="' + fileUrl + '" msg2="' + fileName + '"' +
        //             ' onmouseover="mouseoverImageName(this)"' +
        //             ' onmouseout="mouseoutImageName(this)" onclick="downloadFileT(this)">' +
        //             fileName + '</a>' +
        //             '<a class="layui-btn layui-btn-xs btn-danger-row remove-image' +
        //             hiddenHtml + '" onclick="deleteImage(this)">移除</a>' +
        //             '<input type="hidden" name="meetNoticeUrl" value="' + fileUrl + '">' +
        //             '<input type="hidden" name="meetNoticeName" value="' + fileName + '">' +
        //             '</li>';
        //     }
        // }
        // $(".js-meeting-notice").html(meetingNoticeHtml);
    }
    let createImageTab = function (fileUrls, fileNames) {
        //ajax请求获取该页面的数据
        let hiddenHtml = "";
        var isSubmit = 1;
        if (isSubmit == 0) {
            $(".js-choose-file").addClass("js-hidden");
            $(".js-upload-btn-box").addClass("js-hidden");
            hiddenHtml = " js-hidden ";
        } else {
            $(".js-choose-file").removeClass("js-hidden");
            $(".js-upload-btn-box").removeClass("js-hidden");
        }
        let meetingNoticeHtml = "";
        $(".js-meeting-notice").html(meetingNoticeHtml);

        if (fileUrls == null) return;
        var fileUrlArr, fileNameArr;
        if (fileUrls != undefined || fileUrls != null) {
            // fileUrls = fileUrls.substring(0, fileUrls.length - 1)
            fileUrlArr = fileUrls.split('|');
        }
        if (fileNames != undefined || fileNames != null) {
            // fileNames = fileNames.substring(0, fileUrls.length - 1)
            fileNameArr = fileNames.split('|');
        }
        //图片渲染
        for (let i = 0; i < fileUrlArr.length; i++) {
            let fileUrl = fileUrlArr[i];
            if ('' != fileUrl) {
                let ext = fileUrl.substring(fileUrl.lastIndexOf('.') + 1);
                let fileName = (null != fileNameArr && fileNameArr.length > i)
                    ? fileNameArr[i] : '会议通知.' + ext;
                meetingNoticeHtml += '<li file-url="' + fileUrl + '">' +
                    '<a class="layui-btn layui-btn-xs btn-normal-row js-file-name"' +
                    ' msg="' + fileUrl + '" msg2="' + fileName + '"' +
                    ' onmouseover="mouseoverImageName(this)"' +
                    ' onmouseout="mouseoutImageName(this)" onclick="downloadFileT(this)">' +
                    fileName + '</a>' +
                    '<a class="layui-btn layui-btn-xs btn-danger-row remove-image' +
                    hiddenHtml + '" onclick="deleteImage(this)">移除</a>' +
                    '<input type="hidden" name="meetNoticeUrl" value="' + fileUrl + '">' +
                    '<input type="hidden" name="meetNoticeName" value="' + fileName + '">' +
                    '</li>';
            }
        }
        $(".js-meeting-notice").html(meetingNoticeHtml);
    }
    // createImageTab([]);

    //文件上传
    let fileUpload = function () {
        let fileName = '', fileUrl = '';
        let uploadBtns = $(".js-upload-btn");
        for (let i = 0; i < uploadBtns.length; i++) {
            let upType = uploadBtns[i].getAttribute("data-type");
            let exts = 'jpg|png|bmp|jpeg|pdf';
            if ((standardkindId == HAINAN && upType == 2)
                || standardkindId == gan_su_tao_id) {
                exts = 'pdf';
            }
            //上传文件
            upload.render({
                elem: uploadBtns[i],
                url: huayi_upload_url + 'uploadApi/upload',
                exts: exts,
                size: 10 * 1024,//大小小于10M
                accept: 'file',
                multiple: false,
                before: function (obj) {
                    console.log(obj);

                    fileName = '';
                    fileUrl = '';

                    var fileType = "IMAGE";
                    let files = this.files = obj.pushFile();
                    for (let key in files) {
                        fileName = files[key].name;
                        console.log(fileName);
                    }
                    if (fileName.indexOf("pdf") > 0) {
                        fileType = "DOC";
                    }
                    let unitId = getUnitId();
                    let cmeStandardKindId = getCmeStandardKindId();
                    this.data = {
                        fileType: fileType,
                        path: `/projApply/${cmeStandardKindId}/${unitId}/`
                    }
                },
                choose: function (obj) {
                    loading = layer.msg('加载中', { icon: 16, shade: 0.3, time: 0 });
                },
                done: function (res, index, upload) {
                    layer.close(loading);
                    delete this.files[index];

                    let datas = res.data;
                    if (res.code == 200 && datas != null && datas.hasOwnProperty('picUrl')) {
                        saveFilePath(res.data.picUrl, upType, fileName);
                        let fileUrl = datas.picUrl;
                        // let liFile = '<li file-id="' + datas["downId"] + '">' +
                        //     '<a class="layui-btn layui-btn-xs btn-normal-row js-file-name"' +
                        //     ' msg="' + fileUrl + '" msg2="' + fileName + '"' +
                        //     ' onmouseover="mouseoverImageName(this)"' +
                        //     ' onmouseout="mouseoutImageName(this)" onclick="downloadFileT(this)">' +
                        //     fileName + '</a>' +
                        //     '<a class="layui-btn layui-btn-xs btn-danger-row" onclick="deleteImage(this)">移除</a>' +
                        //     '<input type="hidden" name="meetNoticeUrl" value="' + fileUrl + '">' +
                        //     '<input type="hidden" name="meetNoticeName" value="' + fileName + '">' +
                        //     '</li>';
                        // $('.js-meeting-notice').append(liFile);

                    } else {
                        layer.msg('上传失败');
                    }
                },
                error: function (index, upload) {
                    layer.close(loading);
                }
            });
        }
    }

    $(".downloadTemplate").ready(function () {
        $(".downloadTemplate").on("click", function (data) {
            var url = data.target.getAttribute('templateUrl');

            // fetch(url)
            // .then(response => {
            //     if (!response.ok) {
            //     throw new Error('Network response was not ok ' + response.statusText);
            //     }
            //     return response.blob();
            // })
            // .then(blob => {
            //     var a = document.createElement('a');
            //     a.href = URL.createObjectURL(blob);
            //     // 设置下载文件名
            //     if(url == '/file/GanSuApplyTemplateTeacher.docx'){
            //         a.download = '授课教师承诺书.docx'; 
            //     }else if(url == '/file/GanSuApplyTemplateProject.docx'){
            //         a.download = '继教项目办班承诺书.docx';
            //     }else {
            //         a.download = '填报模板.docx';
            //     }
            //     a.style.display = 'none';
            //     document.body.appendChild(a);
            //     a.click();
            //     document.body.removeChild(a);
            // })
            // .catch(error => {
            //     console.error('There was a problem with the fetch operation:', error);
            // });

            //下载模板
            var templateName = data.target.getAttribute('templateName');
            var fileName = "文件模板.docx";
            if (templateName) {
                fileName = templateName;
            }
            var downloadLink = document.createElement("a");
            downloadLink.href = data.target.getAttribute('templateUrl');
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            // var iframe = document.createElement("iframe");
            // iframe.src = data.target.getAttribute('templateUrl');
            // iframe.style.display = "none";
            // document.body.appendChild(iframe);
            layer.msg('填写完毕后请将文档转为pdf格式上传')
        });
    });

    $("#foreignExperts").ready(function () {
        $("#foreignExperts").on("click", function (data) {
            // 填报说明
            layer.photos({
                photos: {
                    "title": "填报说明", //相册标题
                    "id": 123, //相册id
                    "start": 0, //初始显示的图片序号，默认0
                    "data": [   //相册包含的图片，数组格式
                        {
                            "alt": "填报说明1",
                            "pid": 1, //图片id
                            "src": "/file/hainan_apply1.jpg", //原图地址
                            "thumb": "" //缩略图地址
                        }, {
                            "alt": "填报说明2",
                            "pid": 2, //图片id
                            "src": "/file/hainan_apply2.jpg", //原图地址
                            "thumb": "" //缩略图地址
                        }
                    ]
                }
                , anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机（请注意，3.0之前的版本用shift参数）
            });
        });
    });
    //初次加载
    // fileUpload();
    //文件保存到文件服务器后进行保存文件路径
    let saveFilePath = function (filePath, fileType, fileName) {
        let data = { fileType: fileType, filePath: filePath, downId: downId, fileName: fileName };
        commonAjax("post", applyApiUrl + 'saveFilePath', data,
            function () { layer.msg("保存失败"); },
            function (res) {
                if (res.status === 200) {
                    createFileElem(fileType, res.data);
                    // let datas = res.data;
                    // if (datas != null && datas.hasOwnProperty("fileName")) {
                    //     let datas = res.data;
                    //     let fileUrl = datas.picUrl;
                    //     let liFile = '<li file-id="' + datas["fileId"] + '">' +
                    //         '<a class="layui-btn layui-btn-xs btn-normal-row js-file-name"' +
                    //         ' msg="' + fileUrl + '" msg2="' + datas["fileName"] + '"' +
                    //         ' onmouseover="mouseoverImageName(this)"' +
                    //         ' onmouseout="mouseoutImageName(this)" onclick="downloadFileT(this)">' +
                    //         datas["fileName"] + '</a>' +
                    //         '<a class="layui-btn layui-btn-xs btn-danger-row" onclick="deleteImage(this)">移除</a>' +
                    //         '<input type="hidden" name="meetNoticeUrl" value="' + datas["filePath"] + '">' +
                    //         '<input type="hidden" name="meetNoticeName" value="' + datas["fileName"] + '">' +
                    //         '</li>';
                    //     $('.js-meeting-notice').append(liFile);

                    //     // let jsClassArr = ["js-meeting-notice", "js-meeting-overrall", "js-student-signin", "js-exem-question", "js-feedback-table"];
                    //     // let className = (fileType <= 4) ? jsClassArr[fileType] : "";
                    //     // let liFile = `<li file-id="${datas["feedbackFileId"]}">` +
                    //     //     `<a class="layui-btn layui-btn-xs btn-normal-row js-file-name" msg="${datas["fileName"]}" filePath="${datas["filePath"]}" 
                    //     //     onmouseover="mouseoverImageName(this)" 
                    //     //     onmouseout="mouseoutImageName(this)" onclick="downloadFeedFile(this)">${datas["fileName"]}</a>` +
                    //     //     `<a class="layui-btn layui-btn-xs btn-danger-row" onclick="deleteImage(this)">移除</a></li>`;
                    //     // $("." + className).append(liFile);
                    // }
                } else {
                    layer.msg(res.msg);
                }
            });
    }

    //创建文件元素
    let createFileElem = function (fileType, datas) {
        if (datas != null && datas.hasOwnProperty("fileName")) {
            let className = `js-feedback${fileType}`;
            let liFile = `<li file-id="${datas["fileId"]}">` +
                `<a class="layui-btn layui-btn-xs btn-normal-row js-file-name" msg="${datas["fileName"]}" filePath="${datas["filePath"]}" 
                    onmouseover="mouseoverImageName(this)" onmouseout="mouseoutImageName(this)" onclick="downloadFeedFile(this)">${datas["fileName"]}</a>` +
                `<a class="layui-btn layui-btn-xs btn-danger-row" onclick="deleteImage(this)">移除</a></li>`;
            $("." + className).append(liFile);
        }
    }

    //初始化单个下拉框
    window.initPerDic = function (select_id, kind_id, errorStr) {
        $.ajax({
            async: false,
            url: huayi_sjwh_url + "comdictionary/getDicsByKindId",
            data: { kindId: kind_id },
            success: function (result) {
                if (result.success == true) {
                    var objList = result.data;
                    var obj = {};
                    for (var i = 0; i < objList.length; i++) {
                        obj = objList[i];
                        $("<option value=" + obj.dict_id + ">" + obj.dict_name + "</option>").appendTo($("#" + select_id))
                    }
                }
                else {
                    layer.msg(errorStr);
                }
            }
        });
    }
    //选择职称的时候点击
    $("#text_title_name").focus(function () {
        layer.open({
            type: 2,
            content: "../../controls/selectTitle/selectTitle.html",
            area: ['610px', '450px'],
            scrollbar: false
        });
    });
    // 职称选择
    window.getChildTitle = function (titleId, titleName, type_id, list_order) {
        $("#hidden_title_id").val(titleId);
        $("#text_title_name").val(titleName);
    }


    /* 专业树初始化 */
    var specTreeSelect;
    var initSpecTree = window.initSpecTree = function (spec) {
        specTreeSelect = treeSelect.render({
            elem: '#specSelect',
            data: huayi_sjwh_url + 'comPersonSpec/tree',
            type: 'get',
            search: true,
            style: {
                folder: {   // 父节点图标
                    enable: true   // 是否开启：true/false
                },
                line: {     // 连接线
                    enable: true   // 是否开启：true/false
                }
            },
            click: function (data) {
                $("#hidden_spec").val(data.current.id);
            },
            success: function () {
                if (spec != null && spec != undefined && spec != "") {
                    specTreeSelect.checkNode('specSelect', spec);
                }
            }
        });
    }
    // 举办形式
    var initholdForm = function () {
        $.ajax({
            async: false,
            url: huayi_sjwh_url + 'comdictionary/getDicsByKindId',
            data: { kindId: 5 },
            success: function (re) {
                if (re && re.status == 200) {
                    let data = re.data;
                    for (let i = 0; i < data.length; i++) {
                        let holdFormName = data[i].dict_name;
                        let holdFormVal = data[i].dict_id;
                        let option = $('<option value="' + holdFormVal + '">' + holdFormName + '</option>');
                        $('#holdForm').append(option);
                    }
                    if (isHoldeFormPlus) {
                        let option = $('<option value="' + '44587c21-045f-4bed-aae8-1ae405bfabbf' + '">' + '面授与线上相结合' + '</option>');
                        $('#holdForm').append(option);
                    }
                } else {
                    layer.msg('举办形式加载失败', { icon: 7 });
                }
            },
            error: function () {
                layer.msg('举办形式加载失败', { icon: 7 });
            }
        });
    }

    let getTeacherMatchWarnMsg = function () {
        return isGuangdongTeacherCard ? "未匹配到相关人员，请手动输入或检查证件号码/医通卡号是否有误" : "未匹配到相关人员，请手动输入或检查证件号码是否有误";
    }

    let applyMatchedTeacher = function (teacher, options) {
        if (!teacher) return;
        let telephone = $("input[name='telephone']").val();
        let remark = $("input[name='remark']").val();
        let ifProjManager = $("select[name='ifProjManager']").val();
        let certId = trimTeacherVal(options && options.certId);
        let personNo = trimTeacherVal(options && options.personNo);
        $("input[name='teacherName']").val(teacher.teacherName || teacher.teacher_name || $("input[name='teacherName']").val());
        $("#teacherName").val(teacher.teacherName || teacher.teacher_name || $("#teacherName").val()); // fix for select placeholder
        $("#sex").val(teacher.sex);
        $("#select_education").val(teacher.education);
        $("#hidden_spec").val(teacher.personSpecId || teacher.dept || "");
        $("#hidden_title_id").val(teacher.title || "");
        $("#text_title_name").val(teacher.titleName || "");
        $("#unit").val(teacher.unitName || "");
        $("#select_hospital_duty").val(teacher.duty || "");
        if (certId) {
            $("#personNo").val("");
        } else if (personNo) {
            $("#teachNo").val("");
        }
        $("input[name='telephone']").val(telephone);
        $("input[name='remark']").val(remark);
        $("select[name='ifProjManager']").val(ifProjManager);
        if (teacher.personSpecId) {
            specTreeSelect.checkNode('specSelect', teacher.personSpecId);
        }
        layui.form.render('select');
    }

    let matchTeacherPerson = function (options) {
        let certId = trimTeacherVal(options.certId);
        let personNo = trimTeacherVal(options.personNo);
        if (!certId && !personNo) {
            return;
        }
        $.ajax({
            async: false,
            type: "get",
            url: huayi_projectscore_url + "cmeGroupprojTeacher/matchTeacher",
            data: {
                certId: certId,
                personNo: personNo,
                cmeStandardKindId: window.getCmeStandardKindId()
            },
            success: function (res) {
                if (res.success && res.data) {
                    applyMatchedTeacher(res.data, {
                        certId: certId,
                        personNo: personNo
                    });
                } else if (options.needWarn) {
                    layer.msg(getTeacherMatchWarnMsg(), { icon: 0, time: 2000 });
                }
            },
            error: function () {
                layer.msg("人员匹配失败");
            },
            complete: function () {
                toggleTeacherNoStatus();
            }
        });
    }

    window.teachNoBlur = function (obj) {
        let teachNo = trimTeacherVal($(obj).val());
        $(obj).val(teachNo);
        toggleTeacherNoStatus();
        if (!teachNo) {
            return;
        }
        let needScore = $("#needScore").val() !== "false";
        matchTeacherPerson({
            certId: teachNo,
            needWarn: needScore
        });
        layui.form.render();
    }
    
    window.personNoBlur = function (obj) {
        let personNo = trimTeacherVal($(obj).val());
        $(obj).val(personNo);
        toggleTeacherNoStatus();
        if (!personNo) return;
        let needScore = $("#needScore").val() !== "false";
        matchTeacherPerson({
            personNo: personNo,
            needWarn: needScore
        });
        layui.form.render();
    }

    // 获取直播类型和直播观看人数上限
    var getPolyvSetById = function () {
        $.ajax({
            type: 'post',
            async: false,
            url: huayi_projectscore_url + 'polyvProjApplyBefore/getPolyvSetById',
            data: { downId: downId },
            success: function (re) {
                if (re && re.status == 200) {
                    let data = re.data;
                    if (data) {
                        maxWatchNum = data.maxWatchNum;
                        setTemplate = data.setTemplate;
                    } else {
                        maxWatchNum = '';
                    }
                } else {
                    layer.msg('获取直播类型和直播观看人数上限失败', { icon: 7 });
                }
            },
            error: function () {
                layer.msg('获取直播类型和直播观看人数上限失败', { icon: 7 });
            }
        });
    }

    // 保存周期的直播设置
    var savePolyvProjApplyBefore = function (maxWatchNum, setTemplate) {
        $.ajax({
            type: 'post',
            url: huayi_projectscore_url + 'polyvProjApplyBefore/save',
            data: JSON.stringify({
                // maxWatchNum: maxWatchNum,
                setTemplate: setTemplate,
                downId: downId,
                projId: projId,
                addUser: localStorage.getItem('user-id'),
            }),
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            success: function (res) {
                if (res.status === 200) {
                    console.log('保存周期的直播设置成功')
                } else if (res.status === 500) {
                    layer.msg(res.msg);
                } else if (res.status === 10006) {
                    layer.msg(res.msg);
                }
            },
            error: function () {
                layer.msg("发送请求失败");
            }
        })
    }
    // 删除周期的直播设置
    var delPolyvProjApplyBefore = function () {
        $.ajax({
            type: 'post',
            url: huayi_projectscore_url + 'polyvProjApplyBefore/delPolyvSetById?downId=' + downId,
            contentType: 'application/json;charset=UTF-8',
            success: function (res) {
                if (res.status === 200) {
                    console.log('删除周期的直播设置成功')
                } else if (res.status === 500) {
                    layer.msg(res.msg);
                } else if (res.status === 10006) {
                    layer.msg(res.msg);
                }
            },
            error: function () {
                layer.msg("发送请求失败");
            }
        })
    }

    //鼠标移入弹出文件信息
    window.mouseoverImageName = function (elem) {
        showTips(elem.getAttribute("msg"), elem, '#000000', '#d3d3d3');
    }
    //鼠标移出关闭文件信息
    window.mouseoutImageName = function (elem) {
        closeTips();
    }
    window.closeTips = function () {
        layer.close(subtips);
    }
    //文件下载或者文件另一个窗口打开
    window.downloadFileT = function (elem) {
        let fileUrl = $(elem).attr("msg");
        if (fileUrl.indexOf(".jpg") > 0 || fileUrl.indexOf(".png") > 0 || fileUrl.indexOf(".bmp") > 0 || fileUrl.indexOf(".jpeg") > 0) {
            window.open(encodeURI(fileUrl));
        } else {
            // var iframe = document.createElement("iframe");
            // iframe.src = fileUrl;
            // iframe.style.display = "none";
            // document.body.appendChild(iframe);
            $(elem).attr("href", fileUrl).attr("download", "会议通知.pdf").attr("target", "_blank");
            $(elem).click();

        }

    }
    window.downloadFeedFile = function (elem) {
        let filePath = elem.getAttribute("filePath");
        let fileName = elem.innerText;
        //下载模板
        if (fileName.indexOf(".jpg") > 0 || fileName.indexOf(".jpeg") > 0 || fileName.indexOf(".png") > 0 || fileName.indexOf(".bmp") > 0 || fileName.indexOf(".JPG") > 0 || fileName.indexOf(".PNG") > 0 || fileName.indexOf(".BMP") > 0 || fileName.indexOf(".pdf") > 0) {
            window.open(filePath);
        } else {
            tool.downloadUseIfram(filePath);
        }
    }

    window.deleteImage = function (elem) {
        let fileId = elem.parentElement.getAttribute("file-id");
        $.ajax({
            url: applyApiUrl + 'deleteFile',
            type: 'post',
            data: { fileId: fileId },
            success: function (res) {
                if (res.status === 200) {
                    elem.parentElement.remove();
                    layer.msg(res.msg);
                } else {
                    layer.msg(res.msg);
                }
            },
            fail: function () {
                layer.msg("删除失败");
            }
        });

    }
    window.showTips = function (msg, elem, color, bgcolor) {
        msg = '<span style="color: ' + color + ';">' + msg + '</span>';
        subtips = layer.tips(msg, elem, { tips: [1, bgcolor], time: 0 });
    }
    //关闭closeLoading的判断
    window.closeLoading = function () {
        ajaxNum--;
        if (ajaxNum <= 0 && loading) {
            layer.close(loading);
        }
    }
    // Esc关闭弹窗
    window.onkeyup = function (ev) {
        var key = ev.keyCode || ev.which;
        if (key == 27) {
            layer.close(layer.index);
            console.log('layer.index = ' + layer.index)
        }
    }

    function initCertVerifyInfo(needScore) {
        if (isGuangdongTeacherCard) {
            $("[data-id='spanOnCert']").hide();
            $("#teachNo").removeAttr("lay-verify");
        } else if (needScore) {
            $("[data-id='spanOnCert']").show();
            $("#teachNo").removeAttr("lay-verify");
        } else {
            $("[data-id='spanOnCert']").hide();
            $("#teachNo").removeAttr("lay-verify");
        }
        toggleTeacherNoStatus();
    }

    form.verify({
        // 重写required校验规则
        required: function (value, item) {
            // 判断元素是否可见
            if ($(item).is(':hidden')) return;

            // 原始required校验逻辑
            var tip = item.getAttribute('lay-reqText') || '必填项不能为空';
            if (typeof value === 'number') {
                value = value.toString();
            }
            if (value === '' || value === null || value === undefined) {
                return tip;
            }
        },
        holdPlace: [/^.{1,100}$/, '举办地点最多100个汉字'],
        unitName: [/^.{1,40}$/, '最多个40汉字'],
        period: [/^0(\.5{1}|\.0{1})$|^[1-9]+[0-9]*(\.5{1}|\.0{1})?$/, '学时必须是0.5的倍数'],
        applScore: function (value, item) {
            // 修改学分时不能大于申报学分
            var msg = "";
            if (value < 0) {
                return msg = '授予学分不能小于0';
            }
            if (isLoadApplProj && projectPublishId) {
                let applScore = applProjDetail(projectPublishId);
                //applScore !=0 防止数据有问题
                if (applScore != 0 && value > applScore) {
                    msg = ("授予学分不能大于项目公布时的学分");
                }
            }
            return msg;
        },
        "rightCertId": checkTeachNo,
        // “主要内容”字数限制1~300个汉字
        content: function (value, item) {
            if ($(item).is(':hidden')) return;
            if (value.length > 300 || value.length < 1) {
                return "主要内容限制1~300个汉字";
            }
            return "";
        }
    });

    function checkTeachNo(value, item) {
        if (!value) {
            return;
        }
        if (!isCertId(value)) {
            return "请输入正确的证件号码";
        }
    }

    //获取配置信息, 行政单位审核举办前申请时, 添加显示申报时的项目公布信息及课程教师信息
    let getConfig = function () {
        let configName1 = "fun_apply_approval_proj"
            , configName2 = "fun_appl_paper_in_groupproj"
            , configName3 = "fun_teachdate_equal_downdate"
            , configName4 = "fn_projapply_holdform_other"
            , configName5 = "value_forbid_some_operate_on_last_year_data";
        let configUrl = huayi_sjwh_url + `cmeCommonConfig/getConfigByUnitFromRedis?unitId=${unitId}&configNames=${configName1}&configNames=${configName2}&configNames=${configName3}&configNames=${configName5}`
        commonAjax('post', configUrl,
            {}, function () { layer.msg("配置信息加载失败"); },
            function (res) {
                if (res.status == 200 || tool.isEmpty(res.data)) {
                    if (res.data.hasOwnProperty(configName1) && res.data[configName1] == 1) {
                        // isLoadApplProj = true;
                    }
                    if (res.data.hasOwnProperty(configName2) && res.data[configName2] == 1) {
                        isApplPaper = true;
                    }
                    if (res.data.hasOwnProperty(configName3) && res.data[configName3] == 1) {
                        isTeachDateEqualDowndate = true;
                    }
                    if (res.data.hasOwnProperty(configName4) && res.data[configName4] == 1) {
                        isHoldeFormPlus = true;
                    }
                    if (res.data.hasOwnProperty(configName5)) {
                        window["value_forbid_some_operate_on_last_year_data"] = res.data[configName5];
                    }
                } else { layer.msg("配置信息加载失败"); }
            });
    }
    window.getConfig = function (config_name, scoreLevel) {
        $.ajax({
            async: false,
            type: 'post',
            url: huayi_sjwh_url + 'cmeCommonConfig/getConfigByUnitFromRedis',
            data: {
                unitId: unitId,
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
    window.getConfig('fn_groupapply_update_field');


    window.ableOperateLastYearData = function (dataYear) {
        let cgv = window["value_forbid_some_operate_on_last_year_data"];
        if (cgv == null || cgv == "") {
            return true;
        }

        let able = true;
        let deadline = new Date(cgv);
        let now = new Date();
        if (parseInt(dataYear) < now.getFullYear()) {
            if (deadline < now) {
                able = false;
            }
        }
        return able;
    }

    // // 获取课程和教学方法匹配限制配置信息
    let getTitleTeachingMethodConfig = function () {
        let configName1 = "fun_title_teaching_method"
            , configName2 = "value_group_person_limit_ceiling_when_input";
        let configUrl = huayi_sjwh_url + `cmeCommonConfig/getConfigByUnitFromRedis?unitId=${unitId}&configNames=${configName1}&configNames=${configName2}&scoreLevelId=${scoreLevelId}`
        commonAjax('post', configUrl,
            {}, function () { layer.msg("配置信息加载失败"); },
            function (res) {
                if (res.status == 200 || tool.isEmpty(res.data)) {
                    if (res.data.hasOwnProperty(configName1) && res.data[configName1] == 't') {
                        isCheckTitleTeachingMethod = true;
                    }
                    if (res.data.hasOwnProperty(configName2) && res.data[configName2] > 0) {
                        personLimitCeiling = res.data[configName2];
                    }
                } else { layer.msg("配置信息加载失败"); }
            });
    }
    // 文件上传配置信息
    let getTabConfig = function () {
        let tempConfigUrl = huayi_sjwh_url + `cmeCommonConfig/getConfigByUnitFromRedis?unitId=${myUnitId}&configNames=${configName1}`;
        commonAjax("post", tempConfigUrl, {}, function () { },
            function (res) {
                if (res.status == 200) {
                    configMap = res.data;
                    createFeedback(res.data);
                } else {
                    layer.msg("加载配置信息失败");
                }
            }
        )
    }

    //处理tab页，该可能是配置获得的，需要动态构建
    let createFeedback = function (datas) {
        let downloadTemplate = '';
        if (HAINAN == standardkindId) {
            downloadTemplate = 'HNdownloadTemplate';
            downloadUrl = "/file/HaiNanApplyTemplate.docx";
        } else if (gan_su_tao_id == standardkindId) {
            downloadTemplate = 'GSdownloadTemplate';
            downloadUrl = "/file/GanSuApplyTemplate.docx";
        }
        
        fileUpObj = tool.createApplyImgUp(datas, fileUpObj, configName1, downloadTemplate);
        fileUpload();//文件上传按钮监听
    }
    //初始化各种下拉框
    var initPerDic = window.initDics = function () {
        // 初始化表格
        loaderTable();
        getConfig();
        getTabConfig();//请求config,并初始化tab页
        //初始化学历下拉框
        window.initPerDic("select_education", 1, "初始化学历下拉框失败");

        //初始化院内职务
        window.initPerDic("select_hospital_duty", 6, "初始化院内职务下拉框失败");

        //海南必须录入证件号
        //getCmeStandardKindId().toLowerCase() == HAINAN && $("#needScore").addClass("layui-disabled").prop("disabled", 'disabled');

        form.render("select");

        initSpecTree();
        initholdForm();

        if (standardkindId == ji_lin_tao_id) {
            $("#projInfoJiLin").show();
            $("#projInfo").remove();
            $("#batchInfo").remove();
        } else {
            $("#projInfoJiLin").remove();
            $("#projInfo").show();
            $("#batchInfo").show();
        }
        
    }
    initPerDic();

});
