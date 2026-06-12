let createBaseHtml = function () {
    var html =  `
    <div class="layui-fluid">
    <div class="layui-card">
        <!-- 查询区域 -->
        <div class="layui-form layui-card-header layuiadmin-card-header-auto condition-area">
            <!-- row1 -->
            <div class="layui_mess">
                <!-- 筛选项 -->
                <div class="layui_display">
                    <div class="layui-inline">
                        <label class="layui-form-label">选择年度</label>
                        <div class="layui-input-block">
                            <select id="cmeYearSelector" name="cmeYear" lay-filter="cmeYearSelector">
                            </select>
                        </div>
                    </div>
                    <div class="layui-inline layui-form">
                        <label class="layui-form-label">职称</label>
                        <div class="layui-input-block">
                            <input type="text" name="titleName" placeholder="" autocomplete="off"
                                   class="layui-input layui-disabled" disabled/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 显示区域 -->
        <!-- 1.PassStandard -->
        <div class="layui-card-body layui_body_box pass_rule" id="passStandardDiv">
            <div class="db_tit">
                <img src="/pages/mod/img/t_img.png">
                <h1>达标情况</h1>
            </div>
            <div class="db_mess">
                <div class="yon_node" style="display: none">
                    <ul>
                        <li class="text_left1 img_bdb">
                            <span>李四</span>
                            <p>230121197804024617</p>
                        </li>
                        <li class="xg_box_bdb"></li>
                        <li class="text_left2">
                            <h3 class="bdb">不达标</h3>
                            <p class="zong_text">未知</p>
                        </li>
                    </ul>
                </div>
                <div class="yon_node" style="display: none">
                    <ul>
                        <li class="text_left1 img_db">
                            <span>张三</span>
                            <p>230121197804024617</p>
                        </li>
                        <li class="xg_box_db"></li>
                        <li class="text_left2" style="background: #E5F6E8">
                            <h3 class="db" id="db">达标</h3>
                        </li>
                    </ul>
                </div>
                <div class="yon_node" style="display: none">
                    <ul>
                        <li class="text_left1 img_bdb">
                            <span>李四</span>
                            <p>230121197804024617</p>
                        </li>
                        <li class="xg_box_bdb"></li>
                        <li class="text_left2">
                            <h3 class="db" style="color:#ff2e2e">达标标准未作要求</h3>
                        </li>
                    </ul>
                </div>
            </div>
            <!--<div class="item_text"></div>-->
        </div>
        <!-- 2.ScoreTotal -->
        <div id="scoreTotalDiv" class="layui-card-body layui_body_box score_total">
            <div class="db_tit">
                <img src="/pages/mod/img/t_img.png">
                <h1>学分情况概览</h1>
            </div>
            <div class="xuefen_box" id="score_total">
                <ul class="xuefen_item" style="margin-bottom: 16px;">
                    <li>
                        <img src="/pages/mod/img/xf_img.png">
                        <p>全部学分</p>
                    </li>
                    <li>
                        <h1 data-id="total_score">-</h1><span>总学分</span>
                    </li>
                    <li class="col">
                        <h1 data-id="total_period">-</h1><span>总学时</span></li>
                    <li>
                        <h1 data-id="score1">-</h1><span data-label="score1"></span>
                    </li>
                    <li>
                        <h1 data-id="score2">-</h1><span data-label="score2"></span>
                    </li>
                    <li>
                        <h1 data-id="score3"></h1><span data-label="score3"></span>
                    </li>
                </ul>
                <ul class="xuefen_item">
                    <li class="layui-col-xs2">
                        <img src="/pages/mod/img/db_img.png">
                        <p>计入达标学分</p>
                    </li>
                    <li>
                        <h1 data-id="total_score_y">-</h1><span>总学分</span></li>
                    <li class="col">
                        <h1 data-id="total_period_y">-</h1><span>总学时</span></li>
                    <li>
                        <h1 data-id="score1_y">-</h1><span data-label="score1"></span></li>
                    <li>
                        <h1 data-id="score2_y">-</h1><span data-label="score2"></span></li>
                    <li>
                        <h1 data-id="score3_y"></h1><span data-label="score3"></span></li>
                </ul>
            </div>
        </div>
        <!-- 3.ScoreDetail -->
        <div id="scoreDetailDiv" class="layui-card-body layui_body_box score_detail">
            <div class="db_tit">
                <img src="/pages/mod/img/t_img.png">
                <h1>学分明细</h1>
            </div>
            <table class="layui-table" id="scoreDetailTable" lay-filter="scoreDetailTable"
                   style="margin-top: 20px;"></table>
        </div>
    </div>
</div>
    `;
    $('body').html(html);
}

createBaseHtml();


layui.config({
    base: '/js/layui/ext/'
}).extend({
    xmSelect: 'xm-select',
    lat: 'lat'
}).use(['table', 'layer', 'jquery', 'form', 'laydate', 'element', 'xmSelect', 'lat'], function () {
    let table = layui.table;
    let layer = layui.layer;
    let form = layui.form;
    let laydate = layui.laydate;
    let dropdown = layui.dropdown;
    let element = layui.element;
    let $ = layui.jquery;
    let xmSelect = layui.xmSelect;
    let lat = layui.lat;
    let gLayerIndex = -1;
    let gPassStandardVoList = [];
    let gScoreTotalList = [];
    let gScoreDetailList = [];
    const _comPersonId = PseudoNull.UUID;
    let gPersonName = '';
    let gCertId = '';
    let gCmeYear = '';
    let gTitleName = '';
    let gPassResult;
    // 最新年度
    let gLatestCmeYear = '';
    var standardkindId = localStorage.getItem("standardkind-id");
    var is_zhejiang = standardkindId == '190c480d-d43c-450b-8472-a6fd00a6729d',
        IS_GUANG_DONG = StandardKind.GUANG_DONG == standardkindId;
    if (standardkindId == '73ba18db-33fd-4746-ab41-9beb009f69a1') {
        // 隐藏id=passStandard 
        $('#passStandardDiv').hide();
    }
    

    let createTableToolbar = function () {
        return `<div>
            <a class="layui-btn layui-btn-sm" onclick="exportExcel()" style="float: right;margin-right: -120px;">导出Excel</a>
        </div>`;
    }

    /* 获取配置 */
    window.getConfig = function (configNames) {
        $.ajax({
            async: false,
            type: 'post',
            url: huayi_sjwh_url + 'cmeCommonConfig/getConfigByUnitFromRedis',
            data: {
                unitId: localStorage.getItem("unit-id"),
                configNames: configNames,
            },
            success: function (res) {
                if (res.success == true) {
                    window[configNames] = res.data[configNames];
                } else {
                    layer.msg('获取配置失败');
                }
            },
            error: function () {
                layer.msg('获取配置失败');
            }
        });
    }
    // 根据配置, 隐藏scoreTotalDiv passStandardDiv scoreDetailDiv
    window.initScoreTotalDiv = function () {
        getConfig('fn_person_pass_view');
        let selectedYear = $('#cmeYearSelector').find("option:selected").text();
        if (gLatestCmeYear == selectedYear && window["fn_person_pass_view"]) {
            window["fn_person_pass_view"].split(',').forEach(item => {
                item && $("#" + item).hide();
            });
        } else {
            $('#scoreTotalDiv').show();
            $('#passStandardDiv').show();
            $('#scoreDetailDiv').show();
        }
    }
    form.on('select(cmeYearSelector)', function (data) {
        changeCmeYear();
    });
    /**
     * 导出 Excel：导出列跟随 `renderScoreDetailTable()` 的动态列配置。
     */
    window.exportExcel = function () {
        let passTitleName = "达标结果";
        if (window.TextReplaceTool && typeof window.TextReplaceTool.replaceTableText === 'function') {
            window.TextReplaceTool.replaceTableText(gScoreDetailList);
            window.TextReplaceTool.replaceTableText(window.__scoreDetailColumns);
            gPassResult = window.TextReplaceTool.replaceTableText(gPassResult);
            passTitleName = window.TextReplaceTool.replaceTableText(passTitleName);
        }
        ltable2excel2(gScoreDetailList, gPersonName, gTitleName, gCmeYear, passTitleName, gPassResult, window.__scoreDetailColumns);
    };
    $(function () {
        renderScoreDetailTable();
        renderCmeYearSelector();
    });
    function renderCmeYearSelector() {
        let visit = huayi_projectscore_url + 'ps/cmeYearList/person/' + _userId;
        getAction(visit).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                let cmeYearSelector = $('#cmeYearSelector');
                let personCmeYearVoList = jsonRes.data;
                personCmeYearVoList.forEach((personCmeYearVo, index) => {
                    $(cmeYearSelector).append(new Option(personCmeYearVo.cmeYear, personCmeYearVo.titleName, 0 === index, 0 === index));
                    if (index === 0) {
                        $('input[name="titleName"]').val(personCmeYearVo.titleName.split('|')[2]);
                        gLatestCmeYear = personCmeYearVo.cmeYear;
                    }
                });
                form.render('select');
            }
        }).catch(error => {
            layer.msg('error:加载年度');
        }).finally(() => {
            changeCmeYear();
        });
    }
    function changeCmeYear() {
        let cmeYearSelector = $("#cmeYearSelector");
        let titleNameInput = $('input[name="titleName"]');
        let selectedText = $(cmeYearSelector).find("option:selected").text();
        let selectedVal = $(cmeYearSelector).val();
        if (window.TextReplaceTool && typeof window.TextReplaceTool.changeYear === 'function') {
            let selArr = selectedVal.split('|');
            window.TextReplaceTool.changeYear(selArr[0]);
            window.TextReplaceTool.forceReplaceText();
        }

        if (!selectedVal) {
            $(titleNameInput).html('职称')
        } else {
            let selArr = selectedVal.split('|');
            let cmeYear = selArr[0];
            let unitId = selArr[1];
            let titleName = selArr[2];
            let titleId = selArr[3];
            gCmeYear = cmeYear;
            gTitleName = titleName;
            $(titleNameInput).val(titleName)
            let visit = huayi_projectscore_url + 'ps/all/person';
            let params = {
                cmeYear: cmeYear,
                standardKindId: _standardKindId,
                unitId: unitId,
                comPersonId: _comPersonId,
                titleId: titleId,
                userId: _userId
            };
            let msg = '<span style="color: #666666;">&nbsp;正在查询&nbsp;···</span>';
            gLayerIndex = layer.msg(msg, {icon: 16, shade: 0.3, time: 0});
            postAction(visit, params).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    let rdd = jsonRes.data;
                    gPersonName = rdd.personName;
                    gCertId = rdd.certId;
                    $('.text_left1 span').html(gPersonName);
                    $('.text_left1 p').html(gCertId);
                    gPassStandardVoList = rdd.passStandardVoList;
                    gScoreTotalList = rdd.scoreTotalList;
                    gScoreDetailList = rdd.scoreDetailList;
                }
            }).catch(error => {
                layer.msg('error:加载获取达标信息');
            }).finally(() => {
                renderPassStandard(gPassStandardVoList);
                renderScoreTotal(gScoreTotalList);
                renderScoreDetail(gScoreDetailList);
                initScoreTotalDiv();
                layer.close(gLayerIndex);
            });
        }
    }
    function renderScoreDetailTable() {
        let columns = [
                {field: 'projNo', title: '项目编号', minWidth: 150, align: 'center', fixed: 'left'},
                {field: 'projName', title: '项目名称', minWidth: 240, align: 'center', fixed: 'left'},
                {field: 'scoreKindName', title: '学分分类', minWidth: 150, align: 'center'},
                {field: 'scoreLevelName', title: '学分子分类', minWidth: 150, align: 'center'},
                {field: 'extdata', title: '详细信息', minWidth: 120, align: 'center', templet: data => _txt.ext__data(data)},
                {field: 'projType', title: '项目类型', minWidth: 120, align: 'center'},
                {field: 'scoreType', title: '活动内容', minWidth: 120, align: 'center', hide: !is_zhejiang, templet: data => _txt.scoreType(data.scoreType)},
                {field: 'score', title: '学分', width: 80, align: 'center'},
                {field: 'period', title: '学时', width: 80, align: 'center'},
                {field: 'passState', title: '有效状态', width: 110, align: 'center'},
                {field: 'noPassOpinion', title: '不计入达标原因', minWidth: 200, align: 'center'},
                {field: 'remark', title: '备注', minWidth: 120, align: 'center', hide: is_zhejiang},
            ];
        if(IS_GUANG_DONG){
            // 项目编号、项目（活动）名称、项目类型、学分子类别、学科、形式、学时、学分 、学分类型 、审核状态 、审核意见、 授分单位、 录入方式 、录入时间、 发证机构 、有效状态 、不计入达标原因 、备注
            //形式需要显示：1 专业课 2 选修课 3公需课 默认值为1
            columns = [
                {field: 'projNo', title: '项目编号', minWidth: 150, align: 'center', fixed: 'left'},
                {field: 'projName', title: '项目（活动）名称', minWidth: 240, align: 'center', fixed: 'left'},
                {field: 'projType', title: '项目类型', minWidth: 120, align: 'center'},
                {field: 'scoreLevelName', title: '学分子分类', minWidth: 150, align: 'center'},
                {field: 'knowledgeName', title: '学科', minWidth: 150, align: 'center'},
                {field: 'scoreType', title: '形式', minWidth: 100, align: 'center', templet: function (data) {
                    return data.scoreType == 2 ? '选修课' : data.scoreType == 3 ? '公需课' : '专业课';
                } },
                {field: 'period', title: IS_GUANG_DONG ? '学习时长（小时）' : '学时', width: 150, align: 'center'},
                {field: 'score', title: '学分', width: 80, align: 'center'},
                {field: 'checkStateText', title: '审核状态', minWidth: 120, align: 'center'},
                {field: 'checkMemo', title: '审核意见', minWidth: 150, align: 'center'},
                {field: 'teachUnitName', title: '授分单位', minWidth: 160, align: 'center'},
                {field: 'scoreMode', title: '录入方式', minWidth: 120, align: 'center', templet: function (data) {
                    // 授分模式: 1 2 5 7 8 10 手工录入 | 4 6 9 11 考勤得分 | 3 网络授分 
                    const ScoreModeEnum = {
                        '1': '手工录入','2': '手工录入','5': '手工录入', '7': '手工录入','8': '手工录入','10': '手工录入',
                        '3': '网络授分',
                        '4': '考勤得分', '6': '考勤得分', '9': '考勤得分', '11': '考勤得分'
                    };
                    return ScoreModeEnum[data.scoreMode] || '未知';
                }},
                {field: 'addTime', title: '录入时间', minWidth: 180, align: 'center'},
                {field: 'addUnitName', title: '发证机构', minWidth: 160, align: 'center'},
                {field: 'passState', title: '有效状态', width: 110, align: 'center'},
                {field: 'noPassOpinion', title: '不计入达标原因', minWidth: 200, align: 'center'},
                {field: 'remark', title: '备注', minWidth: 120, align: 'center'},
            ]
        }
        // 供导出复用：确保 Excel 列与页面列保持一致（含隐藏列过滤、templet 渲染列等）
        window.__scoreDetailColumns = columns;
        table.render({
            id: 'scoreDetailTable',
            elem: '#scoreDetailTable',
            defaultToolbar: [],
            toolbar: createTableToolbar(),
            cols: [columns],
            data: [],
            page: false,
            limit: Number.MAX_VALUE,
        });
    }
    function renderPassStandard(passStandardVoList) {
        let k12List = [];
        let k3List = [];
        passStandardVoList.forEach((passStandardVo, index) => {
            if (passStandardVo.kind < 3) {
                k12List.push(passStandardVo);
            } else {
                k3List.push(passStandardVo);
            }
        });
        if (k3List && k3List.length > 0) {
            let msg = k3List[0].standardMsg;
            let psr = msg.split('|')[0];
            let reason = msg.split('|')[1];
            if (psr == '不达标') {
                // 不达标
                $('.yon_node:eq(0)').show();
                $('.yon_node:eq(1)').hide();
                $('.yon_node:eq(2)').hide();
                $('.zong_text').html(reason.replace('|', ''));
                gPassResult = '不达标';
            } else if (psr == '达标') {
                // 达标
                $('.yon_node:eq(0)').hide();
                $('.yon_node:eq(1)').show();
                $('.yon_node:eq(2)').hide();
                gPassResult = '达标';
                if(is_zhejiang){ $('#db').html('达标（不少于90学时）'); }
            } else if (psr == '达标标准未做要求') {
                // 未知
                $('.yon_node:eq(0)').hide();
                $('.yon_node:eq(1)').hide();
                $('.yon_node:eq(2)').show();
                $('.zong_text').html('达标标准未做要求');
                gPassResult = '达标标准未做要求';
            }
        } else {
            // 未知
            $('.yon_node:eq(0)').show();
            $('.yon_node:eq(1)').hide();
            $('.yon_node:eq(2)').hide();
            $('.zong_text').html('未知');
        }
    }
    function renderScoreTotal(scoreTotalList) {
        let totalScore, totalPeriod, score1, score2, score3;
        let totalScore_y, totalPeriod_y, score1_y, score2_y, score3_y;
        let label1 = '', label2 = '', label3 = '';
        scoreTotalList.forEach(item => {
            if (item.scoreType === 1 && item.kind === 1) {
                // 全部学分
                totalScore = item.score;
                totalPeriod = item.period;
            } else if (item.scoreType === 1 && item.kind === 0) {
                (1 === item.listOrder) && (score1 = item.score, label1 = item.scoreKindName);
                (2 === item.listOrder) && (score2 = item.score, label2 = item.scoreKindName);
                (3 === item.listOrder) && (score3 = item.score, label3 = item.scoreKindName);
            } else if (item.scoreType === 2 && item.kind === 2) {
                // 计入达标学分
                totalScore_y = item.score;
                totalPeriod_y = item.period;
            } else if (item.scoreType === 2 && item.kind === 0) {
                (1 === item.listOrder) && (score1_y = item.score);
                (2 === item.listOrder) && (score2_y = item.score);
                (3 === item.listOrder) && (score3_y = item.score);
            }
        });
        $('h1[data-id=total_score]').text(totalScore);
        $('h1[data-id=total_period]').text(totalPeriod);
        $('h1[data-id=score1]').text(score1);
        $('h1[data-id=score2]').text(score2);
        $('h1[data-id=score3]').text(score3);
        $('h1[data-id=total_score_y]').text(totalScore_y);
        $('h1[data-id=total_period_y]').text(totalPeriod_y);
        $('h1[data-id=score1_y]').text(score1_y);
        $('h1[data-id=score2_y]').text(score2_y);
        $('h1[data-id=score3_y]').text(score3_y);
        $('span[data-label=score1]').text(label1);
        $('span[data-label=score2]').text(label2);
        $('span[data-label=score3]').text(label3);
        // 浙江隐藏总学时
        if (is_zhejiang) {
            $('.col').hide();
        }
    }
    function renderScoreDetail(scoreDetailList) {
        table.reload('scoreDetailTable', {
            data: scoreDetailList ? scoreDetailList : []
        })
    }
});