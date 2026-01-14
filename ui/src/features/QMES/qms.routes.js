import React from 'react';
const load = (loader) => React.lazy(loader);

export default {
    // 异常事件处置单列表 (这是主入口)
    '/qms/abnormal': load(() => import('./AbnormalEventList.jsx')),

    // 异常事件详情页 (新增)
    '/qms/abnormal/detail/:id': load(() => import('./AbnormalEventDetail.jsx')),

    // 如果你有不合格品处置单
    '/qms/ncr/list': load(() => import('./NonConformingList.jsx')),

    '/qms/ncr/detail/:id': load(() => import('./NonConformingDetail.jsx')),


    // [新增] 进料标准
    '/qms/iqc/standard': load(() => import('./IqcStandardList.jsx')),

    '/qms/iqc/standard/detail/:id': load(() => import('./IqcStandardDetail.jsx')),

    // [新增] 进料检验记录
    '/qms/iqc/record': load(() => import('./IqcRecordList.jsx')),

    '/qms/iqc/record/detail/:id': load(() => import('./IqcRecordDetail.jsx')),
};