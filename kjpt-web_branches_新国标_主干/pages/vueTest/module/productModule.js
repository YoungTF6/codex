// 商品模块
export const productModule = {
    data() {
        return {
            products: [
                { id: 1, name: '笔记本电脑', price: 6999, stock: 10, category: '电子产品' },
                { id: 2, name: '智能手机', price: 3999, stock: 50, category: '电子产品' },
                { id: 3, name: '办公椅', price: 899, stock: 25, category: '家具' },
                { id: 4, name: '咖啡机', price: 1299, stock: 15, category: '家电' }
            ],
            categories: ['全部', '电子产品', '家具', '家电', '服装']
        };
    },
    
    computed: {
        productCount() {
            return this.products.length;
        },
        
        totalValue() {
            return this.products.reduce((total, product) => 
                total + (product.price * product.stock), 0
            );
        },
        
        categorizedProducts() {
            return this.categories.filter(cat => cat !== '全部').map(category => ({
                category,
                products: this.products.filter(p => p.category === category),
                total: this.products
                    .filter(p => p.category === category)
                    .reduce((sum, p) => sum + (p.price * p.stock), 0)
            }));
        }
    },
    
    methods: {
        addProduct(product) {
            this.products.push({
                id: this.products.length + 1,
                ...product
            });
        },
        
        updateStock(id, quantity) {
            const product = this.products.find(p => p.id === id);
            if (product) {
                product.stock += quantity;
            }
        },
        
        filterByCategory(category) {
            if (category === '全部') {
                return this.products;
            }
            return this.products.filter(product => product.category === category);
        },
        
        getProductsUnderPrice(maxPrice) {
            return this.products.filter(product => product.price <= maxPrice);
        }
    }
};

// 商品组件
export const ProductList = {
    props: {
        products: {
            type: Array,
            default: () => []
        }
    },
    
    data() {
        return {
            selectedCategory: '全部',
            maxPrice: 10000
        };
    },
    
    computed: {
        filteredProducts() {
            let result = this.products;
            
            if (this.selectedCategory !== '全部') {
                result = result.filter(p => p.category === this.selectedCategory);
            }
            
            result = result.filter(p => p.price <= this.maxPrice);
            
            return result;
        }
    },
    
    template: `
        <div class="product-list">
            <h2>商品列表</h2>
            
            <div class="filters">
                <label>
                    分类:
                    <select v-model="selectedCategory">
                        <option value="全部">全部</option>
                        <option value="电子产品">电子产品</option>
                        <option value="家具">家具</option>
                        <option value="家电">家电</option>
                    </select>
                </label>
                
                <label>
                    最高价格:
                    <input type="range" v-model="maxPrice" min="0" max="10000" step="100">
                    {{ maxPrice }}元
                </label>
            </div>
            
            <div class="product-grid">
                <div v-for="product in filteredProducts" :key="product.id" class="product-card">
                    <h3>{{ product.name }}</h3>
                    <p>价格: ¥{{ product.price }}</p>
                    <p>库存: {{ product.stock }}</p>
                    <p>分类: {{ product.category }}</p>
                    <button @click="$emit('add-to-cart', product)">加入购物车</button>
                </div>
            </div>
        </div>
    `
};

// 商品服务
export class ProductService {
    constructor(apiBaseUrl = '') {
        this.apiBaseUrl = apiBaseUrl;
    }
    
    async fetchProducts(category = '') {
        const url = category 
            ? `${this.apiBaseUrl}/api/products?category=${category}`
            : `${this.apiBaseUrl}/api/products`;
        
        const response = await fetch(url);
        return await response.json();
    }
    
    async updateProductStock(productId, quantity) {
        const response = await fetch(`${this.apiBaseUrl}/api/products/${productId}/stock`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        });
        return await response.json();
    }
}