/**
 * @file: src/services/api.js
 * @version: v3.0.0 (Org Structure Upgrade)
 * @description: 升级用户数据模型，支持复杂的部门/岗位结构及跨部门工作组(委员会)
 * @createDate: 2026-01-13
 * @lastModified: 2026-01-13
 */

import menuDataRaw from '../data/menu.json';

// --- 组织架构常量定义 ---
const DEPARTMENTS = {
  GM_OFFICE: '总经理办公室',
  FINANCE: '财务部',
  QUALITY: '品质部',
  WAREHOUSE: '仓管部',
  PURCHASE: '采购部',
  MARKET: '市场部',
  PROD: '生产部',
  PROCESS: '工艺部',
  RD: '研发部',
  EQUIP: '设备部',
  IT: '信息化部'
};

const COMMITTEES = {
  PCRB: 'PCRB 变更评审委员会', // Process Change Review Board
  MRB: 'MRB 材料审查委员会'    // Material Review Board
};

const GROUP_ROLES = {
  HEAD: '负责人',
  EXPERT: '专家',
  MEMBER: '会员'
};

// --- 1. 模拟用户数据库 ---
// 结构: Key -> 用户对象
// 包含: 行政归属(dept, job), 职能归属(groups), IT权限(role)
const MOCK_USERS = {
  // --- 信息化部 ---
  'admin': {
    name: '系统管理员',
    dept: DEPARTMENTS.IT,
    job: 'IT主管',
    groups: [], // 管理员通常不参与业务委员会
    role: 'ADM', // IT角色: 系统管理员
    roleName: '系统管理员',
    avatar: 'A'
  },

  // --- 生产部 ---
  'mgr': {
    name: '王经理',
    dept: DEPARTMENTS.PROD,
    job: '生产经理',
    groups: [
      { name: COMMITTEES.MRB, role: GROUP_ROLES.MEMBER } // 参与材料评审
    ],
    role: 'MGR',
    roleName: '生产经理',
    avatar: 'M'
  },
  'op': {
    name: '张操作',
    dept: DEPARTMENTS.PROD,
    job: '一线操作工',
    groups: [],
    role: 'OP',
    roleName: '一线操作工',
    avatar: 'O'
  },

  // --- 品质部 ---
  'qc': {
    name: '李质检',
    dept: DEPARTMENTS.QUALITY,
    job: 'QA工程师',
    groups: [
      { name: COMMITTEES.MRB, role: GROUP_ROLES.EXPERT }, // MRB 核心专家
      { name: COMMITTEES.PCRB, role: GROUP_ROLES.MEMBER }
    ],
    role: 'QC',
    roleName: '质量质检员',
    avatar: 'Q'
  },

  // --- 工艺部 ---
  'pe': {
    name: '赵工艺',
    dept: DEPARTMENTS.PROCESS,
    job: '高级工艺工程师',
    groups: [
      { name: COMMITTEES.PCRB, role: GROUP_ROLES.HEAD }, // PCRB 负责人
      { name: COMMITTEES.MRB, role: GROUP_ROLES.EXPERT }
    ],
    role: 'PE',
    roleName: '工艺工程师',
    avatar: 'P'
  },

  // --- 设备部 ---
  'eq': {
    name: '孙设备',
    dept: DEPARTMENTS.EQUIP,
    job: '设备主管',
    groups: [],
    role: 'EQ',
    roleName: '设备工程师',
    avatar: 'E'
  },

  // --- 仓管部 ---
  'wh': {
    name: '周仓储',
    dept: DEPARTMENTS.WAREHOUSE,
    job: '仓库管理员',
    groups: [],
    role: 'WH',
    roleName: '仓储管理员',
    avatar: 'W'
  },

  // --- 采购部 (新增) ---
  'pur': {
    name: '钱采购',
    dept: DEPARTMENTS.PURCHASE,
    job: '采购专员',
    groups: [
      { name: COMMITTEES.MRB, role: GROUP_ROLES.MEMBER } // 参与材料评审
    ],
    role: 'SQE', // 复用 SQE 权限，或未来新增 PUR 角色
    roleName: '供应商质量', // 暂时复用
    avatar: 'P'
  },

  // --- 市场部 (新增) ---
  'mkt': {
    name: '吴市场',
    dept: DEPARTMENTS.MARKET,
    job: '客户经理',
    groups: [],
    role: 'CS',
    roleName: '客服专员',
    avatar: 'M'
  },

  // --- 供应商质量 (属于品质部或独立供应链部门，这里归入品质部演示) ---
  'sqe': {
    name: '郑SQE',
    dept: DEPARTMENTS.QUALITY,
    job: 'SQE工程师',
    groups: [
      { name: COMMITTEES.MRB, role: GROUP_ROLES.MEMBER }
    ],
    role: 'SQE',
    roleName: '供应商质量',
    avatar: 'S'
  },

  // --- 访客 ---
  'guest': {
    name: '访客',
    dept: '外部访客',
    job: '无',
    groups: [],
    role: 'ALL',
    roleName: '普通用户',
    avatar: 'G'
  }
};

// --- 2. 模拟登录接口 ---
export const loginAPI = (username, password) => {
  console.log('[Mock API] 正在尝试登录:', username);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const lowerName = username ? username.toLowerCase().trim() : '';
      const user = MOCK_USERS[lowerName];

      if (user && password === '123456') {
        const token = `mock-token-${lowerName}-${Date.now()}`;
        // 存储完整用户信息
        localStorage.setItem('tspm_token', token);
        localStorage.setItem('tspm_user', JSON.stringify(user));
        console.log("[Mock API] 登录成功", user);
        resolve({ user, token });
      } else {
        reject(new Error('用户名或密码错误 (默认密码: 123456)'));
      }
    }, 400);
  });
};

// --- 3. 模拟获取用户信息 ---
export const fetchUserInfo = () => {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem('tspm_token');
    const userStr = localStorage.getItem('tspm_user');
    if (token && userStr) {
      resolve(JSON.parse(userStr));
    } else {
      reject(new Error('未登录或会话已过期'));
    }
  });
};

// --- 4. 模拟加载菜单 ---
export const fetchMenuData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (menuDataRaw && menuDataRaw.menu && Array.isArray(menuDataRaw.menu)) {
        resolve(menuDataRaw.menu);
      } else if (Array.isArray(menuDataRaw)) {
        resolve(menuDataRaw);
      } else {
        resolve([]);
      }
    }, 200);
  });
};