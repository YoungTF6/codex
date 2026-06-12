layui.config({
    base: '/js/layui/ext/'
}).extend({
    xmSelect: 'xm-select',
    lat: 'lat'
}).use(['table', 'layer', 'jquery', 'form', 'laydate', 'element', 'xmSelect', 'lat'], function () {
        let table = layui.table, layer = layui.layer, form = layui.form, laydate = layui.laydate, dropdown = layui.dropdown, element = layui.element, $ = layui.jquery, xmSelect = layui.xmSelect, upload = layui.upload, lat = layui.lat;
        let gLayerIndex = -1, gDeptTreeData, gDeptTreeSelector, gTitleTreeData, gTitleTreeSelector, gSpecTreeData, gSpecTreeSelector, gPromoteArr, gConfDate = '', gFileName, gFileUrl, grow;
        let gPhUnit = '1' === (localStorage.getItem('kk_unitpc') || '00').split('')[0];
        let gChUnit = '1' === (localStorage.getItem('kk_unitpc') || '00').split('')[1];
        let psninfo = JSON.parse(localStorage.getItem('kk_psninfo') || '{}');
        let _pid = psninfo.comPersonId;
        let _pno = psninfo.personNo;
        let _pname = psninfo.personName;
        let _pcid = psninfo.certId;
        let _isGansu = '7068a5c0-2cd3-471a-90b9-9bf100aec95a'
        window.refreshTable = refreshTable;
        window.showPromoteSel = _gansu.showPromoteSel;
        window.viewfile = function (elem) {
            let url = $(elem).data('url');
            lat.previewThumb(url);
        };
        window.delfile = function (elem) {
            $('#file_box').empty();
            $('#btn_upload').show();
            gFileName = '';
            gFileUrl = '';
        };
        layer.ready(function () {
            lat.verifyTenancy(_isGansu);
            watermark.set('甘肃省');
            lat.renderCmeYear('select[name=cmeYear]', 8);
            lat.renderTitleLevelSelector('select[name=titleLevel]')
            lat.renderPersonState('select[name=personStateId]');
            !_isGov && renderDeptSel();
            renderTitleSel();
            renderSpecSel();
            renderUploader();
            getConfDate();
            if (_isPerson) {
                $('.only_not_person').hide();
                $('input[name=personNo]').val(_pno).attr('disabled', 'true').toggleClass('layui-disabled');
                $('input[name=personName]').val(_pname).attr('disabled', 'true').toggleClass('layui-disabled');
            }
            bindbu();
            setTimeout(() => {
                $('dd[lay-value="2bd5216a-27a8-42ef-b0ee-9bf100adcdbb"]').click();
                renderTable()
            }, 500);
        });
        function renderTitleSel() {
            getTitleTreeData().then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    gTitleTreeData = jsonRes.data;
                }
            }).catch(error => {
                layer.msg('error:加载titleTreeData');
            }).finally(() => {
                gTitleTreeSelector = lat.renderTitleTreeSelector('#titleTreeSelector', gTitleTreeData, {
                    tree: {
                        strict: false,
                        clickExpand: true
                    }
                });
            });
        }
        function renderDeptSel() {
            getDeptTreeData(_unitId, 9).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    gDeptTreeData = jsonRes.data;
                    if (_isDept) {
                        let abc = subTreeById(gDeptTreeData, (node) => {
                            return node.deptId === _deptId;
                        });
                        gDeptTreeData = Array(abc);
                    }
                    gDeptTreeSelector = lat.renderDeptTreeSelector('#deptIdSelector', gDeptTreeData);
                } else {
                    lat.failMsg(jsonRes.msg);
                }
            }).catch(error => {
                lat.errorMsg('error:加载deptTreeData');
            }).finally(() => {
                _isDept && gDeptTreeSelector.setValue([_deptId]);
            });
        }
        function renderSpecSel() {
            getSpecTreeData(3).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    gSpecTreeData = jsonRes.data;
                }
            }).catch(error => {
                layer.msg('error:加载specTreeData');
            }).finally(() => {
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
            });
        }
        table.on('tool(table_id)', function (obj) {
            let rowData = obj.data;
            rowData.promote = gPromoteArr[rowData.idx];
            if ('submit' === obj.event) {
                dosubmit(rowData);
            } else if ('resubmit' === obj.event) {
                doresubmit(rowData);
            } else if ('busubmit' === obj.event) {
                showbumodal(rowData);
            } else if ('step' === obj.event) {
                dostep(rowData);
            } else if ('detail' === obj.event) {
                let cmeYear = $('select[name=cmeYear]').val();
                gLayerIndex = layer.open({
                    type: 2,
                    shade: 0.4,
                    shadeClose: true,
                    title: '学分明细',
                    content: `/pages/score/proj_statistics/personScoreStatistics.html?personId=${rowData.comPersonId}&cmeYear=${cmeYear}`,
                    area: ['100%', '100%']
                });
            } else if ('viewbufile' === obj.event) {
                lat.previewThumb(rowData.buFileUrl);
            }
        });
        table.on('toolbar(table_id)', function (obj) {
            let checkStatus = table.checkStatus(obj.config.id);
            let selectedRowArr = checkStatus.data;
            selectedRowArr = selectedRowArr.filter(i => !_gansu.canCheck(i));
            if ('approve' === obj.event) {
                if (selectedRowArr.length < 1) {
                    lat.failMsg('先选择要审核的数据');
                    return false;
                } else {
                    docheck('approve', selectedRowArr, '');
                }
            } else if ('reject' === obj.event) {
                if (selectedRowArr.length < 1) {
                    lat.failMsg('先选择要审核的数据');
                    return false;
                } else {
                    layer.prompt({
                        title: '不通过原因',
                        btnAlign: 'c',
                        yes: function (index, layero) {
                            let val = layero.find(".layui-layer-input").val();
                            if (val) {
                                docheck('reject', selectedRowArr, val);
                            } else {
                                lat.failMsg('输入不通过原因');
                            }
                        },
                    });
                }
            } else if ('down_excel' === obj.event) {
                doexcel();
            } else if ('down_pdf' === obj.event) {
                dopdf();
            }
        });
        form.on('select(cmeYear)', function (data) {
            let startDate = $(data.elem).find("option[value='" + data.value + "']").attr("startDate");
            let endDate = $(data.elem).find("option[value='" + data.value + "']").attr("endDate");
            $("#startDate").val(startDate);
            $("#endDate").val(endDate);
            $("#lb_cme_year_range").text(startDate + ' 至 ' + endDate);
        });
        form.on('select(promote_sel)', function (data) {
            let idx = $(data.elem).attr('idx');
            gPromoteArr[idx] = data.value;
            form.render('select');
            console.info('select.change, idx: %s, val: %s', idx, data.value);
        });
        function doexcel() {
            if (_isUnit) {
                let d = getSifter();
                d.pageSize = 9999;
                downloadFile(`${huayi_sjwh_url}audit/gansu/down/xls`, d, `${_unitName}_年度审验.xlsx`);
            }
        }
        function showbumodal(rowData) {
            grow = rowData;
            gFileName = '';
            gFileUrl = '';
            $('textarea[name=buReason]').val('');
            $('#file_box').empty();
            $('#btn_upload').show();
            gLayerIndex = layer.open({
                type: 1,
                shade: 0.4,
                shadeClose: true,
                title: '补提交',
                content: $('#busubmit_modal'),
                area: ['80%', '80%'],
                cancel: function () {
                },
            });
        }
        function bindbu() {
            $('#btn_busubmit').on('click', function () {
                let reason = $('textarea[name=buReason]').val();
                if (!reason) {
                    lat.failMsg('请输入补审原因');
                    return;
                }
                if (!reason.match(/^[\s\S]{1,200}$/)) {
                    lat.failMsg('补审原因最多200字');
                    return;
                }
                if (!gFileName) {
                    lat.failMsg('请上传附件');
                    return;
                }
                grow.buReason = reason;
                grow.buFileName = gFileName;
                grow.buFileUrl = gFileUrl;
                if (!grow.id) dosubmit(grow, () => layer.closeAll());
                else doresubmit(grow, () => layer.closeAll());
            });
        }
        function dopdf() {
            let params = getSifter();
            params.states = '99';
            postAction(`${huayi_sjwh_url}audit/gansu/pids`, params).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    let pids = jsonRes.data || '';
                    let len = pids.length;
                    if (len < 36) {
                        lat.failMsg('未查询到满足导出条件的数据');
                    } else if (len > 37 * 1000 - 1) {
                        lat.failMsg('一次最多导出500条数据');
                    } else {
                        lat.downloadWithProgress(`${huayi_sjwh_url}audit/pdf/down`, {
                            'standardKindId': _skId,
                            'pdfType': 1,
                            'comPersonIds': pids,
                            'cmeYear': getOrDefault($('select[name=cmeYear]').val(), (new Date()).getFullYear())
                        }, '年度学分审验.pdf');
                    }
                }
            })
        }
        function dostep(rowData) {
            let cmeYear = $('select[name=cmeYear]').val();
            let unitPc = rowData.concatUnitPc;
            let titleLevelId = rowData.titleLevelId;
            let promote = rowData.promote;
            let isph = '1' === unitPc.split('')[0];
            let isch = '1' === unitPc.split('')[1];
            let flow = _gansu.getFlow(isph, isch, titleLevelId, promote);
            // &unitPc=${unitPc}&titleLevelId=${titleLevelId}&promote=${promote}
            gLayerIndex = layer.open({
                type: 2,
                shade: 0.4,
                shadeClose: true,
                title: '审核步骤',
                content: `./modals/gansuStep.html?cmeYear=${cmeYear}&comPersonId=${rowData.comPersonId}&flow=${flow}`,
                area: ['560px', '300px']
            });
        }
        function dosubmit(rowData, cb) {
            let flow = _gansu.getFlow(gPhUnit, gChUnit, rowData.titleLevelId, rowData.promote);
            let unitPc = '' + (+gPhUnit) + (+gChUnit);
            let params = {
                'standardKindId': _standardKindId,
                'cmeYear': $('select[name=cmeYear]').val(),
                'comPersonId': rowData.comPersonId,
                'unitId': _unitId,
                'state': _gansu.nextState(flow, 'submit', 0),
                'statex': _gansu.nextstx(flow, 'submit', rowData.statex),
                'unitPc': unitPc,
                'promote': rowData.promote,
                'flow': flow,
                'buReason': rowData.buReason,
                'buFileName': rowData.buFileName,
                'buFileUrl': rowData.buFileUrl,
            };
            postAction(`${huayi_sjwh_url}audit/gansu/submit`, params).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    cb?.();
                    lat.okMsg('已提交');
                    refreshTable();
                } else {
                }
            });
        }
        function doresubmit(row, cb) {
            let flow = _gansu.getFlow(gPhUnit, gChUnit, row.titleLevelId, row.promote);
            let checkEntryList = [{
                'comPersonId': row.comPersonId,
                'logState': 23,
                'newState': _gansu.nextState(flow, 'submit', row.state),
                'statex': _gansu.nextstx(flow, 'submit', row.statex),
                'promote': row.promote,
                'flow': flow,
                'buReason': row.buReason,
                'buFileName': row.buFileName,
                'buFileUrl': row.buFileUrl,
            }];
            let params = {
                'cmeYear': $('select[name=cmeYear]').val(),
                'unitId': _unitId,
                'opinion': '', // row.opinion,
                'checkEntryList': checkEntryList
            };
            postAction(`${huayi_sjwh_url}audit/gansu/check`, params).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    cb?.();
                    lat.okMsg('提交');
                    refreshTable();
                }
            });
        }
        function docheck(action, rowArr, opinion) {
            let checkEntryList = rowArr.map(row => {
                return {
                    'comPersonId': row.comPersonId,
                    'logState': _uut * 10 + _gansu.stateDict[action],
                    'newState': _gansu.nextState(row.flow, action, row.state),
                    'statex': _gansu.nextstx(row.flow, action, row.statex)
                };
            });
            let params = {
                'cmeYear': $('select[name=cmeYear]').val(),
                'unitId': _unitId,
                'opinion': opinion,
                'checkEntryList': checkEntryList
            };
            postAction(`${huayi_sjwh_url}audit/gansu/check`, params).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    lat.okMsg('审核完成');
                    refreshTable();
                    layer.closeAll();
                }
            }).catch(error => {
            });
        }
        function hide_nijin() {
            if (_isDept) return true;
            return _gansu.hidePromoteCol(gPhUnit);
        }
        function hide_oper() {
            if (_isDept) return true;
            return _isGov;
        }
        function renderTable() {
            table.render({
                id: 'table_id',
                elem: '#table_id',
                height: 'full-100',
                toolbar: '#tableToolbar',
                defaultToolbar: [],
                url: huayi_sjwh_url + 'audit/gansu/page',
                method: 'POST',
                contentType: 'application/json',
                loading: true,
                page: true,
                limit: 10,
                limits: [10, 50, 100, 150, 200],
                headers: {
                    'Authorization': localStorage.getItem('token'),
                    'KJPT-USER-ID': localStorage.getItem('user-id')
                },
                where: getSifter(),
                request: {
                    pageName: 'pageNum', // 页码的参数名称，默认：page
                    limitName: 'pageSize' // 每页数据量的参数名，默认：limit
                },
                parseData: function (res) {
                    let page = res.data || {};
                    return {
                        'code': res.status === 200 ? 0 : res.status, // 解析接口状态
                        'msg': res.message || res.msg, // 解析提示文本
                        'count': page.recordsTotal, // 解析数据长度
                        'data': page.records, // 解析数据列表
                        'page': page.pageNum, // 当前页
                        'limit': page.pageSize // 每页条数
                    }
                },
                cols: [[
                    {title: '选择1', width: 60, align: 'center', type: 'checkbox', hide: true},
                    {
                        title: '选择', width: 60, align: 'center', hide: !_isGov, templet: (data) => {
                            let tips = _gansu.canCheck(data);
                            if (!tips) {
                                return '<input type="checkbox" name="layTableCheckbox" lay-skin="primary">';
                            } else {
                                return `<img src="/img/checkbox-disable.png" style="width:24px;" alt="${tips}" onmouseenter="showTips(this)" onmouseleave="closeTips()"/>`;
                            }
                        }
                    },
                    {field: '', title: '是否为拟晋高职人员', minWidth: 168, align: 'center', templet: '#promoteCell', hide: hide_nijin()},
                    {
                        field: '', title: '操作', minWidth: 90, align: 'center', hide: hide_oper(), templet: (data) => {
                            let txt = submitTxt(data);
                            if (txt === '提交') return `<a class="layui-btn layui-btn-xs btn-row" lay-event="submit">提交</a>`;
                            else if (txt === '重新提交') return `<a class="layui-btn layui-btn-xs btn-row" lay-event="resubmit">重新提交</a>`;
                            else if (txt === '补提交') return `<a class="layui-btn layui-btn-xs btn-row" lay-event="busubmit">补提交</a>`;
                            else if (txt === '已提交') return `<a class="layui-btn layui-btn-xs btn-row layui-btn-disabled btn-disabled-row">已提交</a>`;
                            else return `<a class="layui-btn layui-btn-xs btn-row layui-btn-disabled btn-disabled-row">提交</a>`;
                        }
                    },
                    {field: '', title: '审核步骤', minWidth: 90, align: 'center', templet: '#stepCell'},
                    {field: '', title: '学分明细', minWidth: 90, align: 'center', templet: '#detailCell'},
                    {field: 'buReason', title: '补审原因', minWidth: 120, align: 'center', sort: true},
                    {
                        field: 'buFileName', title: '补审材料', minWidth: 120, align: 'center', sort: true, templet: data => {
                            if (data.buFileUrl && data.buFileName)
                                return `<a class="layui-btn layui-btn-xs btn-row" lay-event="viewbufile">${data.buFileName}</a>`;
                            else return '';
                        }
                    },
                    {field: 'cmeYear', title: '年度', minWidth: 80, align: 'center', sort: true},
                    {field: 'totalScore', title: '总学分', minWidth: 88, align: 'center', sort: true},
                    {field: 'totalPeriod', title: '总学时', minWidth: 88, align: 'center', sort: true},
                    {
                        field: 'passResult', title: '达标情况', minWidth: 120, align: 'center', sort: true, templet: (data) => PassResultEnum[data.passResult]
                    },
                    {field: 'personStateName', title: '人员状态', minWidth: 140, align: 'center', sort: true},
                    {field: 'personNo', title: '人员编号', minWidth: 120, align: 'center', sort: true},
                    {field: 'personName', title: '姓名', minWidth: 120, align: 'center', sort: true},
                    {field: 'certId', title: '身份证号', minWidth: 180, align: 'center', sort: true},
                    {field: 'titleLevelName', title: '职称级别', minWidth: 140, align: 'center', sort: true},
                    {field: 'titleName', title: '职称', minWidth: 140, align: 'center', sort: true},
                    {field: 'personSpecName', title: '专业', minWidth: 140, align: 'center', sort: true},
                    {field: 'unitName', title: '单位名称', minWidth: 200, align: 'center', sort: true},
                    {field: 'deptName', title: '科室', minWidth: 188, align: 'center', sort: true},
                    {
                        field: 'state', title: '提交状态', minWidth: 120, align: 'center', sort: true, templet: (data) => {
                            return data.state > 0 ? '<span style="color: #27b1a2;">已提交</span>' : '<span style="color: #f56c6c;">未提交</span>';
                        }
                    },
                    {
                        field: 'statex', title: '审核状态', minWidth: 120, align: 'center', sort: true, templet: (data) => _gansu.stxTxt(data)
                    },
                    {field: 'opinion', title: '审核不通过原因', minWidth: 200, align: 'center', sort: true},
                    {
                        field: 'promote', title: '是否为拟晋高职人员', minWidth: 168, align: 'center', hide: !_isGov, templet: (data) => {
                            let p = data.promote || 0;
                            return 1 === p ? '<span style="color: #27b1a2;">是</span>' : '<span style="color: #f56c6c;">否</span>';
                        }
                    },
                    {
                        field: 'promote', title: '是否终审单位', minWidth: 168, align: 'center', hide: !_isGov, templet: (data) => {
                            return _gansu.isFinalUnit(data) ? '<span style="color: #27b1a2;">是</span>' : '<span style="color: #f56c6c;">否</span>';
                        }
                    }
                ]],
                done: function (res, curr, count) {
                    _isGov && $('.only_gov').css('display', 'inline-block');
                    _isUnit && $('.only_unit').css('display', 'inline-block');
                    _isDept && $('.only_dept').css('display', 'inline-block');
                    let arr = res.data;
                    if (arr && arr.length > 0) {
                        gPromoteArr = [];
                        arr.forEach((item, idx) => {
                            item.idx = idx;
                            echoRowSelect('.layui-table-body', 'promote', idx);
                            echoRowSelect('.layui-table-fixed', 'promote', idx);
                            gPromoteArr[idx] = item.promote || 0;
                            if (!(submitTxt(item).replace('已提交', ''))) {
                                $(`.layui-table-fixed #promote_sel_${idx}`).attr('disabled', 'true').toggleClass('layui-disabled');
                                form.render('select');
                            }
                        });
                    }
                },
            });
        }
        function submitTxt(row) {
            // if (true) return '补提交';
            let selyear = +getOrDefault($('select[name=cmeYear]').val(), (new Date()).getFullYear());
            let arr = gConfDate.split('#');
            let normalyear = arr[0];
            let buyear = arr[1];
            // let isyear_cur = selyear === _cur_year;
            // let isyear_1 = selyear === _cur_year - 1;
            // let isyear_2 = selyear === _cur_year - 2;
            // let isBef = moment().isBefore(moment(gConfDate, DateTimePattern.SECOND));
            // let isAfter = moment().isAfter(moment(gConfDate, DateTimePattern.SECOND));
            // let isnormal = (isBef && isyear_1) || (isAfter && isyear_cur);
            // let isbuti = (isBef && isyear_2) || (isAfter && isyear_1);
            let isnormal = normalyear.includes(selyear);
            let isbuti = buyear.includes(selyear);
            //
            let state = row.state;
            let fs = (state || 0) % 10;
            let isnot = 0 === state, isback = _gansu.stateDict.reject === fs;
            let isyet = !isnot && !isback;
            if (isyet) return '已提交';
            if (isnormal) {
                if (isnot) return '提交';
                if (isback) return '重新提交';
            }
            if (isbuti) {
                if (isnot) return '补提交';
                if (isback) return '补提交';
            }
            return '';
        }
        function refreshTable(ec) {
            let c = {where: getSifter()};
            ec ? $.extend(true, c, ec) : '';
            table.reload('table_id', c);
        }
        function getConfDate() {
            getAction(`${huayi_sjwh_url}audit/gansu/conf/date`).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    gConfDate = jsonRes.data ?? '2024#2023,2022';
                }
            }).catch(() => gConfDate = '2024#2023,2022');
        }
        function renderUploader() {
            upload.render({
                elem: '#btn_upload',
                url: `${huayi_upload_url}uploadApi/upload`,
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
                    let fileType = isImg(gFileName) ? 'IMAGE' : 'DOC';
                    this.data = {
                        fileType: fileType,
                        path: `/gansu_audit_submit/2025/${_standardKindId}`,
                    }
                },
                done: function (res, index, upload) {
                    delete this.files[index];
                    if (res.code !== 200) {
                        lat.failMsg('上传失败');
                    } else {
                        gFileUrl = res.data.picUrl;
                        let str = `<a class="layui-btn layui-btn-xs btn-normal-row js-file-name" onclick="viewfile(this)" data-url="${gFileUrl}">${gFileName}</a>
                                    <a class="layui-btn layui-btn-xs btn-danger-row" onclick="delfile(this)" data-id="123">移除</a>`;
                        $('#file_box').html(str);
                        $('#btn_upload').hide();
                    }
                    layer.close(gLayerIndex);
                },
                error: function () {
                    lat.errorMsg('上传失败');
                }
            });
        }
        function getSifter() {
            let state1, state2, states = '', statex = '';
            let state = $('select[name=state]').val();
            if (!_isGov && '0' === state) {
                // state1 = 0;
                // state2 = 1;
                states = '0,1';
            }
            if (!_isGov && '1' === state) {
                // state1 = 1;
                // state2 = 99;
                states = '20,21,22,23,24,30,31,32,33,34,40,41,42,43,44,50,51,52,53,54,99';
            }
            let stx = $('select[name=statex]').val();
            if (_isGov && stx) {
                let arr = ['_', '_', '_', '_'];
                arr[_uut - 2] = stx;
                statex = arr.join('');
            }
            let v = checkboxVals('all_pass');
            if (v === 'all_pass') states = '99';
            return {
                'standardKindId': _skId,
                'unitId': pickUnitId(_unitId),
                'depth': getDepthPlus(),
                'cmeYear': getOrDefault($('select[name=cmeYear]').val(), (new Date()).getFullYear()),
                'comPersonId': _pid,
                'personNo': $('input[name=personNo]').val(),
                'personName': $('input[name=personName]').val(),
                'deptIds': idsFromTree(gDeptTreeSelector, gDeptTreeData, 'deptId'),
                'titleLevel': $('select[name=titleLevel]').val(),
                'titleIds': gTitleTreeSelector ? gTitleTreeSelector.getValue('valueStr') : '',
                'personStateId': $('select[name=personStateId]').val(),
                'personSpecIds': idsFromTreeStrict(gSpecTreeSelector, 'personSpecId'),
                'passResult': $('select[name=passResult]').val(),
                // 'ps1': 0,
                // 'ps2': 1,
                'states': states,
                // 'state1': state1,
                // 'state2': state2,
                'statex': statex,
                'fup': _isGovProvince,
            };
        }
    }
);