/**
 * @file: src/features/System/system.routes.js
 * @description: 系统模块路由配置 - 注册全域搜索和消息中心
 */
import React from 'react';

// 懒加载辅助函数
const load = (loader) => React.lazy(loader);

export default {
    // 1. 全域搜索 (独立页面模式)
    '/system/search': load(() => import('./GlobalSearch.jsx')),

    // 2. 消息通知中心 (独立页面模式)
    '/msg/list': load(() => import('./NotificationCenter.jsx')),

    // 3. 原有的系统信息列表 (如果有的话)
    '/system/info': load(() => import('./InfoSystemList.jsx')),
};