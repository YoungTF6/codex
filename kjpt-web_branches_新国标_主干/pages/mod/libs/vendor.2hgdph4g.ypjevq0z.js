let _tsf = {
    _pseudoAllDeptId: '000000000',
    _pseudoAllDept: {'deptId': '000000000', 'deptName': '全部', 'listOrder': 0},
    _tree_id: _isGov ? 'tree_content_unit' : 'tree_content_dept',
    _tree_key: _isGov ? 'i' : 'deptId',
    _tree_name: _isGov ? 'n' : 'deptName',
    _tree_children: _isGov ? 'c' : 'children',
    _transfer_id: _isGov ? 'transfer_box_unit' : 'transfer_box_person',
    _transfer_key: _isGov ? 'i' : 'comPersonId',
    _transfer_name: _isGov ? 'n' : 'personName',
    _transfer_title: _isGov ? '单位' : '人员',
    gTreeData: [],
    gTreeSelId: '',
    gTreeSelNode: {},
    gTreeSel_ids: '',
    gEleTreeInst: null,
    gTransferList: [],
    gTransferSelList: [],
    gTransferSelKeys: '',
    gDeptIds: '',
    right_unit: true, // leftTree: unit/dept  rightTransfer: unit/person
    loadTreeData: function () {
        const that = this;
        let action = _isGov ? getUnitTreeData(_unitId) : getDeptTreeData(_unitId, 9);
        action.then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                if (_isGov) {
                    that.gTreeData = [{
                        'n': _unitName,
                        'p': "",
                        'c': jsonRes.data,
                        'o': 0,
                        'i': _unitId,
                        // 'unitUserType': _uut,
                    }];
                } else if (_isUnit) {
                    that.gTreeData = [that._pseudoAllDept, ...(jsonRes.data)];
                } else if (_isDept) {
                    that.gTreeData = Array(subTreeById(jsonRes.data, (node) => {
                        return node.deptId === _deptId;
                    }));
                    that.gDeptIds = flat2val(that.gTreeData, 'deptId');
                }
                that.renderTree();
            }
        }).catch(error => {
            layui.layer.msg('error:加载TreeData');
        });
    },
    renderTree: function () {
        const that = this;
        that.gEleTreeInst = layui.eleTree({
            el: '#' + that._tree_id,
            highlightCurrent: true,
            accordion: true,
            indent: 16,
            expandOnClickNode: true,
            sort: true,
            initSort: {
                field: that._tree_key
            },
            data: that.gTreeData,
            defaultPid: _isGov ? _unitId : '',
            request: {
                key: that._tree_key,
                name: that._tree_name,
                pid: 'pid',
                children: that._tree_children
            },
            customText: function (data) {
                return data[that._tree_name]
            }
        }).on('click', function (obj) {
            that.clicktreenode(obj);
        });
    },
    clicktreenode: function (obj) {
        const that = this;
        let data = obj.data;
        // console.info(JSON.stringify(obj));
        // console.info(JSON.stringify(data));
        // data.isLeaf
        that.gTreeSelId = data[that._tree_key];
        that.gTreeSelName = data[that._tree_name];
        that.gTreeSelNode = data;
        // that.gTreeSelNode[that._tree_name] = '[' + data[that._tree_key] + '] ' + data[that._tree_name];
        // console.info('1.gTreeSelNode: %s', JSON.stringify(gTreeSelNode));
        if (that.right_unit) {
            if (_isGov) {
                // data.unitUserType === 2
                if (data.isLeaf) {
                    // 行政-叶子节点,加载当前'非行政单位'
                    let newList;
                    if (!that.gTransferSelKeys.includes(data[that._tree_key])) {
                        // 已存在,虑重
                        newList = [that.gTreeSelNode];
                    } else {
                        newList = [];
                    }
                    that.reloadTransfer('tree', newList);
                } else {
                    // 行政-非叶子节点,加载当前'行政单位的子单位'
                    ('210000' !== that.gTreeSelId) && that.loadTransferData('tree');
                }
            } else {
                // 单位,加载当前`节点`(科室)的人员
                that.loadTransferData('tree');
            }
        }
        if (!that.right_unit) {
            if (_isGov) {
                if (data.isLeaf) {
                    // 行政-叶子
                    that.loadTransferDataPersonList('tree');
                } else {
                    // 行政-非叶子
                    // lat.failMsg('数据太多了，选择个单位吧');
                }
            } else {
                // 单位
                let subTree = subTreeById(that.gTreeData, node => {
                    return node.deptId === that.gTreeSelId;
                });
                that.gTreeSel_ids = flat2val(Array(subTree), 'deptId');
                that.loadTransferDataPersonList('tree');
            }
        }
    },
    queryInTree: function (val) {
        const that = this;
        that.gEleTreeInst.search(val, function (value, data) {
            if (!value) return true;
            return data[that._tree_name].indexOf(value) !== -1;
        });
    },
    renderTransfer: function () {
        const that = this;
        layui.transfer.render({
            elem: '#' + that._transfer_id,
            id: that._transfer_id,
            title:  [`待选${that._transfer_title}`, `已选${that._transfer_title}`],
            width: '43%',
            height: 500,
            data: that.gTransferList,
            parseData: function (res) {
                return {
                    'value': res[that._transfer_key],
                    'title': res[that._transfer_name],
                    'disabled': false,
                    'checked': false
                };
            },
            onchange: function (data, index) {
                // console.info('data: %s', JSON.stringify(data));
                // console.info('index: %s', index);
                let total = that.gTransferList.length;
                if (0 === index) {
                    // left -> right
                    data.forEach(i => {
                        i[that._transfer_key] = i.value;
                        i[that._transfer_name] = i.title;
                        i.checked = true;
                    });
                    that.gTransferSelList.push.apply(that.gTransferSelList, data);
                } else if (1 === index) {
                    // right -> left
                    let keys = data.map(i => i.value).join(',');
                    that.gTransferSelList = that.gTransferSelList.filter(i => !keys.includes(i[that._transfer_key]));
                }
                that.gTransferSelKeys = that.gTransferSelList.map(i => i[that._transfer_key]).join(',');
                // console.info('gTransferSelList: %s', JSON.stringify(gTransferSelList));
                //
                let cntR = that.gTransferSelList.length;
                let cntL = total - cntR;
                layui.transfer.reload(that._transfer_id, {
                    data: that.gTransferList,
                    title: [`待选${that._transfer_title}(${cntL})`, `已选${that._transfer_title}(${cntR})`],
                });
            }
        });
    },
    loadTransferData: function (source) {
        const that = this;
        if (_isGov) {
            if (!that.gTreeSelId) {
                layer.msg('先在左侧单位树选择单位');
                return false;
            }
            // query: _unitId
            // tree: gTreeSelId
            let unitId = that.gTreeSelId ? that.gTreeSelId : _unitId;
            // unitId = 'query' === source ? _unitId : unitId;
            that.loadTransferDataSubUnit(unitId, source);
        } else {
            if (!that.gTreeSelId) {
                layer.msg('先在左侧科室树选择科室');
                return false;
            }
            that.loadTransferDataPersonList(source);
        }
    },
    loadTransferDataSubUnit: function (unitId, source) {
        const that = this;
        getUnitTreeData(unitId).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                // xgb
                const _flat2arr = (tree, ck = 'c') => {
                    let resArr = [];
                    const queue = Object.entries(tree);
                    while (queue.length) {
                        const [k, node] = queue.pop();
                        resArr.push(node);
                        if (Array.isArray(node[ck]) && node[ck].length > 0) {
                            for (const [sk, sNode] of Object.entries(node[ck])) {
                                if (typeof sNode === 'object') {
                                    queue.push([`${k}.${sk}`, sNode]);
                                }
                            }
                        }
                    }
                    return resArr;
                }
                let newList = _flat2arr(jsonRes.data);
                // if (gTreeSelNode[that._tree_key]) {
                //     // 单位树没有顶级单位,这里加上`[gTreeSelNode]`
                //     unitArr = [gTreeSelNode].concat(unitArr);
                // }
                that.reloadTransfer(source, newList);
            }
        }).catch(error => {
            layer.msg('error:加载子单位');
        });
    },
    loadTransferDataPersonList: function (source) {
    },
    reloadTransfer: function (source, newList) {
        const that = this;
        that.gTransferList = that.mergeTransferData(source, newList, that.gTransferSelList);
        // console.info('reload: %s', JSON.stringify(gTransferSelList));
        let selectedKeyArr = that.gTransferSelList.map(i => i[that._transfer_key]);
        let total = that.gTransferList.length;
        let cntR = selectedKeyArr.length;
        let cntL = total - cntR;
        layui.transfer.reload(that._transfer_id, {
            data: that.gTransferList,
            value: selectedKeyArr,
            title: [`待选${that._transfer_title}(${cntL})`, `已选${that._transfer_title}(${cntR})`],
        });
    },
    mergeTransferData: function (source, newList, selList) {
        const that = this;
        let inputKey = _isGov ? $('input[name=unitId]').val() : $('input[name=personNo]').val();
        let inputName = _isGov ? $('input[name=unitName]').val() : $('input[name=personName]').val();
        // 1.newList
        // console.info('1.newList: %s', JSON.stringify(newList));
        // console.info('1.newList length: %s', newList.length);
        let tmpList = newList.filter(i => {
            // remove transfer selected
            if (that.gTransferSelKeys.includes(i[that._transfer_key])) {
                return false;
            }
            if ('tree' === source) {
                return true;
            }
            // remove diff from input
            if (inputKey) {
                // 临时`transferKey`
                let transferKey = _isGov ? that._transfer_key : 'personNo';
                return (i[transferKey] === inputKey && i[that._transfer_name].includes(inputName));
            } else {
                return i[that._transfer_name].includes(inputName);
            }
        }).map(i => {
            let res = i;
            if (_isGov) {
                res.unitName = `[${i.unitId}]${i.unitName}`;
            } else {
                res.personName = `[${i.personNo}]${i.personName}`;
            }
            return res;
        });
        // 2.selected
        // 这里transfer.getData有问题,不要使用
        // let selList = transfer.getData(that._transfer_id);
        selList.forEach(i => {
            i[that._transfer_key] = i.value;
            i[that._transfer_name] = i.title;
        });
        // console.info('2.selList: %s', JSON.stringify(selList));
        // console.info('2.selList length: %s', selList.length);
        // 3.merge
        let res = selList.concat(tmpList);
        // console.info('3.merge: %s', JSON.stringify(res));
        console.info('3.merge length: %s', res.length);
        return res;
    },
}
$(function () {
    let gIsComposing = false;
    $('.search_box input').on('input', function () {
        let val = this.value;
        (!gIsComposing) && val && _tsf.queryInTree(val);
    }).bind('compositionstart', function () {
        gIsComposing = true;
    }).bind('compositionend', function () {
        gIsComposing = false;
        let val = this.value;
        val && _tsf.queryInTree(val);
    });
});
