layui.config({
    base: '/js/layui/ext/'
}).extend({
    xmSelect: 'xm-select',
    lat: 'lat'
}).use(['table', 'layer', 'jquery', 'form', 'laydate', 'xmSelect', 'lat'], function () {
    let table = layui.table, layer = layui.layer, form = layui.form, laydate = layui.laydate, dropdown = layui.dropdown, $ = layui.jquery, xmSelect = layui.xmSelect, lat = layui.lat;
    let gLayerIndex = -1;
    let gTitleTreeData;
    let gTitleTreeSelector;
    let gSpecTreeData;
    let gSpecTreeSelector;
    let gLayero;
    const _pdfstates = '153,171,172';
    const _scoreStateEnum = {
        '0': '未提交',
        '123': '已提交',
        '143': '地市审核通过',
        '153': '省委审核通过',
        '122': '审核不通过',
        '161': '未提交', // '推送成功',
        '162': '未提交', // '推送失败',
        '171': '提交人社成功',
        '172': '提交人社失败',
        Z_NOT: 0,
        Z_YET: 123,
        Z_CITY_OK: 143,
        Z_PROVINCE_OK: 153,
        Z_REJECT: 122,
    };
    window.refreshTable = refreshTable;
    window.canSubmit = canSubmit;
    window.adjustModalHeight = adjustModalHeight;
    window.exportPdfMulti = exportPdfMulti;
    $(function () {
        lat.verifyTenancy(_isQinghai);
        watermark.set('青海省继续医学教育委员会');
        renderTable();
    });
    layer.ready(function () {
        lat.renderCmeYear('select[name="cmeYear"]');
        lat.renderTitleLevelSelector('select[name="titleLevelId"]');
        fixpage(true);
        // cmeYears
        // Array.from(Array(5)).map((n, i) => selYear - i).join(',')
        let begin = moment().year();
        let str = '';
        for (let i = 0; i < 5; ++i) {
            let year = begin - i;
            let checked = i < 3 ? "checked" : "";
            str += `<input type="checkbox" name="cmeYear[${year}]" value="${year}" title="${year}" ${checked} lay-skin="primary" lay-filter="cmeYearCheckBox">`;
        }
        $('#year_checkbox_container').append(str);
        form.render('checkbox');
        gSpecTreeData = JSON.parse(localStorage.getItem('kk_depttree') || '[]');
        gSpecTreeSelector = lat.renderSpecTreeSelector('#specTreeSelector', gSpecTreeData, {
            radio: false,
            clickClose: false,
            model: {
                icon: 'show'
            },
            tree: {
                strict: true
            }
        });
        // title
        getTitleTreeData().then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                gTitleTreeData = jsonRes.data;
            }
        }).catch(error => {
            lat.errorMsg('error:加载titleTreeData');
        }).finally(() => {
            gTitleTreeSelector = lat.renderTitleTreeSelector('#titleTreeSelector', gTitleTreeData, {
                radio: false,
                clickClose: false,
                model: {
                    icon: 'show'
                },
                tree: {
                    strict: true
                }
            });
        });
    });
    table.on('tool(qhcTable)', function (obj) {
        let rowData = obj.data;
        if ('submit' === obj.event) {
            layer.confirm('确定要提交该人员吗？', {
                title: '提示',
                btn: ['确定', '取消']
            }, function () {
                // confirm
                dosubmit(rowData.comPersonId, rowData.cmeYear);
                layer.closeAll();
            }, function () {
                // cancel
            });
        } else if ('glance' === obj.event) {
            showCheckStepModal(rowData.cmeYear, rowData.comPersonId, getOrDefault(rowData.id, PseudoNull.UUID));
        } else if ('scoreDetail' === obj.event) {
            showScoreDetailModal(rowData.comPersonId);
        }
    });
    table.on('toolbar(qhcTable)', function (obj) {
        let checkStatus = table.checkStatus(obj.config.id);
        let selectedRowArr = checkStatus.data;
        let ckcourseids = selectedRowArr.filter(row => !canCheck(row)).map(item => item.id).join(',');
        let ckpids = selectedRowArr.filter(row => !canCheck(row)).map(item => item.comPersonId).join(',');
        if ('pass_excel' === obj.event) {
            let cmeYear = $('select[name="cmeYear"]').val();
            let filename = cmeYear + '年度审验通过人员.xlsx';
            let params = {unitId: _unitId, depth: _depth, cmeYear: cmeYear, scoreStates: _pdfstates,};
            doexcel(params, filename);
        } else if ('all_excel' === obj.event) {
            let cmeYear = $('select[name="cmeYear"]').val();
            let filename = cmeYear + '年度人员列表.xlsx';
            let params = {unitId: _unitId, depth: _depth, cmeYear: cmeYear,};
            doexcel(params, filename);
        } else if ('exportPdf' === obj.event) {
            let comPersonIds = selectedRowArr.filter(row => !canpdf(row)).map(item => item.comPersonId).join(',');
            if (!comPersonIds) {
                lat.failMsg('先选择要导出的人员');
                return false;
            }
            exportPdf(comPersonIds);
        } else if ('submitbatch' === obj.event) {
            let submitpids = selectedRowArr.filter(row => !canSubmit(row)).map(item => item.comPersonId).join(',');
            if (!submitpids) {
                lat.failMsg('先选择要提交的人员');
                return false;
            }
            dosubmit(submitpids, $('select[name="cmeYear"]').val());
        } else if ('pushBatch' === obj.event) {
            setRds();
        } else if ('approve' === obj.event) {
            if (!ckpids) {
                lat.failMsg('先选择要审核的人员');
                return false;
            }
            layer.confirm('确定要审核通过吗？', {
                title: '提示',
                btn: ['确定', '取消']
            }, function () {
                // confirm
                docheck(ckcourseids, true, null, ckpids);
                layer.closeAll();
            }, function () {
                // cancel
            });
        } else if ('back' === obj.event) {
            if (!ckpids) {
                lat.failMsg('先选择要审核的人员');
                return false;
            }
            layer.prompt({title: '不通过原因',}, function (value, index, elem) {
                if (value) {
                    docheck(ckcourseids, false, value, ckpids);
                    layer.close(index);
                } else {
                    lat.failMsg('请输入不通过原因');
                    return false;
                }
            });
        }
    });
    function renderTable() {
        let visit = huayi_sjwh_url + 'audit/qinghai/person/page/last';
        table.render({
            id: 'qhcTable',
            elem: '#qhcTable',
            height: 'full-255',
            url: visit,
            method: 'post',
            contentType: 'application/json',
            headers: {
                'Authorization': localStorage.getItem('token'),
                'KJPT-USER-ID': localStorage.getItem('user-id')
            },
            where: getSifter(),
            page: true,
            limit: 10,
            limits: [10, 50, 100, 150, 200],
            toolbar: '#qhcTableToolbar',
            defaultToolbar: [],
            parseData: function (res) {
                let a = {
                    'code': res.status === 200 ? 0 : res.status, // 解析接口状态
                    'msg': res.message, // 解析提示文本
                    'count': res.data.recordsTotal, // 解析数据长度
                    'data': res.data.records, // 解析数据列表
                    'page': res.data.pageNum, // 当前页
                    'limit': res.data.pageSize // 每页条数
                };
                return a;
            },
            request: {
                pageName: 'pageNum',  // 页码的参数名称，默认：page
                limitName: 'pageSize'  // 每页数据量的参数名，默认：limit
            },
            cols: [[
                {
                    title: '选择', width: 60, align: 'center', fixed: 'left', hide: _isUnit, templet: (data) => {
                        // gov: check pdf
                        let msg1 = canCheck(data);
                        let msg2 = canpdf(data);
                        let tip = '';
                        if (msg1) tip += `不能审核(${msg1})|`;
                        if (msg2) tip += `不能导出(${msg2})`;
                        return `<input type="checkbox" name="layTableCheckbox" lay-skin="primary" data-tip="${tip}" onmouseenter="showTips(this)" onmouseleave="closeTips()">`;
                    }
                },
                {
                    title: '选择', width: 60, align: 'center', fixed: 'left', hide: _isGov, templet: (data) => {
                        // unit: submit pdf
                        let msg1 = canSubmit(data);
                        let msg2 = canpdf(data);
                        let tip = '';
                        if (msg1) tip += `不能提交(${msg1})|`;
                        if (msg2) tip += `不能导出(${msg2})`;
                        return `<input type="checkbox" name="layTableCheckbox" lay-skin="primary" data-tip="${tip}" onmouseenter="showTips(this)" onmouseleave="closeTips()">`;
                    }
                },
                {title: '审核步骤', minWidth: 86, align: 'center', fixed: 'left', templet: '#checkStepCell'},
                {title: '学分明细', minWidth: 90, align: 'center', fixed: 'left', templet: '#scoreDetailCell'},
                {field: 'totalScore', title: '专业课学分', minWidth: 115, align: 'center', sort: true},
                {field: 'totalPeriod', title: '专业课学时', minWidth: 115, align: 'center', sort: true},
                {field: 'periodPc', title: '公需课学时', minWidth: 115, align: 'center', sort: true},
                {field: 'periodPcAddTime', title: '公需课学时更新时间', minWidth: 166, align: 'center', sort: true},
                {
                    field: 'totalPeriodWithPc',
                    title: '总学时',
                    minWidth: 90,
                    align: 'center',
                    sort: true,
                    templet: (data) => accAdd(data.totalPeriod, data.periodPc ? data.periodPc : 0)
                },
                {
                    field: 'passResult',
                    title: '达标情况',
                    minWidth: 102,
                    align: 'center',
                    sort: true,
                    templet: (data) => PassResultEnum[data.passResult]
                },
                {field: 'personNo', title: '人员编号', minWidth: 120, align: 'center', sort: true},
                {field: 'personName', title: '姓名', minWidth: 120, align: 'center', sort: true},
                {field: 'desCertId', title: '证件号', minWidth: 143, align: 'center', sort: true},
                {field: 'specName', title: '专业', minWidth: 120, align: 'center', sort: true},
                {field: 'titleLevelName', title: '职称级别', minWidth: 120, align: 'center', sort: true},
                {field: 'titleName', title: '职称', minWidth: 120, align: 'center', sort: true},
                {field: 'unitName', title: '单位', minWidth: 220, align: 'center', sort: true, hide: _isUnit},
                {field: 'deptName', title: '科室', minWidth: 130, align: 'center', sort: true},
                {field: 'synced', title: '公需课同步状态', minWidth: 143, align: 'center', sort: true, templet: (data) => (1 === data.synced ? '已同步' : '未同步')},
                {
                    field: 'scoreState', title: '推送状态', minWidth: 130, align: 'center', sort: true, templet: data => {
                        let v = data.statex.split('')[4];
                        return {'x': '未推送', '1': '推送成功', '2': '推送失败'}[v];
                    }
                },
                {
                    field: 'scoreState', title: '年度审验状态', minWidth: 130, align: 'center', sort: true, templet: data => {
                        let state = (undefined === data.scoreState) ? '0' : String(data.scoreState);
                        let xa = data.statex.split('');
                        if ('161,162'.includes(state)) {
                            if ('3' === xa[0]) state = '123';
                            if ('3' === xa[2]) state = '143';
                            if ('3' === xa[3]) state = '153';
                        }
                        return _scoreStateEnum[state];
                    }
                },
                {field: 'opinion', title: '审核意见', minWidth: 160, align: 'center', sort: false},
                {field: '', title: '提交人社系统失败原因', minWidth: 186, align: 'center', sort: false}
            ]],
            data: [{
                "personNo": "0501541234",
                "personName": "六个字的名字",
                "score": 6,
                "period": 3.6,
                "period2": 6.7,
                "passResult": "不达标"
            }, {
                "personNo": "0501541234",
                "personName": "六个字的名字",
                "score": 6,
                "period": 3.6,
                "period2": 6.7,
                "passResult": "不达标"
            }],
            done: function (res, curr, count) {
                fixpage();
                getRds();
                bindtip();
            }
        });
    }
    function refreshTable(ec) {
        let c = {where: getSifter()};
        ec ? $.extend(true, c, ec) : '';
        table.reload('qhcTable', c);
    }
    function bindtip() {
        $('input[type=checkbox][data-tip]').each(function () {
            let tip = $(this).data('tip');
            if (tip) {
                $(this).parent().mouseenter(function () {
                    gLayerIndex = layer.tips(tip, this, {tips: [2, '#808080']});
                }).mouseleave(function () {
                    layer.close(gLayerIndex);
                });
            }
        });
    }
    function fixpage(init) {
        if (_isGov) {
            $('#govToolbar').show();
            $('#unitToolbar').hide();
            _isGovProvince && $('.only_province').css("display", "inline-block");
            init && _isGovCity && $('select[name=scoreState2]').next().find('dd[lay-value=0]').click();
        } else {
            $('#govToolbar').hide();
            $('#unitToolbar').show();
            $('select[name=scoreState2]').next().find('dd[lay-value=0]').remove();
        }
    }
    function getSifter() {
        let s1 = $('select[name=scoreState1]').val();
        let s2 = $('select[name=scoreState2]').val();
        let arr = ['_', '_', '_', '_', '_', '_'];
        if (s1) arr[4] = s1;
        if (s2) {
            if ('0' === s2) arr[_uut - 2] = '0'; // 待本级审核
            if ('x' === s2) arr[0] = 'x'; // 未提交
            if ('123' === s2) arr[0] = '3'; // 单位提交
            if ('143' === s2) arr[2] = '3'; // 地市通过
            if ('153' === s2) arr[3] = '3'; // 省厅通过
            if ('171' === s2) arr[5] = '1'; // 提交人社完成
            if ('172' === s2) arr[5] = '2'; // 提交人社失败
        }
        let state = null;
        let statex = arr.join('');
        if ('122' === s2) state = 122;
        return {
            unitId: pickUnitId(_unitId),
            depth: getDepthPlus(),
            cmeYear: $('select[name="cmeYear"]').val(),
            personNo: $('input[name="personNo"]').val(),
            personName: $('input[name="personName"]').val(),
            certId: $('input[name="certId"]').val(),
            deptName: $('input[name="deptName"]').val(),
            titleLevelId: $('select[name=titleLevelId]').val(),
            titleIds: idsFromTreeStrict(gTitleTreeSelector, 'titleId'),
            specIds: idsFromTreeStrict(gSpecTreeSelector, 'personSpecId'),
            passResult: Number.parseInt($('select[name="passResult"]').val()),
            scoreState: state, // Number.parseInt($('select[name="score_state"]').val()),
            scoreStates: null, // '2,3,5',
            // state1: 0,
            // state2: 999,
            statex: '______' === statex ? null : statex,
            synced: $('select[name="synced"]').val(),
        };
    }
    function canSubmit(course) {
        // 只有学分达标并且专业课学时达到90的记录才能提交
        if (1 !== course.passResult) return '不达标';
        if (course.totalPeriod < 75) return '专业课学时低于75';
        let bys = function () {
            let state = course.scoreState || 0;
            if (state >= 123) {
                if ([161, 162].includes(state)) return '';
                return '已提交';
            }
            return '';
        }
        let byx = function () {
            let xa = (course.statex || 'xxxxxx').split('');
            if ('3' === xa[0]) return '已提交';
            return '';
        }
        return byx();
    }
    function canCheck(course) {
        let passResult = course.passResult;
        let totalPeriod = course.totalPeriod;
        if (1 !== passResult) return '不达标';
        if (totalPeriod < 75) return '专业课学时低于75';
        let bys = function () {
            let state = course.scoreState || 0;
            if (state === _scoreStateEnum.Z_REJECT) return '审核不通过'
            if ([0, 161, 162].includes(state)) return '未提交';
            let isphu = (course.unitUserType === UnitUserTypeEnum.UNIT) && ('630000,630946'.includes(course.parentUnit));
            if (isphu) {
                return '';
            } else {
                let l = 100 + (_uut - 1) * 10 + 3;
                let u = 100 + _uut * 10 + 3;
                if (_isGovCity) l = l - 10;
                if (state < l) return '下级审核中';
                if (state > u) return '本级已审核';
            }
            return '';
        }
        let byx = function () {
            let xa = (course.statex || 'xxxxxx').split('');
            if ('3' !== xa[0]) return '未提交';
            if ('x' === xa[_uut - 2]) return '下级审核中';
            if ('2' === xa[_uut - 2]) return '已审核不通过';
            if ('3' === xa[_uut - 2]) return '已审核通过';
            if ('0' === xa[_uut - 2]) return '';
            return '';
        }
        return byx(); // true
    }
    function docheck(courseIds, approve, opinion, pids) {
        _vv.do_check2(courseIds, approve, opinion, pids);
    }
    function dosubmit(pids, year) {
        _vv.do_submit2(pids, year);
    }
    function canpdf(course) {
        if (!course.photo) {
            return '人员无照片'; // false;
        }
        const scoreState = Number(course.scoreState);
        if (!_pdfstates.includes(scoreState)) {
            return '省厅审核通过后可导出'; // false
        }
        return ''; // true
    }
    const _vv = {
        do_submit: function (comPersonId, cmeYear) {
            let visit = huayi_sjwh_url + 'audit/qinghai/submit';
            let params = {
                comPersonId: comPersonId,
                cmeYear: cmeYear,
                scoreDate: 0,
                unitId: _unitId,
                unitName: _unitName
            };
            postAction(visit, params).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    lat.okMsg('已提交');
                    refreshTable();
                }
            }).catch(error => {
                lat.errorMsg('error:提交失败');
            }).finally(() => {
            });
        },
        do_submit2: function (comPersonIds, cmeYear) {
            let visit = `${this.durl()}/qhrs/test/submit`;
            let isphu = '1' === (localStorage.getItem('unit-pc') || '00').split('')[0];
            postAction(visit, {'cmeYear': cmeYear, 'comPersonIds': comPersonIds, 'phu': isphu}).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    lat.okMsg('已提交');
                    refreshTable();
                }
            }).catch(error => {
                lat.errorMsg('error:提交失败');
            });
        },
        do_check: function (courseIds, approve, opinion, pids) {
            let visit = huayi_sjwh_url + 'audit/qinghai/check';
            let s = 122;
            if (approve) s = 100 + _uut * 10 + 3;
            let params = {
                courseIds: courseIds,
                checkState: s,
                opinion: opinion,
                unitId: _unitId,
                unitName: _unitName,
            };
            postAction(visit, params).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    refreshTable();
                }
            }).catch(error => {
                lat.errorMsg('error:审核失败');
            }).finally(() => {
            });
        },
        do_check2: function (courseIds, approve, opinion, pids) {
            let visit = `${this.durl()}/qhrs/test/check`;
            let state = 122, desc = '', xv = '2', xi = _uut - 1, xl = 1;
            if (approve) {
                state = 100 + _uut * 10 + 3;
                desc = '审核通过';
                xv = '30';
                xl = 2;
                if (_isGovProvince) {
                    xv = '3';
                    xl = 1;
                }
            }
            let params = {
                'cmeYear': $('select[name="cmeYear"]').val(),
                'comPersonIds': pids,
                'state': state, // scoreState
                'xv': xv,
                'xi': xi, // 省厅idx=3
                'xl': xl,
                'stateDesc': desc,
                'opinion': opinion,
                'unitId': _unitId,
                'unitName': _unitName,
                'totalPeriod1': 0,
                'totalPeriod2': 999,
                'limit': pids.split(',').length
            };
            postAction(visit, params).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    refreshTable();
                }
            }).catch(error => {
                lat.failMsg('error:审核失败');
            }).finally(() => {
            });
        },
        durl: function () {
            let dev = 'http://localhost:10086';
            let test = 'https://testkjpt.wsglw.net/qhwyapi';
            let prod = 'https://kjpt.wsglw.net/qhwyapi';
            if (_pdp.includes('localhost')) return test;
            if (_pdp.includes('testkjpt.wsglw.net')) return test;
            if (_pdp.includes('192.168.1.165')) return test;
            if (_pdp.includes('kjpt.wsglw.net')) return prod;
            return dev;
        },
    }
    function setRds() {
        postAction(`${huayi_sjwh_url}audit/qinghai/setkey`, {'key': 'kjpt:qinghai:renshe:push1', 'val': '123'}).then(response => {
            $('#push_btn').text('正在推送').attr('disabled', 'true').addClass('layui-btn-disabled');
        });
    }
    function getRds() {
        if ('630000' === _unitId) {
            postAction(`${huayi_sjwh_url}audit/qinghai/getkey`, {'key': 'kjpt:qinghai:renshe:push1'}).then(response => {
                let val = response.data.data;
                if (val) {
                    $('#push_btn').text('正在推送').attr('disabled', 'true').addClass('layui-btn-disabled');
                } else {
                    $('#push_btn').text('推送').removeClass('layui-btn-disabled').removeAttr("disabled");
                }
            });
        }
    }
    function doexcel(params, filename) {
        let visit = huayi_sjwh_url + 'audit/qinghai/exportList';
        gLayerIndex = layer.msg('下载中....', {icon: 4, shade: [0.1, '#fff']});
        downloadFile(visit, params, filename).finally(() => {
            layer.close(gLayerIndex);
        });
    }
    function exportPdfMulti() {
        let cmeYears = checkboxVals('cmeYear');
        if (!cmeYears) {
            lat.failMsg('请选择年度');
            return false;
        }
        if (cmeYears.length > (5 * 5 - 1)) {
            lat.failMsg('最多选择五个年度');
            return false;
        }
        let checkStatus = table.checkStatus('qhcTable');
        let selectedRowArr = checkStatus.data;
        let comPersonIds = selectedRowArr.filter(row => !canpdf(row)).map(item => item.comPersonId).join(',');
        if (comPersonIds.length < 1) {
            lat.failMsg('先选择要导出的人员');
            return false;
        }
        if (comPersonIds.length > 36) {
            lat.failMsg('最多选择一个人员');
            return false;
        }
        exportPdf(comPersonIds, cmeYears);
    }
    function exportPdf(comPersonIds, cmeYears) {
        let visit = huayi_sjwh_url + 'audit/pdf/down'; // 青海-1 comPersonIds
        let selYear = $('select[name="cmeYear"]').val();
        selYear = toNum(selYear);
        let params = {
            'pdfType': 1, // year
            'standardKindId': _standardKindId,
            'comPersonIds': comPersonIds,
            'cmeYear': selYear,
            'cmeYears': getOrDefault(cmeYears, selYear),
            'unitId': _unitId,
            'depth': _depth
        }
        lat.downloadWithProgress(visit, params, '学习档案.pdf');
    }
    function showScoreDetailModal(comPersonId) {
        let cmeYear = $('select[name=cmeYear]').val();
        gLayerIndex = layer.open({
            type: 2,
            shade: 0.4,
            shadeClose: true,
            title: '学分明细',
            //content: './modals/AuditScoreDetailModal.html?comPersonId=' + comPersonId + '&cmeYear=' + cmeYear + '&ia=14',
            content: '/pages/score/proj_statistics/personScoreStatistics.html?personId=' + comPersonId + '&cmeYear=' + cmeYear,
            area: ['100%', '100%']
        });
    }
    function showCheckStepModal(cmeYear, comPersonId, courseId) {
        gLayerIndex = layer.open({
            type: 2,
            shade: 0.4,
            shadeClose: true,
            title: '审核步骤',
            content: `./modals/qinghaiStep.html?cmeYear=${cmeYear}&comPersonId=${comPersonId}&courseId=${courseId}`,
            area: ['850px', '420px'],
            success: function (layero, index) {
                gLayero = layero;
            },
            end: function () {
                gLayero = null;
            }
        });
    }
    function adjustModalHeight() {
        let iframe = $(gLayero).find('iframe');
        let titleHeight = $(gLayero).find('.layui-layer-title').height();
        let iframeHeight = iframe[0].contentDocument.body.scrollHeight;
        let height = iframeHeight + titleHeight;
        if (window.innerHeight * 0.85 > height) {
            $(gLayero).css('height', height);
            iframe.css('height', iframeHeight);
        } else {
            $(gLayero).css('height', '85%');
            iframeHeight = $(gLayero).height() - titleHeight;
            iframe.css('height', iframeHeight);
        }
    }
});