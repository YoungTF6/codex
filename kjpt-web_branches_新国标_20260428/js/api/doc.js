// doc.js

String.prototype.format = function (args) {
    if (arguments.length > 0) {
        var result = this;
        if (arguments.length === 1 && typeof (args) == "object") {
            for (var key in args) {
                var reg = new RegExp("({" + key + "})", "g");
                result = result.replace(reg, args[key]);
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] === undefined) {
                    return "";
                } else {
                    var reg = new RegExp("({[" + i + "]})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
        return result;
    } else {
        return this;
    }
}

const _userTypeDict = {
    '11': 'gov',
    '12': 'unit',
    '13': 'dept',
    '14': 'student',
    '15': 'expert'
};

const _unitUserTypeDict = {
    '3': 'city',
    '4': 'city',
    '5': 'province',
};

const _skEnum = {
    '6427ddba-c02f-4229-bd73-49fc1c5d21f6': {prefix: 'https://kjpt.wsglw.net/doc/qinghai', province: 'qinghai'},
    // '08e44437-5789-44e0-8ff8-9ecb00a6348a': {prefix: 'https://kjpt.wsglw.net/doc/neimeng', province: 'neimeng'},
    // '73ba18db-33fd-4746-ab41-9beb009f69a1': {prefix: 'https://kjpt.wsglw.net/doc/hubei', province: 'hubei'},
    'eee87ca0-7df1-426c-aae3-7cae782b4d6b': {prefix: 'https://kjpt.wsglw.net/doc/ningxia', province: 'ningxia'},
    '7068a5c0-2cd3-471a-90b9-9bf100aec95a': {prefix: 'https://kjpt.wsglw.net/doc/gansu', province: 'gansu'},
    '6eec6713-670a-43cc-ad4d-9bd700a92928': {prefix: 'http://218.77.183.146:18011/doc/hainan', province: 'hainan'},
    '8b1e9418-47ff-4ff7-9dd9-a9e0009a6951': {prefix: 'http://220.160.53.27:18021/doc/fujian', province: 'fujian'},
    '4a6d91fb-8ba4-4560-a801-9c6f00e6d999': {prefix: 'http://211.97.79.16:18001/doc/guangxi', province: 'guangxi'},
}

let pdp = `${window.location.protocol}//${window.location.host}`;

const getDocUrl = () => {
    const _kkFileView = "https://kkfile.91huayi.com/onlinePreview?url="
    const _standardKindId = localStorage.getItem('standardkind-id');
    const _userType = localStorage.getItem('user-type');
    const _unitUserType = localStorage.getItem('unit-user-type');
    let fileUrl = 'https://kyxmUploadFile.91huayi.com/uploadFile/hainan/test/219999/20220830/ATAM_33a076aa-f9a9-4afc-8135-e9f2d40b2a5f.pdf';

    const _sk = _skEnum[_standardKindId];
    if (_sk) {
        let url = pdp + '/doc/{province}/{fileName}#toolbar=0&navpanes=0&scrollbar=0&zoom=100';
        let fileName = _userTypeDict[_userType];
        if ('11' === _userType) {
            fileName += ('-' + _unitUserTypeDict[_unitUserType]);
        }
        fileName = 'doc-' + fileName + '.pdf';
        let res = url.format({
            province: _sk['province'],
            fileName: fileName
        });
        console.info('doc: %s', res);
        return res;
    } else {
        return '';
    }


}
