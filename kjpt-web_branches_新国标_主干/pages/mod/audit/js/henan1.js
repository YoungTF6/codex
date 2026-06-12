layui.config({
    base: '/js/layui/ext/'
}).extend({
    xmSelect: 'xm-select',
    lat: 'lat'
}).use(['table', 'layer', 'jquery', 'form', 'laydate', 'element', 'xmSelect', 'lat'], function () {
    let {table, layer, form, laydate, dropdown, element, $, xmSelect, lat} = layui;
    let gLayerIndex = -1, gTitleTreeData, gTitleTreeSelector, gDeptTreeSelector, gDeptTreeData, gFlowChainId, gFlowChainState;
    let gFlowId = '5db82abb-11e3-8ba3-534c-2d50befe7e12';
    let gFactorArr = ['is_citial_hospital'];
    const _stateEnum = {
        '0': '未审核',
        '1': '退回',
        '2': '审核不通过',
        '3': '审核通过',
        '4': '审核中',
        '91': '已上报',
        '92': '撤回',
        '99': '已推送人社',
        'code': {
            'NOT': 0,
            'PENDING': 4,
            'BACK': 1,
            'REJECT': 2,
            'APPROVE': 3,
            'REPORT': 91,
            'RECALL': 92,
            'PUSH_FAIL': 98,
            'PUSH_OK': 99,
        }
    }
    window.refreshAuditTable = refreshAuditTable;
    window.canRecall = canRecall;
    window.canPushAgain = canPushAgain;
    layer.ready(function () {
        lat.verifyTenancy(_isHenan);
        watermark.set('河南省卫生健康委员会');
        // setmedicaltype();
        lat.renderTitleLevelSelector('select[name=titleLevel]');
        renderPersonState('select[name=personStateId]');
        renderTitle();
        if (!_isGov) {
            renderDept();
        }
        fixPage();
        setTimeout(function () {
            renderAuditTable();
        }, 200);
    });
    function renderTitle() {
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
                }
            };
            gTitleTreeSelector = lat.renderTitleTreeSelector('#titleTreeSelector', gTitleTreeData, conf);
        });
    }
    function renderDept() {
        getDeptTreeData(_unitId, 9).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                gDeptTreeData = jsonRes.data;
                gDeptTreeSelector = lat.renderDeptTreeSelector('#deptIdSelector', gDeptTreeData);
            }
        }).catch(error => {
            layer.msg('error:加载deptTreeData');
        }).finally(() => {
            //
        });
    }
    function doflowreport(selRowArr, cmeYear, comPersonIds, category) {
        if (!comPersonIds) {
            lat.failMsg('先选择要上报的数据');
            return false;
        }
        let visit = huayi_flow_url + 'comFlowApi/getProjectBatchSubmitInfo';
        let params = {
            "operate": 2,
            "flowId": gFlowId,
            "unitId": _unitId,
            "batchData": [{
                "project_id": "1e6e46b9-4ea6-470f-bd3e-0f97b1e79202",
                "score_level_id": "d37793f1-e9cd-4ac5-87f4-9f89010da0f6",
                "is_provincial_hospital": _isPhUnit.toString(),
                "is_citial_hospital": _isChUnit.toString()
            }]
        };
        postAction(visit, params).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                let item = jsonRes.data[0];
                gFlowChainId = item.flowChainId;
                gFlowChainState = item.flowChainState;
                if (null === gFlowChainId || '' === gFlowChainId || 'undefined' === gFlowChainId || 'null' === gFlowChainId) {
                    lat.failMsg('该地市未配置上报流程，暂时无法上报');
                } else {
                    doreport(selRowArr, cmeYear, comPersonIds, category);
                }
            } else {
                lat.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            lat.errorMsg('error: flow report');
        });
    }
    function doreport(selRowArr, cmeYear, comPersonIds, category) {
        let flowIdentifierList = [];
        selRowArr.forEach(row => {
            flowIdentifierList.push({
                'comPersonId': row.comPersonId,
                'flowChainId': gFlowChainId,
                'flowChainState': gFlowChainState,
                'statex': 'xxxx',
            });
        });
        let visit = huayi_sjwh_url + 'audit/henan/report';
        let params = {
            'cmeYear': cmeYear,
            'comPersonIds': comPersonIds,
            'category': category,
            'unitId': _unitId,
            'userId': _userId,
            'phUnit': _isPhUnit,
            'chUnit': _isChUnit,
            'flowIdentifierList': flowIdentifierList
        };
        postAction(visit, params).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                lat.okMsg('已上报');
            } else {
                lat.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            lat.errorMsg(getErrorMsg(error, 'error:上报'));
        }).finally(() => {
            refreshAuditTable();
        });
    }
    function dorecall(entryId) {
        let visit = huayi_sjwh_url + 'audit/henan/recall';
        let params = {
            'entryId': entryId,
            'unitId': _unitId,
            'userId': _userId,
            'statex': 'xxxx',
        };
        postAction(visit, params).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                lat.okMsg('已撤回');
            } else {
                lat.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            lat.errorMsg(getErrorMsg(error, 'error:撤回'));
        }).finally(() => {
            refreshAuditTable();
        });
    }
    function check(selRowArr, state, opinion) {
        if (!selRowArr || (selRowArr.length < 1)) {
            lat.failMsg('先选择要审核的数据');
            return false;
        }
        if (_stateEnum.code.APPROVE === state) {
            // approve
            doflowcheck(selRowArr);
        } else if (_stateEnum.code.BACK === state) {
            // back
            let flowIdentifierList = [];
            selRowArr.forEach(row => {
                flowIdentifierList.push({
                    'entryId': row.entryId,
                    'flowChainId': row.flowChainId,
                    'flowChainState': _uut * 10 + state,
                    'state': state,
                    'statex': 'xxxx',
                });
            });
            docheck(false, selRowArr, flowIdentifierList, opinion);
        }
    }
    function doflowcheck(selRowArr) {
        let dataList = selRowArr.map(row => {
            return {
                'businessId': row.entryId,
                'flowChainId': row.flowChainId,
                'flowChainState': row.flowChainState,
            };
        });
        let visit = huayi_flow_url + 'comFlowApi/getCheckInfoBatch';
        let params = {
            "operate": 2,
            "dataList": dataList
        };
        postAction(visit, params).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                let itemList = jsonRes.data;
                let flowIdentifierList = [];
                itemList.forEach(item => {
                    flowIdentifierList.push({
                        'entryId': item.businessId,
                        'flowChainId': item.flowChainId,
                        'flowChainState': item.flowChainState,
                        'state': item.checkState
                    });
                });
                docheck(true, selRowArr, flowIdentifierList, null);
            } else {
                lat.failMsg('error:流程错误,' + jsonRes.msg);
            }
        }).catch(error => {
            lat.errorMsg('error:approveCheckFlow');
        }).finally(() => {
        });
    }
    function docheck(approve, selRowArr, flowIdentifierList, opinion) {
        let entryIds = selRowArr.map(row => row.entryId).join(',');
        let params = {
            'entryIds': entryIds,
            'flowIdentifierList': flowIdentifierList,
            'opinion': opinion,
            'unitId': _unitId,
            'userId': _userId,
        };
        let visit = huayi_sjwh_url + 'audit/henan/check';
        postAction(visit, params).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                lat.okMsg('审核完成');
            } else {
                lat.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            lat.errorMsg('error:审核');
        }).finally(() => {
            if (approve && isFinalUnit()) {
                dopushbatch(selRowArr);
                // if (isFinalUnitZhengzhou2023($('select[name=cmeYear]').val())) {
                //     //
                //     console.info('zhengzhou 2023 not push');
                // } else {
                //     dopushbatch(selRowArr);
                // }
            } else {
                layer.close(gLayerIndex);
                refreshAuditTable();
            }
        });
    }
    function isFinalUnit() {
        const finalUnitIds = ''//
                + '160100,' // 郑州市卫生健康委员会
                + '160025,' // 郑州市中医管理局
                + '160116,' // z-登封市卫生健康委员会
                + '160117,' // z-巩义市卫生健康委员会
                + '160118,' // z-新密市卫生健康委员会
                + '160119,' // z-新郑市卫生健康委员会
                + '160120,' // z-中牟县卫生健康委员会
                + '160121,' // z-荥阳市卫生健康委员会
                + '160122,' // z-金水区卫生健康委员会
                + '160123,' // z-中原区卫生健康委员会
                + '160124,' // z-二七区卫生健康委员会
                + '160125,' // z-惠济区卫生健康委员会
                + '160126,' // z-管城区卫生健康委员会
                + '160127,' // z-高新区卫生健康委员会
                + '160228,' // z-郑东新区卫生健康委员会
                + '160229,' // z-上街区卫生健康委员会
                + '160230,' // z-航空港区卫生健康委员会
                + '160231,' // z-郑州市经开区卫生健康委员会
                + '163686,' // z-郑州卫生健康职业学院（管理）
                + '160088,' // 平顶山市卫生健康委
                + '162900,' // 平顶山市卫健委
                + '160700,' // 许昌市卫生健康委员会
                + '162700,' // 漯河市卫生健康委员会
            // + '161300,' // 鹤壁市卫生健康委员会
        ;
        return finalUnitIds.includes(_unitId);
    }
    function isFinalUnitZhengzhou2023(cmeYear) {
        let is2023 = toNum(cmeYear) === 2023;
        let finalUnitIds = ''//
            + '160100,' // 郑州市卫生健康委员会
            + '160025,' // 郑州市中医管理局
            + '160116,' // 登封市卫生健康委员会
            + '160117,' // 巩义市卫生健康委员会
            + '160118,' // 新密市卫生健康委员会
            + '160119,' // 新郑市卫生健康委员会
            + '160120,' // 中牟县卫生健康委员会
            + '160121,' // 荥阳市卫生健康委员会
            + '160122,' // 金水区卫生健康委员会
            + '160123,' // 中原区卫生健康委员会
            + '160124,' // 二七区卫生健康委员会
            + '160125,' // 惠济区卫生健康委员会
            + '160126,' // 管城区卫生健康委员会
            + '160127,' // 高新区卫生健康委员会
            + '160228,' // 郑东新区卫生健康委员会
            + '160229,' // 上街区卫生健康委员会
            + '160230,' // 航空港区卫生健康委员会
            + '160231,' // 郑州市经开区卫生健康委员会
        ;
        return finalUnitIds.includes(_unitId) && is2023;
    }
    function dopushbatch(selRowArr) {
        if (!_pdp.includes('222.143.64.114:8016')) {
            return false;
        }
        let visit = 'http://222.143.64.114:8016/henanrs/henan/test/push';
        let params = {
            cmeYear: $('select[name=cmeYear]').val(),
            comPersonIds: selRowArr.filter(row => toNum(row.passResult) === 1).map(row => row.comPersonId).join(',') + ',' + PseudoNull.UUID,
            operUnitId: _unitId,
        };
        postAction(visit, params).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                //
            } else {
                // lat.failMsg(jsonRes.message);
            }
        }).catch(error => {
            // lat.errorMsg('error:推送人社');
        }).finally(() => {
            refreshAuditTable();
        });
    }
    function dopushagain(cmeYear, comPersonId) {
        let visit = 'http://222.143.64.114:8016/henanrs/henan/test/push';
        let params = {
            cmeYear: cmeYear,
            comPersonIds: comPersonId,
            operUnitId: _unitId,
        };
        postAction(visit, params).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                lat.okMsg(jsonRes.result.resultInfo[0].resultInfo);
            } else {
                lat.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            lat.errorMsg('error:二次推送');
        }).finally(() => {
            // refreshAuditTable();
        });
    }
    table.on('tool(auditTable)', function (obj) {
        let rowData = obj.data;
        let comPersonId = rowData.comPersonId;
        let startDate = toYearHeader(rowData.cmeYear);
        let endDate = toYearTail(rowData.cmeYear);
        let cs = '';
        if ('detail' === obj.event) {
            // console.info('详细情况明细');
            layer.open({
                type: 2,
                title: '详细情况明细',
                content: `../../score/proj_statistics/personScoreStatistics.html?personId=${comPersonId}&startDt=${startDate}&endDt=${endDate}&checkState=${cs}`,
                btn: ['关闭'],
                btnAlign: 'c',
                skin: '',
                yes: function () {
                    layer.closeAll();
                },
                area: ['100%', '100%']
            });
        } else if ('collect' === obj.event) {
            // console.info('各类学分汇总');
            layer.open({
                type: 2,
                title: '各类学分汇总',
                content: `../../score/proj_statistics/personScoreDetails.html?personId=${comPersonId}&startDt=${startDate}&endDt=${endDate}&checkState=${cs}`,
                btn: ['关闭'],
                btnAlign: 'c',
                yes: function () {
                    layer.closeAll();
                },
                area: ['100%', '100%'],
                // end: function(index, layero){
                //     loaderTable();
                // }
            })
        } else if ('recall' === obj.event) {
            dorecall(rowData.entryId);
        } else if ('pushAgain' === obj.event) {
            dopushagain($('select[name=cmeYear]').val(), rowData.comPersonId);
        } else if ('showstep' === obj.event) {
            layer.open({
                type: 2,
                shade: 0.4,
                shadeClose: true,
                title: '审核记录',
                content: `./modals/henanstep.html?cmeYear=${rowData.cmeYear}&personNo=${rowData.personNo}`,
                area: ['850px', '420px'],
                success: function (layero, index) {
                },
                end: function () {
                }
            });
        }
    });
    table.on('toolbar(auditTable)', function (obj) {
        let event = obj.event;
        let checkStatus = table.checkStatus(obj.config.id);
        let selectedRowArr = checkStatus.data;
        selectedRowArr = selectedRowArr.filter(row => {
            if (_isGov) {
                let msg = canCheck(row);
                return msg === '';
            } else {
                let msg = canReport(row);
                return msg === '';
            }
        });
        let selComPersonIds = selectedRowArr.map(row => row.comPersonId).join(',');
        let selEntryIds = selectedRowArr.map(row => row.entryId).join(',');
        let cmeYear = $('select[name=cmeYear]').val();
        // export
        ('exportList' === event) && console.info('导出列表');
        ('downpdf_c' === event) && loadExportPersonIds('c');
        ('downpdf_p' === event) && loadExportPersonIds('p');
        // report
        ('reportZh' === event) && doflowreport(selectedRowArr, cmeYear, selComPersonIds, 2);
        ('reportEn' === event) && doflowreport(selectedRowArr, cmeYear, selComPersonIds, 1);
        // check
        ('approve' === event) && check(selectedRowArr, _stateEnum.code.APPROVE);
        if ('back' === event) {
            if (!selEntryIds) {
                lat.failMsg('先选择要审核的数据');
                return false;
            }
            gLayerIndex = layer.prompt({
                title: '退回原因',
                success: function (layero, index) {
                    // console.info('success');
                },
                yes: function (index, layero) {
                    let value = layero.find(".layui-layer-input").val();
                    if (value) {
                        check(selectedRowArr, _stateEnum.code.BACK, value);
                    } else {
                        lat.failMsg('请输入退回原因');
                        return false;
                    }
                },
                cancel: function (index, layero) {
                    // console.info('cancel');
                },
                end: function (layero, index) {
                    // console.info('end');
                }
            }, function (value, index, elem) {
                // console.info('value: %s, index: %s', value, index);
            });
        }
    });
    function getcolumns() {
        let txt = '总学时';
        let y = +($('select[name=cmeYear]').val());
        if (y >= 2025) txt = '小时';
        return [
            {
                title: '选择', width: 60, align: 'center', fixed: 'left', templet: (data) => {
                    if (_isGov) {
                        let msg = canCheck(data);
                        if (msg) {
                            // disable
                            return '<img src="/pages/mod/img/checkbox-disable.png" style="width:24px;" alt="' + msg + '" onmouseenter="showTips(this)" onmouseleave="closeTips()"/>';
                        } else {
                            // enable
                            return '<input type="checkbox" name="layTableCheckbox" lay-skin="primary">';
                        }
                    } else {
                        let msg = canReport(data);
                        if (msg) {
                            // disable
                            return '<img src="/pages/mod/img/checkbox-disable.png" style="width:24px;" alt="' + msg + '" onmouseenter="showTips(this)" onmouseleave="closeTips()"/>';
                        } else {
                            // enable
                            return '<input type="checkbox" name="layTableCheckbox" lay-skin="primary">';
                        }
                    }
                }
            },
            {title: '选择1', width: 60, align: 'center', fixed: 'left', type: 'checkbox', hide: true},
            {title: '操作', minWidth: 256, align: 'center', fixed: 'left', templet: '#operationCell'},
            {field: 'personNo', title: '人员编号', minWidth: 108, align: 'center', sort: true, fixed: 'left'},
            {field: 'personName', title: '姓名', minWidth: 108, align: 'center', sort: true, fixed: 'left'},
            {field: 'certId', title: '身份证号', minWidth: 172, align: 'center', sort: true},
            {field: 'personStateName', title: '人员状态', minWidth: 120, align: 'center', sort: true},
            {field: 'unitId', title: '单位编号', minWidth: 102, align: 'center', sort: true},
            {field: 'unitName', title: '单位名称', minWidth: 180, align: 'center', sort: true},
            {field: 'deptName', title: '科室', minWidth: 160, align: 'center', sort: true},
            {field: 'titleName', title: '职称', minWidth: 120, align: 'center', sort: true},
            {field: 'passResult', title: '达标结果', minWidth: 102, align: 'center', sort: true, templet: (data) => PassResultEnum[data.passResult]},
            {field: 'reason', title: '原因', minWidth: 200, align: 'center', sort: true},
            {field: 'totalPeriod', title: txt, minWidth: 90, align: 'center', sort: true},
            {field: 'totalScore', title: '总学分', minWidth: 90, align: 'center', sort: true},
            {field: 'score1', title: '一类学分', minWidth: 102, align: 'center', sort: true},
            {field: 'score2', title: '二类学分', minWidth: 102, align: 'center', sort: true},
            {field: 'score3', title: '其它学分', minWidth: 102, align: 'center', sort: true},
            {field: 'reportState', title: '上报状态', minWidth: 102, align: 'center', sort: true, templet: (data) => getOrDefault(_stateEnum[data.reportState], '<span style="color: #f56c6c;">未上报</span>')},
            {field: 'reportUnitName', title: '上报单位', minWidth: 180, align: 'center', sort: true,},
            {field: 'reportTime', title: '上报时间', minWidth: 160, align: 'center', sort: true,},
            {
                field: 'lastState', title: '审核状态', minWidth: 102, align: 'center', sort: true, templet: (data) => {
                    if (isChecked(data)) return `<a lay-event="showstep" style=" text-decoration: underline;">${getOrDefault(_stateEnum[data.lastState], '')}</a>`;
                    return `<a lay-event="showstep" style="color: #f56c6c; text-decoration: underline;">未审核</a>`;
                }
            },
            {field: 'lastUnitName', title: '审核单位', minWidth: 180, align: 'center', sort: true, templet: (data) => isChecked(data) ? getOrDefault(data.lastUnitName, '') : ''},
            {field: 'updateTime', title: '审核时间', minWidth: 160, align: 'center', sort: true, templet: (data) => isChecked(data) ? data.updateTime : ''},
            {
                field: 'lastOpinion', title: '审核意见', minWidth: 420, align: 'center', sort: true, templet: (data) => {
                    if (isChecked(data)) {
                        if (99 === data.lastState) return `同步成功，ID:${data.entryId}`;
                        return getOrDefault(data.lastOpinion, '');
                    }
                    return '';
                }
            }];
    }
    function renderAuditTable() {
        table.render({
            id: 'auditTable',
            elem: '#auditTable',
            height: 'full-100',
            toolbar: '#tableToolbar',
            defaultToolbar: [],
            url: huayi_sjwh_url + 'audit/henan/person/page/last',
            method: 'POST',
            contentType: 'application/json',
            loading: true,
            page: true,
            limit: 10,
            limits: [10, 50, 100, 150, 200],
            headers: {
                'Authorization': localStorage.getItem('token'), 'KJPT-USER-ID': localStorage.getItem('user-id')
            },
            where: getSifter(),
            request: {
                pageName: 'pageNum', // 页码的参数名称，默认：page
                limitName: 'pageSize' // 每页数据量的参数名，默认：limit
            },
            parseData: function (res) {
                return {
                    'code': res.status === 200 ? 0 : res.status, // 解析接口状态
                    'msg': res.message, // 解析提示文本
                    'count': res.data.recordsTotal, // 解析数据长度
                    'data': res.data.records, // 解析数据列表
                    'page': res.data.pageNum, // 当前页
                    'limit': res.data.pageSize // 每页条数
                }
            },
            cols: [getcolumns()],
            data: [{
                personNo: "123"
            }],
            done: function (res, curr, count) {
                fixPage();
            }
        });
    }
    function fixPage() {
        let $onlyUnit = $('.only_unit');
        let $onlyGov = $('.only_gov');
        let $onlyNotPerson = $('.only_not_person');
        _isGov && $onlyGov.css("display", "inline-block") && $onlyUnit.hide();
        (!_isGov) && $onlyGov.hide() && $onlyUnit.css("display", "inline-block");
        _isPerson && $onlyNotPerson.hide();
        // 漯河&鹤壁 区县可看不可审
        // if ((_isLuohe || _isHebi) && _isGovCounty) {
        //     $onlyGov.hide();
        // }
        candownpdfc() && $('.only_pdfc').css("display", "inline-block");
        candownpdfp() && $('.only_pdfp').css("display", "inline-block");
    }
    function candownpdfc() {
        return '2020,2021,2022,2023,2024'.includes($('select[name=cmeYear]').val()) && (_isHebi || _isZhoukou || _isJiaozuo);
    }
    function candownpdfp() {
        if (_isPhUnit) return true;
        return '2025,2026'.includes($('select[name=cmeYear]').val()) && !(_isZhengzhou || _isXuchang || _isLuohe || _isPingdingshan);
    }
    function refreshAuditTable(ec) {
        let c = {
            where: getSifter(),
            cols: [getcolumns()],
        };
        ec ? $.extend(true, c, ec) : '';
        table.reload('auditTable', c);
    }
    function getSifter() {
        let reportState = $('select[name=reportState]').val();
        const lastState = $('select[name=lastState]').val();
        let state = lastState, stateList = null, fcsList = null;
        if ('0' === lastState) {
            state = null;
            stateList = [_stateEnum.code.REPORT, _stateEnum.code.NOT, _stateEnum.code.PENDING, 99];
            fcsList = [30, 40, 50];
            if ('90' === reportState) {
                state = null;
                stateList = null;
                fcsList = null;
            }
        }
        if ('100' === lastState) {
            state = null;
            stateList = null;
            fcsList = [_uut * 10];
        }
        const medicaltype = toNum($('select[name=medicaltype]').val());
        let unittypes = null, titletypes = null;
        if (_isGov) {
            unittypes = medicaltype === 1 ? '1,0' : (medicaltype === 2 ? '2' : null);
        } else {
            titletypes = medicaltype === 1 ? _titleTypes1 : (medicaltype === 2 ? _titleTypes2 : null);
        }
        return {
            'unitId': pickUnitId(_unitId),
            'depth': getDepthPlus(),
            'cmeYear': $('select[name=cmeYear]').val(),
            'personNo': $('input[name=personNo]').val(),
            'personName': $('input[name=personName]').val(),
            'certId': $('input[name=certId]').val(),
            'passResult': $('select[name=passResult]').val(),
            'deptIds': _isGov ? '' : idsFromTree(gDeptTreeSelector, gDeptTreeData, 'deptId'),
            'personStateId': $('select[name=personStateId]').val(),
            // 正常,产假
            'personStateIdList': ['30ab1053-9289-4f0e-b46c-a97500b8abb1', '366cf2cc-ad17-4034-bd32-a97500b9fe20'],
            'titleLevel': $('select[name=titleLevel]').val(),
            'titleIdList': gTitleTreeSelector ? gTitleTreeSelector.getValue('value') : [],
            'reportState': reportState,
            'lastState': state,
            'includeLastStateList': stateList,
            'includeFlowChainStateList': fcsList,
            'category': _isGov ? $('select[name=category]').val() : null,
            'unitTypes': unittypes,
            'titleTypes': titletypes,
            'comPersonId': _pid
        };
    }
    function loadExportPersonIds(cp) {
        let visit = huayi_sjwh_url + 'audit/henan/person/ids/last';
        let params = getSifter();
        params.passResult = 1;
        params.includeLastStateList = [_stateEnum.code.APPROVE, _stateEnum.code.PUSH_OK];
        postAction(visit, params).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                downpdf(jsonRes.data, cp);
            } else {
                lat.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            lat.errorMsg('error:personIds');
        }).finally(() => {
        });
    }
    function downpdf(comPersonIds, cp) {
        if (comPersonIds) {
            // uuid: 37 * 1000
            if (_isGov && comPersonIds.length > 37000) {
                lat.failMsg('超过每次导出1000人数限制');
            } else {
                let selYear = $('select[name=cmeYear]').val();
                let visit = huayi_sjwh_url + 'audit/pdf/down'; // 河南-1 comPersonIds
                let params = {
                    'standardKindId': _standardKindId,
                    'unitId': _unitId,
                    'depth': _depth,
                    'pdfType': 1,
                    'comPersonIds': comPersonIds,
                    'cmeYear': selYear,
                    'cmeYears': selYear,
                    'personCmeYear': selYear,
                    'cityUnitId': _cityUnitId,
                    'cp': cp,
                };
                lat.downloadWithProgress(visit, params, '继续医学教育证书.pdf');
            }
        } else {
            lat.failMsg('暂无符合下载证书条件的人员');
        }
    }
    function renderPersonState(selector) {
        let arr = [
            {
                "personStateId": "30ab1053-9289-4f0e-b46c-a97500b8abb1",
                "personStateName": "正常"
            },
            {
                "personStateId": "366cf2cc-ad17-4034-bd32-a97500b9fe20",
                "personStateName": "产假、病假、境外工作6个月以上"
            },
            // {
            //     "personStateId": "f35bde3e-9fd3-4342-bd13-a97500b9e13b",
            //     "personStateName": "不计达标"
            // },
            // {
            //     "personStateId": "3b0c58ed-be6f-4014-ae93-a97500b9c9ea",
            //     "personStateName": "注销"
            // },
        ];
        arr.forEach((personState, index) => {
            $(selector).append(new Option(personState.personStateName, personState.personStateId));
        });
        layui.form.render("select");
    }
    function isChecked(row) {
        if (is1014(row)) return false;
        let lastState = row.lastState;
        let checked = (0 < lastState) && (lastState < 90);
        return checked || isPushed(row);
    }
    function isPushed(row) {
        let lastState = row.lastState;
        return lastState === 99;
    }
    function isBack(row) {
        let lastState = row.lastState;
        if (lastState < 90) {
            return (lastState % 10) === _stateEnum.code.BACK;
        } else {
            return false;
        }
    }
    function is1014(row) {
        return row.lastState === 99 && row.flowChainState % 10 === 0;
    }
    function canReport(row) {
        if (row.passResult === 0) {
            return '学分不达标'; // false
        }
        if (isBack(row)) {
            return ''; // true
        }
        if (row.reportState === _stateEnum.code.REPORT) {
            return '已上报'; // false
        }
        //撤回
        if (row.reportState === _stateEnum.code.RECALL) {
            return ''; // true
        }
        if (0 <= row.lastState && row.lastState < 90) {
            return '已审核'; // false
        }
        if (row.lastState === _stateEnum.code.PUSH_OK) {
            return '已推送至人社'; // false
        }
        if (row.lastState === _stateEnum.code.RECALL) {
            return ''; // true
        }
        return '';
    }
    function canRecall(row) {
        return row.reportState === _stateEnum.code.REPORT && row.lastState === _stateEnum.code.REPORT;
    }
    function canPushAgain(row) {
        let flag = row.lastState === _stateEnum.code.PUSH_OK || row.lastState === _stateEnum.code.PUSH_FAIL;
        return isFinalUnit() && flag;
    }
    function canCheck(row) {
        if (row.passResult === 0) {
            return '学分不达标'; // false
        }
        if (is1014(row)) return ''; // true
        if (row.reportState !== _stateEnum.code.REPORT) {
            return '未上报'; // false
        }
        if (row.lastState === _stateEnum.code.PUSH_OK) {
            return '已推送至人社'; // false
        }
        // 区县未审核,市委可看不可审
        let flowChainState = row.flowChainState;
        // `flowChainState`为`null`时当前单位可以审核
        let fUut = flowChainState ? flowUut(flowChainState) : _uut;
        if (fUut < _uut) return '下级审核中'; // false
        if (fUut > _uut) return '已审核'; // false
        if (row.lastState === _stateEnum.code.APPROVE) {
            return '审核通过无法再次审核'; // false
        }
        if (isBack(row)) {
            return '退回无法再次审核'; // false
        }
        if (row.reportState === _stateEnum.code.REPORT) {
            return ''; // true
        }
        return ''; // true
    }
});