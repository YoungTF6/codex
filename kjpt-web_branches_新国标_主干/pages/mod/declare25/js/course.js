layui.config({
    base: '/js/layui/ext/'
}).extend({
    xmSelect: 'xm-select',
    lat: 'lat'
}).use(['table', 'layer', 'jquery', 'form', 'laydate', 'element', 'xmSelect', 'lat'], function () {
    let table = layui.table, layer = layui.layer, form = layui.form, laydate = layui.laydate, dropdown = layui.dropdown, element = layui.element;
    let $ = layui.jquery, xmSelect = layui.xmSelect, lat = layui.lat;
    const _defCourse = {
        // 'courseId': '',
        'teacherName': 'zhang',
        'certType': '3444541a-9703-44ed-aae6-9d8b01574916',
        'idCardNo': '123456199901011234',
        'titleId': 'ad054866-5331-4546-98bc-9b2f0124b22e',
        'researchDirection': '方向',
        'speciality': '专业',
        'workUnit': '单位',
        'phone': '12345678900',
        'teachTopic': '主题',
        'content': '内容',
        'period': '1',
        'teachingMethod': '面授',
    };
    const _course = JSON.parse(getOrDefault(localStorage.getItem('tmp_declare_course'), '{}'));
    const _mustCertId = 1 === +getOrDefault(getUrlParamByName('must_cert_id'), '0');
    const _holdYear = getOrDefault(getUrlParamByName('hold_year'), '');
    const _slId = getUrlParamByName('sl_id');
    const _projectType = getOrDefault(getUrlParamByName('project_type'), '1');
    let gTitleTd, gTitleSel, grdsel, gSpecialityTd, gSpecialitySel;
    const _verify_json = {
        'content': [/^$|^.{1,500}$/, '内容最多500个汉字'],
        'researchDirection': [/^$|^.{1,200}$/, '研究方向最多200个汉字'],
        'workUnit': [/^.{1,60}$/, '所在单位最多60个汉字'],
        'teacherType': [/^$|^.{0,20}$/, '最多20个汉字'],
        'myPhone': [/^$|^((\d{11})|((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})))$/, '电话号码格式不正确'],
        'period': function (value, item) {
            if (!_isGuangdong) return;

            const raw = (value || '').toString().trim();
            if (!raw) return;
            const num = Number(raw);
            if (!Number.isFinite(num) || num <= 0) return '学时必须为正数';

            const $form = $(item).closest('form');
            const teachingMethod = ($form.find('select[name=teachingMethod]').val() || '').toString();
            if (!teachingMethod || '-' === teachingMethod) return;

            if (teachingMethod.indexOf('面授') >= 0 && num > 3) return '面授课程时长小于等于3';
            if (teachingMethod.indexOf('实验') >= 0 && num > 5) return '实验课程时长小于等于5';
        },
    };
    const _tmArr = ['面授', '实验技术'];
    layer.ready(function () {
        fixForm();
        renderTeachingMethod();
        lat.renderCertTypeSel('select[name=certType]');
        lat.renderInnovationSel('select[name=innovation]');
        grdsel = lat.renderMultiSelector('div[name=researchDirection]', _options.teacherLeibie, {
            height: '200px',
            name: 'researchDirection',
            layVerify: isyuzhong() ? 'required' : '',
            layReqText: '必填项不能为空！',
        });
        renderTitleSel();
        renderSpecialitySel();
        $('#btn_cancel').on('click', function () {
            parent.layerclose();
        });
    });
    form.verify(_verify_json);
    form.on('submit(confirm)', function (data) {
        let fields = data.field;
        fields.titleId = gTitleSel.getValue('valueStr');
        fields.titleName = gTitleSel.getValue('nameStr');
        fields.researchDirection = getResearchDirection(fields);
        if (gSpecialitySel) {
            let selected = gSpecialitySel.getValue();
            fields.speciality = selected?.[0]?.personSpecName || selected?.[0]?.knowledgeName || gSpecialitySel.getValue('nameStr') || getOrDefault(_course.speciality, '');
        }
        if (isyuzhong()) {
            fields.teachTopic = '-';
            fields.teachingMethod = '-';
        }
        if (!fields.certType) fields.certType = null;
        localStorage.setItem('tmp_declare_course', JSON.stringify(fields));
        parent.layerclose();
        return false;
    });
    function getResearchDirection(fields) {
        if (isyuzhong()) {
            return grdsel?.getValue('nameStr') || '';
        }
        return ($('input[name="researchDirection"]:visible').val() || fields.researchDirection || '').toString().trim();
    }
    function echoForm() {
        if (!_course.courseId) {
            _course.courseId = uuid();
            // Object.assign(_course, _defCourse); //
        }
        form.val('course_form', _course);
        let tid = _course.titleId || '';
        gTitleSel && gTitleSel.setValue([tid]);
        grdsel && grdsel.setValue((_course.researchDirection || '').split(','));
    }
    function fixForm() {
        if (_mustCertId) {
            $('select[name=certType]').attr('lay-verify', 'required');
            $('input[name=idCardNo]').attr('lay-verify', 'required');
        }
        if (_isNeimeng) {
            $('input[name=speciality]').attr('lay-verify', 'required');
            _tmArr[0] = '理论授课';
        }
        if (_isNingxia) {
            // $.extend(true, _verify_json, {'period': [/^[1-9]\d*$/, '讲授时长必须为正整数'],});
            $.extend(true, _verify_json, {'period': [/^(?:0\.5|[1-9]\d*(?:\.5)?)$/, '讲授时长必须为0.5的倍数']});
            $('#period_label').text('讲授时长(小时)');
        }
        if (_isHenan) {
            $('#period_label').text('讲授时长(小时)');
            if (isyuzhong()) $('.yuzhong_hide').remove();
            else $('.only_yuzhong').hide();
        }
    }
    function isyuzhong() {
        return 'ddc04ee8-70d1-11f0-89b2-fa163e2ff656' === _slId;
    }
    function renderTeachingMethod() {
        let tmpArr = _tmArr;
        if (_isZhejiang) {
            tmpArr = ['理论', '实践'];
        }
        let str = tmpArr.map(i => `<option value='${i}'>${i}</option>`).join('');
        str = '<option></option>' + str;
        $('select[name=teachingMethod]').empty().append(str);
    }
    function renderTitleSel() {
        getTitleTreeData().then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                gTitleTd = jsonRes.data;
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
                layVerType: '请选择职称',
            };
            let d = JSON.parse(JSON.stringify(gTitleTd));
            gTitleSel = lat.renderTitleTreeSelector('#titleSel', d, conf);
            echoForm();
        });
    }
    function renderSpecialitySel() {
        if ($('#specialitySel').length < 1) return;

        let req = getKnowledgeTree({
            'standardKindId': _standardKindId,
            'cmeYear': _holdYear,
            'knowledgeSubject': _projectType
        });
        req.then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                gSpecialityTd = jsonRes.data || [];
            } else {
                lat.failMsg(jsonRes.msg);
            }
        }).catch(error => {
            lat.errorMsg('error:加载specTreeData');
        }).finally(() => {
            if (!gSpecialityTd) return;

            let initValue = '';
            let hasSpeciality = !!String(_course.speciality || '').trim();
            (function findNode(nodes) {
                if (!Array.isArray(nodes) || initValue) return;
                for (let i = 0; i < nodes.length; i++) {
                    let item = nodes[i];
                    if (!item) continue;
                    if (item.personSpecName === _course.speciality || item.knowledgeName === _course.speciality) {
                        initValue = item.personSpecId || item.knowledgeId || item.value || '';
                        return;
                    }
                    findNode(item.children);
                }
            })(gSpecialityTd);

            let conf = {
                initValue: initValue ? [initValue] : [],
                tree: {
                    clickExpand: true,
                },
                name: 'speciality',
                layVerify: 'required',
                layReqText: '请选择从事专业',
            };
            let d = JSON.parse(JSON.stringify(gSpecialityTd));
            gSpecialitySel = lat.renderKnowledgeTreeSel('#specialitySel', d, conf, false);
            if (!hasSpeciality) {
                gSpecialitySel.setValue([]);
            }
            echoForm();
        });
    }
});