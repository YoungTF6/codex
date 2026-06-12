// declare.js

layui.config({
    base: '/js/layui/ext/'
}).extend({
    tool: 'tool',
    xmSelect: 'xm-select',
    ysUpload:'ysUpload'
}).use(['jquery', 'element', 'table', 'form', 'layer', 'tool', 'xmSelect', 'upload','ysUpload'], function () {
    let $ = layui.jquery;
    let table = layui.table;
    let form = layui.form;
    let laydate = layui.laydate;
    let tool = layui.tool;
    let layer = layui.layer;
    let element = layui.element;
    let xmSelect = layui.xmSelect;
    let upload = layui.upload;
    let ysUpload = layui.ysUpload;

    const _standardKindId = getOrDefault(localStorage.getItem('standardkind-id'), DefaultConst.STANDARD_KIND_ID);
    const _unitId = getOrDefault(localStorage.getItem('unit-id'), DefaultConst.UNIT_ID);
    const _userId = getOrDefault(localStorage.getItem('user-id'), DefaultConst.USER_ID);
    const _scoreLevelId = getOrDefault(getUrlParamByName('score_level_id'), 'e551a983-8236-4520-9deb-9bb50009e43e');
    let gHoldYear = Number.parseInt(getOrDefault(getUrlParamByName('hold_year'), '2022'));
    const _source = getOrDefault(getUrlParamByName('source'), 'unit');
    const _zhCn = Number.parseInt(getOrDefault(getUrlParamByName('zh_cn'), 1));
    // let gProjectId = getOrDefault(getUrlParamByName('project_id'), '72fc6735-93db-51e4-35c1-f09dbc27fc13');
    let gProjectId = getOrDefault(getUrlParamByName('project_id'), '');
    let gProjAttachmentRendered = false;
    const _isHubei = '73ba18db-33fd-4746-ab41-9beb009f69a1' === _standardKindId;

    let gFieldArr = []; // defaultFormRes.data;
    let gKnowledgeCode = '';
    let gKnowledgeTwoCode = '';
    let gUnitMainId = '';
    let gFileName = '';

    let gProjectDetail = {}; // defaultProDetailRes.data;
    // let gCycleArr = getOrDefault(gProjectDetail.cycleVOList, []);
    let gAttachmentArr = getOrDefault(gProjectDetail.attachmentVoList, []);
    let gProjectExt = getOrDefault(gProjectDetail.projectExt, []);
    let gCourseArr = getOrDefault(gProjectExt.formData3, []);
    let gFormData1 = getOrDefault(gProjectExt.formData1, '""');
    let gFormData2 = getOrDefault(gProjectExt.formData2, '""');
    let gFormData3 = getOrDefault(gProjectExt.formData3, []);
    let gFormData4 = getOrDefault(gProjectExt.formData4, '""');
    let gFormData5 = getOrDefault(gProjectExt.formData5, '""');
    let gOther1 = '';
    let gOther2 = '';
    let gProjRendered = false;
    let gProjPriRendered = false;
    let gProjCouRendered = false;
    let gProjCycRendered = false;
    let gCourseVerify = false;
    let gTitleTreeData;
    let gTitleTreeSelector;
    let gSpecTreeSelector;
    let gBusinessSelector;
    let gLayerIndex;
    let gPeriod = 0;
    let gTheoryPeriod = 0;
    let gExperimentPeriod = 0;
    let gScore = 0;
    let gTabBacked = false;
    let gOldKnowledgeId = '';
    let gNewKnowledgeId = '';
    let gCategory = 0;
    let fileNum6 = 1;
    let fileNum7 = 1; 
    let fileNum8 = 20;
    let fileNum9 = 20;
    let fileNum10 = 20;
    let gTechnologyType = '';
    let gInnovativeProducts = '';
    let gFileType = '';



    // console.info('layui.use');

    // window.addCycle = addCycle;

    window.onload = function () {
        // console.info('window.onload');
    }

    $(function () {
        // console.info('document.ready');
    });

    layer.ready(function () {
        // console.info('layer.ready');

        loadProjectDetail(gProjectId);

        // 第一页
        tool.render2ndKnowledge('select[name=knowledgeTwoId]');

        // 第二页
        // tool.renderDuty('select[name=business]');
        tool.renderDuty('select[name=principalBusiness]');
        tool.renderEducation('select[name=education]');

 

        getTitleTreeData().then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                gTitleTreeData = jsonRes.data;
            } else {
                tool.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            tool.errorMsg('error:加载titleTreeData');
        }).finally(() => {
            let conf = {
                tree: {
                    clickExpand: true,
                    clickCheck: false
                },
                name: 'titleId',
                layVerify: 'required',
                layVerType: '请选择职称',
            };
            gBusinessSelector = tool.renderDuty('#principalBusiness');
            gTitleTreeSelector = tool.renderTitleTreeSelector('#titleTreeSelector', gTitleTreeData, conf);
            
        });
        // spec
        getSpecTreeData(2).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                gSpecTreeData = jsonRes.data;
            }
        }).catch(error => {
            layer.msg('error:加载specTreeData');
        }).finally(() => {
            gSpecTreeSelector = tool.renderSpecTreeSelector('#specTreeSelector', gSpecTreeData, {
                tree: {
                    clickExpand: true,
                    clickCheck: false
                },
                name: 'personSpecId',
                layVerify: 'required',
                layVerType: '请选择专业',
            });
        });
        // 第四页
        tool.renderCheckType('select[name=checkTypeId]'); // 考核方式
        tool.renderHoldType('select[name=holdTypeId]', '___'); // 举办方式

    });

    // separate

    // index
    element.on('tab(declare-tab)', function () {
        let layId = this.getAttribute('lay-id');
        let isPage1 = ('page1' === layId);
        isPage1 && !gProjectId && echoProj();
        if (!isPage1 && !gProjectId) {
            if (!gTabBacked) {
                tool.failMsg('请先填写并保存项目基本信息');
                gTabBacked = true;
                element.tabChange('declare-tab', 'page1');
                gTabBacked = false;
            }
        } else {
            ('page3' === layId) && echoCourse();
            ('page6' === layId) && echoAttachment();
        }
        // ('page3' === layId) && echoCourse();

    });

    // index
    form.on('submit(save)', function (data) {
        console.info('sava.....');
        gLayerIndex = tool.loading();
        let fields = data.field;
        let pageNum = Number.parseInt(fields.pageNum);
        (pageNum === 1) && submit1(fields);
        (pageNum === 2) && submit2(fields);
        (pageNum === 3) && submit3(gCourseArr);
        (pageNum === 4) && submit4(fields);
        (pageNum === 5) && submit5(fields);
        (pageNum === 6) && submit6(fields);
        layer.close(gLayerIndex);
        return false;
    });

    // index
    form.on('submit(saveToNext)', function (data) {
        console.info('savaToNext.....');
        gLayerIndex = tool.loading();
        let fields = data.field;
        let pageNum = Number.parseInt(fields.pageNum);
        (pageNum === 1) && submit1(fields, true);
        (pageNum === 2) && submit2(fields, true);
        (pageNum === 3) && submit3(gCourseArr, true);
        (pageNum === 4) && submit4(fields, true);
        // 保存-关闭, 保存-上报-关闭
        (pageNum === 5) && submit5(fields, true);
        (pageNum === 6) && submit6(fields, true);
        layer.close(gLayerIndex);
        return false;
    });

    // index
    function loadProjectDetail(projectId) {
        if (projectId) {
            // show loading
            gLayerIndex = tool.loading();
            projDetailByIdSYJS(projectId).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success && jsonRes.data) {
                    gProjectDetail = jsonRes.data;
                    gHoldYear = gProjectDetail.holdYear;
                    // gCourseArr = gProjectDetail.courseVOList;
                    // gCycleArr = gProjectDetail.cycleVOList;
                    gProjectExt = gProjectDetail.projectExt;
                    if(gProjectExt){
                        gFormData1 = gProjectExt.formData1;
                        gFormData2 = gProjectExt.formData2;
                        gFormData3 = gProjectExt.formData3;
                        gCourseArr = gProjectExt.formData3 == null ? [] : JSON.parse(gProjectExt.formData3);
                        gFormData4 = gProjectExt.formData4;
                        gFormData5 = gProjectExt.formData5;
                    }
                    gAttachmentArr = gProjectDetail.attachmentVoList;
                    wrapperAttachment();
                } else if(!jsonRes.success){
                    tool.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                tool.errorMsg('error:加载项目信息');
            }).finally(() => {
                // 第三页
                // initTable();
                echoProj();
            });
        }
    }

    // index.verify
    form.verify({
        // page1
        projectName: [/^.{1,75}$/, '项目名称最多75个汉字'],
        unitName: [/^.{1,40}$/, '最多个40汉字'],
        unitLocation: [/^.{1,100}$/, '最多个100汉字'],
        unitAdress: [/^.{1,100}$/, '最多个100汉字'],
        unitPhone: [/^.{1,75}$/, '手机号码格式不正确'], 
        postcode: [/^\d{6}$/, '请输入正确的邮政编码'], 
        // faxNumber: [/^.{1,20}$/, '请输入正确的传真号码'],
        principalName: [/^.{1,20}$/, '最多个20汉字'],
        certId: [/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X)$)/,"身份证号码格式不正确"], 
        specDirection: [/^.{1,100}$/, '最多个100汉字'],
        principalPhone: [/^.{1,75}$/, '手机号码格式不正确'], 
        knowledgeName: [/^.{1,20}$/, '最多个20汉字'],

        // page2
        progress: [/^.{1,400}$/s, '最多个400汉字'],
        alternativeTechnologies: [/^.{1,400}$/s, '最多个400汉字'],
        technologyInnovation: [/^.{1,400}$/s, '最多个400汉字'],
        adaptation: [/^.{1,400}$/s, '最多个400汉字'],
        clinicalFesearch: [/^.{1,400}$/s, '最多个400汉字'],
        security: [/^.{1,400}$/s, '最多个400汉字'],
        effectivenessDiagnosis: [/^.{1,400}$/s, '最多个400汉字'],
        effectivenessDetection: [/^.{1,400}$/s, '最多个400汉字'],
        effectivenessPrevent: [/^.{1,400}$/s, '最多个400汉字'],
        effectivenessTreatment: [/^.{1,400}$/s, '最多个400汉字'],
        effectivenessRecovery: [/^.{1,400}$/s, '最多个400汉字'],
        economyCost: [/^.{1,400}$/s, '最多个400汉字'],
        economySelfPay: [/^.{1,400}$/s, '最多个400汉字'],
        economyIsPay: [/^.{1,400}$/s, '最多个400汉字'],
        operationalStep: [/^.{1,400}$/s, '最多个400汉字'],
        operationalPersonAsk: [/^.{1,400}$/s, '最多个400汉字'],
        operationalTimeAsk: [/^.{1,400}$/s, '最多个400汉字'],
        operationalRatioTrust: [/^.{1,400}$/s, '最多个400汉字'],
        suitabilityPerson: [/^.{1,400}$/s, '最多个400汉字'],
        suitabilityTechnology: [/^.{1,400}$/s, '最多个400汉字'],
        impact1: [/^.{1,400}$/s, '最多个400汉字'],
        impact2: [/^.{1,400}$/s, '最多个400汉字'],
        impact3: [/^.{1,400}$/s, '最多个400汉字'],
        impact4: [/^.{1,400}$/s, '最多个400汉字'],

        // page4
        workContent: [/^.{1,400}$/s, '最多个400汉字'],
        planTarget: [/^.{1,400}$/s, '最多个400汉字'],
        assessmentIndicators: [/^.{1,400}$/s, '最多个400汉字'],

        // page5 
        // (^[1-9]([0-9]{0,15})(\.[0-9]{1,2})?$)|(^[0-9]{1}(\.[0-9]{1,2})?$);
        totalFinancialAllocation: [/^(0|([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/, '请输入正确的金额, 保留两位小数'], 
        hotelFee: [/^(0|([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/, '请输入正确的金额, 保留两位小数'], 
        mealFee: [/^(0|([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/, '请输入正确的金额, 保留两位小数'], 
        siteFee: [/^(0|([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/, '请输入正确的金额, 保留两位小数'], 
        teachFee: [/^(0|([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/, '请输入正确的金额, 保留两位小数'], 
        dataFee: [/^(0|([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/, '请输入正确的金额, 保留两位小数'], 
        materialFee: [/^(0|([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/, '请输入正确的金额, 保留两位小数'], 
        trafficFee: [/^(0|([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/, '请输入正确的金额, 保留两位小数'], 
        humanResourcesCost: [/^(0|([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/, '请输入正确的金额, 保留两位小数'], 
        manageFee: [/^(0|([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/, '请输入正确的金额, 保留两位小数'], 
        otherFee: [/^(0|([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/, '请输入正确的金额, 保留两位小数'], 
        totalFee: [/^(0|([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/, '请输入正确的金额, 保留两位小数'], 

        hotelFeeReason: [/^.{1,100}$/, '最多个100汉字'],
        mealFeeReason: [/^.{1,100}$/, '最多个100汉字'],
        siteFeeReason: [/^.{1,100}$/, '最多个100汉字'],
        teachFeeReason: [/^.{1,100}$/, '最多个100汉字'],
        dataFeeReason: [/^.{1,100}$/, '最多个100汉字'],
        materialFeeReson: [/^.{1,100}$/, '最多个100汉字'],
        trafficFeeReason: [/^.{1,100}$/, '最多个100汉字'],
        humanResourcesCostReason: [/^.{1,100}$/, '最多个100汉字'],
        manageFeeReason: [/^.{1,100}$/, '最多个100汉字'],
        otherReason: [/^.{1,100}$/, '最多个100汉字'],

    });


    // separate

    // form
    function loadFormConfig() {
        let visit = huayi_sjwh_url + 'dc/default';
        let params = {
            standardKindId: '',
            topUnitId: '',
            cmeYear: 2022,
            scoreLevelId: ''
        };
        postAction(visit, params).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                gFieldArr = jsonRes.data;
            } else {
                tool.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            tool.errorMsg('error:加载表单配置');
        }).finally(() => {
        });
    }

    // form
    function renderForm() {
        // console.info('begin render form...');
        gFieldArr.forEach(field => {
            if ((300 <= field.listOrder) && (field.listOrder < 400)) {
                // 第三页
                // let i = field.listOrder - 301;
                // gCourseTableColArr[i].field = field.fieldName;
                // gCourseTableColArr[i].title = field.label;
                // gCourseTableColArr[i].hide = !field.required;
                // gCourseTableColArr.forEach(ctCol => {
                //     if (ctCol.field === field.fieldName) {
                //         ctCol.title = field.label;
                //         ctCol.hide = !field.required;
                //     }
                // });
            } else {
                // 第一二四页
                renderField(field);
            }
        });
        $('#someTpl').css('display', 'none');
        layui.form.render("select");
        layui.form.render('checkbox');
        // console.info('end render form...');
    }

    // form
    function renderField(field) {
        // get dom element
        // div -> (label -> span),(div -> input)
        let selector = "#page{0}-form {1}[name='{2}']".format(Math.floor(field.listOrder / 100), field.type, field.fieldName)
            .replaceAll(/radio|checkbox|switch/g, 'input');
        let $field = $(selector);
        let $div = $field.parent().parent();
        let $label = $div.children('label').eq(0);
        // let $star = $label.children('span').eq(0);
        // set element props
        $div.css('display', field.display ? 'block' : 'none');
        $label.html(((field.required) ? '<span style="color:#ff0000">*&nbsp;</span>' : '') + field.label);
        $field.attr('lay-verify', function (i, val) {
            return val.replace('required', field.required ? 'required' : '').replace(',,', ',');
        });
    }

    // separate

    // page1
    form.on('select(knowledgeTwoIdSelect)', function (data) {
        let val = data.value;
        //
        let code = $('select[name=knowledgeTwoId]').find('option[value=' + val + ']').attr('kcode');
        let name = $('select[name=knowledgeTwoId]').find('option[value=' + val + ']')[0].innerText;
        // console.info('knowledgeTwoCode: %s ', code);
        gKnowledgeTwoCode = code;
        $("#knowledgeTwoName").val(name);

        changeKnowledgeTwoId(val);
    });

    // page1
    form.on('select(knowledgeIdSelect)', function (data) {
        // 新增时获取[knowledgeCode] [knowledgeTwoCode] [unitMainId]
        let knowledgeId = data.value;
        gOldKnowledgeId = gNewKnowledgeId;
        gNewKnowledgeId = knowledgeId;
        if (knowledgeId) {
            let code = $('select[name=knowledgeId]').find('option[value=' + knowledgeId + ']').attr('kcode');
            // console.info('knowledgeCode: %s ', code);
            gKnowledgeCode = code;
            //
            frPrepare(knowledgeId, _unitId).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    gKnowledgeCode = jsonRes.data.knowledgeCode;
                    gKnowledgeTwoCode = jsonRes.data.knowledgeTwoCode;
                    gUnitMainId = jsonRes.data.unitMainId;
                } else {
                    tool.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                tool.errorMsg("error:加载初始信息");
            }).finally(() => {

            });
        }
    });

    // page1
    function changeKnowledgeTwoId(knowledgeTwoId) {
        // console.info('select knowledgeTwoId: %s', knowledgeTwoId);
        if (knowledgeTwoId) {
            tool.render3rdKnowledge(knowledgeTwoId, 'select[name=knowledgeId]');
        } else {
            $('select[name=knowledgeId]').empty();
            form.render('select');
        }
    }

    // page1
    function submit1(params, toNext) {
        var formData = JSON.stringify(params);
        console.info('formData1: %s', formData);
        params.formData1 = formData;
        if (gProjectId.length < 1) {
            params.fresh = true;
            params.cmeStandardKindId = _standardKindId;
            params.unitId = _unitId;
            params.unitMainId = gUnitMainId;
            params.userCreate = _userId;
            params.userId = _userId;
            params.scoreLevelId = _scoreLevelId;
            params.holdYear = gHoldYear;
            params.status = 0;
            params.previousCheckUnitId = '000000';
            params.projectType = _zhCn;
            params.subjectType = _zhCn;
        } else {
            params.fresh = false;
            params.projectId = gProjectId;
            params.holdYear = gHoldYear;
            params.cmeStandardKindId = _standardKindId;
            params.unitId = _unitId;
            params.scoreLevelId = _scoreLevelId;
            params.changeKnowledgeId = (gOldKnowledgeId !== gNewKnowledgeId);
        }
        params.knowledgeIdE = params.knowledgeId;
        params.knowledgeNameE = params.knowledgeName;
        params.knowledgeTwoIdE = params.knowledgeTwoId;
        params.knowledgeTwoCode = gKnowledgeTwoCode;
        params.knowledgeCode = gKnowledgeCode;
        console.info('submit1: %s', JSON.stringify(params));
        let res = false;
        declareProjActionSYJS(removeEmpty(params)).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                tool.okMsg('项目基本信息保存完成');
                gProjectId = jsonRes.data.projectId;
                res = true;
                wrapperAttachment();
            } else {
                tool.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            tool.errorMsg('error:保存项目基本信息');
        }).finally(() => {
            (res && toNext) && element.tabChange('declare-tab', 'page2');
        });
        return false;
    }

    // page1
    function echoProj() {
        if (!gProjRendered && gProjectDetail) {
            // knowledgeTwoId
            let knowledgeTwoId = gProjectDetail.knowledgeTwoId;
            // console.info('knowledgeTwoId: %s', knowledgeTwoId);
            let $select = $("select[name='knowledgeTwoId']:eq(0)");
            $select.next().children('dl').children("dd[lay-value='" + knowledgeTwoId + "']").click();

            // knowledgeId
            changeKnowledgeTwoId(knowledgeTwoId);
            gOldKnowledgeId = gProjectDetail.knowledgeId;
            gNewKnowledgeId = gOldKnowledgeId;

            debugger
            // 技术类别
            console.log(JSON.parse(gFormData2))
            if(JSON.parse(gFormData2) && JSON.parse(gFormData2).other1){
                document.getElementById("other1").style.display = "block";
                gOther1 = JSON.parse(gFormData2).other1;
            }
            if(JSON.parse(gFormData2) && JSON.parse(gFormData2).other2 ){
                document.getElementById("other2").style.display = "block";
                gOther2 = JSON.parse(gFormData2).other2;
            }
            if(JSON.parse(gFormData2)){
                gInnovativeProducts = JSON.parse(gFormData2).innovativeProducts;
                gTechnologyType = JSON.parse(gFormData2).technologyType;
            }
            // echo
            setTimeout(function () {
                console.log('loading form....')
                console.log(gProjectExt);
                form.val('page1-form', JSON.parse(gFormData1));
                form.val('page2-form', JSON.parse(gFormData2));
                // form.val('page3-form', JSON.parse(gFormData3));
                form.val('page4-form', JSON.parse(gFormData4));
                form.val('page5-form', JSON.parse(gFormData5));
                echoCourse();
                // close loading
                layer.close(gLayerIndex);
                gProjRendered = true;
            }, 300);
        }

    }

    // separate

    // page2
    function submit2(params, toNext) {
        debugger
        // 技术类别 其他
        // var child = $(".technologyTypeDiv input[type='checkbox']:checked");
        // var tempTechnologyType = ''
        // child.each(function (index, item) {
        //     tempTechnologyType +=  item.value + ', ';
        // });
        // gTechnologyType = tempTechnologyType.substring(0, tempTechnologyType.length - 2);
        // gTechnologyType = gTechnologyType + $("#other1").val();
        
        // var tempInnovativeProducts = ''
        // child.each(function (index, item) {
        //     tempInnovativeProducts +=  item.value + ', ';
        // });
        // gInnovativeProducts = tempInnovativeProducts.substring(0, tempInnovativeProducts.length - 2);
        // gInnovativeProducts = gInnovativeProducts + $("#other2").val();
        
        params.technologyType = gTechnologyType;
        params.innovativeProducts = gInnovativeProducts;
        var formData = JSON.stringify(params);
        console.info('formData2: %s', formData);
        if(formData.indexOf('technologyType[6]') < 0 ){
            params.other1 = '';
        }
        if(formData.indexOf('innovativeProducts[7]') < 0 ){
            params.other2 = '';
        }
        formData = JSON.stringify(params);

        // 技术类型 其他输入框
        if(formData.indexOf('technologyType[6]') >= 0 && $('#other1').val() == ''){
            layer.msg('技术类型选择其他时请注明');
            return false;
        }
        if(formData.indexOf('innovativeProducts[7]') >= 0 && $('#other2').val() == ''){
            layer.msg('技术类型选择其他时请注明');
            return false;
        }



        params.formData2 = formData;

        params.userCreate = _userId;
        params.cmeStandardKindId = _standardKindId;
        params.projectId = gProjectId;
        console.info('submit2: %s', JSON.stringify(params));
        let res = false;
        declareProjActionSYJS(removeEmpty(params)).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                tool.okMsg('项目详细信息保存完成');
                res = true;
            } else {
                tool.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            tool.errorMsg('error:保存项目详细信息');
        }).finally(() => {
            (res && toNext) && element.tabChange('declare-tab', 'page3') && echoCourse();
        });
    }

    // page2
    function echoPrincipal(principal) {
        if (!gProjPriRendered && gProjectDetail && gProjectDetail.principalVO) {
            form.val('page2-form', gProjectDetail.principalVO);
            let titleId = gProjectDetail.principalVO.titleId;
            gTitleTreeSelector.setValue([titleId]);
            gProjPriRendered = true;
        }
    }

    // separate

    // page3
    table.on('toolbar(courseTable)', function (obj) {
        if ('addCourse' === obj.event) {
            if (gCourseArr.length >= 20) {
                tool.failMsg('最多能添加二十个');
                return false;
            }
            gCourseArr.push({
                'principalId': uuid(),
                'projectId': gProjectId,
                'fresh': true,
                'principalName': '',
                'specId': '',
                'specName': '',
                'principalBusiness': '',
                // 'principalBusinessName': '',
                'titleId': '',
                'titleName': '',
                'principalPhone': '',
                'principalEmail': '',
                'cstate': 1,
                'userCreate': _userId
            });
            table.reload('courseTable', { data: gCourseArr });
        }
    });

    // page3
    table.on('tool(courseTable)', function (obj) {
        let rowData = obj.data;
        if ('delCourse' === obj.event) {
            gCourseArr = gCourseArr.filter(course => course.principalId !== rowData.principalId);
            table.reload('courseTable', { data: gCourseArr });
        }
    });

    // page3
    table.on('edit(courseTable)', function (obj) {
        let val = obj.value;
        let field = obj.field;
        ('teacherName' === field) && changePeriod(val);
        ('idCardNo' === field) && changePeriod(val);
        ('researchDirection' === field) && changePeriod(val);
        ('workUnit' === field) && changePeriod(val);
        ('teachTopic' === field) && changePeriod(val);
        ('content' === field) && changePeriod(val);
        ('period' === field) && changePeriod(val);
    });

    // page3
    function changePeriod(val) {

    }

    // page3
    function verifyCourse(courseArr) {
        debugger
        for (let course of courseArr) {
            if (Object.keys(course).length !== Object.keys(removeEmpty(course)).length) {
                return false;
            }
        }
        return true;
    }

    // page3
    function submit3(courseArr, toNext) {
        let formData = JSON.stringify(courseArr);
        console.info('submit3: %s', JSON.stringify(courseArr));
        if (courseArr.length < 1) {
            tool.failMsg('请填写项目推广范围');
            return false;
        }
        if (!verifyCourse(courseArr)) {
            tool.failMsg('必填项不能为空,请完善项目推广范围');
            return false;
        }
        var params = {};
        params.formData3 = formData;

        params.userCreate = _userId;
        params.cmeStandardKindId = _standardKindId;
        params.projectId = gProjectId;
        console.info('submit2: %s', JSON.stringify(params));
        let res = false;
        declareProjActionSYJS(removeEmpty(params)).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                tool.okMsg('项目推广范围信息保存完成');
                res = true;
            } else {
                tool.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            tool.errorMsg('error:保存项目推广范围信息');
        }).finally(() => {
            (res && toNext) && element.tabChange('declare-tab', 'page4') && echoCourse();
        });
        
    }

    // page3
    function calcPeriod() {
        gPeriod = 0;
        gTheoryPeriod = 0;
        gExperimentPeriod = 0;
        gScore = 0;
        gCourseArr.forEach(course => {
            if ('面授,理论'.includes(course.teachingMethod)) {
                gTheoryPeriod = accAdd(gTheoryPeriod, course.period);
            } else {
                gExperimentPeriod = accAdd(gExperimentPeriod, course.period);
            }
        });
        gPeriod = accAdd(gTheoryPeriod, gExperimentPeriod);
        gScore = (gPeriod / 6).toFixed(1);
        gScore = gScore > 5.0 ? 5.0 : gScore;

        form.val('page4-form', {
            period: gPeriod,
            theoryPeriod: gTheoryPeriod,
            experimentPeriod: gExperimentPeriod,
            // score: gScore
        });
    }

    // page3
    function echoCourse() {
        console.log('echoCourse')
        if (!gProjCouRendered) {
            let courseTableColArr = [
                { field: 'region', title: '地区', align: 'center', minWidth: 90, edit: 'text', sort: false, hide: false,
                },
                { field: 'applicationUnit', title: '应用单位', align: 'center', minWidth: 180, edit: 'text', sort: false, hide: false,
                },
                { field: 'principalName', title: '应用方项目负责人', align: 'center', minWidth: 170, edit: 'text', sort: false, hide: false,
                },
                { field: 'principalspec', title: '专业', align: 'center', minWidth: 200, sort: false, hide: false,
                    templet: '#courseSpecIdCell'
                },
                { field: 'principalBusiness', title: '职务', align: 'center', minWidth: 120, edit: 'text', sort: false, hide: false,
                    // templet: '#courseBusinessIdCell'
                },
                { field: 'titleId', title: '职称', align: 'center', minWidth: 150, sort: false, hide: false,
                    templet: '#courseTitleIdCell'
                },
                { field: 'principalPhone', title: '电话', align: 'center', minWidth: 150, edit: 'text', sort: false, hide: false
                },
                { field: 'principalEmail', title: '电子邮箱', align: 'center', minWidth: 150, edit: 'text', sort: false, hide: false
                },
                { field: 'operate', title: '操作', align: 'center', minWidth: 70, sort: false, hide: false, templet: '#courseOperationCell'
                }
            ];
            table.render({
                id: 'courseTable',
                elem: '#courseTable',
                height: 'full-200',
                toolbar: '#courseToolbar',
                defaultToolbar: [],
                headers: {
                    'Authorization': localStorage.getItem('token'),
                    'KJPT-USER-ID': localStorage.getItem('user-id')
                },
                page: false,
                cols: [courseTableColArr],
                data: gCourseArr ? gCourseArr : [],
                done: function (res, curr, count) {
                    gProjCouRendered = true;
                    if (gCourseArr && gCourseArr.length > 0) {
                        gCourseArr.forEach((courseVo, index) => {
                            // let se =  tool.renderDuty('select[name=principalBusiness]');
                            let se1 =  echoRowSel('principalBusiness', index);

                            // render title treeSelector
                            // (!courseVo.titleId) && (courseVo.titleId = 'ad054866-5331-4546-98bc-9b2f0124b22e');
                            renderRowTreeSel('#titleTreeSelector' + index, gTitleTreeData, index, 'titleId', courseVo.titleId);
                            renderRowSpecTreeSel('#specTreeSelector' + index, gSpecTreeData, index, 'specId', courseVo.specId);
                        })
                    }
                }
            });
        }
    }

    // page3
    form.on('select(teachingMethod)', function (data) {
        let idx = $(data.elem).attr('idx');
        let selValue = data.value;
        gCourseArr[idx]['teachingMethod'] = selValue ? selValue : null;
    });
    
    // page3 加载下拉框
    function echoRowSel(name, rowIndex) {
        let $select = $("select[name='" + name + "']:eq(" + rowIndex + ")");
        let val = $select.data('value');
        $select.next().children('dl').children("dd[lay-value='" + val + "']").click();
    }

    // page3 职务选择
    form.on('select(principalBusiness)', function (data) {
        let idx = $(data.elem).attr('idx');
        let selValue = data.value;
        let name = $('select[name=principalBusiness]').find('option[value=' + selValue + ']')[0].innerText;
        gCourseArr[idx]['principalBusiness'] = selValue ? selValue : null;
        gCourseArr[idx]['principalBusinessName'] = name ? name : null;
        
    });
    

    // page3
    function renderRowTreeSel(selector, treeData, rowIndex, fieldName, initVal) {
        let config = {
            el: selector,
            autoRow: true,
            radio: true,
            filterable: true,
            size: 'small',
            initValue: initVal ? [initVal] : [],
            theme: {
                color: '#5FB878'
            },
            prop: {
                name: 'titleName',
                value: 'titleId',
            },
            tree: {
                show: true,
                showFolderIcon: true,
                showLine: true,
                indent: 20,
                // expandedKeys: true,
                // simple: true,
                // strict: true
            },
            clickClose: true,
            model: {
                type: 'fixed',
                icon: 'hidden',
                label: {
                    type: 'text'
                }
            },
            iconfont: {
                // select: 'layui-icon layui-icon-chart',
                // unselect: 'layui-icon-ok-circle',
                // half: 'layui-icon layui-icon-table',
                // parent: 'layui-icon layui-icon-survey'
            },
            height: '300px',
            data: treeData,
            on: function (data) {
                let selectedE = data.arr[0];
                // console.info(selectedE);
                gCourseArr[rowIndex][fieldName] = selectedE ? selectedE['titleId'] : null;
                gCourseArr[rowIndex]['titleName'] = selectedE ? selectedE['titleName'] : null;
            }
        };
        xmSelect.render(config);
    }

    // page3
    function renderRowSpecTreeSel(selector, treeData, rowIndex, fieldName, initVal) {
        let config = {
            el: selector,
            autoRow: true,
            radio: true,
            filterable: true,
            size: 'small',
            initValue: initVal ? [initVal] : [],
            clickClose: true,
            height: '300px',
            data: treeData,
            theme: {
                color: '#5FB878'
            },
            prop: {
                name: 'personSpecName',
                value: 'personSpecId',
            },
            tree: {
                show: true,
                clickExpand: false,
                clickCheck: true,
                showFolderIcon: true,
                showLine: true,
                indent: 20,
                // expandedKeys: true,
                simple: true,
                strict: false
            },
            model: {
                type: 'fixed',
                icon: 'hidden',
                label: {
                    type: 'text'
                }
            },
            iconfont: {
                // select: 'layui-icon layui-icon-chart',
                // unselect: 'layui-icon-ok-circle',
                // half: 'layui-icon layui-icon-table',
                // parent: 'layui-icon layui-icon-survey'
            },
            on: function (data) {
                let selectedE = data.arr[0];
                // console.info(selectedE);
                gCourseArr[rowIndex][fieldName] = selectedE ? selectedE['personSpecId'] : null;
                gCourseArr[rowIndex]['specName'] = selectedE ? selectedE['personSpecName'] : null;
            }
        };
        // tool.renderSpecTreeSelector(selector, treeData, config);
        xmSelect.render(config);
    }
    // separate


    
    // page4
    function submit4(params, toNext) {
        var formData = JSON.stringify(params);
        console.info('formData4: %s', formData);
        params.formData4 = formData;

        params.userCreate = _userId;
        params.cmeStandardKindId = _standardKindId;
        params.projectId = gProjectId;
        console.info('submit: %s', JSON.stringify(params));
        let res = false;
        declareProjActionSYJS(removeEmpty(params)).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                tool.okMsg('项目推广信息保存完成');
                res = true;
            } else {
                tool.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            tool.errorMsg('error:保存项目推广信息');
        }).finally(() => {
            (res && toNext) && element.tabChange('declare-tab', 'page5') && echoCourse();
        });
    }


    function submit6(params, doReport) {
        if (!doReport) {
            layer.confirm('保存成功，请及时至列表页进行上报操作', {
                title: '提示',
                btn: ['确定', '取消'],
                icon: 1
            }, function () {
                // console.info('yes');
                // refresh parent
                let obj = {
                    sender: 'declare',
                    closeModal: true
                };
                window.parent.postMessage(obj, '*');
            }, function () {
                // console.info('cancel');
            });
        } else {
            layer.confirm('上报后将无法修改申报信息，请确认是否直接上报？', {
                title: '确认',
                btn: ['确定', '取消'],
                icon: 3
            }, function () {
                // console.info('yes');
                report();
            }, function () {
                // console.info('cancel');
            });
        }
    }


    // 上报
    function report() {
        declareProjReport(gProjectId, _source).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                tool.okMsg('已上报');
                // refresh parent
                let obj = {
                    sender: 'declare',
                    closeModal: true,
                };
                window.parent.postMessage(obj, '*');
            } else {
                tool.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            tool.errorMsg('error:上报');
        }).finally(() => {
        });
    }


    function submit5(params, toNext) {
        var formData = JSON.stringify(params);
        console.info('formData5: %s', formData);
        params.formData5 = formData;

        params.userCreate = _userId;
        params.cmeStandardKindId = _standardKindId;
        params.projectId = gProjectId;
        console.info('submit2: %s', JSON.stringify(params));
        let res = false;
        declareProjActionSYJS(removeEmpty(params)).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                tool.okMsg('经费预算信息保存完成');
                res = true;
            } else {
                tool.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            tool.errorMsg('error:保存经费预算信息');
        }).finally(() => {
            (res && toNext) && element.tabChange('declare-tab', 'page6') && echoCourse();
        });
    }
    
    // 上传附件
    function echoAttachment() {
        if (!gProjAttachmentRendered) {
            renderUploader();

            let attachmentTableColArr = [
                {
                    field: 'category',
                    title: '类别',
                    align: 'center',
                    minWidth: 90,
                    templet: function (data) {
                        let categoryName = '';
                        if (data.category == 6) {
                            categoryName = "真实性声明";
                        } else if (data.category == 7) {
                            categoryName = "申报机构执业许可证";
                        } else if (data.category == 8) {
                            categoryName = "反映技术的主要15项产出材料";
                        } else if (data.category == 9) {
                            categoryName = "目前应用技术机构的证明材料";
                        } else if (data.category == 10) {
                            categoryName = "其他辅助证明材料";
                        }
                        return categoryName;
                    }
                },
                {
                    field: 'fileName',
                    title: '名称',
                    align: 'center',
                    minWidth: 90,
                },
                {
                    field: 'operate',
                    title: '操作',
                    align: 'center',
                    minWidth: 70,
                    templet: '#attachmentOperationCell'
                }
            ];

            table.render({
                id: 'attachmentTable',
                elem: '#attachmentTable',
                height: 'full-200',
                toolbar: '#attachmentToolbar',
                defaultToolbar: [],
                headers: {
                    'Authorization': localStorage.getItem('token'),
                    'KJPT-USER-ID': localStorage.getItem('user-id')
                },
                page: false,
                limit: 20,
                cols: [attachmentTableColArr],
                data: gAttachmentArr ? gAttachmentArr : [],
                done: function (res, curr, count) {
                    gProjAttachmentRendered = true;
                }
            });
        }
    }

    // 加载已上传执业机构许可证
    function wrapperAttachment() {
        let categoryArr = gAttachmentArr.map(v => v.category);
        if (!categoryArr.includes(7)) {
            let visit = huayi_sjwh_url + 'unit/file/lasted/' + _unitId + '/' + 1;
            postAction(visit).then(response => {
                let jsonRes = response.data;
                let unitFile = jsonRes.data;
                if (jsonRes.success ) {
                    if (unitFile) {
                        saveAttachment(unitFile.url, unitFile.fileName,  7);
                    } else {
                        tool.failMsg('单位未上传法人证书，请至法人证书维护菜单上传单位法人证书');
                    }
                    // gAttachmentArr.push({
                    //     category: 7,
                    //     fileName: unitFile.fileName,
                    //     url: unitFile.url
                    // });
                    // reloadAttachmentTable();
                } else {
                    tool.failMsg('单位未上传执业机构许可证，请至"机构执业许可证/社团法人证"菜单上传');
                }
            }).catch(error => {
                tool.errorMsg('error:unitFile.lasted');
            }).finally(() => {

            });
        }
    }
    
    // page5
    table.on('toolbar(attachmentTable)', function (obj) {
        let event = obj.event;
        let fileNumSet = 0;
        if('upload6' === event) fileNumSet = fileNum6;
        if('upload7' === event) fileNumSet = fileNum7;
        if('upload8' === event) fileNumSet = fileNum8;
        if('upload9' === event) fileNumSet = fileNum9;
        if('upload10' === event) fileNumSet = fileNum10;
        // TODO 文件数量限制
        console.log(gAttachmentArr);
        let fileNum = 0;
        gAttachmentArr.forEach(attachment => {
            let tem = 'upload' + attachment.category;
            if(tem == event){
                fileNum += 1;
            }
        });
        if(fileNum >= fileNumSet){
            layer.msg('该类型文件已达上传数量限制');
            return false;
        }

        ('upload6' === event) && uploadAttachment(6);
        ('upload7' === event) && uploadAttachment(7);
        ('upload8' === event) && uploadAttachment(8);
        ('upload9' === event) && uploadAttachment(9);
        ('upload10' === event) && uploadAttachment(10);
    });

    
    // 预览附件
    table.on('tool(attachmentTable)', function (obj) {
        let rowData = obj.data;
        let event = obj.event;
        if ('preview' === event) {
            let json = {
                "status": 1,
                "msg": "",
                "title": "JSON请求的相册",
                "id": 8,
                "start": 0,
                "data": [
                    {
                        "alt": "附件",
                        "pid": 109,
                        "src": rowData.url,
                        "thumb": ""
                    }
                ]
            };
            layer.photos({
                photos: json,
                anim: 5,
                shade: 0.2,
                closeBtn:1,
                area: ['98%', '98%'],
                tab: function (pic, layero) {
                    // console.log(pic) //当前图片的一些信息
                    $('.layui-layer-imguide').show()
                    $('.layui-layer-imgbar').show()
                }
            });
        } else if ('delete' === event) {
            deleteAttachment(rowData.id, false);
        } else if ('lasted' === event) {
            deleteAttachment(rowData.id, true);
        }
    });
    // page5
    function reloadAttachmentTable() {
        table.reload('attachmentTable', {
            data: gAttachmentArr
        });
    }

    // 加载上传表格
    function renderUploader() {
        upload.render({
            elem: '#uploadBtn',
            url: huayi_upload_url + 'uploadApi/upload',
            size: 15 * 1024,  // 15M
            accept: 'file', // 普通文件
            exts: 'pdf|png|jpg|jpeg',
            before: function (obj) {
                // 校验文件数量
                console.log('gCategory:' + gCategory)
               // let files = obj.pushFile();
                obj.preview(function (index, file, result) {
                    gFileName = file.name;
                    gFileType = gFileName.endsWith("pdf") ? "DOC" : "IMAGE";
                });

                this.data = {
                    fileType: gFileType,
                    path: `/declare/${_standardKindId}/${gHoldYear}/${_unitId}`,
                    scale:0.6,
                    outputQuality:0.6
                }
                gLayerIndex = tool.loading();
                console.log('before')

            }, 
            choose: function (obj){
                this.files = obj.pushFile();
                var filesObj =  this.files;
                for(let key in filesObj){
                    const tempType = filesObj[key].type;
                    if(tempType.indexOf("image") >= 0){
                        gFileType = "IMAGE";
                    } else if(tempType.indexOf("application/pdf") >= 0){
                        gFileType = "DOC";
                    }
                }
                this.data = {
                    fileType: gFileType,
                    path: `/declare/${_standardKindId}/${gHoldYear}/${_unitId}`,
                    scale:0.6,
                    outputQuality:0.6
                }
                console.log('choose')
            },
            done: function (res, index) {
                layer.close(gLayerIndex);
                if (res.code !== 200) {
                    tool.failMsg('上传失败');
                } else {
                    tool.okMsg('上传完成');
                    let fileUrl = res.data.picUrl;
                    console.info('fileUrl: %s', fileUrl);
                    saveAttachment(fileUrl, gFileName, gCategory);
                }
                delete this.files[index];
            },
            error: function () {
                tool.errorMsg('上传失败');
            }
        });
    }

    // page5
    function uploadAttachment(category) {
        gCategory = category;
        console.info(gCategory);
        $('#uploadBtn').click();
    }

    // 保存附件
    function saveAttachment(url, fileName, category) {
        let visit = huayi_projectscore_url + 'fineReport/attachment/save';
        let params = {
            projectId: gProjectId,
            url: url,
            fileName: fileName,
            category: category,
            createBy: _userId
        };
        postAction(visit, params).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                gAttachmentArr.push(jsonRes.data);
                reloadAttachmentTable();
            } else {
                tool.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            tool.errorMsg('error:保存附件')
        }).finally(() => {

        });
    }

    // 删除附件
    function deleteAttachment(id, lasted) {
        let visit = huayi_projectscore_url + 'fineReport/attachment/delete/' + id;
        deleteAction(visit).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                gAttachmentArr = gAttachmentArr.filter(item => (item.id !== id));
                reloadAttachmentTable();
            } else {
                tool.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            tool.errorMsg('error:删除附件');
        }).finally(() => {
            if (lasted) {
                gAttachmentArr = gAttachmentArr.filter(i => i.category !== 1);
                wrapperAttachment();
            }
        });
    }

    form.on('checkbox(technologyType)', function (data) {
        //取值
        var child = $(".technologyTypeDiv input[type='checkbox']:checked");
        var tempTechnologyType = ''
        child.each(function (index, item) {
            tempTechnologyType +=  item.value + ', ';
        });
        gTechnologyType = tempTechnologyType.substring(0, tempTechnologyType.length - 2);
        var other1 = '';
        if (data.value == '其他' && data.elem.checked) {
            other1 = $("#other1").val();
            // gTechnologyType = gTechnologyType + '(' + other1 + ')';
            document.getElementById("other1").style.display = "block";
        } else if(data.value == '其他' && !data.elem.checked){
            document.getElementById("other1").style.display = "none";
            $("#other1").val('')
        }
        console.log(gTechnologyType);
    });

    
    

    
    form.on('checkbox(innovativeProducts)', function (data) {
         //取值
         var child = $(".innovativeProductsDiv input[type='checkbox']:checked");
         var tempInnovativeProducts = ''
         child.each(function (index, item) {
             tempInnovativeProducts +=  item.value + ', ';
         });
         gInnovativeProducts = tempInnovativeProducts.substring(0, tempInnovativeProducts.length - 2);
         var other2 = '';
         if (data.value == '其他' && data.elem.checked) {
             other2 = $("#other2").val();
            //  gInnovativeProducts = gInnovativeProducts + '(' + other2 + ')';
             document.getElementById("other2").style.display = "block";
        } else if(data.value == '其他' && !data.elem.checked){
                document.getElementById("other2").style.display = "none";
                $("#other2").val('')
            } 
         console.log(gInnovativeProducts);
    });

    $("#other1").bind('blur', function(event) {
        gTechnologyType = gTechnologyType + '(' + $("#other1").val() + ')';
    })

    $("#other2").bind('blur', function(event) {
        gInnovativeProducts = gInnovativeProducts + '(' + $("#other2").val() + ')';
    })

    function initTable(){
        //转换静态表格
        // table.init('courseTable', {
        //     height: 500 //设置高度
        //     ,limit: 15 //注意：请务必确保 limit 参数（默认：10）是与你服务端限定的数据条数一致
        //     //支持所有基础参数
        // });
        echoCourse();
        table.render();
        console.log('initTable')

    }

    function initPage(){
        laydate.render({ elem: "#birthday", type: 'date', })
        laydate.render({ elem: "#fillDate", type: 'date', })
          //日期范围
        laydate.render({
            elem: '#implCycle'
            ,range: ['#implCycle-startDate', '#implCycle-endDate']
        });
        // initTable();
        console.log('render')
        table.render();
        form.render();

    }
    initPage();


    // 根据身份证号计算出生日期
    $("#certId").bind('blur', function(event) {
        var certId = $("#certId").val();
        if(certId && certId.length == 18){
            var birthday = certId.substring(6,10) + '-' + certId.substring(10,12) + '-' + certId.substring(12,14);
            laydate.render({ elem: "#birthday", type: 'date', value: birthday})
        }

    })

    // 计算总额
    $(".money-focus").bind('blur', function(event) {
        // layer.msg('失去焦点');

        let hotelFee = parseFloat($("#hotelFee").val() ? $("#hotelFee").val() : 0); 
        let mealFee = parseFloat($("#mealFee").val() ? $("#mealFee").val() : 0); 
        let siteFee = parseFloat($("#siteFee").val() ? $("#siteFee").val() : 0); 
        let teachFee = parseFloat($("#teachFee").val() ? $("#teachFee").val() : 0); 
        let dataFee = parseFloat($("#dataFee").val() ? $("#dataFee").val() : 0); 
        let materialFee = parseFloat($("#materialFee").val() ? $("#materialFee").val() : 0); 
        let trafficFee = parseFloat($("#trafficFee").val() ? $("#trafficFee").val() : 0); 
        let humanResourcesCost = parseFloat($("#humanResourcesCost").val() ? $("#humanResourcesCost").val() : 0); 
        let manageFee = parseFloat($("#manageFee").val() ? $("#manageFee").val() : 0); 
        let otherFee = parseFloat($("#otherFee").val() ? $("#otherFee").val() : 0); 

        var totalFee = hotelFee + mealFee + siteFee + teachFee + dataFee + materialFee
                        + trafficFee + humanResourcesCost + manageFee + otherFee; 
        totalFee = parseFloat(totalFee).toFixed(2);
        if(totalFee){
            $("#totalFee").val(totalFee);
        }else{
            $("#totalFee").val('');
        }
    })

    // $(function (){
    //     setTimeout(initTable(), 500); //延迟1秒
    //   })

});

