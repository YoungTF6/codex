layui.config({
    base: '/js/layui/ext/'
}).extend({
    // xmSelect: 'xm-select',
    // excel: 'excel'
    treeSelect: 'treeSelect'
});
// layui: config extend define use
layui.define(['jquery', 'form', 'layer', 'laydate', 'table', 'element', 'treeSelect'], function (exports) {
    "use strict";
    let {$, form, layer, laydate, element, treeSelect} = layui;
    // let xmSelect = layui.xmSelect;
    // let excel = layui.excel;
    // 这里不扩展'xmSelect'和'excel', 在使用'lat'的地方扩展
    let gLayerIndex, gInterval, gTp;
    const _r = {
        _loadDictionary: function (selector, kindId) {
            const that = this;
            getDictOption(kindId).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    that._renderSingleSel(selector, jsonRes.data, 'dictName', 'dictId');
                }
            }).catch(error => {
                layer.msg('error:加载字典kindId=' + kindId);
            });
        },
        _renderSingleSel: function (selector, data, nameKey = 'name', valueKey = 'value') {
            let $sel = $(selector);
            $sel.empty().append(new Option());
            data.forEach((item, idx) => {
                $sel.append(new Option(item[nameKey], item[valueKey]));
            });
            form.render('select');
        },
        _xmSingleSel: function (selector, data, ec) {
            if ($(selector).length < 1) return;
            let conf = {
                el: selector,
                radio: true,
                clickClose: true,
                theme: {
                    color: '#5FB878'
                },
                model: {
                    type: 'fixed',
                    icon: 'hidden',
                    label: {
                        type: 'text'
                    }
                },
                data: data
            };
            ec && $.extend(true, conf, ec);
            return xmSelect.render(conf);
        },
        _xmMultiSel: function (selector, data, ec) {
            if ($(selector).length < 1) return;
            let config = {
                el: selector,
                autoRow: false,
                radio: false,
                clickClose: false,
                direction: 'auto',
                height: '300px',
                data: data,
                // initValue: initValArr,
                theme: {
                    color: '#5FB878'
                },
                model: {
                    type: 'fixed',
                    icon: 'show',
                    label: {
                        type: 'text'
                    }
                }
            };
            ec && $.extend(true, config, ec);
            return xmSelect.render(config);
        },
        // tree/treeMulti: unit dept title spec
        _xmTreeSel: function (selector, treeData, extendConfig) {
            if ($(selector).length < 1) return;
            let config = {
                el: selector,
                autoRow: false,
                radio: true,
                filterable: true,
                direction: 'auto',
                size: 'small',
                clickClose: false,
                height: '300px',
                data: treeData,
                tree: {
                    show: true,
                    clickExpand: false,
                    clickCheck: true,
                    showFolderIcon: true,
                    showLine: true,
                    indent: 20,
                    // expandedKeys: true,
                    simple: true,
                    strict: false
                },
                theme: {
                    color: '#5FB878'
                },
                model: {
                    type: 'fixed',
                    icon: 'hidden',
                    label: {
                        type: 'text'
                    }
                },
                iconfont: {
                    // select: 'layui-icon layui-icon-chart',
                    // unselect: 'layui-icon-ok-circle',
                    // half: 'layui-icon layui-icon-table',
                    // parent: 'layui-icon layui-icon-survey'
                    // select: '',
                    // unselect: '',
                    // half: '',
                    // parent: ''
                }
            };
            extendConfig && $.extend(true, config, extendConfig);
            return xmSelect.render(config);
        },
    }
    const _v = {
        _kk: function (url, filename) {
            layer.open({
                type: 2,
                shade: false,
                shadeClose: true,
                title: false,
                closeBtn: 1,
                content: kkurl(url),
                area: ['90%', '90%'],
                end: function (layero, index) {
                }
            });
        },
        _photo: function (url, filename) {
            gPhotoJson.data = [
                {
                    "alt": filename,
                    "pid": 109,
                    "src": url,
                    "thumb": ""
                }
            ];
            layer.photos({
                photos: gPhotoJson,
                anim: 5,
                shade: 0.2,
                tab: function (pic, layero) {
                    // console.log(pic) //当前图片的一些信息
                    $('.layui-layer-imguide').show()
                    $('.layui-layer-imgbar').show()
                }
            });
        },
        _open: function (url, filename) {
            layer.open({
                type: 2,
                shade: false,
                title: false,
                area: ['80%', '80%'],
                content: url,
            });
        }
    }
    function appendProgress() {
        if ($('#dldp').length > 0) {
            return false;
        }
        let str = '<div style="display: none" id="dldp">\n' +
            '    <div class="layui-progress layui-progress-big" lay-showpercent="true" lay-filter="dldp">\n' +
            '        <div class="layui-progress-bar" lay-percent="0%"></div>\n' +
            '    </div>\n' +
            '</div>';
        $('body').append(str);
    }
    // 下载进度条展示上限为 99%，避免假进度累加或异常值超过 100%
    var downloadProgressDisplayMax = 99;
    function changeProgress(percent, from) {
        // console.info('percent: %s, from: %s', percent, from);
        var n = Number(percent);
        if (!Number.isFinite(n)) {
            n = 0;
        }
        n = Math.max(0, n);
        var displayPercent = Math.min(downloadProgressDisplayMax, Math.round(n));
        if ('down' === from) {
            if (n > gTp) {
                clearInterval(gInterval);
                gTp = n;
                element.progress('dldp', displayPercent + '%');
            }
        } else {
            element.progress('dldp', displayPercent + '%');
        }
    }
    let lat = {
        // [取值]功能为 layui 2.5.5 开始新增
        getFormVal: function (filter, itemForm) {
            let ELEM = '.layui-form';
            itemForm = itemForm || $(ELEM + '[lay-filter="' + filter + '"]').eq(0);
            var nameIndex = {} //数组 name 索引
                , field = {}
                , fieldElem = itemForm.find('input,select,textarea'); //获取所有表单域
            layui.each(fieldElem, function (_, item) {
                var othis = $(this)
                    , init_name; // 初始 name
                item.name = (item.name || '').replace(/^\s*|\s*&/, '');
                if (!item.name) return;
                // 用于支持数组 name
                if (/^.*\[\]$/.test(item.name)) {
                    var key = item.name.match(/^(.*)\[\]$/g)[0];
                    nameIndex[key] = nameIndex[key] | 0;
                    init_name = item.name.replace(/^(.*)\[\]$/, '$1[' + (nameIndex[key]++) + ']');
                }
                if (/^checkbox|radio$/.test(item.type) && !item.checked) return;  //复选框和单选框未选中，不记录字段
                field[init_name || item.name] = item.value;
            });
            return field;
        },
        okMsg: function (msg, end) {
            layer.msg(msg, {icon: 1, time: 1300, end: end});
        },
        failMsg: function (msg, end) {
            layer.msg(msg, {icon: 0, time: 2000, end: end});
        },
        errorMsg: function (msg, end) {
            layer.msg(msg, {icon: 5, time: 2300, end: end});
        },
        alertMsg: function (msg) {
            layer.alert(msg, {icon: 0});
        },
        loadingShade: function () {
            return layer.load(1, {
                shade: [0.2, '#fff'],
                time: 10 * 1000
            });
        },
        // 最近六年
        renderCmeYear: function (selector, n) {
            let ny = _cur_year + 1;
            let arr = Array(6).fill(0).map((_, idx) => ny - idx);
            arr.forEach(y => {
                $(selector).append(new Option(y, y, y === _cur_year, y === _cur_year));
            });
            form.render('select');
        },
        // from table cme_year
        renderCmeYear2: function (selector) {
            getCmeYearOption().then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    let $start = $("#startDate");
                    let $end = $("#endDate");
                    let $range = $("#lb_cme_year_range");
                    let curDate = new Date();
                    let curYear = curDate.getFullYear();
                    let str = '';
                    jsonRes.data.forEach((item, idx) => {
                        if (0 === idx) {
                            str = `${item.startDate} 至 ${item.endDate}`;
                            ($start.length > 0) && $start.val(item.startDate);
                            ($end.length > 0) && $end.val(item.endDate);
                        }
                        let txt = item.cmeYear;
                        // txt = `${item.cmeYear}  ${item.startDate}至${item.endDate}`;
                        let op = new Option(txt, item.cmeYear, Number(item.cmeYear) === curYear, Number(item.cmeYear) === curYear);
                        op.setAttribute("startDate", item.startDate);
                        op.setAttribute("endDate", item.endDate);
                        $(selector).append(op);
                    });
                    ($range.length > 0) && $range.text(str);
                }
            }).catch(error => {
                layer.msg('error:加载cmeYear');
            }).finally(() => {
                form.render('select');
            });
        },
        // function p_cme_get_year_by_personid
        // renderCmeYear3: function (selector) {},
        renderDaySelector: function (selector, initVal, ec) {
            let config = {
                elem: selector,
                format: 'yyyy-MM-dd',
                value: initVal ? initVal : '',
                btns: ['now', 'confirm']
            };
            ec && $.extend(true, config, ec);
            return laydate.render(config);
        },
        renderYearBox: function (_selector, begin = 2024, cnt = 7) {
            let $bx = $(_selector);
            let str = '';
            Array(cnt).fill(0).forEach((_, idx) => {
                let year = begin - idx;
                let checked = idx < 3 ? "checked" : "";
                str += `<input type="checkbox" name="cmeYear[${year}]" value="${year}" title="${year}" ${checked} lay-skin="primary" lay-filter="cmeYearCheckBox">`;
            });
            $bx.html(str);
            form.render('checkbox');
        },
        renderDayRangeSel: function (selector, initStart, initEnd, ec) {
            let conf = {
                elem: selector,
                format: 'yyyy-MM-dd',
                range: '至',
                btns: ['now', 'confirm']
            };
            ec && $.extend(true, conf, ec);
            initStart && initEnd && $(selector).val(`${initStart} 至 ${initEnd}`);
            return laydate.render(conf);
        },
        parseDayRange: function (selector) {
            let res = {'start': null, 'end': null};
            let str = $(selector).val();
            if (str) {
                let arr = str.split(' 至 ');
                res.start = arr[0];
                res.end = arr[1];
            }
            return res;
        },
        renderCheckType: function (selector) {
            // com_dictionary.kind_id=8
            _r._loadDictionary(selector, 8);
        },
        renderHoldForm: function (selector) {
            // com_dictionary.kind_id=5
            _r._loadDictionary(selector, 5);
        },
        renderDuty: function (selector) {
            // business
            // 职务, com_dictionary.kind_id=10
            _r._loadDictionary(selector, 10);
        },
        renderEducation: function (selector) {
            // 学历, com_dictionary.kind_id=1
            _r._loadDictionary(selector, 1);
        },
        renderDegree: function (selector) {
            _r._loadDictionary(selector, 2);
        },
        renderScoreLevel: function (selector, cmeYear, viewMode, cb) {
            // cme_com_score_level
            getScoreLevelOption(cmeYear, viewMode).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    _r._renderSingleSel(selector, jsonRes.data, 'scoreLevelName', 'scoreLevelId');
                    cb && ('function' === typeof cb) && cb(jsonRes.data);
                }
            }).catch(error => {
                layer.msg('error:加载学分级别');
            });
        },
        render2ndKnowledge: function (selector, cmeYear, delOth) {
            $(selector).empty().append(new Option());
            getKnowledgeOption({
                'standardKindId': _standardKindId,
                'cmeYear': cmeYear,
                'knowledgeType': 2,
            }).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    jsonRes.data.forEach((knowledge, index) => {
                        let brk = delOth && ('4fe0d8cb-d553-4142-bc4a-9bd0014288bb' === knowledge.knowledgeId);
                        let op = new Option(knowledge.knowledgeName, knowledge.knowledgeId);
                        op.setAttribute('kcode', knowledge.knowledgeCode);
                        !brk && $(selector).append(op);
                    });
                }
            }).catch(error => {
                layer.msg('error:加载二级学科');
            }).finally(() => {
                form.render('select');
            });
        },
        render3rdKnowledge: function (selector, cmeYear, knowledgeTwoId) {
            $(selector).empty().append(new Option());
            if (knowledgeTwoId) {
                getKnowledgeOption({
                    'standardKindId': _standardKindId,
                    'cmeYear': cmeYear,
                    'knowledgeType': 3,
                    'knowledgeTwoId': knowledgeTwoId
                }).then(response => {
                    let jsonRes = response.data;
                    if (jsonRes.success) {
                        jsonRes.data.forEach((knowledge, index) => {
                            let op = new Option(knowledge.knowledgeName, knowledge.knowledgeId);
                            op.setAttribute('kcode', knowledge.knowledgeCode);
                            $(selector).append(op);
                        });
                    }
                }).catch(error => {
                    layer.msg("error:加载三级学科");
                }).finally(() => {
                    form.render('select');
                });
            }
        },
        renderHoldType: function (selector, slId, viewMode) {
            // cme_hold_type
            let action = slId ? getHoldTypeOptionLALA(slId, viewMode) : getHoldTypeOption(viewMode);
            action.then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    _r._renderSingleSel(selector, jsonRes.data, 'holdTypeName', 'holdTypeId');
                }
            }).catch(error => {
                layer.msg('error:加载举办方式');
            });
        },
        renderPersonState: function (selector) {
            // [cme_person_state]
            getPersonStateOption().then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    _r._renderSingleSel(selector, jsonRes.data, 'personStateName', 'personStateId');
                }
            }).catch(error => {
                layer.msg("error:加载人员状态");
            });
        },
        renderTitleLevelSelector: function (selector) {
            _r._renderSingleSel(selector, [
                {'name': '初级职称', 'value': '7acab84c-e870-4a4d-90ea-9b2f01271376'},
                {'name': '中级职称', 'value': 'da42823c-796c-4377-a616-9b2f01271376'},
                {'name': '副高级职称', 'value': '6351aa8b-bba0-4805-99ca-9b2f01271376'},
                {'name': '正高级职称', 'value': '3d5f8e06-1274-454c-9c55-9b2f01271376'},
            ]);
        },
        renderMultiSelector: function (selector, data, ec) {
            return _r._xmMultiSel(selector, data, ec);
        },
        renderUnitTreeSelector: function (selector, treeData, extendConfig) {
            let config = {
                prop: {
                    name: 'n',
                    value: 'i',
                    children: 'c'
                }
            };
            extendConfig && $.extend(true, config, extendConfig);
            return _r._xmTreeSel(selector, treeData, config);
        },
        renderDeptTreeSelector: function (selector, treeData, extendConfig) {
            let config = {
                prop: {
                    name: 'deptName',
                    value: 'deptId',
                }
            };
            extendConfig && $.extend(true, config, extendConfig);
            return _r._xmTreeSel(selector, treeData, config);
        },
        renderTitleTreeSelector: function (selector, treeData, extendConfig) {
            let config = {
                prop: {
                    name: 'titleName',
                    value: 'titleId',
                }
            };
            extendConfig && $.extend(true, config, extendConfig);
            return _r._xmTreeSel(selector, treeData, config);
        },
        renderSpecTreeSelector: function (selector, treeData, extendConfig) {
            let config = {
                prop: {
                    name: 'personSpecName',
                    value: 'personSpecId',
                }
            };
            extendConfig && $.extend(true, config, extendConfig);
            return _r._xmTreeSel(selector, treeData, config);
        },
        /**
         * 将 option/title/treeData 等接口返回的 { titleId, titleName, children } 转为 layui treeSelect + zTree 需要的 { id, name, children }，
         * 并兼容外层 { status, data: [] } 或直接数组。
         */
        adaptApiTitleTreeForTreeSelect: function (raw) {
            let src = Array.isArray(raw) ? raw : (raw && raw.data != null ? raw.data : []);
            function map(nodes) {
                if (!Array.isArray(nodes)) {
                    return [];
                }
                return nodes.map(function (n) {
                    let o = {
                        id: n.titleId != null ? String(n.titleId) : (n.id != null ? String(n.id) : ''),
                        name: n.titleName != null ? n.titleName : (n.name != null ? n.name : '')
                    };
                    if (n.children && n.children.length) {
                        o.children = map(n.children);
                    }
                    return o;
                });
            }
            let out = map(src);
            out.unshift({ id: '', pid: '', name: '请选择' });
            return out;
        },
        adaptSpecTreeForTreeSelect: function (raw) {
            let src = Array.isArray(raw) ? raw : (raw && raw.data != null ? raw.data : []);
            function map(nodes) {
                if (!Array.isArray(nodes)) {
                    return [];
                }
                return nodes.map(function (n) {
                    let o = {
                        id: n.personSpecId != null ? String(n.personSpecId) : (n.id != null ? String(n.id) : ''),
                        name: n.personSpecName != null ? n.personSpecName : (n.name != null ? n.name : '')
                    };
                    if (n.children && n.children.length) {
                        o.children = map(n.children);
                    }
                    return o;
                });
            }
            let out = map(src);
            out.unshift({ id: '', pid: '', name: '请选择' });
            return out;
        },
        renderTreeSelect: function (elem, dataUrl, extendConfig) {
            let config = {
                elem: elem,
                data: dataUrl,
                type: 'get',
                search: true,
                disabledParent: true,
                style: {
                    folder: { enable: true },
                    line: { enable: true }
                }
            };
            extendConfig && $.extend(true, config, extendConfig);
            let preprocess = config.preprocessResponse;
            if (typeof preprocess === 'function') {
                delete config.preprocessResponse;
                let url = dataUrl;
                let reqType = config.type === undefined ? 'get' : config.type;
                let hdrs = config.headers;
                delete config.data;
                $.ajax({
                    url: url,
                    type: reqType,
                    headers: hdrs,
                    dataType: 'json',
                    success: function (raw) {
                        let treeArr = preprocess(raw);
                        if (!Array.isArray(treeArr)) {
                            treeArr = [];
                        }
                        config.DATA = treeArr;
                        treeSelect.render(config);
                    },
                    error: function () {
                        layer.msg('树形数据加载失败', { icon: 2, time: 2000 });
                    }
                });
                return;
            }
            return treeSelect.render(config);
        },
        renderKnowledgeTreeSel: function (selector, treeData, extendConfig, pretty) {
            let config = {
                prop: {
                    name: pretty ? 'showname' : 'knowledgeName',
                    value: 'knowledgeId',
                },
                tree: {
                    clickExpand: true,
                    clickCheck: true,
                },
                template({item, sels, name, value}) {
                    if (_isZhejiang) {
                        if (pretty) return `${item.knowledgeName}`;
                        else return `${item.knowledgeName}`;
                    } else {
                        if (pretty) return `${item.knowledgeName}(${item.knowledgeCode})`;
                        else return `${item.knowledgeName}`;
                    }
                    
                },
            };
            extendConfig && $.extend(true, config, extendConfig);
            return _r._xmTreeSel(selector, treeData, config);
        },
        renderGenderSel: function (selector) {
            _r._renderSingleSel(selector, [
                {name: '男', value: 'M'},
                {name: '女', value: 'F'},
            ]);
        },
        renderYonSel: function (selector) {
            _r._renderSingleSel(selector, [
                {name: '是', value: '1'},
                {name: '否', value: '0'},
            ]);
        },
        renderCertTypeSel: function (selector) {
            _r._renderSingleSel(selector, [
                {"dictId": "9fcb08ce-ee86-4e4c-9611-9d430101cea4", "dictName": "身份证"},
                // {"dictId": "de3dfa08-f9ac-414d-9bc5-9d8b01570544", "dictName": "军官证"},
                {"dictId": "3444541a-9703-44ed-aae6-9d8b01574916", "dictName": "港澳台居民居住证"},
                {"dictId": "031d0bdc-8cd0-11ee-9c60-005056a64c01", "dictName": "港澳居民来往内地通行证"},
                {"dictId": "a85da857-fd72-4e9a-8657-afa900a0f569", "dictName": "台湾居民来往大陆通行证"},
                {"dictId": "d681a2b3-df10-421a-8279-afa900a0f569", "dictName": "其他法定有效证件"}
            ], 'dictName', 'dictId');
        },
        xmSingleSel: function (selector, data, ec) {
            return _r._xmSingleSel(selector, data, ec);
        },
        previewThumb: function (url, filename) {
            if (isImg(url)) {
                _v._kk(url, filename);
            } else {
                _v._kk(url, filename);
            }
        },
        verifyTenancy: function (f) {
            if (!f) {
                layer.alert('暂未开通该功能', {
                    title: '提示',
                    icon: 4,
                    closeBtn: 0,
                    shadeClose: false,
                    shade: [0.4, '#000']
                }, function (index) {
                    layer.close(index);
                    $(".layui-this i ", parent.document).click();
                });
            }
        },
        downloadWithProgress: function (visit, params, filename) {
            // appendProgress();
            changeProgress(0, null);
            gLayerIndex = layer.open({
                type: 1,
                title: '下载中',
                content: $('#dldp'),
                area: ['300px', '100px'],
                closeBtn: 0,
                shadeClose: false,
                success: function (layero, index) {
                    // console.log(layero, index);
                    gTp = 0;
                    gInterval = setInterval(function () {
                        gTp += Math.round(Math.random() * 4);
                        changeProgress(gTp, 'interval');
                    }, 500);
                },
                end: function () {
                    clearInterval(gInterval);
                    $('#dldp').hide();
                }
            });
            downloadFile(visit, params, filename, changeProgress).finally(() => {
                // console.info("download finally pdf");
                layer.close(gLayerIndex);
            });
        },
        renderInnovationSel: function (selector) {
            _r._renderSingleSel(selector, [
                {'dictId': '无', 'dictName': '无'},
                {'dictId': '国内首创', 'dictName': '国内首创'},
                {'dictId': '省内首创', 'dictName': '省内首创'}
            ], 'dictName', 'dictId');
        },
        getAllIds: function(data) {
            const ids = [];
            const collect = (item) => {
                if (!item || typeof item !== 'object') return;

                // 提取当前对象的 id（如果存在且有效）
                if (item.id !== undefined && item.id !== null) {
                    ids.push(item.id);
                }

                // 递归处理 children 数组
                if (Array.isArray(item.children)) {
                    item.children.forEach(child => collect(child));
                }
            };

            // 处理输入为数组或单个对象的情况
            if (Array.isArray(data)) {
                data.forEach(collect);
            } else {
                collect(data);
            }

            return ids;
        }
    };
    exports('lat', lat);
});
