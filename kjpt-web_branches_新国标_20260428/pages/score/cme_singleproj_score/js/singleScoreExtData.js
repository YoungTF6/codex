
        // 根据name值，获取对应中文名称
        window.extDataNameMap = {
            // 进修
            jx_item: '事项',
            jx_unit: '进修（培训）单位',
            support_unit: '支援省份—支援单位',
            assist_unit: '协助单位',
            task_content: '任务内容',
            task_time: '时间段',
            // 学历教育
            education: '学历教育',
            school: '就读学校',
            study_year: '就读年度',
            examine_result: '年度考核情况',
            // 发表论文
            paper_level: '期刊级别',
            paper_name: '期刊名称',
            paper_no: '期刊号',
            paper_content: '论文名称',
            // 科研项目
            proj_level: '项目级别',
            proj_rank: '项目排名',
            proj_unit: '立项单位',
            proj_name: '项目名称',
            // 科技成果奖
            reward_level: '奖励级别',
            reward_name: '奖励名称',
            reward_unit: '奖励单位',
            reward_proj_name: '获奖项目名称',
            // 发明专利，标准、技术规范
            patent_item: '事项',
            patent_time: '完成转化或通过批准时间',
            // 出版著作
            book_type: '著作类型',
            book_name: '著作名称',
            book_unit: '出版单位',
            // 赴外省学分
            single_proj_no: '项目编号',
            single_proj_name: '项目名称',
            hold_unit: '发证机构',
            pub_unit: '项目公布单位',
            pub_unit_name: '具体省卫健委名称',
        }

        // 获取字典项
        window.extDataDictMap = {
            // 进修-事项
            jx_item: [
                {value: 1, name: '外出进修'},
                {value: 2, name: '在职学历（学位）教育'},
                {value: 3, name: '发表论文'},
                {value: 4, name: '出版著作'},
            ],
            // 赴外省学分-项目公布单位
            pub_unit: [
                {value: 1, name: '国家卫健委公布项目'},
                {value: 2, name: '省卫健委公布项目'},
            ],
            // 学历教育
            education: [
                {value: 1, name: '本科'},
                {value: 2, name: '硕士'},
                {value: 3, name: '博士'},
                {value: 4, name: '其他'},
            ],
            // 发表论文-期刊级别
            paper_level: [
                {value: 1, name: 'SCI收录期刊'},
                {value: 2, name: '中文核心期刊'},
                {value: 3, name: '普通期刊'},
            ],
            // 科研项目-项目级别
            proj_level: [
                {value: 1, name: '国家级项目'},
                {value: 2, name: '省部级项目'},
                {value: 3, name: '市厅级项目或省级以上行业组织设立的课题'},
            ],
            // 科技成果奖-奖励级别
            reward_level: [
                {value: 1, name: '国家级'},
                {value: 2, name: '省部级'},
                {value: 3, name: '市厅级项目或省级以上行业组织设立的课题'},
            ],
            // 出版著作-著作类型
            book_type: [
                {value: 1, name: '专业学术著作'},
                {value: 2, name: '教材'},
                {value: 3, name: '科普书籍'},
                {value: 4, name: '其他'},
            ],
        };

        // 将详细信息json数据转换显示
        window.buildExtDataHtml = function(data){
            if(!data) return '';
            let extData = JSON.parse(data);
            let html = '';
            // 根据extData的key值，构建html, 显示在一行
            for(let key in extData){
                let name = extDataNameMap[key];
                if(!name) continue;
                let dict = extDataDictMap[key];
                if(dict){
                    // 根据字典值，获取中文名称
                    let dictName = dict.find(item => item.value == extData[key]);
                    if(dictName){
                        value = dictName.name;
                    }else{
                        value = extData[key];
                    }
                }else{
                    value = extData[key];
                }
                if(!value) continue;
                html += `${name}: ${value} ;`;
            }
            return html;
        }

        // 绑定单元格悬浮事件
        window.bindExtDataTips = function(){
            $('.layui-ext-data-cell').each(function() {
                var cell = this;
                var content = $(cell).html();
                if(!content) return;
                var tipsIndex;
                $(cell).on('mouseenter', function() {
                    tipsIndex = layer.tips(content, cell, {
                        tips: 1,
                        time: 0,
                        maxWidth: 300,
                        closeBtn: 0,
                        shade: 0,
                        skin: 'layui-layer-border'
                    });
                });
                $(cell).on('mouseleave', function() {
                    layer.close(tipsIndex);
                });
            });
        }