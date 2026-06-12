// 我们这里demo是直接访问网关的，因此domainName配置的是后端java服务网关层的域名和端口，
// 正式生产为了保证网关的高可用性，肯定是部署了多个网关服务，然后用nginx反向代理的
// 那么多个网关服务或者生产环境的话，我们这里配置的是nginx的地址
"use strict";

// 设置时间段2025-12-15  至 2025-12-16 23:59:59 ，进行强制跳转登录页
// 添加系统维护时间段检查和强制跳转逻辑
(function() {
    // 检查当前时间是否在维护时间段内
    function isInMaintenancePeriod() {
        const now = new Date();
        const startTime = new Date('2025-12-15 12:00:00');
        const endTime = new Date('2025-12-15 14:00:00');
        
        return now >= startTime && now <= endTime;
    }
    
    // 检查用户是否已登录
    function isUserLoggedIn() {
        let isRead = localStorage.getItem("read-notice");
        const userId = localStorage.getItem("user-id");
        return userId && userId !== '' && userId !== 'null' && isRead != "1";
    }
    
    // 执行强制跳转到登录页
    function forceRedirectToLoginPage() {
        // 清除用户登录信息
        // localStorage.removeItem("user-id");
        // localStorage.removeItem("token");
        // 可以添加更多需要清除的本地存储项
        localStorage.setItem("read-notice", "1");
        
        // 跳转到登录页
        window.location.href =  '/index.html?reason=maintenance&rand=' + (new Date()).getTime();
    }
    
    // 初始化检查
    if (isInMaintenancePeriod() && isUserLoggedIn()) {
        forceRedirectToLoginPage();
    }
    
    // 定期检查（每分钟检查一次）
    setInterval(() => {
        if (isInMaintenancePeriod() && isUserLoggedIn()) {
            forceRedirectToLoginPage();
        }
    }, 60000);
})();

//layuiv2.6.8地址
var LAYUI_V268 = "js/layui-v2.6.8/";

//返回值状态
var RESPONSE_CODE = {
    "SUCCESS": {
        "CODE": 200,
        "MSG": "成功"
    },
    "UNKNOWN_ERR": {
        "CODE": 500,
        "MSG": "系统繁忙"
    },
    "PARAM_ERR": {
        "CODE": 501,
        "MSG": "参数校验异常"
    },
    "NO_PERMISSION_ERR": {
        "CODE": 10001,
        "MSG": "无操作权限"
    }
}

// 登陆页地址，未登录或过期时进行跳转，如果是前端单独部署的话，这里请写全路径，如 http://xx.xx.xx/login.html
var loginPage = "login.html";



var huayi_url = "http://192.168.91.1:20004/"; // dev
// huayi_url = "https://testkjpt.wsglw.net/kjptapi/";

// test
//huayi_url = "http://192.168.1.166:20004/"; // test
// huayi_url = "http://192.168.1.166:80/kjptapi/"; // test,nginx
//huayi_url = "https://testkjpt.wsglw.net/kjptapi/"; // test,nginx
// huayi_url = "https://testkjpt.wsglw.net:20004/"; // test,error
// prod
// huayi_url = 'https://kjptapi.wsglw.net/'; // prod
// huayi_url = "http://220.160.53.27:18025/"; // fujian-福建
// huayi_url = "http://222.143.64.114:8017/"; // henan-河南
// huayi_url = "http://218.77.183.146:18002/"; // hainan-海南
var test_url = "https://cme.wsjkw.zj.gov.cn/kjptapi/";
huayi_url = test_url;

const huayi_sjwh_url = test_url + "sjwh/";
const huayi_permission_url = huayi_url + "permission/";
const huayi_personorg_url = huayi_url + "personorg/";
const huayi_mcenter_url = test_url + "mcenter/";
const huayi_upload_url =  "https://testkjpt.wsglw.net/kjptapi/file/";
// const huayi_upload_url = huayi_url + "file/";
const huayi_projectscore_url = test_url + "projectscore/";
const huayi_flow_url = test_url + "flow/";
const huayi_noticenews_url = test_url + "notice/";
const huayi_statistics_url = test_url + "statistics/";


const AwardScoreStrategy = {
    common : [
        { value: "6", title: "按考勤次数授分", value_qrcode_attend_mode: "2" },
        { value: "4", title: "有考勤就授予全部学分", value_qrcode_attend_mode: "2" },
        { value: "7", title: "按考勤有效人员授分", value_qrcode_attend_mode: "2" },
        { value: "0", title: "任意课程考勤有效就授予全部学分", value_qrcode_attend_mode: "1" },
        { value: "1", title: "所有课程考勤有效就授予全部学分", value_qrcode_attend_mode: "1" },
        { value: "2", title: "按所参加课程的学时比例授予学分", value_qrcode_attend_mode: "1" }
    ],
    tao : [
        { value: "5", title: "海南省国家级省级项目授分策略", value_qrcode_attend_mode: "1,2", tao: "6eec6713-670a-43cc-ad4d-9bd700a92928" },
        { value: "8", title: "新海南省国家级省级项目授分策略", value_qrcode_attend_mode: "1,2", tao: "6eec6713-670a-43cc-ad4d-9bd700a92928" }
    ]
}

// 是否开启签名验证, 需同步修改后端配置gateway服务yml文件
const signValidationEnabled = true;
// 动态加载 crypto-js
if (typeof CryptoJS === 'undefined' || typeof CryptoJS.HmacSHA256 === 'undefined') {
    document.write('<script src="/js/crypto-js-v3.1.2/rollups/hmac-sha256.js"></script>');
}
// 拦截原生XMLHttpRequest
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
    this._method = method;
    this._url = url;
    return originalXHROpen.apply(this, arguments);
};
const originalXHRSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function(data) {
    const xhr = this;
    // 参数防篡改处理
    if(signValidationEnabled){
        // 获取请求方法
        const method = this._method.toUpperCase();
        // 获取请求参数
        let params = data;
        // 获取请求URL
        let url = this._url;
        // 获取URL中的查询参数
        const urlObj = new URL(url, window.location.href);
        const urlParams = urlObj.search ? urlObj.search.slice(1) : '';  // 直接获取原始查询字符串

        if (urlParams) {
            params = params ? params + '&' + urlParams : urlParams;
        }
        let pathname = urlObj.pathname;

        // 处理path
        if (pathname.startsWith('/kjptapi')) {
            pathname = pathname.replace(/^\/kjptapi/, '').replace(/\/\//g, '/');
        }
        const timestamp = Date.now();
        const nonce = Math.random().toString(36).substr(2);

        // 辅助函数：安全解码URI参数
        function safeDecodeURIComponent(paramStr) {
            if (!paramStr) return '';
            // 先处理"+"（URL中"+"常代表空格，统一转为%20后再解码）
            paramStr = paramStr.replace(/\+/g, '%20');
            try {
                const decoded = decodeURIComponent(paramStr);
                // 若解码后内容有变化，说明存在编码部分，使用解码结果；否则用原始值
                return decoded !== paramStr ? decoded : paramStr;
            } catch (e) {
                // 解码失败（如包含未编码的"%"），返回原始字符串
                return paramStr;
            }
        }

        // 按字母顺序排序参数，并过滤掉值为null的参数
        const paramStr = params && params.length > 0 ? params.split('&').sort().filter(item => item.split('=')[1] !== 'null').join('&') : '';

        // let paramStrEncode = paramStr.replace(/\+/g, '%20');
        // paramStrEncode = paramStrEncode.replace(/%/g, '%25');
        // const paramStrDecode = decodeURIComponent(paramStrEncode, 'utf-8');

        const paramStrDecode = safeDecodeURIComponent(paramStr);

        const signContent = `${method}|${pathname}|${timestamp}|${nonce}|${paramStrDecode}`;
        const signature = CryptoJS.HmacSHA256(
            signContent,
            'HmacSHA_key_huayi'
        ).toString();

        console.log(signContent);
        // 添加安全头
        xhr.setRequestHeader('X-TIMESTAMP', timestamp);
        xhr.setRequestHeader('X-NONCE', nonce);
        xhr.setRequestHeader('X-SIGNATURE', signature);
    }
    return originalXHRSend.call(this, data);
};

// 防连点击
(function() {
    const LOCK_TIME = 1000; // 锁定时间，单位毫秒
    const clickLockMap = new WeakMap();

    document.addEventListener('click', function(e) {
        let target = e.target;

        // 向上寻找最近的 BUTTON 或 A 标签
        while (target && target.tagName !== 'BUTTON' && target.tagName !== 'A') {
            target = target.parentElement;
        }
        if (!target) return; // 没找到按钮或链接就返回

        // 如果已锁定，则阻止事件
        if (clickLockMap.get(target)) {
            e.preventDefault();
            e.stopPropagation();
            console.log('元素被锁住，阻止点击:', target);
            return;
        }

        // 设置锁
        clickLockMap.set(target, true);

        // 延迟解锁
        setTimeout(() => {
            clickLockMap.delete(target);
            console.log('元素解锁:', target);
        }, LOCK_TIME);

    }, true); // 捕获阶段，防止子元素阻止事件
})();
(function () {
    const LOCK_TIME = 1000;
    const submitLockMap = new WeakMap();

    document.addEventListener('submit', function (e) {
        const form = e.target;
        if (!(form instanceof HTMLFormElement)) return;

        // 触发 submit 的按钮（现代浏览器）
        const btn = e.submitter;

        // 兜底：找 lay-submit / submit 按钮
        const submitBtn = btn || form.querySelector(
            'button[lay-submit],button[type=submit]'
        );

        if (!submitBtn) return;

        // 已锁，直接拦
        if (submitLockMap.get(submitBtn)) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // 上锁
        submitLockMap.set(submitBtn, true);
        submitBtn.disabled = true;

        // 定时解锁（兜底）
        setTimeout(() => {
            submitLockMap.delete(submitBtn);
            submitBtn.disabled = false;
        }, LOCK_TIME);

    }, true); // 捕获阶段，优先于 layui
})();





function getAliyunUrl(relativeUrl){
    $.ajax({
        type        : 'GET',
        url         : huayi_upload_url + 'uploadApi/ossPath',
        async       : false,
        data : {  fileName : relativeUrl },
        beforeSend  : xhr => {
            xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
            xhr.setRequestHeader('KJPT-USER-ID', localStorage.getItem('user-id'));
        },
        success     : (res, status, xhr) => {
            if(res.data.picUrl && res.data.picUrl.length != 0){
                relativeUrl =  res.data.picUrl;
            } else {
                console.log('获取阿里云url失败');
            }
        },
        error       : (xhr, status, error) => {
            console.log('获取阿里云url失败');
        }
    });
    return relativeUrl;
}



// 重写Image构造函数
(function() {
    // 1. 定义图片处理函数
    function processImg(img) {
        var src = img.src;
        var imgUrl = img.getAttribute('src');
        if (imgUrl.indexOf('kjptapi') >= 0 || imgUrl == "") return;
        let arr1 = [".",,"doc","/doc","file","/file","front","/front","img","/img","js","/js","page","/page","login","/login","mod","/mod","page","/page"];
        if(imgUrl.indexOf("http") == 0 || imgUrl.indexOf("https") == 0 || imgUrl.indexOf("data:") == 0) return;
        for (let item of arr1) {
            if(imgUrl.indexOf(item) == 0) return;
        }
        
        if (src && !img.dataset.processed) {
            // 简单的URL替换示例
            let relativeUrl = getAliyunUrl(imgUrl);
            img.src = relativeUrl;
            img.dataset.processed = true;
        }
    }
    
    // 2. 监控DOM变化
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.tagName === 'IMG') processImg(node);
                    if (node.querySelectorAll) {
                        node.querySelectorAll('img').forEach(processImg);
                    }
                });
            }
        });
    });
    
    // 3. 启动
    document.addEventListener('DOMContentLoaded', function() {
        // 处理现有图片
        // if(localStorage.getItem('standardkind-id') !== '190c480d-d43c-450b-8472-a6fd00a6729d') return;
        if(window.location.hostname !=  'cme.wsjkw.zj.gov.cn') return;
        document.querySelectorAll('img').forEach(processImg);
        // 开始监控
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

    });
})();



/**
 * 初始化window.open拦截器
 */
let originalWindowOpen = null;

function initOpenInterceptor() {
    // if(localStorage.getItem('standardkind-id') !== '190c480d-d43c-450b-8472-a6fd00a6729d') return;
    if(window.location.hostname !=  'cme.wsjkw.zj.gov.cn') return;
    if (originalWindowOpen) {
        console.log('拦截器已经初始化', 'warn');
        return;
    }
    
    // 保存原始的window.open方法
    originalWindowOpen = window.open;
    
    // 重写window.open方法
    window.open = function(url, target, features) {

        // 参数处理
        const args = Array.from(arguments);

        if (url.indexOf('.html') > -1 || url.indexOf('blob') > -1) return originalWindowOpen.apply(window, args);
        
        console.log(`拦截到window.open调用:URL: ${url || '无'}Target: ${target || '_blank'}Features: ${features || '无'}`);
        
        // if (url.indexOf('kjptapi') === -1) return originalWindowOpen.apply(window, args);
        
        // 转换OSS URL
        let processedUrl = getAliyunUrl(url);
        
        // 更新参数
        args[0] = decodeURIComponent(processedUrl);
        
        console.log(`调用原始window.open: ${processedUrl}`);
        
        // 调用原始的window.open方法
        return originalWindowOpen.apply(window, args);
    };
    
    // 添加属性描述符以保持原始属性
    Object.defineProperty(window.open, 'name', { value: 'open' });
    Object.defineProperty(window.open, 'length', { value: 3 });
}

initOpenInterceptor();


/**
 * 文本替换工具集成
 * 加载js文件
 * */
/**
 * 文本替换工具集成
 * 加载js文件
 * */
(function() {
    // 动态加载文本替换工具
    // 广东进行文本替换
    let standardkindId = localStorage.getItem('standardkind-id');
    let scriptSrc = '';
    //广东或者河南进行文本替换
    if(standardkindId != '289bf0ca-52cb-4b19-b737-9bd200a69ce1' && standardkindId != 'a6280900-a9c2-11ec-84d6-fa163e9b64fb') {
        return;
    }
    //广东进行文本替换
    if(standardkindId == '289bf0ca-52cb-4b19-b737-9bd200a69ce1') {
        scriptSrc = '/js/tools/text-replace.js';
    } else if(standardkindId == 'a6280900-a9c2-11ec-84d6-fa163e9b64fb') {
        scriptSrc = '/js/tools/text-replace-henan.js';
    }
    let script = document.createElement('script');
    script.src = scriptSrc;
    script.onload = function() {
        // DOM 加载完成后初始化文本替换
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                if (window.TextReplaceTool) {
                    window.TextReplaceTool.initTextReplace();
                }
            });
        } else {
            if (window.TextReplaceTool) {
                window.TextReplaceTool.initTextReplace();
            }
        }
    };
    script.onerror = function() {
        console.error('加载文本替换工具失败');
    };
    document.head.appendChild(script);
})();