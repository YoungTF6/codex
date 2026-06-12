_lbl_inst.change_level = function (slId) {
    if (slId) {
        let $sipt = $('input[name=score]');
        let $pipt = $('input[name=period]');
        if (_isZhejiang) {
            let score = 0.5;
            if ('e89cad87-ac89-454f-bd5b-8adde68a50d6' === slId) score = 0.5; // 实践培训
            if ('837fd4a7-5ad7-4fec-89b8-d05558429aa3' === slId) score = 0.2; // 理论培训
            $sipt.val(score).prop("disabled", "disabled").addClass("layui-disabled");
        }
        /*
        if (_isHubei) {
            $('#holdTypeSelector').empty().append(new Option());
            // hubei-院级院内活动
            if ('f7db2c56-f498-11ed-8e50-005056a64c01' === slId) _g_render.ht_hubei('unit');
            // hubei-科室院内活动
            else if ('074bf5ee-f499-11ed-8e50-005056a64c01' === slId) _g_render.ht_hubei('dept');
            else lat.renderHoldType('#holdTypeSelector', '', '_1_');
        }
        if (_isGuangxi) {
            // guangxi-单位组织的活动
            if ('a3f4af93-e123-4e4e-8e10-9c6f00e94109' === slId) $sipt.val(0.5).prop("disabled", "disabled").addClass("layui-disabled");
            // guangxi-科室组织的活动
            else if ('adaa9cac-0792-4461-9d78-9c6f00e943d1' === slId) $sipt.val(0.2).prop("disabled", "disabled").addClass("layui-disabled");
            else $sipt.prop("disabled", "").removeClass("layui-disabled");
        }
        if (_isHunan) {
            if ('bfe57fa8-deba-46a7-8fb4-a1480114dddb' === slId) {
                if ($sipt.val() > 1) {
                    lat.failMsg('单位组织的学术活动，学分不能超过1分');
                    $sipt.val(null);
                    $pipt.val(null);
                }
            }
        }

        if (_isNeimeng) {
            if ('061053' === _unitId) {
                if ('6926b861-5d4a-44af-8ca3-9f0a01000b93' === slId) $sipt.val(1).prop("disabled", "disabled").addClass("layui-disabled");
            }
        }
        */
    }
}
if (_isFujian) {
    $('#score_box').html(`<select name="score" lay-verify="required">
                            <option></option>
                            <option value="1">1分</option>
                            <option value="0.5">0.5分</option>
                            <option value="0.2">0.2分</option>
                        </select>`);
}
layui.config({
    base: '/js/layui/ext/'
}).extend({
    lat: 'lat',
    xmSelect: 'xm-select',
}).use(['table', 'layer', 'jquery', 'form', 'laydate', 'element', 'lat', 'xmSelect'], function () {
    let table = layui.table, layer = layui.layer, form = layui.form, laydate = layui.laydate, dropdown = layui.dropdown, element = layui.element, $ = layui.jquery, lat = layui.lat, xmSelect = layui.xmSelect;
    dogetconfig('fun_check_score_by_person_list,value_forbid_some_operate_on_last_year_data', null);
    let gProjId = getOrDefault(getUrlParamByName('projId'), undefined);
    const _g_rule = {
        scoreByPeriod: function (period) {
            let periodNum = Number(period);
            if (Number.isNaN(periodNum)) return '';
            if (_isNingxia) {
                if (periodNum <= 0) return 0;
                if (periodNum < 6) return 0.2;
                return 1;
            }
            if (_isGuangxi) {
                if (periodNum <= 0) return 0;
                if (periodNum < 6) return 0.2;
                return 1;
            }
            return '';
        },
        periodRuleMsg: function () {
            return '学时必须大于等于1';
        }
    };
    const HAINAN_CYCLE_DURATION_ERROR = '现有举办周期时间小于预设时长，请重新设置。';
    function getCycleDurationHours(startDate, endDate) {
        if (!startDate || !endDate) {
            return 0;
        }
        let startMoment = moment(startDate);
        let endMoment = moment(endDate);
        if (!startMoment.isValid() || !endMoment.isValid()) {
            return 0;
        }
        return endMoment.diff(startMoment, 'hours', true);
    }
    function hasCycleDurationShorterThanPreset(cycleVoList, presetPeriod) {
        let presetHours = Number(presetPeriod || 0);
        if (!(presetHours > 0) || !Array.isArray(cycleVoList) || 0 === cycleVoList.length) {
            return false;
        }
        return cycleVoList.some(cycleVo => getCycleDurationHours(cycleVo.startDate, cycleVo.endDate) < presetHours);
    }
    function validateHainanCyclesBeforeSubmit(groupProj) {
        let groupProjId = groupProj.groupProjId || gProjId;
        if (!_isHainan || !groupProjId) {
            return Promise.resolve(true);
        }
        return getAction(huayi_projectscore_url + 'pgsi/gproj/detail/' + groupProjId).then(response => {
            let jsonRes = response.data || {};
            if (!jsonRes.success) {
                lat.failMsg(jsonRes.msg || '加载举办周期失败');
                return false;
            }
            let cycleVoList = jsonRes.data && jsonRes.data.cycleVoList ? jsonRes.data.cycleVoList : [];
            if (hasCycleDurationShorterThanPreset(cycleVoList, groupProj.period)) {
                lat.failMsg(HAINAN_CYCLE_DURATION_ERROR);
                return false;
            }
            return true;
        }).catch(() => {
            lat.failMsg('加载举办周期失败');
            return false;
        });
    }
    function submitGroupProj(fields, action) {
        validateHainanCyclesBeforeSubmit(fields).then(valid => {
            if (valid) {
                saveGroupProj(fields, action);
            }
        });
    }
    function only_year() {
        return getOrDefault(getUrlParamByName('cmeYear'), _cur_year);
    }
    form.on('select(twoKnowledgeIdSelector)', function (data) {
        if (data.value !== '') {
            lat.render3rdKnowledge('#knowledgeIdSelector', only_year(), data.value)
        } else {
            $('#knowledgeIdSelector').empty();
            form.render("select");
        }
    });
    form.on('submit(saveBack)', function (data) {
        let fields = data.field;
        if (Number(fields.score) > Number(fields.period)) {
            layer.confirm('学分大于学时，是否继续添加？', {
                title: '提示',
                btn: ['确定', '取消']
            }, function () {
                submitGroupProj(fields, 0);
            }, function () {})
        } else {
            submitGroupProj(fields, 0);
        }
        return false;
    });
    form.on('submit(nextStep)', function (data) {
        let fields = data.field;
        if (Number(fields.score) > Number(fields.period)) {
            layer.confirm('学分大于学时，是否继续添加？', {
                title: '提示',
                btn: ['确定', '取消']
            }, function () {
                submitGroupProj(fields, 1);
            }, function () {
            })
        } else {
            submitGroupProj(fields, 1);
        }
        return false;
    });
    form.verify({
        groupProjName: function (value) {
            if (value.length > 120) {
                return "活动名称最多120个汉字";
            }
        },
        period: function (value) {
            if (_isNingxia && 0 === +value) return _g_rule.periodRuleMsg();
            if (_isHenan && 0 === +value) return '学时学分限制规则：录入学时生成学分，学时只能录入整数。大于0小于6为0.2学分; 6学时1学分; 大于6学时小于12学时获得1.2学分; 大于等于12学时2学分;';
        },
        knowledgeId: [/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, '学科ID格式不正确']
    });
    $(function () {
        if (_isHainan) {
            $('label[name="lblPeriod"]').html('<span style="color: red; ">*&nbsp;</span>小时');
            $('input[name="period"]').attr('placeholder', '请输入预设小时数');
        }
        lat.render2ndKnowledge('#twoKnowledgeIdSelector', getOrDefault(getUrlParamByName('cmeYear'), _cur_year), _isNingxia);
        lat.renderCheckType('#checkTypeSelector');
        _g_render.renderCmeYear();
        _g_render.renderHoldType();
        _g_render.renderScoreLevel();
        loadGroupProj(gProjId);
        _isHunan && _g_bind.changeScore();
        if (_isHenan) {
            _g_bind.changeLimit();
            _g_bind.changePeriod();
        }
        if (_isNingxia) {
            _g_bind.changePeriod();
        }
        if (_isHainan || _isGuangdong || _isGuangxi) {
            _g_bind.changePeriod();
        }
        if (_isGuangdong) {
            renderLables();
        }
    });
    const _g_calc = {
        score: function () {
        },
        period: function () {
        },
    };
    const _g_fix = {
        fixForm: function (groupProj) {
            if (_isShanxiJin) {
                $('#noLabel').html('项目编号');
                let otherNoInput = $('input[name="otherNo"]');
                $(otherNoInput).addClass('layui-disabled');
                $(otherNoInput).attr("disabled", "disabled");
            }
            if (_isNeimeng) {
                groupProj.score = 0.2;
                groupProj.period = 1;
                $('input[name="score"]').addClass('layui-disabled').attr("disabled", "disabled");
                $('input[name="period"]').addClass('layui-disabled').attr("disabled", "disabled");
            }
            if (_isHubei) {
                $('input[name="score"]').val(0.5).attr("disabled", "disabled").addClass("layui-disabled");
                groupProj.score = 0.5;
                let len = $(`#holdTypeSelector option[value="${groupProj.holdType}"]`).length;
                (0 === len) && (groupProj.holdType = '');
                let now = moment();
                let curYear = now.year();
                let ispassed = groupProj.cmeYear < curYear;
                let json = JSON.parse(localStorage.getItem('tmp_common_config') || '{}');
                let val = json['value_forbid_some_operate_on_last_year_data'];
                let isexpired = val ? now.isAfter(moment(val)) : false;
                if (isexpired) {
                    $('select[name=cmeYear]').addClass('layui-disabled').attr("disabled", "disabled");
                }
            }
            if (_isHunan) {
                $('.only_hunan').show();
                $('input[name="period"]').addClass('layui-disabled').attr("disabled", "disabled");
            }
            if (_isHenan) {
                $('input[name=score]').attr('disabled', 'true').toggleClass('layui-disabled');
            }
            if (_isNingxia) {
                groupProj.limitPerson = 50;
                $('input[name=score]').attr('disabled', 'true').addClass('layui-disabled');
                $('input[name=limitPerson]').val(50).attr('readonly', 'readonly').addClass('layui-disabled');
            }
            if (_isHainan) {
                $('input[name="score"]').addClass('layui-disabled').attr('disabled', 'disabled');
            }
            form.render('select');
            this.echo(groupProj);
        },
        echo: function (gproj) {
            $('select[name=twoKnowledgeId]').next().children('dl').children(`dd[lay-value='${gproj.twoKnowledgeId}']`).click();
            setTimeout(() => {
                if(!gproj.groupProjId) {
                    if(localStorage.getItem("standardkind-id") == StandardKind.GUANG_DONG) {
                        gproj.scoreLevel = "95b9ef06-7265-11f0-adb9-005056a64c01";
                    }
                    // _lbl_inst["lblProjectLevel"].setValue(["95b9ef06-7265-11f0-adb9-005056a64c01"]);
                }
                echoOption('#knowledgeIdSelector', gproj.knowledgeId, gproj.knowledgeName);
                echoOption('#scoreLevelSelector', gproj.scoreLevel, gproj.scoreLevelName);
                form.val('groupProjForm', gproj);
                if (_isHainan) {
                    _g_bind.syncScoreByPeriod();
                }
                _lbl_inst.echo(gproj, false);
            }, 400);
        }
    };
    const _g_bind = {
        calcScoreByPeriod: function (periodValue) {
            if (_isNingxia || _isGuangxi) {
                return _g_rule.scoreByPeriod(periodValue);
            }
            let period = Number(periodValue);
            let score = '';
            if (Number.isNaN(period) || '' === periodValue) return score;
            if (0 === period) score = 0;
            if (0 < period && period < 6) score = 0.2;
            if (period === 6) score = 1;
            if (6 < period && period < 12) score = 1.2;
            if (period === 12) score = 2;
            if (12 < period && period < 18) score = 2.2;
            if (period === 18) score = 3;
            if (18 < period && period < 24) score = 3.2;
            if (period === 24) score = 4;
            if (24 < period && period < 30) score = 4.2;
            if (30 <= period) score = 5;
            return score;
        },
        syncScoreByPeriod: function () {
            $('input[name=score]').val(this.calcScoreByPeriod($('input[name=period]').val()));
        },
        changePeriod: function () {
            let $ipt = $('input[name=period]');
            $ipt.get(0).classList.add('number_zzs');
            number_zzs();

            let syncScoreByPeriod = () => this.syncScoreByPeriod();
            $ipt.on('input keyup', syncScoreByPeriod);
            $ipt.on('input change', syncScoreByPeriod);
            
            //宁夏的逻辑已经合并到 syncScoreByPeriod 中
            // $ipt.on('keyup', function () {
            //     if (_isNingxia) {
            //         $('input[name=score]').val(_g_rule.scoreByPeriod(this.value));
            //         return;
            //     }
            //     let period = Number(this.value);
            //     let score;
            //     if (0 === period) score = 0;
            //     if (0 < period && period < 6) score = 0.2;
            //     if (period === 6) score = 1;
            //     if (6 < period && period < 12) score = 1.2;
            //     if (period === 12) score = 2;
            //     if (12 < period && period < 18) score = 2.2;
            //     if (period === 18) score = 3;
            //     if (18 < period && period < 24) score = 3.2;
            //     if (period === 24) score = 4;
            //     if (24 < period && period < 30) score = 4.2;
            //     if (30 <= period) score = 5;
            //     $('input[name=score]').val(score);
            // });
        },
        changeLimit: function () {
            $('input[name=limitPerson]').on('keyup', function () {
                let val = Number(this.value);
                let max = 1000;
                if (val > max) {
                    lat.failMsg(`拟授分人数不能超过${max}`);
                    this.value = max;
                }
            });
        },
        changeScore: function () {
            let $si = $('input[name="score"]');
            $si.on('input', function () {
                let score = this.value;
                if (score > 0 && !score.match(/^\d+(\.\d{0,1})?$/)) {
                    let s = score.toString();
                    this.value = s.substring(0, s.length - 1);
                }
            }).on('blur', function () {
                let score = this.value;
                let period = score * 4;
                let slId = lat.getFormVal('groupProjForm').scoreLevel;
                let $pi = $('input[name=period]');
                if ('bfe57fa8-deba-46a7-8fb4-a1480114dddb' === slId && score > 1) {
                    this.value = null;
                    $pi.val(null);
                    lat.failMsg('单位组织的学术活动，学分不能超过1分')
                } else {
                    $pi.val(period);
                }
            });
        },
    };
    const _g_render = {
        renderCmeYear: function () {
            // lat.renderCmeYear();
            let y = String(only_year());
            let arr = [y];
            if (_isGansu && !arr.includes('2025')) {
                arr.push('2025');
            }
            arr.forEach(y => {
                let selected = y === String(only_year());
                $('#cmeYearSelector').append(new Option(y, y, selected, selected));
            });
            form.render('select');
        },
        renderHoldType: function () {
            if (_isNingxia) {
                this.ht_ningxia();
            } else {
                lat.renderHoldType('#holdTypeSelector', '', '_1_');
            }
        },
        ht_ningxia: function () {
            let htArr = [
                {'holdTypeId': 'cbd68785-a9c7-4f12-b82d-abba0117117d', 'holdTypeName': '学术讲座'},
                {'holdTypeId': '339ee4f0-eb38-4c86-88e3-abba011729b5', 'holdTypeName': '专题讨论会'},
                {'holdTypeId': '530ec3c0-903c-4c98-a321-977418cbba9a', 'holdTypeName': '病理讨论'},
                {'holdTypeId': '54fb3f31-134f-4907-a93e-0b89119e6484', 'holdTypeName': '教学查房'},
            ];
            htArr.forEach((holdType, index) => {
                $('#holdTypeSelector').append(new Option(holdType.holdTypeName, holdType.holdTypeId));
            });
            form.render("select");
        },
        ht_hubei: function (uod) {
            // 院级院内活动举办方式包含: 学术报告,专题讲座,技术操作示教,手术示范,新技术推广,其他.
            // 科室院内活动举办方式包含: 临床病例讨论会,案例讨论会,大查房,其他.
            let htArr;
            if ('dept' === uod) {
                htArr = [
                    {"holdTypeId": "422fe3f8-f64e-4d05-a47f-1daf4d0de144", "holdTypeName": "临床病例讨论会"},
                    {"holdTypeId": "78671ac7-3429-42d6-9cd2-2422ec2cbf9b", "holdTypeName": "案例讨论会"},
                    {"holdTypeId": "1d56799e-6d5c-450c-8ba0-fc2f56dcdbed", "holdTypeName": "大查房"},
                    {"holdTypeId": "1d3f2c3a-0c87-4226-b10d-9beb00aa3864", "holdTypeName": "其他"}
                ];
            } else if ('unit' === uod) {
                htArr = [
                    {"holdTypeId": "2f3a1a6f-925e-47fc-aadc-9fa70c2464bb", "holdTypeName": "学术报告"},
                    {"holdTypeId": "5a6a6977-0faf-43f1-b67f-de1bdea10fbc", "holdTypeName": "专题讲座"},
                    {"holdTypeId": "2a808fac-14d4-4c23-9b5c-8e0e7b246f6f", "holdTypeName": "技术操作示教"},
                    {"holdTypeId": "e2706ddf-a843-437e-8681-df6daa2330b0", "holdTypeName": "手术示范"},
                    {"holdTypeId": "5939b8b4-6cfb-45c3-9d72-88284eeb913b", "holdTypeName": "新技术推广"},
                    {"holdTypeId": "1d3f2c3a-0c87-4226-b10d-9beb00aa3864", "holdTypeName": "其他"}
                ];
            }
            htArr.forEach((holdType, index) => {
                $('#holdTypeSelector').append(new Option(holdType.holdTypeName, holdType.holdTypeId));
            });
            form.render("select");
        },
        renderScoreLevel: function () {
            let arr = this.getSl();
            if (arr.length > 0) {
                let $slSel = $("#scoreLevelSelector");
                $slSel.append(arr.map(sl => `<option value="${sl.scoreLevelId}">${sl.scoreLevelName}</option>`).join(''));
            } else {
                lat.renderScoreLevel('#scoreLevelSelector', only_year(), '_1_')
            };
        },
        getSl: function () {
            if ('061048' === _unitId) { // 内蒙古自治区医学会学术部
                return [{'scoreLevelId': '6926b861-5d4a-44af-8ca3-9f0a01000b93', 'scoreLevelName': '自治区级继续医学教育项目'}];
            }
            if ('061053' === _unitId) { // 内蒙古自治区护理学会
                return [
                    {'scoreLevelId': '6926b861-5d4a-44af-8ca3-9f0a01000b93', 'scoreLevelName': '自治区级推荐项目'},
                    {'scoreLevelId': '6f988fcd-1aed-46e8-81d5-9ecb00a6bb28', 'scoreLevelName': '单位组织活动（临床病理、案例讨论会、大查房）'},
                ];
            }
            let nmUnitIds = '061050,060124,060118,060052,060003,060119,060126,060125,060002,060122,060127,060257,061051,060120,060121,061047,060128';
            if (nmUnitIds.includes(_unitId)) {
                return [
                    {'scoreLevelId': '8bfb5dff-fbcb-46ee-aba0-a58e00ad9902', 'scoreLevelName': '盟／市级继续医学教育项目'},
                    {'scoreLevelId': '6f988fcd-1aed-46e8-81d5-9ecb00a6bb28', 'scoreLevelName': '单位组织活动（临床病理、案例讨论会、大查房）'},
                ];
            }
            if ('200077' === _unitId) {
                return [
                    {'scoreLevelId': 'b0aa8f29-fac3-4174-ac8a-9e7000b8f2aa', 'scoreLevelName': '其他Ⅱ类'},
                    {'scoreLevelId': 'adaa9cac-0792-4461-9d78-9c6f00e943d1', 'scoreLevelName': '科室组织的活动'},
                    {'scoreLevelId': 'a3f4af93-e123-4e4e-8e10-9c6f00e94109', 'scoreLevelName': '单位组织的活动'},
                ];
            }
            if (_isHunan) {
                return [{'scoreLevelId': 'bfe57fa8-deba-46a7-8fb4-a1480114dddb', 'scoreLevelName': '单位组织的学术活动'}];
            }
            if (_isZhejiang) {
                return [
                    {'scoreLevelId': 'e134ff1e-7b31-473c-a4b2-aa70009dc7ec', 'scoreLevelName': '单位组织的学术活动'},
                    {'scoreLevelId': '97f21982-4ce9-41d4-82fa-aa70009e0f01', 'scoreLevelName': '病例讨论会、多科室案例讨论会，大查房'},
                ];
            }
            return [];
        }
    }
    function loadGroupProj(projId) {
        let gproj = {};
        if (projId) {
            let visit = huayi_projectscore_url + 'pgsi/gproj/get/' + projId;
            getAction(visit).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    gproj = jsonRes.data;
                }
            }).catch(error => {
                layer.msg('error:加载院内活动');
            }).finally(() => {
                _g_fix.fixForm(gproj);
            });
        } else {
            _g_fix.fixForm(gproj);
        }
    }
    function saveGroupProj(groupProj, action) {
        if (_isNeimeng) {
            groupProj.score = 0.2;
            groupProj.period = 1;
        }
        if (_isNingxia) {
            groupProj.limitPerson = 50;
            if (Number(groupProj.period) <= 0) {
                layer.msg(_g_rule.periodRuleMsg());
                return false;
            }
        }
        let visit;
        if (groupProj.groupProjId) {
            visit = huayi_projectscore_url + 'pgsi/gproj/update';
            groupProj.userUpdate = _unitId;
        } else {
            visit = huayi_projectscore_url + 'pgsi/gproj/create';
            groupProj.userCreate = _unitId;
            groupProj.unitId = _unitId;
            groupProj.standardKindId = _standardKindId;
            if (!groupProj.period) groupProj.period = 0;
        }
        postAction(visit, groupProj).then((response) => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                gProjId = jsonRes.data.groupProjId;
                layer.msg('已保存院内活动');
                if (parent.closeModal) {
                    parent.closeModal();
                } else {
                    closeCurrModal();
                }
                if (0 === action) {
                    parent.refreshTable();
                } else if (1 === action) {
                    let cmeYear = $("#cmeYearSelector").val();
                    parent.showCycleModal(gProjId, groupProj.period, cmeYear);
                }
            } else {
                lat.failMsg('fail');
            }
        }).catch((error) => {
            layer.msg("error:保存院内活动");
        });
    }
});
