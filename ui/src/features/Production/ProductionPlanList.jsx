/**
 * @file: src/features/Production/ProductionPlanList.jsx
 * @description: 生产计划排程管理 (针对订单的排产工作台)
 * - [Style] 采用规则编辑器风格，结构化展示订单 -> 计划
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import './ProductionOrder.css';

const ProductionPlanList = () => {
    // --- 模拟待排产订单 ---
    const [pendingOrders] = useState([
        { id: 'MO-20260116-001', product: '12寸CMP抛光垫', qty: 500, deadline: '2026-01-25', planned: 0 },
        { id: 'MO-20260116-002', product: '石英掩膜版', qty: 100, deadline: '2026-01-22', planned: 40 }
    ]);

    // --- 模拟排产计划编辑器数据 ---
    const [planLines, setPlanLines] = useState([
        { id: 1, moId: 'MO-20260116-002', date: '2026-01-17', line: '掩膜版A线', shift: '白班', targetQty: 20, manager: '张三' },
        { id: 2, moId: 'MO-20260116-002', date: '2026-01-17', line: '掩膜版A线', shift: '夜班', targetQty: 20, manager: '李四' },
        { id: 3, moId: 'MO-20260116-001', date: '2026-01-18', line: '抛光垫浇注1线', shift: '白班', targetQty: 100, manager: '王五' },
    ]);

    const handleAddLine = () => {
        setPlanLines([...planLines, { id: Date.now(), moId: '', date: '', line: '', shift: '白班', targetQty: 0, manager: '' }]);
    };

    return (
        <PageLayout
            toolbar={
                <>
                    <div style={{fontWeight:'bold'}}>生产管理 &gt; 生产计划排程</div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button className="btn outline"><i className="ri-calendar-event-line"></i> 甘特图视图</button>
                        <button className="btn btn-primary"><i className="ri-save-line"></i> 保存并下达排产</button>
                    </div>
                </>
            }
        >
            <div className="plan-editor-container">
                {/* 左侧：待排产需求池 */}
                <div className="plan-demand-pool">
                    <div className="pool-header"><i className="ri-inbox-archive-line"></i> 待排产需求池</div>
                    <div className="pool-list">
                        {pendingOrders.map(order => (
                            <div key={order.id} className="demand-card">
                                <div className="dc-header">
                                    <span className="mo-tag">MO</span>
                                    <b>{order.id}</b>
                                </div>
                                <div className="dc-body">
                                    <div className="dc-prod">{order.product}</div>
                                    <div className="dc-meta">
                                        <span>需: <b>{order.qty}</b></span>
                                        <span>已排: <b style={{color:'#1890ff'}}>{order.planned}</b></span>
                                    </div>
                                    <div className="dc-progress">
                                        <div className="progress-inner" style={{width: `${(order.planned/order.qty)*100}%`}}></div>
                                    </div>
                                </div>
                                <div className="dc-footer">交付日期: {order.deadline}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 右侧：排产规则编辑器 */}
                <div className="plan-main-editor">
                    <div className="editor-header">
                        <span><i className="ri-grid-fill"></i> 计划排程编辑器 (按班次拆解)</span>
                        <button className="mini-btn primary" onClick={handleAddLine}>+ 新增排产行</button>
                    </div>

                    <div className="editor-grid-wrapper">
                        <table className="sub-table compact-editor">
                            <thead>
                            <tr>
                                <th width="160">生产订单 (MO)</th>
                                <th width="140">计划日期</th>
                                <th width="150">作业单元 (产线/机台)</th>
                                <th width="100">生产班次</th>
                                <th width="100">目标产量</th>
                                <th width="100">负责人</th>
                                <th width="60" className="center">操作</th>
                            </tr>
                            </thead>
                            <tbody>
                            {planLines.map(line => (
                                <tr key={line.id}>
                                    <td>
                                        <select className="cell-input" value={line.moId} onChange={e=>setPlanLines(planLines.map(l=>l.id===line.id?{...l, moId:e.target.value}:l))}>
                                            <option value="">请选择订单</option>
                                            {pendingOrders.map(o => <option key={o.id} value={o.id}>{o.id}</option>)}
                                        </select>
                                    </td>
                                    <td><input type="date" className="cell-input" value={line.date} onChange={e=>setPlanLines(planLines.map(l=>l.id===line.id?{...l, date:e.target.value}:l))} /></td>
                                    <td>
                                        <select className="cell-input" value={line.line} onChange={e=>setPlanLines(planLines.map(l=>l.id===line.id?{...l, line:e.target.value}:l))}>
                                            <option value="">请选择产线</option>
                                            <option>抛光垫浇注1线</option><option>掩膜版A线</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select className="cell-input" value={line.shift} onChange={e=>setPlanLines(planLines.map(l=>l.id===line.id?{...l, shift:e.target.value}:l))}>
                                            <option>白班</option><option>夜班</option>
                                        </select>
                                    </td>
                                    <td><input type="number" className="cell-input center" value={line.targetQty} onChange={e=>setPlanLines(planLines.map(l=>l.id===line.id?{...l, targetQty:e.target.value}:l))} /></td>
                                    <td><input className="cell-input" value={line.manager} onChange={e=>setPlanLines(planLines.map(l=>l.id===line.id?{...l, manager:e.target.value}:l))} placeholder="输入负责人" /></td>
                                    <td className="center"><i className="ri-delete-bin-line danger-icon" onClick={()=>setPlanLines(planLines.filter(l=>l.id!==line.id))}></i></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 产能负载预警 (模拟) */}
                    <div className="capacity-warning-bar">
                        <i className="ri-error-warning-line"></i>
                        <span>[产能提醒] 2026-01-18 掩膜版A线 负载已达 95%，建议调整计划或开启加班。</span>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ProductionPlanList;