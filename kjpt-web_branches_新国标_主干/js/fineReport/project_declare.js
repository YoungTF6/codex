// project_declare


function declareEndLoad(frg) {
    // 给切换sheet的按钮绑定点击事件
    $(".fr-sheetbutton-container").click(function () {
        // 获取当前sheet的编号（从0开始）
        let index = frg.selectedIndex;
        if (index > 0 && !getTplParam('project_id')) {
            showToast('warning', '请先填写项目基本信息');
            frg.loadSheetByIndex(0);
        }
        if (3 === index) {
            declare4echoPeriod(frg);
            declare4echoDays(frg);
        }
    });
}

function declare1project(frg, baseUrl, toNext) {
    const _standardKindId = getTplParam('standard_kind_id')
    const _scoreLevelId = getTplParam('score_level_id')
    const _unitId = getTplParam('unit_id');
    const _userId = getTplParam('user_id');
    const _holdYear = getTplParam('hold_year');
    const _projectId = getTplParam('project_id');
    const _zhCN = getTplParam('zh_cn');
    const _projectType = _zhCN ? Number(_zhCN) : 1;
    console.info(_zhCN, _projectType);

    // unitMainId hidden  不验证'isValidWidget'
    let unitIdXm = frg.getWidgetByName('xm_unit_id');
    let unitMainId = unitIdXm ? unitIdXm.getText() : null;
    // knowledgeCode hidden
    let knowCodeXm = frg.getWidgetByName('xm_knowledge_code');
    let knowledgeCode = knowCodeXm ? (knowCodeXm.getText() ? knowCodeXm.getText() : null) : null;
    // knowledgeTwoCode hidden
    let knowCode2Xm = frg.getWidgetByName('xm_knowledge_code_2');
    let knowledgeTwoCode = knowCode2Xm ? knowCode2Xm.getText() : null;
    // projectName
    let projectNameXm = frg.getWidgetByName('xm_project_name');
    let projectName = isValidWidget(projectNameXm) ? projectNameXm.getValue() : null;
    // knowledgeId
    let knowledgeIdXm = frg.getWidgetByName('xm_knowledge_id');
    let knowledgeId = isValidWidget(knowledgeIdXm) ? knowledgeIdXm.getValue() : null;
    // target
    let targetXm = frg.getWidgetByName('xm_target');
    let target = isValidWidget(targetXm) ? targetXm.getValue() : null;
    // projAnalyze
    let projAnalyzeXm = frg.getWidgetByName('xm_proj_analyze');
    let projAnalyze = isValidWidget(projAnalyzeXm) ? projAnalyzeXm.getValue() : null;
    // progress
    let progressXm = frg.getWidgetByName('xm_progress');
    let progress = isValidWidget(progressXm) ? progressXm.getValue() : null;
    // jobSummary
    let jobSummaryXm = frg.getWidgetByName('xm_job_summary');
    let jobSummary = isValidWidget(jobSummaryXm) ? jobSummaryXm.getValue() : null;
    // question
    let questionXm = frg.getWidgetByName('xm_question');
    let question = isValidWidget(questionXm) ? questionXm.getValue() : null;
    // innovation
    let innovationXm = frg.getWidgetByName('xm_innovation');
    let innovation = isValidWidget(innovationXm) ? innovationXm.getValue() : null;

    if (isValidWidget(projectNameXm) && !limitLength(projectName, 1, 75)) {
        alert('项目名称不能为空且不超过75个字')
        return;
    }
    if (isValidWidget(knowledgeIdXm) && isBlank(knowledgeId)) {
        alert('请选择三级学科');
        return;
    }
    if (isBlank(knowledgeId) || isBlank(knowledgeCode) || isBlank(knowledgeTwoCode)) {
        alert('请选择三级学科');
        return;
    }
    if (isValidWidget(targetXm) && isBlank(target)) {
        alert('请输入举办目的');
        return;
    }
    if (isValidWidget(projAnalyzeXm) && isBlank(projAnalyze)) {
        alert('请输入简要内容');
        return;
    }
    if (isValidWidget(progressXm) && isBlank(progress)) {
        alert('请输入在国内外的地位');
        return;
    }
    if (isValidWidget(jobSummaryXm) && isBlank(jobSummary)) {
        alert('请输入工作概况');
        return;
    }
    if (isValidWidget(questionXm) && isBlank(question)) {
        alert('请输入本领域存在的问题');
        return;
    }
    if (isValidWidget(innovationXm) && isBlank(innovation)) {
        alert('请输入项目的创新之处');
        return;
    }

    let visit = baseUrl + 'proj/saveOrUpdate'

    let params = {
        "projectId": _projectId,
        "fresh": isBlank(_projectId),
        "unitId": _unitId,
        "unitMainId": unitMainId,
        "status": 0, // 0-未上报,1-审核通过,2-不通过,3-退回
        // "previousId": "00000000-0000-0000-0000-000000000000",
        "previousCheckUnitId": '000000',
        "userCreate": _userId,
        "userId": _userId,
        "cmeStandardKindId": _standardKindId,
        "scoreLevelId": _scoreLevelId,
        "projectType": _projectType, // 1-西医,2-中医
        "subjectType": _projectType, // 1-西医,2-中医
        "knowledgeId": knowledgeId,
        "knowledgeCode": knowledgeCode,
        "knowledgeTwoCode": knowledgeTwoCode,
        "projectName": projectName,
        "holdYear": Number.parseInt(_holdYear),
        // above not null constraint
        "target": target,
        "projAnalyze": projAnalyze,
        "progress": progress,
        "jobSummary": jobSummary,
        "question": question,
        "innovation": innovation
    };

    switchBtn(frg, false);
    ajaxPost(visit, params, function () {
        switchBtn(frg, true);
        showToast('success', '已保存');
        toNext && toNextPage();
    }, frg);
}


function declare2principal(frg, baseUrl, toNext) {
    const _standardKindId = getTplParam('standard_kind_id');
    const _userId = getTplParam('user_id');
    const _projectId = getTplParam('project_id');

    // personName
    let personNameFzr = frg.getWidgetByName("fzr_person_name");
    let personName = isValidWidget(personNameFzr) ? personNameFzr.getValue() : null; // 项目负责人姓名
    // phone
    let phoneFzr = frg.getWidgetByName("fzr_phone");
    let phone = isValidWidget(phoneFzr) ? phoneFzr.getValue() : null; // 项目负责人电话
    // titleId
    let titleIdFzr = frg.getWidgetByName("fzr_title_id");
    let titleId = isValidWidget(titleIdFzr) ? titleIdFzr.getValue() : null; // 项目负责人职称
    //
    // let idTypeFzr = frg.getWidgetByName("fzr_id_type");
    // let idType = isValidWidget(idTypeFzr) ? idTypeFzr.getValue() : null;
    // idCardNo
    let idCardNoFzr = frg.getWidgetByName("fzr_id_card_no");
    let idCardNo = isValidWidget(idCardNoFzr) ? idCardNoFzr.getValue() : null; // 项目负责人证件号
    // business
    let businessFzr = frg.getWidgetByName("fzr_business");
    let business = isValidWidget(businessFzr) ? businessFzr.getValue() : null; // 项目负责人职务
    // workUnit
    let workUnitFzr = frg.getWidgetByName("fzr_work_unit");
    let workUnit = isValidWidget(workUnitFzr) ? workUnitFzr.getValue() : null; // 项目负责人工作单位
    // teachTopic
    let teachTopicFzr = frg.getWidgetByName("fzr_teach_topic");
    let teachTopic = isValidWidget(teachTopicFzr) ? teachTopicFzr.getValue() : null; // 讲授课题
    // period
    let periodFzr = frg.getWidgetByName("fzr_period");
    let period = isValidWidget(periodFzr) ? periodFzr.getValue() : 0; // 学时
    // gender
    let genderFzr = frg.getWidgetByName('fzr_gender');
    let gender = isValidWidget(genderFzr) ? genderFzr.getValue() : null;
    // age
    let ageFzr = frg.getWidgetByName('fzr_age');
    let age = isValidWidget(ageFzr) ? ageFzr.getValue() : null;
    // education
    let educationFzr = frg.getWidgetByName('fzr_education');
    let education = isValidWidget(educationFzr) ? educationFzr.getValue() : null;
    // postcode
    let postcodeFzr = frg.getWidgetByName('fzr_postcode');
    let postcode = isValidWidget(postcodeFzr) ? postcodeFzr.getValue() : null;
    // address
    let addressFzr = frg.getWidgetByName('fzr_address');
    let address = isValidWidget(addressFzr) ? addressFzr.getValue() : null;
    // resume
    let resumeFzr = frg.getWidgetByName('fzr_resume');
    let resume = isValidWidget(resumeFzr) ? resumeFzr.getValue() : null;
    // trailing
    let trainingFzr = frg.getWidgetByName('fzr_training');
    let training = isValidWidget(trainingFzr) ? trainingFzr.getValue() : null;
    // study
    let studyFzr = frg.getWidgetByName('fzr_study');
    let study = isValidWidget(studyFzr) ? studyFzr.getValue() : null;
    // article
    let articleFzr = frg.getWidgetByName('fzr_article');
    let article = isValidWidget(articleFzr) ? articleFzr.getValue() : null;
    // experience
    let experienceFzr = frg.getWidgetByName('fzr_experience');
    let experience = isValidWidget(experienceFzr) ? experienceFzr.getValue() : null;

    // validation
    if (isValidWidget(personNameFzr) && isBlank(personName)) {
        alert('请输入负责人姓名');
        return;
    }
    // 性别
    if (isValidWidget(ageFzr) && !isNumber(age)) {
        alert('请输入年龄');
        return;
    }
    if (isValidWidget(phoneFzr) && isBlank(phone)) {
        alert('请输入联系电话');
        return;
    }
    if (isValidWidget(idCardNoFzr) && isBlank(idCardNo)) {
        alert('请输入证件号码');
        return;
    }
    if (isValidWidget(titleIdFzr) && isBlank(titleId)) {
        alert('请选择职称');
        return;
    }
    if (isValidWidget(businessFzr) && isBlank(business)) {
        alert('请选择职务');
        return;
    }
    if (isValidWidget(educationFzr) && isBlank(education)) {
        alert('请选择学历');
        return;
    }
    if (isValidWidget(workUnitFzr) && isBlank(workUnit)) {
        alert('请输入工作单位');
        return;
    }
    if (isValidWidget(teachTopicFzr) && isBlank(teachTopic)) {
        alert('请输入讲授课题');
        return;
    }
    // training
    // study
    if (isValidWidget(periodFzr) && !isNumber(period)) {
        alert('请输入学时');
        return;
    }
    if (isValidWidget(postcodeFzr) && (!isNumber(postcode) || !limitLength(postcode.toString(), 6, 6))) {
        alert('请输入有效的邮编');
        return;
    }

    let visit = baseUrl + 'projPri/saveOrUpdate'

    let params = {
        "principalId": "",
        "projectId": _projectId,
        "cstate": 1,
        "userCreate": _userId,
        "cmeStandardKindId": _standardKindId,
        "personName": personName,
        "titleId": titleId,
        "postcode": postcode,
        "idCardNo": idCardNo,
        "phone": phone,
        "address": address,
        "gender": gender,
        "age": Number.parseInt(age),
        "resume": resume,
        "experience": experience,
        "training": training,
        "study": study,
        "article": article,
        "workUnit": workUnit,
        "business": business,
        "education": education,
        "teachTopic": teachTopic,
        "period": period,

    };

    switchBtn(frg, false);
    ajaxPost(visit, params, function () {
        switchBtn(frg, true);
        showToast('success', '已保存');
        toNext && toNextPage();
    });

}

function declare3deleteCourse(frg, frFR, that) {
    let cell = that.options.location;
    // 获取当前控件所在单元格的编号
    frFR.Msg.confirm("提示", "确定要删除吗？", function (value) {
        if (value) {
            // 删除当前行
            frg.deleteReportRC(cell);
        }
    });
}


function declare3course(frg, baseUrl, toNext) {
    const _standardKindId = getTplParam('standard_kind_id');
    const _userId = getTplParam('user_id');
    const _projectId = getTplParam('project_id');

    // step-1: param
    // let courseIdKcArr = []; // 课程id
    let teacherNameKcArr = [];
    let titleIdKcArr = [];
    let idCardNoKcArr = [];
    let workUnitKcArr = [];
    let teachTopicKcArr = [];
    let periodKcArr = [];
    let teachingMethodKcArr = [];
    let researchDirectionKcArr = [];
    let contentKcArr = [];

    let courseArr = [];

    let tnKcArr = frg.getWidgetsByName("kc_teacher_name")
    console.info('tnKcArr: ', tnKcArr);
    console.info('tnKcArr length: ', tnKcArr ? tnKcArr.length : 'no length');

    if (tnKcArr.length === undefined) {
        // courseIdKcArr[0] = frg.getWidgetsByName("kc_course_Id"); // 课程id
        teacherNameKcArr[0] = frg.getWidgetsByName("kc_teacher_name"); // 教师姓名
        idCardNoKcArr[0] = frg.getWidgetsByName("kc_id_card_no");
        titleIdKcArr[0] = frg.getWidgetsByName("kc_title_id"); // 教师职称
        workUnitKcArr[0] = frg.getWidgetsByName("kc_work_unit"); // 工作单位
        teachTopicKcArr[0] = frg.getWidgetsByName("kc_teach_topic"); // 讲授题目
        periodKcArr[0] = frg.getWidgetsByName("kc_period"); // 学时
        teachingMethodKcArr[0] = frg.getWidgetsByName("kc_teaching_method"); // 教学方法
        researchDirectionKcArr[0] = frg.getWidgetsByName("kc_research_direction");
        contentKcArr[0] = frg.getWidgetsByName("kc_content");
    } else {
        // courseIdKcArr = frg.getWidgetsByName("kc_course_Id"); // 课程id
        teacherNameKcArr = coalesce(frg.getWidgetsByName("kc_teacher_name"), []); // 教师姓名
        idCardNoKcArr = coalesce(frg.getWidgetsByName("kc_id_card_no"), []);
        titleIdKcArr = coalesce(frg.getWidgetsByName("kc_title_id"), []); // 教师职称
        workUnitKcArr = coalesce(frg.getWidgetsByName("kc_work_unit"), []); // 工作单位
        teachTopicKcArr = coalesce(frg.getWidgetsByName("kc_teach_topic"), []); // 讲授题目
        periodKcArr = coalesce(frg.getWidgetsByName("kc_period"), []); // 学时
        teachingMethodKcArr = coalesce(frg.getWidgetsByName("kc_teaching_method"), []); // 教学方法
        researchDirectionKcArr = coalesce(frg.getWidgetsByName("kc_research_direction"), []);
        contentKcArr = coalesce(frg.getWidgetsByName("kc_content"), []);
    }

    if (teacherNameKcArr.length > 0) {
        for (let i = 0; i < teacherNameKcArr.length; i++) {
            if (isValidWidget(teacherNameKcArr[i]) && isBlank(teacherNameKcArr[i].getValue())) {
                alert("教师姓名不能为空");
                return;
            }
            if (isValidWidget(idCardNoKcArr[i]) && isBlank(idCardNoKcArr[i].getValue())) {
                alert("教师身份证号不能为空");
                return;
            }
            if (isValidWidget(titleIdKcArr[i]) && isBlank(titleIdKcArr[i].getValue())) {
                alert("教师专业技术职务不能为空");
                return;
            }
            if (isValidWidget(workUnitKcArr[i]) && isBlank(workUnitKcArr[i].getValue())) {
                alert("所在单位不能为空");
                return;
            }
            if (isValidWidget(teachTopicKcArr[i]) && isBlank(teachTopicKcArr[i].getValue())) {
                alert("讲授题目不能为空");
                return;
            }
            if (isValidWidget(periodKcArr[i]) && !isNumber(periodKcArr[i].getValue())) {
                alert("讲授学时不能为空");
                return;
            }
            if (isValidWidget(teachingMethodKcArr[i]) && isBlank(teachingMethodKcArr[i].getValue())) {
                alert("教学方法不能为空");
                return;
            }

            let course = {
                // "courseId": courseIdKcArr[i].getValue(),
                "projectId": _projectId,
                "cstate": 1,
                "userCreate": _userId,
                "teacherName": isValidWidget(teacherNameKcArr[i]) ? teacherNameKcArr[i].getValue() : null,
                "titleId": isValidWidget(titleIdKcArr[i]) ? titleIdKcArr[i].getValue() : null,
                "researchDirection": isValidWidget(researchDirectionKcArr[i]) ? researchDirectionKcArr[i].getValue() : null,
                "workUnit": isValidWidget(workUnitKcArr[i]) ? workUnitKcArr[i].getValue() : null,
                "teachTopic": isValidWidget(teachTopicKcArr[i]) ? teachTopicKcArr[i].getValue() : null,
                "content": isValidWidget(contentKcArr[i]) ? contentKcArr[i].getValue() : null,
                "period": isValidWidget(periodKcArr[i]) ? periodKcArr[i].getValue() : null,
                "teachingMethod": isValidWidget(teachingMethodKcArr[i]) ? teachingMethodKcArr[i].getValue() : null,
                "idCardNo": isValidWidget(idCardNoKcArr[i]) ? idCardNoKcArr[i].getValue() : null
            };
            courseArr.push(course)
        }
    }

    let visit = baseUrl + 'projCou/saveOrUpdate';

    // step-2: set period
    let period = 0;
    let theoryPeriod = 0;
    let experimentPeriod = 0;
    if (periodKcArr.length > 0) {
        for (let i = 0; i < periodKcArr.length; i++) {
            period = accAdd(period, periodKcArr[i].getValue());
            if (teachingMethodKcArr[i].getValue() === '面授' || teachingMethodKcArr[i].getValue() === '理论知识') {
                theoryPeriod = accAdd(theoryPeriod, periodKcArr[i].getValue());
            } else if (teachingMethodKcArr[i].getValue() === '实验技术') {
                experimentPeriod = accAdd(experimentPeriod, periodKcArr[i].getValue());
            }
        }
    }

    let score = (period / 6).toFixed(1);
    score = score > 5.0 ? 5.0 : score;
    console.info('set score: ', score);
    //
    let pass = ((period <= 30) && (period % 3 === 0)) || (period > 30);
    let widget = window.contentPane.parameterEl.getWidgetByName('score');
    if (widget && widget.isVisible && !pass) {
        showToast('warning', '总学时不是3或6的倍数');
        return;
    }
    setTplParam(frg, 'period', period);
    setTplParam(frg, 'theory_period', theoryPeriod);
    setTplParam(frg, 'experiment_period', experimentPeriod);
    setTplParam(frg, 'score', score);

    // step-3: post
    switchBtn(frg, false);
    ajaxPost(visit, courseArr, function () {
        switchBtn(frg, true);
        showToast('success', '已保存');

        if (toNext) {
            // step-3: toNextPage
            // fr-sheetbutton-container为sheet页的集合,获取集合长度
            let $frsc = $(".fr-sheetbutton-container");
            let len = $frsc.length;
            // 获取当前选中sheet所在下标（下标从0开始）
            let index = $frsc.index($(".fr-sheetbutton-container-active"));
            if (index < len) {
                //如果当前下标index比len长度小1 表示已经为最后一页。
                if (index === (len - 1)) {
                    //当前为最后一页。跳转到首页
                    $frsc.eq(0).trigger("click");
                } else {
                    // 不为最后一页。跳转到下一页
                    $frsc.eq(index + 1).trigger("click");
                }
            }

        }

    });

}

function declare4echoPeriod(frg) {
    setTimeout(function () {
        // period
        let periodXm = frg.getWidgetByName("xm_period");
        let period = getTplParam('period');
        if (Number(period) === 0) return;
        isValidWidget(periodXm) && periodXm.setValue(period) && periodXm.setText(period);

        // theoryPeriod
        let theoryPeriodXm = frg.getWidgetByName("xm_theory_period");
        let theoryPeriod = getTplParam('theory_period');
        isValidWidget(theoryPeriodXm) && theoryPeriodXm.setValue(theoryPeriod) && theoryPeriodXm.setText(theoryPeriod);

        // experimentPeriod
        let experimentPeriodXm = frg.getWidgetByName("xm_experiment_period");
        let experimentPeriod = getTplParam('experiment_period');
        isValidWidget(experimentPeriodXm) && experimentPeriodXm.setValue(experimentPeriod) && experimentPeriodXm.setText(experimentPeriod);

        // score
        let scoreXm = frg.getWidgetByName("xm_score");
        let score = getTplParam('score');
        console.info('get score: ', score);
        isValidWidget(scoreXm) && scoreXm.setValue(score) && scoreXm.setText(score);
    }, 200);
}

function declare4echoDays(frg, days) {
    setTimeout(function () {
        //
        let val = days;
        if (!val) {
            let multiRow = frg.getWidgetsByName("jbzq_date_start").length !== undefined;
            let jbzqDateStartArr = multiRow ? frg.getWidgetsByName("jbzq_date_start") : [frg.getWidgetsByName("jbzq_date_start")];
            let jbzqDateEndArr = multiRow ? frg.getWidgetsByName("jbzq_date_end") : [frg.getWidgetsByName("jbzq_date_end")];
            let firstStart = new Date(jbzqDateStartArr[0].getValue());
            let firstEnd = new Date(jbzqDateEndArr[0].getValue());
            val = daysBetween(firstStart, firstEnd);
        }
        //
        let daysXm = frg.getWidgetByName('xm_days');
        isValidWidget(daysXm) && daysXm.setValue(val) && daysXm.setText(val);
    }, 200);
}


function declare4changeStart(frg, frContentPane, that) {
    let multiRow = frg.getWidgetsByName("jbzq_date_start").length !== undefined;
    let jbzqDateStartArr = multiRow ? frContentPane.getWidgetsByName("jbzq_date_start") : [frContentPane.getWidgetsByName("jbzq_date_start")];
    let jbzqDateEndArr = multiRow ? frContentPane.getWidgetsByName("jbzq_date_end") : [frContentPane.getWidgetsByName("jbzq_date_end")];
    let cellLoc = that.options.location; // "J7"
    let range = 7;
    if (cellLoc.substr(0, 1) === 'G') {
        // range = 20;
        range = Number(jbzqDateStartArr[0].options.location.substr(1, 2));
    }
    let length = jbzqDateStartArr.length;
    let index = Number(cellLoc.substr(1, 2)) - range;
    let curStart = new Date(jbzqDateStartArr[index].getValue());
    let curEnd = new Date(jbzqDateEndArr[index].getValue());
    if (curEnd < curStart) {
        alert("开始日期不能大于结束日期");
        frg.setCellValue(cellLoc, null, "");
        return false;
    }
    let preEnd = index === 0 ? Date.parse("1970-01-01T00:00:00.000Z") : new Date(jbzqDateEndArr[index - 1].getValue());
    let nextStart = (index === length - 1) ? Date.parse("2199-01-01T00:00:00.000Z") : new Date(jbzqDateStartArr[index + 1].getValue());
    if (curStart <= preEnd) {
        alert("开始日期不能小于上一周期结束日期");
        frg.setCellValue(cellLoc, null, "");
        return false;
    }
    (index === 0) && declare4echoDays(frg, daysBetween(curStart, curEnd));
}


function declare4changeEnd(frg, frContentPane, that) {
    let multiRow = frg.getWidgetsByName("jbzq_date_start").length !== undefined;
    let jbzqDateStartArr = multiRow ? frContentPane.getWidgetsByName("jbzq_date_start") : [frContentPane.getWidgetsByName("jbzq_date_start")];
    let jbzqDateEndArr = multiRow ? frContentPane.getWidgetsByName("jbzq_date_end") : [frContentPane.getWidgetsByName("jbzq_date_end")];
    let cellLoc = that.options.location; // "R7"
    let range = 7;
    if (cellLoc.substr(0, 1) === 'J') {
        // range = 20;
        range = Number(jbzqDateStartArr[0].options.location.substr(1, 2));
    }
    let length = jbzqDateStartArr.length;
    let index = Number(cellLoc.substr(1, 2)) - range;
    let curStart = new Date(jbzqDateStartArr[index].getValue());
    let curEnd = new Date(jbzqDateEndArr[index].getValue());
    if (curEnd < curStart) {
        alert("结束日期不能小于开始日期");
        frg.setCellValue(cellLoc, null, "");
        return false;
    }
    let preEnd = index === 0 ? Date.parse("1970-01-01T00:00:00.000Z") : new Date(jbzqDateEndArr[index - 1].getValue());
    let nextStart = (index === length - 1) ? Date.parse("2199-01-01T00:00:00.000Z") : new Date(jbzqDateStartArr[index + 1].getValue());
    if (curEnd >= nextStart) {
        alert("结束日期不能大于下一周期开始日期");
        frg.setCellValue(cellLoc, null, "");
        return false;
    }
    (index === 0) && declare4echoDays(frg, daysBetween(curStart, curEnd));
}

// 有返回值
function declare4insertCycle(frg, frContentPane) {
    // 插入举办日期行时校验是否已全部填写
    let multiRow = frg.getWidgetsByName("jbzq_date_start").length !== undefined;
    let jbzqDateStartArr = multiRow ? frContentPane.getWidgetsByName("jbzq_date_start") : [frContentPane.getWidgetsByName("jbzq_date_start")];
    let jbzqDateEndArr = multiRow ? frContentPane.getWidgetsByName("jbzq_date_end") : [frContentPane.getWidgetsByName("jbzq_date_end")];
    let length = jbzqDateStartArr.length;

    if (jbzqDateStartArr[length - 1].getValue() === '' || jbzqDateEndArr[length - 1].getValue() === '') {
        alert("日期选择完毕后再插入")
        return false;
    }

    if (length === 5) {
        alert("最多添加五个举办周期");
        return false;
    }
    //
    let firstStart = new Date(jbzqDateStartArr[0].getValue());
    let firstEnd = new Date(jbzqDateEndArr[0].getValue());
    declare4echoDays(frg, daysBetween(firstStart, firstEnd));
    declare4echoPeriod(frg);
}

function declare4deleteCycle(frg, frFR, that) {
    var cell = that.options.location;
    // 获取当前控件所在单元格的编号
    frFR.Msg.confirm("提示", "确定要删除吗？", function (value) {
        if (value) {
            // 删除当前行
            frg.deleteReportRC(cell);
            declare4echoDays(frg);
            declare4echoPeriod(frg);
        }
    });
}


function declare4save(frg, baseUrl, finalFun) {
    const _unitId = getTplParam('unit_id');
    const _projectId = getTplParam('project_id');

    // holdTypeId
    let holdTypeIdXm = frg.getWidgetByName("xm_hold_type_id");
    let holdTypeId = isValidWidget(holdTypeIdXm) ? holdTypeIdXm.getValue() : null;
    // days
    let daysXm = frg.getWidgetByName("xm_days");
    let days = isValidWidget(daysXm) ? daysXm.getValue() : 1; // 天数
    // teachObject
    let teachObjectXm = frg.getWidgetByName("xm_teach_object");
    let teachObject = isValidWidget(teachObjectXm) ? teachObjectXm.getValue() : null;
    // checkTypeId
    let checkTypeIdXm = frg.getWidgetByName("xm_check_type_id");
    let checkTypeId = isValidWidget(checkTypeIdXm) ? checkTypeIdXm.getValue() : null;
    // number
    let numberXm = frg.getWidgetByName("xm_number");
    let number = isValidWidget(numberXm) ? numberXm.getValue() : 0;
    // holdPlace
    let holdPlaceXm = frg.getWidgetByName("xm_hold_place");
    let holdPlace = isValidWidget(holdPlaceXm) ? holdPlaceXm.getValue() : null;
    // score
    let scoreXm = frg.getWidgetByName("xm_score");
    let score = isValidWidget(scoreXm) ? scoreXm.getValue() : 0;
    // period
    let periodXm = frg.getWidgetByName("xm_period");
    let period = isValidWidget(periodXm) ? periodXm.getValue() : 0;
    // theoryPeriod
    let theoryPeriodXm = frg.getWidgetByName("xm_theory_period");
    let theoryPeriod = isValidWidget(theoryPeriodXm) ? theoryPeriodXm.getValue() : 0;
    // experimentPeriod
    let experimentPeriodXm = frg.getWidgetByName("xm_experiment_period");
    let experimentPeriod = isValidWidget(experimentPeriodXm) ? experimentPeriodXm.getValue() : 0;
    // lecturerScore
    let lecturerScoreXm = frg.getWidgetByName("xm_lecturer_score");
    let lecturerScore = isValidWidget(lecturerScoreXm) ? lecturerScoreXm.getValue() : 0;
    // 主办单位
    // unitName
    let unitNameXm = frg.getWidgetByName("xm_unit_name");
    let unitName = isValidWidget(unitNameXm) ? unitNameXm.getValue() : null;
    // unitPhone
    let unitPhoneXm = frg.getWidgetByName("xm_unit_phone");
    let unitPhone = isValidWidget(unitPhoneXm) ? unitPhoneXm.getValue() : null;
    // unitLinkman
    let unitLinkmanXm = frg.getWidgetByName("xm_unit_linkman");
    let unitLinkman = isValidWidget(unitLinkmanXm) ? unitLinkmanXm.getValue() : null;
    // 申报单位
    // applyUnit
    let applyUnitXm = frg.getWidgetByName("xm_apply_unit");
    let applyUnit = isValidWidget(applyUnitXm) ? applyUnitXm.getValue() : null;
    // applyUnitPhone
    let applyUnitPhoneXm = frg.getWidgetByName("xm_apply_unit_phone");
    let applyUnitPhone = isValidWidget(applyUnitPhoneXm) ? applyUnitPhoneXm.getValue() : null;
    // applyLinkman
    let applyLinkmanXm = frg.getWidgetByName("xm_apply_linkman");
    let applyLinkman = isValidWidget(applyLinkmanXm) ? applyLinkmanXm.getValue() : null;
    // postcode
    let postcodeXm = frg.getWidgetByName("xm_postcode");
    let postcode = isValidWidget(postcodeXm) ? postcodeXm.getValue() : null;
    // unitMailingAddr
    let unitMailingAddrXm = frg.getWidgetByName("xm_unit_mailing_addr");
    let unitMailingAddr = isValidWidget(unitMailingAddrXm) ? unitMailingAddrXm.getValue() : null;
    // email
    let emailXM = frg.getWidgetByName("xm_email");
    let email = isValidWidget(emailXM) ? emailXM.getValue() : null;
    // booksCheckUnit
    let booksCheckUnitXm = frg.getWidgetByName("xm_books_check_unit");
    let booksCheckUnit = isValidWidget(booksCheckUnitXm) ? booksCheckUnitXm.getValue() : null;
    // limitInUnit
    let limitInUnitXm = frg.getWidgetByName("xm_limit_in_unit");
    let limitInUnit = isValidWidget(limitInUnitXm) ? limitInUnitXm.getValue() : false;
    // entryFee
    let entryFeeXm = frg.getWidgetByName("xm_entry_fee");
    let entryFee = isValidWidget(entryFeeXm) ? entryFeeXm.getValue() : 0;
    // remark
    let remarkXm = frg.getWidgetByName("xm_remark");
    let remark = isValidWidget(remarkXm) ? remarkXm.getValue() : null;

    let jbzq_date_start_arr = [];
    let jbzq_date_end_arr = [];

    if (frg.getWidgetsByName("jbzq_date_start").length === undefined) {
        jbzq_date_start_arr[0] = contentPane.getWidgetsByName("jbzq_date_start");// 举办周期开始日期
        jbzq_date_end_arr[0] = contentPane.getWidgetsByName("jbzq_date_end");// 举办周期结束日期
    } else {
        jbzq_date_start_arr = contentPane.getWidgetsByName("jbzq_date_start");// 举办周期开始日期
        jbzq_date_end_arr = contentPane.getWidgetsByName("jbzq_date_end");// 举办周期结束日期
    }

    let cycleArr = [];
    // 举办起止日期 第一批: 2021-01-01 至 2021-10-10
    let holdDates = '';

    if (jbzq_date_start_arr.length > 0) {
        for (let i = 0; i < jbzq_date_start_arr.length; i++) {
            if (isBlank(jbzq_date_start_arr[i].getValue())) {
                alert("举办周期开始日期不能为空");
                return;
            }
            if (isBlank(jbzq_date_end_arr[i].getValue())) {
                alert("举办周期结束日期不能为空");
                return;
            }
            let batch = i + 1;
            holdDates += "第" + batch + "批: " + jbzq_date_start_arr[i].getValue() + " 至 " + jbzq_date_end_arr[i].getValue() + "\r\n"
            let aaa = {
                "periodId": "",
                // "projectId": _projectId,
                "batchId": i + 1,
                "dateStart": jbzq_date_start_arr[i].getValue(),
                "dateEnd": jbzq_date_end_arr[i].getValue(),
                "unitId": _unitId
            };
            cycleArr.push(aaa)
        }
    }

    if (isValidWidget(holdTypeIdXm) && isBlank(holdTypeId)) {
        alert('请选择举办方式');
        return;
    }
    if (isValidWidget(teachObjectXm) && isBlank(teachObject)) {
        alert('请输入教学对象');
        return;
    }
    if (isValidWidget(checkTypeIdXm) && isBlank(checkTypeId)) {
        alert('请选择考核方式');
        return;
    }
    if (isValidWidget(numberXm) && !isInt(number)) {
        alert('请输入有效的拟招生人数（正整数）');
        return;
    }
    if (isValidWidget(holdPlaceXm) && isBlank(holdPlace)) {
        alert('请输入举办地点');
        return;
    }
    if (isValidWidget(scoreXm) && !isFloat1(score)) {
        alert('请输入有效的拟授学员学分（一位小数）');
        return;
    }
    if (isValidWidget(postcodeXm) && (!isNumber(postcode) || !limitLength(postcode.toString(), 6, 6))) {
        alert('请输入有效的邮编');
        return;
    }
    if (isValidWidget(applyUnitXm) && isBlank(applyUnit)) {
        alert('请输入申报单位');
        return;
    }
    if (isValidWidget(applyLinkmanXm) && isBlank(applyLinkman)) {
        alert('请输入申报单位联系人');
        return;
    }
    if (isValidWidget(applyUnitPhoneXm) && !isNumber(applyUnitPhone)) {
        alert('请输入联系电话');
        return;
    }
    if (isValidWidget(unitNameXm) && isBlank(unitName)) {
        alert('请输入主办单位');
        return;
    }
    if (isValidWidget(unitLinkmanXm) && isBlank(unitLinkman)) {
        alert('请输入主办单位联系人');
        return;
    }
    if (isValidWidget(unitPhoneXm) && !isNumber(unitPhone)) {
        alert('请输入联系电话');
        return;
    }
    if (isValidWidget(lecturerScoreXm) && !isNumber(lecturerScore)) {
        alert('请输入讲师拟授学分');
        return;
    }
    if (isValidWidget(unitMailingAddrXm) && isBlank(unitMailingAddr)) {
        alert('请输入主办单位通讯地址');
        return;
    }
    if (isValidWidget(emailXM) && isBlank(email)) {
        alert('请输入电子邮箱');
        return;
    }

    let visit = baseUrl + 'projCyc/saveOrUpdate'

    let params = {
        // 申报单位
        "projectId": _projectId,
        "fresh": false,
        "applyLinkman": applyLinkman,
        "applyUnit": applyUnit,
        "applyUnitPhone": applyUnitPhone,
        "checkTypeId": checkTypeId,
        "days": days,
        "holdPlace": holdPlace,
        "holdTypeId": holdTypeId,
        "number": number,
        "period": period,
        "theoryPeriod": theoryPeriod,
        "experimentPeriod": experimentPeriod,
        "postcode": postcode,
        "remark": remark,
        "score": score,
        "teachObject": teachObject,
        // 主办单位
        "unitLinkman": unitLinkman,
        "unitName": unitName,
        "unitPhone": unitPhone,
        "lecturerScore": lecturerScore,
        "unitMailingAddress": unitMailingAddr,
        "email": email,
        "booksCheckUnit": booksCheckUnit,
        "limitInUnit": limitInUnit ? 1 : 0,
        "entryFee": entryFee,
        "batch": cycleArr.length,
        "cycleFormList": cycleArr
    };

    // switchBtn(frg, false);
    ajaxPost(visit, params, finalFun);

}
