
layui.define(['element', 'laytpl', 'upload'], function (exports) {
    var $ = layui.$;
    var element = layui.element;
    var upload = layui.upload;
    var laytpl = layui.laytpl;

    var constanCompetencyURL = null;

    var url = location.hash;
    console.log(url);
    var Request = new Object();
    if (url.indexOf("#") != -1) {
        var str = url.substr(1)　//去掉#号
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            Request[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    //console.log(Request);
    var train_id = Request["train_id"];
    train_id = '7B0E6553-1E55-42CF-B4A1-0041A97B5874';//测试，注释 
    //console.log('train_id='+train_id);

    if (train_id == undefined || train_id == '') {
        layer.alert('参数错误');
        return;
    }







    var intervalImgPersonNum = null;//定时器更新图片人数
    var ImgPersonNumUpdate = false;//图片人数未更新
    //资料类型：1通知2培训课程3培训图片4考试成绩                   
    var train = {
        getList: function (train_id, materials_type) {
            $.ajax({
                type: "post",
                url: constanCompetencyURL + "files/getTrainMaterial",
                data: {
                    train_id: train_id,
                    materials_type: materials_type
                },
                dateType: 'json',
                beforeSend: function () {}
                , success: function (res) {
                    console.log(res);
                    var getTpl;
                    var view;
                    if (materials_type == '1') {
                        getTpl = $("#demo-tongzhi").html();
                        view = document.getElementById('view-tongzhi-list');
                        laytpl(getTpl).render(res, function (html) {
                            view.innerHTML = html;
                            //初始化上传控件
                            train.initUpdloadTongzhi();
                        });
                    }
                    else if (materials_type == '2') {
                        getTpl = $("#demo-kejian").html();
                        view = document.getElementById('view-kejian-list');
                        laytpl(getTpl).render(res, function (html) {
                            view.innerHTML = html;
                            //初始化上传控件
                            train.initUpdloadKeJian();
                        });
                    }
                    else if (materials_type == '3') {
                        getTpl = $("#demo-img").html();
                        view = document.getElementById('view-img-list');
                        laytpl(getTpl).render(res, function (html) {
                            view.innerHTML = html;
                            //初始化上传控件
                            train.initUpdloadImg();
                        });
                    }
                    else if (materials_type == '4') {
                        getTpl = $("#demo-chengji").html();
                        view = document.getElementById('view-chengji-list');
                        laytpl(getTpl).render(res, function (html) {
                            view.innerHTML = html;
                            //初始化上传控件
                            train.initUpdloadChengJi();
                        });
                    }


                },
                error: function (XMLHttpRequest, textStatus, errorThrown) { }
            });
        }
        , deleteTrain: function (train_id, materials_id, materials_type) {
            console.log('删除:' + materials_id);
            layer.confirm('确定删除吗?', { icon: 3, title: '提示' }, function (index) {
                $.ajax({
                    type: "post",
                    url: constanCompetencyURL + "files/deleteTrainMaterial",
                    data: {
                        train_id: train_id,
                        materials_id: materials_id
                    },
                    dataType: "json",
                    success: function (res) {
                        console.log(res);
                        layer.msg(res.message);
                        if (res.code == 0) {
                            train.getList(train_id, materials_type);
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) { }
                });
                layer.close(index);
            });
        }
        , getPreviewUrl: function (train_id, materials_id) {
            console.log('预览:' + materials_id);
            $.ajax({
                type: "post",
                url: constanCompetencyURL + "files/getTrainMaterialInfo",
                data: {
                    train_id: train_id,
                    materials_id: materials_id
                },
                dataType: "json",
                success: function (res) {
                    console.log(res);
                    if (res.code == 0) {
                        var obj = res.body.body[0];
                        var goURL = "previewFile.html#fileurl=" + obj.file_url + "&filetype=" + obj.file_type;
                        console.log(goURL);
                        window.open(goURL, '_blank');
                    } else {
                        layer.msg(res.message);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) { }
            });

        }
        , startGetImgPersonNum: function () {
            intervalImgPersonNum = setInterval(train.getImgPersonNum, 3000);
        }
        , stopGetImgPersonNum: function () {
            if (intervalImgPersonNum != null) {
                clearInterval(intervalImgPersonNum);
            }
        }
        , getImgPersonNum: function () {
            //console.log('获取人数'+Math.random());           
            //接口判断图片人数是否更新
            if (!ImgPersonNumUpdate) {
                $.ajax({
                    type: "post",
                    url: constanCompetencyURL + "files/checkImgPersonNum",
                    data: {
                        train_id: train_id,
                        materials_type: 3
                    },
                    dataType: "json",
                    success: function (res) {
                        //console.log(res);
                        if (res.code == 0) {
                            console.log('未更新数=' + res.body)
                            ImgPersonNumUpdate = res.body > 0 ? false : true;
                            train.getList(train_id, 3);
                        } else {
                            console.log('更新图片人数接口失败');
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) { }
                });
            } else {
                train.stopGetImgPersonNum();
            }
        }
        , getTuBiao: function (file_type) {
            if (file_type == 'image') {
                return 'img/jpg.png';
            } else if (file_type == 'word') {
                return 'img/doc.png';
            } else if (file_type == 'execl') {
                return 'img/xls.png';
            } else if (file_type == 'ppts') {
                return 'img/ppt.png';
            } else if (file_type == 'pdf') {
                return 'img/pdf.png';
            } else {
                return 'img/no.png';
            }
        }
        , initUpdloadImg: function () {
            //3上传图片
            upload.render({
                elem: '#upload-px-img'
                , url: constanCompetencyURL + 'files/upfiles'
                , field: 'files'
                , acceptMime: 'image/*'//'image/jpg, image/png'（只显示 jpg 和 png 文件）
                , data: {
                    train_id: train_id,
                    materials_type: 3
                }
                , before: function (obj) {
                    layer.msg('正在上传...', {
                        icon: 16
                        , shade: [0.2, '#393D49']
                        , shadeClose: false
                        , time: 0
                    });
                    //预读本地文件示例，不支持ie8
                    obj.preview(function (index, file, result) {
                        //$('#upload-img-preview').attr('src', result); //图片链接（base64）
                    });
                }
                , done: function (res) {
                    console.log(res);
                    layer.msg(res.body.message);
                    train.getList(train_id, 3);
                    train.startGetImgPersonNum();
                    //return layer.msg(res.message + res.body);
                }
                , error: function () {
                    //演示失败状态，并实现重传                   
                }
            });
        }, initUpdloadTongzhi: function () {
            //1上传通知
            upload.render({
                elem: '#upload-px-tongzhi'
                , url: constanCompetencyURL + 'files/upfiles'
                , field: 'files'
                //, acceptMime: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                , accept: 'file'
                , data: {
                    train_id: train_id,
                    materials_type: 1
                }
                , before: function (obj) {
                    layer.msg('正在上传...', {
                        icon: 16
                        , shade: [0.2, '#393D49']
                        , shadeClose: false
                        , time: 0
                    });
                }
                , done: function (res) {
                    console.log(res);
                    layer.msg(res.body.message);
                    train.getList(train_id, 1);
                    //return layer.msg(res.message + res.body);
                }
                , error: function () {
                    //演示失败状态，并实现重传                   
                }
            });

        }, initUpdloadKeJian: function () {
            //2上传课件
            upload.render({
                elem: '#upload-px-kejian'
                , url: constanCompetencyURL + 'files/upfiles'
                , field: 'files'
                //, acceptMime: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                , accept: 'file'
                , data: {
                    train_id: train_id,
                    materials_type: 2
                }
                , before: function (obj) {
                    layer.msg('正在上传...', {
                        icon: 16
                        , shade: [0.2, '#393D49']
                        , shadeClose: false
                        , time: 0
                    });
                }
                , done: function (res) {
                    console.log(res);
                    layer.msg(res.body.message);
                    train.getList(train_id, 2);
                    //return layer.msg(res.message + res.body);
                }
                , error: function () {
                    //演示失败状态，并实现重传                   
                }
            });
        }, initUpdloadChengJi: function () {
            //4上传成绩
            upload.render({
                elem: '#upload-px-chengji'
                , url: constanCompetencyURL + 'files/upfiles'
                , field: 'files'
                //, acceptMime: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                , accept: 'file'
                , data: {
                    train_id: train_id,
                    materials_type: 4
                }
                , before: function (obj) {
                    layer.msg('正在上传...', {
                        icon: 16
                        , shade: [0.2, '#393D49']
                        , shadeClose: false
                        , time: 0
                    });
                }
                , done: function (res) {
                    console.log(res);
                    layer.msg(res.body.message);
                    train.getList(train_id, 4);
                    //return layer.msg(res.message + res.body);
                }
                , error: function () {
                    //演示失败状态，并实现重传                   
                }
            });
        }
        , getUploadEWM: function () {
            $.ajax({
                type: "post",
                url: constanCompetencyURL + "files/getUUID?r=" + (new Date()).valueOf(),
                //async: false,                
                success: function (res) {
                    if (res.code == 0) {
                        $("#uuid").val(res.body);
                        layer.open({
                            type: 2,
                            area: ['280px', '280px'],
                            fixed: false, //不固定             
                            title: false,
                            closeBtn: 1,
                            //shadeClose: true,
                            skin: 'yourclass',
                            content: 'ewm.html#train_id=' + train_id + '&materials_id=' + res.body,
                            end: function () {
                                console.log('停止');
                                ewmModel.stopQuery();
                            }
                        });
                        ewmModel.startQuery();
                    }
                }
            });
        }
        , getListCS: function () {
            alert('测试');
        }
    }

    var intervalId = null;
    var ewmModel = {
        startQuery: function () {
            intervalId = setInterval(ewmModel.QueryQRCodeImgState, 2000);
        }
        , stopQuery: function () {
            if (intervalId != null) {
                clearInterval(intervalId);
            }
        }
        , QueryQRCodeImgState: function () {
            var uuid = $("#uuid").val();
            //console.log(uuid);
            $.ajax({
                type: "post",
                url: constanCompetencyURL + "files/checkFile?r=" + (new Date()).valueOf(),
                //async: false,
                dataType: "json",
                data: {
                    train_id: train_id,
                    materials_id: uuid
                },
                success: function (res) {
                    console.log(res);
                    if (res.code == 0) {
                        ewmModel.stopQuery();
                        layer.closeAll();
                        //$("#qrCodeDiv").hide();
                        train.getList(train_id, 3);
                    }
                }
            });
        }
    }

    // //手机上传-生成二维码
    // $("#upload-px-img-mobile111111111").click(function () {
    //     var ewmURL = '';  
    //     //获取控件绝对位置
    //     var curtop = '55px';
    //     var curright = '120px';
    //     //控制显示隐藏
    //     if ($('#qrCodeDiv').css("display") == "none") {
    //         $('#qrCodeDiv').show();
    //         $('#qrCodeDiv').css('top', curtop).css('right', curright);
    //         //生成二维码
    //         $("#qrCodeDiv").empty();

    //         $.ajax({
    //             type: "post",
    //             url: constanCompetencyURL + "files/getUUID?r=" + (new Date()).valueOf(),
    //             //async: false,                
    //             success: function (res) {
    //                 console.log(res);
    //                 if (res.code == 0) {
    //                     $("#uuid").val(res.body);
    //                     jQuery('#qrCodeDiv').qrcode({
    //                         text: ewmURL + 'uploadEWM.html#train_id=' + train_id + '&materials_id=' + res.body,
    //                         correctLevel: 0,
    //                         width: 200,
    //                         height: 200
    //                     });
    //                     ewmModel.startQuery();
    //                 }
    //             }
    //         });

    //     } else {
    //         $('#qrCodeDiv').hide();
    //         ewmModel.stopQuery();
    //     }
    //     event.stopPropagation();
    // });

    // $("body").click(function () {
    //     $('#qrCodeDiv').hide();
    //     ewmModel.stopQuery();
    // });



    train.getList(train_id, 1);
    train.getList(train_id, 2);
    train.getList(train_id, 3);
    train.getList(train_id, 4);

    //train.startGetImgPersonNum();



    exports('train', train);

});