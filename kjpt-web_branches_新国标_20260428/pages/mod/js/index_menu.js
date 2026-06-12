//
const _mc = {
    // '3af26d56-7d3f-e342-ed7d-ad0fc1624322': '', // parent
    'b4f4d490-1f39-424f-b631-38a65ed42905': '6eec6713-670a-43cc-ad4d-9bd700a92928', // hainan-2
    '8aa57fb8-c9fa-4cae-9fcf-4ad4c79dda40': '6eec6713-670a-43cc-ad4d-9bd700a92928', // hainan-1
    '9788a70a-6679-4212-8b65-d69595bf0af9': '6eec6713-670a-43cc-ad4d-9bd700a92928', // hainan-bulu
    '576f0919-6b07-4a0c-868d-a6509215907c': '6eec6713-670a-43cc-ad4d-9bd700a92928', // hainan-bulu
    'a0d4dab1-7552-4db6-9329-aa1a19486890': '6eec6713-670a-43cc-ad4d-9bd700a92928', // hainan-bulu
    '6c853a25-8473-f429-42f0-c0cf4dee9ce7': '6427ddba-c02f-4229-bd73-49fc1c5d21f6', // qinghai-1
    '6ffe80f1-e73b-41cc-8ecb-d2bfd7e65906': '8b1e9418-47ff-4ff7-9dd9-a9e0009a6951', // fujian-1
    '7d9dd25c-4956-49a4-bba2-c289ffa5d45a': 'a6280900-a9c2-11ec-84d6-fa163e9b64fb', // henan-1
    'e55ffcd7-234e-4a39-9aeb-0b1c311b0773': 'a6280900-a9c2-11ec-84d6-fa163e9b64fb', // henan-3-jiaozuo
    '9dd891e0-5ed1-4ad1-b553-1c8853842ea0': 'a6280900-a9c2-11ec-84d6-fa163e9b64fb,08e44437-5789-44e0-8ff8-9ecb00a6348a', // henan-zixue.conf
    // '9dd891e0-5ed1-4ad1-b553-1c8853842ea0': '08e44437-5789-44e0-8ff8-9ecb00a6348a', // neimeng-zixue.conf
    'eb28c236-bd51-4eaf-8dc7-326ed8a6f2bc': '08e44437-5789-44e0-8ff8-9ecb00a6348a', // neimeng-1
    '80261c28-1878-42ba-ae64-122d1fc830ee': '08e44437-5789-44e0-8ff8-9ecb00a6348a', // neimeng-2
    '2aebba7d-b2e4-4f6c-ae5b-814bd2a08dbf': '08e44437-5789-44e0-8ff8-9ecb00a6348a', // neimeng-3
    'c840319a-8dff-fe2c-6321-5a60a9582e01': '08e44437-5789-44e0-8ff8-9ecb00a6348a', // neimeng
    'af39ff30-4d05-4897-baa1-d47ac2265e8a': '4a6d91fb-8ba4-4560-a801-9c6f00e6d999', // guangxi-2
    '2e083cb9-cd5b-4f9e-9272-8dbda73becb4': '4a6d91fb-8ba4-4560-a801-9c6f00e6d999', // guangxi-3
    'd0c18461-e3aa-4524-8e48-5dfc2b42b26c': '4a6d91fb-8ba4-4560-a801-9c6f00e6d999', // guangxi-log
    '34aa2c41-e45e-4c79-be7e-a0c29e529a4a': 'eee87ca0-7df1-426c-aae3-7cae782b4d6b', // ningxia-1
    '322aa00f-890d-4b23-aeaa-1d790d7d93d9': 'eee87ca0-7df1-426c-aae3-7cae782b4d6b', // ningxia-2
    'd11c7a15-a633-4e93-a25a-14af865faba2': '13e2e203-7fdd-47ab-b90f-a1480112b5e5', // hunan
    '8df3b648-76a5-4fff-a19b-06a94d8d699a': '7068a5c0-2cd3-471a-90b9-9bf100aec95a', // gansu-1
    '5c610c26-dc90-4eb6-8d03-0948e11a6081': '7068a5c0-2cd3-471a-90b9-9bf100aec95a', // gansu-1-person
    'b88bae69-67d0-456d-a20a-90992a8c76f2': '7068a5c0-2cd3-471a-90b9-9bf100aec95a', // gansu-conf
    'e780c10f-2509-4d28-9d24-dbe1ebc9ed9a': '190c480d-d43c-450b-8472-a6fd00a6729d', // zhejiang-1
    'ade05400-2f26-4aa7-890b-d71ad446afb4': '190c480d-d43c-450b-8472-a6fd00a6729d', // zhejiang-2
    '3e9388b5-6486-41e1-8e98-a886a22ffdb1': '190c480d-d43c-450b-8472-a6fd00a6729d', // zhejiang-3
    '842939c9-0eb3-4302-8467-f50ba81e2b91': '190c480d-d43c-450b-8472-a6fd00a6729d', // zhejiang-group-switch
    'acd09b62-333b-4aee-934f-9ec500a9d46d': 'acd09b62-333b-4aee-934f-9ec500a9d46d', // jilin1
};
let _unit_id = localStorage.getItem('unit-id');
let _user_type = localStorage.getItem('user-type');
let _sk_id = localStorage.getItem('standardkind-id');
let _upward = localStorage.getItem('kk_unitupward') || '';
let _dept_id = localStorage.getItem('dept-id') || '';
const filterMenu = (menuTree) => {
    for (let i = menuTree.length - 1; i >= 0; --i) {
        const _node = menuTree[i];
        const menuId = _node.menuId;
        let del = false;
        if (_mc[menuId] && !(_mc[menuId].includes(_sk_id))) {
            menuTree.splice(i, 1);
            del = true;
        }
        if ('14' === _user_type) {
            // 市级学分证书-焦作-个人
            if (!del && 'e55ffcd7-234e-4a39-9aeb-0b1c311b0773' === menuId && !(_upward.includes(',4#160900#焦作市'))) {
                menuTree.splice(i, 1);
                del = true;
            }
            // 年度审验-周口-个人
            // if (!del && '7d9dd25c-4956-49a4-bba2-c289ffa5d45a' === menuId && !(_upward.includes(',4#162500#周口市'))) {
            //     menuTree.splice(i, 1);
            //     del = true;
            // }
        }
        if (!del && _node.children && _node.children.length > 0) {
            filterMenu(_node.children);
        }
        // del parent(学分审验及打印) without children
        if ('3af26d56-7d3f-e342-ed7d-ad0fc1624322' === menuId && (_node.children || []).length === 0) {
            menuTree.splice(i, 1);
        }
    }
}
function setUpward() {
    if (_unit_id && _unit_id.trim().length > 0) {
        let conf = {
            'type': 'GET',
            'timeout': 0,
            'headers': {
                'Authorization': localStorage.getItem('token'),
                'KJPT-USER-ID': localStorage.getItem('user-id')
            },
        };
        if (!localStorage.getItem('kk_unitpc')) {
            conf.url = `${huayi_personorg_url}alternative/unit/pc/${_unit_id}`;
            $.ajax(conf).done(response => {
                let res = response.data;
                res.pc = '' + (+res.phUnit) + (+res.chUnit);
                localStorage.setItem('kk_unitpc', res.pc);
                localStorage.setItem('unit-pc', res.pc);
            });
        }
        if (!localStorage.getItem('kk_unitupward')) {
            conf.url = `${huayi_personorg_url}alternative/upward/${_unit_id}`
            $.ajax(conf).done(function (response) {
                localStorage.setItem('kk_unitupward', response.data);
                localStorage.setItem('unit-upward', response.data);
                ('a6280900-a9c2-11ec-84d6-fa163e9b64fb' === _sk_id) && ('14' === _user_type) && window.location.reload();
            });
        }
        if (!localStorage.getItem('kk_depttree') && '14' !== _user_type) {
            conf.url = `${huayi_personorg_url}alternative/dept/treeData/${_unit_id}/9`;
            $.ajax(conf).done(function (response) {
                let dt = response.data;
                const lp = function (arr) {
                    for (const d of arr) {
                        if (d.deptId === _dept_id) return d;
                        if (d.children) {
                            const res = lp(d.children);
                            if (res) return res;
                        }
                    }
                }
                if ('13' === _user_type || '12' === _user_type) dt = Array(lp(dt));
                const ids = [];
                dt.forEach((d) => {
                    ids.push(d.deptId);
                    if (d.children) d.children.forEach((_) => ids.push(_.deptId));
                });
                localStorage.setItem('kk_depttree', JSON.stringify(dt));
                localStorage.setItem('kk_deptids', ids.join(','));
            });
        }
    }
    // if (!localStorage.getItem('kk_psninfo') && '14' === _user_type) {
    //     $.ajax({
    //         url: `${huayi_projectscore_url}ps/person/info`,
    //         type: 'POST',
    //         contentType: 'application/json;charset=UTF-8',
    //         data: JSON.stringify({userId: localStorage.getItem('user-id')}),
    //         success: function (res) {
    //             localStorage.setItem('kk_psninfo', JSON.stringify(res.data));
    //             localStorage.setItem('psn_info', JSON.stringify(res.data));
    //         }
    //     })
    // }
}
window.addEventListener('storage', function (event) {
    ('user-id' === event.key) && (event.oldValue !== event.newValue) && window.location.reload();
});