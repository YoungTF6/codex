// 用户模块
export const userModule = {
    data() {
        return {
            users: [
                { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' },
                { id: 2, name: '李四', age: 30, email: 'lisi@example.com' },
                { id: 3, name: '王五', age: 28, email: 'wangwu@example.com' }
            ]
        };
    },
    
    computed: {
        userCount() {
            return this.users.length;
        },
        
        adultUsers() {
            return this.users.filter(user => user.age >= 18);
        }
    },
    
    methods: {
        addUser(user) {
            this.users.push({
                id: this.users.length + 1,
                ...user
            });
        },
        
        removeUser(id) {
            const index = this.users.findIndex(user => user.id === id);
            if (index > -1) {
                this.users.splice(index, 1);
            }
        },
        
        findUserByName(name) {
            return this.users.filter(user => 
                user.name.toLowerCase().includes(name.toLowerCase())
            );
        }
    }
};

// 用户组件
export const UserList = {
    props: {
        users: {
            type: Array,
            default: () => []
        }
    },
    
    template: `
        <div class="user-list">
            <h2>用户列表</h2>
            <ul>
                <li v-for="user in users" :key="user.id">
                    {{ user.name }} ({{ user.age }}岁) - {{ user.email }}
                    <button @click="$emit('remove-user', user.id)">删除</button>
                </li>
            </ul>
        </div>
    `
};

// 用户服务
export class UserService {
    constructor(apiBaseUrl = '') {
        this.apiBaseUrl = apiBaseUrl;
    }
    
    async fetchUsers() {
        try {
            // 模拟API请求
            const response = await fetch(`${this.apiBaseUrl}/api/users`);
            return await response.json();
        } catch (error) {
            console.error('获取用户失败:', error);
            return [];
        }
    }
    
    async createUser(userData) {
        const response = await fetch(`${this.apiBaseUrl}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await response.json();
    }
}