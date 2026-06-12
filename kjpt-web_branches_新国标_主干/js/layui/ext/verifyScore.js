//用于学分审验一些公共方法,用于替换赵晓的方法
layui.define(['jquery', 'form', 'layer', 'laydate','table','element'], function (exports) {
    const form = layui.form;
    const element = layui.element;

    let verifyScore = {
        renderYearBox: function (el, begin = 2025, yearLen = 7) {
            let elem = $(el);
            let str = '';
            for (let i = 0; i < yearLen; i++) {
                let year = begin - i;
                let checked = i < 3 ? "checked" : "";
                str += `<input type="checkbox" name="cmeYear" value="${year}" title="${year}" ${checked} 
                lay-skin="primary" lay-filter="cmeYearCheckBox">`;
            }
            elem.html(str);
            form.render('checkbox');
        },
        addWatermark:function(text, fontSize='13', color='#222305ff') {
            const watermarkDiv = document.createElement('div');
            watermarkDiv.id = 'watermarkDiv';
            watermarkDiv.style.position = 'fixed';
            watermarkDiv.style.top = '0';
            watermarkDiv.style.left = '0';
            watermarkDiv.style.zIndex = '9999';
            watermarkDiv.style.pointerEvents = 'none';
            watermarkDiv.style.width = '100%';
            watermarkDiv.style.height = '100%';
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 150;
            
            ctx.rotate(-30 * Math.PI / 180);
            ctx.font = fontSize + 'px Helvetica Neue,Helvetica,PingFang SC,Tahoma,Arial,sans-serif';
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.15;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);
            
            watermarkDiv.style.backgroundImage = 'url(' + canvas.toDataURL() + ')';
            watermarkDiv.style.backgroundRepeat = 'repeat';
            
            document.body.appendChild(watermarkDiv);
        },
        getCheckBox: function (name) {
            let arr = [];
            $(`input[name='${name}']:checkbox`).each(function(){
                if(true == $(this).is(':checked')){
                    arr.push(this.value);
                }
            });
            return arr;
        },
        openDldp : function () {
            $('#dldp').show();
            element.progress('dldp', '0%');
            
            let progress = 0;
            let progressTimer = null;

            let index = layer.open({
                type: 1,
                title: '下载中',
                content: $('#dldp'),
                area: ['300px', '100px'],
                closeBtn: 0,
                shadeClose: false,
                success: function (layero, index) {
                    progressTimer = setInterval(() => {
                        progress += 10;
                        if (progress > 90) {
                            progress = 90;
                        }
                        element.progress('dldp', progress + '%');
                    }, 500);
                },
                end: function () {
                    clearInterval(progressTimer);
                    $('#dldp').hide();
                }
            });
            return index;
        },
        closeDldp : function (index) {
            setTimeout(() => {
                element.progress('dldp', '100%');
                layer.close(index);
            }, 500);
        },
        //这里方法是layui表格的排序功能，要求layui的版本在2.8.0以上
        sortTable : function (tableData,type,field) {
            if (!tableData || tableData.length === 0) return tableData;
            
            tableData.forEach((item, index) => {
                if (item.originalIndex === undefined) {
                    item.originalIndex = index;
                }
            });
            
            let val = tableData[0][field];
            if(Number.isFinite(val)){
                return verifyScore.sortTableNum(tableData,type,field);
            }
            return verifyScore.sortTableZh(tableData,type,field);
        },
        sortTableZh : function (tableData,type,field) {
            if (type === null || type === undefined) {
                tableData.sort((item1, item2) => {
                    return item1.originalIndex - item2.originalIndex;
                });
            } else if (type === "asc") {
                tableData.sort((item1, item2) => {
                    const compareResult = (item1[field] || '').localeCompare(item2[field] || '', 'zh-CN', {
                        sensitivity: 'accent',
                        ignorePunctuation: true,
                        numeric: true
                    });
                    return compareResult === 0 ? item1.originalIndex - item2.originalIndex : compareResult;
                });
            } else if (type === "desc") {
                tableData.sort((item1, item2) => {
                    const compareResult = (item2[field] || '').localeCompare(item1[field] || '', 'zh-CN', {
                        sensitivity: 'accent',
                        ignorePunctuation: true,
                        numeric: true
                    });
                    return compareResult === 0 ? item1.originalIndex - item2.originalIndex : compareResult;
                });
            }
            
            return tableData;
        },
        sortTableNum : function (tableData,type,field) {
            if (type === null || type === undefined) {
                tableData.sort((item1, item2) => {
                    return item1.originalIndex - item2.originalIndex;
                });
            } else if (type === "asc") {
                tableData.sort((item1, item2) => {
                    const compareResult = (Number(item1[field]) || 0) - (Number(item2[field]) || 0);
                    return compareResult === 0 ? item1.originalIndex - item2.originalIndex : compareResult;
                });
            } else if (type === "desc") {
                tableData.sort((item1, item2) => {  
                    const compareResult = (Number(item2[field]) || 0) - (Number(item1[field]) || 0);
                    return compareResult === 0 ? item1.originalIndex - item2.originalIndex : compareResult;
                });
            }
            
            return tableData;
        }

    }
    
    

    exports('verifyScore', verifyScore);

})