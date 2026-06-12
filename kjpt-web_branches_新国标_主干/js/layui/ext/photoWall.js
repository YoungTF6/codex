// 照片墙插件
layui.define(['jquery', 'layer'], function(exports){
    var MOD_NAME = 'photoWall';

    //常量
    let lastLiCss = {"left":"0px","right":"0px",
        "bottom":"0px","top":"0px",
        "margin":"auto","display":"block"}

    var photoWall = {
        config:{
            //随机图片最小宽度和最大宽度的范围
            minWidth:"",
            maxWidth:"",
            //中心图片宽度
            centerImgWidth:"",
            //照片墙元素
            elem:"",
            //默认中心图片
            defaultImg: "",
            //加载多少张图片之后开始消失
            minHiddenNum: 10,
            //最多容纳多少图片在列表中
            maxImgNum: 20,
            minHiddenImgWidth: 25,
            renderSuccess:false,
            //最小减少的宽度
            minReductWidth:15,
        },
        centerX:0,
        centerY:0,
        boxWidth: 0,
        boxHeight: 0,
        R:0,
        ulElem:null,
    }

    var Class = function(options) {
        var that = this;
        that.config = $.extend({}, that.config, photoWall.config, options);
        that.render();
    };

    // 照片墙初始化
    Class.prototype.render = function(){
        //配置加载
        this.init();
        photoWall.config.renderSuccess = true;
    }

    Class.prototype.getLastElem = function() {
        let that = this;
        let liNum = that.ulElem.children().length;
        let lastLiElem = $(that.ulElem.children()[liNum-1]);
        return lastLiElem
    }

    // 初始化照片墙
    Class.prototype.init = function(){
        var that = this;
        this.initStyle();
        //计算容器大小和中心点
        let wallBox = $(this.config.elem);
        that.boxWidth = parseInt(wallBox.width());
        that.boxHeight = parseInt(wallBox.outerHeight());
        that.centerX = parseInt(that.boxWidth/2);
        that.centerY = parseInt(that.boxHeight/2);
        that.R = parseInt(that.config.centerImgWidth/2)+3;
        //创建图片ul列表
        lastLiCss["width"] = `${this.config.centerImgWidth}px`;
        lastLiCss["height"] = `${this.config.centerImgWidth}px`;
        that.ulElem = $("<ul class='wall-img-ul'></ul>");
        let tempLiElem = $(`<li img-type="default"><div><img src="${this.config.defaultImg}"></div></li>`);
        tempLiElem.css(lastLiCss);
        that.ulElem.append(tempLiElem);
        $(this.config.elem).append(that.ulElem);
    }

    Class.prototype.initStyle = function(){
        let style = `.wall-img-ul{position: absolute;width: 100%;height: 100%;perspective: 500;-webkit-perspective: 500;} .wall-img-ul li{position: absolute;border-radius: 50%;overflow: hidden;} .wall-img-ul li:last-child{border: 3px dashed #ddd;z-index: 999;} .wall-img-ul li>div{position: absolute;width: 92%;height: 92%;border-radius: 50%;left: 0px;right: 0px;top: 0px;bottom: 0px;margin: auto; overflow: hidden;} .wall-img-ul li>div>img{    position: absolute;width: 100%;min-height: 100%;left: 0px; top: 0px;} `;
        $('<style id="lay-photo-wall-style"></style>').text(style).appendTo($('head'));
    }

    //照片墙添加照片
    Class.prototype.addImg = function(imgElem)  {
        var that = this;
        let liNum = that.ulElem.children().length;
        let lastLiElem = $(that.ulElem.children()[liNum-1]);
        if(liNum ==  1 && lastLiElem.attr("img-type") == "default"){
            that.ulElem.empty();
        }

        let tempLiElem = $(`<li><div></div></li>`);
        //如果传入的是一个图片链接
        if(typeof imgElem == 'string') {
            var tempImg = new Image();
            tempImg.src = imgElem;
            tempLiElem.children()[0].append(tempImg);
        } 
        else {
            tempLiElem.children()[0].append(imgElem);
        }
        tempLiElem.css(lastLiCss);
        that.ulElem.append(tempLiElem);
        this.weakenImg();
        
    }

    //淡化图片消失
    Class.prototype.weakenImg = function(){
        var that = this;
        let liNum = that.ulElem.children().length;
        if(liNum == 1) return;
        if(liNum >= that.config.minHiddenNum) {
            for(let i=0 ; i<liNum-2 ; i++){
                let elem = $(that.ulElem.children()[i]);
                let width = 0;
                let nowWidth = elem.width();
                if(nowWidth==0) continue;
                let tempWidth = (i==0)? nowWidth/2 : nowWidth/i;
                if(tempWidth < that.config.minReductWidth) tempWidth = that.config.minReductWidth;
                width = parseInt(elem.width()-10);
                if(width < that.config.minHiddenImgWidth) {
                    width = 0;
                }
                let nowLeft = elem.css("left"),nowTop = elem.css("top");
                let x = parseInt(nowLeft.substr(0,nowLeft.length-2));
                let y = parseInt(nowTop.substr(0,nowTop.length-2));
                let l = elem.width();
                let left = x,top = y;
                let tempR = parseInt((l-width)/2);
                // left = (centerX > x+l) ? x+tempR : x-tempR;
                // top = (centerY > y+l) ? y+tempR : y-tempR;
                left = x+tempR;
                top = y+tempR;
                let cssObj = {"width":`${width}px`,"height":`${width}px`,"left":`${left}px`,"top":`${top}px`}
                elem.css(cssObj);
            }
        }
        this.setImgPosition();
        this.showWallImg();
            
    }

    //图片展示
    Class.prototype.showWallImg = function() {
        let that = this;
        let liNum = that.ulElem.children().length;
        if(liNum < 2){
            return
        }
        let elem = $(that.ulElem.children()[liNum-2]);
        let width = elem.width()-10;
        if(width < 0) width = 0;
        let cssObj = {"transition":"all 1s",
            "transition-timing-function":"steps(1000,start)",
            "opacity":"0.9","width":`${width}px`,"height":`${width}px`};
        elem.css(cssObj);
    }

    // 给图片定位
    Class.prototype.setImgPosition = function() {
        var that = this;
        let liNum = that.ulElem.children().length;
        let minImgWidth = that.config.minWidth;
        let tempWidth = Math.ceil((Math.random() * (that.config.maxWidth-minImgWidth) + minImgWidth));
        let initialCapacity = parseInt(Math.random() * 4);
        let r=parseInt(tempWidth/2);
        //获取x取值的范围
        let minX = r,maxX = that.boxWidth-r;
        (initialCapacity%2 ==0) ? maxX=this.getLimitX(r,"max"): minX=this.getLimitX(r,"min");
        let scopeX = Math.ceil(Math.random() * (minX-maxX+1) + maxX-1);
        let minY = r,maxY = that.boxHeight-r;
        (initialCapacity < 2) ? maxY=this.getLimitY(r,"max",scopeX):minY=this.getLimitY(r,"min",scopeX);
        let scopeY = Math.ceil(Math.random() * (minY-maxY+1) + maxY-1);
        let tempLeft = scopeX-r,tempTop = scopeY-r;
        //开始给图片定位
        let lastLiElem = $(that.ulElem.children()[liNum-2]);
        if(!document.hidden){
            let cssObj = {"width":`${tempWidth}px`,"height":`${tempWidth}px`,"left":`${tempLeft}px`,"top":`${tempTop}px`,
            "filter":`blur(0.5px)`,"opacity":"0","margin":"unset"}
            lastLiElem.css(cssObj);
            if(liNum >= 30){
                for (let i = 20; i > 0; i--) {
                    let tempLiElem = $(that.ulElem.children()[i]);
                    if(tempLiElem.width() == 0) {
                        tempLiElem.remove();
                    }
                }
            }
        } else {
            if(liNum >= 30){
                for (let i = 20; i > 0; i--) {
                    $(that.ulElem.children()[i]).remove();
                }
            }
        }
    }

    Class.prototype.getLimitX = function(r,type="min"){
        let that = this;
        if(r+r+that.R > that.centerY){
            let a = that.centerY-r;
            let c = r+that.R;
            let b = parseInt(Math.sqrt(c*c-a*a));
            if(type=="min") {
                let min = that.centerX +b;
                return min;
            }
            let max  = that.centerX-b;
            return max;
        }
        if(type=="min") {
            let min = that.centerX - Math.ceil((Math.random() * 30 + 30));
            return min;
        }
        let max = that.centerX + Math.ceil((Math.random() * 30 + 30));
        return max;
    }

    Class.prototype.getLimitY = function(r,type="min",x){
        let that = this;
        let a = (x > that.centerX) ? x-that.centerX : that.centerX - x;
        let c = r + that.R;
        if(a < c){
            let b = parseInt( Math.sqrt(c*c-a*a) );
            if(type=="min") {
                let min = that.centerY + b;
                return min;
            }
            let max = that.centerY - b;
            return max;
        }
        if(type=="min") {
            let min = that.centerY - Math.ceil((Math.random() * 30 + 30));
            return min;
        }
        let max = that.centerY + Math.ceil((Math.random() * 30 + 30));
        return max;
    }


    //核心入口
    photoWall.render = function(options) {
        var inst = new Class(options);
        return inst;
    };

    exports(MOD_NAME, photoWall);
})