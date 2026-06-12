function getAction(url, parameter) {
    return axios({
        url: url,
        method: 'get',
        data: parameter
    })
}

function postAction(url, parameter) {
    return axios({
        url: url,
        method: 'post',
        data: parameter
    })
}

function deleteAction(url, parameter) {
    return axios({
        url: url,
        method: 'delete',
        data: parameter
    });
}

function maxDate() {
    var nowDate = new Date();
    return nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1) + "-" + nowDate.getDate();
}
function minDate() {
    var nowDate = new Date();
    return nowDate.getFullYear() + "-01-01";
}

function downloadFile(url, parameter, customName, pFun) {
    return axios({
        url: url,
        method: 'post',
        data: parameter,
        // withCredentials: true,
        responseType: 'blob',
        onDownloadProgress: function (progressEvent) {
            const loaded = progressEvent.loaded;
            const total = progressEvent.total;
            const progress = Math.round((loaded / total) * 100);
            // console.log('loaded: %s, total: %s, progress: %s', loaded, total, progress);
            if (pFun && typeof pFun === 'function') {
                pFun(progress, 'down');
            }
        }
    }).then(response => {
        // console.info('response: %s', JSON.stringify(response));
        // console.info('response.data: ', response.data);
        // console.info('response.body: ', response.body);
        if ((response.status === 200) && response.data) {
            let filename = response.headers["content-disposition"];
            if (customName) {
                filename = customName
            } else {
                filename = filename.split("filename=")[1];
            }
            const blob = new Blob([response.data]);
            let href = window.URL.createObjectURL(blob);

            let downloadElement = document.createElement("a");
            downloadElement.href = href;
            downloadElement.download = decodeURIComponent(filename);
            document.body.appendChild(downloadElement);
            downloadElement.click();

            document.body.removeChild(downloadElement);
            window.URL.revokeObjectURL(href);
        }
    }).catch(error => {
        // console.info('error: ', JSON.stringify(error));
        // console.info('error.response: ', error.response);
        if (error.response.data.type === 'application/json') {
            const reader = new FileReader();
            reader.readAsText(error.response.data);
            reader.onload = (e) => {
                const {message} = JSON.parse(reader.result);
                // console.info('message: %s', message);
                alert(message);
            }
        }
    });
}


const DefaultConst = {
    // 黑龙江
    STANDARD_KIND_ID: 'b7864061-7bd4-4ee7-a868-9b24009e92df',
    // 哈尔滨市卫生健康委员会(行政)
    UNIT_ID_GOV: '090100',
    // 哈尔滨市第五医院(单位)
    UNIT_ID: '090103',
    USER_ID: 'e05def64-11a0-448a-b55b-3153199a777b'
};


const ModalActionEnum = {
    CREATE: 'create',
    EDIT: 'edit',
    VIEW: 'view'
}



const DateTimePattern = {
    DAY: 'YYYY-MM-DD',
    MINUTE: 'YYYY-MM-DD HH:mm',
    SECOND: 'YYYY-MM-DD HH:mm:ss'
}

const getOrDefault = (val, defaultVal) => (val ? val : defaultVal);

const _skId = getOrDefault(localStorage.getItem('standardkind-id'), DefaultConst.STANDARD_KIND_ID);

const PseudoNull = {
    UNIT_ID: '000000',
    UUID: '00000000-0000-0000-0000-000000000000',
}




const jsonStr2urlParam = (jsonStr) => {
    let json = JSON.parse(jsonStr);
    return Object.keys(json)
        .filter(key => (json[key] || '0' === json[key]))
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(json[key]))
        .join("&");
}


const getUrlParamByName = (name) => {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    let res = window.location.search.substr(1).match(reg);
    // unescape
    return res ? decodeURIComponent(res[2]) : null;
}


const uuid = () => {
    let temp_url = URL.createObjectURL(new Blob());
    let uuid = temp_url.toString(); // blob:https://xxx.com/b250d159-e1b6-4a87-9002-885d90033be3
    URL.revokeObjectURL(temp_url);
    return uuid.substr(uuid.lastIndexOf("/") + 1);
}


const toDayHeader = (dayStr) => dayStr ? moment(dayStr, DateTimePattern.DAY).startOf('day').format(DateTimePattern.SECOND) : dayStr;
const toDayTail = (dayStr) => dayStr ? moment(dayStr, DateTimePattern.DAY).endOf('day').format(DateTimePattern.SECOND) : dayStr;
const today = () => moment().format(DateTimePattern.DAY);

const removeEmpty = (obj) => {
    return JSON.parse(JSON.stringify(obj), (key, value) => {
        if (value === null || value === '' || value === [] || value === {})
            return undefined;
        return value;
    });
}



const accAdd = (arg1, arg2) => {
    let r1, r2, m;
    try {
        r1 = arg1.toString().split(".")[1].length
    } catch (e) {
        r1 = 0
    }
    try {
        r2 = arg2.toString().split(".")[1].length
    } catch (e) {
        r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2))
    return (arg1 * m + arg2 * m) / m
}



const getScoreLevelOption = (viewMode) => getAction(huayi_sjwh_url + 'option/scoreLevel/list/' + _skId + '/' + viewMode);
const getScoreLevelDeptOption = (viewMode) => getAction(huayi_sjwh_url + 'option/scoreLevelDept/list/' + _skId + '/' + viewMode);
const getKnowledgeOption = (knowledgeType, knowledgeTwoId) => getAction(huayi_sjwh_url + 'option/knowledge/list/' + PseudoNull.UUID + '/' + knowledgeType + '?knowledgeTwoId=' + knowledgeTwoId);
// 只有湖北项目申报使用
const getKnowledgeOptionHubei = (knowledgeType, knowledgeTwoId) => getAction(huayi_sjwh_url + 'option/knowledge/list/' + _skId + '/' + knowledgeType + '?knowledgeTwoId=' + knowledgeTwoId);
const getHoldTypeOption = (viewMode) => getAction(huayi_sjwh_url + 'option/holdType/list/' + _skId + '/' + viewMode);
const getDictOption = (kindId) => getAction(huayi_sjwh_url + 'option/comDict/list/' + kindId);
const getTitleTreeData = () => getAction(huayi_sjwh_url + 'option/title/treeData/' + _skId);
const getSpecTreeData = (depth) => getAction(huayi_sjwh_url + 'option/spec/treeData/' + depth);

const frPrepare = (knowledgeId, unitId) => getAction(huayi_projectscore_url + 'fineReport/prepare/' + knowledgeId + '/' + unitId);

// 湖北适宜技术项目申报
const projDetailByIdSYJS = (projectId) => getAction(huayi_projectscore_url + 'fineReport/detailSYJS/' + projectId);
const declareProjActionSYJS = (params) => postAction(huayi_projectscore_url + 'fineReport/projSYJS/saveOrUpdate', params);

const recordProjDetailById = (projectId) => getAction(huayi_projectscore_url + 'declare/detail/' + projectId);
