/* 递归遍历树形机构数据 */
let getUnits = function (datas, options) {
    for (let i in datas) {
        options += '<option value="' + datas[i].id + '">' + datas[i].name + '</option>';
        if (datas[i].children) {
            options = getUnits(datas[i].children, options);
        }
    }
    return options;
}