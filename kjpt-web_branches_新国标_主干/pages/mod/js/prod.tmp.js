let cur_href = window.location.href;
//
if (_isNingxia && cur_href.includes('group/modals')) {
    debugger;
    let $pi = $('input[name=period]'), $si = $('input[name=score]');
    $si.attr('disabled', true).addClass("layui-disabled");
    $pi.on('keyup', function () {
        let period = Number(this.value);
        if (1 <= period && period < 6) score = 0.2;
        else if (6 <= period) score = 1;
        else score = 0;
        $si.val(score);
    });
}
//
if (_isQinghai && cur_href.includes('declare25/qinghai/index')) {
    debugger;
    $('input[name=proj_score]').attr({'disabled': true, 'placeholder': ''}).addClass('disabled_ipt');
    $('#page_proj_progress > div.table_box > table > tbody > tr:nth-child(2) > td:nth-child(1)').text('').css({
        'background-image': 'url(/pages/mod/declare25/css/progress_label.png)',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
        'background-size': 'contain',
    });
    $.extend(true, _echo, {
        default: {
            course: function (course, idx) {
                return `<tr class="may_recall" data-id="${getOrDefault(course.courseId, '')}">
                <td data-before>${0 === idx ? '项目负责人' : '&emsp;'}</td>
                <td>${getOrDefault(course.teacherName, '')}</td>
                <td data-title-id="${course.titleId || ''}">${getOrDefault(course.titleName, '')}</td>
                <td>${getOrDefault(course.workUnit, '')}</td>
                <td>${getOrDefault(course.teachTopic, '')}</td>
                <td data-after>${getOrDefault(course.period, '')}</td>
            </tr>`;
            },
        }
    });
    $.extend(true, _fm, {
        calc: {
            calcScore: function () {
                const that = this;
                that.score = Math.floor(this.period / 3);
                $('input[name=proj_score]').val(that.score);
            }
        }
    });
}
//
axios.interceptors.request.use(function (config) {
    config.headers['Authorization'] = localStorage.getItem('token');
    config.headers['KJPT-USER-ID'] = localStorage.getItem('user-id');
    let target_url = config.url;
    // if (_isNeimeng
    //     && cur_href.includes('declare25/neimeng/index')
    //     && target_url.includes('/option/knowledge/tree/data')) {
    //     debugger;
    //     config.data.state = 1;
    // }
    if (_isQinghai) {
        // if (target_url.includes('/option/knowledge/tree/data')) {
        //     debugger;
        //     config.data.state = 1;
        // }
        if (target_url.includes('/declare/prin/sou')) {
            debugger;
            config.data.personName = $('#page_course > div.table_box > table > tbody > tr:nth-child(1) > td:nth-child(2)').text();
            config.data.workUnit = $('#page_course > div.table_box > table > tbody > tr:nth-child(1) > td:nth-child(4)').text();
            let titleid = $('#page_course > div.table_box > table > tbody > tr:nth-child(2) > td:nth-child(3)').data('title-id');
            if (titleid) config.data.titleId = titleid;
        }
        if (target_url.includes('/declare/course/saveOrUpdate')) {
            debugger;
            if ((Array.isArray(config.data)) && config.data.length > 0) {
                config.data.forEach(_ => {
                    if (!_.teachingMethod) _.teachingMethod = '面授';
                });
            }
        }
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});
//
axios.interceptors.response.use(function (response) {
    // response.config.url.includes('sjwh/option/scoreLevel');
    if (_isNingxia && cur_href.includes('mod/interim')) {
        if (response.config.url.includes('sjwh/option/scoreLevel/list')) {
            debugger;
            response.data.data = [
                {'scoreLevelId': '9fc0ebe2-a98a-11f0-a821-005056a64c01', 'scoreLevelName': '国家级推荐项目'},
                {'scoreLevelId': '9fc492c4-a98a-11f0-a821-005056a64c01', 'scoreLevelName': '自治区级推荐项目'},
                {'scoreLevelId': '9fc52b76-a98a-11f0-a821-005056a64c01', 'scoreLevelName': '市级推荐项目'},
                {'scoreLevelId': '9fc59f5c-a98a-11f0-a821-005056a64c01', 'scoreLevelName': '国家级推广项目'},
                {'scoreLevelId': '9fc615a4-a98a-11f0-a821-005056a64c01', 'scoreLevelName': '自治区级推广项目'},
            ];
            return response;
        }
    }
    return response;
}, function (error) {
    return Promise.reject(error);
});
setTimeout(() => {
    if (_unitId === '060002' && cur_href.includes('group/modals')) {
        debugger;
        $('option[value=8bfb5dff-fbcb-46ee-aba0-a58e00ad9902]').remove();
        $('dd[lay-value=8bfb5dff-fbcb-46ee-aba0-a58e00ad9902]').remove();
        layui.form.render();
    }
    if (_isNingxia && cur_href.includes('mod/interim')) {
        debugger;
        layui.use(['form'], function () {
            $('#scoreLevelSelector2').empty().append(`
                    <option></option>
                    <option value=""></option>
                    <option value=""></option>
                    <option value=""></option>
                    <option value=""></option>
                    <option value=""></option>
                    `);
            layui.form.render('select');
        });
    }
    if(cur_href.includes('audit/ningxia2.html')) {
        debugger;
        let yearbox = (_selector, begin = 2025, cnt = 7) => {
            let $bx = $(_selector);
            let str = '';
            Array(cnt).fill(0).forEach((_, idx) => {
                let year = begin - idx;
                let checked = idx < 3 ? "checked" : "";
                str += `<input type="checkbox" name="cmeYear[${year}]" value="${year}" title="${year}" ${checked} lay-skin="primary" lay-filter="cmeYearCheckBox">`;
            });
            $bx.html(str);
            layui.form.render('checkbox');
        };
        yearbox('#year_checkbox_container', 2025);
    }
}, 500);
//
getAction(`${huayi_sjwh_url}option/comDict/list/5`).then(response => {
    let jsonRes = response.data;
});
