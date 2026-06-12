layui.config({
    base: '/js/layui/ext/'
}).extend({
    lat: 'lat',
    xmSelect: 'xm-select',
}).use(['jquery', 'element', 'table', 'form', 'layer', 'lat', 'xmSelect', 'upload'], function () {
    let $ = layui.jquery, lat = layui.lat, layer = layui.layer, xmSelect = layui.xmSelect;
    // _html.verifycpt?.();
    const _isPreview = 1 === +getOrDefault(getUrlParamByName('preview'), '0');
    const _holdYear = getOrDefault(getUrlParamByName('hold_year'), '2025');
    const _slId = getOrDefault(getUrlParamByName('score_level_id'), '');
    const _source = getOrDefault(getUrlParamByName('source'), '');
    const _zhCn = +getOrDefault(getUrlParamByName('zh_cn'), '1'); // medical_type
    // const _medicalType = +getOrDefault(getUrlParamByName('medical_type'), '1'); // 1-西医 2-中医
    const _medicalType = iszhongyi(_slId) ? 2 : 1;
    const _projType = getOrDefault(getUrlParamByName('proj_type'), '1'); // 1-推荐 2-推广
    const _projectType = getOrDefault(getUrlParamByName('project_type'), '1'); // 1-西医 2-中医
    const _baseInfo = {
        'holdYear': _holdYear,
        'scoreLevelId': _slId,
        'source': _source,
        'fresh': true,
        'projectId': getOrDefault(getUrlParamByName('project_id'), null),
        'extId': null,
        'cmeStandardKindId': _standardKindId,
        'unitId': _unitId,
        'knowledgeId': '',
        'knowledgeCode': '',
        'knowledgeTwoId': '',
        'knowledgeTwoCode': '',
        'addTime': moment().format(DateTimePattern.SECOND),
        'userId': _userId,
        'userCreate': _userId,
        'previousCheckUnitId': '000000',
        'unitMainId': '',
        'status': 0,
        'projectType': _projectType,
        'subjectType': _projectType,
        'projType': _projType,
    };
    const _dictKnowledgeSubject = {
        '6483088b-9bf6-434c-8bd3-5a26c4e8b386': 2, // 中医省级推荐项目
        '9ad395e4-56be-491a-9d46-f9d66b7a9bc4': 2, // 中医省级推广项目
        'dde072cf-d971-4a8b-a74d-ed51737bfcbc': 1, // 省级推荐项目
        'fdf78ca8-b694-4a7c-be3c-856baa40ddd7': 1, // 省级推广项目
        'ddc04ee8-70d1-11f0-89b2-fa163e2ff656': 2,
        'd0b501c2-1229-11f1-aa66-005056a64c01': 2, // 浙江（省级）中医
    };
    const _xmSelInst = {};
    let gCourseArr = [], gCycleArr = [];
    let _lastScoreTypeForKnowledge = null;
    let gPrincipalCeil, gPrincipalCeilMsg = '';

    // 活动内容联动举办方式(浙江中医)：公需课(3)仅允许线上/远程
    function _getHoldType2ByStandardKind() {
        return (_options?.holdType3 || []).filter(ht => ht.standardKindId === _baseInfo.cmeStandardKindId);
    }

    function _pickOnlineHoldType2(list) {
        if (!Array.isArray(list)) return [];
        let online = list.filter(it => String(it?.name ?? '') === '线上');
        if (online.length > 0) return online;
        online = list.filter(it => String(it?.name ?? '') === '远程');
        if (online.length > 0) return online;
        online = list.filter(it => /线上|远程/.test(String(it?.name ?? '')));
        if (online.length > 0) return online;
        return list.slice(0, 1);
    }

    function _getXmSingleValue(xmInst) {
        try {
            if (!xmInst) return '';
            const vals = xmInst.getValue?.('value');
            if (Array.isArray(vals) && vals.length > 0) return String(vals[0] ?? '');
            const arr = xmInst.getValue?.();
            if (Array.isArray(arr) && arr.length > 0) return String(arr[0]?.value ?? '');
        } catch (e) {
        }
        return '';
    }

    function _restrictHoldTypeByScoreType(scoreType) {
        try {
            if (!_xmSelInst?.proj_holdTypeId) return;
            const all = _getHoldType2ByStandardKind();
            const onlyOnline = _pickOnlineHoldType2(all);
            const restrict = String(scoreType ?? '') === '3';
            const data = restrict ? onlyOnline : all;
            _xmSelInst.proj_holdTypeId.update?.({data});

            if (restrict && Array.isArray(onlyOnline) && onlyOnline.length > 0) {
                const cur = _getXmSingleValue(_xmSelInst.proj_holdTypeId);
                const allowed = new Set(onlyOnline.map(it => String(it?.value ?? '')));
                if (!cur || !allowed.has(String(cur))) {
                    _xmSelInst.proj_holdTypeId.setValue?.([onlyOnline[0].value]);
                }
                setTimeout(function () {
                    try {
                        _fm?.calc?.calcScore?.();
                    } catch (e) {
                    }
                }, 0);
            }
        } catch (e) {
        }
    }
    $(function () {
        window.parent.$('.layui-layer.layui-layer-iframe a.layui-layer-close').hide();
        if (_isPreview) _docx.readonly();
        _render.renderSel();
        _bind.bindStageSave();
        _bind.bindPrincipalIdCardNoChange();
        _bind.bindAddCourse();
        _bind.bindEditCycle();
        _bind.bindSign();
        _action.prepareUnitMainId();
        _action.loadLimitVoList();
        if (_baseInfo.projectId) {
            _action.loadProject(_baseInfo.projectId);
        } else {
            echoAll({}, {}, []);
        }
    });
    function echoSel(proj, prin) {
        _xmSelInst.proj_knowledgeId?.setValue([proj.knowledgeId]);
        _xmSelInst.prin_gender?.setValue([prin.gender]);
        _xmSelInst.prin_isInJob?.setValue([prin.isInJob]);
        _xmSelInst.prin_isLecturer?.setValue([prin.isLecturer]);
        _xmSelInst.prin_business?.setValue([prin.business]);
        _xmSelInst.prin_education?.setValue([prin.education]);
        _xmSelInst.proj_holdTypeId?.setValue([proj.holdTypeId]);
        _xmSelInst.proj_isForWest?.setValue([proj.isForWest]);
        _xmSelInst.proj_checkTypeId?.setValue([proj.checkTypeId]);
        _xmSelInst.prin_titleId?.setValue([prin.titleId]);
        _xmSelInst.prin_specId?.setValue([prin.specId]);
        _xmSelInst.proj_rpValuation?.setValue([proj.rpValuation]);
        if (proj.formData1) {
            let v = JSON.parse(proj.formData1)['lxmleibie'] || '';
            _xmSelInst.proj_json1_lxmleibie?.setValue(v.split(','))
        }
        if (_isZhejiang){
            _xmSelInst.proj_canBp?.setValue([proj.canBp]);
            _xmSelInst.proj_canHd?.setValue([proj.canHd]);
            _xmSelInst.prin_certType?.setValue([prin.certType]);
            if (proj.scoreType) _xmSelInst.proj_scoreType?.setValue([proj.scoreType]);
            if (proj.applyType) _xmSelInst.proj_applyType?.setValue([proj.applyType]);
        }
    }
    function echoAll(proj, prin, opinionVoList) {
        let id = proj.projectCode;
        let code = proj.projectCode;
        if (id) {
            $('#proj_projectCode').text(code);
            $('#proj_scoreLevelName').text(proj.scoreLevelName);
        }
        if (1 === proj.publishStatus) {
            $('#code_label').text('项目编号');
            $('#proj_projectCode').text(proj.publishCode);
        }
        setTimeout(() => {
            _pj.projecho(proj);
            _echo.echoPrin(prin);
            _echo.echoCycle(gCycleArr);
            echoSel(proj, prin);
            echoCt();
            _echo.echoSign(prin.sign1, prin.sign2, prin.signDate);
            if (!_baseInfo.projectId) {
                _echo.fixedInfo(_unitName, _baseInfo.addTime, _baseInfo.holdYear);
            }
            _echo.echoOpinion(opinionVoList, proj.finalStatus);
            _fix.fixForm();
            _docx.removeLoading();
        }, 400);
    }
    function echoCt() {
        let vcnt = gCourseArr.length;
        _echo.tchr.coursePad(gCourseArr);
        _echo.echoCourse(gCourseArr);
        _echo.echoTeacher(gCourseArr);
        _break.fixBlankTr();
        _bind.bindCourseUd();
        if (vcnt > 0) {
            _fm.calc.calcPeriod(gCourseArr);
            if (_isZhejiang) {
                // 浙江：calcScore 依赖举办形式（xmSelect）选中值；setValue 后需要下一拍才能稳定读取
                setTimeout(function () {
                    try {
                        _fm?.calc?.calcScore?.();
                    } catch (e) {
                    }
                }, 0);
            } else {
                _fm.calc.calcScore();
            }
        }
    }
    function showCourseModal(course) {
        localStorage.setItem('tmp_declare_course', JSON.stringify(course));
        layer.open({
            type: 2,
            shade: 0.4,
            shadeClose: false,
            title: '课程及教师',
            content: `/pages/mod/declare25/modals/course.html?must_cert_id=${_validate.verify.course_mustCertId}&sl_id=${_baseInfo.scoreLevelId}&hold_year=${encodeURIComponent(_baseInfo.holdYear || '')}&project_type=${encodeURIComponent(_baseInfo.projectType || '')}`,
            area: ['80%', '486px'],
            success: function (layerDom, index) {
            },
            end: function () {
                let course = JSON.parse(localStorage.getItem('tmp_declare_course'));
                let update = false;
                for (const c of gCourseArr) {
                    if (c.courseId === course.courseId) {
                        Object.keys(course).forEach(key => {
                            c[key] = course[key];
                        });
                        update = true;
                    }
                }
                if (!update) {
                    gCourseArr = _echo.tchr.courseTrim(gCourseArr);
                    gCourseArr.push(course);
                }
                localStorage.removeItem('tmp_declare_course');
                echoCt();
            }
        });
    }
    function showSignModal(targetImg) {
        layer.open({
            type: 2,
            shade: 0.4,
            shadeClose: false,
            title: '签名',
            content: '/pages/mod/declare25/modals/sign.html',
            area: ['740px', '400px'],
            success: function (layerDom, index) {
            },
            end: function () {
                let dataURL = localStorage.getItem('tmp_declare_sign');
                localStorage.removeItem('tmp_declare_sign');
                if (dataURL) {
                    if ('sign1' === targetImg) _echo.echoSign(dataURL, '', today());
                    if ('sign2' === targetImg) _echo.echoSign('', dataURL, '');
                }
            }
        });
    }
    const _fix = {
        fixForm: function () {
            if (_isPreview) {
                this.disableSel();
                $('input[type=checkbox]').attr('disabled', 'true');
            }
        },
        disableSel: function () {
            Object.keys(_xmSelInst).forEach(key => {
                _xmSelInst[key]?.update({disabled: true});
            });
        }
    }
    function knowState() {
        if (_isHainan) return 1;
        // if (_isHenan) return 1;
        return null;
    }
    const _render = {
        renderSel: function () {
            this.renderKnowledge('');
            lat.renderDaySelector('input[name="prin_birthDate"]', '');
            _xmSelInst.prin_gender = lat.xmSingleSel('#prin_genderSel', _options.gender);
            _xmSelInst.prin_isInJob = lat.xmSingleSel('#prin_isInJobSel', _options.yon);
            _xmSelInst.prin_isLecturer = lat.xmSingleSel('#prin_isLecturerSel', _options.yon);
            _xmSelInst.prin_business = lat.xmSingleSel('#prin_businessSel', _options.business);
            _xmSelInst.prin_education = lat.xmSingleSel('#prin_educationSel', _options.education);
            let holdTypeEc = null;
            if (_isZhejiang) {
                holdTypeEc = {
                    on: function () {
                        setTimeout(function () {
                            try {
                                _fm?.calc?.calcScore?.();
                            } catch (e) {
                            }
                        }, 0);
                    }
                };
            }
            _xmSelInst.proj_holdTypeId = lat.xmSingleSel(
                '#proj_holdTypeIdSel',
                iszhongyi_zhejiang(_slId) ? _options.holdType3.filter(ht => ht.standardKindId === _baseInfo.cmeStandardKindId) : _options.holdType2.filter(ht => ht.standardKindId === _baseInfo.cmeStandardKindId),
                holdTypeEc
            );
            _xmSelInst.proj_isForWest = lat.xmSingleSel('#proj_isForWestSel', _options.yon);
            _xmSelInst.proj_checkTypeId = lat.xmSingleSel('#proj_checkTypeIdSel', _options.checkType);
            _xmSelInst.proj_rpValuation = lat.xmSingleSel('#proj_rpValuationSel', _options.rpValuation);
            _xmSelInst.proj_json1_lxmleibie = lat.renderMultiSelector('#proj_json1_lxmleibieSel', _options.teacherLeibie, {layVerify: 'required', layReqText: '必填项不能为空！',});
            this.renderTitle('');
            this.renderSpec('');
            if (_isZhejiang) {
                _xmSelInst.proj_canBp = lat.xmSingleSel('#proj_canBpSel', _options.yon);
                _xmSelInst.proj_canHd = lat.xmSingleSel('#proj_canHdSel', _options.yon);
                _xmSelInst.prin_certType = lat.xmSingleSel('#prin_certTypeSel', _options.certType);
                if (!_baseInfo.projectId) {
                    this.renderScoreype('');
                }
                if (iszhongyi_zhejiang(_slId)) { // 浙江（省级）中医
                    _xmSelInst.proj_applyType = lat.xmSingleSel('#proj_applyTypeSel', _options.applyTypeZhongyi);
                    if (!_baseInfo.projectId && Array.isArray(_options.applyTypeZhongyi) && _options.applyTypeZhongyi.length > 0) {
                        try {
                            _xmSelInst.proj_applyType?.setValue([_options.applyTypeZhongyi[0].value]);
                        } catch (e) {
                        }
                    }
                } else if (_unitUpward.includes('330005')) { // 浙江宁波
                    _xmSelInst.proj_applyType = lat.xmSingleSel('#proj_applyTypeSel', _options.applyTypeNingbo,holdTypeEc);
                    if (!_baseInfo.projectId && Array.isArray(_options.applyTypeNingbo) && _options.applyTypeNingbo.length > 0) {
                        try {
                            _xmSelInst.proj_applyType?.setValue([_options.applyTypeNingbo[0].value]);
                        } catch (e) {
                        }
                    }
                }
            }
        },
        renderKnowledge: function (initVal, extraParams) {
            let params = {
                'standardKindId': _standardKindId,
                'cmeYear': _baseInfo.holdYear,
                'knowledgeSubject': _dictKnowledgeSubject[_baseInfo.scoreLevelId] || _baseInfo.projectType || null,
                'state': knowState(),
            };
            if (_isZhejiang && extraParams && typeof extraParams === 'object') {
                params = $.extend(true, params, extraParams);
            }
            postAction(`${huayi_sjwh_url}option/knowledge/tree/data`, params).then(response => {
                let jsonRes = response.data;
                let data = jsonRes.data;
                _cmn.prefixParentName(data);
                if (jsonRes.success) {
                    _xmSelInst.proj_knowledgeId = lat.renderKnowledgeTreeSel('#proj_knowledgeTreeSel', data, {
                        initValue: [initVal],
                        on: function (data) {
                            let selNode = data.arr[0];
                            _baseInfo.knowledgeId = selNode.knowledgeId;
                            _baseInfo.knowledgeCode = selNode.knowledgeCode;
                            _baseInfo.knowledgeName = selNode.knowledgeName;
                            let p = selNode.__node.parent;
                            _baseInfo.knowledgeTwoId = p.knowledgeTwoId;
                            _baseInfo.knowledgeTwoCode = p.knowledgeTwoCode;
                            _baseInfo.knowledgeTwoName = p.knowledgeTwoName;
                        }
                    }, true);
                }
            });
        },
        renderTitle: function (initVal) {
            getTitleTreeData().then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    let ec = {
                        initValue: [initVal],
                        tree: {
                            clickExpand: true,
                        }
                    }
                    _xmSelInst.prin_titleId = lat.renderTitleTreeSelector('#prin_titleTreeSel', jsonRes.data, ec);
                }
            }).catch(error => {
                lat.errorMsg('error:加载titleTreeData');
            });
        },
        renderSpec: function (initVal,extraParams) {
            if (_echo.prinSpecIdFromKnowledge) {
                this._renderSpecNeimeng(initVal,extraParams);
            } else {
                getSpecTreeData(2).then(response => {
                    let jsonRes = response.data;
                    if (jsonRes.success) {
                        let ec = {
                            initValue: [initVal],
                            tree: {
                                clickExpand: true,
                            }
                        }
                        _xmSelInst.prin_specId = lat.renderSpecTreeSelector('#prin_specIdSel', jsonRes.data, ec);
                    }
                }).catch(error => {
                    lat.errorMsg('error:加载specTreeData');
                });
            }
        },
        _renderSpecNeimeng: function (initVal,extraParams) {
            let params = {
                'standardKindId': _standardKindId,
                'cmeYear': _baseInfo.holdYear,
                'knowledgeSubject': _dictKnowledgeSubject[_baseInfo.scoreLevelId] || _baseInfo.projectType || null,
                'state': knowState()
            };
            if (_isZhejiang && extraParams && typeof extraParams === 'object') {
                params = $.extend(true, params, extraParams);
            }
            
            postAction(`${huayi_sjwh_url}option/knowledge/tree/data`, params).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    let ec = {
                        initValue: [initVal],
                        tree: {
                            clickExpand: true,
                        }
                    }
                    _xmSelInst.prin_specId = lat.renderKnowledgeTreeSel('#prin_specIdSel', jsonRes.data, ec, false);
                }
            }).catch(error => {
                lat.errorMsg('error:加载specTreeData');
            });
        },
        renderScoreype: function (initVal) {
            postAction(`${huayi_sjwh_url}cmeCommonConfig/getConfigByUnitFromRedis?unitId=${_unitId}&scoreLevelId=${_slId}&configNames=fun_project_score_type`).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    let data = jsonRes.data?.fun_project_score_type ?? jsonRes.data ?? [];
                    if (typeof data === 'string') {
                        try {
                            data = JSON.parse(data.replace(/'/g, '"'));
                        } catch (e) {
                            data = [];
                        }
                    }
                    if (!data || data.length === 0) {
                        data = [{'value': 1, 'name': '专业课'}];
                    }
                    let hasInit = !(initVal === undefined || initVal === null || String(initVal).trim() === '');
                    let baseInit = String(_baseInfo.scoreType ?? '').trim();
                    let defVal = hasInit ? initVal : (baseInit ? baseInit : (data[0]?.value ?? ''));
                    _baseInfo.scoreType = String(defVal ?? '');
                    _lastScoreTypeForKnowledge = String(defVal ?? '');
                    _xmSelInst.proj_scoreType = lat.xmSingleSel('#proj_scoreTypeSel', data, {
                        initValue: [String(defVal ?? '')],
                        on: function (d) {
                            let arr = d?.arr || [];
                            if (arr.length < 1) return;
                            let v = String(arr[0].value ?? '');
                            if (!v) return;
                            if (v === _lastScoreTypeForKnowledge) return;
                            _lastScoreTypeForKnowledge = v;
                            _baseInfo.scoreType = v;
                            try {
                                _xmSelInst.proj_knowledgeId?.setValue([]);
                                _baseInfo.knowledgeId='';
                            } catch (e) { }
                            $('#proj_knowledgeTreeSel').empty();
                            if (_isZhejiang) {
                                _render.renderKnowledge('', { knowledgeScoreType: v });
                                _render.renderSpec('', { knowledgeScoreType: v });
                            }
                            
                        },
                        disabled: !data || data.length < 2
                    });
                    if (_isZhejiang) {
                        _render.renderKnowledge('', { knowledgeScoreType: String(defVal ?? '') });
                        _render.renderSpec('',{ knowledgeScoreType: String(defVal ?? '') });
                    }
                    
                }
            });
        },
        
    }
    const _bind = {
        bindPrincipalIdCardNoChange: function () {
            if (_isPreview) return;

            // 证件号码：失焦时触发（按需求在 d2.js 增加 change 事件）
            // - blur：确保“焦点移除”一定触发
            // - change：统一逻辑入口，并避免重复请求
            $(document)
                .off('blur.d2_prin_idCardNo')
                .on('blur.d2_prin_idCardNo', 'input[name="prin_idCardNo"]', function () {
                    // 主动触发 change，满足“焦点移除触发事件”的诉求
                    $(this).trigger('change');
                })
                .off('change.d2_prin_idCardNo')
                .on('change.d2_prin_idCardNo', 'input[name="prin_idCardNo"]', function () {
                    let $ipt = $(this);
                    let idCardNo = ($ipt.val() || '').toString().trim();

                    // 空值：清理提示并跳过
                    if (!idCardNo) {
                        $ipt.data('d2_last_cnt_idCardNo', '');
                        gPrincipalCeilMsg = '';
                        return;
                    }

                    // 去重：同一个值不重复调用接口
                    let last = ($ipt.data('d2_last_cnt_idCardNo') || '').toString();
                    if (idCardNo === last) return;
                    $ipt.data('d2_last_cnt_idCardNo', idCardNo);

                    try {
                        gPrincipalCeilMsg = '';
                        _action.changePrincipalIdCardNo(idCardNo);
                    } catch (e) {
                    }
                });
        },
        bindSign: function () {
            if (_isPreview) return;
            $('#btn_sign').on('click', function () {
                showSignModal('sign1');
            });
            $('#btn_resign').on('click', function () {
                showSignModal('sign1');
            });
            $('.td_sign').on('click', function () {
                showSignModal('sign2');
            });
        },
        bindEditCycle: function () {
            $('#btn_cycle').on('click', function () {
                localStorage.setItem('tmp_declare_cycles', JSON.stringify(gCycleArr));
                layer.open({
                    type: 2,
                    shade: 0.4,
                    shadeClose: false,
                    title: '举办周期',
                    content: `/pages/mod/declare25/modals/cycle.html?hold_year=${_baseInfo.holdYear}&limit=${_validate.verify.cycle_limit}`,
                    area: ['80%', '486px'],
                    success: function (layerDom, index) {
                    },
                    end: function () {
                        gCycleArr = JSON.parse(getOrDefault(localStorage.getItem('tmp_declare_cycles'), '[]'));
                        _echo.echoCycle(gCycleArr);
                        localStorage.removeItem('tmp_declare_cycles');
                        _fm.calc.calcDays(gCycleArr);
                    }
                });
            });
        },
        bindAddCourse: function () {
            $('#btn_course').on('click', function () {
                showCourseModal({});
            });
        },
        bindCourseUd: function () {
            $('td[data-before]').on('click', function (event) {
                let that = this;
                layer.confirm('确定要删除授课程吗？', {
                    title: '提示',
                    btn: ['删除', '取消']
                }, function () {
                    let $tr = $(that).parent();
                    let id = $tr.data('id');
                    let idx = gCourseArr.findIndex(c => c.courseId === id);
                    if (-1 !== idx) gCourseArr.splice(idx, 1);
                    echoCt();
                    layer.closeAll();
                }, function () {
                });
            });
            $('td[data-after]').on('click', function (event) {
                let $tr = $(this).parent();
                let id = $tr.data('id');
                let course = gCourseArr.filter(c => c.courseId === id)[0];
                showCourseModal(course);
            });
        },
        bindStageSave: function () {
            $('#btn_close').on('click', function () {
                layer.confirm('确定要关闭吗？', {
                    title: '提示',
                    btn: ['确定', '取消']
                }, function () {
                    let idx = parent.layer.getFrameIndex(window.name);
                    parent.layer.close(idx);
                }, function () {
                });
            });
            $('#btn_stage').on('click', function () {
                let proj = _pj.projget();
                let prin = _fm.getPrin(_xmSelInst);
                if (_validate.isPass(proj, 'proj_', 'stage') && _validate.isPass(prin, 'prin_', 'stage')) {
                    proj.saveState = 0;
                    _action.dosave(proj, prin);
                }
            });
            $('#btn_save').on('click', function () {
                let proj = _pj.projget();
                let prin = _fm.getPrin(_xmSelInst);
                if (_validate.isPass(proj, 'proj_', 'save')
                    && _validate.isPass(prin, 'prin_', 'save')
                    && _validate.isCoursePass(_echo.tchr.courseTrim(gCourseArr))
                    && _validate.isCyclePass(gCycleArr)
                    && _validate.isPrincipalInCourse(prin, _echo.tchr.courseTrim(gCourseArr))) {
                    proj.saveState = 1;
                    _action.dosave(proj, prin);
                }
            });
        },
    }
    const _pj = {
        projget: function () {
            let res = _fm.getProj(_xmSelInst, _baseInfo);
            Object.keys(res).filter(key => key.startsWith('json')).forEach(key => {
                let k1 = key.split('_')[0];
                let k2 = key.split('_')[1];
                let v = res[key];
                let e = res[k1] || {};
                e[k2] = v;
                // delete res[key];
                res[k1] = e;
            })
            res.formData1 = JSON.stringify(res.json1);
            res.formData2 = JSON.stringify(res.json2);
            res.formData3 = JSON.stringify(res.json3);
            res.formData4 = JSON.stringify(res.json4);
            res.formData5 = JSON.stringify(res.json5);
            delete res.json1;
            delete res.json2;
            delete res.json3;
            delete res.json4;
            delete res.json5;
            return res;
        },
        projecho: function (proj) {
            _echo.echoProj(proj);
            const echojson = function (key, json) {
                Object.keys(json).forEach(k2 => {
                    let name = `proj_${key}_${k2}`;
                    let val = json[k2];
                    $(`input[name=${name}]`).val(val).trigger('change');
                });
            }
            if (proj.formData1) echojson('json1', JSON.parse(proj.formData1));
            if (proj.formData2) echojson('json2', JSON.parse(proj.formData2));
            if (proj.formData3) echojson('json3', JSON.parse(proj.formData3));
            if (proj.formData4) echojson('json4', JSON.parse(proj.formData4));
            if (proj.formData5) echojson('json5', JSON.parse(proj.formData5));
        },
    }
    const _action = {
        shouldSkipPrincipalSave: function (proj, prin) {
            return +proj.saveState === 0 && Object.keys(prin || {}).length < 1;
        },
        dosave: function (_proj, _prin) {
            if (gPrincipalCeilMsg) {
                lat.alertMsg(gPrincipalCeilMsg);
            } else {
                _docx.disableSave();
                const proj = removeEmpty(_proj);
                const prin = removeEmpty(_prin);
                _cmn.executeSteps([
                    (next) => this.doproj(proj, next),
                    (next) => this.shouldSkipPrincipalSave(proj, prin) ? next?.() : this.doprin(prin, next),
                    (next) => this.docourse(gCourseArr, next),
                    (next) => this.docycle(gCycleArr, next),
                ], () => {
                    _docx.enableSave();
                    lat.okMsg('已保存');
                });
            }
        },
        handleSaveError: function (message, error) {
            _docx.enableSave();
            if (error) lat.errorMsg(getErrorMsg(error, message));
            else lat.failMsg(message);
        },
        doproj: function (proj, cb) {
            const that = this;
            if (proj.fresh) {
                proj.addTime = moment().format(DateTimePattern.SECOND);
            }
            declareProjAction(proj).then(({data}) => {
                if (data.success) {
                    Object.assign(_baseInfo, {
                        projectId: data.data.projectId,
                        extId: data.data.extId,
                        fresh: false,
                    });
                    cb?.();
                } else {
                    that.handleSaveError('保存项目信息');
                }
            }).catch(error => that.handleSaveError('保存项目信息', error));
        },
        doprin: function (prin, cb) {
            Object.assign(prin, {
                cstate: 1,
                projectId: _baseInfo.projectId,
                userCreate: _userId,
                cmeStandardKindId: _baseInfo.cmeStandardKindId,
                personName: prin.personName || '',
                phone: prin.phone || '',
                workUnit: prin.workUnit || '',
                titleId: prin.titleId || PseudoNull.UUID,
            });
            const that = this;
            declarePrincipalAction(prin).then(({data}) => {
                if (data.success) {
                    cb?.();
                } else {
                    that.handleSaveError('保存负责人信息');
                }
            }).catch(error => that.handleSaveError('保存负责人信息', error));
        },
        docourse: function (courseArr, cb) {
            const arr = _echo.tchr.courseTrim(courseArr) || [];
            if (!arr.length) return cb?.();
            arr.forEach((c, idx) => Object.assign(c, {
                projectId: _baseInfo.projectId,
                userCreate: _userId,
                cstate: 1,
                listOrder: idx + 1,
            }));
            const that = this;
            declareCourseAction(arr).then(({data}) => {
                if (data.success) {
                    cb?.();
                } else {
                    that.handleSaveError('保存课程信息');
                }
            }).catch(error => that.handleSaveError('保存课程信息', error));
        },
        docycle: function (cycleArr, cb) {
            if (!cycleArr.length) return cb?.();
            cycleArr.forEach((c, idx) => Object.assign(c, {
                batchId: idx + 1,
                unitId: _baseInfo.unitId,
            }));
            const params = {
                projectId: _baseInfo.projectId,
                cycleFormList: cycleArr,
            };
            const that = this;
            declareCycleAction(params).then(({data}) => {
                if (data.success) {
                    cb?.();
                } else {
                    that.handleSaveError('保存周期信息');
                }
            }).catch(error => that.handleSaveError('保存周期信息', error));
        },
        prepareUnitMainId: function () {
            if (UserTypeEnum.EXPERT === _userType) return;
            declarePrepare('0594d3e7-d2f2-4cb1-a9d9-9cfe00eff0a9', _unitId).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    _baseInfo.unitMainId = jsonRes.data.unitMainId;
                } else {
                    lat.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                lat.errorMsg("error:获取unitMainId");
            });
        },
        loadProject: function (projectId) {
            declareProjDetailById(projectId).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    if (!jsonRes.data) {
                        _baseInfo.fresh = true;
                        lat.failMsg('未查询到项目信息');
                    } else {
                        _baseInfo.fresh = false;
                    }
                    let dtl = jsonRes.data || {};
                    _baseInfo.projectId = dtl.projectId;
                    _baseInfo.extId = dtl.extId;
                    _baseInfo.addTime = dtl.addTime;
                    _baseInfo.cmeStandardKindId = dtl.cmeStandardKindId;
                    _baseInfo.holdYear = dtl.holdYear;
                    _baseInfo.scoreLevelId = dtl.scoreLevelId;
                    _baseInfo.unitId = dtl.unitId;
                    _baseInfo.knowledgeId = dtl.knowledgeId;
                    _baseInfo.knowledgeCode = dtl.knowledgeCode;
                    _baseInfo.knowledgeTwoId = dtl.knowledgeTwoId;
                    _baseInfo.knowledgeTwoCode = dtl.knowledgeTwoCode;
                    _baseInfo.userId = dtl.userId;
                    _baseInfo.userCreate = dtl.userCreate;
                    _baseInfo.projectType = dtl.projectType;
                    _baseInfo.subjectType = dtl.subjectType;
                    _baseInfo.scoreType = dtl.scoreType;
                    _baseInfo.scoreType = dtl.scoreType;
                    gCourseArr = dtl.courseVOList || [];
                    gCycleArr = dtl.cycleVOList || [];
                    echoAll(dtl, dtl.principalVO || {}, dtl.opinionVoList);
                    if (_isZhejiang) {
                        try {
                            $('#proj_scoreTypeSel').empty();
                        } catch (e) { }
                        _render.renderScoreype(dtl.scoreType);

                        _render.renderKnowledge(dtl.knowledgeId || '', { knowledgeScoreType: dtl.scoreType });
                        _render.renderSpec(dtl.principalVO.specId,{ knowledgeScoreType: dtl.scoreType });
                    }
                } else {
                    lat.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                lat.errorMsg('error:加载项目信息');
            });
        },
        changePrincipalIdCardNo: function (idCardNo) {
            const that = this;
            let visit = huayi_projectscore_url + 'declare/cnt/principal';
            let params = {
                "standardKindId": _standardKindId,
                "scoreLevelId": _slId,
                "holdYear": _holdYear,
                "idCardNo": idCardNo
            };
            postAction(visit, params).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    let cnt = jsonRes.data;
                    if (cnt >= gPrincipalCeil) {
                        gPrincipalCeilMsg = `项目负责人(${idCardNo})已申报项目数(${cnt})达到每年最高申报数量限制(${gPrincipalCeil})`;
                        lat.alertMsg(gPrincipalCeilMsg);
                        return true;
                    }
                } else {
                    lat.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                lat.errorMsg('error:cntPrincipal');
            });
        },
        loadLimitVoList: function () {
            let visit = huayi_projectscore_url + 'declare/limit/list';
            let params = {
                "standardKindId": _standardKindId,
                "scoreLevelId": _slId,
            };
            postAction(visit, params).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    let limitVoList = jsonRes.data;
                    gPrincipalCeil = _action.parsePrincipalCeil(limitVoList);
                } else {
                    lat.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                lat.errorMsg('error:limitVoList');
            });
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
    }
    $.extend(true, _validate, {
        isPrincipalInCourse: function (principal, courseArr) {
            if (!window.ProjectDeclareCourseGuard) {
                return true;
            }
            const result = window.ProjectDeclareCourseGuard.validatePrincipalInCoursesIfEnabled({
                principal: principal,
                courseArr: courseArr,
            });
            if (!result.ok) {
                lat.failMsg(result.msg);
                return false;
            }
            return true;
        }
    });
    function iszhongyi(slid) {
        return 'ddc04ee8-70d1-11f0-89b2-fa163e2ff656'.includes(slid);
    }

    function iszhongyi_zhejiang(slid) {
        return 'd0b501c2-1229-11f1-aa66-005056a64c01'.includes(slid);
    }
});