/** 表单验证工具 */

/** 字符串 */
const strTool = {

    isBlank: str => null == str || undefined == str || '' == str || 'null' == str || str.trim().length < 1,

    isNotBlank: str => !strTool.isBlank(str),

    hasBlank: strSet => {
        let result = false;
        $.each(strSet, (i, item) => {
            if (strTool.isBlank(item)) {
                result = true;
                return false;
            }
        });
        return result;
    },

    nonBlank: strSet =>  !strTool.hasBlank(strSet),

    allBlank: strSet => {
        let result = true;
        $.each(strSet, (i, item) => {
            if (strTool.isNotBlank(item)) {
                result = false;
                return false;
            }
        });
        return result;
    },

    lengthByWord: str => {
        if (null == str) return 0;

        let reg_cn    = /[\u4e00-\u9fa5]/,
            reg_eng   = /[a-zA-Z\d_-]+/g, // 单词
            reg_num   = /\d/g,
            reg_blank = /\s+/g,
            reg_total = /./g;

        let engSet    = str.match(reg_eng),
            len_eng   = engSet ? engSet.length : 0,
            len_other = str.replace(reg_eng, '').length;

        return len_eng + len_other;
    },

    isStr: val => typeof val == 'string',

    countWidth: str => {
        let len = 0;
        for (let i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 127) len += 2; // 汉字长度算 2
            else len += 1; // 其他字符算 1
        }
        return len;
    },

    /**
     * 全角转半角（用于密码等输入，避免中文输入法下误输入全角字符）
     * - 全角空格 0x3000 -> 半角空格 0x0020
     * - 全角 ASCII 0xFF01-0xFF5E -> 半角 0x0021-0x007E（含全角逗号、全角句号等）
     * - 中文句号 0x3002 （。）-> 半角句号 0x002E
     * - 中文顿号 0x3001 （、）-> 半角逗号 0x002C（便于作为特殊字符通过密码校验）
     */
    toHalfWidth: str => {
        if (str == null || typeof str !== 'string') return str;
        let result = '';
        for (let i = 0; i < str.length; i++) {
            let code = str.charCodeAt(i);
            if (code === 0x3000) {
                result += String.fromCharCode(0x0020);
            } else if (code === 0x3002) {
                result += String.fromCharCode(0x002E);   // 。 -> .
            } else if (code === 0x3001) {
                result += String.fromCharCode(0x002C);   // 、 -> ,
            } else if (code >= 0xFF01 && code <= 0xFF5E) {
                result += String.fromCharCode(code - 0xFEE0);
            } else {
                result += str.charAt(i);
            }
        }
        return result;
    }

};


/* 数字 */
const numTool = {

    /* 100 以内整数 */
    isHundredInteger: val => {
        const reg = /^([0-9][0-9]{0,1}|100)$/;
        return reg.test(val);
    },

    /* 正整数 */
    isPositiveInteger: val => {
        const reg = /^\d+$/;
        return reg.test(val);
    },

    /* 0 ~ 9999，精确到小数点后两位 */
    is4DigitsAnd2Decimal: val => {
        const reg = /^\d{1,4}(\.\d{1,2})?$/;
        return reg.test(val);
    },

    intInRange: (val, range) => {
        if (!val || !range) return null;
        let [min, max] = range.split('-').map(Number);
        if (parseInt(val) < min || parseInt(val) > max || !numTool.isPositiveInteger(val)) return '请输入 ' + min + ' - ' + max + ' 的整数';
    }

};


/** 电话 */
const phoneTool = {

    isMobile: val => {
        // const reg = /^1[345678]\d{9}$/;
        const reg = /^1\d{10}$/;
        return reg.test(val);
    }

};


/** 密码 */
const pwdTool = {

    /* 密码中必须包含字母（不区分大小写）、数字、特称字符，至少8个字符，最多16个字符 */
    isPass: val => {
        const reg = new RegExp('^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,16}$');
        return reg.test(val);
    },

    isStrong: val => {
        const reg = new RegExp('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$');
        return reg.test(val);
    },

    isMedium: val => {
        const   reg_1 = new RegExp('^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$'),
                reg_2 = new RegExp('^(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$'),
                reg_3 = new RegExp('^(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,}$');
        return reg_1.test(val) || reg_2.test(val) || reg_3.test(val);
    },

    isWeak   : val => {
        const   reg_1 = new RegExp('^(?=.*[0-9])$'),
                reg_2 = new RegExp('^(?=.*[a-zA-Z])$'),
                reg_3 = new RegExp('^(?=.*[^a-zA-Z0-9])$');
        return reg_1.test(val) || reg_2.test(val) || reg_3.test(val);
    },
    
    isSame   : (val_1, val_2) => val_1 === val_2

};


/** 身份证 */
const certIdTool = {

    // 省,直辖市代码表
    provinceAndCitys: {
        11: '北京', 12: '天津', 13: '河北', 14: '山西', 15: '内蒙古', 21: '辽宁', 22: '吉林', 23: '黑龙江', 31: '上海', 32: '江苏',
        33: '浙江', 34: '安徽', 35: '福建', 36: '江西', 37: '山东', 41: '河南', 42: '湖北', 43: '湖南', 44: '广东', 45: '广西',
        46: '海南', 50: '重庆', 51: '四川', 52: '贵州', 53: '云南', 54: '西藏', 61: '陕西', 62: '甘肃', 63: '青海', 64: '宁夏',
        65: '新疆', 71: '台湾', 81: '香港', 82: '澳门', 91: '国外'
    },

    // 每位加权因子
    powers: [ '7', '9', '10', '5', '8', '4', '2', '1', '6', '3', '7', '9', '10', '5', '8', '4', '2' ],

    // 第18位校检码
    parityBit: [ '1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2' ],

    // 性别
    genders: { male: 'M', female: 'F' },

    /* 校验地址码 */
    checkAddressCode: addressCode => {
        let check = /^[1-9]\d{5}$/.test(addressCode);
        if (!check) return false;
        return certIdTool.provinceAndCitys[parseInt(addressCode.substring(0, 2))];
    },

    /* 校验日期码 */
    checkBirthDayCode: birDayCode => {
        let check = /^[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))$/.test(birDayCode);
        if (!check) return false;

        let yyyy = parseInt(birDayCode.substring(0, 4), 10),
            mm = parseInt(birDayCode.substring(4, 6), 10),
            dd = parseInt(birDayCode.substring(6), 10),
            xdata = new Date(yyyy, mm-1, dd);

        if (xdata > new Date()) return false; // 生日不能大于当前日期
        else if ( ( xdata.getFullYear() == yyyy ) && ( xdata.getMonth () == mm - 1 ) && ( xdata.getDate() == dd ) ) return true;
        else return false;
    }, 

    /* 计算校检码 */
    getParityBit: idCardNo => {
        let id17 = idCardNo.substring(0, 17),
            power = 0;
        for (let i = 0; i < 17; i++) power += parseInt(id17.charAt(i), 10) * parseInt(certIdTool.powers[i]);

        let mod = power % 11;
        return certIdTool.parityBit[mod];
    }, 

    /* 验证校检码 */
    checkParityBit: idCardNo => {
        let parityBit = idCardNo.charAt(17).toUpperCase();
        return certIdTool.getParityBit(idCardNo) == parityBit;
    },

    /* 校验15位或18位的身份证号码 */
    checkIdCardNo: idCardNo => {
        // 15位和18位身份证号码的基本校验
        let check = /^\d{15}|(\d{17}(\d|x|X))$/.test(idCardNo);
        if (!check) return false;

        // 判断长度为15位或18位
        let len = idCardNo.length;
        if (len == 15) return certIdTool.check15IdCardNo(idCardNo);
        else if (len == 18) return certIdTool.check18IdCardNo(idCardNo);
        else return false;
    }, 

    /* 校验15位的身份证号码 */
    check15IdCardNo: idCardNo => {
        // 15位身份证号码的基本校验
        let check = /^[1-9]\d{7}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}$/.test(idCardNo);
        if (!check) return false;

        // 校验地址码
        let addressCode = idCardNo.substring(0, 6);
        check = certIdTool.checkAddressCode(addressCode);
        if (!check) return false;

        // 校验日期码
        let birDayCode = '19' + idCardNo.substring(6, 12);
        check = certIdTool.checkBirthDayCode(birDayCode);
        if (!check) return false;

        // 验证校检码
        return certIdTool.checkParityBit(idCardNo);
    }, 

    /* 校验18位的身份证号码 */
    check18IdCardNo: idCardNo => {
        // 18位身份证号码的基本格式校验
        let check = /^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}(\d|x|X)$/.test(idCardNo);
        if (!check) return false;

        // 校验地址码
        let addressCode = idCardNo.substring(0, 6);
        check = certIdTool.checkAddressCode(addressCode);
        if (!check) return false;

        // 校验日期码
        let birDayCode = idCardNo.substring(6, 14);
        check = certIdTool.checkBirthDayCode(birDayCode);
        if (!check) return false;

        // 验证校检码
        return certIdTool.checkParityBit(idCardNo);
    }, 

    formateDateCN: day => {
        let yyyy = day.substring(0, 4),
            mm = day.substring(4, 6),
            dd = day.substring(6);
        return yyyy + '-' + mm + '-' + dd;
    }, 

    /* 获取信息 */
    getIdCardInfo: idCardNo => {
        let idCardInfo = {
            gender   : '', // 性别
            birthday : '' // 出生日期(yyyy-mm-dd)
        };
        let len = idCardNo.length;
        if (len == 15) {
            let aday = '19' + idCardNo.substring(6, 12);
            idCardInfo.birthday = certIdTool.formateDateCN(aday);
            idCardInfo.gender   = parseInt(idCardNo.charAt(14)) % 2 == 0 ? certIdTool.genders.female : certIdTool.genders.male;
        }
        else if (len == 18) {
            let aday = idCardNo.substring(6, 14);
            idCardInfo.birthday = certIdTool.formateDateCN(aday);
            idCardInfo.gender   = parseInt(idCardNo.charAt(16)) % 2 == 0 ? certIdTool.genders.female : certIdTool.genders.male;
        }
        return idCardInfo;
    }, 

    /* 18位转15位 */
    getId15: idCardNo => {
        let len = idCardNo.length;
        if (len == 15) return idCardNo;
        else if (len == 18) return idCardNo.substring(0, 6) + idCardNo.substring(8, 17);
        else return null;
    }, 

    /* 15位转18位 */
    getId18: idCardNo => {
        let len = idCardNo.length;
        if (len == 15) {
            let id17 = idCardNo.substring(0, 6) + '19' + idCardNo.substring(6),
                parityBit = certIdTool.getParityBit(id17);
            return id17 + parityBit;
        }
        else if (len == 18) return idCardNo;
        else return null;
    }

};


/** layui 自定义表单验证 */
const layuiVerify = {

    maxChar: (val, item) => {
        let maxChar = $(item).attr('maxChar');
        if (maxChar && val.length > maxChar) return '超出 ' + maxChar + ' 字符限制';
    },

    minChar: (val, item) => {
        let minChar = $(item).attr('minChar');
        if (minChar && val.length < minChar) return '不能少于 ' + minChar + ' 字符';
    },

    maxWord: (val, item) => {
        let maxWord = $(item).attr('maxWord');
        if (maxWord && strTool.lengthByWord(val) > maxWord) return '超出 ' + maxWord + ' 字数限制';
    },

    intInRange: (val, item) => {
        let range   = $(item).attr('range'),
            result  = numTool.intInRange(val, range);
        if (result) return result;
    },

    otherReq: (val, item) => {
        let verifyName  = $(item).attr('name'),
            verifyType  = $(item).attr('type'),
            formElem    = $(item).parents('.layui-form'), // 获取当前所在的form元素，如果存在的话
            verifyElem  = formElem.find('input[name=' + verifyName + ']'), // 获取需要校验的元素
            isTrue      = verifyElem.is(':checked'), // 是否命中校验
            focusElem   = verifyElem.next().find('i.layui-icon'),
            radioflag   = verifyType == 'radio'; // 焦点元素
        if (!isTrue || !val) {
            // 定位焦点
            focusElem.css(radioflag ? { 'color': '#ff5722' } : { 'border-color': '#FF5722' });
            // 对非输入框设置焦点
            focusElem.first().attr('tabIndex', '1').css('outline', '0').blur(() => {
                focusElem.css(radioflag ? { 'color': '' } : { 'border-color': '' });
            }).focus();
            return '必填项不能为空';
        }
    }

};

    
/** form 序列化为 json */
$.fn.serializeObject = function (options) {
    const   defaults    = { includeDisabled: false },
            settings    = { ...defaults, ...options };
    let     o           = {};
    
    if (settings.includeDisabled) {
        this.find('[name]').each(function () {
            const   $this   = $(this),
                    name    = $this.attr('name');
            
            // 处理不同类型的表单元素
            let value;
            if ($this.is(':checkbox')) value = $this.is(':checked') ? $this.val() : '';
            else if ($this.is(':radio')) {
                if ($this.is(':checked')) value = $this.val();
                else return; // 单选按钮组只处理选中的
            } 
            else value = $this.val() || '';
            
            if (o[name] !== undefined) {
                if (!o[name].push) o[name] = [o[name]];
                o[name].push(value);
            } 
            else o[name] = value;
        });
    } 
    else {
        let a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) o[this.name] = [o[this.name]];
                o[this.name].push(this.value || '');
            } 
            else o[this.name] = this.value || '';
        });
    }
    return o;
};