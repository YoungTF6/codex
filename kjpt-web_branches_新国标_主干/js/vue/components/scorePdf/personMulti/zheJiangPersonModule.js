// 年份复选框组件
export const ZheJiangYearCheckboxGroup = {
    props: {
        personId: {
            type: String,
            default: ''
        }
    },
    
    data() {
        // 计算最近3年
        const currentYear = new Date().getFullYear();
        const recentYears = [];
        for (let i = 0; i < 3; i++) {
            const year = currentYear - i;
            if (year >= 2020) {
                recentYears.push(year);
            }
        }
        
        return {
            // 默认选中最近3年
            selectedYears: recentYears,
            // 图标引用
            Document: window.ElementPlusIconsVue ? window.ElementPlusIconsVue.Document : null
        };
    },
    
    computed: {
        // 动态生成年份范围：2020年到当前年度，降序排列
        years() {
            const currentYear = new Date().getFullYear();
            const yearsArray = [];
            for (let year = currentYear; year >= 2020; year--) {
                yearsArray.push(year);
            }
            return yearsArray;
        }
    },
    
    mounted() {
        this.drawWatermark();
        // 监听窗口大小变化，重新绘制水印
        window.addEventListener('resize', this.drawWatermark);
    },
    
    beforeUnmount() {
        // 移除事件监听
        window.removeEventListener('resize', this.drawWatermark);
    },
    
    methods: {
        drawWatermark() {
            const canvas = this.$refs.watermarkCanvas;
            if (!canvas) return;
            // 使用工具类中的方法绘制水印
            this.$utils.drawWatermark(canvas, '浙江省');
        },
        
        exportPdf() {
            if (!this.selectedYears || this.selectedYears.length === 0) {
                this.$message.warning('请至少选择一个年度');
                return;
            }
            if (this.selectedYears.length > 5) {
                this.$message.warning('最多选择五个年度');
                return;
            }

            const loading = this.$loading({
                lock: true,
                text: '正在导出PDF，请稍候...',
                background: 'rgba(0, 0, 0, 0.7)'
            });

            const url = '';
            const params = {
                years: this.selectedYears,
                personId: this.personId
            };
            const filename = '继续医学教育学分验证证明.pdf';

            this.$utils.downloadFilePost(url, params, filename, 'application/pdf')
                .then(() => {
                    this.$message.success('PDF导出成功');
                })
                .catch(error => {
                    console.error('导出PDF失败:', error);
                    this.$message.error('PDF导出失败，请稍后重试');
                })
                .finally(() => {
                    loading.close();
                });
        }
    },
    
    template: `
        <div style="width: 90%; margin: 20px auto;font-size: 16px;">
            <div style="display: flex; justify-content: space-between;align-items: center;">
                <div class="year-checkboxes">
                    <div class="year-header">年度</div>
                    <el-checkbox-group v-model="selectedYears" class="checkbox-group" style="display: contents;">
                        <!-- 循环生成2020年到当前年度的复选框 -->
                        <el-checkbox 
                            v-for="year in years" 
                            :key="year" 
                            :label="year"
                            class="checkbox-item"
                            size="large"
                            style="font-size: 14px;"
                        >
                            {{ year }}年
                        </el-checkbox>
                    </el-checkbox-group>
                </div>


                <!-- 导出PDF按钮 -->
                <el-button type="success" @click="exportPdf">
                    <i class="layui-icon layui-icon-export"></i>
                    导出PDF
                </el-button>
            </div>
            
        </div>


        
        <!-- 水印画布 -->
        <canvas ref="watermarkCanvas" class="watermark" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; user-select: none; z-index: 9999;"></canvas>
    `
};
