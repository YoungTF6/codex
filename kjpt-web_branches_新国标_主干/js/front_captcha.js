var FrontCaptcha = {
    // 1. 图片配置
    imgList: [
        "/img/login/captcha_bg_3.jpg",
        "/img/login/captcha_bg_1.jpg",
        "/img/login/captcha_bg_4.jpg",
    ],

    init: function (onSuccess) {
        // 【关键】初始化时自动注入 CSS
        this.addStyle();

        this.onSuccess = onSuccess;
        this.render();
    },

    // 2. 【新增】自动注入 CSS 样式的函数
    addStyle: function() {
        // 防止重复注入
        if (document.getElementById('front-captcha-style')) return;

        var css = `
            /* 滑块验证码样式 - JS注入版 */
            .slider-captcha-box { position: relative; width: 320px; margin: 0 auto; padding: 0; background: #fff; overflow: hidden; user-select: none; }
            .slider-img-box { position: relative; width: 320px; height: 160px; }
            #captcha-canvas-bg { width: 320px; height: 160px; display: block; }
            #captcha-canvas-block { position: absolute; left: 0; top: 0; z-index: 10; }
            .slider-bar-box { position: relative; width: 320px; height: 40px; background: #f7f9fa; border-top: 1px solid #e4e7eb; text-align: center; line-height: 40px; font-size: 12px; color: #666; }
            .slider-bar-mask { position: absolute; left: 0; top: 0; height: 40px; background: #D1E9FE; border: 1px solid #1991FA; box-sizing: border-box; width: 0; border-left: 0; }
            .slider-bar-btn { position: absolute; left: 0; top: 0; width: 40px; height: 40px; background: #fff; box-shadow: 0 0 3px rgba(0,0,0,0.3); cursor: move; font-size: 16px; color: #333; line-height: 40px; border: 1px solid #ddd; box-sizing: border-box; z-index: 100; }
            .slider-bar-btn:hover { background: #1991FA; color: #fff; }
            .refresh-icon { position: absolute; right: 5px; top: 5px; width: 24px; height: 24px; cursor: pointer; z-index: 20; background: rgba(255,255,255,0.9); border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; color: #333; font-size: 18px; }
        `;

        var style = document.createElement('style');
        style.type = 'text/css';
        style.id = 'front-captcha-style';

        if (style.styleSheet) {
            style.styleSheet.cssText = css; // IE支持
        } else {
            style.appendChild(document.createTextNode(css)); // 其他浏览器
        }

        document.getElementsByTagName('head')[0].appendChild(style);
    },

    // 3. 画拼图形状
    drawPuzzleShape: function(ctx, x, y, r) {
        var w = 40;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w / 2 - r, y);
        ctx.bezierCurveTo(x + w / 2 - r, y - r, x + w / 2 + r, y - r, x + w / 2 + r, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + w / 2 - r);
        ctx.bezierCurveTo(x + w + r, y + w / 2 - r, x + w + r, y + w / 2 + r, x + w, y + w / 2 + r);
        ctx.lineTo(x + w, y + w);
        ctx.lineTo(x + w / 2 + r, y + w);
        ctx.bezierCurveTo(x + w / 2 + r, y + w - r, x + w / 2 - r, y + w - r, x + w / 2 - r, y + w);
        ctx.lineTo(x, y + w);
        ctx.lineTo(x, y + w / 2 + r);
        ctx.bezierCurveTo(x + r, y + w / 2 + r, x + r, y + w / 2 - r, x, y + w / 2 - r);
        ctx.lineTo(x, y);
        ctx.closePath();
    },

    // 4. 渲染弹窗
    render: function () {
        var _this = this;
        var html =
            '<div class="slider-captcha-box" style="border:none;">' +
            '<div class="slider-img-box">' +
            '<div class="refresh-icon" title="刷新">↻</div>'+
            '<canvas id="captcha-canvas-bg" width="320" height="160"></canvas>' +
            '<canvas id="captcha-canvas-block" width="320" height="160"></canvas>' +
            '</div>' +
            '<div class="slider-bar-box">' +
            '拖动滑块完成拼图' +
            '<div class="slider-bar-mask"></div>' +
            '<div class="slider-bar-btn">→</div>' +
            '</div>' +
            '</div>';

        layer.open({
            type: 1,
            title: false,
            closeBtn: 1,
            area: ['320px', '225px'],
            shadeClose: false,
            resize: false,
            content: html,
            success: function(layero, index){
                var canvasBg = document.getElementById('captcha-canvas-bg');
                var canvasBlock = document.getElementById('captcha-canvas-block');
                var ctxBg = canvasBg.getContext('2d');
                var ctxBlock = canvasBlock.getContext('2d');

                var $box = layero.find(".slider-captcha-box");
                var $btn = $box.find(".slider-bar-btn");
                var $mask = $box.find(".slider-bar-mask");
                var $blockCanvas = $(canvasBlock);

                var targetX = 0;

                var drawCanvas = function() {
                    $btn.css('left', 0).html('→').css('background', '#fff').css('color', '#333');
                    $mask.css('width', 0).css('background', '#D1E9FE').css('borderColor', '#1991FA');
                    $blockCanvas.css('left', 0);

                    targetX = Math.floor(Math.random() * 150 + 110);
                    var targetY = Math.floor(Math.random() * 100 + 20);

                    ctxBg.clearRect(0, 0, 320, 160);
                    ctxBlock.clearRect(0, 0, 320, 160);
                    canvasBlock.width = 320;

                    var randomImgSrc = _this.imgList[Math.floor(Math.random() * _this.imgList.length)];
                    var img = new Image();
                    img.src = randomImgSrc;

                    img.onload = function() {
                        ctxBg.drawImage(img, 0, 0, 320, 160);
                        _this.drawPuzzleShape(ctxBg, targetX, targetY, 8);
                        ctxBg.fillStyle = 'rgba(0, 0, 0, 0.5)';
                        ctxBg.fill();
                        ctxBg.lineWidth = 1;
                        ctxBg.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                        ctxBg.stroke();

                        _this.drawPuzzleShape(ctxBlock, targetX, targetY, 8);
                        ctxBlock.fillStyle = 'rgba(255, 255, 255, 0)';
                        ctxBlock.fill();
                        ctxBlock.clip();
                        ctxBlock.drawImage(img, 0, 0, 320, 160);
                        ctxBlock.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                        ctxBlock.lineWidth = 2;
                        ctxBlock.stroke();

                        try {
                            var imgData = ctxBlock.getImageData(targetX - 10, targetY - 20, 60, 60);
                            canvasBlock.width = 320;
                            ctxBlock.putImageData(imgData, 0, targetY - 20);
                        } catch (e) {
                            console.error("图片跨域", e);
                            layer.msg("图片加载失败(CORS)");
                        }
                    };
                    img.onerror = function() { layer.msg("背景图加载失败"); }
                };

                drawCanvas();

                $box.find('.refresh-icon').click(function(){ drawCanvas(); });

                var isDown = false;
                var startX = 0;

                $btn.mousedown(function(e){
                    e.preventDefault();
                    isDown = true;
                    startX = e.clientX;
                });

                $(document).mousemove(function(e){
                    if(!isDown) return;
                    e.preventDefault();
                    var moveX = e.clientX - startX;
                    if(moveX < 0) moveX = 0;
                    if(moveX > 280) moveX = 280;

                    $btn.css('left', moveX + 'px');
                    $mask.css('width', moveX + 'px');
                    $blockCanvas.css('left', moveX + 'px');
                });

                $(document).mouseup(function(e){
                    if(!isDown) return;
                    isDown = false;
                    var finalX = parseInt($btn.css('left'));

                    if(Math.abs(finalX - (targetX - 10)) < 8){
                        $btn.html('✔').css('background', '#52ccba').css('color', '#fff');
                        $mask.css('background', '#D2F4EF').css('borderColor', '#52ccba');
                        setTimeout(function(){
                            layer.close(index);
                            layer.msg("验证通过");
                            if(typeof _this.onSuccess === 'function'){
                                _this.onSuccess();
                            }
                        }, 500);
                    } else {
                        $btn.animate({left: 0}, 200);
                        $mask.animate({width: 0}, 200);
                        $blockCanvas.animate({left: 0}, 200);
                        layer.msg("请对准缺口");
                    }
                });
            }
        });
    }
};