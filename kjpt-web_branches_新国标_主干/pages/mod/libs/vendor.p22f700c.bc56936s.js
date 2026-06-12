const _projTextField = ['progress', 'question', 'target', 'innovation', 'projAnalyze', 'jobSummary'];
const _principalTextField = ['resume', 'experience', 'training', 'study', 'article'];
const _a4TableHeight = 1040;
const _projFieldHeight = 973;
const _prinFieldHeight = 454;
const _a4Width = 595.28;
const _a4Height = 841.89;
let gDownloadPass;
const _isMianxiang = new Set([
                        "95b9ef88-7265-11f0-adb9-005056a64c01",
                        '95b9efce-7265-11f0-adb9-005056a64c01'
                    ]);
let _prev = {
    breakProjText: function (key, val) {
        let $dom = $('#' + key);
        let percent = (_projFieldHeight - 60) / $dom.height();
        let len = val.length;
        let sep = len * percent - 120;
        $dom.text(val.slice(0, sep));
        let $dom2 = $('#' + key + '_alt');
        $dom2.text(val.slice(sep));
        $dom2.parents('.a4_portrait').show();
    },
    fixTable: function (lastTrSel) {
        let $lastTr = $(lastTrSel);
        let tableHeight = $lastTr.parents('table').height();
        let inc = _a4TableHeight - tableHeight;
        if (inc > 0) {
            let h = $lastTr.height();
            $lastTr.height(h + inc);
        }
    },
    shiftCityName: function (scoreLevelName, projUpwardText) {
        if (isCityProj(scoreLevelName)) {
            let cityName = this.parseCityName(projUpwardText);
            if (cityName.includes('市')) {
                cityName = cityName.substring(0, cityName.indexOf('市') + 1);
            }
            $('.city_name').text(cityName);
            $('.only_province').hide();
            $('.only_city').show();
            return cityName;
        }
    },
    parseCityName: function (projUpwardText) {
        // 'cityUnitName' !== 'cityName'
        let cityUnit = parseCityUnit(projUpwardText);
        let cityUnitName = cityUnit.unitName;
        return cityUnitName.replace('卫生健康委员会', '').replace('卫健委', '');
    },
    footLabel: function () {
        $('.foot_num').remove();
        $('#pdf_container .a4_portrait:not(.download_pass):visible').each(function (idx, ele) {
            if (0 !== idx) $(this).append(`<div class="foot_num">${idx}</div>`);
        });
    },
    setMb: function (flag) {
        if (!flag) {
            gDownloadPass = $('.download_pass:visible');
            gDownloadPass && (gDownloadPass.length > 0) && gDownloadPass.hide();
        } else {
            gDownloadPass && (gDownloadPass.length > 0) && gDownloadPass.show();
        }
        $('.a4_portrait').css('margin-bottom', flag ? '5mm' : 0).css('box-shadow', flag ? '0 0 0.5cm rgba(0, 0, 0, 0.5)' : 'none');
    },
    catalog: function() {
        $('.catalog .ul_box ul').empty().html($('div[data-title]:not([data-title=""])').map((idx, div) => `<li><a href="#${$(div).attr('id')}"><cite>${$(div).data('title')}</cite></a></li>`).get().join(''));
    },
    bindDownload: function () {
        $('#download_btn').on('click', function () {
            let title = $('#projectName').text();
            _fdp.downloadPdf('#download_btn', title);
        });
    },
};
let _fdp = {
    /**
     * jsPDF.addImage(pageDataURL, 'JPEG', 左, 上, 宽度, 高度);
     * jsPDF.addImage(imageData, format, x, y, width, height);
     *
     * canvas.getContext('2d').drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
     */
    downloadPdf: function (downBtnId, title, before, after) {
        _prev.setMb(false);
        if (before && typeof before === 'function') {
            before();
        }
        
        // 添加水印
        if (_isZhejiang) {
            //证件号和证件类型单元格下载不显示
            $('#page_principal .id_info_row, #page_other .id_info_row').hide();
            // 首页“活动内容”下载不显示
            $('#proj_scoreTypeSel').closest('li').hide();
            // 浙江：页面默认隐藏的行，仅下载时显示
            $('#page_other tr.zj_default_hide').show();
            

            const $watermark = $('<div id="pdf-watermark-container"></div>');
            $watermark.css({
                'position': 'absolute',
                'top': '0',
                'left': '0',
                'width': '100%',
                'height': '100%',
                'pointer-events': 'none',
                'z-index': '9999'
            });
            
            // const watermarkImg = '/img/watermark/watermark.png'; // 请替换为实际的水印图片路径
            let watermarkText = '浙江省CME项目申报';
            let scoreLevelId = getOrDefault(getUrlParamByName('score_level_id'), '');
            if (scoreLevelId === 'd0b501c2-1229-11f1-aa66-005056a64c01') {
                watermarkText = '浙江省中医药继续教育项目申报';
            }
            const wmStyle = {
                'position': 'absolute',
                'opacity': '0.3',
                'font-size': '28px',
                'font-family': 'Microsoft YaHei',
                'color': '#aaaaaa',
                // 'font-weight': 'bold',
                'transform': 'rotate(-35deg)',
                'white-space': 'nowrap'
            };
            // 左上角水印 2个
            $watermark.append($('<span>' + watermarkText + '</span>').css($.extend({}, wmStyle, { 'top': '150px', 'left': '40px' })));
            $watermark.append($('<span>' + watermarkText + '</span>').css($.extend({}, wmStyle, { 'top': '280px', 'left': '250px' })));
            // 右下角水印 2个
            $watermark.append($('<span>' + watermarkText + '</span>').css($.extend({}, wmStyle, { 'bottom': '150px', 'right': '40px' })));
            $watermark.append($('<span>' + watermarkText + '</span>').css($.extend({}, wmStyle, { 'bottom': '280px', 'right': '250px' })));
            $('#pdf_container .a4_portrait').each(function() {
                $(this).append($watermark.clone());
                $(this).css('position', 'relative');
            });
        }

        let $downloadBtn = $(`${downBtnId}`);
        $downloadBtn.attr('disabled', 'true')
            .toggleClass('layui-btn-disabled')
            .html('<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>下载中...');
        //
        let targetDom = document.querySelector('#pdf_container');
        window.pageYoffset = 0;
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        let jsPdfInst = new jsPDF('x', 'pt', 'a4');
        _fdp._genPdf(targetDom, jsPdfInst, title, 0, false, downBtnId, after);
    },
    _genPdf: function (targetDom, jsPdfInst, title, pageTotalGened, save, downBtnId, after) {
        let $downloadBtn = $(`${downBtnId}`);
        const _bodyWidth = document.body.scrollWidth;
        const _bodyHeight = document.body.scrollHeight;
        const _windowWidth = window.innerWidth;
        const _windowHeight = window.innerHeight;
        const _targetDomeWidth = targetDom.scrollWidth; // 794
        const _targetDomeHeight = targetDom.scrollHeight;
        console.info('download. bodyWidth: %s, bodyHeight: %s', _bodyWidth, _bodyHeight);
        console.info('download. windowWidth: %s, windowHeight: %s', _windowWidth, _windowHeight);
        console.info('download. targetDomWidth: %s, targetDomHeight: %s', _targetDomeWidth, _targetDomeHeight);
        html2canvas(targetDom, {
            // windowWidth: _windowWidth,
            // windowHeight: _windowHeight,
            width: _targetDomeWidth,
            height: _targetDomeHeight,
            allowTaint: true,
            useCORS: true,
            // scale: 2, // window.devicePixelRatio,
            // dpi: '192',
        }).then((canvas) => {
            const _canvasWidth = canvas.width;
            const _canvasHeight = canvas.height;
            const _pageHeight = _calcu.a4HeightFit(targetDom.id, _canvasWidth);
            console.info('download. canvasWidth: %s, canvasHeight: %s', _canvasWidth, _canvasHeight);
            console.info('download. a4Width: %s, a4Height: %s, pageHeight: %s', _a4Width, _a4Height, _pageHeight);
            //
            let pageDataURL = canvas.toDataURL('image/jpeg', 1.0);
            jsPdfInst.setDisplayMode('fullwidth', 'continuous', 'FullScreen');
            //
            let leftHeight = _canvasHeight;
            let index = 0;
            let position = 0;
            let height;
            let tmpPageTotal = pageTotalGened;
            const _gap = _calcu.gapFit(targetDom.id, _pageHeight);
            let canvas2 = document.createElement('canvas');
            // 内容未超过pdf一页显示的范围，无需分页
            if (leftHeight < _pageHeight) {
                console.info('download. single page');
                // rect-1
                let w = _a4Width;
                let h = _a4Width / _canvasWidth * leftHeight;
                jsPdfInst.addImage(pageDataURL, 'JPEG', 0, 0, w, h);
                jsPdfInst.save(title + '.pdf');
            } else {
                // jsPdfInst.deletePage(0);
                let pageCur = index;
                let pageCnt = index + Math.ceil(leftHeight / _pageHeight);
                $downloadBtn.html(`<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>下载中(${pageCur}/${pageCnt})`);
                setTimeout(_genPdfImpl, 50, canvas);
            }
            function _genPdfImpl(canvas) {
                let thatCanvas = canvas;
                if (leftHeight > 0) {
                    if (leftHeight <= _pageHeight) {
                        height = leftHeight;
                    } else {
                        let checkCount = 0;
                        let i = position + _pageHeight;
                        for (i = position + _pageHeight; i >= position; --i) {
                            let isWrite = true;
                            for (let j = 0; j < thatCanvas.width; j++) {
                                let d = thatCanvas.getContext('2d').getImageData(j, i, 1, 1).data;
                                // 像素点RGB,'0xfff'是白色
                                if (d[0] !== 0xff || d[1] !== 0xff || d[2] !== 0xff) {
                                    isWrite = false;
                                    break;
                                }
                            }
                            if (isWrite) {
                                checkCount++;
                                if (checkCount >= 10) {
                                    break;
                                }
                            } else {
                                checkCount = 0;
                            }
                        }
                        height = Math.round(i - position) || Math.min(leftHeight, _pageHeight);
                        if (height <= 0) {
                            height = _pageHeight;
                        }
                        height = _pageHeight; // FIXME
                    }
                    console.info('download. index: %s, leftHeight: %s, position: %s, height: %s', index, leftHeight, position, height);
                    //
                    canvas2.width = thatCanvas.width;
                    canvas2.height = height;
                    let ctx = canvas2.getContext('2d');
                    // rect-2
                    ctx.drawImage(thatCanvas, 0, position, thatCanvas.width, height, 0, 0, thatCanvas.width, height);
                    let pageDataURL2 = canvas2.toDataURL('image/jpeg', 1.0);
                    // console.log('%s', pageDataURL2);
                    let w = _a4Width; // -40
                    let h = (_a4Width / canvas2.width * height);
                    // rect-3
                    jsPdfInst.addImage(pageDataURL2, 'JPEG', 0, 0, w, h);
                    //
                    ++index;
                    leftHeight -= (height + _gap);
                    position += (height + _gap);
                    //
                    if (0 !== index) {
                        jsPdfInst.addPage();
                    }
                    //
                    let pageCur = index;
                    let pageCnt = index + Math.ceil(leftHeight / _pageHeight);
                    $downloadBtn.html(`<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>下载中(${pageCur}/${pageCnt})`);
                    //
                    if (leftHeight > 0) {
                        setTimeout(_genPdfImpl, 50, thatCanvas);
                    } else {
                        tmpPageTotal += index; // 0-index:有内容 index+1:空白页
                        jsPdfInst.deletePage(tmpPageTotal + 1);
                        console.info('download. deletePage: %s', tmpPageTotal + 1);
                        let attachDom = document.querySelector('#attach_container');
                        let hasAttach = attachDom && (attachDom.scrollHeight > 0);
                        if (save || !hasAttach) {
                            jsPdfInst.save(title + '.pdf');
                            if (_isZhejiang) {
                                $('#pdf_container .a4_portrait #pdf-watermark-container').remove();
                                $('#page_principal .id_info_row, #page_other .id_info_row').show();
                                $('#proj_scoreTypeSel').closest('li').show();
                                $('#page_other tr.zj_default_hide').hide();
                            }
                            
                            $downloadBtn.html('<i class="layui-icon layui-icon-download-circle"></i>下载')
                                .toggleClass('layui-btn-disabled')
                                .removeAttr("disabled");
                            console.info('download. end: %s', new Date());
                            _prev.setMb(true);
                            if (after && typeof after === 'function') {
                                after();
                            }
                        } else {
                            // 主体页已完成，先还原页面，再继续渲染附件
                            if (_isZhejiang) {
                                $('#pdf_container .a4_portrait #pdf-watermark-container').remove();
                                $('#page_principal .id_info_row, #page_other .id_info_row').show();
                                $('#proj_scoreTypeSel').closest('li').show();
                                $('#page_other tr.zj_default_hide').hide();
                            }
                            jsPdfInst.addPage();
                            _fdp._genPdf(attachDom, jsPdfInst, title, tmpPageTotal, true, downBtnId);
                        }
                    }
                }
            }
        });
    },
    // render attachment
    renderAsImg: function (pdfFile, pageNum, canvasContext) {
        let pageElem = pdfFile.getPage(pageNum);
        pageElem.then(function (page) {
            let viewport = page.getViewport({scale: 3});
            let newCanvas = canvasContext.canvas;
            newCanvas.width = viewport.width;
            newCanvas.height = viewport.height;
            newCanvas.style.width = "100%";
            let renderContext = {
                canvasContext: canvasContext,
                viewport: viewport
            };
            page.render(renderContext);
        });
    },
    // render attachment
    xhrRequest: async function (url, callback) {
        let fileUrl = url;
        return await fetch(fileUrl)
            .then((response) => response.blob())
            .then((res) => {
                let idx = fileUrl.lastIndexOf(".");
                let ext = fileUrl.substr(idx + 1);
                let blob = new Blob([res]);
                if (typeof callback === "function") {
                    callback(blob, ext);
                }
            });
    },
    // render attachment
    renderPdf: function (blob, idx, lastDomId) {
        let totalPages = 0;
        let reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = function (e) {
            let loadingTask = pdfjsLib.getDocument({
                url: this.result,
                cMapUrl: "/js/pdfjs/web/cmaps/",
                // cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.2.228/cmaps/",
                cMapPacked: true
            });
            loadingTask.promise.then(function (pdf) {
                if (pdf) {
                    totalPages = pdf.numPages;
                    for (let i = 1; i <= totalPages; i++) {
                        let canvas = document.createElement('canvas');
                        // canvas.id = 'page_' + i;
                        let $div = $(`<div class="a4_portrait table_big" style="background: white;" id="page_${idx}_${i}"></div>`);
                        $div.append(canvas)
                        $(`#${lastDomId}`).after($div);
                        //
                        let context = canvas.getContext('2d');
                        _fdp.renderAsImg(pdf, i, context);
                    }
                }
            });
        }
    },
};
let _calcu = {
    calcHeight: function (containerId) {
        let cnt = 0;
        let sum = 0;
        $(`#${containerId} .a4_portrait:visible`).each(function (idx, ele) {
            // let offset = $(this).offset();
            sum += $(this).height();
            ++cnt;
        });
        return {'height': sum, 'cnt': cnt};
    },
    calcGap: function (containerId) {
        //
        let h = $(`#${containerId}`).height();
        let sh = document.querySelector(`#${containerId}`).scrollHeight;
        //
        let a = this.calcHeight(containerId);
        let gapT = (h - a.height);
        let gap = gapT / (a.cnt - 1);
        return gap;
    },
    a4HeightFit: function (containerId, canvasWidth) {
        let a4HeightFit;
        // 1
        a4HeightFit = Math.ceil((canvasWidth / _a4Width) * _a4Height);
        // a4HeightFit -= 60;
        // 2
        // let scale = window.devicePixelRatio;
        // let a = this.calcHeight(containerId);
        // a4HeightFit = Math.ceil((a.height * scale / _a4Width) * _a4Height);
        //
        return a4HeightFit;
    },
    gapFit: function (containerId, pageHeight) {
        // 1
        let gapFit = 0;
        // 2
        // gapFit = (7 / 297) * pageHeight;
        // 3
        // let scale = window.devicePixelRatio;
        // let a = this.calcHeight(containerId);
        // let gap = this.calcGap(containerId);
        // gapFit = Math.ceil((a.height * scale / _a4Width) * gap);
        //
        return gapFit;
    },
    log: function () {
        this.calcGap('pdf_container');
        this.calcGap('attach_container');
        let a1 = $('#pdf_container .a4_portrait:visible:eq(1)');
        let a2 = $('#pdf_container .a4_portrait:visible:eq(2)');
        let h = a1.height();
        let dif = a2.offset().top - a1.offset().top;
    }
}
let _draw = {
    course_base: function (courseVoList) {
        this.__course_page(courseVoList, '', true);
    },
    course_base_alt: function (courseVoList) {
        this.__course_page(courseVoList, '', true);
        let $table = $('#course_loop_head').parents('.table_box');
        let tableHeight = $table.height();
        let $courseBlank = $('#course_blank');
        if ($courseBlank.length > 0) {
            tableHeight -= $courseBlank.outerHeight();
        }
        let sep = courseVoList.length - 1;
        let loop = 0;
        while (tableHeight > _a4TableHeight && loop < 20) {
            $('.may_recall').remove();
            $('#course_loop_head_alt').parents('.a4_portrait').show();
            this.__course_page(courseVoList.slice(0, sep), '', false);
            this.__course_page(courseVoList.slice(sep), '_alt', true);
            tableHeight = $table.height();
            sep--;
            loop++;
        }
        _prev.footLabel();
    },
    course_base_alt_iii: function(courseVoList, a, b, c) {
        _draw.__course_page(courseVoList.slice(0, a), '', false);
        _draw.__course_page(courseVoList.slice(a, b), '_alt', false);
        _draw.__course_page(courseVoList.slice(b, c), '_iii', true);
        $('#course_loop_head_alt').parents('.a4_portrait').show();
        $('#course_loop_head_iii').parents('.a4_portrait').show();
        _prev.footLabel();
    },
    __course_page: function (courseVoList, postfix, appendBlank) {
        if (courseVoList.length < 1) return;
        let str = courseVoList.map(c => _render.course_tr(c)).join('');
        appendBlank && (str += `<tr id="course_blank${postfix}" class="may_recall"><td colspan="12" class="td_blank"><br/></td></tr>`);
        $(`#course_loop_head${postfix}`).after(str);
        appendBlank && _prev.fixTable(`#course_blank${postfix}`);
    },
    __teacher_page: function (courseVoList, postfix, appendBlank) {
        if (courseVoList.length < 1) return;
        let str = courseVoList.map(c => _render.teacher_tr(c)).join('');
        appendBlank && (str += `<tr id="teacher_blank${postfix}" class="may_recall"><td colspan="12" class="td_blank"><br/></td></tr>`);
        $(`#teacher_loop_head${postfix}`).after(str);
        $(`#teacher_rowspan${postfix}`).attr('rowspan', courseVoList.length + (appendBlank ? 2 : 1));
        appendBlank && _prev.fixTable(`#teacher_blank${postfix}`);
    },
    teacher_base: function (courseVoList) {
        this.__teacher_page(courseVoList, '', true);
    },
    teacher_base_alt: function (courseVoList) {
        this.__teacher_page(courseVoList, '', true);
        let $loop2head = $('#teacher_loop_head');
        let $loop2headAlt = $('#teacher_loop_head_alt');
        let $table = $loop2head.parents('.table_box');
        let tableHeight = $table.height();
        let $teacherBlank = $('#teacher_blank');
        if ($teacherBlank.length > 0) {
            tableHeight -= $teacherBlank.outerHeight();
        }
        let sep = courseVoList.length - 2;
        let loop = 0;
        while (tableHeight > _a4TableHeight && loop < 20) {
            $loop2head.parent().find('.may_recall').remove();
            $loop2headAlt.parent().find('.may_recall').remove();
            $loop2headAlt.parents('.a4_portrait').show();
            this.__teacher_page(courseVoList.slice(0, sep), '', false);
            this.__teacher_page(courseVoList.slice(sep), '_alt', true);
            tableHeight = $table.height();
            sep--;
            loop++;
        }
        _prev.footLabel();
    },
}
let _render = {
    projectId: '',
    projectVo: null,
    project: function (projectVo) {
        if (!projectVo) return false;
        const that = this;
        Object.keys(projectVo).forEach(key => {
            let $dom = $(`#${key}, #${key}1, #${key}2, #${key}3, #${key}4`);
            let val = projectVo[key];
            if (($dom.length > 0) && (typeof val) !== 'object') {
                val = String(val);
                ('projectCode' === key) && (val = getOrDefault(projectVo.publishCode, projectVo.projectCode));
                ('addTime' === key) && (val = moment(val, DateTimePattern.SECOND).format(DateTimePattern.DAY));
                ('isCharge' === key) && (val = val.replace('1', '是').replace('0', '否'));
                // ('knowledgeName' === key) && $dom.text(`${projectVo.knowledgeTwoNameE}-${projectVo.knowledgeNameE}`);
                ('knowledgeName' === key && _isMianxiang.has(projectVo.scoreLevelId)) && (val = `${projectVo.knowledgeTwoName}-${projectVo.knowledgeName}`);
                $dom.text(val);
                $dom.val(val);
                if (_projTextField.includes(key) && ($dom.height() > _projFieldHeight)) _prev.breakProjText(key, val);
            }
        });
        _prev.shiftCityName(projectVo.scoreLevelName, projectVo.upwardText);
        _prev.fixTable('#other_blank');
        _prev.footLabel();
        that.after_proj?.(projectVo);
        //
        if (projectVo.principalVO) that.principal(projectVo.principalVO);
        if (projectVo.courseVOList) that.course(projectVo.courseVOList);
        if (projectVo.cycleVOList) that.cycle(projectVo.cycleVOList);
        if (projectVo.attachmentVoList) that.attachment(projectVo.attachmentVoList);
    },
    after_proj: function (projectVo) {
    },
    principal: function (principalVo) {
        const that = this;
        Object.keys(principalVo).forEach(key => {
            let $dom = $(`*[id^=principal_${key}]`);
            let val = principalVo[key];
            if ($dom.length > 0) {
                val = String(val);
                ('gender' === key) && (val = val.replace('M', '男').replace('F', '女'));
                ('isLecturer' === key) && (val = val.replace('1', '是').replace('0', '否'));
                ('isInJob' === key) && (val = val.replace('1', '是').replace('0', '否'));
                $dom.text(val);
            }
        });
        that.after_prin?.();
    },
    after_prin: function () {
    },
    course: function (courseVoList) {
        _draw.course_base_alt(courseVoList);
        _draw.teacher_base(courseVoList);
    },
    course_tr: function (courseVo) {
        return `<tr class="may_recall">
                <td colspan="3">${courseVo.teachTopic}</td>
                <td colspan="3">${courseVo.content}</td>
                <td colspan="2">${courseVo.teacherName}</td>
                <td colspan="2">${courseVo.period}</td>
                <td colspan="2">${courseVo.teachingMethod}</td>
            </tr>`;
    },
    teacher_tr: function (courseVo) {
        return `<tr class="may_recall">
                <td colspan="2">${courseVo.teacherName}</td>
                <td colspan="2">${getOrDefault(courseVo.titleName, '')}</td>
                <td colspan="3">${courseVo.researchDirection}</td>
                <td colspan="2">${courseVo.workUnit}</td>
                <td colspan="2"></td>
            </tr>`;
    },
    cycle: function (cycleVoList) {
        let len = cycleVoList.length
        if (cycleVoList && len > 0) {
            $('#cycle_rowspan').attr('rowspan', len);
            $('#cycle_num').text(len);
            cycleVoList.forEach((cycleVo, index) => {
                if (0 === index) {
                    $('#cycle_first').text(cycleVo.dateStart + '至' + cycleVo.dateEnd);
                } else {
                    $('#cycle_loop_head').after(`<tr><td colspan="8">${cycleVo.dateStart} 至 ${cycleVo.dateEnd}</td></tr>`);
                }
            });
        }
        _prev.fixTable('#other_blank');
    },
    attachment: function (attachmentList) {
    }
}
let _hubei = {
    removeWatermark: function () {
        $('.a4_portrait').css("backgroundImage", "none").css('background', 'white');
    },
    parseTm: function (teachingMethod) {
        if (teachingMethod) return teachingMethod.replace('面授', '理论').replace('实验技术', '实验（技术示范）');
        else return '';
    },
    course_tr: function (courseVo) {
        return `<tr class="may_recall">
                <td colspan="2" class="txt_content">${courseVo.teachTopic}</td>
                <td colspan="2" class="txt_content">${courseVo.content}</td>
                <td colspan="2" class="txt_content">${courseVo.teacherName}</td>
                <td colspan="2" class="txt_content">${courseVo.period}</td>
                <td colspan="2" class="txt_content">${this.parseTm(courseVo.teachingMethod)}</td>
                </tr>`;
    },
    teacher_tr: function (courseVo) {
        return `<!--<tr>-->
                <td colspan="1" class="txt_content">${courseVo.teacherName}</td>
                <td colspan="2" class="txt_content">${courseVo.titleName}</td>
                <td colspan="4" class="txt_content">${courseVo.researchDirection}</td>
                <td colspan="3" class="txt_content">${courseVo.workUnit}</td>
                <!--<td colspan="1"></td>-->
                <!--</tr>-->
                `;
    },
    course_base_alt: function (courseVoList) {
        const that = this;
        that.__course_page('#course_loop_head', courseVoList);
        //
        let tableHeight = $('#course_loop_head').parents('.table_box').height();
        let $courseBlank = $('#course_blank1');
        if ($courseBlank.length > 0) {
            tableHeight -= $courseBlank.outerHeight();
        }
        let sep = courseVoList.length;
        let loop = 0;
        while (tableHeight > _a4TableHeight && loop < 20) {
            $('.may_recall').remove();
            $('#course_loop_head_alt').parents('.a4_portrait').show();
            that.__course_page('#course_loop_head', courseVoList.slice(0, sep));
            that.__course_page('#course_loop_head_alt', courseVoList.slice(sep));
            tableHeight = $('#course_loop_head').parents('.table_box').height();
            sep--;
            loop++;
        }
        if (0 === loop) {
            _prev.fixTable('#course_page table tr:last-child');
        } else {
            $('#course_page table tr:last-child').hide();
            _prev.fixTable('#course_page_alt table tr:last-child');
        }
        _prev.footLabel();
    },
    __course_page: function (selector, courseVoList, hideBlank) {
        const that = this;
        let loop1 = '';
        let len = courseVoList.length;
        let $clh1 = $(selector);
        for (let i = 0; i < len; ++i) {
            let courseVo = courseVoList[i];
            loop1 += that.course_tr(courseVo);
        }
        !hideBlank && (loop1 += '<tr id="course_blank1" class="may_recall"><td colspan="10" class="td_blank"><br/></td></tr>');
        $clh1.after(loop1);
    },
    teacher_base_bef: function (courseVoList) {
        const that = this;
        let bef = [];
        let base = [];
        courseVoList.forEach((courseVo) => {
            if (bef.length < 22) {
                isLilunCourse(courseVo) && bef.push(courseVo);
                isShiyanCourse(courseVo) && base.push(courseVo);;
            } else {
                base.push(courseVo);
            }
        });
        that.teacher_bef(bef);
        that.teacher_base(base);
        _prev.fixTable('#teacher_blank');
        _prev.footLabel();
    },
    teacher_bef: function (courseVoList) {
        const that = this;
        $('#teacher_page_bef').show();
        let str = '';
        let len = courseVoList.length;
        courseVoList.forEach((courseVo, idx) => {
            if (0 === idx) {
                let str = `<td rowspan="4" id="teacher_rowspan_bef" class="txt_title">主要授课教师</td>
                        <td rowspan="2" id="teacher_rowspan_ll_bef" class="txt_title">理论授课教师</td>
                        ${that.teacher_tr(courseVo)}`;
                $('#teacher_loop_ll_head_bef').html(str);
            } else {
                str += `<tr>${that.teacher_tr(courseVo)}</tr>`;
            }
        });
        $('#teacher_loop_ll_head_bef').after(str);
        $('#teacher_rowspan_bef').attr('rowspan', len);
        $('#teacher_rowspan_ll_bef').attr('rowspan', len);
    },
    teacher_base: function (courseVoList) {
        const that = this;
        let total = 2, cnt_ll = 1, cnt_sy = 1;
        let head_ll = false, head_sy = false, has_ll = false, has_sy = false;
        let str_ll = '', str_sy = '';
        let len = courseVoList.length;
        let $lh_ll = $('#teacher_loop_ll_head'), $lh_sy = $('#teacher_loop_sy_head');
        for (let i = 0; i < len; ++i) {
            let courseVo = courseVoList[i];
            if (isLilunCourse(courseVo)) {
                has_ll = true;
                if (!head_ll) {
                    head_ll = true;
                    cnt_ll = 1;
                    let str = `<td rowspan="4" id="teacher_rowspan" class="txt_title">主要授课教师</td>
                        <td rowspan="2" id="teacher_rowspan_ll" class="txt_title">理论授课教师</td>
                        ${that.teacher_tr(courseVo)}`;
                    $lh_ll.html(str);
                } else {
                    cnt_ll++;
                    str_ll += `<tr>${that.teacher_tr(courseVo)}</tr>`;
                }
            } else if (isShiyanCourse(courseVo)) {
                has_sy = true;
                if (!head_sy) {
                    head_sy = true;
                    cnt_sy = 1;
                    let str = `<td rowspan="2" id="teacher_rowspan_sy" class="txt_title">实验授课教师</td>${that.teacher_tr(courseVo)}`;
                    $lh_sy.html(str);
                } else {
                    cnt_sy++;
                    str_sy += `<tr>${that.teacher_tr(courseVo)}</tr>`;
                }
            }
        }
        if (cnt_sy >= 1) {
            str_sy += '<tr id="teacher_blank"><td colspan="10" class="td_blank"></td></tr>'
            cnt_sy += 1;
        }
        if (!has_sy) {
            $lh_sy.html('<td rowspan="1" id="course_rowspan_b" class="txt_title">实验授课教师</td>');
        }
        $lh_ll.after(str_ll);
        $lh_sy.after(str_sy);
        total = cnt_ll + cnt_sy;
        $('#teacher_rowspan').attr('rowspan', total);
        $('#teacher_rowspan_ll').attr('rowspan', cnt_ll);
        $('#teacher_rowspan_sy').attr('rowspan', cnt_sy);
    },
}
setTimeout(function () {
    _prev.bindDownload();
    _prev.catalog();
}, 500);
