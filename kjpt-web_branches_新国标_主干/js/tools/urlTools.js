/**
 * url 相关工具方法
 */

// 获取url中的参数
window.getQueryString = name => {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');    // 匹配目标参数
    var result = window.location.search.substr(1).match(reg);       // 对querystring匹配目标参数
    if (result != null) {
        return decodeURIComponent(result[2]);
    } else {
        return null;
    }
}

function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
function guid() {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}