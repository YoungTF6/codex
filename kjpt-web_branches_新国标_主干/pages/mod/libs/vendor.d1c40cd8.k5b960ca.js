let _docx = {
    tids: [],
    tdoms: [],
    ob: null,
    removeLoading: function () {
        $('body > .loading').remove();
    },
    highlight: function (id) {
        $('.li_active').removeClass('li_active');
        $(`.sidebar_nav li a[data-href='${id}']`).parent('li').addClass('li_active');
        if ($('.btn_auto').is(':visible')) {
            if ('#page_course,#page_teacher'.includes(id)) $('#btn_course').show(); else $('#btn_course').hide();
            if ('#page_other' === id) $('#btn_cycle').show(); else $('#btn_cycle').hide();
        }
    },
    outline: function () {
        let that = this;
        that.tids = [];
        that.tdoms = [];
        $('.sidebar_nav li a[data-href^="#page_"]').each(function (idx, ele) {
            let $this = $(this);
            let id = $this.data('href');
            let $dom = $(id);
            that.tids.push(id);
            that.tdoms.push($dom);
        });
        $('#box_center').scroll(_cmn.debounce(() => {
            let rects = that.tdoms.map($d => $d[0].getBoundingClientRect());
            for (let i = 0, n = that.tdoms.length; i < n; ++i) {
                let tid = that.tids[i];
                let tr = rects[i];
                if (tr.top >= 0 && tr.top <= 300) {
                    that.highlight(tid);
                    break;
                } else if (tr.top < 0 && rects[i + 1] && rects[i + 1].top > document.documentElement.clientHeight) {
                    that.highlight(tid);
                    break;
                }
            }
        }, 100));
        $('.sidebar_nav li').on('click', function (idx, ele) {
            let $this = $(this);
            if ($this.find('p').length < 1) {
                let id = $this.find('a').data('href');
                that.highlight(id);
                $(`${id}`)[0].scrollIntoView({behavior: 'smooth'});
            }
        });
    },
    footerNum: function () {
        let that = this;
        $('.footer_num').remove();
        let $ps = $('.pdf_box .a4_portrait:not(.foot_n_pass):visible');
        $ps.each(function (idx, ele) {
            let pn = idx + 1;
            $(this).append(`<div class="footer_num">${pn}</div>`).attr('data-page-num', pn);
        });
        let total = $ps.length;
        if (that.ob) {
            that.ob.disconnect();
            that.ob = null;
        }
        that.ob = new IntersectionObserver((entries, observer) => {
            entries.forEach(item => {
                if (item.isIntersecting) {
                    let cur = $(item.target).data('page-num') || '-';
                    $('.pn_box p').text(`${cur} / ${total}`);
                }
            });
        }, {
            root: null,
            threshold: 0.4,
        });
        document.querySelectorAll('.a4_portrait').forEach(a4 => {
            that.ob.observe(a4);
            a4.dataset.observed = 'true';
        });
    },
    bindDown: function () {
        let that = this;
        $('#btn_down').on('click', function () {
            let s = document.documentElement.style.getPropertyValue('--ud_icon_size');
            let hasIcon = '0' !== s;
            _fdp.downloadPdf('#btn_down', '申报书', () => {
                hasIcon && that.hideUdIcon();
            }, () => {
                hasIcon && that.showUdIcon();
            });
        });
    },
    hideUdIcon: function () {
        $('.sign_btn_box').css('visibility', 'hidden');
        document.documentElement.style.setProperty('--ud_icon_size', '0');
    },
    showUdIcon: function () {
        $('.sign_btn_box').css('visibility', 'visible');
        document.documentElement.style.setProperty('--ud_icon_size', '28px');
    },
    disableSave: function () {
        $('#btn_stage').attr('disabled', 'true').addClass('layui-btn-disabled');
        $('#btn_save').attr('disabled', 'true').addClass('layui-btn-disabled');
    },
    enableSave: function () {
        $('#btn_stage').removeClass('layui-btn-disabled').removeAttr("disabled");
        $('#btn_save').removeClass('layui-btn-disabled').removeAttr("disabled");
    },
    readonly: function () {
        $('.txt_ipt').attr('disabled', 'true').addClass('disabled_ipt');
        $('.txare_lg,.txare_md,.txare_sm').attr('contenteditable', 'false');
        $('.preview_hide').css('visibility', 'hidden');
        $('input[type=checkbox]').attr('disabled', 'true');
        this.hideUdIcon();
    },
};
$(function () {
    _docx.outline();
    _docx.footerNum();
    _docx.bindDown();
});