import React from 'react';
const load = (loader) => React.lazy(loader);

export default {
    // 1. 工厂建模 (组织/车间/产线/工位)
    '/production/base/factory': load(() => import('./FactoryModelList.jsx')),

    // 2. 物料/产品定义 (区分原材料、半成品、成品)
    '/production/base/material': load(() => import('./MaterialList.jsx')),

    // 3. 制造BOM (配方与结构)
    '/production/base/bom': load(() => import('./BOMList.jsx')),

    // 4. 工艺路线 (Routing)
    '/production/base/process-route': load(() => import('./ProcessRouteList.jsx')),

    // 5. 生产日历与班次
    '/production/base/calendar': load(() => import('./WorkCalendar.jsx')),
};