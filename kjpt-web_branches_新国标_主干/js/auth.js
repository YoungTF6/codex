$(function () {
    token_verify();
    // refresh_token();
    initOpenInterceptor();
});


window.is_refresh = false;


axios.defaults.baseURL = huayi_url;

/* axios 请求拦截器 */
axios.interceptors.request.use(function (config) {
    token_verify();
    config.headers.Authorization = localStorage.getItem('token');
    config.headers['KJPT-USER-ID'] = localStorage.getItem('user-id');
    return config;

}, function (error) {
    console.log(error);
    return Promise.reject(error);
});
/* axios 响应拦截器 */
axios.interceptors.response.use(function (response) {
    const token_exp_time = response.headers.token_exp_time;
    if (token_exp_time) {
        localStorage.setItem('token-exp-time', token_exp_time);
    }
    refresh_token();
    return response;

}, function (error) {
    // const error_code = [401, 403];
    // if (error_code.includes(error.response.status)) {
    //     console.log('token 无效或不存在');
    //     localStorage.clear();
    //     top.location.href = '/login.html';
    // }

    const token_exp_time = error.response.headers.token_exp_time,
        gateway_status = error.response.headers['Gateway-Status'];

    switch (error.response.status) {

        case 200 :
            if (token_exp_time) {
                localStorage.setItem('token-exp-time', token_exp_time);
            }
            refresh_token();
            break;

        case 401 :
            debugger;
            if (401 == gateway_status) {
                to_login('未授权访问');
            }
            break;

        case 403 :
            debugger;
            if (403 == gateway_status) {
                to_login('授权无效，拒绝访问');
            }
            break;

        default:
            break;
    }
    return Promise.reject(error);
});


/* token 本地验证 */
window.token_verify = () => {
    console.info('auth授权验证');

    const token = localStorage.getItem('token'),
        token_exp_time = localStorage.getItem('token-exp-time');

    // 是否授权
    const is_null = (null == token) || ('' == token);
    if (is_null) {
        to_login('未授权访问');
        return false;
    }
    // 是否过期
    const is_overdue = (null == token_exp_time) || (new Date().getTime() >= token_exp_time);
    if (is_overdue) {
        to_login('授权过期，拒绝访问');
        return false;
    }

    // 授权后才显示首页
    $('body').show();
}


/* token 刷新验证 */
window.refresh_token = () => {
    // console.log('刷新 token');

    // if (is_refresh == true) {
    //     return false;
    // } else {
    //     is_refresh = true;
    // }

    // const refresh_token = localStorage.getItem('refresh-token');
    // $.ajax({
    //     type        : 'POST',
    //     url         : huayi_permission_url + 'refresh',
    //     data : {
    //         refreshToken : refresh_token
    //     },
    //     beforeSend  : xhr => {
    //         xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
    //         xhr.setRequestHeader('KJPT-USER-ID', localStorage.getItem('user-id'));
    //     },
    //     success     : (data, status, xhr) => {
    //         if (data.code == 1) {
    //             // localStorage.setItem('token', data.account.token);
    //             // localStorage.setItem('token-exp-time', xhr.getResponseHeader('token-exp-time'));
    //             // localStorage.setItem('refresh-token', data.account.refreshToken);
    //             // localStorage.setItem('user-id', data.account.userId);
    //             localStorage.setItem('token', xhr.getResponseHeader('Authorization'));
    //             localStorage.setItem('token-exp-time', xhr.getResponseHeader('token-exp-time'));
    //             localStorage.setItem('refresh-token', xhr.getResponseHeader('refresh-token'));
    //             localStorage.setItem('user-id', xhr.getResponseHeader('KJPT-USER-ID'));
    //             console.log('刷新 token 成功');
    //         } else {
    //             console.log('刷新 token 失败');
    //             // top.location.href = 'login.html';
    //         }
    // 		is_refresh = false;
    //     },
    //     error       : (xhr, status, error) => {
    //         console.log('刷新 token 失败');
    // 		is_refresh = false;
    //     }
    // });
}


/* 跳转登录页 */
window.to_login = msg => {
    console.log(msg);
    debugger;
    // 判断是退出到首页, 还是关闭页面, 或者退出到指定页面
    const logout_url = localStorage.getItem('logout-url');
    if (null != logout_url && '' != logout_url) {
        if (logout_url == 'close') {
            // closeWindows();
            alert("因您长时间未操作，系统已超时，请点击确定退出系统后重新登录");
            if (navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Chrome") != -1) {
                top.open("", '_self').top.close();
                top.location.href = '/login.html';
            } else {
                top.opener = null;
                top.open("", "_self");
                top.close();
                open(location, '_self').close();
            }

        } else {
            top.location.href = logout_url;
        }
    } else {
        top.location.href = '/login.html';
    }
    // const login_url = localStorage.getItem('login-url');
    localStorage.clear();
    // 删除文件验证cookie
    document.cookie = `file_verify_cookie=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    // if (null != login_url && '' != login_url) {
    //     top.location.href = login_url;
    // } else {
    //     top.location.href = '/login.html';
    // }
}


