/**
 * @file: src/features/Dashboard/Dashboard.jsx
 * @version: v1.0.0
 * @description: 个性化工作台组件，根据用户角色（操作工/维修工/管理层）动态渲染KPI看板、待办事项和快捷入口
 * @createDate: 2026-01-12
 * @lastModified: 2026-01-12
 */

import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const Dashboard = () => {
  const { currentUser } = useContext(AppContext);
  
  const getRoleConfig = (role) => {
     const configs = {
        'super_admin': { title: '系统全景概览', stats: [['在线用户','128'], ['异常日志','0'], ['接口QPS','450']], shortcuts: ['系统配置','权限管理','日志审计','数据字典'] },
        'operator': { title: '操作工工作台', stats: [['当班产量','45箱'], ['设备OEE','91%'], ['待填记录','3']], shortcuts: ['生产上报','自检台账','故障报修','交接班'] },
        'maintenance': { title: '维修接单中心', stats: [['待响应','2'], ['处理中','1'], ['本周工时','32h']], shortcuts: ['维修工单','备件领用','设备健康','润滑记录'] },
        'manager': { title: '车间驾驶舱', stats: [['车间OEE','88%'], ['本月成本','120w'], ['待审批','5']], shortcuts: ['生产报表','成本分析','绩效考核','安全检查'] }
     };
     return configs[role] || configs['super_admin'];
  };

  const conf = getRoleConfig(currentUser?.role || 'super_admin');

  return (
    <div className="dashboard-container">
       {/* AI 晨报卡片 */}
       <div className="aip-summary-card">
          <div style={{ flex: 1 }}>
             <h2 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>早安，{currentUser?.name}</h2>
             <p style={{ color: '#666', fontSize: '14px' }}>系统运行平稳。AI 建议您关注今日 2 号线 <strong>OEE 波动</strong> 情况。</p>
             <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                {conf.shortcuts.map(s => <button key={s} className="small-btn outline">{s}</button>)}
             </div>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
             {conf.stats.map(([l, v]) => (
                <div key={l} className="stat-box">
                   <div style={{ fontSize: '12px', color: '#999' }}>{l}</div>
                   <div className="value">{v}</div>
                </div>
             ))}
          </div>
       </div>

       {/* 网格布局 */}
       <div className="dashboard-grid">
          <div className="dashboard-card">
             <div className="card-header-sm">
                <span><i className="ri-list-check"></i> 待办事项</span>
                <span style={{ fontSize: '12px', color: '#1890FF' }}>更多</span>
             </div>
             <div style={{ padding: '0 10px' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #f9f9f9', display: 'flex', justifyContent: 'space-between' }}>
                     <div>
                        <span className="tag" style={{ background: '#e6f7ff', color: '#1890FF', marginRight: '8px' }}>任务</span>
                        <span style={{ fontSize: '13px' }}>执行 WO-20251219-{i} 生产工单</span>
                     </div>
                     <span style={{ fontSize: '12px', color: '#999' }}>10:00</span>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="dashboard-card">
             <div className="card-header-sm"><span><i className="ri-bar-chart-fill"></i> 效率趋势</span></div>
             <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '20px 10px 10px 10px' }}>
                {[60, 80, 45, 90, 75].map((h, i) => (
                   <div key={i} style={{ width: '30px', background: '#1890FF', height: `${h}%`, borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

export default Dashboard;