(function (win, $) {
    'use strict';

    if (!$) return;

    // 浙江套专家通知的通用触发条件。
    var RULE = {
        standardKindId: '190c480d-d43c-450b-8472-a6fd00a6729d',
        userType: '15'
    };

    // 按顺序判断通知配置，前面的优先级更高。
    var NOTICE_CONFIGS = [
        {
            key: 'taizhou',
            appointUnitId: '330010',
            appointYear: 2026,
            startTime: '2026-04-07 09:00:00',
            endTime: '2026-04-11 12:00:00',
            title: '2026年台州市级继教项目评审-专家须知',
            content: ''
                + '<div style="text-indent:2em;">专家，您好！欢迎参加台州市2026年市级继续医学教育项目网络评审工作。现将有关事项告知如下：</div>'
                + '<div style="font-size:18px;font-weight:700;">一、评审时间</div>'
                + '<div style="text-indent:2em;">2026年4月8日9:00—4月11日12:00，逾期网络将关闭。请您务必在规定时间内完成评审。</div>'
                + '<div style="margin-top:10px;font-size:18px;font-weight:700;">二、评审标准</div>'
                + '<div style="text-indent:2em;">根据《关于开展2026年台州市市级继续医学教育推荐项目征集工作的通知》（台继委办发〔2026〕1号）精神，台州市继续医学教育项目要紧紧围绕我市卫生健康事业发展和医教研实际需求，紧跟医学发展前沿，以需求为导向，基层为重点，提升老百姓就医获得感为目标，提高全市卫生专业技术人员专业知识、临床技能和综合素质为目的。培训内容须契合医学领域的新理论、新知识、新技术和新方法，具有针对性、实用性和创新性，项目管理严谨，课程设计严密，展现形式新颖，学时分配合理，培训质量可靠。</div>'
                + '<div style="text-indent:2em;">我市对项目申报书做了特别要求，增加了项目及负责人简况一栏，主要从以下四方面展开：1.本领域的最近进展及存在的问题；2项目的目标及创新之处;3.主办单位近几年与项目有关的工作概况(包括开展的培训、科研工作以及师资队伍情况)；4.项目负责人在临床、教学、学术方面的主要经历和获得成绩等信息，供专家对项目作进一步了解，请专家总体把握。项目申报表所列内容应逐项认真填报，内容不能过于简单或漏填。为推动我市远程继续医学教育可持续发展，落实基层减负措施，线上线下一体化发展，线上继续医学教育项目可适当优先考虑。评审中应注意兼顾项目学科的覆盖面，注重学科之间的均衡性。</div>'
                + '<div style="text-indent:2em;">具体请参考《台州市市级继续医学教育项目评审标准》（附件1）开展项目评审。</div>'
                + '<div style="margin-top:10px;font-size:18px;font-weight:700;">三、操作说明</div>'
                + '<div style="padding-left:2em;text-indent:-2em;">（一）评审时请根据《台州市市级继续医学教育项目评审标准》（附件1）对所有项目进行评审。具体操作流程详见《台州市级项目专家评审操作说明》（附件2）。该项目评审结束后可从“评审状态”里了解评审结果，若对已评审结果有异议，截止时间前可以重新点击“审批”进行修改。</div>'
                + '<div style="padding-left:2em;text-indent:-2em;">（二）评审结果分为同意和不同意，不同意需写明理由，可直接写入理由，也可从左边选择理由。（对组内每个项目打分并给出评审意见：明确推荐的项目打分应在90分以上，可推荐的项目打分应在80-70分之间，明确不推荐的项目应在60分以下）。</div>'
                + '<div style="padding-left:2em;text-indent:-2em;">（三）评审名额：同意比例70%，要根据专业而定，兼顾专业之间的均衡性，比如公卫-管理-护理组，公卫、管理和护理的项目同意比例分别控制在70%左右，多评视作无效。</div>'
                + '<div style="text-indent:2em;">遇到系统操作问题请联系严黄韫文。</div>'
                + '<div style="margin-top:10px;font-size:18px;font-weight:700;">四、其他要求</div>'
                + '<div style="text-indent:2em;">评审专家不与评审方发生有违公正的联系，不接受与被评审项目有关的单位和个人的利益馈赠。</div>'
                + '<div style="text-indent:2em;">评审专家请于4月11日12:00之前完成评审，并将评审结果打印签字后以PDF形式发至978438865@qq.com。</div>'
                + '<div style="margin-top:10px;font-size:18px;font-weight:700;">五、联系方式</div>'
                + '<div style="text-indent:2em;">联系单位：台州市继续医学教育委员会办公室</div>'
                + '<div style="text-indent:2em;">地    址：椒江区东海大道608号台州市卫生健康委312室</div>'
                + '<div style="text-indent:2em;">联 系 人：郑敏洁 15857676710 严黄韫文 13968402567</div>'
                + '<div style="margin-top:12px;text-indent:2em;">感谢您的大力支持！</div>'
                + '<div style="text-align:right;margin-top:14px;">台州市继续医学教育委员会办公室</div>'
                + '<div style="text-align:right;">2026年4月7日</div>'
        },
        {
            key: 'yiwu',
            appointUnitId: '330016',
            appointYear: 2026,
            startTime: '',
            endTime: '2026-04-13 23:59:59',
            title: '2026年义乌市级继续医学教育项目专家评审须知',
            content: ''
                + '<div style="font-size:18px;font-weight:700;">一、评审时间</div>'
                + '<div>2026年4月1-13日。</div>'
                + '<div style="margin-top:10px;font-size:18px;font-weight:700;">二、评审要求</div>'
                + '<div>（1）评审应本着公正、公平、严谨的作风，评审过程须遵循学术诚信和廉政要求。</div>'
                + '<div>（2）项目评审须以需求和质量为导向，紧密契合医学领域的新理论、新知识和新方法，围绕临床实际问题，要求项目内容新颖、设计周密、学时分配合理，不支持低质量重复、内容陈旧、照搬书本的继教项目。</div>'
                + '<div>（3）大力支持远程继续医学教育精品课程。</div>'
                + '<div style="margin-top:10px;font-size:18px;font-weight:700;">三、评审操作步骤</div>'
                + '<div>（1）登录网址：https://cme.wsjkw.zj.gov.cn/（继续医学教育管理系统），输入账号：zj+专家身份证号码；密码：身份证后6位，按照要求修改密码后完成登录。</div>'
                + '<div>（2）点击左边的导航菜单的“项目评审”，该页面会显示需要您评审的所有项目。</div>'
                + '<div>（3）可点击“申请代码”查看项目申报表的详细信息。</div>'
                + '<div>（4）点击“评审”可以直接对该项目进行评审，评审结果分为推荐通过和不推荐通过。</div>'
                + '<div style="padding-left:1em;">推荐通过项目分为优秀90-100分、良好76-89分；</div>'
                + '<div style="padding-left:1em;">不推荐通过项目：分数小于等于75分，要求注明理由，可直接写，也可从左边选择理由。</div>'
                + '<div style="padding-left:1em;">评审通过比例为40-50%，各项目之间应有明显的分差（对项目数量较少的学科，按照项目质量判定）。</div>'
                + '<div>（5）该项目评审结束后，可从“审批状态”里了解评审结果。若对已评审的结果有异议，也可重新点击“评审”-“重置”进行修改。</div>'
                + '<div style="margin-top:12px;">感谢您对我市继续医学教育工作的支持！</div>'
                + '<div style="text-align:right;margin-top:14px;">义乌市继续医学教育分中心</div>'
                + '<div style="text-align:right;">2026年3月30日</div>'
        },
        {
            key: 'shaoxing',
            appointUnitId: '330007',
            appointYear: 2026,
            startTime: '2026-04-22 00:00:00',
            endTime: '2026-04-29 23:59:59',
            title: '2026年绍兴市市级继续医学教育项目专家评审须知',
            content: ''
                + '<div style="font-size:18px;font-weight:700;">一、评审时间</div>'
                + '<div>2026年4月22日-4月29日。</div>'
                + '<div style="margin-top:10px;font-size:18px;font-weight:700;">二、评审要求</div>'
                + '<div><strong>推荐通过率控制在50%（不同意项目<span style="color:red;">小于60分</span>；同意项目分为优秀：<span style="color:red;">90-100分</span>、良好：<span style="color:red;">70-89分</span>、中等<span style="color:red;">60-69分</span>）。</strong></div>'
                + '<div>（1）评审应本着公正、公平、严谨的作风进行评审，评审过程须遵循学术诚信和廉政要求。</div>'
                + '<div>（2）项目评审须按照需求和质量为导向，紧密契合医学领域的新理论、新知识和新方法，围绕临床实际问题，要求项目内容新颖，设计周密，学时分配合理，不支持低质量重复、内容陈旧、照搬书本的继教项目。</div>'
                + '<div style="margin-top:10px;font-size:18px;font-weight:700;">三、评审操作步骤</div>'
                + '<div>（1）登录浙江省继续医学教育管理系统网址：https://cme.wsjkw.zj.gov.cn/index.html（<strong>原始密码为证件号后六位，请自行修改</strong>）。</div>'
                + '<div>（2）点击左边的“项目评审”，在弹出页面中进行评审操作。</div>'
                + '<div>（3）可点击项目编号查看项目申报表详细信息。</div>'
                + '<div>（4）点击“评审”可以直接参照评价等级与标准对该项目进行打分，并选择“推荐通过”和“不推荐通过”，打分完毕后根据要求输入评审意见。</div>'
                + '<div>（5）该项目评审结束关闭后可从“项目评审”页面了解评审状态，若对已评审结果有异议也可以重新点击“评审”进行重置修改。</div>'
                + '<div style="margin-top:12px;">请务必在评审时间内完成对项目的评审，逾期网络将自动关闭，感谢您对我市继续医学教育工作的支持！</div>'
        }
    ];

    var MODAL_ID = 'expert-notice-modal';
    var MASK_ID = 'expert-notice-mask';

    function log() {
        if (!win.console) return;
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[ExpertNotice]');
        console.log.apply(console, args);
    }

    // 只有浙江套的专家用户，才需要进入这套通知判断流程。
    function shouldRun(userType, standardKindId) {
        return String(userType || '') === RULE.userType
            && String(standardKindId || '') === RULE.standardKindId;
    }

    function inTimeRange(config) {
        var now = Date.now();
        var start = config.startTime ? new Date(config.startTime.replace(/-/g, '/')).getTime() : null;
        var end = config.endTime ? new Date(config.endTime.replace(/-/g, '/')).getTime() : null;
        var ok = (start === null || now >= start) && (end === null || now <= end);
        log('time-check', config.key, ok);
        return ok;
    }

    function getActiveConfigs() {
        return NOTICE_CONFIGS.filter(inTimeRange);
    }

    // 后端 data 可能返回数组、对象或字符串，这里统一整理成数组，后面判断更简单。
    function normalizeList(data) {
        if (Array.isArray(data)) return data;
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                var p = JSON.parse(data);
                return Array.isArray(p) ? p : (p ? [p] : []);
            } catch (e) {
                return [];
            }
        }
        if (typeof data === 'object') return [data];
        return [];
    }

    // 单条聘用记录只有同时命中单位和年度，才算需要弹窗。
    function matchAppointment(row, config) {
        if (!row || typeof row !== 'object') return false;
        var unitId = String(row.appointUnitId || row.appoint_unit_id || '');
        var year = Number(row.appointYear || row.appoint_year || 0);
        return unitId === config.appointUnitId && year === config.appointYear;
    }

    function getHeaders(userId) {
        return {
            'Authorization': localStorage.getItem('token'),
            'KJPT-USER-ID': userId,
            'cmestandard-id': localStorage.getItem('standardkind-id')
        };
    }

    // 优先使用登录返回里保存的专家 id。
    // 如果 localStorage 里没有，就再查一次用户详情接口兜底获取。
    function withExpertId(userId, done) {
        var expertId = localStorage.getItem('com-user-entity-id');
        if (expertId) {
            done(expertId);
            return;
        }

        $.ajax({
            url: huayi_permission_url + 'comuser/detail',
            type: 'GET',
            dataType: 'json',
            data: { userId: userId },
            headers: getHeaders(userId),
            success: function (resp) {
                var eid = (resp && resp.data && resp.data.base && resp.data.base.comUserEntityId)
                    || (resp && resp.data && resp.data.comUserEntityId)
                    || '';
                if (eid) localStorage.setItem('com-user-entity-id', eid);
                log('expert-id-ready', !!eid);
                done(eid);
            },
            error: function () {
                log('expert-id-error');
                done('');
            }
        });
    }

    // 调聘用接口，判断当前专家是否命中“单位 + 年度”规则。
    function requestAppointment(expertId, config, done) {
        if (!expertId) {
            done(false);
            return;
        }
        $.ajax({
            url: huayi_personorg_url + 'projectExpert/getExpertAppointmentList',
            type: 'GET',
            dataType: 'json',
            data: {
                expertId: expertId,
                appointUnitId: config.appointUnitId
            },
            headers: getHeaders(localStorage.getItem('user-id')),
            success: function (resp) {
                var list = normalizeList(resp && resp.data);
                var matched = list.some(function (row) {
                    return matchAppointment(row, config);
                });
                log('appointment-match', config.key, matched);
                done(matched);
            },
            error: function () {
                log('appointment-error', config.key);
                done(false);
            }
        });
    }

    // 弹窗正文由配置驱动，后面新增地区通知时，只补配置即可。
    function noticeHtml(config) {
        return ''
            + '<div style="display:flex;flex-direction:column;background:#fff;border-radius:12px;overflow:hidden;">'
            + '  <div style="position:relative;padding:14px 56px 12px;border-bottom:1px solid #f0f0f0;flex:0 0 auto;">'
            + '    <div style="text-align:center;font-size:32px;font-weight:700;line-height:1.35;">' + config.title + '</div>'
            + '    <a href="javascript:;" class="notice-close" style="position:absolute;right:18px;top:50%;transform:translateY(-50%);font-size:38px;line-height:1;color:#666;text-decoration:none;">×</a>'
            + '  </div>'
            + '  <div style="padding:10px 22px 14px;max-height:min(62vh,620px);overflow-y:auto;color:#333;line-height:1.95;font-size:16px;">'
            + config.content
            + '  </div>'
            + '</div>';
    }

    // 每次打开前先清掉旧弹层，避免重复插入。
    function closeNotice() {
        $('#' + MODAL_ID).remove();
        $('#' + MASK_ID).remove();
        $('body').css('overflow', '');
    }

    // 用原生 DOM 方式渲染全屏遮罩和弹窗，避免依赖 layer.open 的兼容性问题。
    function openNotice(config) {
        log('open-notice', config.key);
        closeNotice();

        var maskHtml = '<div id="' + MASK_ID + '" style="position:fixed;inset:0;background:rgba(15,23,42,.32);backdrop-filter:blur(2px);z-index:999998;"></div>';
        var modalHtml = ''
            + '<div id="' + MODAL_ID + '" style="position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(980px,calc(100vw - 48px));max-height:min(76vh,760px);background:#fff;border-radius:12px;box-shadow:0 24px 80px rgba(0,0,0,.24);overflow:hidden;z-index:999999;">'
            + noticeHtml(config)
            + '</div>';

        $('body').append(maskHtml).append(modalHtml).css('overflow', 'hidden');
        $('#' + MODAL_ID).find('.notice-close').on('click', closeNotice);
    }

    function resolveNotice(expertId, configs, done, index) {
        index = index || 0;
        if (index >= configs.length) {
            done(null);
            return;
        }
        requestAppointment(expertId, configs[index], function (matched) {
            if (matched) {
                done(configs[index]);
                return;
            }
            resolveNotice(expertId, configs, done, index + 1);
        });
    }

    win.ExpertNoticeHelper = {
        // index.html 调用的入口函数：
        // 1. 先判断是不是浙江套专家
        // 2. 显示全屏 loading
        // 3. 获取专家 id
        // 4. 查询聘用信息
        // 5. 命中规则则关闭 loading 并弹通知
        showIfNeeded: function (options) {
            options = options || {};
            log('showIfNeeded');
            if (!shouldRun(options.userType, options.standardKindId)) return;
            var activeConfigs = getActiveConfigs();
            if (!activeConfigs.length) return;

            var loadingIndex = options.layer ? options.layer.load(1, { shade: [0.25, '#000'] }) : null;
            withExpertId(localStorage.getItem('user-id'), function (expertId) {
                resolveNotice(expertId, activeConfigs, function (matchedConfig) {
                    if (options.layer && loadingIndex !== null) options.layer.close(loadingIndex);
                    if (matchedConfig) openNotice(matchedConfig);
                });
            });
        }
    };
})(window, window.jQuery);
