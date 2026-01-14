import React from 'react';
const load = (loader) => React.lazy(loader);

export default {
    // 注册演示路由
    '/demo/components': load(() => import('./ComponentDemo.jsx'))
};