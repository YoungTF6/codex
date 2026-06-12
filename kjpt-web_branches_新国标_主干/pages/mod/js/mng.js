// ============================================================
// 字符串格式化方法 - 支持位置参数 {0}{1} 和命名参数 {key}
// ============================================================
String.prototype.format = function () {
  if (arguments.length > 0) {
    var result = this;
    if (arguments.length === 1 && typeof arguments[0] === 'object') {
      // 命名参数模式: "hello {name}".format({ name: "world" })
      var obj = arguments[0];
      for (var key in obj) {
        var reg = new RegExp('({' + key + '})', 'g');
        result = result.replace(reg, obj[key]);
      }
    } else {
      // 位置参数模式: "hello {0} {1}".format("world", "!")
      for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] === undefined) {
          return '';
        }
        var reg = new RegExp('({[' + i + ']})', 'g');
        result = result.replace(reg, arguments[i]);
      }
    }
    return result;
  }
  return this;
};

// ============================================================
// 树形数据递归查找 - 根据回调条件在树中查找节点
// ============================================================
const subTreeById = (treeData, predicate) => {
  for (const node of treeData) {
    if (predicate(node)) {
      return node;
    }
    if (node.children) {
      var found = subTreeById(node.children, predicate);
      if (found) {
        return found;
      }
    }
  }
};

// ============================================================
// 浏览器指纹识别（FingerprintJS）
// ============================================================
let fp;
if ('undefined' != typeof FingerprintJS) {
  let e = FingerprintJS.load();
  e.then(agent => agent.get()).then(result => fp = result.visitorId);
}

// ============================================================
// 默认/测试用 ID 常量
// ============================================================
var DEFAULT_IDS = {
  STANDARD_KIND_ID: "b7864061-7bd4-4ee7-a868-9b24009e92df",
  UNIT_ID_GOV: '090100',
  UNIT_ID: "090103",
  USER_ID: "e05def64-11a0-448a-b55b-3153199a777b"
};

// ============================================================
// 空值常量
// ============================================================
var EMPTY_VALUES = {
  UNIT_ID: '000000',
  UUID: "00000000-0000-0000-0000-000000000000"
};

// ============================================================
// 表单操作模式
// ============================================================
var FORM_MODE = {
  CREATE: "create",
  EDIT: "edit",
  VIEW: 'view',
  CONFIRM: 'confirm',
  CANCEL: "cancel"
};

// ============================================================
// 用户/角色类型
// ============================================================
var USER_TYPE = {
  SYS: 1,         // 系统
  ADMIN: 2,       // 管理员
  TECH_SUP: 3,    // 技术支持
  GOV: 11,        // 行政
  UNIT: 12,       // 单位
  DEPT: 13,       // 科室
  INDIVIDUAL: 14, // 个人
  EXPERT: 15,     // 专家
  '11': '行政',
  '12': '单位',
  '13': '科室',
  '14': '个人',
  '15': '专家'
};

// ============================================================
// 审核层级
// ============================================================
var AUDIT_LEVEL = {
  '2': '单位',
  '3': '区县',
  '4': '地市',
  '5': '省厅',
  UNIT: 2,
  COUNTY: 3,
  CITY: 4,
  PROVINCE: 5
};

// ============================================================
// 活动类型
// ============================================================
var ACTIVITY_TYPE = {
  '4': '继续教育项目',
  '2': '院内活动',
  '1': '个人活动',
  undefined: ''
};

// ============================================================
// 审核状态
// ============================================================
var AUDIT_STATUS = {
  NOT: 0,        // 未审核
  REVISION: 1,   // 审核退回
  REJECT: 2,     // 审核不通过
  APPROVE: 3,    // 审核通过
  CHECKING: 4,   // 待审核
  '0': '未审核',
  '1': '审核退回',
  '2': '审核不通过',
  '3': '审核通过',
  '4': '待审核',
  '5': '5',
  '52': '52',
  '99': '99'
};

// ============================================================
// 有效性状态
// ============================================================
var VALIDITY_STATUS = {
  '1': '有效',
  '4': '无效'
};

// ============================================================
// 学分录入方式
// ============================================================
var SCORE_ENTRY_METHOD = {
  '1': '手工录入',
  '2': '手工录入',
  '3': '网络授分',
  '4': '考勤得分',
  '5': '手工录入',
  '6': '考勤得分',
  '7': '手工录入',
  '8': '手工录入',
  '9': '考勤得分',
  '10': '手工录入',
  '11': '考勤得分'
};

// ============================================================
// 达标状态
// ============================================================
var STANDARD_STATUS = {
  '0': '不达标',
  '1': '达标',
  '2': '不计达标'
};

// ============================================================
// 日期格式常量
// ============================================================
var DATE_FORMAT = {
  DAY: "YYYY-MM-DD",
  MINUTE: "YYYY-MM-DD HH:mm",
  SECOND: "YYYY-MM-DD HH:mm:ss"
};

// ============================================================
// 教学形式（用于学分类型筛选）
// ============================================================
var TEACHING_TYPE = {
  theory: '面授,理论',
  experiment: '实验技术,实验（技术示范）'
};

// ============================================================
// 示例图片数据（学分证明照片）
// ============================================================
var samplePhoto1 = {
  alt: '学分证明照片',
  pid: 109,
  src: "https://kjpt.wsglw.net/img/img_404.png",
  thumb: ''
};

var samplePhoto2 = {
  alt: '学分证明照片',
  pid: 109,
  src: "https://uploads.cdn.11dz.cn/wallpaper/paper/b733fad4-af94-4f70-91aa-54cd6442e2c6_50.jpg",
  thumb: ''
};

var samplePhoto3 = {
  alt: '学分证明照片',
  pid: 110,
  src: "https://uploads.cdn.11dz.cn/wallpaper/paper/fb082074-4bc1-4122-a01e-9e2eaa138029_50.jpg",
  thumb: ''
};

var samplePhotoPdf = {
  alt: '学分证明照片',
  pid: 113,
  src: "https://kjptapi.wsglw.net/file/individualScoreManage/db0d980b-03d4-4c9c-b2d4-9f890109ed47/050005/2022/1657604465778-c0906b24-4316-4016-92a5-11931b4d87bf.pdf",
  thumb: ''
};

// ============================================================
// 相册配置（JSON 请求的相册）
// ============================================================
var PHOTO_ALBUM_CONFIG = {
  status: 1,
  msg: '',
  title: "JSON请求的相册",
  id: 8,
  start: 0,
  data: [samplePhoto1, samplePhoto2, samplePhoto3, samplePhotoPdf]
};

// ============================================================
// 职称系列 - 西医类（flag: 1）
// ============================================================
var TITLE_DOCTOR = {
  titleId: "12b7281b-5a37-43f9-990a-9b2f0124b22e",
  titleName: "医师系列",
  flag: 1
};

var TITLE_NURSE = {
  titleId: "e46a0ff0-86de-47a8-bd7b-9b2f0124b22e",
  titleName: "护理系列",
  flag: 1
};

var TITLE_PHARMACIST = {
  titleId: "829a7a8f-ac8a-454b-87aa-9b2f0124b22e",
  titleName: "药师系列",
  flag: 1
};

var TITLE_TECHNICIAN = {
  titleId: "e5f5461d-45a6-4e22-a5c0-9b2f0124b22e",
  titleName: '技师系列',
  flag: 1
};

var TITLE_INTERN = {
  titleId: "6eb60a6f-23fa-4f68-8deb-9cfe00d791e9",
  titleName: "见习系列",
  flag: 1
};

var TITLE_ENGINEER = {
  titleId: "53f3f944-2189-4870-8387-9b2f0124b22e",
  titleName: "工程系列",
  flag: 1
};

var TITLE_RESEARCH = {
  titleId: "50e39073-ca00-4e89-9e75-9b2f0124b22e",
  titleName: "研究系列",
  flag: 1
};

var TITLE_ACCOUNTANT = {
  titleId: "ab1f839e-2986-40c4-80bf-9b2f0124b233",
  titleName: "会计系列",
  flag: 1
};

var TITLE_TEACHING = {
  titleId: "87babb13-63c2-480f-85ab-9b2f0124b233",
  titleName: "教学系列",
  flag: 1
};

var TITLE_PUBLISHING = {
  titleId: "237e5b91-ea10-44f6-947b-9b2f0124b233",
  titleName: "出版系列",
  flag: 1
};

var TITLE_INSPECTOR = {
  titleId: "64579360-496a-407b-9e6e-9b2f0124b233",
  titleName: '检验师系列',
  flag: 1
};

var TITLE_STATISTICS = {
  titleId: "cb2d002c-45e0-4d09-9fa1-9b2f0124b233",
  titleName: '统计系列',
  flag: 1
};

var TITLE_ECONOMICS = {
  titleId: "4a13c961-6c3d-4f11-a46a-9b2f0124b233",
  titleName: "经济系列",
  flag: 1
};

var TITLE_LIBRARY = {
  titleId: "1561760d-cd05-45b4-a827-9b2f0124b233",
  titleName: "图书资料系列",
  flag: 1
};

var TITLE_MIDDLE_SCHOOL = {
  titleId: "54f68ef0-60c7-4689-988e-9c0c00b6dcf6",
  titleName: "中学教师系列",
  flag: 1
};

var TITLE_PRIMARY_SCHOOL = {
  titleId: "3ee9d699-4121-4b81-b085-9c0c00b98579",
  titleName: "小学教师系列",
  flag: 1
};

var TITLE_FAMILY_PLANNING = {
  titleId: "bbd1cffc-c226-461c-b1ca-c8cb9b5d37b2",
  titleName: '计生系列',
  flag: 1
};

var TITLE_PUBLIC_HEALTH = {
  titleId: "94741192-52be-47b6-ae75-4bf7dff34e4e",
  titleName: "公共卫生管理系列",
  flag: 1
};

var TITLE_OTHER = {
  titleId: "902d06ea-52f6-45a3-8b0e-9b2f0124b233",
  titleName: '其他系列',
  flag: 1
};

// ============================================================
// 职称系列 - 中医类（flag: 2）
// ============================================================
var TITLE_TCM_DOCTOR = {
  titleId: "7d25ad8e-043a-4921-9d80-9cfe00d791e9",
  titleName: "中医医师系列",
  flag: 2
};

var TITLE_TCM_NURSE = {
  titleId: "1f2db05a-f8ee-4311-a304-6b496748498d",
  titleName: '中医护理系列',
  flag: 2
};

var TITLE_TCM_PHARMACIST = {
  titleId: "b354e1ae-ab73-4b6c-b0e2-9cfe00d791e9",
  titleName: "中医药师系列",
  flag: 2
};

var TITLE_TCM_TECHNICIAN = {
  titleId: "21291252-9e79-418f-ba6d-9d6100ec5da1",
  titleName: '中医技师系列',
  flag: 2
};

var TITLE_INTEGRATED_MEDICINE = {
  titleId: "ea42541c-c77f-46e0-9eb1-9cfe00d791e9",
  titleName: "中西医结合医师系列",
  flag: 2
};

// ============================================================
// 当前用户信息（从 localStorage 读取）
// ============================================================
const _standardKindId = localStorage.getItem("standardkind-id") || "b7864061-7bd4-4ee7-a868-9b24009e92df";
const _userType = Number(localStorage.getItem("user-type"));
const _uut = Number(localStorage.getItem("unit-user-type"));
const _isGov = 11 === _userType;
const _isGovProvince = 5 === _uut;

// 从 unit-user-type 提取流程层级（取十位数）
const flowUut = (val) => val ? ~~(val / 10) : 0;