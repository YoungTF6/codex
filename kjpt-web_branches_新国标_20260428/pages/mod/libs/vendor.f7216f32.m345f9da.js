let _fm = {
    getTxarelgVal: function (prefix, name) {
        return $(`div[name=${prefix}${name}]`).map(function (idx, ele) {
            return $(this).html();
        }).get().join('');
    },
    getTxaremdVal: function (prefix, name) {
        return $(`div[name=${prefix}${name}]`).html();
    },
    getTxaresmVal: function (prefix, name) {
        return $(`div[name=${prefix}${name}]`).text();
    },
    getProj: function (xmSelInst, baseInfo) {
        let that = this;
        let proj = {};
        $('input[name^=proj_]').each(function (idx, ele) {
            let $ipt = $(this);
            let name = $ipt.attr('name').replace('proj_', '');
            proj[name] = $ipt.val();
        });
        $('div.txare_lg[name^=proj_][data-idx="0"]').each(function (idx, ele) {
            let $txa = $(this);
            let name = $txa.attr('name').replace('proj_', '');
            proj[name] = that.getTxarelgVal('proj_', name);
        });
        $('div.txare_md[name^=proj_]').each(function (idx, ele) {
            let $txa = $(this);
            let name = $txa.attr('name').replace('proj_', '');
            proj[name] = that.getTxaremdVal('proj_', name);
        });
        $('div.txare_sm[name^=proj_]').each(function (idx, ele) {
            let $txa = $(this);
            let name = $txa.attr('name').replace('proj_', '');
            proj[name] = that.getTxaresmVal('proj_', name);
        });
        let keys = Object.keys(xmSelInst || {});
        if (keys.length > 0) {
            keys.filter(key => key.includes('proj_'))
                .forEach(key => {
                    let name = key.replace('proj_', '');
                    let inst = xmSelInst[key];
                    if (inst) proj[name] = inst.getValue('valueStr');
                });
        }
        keys = Object.keys(baseInfo || {});
        if (keys.length > 0) {
            keys.forEach(key => {
                proj[key] = baseInfo[key];
            });
        }
        return proj;
    },
    getPrin: function (xmSelInst) {
        let that = this;
        let prin = {};
        $('input[name^=prin_]').each(function (idx, ele) {
            let $ipt = $(this);
            let name = $ipt.attr('name').replace('prin_', '');
            prin[name] = $ipt.val();
        });
        $('div.txare_lg[name^=prin_][data-idx="0"]').each(function (idx, ele) {
            let $txa = $(this);
            let name = $txa.attr('name').replace('prin_', '');
            prin[name] = that.getTxarelgVal('prin_', name);
        });
        $('div.txare_md[name^=prin_]').each(function (idx, ele) {
            let $txa = $(this);
            let name = $txa.attr('name').replace('prin_', '');
            prin[name] = that.getTxaremdVal('prin_', name);
        });
        $('div.txare_sm[name^=prin_]').each(function (idx, ele) {
            let $txa = $(this);
            let name = $txa.attr('name').replace('prin_', '');
            prin[name] = that.getTxaresmVal('prin_', name);
        });
        let keys = Object.keys(xmSelInst || {});
        if (keys.length > 0) {
            keys.filter(key => key.includes('prin_'))
                .forEach(key => {
                    let name = key.replace('prin_', '');
                    let inst = xmSelInst[key];
                    if (inst) {
                        prin[name] = inst.getValue('valueStr');
                        if ('specId' === name) {
                            prin.speciality = (xmSelInst[key]?.getValue('nameStr') || '').trim();
                        }
                    }
                });
        }
        prin.article = that.getPrinArticle();
        return prin;
    },
    getPrinArticle: function () {
        let arr = [];
        document.querySelectorAll('div[name="prin_article"] > p').forEach(p => {
            let year = p.dataset.year;
            let yon = p.dataset.yon;
            let pcode = p.dataset.pcode;
            arr.push(`${year},${yon},${pcode}`);
        });
        return arr.join('#');
    },
    calc: {
        period: 0,
        period_ll: 0,
        period_sy: 0,
        score: 0,
        days: 0,
        calcPeriod: function (courseArr) {
            const that = this;
            if (courseArr.length > 0) {
                that.period = that.period_ll = that.period_sy = 0;
                for (const c of courseArr) {
                    if (!_echo.tchr.isPad(c)) {
                        let period = +(c.period);
                        that.period = accAdd(that.period, period);
                        if (_echo.tchr.isLilun(c)) that.period_ll = accAdd(that.period_ll, period);
                        if (_echo.tchr.isShiyan(c)) that.period_sy = accAdd(that.period_sy, period);
                    }
                }
                $('input[name=proj_theoryPeriod]').val(that.period_ll);
                $('input[name=proj_experimentPeriod]').val(that.period_sy);
                $('input[name=proj_period]').val(that.period);
            }
        },
        calcScore: function () {
        },
        calcDays: function (cycleArr) {
            if (cycleArr.length > 0) {
                let days = parseDiff(cycleArr[0]['dateStart'], cycleArr[0]['dateEnd'])
                $('input[name=proj_days]').val(days);
            }
        },
    },
}
let _validate = {
    strlength: function (str, min, max) {
        let len = (str || '').length;
        if (len < min) return `最少${min}字`;
        if (len > max) return `最多${max}字`;
    },
    numberlimit: function (val, min, max) {
        if (val < min) return `不能低于${min}`;
        if (val > max) return `不能大于${max}`;
    },
    rule: {
        required: [/[\S]+/, '必填项不能为空'],
        phone: [/^1\d{10}$/, '请输入正确的手机号'],
        email: [/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/, '邮箱格式不正确'],
        url: [/(^#)|(^http(s*):\/\/[^\s]+\.[^\s]+)/, '链接格式不正确'],
        number: function (value) {
            if (!value || isNaN(value)) return '只能填写数字'
        },
        date: [/^(\d{4})[-\/](\d{1}|0\d{1}|1[0-2])([-\/](\d{1}|0\d{1}|[1-2][0-9]|3[0-1]))*$/, '日期格式不正确'],
        identity: [/(^\d{15}$)|(^\d{17}(x|X|\d)$)/, '请输入正确的身份证号'],
        number_zzs: [/^\d+$/, '请输入正整数'],
        percent: (val, item) => _validate.numberlimit(val, 0, 100),
        myMobile: [/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/, '手机号码格式不正确'],
        myPhone: [/^((\d{11})|((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})))$/, '电话号码格式不正确'],
    },
    ruleExt: {
        // proj
        projectName: [/^[\s\S]{1,75}$/, '项目名称最多75个汉字'],
        jobSummary11: [/^[\s\S]{1,3000}$/, '最多3000个汉字'],
        projAnalyze11: [/^[\s\S]{1,3000}$/, '最多3000个汉字'],
        progress: [/^[\s\S]{1,3000}$/, '最多3000个汉字'],
        question11: [/^[\s\S]{1,3000}$/, '最多3000个汉字'],
        target11: [/^[\s\S]{1,3000}$/, '最多3000个汉字'],
        innovation11: [/^[\s\S]{1,3000}$/, '最多3000个汉字'],
        jobSummary: (val) => _validate.strlength(val, 300, 2000),
        projAnalyze: (val) => _validate.strlength(val, 500, 2000),
        question: (val) => _validate.strlength(val, 100, 2000),
        target: (val) => _validate.strlength(val, 800, 2000),
        innovation: (val) => _validate.strlength(val, 500, 2000),
        // proj-oth
        teachObject: [/^.{0,100}$/, '教学对象最多100汉字'],
        holdPlace: [/^[\s\S]{1,100}$/, '举办地点最多100汉字'],
        applyUnit: [/^[\s\S]{1,40}$/, '单位名称最多40汉字'],
        applyLinkman: [/^.{1,10}$/, '联系人姓名最多10汉字'],
        unitName: [/^[\s\S]{1,40}$/, '单位名称最多40汉字'],
        unitLinkman: [/^.{1,10}$/, '联系人姓名最多10汉字'],
        remark: [/^[\s\S]{0,100}$/, '备注最多100汉字'],
        unitOpinion: [/^[\s\S]{1,50}$/, '单位意见最多50个汉字'],
        minPeriod: function (val, item) {
             if ($(item).data('check-period')) {
                 let v = parseFloat(val);
                 if (v < 2) return '课程学时不足，请维护';
                 let days = parseFloat($('input[name="proj_days"]').val()) || 0;
                 if (days > 0 && v > days * 9) return '举办天数不满足要求';
             }
        },
        // prin
        personName: [/^.{1,10}$/, '负责人姓名最多10汉字'],
        age: [/^\d{1,2}$/, '年龄格式不正确'],
        certNoMax20: [/^[\s\S]{0,20}$/, '证件号格式不正确'],
        workUnit: [/^[\s\S]{1,30}$/, '工作单位最多30汉字'],
        speciality: [/^.{1,50}$/, '从事专业最多50汉字'],
        duty: [/^.{1,50}$/, '职务最多50汉字'],
        assnDuty: [/^.{1,50}$/, '社团任职最多50汉字'],
        address: [/(^$)|(^[\s\S]{1,30}$)/, '地址最多30汉字'],
        postcode: [/(^$)|(^\d{6}$)/, '请输入正确的邮政编码'],
        resume: [/^[\s\S]{1,1000}$/, '最多1000汉字'],
        experience: [/^[\s\S]{1,1000}$/, '最多1000汉字'],
        training: [/^[\s\S]{1,1000}$/, '最多1000汉字'],
        sign1: [/[\S]+/, '项目负责人承诺书未签名'],
        sign2: [/[\S]+/, '项目负责人签字不能为空'],
        study: (val) => _validate.strlength(val, 300, 1000),
        article: (val) => {
            let parr = val.split('#');
            for (const p of parr) {
                let a = p.split(',');
                let year = a[0];
                let yon = a[1];
                let pcode = a[2];
                if ('Y' === yon && pcode.length < 1) {
                    return `请完善项目负责人${year}年获批项目编号`;
                }
            }
        },
    },
    ruleStage: {
        jobSummary: [/^[\s\S]{0,2000}$/, '最多2000个汉字'],
        projAnalyze: [/^[\s\S]{0,2000}$/, '最多2000个汉字'],
        progress: [/^[\s\S]{0,2000}$/, '最多2000个汉字'],
        question: [/^[\s\S]{0,2000}$/, '最多2000个汉字'],
        target: [/^[\s\S]{0,2000}$/, '最多2000个汉字'],
        innovation: [/^[\s\S]{0,2000}$/, '最多2000个汉字'],
    },
    verify: {
        // proj
        'proj_holdYear': 'required',
        'proj_scoreLevelId': 'required',
        'proj_knowledgeId': 'required',
        'proj_addTime': 'required',
        'proj_projectName': 'required|projectName',
        'proj_jobSummary': 'required|jobSummary',
        'proj_projAnalyze': 'required|projAnalyze',
        'proj_progress': 'required|progress',
        'proj_question': 'required|question',
        'proj_target': 'required|target',
        'proj_innovation': 'required|innovation',
        // proj-oth
        'proj_holdTypeId': 'required',
        'proj_days': 'required',
        'proj_addDay': 'required',
        'proj_teachObject': 'required|teachObject',
        'proj_checkTypeId': 'required',
        'proj_number': 'required|number_zzs',
        'proj_holdPlace': 'required|holdPlace',
        'proj_period': 'required|number|minPeriod',
        'proj_theoryPeriod': 'required|number',
        'proj_experimentPeriod': 'required|number',
        'proj_score': 'required',
        'proj_applyUnit': 'required|applyUnit',
        'proj_applyLinkman': 'required|applyLinkman',
        'proj_applyUnitPhone': 'required|myPhone',
        'proj_unitName': 'required|unitName',
        'proj_isForWest': 'required',
        'proj_basicPercent': 'required|number_zzs|percent',
        'proj_unitOpinion': 'required|unitOpinion',
        // prin
        'prin_personName': 'required|personName',
        'prin_gender': 'required',
        'prin_birthDate': 'required',
        'prin_idCardNo': 'required|certNoMax20',
        'prin_titleId': 'required',
        'prin_business': 'required',
        'prin_phone': 'required|myPhone',
        'prin_education': 'required',
        'prin_workUnit': 'required|workUnit',
        'prin_address': 'required|address',
        'prin_speciality': 'speciality',
        'prin_specId': 'required',
        'prin_duty': 'required|duty',
        'prin_assnDuty': 'required|assnDuty',
        'prin_isLecturer': 'required',
        'prin_isInJob': 'required',
        'prin_resume': 'required|resume',
        'prin_experience': 'required|experience',
        'prin_training': 'required|training',
        'prin_study': 'required|study',
        'prin_article': 'required|article',
        'prin_sign1': 'sign1',
        'prin_sign2': 'sign2',
        //
        'course_mustCertId': 0, // false
        'course_arr': function (courseArr) {
            if (courseArr.length < 1) return '未添加课程！';
        },
        'cycle_limit': 6,
        'cycle_arr': function (cycleArr) {
            if (cycleArr.length < 1) return '未添加举办周期！';
        },
    },
    isPass: function (obj, prefix, action) {
        let that = this;
        const _danger = 'danger';
        const isStage = 'stage' === action;
        $.extend(true, that.rule, that.ruleExt);
        let keys = Object.keys(obj);
        for (const _key of keys) {
            const _name = prefix + _key;
            let $elem = $(`*[name=${_name}]`);
            $elem.removeClass(_danger);
            let value = obj[_key] || '';
            let rules = (that.verify[_name] || '').split('|');
            if (isStage && !value && !'proj_projectName,proj_knowledgeId'.includes(_name)) {
                continue;
            }
            for (const _rule of rules) {
                let isFail, errorTxt;
                let isFn = 'function' === typeof that.rule[_rule];
                if (that.rule[_rule]) {
                    isFail = isFn ? errorTxt = that.rule[_rule](value, $elem) : !that.rule[_rule][0].test(value);
                    errorTxt = errorTxt || that.rule[_rule][1];
                    if (isFail) {
                        // [${_name}]
                        layui.lat.failMsg(`${errorTxt}`);
                        $elem.focus().addClass(_danger);
                        $elem.parents('td')[0].scrollIntoView({behavior: 'smooth', block: 'center'});
                        return false;
                    }
                }
            }
        }
        return true;
    },
    isCoursePass: function (courseArr) {
        const that = this;
        let msg = that.verify.course_arr(courseArr);
        if(msg) {
            layui.lat.failMsg(msg);
            $('#page_course')[0].scrollIntoView({behavior: 'smooth', block: 'start'});
            return false;
        } else {
            return true;
        }
    },
    isCyclePass: function (cycleArr) {
        const that = this;
        let msg = that.verify.cycle_arr(cycleArr);
        if(msg) {
            layui.lat.failMsg(msg);
            $('#page_other')[0].scrollIntoView({behavior: 'smooth', block: 'start'});
            return false;
        } else {
            return true;
        }
    },
}
let _faker = {
    proj: {
        'projectName': '项目名称',
        'knowledgeId': '2343ea84-ad63-11ef-94bf-005056a64c01',
        'days': '5',
        'teachObject': '对象',
        'number': '6',
        'period': '99',
        'theoryPeriod': '66',
        'experimentPeriod': '33',
        'holdPlace': '地点',
        'score': '88',
        'applyUnit': '单位',
        'applyLinkman': '张三',
        'applyUnitPhone': '1234567890',
        'jobSummary': '概况',
        'projAnalyze': '分析',
        'target': '目标',
        'progress': '进展',
        'innovation': '创新',
        'holdTypeId': '9fac219f-254f-4ddb-96a1-b4df7ab2b4a7',
        'isForWest': '1',
        'checkTypeId': '7e152a7d-dc01-4e88-918e-9b2f00eb28a0',
    },
    prin: {
        'personName': '负责人姓名',
        'idCardNo': '123456200001011234',
        'workUnit': '工作单位',
        'speciality': '专业',
        'study': '研究',
        'article': '文章',
        'address': '地址',
        'phone': '12345678901',
        'birthDate': '2024-01-01',
        'gender': 'M',
        'isInJob': '1',
        'isLecturer': '1',
        'business': '26dd57c4-20b9-49a7-895e-9df8001e32fa',
        'education': 'f690e9f5-f3ce-4186-bddf-9d8c00e9a7b5',
        'titleId': 'ad054866-5331-4546-98bc-9b2f0124b22e',
        'sign1:': '',
        'sign2:': '',
        'signDate:': '2024-01-02',
    },
    courseArr: [
        {
            'courseId': uuid(),
            'teacherName': '教师1',
            'certType': '9fcb08ce-ee86-4e4c-9611-9d430101cea4',
            'idCardNo': '123456',
            'titleId': 'ad054866-5331-4546-98bc-9b2f0124b22e',
            'titleName': '主任医师',
            'researchDirection': '方向',
            'workUnit': '单位',
            'teachTopic': '题目',
            'content': '内容',
            'period': '3',
            'teachingMethod': '理论',
            'phone': '1234567890'
        },
        {
            'courseId': uuid(),
            'teacherName': '教师2',
            'certType': '9fcb08ce-ee86-4e4c-9611-9d430101cea4',
            'idCardNo': '123456',
            'titleId': 'ad054866-5331-4546-98bc-9b2f0124b22e',
            'titleName': '主任医师',
            'researchDirection': '方向',
            'workUnit': '单位',
            'teachTopic': '题目',
            'content': '内容',
            'period': '3',
            'teachingMethod': '理论',
            'phone': '1234567890'
        },
        {
            'courseId': uuid(),
            'teacherName': '教师3',
            'certType': '9fcb08ce-ee86-4e4c-9611-9d430101cea4',
            'idCardNo': '123456',
            'titleId': 'ad054866-5331-4546-98bc-9b2f0124b22e',
            'titleName': '主任医师',
            'researchDirection': '方向',
            'workUnit': '单位',
            'teachTopic': '题目',
            'content': '内容',
            'period': '3',
            'teachingMethod': '实验技术',
            'phone': '1234567890'
        },
        {
            'courseId': uuid(),
            'teacherName': '教师4',
            'certType': '9fcb08ce-ee86-4e4c-9611-9d430101cea4',
            'idCardNo': '123456',
            'titleId': 'ad054866-5331-4546-98bc-9b2f0124b22e',
            'titleName': '主任医师',
            'researchDirection': '方向',
            'workUnit': '单位',
            'teachTopic': '题目',
            'content': '内容',
            'period': '3',
            'teachingMethod': '实验技术',
            'phone': '1234567890'
        },
        {
            'courseId': uuid(),
            'teacherName': '教师5',
            'certType': '9fcb08ce-ee86-4e4c-9611-9d430101cea4',
            'idCardNo': '123456',
            'titleId': 'ad054866-5331-4546-98bc-9b2f0124b22e',
            'titleName': '主任医师',
            'researchDirection': '方向',
            'workUnit': '单位',
            'teachTopic': '题目',
            'content': '内容',
            'period': '3',
            'teachingMethod': '实验技术',
            'phone': '1234567890'
        },
    ],
    cycleArr: [
        {'periodId': uuid(), 'dateStart': '2024-01-01', 'dateEnd': '2024-02-01'},
        {'periodId': uuid(), 'dateStart': '2024-03-01', 'dateEnd': '2024-04-01'},
        {'periodId': uuid(), 'dateStart': '2024-05-01', 'dateEnd': '2024-06-01'},
        {'periodId': uuid(), 'dateStart': '2024-07-01', 'dateEnd': '2024-08-01'},
        {'periodId': uuid(), 'dateStart': '2024-09-01', 'dateEnd': '2024-10-01'},
        {'periodId': uuid(), 'dateStart': '2024-11-01', 'dateEnd': '2024-12-01'},
    ],
}