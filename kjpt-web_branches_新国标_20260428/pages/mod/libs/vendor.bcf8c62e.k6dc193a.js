let _break = {
    _table_height: 1044.15,
    _txare_lg_height: 978,
    _course_tbh: 961.15,
    _teacher_tbh: 1002.15,
    appendBlankTr: function ($tbody) {
        $tbody.append('<tr class="blank_tr may_recall"><td colspan="12"></td></tr>');
        this.fixBlankTr();
    },
    fixBlankTr: function () {
        let that = this;
        $('.blank_tr').each(function (idx, ele) {
            let $tr = $(this);
            let tableHeight = $tr.parents('table').height();
            let inc = that._table_height - tableHeight;
            if (inc > 0) {
                let h = $tr.height();
                $tr.height(h + inc);
            }
        });
    },
    breakTxarelg: function (_prefix, _name) {
        // _break.breakTxarelg('proj_', 'jobSummary')
        let name = _prefix + _name;
        let $lastp = $(`div.a4_portrait:has(div[name=${name}])`).last();
        let lastid = $lastp.attr('id');
        let lastIdx = $lastp.data('idx');
        let nidx = lastIdx + 1;
        let npid = `${lastid}_${nidx}`;
        let $np = $lastp.clone();
        $np.attr({'id': npid, 'data-idx': nidx});
        $np.find(`div[name=${name}]`).attr({'data-idx': nidx}).text('');
        $np.find('.break_pass').remove();
        $lastp.after($np);
        _docx.footerNum();
        return npid;
    },
    breakCourse: function () {
        let $lastp = $('div[id^=page_course]').last();
        let lastIdx = $lastp.data('idx');
        let nidx = lastIdx + 1;
        let npid = `page_course_${nidx}`;
        let $np = $lastp.clone();
        $np.attr({'id': npid, 'data-idx': nidx});
        $np.find('.may_recall').remove();
        $lastp.after($np);
        _docx.footerNum();
        return npid;
    },
    breakTeacher: function (ptype, pidx) {
        if (_echo.tchr.enums.AND === ptype) return;
        let npid = `page_teacher_${ptype}_${pidx}`;
        let str = `<div class="a4_portrait" id="${npid}" data-idx="${pidx}">
                    <div class="table_box">
                        <table>
                            <thead>
                            ${_echo.default.teacherHeaderTr()}
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>`;
        if (_echo.tchr.enums.LI_LUN === ptype) $('#page_teacher_and').before($(str));
        if (_echo.tchr.enums.SHI_YAN === ptype) $('div[id^=page_teacher_]').last().after($(str));
        _docx.footerNum();
        return npid;
    },
    overflowTxt: function (selector) {
        // _break.overflowTxt('div[name="proj_jobSummary"][data-idx="0"]');
        const divpre = document.querySelector(selector);
        const divRect = divpre.getBoundingClientRect();
        const range = document.createRange();
        const innerContent = [];
        const overflowContent = [];
        function processNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                let text = node.textContent;
                let innerText = '', overflowText = '';
                for (let i = 0; i < text.length; i++) {
                    range.setStart(node, i);
                    range.setEnd(node, i + 1);
                    const charRect = range.getBoundingClientRect();
                    if (charRect.bottom > divRect.bottom /*|| charRect.right > divRect.right*/) {
                        overflowText += text[i];
                    } else {
                        innerText += text[i];
                    }
                }
                if (overflowText) overflowContent.push(document.createTextNode(overflowText));
                if (innerText) innerContent.push(document.createTextNode(innerText));
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                for (let child of node.childNodes) {
                    processNode(child);
                }
            }
        }
        for (let child of divpre.childNodes) {
            processNode(child);
        }
        return {
            'inner': innerContent.map(i => i.data).join('\n'),
            'overflow': overflowContent.map(i => i.data).join('\n'),
        };
    },
    overflowTxt2: function (ele) {
        // let ele = document.querySelector('div[name="proj_jobSummary"]');
        // let txt = overflowTxt(ele);
        // console.info(txt);
        const fullContent = ele.textContent;
        const clientHeight = ele.clientHeight;
        const scrollHeight = ele.scrollHeight;
        if (scrollHeight <= clientHeight) return '';
        const tempPre = document.createElement('div');
        tempPre.style.width = `${ele.clientWidth}px`;
        tempPre.style.height = `${clientHeight}px`;
        tempPre.style.visibility = 'visible'; // hidden
        tempPre.style.position = 'absolute';
        tempPre.style.whiteSpace = 'pre-wrap';
        tempPre.style.overflow = 'hidden';
        tempPre.style.font = window.getComputedStyle(ele).font;
        tempPre.style.lineHeight = window.getComputedStyle(ele).lineHeight;
        tempPre.style.textOverflow = 'ellipsis'; // ellipsis,clip
        tempPre.textContent = fullContent;
        document.body.appendChild(tempPre);
        const visibleContent = tempPre.textContent;
        document.body.removeChild(tempPre);
        return fullContent.slice(visibleContent.length);
    }
};
let _echo = {
    prinSpecIdFromKnowledge: false,
    bind: {
        isComposing: false,
        txarePaste: function () {
            $('div.txt_ipt').off('paste.basic').on('paste.basic', function (e) {
                e.stopPropagation()
                e.preventDefault()
                let text = '', event = (e.originalEvent || e)
                if (event.clipboardData && event.clipboardData.getData) {
                    text = event.clipboardData.getData('text/plain')
                } else if (window.clipboardData && window.clipboardData.getData) {
                    text = window.clipboardData.getData('text')
                }
                if (document.queryCommandSupported('insertText')) {
                    document.execCommand('insertText', false, text)
                } else {
                    document.execCommand('paste', false, text)
                }
            }).on('input.basic', function (e) {
                let divpre = e.target;
                let children = divpre.childNodes;
                for (var i = children.length - 1; i >= 0; i--) {
                    var child = children[i];
                    if (child.nodeType === 1 && child.nodeName === 'BR' && !child.nextSibling && !child.previousSibling) {
                        divpre.removeChild(child);
                    }
                }
            });
        },
        txaresmChange: function () {
            $('.txare_sm').off('input.height').on('input.height', function (event) {
                let $ta = $(this);
                $ta.css('height', 'auto');
                $ta.css('height', `${$ta[0].scrollHeight}px`);
            });
        },
        txarelgChange: function () {
            const that = this;
            $('div.txare_lg').off('input.break').off('compositionstart.break').off('compositionend.break').on('input.break', function (event) {
                let $lg = $(this);
                let name = $lg.attr('name').replace('proj_', '');
                let val = $lg.text();
                let idx = $lg.data('idx');
                if (!that.isComposing) {
                    that.lgnv('proj_', name, val, idx);
                }
            }).bind('compositionstart.break', function () {
                that.isComposing = true;
            }).bind('compositionend.break', function () {
                that.isComposing = false;
                let $lg = $(this);
                let name = $lg.attr('name').replace('proj_', '');
                let val = $lg.text();
                let idx = $lg.data('idx');
                that.lgnv('proj_', name, val, idx);
            });
        },
        lgnv: function (prefix, name, val, idx) {
            if (!val) return;
            let oft = _break.overflowTxt(`div[name="${prefix}${name}"][data-idx="${idx}"]`);
            let inner = oft.inner;
            let overflow = oft.overflow;
            if (overflow) {
                let $cur = $(`div[name=${prefix}${name}][data-idx=${idx}]`);
                let $next = $(`div[name=${prefix}${name}][data-idx=${idx + 1}]`);
                if ($next.length < 1) {
                    let npid = _break.breakTxarelg(prefix, name);
                    $next = $(`#${npid} div[name=${prefix}${name}]`);
                }
                $cur.text(inner);
                $next.text(overflow + $next.text());
                // $next[0].scrollIntoView({behavior: 'smooth', block: 'center'});
            }
        },
        bindPrinArticle: function () {
            $('div[name=prin_article] input[name="articleCode"]').on('keyup', function () {
                let $this = $(this);
                let pcode = $this.val();
                $this.parent('p').attr('data-pcode', pcode);
            });
            $('div[name=prin_article] input[type=checkbox]').on('change', function () {
                let $this = $(this);
                let checked = $this.is(':checked'); // $this[0].checked;
                let val = $this.val();
                $this.siblings('input[type="checkbox"]').prop('checked', !checked);
                let checkY = checked && 'Y' === val;
                let uncheckN = !checked && 'N' === val;
                let yon = (checkY || uncheckN) ? 'Y' : 'N';
                let $p = $this.parent('p');
                $p.attr('data-yon', yon);
                if ('N' === yon) {
                    $this.siblings('input[name="articleCode"]').val('').attr('disabled', 'true').addClass('layui-disabled');
                    $p.attr('data-pcode', '');
                } else {
                    $this.siblings('input[name="articleCode"]').val('').removeAttr('disabled').removeClass('layui-disabled');
                }
            });
        },
    },
    tchr: {
        enums: {
            'LI_LUN': '__LI_LUN__',
            'SHI_YAN': '__SHI_YAN__',
            'AND': '__AND__'
        },
        emptyCourse: function () {
            $('div[id=page_course]').find('.may_recall').remove();
            $('div[id^=page_course_]').remove();
        },
        emptyTeacher: function () {
            $('#page_teacher_and').show();
            $('#page_teacher_and tbody').find('.may_recall').remove();
            $(`div[id^=page_teacher_${this.enums.LI_LUN}], div[id^=page_teacher_${this.enums.SHI_YAN}]`).remove();
        },
        pageFirstTeacher: function ($tr) {
            let mthd = $tr.data('mthd');
            $tr.find('.td_rowspan_all, .td_rowspan_lilun, .td_rowspan_shiyan').remove();
            if (_isZhejiang) {
                if (this.enums.LI_LUN === mthd) $tr.prepend(`<td rowspan="" class="td_rowspan_lilun">理论授课教师</td>`);
                if (this.enums.SHI_YAN === mthd) $tr.prepend(`<td rowspan="" class="td_rowspan_shiyan">实践授课教师</td>`);
            } else {
                if (this.enums.LI_LUN === mthd) $tr.prepend(`<td rowspan="" class="td_rowspan_all">授课教师</td><td rowspan="" class="td_rowspan_lilun">理论授课教师</td>`);
                if (this.enums.SHI_YAN === mthd) $tr.prepend(`<td rowspan="" class="td_rowspan_all">授课教师</td><td rowspan="" class="td_rowspan_shiyan">实验（技术示范）教师</td>`);
            }
            
        },
        isLilun: function (course) {
            return `面授,理论,理论授课,${this.enums.LI_LUN}`.includes(course.teachingMethod);
        },
        isShiyan: function (course) {
            return `实践,实验技术,实验技术示范,${this.enums.SHI_YAN}`.includes(course.teachingMethod);
        },
        isPad: function (course) {
            return `${this.enums.LI_LUN},${this.enums.SHI_YAN}`.includes(course.teachingMethod);
        },
        courseTrim: function (courseArr) {
            let res = courseArr.filter(c => !this.isPad(c));
            if (!res) res = [];
            return res;
        },
        coursePad: function (courseArr) {
            if (!courseArr) return;
            let that = this;
            let an = 0, bn = 0, ta = 2, tb = 3;
            courseArr.forEach(c => {
                if (that.isLilun(c)) ++an;
                if (that.isShiyan(c)) ++bn;
            });
            if (an < ta) {
                courseArr.push(...Array(ta - an).fill({'teachingMethod': that.enums.LI_LUN}));
            }
            if (bn < tb) {
                courseArr.push(...Array(tb - bn).fill({'teachingMethod': that.enums.SHI_YAN}));
            }
        },
        fakeCourseArr: function (a = 10, b = 10) {
            let c = {
                'teacherName': '姓名',
                'workUnit': '海口市第三人民医院',
                'content': '各市、县、自治县及洋浦经济开发区卫生健康委，海南医科大学各附属医院，委直属各单位，委属各社会组织、各有关单位：为加强我省继续医学教育管理，提升继续医学教育质量，根据国家卫生健康委科教司《关于开展2025年度继续医学教育推荐项目征集工作的通知》（国卫科教教育便函〔2024〕164号）和《继续医学教育学分管理办法（试行）》（国卫办科教发〔2024〕20号）相关要求'
            };
            const cll = (idx) => {
                let res = Object.assign({'teachingMethod': '面授'}, c)
                res.teacherName = `${idx}-理论张`;
                return res;
            };
            const csy = (idx) => {
                let res = Object.assign({'teachingMethod': '实验技术示范'}, c)
                res.teacherName = `${idx}-实验张`;
                return res;
            };
            let l = Array(a).fill().map((_, idx) => cll(idx));
            let s = Array(b).fill().map((_, idx) => csy(idx));
            return [...l, ...s];
        },
        pageArr: function () {
            const that = this;
            let h = 0, llh = 0, syh = 0;
            let pArr = [[]], curh = 0, pIdx = 0;
            $('#page_teacher_and tbody tr:not(.blank_tr)').each(function (idx, tr) {
                let $tr = $(tr);
                let mthd = $tr.data('mthd');
                let trh = $tr.outerHeight(true);
                h += trh;
                if (that.enums.LI_LUN === mthd) llh += trh;
                if (that.enums.SHI_YAN === mthd) syh += trh;
                curh += trh;
                if (curh > _break._teacher_tbh) {
                    ++pIdx;
                    curh = trh;
                    pArr[pIdx] = [];
                }
                pArr[pIdx].push($tr);
            });
            return pArr;
        },
        pageType: function (trArr) {
            let arr = _cmn.arrayDistinct(trArr.map($tr => $tr.data('mthd')));
            if (arr.length > 1) return this.enums.AND;
            return arr[0];
        },
    },
    default: {
        course: function (course) {
            if (_isZhejiang) return `<tr class="may_recall" data-id="${getOrDefault(course.courseId, '')}">
                                <td data-before>${getOrDefault(course.teachTopic, '')}</td>
                                <td>${getOrDefault(course.content, '')}</td>
                                <td>${getOrDefault(course.teacherName, '')}</td>
                                <td>${getOrDefault(course.period, '')}</td>
                                <td>${(course.teachingMethod || '').replace(_echo.tchr.enums.LI_LUN, '&emsp;').replace(_echo.tchr.enums.SHI_YAN, '&emsp;')}</td>
                                <td data-after>${getOrDefault(course.innovation, '')}</td>
                            </tr>`;
            return `<tr class="may_recall" data-id="${getOrDefault(course.courseId, '')}">
                <td data-before>${getOrDefault(course.teachTopic, '')}</td>
                <td>${getOrDefault(course.content, '')}</td>
                <td>${getOrDefault(course.teacherName, '')}</td>
                <td>${getOrDefault(course.period, '')}</td>
                <td data-after>${(course.teachingMethod || '').replace(_echo.tchr.enums.LI_LUN, '&emsp;').replace(_echo.tchr.enums.SHI_YAN, '&emsp;')}</td>
            </tr>`;
        },
        firstLilunTeacher: function (course) {
            return `<tr class="may_recall" data-mthd="${_echo.tchr.enums.LI_LUN}">
                <td rowspan="5" class="td_rowspan_all">授课教师</td>
                <td rowspan="2" class="td_rowspan_lilun">理论授课教师</td>
                <td>${getOrDefault(course.teacherName, '&emsp;')}</td>
                <td>${getOrDefault(course.titleName, '')}</td>
                <td>${getOrDefault(course.researchDirection, '')}</td>
                <td>${getOrDefault(course.workUnit, '')}</td>
                <td>${getOrDefault(course.phone, '')}</td>
            </tr>`;
        },
        firstShiyanTeacher: function (course) {
            return `<tr class="may_recall" data-mthd="${_echo.tchr.enums.SHI_YAN}">
                <td rowspan="3" class="td_rowspan_shiyan">实验（技术示范）教师</td>
                <td>${getOrDefault(course.teacherName, '&emsp;')}</td>
                <td>${getOrDefault(course.titleName, '')}</td>
                <td>${getOrDefault(course.researchDirection, '')}</td>
                <td>${getOrDefault(course.workUnit, '')}</td>
                <td>${getOrDefault(course.phone, '')}</td>
            </tr>`;
        },
        teacher: function (course) {
            return `<tr class="may_recall" data-mthd="${_echo.tchr.isLilun(course) ? _echo.tchr.enums.LI_LUN : _echo.tchr.enums.SHI_YAN}">
                <td>${getOrDefault(course.teacherName, '&emsp;')}</td>
                <td>${getOrDefault(course.titleName, '')}</td>
                <td>${getOrDefault(course.researchDirection, '')}</td>
                <td>${getOrDefault(course.workUnit, '')}</td>
                <td>${getOrDefault(course.phone, '')}</td>
            </tr>`;
        },
        teacherHeaderTr: function () {
            return `<tr>
                <td colSpan="2"></td>
                <td><span class="txt_label">姓名</span></td>
                <td><span class="txt_label">专业技术职称</span></td>
                <td><span class="txt_label">主要研究方向</span></td>
                <td><span class="txt_label">所在单位</span></td>
                <td><span class="txt_label">联系方式</span></td>
            </tr>`;
        }
    },
    echoTxarelg: function (prefix, name, val) {
        $(`div.txt_ipt[name=${prefix}${name}]`).html(val).trigger('input');
    },
    echoTxaremd: function (prefix, name, val) {
        $(`div.txt_ipt[name=${prefix}${name}]`).html(val);
    },
    echoTxaresm: function (prefix, name, val) {
        $(`div.txt_ipt[name=${prefix}${name}]`).text(val);
    },
    echoProj: function (proj) {
        let that = this;
        that.bind.txarePaste()
        that.bind.txarelgChange();
        that.bind.txaresmChange();
        let keys = Object.keys(proj);
        if (keys.length > 0) {
            keys.forEach(key => {
                if ('jobSummary,projAnalyze,question,progress,target,innovation'.includes(key)) that.echoTxarelg('proj_', key, proj[key]);
                else {
                    $(`input[name=proj_${key}]`).val(proj[key]).trigger('change');
                    that.echoTxaresm('proj_', key, proj[key]);
                }
            });
        }
        $('input[name=proj_addTime]').val((proj.addTime || '').substring(0, 10));
        $('span[name=proj_holdYear]').text(proj.holdYear || '2025');
    },
    echoPrin: function (prin) {
        let that = this;
        let keys = Object.keys(prin);
        if (keys.length > 0) {
            keys.forEach(key => {
                if ('resume,experience,training,study,article'.includes(key)) that.echoTxaremd('prin_', key, prin[key]);
                else {
                    $(`input[name=prin_${key}]`).val(prin[key]);
                    that.echoTxaresm('prin_', key, prin[key]);
                }
            });
        }
        this.echoPrinArticle(prin.article);
        this.bind.bindPrinArticle();
    },
    echoPrinArticle: function (article) {
        let year = +getOrDefault(getUrlParamByName('hold_year'), '2025');
        let defarr = Array(3).fill(0).map((_, idx) => `${year - 1 - idx},Y,`);
        let def = defarr.join('#'); // '2024,Y,#2023,Y,#2022,Y,'
        let arr = (article ?? def).split('#');
        let str = arr.map((item, idx) => {
            let ar = item.split(',');
            let year = ar[0];
            let yon = ar[1];
            let pcode = ar[2];
            let isY = 'Y' === yon;
            let isN = 'N' === yon;
            return `<p data-year="${year}" data-yon="${yon}" data-pcode="${pcode}">
                <span>${year}</span>
                <span>年国家级、省级继续医学教育项目执行情况，</span>
                <span>是</span>
                <input type="checkbox" lay-skin="primary" value="Y" title="是" ${isY ? 'checked' : ''}>
                <span>否</span>
                <input type="checkbox" lay-skin="primary" value="N" title="否" ${isN ? 'checked' : ''}> 
                <span>。项目编号：</span>
                <input name="articleCode" value="${pcode}" class="${isN ? 'layui-disabled' : ''}" ${isN ? 'disabled' : ''}/>
            </p>`;
        }).join('');
        $('div[name="prin_article"]').html(str);
    },
    echoCycle: function (cycleArr) {
        $('.cycle_box').html(cycleArr.map((cycle, idx) => `<p>第${idx + 1}批次：${cycle.dateStart || ''} 至 ${cycle.dateEnd || ''}</p>`).join(''));
        $('input[name=proj_cycleCnt]').val(cycleArr.length);
    },
    echoCourse11: function (courseArr) {
        let that = this;
        that.tchr.emptyCourse();
        let $tbody = $('#page_course tbody');
        let str;
        courseArr.forEach((course, idx) => {
            str += that.default.course(course, idx);
        });
        $tbody.append(str);
        _break.appendBlankTr($tbody);
    },
    echoCourse: function (courseArr, a, b) {
        let that = this;
        if (a + b > 10) courseArr = that.tchr.fakeCourseArr(a, b);
        that.tchr.emptyCourse();
        let $tbody = $('#page_course tbody');
        $tbody.empty();
        let str;
        courseArr.forEach((course, idx) => {
            // course.content = `${idx}-${course.content}`;
            str += that.default.course(course, idx);
        });
        $tbody.append(str);
        let needMove = false, $curTbody, curHeight = 0;
        $('#page_course tbody tr').each(function (idx, tr) {
            let $tr = $(tr);
            let gt = curHeight + $tr.outerHeight(true) > _break._course_tbh;
            if (!$curTbody && gt) {
                needMove = true;
            }
            if (needMove) {
                if (!$curTbody || gt) {
                    let npid = _break.breakCourse();
                    $curTbody = $(`#${npid} tbody`);
                    curHeight = 0;
                }
                $curTbody.append($tr);
            }
            curHeight += $tr.outerHeight(true);
        });
        if (curHeight < _break._course_tbh) {
            _break.appendBlankTr($curTbody || $tbody);
        }
    },
    echoTeacher11: function (courseArr) {
        let that = this;
        that.tchr.emptyTeacher();
        let $tbody = $('#page_teacher_and tbody');
        let a = '', b = '', str, an = 0, bn = 0;
        courseArr.forEach((course, idx) => {
            // course.teacherName = `${idx}-${course.teacherName}`;
            if (that.tchr.isLilun(course)) {
                ++an;
                if ('' === a) a += that.default.firstLilunTeacher(course);
                else a += that.default.teacher(course);
            }
            if (that.tchr.isShiyan(course)) {
                ++bn;
                if ('' === b) b += that.default.firstShiyanTeacher(course);
                else b += that.default.teacher(course);
            }
        });
        str = a + b;
        $tbody.append(str);
        if (0 === an) {
            that.tchr.pageFirstTeacher($('.td_rowspan_shiyan').parent('tr'));
        }
        $('#page_teacher_and .td_rowspan_all').attr('rowspan', an + bn);
        $('#page_teacher_and .td_rowspan_lilun').attr('rowspan', an);
        $('#page_teacher_and .td_rowspan_shiyan').attr('rowspan', bn);
    },
    echoTeacher: function (courseArr, a, b) {
        const that = this;
        if (a + b > 10) courseArr = that.tchr.fakeCourseArr(a, b);
        that.echoTeacher11(courseArr);
        let pageArr = that.tchr.pageArr();
        let pn = pageArr.length;
        let $andtbody = $('#page_teacher_and tbody');
        if (pn < 2) {
            _break.appendBlankTr($andtbody);
            return;
        }
        let andEmpty = true;
        for (let pidx = 0; pidx < pn; ++pidx) {
            let trArr = pageArr[pidx];
            let len = trArr.length;
            let ptype = that.tchr.pageType(trArr);
            if (that.tchr.enums.AND === ptype) {
                andEmpty = false;
                let $tr0 = trArr[0];
                that.tchr.pageFirstTeacher($tr0);
                let json = _.groupBy(trArr, tr => tr.data('mthd')); // Object.groupBy(trArr, tr => tr.data('mthd'));
                let an = json[that.tchr.enums.LI_LUN].length;
                let bn = json[that.tchr.enums.SHI_YAN].length;
                $('#page_teacher_and').data('idx', pidx);
                $('#page_teacher_and .td_rowspan_all').attr('rowspan', an + bn);
                $('#page_teacher_and .td_rowspan_lilun').attr('rowspan', an);
                $('#page_teacher_and .td_rowspan_shiyan').attr('rowspan', bn);
                if(pidx === (pn - 1)) _break.appendBlankTr($andtbody);
            } else {
                let npid = _break.breakTeacher(ptype, pidx);
                let $ntbody = $(`#${npid} tbody`);
                for (let idx = 0; idx < len; ++idx) {
                    let $tr = trArr[idx];
                    $tr.find('.td_rowspan_all, .td_rowspan_lilun, .td_rowspan_shiyan').remove();
                    if (0 === idx) that.tchr.pageFirstTeacher($tr);
                    $ntbody.append($tr);
                }
                $(`#${npid} .td_rowspan_all`).attr('rowspan', len);
                $(`#${npid} .td_rowspan_lilun`).attr('rowspan', len);
                $(`#${npid} .td_rowspan_shiyan`).attr('rowspan', len);
                if (pidx === (pn - 1)) _break.appendBlankTr($ntbody);
            }
        }
        if (andEmpty) $('#page_teacher_and').hide();
    },
    echoSign: function (sign1, sign2, signDate) {
        if (sign1) {
            $('.sign_pad img').attr('src', sign1).css('visibility', 'visible');
            $('input[name=prin_sign1]').val(sign1);
        }
        if (sign2) {
            $('.td_sign img').attr('src', sign2);
            $('input[name=prin_sign2]').val(sign2);
        }
        if (signDate) {
            $('#sign_date').text(moment(signDate).format('YYYY 年 MM 月 DD 日'));
            $('input[name=prin_signDate]').val(signDate);
        }
    },
    fixedInfo: function (unitName, addTime, holdYear) {
        $('input[name=proj_addTime]').val((addTime || '').substring(0, 10));
        $('input[name=proj_unitName]').val(unitName);
        $('div.txare_sm[name=prin_workUnit]').text(unitName).trigger('input');
        $('div.txare_sm[name=proj_applyUnit]').text(unitName).trigger('input');
        $('span[name=proj_holdYear]').text(holdYear || '2025');
    },
    echoOpinion: function (opinionVoList, finalStatus) {},
};