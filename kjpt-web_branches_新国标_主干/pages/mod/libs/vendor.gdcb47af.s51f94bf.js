let _gansu = {
    stateDict: {
        'todo': 0,
        'reject': 2,
        'approve': 3,
        'submit': 3,
        '0': '待审核',
        '2': '审核不通过',
        '3': '审核通过',
        '9': '终审通过',
        'x': '',
        '_': '',
    },
    // statex delete
    uccpTxt: function (row) {
        if (_isGov) {
            let arr = (row.statex || row.uccpState).split('');
            return this.stateDict['' + arr[_uut - 2]] || '';
        } else {
            let state = row.state;
            let fs = row.state % 10;
            if (state > 0) return this.stateDict[fs];
            return '';
        }
    },
    stxTxt: function (row) {
        if (_isGov) {
            let arr = (row.statex || row.uccpState).split('');
            return this.stateDict['' + arr[_uut - 2]] || '';
        } else {
            let state = row.state;
            let fs = row.state % 10;
            if (state > 0) return this.stateDict[fs];
            return '';
        }
    },
    submitTxt: function (row) {
        let state = row.state;
        let fs = (state || 0) % 10;
        if (0 === state) return '提交';
        if (this.stateDict.reject === fs) return '重新提交';
        return '';
    },
    canCheck: function (row) {
        // if('2.0导入' === row.remark && 99 === row.state && '3333' === (row.statex || row.uccpState)) return '';
        let state = row.state;
        let low = _uut * 10;
        let up = _uut * 10 + 9;
        if (0 === state) return '未提交';
        if (state < low) return '下级审核中';
        if (up < state) {
            if (this.isFinalUnit(row)) return '';
            return '已审核';
        }
        return '';
    },
    getFlow: function (phUnit, chUnit, titleLevelId, promote) {
        let pn = +promote;
        let tl = this.tl(titleLevelId);
        // p_unit  unit[2] -> province[5]
        if (phUnit) return '2,5';
        // c_unit promote-1  unit[2] -> city[4] -> province[5]
        // c_unit promote-0  unit[2] -> city[4]
        if (chUnit && 1 === pn) return '2,4,5';
        if (chUnit && 0 === pn) {
            if (34 === tl) return '2,4,5';
            return '2,4';
        }
        // unit promote-1  unit[2] -> county[3] -> city[4] -> province[5]
        // unit promote-0  unit[2] -> county[3] -> city[4]
        if (2 === tl && 1 === pn) return '2,3,4,5';
        if (2 === tl && 0 === pn) return '2,3,4';
        // unit[2] -> county[3] -> city[4]
        if (1 === tl) return '2,3,4';
        // unit[2] -> county[3] -> city[4] -> province[5]
        if (34 === tl) return '2,3,4,5';
        return '2,3,4,5,9';
    },
    hasNext: function (flow) {
        let curIdx;
        let flowArr = flow.split(',');
        flowArr.forEach((i, idx) => {
            if (+i === _uut) curIdx = idx;
        });
        return curIdx < (flowArr.length - 1);
    },
    nextUut: function (flow) {
        let curIdx;
        let flowArr = flow.split(',');
        flowArr.forEach((i, idx) => {
            if (+i === _uut) curIdx = idx;
        });
        return +(flowArr[curIdx + 1]);
    },
    nextState: function (flow, action, curState) {
        if ('submit' === action) {
            return this.nextUut(flow) * 10;
        }
        if ('approve' === action) {
            if (this.hasNext(flow)) return this.nextUut(flow) * 10;
            return 99;
        }
        if ('reject' === action) {
            return _uut * 10 + this.stateDict.reject;
        }
    },
    // statex delete
    nextUccpState: function (flow, action, curstx) {
        let arr = curstx.split('');
        arr[_uut - 2] = this.stateDict[action];
        if ('submit' === action) arr[this.nextUut(flow) - 2] = '0';
        if ('approve' === action && this.hasNext(flow)) arr[_uut - 1] = '0';
        return arr.join('').substring(0, 4);
    },
    nextstx: function (flow, action, curstx) {
        let arr = curstx.split('');
        arr[_uut - 2] = this.stateDict[action];
        if ('submit' === action) arr[this.nextUut(flow) - 2] = '0';
        if ('approve' === action && this.hasNext(flow)) arr[_uut - 1] = '0';
        return arr.join('').substring(0, 4);
    },
    isFinalUnit: function (row) {
        if (_isGovCounty) return false;
        let pn = +(row.promote || 0);
        let tl = this.tl(row.titleLevelId);
        if (_isGovCity) {
            if (1 === tl) return true;
            if (2 === tl) return 0 === pn;
            if (34 === tl) return false;
        }
        if (_isGovProvince) {
            if ('1' === row.concatUnitPc.split('')[0]) return true;
            if (1 === tl) return false;
            if (2 === tl) return 1 === pn;
            if (34 === tl) return true;
        }
    },
    hidePromoteCol: function (phUnit) {
        return _isGov || phUnit;
    },
    showPromoteSel: function (row) {
        return 'da42823c-796c-4377-a616-9b2f01271376' === row.titleLevelId;
    },
    tl: function (titleLevelId) {
        return {
            '7acab84c-e870-4a4d-90ea-9b2f01271376': 1,
            'da42823c-796c-4377-a616-9b2f01271376': 2,
            '6351aa8b-bba0-4805-99ca-9b2f01271376': 34,
            '3d5f8e06-1274-454c-9c55-9b2f01271376': 34
        }[titleLevelId];
    }
}