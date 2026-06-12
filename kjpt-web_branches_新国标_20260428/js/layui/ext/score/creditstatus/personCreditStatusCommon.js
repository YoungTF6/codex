/**
 * 个人学分情况查询
 * 用于统一处理数据，修改的时候注意调用的地方，如果不了解，建议新建方法，而不是直接改
 * 
 * @param {Object} exports 
 * @returns 
 */

layui.define(['jquery', 'form', 'layer', 'laydate', 'table'], function (exports) {
    let $ = layui.jquery;
    let form = layui.form;
    let layer = layui.layer;
    let table = layui.table;
    let laydate = layui.laydate;
    let dateInstanceObj = {};


    let personCreditStatusCommon = {
        generateTableBar: function () {
            let barHtml = '';
            if (localStorage.getItem("unit-user-type") == 2) {
                barHtml = `<input type="checkbox" name="like1[read]" id="checkboxCurrent" style="float: left;" lay-filter="checkboxCurrent"  title="本页全选">
                <input type="checkbox" name="like1[read]" id="checkboxAll"  lay-filter="checkboxAll"  title="所有全选">
                <button class="layui-btn layui-btn-sm btnRounded" lay-event="excel" style="float: right;">导出Excel</button>
                <div style="float:right;">&nbsp;</div>
                <button class="layui-btn layui-btn-sm btnRounded" lay-event="pdf" style="float: right;">导出PDF</button>
                <button  class="layui-btn layui-btn-sm"  style="color: #ea4e1f;background-color: transparent;font-size: 16px;float:right">
                注:导出pdf不包括未通过学分</button>`
                return `<div>${barHtml}</div>`;
            }
            return ``;
        },
        // 月份/日期补零格式化，保证 1 位数字显示为 2 位
        formatMonthOrDay: function (value) {
            let text = String(value);
            if (text.length === 1) {
                text = "0" + text;
            }
            return text;
        },
        ininDateInstance: function (idDate) {
            const $input = $(`#${idDate}`);
            let lastValidValue = $input.val() || '';

            // 每次用户准备重新选之前，记录当前值
            $input.off(`focus.prevDate.${idDate}`).on(`focus.prevDate.${idDate}`, function () {
                lastValidValue = $(this).val() || '';
            });

            dateInst = laydate.render({
                elem: `#${idDate}`,
                range: true,
                done: function (value, date, endDate) {
                    // 允许清空
                    if (!value) {
                        lastValidValue = '';
                        return;
                    }

                    // 只选了起始端，不做校验
                    if (!endDate || !endDate.year) return;

                    // 非法：跨年 -> 回退旧值
                    if (date.year !== endDate.year) {
                        layer.msg('日期不允许跨年', { zIndex: 66666670 });

                        // 用异步回退，避免被 laydate 内部赋值再次覆盖
                        setTimeout(function () {
                            $input.val(lastValidValue);
                        }, 0);
                        return;
                    }

                    // 合法才更新
                    lastValidValue = value;
                }
            });
            dateInstanceObj [idDate] = dateInst;
        },

        generateStudyTimeLength: function (period,selectedYear) {
            if (!isNaN(selectedYear) && selectedYear < 2026) {
                return period;
            }
            return Math.floor(period * 60 / 45);
        }
    }
    exports('personCreditStatusCommon', personCreditStatusCommon);
})
