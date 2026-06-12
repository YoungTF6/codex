"use strict";
//<!-- 这个元素不会被替换 -->
//<div class="custom-ignore">学时：这是一个示例，不会被替换为"学习时长"</div>

//<!-- 这个元素会被替换 -->
//<div>学时：这个会被替换为"学习时长"</div>

//使用其他忽略标记
//<div class="no-replace-text">学时：这个也不会被替换</div>
//<div data-no-replace="true">学时：这个同样不会被替换</div>
//.custom-ignore, [data-no-replace], .no-replace-text
//
//管理员审核文案替换（需 user-type=11，且位于启用标记作用域内，可从 body 下发）：
//<body class="admin-text-replace"> 或 <body data-admin-text-replace="true">
//<div class="admin-text-replace">仅该区域内替换审核类文案</div>
//.admin-text-replace, [data-admin-text-replace], .text-replace-admin

/*
 * 文本替换工具（高性能版）
 * 保持原接口，对外暴露方式不变
 */

const GUANG_DONG = '289bf0ca-52cb-4b19-b737-9bd200a69ce1';
const USER_TYPE_ADMIN = '11';
const TEXT_STANDARD_ID = localStorage.getItem('standardkind-id');
const TEXT_REPLACE = {
    '学时': '时长（小时）',
    "手机端上传": "手机扫码上传",
    "举办前申请": "举办前登记",
};

const ADMIN_TEXT_REPLACE = {
    "审核": "复核"
}

const TextReplaceTool = {
    config: {
        debug: false,
        observerConfig: {
            childList: true,
            subtree: true,
            characterData: true
        },
        // 统一的忽略选择器（合并成一个选择器，提高 matches 效率）
        ignoreSelector: '.custom-ignore, [data-no-replace], .no-replace-text',
        // 管理员审核文案启用标记（参考 ignoreSelector，可标在 body 或任意容器上）
        adminReplaceSelector: '.admin-text-replace, [data-admin-text-replace], .text-replace-admin'
    },

    // 已监控的表格容器 WeakSet
    monitoredTables: new WeakSet(),

    // 替换进行中标记，避免 MutationObserver 与自身修改互相触发
    _isReplacing: false,

    // 待处理 DOM 根节点与防抖定时器
    _pendingReplaceRoots: null,
    _debounceTimer: null,

    // 基础规则 / 管理员规则 正则缓存：key -> RegExp
    baseRegexCache: new Map(),
    adminRegexCache: new Map(),

    // 文本缓存 + LRU
    textCache: new Map(),
    cacheMaxSize: 500,

    // body 未就绪时延迟执行（避免 MutationObserver.observe(null)）
    _whenDocumentBodyReady(callback) {
        if (document.body) {
            callback();
            return;
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback, { once: true });
        } else {
            requestAnimationFrame(callback);
        }
    },

    /* ---------- 初始化入口 ---------- */
    initTextReplace() {
        if (!this.shouldReplaceText()) return;

        if (!document.body) {
            if (this._initBodyWaitScheduled) return;
            this._initBodyWaitScheduled = true;
            this._whenDocumentBodyReady(() => {
                this._initBodyWaitScheduled = false;
                this.initTextReplace();
            });
            return;
        }
        if (this._textReplaceInitialized) return;
        this._textReplaceInitialized = true;

        // 预编译所有替换正则，避免运行时重复构造
        this._compileRegex();

        // 首屏替换
        this.replaceTextInDocument();

        // 监听后续 DOM 变化
        this.setupMutationObserver();

        // 拦截 layui.form.render，避免重绘后展示文案回退
        this.hookLayuiFormRender();

        // Layui 表格特殊处理
        this.monitorLayuiTables();

        // 同步 Layui 下拉框展示文案（展示值在 input.value 中，不走文本节点替换）
        this.syncLayuiFormSelect();

        // 对关键区域进行二次保障（利用 requestAnimationFrame）
        requestAnimationFrame(() => {
            this.replaceSpecificElements();
            this.syncLayuiFormSelect();
        });
    },

    shouldReplaceText() {
        return TEXT_STANDARD_ID === GUANG_DONG;
    },

    // 管理员用户（user-type 为 11）
    shouldApplyAdminTextReplace() {
        return localStorage.getItem('user-type') === USER_TYPE_ADMIN;
    },

    // 当前元素是否处于管理员审核文案启用标记作用域内（body 或任意祖先带标记即可）
    isInAdminReplaceScope(element) {
        if (!element || !element.closest) return false;
        return element.closest(this.config.adminReplaceSelector) !== null;
    },

    // 是否对当前元素应用 ADMIN_TEXT_REPLACE（user-type + 启用标记）
    shouldUseAdminRulesForElement(element) {
        return this.shouldApplyAdminTextReplace() && this.isInAdminReplaceScope(element);
    },

    // 整页是否启用管理员审核文案（body 带标记等）
    isAdminReplaceEnabledOnPage() {
        return this.shouldUseAdminRulesForElement(document.body);
    },

    /* ---------- 忽略判断（一次 matches 完成） ---------- */
    shouldIgnoreElement(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
        return element.matches(this.config.ignoreSelector);
    },

    _buildRegexCache(rules, cache) {
        cache.clear();
        for (const key in rules) {
            cache.set(key, new RegExp(this.escapeRegExp(key), 'g'));
        }
    },

    _textNeedsReplace(text, useAdminRules) {
        for (const key in TEXT_REPLACE) {
            if (text.includes(key)) return true;
        }
        if (useAdminRules) {
            for (const key in ADMIN_TEXT_REPLACE) {
                if (text.includes(key)) return true;
            }
        }
        return false;
    },

    _applyRulesWithCache(text, rules, cache) {
        let replaced = text;
        for (const key in rules) {
            const regex = cache.get(key);
            if (regex) {
                replaced = replaced.replace(regex, rules[key]);
            }
        }
        return replaced;
    },

    /* ---------- 正则预编译 ---------- */
    _compileRegex() {
        this._buildRegexCache(TEXT_REPLACE, this.baseRegexCache);
        this._buildRegexCache(ADMIN_TEXT_REPLACE, this.adminRegexCache);
    },

    changeYear(year) {
        if (year >= 2026) {
            TEXT_REPLACE["达标"] = "合格";
        } else {
            TEXT_REPLACE["合格"] = "达标";
            if (Object.prototype.hasOwnProperty.call(TEXT_REPLACE, "达标")) {
                delete TEXT_REPLACE["达标"];
            }
        }
        // 规则变化后重新编译正则
        this._compileRegex();
    },

    /* ---------- 文本替换核心 ---------- */
    replaceTextInDocument(root = document.body) {
        if (!root || this.shouldIgnoreElement(root)) return;

        const shouldLock = !this._isReplacing;
        if (shouldLock) this._isReplacing = true;

        try {
        // 使用 TreeWalker 快速遍历所有文本节点，跳过忽略子树
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // 如果父级被标记忽略，跳过该分支
                    let parent = node.parentElement;
                    while (parent && parent !== root) {
                        if (parent.matches(this.config.ignoreSelector)) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        parent = parent.parentElement;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) {
            textNodes.push(node);
        }

        // 批量替换
        for (let i = 0; i < textNodes.length; i++) {
            this.replaceTextNode(textNodes[i]);
        }

        // Layui select 的当前展示文案在 input.value 属性中，需单独同步
        this.syncLayuiFormSelect(root);
        } finally {
            if (shouldLock) this._isReplacing = false;
        }
    },

    // 按规则替换字符串（表格数据、属性值等场景复用）
    // useAdminRules：是否叠加 ADMIN_TEXT_REPLACE（需 user-type=11 且调用方已判断作用域，或传 false）
    applyRulesToString(text, useAdminRules) {
        if (!text || typeof text !== 'string') return text;
        useAdminRules = !!useAdminRules;

        if (!this._textNeedsReplace(text, useAdminRules)) return text;

        const cacheKey = (useAdminRules ? 'A:' : 'B:') + text;
        const cached = this.textCache.get(cacheKey);
        if (cached !== undefined) return cached;

        let replaced = this._applyRulesWithCache(text, TEXT_REPLACE, this.baseRegexCache);
        if (useAdminRules) {
            replaced = this._applyRulesWithCache(replaced, ADMIN_TEXT_REPLACE, this.adminRegexCache);
        }

        this._addToCache(cacheKey, replaced);
        return replaced;
    },

    replaceTextNode(textNode) {
        const text = textNode.textContent;
        if (!text) return;

        const useAdminRules = this.shouldUseAdminRulesForElement(textNode.parentElement);
        const replaced = this.applyRulesToString(text, useAdminRules);
        if (replaced === text) return;

        textNode.textContent = replaced;
    },

    /* ---------- 缓存 LRU ---------- */
    _addToCache(original, replaced) {
        if (this.textCache.size >= this.cacheMaxSize) {
            const firstKey = this.textCache.keys().next().value;
            this.textCache.delete(firstKey);
        }
        this.textCache.set(original, replaced);
    },

    /* ---------- 指定区域强制重刷 ---------- */
    forceReplaceTextInDocument(element) {
        // 清除该区域下的 WeakSet 记录较困难，直接全量重刷该子树
        this.replaceTextInDocument(element);
    },

    /* ---------- 全局强制重刷 ---------- */
    forceReplaceText() {
        this.textCache.clear();
        this.replaceTextInDocument();
        requestAnimationFrame(() => {
            this.replaceSpecificElements();
            this.syncLayuiFormSelect();
        });
    },

    /* ---------- 表格数据替换（字符串/对象数组） ---------- */
    replaceTableText(arrData) {
        if (!this.shouldReplaceText() || arrData == null) return arrData;

        const useAdminRules = this.isAdminReplaceEnabledOnPage();
        const apply = (text) => this.applyRulesToString(text, useAdminRules);

        const walk = (node) => {
            if (Array.isArray(node)) {
                for (let i = 0; i < node.length; i++) {
                    const v = node[i];
                    if (typeof v === 'string') node[i] = apply(v);
                    else if (v && typeof v === 'object') walk(v);
                }
            } else if (node && typeof node === 'object') {
                for (const key in node) {
                    const v = node[key];
                    if (typeof v === 'string') node[key] = apply(v);
                    else if (v && typeof v === 'object') walk(v);
                }
            }
        };

        if (typeof arrData === 'string') return apply(arrData);
        walk(arrData);
        return arrData;
    },

    /* ---------- Layui 表格监控（使用 MutationObserver 统一观察） ---------- */
    monitorLayuiTables() {
        const body = document.body;
        if (!body) return;

        // 观察整个 body，捕获新增的表格
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE) continue;
                    // 检测新增的表格容器
                    const tables = node.matches('.layui-table, [lay-id], table[lay-filter]')
                        ? [node]
                        : node.querySelectorAll('.layui-table, [lay-id], table[lay-filter]');

                    for (const table of tables) {
                        if (this.shouldIgnoreElement(table)) continue;
                        if (this.monitoredTables.has(table)) continue;
                        this.monitoredTables.add(table);

                        // 对表格内容进行一次替换，并监听其变化
                        this.replaceTextInDocument(table);
                        this._observeTable(table);
                    }
                }
            }
        });

        observer.observe(body, { childList: true, subtree: true });

        // 初始已有表格
        document.querySelectorAll('.layui-table, [lay-id], table[lay-filter]').forEach(table => {
            if (!this.shouldIgnoreElement(table) && !this.monitoredTables.has(table)) {
                this.monitoredTables.add(table);
                this.replaceTextInDocument(table);
                this._observeTable(table);
            }
        });
    },

    _observeTable(table) {
        const observer = new MutationObserver(() => {
            if (this._isReplacing) return;
            // 表格内容变化时异步刷新，但不立即操作 DOM
            this._scheduleIdleReplace(table);
        });
        observer.observe(table, { childList: true, subtree: true, characterData: true });
        // 将 observer 绑定到表格，便于后续断开（可选）
        table.__textReplaceObserver = observer;
    },

    /* ---------- MutationObserver（全局） ---------- */
    setupMutationObserver() {
        if (this.globalObserver) return;
        const body = document.body;
        if (!body) return;

        this.globalObserver = new MutationObserver((mutations) => {
            if (this._isReplacing) return;

            // 收集所有受影响的根元素（忽略被标记忽略的）
            const roots = new Set();
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType !== Node.ELEMENT_NODE) continue;
                        if (this.shouldIgnoreElement(node)) continue;
                        roots.add(node);
                    }
                } else if (mutation.type === 'characterData') {
                    const parent = mutation.target.parentElement;
                    if (parent && !this.shouldIgnoreElement(parent)) {
                        roots.add(parent);
                    }
                }
            }

            if (roots.size > 0) {
                for (const root of roots) {
                    this._scheduleIdleReplace(root);
                }
            }
        });

        this.globalObserver.observe(body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    },

    _scheduleIdleReplace(element) {
        if (this._isReplacing || !element) return;

        if (!this._pendingReplaceRoots) {
            this._pendingReplaceRoots = new Set();
        }
        this._pendingReplaceRoots.add(element);

        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }
        // 防抖：等待 Layui form.render / jQuery.html 等批量 DOM 更新完成后再替换
        this._debounceTimer = setTimeout(() => {
            this._debounceTimer = null;
            const roots = this._pendingReplaceRoots;
            this._pendingReplaceRoots = new Set();
            if (!roots || roots.size === 0) return;

            this._isReplacing = true;
            try {
                for (const root of roots) {
                    this.replaceTextInDocument(root);
                }
                this.syncLayuiFormSelect();
            } finally {
                this._isReplacing = false;
            }
        }, 80);
    },

    // 拦截 layui.form.render，防止下拉框等组件重绘后展示文案回退
    hookLayuiFormRender() {
        const self = this;
        const tryHook = () => {
            if (!window.layui || !layui.form || layui.form.__textReplaceHooked) {
                return false;
            }
            const form = layui.form;
            const origRender = form.render;
            form.render = function () {
                const result = origRender.apply(this, arguments);
                self._scheduleIdleReplace(document.body);
                return result;
            };
            form.__textReplaceHooked = true;
            return true;
        };

        if (!tryHook()) {
            let retryCount = 0;
            const timer = setInterval(() => {
                retryCount += 1;
                if (tryHook() || retryCount >= 50) {
                    clearInterval(timer);
                }
            }, 200);
        }
    },

    /* ---------- Layui 下拉框展示同步 ---------- */
    _getLayuiSelectWrapper(select) {
        const next = select.nextElementSibling;
        if (next && next.classList.contains('layui-form-select')) return next;
        const prev = select.previousElementSibling;
        if (prev && prev.classList.contains('layui-form-select')) return prev;
        return null;
    },

    // form.render 会把选中项文案写入 .layui-select-title input 的 value，文本节点替换不会更新它
    syncLayuiFormSelect(root = document.body) {
        if (!root) return;

        const selects = root.nodeName === 'SELECT'
            ? [root]
            : (root.querySelectorAll ? root.querySelectorAll('select') : []);

        for (let i = 0; i < selects.length; i++) {
            const select = selects[i];
            if (this.shouldIgnoreElement(select)) continue;

            const wrapper = this._getLayuiSelectWrapper(select);
            if (!wrapper) continue;

            const useAdminRules = this.shouldUseAdminRulesForElement(select);
            const titleInput = wrapper.querySelector('.layui-select-title input');
            const selectedOption = select.options[select.selectedIndex];
            if (!titleInput || !selectedOption) continue;

            const displayText = this.applyRulesToString(selectedOption.textContent.trim(), useAdminRules);
            if (titleInput.value !== displayText) {
                titleInput.value = displayText;
            }

            const dds = wrapper.querySelectorAll('dl dd');
            if (!dds.length) continue;

            for (let j = 0; j < select.options.length; j++) {
                const option = select.options[j];
                const optionText = this.applyRulesToString(option.textContent.trim(), useAdminRules);
                const optionValue = option.value;
                for (let k = 0; k < dds.length; k++) {
                    const dd = dds[k];
                    if (String(dd.getAttribute('lay-value')) === String(optionValue)) {
                        dd.textContent = optionText;
                    }
                }
            }
        }
    },

    /* ---------- 特定元素处理 ---------- */
    replaceSpecificElements() {
        // 只针对常见的可能遗漏的区域
        const selectors = ['.layui-form-label', '.layui-card-header', '.layui-tab-title'];
        for (const sel of selectors) {
            document.querySelectorAll(sel).forEach(el => {
                if (!this.shouldIgnoreElement(el)) {
                    this.replaceTextInDocument(el);
                }
            });
        }
    },

    /* ---------- 工具方法 ---------- */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    clearCache() {
        this.textCache.clear();
    },

    log(msg) {
        if (this.config.debug) console.log(`[TextReplaceTool] ${msg}`);
    }
};

// 暴露到全局
if (typeof window !== 'undefined') {
    window.TextReplaceTool = TextReplaceTool;
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        TextReplaceTool.initTextReplace();
    });
} else {
    requestAnimationFrame(() => TextReplaceTool.initTextReplace());
}

// 模块导出（如支持）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextReplaceTool;
}