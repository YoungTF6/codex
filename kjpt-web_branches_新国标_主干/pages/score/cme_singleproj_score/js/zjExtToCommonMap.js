/**
 * 浙江套向导：ext_data 中的键按 scoreLevel 映射到 cme_singleproj_score 公共列（与 grant_score_singleproj_ext 控件名一致）
 */
(function (global) {
    var ZJ_FIXED_KNOWLEDGE_ID = 'b9521268-0022-11f1-ad3f-005056a64c01';

    function pick() {
        for (var i = 0; i < arguments.length; i++) {
            var v = arguments[i];
            if (v != null && v !== undefined && String(v).trim() !== '') {
                return String(v).trim();
            }
        }
        return '';
    }

    function firstDateFromTaskTime(taskTime) {
        if (!taskTime || typeof taskTime !== 'string') {
            return null;
        }
        var parts = taskTime.split(/[~～]/);
        var s = (parts[0] || '').trim();
        if (!s) {
            return null;
        }
        var m = s.match(/(\d{4}-\d{1,2}-\d{1,2})/);
        if (m) {
            return m[1];
        }
        return s.length > 0 ? s : null;
    }

    function setKnowledgeIfEmpty(dataField) {
        if (dataField && (dataField.knowledgeId == null || dataField.knowledgeId === '')) {
            dataField.knowledgeId = ZJ_FIXED_KNOWLEDGE_ID;
        }
    }

    /** 多个片段用空格拼接，忽略空值 */
    function joinParts() {
        var a = [];
        for (var i = 0; i < arguments.length; i++) {
            var s = arguments[i];
            if (s != null && String(s).trim() !== '') {
                a.push(String(s).trim());
            }
        }
        return a.join(' ');
    }

    /**
     * @param {string} scoreLevel 授分标准 type，与表 score_level 一致
     * @param {Object} extData 扩展区已合并 studyDate(授予时间) 等键后的对象
     * @param {Object} dataField layui 提交的 data.field
     */
    global.applyZhejiangExtToCommonFields = function (scoreLevel, extData, dataField) {
        if (!scoreLevel || !extData || !dataField) {
            return;
        }
        var t = extData;
        if (dataField.medicalType == null || dataField.medicalType === '') {
            dataField.medicalType = 1;
        }

        // 赴外省（国家级/省级） — scoreType10
        if (scoreLevel === '67457a63-55a1-43db-ae50-8bc748e15626' || scoreLevel === '1afdcb1c-4a7d-11f0-97e2-005056a64c01') {
            if (t.single_proj_name) {
                dataField.singleProjName = t.single_proj_name;
            }
            if (t.single_proj_no) {
                dataField.singleProjNo = t.single_proj_no;
            }
            setKnowledgeIfEmpty(dataField);
            return;
        }

        // 外出进修、国境外、政府指令性任务 — scoreType1
        if (scoreLevel === '976f78c8-1152-4e32-8572-658a1cdb5fa4' || scoreLevel === 'c2967846-318f-4e88-b323-2853c2d63fa9'
            || scoreLevel === '78a943c6-84e6-45ab-8e1f-81a446d39bea' || scoreLevel === '9f4022dc-d341-44b9-b038-a08ec6f0c4f6'
            || scoreLevel === '8bf82417-9da7-4925-9324-75fd9a560169' || scoreLevel === '3d6a4d5b-5e09-4c90-a369-700016acfcd7') {
            if (t.jx_item) {
                dataField.singleProjName = t.jx_item;
            }
            var detail = pick(t.jx_unit, t.support_unit, t.assist_unit, t.task_content);
            if (detail) {
                // dataField.singleProjNo = detail;
                dataField.teachUnitName = detail;
            }
            // if (t.task_time) {
            //     var fd = firstDateFromTaskTime(t.task_time);
            //     if (fd) {
            //         dataField.studyDate = fd;
            //     }
            // }
            if (dataField.teachUnitName) {
                dataField.teachUnit = '';
            }
            setKnowledgeIfEmpty(dataField);
            return;
        }

        // 在职学历 — scoreType2
        if (scoreLevel === '0988b09a-cbd0-414f-9d6d-d1cabb5e4439') {
            if (t.school) {
                // var sn = t.education ? t.education + '学历教育' : '学历教育';
                dataField.singleProjName = t.education;
                // dataField.singleProjNo = t.study_year || dataField.singleProjNo;
                dataField.teachUnitName = t.school;
                dataField.teachUnit = '';
            }
            setKnowledgeIfEmpty(dataField);
            return;
        }

        // 论文/综述 — scoreType3
        if (scoreLevel === '0b964e89-d463-4775-9f8e-7daab5167132') {
            if (t.paper_content) {
                dataField.singleProjName = t.paper_content;
            } else if (t.paper_name) {
                dataField.singleProjName = t.paper_name;
            }
            if (t.paper_name) {
                dataField.teachUnitName = t.paper_name;
                dataField.teachUnit = '';
            }
            if (t.paper_level) {
                dataField.singleProjNo = t.paper_level;
            }
            setKnowledgeIfEmpty(dataField);
            return;
        }

        // 科研课题 — scoreType5（活动编号：项目级别 + 项目排名）
        if (scoreLevel === 'a99440b7-29b3-4fee-ad61-2acfe57c05cd') {
            if (t.proj_name) {
                dataField.singleProjName = t.proj_name;
            }
            var pno = joinParts(t.proj_level, t.proj_rank);
            if (pno) {
                dataField.singleProjNo = pno;
            }
            if (t.proj_unit) {
                dataField.teachUnitName = t.proj_unit;
                dataField.teachUnit = '';
            }
            setKnowledgeIfEmpty(dataField);
            return;
        }

        // 科技成果奖 — scoreType6（活动编号：奖励级别 + 奖励名称）
        if (scoreLevel === 'f9ea93aa-3e2b-4511-9d6c-df1ea3e25b03') {
            if (t.reward_proj_name) {
                dataField.singleProjName = t.reward_proj_name;
            }
            var rno = joinParts(t.reward_level, t.reward_name);
            if (rno) {
                dataField.singleProjNo = rno;
            }
            if (t.reward_unit) {
                dataField.teachUnitName = t.reward_unit;
                dataField.teachUnit = '';
            }
            setKnowledgeIfEmpty(dataField);
            return;
        }

        // 专利 — scoreType7
        if (scoreLevel === '77efa4d0-8cbf-42ab-8d60-a8635c541bc1') {
            if (t.patent_item) {
                dataField.singleProjName = t.patent_item;
            }
            setKnowledgeIfEmpty(dataField);
            return;
        }

        // 标准/指南/规范 — scoreType7 另一 type
        if (scoreLevel === '7b8eae75-4be2-43a9-8f79-7c120231a5a6') {
            if (t.patent_item) {
                dataField.singleProjName = t.patent_item;
            }
            if (typeof global.getUnitName === 'function') {
                var u = global.getUnitName();
                if (u) {
                    dataField.teachUnitName = u;
                    dataField.teachUnit = '';
                }
            }
            setKnowledgeIfEmpty(dataField);
            return;
        }

        // 出版/编译 — scoreType8
        if (scoreLevel === 'b6cdcb4f-6792-4f80-ae86-442dddb2287f') {
            if (t.book_name) {
                dataField.singleProjName = t.book_name;
            }
            if (t.book_type){
                dataField.singleProjNo = t.book_type;
            }
            if (t.book_unit) {
                dataField.teachUnitName = t.book_unit;
                dataField.teachUnit = '';
            }
            setKnowledgeIfEmpty(dataField);
            return;
        }
    };
})(typeof window !== 'undefined' ? window : this);
