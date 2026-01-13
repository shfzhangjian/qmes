/**
 * @file: src/services/api.js
 * @version: v2.0.0 (Full Mock Users)
 * @description: 补全所有模拟用户数据，确保 Login 页面列出的所有账号都能登录成功
 * @createDate: 2026-01-13
 * @lastModified: 2026-01-13
 */

import menuDataRaw from '../data/menu.json';

// --- 1. 模拟用户数据库 (与菜单权限 menu.json 中的 roles 严格对应) ---
const MOCK_USERS = {
  // 系统管理员
  'admin': { name: '系统管理员', role: 'ADM', roleName: '系统管理员', avatar: 'A' },

  // 生产经理 (权限较高)
  'mgr':   { name: '王经理',    role: 'MGR', roleName: '生产经理',   avatar: 'M' },

  // 一线操作工
  'op':    { name: '张操作',    role: 'OP',  roleName: '一线操作工', avatar: 'O' },

  // 质量管理
  'qc':    { name: '李质检',    role: 'QC',  roleName: '质量质检员', avatar: 'Q' },

  // 工艺工程
  'pe':    { name: '赵工艺',    role: 'PE',  roleName: '工艺工程师', avatar: 'P' },

  // 设备工程
  'eq':    { name: '孙设备',    role: 'EQ',  roleName: '设备工程师', avatar: 'E' },

  // 仓储物流
  'wh':    { name: '周仓储',    role: 'WH',  roleName: '仓储管理员', avatar: 'W' },

  // 客服计划
  'cs':    { name: '吴客服',    role: 'CS',  roleName: '客服专员',   avatar: 'C' },

  // 供应商质量
  'sqe':   { name: '郑SQE',     role: 'SQE', roleName: '供应商质量', avatar: 'S' },

  // 普通访客
  'guest': { name: '访客',      role: 'ALL', roleName: '普通用户',   avatar: 'G' }
};

// --- 2. 模拟登录接口 ---
export const loginAPI = (username, password) => {
  console.log('[Mock API] 正在尝试登录:', username);

  return new Promise((resolve, reject) => {
    // 模拟 500ms 网络延迟 (稍微快一点)
    setTimeout(() => {
      const lowerName = username ? username.toLowerCase().trim() : '';

      // 1. 检查用户是否存在
      const user = MOCK_USERS[lowerName];

      if (user && password === '123456') {
        const token = `mock-token-${lowerName}-${Date.now()}`;

        // 存储到本地
        localStorage.setItem('tspm_token', token);
        localStorage.setItem('tspm_user', JSON.stringify(user));

        console.log("[Mock API] 登录成功", user);
        resolve({ user, token });
      } else {
        console.warn("[Mock API] 登录失败: 账号或密码错误");
        reject(new Error('用户名或密码错误 (默认密码: 123456)'));
      }
    }, 500);
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
    }, 300);
  });
};