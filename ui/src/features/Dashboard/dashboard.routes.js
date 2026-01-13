import React from 'react';

// 懒加载辅助函数
const load = (loader) => React.lazy(loader);

// 导出该模块的路由映射
export default {
    '/dashboard': load(() => import('./Dashboard.jsx'))
};