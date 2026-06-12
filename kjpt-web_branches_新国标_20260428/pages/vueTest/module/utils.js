// 工具函数模块
export const utils = {
    // 格式化日期
    formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },
    
    // 格式化货币
    formatCurrency(amount, currency = 'CNY') {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    },
    
    // 深度复制对象
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const clonedObj = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = this.deepClone(obj[key]);
            }
        }
        return clonedObj;
    },
    
    // 防抖函数
    debounce(fn, delay = 300) {
        let timer = null;
        return function(...args) {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                fn.apply(this, args);
                timer = null;
            }, delay);
        };
    },
    
    // 节流函数
    throttle(fn, interval = 300) {
        let lastTime = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastTime >= interval) {
                fn.apply(this, args);
                lastTime = now;
            }
        };
    },
    
    // 验证邮箱
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    // 验证手机号
    validatePhone(phone) {
        const regex = /^1[3-9]\d{9}$/;
        return regex.test(phone);
    }
};

// 存储管理
export class StorageManager {
    constructor(namespace = 'app') {
        this.namespace = namespace;
    }
    
    setItem(key, value) {
        try {
            const fullKey = `${this.namespace}_${key}`;
            const data = JSON.stringify(value);
            localStorage.setItem(fullKey, data);
            return true;
        } catch (error) {
            console.error('存储数据失败:', error);
            return false;
        }
    }
    
    getItem(key, defaultValue = null) {
        try {
            const fullKey = `${this.namespace}_${key}`;
            const data = localStorage.getItem(fullKey);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('读取数据失败:', error);
            return defaultValue;
        }
    }
    
    removeItem(key) {
        const fullKey = `${this.namespace}_${key}`;
        localStorage.removeItem(fullKey);
    }
    
    clear() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(`${this.namespace}_`)) {
                localStorage.removeItem(key);
            }
        });
    }
}