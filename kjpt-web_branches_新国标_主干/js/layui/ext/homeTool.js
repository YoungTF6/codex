//首页工具，用于定制化显示相关内容
//首页如果再增加个性化显示，可以继续增加方法
layui.define(['jquery', 'form', 'layer', 'laydate','table'], function (exports) {
    let $ = layui.jquery;
    let form = layui.form;
    let layer = layui.layer;
    let laydate = layui.laydate;
    let table = layui.table;
    const unitUserType  = localStorage.getItem('unit-user-type');
    const userStandardkindId = localStorage.getItem("standardkind-id");
    //显示地图的套
    const showProvincesMapSelector = ['190c480d-d43c-450b-8472-a6fd00a6729d'];
    //首页悬浮框
    const homeFloatingChatImg = 'home_floating_chat_img';
    const homeFloatingDoc = 'home_floating_doc';

    const cityUnitCode = ["330004","330005","330006","330008","330011","330007","330009","330012","330014","330010","330013"];
    const cityUnitChild = {
        //杭州市
        "330004":["330039","330166","330158","330057","330189","330208","330181","330223","330174","337130","330226","330215","330220"],
        //宁波市
        "330005":["330028","330041","330048","330042","330049","330058","330062","330061","330063","330056"],
        //温州市
        "330006":["330034","330030","330036","330045","330172","330130","330055","330169","330160","330147","330052","336845"],
        //嘉兴市
        "330008":["330086","330091","330067","330122","330151","330106","330152"],
        //湖州市
        "330011":["330077","330082","330074","330080","330075"],
        //绍兴市
        "330007":["330095","330076","330108","330124","330040","330155"],
        //金华市
        "330009":["330133","330129","330141","330142","330143","330134","330016","330139","330140"],
        //衢州市
        "330012":["330127","330131","330132","330137","330138","330135"],
        //舟山市
        "330014":["330206","330231","330112","330232"],
        //台州市
        "330010":["330032","330033","330037","330054","330047","330050","330046","330059","330060"],
        //丽水市
        "330013":["330198","330191","330200","330195","330194","330196","330193","330197","330192"]
    };
    //地图地区id----继教系统机构id
    const zheJiangMapIdToUnitId = {
        //杭州市
        "330100":"330004",
        "330102":"330039",//上城区
        "330105":"330166",//拱墅区
        "330106":"330158",//西湖区
        "330108":"330057",//滨江区
        "330109":"330189",//萧山区
        "330110":"330208",//余杭区
        "330111":"330181",//富阳区
        "330112":"330223",//临安区
        "330114":"330174",//钱塘区
        "330113":"337130",//临平区
        "330122":"330226",//桐庐县
        "330127":"330215",//淳安县
        "330182":"330220",//建德市
        //宁波市
        "330200":"330005",
        "330203":"330028",//海曙区
        "330205":"330041",//江北区
        "330206":"330048",//北仑区
        "330211":"330042",//镇海区
        "330212":"330049",//鄞州区
        "330213":"330058",//奉化区
        "330225":"330062",//象山县
        "330226":"330061",//宁海县
        "330281":"330063",//余姚市
        "330282":"330056",//慈溪市
        //温州市
        "330300":"330006",
        "330302":"330034",//鹿城区
        "330303":"330030",//龙湾区
        "330304":"330036",//瓯海区
        "330305":"330045",//洞头区
        "330324":"330172",//永嘉县
        "330326":"330130",//平阳县
        "330327":"330055",//苍南县
        "330328":"330169",//文成县
        "330329":"330160",//泰顺县
        "330381":"330147",//瑞安市
        "330382":"330052",//乐清市
        "330383":"336845",//龙港市
        //嘉兴市
        "330400":"330008",
        "330402":"330086",//南湖区
        "330411":"330091",//秀洲区
        "330421":"330067",//嘉善县
        "330424":"330122",//海盐县
        "330481":"330151",//海宁市
        "330482":"330106",//平湖市
        "330483":"330152",//桐乡市
        //湖州市
        "330500":"330011",
        "330502":"330077",//吴兴区
        "330503":"330082",//南浔区
        "330521":"330074",//德清县
        "330522":"330080",//长兴县
        "330523":"330075",//安吉县
        //绍兴市
        "330600":"330007",
        "330602":"330095",//越城区
        "330603":"330076",//柯桥区
        "330604":"330108",//上虞区
        "330624":"330124",//新昌县
        "330681":"330040",//诸暨市
        "330683":"330155",//嵊州市
        //金华市
        "330700":"330009",
        "330702":"330133",//婺城区
        "330703":"330129",//金东区
        "330723":"330141",//武义县
        "330726":"330142",//浦江县
        "330727":"330143",//磐安县
        "330781":"330134",//兰溪市
        "330782":"330016",//义乌市
        "330783":"330139",//东阳市
        "330784":"330140",//永康市
        //衢州市
        "330800":"330012",
        "330802":"330127",//柯城区
        "330803":"330131",//衢江区
        "330822":"330132",//常山县
        "330824":"330137",//开化县
        "330825":"330138",//龙游县
        "330881":"330135",//江山市
        //舟山市
        "330900":"330014",
        "330902":"330206",//定海区
        "330903":"330231",//普陀区
        "330921":"330112",//岱山县
        "330922":"330232",//嵊泗县
        //台州市
        "331000":"330010",
        "331002":"330032",//椒江区
        "331003":"330033",//黄岩区
        "331004":"330037",//路桥区
        "331022":"330054",//三门县
        "331023":"330047",//天台县
        "331024":"330050",//仙居县
        "331081":"330046",//温岭市
        "331082":"330059",//临海市
        "331083":"330060",//玉环市
        //丽水市
        "331100":"330013",
        "331102":"330198",//莲都区
        "331121":"330191",//青田县
        "331122":"330200",//缙云县
        "331123":"330195",//遂昌县
        "331124":"330194",//松阳县
        "331125":"330196",//云和县
        "331126":"330193",//庆元县
        "331127":"330197",//景宁畲族自治县
        "331181":"330192",//龙泉市
    };

    //继教系统机构id----地图地区id
    const zheJiangUnitIdToMapId = {
        "330004":"330100",
        "330039":"330102",
        "330166":"330105",
        "330158":"330106",
        "330057":"330108",
        "330189":"330109",
        "330208":"330110",
        "330181":"330111",
        "330223":"330112",
        "330174":"330114",
        "337130":"330113",
        "330226":"330122",
        "330215":"330127",
        "330220":"330182",
        "330005":"330200",
        "330028":"330203",
        "330041":"330205",
        "330048":"330206",
        "330042":"330211",
        "330049":"330212",
        "330058":"330213",
        "330062":"330225",
        "330061":"330226",
        "330063":"330281",
        "330056":"330282",
        "330006":"330300",
        "330034":"330302",
        "330030":"330303",
        "330036":"330304",
        "330045":"330305",
        "330172":"330324",
        "330130":"330326",
        "330055":"330327",
        "330169":"330328",
        "330160":"330329",
        "330147":"330381",
        "330052":"330382",
        "336845":"330383",
        "330008":"330400",
        "330086":"330402",
        "330091":"330411",
        "330067":"330421",
        "330122":"330424",
        "330151":"330481",
        "330106":"330482",
        "330152":"330483",
        "330011":"330500",
        "330077":"330502",
        "330082":"330503",
        "330074":"330521",
        "330080":"330522",
        "330075":"330523",
        "330007":"330600",
        "330095":"330602",
        "330076":"330603",
        "330108":"330604",
        "330124":"330624",
        "330040":"330681",
        "330155":"330683",
        "330009":"330700",
        "330133":"330702",
        "330129":"330703",
        "330141":"330723",
        "330142":"330726",
        "330143":"330727",
        "330134":"330781",
        "330016":"330782",
        "330139":"330783",
        "330140":"330784",
        "330012":"330800",
        "330127":"330802",
        "330131":"330803",
        "330132":"330822",
        "330137":"330824",
        "330138":"330825",
        "330135":"330881",
        "330014":"330900",
        "330206":"330902",
        "330231":"330903",
        "330112":"330921",
        "330232":"330922",
        "330010":"331000",
        "330032":"331002",
        "330033":"331003",
        "330037":"331004",
        "330054":"331022",
        "330047":"331023",
        "330050":"331024",
        "330046":"331081",
        "330059":"331082",
        "330060":"331083",
        "330013":"331100",
        "330198":"331102",
        "330191":"331121",
        "330200":"331122",
        "330195":"331123",
        "330194":"331124",
        "330196":"331125",
        "330193":"331126",
        "330197":"331127",
        "330192":"331181"
    };


    const zheJiangCityJsonMap = {
        '330100': {name:'杭州市',json:'/js/map/zheJiang/330100_full.json'},
        '330200': {name:'宁波市',json:'/js/map/zheJiang/330200_full.json'},
        '330300': {name:'温州市',json:'/js/map/zheJiang/330300_full.json'},
        '330400': {name:'嘉兴市',json:'/js/map/zheJiang/330400_full.json'}, 
        '330500': {name:'台州市',json:'/js/map/zheJiang/330500_full.json'},
        '330600': {name:'绍兴市',json:'/js/map/zheJiang/330600_full.json'},
        '330700': {name:'金华市',json:'/js/map/zheJiang/330700_full.json'},
        '330800': {name:'衢州市',json:'/js/map/zheJiang/330800_full.json'},
        '330900': {name:'舟山市',json:'/js/map/zheJiang/330900_full.json'},
        '331000': {name:'丽水市',json:'/js/map/zheJiang/331000_full.json'},
        '331100': {name:'丽水市',json:'/js/map/zheJiang/331100_full.json'},
    };

    


    let homeTool = {
        //控制权限
        controlPermission: function (backFun=()=>{}) {
            if (unitUserType == 5) {
                backFun();
                return;
            } else if(unitUserType == 4) {
                backFun();
                return;
            }
            console.log('非省厅用户，不显示地图');
        },
        //控制点击事件，显示地图
        bindElemClick: function (tempEl,backFun=()=>{}) {
            if(!tempEl) return;
            $(`${tempEl}`).click(function(elem){
                backFun(this);
            })
        },
        createMap: function (id,echartSets,option) {
            // 获取mapBox元素
            let mapChart = document.getElementById(`${id}`);
            if (!mapChart) return;
            
            // 初始化echarts实例
            let tempMyChart = echartSets.init(mapChart);
 
            // 使用配置项显示地图
            tempMyChart.setOption(option);
            
            // 动态生成地图名称div
            // 先获取地图容器的父元素
            let mapContainer = mapChart.parentNode;
            
            // 检查是否已存在地图名称div，如果存在则先移除
            let existingMapNameDiv = mapContainer.querySelector('.map-name-div');
            if (existingMapNameDiv) {
                existingMapNameDiv.remove();
            }
            
            // 创建地图名称div
            let mapNameDiv = document.createElement('div');
            mapNameDiv.className = 'map-name-div';
            
            // 设置地图名称文本
            // 从option中获取地图名称，如果option中没有，则使用默认值
            let mapName = '';
            if (option && option.series && option.series[0] && option.series[0].map) {
                mapName = option.series[0].map;
            }
            mapNameDiv.textContent = mapName;
            
            
            // 将div添加到地图容器中
            mapContainer.appendChild(mapNameDiv);
            
            // 响应窗口大小变化
            window.addEventListener('resize', function() {
                tempMyChart.resize();
            });
            return tempMyChart;
        },
        //点击事件，显示地图，目前只有浙江省卫健委使用
        clickShowMap: function (tempObj) {
            if(tempObj){
                for (let key in tempObj) {
                    const val = tempObj[key];
                    $(`${key}`).click(function(){
                        $(`${val}`).show();
                    })
                }
            }
        },
        //点击事件，某些元素显示
        clickElemShow: function (tempObj) {
            if(tempObj){
                for (let key in tempObj) {
                    const val = tempObj[key];
                    $(`${key}`).click(function(){
                        $(`${val}`).show();
                    })
                }
            }
        },
        getUnderUnitStatisticsByUnit: function(unitIds,backFun=()=>{}) {
            let url = huayi_projectscore_url + "sumJjpersonStateTotal/getUnderUnitStatisticsByUnit";
            let params = {unitIds: unitIds.join(",") };
            $.ajax({
                url: url,
                type: "GET",
                contentType: "application/json",
                data: params,
                success: function (res) {
                    backFun(res);
                },
                error: function (xhr, status, error) {
                    console.error("请求失败:", error);
                }
            });
        },
        bindCheckboxChange: function (filter, callback) {
            layui.form.on('checkbox(' + filter + ')', function(data) {
                if (typeof callback === 'function') {
                    callback(data);
                }
            });
        },
        //获取单位下的专业统计数据
        getZhiShuStatisticsByUnit: function (unitId, type, backFun=()=>{}) {
            let url = huayi_projectscore_url + "sumJjpersonStateTotal/getZhiShuStatisticsByUnit";
            let params = {unitId: unitId,type: type,standardId: userStandardkindId};
            $.ajax({
                url: url,
                type: "GET",
                contentType: "application/json",
                data: params,
                success: function (res) {
                    backFun(res);
                },
                error: function (xhr, status, error) {
                    console.error("请求失败:", error);
                }
            });
        },
        createFloatingBox : function () {
            let userType      = localStorage.getItem('user-type');
            dictTool.getUrlByStandardAndUnitType(userType, homeFloatingDoc, homeFloatingChatImg);
            
            let chatIcon = window[homeFloatingChatImg] ? `<div class="js-chat"><img src="${window[homeFloatingChatImg]}" alt="聊天图标"></div>`: '';
            let docIcon = window[homeFloatingDoc] ? `<div class="js-doc">下载操作手册</div>`: '';

            let floatingBox = $(`<div class="floating-container">${chatIcon}${docIcon}</div>`);
            floatingBox.appendTo('body');

            
            // 为i标签添加点击事件
            floatingBox.find('div').on('click', function () {
                let iconClass = $(this).attr('class');
                if (iconClass.includes('js-doc')) {
                    // 实现文件下载逻辑
                    if(window[homeFloatingDoc]) {
                        // 使用window.open方式下载，避免浏览器权限请求
                        window.open(window[homeFloatingDoc], '_blank');
                    }
                } else if (iconClass.includes('js-chat')) {
                    // 显示聊天图片弹窗
                    homeTool.showChatImageModal();
                }
            });
        },
        // 显示聊天图片弹窗
        showChatImageModal: function() {
            if (window[homeFloatingChatImg]) {
                layui.layer.open({
                    type: 1,
                    title: false,
                    shadeClose: true,
                    area: ['auto', 'auto'], // 自动适应图片大小
                    content: `<div style="padding: 20px;"><img src="${window[homeFloatingChatImg]}" style="max-width: 500px; max-height: 500px;"></div>`,
                    success: function(layero, index) {
                        // 设置弹窗为正方形
                        let imgElement = layero.find('img')[0];
                        if (imgElement) {
                            imgElement.onload = function() {
                                let size = Math.max(this.width, this.height);
                                layui.layer.style(index, {
                                    width: size + 40 + 'px', // 加上padding
                                    height: size + 40 + 'px'
                                });
                            };
                        }
                    }
                });
            }
        },
        getOptionByMapData : function (mapData,mapName,backFun=()=>{}) {
            return {
                tooltip: {
                    trigger: 'item',
                    formatter: function(params) {
                        if (params.data) {
                            return backFun(params);
                            // return `${params.name}<br/>
                            //         人口: ${params.data.population}万人<br/>
                            //         GDP: ${params.data.gdp}亿元<br/>
                            //         数值: ${params.data.value}`;
                        }
                        return params.name;
                    }
                },
                // 视觉映射组件，用于映射数据值到颜色
                visualMap: {
                    show: false,
                    left: 'right',
                    min: 100,
                    max: 1200,
                    calculable: true,
                    inRange: {
                        color: ['#6666ff', '#99ccff', '#4da6ff', '#1a75ff', '#004080'] // 从浅蓝到深蓝的渐变
                    },
                    textStyle: {
                        color: '#666'
                    }
                },
                // 工具框组件，用于显示数据视图、恢复和保存图表
                toolbox: {
                    show: false,
                    orient: 'vertical',
                    left: 'left',
                    top: 'top',
                    feature: {
                        dataView: { readOnly: false },
                        restore: {},
                        saveAsImage: {}
                    }
                },
                // 系列列表，每个系列通过 type 决定自己的图表类型
        series: [
            {
                // name: '浙江省',
                map: `${mapName}`,//浙江
                type: 'map',
                roam: false, // 允许缩放和平移
                label: {
                    show: true,
                    fontSize: 12,
                    color: '#fff'
                },
                emphasis: {
                    label: {
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 'bold'
                    },
                    itemStyle: {
                        areaColor: '#698deaff'
                    }
                },
                itemStyle: {
                    areaColor: '#000',
                    borderColor: '#6f7eaeff',
                    borderWidth: 2
                },
                data: mapData
            }
        ]
            };
        },
        getZheJiangCityJson : function (cityCode) {
            return zheJiangCityJsonMap[cityCode].json;
        },
        getZheJiangCityName : function (cityCode) {
            return zheJiangCityJsonMap[cityCode].name;
        },
        crteateMapBtnByIndex : function (index) {
            let btnHtml = ``;
            const itemArr = ['项目情况','人员情况','单位类别','单位层级'];
            for(let i = 0; i < itemArr.length; i++){
                btnHtml += `<a class="statistics-type-btn ${i == index?"st-active":""}">${itemArr[i]}</a>`;
            }
            return btnHtml;
        },
        openMapPopup : function (mapBox,mapId,index,backFun=()=>{}) {
            let btnHtml = homeTool.crteateMapBtnByIndex(index);
            layer.open({
                    type: 1, // page 层类型
                    area: ['100%', '100%'],
                    title: '数据地图',
                    content: `<div id="${mapBox}">
                        <div id="${mapId}"></div>
                        <div id="statisticsBox">
                            <div id="statisticsData"></div>
                            <div id="statisticsType">${btnHtml}</div>
                        </div></div>`,
                    success: function(layero, index, that){
                        backFun();
                    }
                });
        },
        setPersonTitleStatisticsHtml: function(data) {
            let totalNum = 0;
            for (const tempData of data) {
                let tempNum = tempData.number;
                totalNum += tempNum;
                if(tempData.title_level_name.indexOf("初级")>=0) {
                    $("#personNum2").html(tempNum);
                }
                if(tempData.title_level_name.indexOf("中级")>=0) {
                    $("#personNum3").html(tempNum);
                }
                if(tempData.title_level_name.indexOf("副高")>=0) {
                    $("#personNum4").html(tempNum);
                }
                if(tempData.title_level_name.indexOf("正高")>=0) {
                    $("#personNum5").html(tempNum);
                }
                if(tempData.title_level_name.indexOf("其他")>=0) {
                    $("#personNum6").html(tempNum);
                }
                if(tempData.title_level_name.indexOf("乡村医生")>=0) {
                    $("#personNum7").html(tempNum);
                }
            }
            $("#personNum1").html(totalNum);
        },
        getHomeProjectCategoryHtml : function (data) {
            let totalNum = 0,baseNum1 = 0,baseNum2=0,baseNum3=0,baseNum4=0,baseNum5=0,baseNum6=0;
            for (const tempData of data) {
                if(tempData.type_name.indexOf("推荐项目（国家）")>=0) {
                    baseNum1 += tempData.num;
                    continue;
                }
                if(tempData.type_name.indexOf("推荐项目（省）")>=0) {
                    baseNum2 += tempData.num;
                    continue;
                }
                if(tempData.type_name.indexOf("推广项目（国家）")>=0) {
                    baseNum3 += tempData.num;
                    continue;
                }
                if(tempData.type_name.indexOf("推广项目（省）") >= 0) {
                    baseNum4 += tempData.num;
                    continue;
                }
                if(tempData.type_name.indexOf("异地备案项目（国家）") >= 0) {
                    baseNum5 += tempData.num;
                    continue;
                }
                if(tempData.type_name.indexOf("异地备案项目（省）") >= 0) {
                    baseNum6 += tempData.num;
                    continue;
                }
            }
            totalNum = baseNum1 + baseNum2 + baseNum3 +baseNum4 +baseNum5 + baseNum6;
            let tempHtml = `<div class="bottom-item">
                                <div>
                                    <div class="bottom-item-title">项目总数</div>
                                    <div class="bottom-item-num">${totalNum}</div>
                                </div>
                            </div>
                            <div class="bottom-item">
                                <div>
                                    <div class="bottom-item-title">推荐（国）</div>
                                    <div class="bottom-item-num">${baseNum1}</div>
                                </div>
                            </div>
                            <div class="bottom-item">
                                <div>
                                    <div class="bottom-item-title">推荐（省）</div>
                                    <div class="bottom-item-num">${baseNum2}</div>
                                </div>
                            </div>
                            <div class="bottom-item">
                                <div>
                                    <div class="bottom-item-title">推广（国）</div>
                                    <div class="bottom-item-num">${baseNum3}</div>
                                </div>
                            </div>
                            <div class="bottom-item">
                                <div>
                                    <div class="bottom-item-title">推广（省）</div>
                                    <div class="bottom-item-num">${baseNum4}</div>
                                </div>
                            </div>
                            <div class="bottom-item">
                                <div>
                                    <div class="bottom-item-title">异地（国）</div>
                                    <div class="bottom-item-num">${baseNum5}</div>
                                </div>
                            </div>
                            <div class="bottom-item">
                                <div>
                                    <div class="bottom-item-title">异地（省）</div>
                                    <div class="bottom-item-num">${baseNum6}</div>
                                </div>
                            </div>`;
            return tempHtml;
        },
        getHomeUnitCategoryHtml : function(data) {
            let totalNum = 0,baseNum1 = 0,baseNum2=0,baseNum3=0,baseNum4=0,baseNum5=0;
            for (const tempData of data) {
                if(tempData.type_name.indexOf("医疗卫生单位")>=0) {
                    baseNum1 += tempData.num;
                    continue;
                }
                if(tempData.type_name.indexOf("高等医学院校")>=0) {
                    baseNum2 += tempData.num;
                    continue;
                }
                if(tempData.type_name.indexOf("医学相关研究机构")>=0) {
                    baseNum3 += tempData.num;
                    continue;
                }
                if(tempData.type_name.indexOf("行业组织") >= 0) {
                    baseNum4 += tempData.num;
                    continue;
                }
                baseNum5 += tempData.num;
            }
            totalNum = baseNum1 + baseNum2 + baseNum3 + baseNum4 + baseNum5;
            let tempHtml = `<div class="bottom-item">
                                <div>
                                    <div class="bottom-item-title">单位总数</div>
                                    <div class="bottom-item-num">${totalNum}</div>
                                </div>
                            </div>
                            <div class="bottom-item">
                                <div>
                                    <div class="bottom-item-title">医疗卫生单位</div>
                                    <div class="bottom-item-num">${baseNum1}</div>
                                </div>
                            </div>
                            <div class="bottom-item">
                                <div>
                                    <div class="bottom-item-title">高等医学院校</div>
                                    <div class="bottom-item-num">${baseNum2}</div>
                                </div>
                            </div>
                            <div class="bottom-item">
                                <div>
                                    <div class="bottom-item-title">医学相关研究机构</div>
                                    <div class="bottom-item-num">${baseNum3}</div>
                                </div>
                            </div>
                            <div class="bottom-item">
                                <div>
                                    <div class="bottom-item-title">行业组织</div>
                                    <div class="bottom-item-num">${baseNum4}</div>
                                </div>
                            </div>
                            <div class="bottom-item">
                                <div>
                                    <div class="bottom-item-title">其他</div>
                                    <div class="bottom-item-num">${baseNum5}</div>
                                </div>
                            </div>`;
            return tempHtml;
        },
        getHomeUnitLevalHtml : function(data) {
            let totalNum = 0,baseNum = 0,countyNum=0,cityNum=0,provinceNum=0;
            for (const tempData of data) {
                if(tempData.type_name.indexOf("省级")>=0) {
                    provinceNum = tempData.num;
                    continue;
                }
                if(tempData.type_name.indexOf("市级")>=0) {
                    cityNum = tempData.num;
                    continue;
                }
                if(tempData.type_name.indexOf("县")>=0) {
                    countyNum = tempData.num;
                    continue;
                }
                baseNum+= tempData.num;
            }
            totalNum = baseNum + countyNum + cityNum + provinceNum;
            let tempHtml = `<div class="bottom-item">
                    <div>
                        <div class="bottom-item-title">单位总数</div>
                        <div class="bottom-item-num">${totalNum}</div>
                    </div>
                </div>
                <div class="bottom-item">
                    <div>
                        <div class="bottom-item-title">基层</div>
                        <div class="bottom-item-num">${baseNum}</div>
                    </div>
                </div>
                <div class="bottom-item">
                    <div>
                        <div class="bottom-item-title">县(区)级</div>
                        <div class="bottom-item-num">${countyNum}</div>
                    </div>
                </div>
                <div class="bottom-item">
                    <div>
                        <div class="bottom-item-title">市级</div>
                        <div class="bottom-item-num">${cityNum}</div>
                    </div>
                </div>`;
            if(unitUserType == 5 || unitUserType == "5") {
                tempHtml += `
                <div class="bottom-item">
                    <div>
                        <div class="bottom-item-title">省级</div>
                        <div class="bottom-item-num">${provinceNum}</div>
                    </div>
                </div>`;
            }
            return tempHtml;
        },
        getActiveIndex : function(listClass,activeClass) {
            const typeBtns = document.querySelectorAll(`.${listClass}`);
            let activeIndex = -1;
            typeBtns.forEach((btn, index) => {
                if (btn.classList.contains(activeClass)) {
                    activeIndex = index;
                }
            });
            return activeIndex;
        },
        getActiveText : function(listClass,activeClass) {
            const typeBtns = document.querySelectorAll(`.${listClass}`);
            let fileName = "";
            typeBtns.forEach((btn, index) => {
                if (btn.classList.contains(activeClass)) {
                    fileName = btn.text;
                }
            });
            return fileName;
        },
        createMapLeftHtml : function(data,index) {
            let tempHtml = ``;
            if(index == 0) {
                tempHtml = homeTool.createMapLeft1(data);
            } else if (index == 1) {
                tempHtml = homeTool.createMapLeft2(data);
            } else if (index == 2) {
                tempHtml = homeTool.createMapLeft3(data);
            } else if (index == 3) {
                tempHtml = homeTool.createMapLeft4(data);
            }
            $(`#statisticsData`).html(tempHtml);
        },
        createMapLeft1 : function(data) {
            let showTitle = ["项目总数","推荐（国）","推荐（省）","推广（国）","推广（省）","异地（国）","异地（省）"];
            let dataTitle = ["","推荐（国）","推荐（省）","推广（国）","推广（省）","异地（国）","异地（省）"];
            let totalNum = 0;
            if(data) {
                for (const key in data) {
                    totalNum += data[key];
                }
            }
            let tempHtml = `<div class="left-item">
                        <div>${showTitle[0]}</div><div>${totalNum}</div>
                    </div>`;
            for (let i = 1; i < dataTitle.length; i++) {
                const title = dataTitle[i];let num = 0;
                if(data && data[title]) {
                    num = data[title];
                }
                tempHtml += `<div class="left-item">
                        <div>${showTitle[i]}</div><div>${num}</div>
                    </div>`;
            }
            
            return tempHtml;
        },
        createMapLeft2 : function(data) {
            let showTitle = ["总人数","初级","中级","副高","正高","乡村医生","其他"];
            let dataTitle = ["","初级","中级","副高","正高","乡村医生","其他"];
            let totalNum = 0;
            
            if(data) {
                for (const key in data) {
                    totalNum += data[key];
                }
            }
            let tempHtml = `<div class="left-item">
                        <div>${showTitle[0]}</div><div>${totalNum}</div>
                    </div>`;
            for (let i = 1; i < dataTitle.length; i++) {
                const title = dataTitle[i];let num = 0;
                if(data && data[title]) {
                    num = data[title];
                }
                tempHtml += `<div class="left-item">
                        <div>${showTitle[i]}</div><div>${num}</div>
                    </div>`;
            }
            
            return tempHtml;
        },
        createMapLeft3 : function(data) {
            let showTitle = ["单位总数","医疗卫生单位","高等医学院校","医学相关研究机构","行业组织","其他"];
            let dataTitle = ["","医疗卫生单位","高等医学院校","医学相关研究机构","行业组织","其他"];
            let totalNum = 0;
            if(data) {
                for (const key in data) {
                    totalNum += data[key];
                }
            }
            let tempHtml = `<div class="left-item">
                        <div>${showTitle[0]}</div><div>${totalNum}</div>
                    </div>`;
            for (let i = 1; i < dataTitle.length; i++) {
                const title = dataTitle[i];let num = 0;
                if(data && data[title]) {
                    num = data[title];
                }
                tempHtml += `<div class="left-item">
                        <div>${showTitle[i]}</div><div>${num}</div>
                    </div>`;
            }
            
            return tempHtml;
        },
        createMapLeft4 : function(data) {
            let showTitle = ["单位总数","基层","县(区)级","市级","省级"];
            let dataTitle = ["","基层","县（区）级","市级","省级"];
            let totalNum = 0;
            if(data) {
                for (const key in data) {
                    totalNum += data[key];
                }
            }
            let tempHtml = `<div class="left-item">
                        <div>${showTitle[0]}</div><div>${totalNum}</div>
                    </div>`
            for (let i = 1; i < dataTitle.length; i++) {
                const title = dataTitle[i];let num = 0;
                if(data && data[title]) {
                    num = data[title];
                }
                tempHtml += `<div class="left-item">
                        <div>${showTitle[i]}</div><div>${num}</div>
                    </div>`;
            }
            
            return tempHtml;
        },
        createMapShowTitleByType : function(type,allData,currentUnitId) {
            allData = allData || {};
            let data = allData.hasOwnProperty(currentUnitId) ? allData[currentUnitId] : {};
            if(type==0) {
                return homeTool.createMapShowTitle1(data);
            }
            else if(type==1) {
                return homeTool.createMapShowTitle2(data);
            }
            else if(type==2) {
                return homeTool.createMapShowTitle3(data);
            }
            else {
                return homeTool.createMapShowTitle4(data);
            }
        },
        createMapShowTitle1 : function(data) {
            let showTitle = ["项目总数","推荐（国）","推荐（省）","推广（国）","推广（省）","异地（国）","异地（省）"];
            let dataTitle = ["","推荐项目（国家）","推荐项目（省）","推广项目（国家）","推广项目（省）","异地备案项目（国家）","异地备案项目（省）"];
            let totalNum = 0;
            if(data) {
                for (const key in data) {
                    totalNum += data[key];
                }
            }
            let tempHtml = `${showTitle[0]} :${totalNum} <br>`;
            for (let i = 1; i < showTitle.length; i++) {
                const title = dataTitle[i];let num = 0;
                if(data && data[title]) {
                    num = data[title];
                }
                tempHtml += `${showTitle[i]}:${num}<br>`;
            }
            
            return tempHtml;
        },
        createMapShowTitle2 : function(data) {
            let showTitle = ["总人数","初级","中级","副高","正高","乡村医生","其他"];
            let dataTitle = ["","初级","中级","副高","正高","乡村医生","其他"];
            let totalNum = 0;
            
            if(data) {
                for (const key in data) {
                    totalNum += data[key];
                }
            }
            let tempHtml = `${showTitle[0]}:${totalNum}<br>`;
            for (let i = 1; i < dataTitle.length; i++) {
                const title = showTitle[i];let num = 0;
                if(data && data[title]) {
                    num = data[title];
                }
                tempHtml += `${showTitle[i]}:${num}<br>`;
            }
            
            return tempHtml;
        },
        createMapShowTitle3 : function(data) {
            let showTitle = ["单位总数","医疗卫生单位","高等医学院校","医学相关研究机构","行业组织","其他"];
            let dataTitle = ["","医疗卫生单位","高等医学院校","医学相关研究机构","行业组织","其他"];
            let totalNum = 0;
            if(data) {
                for (const key in data) {
                    totalNum += data[key];
                }
            }
            let tempHtml = `${showTitle[0]}:${totalNum}<br>`;
            for (let i = 1; i < showTitle.length; i++) {
                const title = dataTitle[i];let num = 0;
                if(data && data[title]) {
                    num = data[title];
                }
                tempHtml += `${showTitle[i]}:${num}<br>`;
            }
            
            return tempHtml;
        },
        createMapShowTitle4 : function(data) {
            let showTitle = ["单位总数","基层","县(区)级","市级","省级"];
            let dataTitle = ["","","县（区）级","市级","省级"];
            let titleSet = new Set(["县（区）级","市级","省级"]);
            let totalNum = 0,baseNum=0;
            for (const key in data) {
                totalNum += data[key];
                if(!titleSet.has(key)) {
                    baseNum += data[key];
                }
            }
            let tempHtml = `${showTitle[0]}:${totalNum}<br>${showTitle[1]}:${baseNum}<br>`;
            for (let i = 2; i < dataTitle.length; i++) {
                const title = dataTitle[i];let num = 0;
                if(data && data[title]) {
                    num = data[title];
                }
                tempHtml += `${showTitle[i]}:${num}<br>`;
            }
            return tempHtml;
        },
        createCheckbox : function(boxId,idStr,checkLabel,backFun=()=>{}) {
            const mapBoxEl = document.getElementById(boxId);
            const div = document.createElement('div');
            div.id = idStr;
            div.className = 'directly-under-checkbox';
            div.innerHTML = `<div class="layui-form" style="height: 30px;"><input type="checkbox" lay-filter="zhuShuCheck" title="${checkLabel}"></div>`;
            mapBoxEl.appendChild(div);
            form.render('checkbox');
            homeTool.bindCheckboxChange('zhuShuCheck',(data)=>{
                backFun(data);
            });
        },
        createExpertBox : function(boxId,idStr,backFun=()=>{}) {
            const mapBoxEl = document.getElementById(boxId);
            const div = document.createElement('div');
            div.id = idStr;
            div.innerHTML = `导出表格`;
            mapBoxEl.appendChild(div);
            div.onclick = function() {
                backFun();
            }
        },
        getRealUnitId : function(unitId) {
            if(zheJiangMapIdToUnitId[unitId]) {
                return zheJiangMapIdToUnitId[unitId];
            }
            return unitId;
        },
        getMapId : function(unitId) {
            if(zheJiangUnitIdToMapId[unitId]) {
                return zheJiangUnitIdToMapId[unitId];
            }
            return unitId;
        },
        getChildUnitIds : function(unitId) {
            if(zheJiangMapIdToUnitId[unitId]) {
                let realUnitId = zheJiangMapIdToUnitId[unitId];
                return cityUnitChild[realUnitId] || [];
            }
            return [];
        },
        getChildUnitIdsByRealUnit : function(unitId) {
            return cityUnitChild[unitId] || [];
        },
        getCityUnitIds : function() {
            return cityUnitCode;
        },
        getCityUnderArrByMapId : function(mapId) {
            let realUnitId = homeTool.getRealUnitId(mapId);
            return cityUnitChild[realUnitId] || [];
        },

    }
    exports('homeTool', homeTool);
})
