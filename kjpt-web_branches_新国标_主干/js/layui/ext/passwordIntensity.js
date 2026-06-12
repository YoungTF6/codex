/*!
 * passwordIntensity v1.0
 * author JerryZst
 * qq 1309579432
 * Date: 2021/01/20 0007
 */
layui.define(['jquery', 'element'], function (exports) {
    var $ = layui.jquery;
    var element = layui.element;
    var _MOD = 'passwordIntensity';
    var passwordIntensity = function (opt) {
        this.version = 'passwordIntensity-1.0';
        this.tmpId = new Date().getTime();
        this.tmpId = opt.uniqueId ? opt.uniqueId : this.tmpId + Math.round(Math.random() * 1000 + 9999);
        this.passwordLevel = [
            'low',
            'middle',
            'high',
        ]
        this._level = null;
        // 配置项
        this.options = $.extend(true, {
            data: opt.data || '',
            on: opt.on || null,
        }, opt);
        this.init();  // 初始化
        this.bindEvents();  // 绑定事件
    };

    /** 获取各个组件 */
    passwordIntensity.prototype.getComponents = function () {
        var that = this;
        var $elem = $(that.options.elem);
        var filter = $elem.attr('lay-filter');
        if (!filter) {
            filter = that.options.elem.substring(1);
            $elem.attr('lay-filter', filter);
        }
        return {
            $elem: $elem,  // 容器
            filter: filter, // 容器的lay-filter
        };
    };

    // 初始化
    passwordIntensity.prototype.init = function () {
        var components = this.getComponents();
        var html = "";
        for (var i = 0; i < this.passwordLevel.length; i++) {
            var color = "";
            var name = "";
            var levelId = this.tmpId + this.passwordLevel[i];
            if (this.passwordLevel[i] === 'low') {
                name = "弱";
                color = "layui-bg-red";
            } else if (this.passwordLevel[i] === 'middle') {
                name = "中";
                color = "layui-bg-orange";
            } else {
                name = "强";
                color = "layui-bg-green";
            }
            html += '<div class="layui-col-md4 layui-col-sm4 layui-col-xs4" style="text-align: center">' +
                '<div class="layui-progress layui-progress-big" lay-filter="' + levelId + '">' +
                '<div id="' + levelId + '" class="layui-progress-bar ' + color + '" lay-percent="0%">' + '</div>' +
                '</div>' + '<span style="background: white;font-size: 12px">' + name + '</span></div>';
        }
        html = '<div id="' + this.tmpId + '" class="layui-row layui-col-space2" style="margin-top: 5px">' + html + '</div>';
        components.$elem.parent('div').append(html);
        if (this.options.data) {
            components.$elem.val(this.options.data);
            var that = this;
            var _level = checkStrong(this.options.data);
            switch (_level) {
                case 0:
                    that.setLevel('low', '100%');
                    break;
                case 1:
                    that.setLevel('low', '100%');
                    break;
                case 2:
                    that.setLevel('middle', '100%');
                    break;
                default:
                    that.setLevel('high', '100%');
                    break;
            }
        }
        return html;
    }

    /**
     * 绑定事件
     */
    passwordIntensity.prototype.bindEvents = function () {
        var components = this.getComponents();
        var that = this;
        // 实时输入事件
        components.$elem.off('input propertychange').on('input propertychange', function () {
            var pwd = $(this).val();
            if (pwd == "" || pwd == null) {
                that.setLevel('');
                that._level = null;
            } else {
                var _level = checkStrong(pwd);
                that._level = _level;
                switch (_level) {
                    case 0:
                        that.setLevel('low', '100%');
                        break;
                    case 1:
                        that.setLevel('low', '100%');
                        break;
                    case 2:
                        that.setLevel('middle', '100%');
                        break;
                    default:
                        that.setLevel('high', '100%');
                        break;
                }
            }
        });

        // 光标消失事件
        components.$elem.off('blur').on('blur', function () {
            var pwd = $(this).val();
            if (pwd == "" || pwd == null) {
                that.setLevel('');
                that._level = null;
            } else {
                var _level = checkStrong(pwd);
                that._level = _level;
                switch (_level) {
                    case 0:
                        that.setLevel('low', '100%');
                        break;
                    case 1:
                        that.setLevel('low', '100%');
                        break;
                    case 2:
                        that.setLevel('middle', '100%');
                        break;
                    default:
                        that.setLevel('high', '100%');
                        break;
                }
            }
        });
    }

    /**
     * 设置级别
     */
    passwordIntensity.prototype.setLevel = function (level, value) {
        value = value || '100%';
        for (var i = 0; i < this.passwordLevel.length; i++) {
            if (level === '') {
                element.progress(this.tmpId + this.passwordLevel[i], '0%');
            } else {
                if (level === this.passwordLevel[i]) {
                    element.progress(this.tmpId + level, value);
                } else {
                    if (value === '100%') {
                        element.progress(this.tmpId + this.passwordLevel[i], '0%');
                    }
                }
            }
        }
        return true;
    }

    /**
     * 返回当前的密码级别
     * @returns {string}
     */
    passwordIntensity.prototype.getLevel = function () {
        return _levelByName(this._level);
    }

    /**
     * 当前密码是否弱
     * @returns {boolean}
     */
    passwordIntensity.prototype.isLow = function () {
        return _levelByName(this._level) === 'low' || this._level === null;
    }

    /**
     * 当前密码是否中
     * @returns {boolean}
     */
    passwordIntensity.prototype.isMiddle = function () {
        return _levelByName(this._level) === 'middle';
    }

    /**
     * 当前密码是否强
     * @returns {boolean}
     */
    passwordIntensity.prototype.isHigh = function () {
        return _levelByName(this._level) === 'high';
    }

    /**
     * 级别转换
     * @param level
     * @returns {string}
     * @private
     */
    function _levelByName(level) {
        var name = 'low';
        switch (level) {
            case 0:
                name = "low";
                break;
            case 1:
                name = "low";
                break;
            case 2:
                name = "middle";
                that.setLevel('middle', '100%');
                break;
            default:
                name = "high";
                break;
        }
        return name;
    }

    /**
     * 监听事件 // 预留
     * @param events
     * @param callback
     * @returns {*}
     */
    passwordIntensity.prototype.on = function (events, callback) {
        return layui.onevent.call(this, _MOD, events, callback);
    };


    //判断输入密码的类型
    function charMode(iN) {
        if (iN >= 48 && iN <= 57) //数字
            return 1;
        if (iN >= 65 && iN <= 90) //大写
            return 2;
        if (iN >= 97 && iN <= 122) //小写
            return 4;
        else
            return 8;
    }

    //计算密码模式
    function bitTotal(num) {
        modes = 0;
        for (i = 0; i < 4; i++) {
            if (num & 1) modes++;
            num >>>= 1;
        }
        return modes;
    }

    //返回强度级别
    function checkStrong(sPW) {
        if (sPW.length <= 6) {
            return 0; //密码太短
        }
        Modes = 0;
        for (i = 0; i < sPW.length; i++) {
            //密码模式
            Modes |= charMode(sPW.charCodeAt(i));
        }
        return bitTotal(Modes);
    }

    /** 外部方法 */
    var iS = {
        /* 渲染 */
        render: function (options) {
            return new passwordIntensity(options);
        },
        /* 事件监听 */
        on: function (events, callback) {
            return layui.onevent.call(this, _MOD, events, callback);
        }
    };
    exports(_MOD, iS);
});