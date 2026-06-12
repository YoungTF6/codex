// 主应用文件
import { createApp } from '/js/vue/vue-3.5.27/vue.esm-browser.prod.js';
import { utils, StorageManager } from '/js/vue/utils/toolUtils.js';

// 解析 URL 参数获取要加载的模块
const modulesToLoad = new URLSearchParams(window.location.search).get('modules')?.split(',') || [];
// 只选择第一个模块
const activeModule = modulesToLoad.find(module => ['user', 'product'].includes(module)) || '';
const loadUserModule = activeModule === 'user';
const loadProductModule = activeModule === 'product';

// 导入模块
import { userModule, UserList, UserService } from '/pages/vueTest/module/userModule.js';
import { productModule, ProductList, ProductService } from '/pages/vueTest/module/productModule.js';

// 创建应用实例
const app = createApp({
    data() {
        const data = {
            appName: 'Vue 3 模块化应用',
            storage: new StorageManager('vue_app'),
            currentTime: utils.formatDate(new Date()),
            showUserModule: loadUserModule,
            showProductModule: loadProductModule
        };
        
        // 按需加载模块数据和服务
        if (loadUserModule) {
            data.userService = new UserService('https://api.example.com');
            Object.assign(data, userModule.data());
        }
        
        if (loadProductModule) {
            data.productService = new ProductService('https://api.example.com');
            Object.assign(data, productModule.data());
        }
        
        return data;
    },
    
    computed: {
        // 按需合并模块计算属性
        ...(loadUserModule && userModule.computed ? Object.fromEntries(
            Object.entries(userModule.computed)
        ) : {}),
        
        ...(loadProductModule && productModule.computed ? Object.fromEntries(
            Object.entries(productModule.computed)
        ) : {}),
        
        // 应用级计算属性
        formattedTime() {
            return utils.formatDate(new Date(), 'HH:mm:ss');
        },
        
        // 按需添加用户模块计算属性
        ...(loadUserModule ? {
            filteredUsers() {
                if (!this.searchQuery) return this.users;
                return utils.filterBySearch(this.users, this.searchQuery, ['name', 'email']);
            }
        } : {}),
        
        // 当前激活的模块组件
        activeModuleComponent() {
            if (loadUserModule) return 'user-list';
            if (loadProductModule) return 'product-list';
            return null;
        },
        
        // 动态生成组件 props
        moduleProps() {
            const props = {};
            if (loadUserModule) {
                props.users = this.users;
            }
            if (loadProductModule) {
                props.products = this.products;
            }
            return props;
        }
    },
    
    methods: {
        // 按需合并模块方法
        ...(loadUserModule ? userModule.methods : {}),
        ...(loadProductModule ? productModule.methods : {}),
        
        // 应用级方法
        formatPrice(price) {
            return utils.formatCurrency(price);
        },
        
        // 按需添加用户模块搜索方法
        ...(loadUserModule ? {
            searchUsers: utils.debounce(query => {
                console.log('搜索用户:', query);
            }, 500)
        } : {})
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

// 按需注册全局组件
if (loadUserModule) app.component('UserList', UserList);
if (loadProductModule) app.component('ProductList', ProductList);

// 注册全局属性和方法
app.config.globalProperties.$utils = utils;
app.config.globalProperties.$storage = new StorageManager();

// 挂载应用
app.mount('#app');