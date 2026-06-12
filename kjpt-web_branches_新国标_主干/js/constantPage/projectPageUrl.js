function getProjectPageUrl(holdYear, scoreLevelId, projectId, source, preview,projType,regionLevelId,projectType, topUnitId) {
    const standardKindId = localStorage.getItem("standardkind-id");
    const baseUrl = "../mod/declare";
    const topUnitParam = topUnitId ? `&top_unit_id=${topUnitId}` : '';
    const commonParams = `?a=a&source=${source}&zh_cn=1&hold_year=${holdYear}&score_level_id=${scoreLevelId}&project_id=${projectId}&preview=${preview}&proj_type=${projType}&region_level_id=${regionLevelId}&project_type=${projectType}${topUnitParam}`;
    const paths = {
        '6eec6713-670a-43cc-ad4d-9bd700a92928': 'hainan',
        '08e44437-5789-44e0-8ff8-9ecb00a6348a': 'neimeng',
        '6427ddba-c02f-4229-bd73-49fc1c5d21f6': 'qinghai',
        '73ba18db-33fd-4746-ab41-9beb009f69a1': 'hubei',
        '4a6d91fb-8ba4-4560-a801-9c6f00e6d999': 'guangxi',
        '8b1e9418-47ff-4ff7-9dd9-a9e0009a6951': 'fujian',
        'eee87ca0-7df1-426c-aae3-7cae782b4d6b': 'ningxia',
        '289bf0ca-52cb-4b19-b737-9bd200a69ce1': 'guangdong',
        'a6280900-a9c2-11ec-84d6-fa163e9b64fb': 'henan',
        '7068a5c0-2cd3-471a-90b9-9bf100aec95a': 'gansu',
        '13e2e203-7fdd-47ab-b90f-a1480112b5e5': 'hunan'
    };

    //新模板地市集合
    const validStandardKindIds = new Set([
        '08e44437-5789-44e0-8ff8-9ecb00a6348a',
        '6eec6713-670a-43cc-ad4d-9bd700a92928',
        'eee87ca0-7df1-426c-aae3-7cae782b4d6b',
        '289bf0ca-52cb-4b19-b737-9bd200a69ce1',
        'a6280900-a9c2-11ec-84d6-fa163e9b64fb',
        '6427ddba-c02f-4229-bd73-49fc1c5d21f6'
    ]);

    //排除
    const excludedScoreLevelIds = [
        "8bfb5dff-fbcb-46ee-aba0-a58e00ad9902",
        "54ab0658-ccc0-11ef-800f-005056a64c01",
        "06dba136-11cd-4738-a7f9-a12300e5c47d",
        "057cd830-0b28-4f2b-9e5b-cf22f5098367",
        //广东省级
        "95b9ef88-7265-11f0-adb9-005056a64c01",
        "95b9efce-7265-11f0-adb9-005056a64c01",
        "3037222a-2e5d-11f1-a586-005056a64c01",
        //neimeng
        "2da91b0e-2272-11f1-8a80-005056a64c01"
    ];

    if (!paths[standardKindId]) return getcpturl2(holdYear, scoreLevelId, projectId, source, preview,projType,regionLevelId,projectType);

    const path = paths[standardKindId];

    if (holdYear >= 2025 && !excludedScoreLevelIds.includes(scoreLevelId)  && 
        validStandardKindIds.has(standardKindId)) {
        if (scoreLevelId === 'ddc04ee8-70d1-11f0-89b2-fa163e2ff656') {
            // 河南省级中医特殊跳转
            return `${baseUrl}25/${path}/index2.html${commonParams}`;
        }
        return `${baseUrl}25/${path}/index.html${commonParams}`;
    }

    const pageType = preview === 0 ? 'portal' : 'preview';
    if(scoreLevelId==='057cd830-0b28-4f2b-9e5b-cf22f5098367'){
        // 海南市级组织的继续医学教育培训班
        return `${baseUrl}/hainan2/${pageType}.html${commonParams}`;
    }else if(scoreLevelId==='54a58ee4-ccc0-11ef-800f-005056a64c01'){
        // 湖南按zd要求临时跳转到广东
        return `${baseUrl}/test_dongguan/${pageType}.html${commonParams}`;
    }
    else{
        return `${baseUrl}/${path}/${pageType}.html${commonParams}`;
    }
}