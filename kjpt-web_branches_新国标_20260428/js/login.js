const layer_title_style = 'text-align: center; padding-left: 80px; font-weight: bold; font-size: 16px;',
    host = window.location.host;

let xhrCache = null,
    datasCache = null,
    provSelectFlag = true,
    topUnitId = '';


localStorage.setItem('login-url', window.location.href);


/** 登录tab切换 */
$('.lb_box ul li').click(function (e) {
    if (!$(this).hasClass('actr')) {
        // 计算当前登录区域
        if (login_area == '1') {
            login_area = '2';
            cur_login = login_area + '_' + login_method_2;
        } else {
            login_area = '1';
            cur_login = login_area + '_' + login_method_1;
        }
    }
    console.log('cur_login_method : ' + cur_login);

    let index = $(this).index();
    $(this).addClass('actr').siblings().removeClass('actr');
    $('.lb_tab').eq(index).fadeIn(500).siblings('.lb_tab').fadeOut(500);
});

/* 显示密码 */
$('.showText').on('click', e => {
    let src = e.currentTarget.src;
    let $passwordInput = $(e.currentTarget).siblings('input[name="password"]').first();
    if (!$passwordInput.length) return;
    if (src.indexOf('eyes-open-min.png') >= 0) {
        $(e.currentTarget).attr('src', 'img/eyes-close-min.png');
        $passwordInput.attr('type', 'password');
    } else {
        $(e.currentTarget).attr('src', 'img/eyes-open-min.png');
        $passwordInput.attr('type', 'text');
    }
})

// 计算当前登录区域 
let login_area      = '1',
    login_method_1  = '1',
    login_method_2  = '1',
    cur_login       = '1_1';

// 获取验证码 CD
let InterValObj, // timer变量，控制时间
    count           = 60, // 间隔函数，1秒执行
    curCount; // 当前剩余秒数


/** 左右切换动画效果 */
/*$('.atiem').click(e => {
    e.preventDefault();
    $('#tablet').toggleClass('move');
    $('#wifi').toggleClass('move');

    // 计算当前登录区域
    if (login_area == '1') {
        login_area = '2';
        cur_login  = login_area + '_' + login_method_2;
    } else {
        login_area = '1';
        cur_login  = login_area + '_' + login_method_1;
    }
    console.log('cur_login_method : ' + cur_login);
});*/


/** tab切换 */
$('.login_ul li').on('click', function () {
    if (!$(this).hasClass('cur')) {
        // 计算当前登录区域
        if (login_method_1 == '1') login_method_1 = '2';
        else login_method_1 = '1';
        cur_login = login_area + '_' + login_method_1;
    }
    console.log('cur_login_method : ' + cur_login);

    let index = $(this).index();
    $(this).addClass('cur').siblings().removeClass('cur');
    $('.login_fields').eq(index).addClass('hid').siblings().removeClass('hid');
});
$('.login_tab2 li').on('click', function () {
    if (!$(this).hasClass('cur2')) {
        // 计算当前登录区域
        if (login_method_2 == '1') login_method_2 = '2';
        else login_method_2 = '1';
        cur_login = login_area + '_' + login_method_2;
    }
    console.log('cur_login_method : ' + cur_login);

    let index = $(this).index();
    $(this).addClass('cur2').siblings().removeClass('cur2');
    $('.login_file').eq(index).addClass('hi').siblings().removeClass('hi');
});


/** 回车事件 */
$(document).keypress(e => {
    if (e.which == 13) {
        // $('input[type="button"]').click();
        $('#login_' + cur_login + ' [name=login_btn]').click();
    }
});


/** 全屏 */
window.fullscreen = function () {
    elem = document.body;
    if (elem.webkitRequestFullScreen) elem.webkitRequestFullScreen();
    else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
    else if (elem.requestFullScreen) elem.requestFullscreen();
    else ; // 浏览器不支持全屏API或已被禁用
}


layui.use([ 'form', 'layer', 'jquery' ], () => {
    let { layer, form } = layui;


    /** 页面初始化 */
    $(() => {
        /* 验证码初始化 */
        /*$('#mpanel').pointsVerify({
            defaultNum : 4,	// 默认的文字数量
            checkNum   : 3,	// 校对的文字数量
            vSpace     : 5,	// 间隔
            imgUrl	   : 'login_files/images/',
            // imgName    : [ '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg' ],
            imgName    : [ '8.jfif', '9.jfif', '10.jpg', '11.webp' ],
            imgSize    : { width  : '400px', height : '250px' },
            barSize    : { width  : '400px', height : '40px' },
            ready 	   : () => {},
            success    : () => {
                // 隐藏验证码
                $('.mpanel_bg').hide();
                $('#mpanel').hide();
                Login.before();
            },
            error      : () => {}
        });*/

        /* 登录按钮 */
        $('[name=login_btn]').on('click', Login.formValidation);

        /* 获取验证码按钮 */
        $('.lb_tab [name=code_btn]').on('click', () => {
            let mobile = $('#login_' + cur_login + ' [name=mobile]').val(),
                btn = $('#login_' + cur_login + ' [name=code_btn]');

            if (strTool.isBlank(mobile)) {
                msg(layer, '请输入手机号', 7, 1500);
                return false;
            }
            if (!phoneTool.isMobile(mobile)) {
                msg(layer, '请输入正确的手机号', 7, 1500);
                return false;
            }
            let sendSmsAction = () => {
                Login.getCode('' + encodeAesString(mobile), btn, 60, '');
            };


            if (typeof FrontCaptcha !== "undefined") {
                FrontCaptcha.init(() => {
                    sendSmsAction();
                });
            } else {
                sendSmsAction();
            }
        });
        $('#two-factor-verification [name=code_btn]').on('click', () => {
            let managerInfo = $('#two-factor-verification [name=manager_select]').val().split(','),
                managerId   = managerInfo[0];
                mobile      = managerInfo[1],
                btn         = $('#two-factor-verification [name=code_btn]');
            if (null == mobile || mobile.trim().length < 1) {
                layer.alert('<sapn style="color: #666666;">' +
                    '请先选择管理员。如果您是第一次使用本功能，请点击选择框右侧的【新增】按钮录入您的信息。</sapn>');
                return false;
            }
            Login.getCode(mobile, btn, 120, managerId);
        });
        $('#admin-check [name=code_btn]').on('click', () => {
            let mobile      = $('#admin-check [name=mobile]').val(),
                managerId   = $('#admin-check [name=managerId]').val(),
                btn         = $('#admin-check [name=code_btn]');
            Login.getCode('' + encodeAesString(mobile), btn, 120, managerId);
        });

        getPersonRegisterConfig();

    });


    /** 登录相关 */
    window.Login = {

        /* 手机验证码获取 */
        getCode: (mobile, btn, time, managerId) => {
            btn.css('pointer-events', 'none').addClass('layui-disabled').attr('disabled', true);

            let url = huayi_mcenter_url + 'message/code/sendEncode';
            $.ajax({
                url         : (managerId && managerId.length > 0) ? url + '/manager' : url,
                type        : 'post',
                contentType : 'application/json',
                dataType    : 'json',
                data        : JSON.stringify({
                    'msgCodeType'   : 'LOGIN',
                    'phone'         : managerId ? '1' : mobile.toString(),
                    'managerId'     : managerId
                }),
                success: (res) => {
                    if (res.success == true) {
                        msg(layer, '验证码已发送，请注意查收', 1, 1500);

                        // 重获验证码倒计时
                        curCount = 0 < time ? time : count;
                        btn.html(curCount + '秒后重获');
                        InterValObj = window.setInterval(() => { setRemainTime(btn); }, 1000);
                    } else {
                        msg(layer, res.msg, 2, 1500);
                        btn.css('pointer-events', '').removeClass('layui-disabled').attr('disabled', false);
                    }
                },
                error: (xhr, status, error) => {
                    msg(layer, '验证码发送失败', 7, 1500);
                    btn.css('pointer-events', '').removeClass('layui-disabled').attr('disabled', false);
                }
            });
        },

        /* 手机验证码验证 */
        checkCode: (mobile, code, managerId) => {
            let result  = false,
                url     = huayi_mcenter_url + 'message/code/checkEncode',
                headers = {};
            if (managerId && managerId.length > 0) {
                headers = {
                    'Authorization' : xhrCache ? xhrCache.getResponseHeader('Authorization') : '',
                    'KJPT-USER-ID'  : xhrCache ? xhrCache.getResponseHeader('KJPT-USER-ID') : ''
                };
            }
            $.ajax({
                url         : (managerId && managerId.length > 0) ? url + '/manager' : url,
                type        : 'post',
                contentType : 'application/json',
                dataType    : 'json',
                async       : false,
                headers     : headers,
                data        : JSON.stringify({
                    'msgCodeType'   : 'LOGIN',
                    'phone'         : mobile.toString(),
                    'code'          : code.toString(),
                    'managerId'     : managerId,
                }),
                success: (res) => {
                    if (res.success == true) result = true;
                    else msg(layer, res.msg, 2, 1500);
                },
                error: (xhr, status, error) => msg(layer, '手机验证码验证失败', 7, 1500)
            });

            return result;
        },

        /* 表单验证 */
        formValidation: () => {
            if (cur_login.endsWith('1')) { // 账号（证件号）、密码登录
                let username = $('#login_' + cur_login + ' [name=user_name]').val(),
                    password = $('#login_' + cur_login + ' [name=password]').val();
                if (!(username && password)) {
                    msg(layer, '请将用户名、密码填写完整', 7, 1500);
                    return false;
                }
            } else { // 手机号登录
                let mobile = $('#login_' + cur_login + ' [name=mobile]').val(),
                    code = $('#login_' + cur_login + ' [name=code]').val();
                if (!(mobile && code)) {
                    msg(layer, '请将手机号、验证码填写完整', 7, 1500);
                    return false;
                }
            }

            // 打开验证码
            // $('.mpanel_bg').show();
            // $('#mpanel').show();

            Login.before();
        },

        /* 登录前 */
        before: () => {
            if (cur_login.endsWith('1')) { // 账号（证件号）、密码登录
                let username    = $('#login_' + cur_login + ' [name=user_name]').val().trim(),
                    pwd         = $('#login_' + cur_login + ' [name=password]').val(),
                    formData    = {
                        loginMethod : 'PWD',
                        userName    : username,
                        userPwd     : '' + encodeAesString(pwd)
                        // userPwd  	: pwd
                    };
                Login.login(formData);
            } 
            else { // 手机号登录
                let mobile      = $('#login_' + cur_login + ' [name=mobile]').val(),
                    code        = $('#login_' + cur_login + ' [name=code]').val(),
                    formData    = {
                        loginMethod : 'CODE',
                        mobile      : mobile,
                        code        : code,
                        userPwd     : '' + encodeAesString('123456') // TODO 临时解决手机号登录失败问题
                    };
                if (Login.checkCode('' + encodeAesString(mobile), encodeAesString(code), '')) Login.login(formData);
                // $('.verify-refresh').click();
            }
        },

        /* 登录 */
        login: (formData) => {
            let load_index = layer.msg('<span style="color: #666666;">&nbsp;正在登录&nbsp;···</span>', { icon: 16, shade: 0.3, time: 0 });
            $.ajax({
                type        : 'POST',
                contentType : 'application/json',
                url         : huayi_permission_url + 'login',
                data        : JSON.stringify(formData),
                success     : (data, textStatus, xhr) => {
                    let datas = data.data;
                    if (data.status == 200) {
                        xhrCache = xhr;
                        datasCache = datas;

                        // TODO 跳转通知页面，禁止进入系统
                        // let flag_1      = '6eec6713-670a-43cc-ad4d-9bd700a92928' == datas.standardKindId,
                        //     timeCur     = new Date().getTime(),
                        //     timeStart   = Date.parse('2023-04-10 00:00:00'),
                        //     timeEnd     = Date.parse('2223-04-23 23:59:59'),
                        //     flag_2      = timeCur < timeEnd && timeCur > timeStart;
                        // if (flag_1 && flag_2) {
                        //     window.location.href = 'pages/notice/maintenance.html';
                        //     return false;
                        // }

                        // 已注销单位禁止登录
                        if ([ 11, 12 ].indexOf(datas.userType) >= 0 && datas.cstate == 4) {
                            msg(layer, '该账号已注销', 7, 1500);
                            return false;
                        }
                        // 用户组类型1：超级管理员初始化 2管理员 3技术支持和前方代表 11、卫生行政部门账号(政府版)12 、机构用户(单位版)13科室用户
                        if ([ 1, 2, 3, 11, 12, 13 ].indexOf(datas.userType) >= 0) {
                            Login.twoFactorVerification(load_index);
                            return false;
                        }
                        Login.success();
                    } 
                    else if (data.status == 50001) window.location.href = 'authentication.html?flag=' + login_area + '&mobile=' + formData.mobile;
                    else if (data.status == 50002) {
                        layer.alert('<sapn style="color: #666666;">' + data.msg + '</sapn>', { icon: 7, btnAlign: 'c' }, index => {
                            layer.close(index);
                            Login.pwdChange(datas.userId);
                        });
                    } 
                    else msg(layer, data.msg, 2, 1500); // $('.verify-refresh').click();
                    layer.close(load_index);
                },
                error       : (XMLHttpRequest, textStatus, errorThrown) => {
                    msg(layer, '登录失败', 7, 1500);
                    // $('.verify-refresh').click();
                    layer.close(load_index);
                }
            });
        },

        /* 登陆成功 */
        success: () => {
            let xhr         = xhrCache,
                datas       = datasCache;
            localStorage.clear();
            localStorage.setItem('user-id', xhr.getResponseHeader('KJPT-USER-ID') || '');
            localStorage.setItem('login-url', window.location.href);
            localStorage.setItem('token', xhr.getResponseHeader('Authorization') || '');
            localStorage.setItem('token-exp-time', xhr.getResponseHeader('token-exp-time') || 0);
            localStorage.setItem('refresh-token', xhr.getResponseHeader('refresh-token') || '');
            localStorage.setItem('unit-id', datas.unitId || '');
            localStorage.setItem('unit-name', datas.unitName || '');
            localStorage.setItem('standardkind-id', datas.standardKindId || '');
            localStorage.setItem('user-name', datas.userName || '');
            localStorage.setItem('user-type', datas.userType || '');
            localStorage.setItem('com-user-entity-id', datas.comUserEntityId || '');
            localStorage.setItem('unit-user-type', datas.unitUserType || 0);
            localStorage.setItem('unit_type', datas.unitType || 0);
            if (datas.userType == '13') {
                localStorage.setItem('dept-id', datas.deptId || '');
                localStorage.setItem('dept-name', datas.deptName || '');
            }
            if (datas.userType == '11') {
                localStorage.setItem('manager-medical-type', datas.managerMedicalType || '');
            }
            localStorage.removeItem('menu-unit-id');
            // 添加文件验证cookie
            document.cookie = `file_verify_cookie=${xhr.getResponseHeader('Authorization')}; path=/;`;
                    
            let loginUrl    = getConfig();
            console.info('login-url: ' + loginUrl);
            msg(layer, '登录成功', 1, 1500);
            window.location.href = 'index.html';
        },

        /* 安全手机验证 */
        twoFactorVerification: (loadIndex) => {
            layer.close(loadIndex);
            Login.getManager();
            layer.open({
                type        : 1,
                title       : [ '安全手机验证', layer_title_style ],
                content     : $('#two-factor-verification'),
                area        : [ '600px', '375px' ],
                id          : 'two-factor-verification-layer',
                btn         : [ '确认', '取消' ],
                btnAlign    : 'c',
                yes         : () => {
                    let managerInfo = $('#two-factor-verification [name=manager_select]').val().split(','),
                        managerId   = managerInfo[0],
                        mobile      = managerInfo[1],
                        realname    = managerInfo[2],
                        code        = $('#two-factor-verification [name=code]').val();
                    if (!mobile || !code) {
                        msg(layer, '请选择管理员，并填写验证码', 7, 1500);
                        return false;
                    }
                    if (Login.checkCode(encodeAesString(mobile), encodeAesString(code), managerId)) {
                        Login.log(mobile, realname, managerId);
                        Login.success();
                        localStorage.setItem('manager-id', managerId || '');
                    }
                }
            });
        },

        /* 获取管理员 */
        getManager: () => {
            $.ajax({
                type        : 'GET',
                contentType : 'application/json',
                url         : huayi_permission_url + 'comUserManager',
                data        : { userId: xhrCache.getResponseHeader('KJPT-USER-ID') || '' },
                success     : (data, textStatus, xhr) => {
                    if (data.status == 200) {
                        let datas = data.data,
                            select = $('#two-factor-verification [name=manager_select]');
                        select.html('').append('<option value="">请选择</option>');
                        $.each(datas, (i, item) => {
                            select.append($('<option></option>')
                                .val(item.managerId + ',' + encodeAesString(item.userPhone) + ',' + item.userRealName)
                                .html(item.userRealName));
                        }); 
                        form.render('select');
                        select.parent().next().find("button").toggle(datas.length == 0);
                    } else msg(layer, '获取管理员失败', 2, 1500);
                },
                error       : (XMLHttpRequest, textStatus, errorThrown) => msg(layer, '获取管理员失败', 7, 1500)
            });
        },

        /* 新增管理员 */
        addManager: () => {
            let index = layer.open({
                type        : 1,
                title       : [ '新增管理员', layer_title_style ],
                content     : $('#add-manager'),
                area        : [ '370px', '240px' ],
                id          : 'add-manager-layer',
                btn         : [ '确认', '取消' ],
                btnAlign    : 'c',
                yes         : () => {
                    let mobile      = $('#add-manager [name=mobile]').val(),
                        realname    = $('#add-manager [name=realname]').val();
                    if (!(mobile && realname)) {
                        msg(layer, '请将手机号、真实姓名填写完整', 7, 1500);
                        return false;
                    }
                    if (!phoneTool.isMobile(mobile)) {
                        msg(layer, '您输入的手机号不符合规范，请输入中国大陆11位手机号', 7, 2000);
                        return false;
                    }

                    layer.confirm('<sapn style="color: #666666;">' +
                        '您输入的姓名为：' + realname + '，<br>' +
                        '手机号码为：' + mobile + '。<br>' +
                        '确认添加吗？</sapn>', i => {
                            $.ajax({
                                type        : 'POST',
                                contentType : 'application/json',
                                url         : huayi_permission_url + 'comUserManager/add',
                                data        : JSON.stringify({
                                    userPhone       : mobile,
                                    userRealName    : realname,
                                    userId          : xhrCache.getResponseHeader('KJPT-USER-ID') || '',
                                    userName        : datasCache.userName || ''
                                }),
                                success     : (data, textStatus, xhr) => {
                                    let datas = data.data;
                                    if (200 == data.status && 0 < datas.code) {
                                        layer.close(index);
                                        if (1 == datas.code) {
                                            // msg(layer, '匹配到超级用户', 1, 1500);
                                            $('#admin-check [name=mobile]').val(mobile);
                                            $('#admin-check [name=managerId]').val(datas.msg);
                                            Login.adminCheck(mobile, realname, datas.msg);
                                        } else if (2 == datas.code) {
                                            Login.getManager();
                                            msg(layer, '新增成功', 1, 1500);
                                        }
                                    } else msg(layer, datas.msg, 2, 1500);
                                },
                                error       : (XMLHttpRequest, textStatus, errorThrown) => msg(layer, '新增失败', 7, 1500)
                            });
                        });

                },
                end         : () => $('#add-manager [name=mobile], #add-manager [name=realname]').val('')
            });
        },

        /* 超级用户验证 */
        adminCheck: (mobile, realname, managerId) => {
            let index = layer.open({
                type        : 1,
                title       : [ '用户登录', layer_title_style ],
                content     : $('#admin-check'),
                area        : [ '345px', '190px' ],
                id          : 'admin-check-layer',
                btn         : [ '确认', '取消' ],
                btnAlign    : 'c',
                yes         : () => {
                    let code = $('#admin-check [name=code]').val();
                    if (!code) {
                        msg(layer, '请填写验证码', 7, 1500);
                        return false;
                    }
                    if (Login.checkCode('' + encodeAesString(mobile), encodeAesString(code), managerId)) {
                        Login.log(mobile, realname, managerId);
                        Login.success();
                    }
                },
                end         : () => $('#admin-check [name=code]').val('')
            });
        },

        /* 日志 */
        log: (mobile, realname, managerId) => {
            $.ajax({
                type        : 'POST',
                contentType : 'application/json',
                url         : huayi_permission_url + 'comUserManagerLog/add',
                data        : JSON.stringify({
                    managerId       : managerId,
                    userPhone       : mobile,
                    userRealName    : realname,
                    message         : '验证通过',
                    type            : 2,
                    userName        : datasCache.userName || ''
                }),
                success: (data, textStatus, xhr) => {
                    if (200 == data.status) localStorage.setItem('manager-id', managerId || '');
                    else msg(layer, '日志记录失败', 2, 1500);
                },
                error       : (XMLHttpRequest, textStatus, errorThrown) => msg(layer, '日志记录失败', 7, 1500)
            });
        },

        /* 修改密码 */
        pwdChange: (userId) => {
            let $newPwdInput    = $('#pwd-change [name=newPwd]'),
                $newPwdReInput  = $('#pwd-change [name=newPwdRe]');
            $newPwdInput.val('');
            $newPwdReInput.val('');

            let index           = layer.open({
                type        : 1,
                title       : [ '密码修改', layer_title_style ],
                content     : $('#pwd-change'),
                area        : [ '475px', '240px' ],
                id          : 'pwd-change-layer',
                btn         : [ '确认', '取消' ],
                btnAlign    : 'c',
                yes         : () => {
                    const   newPwd      = $newPwdInput.val(),
                            newPwdRe    = $newPwdReInput.val();
                    if (strTool.isBlank(newPwd)) {
                        msg(layer, '请输入新密码', 7, 1500);
                        return false;
                    }
                    if (!pwdTool.isPass(newPwd)) {
                        msg(layer, '新密码应为8-16位，包含数字、字母（区分大小写）、特殊字符，', 7, 2000);
                        return false;
                    }
                    if (strTool.isBlank(newPwdRe)) {
                        msg(layer, '请再次输入新密码', 7, 1500);
                        return false;
                    }
                    if (newPwd != newPwdRe) {
                        msg(layer, '两次输入的密码不一致', 7, 1500);
                        return false;
                    }
                    $.ajax({
                        type        : 'GET',
                        contentType : 'application/json',
                        url         : huayi_permission_url + 'comuser/changePasswordByUserId',
                        data        : {
                            userId      : userId,
                            password    : '' + encodeAesString(newPwd)
                            // password	   : newPwd
                        },
                        success     : (data, textStatus, xhr) => {
                            let datas = data.data;
                            if (data && 200 == data.status) {
                                layer.close(index);
                                layer.alert('<sapn style="color: #666666;">密码修改成功，请使用新密码登录系统</sapn>', 
                                    { icon: 1, btnAlign: 'c' }, index => location.reload(true));
                            } else msg(layer, '密码修改失败', 2, 1500);
                        },
                        error       : (XMLHttpRequest, textStatus, errorThrown) => msg(layer, '密码修改失败', 7, 1500)
                    });
                },
                end         : () => $('#pwd-change [name=code]').val('')
            });
        },

        /* 获取通知 */
        getNotice: () => {}

    }

});


/** 注册 */
window.register = () => {
    //getPersonRegisterConfig();
    if (provSelectFlag) window.location.href = './pages/person/selectProvince.html';
    else {
        window.location.href = './pages/person/register.html'
        sessionStorage.setItem("provinceRoot",topUnitId);
    }
}


/** 获取配置 */
window.getConfig = () => {
    let config_value    = '',
        config_name     = 'value_system_logout_url';
    $.ajax({
        async   : false,
        type    : 'post',
        url     : huayi_sjwh_url + 'cmeCommonConfig/getConfigByUnitFromRedis',
        data    : {
            unitId      : localStorage.getItem('unit-id'),
            configNames : config_name
        },
        success : res => {
            if (res.success == true) {
                if (config_name == "value_system_logout_url") {
                    config_value = res.data.value_system_logout_url;
                    localStorage.setItem('logout-url', config_value);
                }
            } else /*msg(layer, '获取配置出错', 2, 1500)*/;
        },
        error   : () => msg(layer, '获取配置出错', 7, 1500)
    });
    return config_value;
}
window.getPersonRegisterConfig = () => {
    $.ajax({
        async   : false,
        type    : 'get',
        url     : huayi_sjwh_url + 'comPersonRegisterConfig/getByHost',
        data    : { host: host },
        success : res => {
            if (res && 200 == res.status) {
                let data = res.data;
                if (data) {
                    provSelectFlag = data.provSelectFlag;
                    topUnitId = data.topUnitId;
                }
            } else msg(layer, '获取配置出错', 2, 1500);
        },
        error   : () => msg(layer, '获取配置出错', 7, 1500)
    });
}


/** 获取验证码 CD */
window.setRemainTime = btn => {
    if (curCount == 0) {
        window.clearInterval(InterValObj); // 停止计时器
        btn.css('pointer-events', '').html('重获验证码').removeClass('layui-disabled');
    } else btn.html(--curCount + '秒后重获');
}


/** 显示密码 */
$('.pwd-show').on('click', e => {
    let $target = $(e.currentTarget),
        $targetPrev = $target.prev(),
        type = $targetPrev.attr('type');
    if ('password' == type) {
        $target.attr('class', 'pwd-show pwd-show-open');
        $targetPrev.attr('type', 'text');
    } else {
        $target.attr('class', 'pwd-show pwd-show-close');
        $targetPrev.attr('type', 'password');
    }
});


/** 提示信息 */
window.msg = (layer, msg, icon, time) => {
    return layer.msg('<sapn style="color: #666666;">' + msg + '</sapn>', { icon: icon, time: time });
}


/** 显示验证码 */
$('#showCode').on('click', e => {
    let src = e.currentTarget.src;
    if (src.indexOf('eyes-open-min.png') >= 0) {
        $(e.currentTarget).attr('src', 'img/eyes-close-min.png');
        $('[name="code"]').attr('type', 'password');
    } else {
        $(e.currentTarget).attr('src', 'img/eyes-open-min.png');
        $('[name="code"]').attr('type', 'text');
    }
});
