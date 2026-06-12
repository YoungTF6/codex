const style = function () {
    let style = document.createElement('style');
    style.textContent = `
        div[data-id] {
            min-width: 168px;
        }
        label:has(span[data-id="lblMedicalSystem"]) {
            padding: 0 15px !important;
            width: fit-content;
            height: 38px;
            align-content: center;
        }
        span[data-required="1"]::before {
            content: '* ';
            color: red;
        }
    `;
    document.head.appendChild(style);
}
let _sel_render = {
    baseconf: {
        'scoreLevel': {
            filterable: true,
            tree: {
                show: true,
                clickExpand: true,
                clickCheck: true,
                showFolderIcon: true,
                showLine: true,
                indent: 20,
                // expandedKeys: true,
                simple: true,
                strict: false
            },
        },
        'knowledge': {
            filterable: true,
            tree: {
                show: true,
                clickExpand: true,
                clickCheck: true,
                showFolderIcon: true,
                showLine: true,
                indent: 20,
                // expandedKeys: true,
                simple: true,
                strict: false
            },
        },
        'multi': {
            radio: false,
            model: {
                icon: 'show'
            }
        },
        'checkParent': {
            radio: true,
            tree: {
                clickExpand: false,
            }
        },
        'required': {
            layVerify: 'required',
            layReqText: '必填项不能为空！',
        },
    },
    _wrap_ec: function (ec, ds) {
        let name = ds['name'], required = ds['required'], multi = ds['multi'], checkParent = ds['checkParent'];
        if (name) ec.name = name;
        if (required) $.extend(true, ec, this.baseconf.required);
        if (multi) $.extend(true, ec, this.baseconf.multi);
        if (checkParent) $.extend(true, ec, this.baseconf.checkParent);
    },
    _x: function (selector, data, ec) {
        let conf = {
            el: selector,
            radio: true,
            clickClose: true,
            direction: 'auto',
            size: 'small',
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
        return layui.xmSelect.render(conf);
    },
    _set: function (key, nodeArr, valKey, nameKey) {
        let len = nodeArr.length;
        if (0 === len) {
            this._unset(key);
        } else {
            let id = nodeArr[0]?.[valKey];
            let name = nodeArr[0]?.[nameKey];
            _lbl_inst.values[`${key}_id`] = id;
            _lbl_inst.values[`${key}_name`] = name;
            let ids = [], names = [];
            nodeArr.forEach(n => {
                ids.push(n[valKey]);
                names.push(n[nameKey]);
                if (n.children) {
                    n.children.forEach(n2 => {
                        ids.push(n2[valKey]);
                        names.push(n2[nameKey]);
                    });
                }
            });
            _lbl_inst.values[`${key}_ids`] = ids.join(',');
            _lbl_inst.values[`${key}_names`] = names.join(',');
        }
    },
    _unset: function (key) {
        delete _lbl_inst.values[`${key}_id`];
        delete _lbl_inst.values[`${key}_name`];
        delete _lbl_inst.values[`${key}_ids`];
        delete _lbl_inst.values[`${key}_names`];
    },
    _dataset: function (selector) {
        let $span = $(selector).parent().prev().find('span');
        let ds = $span.data();
        if (ds.label) $span.text(ds.label);
        ds.echoValues = $span.get(0).dataset.echoValues ?? '';
        return ds;
    },
    renderYear: function (key) {
        let selector = `div[data-id=${key}]`;
        if ($(selector).length < 1) return;
        const that = this;
        let ds = that._dataset(selector);
        let nextYear = ds['nextYear'];
        let start = _cur_year;
        if (nextYear) start += 1;
        let data = Array(6).fill(0).map((_, idx) => {
            return {'name': start - idx, 'value': start - idx, 'selected': 0 === idx};
        });
        _lbl_inst.values[`${key}_id`] = _cur_year;
        _lbl_inst.values[`${key}_name`] = _cur_year;
        let ec = {
            on: function (d) {
                let node0 = d.arr[0];
                let year = node0.value;
                _lbl_inst.values[`${key}_id`] = year;
                _lbl_inst.values[`${key}_name`] = year;
                that.renderScoreLevelTree('lblProjectLevel', year);
                that.renderScoreLevelTree('lblScoreLevel', year);
                that.renderKnowledgeTree('lblKnowledge', year);
                _lbl_inst.lblActivityForm?.setValue([]);
                _lbl_inst.lblMedicalSystem?.setValue([]);
                _lbl_inst.change_year(year);
            },
        };
        that._wrap_ec(ec, ds);
        _lbl_inst[key] = that._x(selector, data, ec);
    },
    renderScoreLevelTree: function (key, year) {
        let selector = `div[data-id=${key}]`;
        if ($(selector).length < 1) return;
        const that = this;
        that._unset(key);
        let ds = that._dataset(selector);
        let viewMode = ds['viewMode'], echovs = ds['echoValues'];
        const r = (data) => {
            let ec = {
                prop: {
                    name: 'name',
                    value: 'id',
                },
                on: function (d) {
                    let node0 = d.arr[0];
                    if (node0) {
                        that._set(key, d.arr, 'id', 'name');
                        that.renderActivityForm('lblActivityForm', node0.id);
                        that.renderActivityContent('lblActivityContent', node0.id);
                        _lbl_inst.change_level(node0.id);
                    } else that._unset(key);
                },
                initValue: echovs.split(',')
            };
            $.extend(true, ec, that.baseconf.scoreLevel);
            that._wrap_ec(ec, ds);
            _lbl_inst[key] = that._x(selector, data, ec);
            if (echovs) {
                that._set(key, Array(subTreeById(data, node => node.id === echovs)), 'id', 'name');
            }
        }
        let arr = _label_data.scoreLevel;
        if (arr) r(buildTree(arr));
        else {
            getScoreLevelTreeLALA(year, viewMode ?? '111').then(({data}) => {
                if (data) r(data);
            });
        }
    },
    renderKnowledgeTree: function (key, year) {
        let selector = `div[data-id=${key}]`;
        if ($(selector).length < 1) return;
        const that = this;
        that._unset(key);
        let ds = that._dataset(selector);
        let echovs = ds['echoValues'];
        getKnowledgeTree({
            'standardKindId': _standardKindId,
            'cmeYear': year,
        }).then(({data}) => {
            if (data.success) {
                let ec = {
                    prop: {
                        name: 'knowledgeName',
                        value: 'knowledgeId',
                    },
                    on: function (d) {
                        that._set(key, d.arr, 'knowledgeId', 'knowledgeName');
                    },
                    initValue: echovs.split(',')
                };
                $.extend(true, ec, that.baseconf.knowledge);
                that._wrap_ec(ec, ds);
                _lbl_inst[key] = that._x(selector, data.data, ec);
                // echovs
            }
        });
    },
    renderActivityForm: function (key, slId) {
        let selector = `div[data-id=${key}]`;
        if ($(selector).length < 1) return;
        const that = this;
        that._unset(key);
        let ds = that._dataset(selector);
        let viewMode = ds['viewMode'], echovs = ds['echoValues'];
        getHoldTypeOptionLALA(slId, viewMode ?? '___').then(({data}) => {
            if (data.success) {
                let ec = {
                    prop: {
                        name: 'holdTypeName',
                        value: 'holdTypeId',
                    },
                    on: function (d) {
                        that._set(key, d.arr, 'holdTypeId', 'holdTypeName');
                    },
                    initValue: echovs.split(',')
                };
                that._wrap_ec(ec, ds);
                _lbl_inst[key] = that._x(selector, data.data, ec);
                // echovs
            }
        });
    },
    renderActivityWay: function (key) {
        let selector = `div[data-id=${key}]`;
        if ($(selector).length < 1) return;
        const that = this;
        that._unset(key);
        let ds = that._dataset(selector);
        getDictOption(5).then(({data}) => {
            if (data.success) {
                let ec = {
                    prop: {
                        name: 'dictName',
                        value: 'dictId',
                    },
                    on: function (d) {
                        that._set(key, d.arr, 'dictId', 'dictName');
                    },
                };
                that._wrap_ec(ec, ds);
                _lbl_inst[key] = that._x(selector, data.data, ec);
            }
        });
    },
    renderProjectType: function (key) {
        let selector = `div[data-id=${key}]`;
        if ($(selector).length < 1) return;
        const that = this;
        that._unset(key);
        let ds = that._dataset(selector);
        let ops = '' + ds['ops'];
        let data = [
            {'value': '1', 'name': '推荐项目'},
            {'value': '2', 'name': '推广项目'},
            {'value': '3', 'name': '非项目类'},
        ];
        let ec = {
            on: function (d) {
                that._set(key, d.arr, 'value', 'name');
            },
        };
        that._wrap_ec(ec, ds);
        _lbl_inst[key] = that._x(selector, data.filter(d => ops.includes(d.value)), ec);
    },
    renderActivityContent: function (key, slId) {
        let selector = `div[data-id=${key}]`;
        if ($(selector).length < 1) return;
        const that = this;
        that._unset(key);
        let ds = that._dataset(selector);
        let echovs = ds['echoValues'];
        // {'id': '3ecc6eaa-cc0a-11ef-bf0d-005056a64c01', 'name': '专业课', 'value': 1},
        // {'id': '3ecc6982-cc0a-11ef-bf0d-005056a64c01', 'name': '选修课', 'value': 2},
        // {'id': '3ecc6e3c-cc0a-11ef-bf0d-005056a64c01', 'name': '公需课', 'value': 3},
        const r = (data) => {
            let ec = {
                prop: {
                    name: 'scoreLevelContentName',
                    value: 'value',
                },
                on: function (d) {
                    that._set(key, d.arr, 'value', 'scoreLevelContentName');
                },
                initValue: echovs.split(',')
            };
            that._wrap_ec(ec, ds);
            _lbl_inst[key] = that._x(selector, data, ec);
            // echovs
        }
        if (_label_data.scoreLevelContent) r(_label_data.scoreLevelContent);
        else {
            getScoreLevelContentLALA(slId).then(({data}) => {
                if (data.success) r(data.data)
            });
        }
    },
    renderMedicalSystem: function (key) {
        let selector = `div[data-id=${key}]`;
        if ($(selector).length < 1) return;
        const that = this;
        that._unset(key);
        let ds = that._dataset(selector);
        let data = [
            {'value': '1', 'name': '西医'},
            {'value': '2', 'name': '中医'},
        ];
        let ec = {
            on: function (d) {
                that._set(key, d.arr, 'value', 'name');
            },
        };
        that._wrap_ec(ec, ds);
        _lbl_inst[key] = that._x(selector, data, ec);
    },
};
layui.config({
    base: '/js/layui/ext/',
}).use(['xmSelect'], function () {
    style();
    if ('undefined' !== typeof projectLabels) {
        projectLabels.lblYear = '年度';
        projectLabels.lblKnowledge = '学科';
        for (let key in projectLabels) {
            let $span = $(`span[data-id=${key}]`);
            $span.text(projectLabels[key]);
            $span.parent().next().empty().html(`<div data-id="${key}"></div>`);
        }
    }
    _sel_render.renderYear('lblYear'); // cme_year
    _sel_render.renderScoreLevelTree('lblProjectLevel', _cur_year); // 项目级别 score_level_id
    _sel_render.renderScoreLevelTree('lblScoreLevel', _cur_year); // 学分级别 score_level_id
    // 'lblActivityLevel' 活动级别 score_level_id
    _sel_render.renderKnowledgeTree('lblKnowledge', _cur_year); // 学科 knowledge_id
    _sel_render.renderActivityForm('lblActivityForm', ''); // 活动形式 hold_type_id
    _sel_render.renderActivityWay('lblActivityWay'); // 活动方式 hold_form_id
    //
    _sel_render.renderProjectType('lblProjectType'); // 项目类别 proj_type [0-非项目类,1-推荐项目,2-推广项目,3-非项目类]
    _sel_render.renderProjectType('lblActivityType'); // 活动类别 proj_type
    _sel_render.renderActivityContent('lblActivityContent', ''); // 活动内容 score_type [1-专业课,2-选修课,3-公需课]
    _sel_render.renderMedicalSystem('lblMedicalSystem'); // 所属医学体系 medical_type [1-西医,2-中医,3-蒙医]
});
// get
// 'cmeYear': _lbl_inst.getVal('lblYear_id'),
// 'scoreLevelId': _lbl_inst.getVal('lblScoreLevel_ids'),
// 'knowledgeId': _lbl_inst.getVal('lblKnowledge_ids'),
// 'holdTypeId': _lbl_inst.getVal('lblActivityForm_id'),
// 'holdFormId': _lbl_inst.getVal('lblActivityWay_id'),
// 'projType': _lbl_inst.getVal('lblProjectType_id'),
// 'scoreType': _lbl_inst.getVal('lblActivityContent_id'),
// 'medicalType': _lbl_inst.getVal('lblMedicalSystem_id'),
// echo
// 'lblYear': 'cmeYear',
// 'lblScoreLevel': 'scoreLevelId',
// 'lblKnowledge': 'knowledgeId',
// 'lblActivityForm': 'holdTypeId',
// 'lblActivityWay': 'holdFormId',
// 'lblProjectType': 'projType',
// 'lblActivityContent': 'scoreType',
// 'lblMedicalSystem': 'medicalType',
/*
<div class="layui-inline">
    <label class="layui-form-label"><span data-id="lblYear" data-name="cmeYear" data-required="0" data-label="" data-next-year="0">年度</span></label>
    <div class="layui-input-block"><div data-id=""></div></div>
</div>
<div class="layui-inline">
    <label class="layui-form-label"><span data-id="lblProjectLevel" data-name="scoreLevelId" data-required="0" data-label="" data-check-parent="0" data-view-mode="111">项目级别</span></label>
    <div class="layui-input-block"><div data-id=""></div></div>
</div>
<div class="layui-inline">
    <label class="layui-form-label"><span data-id="lblScoreLevel" data-name="scoreLevelId" data-required="0" data-label="" data-check-parent="0" data-view-mode="111">学分级别</span></label>
    <div class="layui-input-block"><div data-id=""></div></div>
</div>
<div class="layui-inline">
    <label class="layui-form-label"><span data-id="lblKnowledge" data-name="knowledgeId" data-required="0" data-label="" data-check-parent="0">学科</span></label>
    <div class="layui-input-block"><div data-id=""></div></div>
</div>
<div class="layui-inline">
    <label class="layui-form-label"><span data-id="lblActivityForm" data-name="holdTypeId" data-required="0" data-label="" data-multi="0" data-view-mode="___">活动形式</span></label>
    <div class="layui-input-block"><div data-id=""></div></div>
</div>
<div class="layui-inline">
    <label class="layui-form-label"><span data-id="lblActivityWay" data-name="holdFormId" data-required="0" data-label="">活动方式</span></label>
    <div class="layui-input-block"><div data-id=""></div></div>
</div>
<div class="layui-inline">
    <label class="layui-form-label"><span data-id="lblProjectType" data-name="projType" data-required="0" data-label="" data-ops="12">项目类别</span></label>
    <div class="layui-input-block"><div data-id=""></div></div>
</div>
<div class="layui-inline">
    <label class="layui-form-label"><span data-id="lblActivityType" data-name="projType" data-required="0" data-label="" data-ops="3">活动类别</span></label>
    <div class="layui-input-block"><div data-id=""></div></div>
</div>
<div class="layui-inline">
    <label class="layui-form-label"><span data-id="lblActivityContent" data-name="scoreType" data-required="0" data-label="">活动内容</span></label>
    <div class="layui-input-block"><div data-id=""></div></div>
</div>
<div class="layui-inline">
    <label class="layui-form-label"><span data-id="lblMedicalSystem" data-name="medicalType" data-required="0" data-label="">所属医学体系</span></label>
    <div class="layui-input-block"><div data-id=""></div></div>
</div>
*/