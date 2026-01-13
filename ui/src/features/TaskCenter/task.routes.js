import React from 'react';
const load = (loader) => React.lazy(loader);

export default {
    // 待办与已办复用同一个组件
    '/flow/todo': load(() => import('./TaskCenter.jsx')),
    '/flow/done': load(() => import('./TaskCenter.jsx'))
};