// 移动端自适应

// method-1
(function (doc, win) {
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function () {
            var clientWidth = docEl.clientWidth;
            if (!clientWidth) return;
            docEl.style.fontSize = 20 * (clientWidth / 320) + 'px';
        };
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);


// method-2 小米官网的写法
// !function (n) {
//     var e = n.document,
//         t = e.documentElement,
//         i = 750,
//         d = i / 100,
//         o = "orientationchange" in n ? "orientationchange" : "resize",
//         a = function () {
//             var n = t.clientWidth || 320;
//             n > 750 && (n = 750);
//             t.style.fontSize = n / d + "px"
//         };
//     e.addEventListener && (n.addEventListener(o, a, !1), e.addEventListener("DOMContentLoaded", a, !1))
// }(window);


// method-3
// var scaleNum = window.screen.width / 600;
// document.getElementsByTagName('html')[0].style.fontSize = (100 * scaleNum) + 'px';


// PC端固定大小
// !function (e) {
//     function t() {
//         var t = n.clientWidth
//             , i = "}";
//         !navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i) && t > 750 && (t = 750,
//             i = ";max-width:" + t + "px;margin-right:auto!important;margin-left:auto!important;}"),
//             e.rem = t / 10,
//         /ZTE U930_TD/.test(navigator.userAgent) && (e.rem = 1.13 * e.rem),
//         /Android\s+4\.4\.4;\s+M351\s/.test(navigator.userAgent) && (e.rem = e.rem / 1.05),
//         /Android\s+5\.0\.1;\s+MX4\s/.test(navigator.userAgent) && (e.rem = 1.06382 * e.rem),
//         /Android\s+4\.2\.2;[\s\w-;]+Coolpad\s8297[\s\w\S;]+UCBS/.test(navigator.userAgent) && (e.rem = .908 * e.rem),
//             r.innerHTML = "html{font-size:" + e.rem + "px!important;}body{font-size:" * (t / 320) + "px" + i
//     }
//
//     var n = document.documentElement,
//         r = document.createElement("style");
//     n.firstElementChild.appendChild(r),
//         e.addEventListener("resize", function () {
//             t()
//         }, !1),
//         e.addEventListener("pageshow", function (e) {
//             e.persisted && t()
//         }, !1),
//         t()
// }(window);


