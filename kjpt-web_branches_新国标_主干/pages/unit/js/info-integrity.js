/** 信息完善（start） */

window.infoIntegrityCheck = msgFlag => {
    let flag = true; 
    let admins = getAdminInfo(localStorage.getItem("user-id"));
    if(admins == null || admins.length == 0) return false;

    $.ajax({
        url     : huayi_personorg_url + 'comunit/unitInfoIntegrityCheck/' + localStorage.getItem('unit-id'),
        type    : 'get',
        async   : false,
        success : res => (!res.success || !res.data) && (flag = false, msgFlag && layer.msg('请完善单位信息', { icon: 7, time: 1500  })),
        error   : () => (layer.msg('单位信息校验失败', { icon: 2, time: 1500 }), flag = false)
    });
    if (!flag) return false;

    return true;
}

/** 信息完善（end） */





/** 管理员（start） */

window.getAdminInfo = userId => {
    let result = null;
    $.ajax({
        type    : 'get',
        async   : false,
        url     : huayi_permission_url + 'comUserManager/list?userId='+ userId,
        success : res => {
            if (res.success) res.data && (result = res.data);
            else layer.msg(res.msg, { icon: 7, time: 1500 });
        },
        error   : () => layer.msg('获取管理员信息失败', { icon: 7, time: 1500 })
    });
    return result;
}

window.saveAdminInfo = admins => {
    $.ajax({
        type        : 'post',
        url         : huayi_permission_url + 'comUserManager/addOrUpdateBatch',
        data        : JSON.stringify(admins) ,
        contentType : 'application/json;charset=UTF-8',
        success     : res => {
            if (res.success) layer.msg('管理员信息保存成功', { icon: 1, time: 1500 }, () => location.reload());
            else layer.msg('管理员信息保存失败', { icon: 7, time: 1500 });
        },
        error       : () => layer.msg('管理员信息保存失败', { icon: 7, time: 1500 })
    });
}

window.removeAdminInfo = (managerId,obj) => {
    if(managerId) {
        layer.confirm("确认删除此管理员?",(index) => {
            $.ajax({
                async       : false,
                type        : 'post',
                url         : huayi_permission_url + 'comUserManager/delete/'+managerId,
                data        : { userName: localStorage.getItem("user-name"), },
                success     : res => {
                    if (res.success) { 
                        $(obj).parents('.layui-form-item').remove(); 
                        layer.close(index);
                       
                    }
                    else layer.msg('管理员信息删除失败', { icon: 7, time: 1500 });
                },
                error       : () => layer.msg('管理员信息删除失败', { icon: 7, time: 1500 })
            });
        });
    } else {
        $(obj).parents('.layui-form-item').remove();
    }
    if($("#form-admin .layui-form-item").length < 10) {
        $('#btn-unitInfo-add').show();
    }

   
}

/** 管理员（end） */





/** 单位（start） */

window.getUnitInfo = unitId => {
    let result = null;
    $.ajax({
        url         : unitDetailUrl + '?unitId=' + unitId,
        type        : 'get',
        async       : false,
        dataType    : 'json',
        success     : res => {
            if (res.status == 200) res.data && (result = res.data);
            else layer.msg('获取单位信息失败', { icon: 7, time: 1500 });
        },
        error       : () => layer.msg('获取单位信息失败', { icon: 7, time: 1500 })
    });
    return result;
}

window.saveUnitInfo = formData => {
    $.ajax({
        url         : personorgUrl + '/comunit/updateUnitInfo',
        type        : 'post',
        dataType    : 'json',
        contentType : 'application/json;charset=UTF-8',
        data        : JSON.stringify(formData),
        success     : res => {
            if (res.success) {
                layer.msg('单位信息保存成功', { icon: 1, time: 1500 }, () => location.reload());
            } else layer.msg(res.msg, { icon: 7, time: 1500 });
        },
        error       : () => layer.msg('单位信息保存失败', { icon: 7, time: 1500 })
    });
}

/** 单位（end） */