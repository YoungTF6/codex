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
    },
    
    // 绘制水印
    drawWatermark(canvas, text = '水印') {
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width = window.innerWidth;
        const height = canvas.height = window.innerHeight;
        
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        // 设置水印样式
        ctx.font = '12px Arial';
        ctx.fontWeight = 'bold';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.textAlign = 'center';
        
        // 计算水印间距
        const interval = 100;
        
        // 绘制水印
        for (let x = 0; x < width; x += interval) {
            for (let y = 0; y < height; y += interval) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(-Math.PI / 4); // 旋转45度
                ctx.fillText(text, 0, 0);
                ctx.restore();
            }
        }
    },

    // 下载文件（POST请求）
    downloadFilePost(url, params, filename = 'download', mimeType = 'application/octet-stream') {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: url,
                data: params,
                responseType: 'blob',
                headers: {
                    'Authorization': localStorage.getItem('token'),
                    'KJPT-USER-ID': localStorage.getItem('user-id'),
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                const blob = new Blob([res.data], { type: mimeType });
                const href = window.URL.createObjectURL(blob);
                const downloadElement = document.createElement('a');
                downloadElement.href = href;
                downloadElement.download = filename;
                document.body.appendChild(downloadElement);
                downloadElement.click();
                document.body.removeChild(downloadElement);
                window.URL.revokeObjectURL(href);
                resolve(res);
            }).catch(error => {
                console.error('下载文件失败:', error);
                reject(error);
            });
        });
    },

    // 下载文件（GET请求）
    downloadFileGet(url, params, filename = 'download', mimeType = 'application/octet-stream') {
        return new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: url,
                params: params,
                responseType: 'blob',
                headers: {
                    'Authorization': localStorage.getItem('token'),
                    'KJPT-USER-ID': localStorage.getItem('user-id')
                }
            }).then(res => {
                const blob = new Blob([res.data], { type: mimeType });
                const href = window.URL.createObjectURL(blob);
                const downloadElement = document.createElement('a');
                downloadElement.href = href;
                downloadElement.download = filename;
                document.body.appendChild(downloadElement);
                downloadElement.click();
                document.body.removeChild(downloadElement);
                window.URL.revokeObjectURL(href);
                resolve(res);
            }).catch(error => {
                console.error('下载文件失败:', error);
                reject(error);
            });
        });
    },

    // 获取学分分类树形选项
    getScoreLevelOptions(type = '010',showLoading = true) {
        return new Promise((resolve, reject) => {
            let loading = null;
            if (showLoading && window.ElLoading) {
                loading = window.ElLoading.service({
                    lock: true,
                    text: '加载学分分类数据...',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
            }
            
            try {
                let standardkindId = localStorage.getItem('standardkind-id');
                let currentYear = new Date().getFullYear();
                const url = (huayi_sjwh_url || '') + `option/scoreLevel/tree/${standardkindId}/${currentYear}/${type}`;
                
                axios.get(url).then(response => {
                    if (response.data && Array.isArray(response.data)) {
                        // 转换树形结构为 el-cascader 所需的格式
                        const transformTree = (tree) => {
                            return tree.map(item => {
                                const transformedItem = {
                                    value: item.id,
                                    label: item.name
                                };
                                if (item.children && item.children.length > 0) {
                                    transformedItem.children = transformTree(item.children);
                                }
                                return transformedItem;
                            });
                        };
                        const options = transformTree(response.data);
                        resolve(options);
                    } else {
                        resolve([]);
                    }
                }).catch(error => {
                    console.error('获取学分分类失败:', error);
                    reject(error);
                }).finally(() => {
                    if (loading) {
                        loading.close();
                    }
                });
            } catch (error) {
                console.error('获取学分分类失败:', error);
                if (loading) {
                    loading.close();
                }
                reject(error);
            }
        });
    },


    // 获取活动形式list数据
    getHoldTypes(projectType = 2, userType = 1,showLoading = true) {
        return new Promise((resolve, reject) => {
            let loading = null;
            if (showLoading && window.ElLoading) {
                loading = window.ElLoading.service({
                    lock: true,
                    text: '加载活动形式数据...',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
            }
            
            try {
                let standardkindId = localStorage.getItem('standardkind-id');
                const url = (huayi_sjwh_url || '') + `cmeHoldType/getHoldType`;
                
                axios.get(url, {
                    params: {
                        standardKindId: standardkindId,
                        projectType: projectType,
                        userType: userType
                    }
                }).then(response => {
                    if (response.data && response.data.status === 200 && Array.isArray(response.data.data)) {
                        // const options = response.data.data.map(item => ({
                        //     value: item.holdTypeId,
                        //     label: item.holdTypeName
                        // }));
                        resolve(response.data.data);
                    } else {
                        resolve([]);
                    }
                }).catch(error => {
                    console.error('获取活动形式失败:', error);
                    reject(error);
                }).finally(() => {
                    if (loading) {
                        loading.close();
                    }
                });
            } catch (error) {
                console.error('获取活动形式失败:', error);
                if (loading) {
                    loading.close();
                }
                reject(error);
            }
        });
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
