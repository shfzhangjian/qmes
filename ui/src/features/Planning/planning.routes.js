import React from 'react';
const load = (loader) => React.lazy(loader);

export default {
    '/planning/center': load(() => import('./PlanningCenter.jsx'))
};