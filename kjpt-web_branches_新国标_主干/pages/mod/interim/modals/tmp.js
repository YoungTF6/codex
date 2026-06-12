layui.config({
    base: '/js/layui/ext/',
}).extend({
    xmSelect: 'xm-select',
    lat: 'lat'
}).use(['table', 'layer', 'jquery', 'form', 'laydate', 'element', 'xmSelect', 'lat'], function () {
    let table = layui.table, layer = layui.layer, form = layui.form, laydate = layui.laydate, dropdown = layui.dropdown, element = layui.element, $ = layui.jquery, xmSelect = layui.xmSelect, lat = layui.lat;
    let gStartDateSel, gEndDateSel;
    const _action = getOrDefault(getUrlParamByName('action'), ModalActionEnum.CREATE);
    const _is_create = ModalActionEnum.CREATE === _action;
    const _is_edit = ModalActionEnum.EDIT === _action;
    const _is_view = ModalActionEnum.VIEW === _action;
    const _nullFormVal = {
        'projId': '', 'cmeYear': '', 'projNo': '', 'projName': '',
        'medicalType': '', 'scoreLevel': '', 'startDate': '', 'endDate': '',
        'holdDay': '', 'studyAddress': '', 'holdType': '', 'holdForm': '', 'score': '', 'period': '',
        'twoKnowledgeId': '', 'knowledgeId': '', 'demoTime': '', 'theoryTime': '', 'projManager': '', 'projManagerTelephone': '',
        'unitId': '', 'limitPerson': '', 'remark': '',
    };
    let gFormVal = JSON.parse(getOrDefault(localStorage.getItem('tmp_tmp_proj'), '{}'));
    if (_is_create) gFormVal = JSON.stringify(_nullFormVal);
    localStorage.removeItem('tmp_tmp_proj');
    let gYearLevelLink = false;
    // 读取当前标准套对应的年度规则
    function getYearRuleByStandardKindId() {
        let rule = {'startOffset': 0, 'count': 1, 'includeNextYear': false};
        if(_is_view) {
            rule = {'startOffset': 0, 'count': 6, 'includeNextYear': false};
        }
        return rule;
    }
    // 生成年份下拉数据，必要时包含回显年度
    function buildYearOptionData(rule, echoYear) {
        let startYear = Number(_cur_year) + Number(rule.startOffset || 0);
        if (rule.includeNextYear) startYear = Math.max(startYear, Number(_cur_year) + 1);
        let count = Math.max(Number(rule.count || 6), 1);
        let yearSet = {};
        Array(count).fill(0).forEach((_, idx) => {
            yearSet[startYear - idx] = true;
        });
        if (echoYear) yearSet[echoYear] = true;
        let years = Object.keys(yearSet).map(Number).filter((y) => !Number.isNaN(y)).sort((a, b) => b - a);
        return years.map((year) => {
            return {'name': year, 'value': year, 'selected': false};
        });
    }
    // 同步年度规则到标签数据属性，保持与现有通用渲染兼容
    function syncYearRuleToLabel() {
        let $yearSpan = $('span[data-id=lblYear]');
        if ($yearSpan.length < 1) return null;
        let rule = getYearRuleByStandardKindId();
        $yearSpan.attr('data-next-year', rule.includeNextYear ? '1' : '0');
        $yearSpan.attr('data-year-start-offset', String(rule.startOffset || 0));
        $yearSpan.attr('data-year-count', String(rule.count || 6));
        return rule;
    }
    // 重渲染年度控件并设置默认值，不改动全局vendor逻辑
    function refreshYearSelectorByStandardKind() {
        let yearRule = syncYearRuleToLabel();
        if (!yearRule) return;
        let yearKey = 'lblYear';
        let echoYear = Number(gFormVal?.cmeYear || 0);
        let yearData = buildYearOptionData(yearRule, echoYear);
        if (yearData.length < 1) return;
        let defaultYear = yearData[0].value;
        let targetYear = echoYear || defaultYear;
        let updateYearValue = () => {
            _lbl_inst.values[`${yearKey}_id`] = targetYear;
            _lbl_inst.values[`${yearKey}_name`] = targetYear;
            _lbl_inst.change_year && _lbl_inst.change_year(targetYear);
        };
        if (_lbl_inst?.[yearKey]?.update) {
            _lbl_inst[yearKey].update({'data': yearData});
            _lbl_inst[yearKey].setValue([targetYear], false, true);
            updateYearValue();
            return;
        }
        if (typeof _sel_render !== 'undefined' && _sel_render.renderYear) {
            _sel_render.renderYear(yearKey);
            setTimeout(() => {
                if (_lbl_inst?.[yearKey]?.update) {
                    _lbl_inst[yearKey].update({'data': yearData});
                    _lbl_inst[yearKey].setValue([targetYear], false, true);
                    updateYearValue();
                }
            }, 0);
        }
    }
    syncYearRuleToLabel();
    $(function () {
        refreshYearSelectorByStandardKind();
        _tmp_render.renderScoreLevel('#scoreLevelSelector2', _cur_year);
        lat.render2ndKnowledge('#twoKnowledgeIdSelector', _cur_year, _isNingxia);
        _tmp_render.renderHoldType('');
        _tmp_render.renderStartDateSel();
        _tmp_render.renderEndDateSel();
        lat.renderHoldForm('#holdFormSelector');
        fixForm();
        echo();
        $('a[data-action=formCancel]').on('click', function () {
            parent.closeTmpModal(false);
        });
        $('input[name=period]').on('change', function () {
            if (!validatePeriod()) {
                lat.failMsg('"总学时"不等于"理论学时"和"实验技术学时"之和');
                form.val('tempProjForm', {
                    'period': ''
                });
            }
        });
        $('input[name=demoTime]').on('change', function () {
            if (!validatePeriod()) {
                lat.failMsg('"总学时"不等于"理论学时"和"实验技术学时"之和');
                form.val('tempProjForm', {
                    'demoTime': ''
                });
            }
        });
        $('input[name=theoryTime]').on('change', function () {
            if (!validatePeriod()) {
                lat.failMsg('"总学时"不等于"理论学时"和"实验技术学时"之和');
                form.val('tempProjForm', {
                    'theoryTime': ''
                });
            }
        });
    });
    form.on('submit(formSubmit)', function (data) {
        let fields = data.field;
        if (Number(fields.score) > Number(fields.period)) {
            layer.confirm('学分大于学时，是否继续添加？', {
                title: '提示',
                btn: ['确定', '取消']
            }, function () {
                _act.presave(fields);
            }, function () {
            });
        } else {
            _act.presave(fields);
        }
        return false;
    });
    form.on('select(twoKnowledgeIdSelector)', function (data) {
        if (data.value !== '') {
            lat.render3rdKnowledge('#knowledgeIdSelector', _cur_year, data.value);
        } else {
            $('#knowledgeIdSelector').empty();
            form.render("select");
        }
    });
    form.on('select(cmeYear)', function (data) {
        let cmeYear = data.value;
        if (cmeYear && _is_create) {
            lay_day_sel_update(gStartDateSel, '', `${cmeYear}-01-01`, `${cmeYear}-12-31`);
            lat.render2ndKnowledge('#twoKnowledgeIdSelector', cmeYear, _isNingxia);
            gYearLevelLink && _tmp_render.renderScoreLevel('#scoreLevelSelector2', cmeYear);
        }
    });
    form.on('select(scoreLevel2)', function (data) {
        let slId = data.value;
        if (slId) _tmp_render.renderHoldType(slId);
    });
    form.verify({
        telephone: [/(^$)|^\d{8,11}$/, '电话格式不正确']
    });
    function echo() {
        setTimeout(() => {
            echoOption('#knowledgeIdSelector', gFormVal.knowledgeId, gFormVal.knowledgeName);
            form.val('tempProjForm', gFormVal);
            _lbl_inst.echo(gFormVal, _is_view);
        }, 600);
    }
    function fixForm() {
        if (_is_view) {
            $('#tempProjModal div:last').hide();
            $('#tempProjModal .layui-input-block input').attr('disabled', 'disabled').addClass('layui-disabled');
            $('#tempProjModal .layui-input-block select').attr('disabled', 'disabled').addClass('layui-disabled');
        } else {
            $('#tempProjModal div:last').show();
            $('#tempProjModal .layui-input-block input').removeAttr('disabled').removeClass('layui-disabled');
            $('#tempProjModal .layui-input-block select').removeAttr('disabled').removeClass('layui-disabled');
            if (cusno()) {
                $('input[name=projNo]').attr('lay-verify', 'required').parents('.layui-inline').css('display', 'inline-block');
            }
            if (_isJilin) {
                $('#medicalTypeSelector').attr('lay-verify', '').parents('.layui-inline').hide();
                $('input[name=remark]').attr('lay-verify', 'required').parents('.layui-inline').css('display', 'inline-block');
            }
        }
    }
    function cusno() {
        return _isGansu || _isZhejiang || _isHenan;
    }
    const _act = {
        verifyno: function (no) {
            if (_isZhejiang) return true;
            return /L.*/.test(no);
        },
        presave: function (params) {
            const that = this;
            if (cusno()) {
                let projNo = params.projNo;
                if (!that.verifyno(projNo)) {
                    lat.failMsg('临时项目编号应以大写字母L开头');
                    return false;
                }
                postAction(`${huayi_projectscore_url}/tempProj/projno/cnt`, {'standardKindId': _skId, 'projNo': projNo, 'projId': gFormVal.projId}).then(response => {
                    let jsonRes = response.data;
                    if (jsonRes.success) {
                        if (jsonRes.data > 0) {
                            lat.errorMsg('项目编号已存在');
                            let $pno = $('#tempProjForm input[name=projNo]');
                            $pno.addClass('layui-form-danger');
                            setTimeout(() => {
                                $pno.focus();
                            }, 7);
                        } else {
                            that.dosave(params);
                        }
                    }
                });
            } else {
                that.dosave(params);
            }
        },
        dosave: function (fieldsArg) {
            let fields = JSON.parse(JSON.stringify(fieldsArg))
            fields.projectCategory = 4;
            fields.isTmp = 1;
            if (_is_create) {
                fields.knowledgeTwoCode = $('#twoKnowledgeIdSelector option:selected').attr('kcode');
                fields.knowledgeCode = $('#knowledgeIdSelector option:selected').attr('kcode');
                fields.checkType = "7e152a7d-dc01-4e88-918e-9b2f00eb28a0";
                fields.otherNo = "ON123";
                if (!_isJilin) fields.remark = "";
                fields.unitId = _unitId;
                if (!cusno()) fields.projNo = 'L';
                fields.userCreate = _unitId;
                fields.cmeStandardKindId = _standardKindId;
            }
            (!fields.limitPerson) && (fields.limitPerson = 0);
            console.info('modify tempProj: %s', JSON.stringify(fields));
            postAction(`${huayi_projectscore_url}tempProj/saveOrUpdate`, fields).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    lat.okMsg('保存临时项目完成！', function (o) {
                        parent.closeTmpModal(true);
                    });
                } else {
                    lat.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                lat.errorMsg('error:保存临时项目');
            });
        },
    }
    function validatePeriod() {
        let fields = lat.getFormVal('tempProjForm');
        let theoryTime = Number.parseInt(fields.theoryTime);
        let demoTime = Number.parseInt(fields.demoTime);
        let period = Number.parseInt(fields.period);
        return !(theoryTime >= 0 && demoTime >= 0 && (period !== (theoryTime + demoTime)));
    }
    function validateSdDay(startDay, endDay) {
        let $hdi = $('input[name=holdDay]');
        if (startDay && endDay) {
            let sd = moment(toDayHeader(startDay), DateTimePattern.SECOND);
            let ed = moment(toDayTail(endDay), DateTimePattern.SECOND);
            if (sd.isBefore(ed)) {
                $hdi.val(Math.abs(sd.diff(ed, 'day')) + 1);
                return true;
            } else {
                lat.failMsg('开始日期不能晚于结束日期');
            }
        }
        $hdi.val('');
        return false;
    }
    const _tmp_render = {
        renderHoldType: function (slId) {
            let selector = '#holdTypeSelector';
            if (_isHenan) this.ht_henan(selector, slId);
            else if (_isNeimeng) this.ht_neimeng(selector, slId);
            else lat.renderHoldType(selector, slId, '1__');
        },
        ht_neimeng: function (selector, slId) {
            let htDict = [
                {
                    "holdTypeId": "6735b7c7-b901-481a-a6dc-9ecb00a8ae2e",
                    "holdTypeName": "学习班",
                },
                {
                    "holdTypeId": "5ba2248c-7480-4f29-b714-9ecb00a8b62c",
                    "holdTypeName": "培训班",
                },
                {
                    "holdTypeId": "ea5285a6-311b-11ee-8c4d-fa163edddcb5",
                    "holdTypeName": "学术会议",
                }
            ];
            htDict.forEach((holdType, index) => {
                $(selector).append(new Option(holdType.holdTypeName, holdType.holdTypeId));
            });
            form.render("select");
        },
        ht_henan: function (selector, slId) {
            if (_isGovCity) {
                let htDict = [
                    {"holdTypeId": "7cc17ff6-0cc4-4b88-a310-a12300eb2631", "holdTypeName": "继续医学教育项目",}
                ];
                htDict.forEach((holdType, index) => {
                    $(selector).append(new Option(holdType.holdTypeName, holdType.holdTypeId));
                });
                form.render("select");
            } else {
                lat.renderHoldType(selector, slId, '1__');
            }
        },
        renderScoreLevel: function (selector, year) {
            if (_isHainan) this.sl_hainan(selector);
            else if (_isQinghai) this.sl_qinghai(selector);
            else if (_isHenan) this.sl_henan(selector);
            else if (_isNeimeng) this.sl_neimeng(selector);
            else if (_isGuangxi) this.sl_guangxi(selector);
            else {
                gYearLevelLink = true;
                lat.renderScoreLevel(selector, year, '___');
            }
        },
        sl_guangxi: function (selector) {
            if (_isGovCity) {
                let slArr = [
                    {"scoreLevelId": "c4c18640-ecf1-4f24-9d23-9e5300a0884b", "scoreLevelName": "市级Ⅱ类"},
                    {"scoreLevelId": "b0aa8f29-fac3-4174-ac8a-9e7000b8f2aa", "scoreLevelName": "其他Ⅱ类"}
                ];
                slArr.forEach((scoreLevel, index) => {
                    $(selector).append(new Option(scoreLevel.scoreLevelName, scoreLevel.scoreLevelId))
                });
                form.render("select");
            } else {
                lat.renderScoreLevel(selector, _cur_year, '___');
            }
        },
        sl_hainan: function (selector) {
            const hainan_province = (_unitId === '210000' || _unitId === '218133' || _unitId === '218134');
            const hainan_city = !hainan_province && _unitId !== '218000';
            const hainan_sec = _unitId === '218000';
            let slArr = [
                {
                    'scoreLevelId': 'aba04c72-1f7a-469d-9184-9bdd00af141d',
                    'scoreLevelName': '国家级',
                    'visibility': _isHainan && hainan_province
                },
                {
                    'scoreLevelId': '7cdd6b2b-3041-46c3-a445-9bdd00af15b0',
                    'scoreLevelName': '省级Ⅰ类',
                    'visibility': _isHainan && (hainan_province || hainan_sec)
                },
                {
                    'scoreLevelId': 'fc5c37c7-b78f-4970-af2c-9bdd00af18a3',
                    'scoreLevelName': '省级Ⅱ类',
                    'visibility': _isHainan && (hainan_province || hainan_sec)
                },
                {
                    'scoreLevelId': 'f73209f8-5747-46ff-b9b8-9bdd00af1a11',
                    'scoreLevelName': '市级Ⅱ类',
                    'visibility': _isHainan && (hainan_city || hainan_sec)
                }];
            slArr.filter(i => i.visibility)
                .forEach((scoreLevel, index) => {
                    $(selector).append(new Option(scoreLevel.scoreLevelName, scoreLevel.scoreLevelId))
                });
            form.render("select");
        },
        sl_qinghai: function (selector) {
            let slArr;
            slArr = [
                {
                    'scoreLevelId': 'd3cfd8bc-26a7-4ec1-abcd-abb3013814b9',
                    'scoreLevelName': '国家级继续医学教育项目',
                },
                {
                    'scoreLevelId': 'ec6ffd53-a5f8-484e-a384-abb9012b7c1d',
                    'scoreLevelName': '省级继续医学教育项目',
                },
                {
                    'scoreLevelId': '67c3f371-bda5-4e8a-a903-abdf00aa9ec0',
                    'scoreLevelName': '省级Ⅱ类',
                },
                {
                    'scoreLevelId': 'cad31cab-cdd0-4de5-aec4-abb301384542',
                    'scoreLevelName': '市（州）级继续医学教育项目',
                }];
            slArr.forEach((scoreLevel, index) => {
                $(selector).append(new Option(scoreLevel.scoreLevelName, scoreLevel.scoreLevelId))
            });
            form.render("select");
        },
        sl_henan: function (selector) {
            if (_isGovCity) {
                let slArr = [
                    {"scoreLevelId": "a9ed8e28-2edf-447a-9945-a7ba00ade9dd", "scoreLevelName": "中医市级",},
                    {"scoreLevelId": "06dba136-11cd-4738-a7f9-a12300e5c47d", "scoreLevelName": "市级",}
                ];
                slArr.forEach((scoreLevel, index) => {
                    $(selector).append(new Option(scoreLevel.scoreLevelName, scoreLevel.scoreLevelId))
                });
                form.render("select");
            } else {
                lat.renderScoreLevel(selector, _cur_year, '1__');
            }
        },
        sl_neimeng: function (selector) {
            if (_isGovCity) {
                let slArr = [
                    {"scoreLevelId": "8bfb5dff-fbcb-46ee-aba0-a58e00ad9902", "scoreLevelName": "盟／市级继续医学教育项目",}
                ];
                slArr.forEach((scoreLevel, index) => {
                    $(selector).append(new Option(scoreLevel.scoreLevelName, scoreLevel.scoreLevelId))
                });
                form.render("select");
            } else {
                lat.renderScoreLevel(selector, _cur_year, '1__');
            }
        },
        renderStartDateSel: function () {
            gStartDateSel = lat.renderDaySelector('#startDateSelector', '', {
                btns: ['clear', 'confirm'],
                type: 'datetime',
                done: function (value, date, endDate) {
                    let endDay = $('#endDateSelector').val();
                    if (value && endDay) {
                        if (!validateSdDay(value, endDay)) {
                            $('#startDateSelector').val('');
                        }
                    }
                }
            });
        },
        renderEndDateSel: function () {
            gEndDateSel = lat.renderDaySelector('#endDateSelector', '', {
                type: 'datetime',
                change: function (value, date, endDate) {
                    lay_daysel_totail(gEndDateSel);
                },
                done: function (value, date, endDate) {
                    let startDay = $('#startDateSelector').val();
                    if (startDay && value) {
                        if (!validateSdDay(startDay, value)) {
                            $('#endDateSelector').val('');
                        }
                    }
                }
            });
        }
    }
});
