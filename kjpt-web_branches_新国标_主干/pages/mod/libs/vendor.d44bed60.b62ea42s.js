let _dbase = {
    info: {},
    var: {
        cycleLimit: 6,
    },
    coursePeriod: {
        regexp: /^\d{1,4}(\.\d)?$/,
        sanitize: function (value) {
            value = String(value || '').replace(/[^\d.]/g, '');
            if (!value) return '';
            if (value.startsWith('.')) value = '0' + value;
            let dotIndex = value.indexOf('.');
            if (dotIndex !== -1) {
                value = value.substring(0, dotIndex + 1) + value.substring(dotIndex + 1).replace(/\./g, '');
            }
            let parts = value.split('.');
            let integerPart = parts[0].substring(0, 4);
            if (parts.length > 1) {
                let decimalPart = parts[1].substring(0, 1);
                return decimalPart ? `${integerPart}.${decimalPart}` : `${integerPart}.`;
            }
            return integerPart;
        },
        isValid: function (value) {
            return this.regexp.test(String(value || ''));
        },
        message: '讲授学时最多4位整数'
    },
    _headers: {
        'Authorization': localStorage.getItem('token'),
        'KJPT-USER-ID': localStorage.getItem('user-id')
    },
    _courseTableColArr: [
        {field: 'teacherName', title: '姓名', align: 'center', minWidth: 90, edit: 'text', sort: false, hide: false, fixed: 'left'},
        {field: 'certType', title: '证件类型', align: 'center', minWidth: 145, sort: false, hide: false, templet: '#courseCertTypeCell'},
        {field: 'idCardNo', title: '证件号码', align: 'center', minWidth: 180, edit: 'text', sort: false, hide: false},
        {field: 'titleId', title: '专业技术职务', align: 'center', minWidth: 123, sort: false, hide: false, templet: '#courseTitleIdCell'},
        {field: 'researchDirection', title: '主要研究方向', align: 'center', minWidth: 123, edit: 'text', sort: false, hide: false},
        {field: 'workUnit', title: '所在单位', align: 'center', minWidth: 120, edit: 'text', sort: false, hide: false},
        {field: 'teachTopic', title: '讲授题目', align: 'center', minWidth: 200, edit: 'text', sort: false, hide: false},
        {field: 'content', title: '内容（最多200字）', align: 'center', minWidth: 400, edit: 'text', sort: false, hide: false},
        {field: 'period', title: '讲授学时', align: 'center', minWidth: 95, edit: 'text', sort: false, hide: false},
        {field: 'teachingMethod', title: '教学方法', align: 'center', minWidth: 143, sort: false, hide: false, templet: '#courseTeachingMethodCell'},
        {field: 'operate', title: '操作', align: 'center', minWidth: 70, sort: false, hide: false, templet: '#courseOperationCell'}
    ],
    _cycleTableColArr: [
        {field: 'periodId', title: '', align: 'center', minWidth: 60, sort: false, hide: true},
        {field: 'periodId', title: '举办批次', minWidth: 60, align: 'center', templet: (data) => '第' + data.LAY_INDEX + '批次'},
        {field: 'dateStart', title: '开始日期', align: 'center', minWidth: 120, sort: false, hide: false, templet: '#cycDsTpl'},
        {field: 'dateEnd', title: '结束日期', align: 'center', minWidth: 120, sort: false, hide: false, templet: '#cycDeTpl'},
        {field: 'operate', title: '操作', align: 'center', minWidth: 66, sort: false, hide: false, templet: '#cycOperCell'}
    ],
    _certTypeData: [
        {"dictId": "9fcb08ce-ee86-4e4c-9611-9d430101cea4", "dictName": "身份证"},
        // {"dictId": "de3dfa08-f9ac-414d-9bc5-9d8b01570544", "dictName": "军官证"},
        {"dictId": "3444541a-9703-44ed-aae6-9d8b01574916", "dictName": "港澳台居民居住证"},
        {"dictId": "031d0bdc-8cd0-11ee-9c60-005056a64c01", "dictName": "港澳居民来往内地通行证"},
        {"dictId": "a85da857-fd72-4e9a-8657-afa900a0f569", "dictName": "台湾居民来往大陆通行证"},
        {"dictId": "d681a2b3-df10-421a-8279-afa900a0f569", "dictName": "其他法定有效证件"}
    ],
    freshCourse: function (projId) {
        return {
            'courseId': uuid(), 'projectId': projId, 'fresh': true, 'teacherName': '', 'certType': this.verify._certIdType,
            'idCardNo': '', 'titleId': '', 'researchDirection': '', 'workUnit': '', 'teachTopic': '', 'content': '',
            'period': '', 'teachingMethod': '面授', 'cstate': 1, 'userCreate': _userId
        };
    },
    disableSubmit: function () {
        let $submitBtn = $('button[type=submit]');
        $submitBtn.attr('disabled', 'true').addClass('layui-btn-disabled');
    },
    enableSubmit: function () {
        let $submitBtn = $('button[type=submit]');
        $submitBtn.removeClass('layui-btn-disabled').removeAttr("disabled");
    },
    parsePrincipalCeil: function (limitVoList) {
        if (limitVoList && limitVoList.length > 0) {
            if (1 === limitVoList.length) {
                return limitVoList[0]['maxPrincipalCount'];
            } else {
                return limitVoList[0]['maxPrincipalCount'];
            }
        } else {
            return 9999;
        }
    },
    parseNumberCeil: function (configList, slId) {
        return 999999;
    },
    verify: {
        json: {
            // page1
            projectName: [/^.{1,75}$/, '项目名称最多75个汉字'],
            progress: [/^[\s\S]{1,3000}$/, '最多3000个汉字'],
            question: [/^[\s\S]{1,3000}$/, '最多3000个汉字'],
            target: [/^[\s\S]{1,3000}$/, '最多3000个汉字'],
            innovation: [/^[\s\S]{1,3000}$/, '最多3000个汉字'],
            projAnalyze: [/^[\s\S]{1,3000}$/, '最多3000个汉字'],
            jobSummary: [/^[\s\S]{1,3000}$/, '最多3000个汉字'],
            // page2
            personName: [/^.{1,10}$/, '最多10汉字'],
            age: [/^\d{1,2}$/, '年龄格式不正确'],
            myMobile1: [/^.{1,75}$/, '手机号码格式不正确'],
            myPhone1: [/^.{1,75}$/, '电话号码格式不正确'],
            myMobile: [/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/, '手机号码格式不正确'],
            myPhone: [/^((\d{11})|((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})))$/, '电话号码格式不正确'],
            workUnit: [/^.{1,30}$/, '工作单位最多30汉字'],
            speciality: [/^.{1,50}$/, '从事专业最多50汉字'],
            duty: [/^.{1,50}$/, '职务最多50汉字'],
            assnDuty: [/^.{1,50}$/, '社团任职最多50汉字'],
            idCardNo1: function (value, item) {
                let msg = _dbase.verify._getCertNoErrorMsg(_dbase.verify._certIdType, value);
                if (msg) return msg;
            },
            idCardNo: function (value, item) {
                if ('638888' !== _unitId) {
                    let certType = layui.lat.getFormVal('page2-form').certType;
                    let msg = _dbase.verify._getCertNoErrorMsg(certType, value);
                    if (msg) return msg;
                }
            },
            address: [/(^$)|(^.{1,30}$)/, '地址最多30汉字'],
            postcode: [/(^$)|(^\d{6}$)/, '请输入正确的邮政编码'],
            resume: [/^[\s\S]{1,1000}$/, '最多1000汉字'],
            experience: [/^[\s\S]{1,1000}$/, '最多1000汉字'],
            training: [/^[\s\S]{1,1000}$/, '最多1000汉字'],
            study: [/^[\s\S]{1,1000}$/, '最多1000汉字'],
            article: [/^[\s\S]{1,1000}$/, '最多1000汉字'],
            article2000: [/^[\s\S]{1,2000}$/, '最多2000汉字'],
            rpPersonName: [/^.{1,10}$/, '最多10汉字'],
            rpAge: [/^\d{1,2}$/, '年龄格式不正确'],
            rpPhone: [/^((\d{11})|((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})))$/, '电话号码格式不正确'],
            rpDuty: [/^.{1,50}$/, '职务最多50汉字'],
            rpWorkUnit: [/^.{1,30}$/, '工作单位最多30汉字'],
            rpResume: [/^[\s\S]{1,1000}$/, '最多1000汉字'],
            // page4
            teachObject: [/^.{0,100}$/, '最多100汉字'],
            holdPlace: [/^.{1,100}$/, '最多100汉字'],
            number: [/^\d+$/, '请输入数字'],
            // score: [/^[1-9]\d*.\d*|0.\d*[1-9]\d*$/, '学分'],
            applyUnit: [/^.{1,40}$/, '最多40汉字'],
            applyUnit100: [/^.{1,100}$/, '最多100汉字'],
            applyLinkman: [/^.{1,10}$/, '最多10汉字'],
            unitName: [/^.{1,40}$/, '最多40汉字'],
            unitName100: [/^.{1,100}$/, '最多100汉字'],
            unitLinkman: [/^.{1,10}$/, '最多10汉字'],
            remark: [/^[\s\S]{0,100}$/, '最多100汉字'],
        },
        _certIdType: '9fcb08ce-ee86-4e4c-9611-9d430101cea4',
        _certIdErrorMsg: '身份证号格式不正确',
        _certIdLenErrorMsg: '证件号格式不正确',
        _certIdRegexp: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X)$)/,
        _getCertNoErrorMsg: function (certType, idCardNo) {
            if (idCardNo && idCardNo.length > 20) return this._certIdLenErrorMsg;
            if (this._certIdType === certType && idCardNo && !this._certIdRegexp.test(idCardNo)) return this._certIdErrorMsg;
            return '';
        },
        _verifyIdCardNo: function (certType, idCardNo) {
            return !this._getCertNoErrorMsg(certType, idCardNo);
        },
        course: {
            mustCertId: true,
            _maxLenFields: {
                researchDirection: {label: '主要研究方向', max: 200},
                workUnit: {label: '所在单位', max: 60},
                teachTopic: {label: '讲授题目', max: 200},
                content: {label: '内容', max: 500},
            },
            arr: function () {
                return '';
            },
            _single: function (course) {
                const that = this;
                // let idCardNo_old = course.idCardNo;
                // course.idCardNo = that.mustCertId ? idCardNo_old : '__CERT_ID__';
                // if (Object.keys(course).length !== Object.keys(removeEmpty(course)).length) {
                //     course.idCardNo = idCardNo_old;
                //     return '必填项不能为空,请完善课程及教师信息';
                // }
                // course.idCardNo = idCardNo_old;
                if (course.idCardNo) {
                    let msg = _dbase.verify._getCertNoErrorMsg(course.certType, course.idCardNo);
                    if (msg) return msg;
                }
                const isnull = function(v) {
                    return null === v || undefined === v || '' === v;
                }
                if (isnull(course.teacherName)) return '教师姓名不能为空';
                if (isnull(course.researchDirection)) return '主要研究方向不能为空';
                if (isnull(course.workUnit)) return '所在单位不能为空';
                if (isnull(course.teachTopic)) return '讲授题目不能为空';
                if (isnull(course.content)) return '内容不能为空';
                const maxLenKeys = Object.keys(that._maxLenFields || {});
                for (let idx = 0, len = maxLenKeys.length; idx < len; ++idx) {
                    const key = maxLenKeys[idx];
                    const rule = that._maxLenFields[key];
                    const value = course[key];
                    if (value && String(value).length > rule.max) return `${rule.label}最多${rule.max}个字`;
                }
                if (isnull(course.period )) return '学时不能为空';
                if (isNaN(course.period)) return '学时格式不正确';
                if (!_dbase.coursePeriod.isValid(course.period)) return _dbase.coursePeriod.message;
                return '';
            },
            single: function (course) {
                return '';
            },
            failMsg: function (courseArr) {
                const that = this;
                if (courseArr.length < 1) return '请填写课程及教师信息';
                _dbase.calc.period = 0;
                _dbase.calc.period_ll = 0;
                _dbase.calc.period_sy = 0;
                for (let idx = 0, len = courseArr.length; idx < len; ++idx) {
                    let course = courseArr[idx];
                    let msg = that._single(course);
                    if (msg) return msg;
                    msg = that.single(course);
                    if (msg) return msg;
                    // ok
                    course.listOrder = idx + 1;
                    if (isLilunCourse(course)) _dbase.calc.period_ll = accAdd(_dbase.calc.period_ll, course.period);
                    else _dbase.calc.period_sy = accAdd(_dbase.calc.period_sy, course.period);
                }
                let msg = that.arr();
                if (msg) return msg;
                return '';
            },
        },
    },
    attach: {
        tableColArr: [
            {field: 'category', title: '类别', align: 'center', minWidth: 90, templet: (data) => _dbase.attach.categoryText(data.category)},
            {field: 'fileName', title: '名称', align: 'center', minWidth: 90,},
            {field: 'operate', title: '操作', align: 'center', minWidth: 70, templet: '#attachmentOperationCell'}
        ],
        category: {
            '1': '医疗机构执业许可证/社会团体法人证',
            '2': '项目负责人职称证明',
            '3': '授课教师意愿书',
            '4': '继续医学教育项目承诺书',
            '5': '年检或校验合格证明材料',
        },
        categoryText: function (category) {
            return this.category[category.toString()];
        },
        mustAttachmentArr: function (slId) {
            let fullArr = [1, 2, 3, 4, 5];
            isAssnProj(slId) && (fullArr = [1, 2, 3, 4, 5]);
            isCityAssnProj(slId) && (fullArr = [1, 2, 3, 4]);
            isHubeiProvinceProj(slId) && (fullArr = [1, 2]);
            isHubeiCityProj(slId) && (fullArr = [1, 2]);
            return fullArr;
        },
    },
    calc: {
        period: 0,
        period_ll: 0,
        period_sy: 0,
        score: 0,
        days: 0,
        calcPeriod: function (courseArr) {
            const that = this;
            that.period = accAdd(that.period_ll, that.period_sy);
            if (that.isguangxi2025()) that.period = Math.floor(that.period / 45);
            layui.form.val('page4-form', {
                period: that.period,
                theoryPeriod: that.period_ll,
                experimentPeriod: that.period_sy
            });
        },
        calcScore: function (courseArr, cycleArr) {
        },
        calcDays: function (cycleArr) {
            const that = this;
            if (!cycleArr || (cycleArr.length <= 0)) {
                layui.form.val('page4-form', {days: null});
                return;
            }
            that.days = parseDiff(cycleArr[0]['dateStart'], cycleArr[0]['dateEnd']);
            $('input[name=days]').val(that.days);
            layui.form.val('page4-form', {days: that.days});
        },
        isguangxi2025: function () {
            return _isGuangxi && _dbase.info.holdYear >= 2025;
        },
    },
    fix: {
        fixForm: function () {
        },
    },
};

$(document).on('focus', '.layui-table-view td[data-field="period"] .layui-table-edit', function () {
    $(this).attr('maxlength', '6').attr('inputmode', 'decimal');
});

$(document).on('input', '.layui-table-view td[data-field="period"] .layui-table-edit', function () {
    let value = _dbase.coursePeriod.sanitize($(this).val());
    $(this).val(value);
});
