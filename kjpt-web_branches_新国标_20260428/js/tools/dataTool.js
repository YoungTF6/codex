/**
 * 数据转换相关工具（树过滤等）
 */
const dataTool = {

    /**
     * 行政项目管理页：学分分类（项目级别）树过滤
     * 保留：继续医学教育项目 / 高级研修项目（整棵子树）/ 国省级推荐·推广·异地备案
     * 这个用于浙江启用，其他地方不启用
     * @param {Array} sourceData 接口返回的树节点数组
     * @param {Object} [filterContext] 递归上下文，含 isUnderAdvancedTraining
     * @returns {Array}
     */
    filterProjAdminScoreLevelTree(sourceData, filterContext) {
        if (!Array.isArray(sourceData)) {
            return [];
        }
        const resultList = [];
        $.each(sourceData, (index, item) => {
            const childrenList = item.children || [];
            const nodeName = item.name || '';
            const nextContext = {
                isUnderAdvancedTraining: (filterContext && filterContext.isUnderAdvancedTraining) || nodeName === '高级研修项目'
            };
            const filteredChildren = dataTool.filterProjAdminScoreLevelTree(childrenList, nextContext);

            const isAllowedNodeByName = name => {
                if (!name) {
                    return false;
                }
                if (nextContext.isUnderAdvancedTraining) {
                    return true;
                }
                if (name === '继续医学教育项目' || name === '高级研修项目') {
                    return true;
                }
                const isNationalOrProvince = (name.indexOf('（国家）') > -1) || (name.indexOf('（省）') > -1);
                const isCmeAllowedChild =
                    isNationalOrProvince &&
                    (name.indexOf('推荐项目') > -1 || name.indexOf('推广项目') > -1 || name.indexOf('异地备案项目') > -1);
                return isCmeAllowedChild;
            };

            const isMatch = isAllowedNodeByName(nodeName);
            if (isMatch || filteredChildren.length > 0) {
                const newNode = { ...item };
                if (filteredChildren.length > 0) {
                    newNode.children = filteredChildren;
                } else {
                    delete newNode.children;
                }
                resultList.push(newNode);
            }
        });
        return resultList;
    },

    /** 广东：需排除的学分分类节点名称 */
    _guangDongExcludedScoreLevelNames: [
        '面向市内开展的实践活动',
        '区、县级继教实践活动'
    ],

    /**
     * 行政项目管理页（广东）：从完整树中排除指定学分分类及其子树，其余节点原样保留
     * 排除：「面向市内开展的实践活动」「区、县级继教实践活动」
     * @param {Array} sourceData 接口返回的树节点数组
     * @returns {Array}
     */
    filterProjAdminScoreLevelTreeGuangDong(sourceData) {
        if (!Array.isArray(sourceData)) {
            return [];
        }
        const excludedNames = dataTool._guangDongExcludedScoreLevelNames;
        const isExcludedNode = name => {
            if (!name) {
                return false;
            }
            return excludedNames.some(keyword => name.indexOf(keyword) > -1);
        };

        const resultList = [];
        $.each(sourceData, (index, item) => {
            const nodeName = item.name || '';
            if (isExcludedNode(nodeName)) {
                return;
            }

            const childrenList = item.children || [];
            const filteredChildren = dataTool.filterProjAdminScoreLevelTreeGuangDong(childrenList);
            const newNode = { ...item };
            if (filteredChildren.length > 0) {
                newNode.children = filteredChildren;
            } else {
                delete newNode.children;
            }
            resultList.push(newNode);
        });
        return resultList;
    },

    /**
     * 行政项目管理页（广东 type=5）：从两层项目级别树收集默认 scoreLevelList
     * 仅取一级节点下 children 子节点的 id，不使用一级父节点 id
     * @param {Array} sourceData 过滤后的树节点数组（一级节点列表）
     * @returns {string} 逗号分隔的 UUID 字符串，无子节点时返回 ''
     */
    collectScoreLevelListCommaFromTree(sourceData) {
        if (!Array.isArray(sourceData)) {
            return '';
        }
        const idList = [];
        $.each(sourceData, (index, topNode) => {
            const childrenList = topNode.children || [];
            $.each(childrenList, (childIndex, childNode) => {
                const nodeId = childNode.id != null ? String(childNode.id).trim() : '';
                if (nodeId && idList.indexOf(nodeId) === -1) {
                    idList.push(nodeId);
                }
            });
        });
        return idList.join(',');
    }

};
