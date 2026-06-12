// number.js
function number_ph() {
    // positive
    $('.number_ph').on("keypress", function (event) {
        // -:45 .:46 e:101
        if (event.keyCode === 45 || event.keyCode === 101) {
            event.preventDefault();
        }
        // return (/[\d\.]/.test(String.fromCharCode(event.keyCode)))
    }).on('paste', function (event) {
        event.preventDefault();
    });
}
function number_zzs() {
    $('.number_zzs').on("keypress", function (event) {
        // -:45 .:46 e:101
        if (event.keyCode === 45 || event.keyCode === 46 || event.keyCode === 101) {
            event.preventDefault();
        }
        // return (/[\d\.]/.test(String.fromCharCode(event.keyCode)))
    }).on('paste', function (event) {
        event.preventDefault();
    });
}
function cert_id_x() {
    // cert_id x -> X
    $('.cert-id-x').on('keyup', function (event) {
        // console.info('cert-id-x.keyup')
        this.value = this.value.toUpperCase();
    });
}
function sql_keyword() {
    $('.sql_keyword').on('blur', function (event) {
        let val = this.value;
        // console.info('sql_keyword.blur, val: %s', val);
        if (val) {
            // this.value = val.replaceAll(/(\s)(and|or|select|insert|update|delete|drop|truncate|alter|grant|declare|exec)(\s)/ig, '$1_$2$3');
            this.value = val.replace(/\band\b/gi, '_and')
                            .replace(/\bexec\b/gi, '_exec')
                            .replace(/\binsert\b/gi, '_insert')
                            .replace(/\bselect\b/gi, '_select')
                            .replace(/\bdrop\b/gi, '_drop')
                            .replace(/\bgrant\b/gi, '_grant')
                            .replace(/\balter\b/gi, '_alter')
                            .replace(/\bdelete\b/gi, '_delete')
                            .replace(/\bupdate\b/gi, '_update')
                            .replace(/\bcount\b/gi, '_count')
                            .replace(/\bchr\b/gi, '_chr')
                            .replace(/\bmid\b/gi, '_mid')
                            .replace(/\bmaster\b/gi, '_master')
                            .replace(/\btruncate\b/gi, '_truncate')
                            .replace(/\bchar\b/gi, '_char')
                            .replace(/\bdeclare\b/gi, '_declare')
                            .replace(/\bor\b/gi, '_or');
            
        }
    });
}
$(function () {
    setTimeout(function () {
        number_ph();
        number_zzs();
        cert_id_x();
        sql_keyword()
    }, 500);
});
