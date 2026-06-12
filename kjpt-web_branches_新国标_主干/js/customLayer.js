



var popCallBackFun;//弹出框毁掉函数
var myLayer = {
    //弹框提示  title：提示标题；  msg：提示内容;fun:确定按钮要执行的函数
	/**
	* msg 提示语
	* fun 返回执行函数
	* title 菜单标题
	* icon 提示小图片  0 叹号  1 对号  2  错误  3 问号  4 锁  5 红色笑脸  6 绿色笑脸
	* anim 出现效果   0 平滑放大。默认 1 从上掉落  2 从最底部往上滑入  3 从左滑入 4 从左翻滚 5 渐显
	*/
    Alert: function (msg,icon,anim, fun, title) {
        if (title == "" || title==undefined)
            title = "系统提示";
        var alertIndex = layer.alert(msg,
            {
            icon: icon
            , title: [title, 'font-size:18px;font-weight:bold;']
            , shade: [0.1, '#393D49']
            ,anim:(anim==""||anim==undefined)?1:anim
            }
            , function () {
                layer.close(alertIndex);
                 if (typeof fun == 'function') {
                     fun();
                 }
             }
            );
    },
    /**
     * icon 提示小图片 "" 显示黑  0 叹号  1 对号  2  错误  3 问号  4 锁  5 红色笑脸  6 绿色笑脸
     */
    msg:function(msg,icon){
    	if(icon==""||icon==undefined)
    	{
    		layer.msg(msg);	
    	}else {
    		layer.msg(msg, {icon: icon});	
		}
    	
    },
    
    //弹框提示确定后返回首页  title：提示标题；  msg：提示内容,url:首页url
    /**
     * title 标题
     * msg 提示语
     * url 返回地址
     * icon 提示小图片  0 叹号  1 对号  2  错误  3 问号  4 锁  5 红色笑脸  6 绿色笑脸
	 * anim 出现效果   0 平滑放大。默认 1 从上掉落  2 从最底部往上滑入  3 从左滑入 4 从左翻滚 5 渐显
     */
    AlertGoIndexPage: function (title, msg, url,icon,anim) {
        if (title == "" || title == undefined)
            title = "系统提示";
        layer.alert(msg
        , { icon: 7,
        	title: [title, 'font-size:18px;font-weight:bold;'],
        	icon:icon,
        	anim:anim
           }
        , function (index) {
            layer.close(index);
            window.top.location.href = url;
        });
    },
    //弹框提示确定后跳转到指定的URL  title：提示标题；  msg：提示内容,url:首页url
    /**
     * title 标题
     * msg 提示语
     * url 返回地址
     * icon 提示小图片  0 叹号  1 对号  2  错误  3 问号  4 锁  5 红色笑脸  6 绿色笑脸
	 * anim 出现效果   0 平滑放大。默认 1 从上掉落  2 从最底部往上滑入  3 从左滑入 4 从左翻滚 5 渐显
     */
    AlertGoPage: function (title, msg, ur,icon,animl) {
        if (title == "")
            title = "系统提示";
        layer.alert(msg
        , { icon: 7, 
        	title: [title, 'font-size:18px;font-weight:bold;'],
        	icon:icon,
        	anim:anim
        	}
        , function (index) {
            layer.close(index);
            window.location.href = url;
        });
    },
    /**
     * url 请求页面路径
     * title
     * width   宽度
     * height  高度
     * cancel 右上角关闭按钮触发的回调
     * anim 出现效果   0 平滑放大。默认 1 从上掉落  2 从最底部往上滑入  3 从左滑入 4 从左翻滚 5 渐显
     */
    popLayer: function (url, title, width, height, cancel,anim,maxmin) {//iframe的弹出层
    	 if (anim == "" || anim == undefined)
    		 anim=0;
    	 if (maxmin == "" || maxmin == undefined)
    		 maxmin=false;
        layer.open({
            title: title,
            skin: '',
            type: 2,
            area: [width, height],
            fix: false, //不固定
            maxmin: maxmin,
            shade: [0.1, '#393D49'],
            tips: [1, '#393D49'],
            anim:anim,
            content: url,
            resize:false,
            cancel: function () {
                if (cancel != null && cancel != undefined && typeof cancel=='function')
                   cancel();
            }
            
        });
    },
    /**
     * url 请求页面路径
     * title
     * width   宽度
     * height  高度
     * cancel 右上角关闭按钮触发的回调
     * anim 出现效果   0 平滑放大。默认 1 从上掉落  2 从最底部往上滑入  3 从左滑入 4 从左翻滚 5 渐显
     */
    popLayerMax: function (url, title, width, height, cancel,anim,maxmin) {//iframe的弹出层
        if (anim == "" || anim == undefined)
            anim=0;
        if (maxmin == "" || maxmin == undefined)
            maxmin=false;

        var index =layer.open({
            title: title,
            skin: '',
            type: 2,
            area: [width, height],
            fix: false, //不固定
            maxmin: maxmin,
            shade: [0.1, '#393D49'],
            tips: [1, '#393D49'],
            anim:anim,
            content: url,
            resize:true,
            cancel: function () {
                if (cancel != null && cancel != undefined && typeof cancel=='function')
                    cancel();
            }

        });
        layer.full(index);
    },
    pop:function(url, title, width, height, callBackFun,cancel,anim,maxmin) {
    	myLayer.popLayer(url, title, width, height,cancel,anim,maxmin);
        popCallBackFun = callBackFun;
    },
    popMax:function(url, title, width, height, callBackFun,cancel,anim,maxmin) {
        myLayer.popLayerMax(url, title, width, height,cancel,anim,maxmin);
        popCallBackFun = callBackFun;
    },
    execPopCallBack:function(obj) {
        if (typeof popCallBackFun == "function")
            popCallBackFun(obj);
    },
    
    pageClose: function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭     
    },
    confirm: function (message, callback, title) {
        layer.confirm(message, {
            btn: ['确定'],
            icon:3//按钮
        }, function () {
            if (typeof callback == 'function')
                callback();
        });
    },
    //tips层-左 content:提示的内容；  id:要绑定的控件id或者样式(#id或者.class)
    tipsLeft: function (content, id) {
        layer.tips(content, id, {
            tips: [4, '#ff9c00'],
            time: 2000
        });
    },
    //tips层-右 content:提示的内容；  id:要绑定的控件id或者样式(#id或者.class)
    tipsRight: function (content, id) {
        layer.tips(content, id, {
            tips: [2, '#ff9c00'],
            time: 2000
        });
    },
    //tips层-上 content:提示的内容；  id:要绑定的控件id或者样式(#id或者.class)
    tipsTop: function (content, id) {
        layer.tips(content, id, {
            tips: [1, '#ff9c00'],
            time: 2000
        });
    },

    //tips层-下 content:提示的内容；  id:要绑定的控件id或者样式(#id或者.class)
    tipsBottom: function (content, id) {
        layer.tips(content, id, {
            tips: [3, '#ff9c00'],
            time: 2000
        });
    },
   
    confirmLayer: function (messages,yes,title) {
        layer.confirm(messages, { icon: 3, title: '系统提示', shade: [0.1, '#393D49'] }, function (index) {
            if (typeof yes == "function")
                yes();
            layer.close(index);
        }, function (index) {
            layer.close(index);
        });
    },
    confirmLayerToNext: function (title,messages, yes) {
        layer.confirm(messages, {title: title, btn: ['同意','取消']}, function (index) {
            if (typeof yes == "function")
                yes();
            layer.close(index);
        }, function (index) {
            layer.close(index);
        });
    },
   

}




