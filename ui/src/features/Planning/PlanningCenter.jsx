/**
 * @file: src/features/Planning/PlanningCenter.jsx
 * @version: v1.0.0
 * @description: 计划排程中心组件，可视化展示设备资源甘特图，支持任务块展示及冲突高亮
 * @createDate: 2026-01-12
 * @lastModified: 2026-01-12
 */

import React from 'react';

const PlanningCenter = () => {
   const days = Array.from({ length: 15 }, (_, i) => i + 1);
   const resources = ['ZJ17 #1', 'ZJ17 #2', 'PROTOS #1', 'PROTOS #2', '包装机 #1'];
   
   return (
     <div className="gantt-container">
        <div className="gantt-sidebar">
           <div className="gantt-header-row" style={{ paddingLeft: '15px', fontWeight: 'bold' }}>设备资源</div>
           {resources.map(r => (
              <div key={r} className="gantt-row" style={{ alignItems: 'center', paddingLeft: '15px', fontSize: '13px', fontWeight: '500' }}>{r}</div>
           ))}
        </div>
        <div className="gantt-main">
           <div className="gantt-header-row">
              {days.map(d => <div key={d} className="gantt-cell-head">{d}日</div>)}
           </div>
           {resources.map((r, ri) => (
              <div key={r} className="gantt-row">
                 {days.map((d) => (
                    <div key={d} className="gantt-cell"></div>
                 ))}
                 {/* 模拟任务块 */}
                 {ri === 0 && <div className="task-block" style={{ left: '40px', width: '80px', background: '#1890FF' }}>月度保养</div>}
                 {ri === 2 && <div className="task-block conflict" style={{ left: '160px', width: '40px' }}>冲突</div>}
                 {ri === 3 && <div className="task-block" style={{ left: '240px', width: '120px', background: '#52C41A' }}>技改项目</div>}
              </div>
           ))}
        </div>
     </div>
   );
};

export default PlanningCenter;