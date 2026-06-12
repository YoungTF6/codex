const codeTool = {

    loadImgCode: function (layer, selector, width, height) {
        let result = null;

        $.ajax({
            type     : 'post',
            async    : false,
            url      : huayi_mcenter_url + 'code/imgCode?date=' + Math.random(),
            data     : {
                width       : width,
                height      : height
            },
            datatype : 'json',
            success  : function (res, sataus, request) {
                if (res && 200 == res.status) {
                    $(selector).attr('src', 'data:image/png;base64,' + res.data.img_code_base64);
                    result = res.data.code_key;
                } else {
                    layer.msg('获取图形验证码失败', { icon: 2, time: 1500 });
                }
            },
            error    : function (xhr, status, error) {
                layer.msg('获取图形验证码失败', { icon: 7, time: 1500 });
            }
        });

        return result;
    },

    checkImgCode: function (layer, selector, codeKey, code) {
        let result = false;
        code = code.toUpperCase();

        code = code.toUpperCase();
        $.ajax({
            type     : 'post',
            async    : false,
            url      : huayi_mcenter_url + 'code/imgCode/check',
            data     : {
                codeKey : codeKey,
                code    : code
            },
            datatype : 'json',
            success  : function (res, sataus, request) {
                if (res && 200 == res.status) {
                    result = true;
                    $(selector).click();
                } else {
                    layer.msg(res.msg, { icon: 2, time: 1500 });
                    if ('图形验证码已失效' == res.msg) {
                        $(selector).click();
                    }
                }
            },
            error    : function (xhr, status, error) {
                layer.msg('图形验证码校验失败', { icon: 7, time: 1500 });
            }
        });

        return result;
    }

}