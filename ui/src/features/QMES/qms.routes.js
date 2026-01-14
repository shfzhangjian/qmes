import React from 'react';
const load = (loader) => React.lazy(loader);

export default {
    // 异常事件处置单列表 (这是主入口)
    '/qms/abnormal': load(() => import('./AbnormalEventList.jsx')),

    // 异常事件详情页 (新增)
    '/qms/abnormal/detail/:id': load(() => import('./AbnormalEventDetail.jsx')),

    // 如果你有不合格品处置单
    '/qms/ncr/list': load(() => import('./NonConformingList.jsx')),

};