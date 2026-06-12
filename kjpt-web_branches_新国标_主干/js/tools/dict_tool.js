const dictTool = {

    /** 年度下拉框 */
    getYear(name, data) {
        let result = null;
        name = name || '年度';
        $.ajax({
            type        : 'post',
            url         : huayi_projectscore_url +'projectDicRegionLevel/getHoldYear',
            data        : { 
                cmeStandardKind : dictTool.getStandardKindId(), 
                unitId          : dictTool.getUnitId(),
                ...data
            },
            dataType    : 'json',
            async       : false,
            success     : re => {
                if (re.success == true) result = re.data;
                else layer.msg(name + '获取失败', { icon: 7, time: 1500 });
            },
            error   : () => layer.msg(name + '加载失败', { icon: 7, time: 1500 })
        });
        return result;
    },

    /** 学科下拉框 */
    initKnowledgeSel(sel, name, data, callback) {
        $(sel).find('option:gt(0)').remove();
        let datas = dictTool.getKnowledge(name, data);
        if (datas) {
            if (data.knowledgeType == 2) window.knowledge2Set = datas;
            datas.forEach(item => $(sel).append(`<option value="${item.knowledgeId}">${item.knowledgeName}</option>`));
            if (typeof callback == 'function') callback(datas);
            if (layui) layui.form.render();
        }
    },

    getKnowledge(name, data) {
        let result = null;
        name = name || '学科';
        $.ajax({
            type    : 'get',
            async   : false,
            url     : huayi_sjwh_url + 'comKnowledge',
            data    : { 
                cmeStandardKindId   : localStorage.getItem('standardkind-id'),  
                versionYear         : new Date().getFullYear(),
                ...data 
            },
            success : re => {
                if (re.success == true) result = re.data;
                else layer.msg(name + '加载失败', { icon: 7, time: 1500 });
            },
            error   : () => layer.msg(name + '加载失败', { icon: 7, time: 1500 })
        });
        return result;
    },

    /** 职称下拉框 */
    initTitleSel(sel, name, data, callback) {
        $(sel).find('option:gt(0)').remove();
        let datas = dictTool.getTitle(name, data);
        if (datas) {
            datas.forEach(item => $(sel).append(`<option value="${item.titleId}">${item.titleName}</option>`));
            if (typeof callback == 'function') callback(datas);
            layui && layui.form.render();
        }
    },

    getTitle(name, data) {
        let result = null;
        name = name || '职称';
        $.ajax({
            type        : 'get',
            url         : huayi_sjwh_url + 'comTitle/list/all',
            async       : false,
            contentType : 'application/json;charset=UTF-8',
            dataType    : 'json',
            data        : { 
                titleKind   : 3,
                state       : 1,
                ...data 
            },
            success     : re => {
                if (re.success == true) result = re.data;
                else layer.msg(name + '获取失败', { icon: 7, time: 1500 });
            },
            error       : () => layer.msg(name + '获取失败', { icon: 7, time: 1500 })
        });
        return result;
    },

    /** 获取配置 */
    getConfigByUnitFromRedis(...configNames) {
        if (!configNames || configNames.length < 1) return;
        $.each(configNames, (i, item) => {
            $.ajax({
                async   : false,
                type    : 'post',
                url     : huayi_sjwh_url + 'cmeCommonConfig/getConfigByUnitFromRedis',
                data    : { 
                    unitId      : dictTool.getUnitId(), 
                    configNames : item
                },
                success : res => {
                    if (res.success == true) window[item] = res.data[item];
                    else layer.msg('获取配置 ' + item + ' 失败', { icon: 7, time: 1500 });
                },
                error   : (xhr, status, error) => layer.msg('获取配置 ' + item + ' 失败', { icon: 7, time: 1500 })
            });
        });
    },
    getConfigByUnitAndScoreLevelFromRedis(scoreLevelId,...configNames) {
        if (!configNames || configNames.length < 1) return;
        $.each(configNames, (i, item) => {
            $.ajax({
                async   : false,
                type    : 'post',
                url     : huayi_sjwh_url + 'cmeCommonConfig/getConfigByUnitFromRedis',
                data    : { 
                    unitId       : dictTool.getUnitId(), 
                    configNames  : item,
                    scoreLevelId : scoreLevelId
                },
                success : res => {
                    if (res.success == true) window[item] = res.data[item];
                    else layer.msg('获取配置 ' + item + ' 失败', { icon: 7, time: 1500 });
                },
                error   : (xhr, status, error) => layer.msg('获取配置 ' + item + ' 失败', { icon: 7, time: 1500 })
            });
        });
    },
    getConfigByStandardKind(userType, ...configNames) {
        if (!configNames || configNames.length < 1) return;
        $.each(configNames, (i, item) => {
            $.ajax({
                async   : false,
                type    : 'post',
                url     : huayi_sjwh_url + 'cmeCommonConfig/getConfigByStandardKind',
                data    : { 
                    standardKindId  : dictTool.getStandardKindId(), 
                    configNames     : item,
                    userType        : userType
                },
                success : res => {
                    if (res.success == true) window[item] = res.data[item];
                    else layer.msg('获取配置 ' + item + ' 失败', { icon: 7, time: 1500 });
                },
                error   : (xhr, status, error) => layer.msg('获取配置 ' + item + ' 失败', { icon: 7, time: 1500 })
            });
        });
    },

    getUrlByStandardAndUnitType(userType, ...configNames) {
        if (!configNames || configNames.length < 1) return;
        const configLabel = configNames.join(',');
        $.ajax({
            async   : false,
            type    : 'post',
            url     : huayi_sjwh_url + 'cmeCommonConfig/getUrlByStandardAndUnitType',
            data    : { 
                standardKindId  : dictTool.getStandardKindId(), 
                configNames     : configNames.join(","),
                userType        : userType
            },
            success : res => {
                if (res.success == true) {
                    for(let key in res.data) {
                        window[key] = res.data[key];
                    }
                }
                else layer.msg('获取配置 ' + configLabel + ' 失败', { icon: 7, time: 1500 });
            },
            error   : (xhr, status, error) => layer.msg('获取配置 ' + configLabel + ' 失败', { icon: 7, time: 1500 })
        });
    },

    getConfigsByStandard( ...configNames) {
        if (!configNames || configNames.length < 1) return;
        const configLabel = configNames.join(',');
        $.ajax({
            async   : false,
            type    : 'post',
            url     : huayi_sjwh_url + 'cmeCommonConfig/getConfigByStandardKind',
            data    : { 
                standardKindId  : dictTool.getStandardKindId(), 
                configNames     : configNames.join(",")
            },
            success : res => {
                if (res.success == true) {
                    for(let key in res.data) {
                        window[key] = res.data[key];
                    }
                }
                else layer.msg('获取配置 ' + configLabel + ' 失败', { icon: 7, time: 1500 });
            },
            error   : (xhr, status, error) => layer.msg('获取配置 ' + configLabel + ' 失败', { icon: 7, time: 1500 })
        });
    },


    /** 获取套 */
    getStandardKindId() {
        return localStorage.getItem('standardkind-id');
    },
        
    /** 获取单位 */
    getUnitId() {
        return localStorage.getItem('unit-id');
    },
    
    getUnitUserType() {
        return localStorage.getItem('unit-user-type');
    },

    getManagerMedicalType() {
        return localStorage.getItem('manager-medical-type');
    }

};


const UnitCategory = {   
    MEDICAL_UNIT            : '3b5c5808-23fc-11f0-b030-005056a64c01',
    COLLEGES_N_UNIVERSITIES : '3b5c6276-23fc-11f0-b030-005056a64c01',
    RESEARCH_INSTITUTION    : '3b5c62ee-23fc-11f0-b030-005056a64c01',
    INDUSTRY_ORGANIZATION   : '3b5c6348-23fc-11f0-b030-005056a64c01',
    OTHER                   : '3b5c6398-23fc-11f0-b030-005056a64c01'
};