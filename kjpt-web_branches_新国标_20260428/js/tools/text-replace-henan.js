"use strict";
//<!-- 这个元素不会被替换 -->
//<div class="custom-ignore">学时：这是一个示例，不会被替换为"学习时长"</div>

//<!-- 这个元素会被替换 -->
//<div>学时：这个会被替换为"学习时长"</div>

//使用其他忽略标记
//<div class="no-replace-text">学时：这个也不会被替换</div>
//<div data-no-replace="true">学时：这个同样不会被替换</div>

const HE_NAN = 'a6280900-a9c2-11ec-84d6-fa163e9b64fb';
const TEXT_STANDARD_ID   = localStorage.getItem('standardkind-id');
const TEXT_REPLACE = {
    '学时': '小时'
    };

/**
 * 文本替换工具
 * 根据 localStorage 参数判断是否将 "学时" 替换为 "学习时长"
 * 注意：带有 custom-ignore 类名的元素不会被替换
 */
const TextReplaceTool = {
    // 配置选项
    config: {
        // 节流延迟时间（毫秒）
        throttleDelay: 100,
        // 调试模式
        debug: false,
        // 缓存大小限制
        cacheSizeLimit: 1000,
        // MutationObserver 配置
        observerConfig: {
            childList: true,
            subtree: true,
            characterData: true
        },
        // 忽略的选择器（不会被替换的元素）
        ignoreSelectors: [
            '.custom-ignore',
            '[data-no-replace]',
            '.no-replace-text'
        ]
    },

    // 缓存
    cache: new Map(),

    // 节流定时器
    throttleTimer: null,

    // layui表格监控相关
    layuiTableObserver: null,
    observedTables: new Set(),

    /**
     * 初始化文本替换功能
     */
    initTextReplace() {
        this.log('开始初始化文本替换功能');
        if (this.shouldReplaceText()) {
            this.log('符合替换条件，执行替换');
            
            // 1. 立即执行替换
            this.replaceTextInDocument();
            
            // 2. 监控layui表格渲染
            this.monitorLayuiTables();
            
            // 3. 设置MutationObserver监控DOM变化
            this.setupMutationObserver();
            
            // 4. 监听layui相关事件
            this.setupLayuiEventListeners();
            
            // 5. 延迟执行一次完整替换
            setTimeout(() => {
                this.forceReplaceText();
            }, 1000);
        } else {
            this.log('不符合替换条件，跳过替换');
        }
    },

    /**
     * 根据 localStorage 判断是否需要替换文本
     * @returns {boolean} 是否需要替换
     */
    shouldReplaceText() {
        try {
            this.log(`检查替换配置: standardkindId=${TEXT_STANDARD_ID}, HE_NAN=${HE_NAN}`);
            // 检查是否启用替换
            if (TEXT_STANDARD_ID != HE_NAN) {
                return false;
            }
            return true;
        } catch (error) {
            console.error('检查替换配置失败:', error);
            return false;
        }
    },

    /**
     * 检查元素是否应该被忽略
     * @param {HTMLElement} element 要检查的元素
     * @returns {boolean} 是否应该忽略
     */
    shouldIgnoreElement(element) {
        // 检查元素是否有效
        if (!element || !element.nodeType) {
            return false;
        }

        // 对于元素节点，检查是否匹配忽略选择器
        if (element.nodeType === Node.ELEMENT_NODE) {
            // 检查是否包含忽略类名
            if (element.classList && element.classList.contains('custom-ignore')) {
                this.log(`忽略元素（包含custom-ignore类）: ${element.tagName}`);
                return true;
            }

            // 检查其他忽略属性
            if (element.hasAttribute('data-no-replace')) {
                this.log(`忽略元素（包含data-no-replace属性）: ${element.tagName}`);
                return true;
            }

            // 检查是否匹配忽略选择器
            for (const selector of this.config.ignoreSelectors) {
                if (element.matches && element.matches(selector)) {
                    this.log(`忽略元素（匹配选择器 ${selector}）: ${element.tagName}`);
                    return true;
                }
            }

            // 检查是否在忽略元素的子树中
            const parentIgnoreElement = element.closest(this.config.ignoreSelectors.join(','));
            if (parentIgnoreElement) {
                this.log(`忽略元素（在忽略元素 ${parentIgnoreElement.tagName} 的子树中）: ${element.tagName}`);
                return true;
            }
        }

        return false;
    },

    /**
     * 监控layui表格渲染
     */
    monitorLayuiTables() {
        this.log('开始监控layui表格渲染');
        
        // 方法1：直接查找并监控现有表格
        this.monitorExistingTables();
        
        // 方法2：监听layui table的done回调
        this.patchLayuiTable();
        
        // 方法3：定期检查新表格
        this.startPeriodicTableCheck();
    },

    /**
     * 监控现有的表格
     */
    monitorExistingTables() {
        // 查找所有layui表格（排除被忽略的表格）
        const allTables = document.querySelectorAll('.layui-table, table[lay-filter], [lay-id]');
        const tables = Array.from(allTables).filter(table => !this.shouldIgnoreElement(table));
        
        this.log(`找到 ${tables.length} 个需要监控的layui表格（总表格数：${allTables.length}）`);
        
        tables.forEach((table, index) => {
            this.observeLayuiTable(table);
        });
    },

    /**
     * 监控单个layui表格
     */
    observeLayuiTable(table) {
        // 检查表格是否应该被忽略
        if (this.shouldIgnoreElement(table)) {
            this.log(`表格被忽略，跳过监控: ${table.id || table.getAttribute('lay-id')}`);
            return;
        }
        
        const tableId = table.id || table.getAttribute('lay-id') || `table-${Date.now()}`;
        
        if (this.observedTables.has(tableId)) {
            return;
        }
        
        this.log(`开始监控表格: ${tableId}`);
        this.observedTables.add(tableId);
        
        // 为表格添加自定义属性，便于识别
        table.setAttribute('data-text-replace-monitored', 'true');
        
        // 监控表格内容变化
        this.observeTableContent(table);
        
        // 特别处理表格头部（thead）和主体（tbody）
        this.processTableSections(table);
    },

    /**
     * 监控表格内容变化
     */
    observeTableContent(table) {
        const observer = new MutationObserver((mutations) => {
            this.throttle(() => {
                let shouldReplace = false;
                
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // 检查新增的节点是否应该被处理
                        Array.from(mutation.addedNodes).forEach(node => {
                            if (!this.shouldIgnoreElement(node)) {
                                shouldReplace = true;
                            }
                        });
                    }
                });
                
                if (shouldReplace) {
                    this.log(`检测到表格 ${table.id || table.getAttribute('lay-id')} 内容变化，重新替换文本`);
                    this.replaceTextInElement(table);
                }
            }, this.config.throttleDelay);
        });
        
        observer.observe(table, {
            childList: true,
            subtree: true
        });
        
        // 保存observer引用
        if (!this.layuiTableObserver) {
            this.layuiTableObserver = new Map();
        }
        this.layuiTableObserver.set(table, observer);
    },

    /**
     * 处理表格的不同部分
     */
    processTableSections(table) {
        // 处理表头（排除被忽略的部分）
        const thead = table.querySelector('thead');
        if (thead && !this.shouldIgnoreElement(thead)) {
            this.replaceTextInElement(thead);
        }
        
        // 处理表体（排除被忽略的部分）
        const tbody = table.querySelector('tbody');
        if (tbody && !this.shouldIgnoreElement(tbody)) {
            this.replaceTextInElement(tbody);
        }
        
        // 处理表尾（排除被忽略的部分）
        const tfoot = table.querySelector('tfoot');
        if (tfoot && !this.shouldIgnoreElement(tfoot)) {
            this.replaceTextInElement(tfoot);
        }
    },

    /**
     * 修补layui table方法，插入done回调
     */
    patchLayuiTable() {
        if (typeof layui === 'undefined' || !layui.table) {
            this.log('layui.table 未加载，跳过修补');
            return;
        }
        
        this.log('开始修补layui.table.render方法');
        
        // 保存原始方法
        const originalRender = layui.table.render;
        
        // 重写render方法
        layui.table.render = function(options) {
            const originalDone = options.done;
            
            // 添加自定义done回调
            options.done = function(res, curr, count) {
                // 执行原始回调
                if (typeof originalDone === 'function') {
                    originalDone.call(this, res, curr, count);
                }
                
                // 延迟执行文本替换
                setTimeout(() => {
                    const tableId = this.elem.attr('id') || this.elem.attr('lay-id');
                    TextReplaceTool.log(`layui表格渲染完成: ${tableId}，执行文本替换`);
                    TextReplaceTool.replaceLayuiTableText(this.elem[0]);
                }, 100);
            };
            
            // 调用原始方法
            return originalRender.call(this, options);
        };
        
        this.log('layui.table.render方法修补完成');
    },

    /**
     * 替换layui表格文本
     */
    replaceLayuiTableText(tableElement) {
        if (!tableElement) return;
        
        // 检查表格是否应该被忽略
        if (this.shouldIgnoreElement(tableElement)) {
            this.log(`表格被忽略，跳过替换: ${tableElement.id || tableElement.getAttribute('lay-id')}`);
            return;
        }
        
        this.log(`开始替换layui表格文本: ${tableElement.id || tableElement.getAttribute('lay-id')}`);
        
        // 监控表格
        this.observeLayuiTable(tableElement);
        
        // 执行文本替换
        this.replaceTextInElement(tableElement);
        
        // 特别处理表格单元格（排除被忽略的单元格）
        const cells = tableElement.querySelectorAll('td, th');
        cells.forEach(cell => {
            if (this.shouldIgnoreElement(cell)) {
                return; // 跳过被忽略的单元格
            }
            
            if (cell.dataset) {
                delete cell.dataset.textReplaced;
            }
            this.replaceTextInElement(cell);
        });
    },

    /**
     * 启动定期检查新表格
     */
    startPeriodicTableCheck() {
        this.log('启动定期表格检查');
        
        setInterval(() => {
            const tables = document.querySelectorAll('.layui-table, table[lay-filter], [lay-id]');
            tables.forEach(table => {
                if (!table.hasAttribute('data-text-replace-monitored') && !this.shouldIgnoreElement(table)) {
                    this.log('发现新的layui表格，开始监控');
                    this.observeLayuiTable(table);
                    this.replaceTextInElement(table);
                }
            });
        }, 3000);
    },

    /**
     * 设置layui事件监听器
     */
    setupLayuiEventListeners() {
        // 监听layui表单提交/重置
        document.addEventListener('click', (e) => {
            const element = e.target;
            
            // 检查点击的元素是否应该被忽略
            if (this.shouldIgnoreElement(element)) {
                return;
            }
            
            // 处理查询按钮
            if (element.classList.contains('layui-btn') && 
                (element.textContent.includes('查询') || 
                 element.getAttribute('lay-submit') || 
                 element.getAttribute('lay-filter') === 'search')) {
                this.log('检测到layui查询按钮点击');
                setTimeout(() => {
                    this.handleLayuiQueryComplete();
                }, 500);
            }
        });
        
        // 监听layui表单提交
        // if (typeof layui !== 'undefined' && layui.form) {
        //     layui.form.on('submit(*)', (data) => {
        //         this.log('检测到layui表单提交');
        //         setTimeout(() => {
        //             this.handleLayuiQueryComplete();
        //         }, 500);
        //         return false;
        //     });
        // }
    },

    /**
     * 处理layui查询完成
     */
    handleLayuiQueryComplete() {
        this.log('layui查询完成，开始替换文本');
        
        // 1. 重新查找所有表格（排除被忽略的）
        this.monitorExistingTables();
        
        // 2. 执行全局替换（会自动忽略标记的元素）
        this.forceReplaceText();
        
        // 3. 特别处理常见的layui组件（排除被忽略的）
        this.replaceLayuiComponents();
    },

    /**
     * 替换layui组件文本
     */
    replaceLayuiComponents() {
        this.log('开始替换layui组件文本');
        
        // 处理form元素（排除被忽略的）
        const forms = document.querySelectorAll('.layui-form');
        forms.forEach(form => {
            if (this.shouldIgnoreElement(form)) {
                return;
            }
            this.replaceTextInElement(form);
        });
        
        // 处理tab元素（排除被忽略的）
        const tabs = document.querySelectorAll('.layui-tab, .layui-tab-title');
        tabs.forEach(tab => {
            if (this.shouldIgnoreElement(tab)) {
                return;
            }
            this.replaceTextInElement(tab);
        });
        
        // 处理card元素（排除被忽略的）
        const cards = document.querySelectorAll('.layui-card, .layui-card-header');
        cards.forEach(card => {
            if (this.shouldIgnoreElement(card)) {
                return;
            }
            this.replaceTextInElement(card);
        });
    },

    /**
     * 替换整个文档中的文本
     */
    replaceTextInDocument() {
        this.log('开始替换文档中的文本');
        if (document.body) {
            // 检查整个body是否应该被忽略
            if (this.shouldIgnoreElement(document.body)) {
                this.log('整个body被标记为忽略，跳过文本替换');
                return;
            }
            
            this.replaceTextInElement(document.body);
        } else {
            this.log('document.body 不存在，等待 DOM 加载');
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.log('DOM 加载完成，开始替换');
                    this.replaceTextInElement(document.body);
                });
            }
        }
    },

    /**
     * 递归替换元素中的文本
     * @param {HTMLElement} element 要替换文本的元素
     */
    replaceTextInElement(element) {
        // 检查是否应该跳过这个元素
        if (this.shouldSkipElement(element)) {
            return;
        }

        // 检查是否应该忽略这个元素
        if (this.shouldIgnoreElement(element)) {
            this.log(`忽略元素，跳过处理: ${element.tagName || '文本节点'}`);
            return;
        }

        // 对于layui表格，不检查已处理标记，始终重新处理
        const isLayuiTable = element.classList && 
                            (element.classList.contains('layui-table') || 
                             element.closest('.layui-table'));
        
        if (!isLayuiTable && element.dataset && element.dataset.textReplaced) {
            return;
        }

        // 处理元素节点
        if (element.nodeType === Node.ELEMENT_NODE) {
            // 特别处理label元素
            if (element.tagName === 'LABEL' || element.classList.contains('layui-form-label')) {
                
                const walker = document.createTreeWalker(
                    element,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );
                
                let node;
                while (node = walker.nextNode()) {
                    // 检查文本节点是否在忽略元素的子树中
                    let parentElement = node.parentElement;
                    let shouldIgnoreTextNode = false;
                    
                    // 向上查找父元素，检查是否在忽略元素中
                    while (parentElement && parentElement !== element) {
                        if (this.shouldIgnoreElement(parentElement)) {
                            shouldIgnoreTextNode = true;
                            break;
                        }
                        parentElement = parentElement.parentElement;
                    }
                    
                    if (!shouldIgnoreTextNode) {
                        this.replaceTextNode(node);
                    } else {
                        this.log(`忽略文本节点（在忽略元素中）: "${node.textContent.substring(0, 30)}..."`);
                    }
                }
            } else {
                // 递归处理子节点
                const childNodes = Array.from(element.childNodes);
                childNodes.forEach(child => {
                    // 对于子元素节点，检查是否应该忽略
                    if (child.nodeType === Node.ELEMENT_NODE && this.shouldIgnoreElement(child)) {
                        this.log(`跳过忽略元素的子树: ${child.tagName}`);
                        return; // 跳过整个子树的处理
                    }
                    
                    this.replaceTextInElement(child);
                });
            }
            
            // 标记已处理（layui表格除外）
            if (!isLayuiTable && element.dataset) {
                element.dataset.textReplaced = 'true';
            }
        } 
        // 处理文本节点
        else if (element.nodeType === Node.TEXT_NODE) {
            // 检查文本节点的父元素是否应该被忽略
            const parentElement = element.parentElement;
            if (parentElement && this.shouldIgnoreElement(parentElement)) {
                this.log(`忽略文本节点（父元素被标记忽略）: "${element.textContent.substring(0, 30)}..."`);
                return;
            }
            
            this.replaceTextNode(element);
        }
    },

    /**
     * 替换单个文本节点
     * @param {Text} textNode 文本节点
     */
    replaceTextNode(textNode) {
        if (!textNode || !textNode.textContent) {
            return;
        }

        let originalText = textNode.textContent;
        
        // 检查是否需要替换
        let needsReplacement = false;
        for(let key in TEXT_REPLACE) {
            if (originalText.includes(key)) {
                needsReplacement = true;
                break;
            }
        }
        
        if (needsReplacement) {
            this.log(`发现需要替换的文本: "${originalText}"`);
            
            const cacheKey = originalText;
            if (this.cache.has(cacheKey)) {
                textNode.textContent = this.cache.get(cacheKey);
                this.log(`使用缓存替换: "${originalText}" -> "${textNode.textContent}"`);
            } else {
                let replacedText = originalText;
                for(let key in TEXT_REPLACE) {
                    const value = TEXT_REPLACE[key];
                    const regex = new RegExp(this.escapeRegExp(key), 'g');
                    replacedText = replacedText.replace(regex, value);
                }
                
                if (replacedText !== originalText) {
                    textNode.textContent = replacedText;
                    this.addToCache(cacheKey, replacedText);
                    this.log(`替换完成: "${originalText}" -> "${replacedText}"`);
                }
            }
        }
    },

    /**
     * 转义正则表达式特殊字符
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * 判断是否应该跳过该元素（技术性跳过，不是用户配置的忽略）
     */
    shouldSkipElement(element) {
        if (!element || !element.nodeType) {
            return true;
        }

        if (element.nodeType !== Node.ELEMENT_NODE && element.nodeType !== Node.TEXT_NODE) {
            return true;
        }

        if (element.nodeType === Node.ELEMENT_NODE) {
            if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
                return true;
            }

            const skipTags = ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION'];
            if (element.tagName && skipTags.includes(element.tagName)) {
                return true;
            }
        }

        return false;
    },

    /**
     * 设置 MutationObserver 监控 DOM 变化
     */
    setupMutationObserver() {
        if (typeof MutationObserver === 'undefined') {
            if (this.config.debug) {
                console.warn('MutationObserver is not supported in this browser');
            }
            return;
        }
        
        if (!document.body) {
            if (this.config.debug) {
                console.warn('document.body is not available yet');
            }
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.setupMutationObserver();
                });
            }
            return;
        }
        
        this.observer = new MutationObserver((mutations) => {
            this.throttle(() => {
                this.processMutations(mutations);
            }, this.config.throttleDelay);
        });
        
        try {
            this.observer.observe(document.body, this.config.observerConfig);
            
            if (this.config.debug) {
                console.log('MutationObserver started successfully');
            }
            
            this.log('DOM 监控已启动');
        } catch (error) {
            if (this.config.debug) {
                console.error('Failed to start MutationObserver:', error);
            }
        }
    },

    /**
     * 处理 DOM 变化
     */
    processMutations(mutations) {
        const elementsToProcess = new Set();

        mutations.forEach(mutation => {
            // 处理子节点变化
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    // 检查新增节点是否应该被忽略
                    if (this.shouldIgnoreElement(node)) {
                        this.log(`忽略新增节点（标记为忽略）`);
                        return;
                    }
                    
                    if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
                        elementsToProcess.add(node);
                        
                        // 检查是否是layui表格
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const layuiTable = node.classList && 
                                              (node.classList.contains('layui-table') || 
                                               node.closest('.layui-table'));
                            if (layuiTable && !this.shouldIgnoreElement(layuiTable)) {
                                this.log('检测到新的layui表格元素');
                                this.observeLayuiTable(layuiTable);
                            }
                        }
                    }
                });
            }

            // 处理文本变化
            if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
                // 检查文本节点的父元素是否应该被忽略
                const parentElement = mutation.target.parentElement;
                if (parentElement && this.shouldIgnoreElement(parentElement)) {
                    return;
                }
                
                for(let key in TEXT_REPLACE) {
                    if (mutation.target.textContent && mutation.target.textContent.includes(key)) {
                        if (mutation.target.parentElement && mutation.target.parentElement.dataset) {
                            delete mutation.target.parentElement.dataset.textReplaced;
                        }
                        elementsToProcess.add(mutation.target);
                    }
                }
            }
        });

        if (elementsToProcess.size > 0) {
            this.log(`处理 ${elementsToProcess.size} 个元素的变化`);
            elementsToProcess.forEach(element => {
                if (element.nodeType === Node.ELEMENT_NODE && element.dataset) {
                    delete element.dataset.textReplaced;
                }
                this.replaceTextInElement(element);
            });
        }
    },

    /**
     * 强制重新替换所有文本
     */
    forceReplaceText() {
        this.log('强制重新替换文本');
        // 清空缓存
        this.cache.clear();
        // 清除所有元素的已处理标记（除了被忽略的元素）
        this.clearProcessedMarks();
        // 重新替换
        this.replaceTextInDocument();
        // 特别处理layui组件（会自动忽略标记的元素）
        this.replaceLayuiComponents();
    },

    /**
     * 专门处理特定选择器的元素
     */
    replaceSpecificElements() {
        this.log('开始替换特定元素');
        
        // 处理layui相关元素（排除被忽略的）
        const allLayuiElements = document.querySelectorAll('.layui-form-label, .layui-table, .layui-card-header');
        const layuiElements = Array.from(allLayuiElements).filter(el => !this.shouldIgnoreElement(el));
        
        this.log(`找到 ${layuiElements.length} 个需要处理的layui相关元素（总元素数：${allLayuiElements.length}）`);
        
        layuiElements.forEach((element, index) => {
            this.log(`处理第 ${index + 1} 个layui元素: ${element.tagName}.${Array.from(element.classList).join('.')}`);
            if (element.dataset) {
                delete element.dataset.textReplaced;
            }
            this.replaceTextInElement(element);
        });
        
        // 处理所有表格单元格（排除被忽略的）
        const allCells = document.querySelectorAll('td, th');
        const cells = Array.from(allCells).filter(cell => !this.shouldIgnoreElement(cell));
        
        cells.forEach(cell => {
            if (cell.dataset) {
                delete cell.dataset.textReplaced;
            }
            this.replaceTextInElement(cell);
        });
    },

    /**
     * 清除所有元素的已处理标记（排除被忽略的元素）
     */
    clearProcessedMarks() {
        // 只选择没有被忽略的元素
        const elements = document.querySelectorAll('[data-text-replaced="true"]');
        const elementsToClear = Array.from(elements).filter(el => !this.shouldIgnoreElement(el));
        
        this.log(`清除 ${elementsToClear.length} 个元素的已处理标记`);
        elementsToClear.forEach(element => {
            delete element.dataset.textReplaced;
        });
    },

    /**
     * 日志函数
     */
    log(message) {
        if (this.config.debug) {
            console.log(`[TextReplaceTool] ${message}`);
        }
    },

    // 其他辅助方法保持不变...
    addToCache(key, value) {
        if (this.cache.size >= this.config.cacheSizeLimit) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    },

    throttle(func, delay) {
        if (this.throttleTimer) {
            clearTimeout(this.throttleTimer);
        }
        this.throttleTimer = setTimeout(() => {
            func();
            this.throttleTimer = null;
        }, delay);
    },

    clearCache() {
        this.cache.clear();
        this.log('缓存已清空');
    },

    getCacheStatus() {
        return {
            size: this.cache.size,
            limit: this.config.cacheSizeLimit
        };
    }
};

// 暴露到全局
if (typeof window !== 'undefined') {
    window.TextReplaceTool = TextReplaceTool;
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // 等待layui加载完成
        const checkLayuiLoaded = setInterval(() => {
            if (typeof layui !== 'undefined') {
                clearInterval(checkLayuiLoaded);
                TextReplaceTool.initTextReplace();
                setTimeout(() => {
                    TextReplaceTool.replaceSpecificElements();
                }, 1000);
            }
        }, 100);
        
        // 如果5秒后layui仍未加载，仍然初始化
        setTimeout(() => {
            clearInterval(checkLayuiLoaded);
            TextReplaceTool.initTextReplace();
        }, 5000);
    });
} else {
    setTimeout(() => {
        TextReplaceTool.initTextReplace();
        TextReplaceTool.replaceSpecificElements();
    }, 100);
}

// 导出模块
try {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TextReplaceTool;
    }
} catch (e) {
    // 忽略模块导出错误
}