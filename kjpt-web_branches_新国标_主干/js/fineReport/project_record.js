function record_echoPeriod(frg) {
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

function record_echoDays(frg, days) {
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

function record_changeStart(frg, frContentPane, that) {
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
    (index === 0) && record_echoDays(frg, daysBetween(curStart, curEnd));
}


function record_changeEnd(frg, frContentPane, that) {
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
    (index === 0) && record_echoDays(frg, daysBetween(curStart, curEnd));
}

// 有返回值
function record_insertCycle(frg, frContentPane) {
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
    record_echoDays(frg, daysBetween(firstStart, firstEnd));
    record_echoPeriod(frg);
}

function record_deleteCycle(frg, frFR, that) {
    var cell = that.options.location;
    // 获取当前控件所在单元格的编号
    frFR.Msg.confirm("提示", "确定要删除吗？", function (value) {
        if (value) {
            // 删除当前行
            frg.deleteReportRC(cell);
            record_echoDays(frg);
            record_echoPeriod(frg);
        }
    });
}


// 项目备案
function record4save(frg, baseUrl, newProjId, unitId, dbProjId, saveType, flowName, cmeStandardKindId, finalFun) {
    debugger

    // ------------------项目及负责人信息---------------
    //var project_id = frg.getWidgetByName("project_id"); // 项目id
    // 负责人电话
    let fzr_phone_xm = frg.getWidgetByName("fzr_phone");
    let fzr_phone = isValidWidget(fzr_phone_xm) ? fzr_phone_xm.getValue() : null;
    // 申报单位联系人
    let apply_unit_linkman_xm = frg.getWidgetByName("apply_unit_linkman");
    let apply_unit_linkman = isValidWidget(apply_unit_linkman_xm) ? apply_unit_linkman_xm.getValue() : null;
    // 申报单位联系人电话
    let apply_unit_phone_xm = frg.getWidgetByName("apply_unit_phone");
    let apply_unit_phone = isValidWidget(apply_unit_phone_xm) ? apply_unit_phone_xm.getValue() : null;
    // 申报单位联系人
    let unit_linkman_xm = frg.getWidgetByName("unit_linkman");
    let unit_linkman = isValidWidget(unit_linkman_xm) ? unit_linkman_xm.getValue() : null;
    // 申报单位联系人电话
    let unit_phone_xm = frg.getWidgetByName("unit_phone");
    let unit_phone = isValidWidget(unit_phone_xm) ? unit_phone_xm.getValue() : null;
    // 举办期限
    let days_xm = frg.getWidgetByName("days");
    let days = isValidWidget(days_xm) ? days_xm.getValue() : null;
    // 举办地点
    let hold_place_xm = frg.getWidgetByName("hold_place");
    let hold_place = isValidWidget(hold_place_xm) ? hold_place_xm.getValue() : null;
    // 实授学分
    let fact_score_xm = frg.getWidgetByName("fact_score");
    let fact_score = isValidWidget(fact_score_xm) ? fact_score_xm.getValue() : 0;
    // 实际举办期限
    let fact_days_xm = frg.getWidgetByName("fact_days");
    let fact_days = isValidWidget(fact_days_xm) ? fact_days_xm.getValue() : null;
    // 实际举办地点
    let fact_place_xm = frg.getWidgetByName("fact_place");
    let fact_place = isValidWidget(fact_place_xm) ? fact_place_xm.getValue() : null;
    // 拟授学分
    let score_xm = frg.getWidgetByName("score");
    let score = isValidWidget(score_xm) ? score_xm.getValue() : 0;
    // 拟招学员人数
    let number_xm = frg.getWidgetByName("number");
    let number = isValidWidget(number_xm) ? number_xm.getValue() : 0;
    // 教学对象
    let teach_object_xm = frg.getWidgetByName("teach_object");
    let teach_object = isValidWidget(teach_object_xm) ? teach_object_xm.getValue() : null;
    // 备注
    let remark_xm = frg.getWidgetByName("remark");
    let remark = isValidWidget(remark_xm) ? remark_xm.getValue() : null;

    //--------------------------------举办周期-----------------------------
    var jbzq_date_start_arr = new Array();
    var jbzq_date_end_arr = new Array();
    if (frg.getWidgetsByName("jbzq_date_start").length === undefined) {
        jbzq_date_start_arr[0] = contentPane.getWidgetsByName("jbzq_date_start");//举办周期开始日期
        jbzq_date_end_arr[0] = contentPane.getWidgetsByName("jbzq_date_end");//举办周期结束日期
    } else {
        jbzq_date_start_arr = contentPane.getWidgetsByName("jbzq_date_start");//举办周期开始日期
        jbzq_date_end_arr = contentPane.getWidgetsByName("jbzq_date_end");//举办周期结束日期
    }
    //---------------------------------举办周期字段校验-------------------------
    var batchList = [];
    if (jbzq_date_start_arr.length > 0) {
        for (var i = 0; i < jbzq_date_start_arr.length; i++) {
            if (isBlank(jbzq_date_start_arr[i].getValue())) {
                alert("举办周期开始日期不能为空");
                return;
            }
            if (isBlank(jbzq_date_end_arr[i].getValue())) {
                alert("举办周期结束日期不能为空");
                return;
            }
            var aaa = {
                "dateStart": jbzq_date_start_arr[i].getValue(),
                "dateEnd": jbzq_date_end_arr[i].getValue(),
                "projectId": newProjId,
                "batchId": i + 1,
                "unitId": unitId
            }
            batchList.push(aaa);
        }
    }

    if (isValidWidget(fzr_phone_xm) && isBlank(fzr_phone)) {
        alert('请输入项目负责人电话');
        return;
    }
    if (isValidWidget(apply_unit_linkman_xm) && isBlank(apply_unit_linkman)) {
        alert('请输入申报单位联系人');
        return;
    }
    if (isValidWidget(apply_unit_phone_xm) && isBlank(apply_unit_phone)) {
        alert('请输入联系电话');
        return;
    }
    if (isValidWidget(unit_linkman_xm) && isBlank(unit_linkman)) {
        alert('请输入主办单位联系人');
        return;
    }
    if (isValidWidget(unit_phone_xm) && isBlank(unit_phone)) {
        alert('请输入联系电话');
        return;
    }

    if (isValidWidget(hold_place_xm) && isBlank(hold_place)) {
        alert('请输入举办地点');
        return;
    }
    if (isValidWidget(fact_score_xm) && isBlank(fact_score)) {
        alert('请输入实授学分');
        return;
    }
    if (isValidWidget(days_xm) && isBlank(days)) {
        alert('请输入举办期限');
        return;
    }
    if (isValidWidget(fact_days_xm) && isBlank(fact_days)) {
        alert('请输入实际举办期限');
        return;
    }
    if (isValidWidget(fact_place_xm) && isBlank(fact_place)) {
        alert('请输入实际举办地点');
        return;
    }
    if (isValidWidget(score_xm) && !isNumber(score)) {
        alert('请输入拟授学员学分');
        return;
    }
    if (isValidWidget(number_xm) && isBlank(number)) {
        alert('请输入拟招学员人数');
        return;
    }
    if (isValidWidget(teach_object_xm) && isBlank(teach_object)) {
        alert('请输入教学对象');
        return;
    }

    let visit = baseUrl + 'record'
    let params =
        {
            "projectId": newProjId,
            "previousId": dbProjId,
            "phone": fzr_phone,
            "applyLinkman": apply_unit_linkman,
            "applyUnitPhone": apply_unit_phone,
            "unitLinkman": unit_linkman,
            "unitPhone": unit_phone,
            "days": days,
            "holdPlace": hold_place,
            "factScore": fact_score,
            "factDays": fact_days,
            "factPlace": fact_place,
            "score": score,
            "number": number,
            "teachObject": teach_object,
            "remark": remark,
            "projectBatchList": batchList,
            "saveType": saveType,
            "flowName": flowName,
            "cmeStandardKindId": cmeStandardKindId,
            "unitId": unitId
        };

    ajaxPost(visit, params, finalFun);
}

// 项目备案
function record4saveTest(frg, baseUrl, newProjId, projectBeiAnId, unitId, dbProjId, saveType, flowName, cmeStandardKindId, finalFun) {
    debugger
    var projetId;
    if (projectBeiAnId != '' && projectBeiAnId != null && projectBeiAnId != 'null') {
        projetId = projectBeiAnId;
    } else {
        projetId = newProjId;
    }
    // ------------------项目及负责人信息---------------
    //var project_id = frg.getWidgetByName("project_id"); // 项目id
    // 负责人电话
    let fzr_phone_xm = frg.getWidgetByName("fzr_phone");
    let fzr_phone = isValidWidget(fzr_phone_xm) ? fzr_phone_xm.getValue() : null;
    // 申报单位联系人
    let apply_unit_linkman_xm = frg.getWidgetByName("apply_unit_linkman");
    let apply_unit_linkman = isValidWidget(apply_unit_linkman_xm) ? apply_unit_linkman_xm.getValue() : null;
    // 申报单位联系人电话
    let apply_unit_phone_xm = frg.getWidgetByName("apply_unit_phone");
    let apply_unit_phone = isValidWidget(apply_unit_phone_xm) ? apply_unit_phone_xm.getValue() : null;
    // 申报单位联系人
    let unit_linkman_xm = frg.getWidgetByName("unit_linkman");
    let unit_linkman = isValidWidget(unit_linkman_xm) ? unit_linkman_xm.getValue() : null;
    // 申报单位联系人电话
    let unit_phone_xm = frg.getWidgetByName("unit_phone");
    let unit_phone = isValidWidget(unit_phone_xm) ? unit_phone_xm.getValue() : null;
    // 举办期限
    let days_xm = frg.getWidgetByName("days");
    let days = isValidWidget(days_xm) ? days_xm.getValue() : null;
    // 举办地点
    let hold_place_xm = frg.getWidgetByName("hold_place");
    let hold_place = isValidWidget(hold_place_xm) ? hold_place_xm.getValue() : null;
    // 实授学分
    let fact_score_xm = frg.getWidgetByName("fact_score");
    let fact_score = isValidWidget(fact_score_xm) ? fact_score_xm.getValue() : 0;
    // 实际举办期限
    let fact_days_xm = frg.getWidgetByName("xm_days");
    let fact_days = isValidWidget(fact_days_xm) ? fact_days_xm.getValue() : null;
    // 实际举办地点
    let fact_place_xm = frg.getWidgetByName("fact_place");
    let fact_place = isValidWidget(fact_place_xm) ? fact_place_xm.getValue() : null;
    // 拟授学分
    let score_xm = frg.getWidgetByName("score");
    let score = isValidWidget(score_xm) ? score_xm.getValue() : 0;
    // 拟招学员人数
    let number_xm = frg.getWidgetByName("number");
    let number = isValidWidget(number_xm) ? number_xm.getValue() : 0;
    // 教学对象
    let teach_object_xm = frg.getWidgetByName("teach_object");
    let teach_object = isValidWidget(teach_object_xm) ? teach_object_xm.getValue() : null;
    // 备注
    let remark_xm = frg.getWidgetByName("remark");
    let remark = isValidWidget(remark_xm) ? remark_xm.getValue() : null;

    //--------------------------------举办周期-----------------------------
    var jbzq_date_start_arr = new Array();
    var jbzq_date_end_arr = new Array();
    if (frg.getWidgetsByName("jbzq_date_start").length === undefined) {
        jbzq_date_start_arr[0] = contentPane.getWidgetsByName("jbzq_date_start");//举办周期开始日期
        jbzq_date_end_arr[0] = contentPane.getWidgetsByName("jbzq_date_end");//举办周期结束日期
    } else {
        jbzq_date_start_arr = contentPane.getWidgetsByName("jbzq_date_start");//举办周期开始日期
        jbzq_date_end_arr = contentPane.getWidgetsByName("jbzq_date_end");//举办周期结束日期
    }
    //---------------------------------举办周期字段校验-------------------------
    var batchList = [];
    if (jbzq_date_start_arr.length > 0) {
        for (var i = 0; i < jbzq_date_start_arr.length; i++) {
            if (isBlank(jbzq_date_start_arr[i].getValue())) {
                alert("举办周期开始日期不能为空");
                return;
            }
            if (isBlank(jbzq_date_end_arr[i].getValue())) {
                alert("举办周期结束日期不能为空");
                return;
            }
            var aaa = {
                "dateStart": jbzq_date_start_arr[i].getValue(),
                "dateEnd": jbzq_date_end_arr[i].getValue(),
                "projectId": projetId,
                "batchId": i + 1,
                "unitId": unitId
            }
            batchList.push(aaa);
        }
    }

    if (isValidWidget(fzr_phone_xm) && isBlank(fzr_phone)) {
        alert('请输入项目负责人电话');
        return;
    }
    if (isValidWidget(apply_unit_linkman_xm) && isBlank(apply_unit_linkman)) {
        alert('请输入申报单位联系人');
        return;
    }
    if (isValidWidget(apply_unit_phone_xm) && isBlank(apply_unit_phone)) {
        alert('请输入联系电话');
        return;
    }
    if (isValidWidget(unit_linkman_xm) && isBlank(unit_linkman)) {
        alert('请输入主办单位联系人');
        return;
    }
    if (isValidWidget(unit_phone_xm) && isBlank(unit_phone)) {
        alert('请输入联系电话');
        return;
    }

    if (isValidWidget(hold_place_xm) && isBlank(hold_place)) {
        alert('请输入举办地点');
        return;
    }
    if (isValidWidget(fact_score_xm) && isBlank(fact_score)) {
        alert('请输入实授学分');
        return;
    }
    if (isValidWidget(days_xm) && isBlank(days)) {
        alert('请输入举办期限');
        return;
    }
    if (isValidWidget(fact_days_xm) && isBlank(fact_days)) {
        alert('请输入实际举办期限');
        return;
    }
    if (isValidWidget(fact_place_xm) && isBlank(fact_place)) {
        alert('请输入实际举办地点');
        return;
    }
    if (isValidWidget(score_xm) && !isNumber(score)) {
        alert('请输入拟授学员学分');
        return;
    }
    if (isValidWidget(number_xm) && isBlank(number)) {
        alert('请输入拟招学员人数');
        return;
    }
    if (isValidWidget(teach_object_xm) && isBlank(teach_object)) {
        alert('请输入教学对象');
        return;
    }

    let visit = baseUrl + 'record'
    let params =
        {
            "projectId": projetId,
            "previousId": dbProjId,
            "phone": fzr_phone,
            "applyLinkman": apply_unit_linkman,
            "applyUnitPhone": apply_unit_phone,
            "unitLinkman": unit_linkman,
            "unitPhone": unit_phone,
            "days": fact_days,
            "holdPlace": hold_place,
            "factScore": fact_score,
            "factDays": fact_days,
            "factPlace": fact_place,
            "score": score,
            "number": number,
            "teachObject": teach_object,
            "remark": remark,
            "projectBatchList": batchList,
            "saveType": saveType,
            "flowName": flowName,
            "cmeStandardKindId": cmeStandardKindId,
            "unitId": unitId
        };

    ajaxPost(visit, params, finalFun);
}
