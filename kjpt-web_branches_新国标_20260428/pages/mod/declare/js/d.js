//
layui.config({
    base: '/js/layui/ext/'
}).extend({
    lat: 'lat',
    xmSelect: 'xm-select',
}).use(['jquery', 'element', 'table', 'form', 'layer', 'lat', 'xmSelect', 'upload'], function () {
    let $ = layui.jquery, table = layui.table, form = layui.form, laydate = layui.laydate, lat = layui.lat, layer = layui.layer;
    let element = layui.element, xmSelect = layui.xmSelect, upload = layui.upload;
    _html.verifycpt?.();
    _dbase.info.standardKindId = _standardKindId;
    _dbase.info.unitId = _unitId;
    _dbase.info.holdYear = toNum(getOrDefault(getUrlParamByName('hold_year'), '2022'));
    _dbase.info.scoreLevelId = getOrDefault(getUrlParamByName('score_level_id'), 'e551a983-8236-4520-9deb-9bb50009e43e');
    _dbase.info.projectId = getOrDefault(getUrlParamByName('project_id'), '');
    _dbase.info.extId = null;
    _dbase.info.projType = getOrDefault(getUrlParamByName('proj_type'), '1');
    const _source = getOrDefault(getUrlParamByName('source'), 'unit');
    const _zhCn = toNum(getOrDefault(getUrlParamByName('zh_cn'), 1)); // medical_type
    const _regionLevelId = getOrDefault(getUrlParamByName('region_level_id'), '');
    const GD_CITY_SCORE_LEVEL_ID = '95b9ef88-7265-11f0-adb9-005056a64c01';
    const GD_COUNTY_SCORE_LEVEL_ID = '3037222a-2e5d-11f1-a586-005056a64c01';
    const GD_DECL_TEMPLATE_URL = '/pages/mod/declare/file/guangdong/承诺书.docx';
    const GD_DECL_TEMPLATE_URL_BY_SCORE_LEVEL = {
        [GD_CITY_SCORE_LEVEL_ID]: '/pages/mod/declare/file/guangdong/市级继教活动项目负责人承诺书.docx',
        [GD_COUNTY_SCORE_LEVEL_ID]: '/pages/mod/declare/file/guangdong/区县级有组织的继续医学教育实践活动负责人承诺书.doc',
    };
    let gKnowledgeCode = '', gKnowledgeTwoCode = '', gKnowledgeIdOld = '', gKnowledgeIdNew = '', gUnitMainId = '';
    let gProjectDetail = {};
    let gCourseArr = getOrDefault(gProjectDetail.courseVOList, []);
    let gCycleArr = getOrDefault(gProjectDetail.cycleVOList, []);
    let gAttachmentArr = getOrDefault(gProjectDetail.attachmentVoList, []);
    let gProjRendered = false, gProjPriRendered = false, gProjCouRendered = false, gProjCycRendered = false, gProjAttachmentRendered = false;
    let gTitleTreeData, gTitleTreeSelector, gSpecTreeSel, gRpTitleTreeSelector;
    let gLayerIndex, gCategory = 0, gFileName;
    let gTabBacked = false, gPrincipalCeil, gPrincipalCeilMsg = '', gNumberCeil = 9999;
    const _gdDecl = {
        shouldShow: function () {
            return _isGuangdong
                && [GD_COUNTY_SCORE_LEVEL_ID, GD_CITY_SCORE_LEVEL_ID].includes(_dbase.info.scoreLevelId);
        },
        legacyAttachmentCategory: 4,
        templateUrl: function () {
            return getOrDefault(
                GD_DECL_TEMPLATE_URL_BY_SCORE_LEVEL[_dbase.info.scoreLevelId],
                GD_DECL_TEMPLATE_URL
            );
        },
        fileName: function () {
            if (gProjectDetail.declName) return gProjectDetail.declName;
            if (!gProjectDetail.declUrl) return '';
            let filePath = (gProjectDetail.declUrl || '').split('?')[0];
            return decodeURIComponent(filePath.substring(filePath.lastIndexOf('/') + 1) || '承诺书');
        }
    };
    $(function () {
        _action.loadProjectDetail(_dbase.info.projectId);
        lat.render2ndKnowledge('select[name=knowledgeTwoId]', _dbase.info.holdYear, _isNingxia);
        lat.renderDuty('select[name=business]');
        lat.renderEducation('select[name=education]');
        _dbase._certTypeData.forEach((ct, index) => {
            let op = new Option(ct.dictName, ct.dictId, 0 === index, 0 === index);
            $('select[name=certType]').append(op);
        });
        lat.renderCheckType('select[name=checkTypeId]');
        _render.renderHoldType();
        _render.renderTitleSel();
        _render.renderSpecSel();
        window.addCycle = _page4.addCycle;
        setTimeout(function () {
            _page4.bindScoreChange();
        }, 500);
    });
    element.on('tab(declare-tab)', function () {
        let layId = this.getAttribute('lay-id');
        let isPage1 = ('page1' === layId);
        isPage1 && !_dbase.info.projectId && _echo.echoProj();
        if (!isPage1 && !_dbase.info.projectId) {
            if (!gTabBacked) {
                lat.failMsg('请先填写并保存项目基本信息');
                gTabBacked = true;
                element.tabChange('declare-tab', 'page1');
                gTabBacked = false;
            }
        } else {
            ('page2' === layId) && _echo.echoPrincipal();
            ('page3' === layId) && _echo.echoCourse();
            ('page4' === layId) && _echo.echoCycle();
            ('page5' === layId) && _echo.echoAttachment();
        }
    });
    form.on('submit(save)', function (data) {
        _dbase.disableSubmit();
        gLayerIndex = lat.loadingShade();
        let fields = data.field;
        let pageNum = Number.parseInt(fields.pageNum);
        (pageNum === 1) && _action.submit1(fields);
        (pageNum === 2) && _action.submit2(fields);
        (pageNum === 3) && _action.submit3(gCourseArr);
        (pageNum === 4) && _action.submit4(fields, false);
        (pageNum === 5) && _page5.submit5(false);
        layer.close(gLayerIndex);
        return false;
    });
    form.on('submit(saveToNext)', function (data) {
        _dbase.disableSubmit();
        gLayerIndex = lat.loadingShade();
        let fields = data.field;
        let pageNum = Number.parseInt(fields.pageNum);
        (pageNum === 1) && _action.submit1(fields, true);
        (pageNum === 2) && _action.submit2(fields, true);
        (pageNum === 3) && _action.submit3(gCourseArr, true);
        (pageNum === 4) && _action.submit4(fields, true);
        (pageNum === 5) && _page5.submit5(true);
        layer.close(gLayerIndex);
        return false;
    });
    form.verify(_dbase.verify.json);
    form.on('select(knowledgeTwoIdSelect)', function (data) {
        let val = data.value;
        gKnowledgeTwoCode = $('select[name=knowledgeTwoId]').find('option[value=' + val + ']').attr('kcode');
        _page1.changeKnowledgeTwoId(val);
    });
    form.on('select(knowledgeIdSelect)', function (data) {
        let knowledgeId = data.value;
        gKnowledgeIdOld = gKnowledgeIdNew;
        gKnowledgeIdNew = knowledgeId;
        if (knowledgeId) {
            gKnowledgeCode = $('select[name=knowledgeId]').find('option[value=' + knowledgeId + ']').attr('kcode');
            declarePrepare(knowledgeId, _dbase.info.unitId).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    gKnowledgeCode = jsonRes.data.knowledgeCode;
                    gKnowledgeTwoCode = jsonRes.data.knowledgeTwoCode;
                    gUnitMainId = jsonRes.data.unitMainId;
                } else {
                    lat.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                lat.errorMsg("error:加载学科信息");
            });
        }
    });
    form.on('select(projCategorySel)', function (data) {
        _page1.changeProjCategory(data.value);
    });
    $('#page2-form input[name="idCardNo"]').on('change', function () {
        let val = this.value;
        val && _page2.changePrincipalIdCardNo(val);
    });
    laydate.render({
        elem: '#birthDateSel',
        format: 'yyyy-MM-dd',
        trigger: 'click',
    });
    table.on('toolbar(courseTable)', function (obj) {
        if ('addCourse' === obj.event) {
            if (gCourseArr.length >= 50) {
                lat.failMsg('最多能添加50个课程');
                return false;
            }
            gCourseArr.push(_dbase.freshCourse(_dbase.info.projectId));
            table.reload('courseTable', {data: gCourseArr});
        }
    });
    table.on('tool(courseTable)', function (obj) {
        let rowData = obj.data;
        if ('delCourse' === obj.event) {
            gCourseArr = gCourseArr.filter(course => course.courseId !== rowData.courseId);
            table.reload('courseTable', {data: gCourseArr});
        }
    });
    table.on('edit(courseTable)', function (obj) {
        let val = obj.value;
        let field = obj.field;
        let rowData = obj.data;
        ('idCardNo' === field) && _page3.changeIdCardNo(val, rowData);
        ('period' === field) && _page3.changePeriod(val, rowData, obj);
    });
    form.on('select(certTypePage3)', function (data) {
        let idx = $(data.elem).attr('idx');
        let selValue = data.value;
        gCourseArr[idx]['certType'] = selValue ? selValue : null;
        let certId = gCourseArr[idx]['idCardNo'];
        if (certId && !_dbase.verify._verifyIdCardNo(selValue, certId)) lat.failMsg(_dbase.verify._certIdErrorMsg);
    });
    form.on('select(teachingMethod)', function (data) {
        let idx = $(data.elem).attr('idx');
        let selValue = data.value;
        gCourseArr[idx]['teachingMethod'] = selValue ? selValue : null;
    });
    table.on('tool(cycleTable)', function (obj) {
        let rowData = obj.data;
        if ('delCycle' === obj.event) {
            gCycleArr = gCycleArr.filter(cycle => cycle.periodId !== rowData.periodId);
            table.reload('cycleTable', {data: gCycleArr});
            _dbase.calc.calcDays(gCycleArr);
            if (_dbase.calc.day2score) _dbase.calc.calcScore(gCourseArr, gCycleArr);
        }
    });
    $('input[name=number]').on('change', function () {
        let v = this.value;
        if (v > gNumberCeil) {
            lat.failMsg(`超出拟招生人数上限（${gNumberCeil}）`);
            this.value = null;
        }
    });
    $('.icon_tip').mouseenter(function () {
        let msg = $(this).data('tip');
        gLayerIndex = layer.tips(msg, this, {
            tips: [4, '#808080'],
            time: 50000
        });
    }).mouseleave(function () {
        layer.close(gLayerIndex);
    });
    table.on('toolbar(attachmentTable)', function (obj) {
        let event = obj.event;
        ('upload1' === event) && _page5.uploadAttachment(1);
        ('upload2' === event) && _page5.uploadAttachment(2);
        ('upload3' === event) && _page5.uploadAttachment(3);
        ('upload4' === event) && _page5.uploadAttachment(4);
        ('upload5' === event) && _page5.uploadAttachment(5);
    });
    table.on('tool(attachmentTable)', function (obj) {
        let rowData = obj.data;
        let event = obj.event;
        if ('preview' === event) lat.previewThumb(rowData.url);
        if ('delete' === event) _page5.deleteAttachment(rowData.id, false);
        if ('lasted' === event) _page5.deleteAttachment(rowData.id, true);
    });
    const _page1 = {
        changeProjCategory: function (val) {
            if (_isHubei) {
                let isc = isHubeiCityProj(_dbase.info.scoreLevelId);
                if ('公共项目' === val) _dbase.fix.fixhubeipt(isc, false);
                if ('专业项目' === val) _dbase.fix.fixhubeipt(isc, false);
            }
        },
        changeKnowledgeTwoId: function (knowledgeTwoId) {
            if (knowledgeTwoId) {
                lat.render3rdKnowledge('select[name=knowledgeId]', _dbase.info.holdYear, knowledgeTwoId);
            } else {
                $('select[name=knowledgeId]').empty();
                form.render('select');
            }
        },
        wrapNoDto: function (params) {
            params.cmeStandardKindId = _dbase.info.standardKindId;
            params.holdYear = _dbase.info.holdYear;
            params.scoreLevelId = _dbase.info.scoreLevelId;
            params.unitId = _dbase.info.unitId;
        },
    };
    const _page2 = {
        principal2course: function () {
            if (_isHunan) {
                let p = lat.getFormVal('page2-form');
                let f = gCourseArr.length > 0 ? gCourseArr[0] : {};
                let a = {
                    'courseId': uuid(),
                    'projectId': _dbase.info.projectId,
                    'fresh': true,
                    'teacherName': p.personName,
                    'certType': _dbase.verify._certIdType,
                    'titleId': p.titleId,
                    'workUnit': p.workUnit,
                    'cstate': 1,
                    'userCreate': _userId,
                    'isPrincipal': true,
                    'teachingMethod': '理论',
                };
                if (f.teacherName !== p.personName) {
                    gCourseArr = [a, ...gCourseArr];
                    table.reload('courseTable', {data: gCourseArr});
                }
            }
        },
        changePrincipalIdCardNo: function (idCardNo) {
            const that = this;
            let visit = huayi_projectscore_url + 'declare/cnt/principal';
            let params = {
                "standardKindId": _dbase.info.standardKindId,
                "scoreLevelId": _dbase.info.scoreLevelId,
                "holdYear": _dbase.info.holdYear,
                "idCardNo": idCardNo
            };
            postAction(visit, params).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    let cnt = jsonRes.data;
                    if (cnt >= gPrincipalCeil) {
                        gPrincipalCeilMsg = `项目负责人(${idCardNo})已申报项目数(${cnt})达到每年最高申报数量限制(${gPrincipalCeil})`;
                        lat.alertMsg(gPrincipalCeilMsg);
                    } else {
                        gPrincipalCeilMsg = '';
                        _isZhejiang && that.fillPrincipal(idCardNo);
                    }
                } else {
                    lat.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                lat.errorMsg('error:cntPrincipal');
            });
        },
        fillPrincipal: function (certId) {
            let visit = `${huayi_projectscore_url}declare/query/principal/${certId}`;
            postAction(visit).then(response => {
                let jsonRes = response.data;
                let principal = jsonRes.data;
                if (jsonRes.success && principal) {
                    form.val('page2-form', {
                        'certType': principal.certType,
                        'idCardNo': principal.idCardNo,
                        'personName': principal.personName,
                        'gender': principal.gender,
                        'titleId': principal.titleId,
                        'business': principal.business,
                        'education': principal.education,
                        'workUnit': principal.workUnit,
                        'age': principal.age,
                        'phone': principal.phone,
                        'address': principal.address,
                        'postcode': principal.postcode,
                    });
                }
            }).catch(error => {
                lat.errorMsg(getErrorMsg(error, 'error:查询负责人信息'));
            });
        },
    };
    const _guard = {
        getFeatureGuard: function () {
            return window.ProjectDeclareCourseGuard || null;
        },
        shouldValidatePrincipalCourse: function () {
            let featureGuard = this.getFeatureGuard();
            return !!(featureGuard && featureGuard.shouldValidatePrincipalInCourses && featureGuard.shouldValidatePrincipalInCourses());
        },
        getPrincipal: function () {
            const $form = $('#page2-form');
            const principal = {
                personName: ($form.find('input[name="personName"]').val() || '').trim(),
                idCardNo: ($form.find('input[name="idCardNo"]').val() || '').trim(),
            };
            if (principal.personName || principal.idCardNo) {
                return principal;
            }
            return getOrDefault(gProjectDetail.principalVO, {});
        },
        getCourseArr: function (courseArr) {
            let currentCourseArr = [];
            try {
                currentCourseArr = getOrDefault(layui.table.cache['courseTable'], []);
            } catch (e) {
                currentCourseArr = [];
            }
            if (!currentCourseArr || currentCourseArr.length < 1) {
                currentCourseArr = Array.isArray(courseArr) ? courseArr : gCourseArr;
            }
            return (_echo.tchr && _echo.tchr.courseTrim)
                ? _echo.tchr.courseTrim(currentCourseArr)
                : currentCourseArr;
        },
        validatePrincipalCourseFeature: function (courseArr) {
            let featureGuard = this.getFeatureGuard();
            if (!featureGuard || !this.shouldValidatePrincipalCourse()) {
                return true;
            }
            let principal = this.getPrincipal();
            let currentCourseArr = this.getCourseArr(courseArr);
            let principalName = (principal && principal.personName ? String(principal.personName) : '').trim();
            let principalIdCardNo = (principal && principal.idCardNo ? String(principal.idCardNo) : '').replace(/\s+/g, '').toUpperCase();

            if (!principalName && !principalIdCardNo) {
                lat.failMsg('请先完善并保存项目负责人信息');
                _dbase.enableSubmit();
                return false;
            }

            let result = featureGuard.validatePrincipalInCoursesIfEnabled({
                principal: principal,
                courseArr: currentCourseArr,
                enabled: true,
            });
            if (!result.ok) {
                lat.failMsg(result.msg);
                _dbase.enableSubmit();
                return false;
            }
            return true;
        },
    };
    const _page3 = {
        changeIdCardNo: function (val, rowData) {
            if (val && !_dbase.verify._verifyIdCardNo(rowData.certType, val)) lat.failMsg(_dbase.verify._certIdErrorMsg);
        },
        changePeriod: function (val, rowData, editObj) {
            const rowIndex = Number(editObj?.tr?.attr('data-index'));
            const reloadCourseTableKeepScroll = function () {
                const $oldMain = editObj?.tr?.closest('.layui-table-view')?.find('.layui-table-main');
                const oldTop = $oldMain?.scrollTop?.() || 0;
                const oldLeft = $oldMain?.scrollLeft?.() || 0;
                table.reload('courseTable', {
                    data: gCourseArr,
                    done: function () {
                        const $newMain = $('#courseTable').next('.layui-table-view').find('.layui-table-main');
                        $newMain.scrollTop(oldTop);
                        $newMain.scrollLeft(oldLeft);
                    }
                });
            };
            const syncPeriodVal = function (nextVal) {
                rowData.period = nextVal;
                if (!Number.isNaN(rowIndex) && gCourseArr[rowIndex]) {
                    gCourseArr[rowIndex].period = nextVal;
                } else if (rowData.courseId) {
                    const idx = gCourseArr.findIndex(v => v.courseId === rowData.courseId);
                    if (idx > -1) gCourseArr[idx].period = nextVal;
                }
            };
            if (val === '' || val === null || typeof val === 'undefined') {
                syncPeriodVal('');
                return;
            }
            const periodNum = Number(val);
            if (Number.isNaN(periodNum)) {
                lat.failMsg('学时格式不正确,输入数字即可');
                syncPeriodVal('');
                reloadCourseTableKeepScroll();
                return;
            }
            if (periodNum <= 0) {
                lat.failMsg('学时必须大于0');
                syncPeriodVal('');
                reloadCourseTableKeepScroll();
                return;
            }
            syncPeriodVal(periodNum);
        },
    };
    const _page4 = {
        renderDeclUploader: function () {
            const that = this;
            const $uploadBtn = $('#gdDeclUploadBtn');
            if ($uploadBtn.length < 1 || $uploadBtn.data('uploaded')) return;
            $uploadBtn.data('uploaded', true);
            upload.render({
                elem: '#gdDeclUploadBtn',
                url: huayi_upload_url + 'uploadApi/upload',
                size: 15 * 1024,
                accept: 'file',
                exts: 'pdf',
                multi: false,
                choose: function () {
                    $('#gdDeclPreviewBtn').hide();
                    gLayerIndex = lat.loadingShade();
                },
                before: function (obj) {
                    let files = this.files = obj.pushFile();
                    for (let key in files) {
                        if (Object.prototype.hasOwnProperty.call(files, key)) {
                            gFileName = files[key].name;
                        }
                    }
                    this.data = {
                        fileType: 'DOC',
                        path: `/projDecl/${_dbase.info.standardKindId}/${_dbase.info.holdYear}/${_dbase.info.unitId}`,
                    };
                },
                done: function (res, index) {
                    delete this.files[index];
                    if (res.code !== 200) {
                        lat.failMsg('上传失败');
                        layer.close(gLayerIndex);
                        return;
                    }
                    that.saveDeclUrl(gFileName, res.data.picUrl);
                },
                error: function () {
                    layer.close(gLayerIndex);
                    lat.errorMsg('上传失败');
                }
            });
        },
        cleanupLegacyDeclAttachments: function () {
            const legacyItems = (gAttachmentArr || []).filter(function (item) {
                return Number(item.category) === _gdDecl.legacyAttachmentCategory && item.id;
            });
            if (legacyItems.length < 1) {
                return Promise.resolve();
            }
            const deleteReqList = legacyItems.map(function (item) {
                return postAction(huayi_projectscore_url + 'declare/attachment/delete/' + item.id)
                    .catch(function () {
                        return null;
                    });
            });
            return Promise.all(deleteReqList).finally(function () {
                gAttachmentArr = (gAttachmentArr || []).filter(function (item) {
                    return Number(item.category) !== _gdDecl.legacyAttachmentCategory;
                });
                if (Array.isArray(gProjectDetail.attachmentVoList)) {
                    gProjectDetail.attachmentVoList = gProjectDetail.attachmentVoList.filter(function (item) {
                        return Number(item.category) !== _gdDecl.legacyAttachmentCategory;
                    });
                }
            });
        },
        clearProjectDeclUrl: function () {
            if (!gProjectDetail.declUrl) {
                return Promise.resolve();
            }
            return new Promise(function (resolve) {
                $.ajax({
                    type: 'post',
                    url: huayi_projectscore_url + 'project/projDecldel',
                    data: {
                        projectId: _dbase.info.projectId
                    },
                    dataType: 'json',
                    complete: function () {
                        gProjectDetail.declUrl = '';
                        gProjectDetail.declName = '';
                        resolve();
                    }
                });
            });
        },
        saveDeclUrl: function (fileName, url) {
            const that = this;
            if (!_dbase.info.projectId) {
                layer.close(gLayerIndex);
                lat.failMsg('请先保存项目基本信息后再上传承诺书');
                return;
            }
            that.clearProjectDeclUrl().then(function () {
                $.ajax({
                    type: 'post',
                    url: huayi_projectscore_url + 'project/saveProjDeclUrl',
                    data: {
                        projectId: _dbase.info.projectId,
                        declUrl: url,
                        declType: 1
                    },
                    dataType: 'json',
                    success: function (jsonRes) {
                        if (jsonRes.success || jsonRes.status === 200) {
                            that.cleanupLegacyDeclAttachments().finally(function () {
                                gProjectDetail.declUrl = url;
                                gProjectDetail.declName = fileName;
                                lat.okMsg('承诺书上传成功');
                                that.syncDeclSection();
                            });
                        } else {
                            lat.failMsg(getOrDefault(jsonRes.msg, '承诺书保存失败'));
                        }
                    },
                    error: function (error) {
                        lat.errorMsg(getErrorMsg(error, 'error:保存承诺书'));
                    },
                    complete: function () {
                        layer.close(gLayerIndex);
                    }
                });
            });
        },
        previewDecl: function () {
            if (!gProjectDetail.declUrl) {
                lat.failMsg('请先上传承诺书');
                return;
            }
            let joiner = gProjectDetail.declUrl.indexOf('?') > -1 ? '&' : '?';
            window.open(gProjectDetail.declUrl + joiner + '_t=' + Date.now());
        },
        syncDeclSection: function () {
            const shouldShow = _gdDecl.shouldShow();
            const $section = $('#gdDeclSection');
            if ($section.length < 1) return;
            $section.toggle(shouldShow);
            if (!shouldShow) return;
            this.renderDeclUploader();
            $('#gdDeclTemplateBtn').attr('href', _gdDecl.templateUrl());
            $('#gdDeclUploadTrigger').off('click.gdDecl').on('click.gdDecl', function () {
                $('#gdDeclUploadBtn').click();
            });
            $('#gdDeclPreviewBtn').off('click.gdDecl').on('click.gdDecl', function () {
                _page4.previewDecl();
            });
            let hasDeclFile = !!gProjectDetail.declUrl;
            $('#gdDeclPreviewBtn').toggle(hasDeclFile);
        },
        addCycle: function () {
            if (gCycleArr.length >= _dbase.var.cycleLimit) {
                lat.failMsg(`最多能添加${_dbase.var.cycleLimit}个周期`);
                return false;
            }
            gCycleArr.push({
                'projectId': _dbase.info.projectId,
                'periodId': uuid(),
                'fresh': true,
                'dateStart': '',
                'dateEnd': '',
                'batchId': 1,
                'unitId': _dbase.info.unitId
            });
            table.reload('cycleTable', {data: gCycleArr});
        },
        bindScoreChange: function () {
            if (_isHubei) {
                $('input[name=score]').on('change', function () {
                    let val = this.value;
                    let days = lat.getFormVal('page4-form').days;
                    let ceil = Math.min(days * 2, 10);
                    _dbase.calc.score = Math.min(val, ceil);
                    if (val > ceil) {
                        lat.failMsg('拟授学员学分不可超过' + ceil + '分');
                        this.value = ceil;
                    }
                });
            }
        },
    };
    const _page5 = {
        reloadAttachmentTable: function () {
            table.reload('attachmentTable', {data: gAttachmentArr});
        },
        renderUploader: function () {
            const that = this;
            upload.render({
                elem: '#uploadBtn',
                url: huayi_upload_url + 'uploadApi/upload',
                size: 15 * 1024,
                accept: 'file',
                exts: 'pdf|png|jpg|jpeg',
                multi: false,
                choose: function (obj) {
                    gLayerIndex = lat.loadingShade();
                },
                before: function (obj) {
                    let files = this.files = obj.pushFile();
                    for (let key in files) {
                        gFileName = files[key].name;
                    }
                    let fileType = gFileName.endsWith('pdf') ? 'DOC' : 'IMAGE';
                    this.data = {
                        fileType: fileType,
                        path: `/declare/${_dbase.info.standardKindId}/${_dbase.info.holdYear}/${_dbase.info.unitId}`,
                    }
                },
                done: function (res, index, upload) {
                    delete this.files[index];
                    if (res.code !== 200) {
                        lat.failMsg('上传失败');
                    } else {
                        lat.okMsg('上传完成');
                        let fileUrl = res.data.picUrl;
                        that.saveAttachment(gCategory, gFileName, fileUrl);
                    }
                    layer.close(gLayerIndex);
                },
                error: function () {
                    lat.errorMsg('上传失败');
                }
            });
        },
        uploadAttachment: function (category) {
            gCategory = category;
            $('#uploadBtn').click();
        },
        wrapperAttachment: function () {
            const that = this;
            let categoryArr = gAttachmentArr.map(v => v.category);
            if (!categoryArr.includes(1)) {
                let visit = huayi_sjwh_url + 'unit/file/lasted/' + _dbase.info.unitId + '/' + 1;
                postAction(visit).then(response => {
                    let jsonRes = response.data;
                    let unitFile = jsonRes.data;
                    if (jsonRes.success) {
                        if (unitFile) {
                            that.saveAttachment(1, unitFile.fileName, unitFile.url);
                        } else {
                            layer.close(gLayerIndex);
                            lat.failMsg('单位未上传法人证书，请至法人证书维护菜单上传单位法人证书');
                        }
                    } else {
                        layer.close(gLayerIndex);
                        lat.failMsg(jsonRes.msg);
                    }
                }).catch(error => {
                    lat.errorMsg('error:unitFile.lasted');
                });
            }
        },
        saveAttachment: function (category, fileName, url) {
            const that = this;
            let visit = huayi_projectscore_url + 'declare/attachment/save';
            let params = {
                projectId: _dbase.info.projectId,
                category: category,
                fileName: fileName,
                url: url,
                createBy: _userId
            };
            postAction(visit, params).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    gAttachmentArr.push(jsonRes.data);
                    that.reloadAttachmentTable();
                } else {
                    lat.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                lat.errorMsg(getErrorMsg(error, 'error:保存附件'));
            }).finally(() => {
                layer.close(gLayerIndex);
            });
        },
        deleteAttachment: function (id, lasted) {
            const that = this;
            gLayerIndex = lat.loadingShade();
            let visit = huayi_projectscore_url + 'declare/attachment/delete/' + id;
            postAction(visit).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    gAttachmentArr = gAttachmentArr.filter(item => (item.id !== id));
                    that.reloadAttachmentTable();
                } else {
                    lat.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                lat.errorMsg(getErrorMsg(error, 'error:删除附件'));
            }).finally(() => {
                if (lasted) {
                    gAttachmentArr = gAttachmentArr.filter(i => i.category !== 1);
                    that.wrapperAttachment();
                } else {
                    layer.close(gLayerIndex);
                }
            });
        },
        fullAttachment: function () {
            const that = this;
            let categoryArr = gAttachmentArr.map(v => v.category);
            let curArr = Array.from(new Set(categoryArr)).sort();
            let fullArr = _dbase.attach.mustAttachmentArr(_dbase.info.scoreLevelId);
            let absentArr = fullArr.filter(item => {
                return curArr.every(v => {
                    return item !== v;
                });
            });
            let res = absentArr.length === 0;
            if (!res) lat.failMsg('缺少附件：' + absentArr.map(v => _dbase.attach.categoryText(v)).join('，'));
            return res;
        },
        submit5: function (doReport) {
            const that = this;
            _dbase.enableSubmit();
            if (!doReport) {
                layer.confirm('保存成功，请及时至列表页进行上报操作', {
                    title: '提示',
                    btn: ['确定', '取消'],
                    icon: 1
                }, function () {
                    let obj = {
                        sender: 'declare',
                        closeModal: true
                    };
                    window.parent.postMessage(obj, '*');
                }, function () {
                });
            } else {
                if (that.fullAttachment()) {
                    layer.confirm('上报后将无法修改申报信息，请确认是否直接上报？', {
                        title: '确认',
                        btn: ['确定', '取消'],
                        icon: 3
                    }, function () {
                        _action.report();
                    }, function () {
                    });
                } else {
                    return false;
                }
            }
        },
    };
    const _action = {
        submit1: function (params, toNext) {
            if (_dbase.info.projectId.length < 1) {
                params.fresh = true;
                params.cmeStandardKindId = _dbase.info.standardKindId;
                params.holdYear = _dbase.info.holdYear;
                params.scoreLevelId = _dbase.info.scoreLevelId;
                params.unitId = _dbase.info.unitId;
                params.unitMainId = gUnitMainId;
                params.userCreate = _userId;
                params.userId = _userId;
                params.status = 0;
                // 额外添加单位可能同时挂多个地市，后端会按本次选择的 regionLevelId 反查地市。
                params.regionLevelId = _regionLevelId;
                params.previousCheckUnitId = '000000';
                params.projectType = _zhCn;
                params.subjectType = _zhCn;
                params.projType = _dbase.info.projType;
            } else {
                params.fresh = false;
                params.projectId = _dbase.info.projectId;
                params.changeKnowledgeId = (gKnowledgeIdOld !== gKnowledgeIdNew);
                _page1.wrapNoDto(params);
            }
            params.extId = _dbase.info.extId;
            params.createBy = _userId;
            // params.knowledgeId = gKnowledgeIdNew;
            // params.knowledgeTwoId = '';
            params.knowledgeCode = gKnowledgeCode;
            params.knowledgeTwoCode = gKnowledgeTwoCode;
            if (_isHubei) {
                params.projCategory = getOrDefault(params.projCategory, '-');
                params.extType = getOrDefault(params.extType, '-');
            }
            if (_isHunan) {
                delete params.rpTransferMode;
                delete params.rpMedia;
                delete params.rpInteraction;
                delete params.rpResource;
                delete params.rpKnowledge;
                delete params.rpExam;
                delete params.rpValuation;
                if (isHunanRp(_dbase.info.scoreLevelId)) {
                    params.isRp = 1;
                    params.rpTransferMode = checkboxVals('rpTransferMode');
                    params.rpMedia = checkboxVals('rpMedia');
                    params.rpInteraction = checkboxVals('rpInteraction');
                    params.rpResource = checkboxVals('rpResource');
                    params.rpKnowledge = checkboxVals('rpKnowledge');
                    params.rpExam = checkboxVals('rpExam');
                    params.rpValuation = checkboxVals('rpValuation');
                }
            }
            let res = false;
            declareProjAction(removeEmpty(params)).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    lat.okMsg('项目基本信息保存完成');
                    if (!_dbase.info.projectId) {
                        setTimeout(() => {
                            _action.fixProjectCode(jsonRes.data.projectId);
                        }, 500);
                    }
                    _dbase.info.projectId = jsonRes.data.projectId;
                    _dbase.info.extId = getOrDefault(jsonRes.data.extId, _dbase.info.extId);
                    res = true;
                    _isHubei && _page5.wrapperAttachment();
                } else {
                    lat.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                lat.errorMsg(getErrorMsg(error, 'error:保存项目基本信息'));
            }).finally(() => {
                _dbase.enableSubmit();
                (res && toNext) && element.tabChange('declare-tab', 'page2');
            });
            return false;
        },
        submit2: function (params, toNext) {
            if (gPrincipalCeilMsg) {
                _dbase.enableSubmit();
                lat.alertMsg(gPrincipalCeilMsg);
            } else {
                params.userCreate = _userId;
                params.cmeStandardKindId = _dbase.info.standardKindId;
                params.projectId = _dbase.info.projectId;
                if(!_isHunan) params.speciality = gSpecTreeSel?.getValue('nameStr');
                if (_isZhengzhou || _isHebi || _isLuohe) {
                    params.business || (params.business = PseudoNull.UUID);
                }
                const submitParams = removeEmpty(params);
                ['workUnit'].forEach((key) => {
                    if (Object.prototype.hasOwnProperty.call(params, key) && params[key] === '') {
                        submitParams[key] = '';
                    }
                });
                let res = false;
                declarePrincipalAction(submitParams).then(response => {
                    let jsonRes = response.data;
                    if (jsonRes.success) {
                        lat.okMsg('项目负责人信息保存完成');
                        res = true;
                    } else {
                        lat.failMsg(jsonRes.msg);
                    }
                }).catch(error => {
                    lat.errorMsg(getErrorMsg(error, 'error:保存项目负责人信息'));
                }).finally(() => {
                    _dbase.enableSubmit();
                    _page2.principal2course();
                    (res && toNext) && element.tabChange('declare-tab', 'page3') && _echo.echoCourse();
                });
            }
        },
        submit3: function (courseArr, toNext) {
            let msg = _dbase.verify.course.failMsg(courseArr);
            if (msg) {
                lat.failMsg(msg);
                _dbase.enableSubmit();
                return false;
            } else if (!_guard.validatePrincipalCourseFeature((_echo.tchr?.courseTrim?.(courseArr) || courseArr))) {
                return false;
            } else {
                _dbase.calc.calcPeriod(courseArr);
                _dbase.calc.calcScore(courseArr, gCycleArr);
                let res = false;
                declareCourseAction(removeEmpty(courseArr)).then(response => {
                    let jsonRes = response.data;
                    if (jsonRes.success) {
                        lat.okMsg('课程及教师信息保存完成');
                        res = true;
                    } else {
                        lat.failMsg(jsonRes.msg);
                    }
                }).catch(error => {
                    lat.errorMsg(getErrorMsg(error, 'error:保存课程及教师信息'));
                }).finally(() => {
                    let params = {
                        projectId: _dbase.info.projectId,
                        period: _dbase.calc.period,
                        theoryPeriod: _dbase.calc.period_ll,
                        experimentPeriod: _dbase.calc.period_sy,
                        score: _dbase.calc.score,
                        days: _dbase.calc.days,
                        changeKnowledgeId: false,
                        fresh: false,
                    };
                    declareProjAction(params).then(response => {
                        let jsonRes = response.data;
                    }).catch(error => {
                        lat.errorMsg(getErrorMsg(error, 'error:保存课程及教师信息2'));
                    }).finally(() => {
                        _dbase.enableSubmit();
                        (res && toNext) && element.tabChange('declare-tab', 'page4');
                    });
                });
            }
        },
        submit4: function (params, flag) {
            const that = this;
            params.projectId = _dbase.info.projectId;
            params.doReport = flag;
            gCycleArr.forEach((cycle, index) => {
                cycle.batchId = index + 1;
            });
            for (let i = 0, len = gCycleArr.length; i < len; ++i) {
                gCycleArr[i].batchId = i + 1;
                if (!gCycleArr[i].dateStart) {
                    lat.failMsg('请选择开始日期');
                    return false;
                }
                if (!gCycleArr[i].dateEnd) {
                    lat.failMsg('请选择结束日期');
                    return false;
                }
            }
            params.cycleFormList = gCycleArr;
            params.extId = _dbase.info.extId;
            params.createBy = _userId;
            params.remark = getOrDefault(params.remark, ' ');
            if (_isHubei) that.submit4hubei(params, flag);
            else that.submit4other(params, flag);
        },
        submit4hubei: function (params, toNext) {
            let res = false;
            params.unitName = params.applyUnit;
            declareCycleAction(removeEmpty(params)).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    _dbase.info.extId = jsonRes.data.extId;
                    lat.okMsg('项目其他信息保存完成');
                    res = true;
                } else {
                    lat.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                lat.errorMsg(getErrorMsg(error, 'error:保存项目其它信息'));
            }).finally(() => {
                _dbase.enableSubmit();
                (res && toNext) && element.tabChange('declare-tab', 'page5');
            });
        },
        submit4other: function (params, doReport) {
            const that = this;
            if (!_guard.validatePrincipalCourseFeature((_echo.tchr?.courseTrim?.(gCourseArr) || gCourseArr))) {
                return false;
            }
            if (_gdDecl.shouldShow()
                && !gProjectDetail.declUrl) {
                lat.failMsg('请先上传承诺书');
                _dbase.enableSubmit();
                return false;
            }
            if (!doReport) {
                that.save4(params, false);
            } else {
                layer.confirm('上报后将无法修改申报信息，请确认是否直接上报？', {
                    title: '确认',
                    btn: ['确定', '取消'],
                    icon: 3
                }, function () {
                    that.save4(params, true);
                }, function () {
                    _dbase.enableSubmit();
                });
            }
        },
        save4: function (params, doReport) {
            const that = this;
            let res = false;
            declareCycleAction(removeEmpty(params)).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    res = true;
                    _dbase.info.extId = jsonRes.data.extId;
                } else {
                    lat.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                lat.errorMsg(getErrorMsg(error, 'error:保存项目其它信息'));
            }).finally(() => {
                if (res && !doReport) {
                    _dbase.enableSubmit();
                    layer.confirm('保存成功，请及时至列表页进行上报操作', {
                        title: '提示',
                        btn: ['确定', '取消'],
                        icon: 1
                    }, function () {
                        let obj = {
                            sender: 'declare',
                            closeModal: true
                        };
                        window.parent.postMessage(obj, '*');
                    }, function () {
                    });
                } else if (res && doReport) {
                    that.report();
                }
            });
        },
        report: function () {
            function cb() {
                lat.okMsg('已上报');
                _dbase.enableSubmit();
                let obj = {
                    sender: 'declare',
                    closeModal: true,
                };
                window.parent.postMessage(obj, '*');
            }
            function er() {
                _dbase.enableSubmit();
            }
            let projectId = _dbase.info.projectId;
            let skId = _dbase.info.standardKindId;
            let unitId = _dbase.info.unitId;
            let year = _dbase.info.holdYear;
            let scoreLevelId = _dbase.info.scoreLevelId;
            if (_isUnit) _report.delay(unitId, year, scoreLevelId, _regionLevelId, () => _report.unit(projectId, skId, unitId, cb, er), er);
            if (_isDept) _report.dept(projectId, _userId, cb, er);
        },
        loadNumberCeil: function () {
            postAction(`${huayi_projectscore_url}declare/config/list/abc/${_dbase.info.standardKindId}`).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    gNumberCeil = _dbase.parseNumberCeil(jsonRes.data, _dbase.info.scoreLevelId);
                } else {
                    gNumberCeil = 999999;
                }
            }).catch(error => {
                gNumberCeil = 999999;
            })
        },
        loadLimitVoList: function () {
            let visit = huayi_projectscore_url + 'declare/limit/list';
            let params = {
                "standardKindId": _dbase.info.standardKindId,
                "scoreLevelId": _dbase.info.scoreLevelId,
            };
            postAction(visit, params).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    let limitVoList = jsonRes.data;
                    gPrincipalCeil = _dbase.parsePrincipalCeil(limitVoList);
                } else {
                    lat.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                lat.errorMsg('error:limitVoList');
            });
        },
        loadProjectDetail: function (projectId) {
            if (projectId) {
                gLayerIndex = lat.loadingShade();
                declareProjDetailById(projectId).then(response => {
                    let jsonRes = response.data;
                    if (jsonRes.success) {
                        if (jsonRes.data) {
                            gProjectDetail = jsonRes.data;
                            gProjectDetail.addDay = moment(gProjectDetail.addTime, DateTimePattern.SECOND).format(DateTimePattern.DAY);
                            gCourseArr = gProjectDetail.courseVOList;
                            gCycleArr = gProjectDetail.cycleVOList;
                            gAttachmentArr = gProjectDetail.attachmentVoList;
                            _dbase.info.standardKindId = gProjectDetail.cmeStandardKindId;
                            _dbase.info.holdYear = gProjectDetail.holdYear;
                            _dbase.info.scoreLevelId = gProjectDetail.scoreLevelId;
                            _dbase.info.unitId = gProjectDetail.unitId;
                            _dbase.info.extId = gProjectDetail.extId;
                            _dbase.info.projType = gProjectDetail.projType;
                            _dbase.calc.score = getOrDefault(gProjectDetail.score, 0);
                            _isHubei && _page5.wrapperAttachment();
                        } else {
                            lat.failMsg('未查询到项目信息');
                        }
                    } else {
                        lat.failMsg(jsonRes.msg);
                    }
                }).catch(error => {
                    lat.errorMsg('error:加载项目信息');
                }).finally(() => {
                    _echo.echoProj();
                });
            } else {
                _dbase.fix.fixForm();
            }
        },
        fixProjectCode: function (projectId) {
            let visit = huayi_projectscore_url + 'declare/project/info';
            let params = {
                projectId: projectId,
                projectCode: '.'
            };
            postAction(visit, params).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success && jsonRes.data) {
                    visit = huayi_projectscore_url + 'projNo/change/code/' + projectId;
                    postAction(visit).then(response => {
                    });
                }
            });
        },
    };
    const _echo = {
        echoProj: function () {
            if (!gProjRendered && gProjectDetail) {
                let knowledgeTwoId = gProjectDetail.knowledgeTwoId;
                let $select = $("select[name='knowledgeTwoId']:eq(0)");
                $select.next().children('dl').children("dd[lay-value='" + knowledgeTwoId + "']").click();
                _page1.changeKnowledgeTwoId(knowledgeTwoId);
                gKnowledgeIdOld = gProjectDetail.knowledgeId;
                gKnowledgeIdNew = gKnowledgeIdOld;
                (gProjectDetail.projCategory === '公共项目') && (gProjectDetail.extType = null);
                _page1.changeProjCategory(gProjectDetail.projCategory);
                setTimeout(function () {
                    form.val('page1-form', gProjectDetail);
                    layer.close(gLayerIndex);
                    gProjRendered = true;
                    _dbase.fix.fixForm();
                    if (_isHunan && isHunanRp(_dbase.info.scoreLevelId)) {
                        echoCheckbox('rpTransferMode', gProjectDetail.rpTransferMode);
                        echoCheckbox('rpMedia', gProjectDetail.rpMedia);
                        echoCheckbox('rpInteraction', gProjectDetail.rpInteraction);
                        echoCheckbox('rpResource', gProjectDetail.rpResource);
                        echoCheckbox('rpKnowledge', gProjectDetail.rpKnowledge);
                        echoCheckbox('rpExam', gProjectDetail.rpExam);
                        echoCheckbox('rpValuation', gProjectDetail.rpValuation);
                        form.render('checkbox');
                    }
                }, 300);
            }
        },
        echoPrincipal: function (principal) {
            _action.loadLimitVoList();
            if (!gProjPriRendered && gProjectDetail && gProjectDetail.principalVO) {
                form.val('page2-form', gProjectDetail.principalVO);
                let titleId = gProjectDetail.principalVO.titleId;
                gTitleTreeSelector.setValue([titleId]);
                gSpecTreeSel?.setValue([gProjectDetail.principalVO.specId]);
                gProjPriRendered = true;
                isHunanRp(_dbase.info.scoreLevelId) && gRpTitleTreeSelector.setValue([gProjectDetail.principalVO.rpTitleId]);
            }
        },
        echoCourse: function () {
            if (!gProjCouRendered) {
                let colArr = [..._dbase._courseTableColArr];
                if (isHunanRp(_dbase.info.scoreLevelId)) {
                    colArr[9].edit = 'text';
                    colArr[9].title = '表达方式';
                    delete colArr[9].templet;
                }
                if (_dbase.calc.isguangxi2025()) {
                    colArr[8].title = '教学时长(分钟)';
                    colArr[8].minWidth = 139;
                }
                table.render({
                    id: 'courseTable',
                    elem: '#courseTable',
                    height: 'full-200',
                    toolbar: '#courseToolbar',
                    defaultToolbar: [],
                    headers: _dbase._headers,
                    page: false,
                    limit: 50,
                    cols: [colArr],
                    data: gCourseArr ? gCourseArr : [],
                    done: function (res, curr, count) {
                        gProjCouRendered = true;
                        const rootTitleIdSet = new Set((gTitleTreeData || []).map(node => node && node.titleId).filter(Boolean));
                        if (gCourseArr && gCourseArr.length > 0) {
                            gCourseArr.forEach((courseVo, index) => {
                                echoRowSelect('#projectDetailPage3', 'certType', index);
                                echoRowSelect('#projectDetailPage3', 'teachingMethod', index);
                                (!courseVo.titleId) && (courseVo.titleId = 'ad054866-5331-4546-98bc-9b2f0124b22e');
                                let titleTreeSelectorInst;
                                let ec = {
                                    autoRow: true,
                                    direction: (index > 5) ? 'up' : 'auto',
                                    initValue: courseVo.titleId ? [courseVo.titleId] : [],
                                    clickClose: true,
                                    tree: {
                                        clickExpand: true,
                                    },
                                    on: function (data) {
                                        let selectedE = data.arr[0];
                                        let selectedTitleId = selectedE ? selectedE['titleId'] : null;
                                        if (selectedTitleId && rootTitleIdSet.has(selectedTitleId)) {
                                            let oldTitleId = gCourseArr[index]['titleId'];
                                            setTimeout(function () {
                                                titleTreeSelectorInst?.setValue?.(oldTitleId ? [oldTitleId] : []);
                                            }, 0);
                                            return;
                                        }
                                        gCourseArr[index]['titleId'] = selectedE ? selectedE['titleId'] : null;
                                    }
                                };
                                titleTreeSelectorInst = lat.renderTitleTreeSelector(`#titleTreeSelector${index}`, gTitleTreeData, ec);
                            });
                        }
                    }
                });
            }
        },
        echoCycle: function () {
            _page4.syncDeclSection();
            if (!gProjCycRendered) {
                _action.loadNumberCeil();
                if (_dbase.calc.period > 0) {
                    gProjectDetail.period = _dbase.calc.period;
                    gProjectDetail.theoryPeriod = _dbase.calc.period_ll;
                    gProjectDetail.experimentPeriod = _dbase.calc.period_sy;
                }
                if (!gProjectDetail.addTime) {
                    gProjectDetail.addTime = moment().format(DateTimePattern.SECOND);
                    gProjectDetail.addDay = moment().format(DateTimePattern.DAY);
                }
                if (!gProjectDetail.days && !_dbase.info.projectId) gProjectDetail.score = null;
                if (!gProjectDetail.unitName) gProjectDetail.unitName = _unitName;
                if (!gProjectDetail.applyUnit) gProjectDetail.applyUnit = _unitName;
                echoOption('select[name=holdTypeId]', gProjectDetail.holdTypeId, gProjectDetail.holdTypeName);
                form.val('page4-form', gProjectDetail);
                table.render({
                    id: 'cycleTable',
                    elem: '#cycleTable',
                    defaultToolbar: [],
                    headers: _dbase._headers,
                    page: false,
                    cols: [_dbase._cycleTableColArr],
                    data: gCycleArr ? gCycleArr : [],
                    done: function (res, curr, count) {
                        gProjCycRendered = true;
                        if (gCycleArr.length > 0) {
                            gCycleArr.forEach((cycleVo, index) => {
                                _render.renderCycDateSel('dateStart', index, cycleVo.dateStart);
                                _render.renderCycDateSel('dateEnd', index, cycleVo.dateEnd);
                            });
                        }
                        _page4.syncDeclSection();
                    }
                });
            }
        },
        echoAttachment: function () {
            if (!gProjAttachmentRendered) {
                _page5.renderUploader();
                table.render({
                    id: 'attachmentTable',
                    elem: '#attachmentTable',
                    height: 'full-200',
                    toolbar: '#attachmentToolbar',
                    defaultToolbar: [],
                    headers: _dbase._headers,
                    page: false,
                    limit: 50,
                    autoSort: true,
                    initSort: {field: 'category', type: 'asc'},
                    cols: [_dbase.attach.tableColArr],
                    data: gAttachmentArr ? gAttachmentArr : [],
                    done: function (res, curr, count) {
                        let fullArr = _dbase.attach.mustAttachmentArr(_dbase.info.scoreLevelId);
                        for (let i = 1; i <= 5; ++i) {
                            let $b = $(`a[lay-event="upload${i}"]`);
                            if (fullArr.includes(i)) $b.show();
                            else $b.hide();
                        }
                        gProjAttachmentRendered = true;
                    }
                });
            }
        },
    };
    const _render = {
        renderHoldType: function () {
            const fixHoldTypeScoreLevelIds = [
                '95b9ef88-7265-11f0-adb9-005056a64c01',
                '95b9efce-7265-11f0-adb9-005056a64c01'
            ];
            const districtScoreLevelId = '3037222a-2e5d-11f1-a586-005056a64c01';
            if (fixHoldTypeScoreLevelIds.includes(_dbase.info.scoreLevelId)) {
                const fixedHoldTypeId = 'bed3d92c-d190-11ef-a610-005056a64c01';
                const fixedHoldTypeName = '面授';
                const $sel = $('select[name=holdTypeId]');
                $sel.empty().append(new Option(fixedHoldTypeName, fixedHoldTypeId, true, true));
                $('input[name=holdTypeName]').val(fixedHoldTypeName);
                gProjectDetail.holdTypeId = fixedHoldTypeId;
                gProjectDetail.holdTypeName = fixedHoldTypeName;
                form.render('select');
                return;
            }
            if (_dbase.info.scoreLevelId === districtScoreLevelId) {
                const $sel = $('select[name=holdTypeId]');
                $sel.empty()
                    .append(new Option('面授', 'bed3d92c-d190-11ef-a610-005056a64c01'))
                    .append(new Option('面授+远程', 'bed5f234-d190-11ef-a610-005056a64c01'));
                form.render('select');
                return;
            }
            if (_dbase.htarr) {
                _dbase.htarr.forEach((holdType, index) => {
                    $('select[name=holdTypeId]').append(new Option(holdType.holdTypeName, holdType.holdTypeId));
                });
                form.render("select");
            } else {
                lat.renderHoldType('select[name=holdTypeId]', '', '1__');
            }
        },
        renderCycDateSel: function (soe, rowIndex, initVal) {
            laydate.render({
                elem: '#' + soe + 'Sel' + rowIndex,
                format: 'yyyy-MM-dd',
                trigger: 'click',
                value: initVal,
                min: _dbase.info.holdYear + '-01-01',
                max: (_dbase.info.holdYear + (('dateStart' === soe) ? 0 : 99)) + '-12-31',
                change: function (value, date, endDate) {
                },
                done: function (value, date, endDate) {
                    const _isStart = 'dateStart' === soe;
                    const _isEnd = 'dateEnd' === soe;
                    const _preEnd = (0 === rowIndex) ? '1970-01-01' : gCycleArr[rowIndex - 1]['dateEnd'];
                    const _nextStart = (rowIndex === gCycleArr.length - 1) ? '2199-01-01' : gCycleArr[rowIndex + 1]['dateStart'];
                    const _curStart = _isStart ? value : gCycleArr[rowIndex]['dateStart'];
                    const _curEnd = _isEnd ? value : gCycleArr[rowIndex]['dateEnd'];
                    let pass = true;
                    if (_isStart) {
                        if (_curEnd && !moment(toDayHeader(_curStart), DateTimePattern.SECOND).isBefore(moment(toDayTail(_curEnd), DateTimePattern.SECOND))) {
                            lat.failMsg('开始日期不能大于结束日期');
                            pass = false;
                        }
                        if (_preEnd && moment(toDayHeader(_curStart), DateTimePattern.SECOND).isBefore(moment(toDayTail(_preEnd), DateTimePattern.SECOND))) {
                            lat.failMsg('开始日期不能小于上一周期结束日期');
                            pass = false;
                        }
                        if (_isHunan && _curEnd) {
                            let diff = parseDiff(_curStart, _curEnd);
                            let days = $('input[name=days]').val();
                            if (diff < days) {
                                lat.failMsg('开始日期和结束日期的时间间隔需要大于等于举办期限');
                                pass = false;
                            }
                        }
                    } else if (_isEnd) {
                        if (_curStart && moment(toDayTail(_curEnd), DateTimePattern.SECOND).isBefore(moment(toDayHeader(_curStart), DateTimePattern.SECOND))) {
                            lat.failMsg('结束日期不能小于开始日期');
                            pass = false;
                        }
                        if (_nextStart && !moment(toDayTail(_curEnd), DateTimePattern.SECOND).isBefore(moment(toDayHeader(_nextStart), DateTimePattern.SECOND))) {
                            lat.failMsg('结束日期不能大于下一周期开始日期');
                            pass = false;
                        }
                        if (_isHunan && _curStart) {
                            let diff = parseDiff(_curStart, _curEnd);
                            let days = $('input[name=days]').val();
                            if (diff < days) {
                                lat.failMsg('开始日期和结束日期的时间间隔需要大于等于举办期限');
                                pass = false;
                            }
                        }
                    }
                    if (pass) {
                        gCycleArr[rowIndex][soe] = value;
                        if (0 === rowIndex && _curStart && _curEnd) {
                            _dbase.calc.calcDays(gCycleArr);
                            if (_dbase.calc.day2score) _dbase.calc.calcScore(gCourseArr, gCycleArr);
                        }
                    } else {
                        table.reload('cycleTable', {data: gCycleArr});
                    }
                }
            });
        },
        renderTitleSel: function () {
            getTitleTreeData().then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    gTitleTreeData = jsonRes.data;
                } else {
                    lat.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                lat.errorMsg('error:加载titleTreeData');
            }).finally(() => {
                let conf = {
                    tree: {
                        clickExpand: true,
                        clickCheck: false
                    },
                    name: 'titleId',
                    layVerify: 'required',
                    layReqText: '请选择职称',
                };
                let d = JSON.parse(JSON.stringify(gTitleTreeData));
                _isHunan && _cmn.disableNode(d, node => 'da42823c-796c-4377-a616-9b2f01271376,7acab84c-e870-4a4d-90ea-9b2f01271376'.includes(node.titleLevel));
                gTitleTreeSelector = lat.renderTitleTreeSelector('#titleTreeSelector', d, conf);
                let conf2 = {
                    tree: {
                        clickExpand: true,
                        clickCheck: false
                    },
                    name: 'rpTitleId',
                    layVerify: isHunanRp(_dbase.info.scoreLevelId) ? 'required' : '',
                    layReqText: '请选择职称',
                };
                gRpTitleTreeSelector = lat.renderTitleTreeSelector('#rpTitleTreeSelector', gTitleTreeData, conf2);
            });
        },
        renderSpecSel: function () {
            getSpecTreeData(2).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    let ec = {
                        tree: {
                            clickExpand: true,
                        },
                        name: 'specId',
                        layVerify: 'required',
                        layReqText: '请选择专业',
                    };
                    gSpecTreeSel = lat.renderSpecTreeSelector('#specIdSel', jsonRes.data, ec);
                }
            }).catch(error => {
                lat.errorMsg('error:加载specTreeData');
            });
        },
    };
});