const _report = {
    unit: function (projectId, standardKindId, unitId, cb, er) {
        let visit = `${huayi_projectscore_url}project/submitProj?flowName=通用项目申报流程&projStatus=4&projectId=${projectId}&cmeStandardKindId=${standardKindId}&unitId=${unitId}`;
        postAction(visit).then(({data}) => {
            if (data.success) {
                cb?.();
            } else {
                layui.lat.failMsg('500(单位上报,project/submitProj)' + data.msg);
                er?.();
            }
        }).catch(error => {
            layui.lat.errorMsg('500(单位上报,project/submitProj)');
            er?.();
        });
    },
    dept: function (projectId, userId, cb, er) {
        // no need isDelay api
        let visit = `${huayi_projectscore_url}project/projectSubPerDept?userType=13&projectId=${projectId}&userid=${userId}`;
        postAction(visit).then(({data}) => {
            if (data.success) {
                cb?.();
            } else {
                layui.lat.failMsg('500(科室上报,project/projectSubPerDept)' + data.msg);
                er?.();
            }
        }).catch(error => {
            layui.lat.errorMsg('500(科室上报,project/projectSubPerDept)');
            er?.();
        });
    },
    delay: function (unitId, year, scoreLevelId, regionLevelId, cb, er) {
        if (!regionLevelId) {
            layui.lat.failMsg('在【/declare/省份拼音/portal.html】后添加URL参数【region_level_id】'); // 缺少URL参数regionLevelId
            er?.();
            return false;
        }
        let visit = `${huayi_projectscore_url}projectApplyDate/isDelay?type=1&unitId=${unitId}&year=${year}&scoreLevelId=${scoreLevelId}&regionLevelId=${regionLevelId}`;
        postAction(visit).then(({data}) => {
            if (data.success) {
                if ('5' === data.data.status) {
                    cb?.();
                } else {
                    layui.lat.failMsg(data.data.msg);
                    er?.();
                }
            } else {
                layui.lat.failMsg(`500(projectApplyDate/isDelay),${data.msg}`);
                er?.();
            }
        }).catch(error => {
            layui.lat.errorMsg('500(projectApplyDate/isDelay)');
            er?.();
        });
    },
    unit_num_bound: function (cb) {
        // in submitProj api
    },
};