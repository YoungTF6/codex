//form序列化为json
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

var Msg = {};
Msg.tip = function(buttonEle,message){
    if(layui != null){
        layui.use('layer',function () {
            layui.layer.tips(message,buttonEle,{
                tips:[1,'#888888'],
                time:2000
            });
        });
    }
};

var CurrentUser = {};
CurrentUser.save = function(data){
    localStorage.setItem('current-user-info', JSON.stringify(data));
}
CurrentUser.userInfo = function(){
    var userInfo = localStorage.getItem("current-user-info");
    return userInfo == null || userInfo.length == 0 ? {} : JSON.parse(userInfo);
}
CurrentUser.getUnitId = function () {
    console.log(CurrentUser.userInfo());
    if (null == CurrentUser.userInfo().unit) {
        return localStorage.getItem('unit-id');
    }
    return CurrentUser.userInfo().unit.unitId;
}

//获取url后的参数值
function getUrlParam(key) {
	var href = window.location.href;
	var url = href.split("?");
	if(url.length <= 1){
		return "";
	}
	var params = url[1].split("&");
	
	for(var i=0; i<params.length; i++){
		var param = params[i].split("=");
		if(key == param[0]){
			return param[1];
		}
	}
    return "";
}

// 防止方法重复调用
var noRepeatLock = true;
var noRepeat = function (fun) {
    if (noRepeatLock) {
        noRepeatLock = false;
        try {
            fun();
        } catch (e) {
            console.log(e);
        }
        setTimeout(function(){
            noRepeatLock = true;
        }, 3000);
    }
};

var messageState = {
    success: 0,//成功
    fail: 1, //失败
    timeout: 3,//超时
    systemErrorMsg: "系统错误，请与管理员联系！",//系统错误提示信息
};

var examType= {
    onlineExam: 1,//线上考试
    mockExam: 2, //模拟考试
    focusExam: 3//集中考试
};

var Common = [];
Common.CreateAJAXRequest = function (url, method, data, dataType, successCallbackFunction) {
    $.ajax({
        url: url,
        type: method,
        data: data,
        headers : {
            "token" : $.cookie('token')
        },
        dataType: dataType,
        success: successCallbackFunction,
        error : function(xhr, textStatus, errorThrown) {
            //debugger
            var status = xhr.status; // http status
            var data = xhr.responseText;
            var message = "";
            var flag = typeof(layer)=="undefined";
            if(data != undefined && data != ""){
                var json = JSON.parse(data);
                var exception = json.exception;
                if(exception){
                    message = exception;
                }else {
                    message = json.message;
                }
                message=message==undefined?json.message:message;
                if (json.code == 40015) {
                    localStorage.removeItem("token");
                   // cookie.delete("token");
                    if (flag) {
                        alert(message);
                        window.location.href=loginPage;
                        return false;
                    } else {
                        myLayer.Alert(message,0,"",function(){
                            window.location.href=loginPage;
                            return false;
                        })
                    }
                }    
            }
           
            if (status == 400) {
                if (flag) {
                    alert(message);
                } else {
                    layer.msg(message);
    
                }
            } else if (status == 403) {
                message = "未授权";
                if (flag) {
                    alert(message);
                } else {
                    layer.msg(message);
                }
            } else if (status == 500) {
                message = '系统错误：' +  message + '，请刷新页面，或者联系管理员';
                if (flag) {
                    alert(message);
                } else {
                    layer.msg(message);
                }
            }else  if(status==504)
            {
                layer.msg(message);
            }
        }
        

    });
}
Date.prototype.format = function (format) {
    /*
     * format="yyyy-MM-dd hh:mm:ss";
     */
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;

};
/**************************************时间格式化处理************************************/
Common.dateFtt=function(date,fmt)
{ //author: meizz
    var o = {
        "M+" : date.getMonth()+1,                 //月份
        "d+" : date.getDate(),                    //日
        "h+" : date.getHours(),                   //小时
        "m+" : date.getMinutes(),                 //分
        "s+" : date.getSeconds(),                 //秒
        "q+" : Math.floor((date.getMonth()+3)/3), //季度
        "S"  : date.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}
//json日期格式化 format:yyyy-MM-dd hh:mm:ss
Common.formatJsonDate= function (val, format) {
    //如果format 不设置则格式化为yyyy-MM-dd hh:mm:ss 按【2012-02-13 09:09:09】的格式返回日期
    if (format == undefined || format == null || format == "")
        format = "yyyy-MM-dd hh:mm:ss";
    var re = /-?\d+/;
    var m = re.exec(val);
    var d = new Date(parseInt(m[0]));

    return d.format(format);
}

//实现方法 @return 返回2个值，一个是带时分秒，另一个不带。
Common.msToDate=function (msec) {
    var datetime = new Date(msec);
    var year = datetime.getFullYear();
    var month = datetime.getMonth();
    var date = datetime.getDate();
    var hour = datetime.getHours();
    var minute = datetime.getMinutes();
    var second = datetime.getSeconds();

    var result1 = year +
        '-' +
        ((month + 1) >= 10 ? (month + 1) : '0' + (month + 1)) +
        '-' +
        ((date + 1) < 10 ? '0' + date : date) +
        ' ' +
        ((hour + 1) < 10 ? '0' + hour : hour) +
        ':' +
        ((minute + 1) < 10 ? '0' + minute : minute) +
        ':' +
        ((second + 1) < 10 ? '0' + second : second);

    var result2 = year +
        '-' +
        ((month + 1) >= 10 ? (month + 1) : '0' + (month + 1)) +
        '-' +
        ((date + 1) < 10 ? '0' + date : date);

    var result = {
        hasTime: result1,
        withoutTime: result2
    };

    return result;
}

//截取字符串
Common.subString = function (str, length) {
    if (str == undefined) return "";
    if (str == null) return "";
    if (str.length <= length) return str;
    return str.substring(0, length) + "...";
}

/* 获取配置 */
function getConfig(config_name,unitId,scoreLevel) {
    $.ajax({
        async   : false,
        type    : 'post',
        url     : huayi_sjwh_url + 'cmeCommonConfig/getConfigByUnitFromRedis',
        data    : { 
            configNames  : config_name,
            unitId       : unitId, 
            scoreLevelId : scoreLevel
        },
        success : function (res) {
            if (res.success == true) {
                window[config_name] = res.data[config_name];
            } else {
                layer.msg('获取配置失败');
            }
        },
        error   : function () {
            layer.msg('获取配置失败');
        }
    });
}


function debounce(func, wait) {
    // let timeout;
    // let isAllowed = true; // 添加状态变量
    // return function () {
    //     let context = this;
    //     let args = arguments;
    //     if (!isAllowed) return;
    //     isAllowed = false; // 开始执行函数，禁止点击
    //     if (timeout) clearTimeout(timeout);
    //     timeout = setTimeout(() => {
    //         func.apply(context, args);
    //         isAllowed = true; // 函数执行完成，恢复点击
    //     }, wait);
    // }
    let isAllowed = true; // 添加状态变量
    return function () {
        let context = this;
        let args = arguments;
        if (!isAllowed) return;
        isAllowed = false; // 开始执行函数，禁止点击
        func.apply(context, args)
            .then(() => {
                isAllowed = true; // 函数执行完成并有结果返回，恢复点击
            })
            .catch(() => {
                isAllowed = true; // 函数执行出错，也恢复点击
            });
    }
}