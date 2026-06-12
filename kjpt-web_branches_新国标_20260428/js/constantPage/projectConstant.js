const StandardKind = {
    FU_JIAN     : '8b1e9418-47ff-4ff7-9dd9-a9e0009a6951',
    GAN_SU      : '7068a5c0-2cd3-471a-90b9-9bf100aec95a',
    GUANG_DONG  : '289bf0ca-52cb-4b19-b737-9bd200a69ce1',
    GUANG_XI    : '4a6d91fb-8ba4-4560-a801-9c6f00e6d999',
    HAI_HAN     : '6eec6713-670a-43cc-ad4d-9bd700a92928',
    HE_NAN      : 'a6280900-a9c2-11ec-84d6-fa163e9b64fb',
    HU_BEI      : '73ba18db-33fd-4746-ab41-9beb009f69a1',
    NEI_MENG    : '08e44437-5789-44e0-8ff8-9ecb00a6348a',
    NING_XIA    : 'eee87ca0-7df1-426c-aae3-7cae782b4d6b',
    QING_HAI    : '6427ddba-c02f-4229-bd73-49fc1c5d21f6',
    SHAN_XI     : 'db0d980b-03d4-4c9c-b2d4-9f890109ed47',
    ZHE_JIANG   : '190c480d-d43c-450b-8472-a6fd00a6729d',
    JILIN       : 'acd09b62-333b-4aee-934f-9ec500a9d46d',
    AN_HUI      : 'd4c0f901-4059-4bb0-97be-27fec8e28e97',
    SI_CHUAN    : 'd4c0f901-4059-4bb0-97be-27fec8e28e97'
};

/**
 * 新项目申报：空白申报书 Word 模板
 * 目录：/file/project_decl_template/{套id}/{fileName}
 * 新增套时在此配置 fileName（及可选 saveAs），并放置对应静态文件
 */
window.PROJECT_DECL_TEMPLATE_CONFIG = {
    [StandardKind.AN_HUI]: {
        fileName: '申报书模板.docx'
    }
};

window.getProjectDeclTemplateConfig = function (skId) {
    skId = skId || localStorage.getItem('standardkind-id') || '';
    return window.PROJECT_DECL_TEMPLATE_CONFIG[skId] || null;
};

window.getProjectDeclTemplatePath = function (skId) {
    var cfg = window.getProjectDeclTemplateConfig(skId);
    if (!cfg) {
        return '';
    }
    skId = skId || localStorage.getItem('standardkind-id') || '';
    return '/file/project_decl_template/' + skId + '/' + cfg.fileName;
};

window.downloadProjectDeclTemplate = function () {
    var cfg = window.getProjectDeclTemplateConfig();
    if (!cfg) {
        if (typeof layui !== 'undefined' && layui.layer) {
            layui.layer.msg('未配置该套的申报书模板', { icon: 0 });
        }
        return;
    }
    var saveAs = cfg.saveAs || cfg.fileName;
    var a = document.createElement('a');
    a.href = window.location.origin + encodeURI(window.getProjectDeclTemplatePath());
    a.setAttribute('download', saveAs);
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

window.toggleProjectDeclTemplateBtn = function () {
    var show = !!window.getProjectDeclTemplateConfig();
    $('[lay-event="downloadDeclTemplate"]').toggle(show);
};


window.getlables = () => {
    let cmeStandardKindId =  localStorage.getItem("standardkind-id");


    get_lblProjectLevel = () => { // 项目级别
        let text = '学分分类';
        (cmeStandardKindId == StandardKind.GUANG_DONG) && (text = '学分分类');
        (cmeStandardKindId == StandardKind.NEI_MENG) && (text = '项目级别');
        return text;
    }

    get_lblPeriod = () => { // 学时
        let text = '学时';
        (cmeStandardKindId == StandardKind.GUANG_DONG  || cmeStandardKindId == StandardKind.ZHE_JIANG) && (text = '<span style="color: red; ">*&nbsp;</span>讲授小时数');
        (cmeStandardKindId == StandardKind.GUANG_XI)  && (text = '<span style="color: red; ">*&nbsp;</span>小时');
        return text;
    }

    get_coursePeriod = () => {
        let text = '时长';
        (cmeStandardKindId == StandardKind.GUANG_DONG || cmeStandardKindId == StandardKind.ZHE_JIANG) && (text = '<span style="color: red; ">*&nbsp;</span>时长（小时）');
        (cmeStandardKindId == StandardKind.GUANG_XI)  && (text = '<span style="color: red; ">*&nbsp;</span>小时');
        return text;
    }

    get_lblScoreLevel = () => '学分分类'; //学分级别

    get_lblActivityWay = () => '活动方式';
    
    get_lblProjectType = () => '项目类别';

    get_lblActivityType = () => '活动类别';

    get_lblActivityForm = () => '活动形式';

    get_lblActivityContent = () => '活动内容';

    get_lblContentClassification = () => '内容分类';

    get_lblMedicalSystem = () => '所属医学体系';

    get_lblActivityLevel = () => '学分分类'; // 活动级别

    get_lblScoreLevelChild = () => '学分子分类'; // 学分级别（二级）

    let obj =  {
        lblProjectLevel : get_lblProjectLevel(),

        lblScoreLevel : get_lblScoreLevel(),

        lblActivityWay : get_lblActivityWay(),

        lblProjectType : get_lblProjectType(),

        lblActivityType : get_lblActivityType(),

        lblActivityForm : get_lblActivityForm(),

        lblActivityContent : get_lblActivityContent(),

        lblContentClassification : get_lblContentClassification(),

        lblMedicalSystem : get_lblMedicalSystem(),

        lblActivityLevel : get_lblActivityLevel(),

        lblScoreLevelChild : get_lblScoreLevelChild(),

        lblPeriod: get_lblPeriod(),

        coursePeriod: get_coursePeriod(),
    };
    return obj;
}

const projectLabels = getlables();

function renderLables() {
   
    $('.layui_mess label').each((i, d) => {
        let name = $(d).attr('name');
        if (name) $(d).html(projectLabels[name] || '');
    });
    
    $('.renamexxx label').each((i, d) => {
        let name = $(d).attr('name');
        if (name) $(d).html(projectLabels[name] || '');
    });
}




