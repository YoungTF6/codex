var HUAYI = {
    browser: function () {
        var isIE = false;
        var isFirefox = false;
        var isChrome = false;
        var isEdge = false;
        var broName = 'Runing';
        var broVersion = '0.0.0.0';
        var str = '';
        var strStart = 0;
        var strStop = 0;
        var arr = new Array();
        var temp = '';

        var userAgent = window.navigator.userAgent; //包含以下属性中所有或一部分的字符串：appCodeName,appName,appVersion,language,platform

        /*alert(userAgent);*/

        //FireFox
        if (userAgent.indexOf('Firefox') != -1) {
            isFireFox = true;
            /*broName = 'FireFox浏览器';*/
            strStart = userAgent.indexOf('Firefox');
            temp = userAgent.substring(strStart);
            var list = temp.split('/');
            broName = list[0];
            broVersion = list[1];


        }

        //Edge
        if (userAgent.indexOf('Edge') != -1) {
            isEdge = true;
            /*broName = 'Edge浏览器';*/
            strStart = userAgent.indexOf('Edge');
            temp = userAgent.substring(strStart);
            var list = temp.split('/');
            broName = list[0];
            broVersion = list[1];
        }

        //IE浏览器
        if (userAgent.indexOf('NET') != -1 && userAgent.indexOf("rv") != -1) {
            isIE = true;
            /*broName = 'IE浏览器'; */
            strStart = userAgent.indexOf('rv');
            strStop = userAgent.indexOf(')');
            temp = userAgent.substring(strStart, strStop);
            temp = temp.replace('rv', 'IE');
            var list = temp.split(':');
            broName = list[0];
            broVersion = list[1];
        }

        //IE浏览器
        if (userAgent.indexOf('MSIE') != -1) {
            isIE = true;
            /*broName = 'IE浏览器'; */
            var uaNodes = userAgent.split(";");
            for (var i = 0; i < uaNodes.length; i++) {
                if (uaNodes[i].indexOf("MSIE") > 0) {
                    var list = uaNodes[i].replace(/^\s+|\s+$/gm,'').split(' ');
                    broName = 'IE';
                    broVersion = list[1];
                    break;
                }

            }

        }

        /*
        //360极速模式可以区分360安全浏览器和360极速浏览器
        if (userAgent.indexOf('WOW') != -1 && userAgent.indexOf("NET") < 0 && userAgent.indexOf("Firefox") < 0) {
        if (navigator.javaEnabled()) {
        is360 = true;
        broName = '360安全浏览器-极速模式';
        } else {
        is360 = true;
        broName = '360极速浏览器-极速模式';
        }
        }

        //360兼容
        if (userAgent.indexOf('WOW') != -1 && userAgent.indexOf("NET") != -1 && userAgent.indexOf("MSIE") != -1 && userAgent.indexOf("rv") < 0) {
        is360 = true;
        broName = '360兼容模式';
        }
        */

        //Chrome浏览器
        if (userAgent.indexOf('WOW') < 0 && userAgent.indexOf("Edge") < 0 && userAgent.indexOf("Chrome") > 0) {
            isChrome = true;
            /*broName = 'Chrome浏览器';*/
            strStart = userAgent.indexOf('Chrome');
            strStop = userAgent.indexOf(' Safari');
            temp = userAgent.substring(strStart, strStop);
            var list = temp.split('/');
            broName = list[0];
            broVersion = list[1];

        }

        return {
            isIE: isIE,
            isFirefox: isFirefox,
            isChrome: isChrome,
            isEdge: isEdge,
            broName: broName,
            broVersion: broVersion
        };

    }
}