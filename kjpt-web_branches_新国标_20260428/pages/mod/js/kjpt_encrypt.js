let _reHtName = '远程教育,全员培训';
let DefaultConst = {
    STANDARD_KIND_ID: 'b7864061-7bd4-4ee7-a868-9b24009e92df',
    UNIT_ID_GOV: '090100',
    UNIT_ID: '090103',
    USER_ID: 'e05def64-11a0-448a-b55b-3153199a777b'
};
let PseudoNull = {
    UNIT_ID: '000000',
    UUID: '00000000-0000-0000-0000-000000000000',
}
let ModalActionEnum = {
    CREATE: 'create',
    EDIT: 'edit',
    VIEW: 'view',
    CONFIRM: 'confirm',
    CANCEL: 'cancel'
}
let UserTypeEnum = {
    SYS: 1, // 超级管理员
    ADMIN: 2, // 管理员
    TECH_SUP: 3, // 技术支持和前方代表
    GOV: 11, // 行政/政府
    UNIT: 12, // 医疗机构/单位
    DEPT: 13, // 科室
    INDIVIDUAL: 14, // 个人
    EXPERT: 15, // 专家
    '1': '超级管理员',
    '2': '管理员',
    '3': '技术支持',
    '11': '行政',
    '12': '单位',
    '13': '科室',
    '14': '个人',
    '15': '专家',
}
let UnitUserTypeEnum = {
    '2': '单位',
    '3': '区县',
    '4': '地市',
    '5': '省厅',
    UNIT: 2,
    COUNTY: 3,
    CITY: 4,
    PROVINCE: 5
}
let CheckStateEnum = {
    NOT: 0, // 未审核
    REVISION: 1, // 审核退回
    REJECT: 2, // 审核不通过
    APPROVE: 3, // 审核通过
    CHECKING: 4, //
    '0': '未审核',
    '1': '审核退回',
    '2': '审核不通过',
    '3': '审核通过', // 终审通过
    '4': '未审核', // 审核中->未审核
    '5': '5',
    '52': '52',
    '99': '99'
}
let ScoreModeEnum = {
    '1': '手工录入', // 个人录入
    '2': '手工录入', // 科室录入
    '3': '网络授分', //
    '4': '考勤得分', // 按考勤授分
    '5': '手工录入', // 按考核结果授分
    '6': '考勤得分', //
    '7': '手工录入', // 主讲人授分
    '8': '手工录入', // 补录
    '9': '考勤得分', //
    '10': '手工录入', //
    '11': '考勤得分', //
    '99': '',
}
let PassResultEnum = {
    '0': '不达标',
    '1': '达标',
    '2': '不计达标'
}
let DateTimePattern = {
    DAY: 'YYYY-MM-DD',
    MINUTE: 'YYYY-MM-DD HH:mm',
    SECOND: 'YYYY-MM-DD HH:mm:ss'
}
let _txt = {
    projType: function (v) {
        let res = {'0': '非项目类', '1': '推荐项目', '2': '推广项目', '3': '非项目类',}[v];
        return res ?? '';
    },
    scoreType: function (v) {
        let res = {'1': '专业课', '2': '选修课', '3': '公需课'}[v];
        return getOrDefault(res, v ?? '');
    },
    medicalType: function (v) {
        if (0 === v || '0' === v) return '';
        let res = {'1': '西医', '2': '中医', '3': '蒙医',}[v];
        return getOrDefault(res, v ?? '');
    },
    scoreTypeVal: function (v) {
        // ScoreTypeValEnum
        let res = {'4': '继续教育项目', '2': '院内活动', '1': '个人活动'}[v];
        return res ?? '';
    },
    // 1.录入单位 2.举办单位
    holdUnit: function (detail) {
        return coalesce(detail.teachUnitText, detail.teachUnitName, '');
    },
    // 3.授分单位
    gantScore: function (scoreDetail) {
        if (scoreDetail.scoreTypeVal !== 1) {
            return coalesce(scoreDetail.teachUnitText, '');
        } else {
            return coalesce(scoreDetail.addUnitName, scoreDetail.teachUnitText, '');
        }
    },
    // 4.发证机构
    fazhengUnit: function (scoreDetail) {
        if (scoreDetail.scoreTypeVal !== 1) {
            return coalesce(scoreDetail.teachUnitText, scoreDetail.teachUnitName, '');
        } else {
            return coalesce(scoreDetail.teachUnitName, scoreDetail.addUnitName, scoreDetail.teachUnitText, '');
        }
    },
    // 审核状态
    checkState: function (scoreDetail) {
        // if (data.flowChainState) {
        //     let fs = (data.flowChainState % 10).toString();
        //     return getOrDefault(CheckStateEnum[fs], '');
        // } else {
        //     return '';
        // }
        return getOrDefault(CheckStateEnum[scoreDetail.checkState], '');
    },
    ifAvail: function (scoreDetail) {
        return getOrDefault({'1': '有效', '4': '无效'}[scoreDetail.ifAvail], '');
    },
    // flowChainState
    fcs: function (scoreDetail) {
        let flowChainState = scoreDetail.flowChainState;
        if (flowChainState) {
            let fUut = flowUut(flowChainState);
            let fs = flowChainState % 10;
            let text = UnitUserTypeEnum[fUut.toString()] + CheckStateEnum[fs];
            return text + ':' + scoreDetail.flowChainState;
        } else {
            return '';
        }
    },
    // 录入方式
    scoreMode: function (scoreDetail) {
        return getOrDefault(ScoreModeEnum[String(scoreDetail.scoreMode)], scoreDetail.scoreMode);
    },
    ext__data: function (d) {
        if (!d.extData) return '';
        let namemap = {
            // 进修
            jx_item: '事项',
            jx_unit: '进修（培训）单位',
            support_unit: '支援省份—支援单位',
            assist_unit: '协助单位',
            task_content: '任务内容',
            task_time: '时间段',
            // 学历教育
            education: '学历教育',
            school: '就读学校',
            study_year: '就读年度',
            examine_result: '年度考核情况',
            // 发表论文
            paper_level: '期刊级别',
            paper_name: '期刊名称',
            paper_no: '期刊号',
            paper_content: '论证名称',
            // 科研项目
            proj_level: '项目级别',
            proj_rank: '项目排名',
            proj_unit: '立项单位',
            proj_name: '项目名称',
            // 科技成果奖
            reward_level: '奖励级别',
            reward_name: '奖励名称',
            reward_unit: '奖励单位',
            reward_proj_name: '获奖项目名称',
            // 发明专利，标准、技术规范
            patent_item: '事项',
            patent_time: '完成转化或通过批准时间',
            // 出版著作
            book_type: '著作类型',
            book_name: '著作名称',
            book_unit: '出版单位',
            // 赴外省学分
            single_proj_no: '项目编号',
            single_proj_name: '项目名称',
            hold_unit: '项目举办单位',
            pub_unit: '项目公布单位',
            pub_unit_name: '具体省卫健委名称',
        };
        let dictmap = {
            // 进修-事项
            jx_item: [
                {value: 1, name: '外出进修'},
                {value: 2, name: '在职学历（学位）教育'},
                {value: 3, name: '发表论文'},
                {value: 4, name: '出版著作'},
            ],
            // 赴外省学分-项目公布单位
            pub_unit: [
                {value: 1, name: '国家卫健委公布项目'},
                {value: 2, name: '省卫健委公布项目'},
            ],
            // 学历教育
            education: [
                {value: 1, name: '本科'},
                {value: 2, name: '硕士'},
                {value: 3, name: '博士'},
                {value: 4, name: '其他'},
            ],
            // 发表论文-期刊级别
            paper_level: [
                {value: 1, name: 'SCI收录期刊'},
                {value: 2, name: '中文核心期刊'},
                {value: 3, name: '普通期刊'},
            ],
            // 科研项目-项目级别
            proj_level: [
                {value: 1, name: '国家级项目'},
                {value: 2, name: '省部级项目'},
                {value: 3, name: '市厅级项目或省级以上行业组织设立的课题'},
            ],
            // 科技成果奖-奖励级别
            reward_level: [
                {value: 1, name: '国家级'},
                {value: 2, name: '省部级'},
                {value: 3, name: '市厅级项目或省级以上行业组织设立的课题'},
            ],
            // 出版著作-著作类型
            book_type: [
                {value: 1, name: '专业学术著作'},
                {value: 2, name: '教材'},
                {value: 3, name: '科普书籍'},
                {value: 4, name: '其他'},
            ],
        };
        let build = (data) => {
            if (!data) return '';
            let extData = JSON.parse(data);
            let html = '';
            // 根据extData的key值，构建html, 显示在一行
            for (let key in extData) {
                let name = namemap[key];
                if (!name) continue;
                let dict = dictmap[key];
                let value;
                if (dict) {
                    // 根据字典值，获取中文名称
                    let dictName = dict.find(item => item.value == extData[key]);
                    if (dictName) {
                        value = dictName.name;
                    } else {
                        value = extData[key];
                    }
                } else {
                    value = extData[key];
                }
                html += `${name}: ${value} ;`;
            }
            return html;
        }
        var html = build(d.extData);
        var id = `ext-data-cell-${d.LAY_TABLE_INDEX}`;
        return `<div id="${id}" class="layui-table-cell" onmouseenter="extdatacell_enter(this)" onmouseleave="extdatacell_leave()">${html}</div>`;
    },
}
let isLilunCourse = (course) => {
    return 'theory,lilun,面授,理论,理论授课'.includes(course.teachingMethod);
}
let isShiyanCourse = (course) => {
    return 'experiment,shiyan,实验技术,实验技术示范,实验（技术示范）'.includes(course.teachingMethod);
}
let gPhotoJson = {
    "status": 1,
    "msg": "",
    "title": "JSON请求的相册",
    "id": 8,
    "start": 0,
    "data": [
        {
            "alt": "学分证明照片",
            "pid": 109,
            "src": "https://kjpt.wsglw.net/img/img_404.png",
            "thumb": ""
        },
        {
            "alt": "学分证明照片",
            "pid": 109,
            "src": "https://uploads.cdn.11dz.cn/wallpaper/paper/b733fad4-af94-4f70-91aa-54cd6442e2c6_50.jpg",
            "thumb": ""
        },
        {
            "alt": "学分证明照片",
            "pid": 110,
            "src": "https://uploads.cdn.11dz.cn/wallpaper/paper/fb082074-4bc1-4122-a01e-9e2eaa138029_50.jpg",
            "thumb": ""
        }, {
            "alt": "学分证明照片",
            "pid": 113,
            "src": "https://kjptapi.wsglw.net/file/individualScoreManage/db0d980b-03d4-4c9c-b2d4-9f890109ed47/050005/2022/1657604465778-c0906b24-4316-4016-92a5-11931b4d87bf.pdf",
            "thumb": ""
        }
    ]
};
let _titleTypeEnum = [
    {"titleId": "12b7281b-5a37-43f9-990a-9b2f0124b22e", "titleName": "医师系列", "flag": 1},
    {"titleId": "e46a0ff0-86de-47a8-bd7b-9b2f0124b22e", "titleName": "护理系列", "flag": 1},
    {"titleId": "829a7a8f-ac8a-454b-87aa-9b2f0124b22e", "titleName": "药师系列", "flag": 1},
    {"titleId": "e5f5461d-45a6-4e22-a5c0-9b2f0124b22e", "titleName": "技师系列", "flag": 1},
    {"titleId": "6eb60a6f-23fa-4f68-8deb-9cfe00d791e9", "titleName": "见习系列", "flag": 1},
    {"titleId": "53f3f944-2189-4870-8387-9b2f0124b22e", "titleName": "工程系列", "flag": 1},
    {"titleId": "50e39073-ca00-4e89-9e75-9b2f0124b22e", "titleName": "研究系列", "flag": 1},
    {"titleId": "ab1f839e-2986-40c4-80bf-9b2f0124b233", "titleName": "会计系列", "flag": 1},
    {"titleId": "87babb13-63c2-480f-85ab-9b2f0124b233", "titleName": "教学系列", "flag": 1},
    {"titleId": "237e5b91-ea10-44f6-947b-9b2f0124b233", "titleName": "出版系列", "flag": 1},
    {"titleId": "64579360-496a-407b-9e6e-9b2f0124b233", "titleName": "检验师系列", "flag": 1},
    {"titleId": "cb2d002c-45e0-4d09-9fa1-9b2f0124b233", "titleName": "统计系列", "flag": 1},
    {"titleId": "4a13c961-6c3d-4f11-a46a-9b2f0124b233", "titleName": "经济系列", "flag": 1},
    {"titleId": "1561760d-cd05-45b4-a827-9b2f0124b233", "titleName": "图书资料系列", "flag": 1},
    {"titleId": "54f68ef0-60c7-4689-988e-9c0c00b6dcf6", "titleName": "中学教师系列", "flag": 1},
    {"titleId": "3ee9d699-4121-4b81-b085-9c0c00b98579", "titleName": "小学教师系列", "flag": 1},
    {"titleId": "bbd1cffc-c226-461c-b1ca-c8cb9b5d37b2", "titleName": "计生系列", "flag": 1},
    {"titleId": "94741192-52be-47b6-ae75-4bf7dff34e4e", "titleName": "公共卫生管理系列", "flag": 1},
    {"titleId": "902d06ea-52f6-45a3-8b0e-9b2f0124b233", "titleName": "其他系列", "flag": 1},
    //
    {"titleId": "7d25ad8e-043a-4921-9d80-9cfe00d791e9", "titleName": "中医医师系列", "flag": 2},
    {"titleId": "1f2db05a-f8ee-4311-a304-6b496748498d", "titleName": "中医护理系列", "flag": 2},
    {"titleId": "b354e1ae-ab73-4b6c-b0e2-9cfe00d791e9", "titleName": "中医药师系列", "flag": 2},
    {"titleId": "21291252-9e79-418f-ba6d-9d6100ec5da1", "titleName": "中医技师系列", "flag": 2},
    {"titleId": "ea42541c-c77f-46e0-9eb1-9cfe00d791e9", "titleName": "中西医结合医师系列", "flag": 2},
];
let _titleTypes1 = _titleTypeEnum.filter(item => item.flag === 1).map(item => item.titleId).join(',');
let _titleTypes2 = _titleTypeEnum.filter(item => item.flag === 2).map(item => item.titleId).join(',');
let _standardKindId = getOrDefault(localStorage.getItem('standardkind-id'), DefaultConst.STANDARD_KIND_ID);
let _skId = _standardKindId;
let _isHainan = '6eec6713-670a-43cc-ad4d-9bd700a92928' === _skId;
let _isQinghai = '6427ddba-c02f-4229-bd73-49fc1c5d21f6' === _skId;
let _isFujian = '8b1e9418-47ff-4ff7-9dd9-a9e0009a6951' === _skId;
let _isHubei = '73ba18db-33fd-4746-ab41-9beb009f69a1' === _skId;
let _isHenan = 'a6280900-a9c2-11ec-84d6-fa163e9b64fb' === _skId;
let _isNeimeng = '08e44437-5789-44e0-8ff8-9ecb00a6348a' === _skId;
let _isGuangxi = '4a6d91fb-8ba4-4560-a801-9c6f00e6d999' === _skId;
let _isNingxia = 'eee87ca0-7df1-426c-aae3-7cae782b4d6b' === _skId;
let _isHunan = '13e2e203-7fdd-47ab-b90f-a1480112b5e5' === _skId;
let _isZhejiang = '190c480d-d43c-450b-8472-a6fd00a6729d' === _skId;
let _isGansu = '7068a5c0-2cd3-471a-90b9-9bf100aec95a' === _skId;
let _isJilin = 'acd09b62-333b-4aee-934f-9ec500a9d46d' === _skId;
let _isShanxiJin = 'db0d980b-03d4-4c9c-b2d4-9f890109ed47' === _skId;
let _isGuangdong = '289bf0ca-52cb-4b19-b737-9bd200a69ce1' === _skId;
let _unitUpward = getOrDefault(localStorage.getItem('kk_unitupward'), '');
let _userId = getOrDefault(localStorage.getItem('user-id'), DefaultConst.USER_ID);
let _unitId = getOrDefault(localStorage.getItem('unit-id'), DefaultConst.UNIT_ID);
let _unitName = getOrDefault(localStorage.getItem('unit-name'), '默认单位名称');
let _deptId = getOrDefault(localStorage.getItem('dept-id'), '');
let _userType = Number(localStorage.getItem('user-type'));
let _uut = Number(localStorage.getItem('unit-user-type'));
let _isPerson = UserTypeEnum.INDIVIDUAL === _userType;
let _isDept = UserTypeEnum.DEPT === _userType;
let _isUnit = UserTypeEnum.UNIT === _userType;
let _isGov = UserTypeEnum.GOV === _userType;
let _isExpert = UserTypeEnum.EXPERT === _userType;
let _depth = _isGov ? 9 : 1;
let _isGovProvince = UnitUserTypeEnum.PROVINCE === _uut;
let _isGovCity = UnitUserTypeEnum.CITY === _uut;
let _isGovCounty = UnitUserTypeEnum.COUNTY === _uut;
let _unitPc = localStorage.getItem('kk_unitpc') || '00';
let _isPhUnit = '1' === _unitPc.split('')[0];
let _isChUnit = '1' === _unitPc.split('')[1];
let psninfo = JSON.parse(localStorage.getItem('kk_psninfo') || '{}');
let _pid = psninfo.comPersonId;
let _pno = psninfo.personNo;
let _pname = psninfo.personName;
let _pcid = psninfo.certId;
function _fv() {
    // let res = 'https://view.xdocin.com/xdoc?_xdoc=';
    // let res = 'https://kkfile.91huayi.com/onlinePreview?url=';
    let b = _pdp;
    if (_pdp.includes('localhost') || _pdp.includes('192.168.1.165') || _pdp.includes('192.168.1.166')) b = 'http://192.168.1.166:80';
    return `${b}/preview/onlinePreview?url=`;
}
let _fileView = _fv();
// `${_fileView}${encodeURIComponent(url)}`;
let kkurl = (url) => `${_fileView}${encodeURIComponent(Base64.encode(url))}`
let pickUnitId = (unitId) => {
    let menuUnitId = localStorage.getItem("menu-unit-id");
    return menuUnitId ? menuUnitId : unitId;
}
let getDepthPlus = () => {
    let menuUnitDepth = localStorage.getItem('menu-unit-depth');
    return menuUnitDepth ? Number.parseInt(menuUnitDepth) : _depth;
}
let isCityProj = (scoreLevelName) => {
    return scoreLevelName && scoreLevelName.includes('市') && !scoreLevelName.includes('直辖市')
}
let isAssnProj = (scoreLevelId) => {
    return ('f44a8070-bbca-11ed-a634-fa163e9b64fb' === scoreLevelId); // 社团
}
let isCityAssnProj = (scoreLevelId) => {
    return ('bab68ac8-d4f4-11ed-bc0a-fa163e9b64fb' === scoreLevelId); // 市级社团
}
let isHubeiProvinceProj = (slId) => {
    return '464e3276-d45a-42b9-a526-9beb00a2ec33' === slId;
}
let isHubeiCityProj = (slId) => {
    return '470a4af8-2b11-4bb0-afb7-9beb00a2ef50' === slId;
}
let isHunanRp = (slId) => {
    return '99bf7458-3464-11ef-b4ad-005056a64c01' === slId;
}
let getMsiList = (scoreRowArr, args) => {
    let flowChainState = args.flowChainState;
    let checkState = args.checkState;
    // 修改退回的学分 审核不通过
    let shiftx = function (cur) {
        if (cur && checkState) {
            let arr = cur.split('');
            arr[_uut - 2] = checkState;
            return arr.join('');
        }
        return null;
    }
    return scoreRowArr.map(scoreRow => {
        let isBackScore = CheckStateEnum.REVISION === toNum(scoreRow.checkState);
        let res = {...args};
        $.extend(true, res, {
            'scoreId': scoreRow.scoreId,
            'scoreTypeVal': scoreRow.scoreTypeVal,
            'standardKindId': _skId,
            'comPersonId': scoreRow.comPersonId,
            'cmeYear': scoreRow.cmeYear,
            'unitUserType': _uut,
            'flowChainId': scoreRow.flowChainId,
            'flowChainState': isBackScore ? (scoreRow.flowChainState - 1) : flowChainState,
            'checkState': isBackScore ? CheckStateEnum.NOT : checkState,
            'statex': shiftx(scoreRow.statex),
        });
        return res;
    });
}
let flowUut = (flowChainState) => {
    if (flowChainState) {
        // return Math.floor(flowChainState / 10);
        // return Number((flowChainState / 10).toFixed(0));
        return ~~(flowChainState / 10);
    } else {
        return 0;
    }
}
// 审核时使用
// get flow_chain_state by unit_user_type and check_state
let getFcsByCs = (checkState) => {
    // REJECT:1   (uut)+1
    // REVISION:2 (uut)+2
    // APPROVE:3  (uut+1)+0  invoke flow-service
    return concatNum(_uut, checkState);
}
let _tips = {
    // 远程学分
    isReScore: (scoreDetail) => {
        if (_isFujian && [4, 2].includes(scoreDetail.scoreTypeVal)) {
            if (['远程', '远程教育', '面授+远程', '线上', '线上+线下结合'].includes(scoreDetail.holdTypeName)) return false;
        }
        return _reHtName.includes(scoreDetail.holdTypeName) ||
            '888888,999999,101010'.includes(scoreDetail.teachUnit);
    },
    // 上级审核
    upChecked: (scoreDetail) => {
        let flowChainState = getOrDefault(scoreDetail.flowChainState, 0);
        let fUut = flowUut(flowChainState);
        return fUut > _uut;
    },
    canUd: function (scoreDetail) {
        if (this.isReScore(scoreDetail)) return '远程学分不能修改删除'; // false
        if ('2,3'.includes(scoreDetail.checkState)) return '学分已审核'; // false
        if ('0,1,4'.includes(scoreDetail.checkState)) return ''; // true
        return ''; // true
    },
    canCheck: function (scoreDetail) {
        if (_isFujian && 'ff257e16-331c-48f6-a6a1-fb33cd215473' === scoreDetail.scoreLevel) return '不能审核单位组织的继续教育实践活动';
        if (_isJilin) {
            if ([
                '773a3d80-c128-11f0-89a6-005056a64c01', // 校级项目（吉大专用）
                '773a45c8-c128-11f0-89a6-005056a64c01', // 首例新技术新疗法（吉大专用）
                '773a458c-c128-11f0-89a6-005056a64c01', // 学校医疗成果奖（吉大专用）
                '773a4546-c128-11f0-89a6-005056a64c01', // 首例疑难复杂病例诊治（吉大专用）
                '773a4500-c128-11f0-89a6-005056a64c01', // 研究生课程（吉大专用）
                '773a41f4-c128-11f0-89a6-005056a64c01', // 规范化毕业后教育（吉大专用）
            ].includes(scoreDetail.scoreLevel)) return '不能审核吉大专属学分分类';
        }
        if (!this.canOperLastYearData(scoreDetail.studyDate)) return '无法审核过往年度学分';
        if (this.isReScore(scoreDetail)) return '远程教育学分';
        if (this.upChecked(scoreDetail)) return '已由上级单位审核';
    },
    canOperLastYearData: (studyDate) => {
        if (_isGovProvince) return true;
        let json = JSON.parse(localStorage.getItem('tmp_common_config') || '{}');
        let cgv = json['value_forbid_some_operate_on_last_year_data'];
        // cgv = '2024-12-12';
        if (cgv == null || cgv === '') return true;
        let res = true;
        let studyDateYear = new Date(studyDate).getFullYear();
        let deadline = new Date(cgv);
        let now = new Date();
        if (parseInt(studyDateYear) < now.getFullYear()) {
            if (deadline < now) res = false;
        }
        return res;
    }
}
// deprecated
let showTips = (curDom) => {
    let that = curDom;
    let msg = $(that).attr('alt');
    gLayerIndex = layer.tips(msg, that, {
        // tips: 2
        tips: [2, '#808080'],
        // time: 800000
    });
}
// deprecated
let closeTips = () => {
    layer.close(gLayerIndex);
}
// deprecated
let closeCurrModal = () => {
    let index = parent.layer.getFrameIndex(window.name);
    parent.layer.close(index);
}
// '登录单位'或'项目'的'upward'
// uut#unitId#unitName,
let parseCityUnit = (upward) => {
    let res = {
        'unitId': '',
        'unitName': '',
        'unitUserType': 0
    };
    if (!upward) return res;
    let unitArr = upward.split(',');
    for (let i = 0, n = unitArr.length; i < n; ++i) {
        let arr = unitArr[i].split('#');
        if (4 === Number(arr[0])) {
            res.unitUserType = 4;
            res.unitId = arr[1];
            res.unitName = arr[2];
            break;
        }
    }
    return res;
}
let _cityUnitId = parseCityUnit(_unitUpward).unitId;
let _isZhengzhou = '160100,160025'.includes(_cityUnitId);
let _isHebi = '161300'.includes(_cityUnitId);
let _isLuohe = '162700'.includes(_cityUnitId);
let _isZhoukou = '162500' === _cityUnitId;
let _isJiaozuo = '160900' === _cityUnitId;
let _isXuchang = '160700' === _cityUnitId;
let _isPingdingshan = '160088,162900'.includes(_cityUnitId);
let parseProvinceUnit = (upward) => {
    let unitArr = upward.split(',');
    let res = {
        'unitId': '',
        'unitName': '',
        'unitUserType': 0
    };
    for (let i = 0, n = unitArr.length; i < n; ++i) {
        let arr = unitArr[i].split('#');
        if (5 === Number(arr[0])) {
            res.unitUserType = 4;
            res.unitId = arr[1];
            res.unitName = arr[2];
            break;
        }
    }
    return res;
}
let getPageSize = () => {
    // 全国-200,河南-100,福建-10,其它-100
    let res = 200;
    _isHenan && (res = 100);
    _isHainan && (res = 100);
    _isFujian && (res = 10);
    return res;
}
let getScoreLevelOption_1 = (viewMode) => getAction(`${huayi_sjwh_url}option/scoreLevel/list/${_skId}/${viewMode}`);
let getScoreLevelOption = (cmeYear, viewMode) => getAction(`${huayi_sjwh_url}option/scoreLevel/list/${_skId}/${cmeYear}/${viewMode}`);
let getScoreLevelTreeLALA = (cmeYear, viewMode) => getAction(`${huayi_sjwh_url}option/scoreLevel/tree/${_skId}/${cmeYear}/${viewMode}`);
let getScoreLevelContentLALA = (slId) => getAction(`${huayi_sjwh_url}option/scoreLevelContent/list?scoreLevel=${slId}`);
let getKnowledgeOption_1 = (knowledgeType, knowledgeTwoId) => getAction(`${huayi_sjwh_url}option/knowledge/list/${knowledgeType}?knowledgeTwoId=${knowledgeTwoId}`);
let getKnowledgeOption_2 = (knowledgeType, knowledgeTwoId) => getAction(`${huayi_sjwh_url}option/knowledge/list/${PseudoNull.UUID}/${knowledgeType}?knowledgeTwoId=${knowledgeTwoId}`);
let getKnowledgeOptionHubei_1 = (knowledgeType, knowledgeTwoId) => getAction(`${huayi_sjwh_url}option/knowledge/list/$_skId}/${knowledgeType}?knowledgeTwoId=${knowledgeTwoId}`);
let getKnowledgeOption = (params) => postAction(`${huayi_sjwh_url}option/knowledge/list`, params);
let getKnowledgeTree = (params) => postAction(`${huayi_sjwh_url}option/knowledge/tree/data`, params);
let getHoldTypeOption = (viewMode) => getAction(`${huayi_sjwh_url}option/holdType/list/${_skId}/${viewMode}`);
let getHoldTypeOptionLALA = (slId, viewMode) => getAction(`${huayi_sjwh_url}option/holdType/list/${_skId}/${slId}/${viewMode}`);
//
let getPersonStateOption = () => getAction(`${huayi_sjwh_url}option/personState/list/${_skId}`);
let getDictOption = (kindId) => getAction(`${huayi_sjwh_url}option/comDict/list/${kindId}`);
let getTitleLevelOption_1 = () => getAction(`${huayi_sjwh_url}option/titleLevel/list`);
let getTitleTreeData = () => getAction(`${huayi_sjwh_url}option/title/treeData/${_skId}`);
let getSpecTreeData = (depth) => getAction(`${huayi_sjwh_url}option/spec/treeData/${depth}`);
let getCmeYearOption = () => getAction(`${huayi_sjwh_url}option/cmeYear/list/${_skId}`)
//
let getUnitTreeData_1 = (unitId) => getAction(`${huayi_personorg_url}alternative/unit/treeData/${unitId}/9`);
let getUnitTreeData_2 = (unitId) => getAction(`${huayi_personorg_url}alternative/unit/treeData2/${_skId}/${unitId}`);
let getUnitTreeData = (unitId) => getAction(`${huayi_personorg_url}alternative/unit/tree/${_skId}/${unitId}`);
let getDeptTreeData = (unitId, depth) => getAction(`${huayi_personorg_url}alternative/dept/treeData/${unitId}/${depth}`);
//
let getConfigAction = (params) => postAction(`${huayi_sjwh_url}cmeCommonConfig/getConfigByUnitFromRedis?unitId=${params.unitId}&configNames=${params.configNames}&scoreLevelId=${params.scoreLevelId}`);
let modifyScoreAction = (params) => postAction(`${huayi_projectscore_url}pgsi/modify/score`, params);
let removeScoreAction = (params) => postAction(`${huayi_projectscore_url}pgsi/remove/score`, params);
let checkScoreAction = (params) => postAction(`${huayi_projectscore_url}pgsi/check/score`, params);
let byPersonCheckBatchAction = (params) => postAction(`${huayi_projectscore_url}pgsi/check/score/byPersonList`, params);
let singleCheckBatchAction = (params) => postAction(`${huayi_projectscore_url}pgsi/single/check/batch`, params);
//
let declarePrepare = (knowledgeId, unitId) => getAction(`${huayi_projectscore_url}declare/prepare/${knowledgeId}/${unitId}`);
let declareProjDetailById = (projectId) => getAction(`${huayi_projectscore_url}declare/detail/${projectId}`);
let declareProjAction = (params) => postAction(`${huayi_projectscore_url}declare/proj/saveOrUpdate`, params);
let declarePrincipalAction = (params) => postAction(`${huayi_projectscore_url}declare/prin/sou`, params);
let declareCourseAction = (params) => postAction(`${huayi_projectscore_url}declare/course/saveOrUpdate`, params);
let declareCycleAction = (params) => postAction(`${huayi_projectscore_url}declare/cycle/saveOrUpdate`, params);
// let declareReport = (projId, source) => postAction(`${huayi_projectscore_url}declare/report/${projId}/${source}`);
let _lbl_inst = {
    data: {},
    values: {},
    sdysel: null,
    edysel: null,
    rdysel: null,
    rdysel_add: null,
    rdysel_check: null,
    getVal: function (key) {
        return this.values[key];
    },
    change_year: function (year) {
        let that = this;
        if (that.sdysel) lay_day_sel_update(that.sdysel, `${year}-01-01`, `${year}-01-01`, `${year}-12-31`);
        if (that.edysel) lay_day_sel_update(that.edysel, `${year}-12-31`, `${year}-01-01`, `${year}-12-31`);
        if (that.rdysel) lay_day_sel_update(that.rdysel, `${year}-01-01 至 ${year}-12-31`, `${year}-01-01`, `${year}-12-31`);
        if (that.rdysel_add) lay_day_sel_update(that.rdysel_add, `${year}-01-01 至 ${year}-12-31`, `${year}-01-01`, `${year}-12-31`);
        if (that.rdysel_check) lay_day_sel_update(that.rdysel_check, `${year}-01-01 至 ${year}-12-31`, `${year}-01-01`, `${year}-12-31`);
    },
    change_level: function (slId) {
    },
    echo: function (obj, disable) {
        let that = this;
        let $span = $('span[data-id^=lbl]');
        $span.each((idx, ele) => {
            let name = $(ele).data('name');
            let values = String(obj[name] ?? '');
            $(ele).attr('data-echo-values', values);
        });
        $span.each((idx, ele) => {
            let id = $(ele).data('id');
            let name = $(ele).data('name');
            let values = String(obj[name] ?? '');
            let arr = values.split(',');
            that[id]?.setValue(arr, null, true);
            if (disable) that[id]?.update({disabled: true});
        });
    }
};
let dogetconfig = (configNames, scoreLevel) => {
    getConfigAction({
        unitId: _unitId,
        configNames: configNames,
        scoreLevelId: scoreLevel
    }).then(response => {
        let jsonRes = response.data;
        if (jsonRes.success) {
            let json = JSON.parse(localStorage.getItem('tmp_common_config') || '{}');
            configNames.split(',').forEach((name, idx) => {
                json[name] = jsonRes.data[name];
            });
            localStorage.setItem('tmp_common_config', JSON.stringify(json));
        } else {
            layui.lat.failMsg('获取配置失败');
        }
    }).catch(() => {
        layui.lat.errorMsg('获取配置失败');
    });
}
$(function () {
    var tipsIndex;
    window.extdatacell_enter = function (elem) {
        var content = $(elem).html();
        if (!content) return;
        tipsIndex = layui.layer.tips(content, elem, {
            tips: 1,
            time: 0,
            maxWidth: 300,
            closeBtn: 0,
            shade: 0,
            skin: 'layui-layer-border'
        });
    }
    window.extdatacell_leave = function (elem) {
        layui.layer.close(tipsIndex);
    }
});
let _d2 = {
    bindsameipt: function (name) {
        $(`input[name=${name}]`).on('change', function () {
            let val = $(this).val();
            $(`input[name=${name}]`).val(val);
        });
    },
    bindmask: function (name, maskname, radio) {
        $(`input[type=checkbox][name^=${maskname}]`).on('change.mask', function () {
            if (radio) {
                let $this = $(this);
                let checked = $this.is(':checked'); // $this[0].checked;
                checked && $this.siblings('input[type="checkbox"]').prop('checked', !checked);
            }
            let val = checkboxVals(maskname);
            $(`input[name=${name}]`).val(val || '');
        });
        $(`input[name=${name}]`).on('change', function () {
            let val = $(this).val();
            echoCheckbox(maskname, val);
        });
    },
    bindhidspan: function () {
        let $base = $('div[name=proj_projectName]');
        let $hid = $('input[name=proj_projectName]');
        let $span = $('span[name=proj_projectName]');
        $base.on('input.link', (e) => $hid.val($(e.target).text()).trigger('change'));
        $hid.on('change.link', (e) => $span.text($(e.target).val()));
    }
}
let _zi = {
    isselht: function () {
        return _isZhejiang;
    },
    isselsl: function () {
        return _isHenan;
    }
}
let setmedicaltype = function () {
    let mt = localStorage.getItem('manager-medical-type');
    $('select[name=medicaltype]').find(`option[value='${mt}']`).attr('selected', 'selected');
    layui.form.render('select');
}
