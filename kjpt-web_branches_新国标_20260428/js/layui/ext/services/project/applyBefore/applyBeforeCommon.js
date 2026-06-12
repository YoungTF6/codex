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


    let applyBeforeCommon = {
        generateTableBar: function (d) {
            let barHtml = '';
            if( d.deptId != null && d.deptId != '' && userType != 13){
                if(d.canApproval == 1){ 
                    barHtml += `<a class="layui-btn layui-btn-xs layui-btn-normal btn-normal-row btn-approval" lay-event="approval">待审批</a>`;
                    //<!-- 根据角色和学分级别配置，是否可修改项目信息 -->
                    if(window['fn_city_update_apply_before']){ 
                        barHtml += `<a class="layui-btn layui-btn-xs" lay-event="edit" style="color: #27b1a2;background-color: transparent;">编辑</a>`;
                    } 
                }else { 
                        //<!-- 只有查看的情况 -->
                   barHtml += `<a class="layui-btn layui-btn-xs layui-btn-normal btn-normal-row" lay-event="detail">查看</a>`;
                } 
            }else{ 
                        //<!-- 待审批，是机构号是自己的时候 -->
                if(d.canApproval == 1){ 
                    barHtml += `<a class="layui-btn layui-btn-xs layui-btn-normal btn-normal-row btn-approval" lay-event="approval">待审批</a>`;
                }else if(d.canApproval == 0){ 
                        //<!-- 只有查看的情况 -->
                    barHtml += `<a class="layui-btn layui-btn-xs layui-btn-normal btn-normal-row" lay-event="detail">查看</a>`;
                }else{ 
                    //<!-- 从未反馈过 -->
                    //<!-- taoId == zhe_jiang_tao_id 且 userType == 12 不能申请， 
                    //taoId == zhe_jiang_tao_id 且 userType == 13 可以申请 -->
                    if(d.keyId == null  && (taoId != zhe_jiang_tao_id || userType == 13)){ 
                        barHtml += `<a class="layui-btn layui-btn-xs  layui-btn-normal btn-normal-row btn-apply" lay-event="apply">申请</a>`;
                    } 
            
                        //<!-- 已保存 -->
                    if(d.keyId !=null && (d.checkState == null || d.checkState==0)  && (taoId != zhe_jiang_tao_id || userType == 13)){ 
                        barHtml += `<a class="layui-btn layui-btn-xs  layui-btn-normal btn-normal-row btn-apply" lay-event="report">上报</a>`;
                        barHtml += `<a class="layui-btn layui-btn-xs  layui-btn-normal btn-normal-row" lay-event="apply">修改</a>`;
                    } 
                } 
            
                        //<!-- 反馈之后，上级还没有审批，canBack的0是可撤回，1是不可撤回 -->
                if(d.canBack == 0 && d.checkState==4 && ((d.cycleAgentDeptId==myDeptId && userType==13) ||(d.applyUnitId==myUnitId && userType==12))){ 
                    barHtml += `<a class="layui-btn layui-btn-xs  layui-btn-normal btn-normal-row" lay-event="detail">查看</a>`;
                    barHtml += `<a class="layui-btn layui-btn-xs layui-btn-danger btn-danger-row" lay-event="recall">撤回</a>`;
                } 
                        //<!-- 退回的 -->
                if(d.checkState == 1 && ((d.applyDept==myDeptId && userType==13) || (d.applyUnitId==myUnitId && userType==12))){
                        
                    barHtml += `<a class="layui-btn layui-btn-xs  layui-btn-normal btn-normal-row btn-apply" lay-event="report">重新上报</a>`;
                    barHtml += `<a class="layui-btn layui-btn-xs  layui-btn-normal btn-normal-row btn-apply" lay-event="apply">修改</a>`;
                } 
                        //<!-- 已上报，审批中或者审核通过和不通过，都是只能查看 -->
                if(d.checkState == 3 || d.checkState ==2 || (d.checkState==4 && d.canBack!=0) || (d.checkState == 1 && d.applyDept != myDeptId
                        && d.applyUnitId != myUnitId) || (d.checkState > 0 && userType==13  && d.cycleAgentDeptId != userName)
                        || d.unitApprovalState ==1  || d.unitApprovalState ==2 || d.unitApprovalState == 3 ){ 
                        barHtml += `<a class="layui-btn layui-btn-xs  layui-btn-normal btn-normal-row" lay-event="detail">查看</a>`;
                } 
            } 
            
            return barHtml;
        },
        //广东机构
        generateTableBarGuandDongUnit: function (d) {
            let barHtml = '';
            if(d.canApproval == 1){ 
                barHtml += `<a class="layui-btn layui-btn-xs layui-btn-normal btn-normal-row btn-approval" lay-event="approval">待审批</a>`;
            }else if(d.canApproval == 0){ 
                    //<!-- 只有查看的情况 -->
                barHtml += `<a class="layui-btn layui-btn-xs layui-btn-normal btn-normal-row" lay-event="detail">查看</a>`;
            }else{ 
                if(d.keyId == null  && userType == 13){ 
                    barHtml += `<a class="layui-btn layui-btn-xs  layui-btn-normal btn-normal-row btn-apply" lay-event="apply">填写</a>`;
                } 
            }
            if(barHtml.length == 0) {
                barHtml += `<a class="layui-btn layui-btn-xs layui-btn-normal btn-normal-row" lay-event="detail">查看</a>`;
            }
            return barHtml;
        },
    }

    exports('applyBeforeCommon', applyBeforeCommon);
})
