layui.config({
    base: '/js/layui/ext/'
}).extend({
    xmSelect: 'xm-select',
    lat: 'lat',
    treeSelect: 'treeSelect'
}).use(['table', 'layer', 'jquery', 'form', 'laydate', 'element', 'xmSelect', 'lat', 'treeSelect'], function () {
    let table = layui.table;
    let layer = layui.layer;
    let form = layui.form;
    let laydate = layui.laydate;
    let dropdown = layui.dropdown;
    let element = layui.element;
    let $ = layui.jquery;
    let xmSelect = layui.xmSelect;
    let lat = layui.lat;
    let treeSelect = layui.treeSelect;
    const _projId = getUrlParamByName('projId');
    const _projPeriod = Number(getUrlParamByName('projPeriod'));
    const _occupiedPeriod = Number(getOrDefault(getUrlParamByName('occupiedPeriod'), 0));
    const _downId = getUrlParamByName('downId');
    const _teachId = getUrlParamByName('teachId');
    const _downStart = moment(Number(getUrlParamByName('downStart'))).format(DateTimePattern.SECOND);
    const _downEnd = moment(Number(getUrlParamByName('downEnd'))).format(DateTimePattern.SECOND);
    const _occupiedCseArr = getUrlParamByName('occupiedCse') ? JSON.parse(getUrlParamByName('occupiedCse')) : null;
    const _isGuangdong = localStorage.getItem("standardkind-id") == StandardKind.GUANG_DONG;
    let _titleTreeData = [];
    let _specTreeData = [];
    let freshTeacher = {
        'fresh': true, // 标记
        'projId': _projId,
        'downId': _downId,
        'teachId': _teachId,
        'teacherId': 'uuid',
        'teacherName': '',
        'teachNo': '',
        'personNo': '',
        'needScore': true,
        'gender': 0,
        'birthday': '',
        'education': null,
        'dept': null,
        'title': null,
        'ifProjManager': 0,
        'duty': null
    };
    let teachVo = {};
    let teacherVoList = [{
        'teacherId': '0000123',
        'teacherName': 'hehe',
        'teachNo': '123456202208094321',
        'personNo': '',
        'needScore': true,
        'gender': 0,
        'birthday': '2022-01-19',
        'education': '2806ecd2-5cb7-4b18-8a9e-9b1f010f7b4f',
        'dept': 'ec1b6928-03a8-4ec9-98e8-9b2f01006a65',
        'title': '6a076a06-15ce-4b0d-b4f9-9b2f0124b22e',
        'ifProjManager': 1,
        'duty': 'aaf6e9a1-1f77-4df5-838b-9b2f0124b22e'
    }, {
        'teacherId': '0000456',
        'teacherName': 'haha',
        'teachNo': '456',
        'personNo': '',
        'needScore': true,
        'gender': 1,
        'birthday': '2023-01-19',
        'education': 'ad93ac72-11de-404a-8901-9b1f010f9c49',
        'dept': 'ec1b6928-03a8-4ec9-98e8-9b2f01006a65',
        'title': '',
        'ifProjManager': 0,
        'duty': 'aaf6e9a1-1f77-4df5-838b-9b2f0124b22e'
    }];
    teacherVoList = [];
    layer.ready(function () {
        lat.renderDaySelector('#startDaySelector', '', {min: _downStart, max: _downEnd});
        lat.renderDaySelector('#endDaySelector', '', {min: _downStart, max: _downEnd});
        laydate.render({
            elem: '#startTimeSelector',
            type: 'time',
            format: 'HH:mm'
        });
        laydate.render({
            elem: '#endTimeSelector',
            type: 'time',
            format: 'HH:mm'
        });
    });
    
    $(function () {
        $('body').toggleClass('is-guangdong-teacher-card', _isGuangdong);
        // console.info('====> projId:%s, downId:%s, teachId:%s', _projId, _downId, _teachId);
        // console.info('====> projPeriod:%s, occupiedPeriod: %s, downStart: %s, downEnd: %s', _projPeriod, _occupiedPeriod, _downStart, _downEnd);
        // console.info('====> occupiedCseArr: %s', JSON.stringify(_occupiedCseArr));
        // if(localStorage.getItem("standardkind-id") == StandardKind.GUANG_DONG) {
        //     $('.layui-custom-miss label').each((i, d) => {
        //         let name = $(d).attr('name');
        //         if (name) $(d).html(projectLabels[name] || '');
        //     });
        // }
        form.val('courseForm', {
            'projId': _projId,
            'downId': _downId,
            'teachId': _teachId
        });
        // 限制课程时长只能输入小数点后一位
        $('#periodInput').on('input', function () {
            let value = $(this).val();
            // 限制小数点后只能有一位
            if (value && !/^\d*\.?\d{0,1}$/.test(value)) {
                // 如果不符合规则，截断多余的位数
                value = value.replace(/(\.\d?)(\d+)/, '$1');
                $(this).val(value);
            }
        });
        if(localStorage.getItem("standardkind-id") == StandardKind.GUANG_DONG) {
            $('.guangdong-hide-time').hide();
        }
        lat.renderEducation('select[name="education"]');
        lat.renderDuty('select[name="duty"]');
        getTitleTreeData().then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                _titleTreeData = jsonRes.data;
            }
        }).catch(error => {
            lat.errorMsg('error:加载titleTree');
        }).finally(() => {
            getSpecTreeData(2).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    _specTreeData = jsonRes.data;
                }
            }).catch(error => {
                lat.errorMsg('error: 加载specTree');
            }).finally(() => {
                if (_teachId) {
                    loadCourseDetail();
                } else {
                    renderLecturerTable();
                }
            });
        });
    });
    // separate
    // course
    form.on('submit(courseFormSubmit)', function (data) {
        let fields = data.field;
        // fields.startDate = _downStart; // _a.daytime(fields.startDay, fields.startTime || '00:00');
        // fields.endDate = _downEnd; // _a.daytime(fields.endDay, fields.endTime || '23:59');
        fields.startDate = _a.daytime(fields.startDay, fields.startTime || '00:00');
        fields.endDate = _a.daytime(fields.endDay, fields.endTime || '23:59');
        fields.downStart = _downStart;
        fields.downEnd = _downEnd;
        fields.score = 0; // not null constraint
        // remove fresh teacherId
        let tmpTeacherVoList = JSON.parse(JSON.stringify(teacherVoList));
        tmpTeacherVoList.filter(item => item.fresh).forEach(item => {
            item.teacherId = '';
            delete item.teacherId;
            delete item.comPersonId;
        });
        for (let i = 0, len = tmpTeacherVoList.length; i < len; ++i) {
            if (!tmpTeacherVoList[i].teacherName) {
                lat.failMsg('请填写授课教师姓名');
                return false;
            }
            if (_isGuangdong && tmpTeacherVoList[i].needScore && !hasTeacherIdentifier(tmpTeacherVoList[i])) {
                lat.failMsg('请填写授课教师证件号或医通卡号');
                return false;
            }
            if (!_isGuangdong && tmpTeacherVoList[i].needScore && !tmpTeacherVoList[i].teachNo) {
                lat.failMsg('请填写授课教师证件号');
                return false;
            }
        }
        fields.teacherFormList = tmpTeacherVoList;
        fields.cmeStandardKindId = _standardKindId;
        // console.info('------- fields: %s', JSON.stringify(fields));
        // if (!courseInCycle(fields.startDate, fields.endDate, _downStart, _downEnd)) {
        //     lat.failMsg('课程起始时间必须在周期起始时间范围内');
        //     return false;
        // }
        let visit = huayi_projectscore_url + 'pgsi/gco/saveOrUpdate';
        postAction(visit, fields).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                lat.okMsg('保存完成');
                parent.refreshCycle();
            } else {
                lat.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            lat.errorMsg('error:保存课程');
        })
        return false;
    });
    // course
    form.verify({
        startDay: function (value) {
            let startD = $('#startDaySelector').val();
            let startT = $('#startTimeSelector').val();
            let endD = $('#endDaySelector').val();
            let endT = $('#endTimeSelector').val();
            if (!validateCourse(value, startT, endD, endT)) {
                return '课程开始时间不能晚于课程结束时间';
            } else {
                if (!validateCoursePlus(value, startT, endD, endT)) {
                    return '该时间范围内已存在课程';
                }
            }
        },
        startTime(value) {
            let startD = $('#startDaySelector').val();
            let startT = $('#startTimeSelector').val();
            let endD = $('#endDaySelector').val();
            let endT = $('#endTimeSelector').val();
            if (!validateCourse(startD, value, endD, endT)) {
                return '课程开始时间不能晚于课程结束时间';
            } else {
                if (!validateCoursePlus(startD, value, endD, endT)) {
                    return '该时间范围内已存在课程';
                }
            }
        },
        endDay: function (value) {
            let startD = $('#startDaySelector').val();
            let startT = $('#startTimeSelector').val();
            let endD = $('#endDaySelector').val();
            let endT = $('#endTimeSelector').val();
            if (!validateCourse(startD, startT, value, endT)) {
                return '课程开始时间不能晚于课程结束时间';
            } else {
                if (!validateCoursePlus(startD, startT, value, endT)) {
                    return '该时间范围内已存在课程';
                }
            }
        },
        endTime: function (value) {
            let startD = $('#startDaySelector').val();
            let startT = $('#startTimeSelector').val();
            let endD = $('#endDaySelector').val();
            let endT = $('#endTimeSelector').val();
            if (!validateCourse(startD, startT, endD, value)) {
                return '课程开始时间不能晚于课程结束时间';
            } else {
                if (!validateCoursePlus(startD, startT, endD, value)) {
                    return '该时间范围内已存在课程';
                }
            }
        },
        coursePeriod: function (value) {
            // console.info(value, _projPeriod, value > _projPeriod);
            // console.info(typeof value, typeof _projPeriod);
            if (_isHainan) {
                if (Number(value) <= 0) {
                    return '课程小时时数必须大于0';
                }
                return;
            }
            if(localStorage.getItem("standardkind-id") == StandardKind.GUANG_DONG) {
                let newTotal = _occupiedPeriod + Number(value);
                if (newTotal < 1) {
                    return '讲授时长不能低于1小时';
                }
                let ds = moment(_downStart, DateTimePattern.SECOND).startOf('day');
                let de = moment(_downEnd, DateTimePattern.SECOND).startOf('day');
                let days = de.diff(ds, 'days') + 1;
                let maxPeriod = days * 6;
                if (newTotal > maxPeriod) {
                    return '讲授时长超过要求，请重新调整';
                }
                return; // 广东省放行
            }
            let idlePeriod = _projPeriod - _occupiedPeriod;
            if (Number(value) > idlePeriod) {
                return '课程学时数不能大于项目学时数（' + _projPeriod + '）';
            }
        }
    });
    // course
    function validateCourse(startDay, startTime, endDay, endTime) {
        if (startDay && startTime && endDay && endTime) {
            let sm = moment(startDay + ' ' + startTime, DateTimePattern.MINUTE);
            let em = moment(endDay + ' ' + endTime, DateTimePattern.MINUTE);
            return sm.isBefore(em);
        } else {
            return false;
        }
    }
    // course
    function validateCoursePlus(startDay, startTime, endDay, endTime) {
        if (!_occupiedCseArr) {
            return true;
        }
        // 上一节课结束时间与下一节课开始时间可相同
        if (startDay && startTime && endDay && endTime) {
            let sm = moment(startDay + ' ' + startTime, DateTimePattern.MINUTE);
            let em = moment(endDay + ' ' + endTime, DateTimePattern.MINUTE);
            if (sm.isBefore(em)) {
                for (let i = 0; i < _occupiedCseArr.length; ++i) {
                    if (haveIntersect4m(sm, em, _occupiedCseArr[i].s, _occupiedCseArr[i].e)) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    // course
    function courseInCycle(startDate, endDate, downStart, downEnd) {
        // console.info('startDate: %s, endDate: %s', startDate, endDate);
        // console.info('downStart: %s, downEnd: %s', downStart, downEnd);
        return moment(startDate, DateTimePattern.SECOND).isBetween(downStart, downEnd, null, '[]')
            && moment(endDate).isBetween(downStart, downEnd, null, '[]');
    }
    function toNeedScoreValue(value) {
        return !(value === false || value === 'false' || value === 0 || value === '0');
    }
    // course
    function loadCourseDetail() {
        let visit = huayi_projectscore_url + 'pgsi/gco/detail/' + _teachId;
        getAction(visit).then((response) => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                teachVo = jsonRes.data;
                if (teachVo.teacherVoList.length > 0) {
                    teacherVoList = teachVo.teacherVoList;
                    teacherVoList.forEach(teacherVo => {
                        if (!teacherVo.ifProjManager) {
                            // default 0 否
                            teacherVo.ifProjManager = 0;
                        }
                        teacherVo.needScore = toNeedScoreValue(teacherVo.needScore);
                        teacherVo.personNo = teacherVo.personNo || '';
                        teacherVo.genderT = (1 === teacherVo.gender) ? 'M' : 'F';
                    })
                }
            } else {
                lat.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            lat.errorMsg('error:加载课程信息');
        }).finally(() => {
            form.val('courseForm', {
                'projId': _projId,
                'downId': _downId,
                'teachId': _teachId,
                'startDay': _a.day(teachVo.startDate),
                'startTime': _a.time(teachVo.startDate),
                'endDay': _a.day(teachVo.endDate),
                'endTime': _a.time(teachVo.endDate),
                'teachSubject': teachVo.teachSubject,
                'period': teachVo.period
            });
            renderLecturerTable();
        });
    }
    // separate
    // teacher
    table.on('edit(lecturerTable)', function (obj) {
        let rowData = obj.data;
        let teacherVo = teacherVoList.find(item => item.teacherId === rowData.teacherId);
        if (!teacherVo) {
            return;
        }
        teacherVo[obj.field] = $.trim(obj.value);
    });
    // teacher
    table.on('toolbar(lecturerTable)', function (obj) {
        if ('addLecturer' === obj.event) {
            if (teacherVoList && teacherVoList.length > 0 && localStorage.getItem("standardkind-id") == StandardKind.GUANG_DONG) {
                lat.failMsg('该课程只能添加1个授课教师');
                return;
            }
            let newT = JSON.parse(JSON.stringify(freshTeacher));
            newT.teacherId = uuid();
            newT.gender = 0;
            newT.genderT = 'F';
            teacherVoList = [...teacherVoList, newT];
            table.reload('lecturerTable', {
                data: teacherVoList
            });
        } else if ('deleteLecturer' === obj.event) {
            let selectedRowArr = table.checkStatus(obj.config.id).data;
            if (selectedRowArr.length > 0) {
                let selectedIds = selectedRowArr.map(item => item.teacherId).join(',');
                let selectedNames = selectedRowArr.map(item => item.teacherName).join('、');
                layer.confirm('确定删除教师' + selectedNames + '吗？', {
                    title: '提示',
                    btn: ['删除', '取消']
                }, function () {
                    // confirm
                    let newList = teacherVoList.filter(teachVo => !selectedIds.includes(teachVo.teacherId));
                    if (isAllFresh(selectedRowArr)) {
                        // delete local
                        teacherVoList = newList;
                        table.reload('lecturerTable', {
                            data: teacherVoList
                        });
                        lat.okMsg('删除完成');
                    } else {
                        // delete remote
                        let visit = huayi_projectscore_url + 'pgsi/gtr/delByIds?ids=' + selectedIds;
                        postAction(visit).then(response => {
                            let jsonRes = response.data;
                            if (jsonRes.success) {
                                // delete local
                                teacherVoList = newList;
                                table.reload('lecturerTable', {
                                    data: teacherVoList
                                });
                                lat.okMsg('删除完成');
                            } else {
                                lat.failMsg(jsonRes.message);
                            }
                        }).catch(error => {
                            lat.errorMsg('error:删除教师');
                        })
                    }
                }, function () {
                    // cancel
                })
            } else {
                lat.failMsg('先选择要删除的教师');
            }
        }
    });
    // teacher 监听[gender]操作
    form.on('select(genderSelector)', function (objData) {
        let idx = $(objData.elem).attr('idx');
        teacherVoList[idx].gender = toNum(objData.value);
        teacherVoList[idx].genderT = (1 === teacherVoList[idx].gender) ? 'M' : 'F';
    });
    // teacher 监听[needScore]操作
    form.on('select(needScoreSelector)', function (objData) {
        let idx = $(objData.elem).attr('idx');
        teacherVoList[idx].needScore = objData.value === 'true';
        clearComPersonIdWhenNoScoreAndNoIdentifier(teacherVoList[idx]);
        if (teacherVoList[idx].needScore && hasTeacherIdentifier(teacherVoList[idx])) {
            matchTeacherForCourseRow(teacherVoList[idx]);
            return;
        }
        table.reload('lecturerTable', {data: teacherVoList});
    });
    // teacher 监听[ifProjManager]操作
    form.on('switch(ifProjManagerSwitch)', function (objData) {
        let idx = $(objData.elem).attr('idx');
        teacherVoList[idx].ifProjManager = objData.elem.checked ? 1 : 0;
    });
    // teacher 学历
    form.on('select(educationSelector)', function (data) {
        selectChange(data, 'education');
    });
    // teacher 专业
    form.on('select(deptSelector)', function (data) {
        selectChange(data, 'dept');
    });
    // teacher 技术职称
    form.on('select(titleSelector)', function (data) {
        selectChange(data, 'title');
    });
    // teacher 行政职务
    form.on('select(dutySelector)', function (data) {
        selectChange(data, 'duty');
    });
    // teacher
    function isAllFresh(teacherArr) {
        return teacherArr.filter(item => item.fresh).length === teacherArr.length;
    }
    // teacher
    function renderLecturerTable() {
        let cols = [[
            {title: '选择', align: 'center', fixed: 'left', type: 'checkbox'},
            {field: 'needScore', title: '是否主讲人授分', align: 'center', templet: '#needScoreTpl', width: 150},
        ]];
        if (_isGuangdong) {
            cols[0].push({
                field: 'personNo',
                title: '医通卡号',
                width: 160,
                align: 'center',
                templet: '#personNoTpl'
            });
        }
        cols[0] = cols[0].concat([
            {
                field: 'teachNo',
                title: '授课教师证件号',
                width: 180,
                align: 'center',
                templet: '#teachNoTpl'
            },
            {
                field: 'teacherName',
                title: '授课教师',
                placeholder: '输入教师姓名',
                width: 100,
                align: 'center',
                edit: 'text'
            },
            {field: 'gender', title: '性别', align: 'center', templet: '#genderTpl', width: 100},
            {field: 'birthday', title: '出生日期', align: 'center', templet: '#birthdayTpl'},
            {field: 'education', title: '最高学历', align: 'center', templet: '#educationTpl'},
            {field: 'dept', title: '专业', align: 'center', templet: '#deptTpl'},
            {field: 'title', title: '职称', align: 'center', templet: '#titleTpl'},
            {
                field: 'duty', title: '职务',
                align: 'center', templet: '#dutyTpl'
            }
        ]);
        table.render({
            elem: '#lecturerTable',
            id: 'lecturerTable',
            page: false,
            height: 'full-255',
            defaultToolbar: [],
            toolbar: '#lecturerTableToolbar',
            cols: cols,
            done: function (res, curr, count) {
                if (teacherVoList.length > 0) {
                    teacherVoList.forEach((teacherVo, index) => {
                        // render birthdaySelect
                        renderRowBirthdaySelect(index, teacherVo.birthday);
                        $(`#needScoreSelector${index}`).val(String(!(teacherVo.needScore === false || teacherVo.needScore === 'false' || teacherVo.needScore === 0 || teacherVo.needScore === '0')));
                        $(`#genderSelector${index}`).val(String(Number(teacherVo.gender) === 1 ? 1 : 0));
                        // echo selector
                        echoRowSelect('', 'education', index);
                        echoRowSelect('', 'duty', index);
                        echoRowSelect('', 'dept', index);
                        lat.renderTreeSelect(`#titleTreeSelector${index}`, huayi_sjwh_url + `option/title/treeData/${_standardKindId}`, {
                            preprocessResponse: lat.adaptApiTitleTreeForTreeSelect,
                            click: function (data) {
                                let id = data.current && data.current.id;
                                teacherVoList[index]['title'] = id ? id : null;
                            },
                            success: function () {
                                let tid = teacherVo.title;
                                if (tid != null && String(tid).trim() !== '') {
                                    treeSelect.checkNode('titleTreeSelector' + index, String(tid));
                                }
                            }
                        });

                        lat.renderTreeSelect(`#specTreeSelector${index}`, huayi_sjwh_url + `option/spec/treeData/2`, {
                            preprocessResponse: lat.adaptSpecTreeForTreeSelect,
                            click: function (data) {
                                let id = data.current && data.current.id;
                                teacherVoList[index]['dept'] = id ? id : null;
                            },
                            success: function () {
                                let sid = teacherVo.dept;
                                if (sid != null && String(sid).trim() !== '') {
                                    treeSelect.checkNode('specTreeSelector' + index, String(sid));
                                }
                            }
                        });
                        toggleTeacherNoInputState(index);
                    });
                }
                bindTeacherNoEvents();
                form.render('select');
            },
            data: teacherVoList
        });
    }
    function hasTeacherIdentifier(teacherVo) {
        return !!($.trim(teacherVo.teachNo) || $.trim(teacherVo.personNo));
    }
    function clearComPersonIdWhenNoScoreAndNoIdentifier(teacherVo) {
        if (!teacherVo) {
            return;
        }
        let isNeedScore = !(teacherVo.needScore === false || teacherVo.needScore === 'false' || teacherVo.needScore === 0 || teacherVo.needScore === '0');
        let teachNo = $.trim(teacherVo.teachNo || '');
        let personNo = $.trim(teacherVo.personNo || '');
        if (!isNeedScore && !teachNo && !personNo) {
            teacherVo.comPersonId = '';
        }
    }
    function validateMutualExclusiveTeacherNo(teacherVo, editedField) {
        teacherVo.teachNo = $.trim(teacherVo.teachNo || '');
        teacherVo.personNo = $.trim(teacherVo.personNo || '');
        if ('teachNo' === editedField && teacherVo.teachNo && teacherVo.personNo) {
            teacherVo.teachNo = '';
            lat.failMsg('已填写医通卡号，不能再填写证件号');
            return false;
        }
        if ('personNo' === editedField && teacherVo.personNo && teacherVo.teachNo) {
            teacherVo.personNo = '';
            lat.failMsg('已填写证件号，不能再填写医通卡号');
            return false;
        }
        return true;
    }
    function toggleTeacherNoInputState(idx) {
        let teacherVo = teacherVoList[idx];
        if (!teacherVo) {
            return;
        }
        let rowElem = $('#lecturerTable').next('.layui-table-view').find(`tr[data-index='${idx}']`);
        let teachNoInput = rowElem.find("input[data-field='teachNo']");
        let personNoInput = rowElem.find("input[data-field='personNo']");
        let hasPersonNo = !!$.trim(teacherVo.personNo || '');
        let hasTeachNo = !!$.trim(teacherVo.teachNo || '');
        if (teachNoInput.length) {
            teachNoInput.prop('disabled', hasPersonNo)
                .attr('disabled', hasPersonNo ? 'disabled' : null)
                .attr('placeholder', hasPersonNo ? '' : '输入教师证件号');
        }
        if (personNoInput.length) {
            personNoInput.prop('disabled', hasTeachNo)
                .attr('disabled', hasTeachNo ? 'disabled' : null)
                .attr('placeholder', hasTeachNo ? '' : '输入医通卡号');
        }
    }
    function bindTeacherNoEvents() {
        let tableView = $('#lecturerTable').next('.layui-table-view');
        tableView.find('.teacher-no-input').off('.teacherNo');
        tableView.find("input[data-field='teachNo']").on('input.teacherNo', function () {
            let idx = $(this).attr('idx');
            let teacherVo = teacherVoList[idx];
            if (!teacherVo) {
                return;
            }
            teacherVo.teachNo = $.trim($(this).val());
            if (teacherVo.teachNo && teacherVo.personNo) {
                teacherVo.personNo = '';
                lat.failMsg('已填写证件号，不能再填写医通卡号');
                table.reload('lecturerTable', {data: teacherVoList});
                return;
            }
            clearComPersonIdWhenNoScoreAndNoIdentifier(teacherVo);
            toggleTeacherNoInputState(idx);
        }).on('blur.teacherNo', function () {
            let idx = $(this).attr('idx');
            let teacherVo = teacherVoList[idx];
            if (!teacherVo) {
                return;
            }
            teacherVo.teachNo = $.trim($(this).val());
            $(this).val(teacherVo.teachNo);
            clearComPersonIdWhenNoScoreAndNoIdentifier(teacherVo);
            toggleTeacherNoInputState(idx);
            if (teacherVo.teachNo) {
                matchTeacherForCourseRow(teacherVo);
            }
        });
        tableView.find("input[data-field='personNo']").on('input.teacherNo', function () {
            let idx = $(this).attr('idx');
            let teacherVo = teacherVoList[idx];
            if (!teacherVo) {
                return;
            }
            teacherVo.personNo = $.trim($(this).val());
            if (teacherVo.personNo && teacherVo.teachNo) {
                teacherVo.teachNo = '';
                lat.failMsg('已填写医通卡号，不能再填写证件号');
                table.reload('lecturerTable', {data: teacherVoList});
                return;
            }
            clearComPersonIdWhenNoScoreAndNoIdentifier(teacherVo);
            toggleTeacherNoInputState(idx);
        }).on('blur.teacherNo', function () {
            let idx = $(this).attr('idx');
            let teacherVo = teacherVoList[idx];
            if (!teacherVo) {
                return;
            }
            teacherVo.personNo = $.trim($(this).val());
            $(this).val(teacherVo.personNo);
            clearComPersonIdWhenNoScoreAndNoIdentifier(teacherVo);
            toggleTeacherNoInputState(idx);
            if (teacherVo.personNo) {
                matchTeacherForCourseRow(teacherVo);
            }
        });
    }
    function applyMatchedTeacherToCourseRow(teacherVo, teacher, matchByField) {
        teacherVo.comPersonId = teacher.comPersonId || teacher.com_person_id || '';
        teacherVo.teacherName = teacher.teacherName || teacher.teacher_name || teacherVo.teacherName;
        teacherVo.gender = toNum(teacher.sex);
        teacherVo.genderT = (1 === teacherVo.gender) ? 'M' : 'F';
        teacherVo.birthday = teacher.birthday ? String(teacher.birthday).slice(0, 10) : '';
        teacherVo.education = teacher.education || null;
        teacherVo.dept = teacher.personSpecId || teacher.dept || null;
        teacherVo.title = teacher.title || null;
        teacherVo.duty = teacher.duty || null;
        if (matchByField === 'teachNo') {
            teacherVo.personNo = '';
        } else if (matchByField === 'personNo') {
            teacherVo.teachNo = '';
        }
    }
    function matchTeacherForCourseRow(teacherVo) {
        let teachNo = $.trim(teacherVo.teachNo || '');
        let personNo = $.trim(teacherVo.personNo || '');
        let matchByField = teachNo ? 'teachNo' : 'personNo';
        if (!teachNo && !personNo) {
            teacherVo.comPersonId = '';
            table.reload('lecturerTable', {data: teacherVoList});
            return;
        }
        let visit = `${huayi_projectscore_url}cmeGroupprojTeacher/matchTeacher?certId=${encodeURIComponent(teachNo)}&personNo=${encodeURIComponent(personNo)}&cmeStandardKindId=${encodeURIComponent(_standardKindId)}`;
        getAction(visit).then(response => {
            let jsonRes = response.data;
            let teacher = jsonRes.data;
            if (jsonRes.success && teacher) {
                applyMatchedTeacherToCourseRow(teacherVo, teacher, matchByField);
            } else if (teacherVo.needScore) {
                teacherVo.comPersonId = '';
                lat.failMsg('授课教师未匹配到人员，会影响主讲人授分，请确认。');
            }
        }).catch(() => {
            lat.errorMsg('error:匹配授课教师');
        }).finally(() => {
            table.reload('lecturerTable', {data: teacherVoList});
        });
    }
    // teacher 渲染日期select & 回显
    function renderRowBirthdaySelect(rowIndex, initVal) {
        laydate.render({
            // elem: document.getElementsByClassName('birthdayTpl'),
            // elem: '#birthdaySelector1',
            elem: '#birthdaySelector' + rowIndex,
            format: 'yyyy-MM-dd',
            trigger: 'click',
            value: initVal,
            change: function (value, date, endDate) {
                // 日期时间被切换后的回调
            },
            done: function (value, date, endDate) {
                // 控件选择完毕后的回调
                // console.info('----done ', rowIndex, value, date, endDate);
                teacherVoList[rowIndex].birthday = value;
            }
        });
    }
    // teacher select-change
    function selectChange(objData, column) {
        let idx = $(objData.elem).attr('idx');
        let selectedValue = objData.value;
        // console.info('change index:%s column:%s to %s', idx, column, selectedValue);
        teacherVoList[idx][column] = selectedValue ? selectedValue : null;
    }
    const _a = {
        daytime: function (day, time) {
            if (day) return `${day} ${time}:00`;
            else return '';
        },
        day: function (dt) {
            if (dt) return dt.slice(0, 10);
            return '';
        },
        time: function (dt) {
            if (dt) return dt.slice(11);
            else return '';
        }
    }
});
