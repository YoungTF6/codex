//

layui.define(['jquery', 'form', 'layer', 'laydate', 'table'], function (exports) {
    let $ = layui.jquery;
    let form = layui.form;
    let layer = layui.layer;
    let laydate = layui.laydate;
    let table = layui.table;
    let userStandardkindId = localStorage.getItem("standardkind-id");
    const isUserGuangdong = userStandardkindId === "289bf0ca-52cb-4b19-b737-9bd200a69ce1";
    const isUserZheJiang = userStandardkindId === "190c480d-d43c-450b-8472-a6fd00a6729d";
    const isUserHeNan = userStandardkindId === "a6280900-a9c2-11ec-84d6-fa163e9b64fb";
    const isUserNeimeng = userStandardkindId === "08e44437-5789-44e0-8ff8-9ecb00a6348a";
	const _isGaungxi = userStandardkindId === "4a6d91fb-8ba4-4560-a801-9c6f00e6d999";

    function loadDictionary(selector, kindId) {
        getDictOption(kindId).then(response => {
            let jsonRes = response.data;
            if (jsonRes.success) {
                jsonRes.data.forEach((dict, index) => {
                    $(selector).append(new Option(dict.dictName, dict.dictId));
                    // $(selector).append("<option value=\"" + res.data[i].knowledgeId + "\">" + res.data[i].knowledgeName + "</option>");
                });
            }
        }).catch(error => {
            layer.msg('error:加载字典kindId=' + kindId);
        }).finally(() => {
            layui.form.render("select");
        });
    }

    // unit dept title spec
    function renderTreeSel(selector, treeData, extendConfig) {
        let config = {
            el: selector,
            tips: '全部',
            autoRow: false,
            radio: true,
            filterable: true,
            direction: 'auto',
            size: 'small',
            clickClose: false,
            height: '300px',
            data: treeData,
            tree: {
                show: true,
                clickExpand: false,
                clickCheck: true,
                showFolderIcon: true,
                showLine: true,
                indent: 20,
                // expandedKeys: true,
                simple: true,
                strict: false
            },
            theme: {
                color: '#5FB878'
            },
            model: {
                type: 'fixed',
                icon: 'hidden',
                label: {
                    type: 'text'
                }
            },
            iconfont: {
                // select: 'layui-icon layui-icon-chart',
                // unselect: 'layui-icon-ok-circle',
                // half: 'layui-icon layui-icon-table',
                // parent: 'layui-icon layui-icon-survey'
                // select: '',
                // unselect: '',
                // half: '',
                // parent: ''
            }
        };
        extendConfig ? $.extend(true, config, extendConfig) : '';
        return xmSelect.render(config);
    }

    let tool = {
        // [取值]功能为 layui 2.5.5 开始新增
        getFormVal: function (filter, itemForm) {
            let ELEM = '.layui-form';
            itemForm = itemForm || $(ELEM + '[lay-filter="' + filter + '"]').eq(0);

            var nameIndex = {} //数组 name 索引
                , field = {}
                , fieldElem = itemForm.find('input,select,textarea') //获取所有表单域

            layui.each(fieldElem, function (_, item) {
                var othis = $(this)
                    , init_name; // 初始 name

                item.name = (item.name || '').replace(/^\s*|\s*&/, '');
                if (!item.name) return;

                // 用于支持数组 name
                if (/^.*\[\]$/.test(item.name)) {
                    var key = item.name.match(/^(.*)\[\]$/g)[0];
                    nameIndex[key] = nameIndex[key] | 0;
                    init_name = item.name.replace(/^(.*)\[\]$/, '$1[' + (nameIndex[key]++) + ']');
                }

                if (/^checkbox|radio$/.test(item.type) && !item.checked) return;  //复选框和单选框未选中，不记录字段
                field[init_name || item.name] = item.value;
            });

            return field;
        },
        okMsg: function (msg) {
            layer.msg(msg, { icon: 1, time: 1300 });
        },
        failMsg: function (msg) {
            layer.msg(msg, { icon: 0, time: 2000 });
        },
        errorMsg: function (msg) {
            layer.msg(msg, { icon: 5, time: 2300 });
        },
        loading: function () {
            return layer.load(1, {
                shade: [0.2, '#fff'],
                time: 10 * 1000
            });
        },
        // 最近六年
        renderCmeYear: function (selector) {
            // 举办年度
            let curDate = new Date();
            let curYear = curDate.getFullYear();
            let endYear = curYear + 1;
            for (let i = endYear; i > endYear - 6; i--) {
                $(selector).append(new Option(i, i, i === curYear, i === curYear));
            }
            form.render('select');
        },
        renderCheckType: function (selector) {
            // [com_dictionary]中[kind_id=8]
            loadDictionary(selector, 8);
        },
        renderDuty: function (selector) {
            // 职务,[com_dictionary]中[kind_id=10]
            loadDictionary(selector, 10);
        },
        renderEducation: function (selector) {
            // 学历:[com_dictionary]中[kind_id=2]
            loadDictionary(selector, 2);
        },
        renderScoreLevel: function (selector, viewMode, assignScoreLevels) {
            // cme_com_score_level
            getScoreLevelOption(viewMode).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    jsonRes.data.forEach((scoreLevel, index) => {
                        $(selector).append(new Option(scoreLevel.scoreLevelName, scoreLevel.scoreLevelId))
                    });
                    assignScoreLevels && assignScoreLevels(jsonRes.data);
                }
            }).catch(error => {
                layer.msg('error:加载学分级别');
            }).finally(() => {
                layui.form.render("select");
            });
        },
        renderScoreLevelDept: function (selector, viewMode) {
            // cme_com_score_level
            getScoreLevelDeptOption(viewMode).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    jsonRes.data.forEach((scoreLevel, index) => {
                        $(selector).append(new Option(scoreLevel.scoreLevelName, scoreLevel.scoreLevelId))
                    });
                }
            }).catch(error => {
                layer.msg('error:加载学分级别');
            }).finally(() => {
                layui.form.render("select");
            });
        },
        render2ndKnowledge: function (selector, isHubei) {
            let action = isHubei ? getKnowledgeOptionHubei : getKnowledgeOption;

            // com_knowledge
            action(2, '').then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    jsonRes.data.forEach((knowledge, index) => {
                        let op = new Option(knowledge.knowledgeName, knowledge.knowledgeId);
                        op.setAttribute('kcode', knowledge.knowledgeCode);
                        $(selector).append(op);
                    });
                }
            }).catch(error => {
                layer.msg('error:加载二级学科');
            }).finally(() => {
                layui.form.render("select");
            });
        },
        render3rdKnowledge: function (knowledgeTwoId, selector, isHubei) {
            let action = isHubei ? getKnowledgeOptionHubei : getKnowledgeOption;

            // [com_knowledge]
            // $(selector).find("option").remove();
            $(selector).empty();
            $(selector).append(new Option());

            if (knowledgeTwoId) {
                action(3, knowledgeTwoId).then(response => {
                    let jsonRes = response.data;
                    if (jsonRes.success) {
                        jsonRes.data.forEach((knowledge, index) => {
                            let op = new Option(knowledge.knowledgeName, knowledge.knowledgeId);
                            op.setAttribute('kcode', knowledge.knowledgeCode);
                            $(selector).append(op);
                        });
                    }
                }).catch(error => {
                    layer.msg("error:加载三级学科");
                }).finally(() => {
                    layui.form.render("select");
                });
            }
        },
        renderHoldType: function (selector, viewMode) {
            // cme_hold_type
            getHoldTypeOption(viewMode).then(response => {
                let jsonRes = response.data;
                if (jsonRes.success) {
                    jsonRes.data.forEach((holdType, index) => {
                        $(selector).append(new Option(holdType.holdTypeName, holdType.holdTypeId));
                    });
                }
            }).catch(error => {
                layer.msg('error:加载举办方式');
            }).finally(() => {
                layui.form.render("select");
            });
        },
        renderTitleTreeSelector: function (selector, treeData, extendConfig) {
            let config = {
                prop: {
                    name: 'titleName',
                    value: 'titleId',
                }
            };
            extendConfig ? $.extend(true, config, extendConfig) : '';
            return renderTreeSel(selector, treeData, config);
        },
        renderSpecTreeSelector: function (selector, treeData, extendConfig) {
            let config = {
                prop: {
                    name: 'personSpecName',
                    value: 'personSpecId',
                }
            };
            extendConfig ? $.extend(true, config, extendConfig) : '';
            return renderTreeSel(selector, treeData, config);
        },
        // ===============
        //传入元素数组，全部去掉style树形
        removeAttr: function (elemArr, attrStr = "style") {
            for (const obj of elemArr) {
                obj.removeAttribute(attrStr);
            }
        },
        isEmpty: function (data) {
            if (data !== "undefined" && data != null && data !== "") {
                return false;
            }
            return true;
        },
        //计算屏幕高度减去给定元素高度
        getTableHeight: function (className) {
            let allHeight = document.documentElement.clientHeight;
            let otherHeight = $(`.${className}`)[0].offsetHeight
            return allHeight - otherHeight - 90;
        },
        //计算两个元素的高度差
        getWindowHeight: function (className1, className2) {
            let allHeight = $(`.${className1}`)[0].parentElement.clientHeight;
            let otherHeight = $(`.${className2}`)[0].offsetHeight;
            return allHeight - otherHeight - 50;
        },
        //为select赋值option
        appendSelect: function (elem, data, param1, param2) {
            $(elem).html('<option value="">请选择</option>');
            for (const obj of data) {
                $(elem).append($(`<option value="${obj[param1]}">${obj[param2]}</option>`));
            }
            form.render('select');
        },
        //对象数组获取他某个属性组成新的数组
        getOneAttrArr: function (data, attrStr) {
            let tempArr = [];
            for (const obj of data) {
                tempArr.push(obj[attrStr]);
            }
            return tempArr;
        },
        //原生，通过classname获取子节点
        getElemByClass: function (elem, className) {
            for (const obj of elem.children) {
                if (obj.classList.contains(className)) {
                    return obj;
                }
            }
            return null;
        },
        //通过数组中属性和值筛选数组，并返回，如果有传返回属性值，就返回该属性的数组
        getAttrArrByAttr: function (data, attr, value, returnAttr) {
            let tempArr = [];
            for (const obj of data) {
                if (obj[attr] == value) {
                    if (this.isEmpty(returnAttr)) {
                        tempArr.push(obj);
                    } else {
                        tempArr.push(obj[returnAttr]);
                    }
                }
            }
            return tempArr;
        },
        //是否是该class区域
        isTargetArea: function (elem, targetElem, index = 99) {
            let tempIndex = 0;
            while (true) {
                if (!elem) {
                    break;
                }
                if (elem.nodeName == "HTML" || elem.nodeName == "BODY" || tempIndex == index) {
                    break;
                }
                if (elem === targetElem) {
                    return true;
                }
                tempIndex++;
                elem = elem.parentNode;
            }
            return false;
        },
        //获取请求参数
        getParamFromUrl: function (paramName) {
            const urlStr = location.search;
            if (urlStr.indexOf(paramName) < 0 || urlStr.indexOf("?") < 0) return;
            let paramKV = urlStr.substring(1).split("&");
            for (let i = 0; i < paramKV.length; i++) {
                if (paramKV[i].indexOf(paramName) >= 0) {
                    return decodeURI(paramKV[i].split("=")[1]);
                }
            }
        },
        //通过pose请求下载文件
        exportExcelPost: function (url, params, filename = 'table.xlsx', backFunc = () => { }) {
            axios({
                method: 'post',
                url: url,
                data: params,
                responseType: 'blob',
                headers: {
                    "Authorization": localStorage.getItem('token'),
                    "KJPT-USER-ID": localStorage.getItem('user-id'),
                }
            }).then(res => {
                const blob = new Blob([res.data]);
                let href = window.URL.createObjectURL(blob);
                let downloadElement = document.createElement("a");
                downloadElement.href = href;
                downloadElement.download = decodeURIComponent(filename);
                document.body.appendChild(downloadElement);
                downloadElement.click();

                document.body.removeChild(downloadElement);
                window.URL.revokeObjectURL(href);
            }).catch(error => {
                layer.msg("导出失败");
            }).finally(() => {
                // 无论成功失败都会执行的回调
                backFunc();
            });
        },
        //通过pose请求下载文件
        exportExcelGet: function (url, params, filename = 'table.xlsx', backFunc = () => { }) {
            axios({
                method: 'get',
                url: url,
                params: params,
                responseType: 'blob',
                headers: {
                    "Authorization": localStorage.getItem('token'),
                    "KJPT-USER-ID": localStorage.getItem('user-id'),
                }
            }).then(res => {
                const blob = new Blob([res.data]);
                let href = window.URL.createObjectURL(blob);
                let downloadElement = document.createElement("a");
                downloadElement.href = href;
                downloadElement.download = decodeURIComponent(filename);
                document.body.appendChild(downloadElement);
                downloadElement.click();

                document.body.removeChild(downloadElement);
                window.URL.revokeObjectURL(href);
            }).catch(error => {
                layer.msg("导出失败");
            }).finally(() => {
                // 无论成功失败都会执行的回调
                backFunc();
            });
        },
        exchangeDate: function (timer) {
            var date = new Date(timer);
            var Y = date.getFullYear() + '-';
            var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
            var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';

            var h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':';
            var m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':';
            var s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
            var strDate = Y + M + D + h + m + s;
            return strDate;
        },
        transferGetElem: function (elem, type) {
            //type类型，0是左侧，1是右侧，2是中间
            let tempEle = elem.getElementsByTagName("div")[0];
            if (type == 0) {
                return tempEle.getElementsByClassName("layui-transfer-box")[0];
            }
            if (type == 1) {
                return tempEle.getElementsByClassName("layui-transfer-box")[1];
            }
            if (type == 2) {
                return tempEle.getElementsByClassName("layui-transfer-active")[1];
            }
        },
        transferBindMsg: function (els, msg) {
            for (let i = 0; i < els.length; i++) {
                let tempEle = els[i];
                if (tempEle.onmouseenter != null) {
                    continue;
                }
                let inputEles = tempEle.getElementsByTagName("input");
                if (inputEles.length <= 0) {
                    continue;
                }
                let tid = inputEles[0].value;
                let tmsg = msg[tid];
                let tempMsg = `<span style="color:#000000;">${tmsg}</span>`;
                let tipIndex;
                tempEle.onmouseenter = function () {
                    tipIndex = layer.tips(tempMsg, tempEle, { tips: [1, '#d3d3d3'], time: 0 });
                }
                tempEle.onmouseleave = function () {
                    layer.close(tipIndex);
                }
            }
        },
        transferLeftTipBind: function (elem, msgObj) {
            let tempLeftEl = this.transferGetElem(elem, 0);
            let liEles = tempLeftEl.getElementsByClassName('layui-transfer-data')[0].children;
            this.transferBindMsg(liEles, msgObj);
        },
        transferRightTipBind: function (elem, msgObj) {
            let tempLeftEl = this.transferGetElem(elem, 1);
            let liEles = tempLeftEl.getElementsByClassName('layui-transfer-data')[0].children;
            this.transferBindMsg(liEles, msgObj);
        },
        transferAllTipBind: function (elem, msgObj) {
            this.transferLeftTipBind(elem, msgObj);
            this.transferRightTipBind(elem, msgObj);
        },
        transferChangeTitle: function (elem, type, num, transfer) {
            let tempLeftEl = this.transferGetElem(elem, 0);
            let tempRightEl = this.transferGetElem(elem, 1);
            let rightHeaderEl = tempRightEl.getElementsByClassName('layui-transfer-header')[0];
            let rightFaEle = rightHeaderEl.getElementsByClassName('layui-form-checkbox')[0];
            let rightSpan = rightFaEle.getElementsByTagName('span')[0];
            let rightInput = rightHeaderEl.getElementsByTagName('input')[0];
            let rightLen = transfer.getData('demo1').length;
            rightSpan.innerText = `已选人员(${rightLen})`;
            rightInput.title = `已选人员(${rightLen})`;

            let leftHeaderEl = tempLeftEl.getElementsByClassName('layui-transfer-header')[0];
            let leftEles = leftHeaderEl.getElementsByClassName('layui-form-checkbox')[0].getElementsByTagName('span')[0];
            let leftInput = leftHeaderEl.getElementsByTagName('input')[0];
            let leftText = leftEles.innerText;
            let leftNum = parseInt(leftText.split("(")[1].split(")")[0]);
            if (type == 0) {
                leftNum -= num;
            } else {
                leftNum += num;
            }
            leftEles.innerText = `候选人员(${leftNum})`;
            leftInput.title = `候选人员(${leftNum})`;
        },
        imgChangeBind: function (elem) {
            let that = this;
            $(document).on('click', elem, function () {
                that.openViewImg(this.src);
            })
        },
        openViewImg: function (imgUrl) {
            let imgContent = `
                    <div class="flex-all-box">
                        <img class="single-show-img" angle="0" src="${imgUrl}">
                    </div>`;
            layer.open({
                type: 1,
                title: false,
                closeBtn: 0,
                area: ['100%', '100%'],
                shadeClose: true,
                scrollbar: false,//不现实滚动条
                content: imgContent,
                btn: ["旋转", "放大", "缩小", "关闭"],
                btnAlign: "c",
                yes: function () {
                    let tempAngle = $(".single-show-img").attr("angle");
                    tempAngle = parseInt(tempAngle);
                    tempAngle += 90;
                    $(".single-show-img").attr("angle", tempAngle);
                    let cssObj = { "transform": `rotate(${tempAngle}deg)` };
                    $(".single-show-img").css(cssObj);
                    //旋转可能导致部分不可见
                    return false;
                },
                btn2: function () {
                    let imgEl = $(".single-show-img")[0];
                    // let maxWidth = imgEl.parentElement.clientWidth;
                    let imgWidth = imgEl.height;
                    imgWidth += 40;
                    // if (maxWidth < imgWidth) {
                    // imgWidth = maxWidth;
                    // }
                    let cssObj = { "height": `${imgWidth}px`, "max-width": "none" };
                    $(".single-show-img").css(cssObj);
                    $(imgEl.parentElement).css("overflow", "auto");
                    return false;
                },
                btn3: function () {
                    let imgEl = $(".single-show-img")[0];
                    let imgWidth = imgEl.height;
                    if (imgWidth > 50) {
                        imgWidth -= 40;
                    }
                    $(".single-show-img").css({ "height": `${imgWidth}px`, "max-width": "none" });
                    return false;
                },
                btn4: function (index) {
                    layer.close(index);
                }
            });
        },
        //执行情况反馈构建
        createFeedbackTab: function (datas, indexNum = 1, configVal1, configVal2) {
            let tabArr = [1, 2, 3, 4, 5, 7]
            if (datas.hasOwnProperty(configVal1) && !tool.isEmpty(datas[configVal1])) {
                tabArr = datas[configVal1].split(",");
            }
            const tabObj = {
                1: "js-project-tab",
                2: "js-project-image",
                3: "js-project-people",
                4: "js-project-textbook",
                5: "js-inspect",
                6: "js-download",
                7: "js-project-process",
                8: "js-funds",
            };
            let tabHtml = "";
            let tableHtml = '<table class="layui-table" id="downloadFile" lay-filter="download-file" style="width: 80%;margin: auto;">';
            for (let dataIndex of tabArr) {
                if (tabObj.hasOwnProperty(dataIndex)) {
                    const tempClass = dataIndex == 1 ? "layui-this" : "";
                    const shakeClass = dataIndex == 5 ? "tab-inspect" : "";
                    if (dataIndex == 5 && datas[configVal2] != "1") {
                        tabHtml += `<li class="tab-default ${tempClass} ${shakeClass}" data-type="${tabObj[dataIndex]}">审核结果</li>`;
                    } else {
                        if (tabObj[dataIndex] == 'js-download') {
                            tabHtml += `<li class="tab-default ${tempClass} ${shakeClass}" style="width:90px;" data-type="${tabObj[dataIndex]}">相关文件下载</li>`;
                        } else {
                            let tabTitle = `第${indexNum}页`;
                            if (isUserHeNan) {
                                if (dataIndex == 1) {
                                    tabTitle = '1项目总结';
                                } else if (dataIndex == 2) {
                                    tabTitle = '2材料上传';
                                } else if (dataIndex == 3) {
                                    tabTitle = '3学分明细';
                                } else if (dataIndex == 4) {
                                    tabTitle = '4教材明细';
                                }
                            }
                            tabHtml += `<li class="tab-default ${tempClass} ${shakeClass}" data-type="${tabObj[dataIndex]}">${tabTitle}</li>`;
                            if (tabObj[dataIndex] == 'js-project-image') {
                                tableHtml += `<tr><td>第${indexNum}页</td><td></td><td><a style="color:#27b1a2;" href="#" onclick="onclickDownload('${tabObj[dataIndex]}')">下载</a></td></tr>`;
                            } else if (tabObj[dataIndex] == 'js-project-tab' || tabObj[dataIndex] == 'js-project-people' || tabObj[dataIndex] == 'js-project-textbook') {
                                tableHtml += `<tr><td>第${indexNum}页</td><td><a style="color:#27b1a2;" href="#" onclick="onclickView('${tabObj[dataIndex]}')">预览</a></td><td><a style="color:#27b1a2;" href="#" onclick="onclickDownload('${tabObj[dataIndex]}')">下载</a></td></tr>`;
                            } else if (tabObj[dataIndex] == 'js-project-process') {
                                tableHtml += `<tr><td>第${indexNum}页</td><td></td><td><a style="color:#27b1a2;" href="#" onclick="onclickDownload('${tabObj[dataIndex]}')">下载</a></td></tr>`;
                            }

                        }
                    }
                }
                indexNum++;
            }
            $('.js-tabs').html(tabHtml);
            tableHtml += '<tr><td>全部文件</td><td></td><td><a style="color:#27b1a2;" href="#" onclick="onclickDownload(1)">下载</a></td></tr></table>';
            document.getElementById('download-file').innerHTML = tableHtml;
            return tabArr;
        },
        createFeedbackAnalyse: function (datas, reqInfoObj, configVal) {
            let isShow = "1";
            if (datas.hasOwnProperty(configVal)) {
                isShow = this.isEmpty(datas[configVal]) ? "1" : datas[configVal];
            }
            if (isShow != 1 && isShow != "1") return;
            let tempHtml = "";
            for (let tempObj of reqInfoObj) {
                let tempCla = `js-${tempObj.name}`;
                let requireHtml = tempObj.require === 1 ? `<font color="red">*&nbsp;</font>` : "";
                tempHtml += `<div class="layui-form-item1">
                    <div class="layui-inline-flex">
                        <label class="layui-form-label">
                            ${requireHtml}${tempObj.value}
                        </label>
                        <div class="layui-input-block">
                            <textarea name="${tempObj.name}" class="layui-textarea ${tempCla}"
                                autocomplete="off" maxlength="4000"></textarea>
                        </div>
                    </div>
                </div>`;
            }
            $("#formProject").html(tempHtml);
        },
        createFeedbackImgUp: function (datas, fileUpObj, configVal, type = 0) {
            if (datas.hasOwnProperty(configVal) && !tool.isEmpty(datas[configVal])) {
                fileUpObj = JSON.parse(datas[configVal]);
            }
            let upHtml = "";
            for (let obj of fileUpObj) {
                let tempAhtml = ``;
                if (type == 0) {
                    tempAhtml = `<div class="js-upload-btn-box">
                        <a class="layui-btn layui-btn-sm js-upload-btn" data-type="${obj.fileType}" f-type="${obj.type}">上传</a>
                    </div>`;
                }
                upHtml += `<div class="meeting-notice">
                    <span class="file-title">${obj.fileName}</span>
                    ${tempAhtml}
                    <ul class="js-feedback${obj.fileType}"></ul>
                </div>`;
            }
            $(".js-project-image").append(upHtml);
            return fileUpObj;
        },
        renderFeedbackTemplateFiles: function (data) {
            let fileList = JSON.parse(data);
            let html = '';
            fileList.forEach(function (file) {
                html += `<a href="${file.fileUrl}" download="${file.fileName}" style="margin-left: 10px; color: #1E9FFF; text-decoration: underline;">${file.fileName}</a>`;
            });
            $('#feedback_template_files').html(html);
        },

        createApplyImgUp: function (datas, fileUpObj, configVal, otherButton, type = 0) {
            if (datas.hasOwnProperty(configVal) && !tool.isEmpty(datas[configVal])) {
                fileUpObj = JSON.parse(datas[configVal]);
            }
            let upHtml = "";
            for (let obj of fileUpObj) {
                let tempAhtml = ``;
                if (type == 0) {
                    if (otherButton == 'HNdownloadTemplate' && obj.fileType == 2) {
                        tempAhtml = `<div class="js-upload-btn-box">
                                        <a class="layui-btn layui-btn-sm" id="foreignExperts">填报说明</a>
                                        <a class="layui-btn layui-btn-sm downloadTemplate" templateName="琼继教办函" templateUrl="/file/HaiNanApplyTemplate.docx">填报模板</a>
                                        <a class="layui-btn layui-btn-sm js-upload-btn" data-type="${obj.fileType}">上传</a>
                                    </div>`;
                    } else if (otherButton == 'GSdownloadTemplate' && obj.fileType == 3) {
                        // let url  = decodeURIComponent('/file/继教项目办班承诺书.docx');
                        // let url  = '/file/继教项目办班承诺书.docx';
                        let url = '/file/GanSuApplyTemplateProject.docx';
                        tempAhtml = `<div class="js-upload-btn-box">
                                            <a class="layui-btn layui-btn-sm downloadTemplate" templateName="继教项目办班承诺书" templateUrl="${url}">填报模板</a>
                                            <a class="layui-btn layui-btn-sm js-upload-btn" data-type="${obj.fileType}">上传</a>
                                        </div>`;
                    } else if (otherButton == 'GSdownloadTemplate' && obj.fileType == 4) {
                        tempAhtml = `<div class="js-upload-btn-box">
                                            <div style="color: red; padding-bottom:5px;">请将所有教师承诺书合并为一个PDF文件上传</div>
                                            <a class="layui-btn layui-btn-sm downloadTemplate" templateName="授课教师承诺书" templateUrl="/file/GanSuApplyTemplateTeacher.docx">填报模板</a>
                                            <a class="layui-btn layui-btn-sm js-upload-btn" data-type="${obj.fileType}">上传</a>
                                        </div>`;
                    } else if (otherButton == 'GDdownloadTemplate' && obj.fileType == 3) {
                        let url = '/file/GanSuApplyTemplateProject.docx';
                        tempAhtml = `<div class="js-upload-btn-box">
                                            <a class="layui-btn layui-btn-sm downloadTemplate" templateName="教师变更说明" templateUrl="${url}">下载模板</a>
                                            <a class="layui-btn layui-btn-sm js-upload-btn" data-type="${obj.fileType}">上传</a>
                                        </div>`;
                    } else {
                        tempAhtml = `<div class="js-upload-btn-box">
                                        <a class="layui-btn layui-btn-sm js-upload-btn" data-type="${obj.fileType}">上传</a>
                                    </div>`;
                    }
                }
                upHtml += `<div class="meeting-notice">
                    <span class="file-title">${obj.fileName}</span>
                    ${tempAhtml}
                    <ul class="js-feedback${obj.fileType}"></ul>
                </div>`;

            }
            $(".js-project-image").append(upHtml);
            return fileUpObj;
        },
        viewFeedbackFlowHtml: function (downId) {
            layer.open({
                type: 2,
                title: '',
                content: `projectProgress/projFeedbackProgress.html?downId=${downId}`,
                area: ['560px', '380px'],
            })
        },
        viewGroupFeedbackFlowHtml: function (downId) {
            layer.open({
                type: 2,
                title: '',
                content: `projectProgress/projGroupFeedbackProgress.html?downId=${downId}`,
                area: ['560px', '380px'],
            })
        },
        createFeedbackInspectTab: function (flowArr, event, tempUnit, configval, configval2, isBack = false) {
            (event == "approval" && configval == "1") ? $("#inspectScorePeriod").show() : $("#inspectScorePeriod").hide();
            if (event == "approval" || event == "feedback" || (event == "view" && userStandardkindId == "73ba18db-33fd-4746-ab41-9beb009f69a1")) {
                $("#inspectBtn").show();
            } else {
                $("#inspectBtn").hide();
            }
            if (configval2 == "1") {
                $("#duCha").show();
                tool.createFeedbackInspectFile(flowArr, event, tempUnit, isBack = false);
            } else {
                $("#duCha").hide();
            }
            tool.createFeedbackInspectScore(flowArr);
        },
        createFeedbackInspectFile: function (flowArr, event, tempUnit, isBack = false) {
            let tempHtml = ``;
            for (let i = 0; i < flowArr.length; i++) {
                let tempObj = flowArr[i];
                if (tempObj.isPass != null && tempObj.isPass != "0") lastChain = i;
                if (tempObj.isPass != null || tempObj.unitId == tempUnit) {
                    tempHtml += `<li class="inspect-li-${tempObj.unitId}">
                    <div class="inspect-title inspect-title-${tempObj.unitId}">${tempObj.unitname}</div>
                    <div class="inspect-file inspect-file-${tempObj.unitId}"></div>
                    </li>`;
                } else {
                    tempHtml += `<li class="inspect-li-${tempObj.unitId}">
                    <div class="inspect-title inspect-title-${tempObj.unitId}">${tempObj.unitname}</div>
                    <div class="inspect-file"></div>
                    </li>`;
                }

                if (!isBack) {
                    if (event != "view" && tempUnit == tempObj.unitId) break;
                }

            }
            $("#inspectFile").html(tempHtml);
        },
        createFeedbackInspectScore: function (flowArr) {
            let lastChain = -1;
            let approvalHtml = `<ul>`;
            for (let i = 0; i < flowArr.length; i++) {
                let tempObj = flowArr[i];
                let tempContent = '';
                let tempApproval = (flowArr.length == 1) ? '' : '待审核';
                if (flowArr.length == 1) {
                    if (tempObj.isPass == null || tempObj.isPass == -1) {
                        $("#inspectFlowTitle").hide();
                        return;
                    }
                }
                $("#inspectFlowTitle").show();
                let tempClass = ``;
                let approvaledClass = `approvaled-state`;
                if (tempObj.content) tempContent = tempObj.content;
                //0 申报人提交，1 退回修改，2 不通过 3审核通过
                if (tempObj.isPass == 0) tempApproval = '已提交';
                if (tempObj.isPass == 1) tempApproval = '退回修改';
                if (tempObj.isPass == 2) tempApproval = '审核不通过';
                if (tempObj.isPass == 3) tempApproval = '审核通过';
                if (lastChain == i) tempClass = "approval-chain";
                if (tempObj.isPass == null) approvaledClass = ``;
                let scoreHtml = ``, periodHtml = ``;
                if (tempObj.hasOwnProperty("score") && null != tempObj.score) {
                    scoreHtml = `<span>实授学分:${tempObj.score}</span>`;
                }
                if (tempObj.hasOwnProperty("period") && null != tempObj.period) {
                    periodHtml = `<span >实授学时:${tempObj.period}</span>`;
                }

                approvalHtml += `<li>
                    <div class="conawait ${tempClass}"></div>
                    <div class="timeLineAuditP">${tempObj.unitname}</div>
                    <div class="conauditfont">
                        <span class="${approvaledClass}">${tempApproval}</span>
                        ${scoreHtml}
                        ${periodHtml}
                        <div><div class="single-hidden" title="${tempContent}">${tempContent}</div></div>

                    </div>
                    </li>`;
            }
            approvalHtml += `</ul>`;
            $("#inspectFlow").html(approvalHtml);
        },
        addFeedbackInspectFile: function (event, tempUnit, files) {
            let isAddFileBtn = (event == "feedback" || event == "approval" || (event == "view" && userStandardkindId == "73ba18db-33fd-4746-ab41-9beb009f69a1")) ? true : false;
            for (let file of files) {
                if (file.fileType != -1) continue;
                if ($(".tab-inspect").length > 0) {
                    if (!$(".tab-inspect").is(".adddd")) {
                        $(".tab-inspect")[0].classList.add("adddd");
                    }
                }
                let hiddenHtml = `js-hidden`;
                if (isAddFileBtn && tempUnit == file.inspectUnitId) hiddenHtml = ``;
                let fileClass = file.inspectFileType == 1 ? "inspect-table" : "inspect-img";
                let imgTitle = file.inspectFileType == 1 ? "督查表：" : "督查照片：";
                let tempFileHtml = `<div class="${fileClass}" file-id="${file.feedbackFileId}">
                    <span>${imgTitle}</span>
                    <a class="layui-btn layui-btn-xs btn-normal-row js-file-name" msg="${file["fileName"]}" filePath="${file["filePath"]}" onmouseover="mouseoverImageName(this)" onmouseout="mouseoutImageName(this)" onclick="downloadFeedFile(this)">${file["fileName"]}</a>
                    <span style="color:red;">${file["addTime"]}</span>
                    <a class="layui-btn layui-btn-xs btn-danger-row ${hiddenHtml}" onclick="deleteImage(this)">移除</a>
                </div>`;
                $(`.inspect-file-${file.inspectUnitId}`).append(tempFileHtml);

                //查看是否需要禁止点击上传按钮
                if (file.inspectUnitId != tempUnit) continue;
                if (file.inspectFileType == 1) {
                    $("#inspectTable").addClass("layui-btn-disabled");
                    $("#inspectTable").attr("disabled", true);
                }
                if (file.inspectFileType == 2) {
                    $("#inspectImg").addClass("layui-btn-disabled");
                    $("#inspectImg").attr("disabled", true);
                }
            }

        },
        createFeedbackFileElem: function (fileType, datas, tempUnit) {
            if (datas == null || !datas.hasOwnProperty("fileName")) return;
            if (fileType == -1) {
                let files = [datas];
                tool.addFeedbackInspectFile("feedback", tempUnit, files);
                return;
            }
            let className = `js-feedback${fileType}`;
            let liFile = `<li file-id="${datas["feedbackFileId"]}">` +
                `<a class="layui-btn layui-btn-xs btn-normal-row js-file-name" msg="${datas["fileName"]}" filePath="${datas["filePath"]}" onmouseover="mouseoverImageName(this)" onmouseout="mouseoutImageName(this)" onclick="downloadFeedFile(this)">${datas["fileName"]}</a>` +
                `<a class="layui-btn layui-btn-xs btn-danger-row" onclick="deleteImage(this)">移除</a></li>`;
            $("." + className).append(liFile);
        },
        createFeedbackPeopleTable: function (downId) {
            //渲染表格
            table.render({
                elem: '#effectivePeople',
                url: huayi_projectscore_url + 'cmeProjScore/getFeedbackPersonByDownId',
                where: { downId: downId },
                cols: [[
                    { type: 'numbers', title: '序号', width: 60, align: 'center', hide: !isUserZheJiang }, // 浙江套
                    { field: 'personName', title: '姓名', sort: true, align: 'center' },
                    { field: 'personNo', title: '人员编号', align: 'center' },
                    { field: 'unitName', title: '所属单位', sort: true, align: 'center' },
                    { field: 'deptName', title: '所在科室', sort: true, align: 'center' },
                    {
                        field: 'scoreMode', title: '授分方式', sort: true, align: 'center', hide: userStandardkindId == "6427ddba-c02f-4229-bd73-49fc1c5d21f6",
                        templet: function (d) {
                            if (d.scoreMode == 1 || d.scoreMode == 2 || d.scoreMode == 5 || d.scoreMode == 8 || d.scoreMode == 10) {
                                return '<span>手工录入</span>';
                            } else if (d.scoreMode == 4 || d.scoreMode == 6 || d.scoreMode == 9 || d.scoreMode == 11) {
                                return '<span>考勤得分</span>';
                            } else if (d.scoreMode == 20) {
                                return '<span>外省人员授分</span>';
                            } else if (d.scoreMode == 7) {
                                return '<span>主讲人授分</span>';
                            } else {
                                return "";
                            }
                        }
                    },
                    { field: 'attendTime', title: '考勤次数', align: 'center' },
                    {
                        field: 'projScore', title: '学分分值', sort: true, align: 'center',hide: !isUserZheJiang, // 浙江套
                        templet: function (d) {
                            if (d.projScore === null || d.projScore === undefined || d.projScore === '') {
                                return '';
                            }
                            var n = Number(d.projScore);
                            return isNaN(n) ? '' : String(n);
                        }
                    },
                    { title: '考勤信息', toolbar: '#attendBar', align: 'center' },
                ]],
                cellMinWidth: 100,
                id: "peopleTable",
                height: '350',
                page: false,
                parseData: function (res) {
                    let tempNum = res.data.length;
                    var data_0 = res.data[0];
                    let sortedData = Array.isArray(res.data) ? res.data.slice() : [];
                    sortedData.sort(function (a, b) {
                        var aNum = Number(a && a.projScore);
                        var bNum = Number(b && b.projScore);
                        if (isNaN(aNum)) aNum = -Infinity;
                        if (isNaN(bNum)) bNum = -Infinity;
                        return bNum - aNum;
                    });
                    let kqCnt = data_0 == undefined ? 0 : data_0.kqMode;
                    let sgCnt = data_0 == undefined ? 0 : data_0.sgMode;
                    let wsCnt = data_0 == undefined ? 0 : (data_0.wsMode || 0);
                    let thCnt = data_0 == undefined ? 0 : data_0.thMode;
                    if (userStandardkindId == "6427ddba-c02f-4229-bd73-49fc1c5d21f6") { //青海套
                        $("#peopleScoreTitle").html(`授分人员明细表(${tempNum}人)`);
                    }
                    else if (userStandardkindId == "a6280900-a9c2-11ec-84d6-fa163e9b64fb") { //河南套
                        $("#peopleScoreTitle").html(`授分人员明细表(${tempNum}人) 考勤授分${kqCnt}人，手工补录${sgCnt}人，主讲人${thCnt}人`);
                    }
                    else if (userStandardkindId == "190c480d-d43c-450b-8472-a6fd00a6729d") { //浙江
                        $("#peopleScoreTitle").html(`授分人员明细表(${tempNum}人) 考勤授分${kqCnt}人，外省人员${wsCnt}人，主讲人${thCnt}人`);
                    }
                    else if (userStandardkindId == "289bf0ca-52cb-4b19-b737-9bd200a69ce1") { //广东
                        $("#peopleScoreTitle").html(`预授分人员明细表(${tempNum}人) 考勤授分${kqCnt}人，外省人员${wsCnt}人，主讲人${thCnt}人`);
                    }
                    else {
                        $("#peopleScoreTitle").html(`授分人员明细表(${tempNum}人) 考勤授分${kqCnt}人，手工补录${sgCnt}人，外省人员${wsCnt}人，主讲人${thCnt}人`);
                    }

                    return {
                        "code": res.status === 200 ? 0 : res.status, //解析接口状态
                        "msg": res.message, //解析提示文本
                        "data": sortedData //解析数据列表（按学分分值倒序）
                    }
                }
            });
        },
        createGroupFeedbackPeopleTable: function (downId) {
            //渲染表格
            table.render({
                elem: '#effectivePeople',
                url: huayi_projectscore_url + 'cmeGroupProjScore/getGroupFeedbackPersonByDownId',
                where: { downId: downId },
                cols: [[
                    { field: 'personName', title: '姓名', sort: true, align: 'center' },
                    { field: 'personNo', title: '人员编号', align: 'center' },
                    { field: 'unitName', title: '所属单位', sort: true, align: 'center' },
                    { field: 'deptName', title: '所在科室', sort: true, align: 'center' },
                    {
                        field: 'scoreMode', title: '授分方式', sort: true, align: 'center', hide: userStandardkindId == "6427ddba-c02f-4229-bd73-49fc1c5d21f6",
                        templet: function (d) {
                            if (d.scoreMode == 1 || d.scoreMode == 2 || d.scoreMode == 5 || d.scoreMode == 8 || d.scoreMode == 10) {
                                return '<span>手工录入</span>';
                            } else if (d.scoreMode == 4 || d.scoreMode == 6 || d.scoreMode == 9 || d.scoreMode == 11) {
                                return '<span>考勤得分</span>';
                            } else if (d.scoreMode == 20) {
                                return '<span>外省人员授分</span>';
                            } else if (d.scoreMode == 7) {
                                return '<span>主讲人授分</span>';
                            } else {
                                return "";
                            }
                        }
                    },
                    // { field: 'attendTime',title: '考勤次数', align: 'center'},
                    { title: '考勤信息', toolbar: '#attendBar', align: 'center' },
                ]],
                cellMinWidth: 100,
                id: "peopleTable",
                height: '350',
                page: false,
                parseData: function (res) {
                    let tempNum = res.data.length;
                    var data_0 = res.data[0];
                    let kqCnt = data_0 == undefined ? 0 : data_0.kqMode;
                    let sgCnt = data_0 == undefined ? 0 : data_0.sgMode;
                    let wsCnt = data_0 == undefined ? 0 : (data_0.wsMode || 0);
                    let thCnt = data_0 == undefined ? 0 : data_0.thMode;
                    if (userStandardkindId == "6427ddba-c02f-4229-bd73-49fc1c5d21f6") { //青海套
                        $("#peopleScoreTitle").html(`授分人员明细表(${tempNum}人)`);
                    }
                    else if (userStandardkindId == "a6280900-a9c2-11ec-84d6-fa163e9b64fb" || userStandardkindId == "190c480d-d43c-450b-8472-a6fd00a6729d") { //河南套 浙江
                        $("#peopleScoreTitle").html(`授分人员明细表(${tempNum}人) 考勤授分${kqCnt}人，手工补录${sgCnt}人，主讲人${thCnt}人`);
                    }
                    else if (userStandardkindId == "289bf0ca-52cb-4b19-b737-9bd200a69ce1") { //广东
                        $("#peopleScoreTitle").html(`授分人员明细表(${tempNum}人) 考勤授分${kqCnt}人，主讲人${thCnt}人`);
                    }
                    else {
                        $("#peopleScoreTitle").html(`授分人员明细表(${tempNum}人) 考勤授分${kqCnt}人，手工补录${sgCnt}人，主讲人${thCnt}人`);
                    }

                    return {
                        "code": res.status === 200 ? 0 : res.status, //解析接口状态
                        "msg": res.message, //解析提示文本
                        "data": res.data //解析数据列表
                    }
                }
            });
        },
        getFeedbackPeriodTitle: function () {
            return _isGaungxi ? '学习时长（分钟）' : '学时';
        },
        createFeedbackProjInfo: function (datas, showProjInfo) {
            $('#upScore').val(datas["score"]);
            let tempHtml = '';
            for (let tempObj of showProjInfo) {
                let tempCla = "js-" + tempObj.name;
                let tempVal = datas[tempObj.name]
                if (tempObj.name == "isCharge") {
                    tempVal = (tempVal == "1" || tempVal == 1) ? "收费" : "免费";
                }
                tempHtml += `<div class="layui-form-item">
                    <div class="layui-inline-flex">
                        <label class="layui-form-label">${tempObj.value}</label>
                        <div class="layui-input-block layui-input-block1 ${tempCla}">
                            <div title="${tempVal}">${tempVal}</div>
                        </div>
                    </div>
                </div>`;
            }
            $("#prjInfo").html(tempHtml);
        },
        createFeedbackGroupProjInfo: function (datas, showProjInfo) {
            $('#upScore').val(datas["score"]);
            let tempHtml = '';
            for (let tempObj of showProjInfo) {
                let tempCla = "js-" + tempObj.name;
                let tempVal = datas[tempObj.name]
                if (tempObj.name == "isCharge") {
                    tempVal = (tempVal == "1" || tempVal == 1) ? "收费" : "免费";
                }
                tempHtml += `<div class="layui-form-item">
                    <div class="layui-inline-flex">
                        <label class="layui-form-label">${tempObj.value}</label>
                        <div class="layui-input-block layui-input-block1 ${tempCla}">
                            <div title="${tempVal}">${tempVal}</div>
                        </div>
                    </div>
                </div>`;
            }
            $("#prjInfo").html(tempHtml);
        },
        controllInputEdit: function (event) {
            let contrlClaArr = ["js-analyse-input", "js-question-input", "js-textbook-works", "js-course-period", "js-write-time", "js-teaxtbook-name", "js-textbook-unit", "js-textbook-summarize"];
            if (event != "feedback") {
                for (let tempClass of contrlClaArr) {
                    $(`.${tempClass}`).addClass("layui-disabled");
                }
                $("#textbookType").attr("disabled", true);
            } else {
                for (let tempClass of contrlClaArr) {
                    $(`.${tempClass}`).removeClass("layui-disabled");
                }
                $("#textbookType").attr("disabled", false);
            }
        },
        viewApprovalLogsHtml: function (downId) {
            layer.open({
                type: 2,
                title: '',
                content: `projectProgress/projFeedbackApproveLogs.html?downId=${downId}`,
                area: ['560px', '380px'],
            })
        },
        createFeedbackProcessUp: function (datas, fileUpObj, configVal, type = 0) {
            if (datas.hasOwnProperty(configVal) && !tool.isEmpty(datas[configVal])) {
                fileUpObj = JSON.parse(datas[configVal]);
            }
            let upHtml = "";
            for (let obj of fileUpObj) {
                let tempAhtml = ``;
                if (type == 0) {
                    tempAhtml = `<div class="js-upload-btn-box">
                        <a class="layui-btn layui-btn-sm js-upload-sh-btn" data-type="${obj.fileType}" f-type="${obj.type}">上传</a>
                    </div>`;
                }
                upHtml += `<div class="meeting-notice">
                    <span class="file-title">${obj.fileName}</span>
                    ${tempAhtml}
                    <ul class="js-feedback${obj.fileType}"></ul>
                </div>`;
            }
            $(".js-project-process").append(upHtml);
            return fileUpObj;
        },
        getFormData: function (formId) {
            let formData = {};
            const inputs = document.querySelectorAll(`${formId} input, ${formId} textarea, ${formId} select`);
            inputs.forEach(input => {
                const name = input.name;
                const value = input.value.trim();
                if (name) {
                    formData[name] = value;
                }
            });
            return formData;
        },
        getComAliyunUrl: function (relativeUrl) {
            if (localStorage.getItem('standardkind-id') != '190c480d-d43c-450b-8472-a6fd00a6729d') {
                return relativeUrl;
            }
            let resultUrl = relativeUrl;
            $.ajax({
                type: 'GET',
                url: huayi_upload_url + 'uploadApi/ossPath',
                async: false,
                data: {
                    fileName: relativeUrl
                },
                beforeSend: xhr => {
                    xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
                    xhr.setRequestHeader('KJPT-USER-ID', localStorage.getItem('user-id'));
                },
                success: (res, status, xhr) => {
                    if (res.data.picUrl && res.data.picUrl.length != 0) {
                        resultUrl = res.data.picUrl;
                    } else {
                        console.log('获取阿里云url失败');
                    }
                },
                error: (xhr, status, error) => {
                    console.log('获取阿里云url失败');
                }
            });
            return resultUrl;
        },
        //文件路径，reqBack是否是访问后端
        downloadUseIfram: function (filePath, reqBack = true) {
            if (reqBack && localStorage.getItem('standardkind-id') == '190c480d-d43c-450b-8472-a6fd00a6729d') {
                filePath = tool.getComAliyunUrl(filePath);
            }
            var iframe = document.createElement("iframe");
            iframe.src = filePath;
            iframe.style.display = "none";
            document.body.appendChild(iframe);
        },
        viewPdfBack: function (url, id) {
            let extension = '';
            if (url && typeof url === 'string') {
                const fileName = url.substring(url.lastIndexOf('/') + 1);
                const dotIndex = fileName.lastIndexOf('.');
                if (dotIndex > -1) {
                    extension = fileName.substring(dotIndex + 1).toLowerCase();
                }
            }

            url = tool.getComAliyunUrl(url);

            let xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.setRequestHeader('Accept', 'application/pdf');
            xhr.responseType = "blob";
            xhr.onreadystatechange = function () {
                if (this.status == 200 && this.readyState == 4) {
                    var blob = xhr.response;
                    let file = new File([blob], "test." + extension, { type: 'application/pdf' });
                    // backFunc(file);
                    tool.createPdf(file, id);
                }
            }
            xhr.send();
        },
        //pdf预览解析
        createPdf: function (pdfElem, id) {
            let currentPages = 1;
            let totalPages = 0;
            var reader = new FileReader();
            reader.readAsDataURL(pdfElem);
            reader.onload = function (e) {
                let loadingTask = pdfjsLib.getDocument({
                    url: this.result,
                    cMapUrl: "/js/pdfjs/web/cmaps/",
                    cMapPacked: true
                });
                loadingTask.promise.then(function (pdf) {
                    if (pdf) {
                        if(id != 'photoWindow') $(`#${id}`).empty();
                        totalPages = pdf.numPages;
                        for (let i = 1; i <= totalPages; i++) {
                            var canvas = document.createElement('canvas');
                            canvas.id = "pageNum" + i;
                            $(`#${id}`).append(canvas);
                            var context = canvas.getContext('2d');
                            tool.renderImg(pdf, i, context);
                        }
                    }
                })
            }
        },
        renderImg: function (pdfFile, pageNum, canvasContext) {
            let pageElem = pdfFile.getPage(pageNum);
            pageElem.then(function (page) {
                var viewport = page.getViewport({ scale: 3 });
                var newcanvas = canvasContext.canvas;
                newcanvas.width = viewport.width;
                newcanvas.height = viewport.height;
                newcanvas.style.width = "100%";
                var renderContext = {
                    canvasContext: canvasContext,
                    viewport: viewport
                };
                page.render(renderContext);
            })
            return;
        },
        isImg: function (url) {
            if (!url || typeof url !== 'string') {
                return false;
            }

            const imgExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico', '.tiff', '.tif'];
            const lowerUrl = url.toLowerCase();

            return imgExtensions.some(ext => lowerUrl.endsWith(ext));
        },
        showFileAndView: function (fileUrl, viewFile) {
            if (tool.isImg(fileUrl)) {
                tool.openViewImg(fileUrl);
            } else {
                tool.createElemById(viewFile);
                tool.viewPdfBack(fileUrl, viewFile);
                layer.open({
                    type: 1,
                    shade: 0.8,
                    offset: 'auto',
                    area: ['90%', '90%'],
                    shadeClose: true,//点击外围关闭弹窗
                    scrollbar: false,//不现实滚动条
                    title: "预览", //不显示标题
                    content: $(`#${viewFile}`)
                });
            }
        },
        createElemById: function (id) {
            if (!id || typeof id !== 'string') {
                return null;
            }

            let element = document.getElementById(id);
            if (!element) {
                element = document.createElement('div');
                element.id = id;
                document.body.appendChild(element);
            }

            return element;
        },
        createHainanYear: function (id, isSelectLast = false, startYear = 2014) {
            const currentYear = new Date().getFullYear() - 1;
            const select = $(`#${id}`);
            select.empty();
            select.append('<option value=""></option>');
            for (let year = currentYear; year >= startYear; year--) {
                if (isSelectLast && currentYear == year) {
                    select.append('<option value="' + year + '" selected>' + year + '</option>');
                } else {
                    select.append('<option value="' + year + '">' + year + '</option>');
                }
            }

            form.render('select');
        },
        getListFromTree: function (treaData, filed = "id", childStr = "children") {
            let result = [];
            function traverse(node) {
                if (!node || typeof node !== 'object') {
                    return;
                }
                let fieldValue = node[filed];
                if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                    result.push(fieldValue);
                }
                if (node[childStr] && Array.isArray(node[childStr])) {
                    node[childStr].forEach(child => {
                        traverse(child);
                    });
                }
            }
            if (Array.isArray(treaData)) {
                treaData.forEach(item => {
                    traverse(item);
                });
            } else if (treaData && typeof treaData === 'object') {
                traverse(treaData);
            }
            return result;
        },
        //忽略元素
        ignoreElement: function (element) {
            // 检查元素是否有效
            if (!element || !element.nodeType) {
                return false;
            }

            // 对于元素节点，检查是否匹配忽略选择器
            if (element.nodeType === Node.ELEMENT_NODE) {
                // 检查是否包含忽略类名
                if (element.classList && element.classList.contains('custom-ignore')) {
                    return true;
                }
            }

            return false;
        },
        shouldSkipElement(element) {
            if (!element || !element.nodeType) {
                return true;
            }

            if (element.nodeType !== Node.ELEMENT_NODE && element.nodeType !== Node.TEXT_NODE) {
                return true;
            }

            if (element.nodeType === Node.ELEMENT_NODE) {
                if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
                    return true;
                }

                const skipTags = ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION'];
                if (element.tagName && skipTags.includes(element.tagName)) {
                    return true;
                }
            }

            return false;
        },
        //修改html页面dom元素的文本内容
        replaceTextInDocument: function (textObj) {
            if (document.body) {
                // 检查整个body是否应该被忽略
                if (this.ignoreElement(document.body)) return;
                // 这里处理的现有的文本
                for (let key in textObj) {
                    if (document.body.textContent.indexOf(key) == -1) {
                        return;
                    }
                }

                this.replaceTextInElement(document.body, textObj);
            }
        },

        replaceTextInElement: function (element, textObj) {
            // 检查是否应该跳过这个元素
            if (this.shouldSkipElement(element) || this.ignoreElement(element)) return;

            // 处理元素节点
            if (element.nodeType === Node.ELEMENT_NODE) {
                // 特别处理label元素
                if (element.tagName === 'LABEL' || element.classList.contains('layui-form-label')) {
                    for (let key in textObj) {
                        if (element.textContent.indexOf(key) >= 0) {
                            const htmlText = element.innerHTML;
                            let newHtml = htmlText.replace(new RegExp(key, 'g'), textObj[key]);
                            if (newHtml !== htmlText) {
                                element.innerHTML = newHtml;
                            }
                        }
                    }

                } else {
                    // 递归处理子节点
                    const childNodes = Array.from(element.childNodes);
                    childNodes.forEach(child => {
                        for (let key in textObj) {
                            if (child.textContent.indexOf(key) >= 0 && child.textContent.indexOf(textObj[key]) < 0) {
                                this.replaceTextInElement(child, textObj);
                            }
                        }
                    });
                }

            }
        },
        getAttendanceType: function (attendanceType) {
            //考勤类型考勤类型：0学员扫描单位二维码、1单位扫描学员二维码、 2pos刷卡 3、其他4 、学员扫描二维码并开启地理位置，5、管理员考勤 ；
            if (attendanceType == 0 || attendanceType == 1 || attendanceType == 3 || attendanceType == 4) return "二维码考勤";
            if (attendanceType == 2) return "刷卡考勤";
            if (attendanceType == 5) return "管理员考勤";
            if (attendanceType == 6) return "微信扫码";
            return "其他"
        },
        //控制渲染所属医学体系
        setSelectById: function (elem, value,type=0) {
            if (!elem || typeof elem !== 'string') return;
            let showArr=["全部","西医","中医"];
            let showObj= {"全部":"","西医":"1","中医":"2","蒙医":"3"};
            if(type == 2) {
                showArr= ["全部","西医","中医","蒙医"];
            }
            //这里只有一个参数进行渲染
            if(type == 1 && value != "") {
                showArr = (value == "1") ? ["西医"] : ["中医"];
            }
            let optionText = "";
            for(let tempField of showArr){
                if(showObj.hasOwnProperty(tempField)){
                    optionText += `<option value="${showObj[tempField]}" ${value== showObj[tempField]?"selected":""}>${tempField}</option>`;
                }
            }
            $(elem).html(optionText);
            form.render('select');
        },
        //根据套进行控制所属医学体系select的控制
        //浙江和广东行政账号，如果是西医，医学体系只显示西医，中医同理
        //河南
        setMedicalTypeSelectById: function (elem) {
            var tempManagerMedical = localStorage.getItem("manager-medical-type");
            tempManagerMedical = tempManagerMedical ? tempManagerMedical : "";
            if(isUserGuangdong || isUserZheJiang) {
                tool.setSelectById(elem,tempManagerMedical,1);
            } else if(isUserHeNan) {
                tool.setSelectById(elem,tempManagerMedical,0);
            } else if(isUserNeimeng){
                tool.setSelectById(elem,tempManagerMedical,2);
            }else {
                tool.setSelectById(elem,tempManagerMedical);
            }
        },
        //通过发送downId获取学分明细
        getSingleScoreListByDownId: function (downId) {
            if(!isUserGuangdong) return [];
            let url = huayi_projectscore_url + 'cmeSingleprojScore/getScoreByDownId';
            let result = [];
            $.ajax({
                url: url,
                async: false,
                method: 'get',
                data: {
                    downId: downId
                },
                success: function (res) {
                    if(res.data && res.data.length > 0) {
                        result = res.data;
                    } else {
                        result = [];
                    }
                },
                error: function () {
                    result = [];
                }
            });
            return result;
        },
        //通过发送downId获取教师明细
        getTeacherListByDownId: function (downId,projectType) {
            if(!isUserGuangdong) return [];
            let url = huayi_projectscore_url + 'cmeCmeProjTeacher/getTeachersByDownId';
            if(projectType == 2) {
                url = huayi_projectscore_url + 'cmeGroupprojTeacher/getTeachersByDownId';
            }
            let result = [];
            $.ajax({
                url: url,
                async: false,
                method: 'get',
                data: {
                    downId: downId
                },
                success: function (res) {
                    if(res.data && res.data.length > 0) {
                        result = res.data;
                    } else {
                        result = [];
                    }
                },
                error: function () {
                    result = [];
                }
            });
            return result;
        },
        /**
         * 授分前确认文案：选中人员是否包含主讲人（教师列表以 comPersonId 为准）
         * @param {Array} teacherPersonList getTeachersByDownId 等接口返回的教师数组
         * @param {Array} checkedPersonIds 已勾选授分人员 id 列表（与表格勾选字段一致）
         * @param {Map} checkedTableInfo 勾选行缓存 Map，需支持 .get(key)
         */
        buildAwardConfirmMessage: function (teacherPersonList, checkedPersonIds, checkedTableInfo) {
            function teacherRowPersonId(t) {
                if (!t || t.comPersonId == null || t.comPersonId === '') return '';
                return String(t.comPersonId);
            }
            function teacherRowDisplayName(t) {
                if (!t) return '';
                return t.teacherName || t.personName || t.teachName || t.name || '';
            }
            function checkedRowByPersonId(pid) {
                if (!checkedTableInfo || typeof checkedTableInfo.get !== 'function') return undefined;
                return checkedTableInfo.get(pid)
                    || checkedTableInfo.get(String(pid))
                    || checkedTableInfo.get(Number(pid));
            }
            var nameByTeacherId = {};
            layui.each(teacherPersonList || [], function (_, t) {
                var id = teacherRowPersonId(t);
                if (!id) return;
                var nm = teacherRowDisplayName(t);
                if (nm) nameByTeacherId[id] = nm;
            });
            var names = [];
            layui.each(checkedPersonIds || [], function (_, pid) {
                var row = checkedRowByPersonId(pid);
                var lookupId = (row && row.comPersonId != null && row.comPersonId !== '')
                    ? String(row.comPersonId)
                    : String(pid);
                if (!nameByTeacherId[lookupId]) return;
                var nm = (row && row.personName) ? row.personName : nameByTeacherId[lookupId];
                if (nm && names.indexOf(nm) === -1) names.push(nm);
            });
            if (names.length > 0) {
                return '此次选择的授分人员包括主讲人' + names.join('、') + '，请确认。';
            }
            return '';
        },
        /**
         * 统一确认弹窗（回调式）：确认才继续执行后续逻辑
         * @param {string} message 弹窗内容
         * @param {Object} options layer.confirm 的配置项（如 title/btn/btnAlign/closeBtn/area 等）
         * @param {Function} onConfirm 点击“确认”的回调
         * @param {Function} onCancel 点击“取消”的回调（可选）
         */
        confirmThen: function (message, onConfirm, onCancel) {
            function openAwardLayer() {
                layer.open({
                    title: '授分',
                    content: $('#fromForCreditStrategy'),
                    type: 1,
                    area: ['500px', 'auto'],
                    btnAlign: 'c',
                    btn: ['授分','取消'],
                    yes: function () {
                        if (typeof onConfirm === 'function') onConfirm();
                    },
                    btn2: function () {
                        layer.close();
                    }
                });
            }
            if(isUserGuangdong && message != '' && message != null && message != undefined) {
                var opts = {
                    title: false,
                    btn: ['确认','取消'],
                    btnAlign: 'c',
                    closeBtn: 0,
                    area: ['350px', 'auto']
                }
                layer.confirm(message, opts, function (confirmIndex) {
                    layer.close(confirmIndex);
                    openAwardLayer();
                    
                }, function (cancelIndex) {
                    layer.close(cancelIndex);
                    if (typeof onCancel === 'function') onCancel();
                });
            } else {
                openAwardLayer();
            }
            
        }
    }
    exports('tool', tool);
})
