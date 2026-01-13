import React from 'react';
const load = (loader) => React.lazy(loader);

export default {
    // 系统信息注册表 (通用列表组件)
    '/system/info': load(() => import('./InfoSystemList.jsx')),

    // 你可以在这里继续添加系统模块的其他页面
    // '/system/user': load(() => import('./UserList.jsx')),
};