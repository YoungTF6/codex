let _upld = {
    layerIndex: null,
    file_null: {'file_name': '', 'file_url': '', 'file_size': 0, 'fake_id': null},
    file: null,
    fileArr: [],
    // xgb _cur_year
    path: `/bulu/2025/${_standardKindId}`,
    render: function () {
        const _that = this;
        layui.upload.render({
            elem: '#btn_upload',
            url: `${huayi_upload_url}uploadApi/upload`,
            size: 15 * 1024,
            accept: 'file',
            exts: 'pdf|png|jpg|jpeg',
            multi: false,
            choose: function (obj) {
                _that.reset_single();
                _that.layerIndex = layui.lat.loadingShade();
            },
            before: function (obj) {
                let files = this.files = obj.pushFile();
                for (let key in files) {
                    _that.file.file_name = files[key].name;
                    _that.file.file_size = (files[key].size / 1014).toFixed(1);
                    _that.file.fake_id = new Date().getTime();
                }
                let fileType = isImg(_that.file.file_name) ? 'IMAGE' : 'DOC';
                this.data = {
                    fileType: fileType,
                    path: _that.path,
                }
            },
            done: function (res, index, upload) {
                delete this.files[index];
                if (res.code !== 200) {
                    _that.reset_single();
                    layui.lat.failMsg('上传失败');
                } else {
                    _that.file.file_url = res.data.picUrl;
                    _that.appendFile([JSON.parse(JSON.stringify(_that.file))]);
                }
                layui.layer.close(_that.layerIndex);
            },
            error: function () {
                layui.lat.errorMsg('上传失败');
            }
        });
    },
    appendFile: function (_fileArr) {
        const _that = this;
        for (let i = 0; i < _fileArr.length; ++i) {
            let f = _fileArr[i];
            let name = f.file_name;
            let url = f.file_url;
            let fakeid = f.fake_id;
            let str = `<li>
                        <a class="layui-btn layui-btn-xs btn-normal-row js-file-name" onclick="viewupldfile(this)" data-url="${url}">${name}</a>
                        <a class="layui-btn layui-btn-xs btn-danger-row" onclick="delupldfile(this)" data-action="del" data-id="" data-fakeid="${fakeid}">移除</a>
                    </li>`;
            $('#file_ul').append(str);
            _that.fileArr.push(f);
        }
    },
    reset_single: function () {
        this.file = JSON.parse(JSON.stringify(this.file_null));
    },
    reset: function () {
        this.reset_single();
        this.fileArr = [];
        $('#file_ul').empty();
    },
    getarr: function () {
        return this.fileArr;
    },
    removeFile: function (id, fid) {
        const _that = this;
        for (let i = 0; i < _that.fileArr.length; ++i)
            if (id === _that.fileArr[i].id || fid === _that.fileArr[i].fake_id) _that.fileArr.splice(i, 1);
    },
}
let _upld2 = {
    inst: null,
    limit: 5,
    fileArr: [],
    mobilets: null,
    render: function () {
        const _that = this;
        _that.inst = layui.ysUpload.render({
            elem: '#btn_file_choose',
            elemList: $('#file_list'),
            url: `${huayi_upload_url}uploadApi/upload`,
            exts: 'jpg|png|bmp|jpeg|pdf',
            size: 10 * 1024,
            accept: 'file',
            multiple: false,
            number: _that.limit,
            auto: false,
            bindAction: '#btn_file_submit',
            before: function (obj) {
                this.data = _that.getFileData(this.files);
            },
            choose: function (obj) {
                _that.enableSubmit();
                let that = this;
                let files = that.files = obj.pushFile();
                if (Object.keys(files).length + _that.fileArr.length >= _that.limit) {
                    _that.disableUpload();
                }
                obj.preview(function (index, file, result) {
                    let imgSrc = file.type.indexOf("pdf") >= 0 ? '/img/pdf.png' : result;
                    // choose local
                    let str = `<tr id="file_row_${index}">
                            <td><a>${file.name}</a></td>
                            <td>${(file.size / 1014).toFixed(1)}kb</td>
                            <td><img id="thumb_img_${index}" class="layui-upload-img thumb_img" onclick222="viewtrfile('')" src="${imgSrc}" alt="${file.name}"></td>
                            <td>未上传</td>
                            <td>
                            <a class="layui-btn layui-btn-xs hide btn_reupload">重传</a>
                            <a class="layui-btn layui-btn-xs layui-btn-danger btn_delete" type="button">删除</a>
                            </td>
                            </tr>`
                    let $tr = $(str);
                    that.elemList.append($tr);
                    $tr.find('.btn_reupload').on('click', function () {
                        obj.upload(index, file);
                    });
                    $tr.find('.btn_delete').on('click', function (event) {
                        // removeFilePc
                        layui.layer.confirm('确认删除', {icon: 3, title: '提示'}, function (widx) {
                            for (let i = 0; i < _that.fileArr.length; i++) {
                                if (_that.fileArr[i].fake_id === index) {
                                    _that.fileArr.splice(i, 1);
                                    break;
                                }
                            }
                            delete files[index];
                            $tr.remove();
                            _that.inst.config.elem.next()[0].value = '';
                            _that.enableUpload();
                            (0 === Object.keys(files).length) && _that.disableSubmit();
                            layui.layer.close(widx);
                        });
                    });
                    $(`#thumb_img_${index}`).bind('click', function () {
                        viewtrfile(result);
                    });
                });
            },
            done: function (res, index, upload) {
                let that = this;
                if (res.code === 200) {
                    let tr = that.elemList.find(`tr#file_row_${index}`), tds = tr.children();
                    tds.eq(3).html('已上传');
                    tds.eq(4).find('.btn_reupload').addClass('layui-hide');
                    _that.fileArr.push({
                        'file_name': that.files[index].name,
                        'file_url': res.data.picUrl,
                        'file_size': (that.files[index].size / 1014).toFixed(1),
                        'fake_id': index,
                    });
                    delete that.files[index];
                    (0 === Object.keys(that.files).length) && _that.disableSubmit();
                    return;
                }
                that.error(index, upload);
            },
            allDone: function (obj) {
            },
            error: function (index, upload) {
                let that = this;
                let tr = that.elemList.find(`tr#file_row_${index}`), tds = tr.children();
                tds.eq(3).html('上传失败');
                tds.eq(4).find('.btn_reupload').removeClass('layui-hide');
            }
        });
        _that.bindMobile();
    },
    appendFile: function (_fileArr, fromMobile) {
        if (!_fileArr || _fileArr.length < 1) {
            return false;
        }
        const _that = this;
        let tmpArr = _that.filter(_fileArr);
        let $fileList = $("#file_list");
        for (let i = 0; i < tmpArr.length; i++) {
            if (_that.fileArr.length >= _that.limit) {
                break;
            }
            let tmpFile = tmpArr[i];
            let name = tmpFile.file_name;
            let url = tmpFile.file_url;
            let size = tmpFile.file_size;
            let fid = 'uuid_' + uuid();
            if (fromMobile) {
                name = tmpFile.fileName;
                url = tmpFile.scorePhotoUrl;
                size = tmpFile.photoSize;
                fid = tmpFile.keyId;
            }
            _that.fileArr.push({'file_name': name, 'file_url': url, 'file_size': size, 'fake_id': fid,});
            // 1.edit echo  2.mobile 
            let tr = `<tr id="file_row_${fid}">
                    <td>${name}</td>
                    <td>${size}kb</td>
                    <td><img id="" class="thumb_img" onclick="viewtrfile('${url}')" src="//images.weserv.nl/?url=${url}" alt="${name}"></td>
                    <td>已上传</td>
                    <td>
                    <a class="layui-btn layui-btn-xs layui-btn-danger" data-id="" data-fakeid="${fid}" onclick="deletetrfile(this)">删除</a>
                    </td>
                    </tr>`;
            $fileList.append(tr);
        }
        if ($fileList.children().length >= _that.limit) {
            _that.disableUpload();
        }
    },
    reset: function () {
        $('#file_list').empty();
        this.fileArr = [];
        this.enableUpload();
        this.disableSubmit();
    },
    getarr: function () {
        return this.fileArr;
    },
    filter: function (_fileArr) {
        const _that = this;
        let res = [];
        label:for (let i = 0; i < _fileArr.length; i++) {
            for (let j = 0; j < _that.fileArr.length; j++) {
                let new_url = _fileArr[i].file_url || _fileArr[i].scorePhotoUrl;
                let exist_url = _that.fileArr[j].file_url;
                if (new_url === exist_url) continue label;
            }
            res.push(_fileArr[i]);
        }
        return res;
    },
    removeFileMobile: function (elem) {
        const _that = this;
        layui.layer.confirm('确认删除', {icon: 3, title: '提示'}, function (widx, layero) {
            let fid = elem.getAttribute("data-fakeid");
            function del() {
                for (let i = 0; i < _that.fileArr.length; i++) {
                    if (_that.fileArr[i].fake_id === fid) {
                        _that.fileArr.splice(i, 1);
                        break;
                    }
                }
                elem.parentElement.parentElement.remove();
                _that.enableUpload();
                layui.layer.close(widx);
            }
            if (fid.startsWith('uuid_')) del();
            else {
                let visit = `${huayi_projectscore_url}cmeSingleprojScoreMobilePhoto/deleteById?keyId=${fid}`;
                postAction(visit).then(response => {
                    let jsonRes = response.data;
                    del();
                }).catch(() => {
                });
            }
        });
    },
    getFileData: function (fileObj) {
        let res = {};
        let year = new Date().getFullYear();
        let path = `/individualScoreManage/${_standardKindId}/${year}/${_unitId}`;
        for (let key in fileObj) {
            let fileData = {path: path, scale: 0.6, outputQuality: 0.6};
            if (fileObj[key].size > 3000000) {
                fileData = {path: path, scale: 0.3, outputQuality: 0.3};
            }
            const tempType = fileObj[key].type;
            if (tempType.indexOf("image") >= 0) {
                fileData.fileType = "IMAGE";
            } else if (tempType.indexOf("application/pdf") >= 0) {
                fileData.fileType = "DOC";
            } else {
                fileData.fileType = "OTHER";
            }
            res[key] = fileData;
        }
        return res;
    },
    loadMobileFile: function () {
        const _that = this;
        let visit = `${huayi_projectscore_url}cmeSingleprojScoreMobilePhoto/list`;
        let params = {userId: _userId, timestamp: _that.mobilets};
        postAction(visit, params).then(response => {
            let jsonRes = response.data;
            let fileArr = jsonRes.data;
            _that.appendFile(fileArr, true);
        });
    },
    bindMobile: function () {
        const _that = this;
        $("#btn_file_mobile").click(function () {
            _that.mobilets = new Date().getTime();
            let uploadFileNum = $("#file_list").children().length;
            let a = window.location.origin;
            if (a.includes('localhost')) a = 'http://testkjpt.wsglw.net';
            let mobileUrl = `${a}/pages/mobile/scoreImgUpload.html?userId=${_userId}&unitId=${_unitId}&standardkindId=${_standardKindId}&timestamp=${_that.mobilets}&configFileNum=${_that.limit}&uploadFileNum=${uploadFileNum}`;
            $('#qr_code').empty().qrcode({
                text: mobileUrl,
                width: '280',
                height: '280'
            });
            layui.layer.open({
                type: 1,
                title: false,
                closeBtn: false,
                area: ['300px', '300px'],
                shade: 0.6,
                shadeClose: true,
                scrollbar: true,
                id: 'LAY_layuipro',
                moveType: 1,
                content: $(`#qr_code`),
                end: function () {
                    $('#qr_code').hide();
                    _that.interval && clearInterval(_that.interval);
                }
            });
            _that.interval = setInterval(function () {
                _that.loadMobileFile();
            }, 2000);
        });
    },
    disableSubmit: function () {
        $("#btn_file_submit").addClass("layui-btn-disabled").attr("disabled", true);
    },
    enableSubmit: function () {
        $("#btn_file_submit").removeClass("layui-btn-disabled").attr("disabled", false);
    },
    disableUpload: function () {
        $("#btn_file_choose").addClass("layui-btn-disabled").attr("disabled", true);
        $("#btn_file_mobile").addClass("layui-btn-disabled").attr("disabled", true);
    },
    enableUpload: function () {
        $("#btn_file_choose").removeClass("layui-btn-disabled").attr("disabled", false);
        $("#btn_file_mobile").removeClass("layui-btn-disabled").attr("disabled", false);
    },
};
window.delupldfile = function (elem) {
    let id = $(elem).data('id'), fid = $(elem).data('fakeid');
    _upld.removeFile(id, fid);
    $(elem).parent('li').remove();
}
// window.viewupldfile
window.deletetrfile = function (elem) {
    _upld2.removeFileMobile(elem);
}
window.viewtrfile = function (url) {
    console.log(url);
}