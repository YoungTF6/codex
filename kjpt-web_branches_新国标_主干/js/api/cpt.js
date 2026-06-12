//
let _html = {
    skId: localStorage.getItem('standardkind-id'),
    pdp: `${window.location.protocol}//${window.location.host}`,
    cskEnum: {
        '6eec6713-670a-43cc-ad4d-9bd700a92928': {'pinyin': 'hainan', 'name': '海南', 'd25': 2025,},
        '6427ddba-c02f-4229-bd73-49fc1c5d21f6': {'pinyin': 'qinghai', 'name': '青海', 'd25': 2025,},
        '8b1e9418-47ff-4ff7-9dd9-a9e0009a6951': {'pinyin': 'fujian', 'name': '福建', 'd25': 9999,},
        '73ba18db-33fd-4746-ab41-9beb009f69a1': {'pinyin': 'hubei', 'name': '湖北', 'd25': 9999,},
        'a6280900-a9c2-11ec-84d6-fa163e9b64fb': {'pinyin': 'henan', 'name': '河南', 'd25': 2025,},
        '08e44437-5789-44e0-8ff8-9ecb00a6348a': {'pinyin': 'neimeng', 'name': '内蒙', 'd25': 2025,},
        '4a6d91fb-8ba4-4560-a801-9c6f00e6d999': {'pinyin': 'guangxi', 'name': '广西', 'd25': 9999,},
        'eee87ca0-7df1-426c-aae3-7cae782b4d6b': {'pinyin': 'ningxia', 'name': '宁夏', 'd25': 2025,},
        '7068a5c0-2cd3-471a-90b9-9bf100aec95a': {'pinyin': 'gansu', 'name': '甘肃', 'd25': 9999,},
        'acd09b62-333b-4aee-934f-9ec500a9d46d': {'pinyin': 'jilin', 'name': '吉林', 'd25': 9999,},
        //
        '13e2e203-7fdd-47ab-b90f-a1480112b5e5': {'pinyin': 'hunan', 'name': '湖南', 'd25': 9999,},
        '190c480d-d43c-450b-8472-a6fd00a6729d': {'pinyin': 'zhejiang', 'name': '浙江', 'd25': 2025,},
        '289bf0ca-52cb-4b19-b737-9bd200a69ce1': {'pinyin': 'guangdong', 'name': '广东', 'd25': 2025,},
        '6b1ee281-8860-49e7-8bfa-9ea30110c0a0': {'pinyin': 'test_dongguan', 'name': '东莞', 'd25': 9999,},
        'd4c0f901-4059-4bb0-97be-27fec8e28e97': {'pinyin': 'anhui', 'name': '安徽', 'd25': 2025,},
        'c5b1515e-3435-43a3-92b6-9cd800fb7d4b': {'pinyin': 'sichuan', 'name': '四川', 'd25': 2025,}
    },
    verifycpt: function () {
        let usrpy = this.getusrpinyin();
        let usrname = _html.cskEnum[_html.skId].name;
        //
        let p = window.location.pathname;
        p = p.substring(0, p.lastIndexOf('/'));
        let pathpy = p.substring(p.lastIndexOf('/') + 1), pathname;
        pathpy = pathpy.replace('2', '');
        for (let key of Object.keys(_html.cskEnum)) {
            if (_html.cskEnum[key].pinyin === pathpy) {
                pathname = _html.cskEnum[key].name;
                break;
            }
        }
        if (usrpy !== pathpy) {
            let msg = `登录帐号所属套【${usrname}】，申报书所属套【${pathname}】，不匹配！`;
            layui.layer.alert(msg, {icon: 0});
        }
    },
    getusrpinyin: function () {
        return _html.cskEnum[_html.skId]['pinyin'];
    },
    getpage: function (preview) {
        return {'0': 'portal', '1': 'preview'}[preview || 0];
    },
    isd25: function (holdYear) {
        let year = +holdYear;
        let d25 = _html.cskEnum[_html.skId]['d25']
        return year >= d25;
    },
    force_old: function (slId) {
        return [
            '8bfb5dff-fbcb-46ee-aba0-a58e00ad9902', // 内蒙市级推荐
            '06dba136-11cd-4738-a7f9-a12300e5c47d', // 河南市级
            '057cd830-0b28-4f2b-9e5b-cf22f5098367', // 海南市级
            // '488e08c4-ccc1-11ef-800f-005056a64c01', // 广东省级
            '54ab0658-ccc0-11ef-800f-005056a64c01', //
            '95b9ef88-7265-11f0-adb9-005056a64c01', // 广东面向市内实践活动
            '95b9efce-7265-11f0-adb9-005056a64c01', // 广东面向市（省级）
            '3037222a-2e5d-11f1-a586-005056a64c01', // 广东区县级实践活动
        ].includes(slId);
    },
    isZzhejiangST: function (slId) {
        return [
            '874d523a-a292-4b4c-8a79-61b6b99228e3',
        ].includes(slId);
    },
    isAnhuiSJ: function (slId) {
        return [
            'cd88e235-1a72-4753-ba44-02ca7dbf4a5d',
            '77a6263d-3900-46b2-ba21-cacfc67202c9',
        ].includes(slId);
    },
    ppp: function (holdYear, slId, preview) {
        let res = {'path': 'declare', 'pinyin': this.getusrpinyin(), 'page': this.getpage(preview)};
        if (this.isd25(holdYear)) {
            res.path = 'declare25';
            res.page = 'index';
            // 河南省级中医
            if ('ddc04ee8-70d1-11f0-89b2-fa163e2ff656' === slId) res.page = 'index2';
            // 浙江省中医
            if ('d0b501c2-1229-11f1-aa66-005056a64c01' === slId) res.page = 'index2';
            // 安徽市级
            if (this.isAnhuiSJ(slId)) res.page = 'index2';
            if (this.isZzhejiangST(slId)) res.page = 'index3';
        }
        if (this.force_old(slId)) {
            res.path = 'declare';
            res.pinyin = this.getusrpinyin();
            res.page = this.getpage(preview);
            // 海南市级组织的继续医学教育培训班
            if ('057cd830-0b28-4f2b-9e5b-cf22f5098367' === slId) res.pinyin = 'hainan2';
        }
        return res;
    },
    getcpturl: function (conf) {
        let {holdYear, slId, projectId, source, preview, regionLevelId, projType, projectType, topUnitId} = conf;
        let {path, pinyin, page} = this.ppp(holdYear, slId, preview);
        if (!pinyin) return '';
        let rand = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        let params = `a=${rand}`
            + `&source=${source || ''}`
            + `&zh_cn=1`
            + `&hold_year=${holdYear}`
            + `&score_level_id=${slId}`
            + `&project_id=${projectId}`
            + `&preview=${preview}`
            + `&region_level_id=${regionLevelId}`
            + (topUnitId ? `&top_unit_id=${topUnitId}` : '')
            + `&project_type=${'null,undefined'.includes(projectType) ? '' : projectType}`
            + `&proj_type=${projType || ''}`;
        if ('feda9980-bbca-11ed-a634-fa163e9b64fb' === slId) return `${_html.pdf}/pages/project/declare/${pinyin}/syjs/${page}.html?${params}`;
        return `${_html.pdp}/pages/mod/${path}/${pinyin}/${page}.html?${params}`;
    }
}
function getCptUrl(holdYear, scoreLevelId, fun, unitUpward) {
    return '';
}
function getcpturl2(holdYear, slId, projectId, source, preview, projType, regionLevelId, projectType, topUnitId) {
    return _html.getcpturl({
        'holdYear': holdYear,
        'slId': slId,
        'projectId': projectId,
        'source': source,
        'preview': preview,
        'regionLevelId': regionLevelId,
        'projectType': projectType,
        'projType': projType,
        'topUnitId': topUnitId,
    });
}


