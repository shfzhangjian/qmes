import React from 'react';

const load = (loader) => React.lazy(loader);

export default {
    // 1. 产品品牌管理
    '/business/brand': load(() => import('./BrandList.jsx')),

    // 2. 客商信息档案 (客户/供应商)
    '/business/partner': load(() => import('./PartnerList.jsx')),

    // 3. 计量单位配置 (暂指向建设中)
    '/business/unit': load(() => import('../System/Construction.jsx')),

    // 4. 数据字典配置
    '/business/dict': load(() => import('../System/Construction.jsx')),

    // 5. 编码生成规则
    '/business/code': load(() => import('../System/Construction.jsx')),

    // 6. 提醒规则配置
    '/business/alert': load(() => import('../System/Construction.jsx')),
};