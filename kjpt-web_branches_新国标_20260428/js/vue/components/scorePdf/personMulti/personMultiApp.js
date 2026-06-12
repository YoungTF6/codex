// 主应用文件
// 使用全局的 Vue 对象
const { createApp } = Vue;
import { utils, StorageManager } from '/js/vue/utils/toolUtils.js';

// 模块判断逻辑（先写死）
// 这里可以根据实际需求修改判断条件，比如从 localStorage 或 URL 参数获取
const useZheJiangModule = true; // true 加载浙江模块，false 加载河南模块
const loadZheJiangModule = useZheJiangModule;
const loadHeNanModule = !useZheJiangModule;

// 动态导入模块并创建应用
async function initApp() {
    try {
        let moduleComponent;

        // 根据条件动态导入模块
        if (loadZheJiangModule) {
            const { ZheJiangYearCheckboxGroup } = await import('/js/vue/components/scorePdf/personMulti/zheJiangPersonModule.js');
            moduleComponent = ZheJiangYearCheckboxGroup;
        } else if (loadHeNanModule) {
            const { HeNanYearCheckboxGroup } = await import('/js/vue/components/scorePdf/personMulti/heNangPersonModule.js');
            moduleComponent = HeNanYearCheckboxGroup;
        } else {
            console.error('No module to load');
            return;
        }

        // 创建应用实例
        const app = createApp({
            data() {
                let personInfo = JSON.parse(localStorage.getItem('kk_psninfo') || '{}');
                return {
                    personId: personInfo.comPersonId || "",
                    storage: new StorageManager('vue_app'),
                    currentTime: utils.formatDate(new Date()),
                    showZheJiangModule: loadZheJiangModule,
                    showHeNanModule: loadHeNanModule
                };
            },

            computed: {
                // 应用级计算属性
                formattedTime() {
                    return utils.formatDate(new Date(), 'HH:mm:ss');
                },

                // 当前激活的模块组件
                activeModuleComponent() {
                    if (loadZheJiangModule) return 'year-checkbox-group';
                    if (loadHeNanModule) return 'year-checkbox-group';
                    return null;
                },

                // 动态生成组件 props
                moduleProps() {
                    return {
                        personId: this.personId
                    };
                }
            },

            methods: {
                // 应用级方法
                formatPrice(price) {
                    return utils.formatCurrency(price);
                }
            },

            created() {
                this.timer = setInterval(() => {
                    this.currentTime = utils.formatDate(new Date());
                }, 1000);
            },

            beforeUnmount() {
                if (this.timer) clearInterval(this.timer);
            }
        });

        // 使用 Element Plus
        app.use(window.ElementPlus);

        // 注册模块组件
        app.component('year-checkbox-group', moduleComponent);

        // 注册全局属性和方法
        app.config.globalProperties.$utils = utils;
        app.config.globalProperties.$storage = new StorageManager();

        // 挂载应用
        app.mount('#app');
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
}

// 初始化应用
initApp();
