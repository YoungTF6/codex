/**
 * 日期 相关工具方法
 */

// 时间戳 -> 年-月-日
function timestampToDate(timestamp) {
    let date  = new Date(timestamp);
    let year  = date.getFullYear();
    let month = '0' + (date.getMonth() + 1);
        month = month.substring(month.length - 2);
    let day   = '0' + date.getDate();
        day   = day.substring(day.length - 2);
    return year + '-' + month + '-' + day;
}

function getRightKnowledgeState(cmeYear) {
    let state = 4;
    let cmeStandardKindId = localStorage.getItem("standardkind-id"); 
    state = (cmeYear != null)
        ? ((cmeYear > 2025) ? 1 : 4)
        : 1;
	//如果本套是河南或者海南，并且年度选择2025年及以后，state=1
    if((cmeStandardKindId == "a6280900-a9c2-11ec-84d6-fa163e9b64fb" || cmeStandardKindId == "6eec6713-670a-43cc-ad4d-9bd700a92928") ) {
         state = 1;
    }
    return state;
}