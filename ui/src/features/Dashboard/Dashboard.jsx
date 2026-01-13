/**
 * @file: src/features/Dashboard/Dashboard.jsx
 * @version: v2.5.0 (Layout Optimized)
 * @description:
 * 1. 优化布局：去除整体滚动条，改为卡片内滚动。
 * 2. Banner 重构：更紧凑，合理利用空间展示快捷操作。
 * 3. 按钮与跳转：优化“更多”按钮样式和点击区域。
 * @lastModified: 2026-01-13 17:15:00
 */

import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import './dashboard.css';

// --- 简版模拟数据 ---
const getDashboardTodos = () => {
    return [
        { tag: '审批', type: 'blue', text: 'HC-Film-T92 新产品试产方案审批', time: '09:00' },
        { tag: '点检', type: 'orange', text: '涂布头精密清洗与点检 (每班)', time: '10:30' },
        { tag: '异常', type: 'red', text: '分切机 #2 张力波动报警处理', time: '11:15' },
        { tag: '保养', type: 'blue', text: 'RTO 蓄热体定期清理保养计划', time: '13:00' },
        { tag: '会议', type: 'blue', text: 'MRB 委员会材料评审会议 (会议室3)', time: '14:30' },
        { tag: '培训', type: 'orange', text: '新入职操作工安全规范培训', time: '15:00' },
        { tag: '审核', type: 'blue', text: 'Q4 季度供应商绩效考核表审核', time: '16:00' },
        { tag: '异常', type: 'red', text: '纯水系统电导率异常告警', time: '16:20' },
        { tag: '审批', type: 'blue', text: '年度设备采购预算预审', time: '17:00' }
    ];
};

const Dashboard = () => {
    const { currentUser, navigate } = useContext(AppContext);

    // 获取简版待办数据
    const simpleTodoList = getDashboardTodos();

    // 角色配置
    const getRoleConfig = (role) => {
        const configs = {
            'ADM': {
                stats: [
                    { label: '在线终端', value: '128', unit: '台' },
                    { label: '接口 QPS', value: '450', unit: '' },
                    { label: '存储占用', value: '82', unit: '%' }
                ],
                shortcuts: [
                    { label: '系统配置', icon: 'ri-settings-3-line', color: '#1890ff' },
                    { label: '权限管理', icon: 'ri-shield-user-line', color: '#52c41a' },
                    { label: '审计日志', icon: 'ri-file-list-3-line', color: '#faad14' },
                    { label: '数据字典', icon: 'ri-book-2-line', color: '#722ed1' }
                ]
            },
            'OP': {
                stats: [
                    { label: '涂布速度', value: '45.2', unit: 'm/m', status: 'normal' },
                    { label: '烘箱温度', value: '120', unit: '°C', status: 'normal' },
                    { label: '膜厚检测', value: '25.0', unit: 'µm', status: 'success' }
                ],
                shortcuts: [
                    { label: '投料扫描', icon: 'ri-barcode-box-line', color: '#1890ff' },
                    { label: '换卷记录', icon: 'ri-refresh-line', color: '#52c41a' },
                    { label: '异常报修', icon: 'ri-hammer-line', color: '#ff4d4f' },
                    { label: '交接班', icon: 'ri-user-shared-line', color: '#722ed1' }
                ]
            },
            // ... 其他角色配置可按需扩展，默认使用 ADM 结构
        };
        return configs[role] || configs['ADM'];
    };

    const conf = getRoleConfig(currentUser?.role || 'ADM');

    const getStatusColor = (status) => {
        if (status === 'success') return '#52c41a';
        if (status === 'warning') return '#faad14';
        if (status === 'error') return '#ff4d4f';
        return '#1890FF'; // default
    };

    return (
        <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* --- 1. 紧凑型 Banner (Fixed Height) --- */}
            <div className="aip-summary-card" style={{
                flexShrink: 0,
                padding: '16px 24px',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fff',
                borderRadius: '8px',
                border: '1px solid #e8e8e8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
                {/* 左侧：问候与 AI 摘要 */}
                <div style={{ flex: 1, paddingRight: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <h2 style={{ margin: 0, fontSize: '18px', color: '#333' }}>
                            早安，{currentUser?.name}
                        </h2>
                        <span className="tag" style={{ background: '#e6f7ff', color: '#1890ff', border: '1px solid #91caff' }}>
                            {currentUser?.role === 'OP' ? '早班中' : '在线'}
                        </span>
                    </div>
                    <div style={{ color: '#666', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <i className="ri-sparkling-fill" style={{ color: '#faad14', marginTop: '2px' }}></i>
                        <span style={{ lineHeight: '1.5' }}>
                            {currentUser?.role === 'OP' ?
                                '系统检测到 HC-OCA-2026 批次即将生产，建议提前检查微凹辊清洁度。' :
                                '昨日 CMP 车间产出创新高；今日 RTO 系统压差略有波动，请关注设备看板。'
                            }
                        </span>
                    </div>
                </div>

                {/* 右侧：数据指标 (Stats) & 快捷入口 (Shortcuts) */}
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    {/* 快捷按钮组 */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {conf.shortcuts.map((s, i) => (
                            <div key={i} className="shortcut-item" style={{ textAlign: 'center', cursor: 'pointer', transition: '0.2s' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '8px',
                                    background: `${s.color}15`, color: s.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                                    marginBottom: '4px', margin: '0 auto'
                                }}>
                                    <i className={s.icon}></i>
                                </div>
                                <div style={{ fontSize: '11px', color: '#666' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ width: '1px', height: '40px', background: '#eee' }}></div>

                    {/* 核心指标 */}
                    <div style={{ display: 'flex', gap: '20px' }}>
                        {conf.stats.map((stat, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>{stat.label}</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: getStatusColor(stat.status), fontFamily: 'active-digit' }}>
                                    {stat.value} <span style={{ fontSize: '11px', color: '#999', fontWeight: 'normal' }}>{stat.unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- 2. 主工作区 Grid (Flex 1, No Scroll) --- */}
            <div className="dashboard-grid" style={{
                flex: 1,
                minHeight: 0, // 关键：允许 flex 子项小于内容高度，从而触发内部滚动
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '15px',
                overflow: 'hidden' // 防止 Grid 本身溢出
            }}>

                {/* A. 待办事项卡片 */}
                <div className="dashboard-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #e8e8e8', borderRadius: '8px', background: '#fff' }}>
                    <div className="card-header-sm" style={{
                        padding: '12px 16px', borderBottom: '1px solid #f0f0f0',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: '#fafafa', flexShrink: 0
                    }}>
                        <span style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
                            <i className="ri-list-check" style={{ marginRight: '6px', color: '#1890ff', verticalAlign: 'middle' }}></i>
                            待办事项 / 异常跟进
                        </span>

                        {/* 优化后的“更多”按钮 */}
                        <div
                            onClick={() => navigate('/flow/todo')}
                            style={{
                                cursor: 'pointer', fontSize: '12px', color: '#666',
                                display: 'flex', alignItems: 'center', padding: '4px 8px', borderRadius: '4px',
                                transition: 'background 0.2s'
                            }}
                            className="hover-bg"
                            title="前往任务中心处理更多任务"
                        >
                            更多任务 <i className="ri-arrow-right-s-line" style={{ marginLeft: '2px' }}></i>
                        </div>
                    </div>

                    {/* 列表区域 (内部滚动) */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                        {simpleTodoList.map((task, i) => (
                            <div key={i} className="todo-item" style={{
                                padding: '10px 16px', borderBottom: '1px solid #f9f9f9',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                transition: 'background 0.2s', cursor: 'pointer'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                    <span className="tag" style={{
                                        background: task.type === 'red' ? '#fff1f0' : task.type === 'orange' ? '#fff7e6' : '#e6f7ff',
                                        color: task.type === 'red' ? '#ff4d4f' : task.type === 'orange' ? '#faad14' : '#1890ff',
                                        border: `1px solid ${task.type === 'red' ? '#ffa39e' : task.type === 'orange' ? '#ffe58f' : '#91caff'}`,
                                        fontSize: '11px', padding: '1px 5px', borderRadius: '3px', flexShrink: 0
                                    }}>
                                        {task.tag}
                                    </span>
                                    <span style={{ fontSize: '13px', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {task.text}
                                    </span>
                                </div>
                                <span style={{ fontSize: '12px', color: '#999', flexShrink: 0, fontFamily: 'monospace' }}>
                                    {task.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* B. 生产趋势图卡片 */}
                <div className="dashboard-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #e8e8e8', borderRadius: '8px', background: '#fff' }}>
                    <div className="card-header-sm" style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', background: '#fafafa', flexShrink: 0 }}>
                        <span style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
                            <i className="ri-bar-chart-box-line" style={{ marginRight: '6px', color: '#1890ff', verticalAlign: 'middle' }}></i>
                            产能与良率趋势
                        </span>
                    </div>
                    <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: '10px' }}>
                            {[
                                { day: '周一', val: 65, rate: 98 },
                                { day: '周二', val: 80, rate: 97 },
                                { day: '周三', val: 45, rate: 99 },
                                { day: '周四', val: 90, rate: 98 },
                                { day: '今天', val: 75, rate: 98.5 }
                            ].map((d, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                    <div style={{ fontSize: '11px', color: '#1890ff', fontWeight: 'bold', marginBottom: '4px' }}>{d.rate}%</div>
                                    <div style={{
                                        width: '30%', minWidth: '16px', maxWidth: '30px',
                                        background: 'linear-gradient(180deg, #69c0ff 0%, #1890FF 100%)',
                                        height: `${d.val * 1.2}px`,
                                        borderRadius: '4px 4px 0 0',
                                        opacity: 0.9,
                                        transition: 'height 0.5s'
                                    }}></div>
                                    <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>{d.day}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '11px', color: '#ccc', paddingTop: '10px', borderTop: '1px dashed #eee' }}>
                            <span>● 产量 (km)</span>
                            <span style={{ margin: '0 10px' }}>|</span>
                            <span>良率 (Yield)</span>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                .shortcut-item:hover { transform: translateY(-2px); }
                .hover-bg:hover { background: #f0f0f0; color: #1890ff !important; }
                .todo-item:hover { background: #f0f7ff !important; }
                /* 仅在 Webkit 浏览器隐藏滚动条但保留滚动功能 (可选) */
                .dashboard-card .card-body::-webkit-scrollbar { width: 4px; }
                .dashboard-card .card-body::-webkit-scrollbar-thumb { background: #eee; border-radius: 2px; }
            `}</style>
        </div>
    );
};

export default Dashboard;