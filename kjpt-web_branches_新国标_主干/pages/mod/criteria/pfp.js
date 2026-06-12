const _BLANK_STR = '__BLANK_STR__';
/**
 * 导出“达标情况明细”Excel。
 * - 导出列严格跟随页面 `renderScoreDetailTable()` 的列配置（含广东/默认差异、隐藏列）。
 * - 若列配置包含 `templet`，优先导出其渲染后的展示值（会做简单去 HTML）。
 *
 * @param {Array<Object>} scoreDetailList 明细数据列表
 * @param {string} personName 姓名
 * @param {string} titleName 职称
 * @param {string|number} cmeYear 年度
 * @param {string} passResult 达标结果
 * @param {Array<Object>} scoreDetailColumns layTable 列配置（来自页面动态列）
 */
function ltable2excel(scoreDetailList, personName, titleName, cmeYear, passResult, scoreDetailColumns) {
    let hasData = scoreDetailList && (scoreDetailList.length > 0);
    if (!hasData) {
        layui.lat.failMsg('无数据');
        return;
    }
    const tableDom = createTable(scoreDetailList, personName, titleName, cmeYear, passResult, scoreDetailColumns);
    let wb = XLSX.utils.table_to_book(tableDom, {sheet: "达标情况明细", raw: true});
    let ws = wb["Sheets"]["达标情况明细"];
    // width（随表格列动态变化）
    ws["!cols"] = buildWsCols(scoreDetailColumns);
    // style（前 3 行为表头信息 + 列标题）
    let normalStyle = {
        border: {
            top: {style: 'thin'},
            bottom: {style: 'thin'},
            left: {style: 'thin'},
            right: {style: 'thin'}
        },
        alignment: {horizontal: 'center', vertical: 'center', wrapText: true},
    };
    let titleStyle = {
        font: {
            bold: true,
            // sz: 20
        },
        alignment: {horizontal: 'center', vertical: 'center', wrapText: true},
        fill: {
            fgColor: {rgb: 'ebebeb'}
        },
        border: {
            top: {style: 'thin'},
            bottom: {style: 'thin'},
            left: {style: 'thin'},
            right: {style: 'thin'}
        }
    };
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let r = range.s.r; r <= range.e.r; r++) {
        for (let c = range.s.c; c <= range.e.c; c++) {
            //
            const loc = XLSX.utils.encode_cell({r, c});
            const cell = ws[loc];
            // console.info('loc: %s, cell: %s', loc, cell);
            if (!cell) continue;
            ws[loc]['s'] = (r <= 2) ? titleStyle : normalStyle;
            (ws[loc]['v'] === _BLANK_STR) && (ws[loc]['v'] = '');
        }
    }
    // ws["A1"]['v'] = 'zaaaaaaaa';
    XLSX.writeFile(wb, '达标情况明细.xlsx');
}


/**
 * 导出“达标情况明细”Excel。
 * - 导出列严格跟随页面 `renderScoreDetailTable()` 的列配置（含广东/默认差异、隐藏列）。
 * - 若列配置包含 `templet`，优先导出其渲染后的展示值（会做简单去 HTML）。
 *
 * @param {Array<Object>} scoreDetailList 明细数据列表
 * @param {string} personName 姓名
 * @param {string} titleName 职称
 * @param {string|number} cmeYear 年度
 * @param {string} passResult 达标结果
 * @param {Array<Object>} scoreDetailColumns layTable 列配置（来自页面动态列）
 */
function ltable2excel2(scoreDetailList, personName, titleName, cmeYear, passTitleName, passResult, scoreDetailColumns) {
    let hasData = scoreDetailList && (scoreDetailList.length > 0);
    if (!hasData) {
        layui.lat.failMsg('无数据');
        return;
    }
    const tableDom = createTable2(scoreDetailList, personName, titleName, cmeYear, passTitleName,passResult, scoreDetailColumns);
    let wb = XLSX.utils.table_to_book(tableDom, {sheet: "达标情况明细", raw: true});
    let ws = wb["Sheets"]["达标情况明细"];
    // width（随表格列动态变化）
    ws["!cols"] = buildWsCols(scoreDetailColumns);
    // style（前 3 行为表头信息 + 列标题）
    let normalStyle = {
        border: {
            top: {style: 'thin'},
            bottom: {style: 'thin'},
            left: {style: 'thin'},
            right: {style: 'thin'}
        },
        alignment: {horizontal: 'center', vertical: 'center', wrapText: true},
    };
    let titleStyle = {
        font: {
            bold: true,
            // sz: 20
        },
        alignment: {horizontal: 'center', vertical: 'center', wrapText: true},
        fill: {
            fgColor: {rgb: 'ebebeb'}
        },
        border: {
            top: {style: 'thin'},
            bottom: {style: 'thin'},
            left: {style: 'thin'},
            right: {style: 'thin'}
        }
    };
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let r = range.s.r; r <= range.e.r; r++) {
        for (let c = range.s.c; c <= range.e.c; c++) {
            //
            const loc = XLSX.utils.encode_cell({r, c});
            const cell = ws[loc];
            // console.info('loc: %s, cell: %s', loc, cell);
            if (!cell) continue;
            ws[loc]['s'] = (r <= 2) ? titleStyle : normalStyle;
            (ws[loc]['v'] === _BLANK_STR) && (ws[loc]['v'] = '');
        }
    }
    // ws["A1"]['v'] = 'zaaaaaaaa';
    XLSX.writeFile(wb, '达标情况明细.xlsx');
}

/**
 * 生成用于 `XLSX.utils.table_to_book` 的 HTMLTableElement。
 *
 * @param {Array<Object>} scoreDetailList 明细数据列表
 * @param {string} personName 姓名
 * @param {string} titleName 职称
 * @param {string|number} cmeYear 年度
 * @param {string} passResult 达标结果
 * @param {Array<Object>} scoreDetailColumns layTable 列配置（来自页面动态列）
 * @returns {HTMLTableElement}
 */
function createTable(scoreDetailList, personName, titleName, cmeYear, passResult, scoreDetailColumns) {
    const visibleColumns = normalizeColumns(scoreDetailColumns);
    const colCount = Math.max(visibleColumns.length, 8);
    const blankTds = (n) => Array.from({length: Math.max(0, n)}).map(() => `<td>&ensp;</td>`).join('');
    const unitColspan = Math.max(1, colCount - 1);
    const columnHeaderTds = visibleColumns.map(col => `<td>${escapeHtml(col.title)}</td>`).join('');
    const tableStr = `<table>
                <thead>
                    <tr>
                        <td>姓名</td>
                        <td>${personName}</td>
                        <td>年度</td>
                        <td>${getOrDefault(cmeYear, '')}</td>
                        <td>职称</td>
                        <td>${getOrDefault(titleName, '')}</td>
                        <td>达标结果</td>
                        <td>${getOrDefault(passResult, '')}</td>
                        ${blankTds(colCount - 8)}
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">所在单位</td>
                        <td colspan="${unitColspan}">${escapeHtml(getOrDefault(_unitName, ''))}</td>
                    </tr>
                    <tr>
                        ${columnHeaderTds}${blankTds(colCount - visibleColumns.length)}
                    </tr>
                </thead>
                <tbody>${rows(scoreDetailList, visibleColumns)}</tbody>
                </table>`;
    const $table = $(tableStr);
    return $table.get(0);
}


/**
 * 生成用于 `XLSX.utils.table_to_book` 的 HTMLTableElement。
 *
 * @param {Array<Object>} scoreDetailList 明细数据列表
 * @param {string} personName 姓名
 * @param {string} titleName 职称
 * @param {string|number} cmeYear 年度
 * @param {string} passResult 达标结果
 * @param {Array<Object>} scoreDetailColumns layTable 列配置（来自页面动态列）
 * @returns {HTMLTableElement}
 */
function createTable2(scoreDetailList, personName, titleName, cmeYear,passTitleName, passResult, scoreDetailColumns) {
    const visibleColumns = normalizeColumns(scoreDetailColumns);
    const colCount = Math.max(visibleColumns.length, 8);
    const blankTds = (n) => Array.from({length: Math.max(0, n)}).map(() => `<td>&ensp;</td>`).join('');
    const unitColspan = Math.max(1, colCount - 1);
    const columnHeaderTds = visibleColumns.map(col => `<td>${escapeHtml(col.title)}</td>`).join('');
    const tableStr = `<table>
                <thead>
                    <tr>
                        <td>姓名</td>
                        <td>${personName}</td>
                        <td>年度</td>
                        <td>${getOrDefault(cmeYear, '')}</td>
                        <td>职称</td>
                        <td>${getOrDefault(titleName, '')}</td>
                        <td>${passTitleName}</td>
                        <td>${getOrDefault(passResult, '')}</td>
                        ${blankTds(colCount - 8)}
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">所在单位</td>
                        <td colspan="${unitColspan}">${escapeHtml(getOrDefault(_unitName, ''))}</td>
                    </tr>
                    <tr>
                        ${columnHeaderTds}${blankTds(colCount - visibleColumns.length)}
                    </tr>
                </thead>
                <tbody>${rows(scoreDetailList, visibleColumns)}</tbody>
                </table>`;
    const $table = $(tableStr);
    return $table.get(0);
}

/**
 * 根据列配置输出数据行。
 *
 * @param {Array<Object>} scoreDetailList 明细数据列表
 * @param {Array<Object>} visibleColumns 可见列（已过滤 hide）
 * @returns {string} tbody 的 html 字符串
 */
function rows(scoreDetailList, visibleColumns) {
    if (!scoreDetailList) {
        return '';
    }
    return scoreDetailList.map(scoreDetail => {
        const tds = (visibleColumns || []).map(col => {
            const val = resolveCellValue(scoreDetail, col);
            const cellVal = (val === null || val === undefined || val === '') ? _BLANK_STR : String(val);
            return `<td>${escapeHtml(cellVal)}</td>`;
        }).join('');
        return `<tr>${tds}</tr>`;
    }).join('');
}

/**
 * 标准化列配置：
 * - 过滤掉 `hide: true` 的列（与页面隐藏逻辑一致）
 * - 当列配置不存在时，回退为默认列（保证导出可用）
 *
 * @param {Array<Object>} scoreDetailColumns layTable 列配置
 * @returns {Array<Object>} 可见列配置
 */
function normalizeColumns(scoreDetailColumns) {
    if (!Array.isArray(scoreDetailColumns)) {
        return [
            {field: 'projNo', title: '项目编号'},
            {field: 'projName', title: '项目名称'},
            {field: 'scoreKindName', title: '学分分类'},
            {field: 'scoreLevelName', title: '学分子分类'},
            {field: 'extdata', title: '详细信息'},
            {field: 'projType', title: '项目类型'},
            {field: 'score', title: '学分'},
            {field: 'period', title: '学时'},
            {field: 'passState', title: '有效状态'},
            {field: 'noPassOpinion', title: '不计入达标原因'},
            {field: 'remark', title: '备注'},
        ];
    }
    return scoreDetailColumns
        .filter(col => col && col.title && (col.hide !== true))
        .map(col => ({...col}));
}

/**
 * 根据列配置生成 Sheet 列宽配置（wpx）。
 *
 * @param {Array<Object>} scoreDetailColumns layTable 列配置
 * @returns {Array<{wpx:number}>}
 */
function buildWsCols(scoreDetailColumns) {
    const cols = normalizeColumns(scoreDetailColumns);
    return cols.map(col => {
        const px = Number(col.width || col.minWidth);
        return {wpx: Number.isFinite(px) ? px : 120};
    });
}

/**
 * 计算单元格导出值：
 * - 优先使用 `templet(row)` 的展示值（并去除 HTML 标签）
 * - 否则使用 `row[field]`
 *
 * @param {Object} row 行数据
 * @param {Object} col 列配置
 * @returns {string}
 */
function resolveCellValue(row, col) {
    if (!row || !col) return '';
    // 优先复用 layTable 的 templet 输出（如：广东“形式/录入方式”等）
    if (typeof col.templet === 'function') {
        try {
            const v = col.templet(row);
            return stripHtml(v);
        } catch (e) {
            // templet 出错时退回字段值
        }
    }
    if (col.field) {
        const v = row[col.field];
        return stripHtml(v);
    }
    return '';
}

/**
 * 去除 HTML 标签，避免 templet 返回 HTML 时导出脏数据。
 *
 * @param {*} v
 * @returns {string}
 */
function stripHtml(v) {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return s.replace(/<[^>]*>/g, '');
}

/**
 * HTML 转义，避免导出时破坏 table 结构或产生注入。
 *
 * @param {*} v
 * @returns {string}
 */
function escapeHtml(v) {
    const s = v === null || v === undefined ? '' : String(v);
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// function getOrDefault(v, def) {
//     return (v === null || v === undefined || v === '') ? def : v;
// }
