/**
 * @file: src/features/Dashboard/Dashboard.jsx
 * @version: v3.1.0 (Simulation Connected)
 * @description: 接入 SimulationContext，实现动态待办与指标展示
 */
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { SimulationContext } from '../../context/SimulationContext'; // 引入
import './Dashboard.css';

const Dashboard = () => {
    const { currentUser, navigate } = useContext(AppContext);
    // 从模拟上下文中获取实时数据
    const {
        abnormalTickets,
        standardLibraryStatus,
        getTodoCount
    } = useContext(SimulationContext);

    // --- 动态配置逻辑 ---
    const getRoleConfig = (role) => {

        // 动态计算指标
        const pendingAbnormalCount = getTodoCount(role); // 当前角色的异常待办数
        const itCoverage = standardLibraryStatus.coverage; // IT 标准覆盖率

        // 默认配置 (ADM)
        const defaultConfig = {
            title: '数字化工厂全景概览 & 运维中心',
            roleLabel: '系统管理员',
            metrics: [
                { label: '在线终端', value: '128', unit: '台', status: 'success' },
                { label: '主数据完整度', value: '99.2', unit: '%', status: 'success' },
                // 动态数据：标准覆盖率
                { label: 'QMES标准覆盖', value: itCoverage, unit: '%', status: itCoverage < 100 ? 'warning' : 'success' }
            ],
            aiTip: itCoverage < 100
                ? "监测到新导入的 HC-OCA-2026 产品缺少 FQC 检验标准，请及时从行业标准库导入或手动配置。"
                : "系统运行平稳，主数据与检验标准已全部同步。",
            shortcuts: [
                { label: '主数据管理', icon: 'ri-database-2-line', color: 'color-blue', path: '/mes/base/product' },
                { label: 'QMES标准', icon: 'ri-ruler-2-line', color: 'color-green', path: '/qms/base/std' },
                { label: '权限管理', icon: 'ri-shield-user-line', color: 'color-orange', path: '/system/role' },
                { label: '审计日志', icon: 'ri-file-list-3-line', color: 'color-purple', path: '/system/log/oper' }
            ],
            // 动态待办
            todos: itCoverage < 100 ? [
                { tag: '配置', type: 'blue', text: '导入新版《进料检验标准》V2.0', time: '待处理', action: 'import_std' } // action 用于触发模拟弹窗
            ] : [
                { tag: '运维', type: 'green', text: '数据库索引优化计划', time: '2026-01-15' }
            ]
        };

        const configs = {
            // --- 生产操作工 (OP) ---
            'OP': {
                title: 'No.3 精密涂布线 - 现场操作台',
                roleLabel: '一线操作工',
                metrics: [
                    { label: '当前机速', value: '45.2', unit: 'm/min', status: 'success' },
                    { label: '烘箱温度', value: '120.5', unit: '°C', status: 'success' },
                    { label: '本班异常', value: abnormalTickets.filter(t=>t.initiator==='张操作').length, unit: '起', status: 'success' }
                ],
                aiTip: "当前生产 HC-OCA-2026。请注意：根据《异常事件处理流程》，若发现连续 3 米涂布不均，请立即停机并填写异常事件处置单。",
                shortcuts: [
                    { label: '生产填报', icon: 'ri-edit-box-line', color: 'color-blue', path: '#action:prod_record' }, // 标记为动作
                    { label: '异常上报', icon: 'ri-alarm-warning-line', color: 'color-red', path: '#action:report_abnormal' },
                    { label: '投料扫描', icon: 'ri-qr-scan-2-line', color: 'color-green', path: '/mes/exe/scan' },
                    { label: '换卷记录', icon: 'ri-refresh-line', color: 'color-orange', path: '/mes/exe/change' }
                ],
                todos: [
                    { tag: '记录', type: 'blue', text: '10:00 节点工艺参数查录', time: '未完成', action: 'prod_record' },
                    { tag: '点检', type: 'orange', text: '涂布头清洁度检查 (SOP要求)', time: '待执行' }
                ]
            },
            // --- 生产经理 (MGR) ---
            'MGR': {
                title: '洁净车间驾驶舱 (Class 1000)',
                roleLabel: '生产经理',
                metrics: [
                    { label: '光学膜直通率', value: '98.5', unit: '%', status: 'success' },
                    // 动态数据：待处理异常
                    { label: '待处理异常', value: pendingAbnormalCount, unit: '件', status: pendingAbnormalCount > 0 ? 'error' : 'success' },
                    { label: 'CMP垫产量', value: '320', unit: '片', status: 'primary' }
                ],
                aiTip: pendingAbnormalCount > 0
                    ? `收到 ${pendingAbnormalCount} 条异常待确认。请立即组织工艺、设备部门进行现场确认并制定围堵措施。`
                    : "车间运行平稳，暂无紧急异常。",
                shortcuts: [
                    { label: '异常看板', icon: 'ri-alert-line', color: 'color-red', path: '/qms/abnormal/board' },
                    { label: '生产日报', icon: 'ri-file-chart-line', color: 'color-blue', path: '/rpt/mes/prod' },
                    { label: '工单审批', icon: 'ri-check-double-line', color: 'color-green', path: '/flow/todo' }
                ],
                // 动态待办：过滤出 PENDING_CONFIRM 的异常
                todos: abnormalTickets.filter(t => t.status === 'PENDING_CONFIRM').map(t => ({
                    tag: '确认', type: 'red', text: `${t.id} ${t.desc}`, time: '紧急', action: 'handle_ticket', data: t
                }))
            },
            // --- 质检工程师 (QC) ---
            'QC': {
                title: '质量管控工作台',
                roleLabel: 'QA工程师',
                metrics: [
                    { label: '待结案异常', value: pendingAbnormalCount, unit: '件', status: 'warning' },
                    { label: '待检批次', value: '5', unit: '批', status: 'warning' },
                    { label: 'IQC合格率', value: '96.2', unit: '%', status: 'success' }
                ],
                aiTip: "关于原材料 PET 基膜的异常，供应商已提交 8D 报告。请根据《进料检验标准》复测留样，进行效果验证以闭环结案。",
                shortcuts: [
                    { label: 'IQC/FQC', icon: 'ri-microscope-line', color: 'color-blue', path: '/qms/iqc/list' },
                    { label: 'NCR处置', icon: 'ri-close-circle-line', color: 'color-red', path: '/qms/ncr/list' },
                    { label: '8D评审', icon: 'ri-discuss-line', color: 'color-orange', path: '/qms/8d' }
                ],
                todos: abnormalTickets.filter(t => t.status === 'PENDING_VERIFY').map(t => ({
                    tag: '验证', type: 'orange', text: `${t.id} 纠正措施效果确认`, time: '待结案', action: 'handle_ticket', data: t
                }))
            },
            // --- 设备/工艺工程师 (PE/EQ) ---
            'PE': {
                title: '技术与设备支援中心',
                roleLabel: '工艺/设备工程师',
                metrics: [
                    { label: 'OEE效率', value: '82.5', unit: '%', status: 'success' },
                    { label: '待分析异常', value: pendingAbnormalCount, unit: '件', status: 'error' },
                    { label: '工艺变更', value: '3', unit: '项', status: 'primary' }
                ],
                aiTip: "请针对 2号机张力波动 异常填写根因分析报告。建议检查张力传感器校准记录。",
                shortcuts: [
                    { label: '根因分析', icon: 'ri-search-eye-line', color: 'color-orange', path: '/qms/abnormal/analysis' },
                    { label: '维修记录', icon: 'ri-tools-line', color: 'color-blue', path: '/mes/equip/maintain' },
                    { label: 'ECN变更', icon: 'ri-git-merge-line', color: 'color-purple', path: '/qms/ecn/apply' }
                ],
                todos: abnormalTickets.filter(t => t.status === 'PENDING_ANALYSIS').map(t => ({
                    tag: '分析', type: 'red', text: `${t.id} 根因分析与对策填报`, time: '紧急', action: 'handle_ticket', data: t
                }))
            }
        };

        if (role === 'EQ') return { ...configs['PE'], roleLabel: '设备工程师' };
        return configs[role] || defaultConfig;
    };

    const role = currentUser?.role || 'ADM';
    const config = getRoleConfig(role);

    // --- 点击处理中心 ---
    const handleItemClick = (item) => {
        // 如果是模拟动作
        if (item.action || (item.path && item.path.startsWith('#action:'))) {
            const actionKey = item.action || item.path.split(':')[1];
            console.log(`[Dashboard] Trigger Simulation Action: ${actionKey}`, item.data);

            // TODO: 在下一阶段，我们将在这里打开对应的模态框 (Modal)
            // 暂时先用 alert 占位，或者留空等待下一步开发
            // openSimulationModal(actionKey, item.data);

            return;
        }

        // 普通页面跳转
        if (item.path) {
            navigate(item.path);
        }
    };

    // 辅助样式函数
    const getStatusClass = (status) => {
        const map = { success: 'text-success', warning: 'text-warning', error: 'text-error', primary: 'text-primary' };
        return map[status] || 'text-primary';
    };

    const getTagStyle = (type) => {
        const map = {
            blue: { bg: '#e6f7ff', color: '#1890ff', border: '#91caff' },
            green: { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
            orange: { bg: '#fff7e6', color: '#faad14', border: '#ffe58f' },
            red: { bg: '#fff1f0', color: '#ff4d4f', border: '#ffa39e' },
            purple: { bg: '#f9f0ff', color: '#722ed1', border: '#d3adf7' }
        };
        return map[type] || map['blue'];
    };

    return (
        <div className="dashboard-container fade-in">
            {/* Banner */}
            <div className="dashboard-banner">
                <div className="banner-left">
                    <div className="welcome-text">
                        {config.title}
                        <span className="role-badge">{config.roleLabel}</span>
                    </div>
                    <div className="ai-tip-box">
                        <i className="ri-sparkling-fill ai-tip-icon"></i>
                        <span className="ai-tip-text"><strong>AI 智能提示：</strong>{config.aiTip}</span>
                    </div>
                </div>
                <div className="banner-right">
                    {config.metrics.map((m, i) => (
                        <div key={i} className="metric-card">
                            <div className="metric-label">{m.label}</div>
                            <div className={`metric-value ${getStatusClass(m.status)}`}>
                                {m.value}<span className="metric-unit">{m.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Shortcuts */}
            <div className="shortcuts-panel">
                <div className="section-title"><i className="ri-flashlight-line"></i> 常用功能入口</div>
                <div className="shortcuts-grid">
                    {config.shortcuts.map((s, i) => (
                        <div key={i} className="shortcut-btn" onClick={() => handleItemClick(s)}>
                            <div className={`shortcut-icon ${s.color}`}><i className={s.icon}></i></div>
                            <div className="shortcut-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Workspace */}
            <div className="workspace-grid">
                <div className="workspace-card">
                    <div className="card-header">
                        <div className="section-title" style={{margin:0}}><i className="ri-list-check"></i> 待办事项 / 异常跟进</div>
                        <span style={{fontSize:'12px', color:'#1890ff', cursor:'pointer'}} onClick={() => navigate('/flow/todo')}>查看更多 <i className="ri-arrow-right-line"></i></span>
                    </div>
                    <div className="card-body">
                        {config.todos.length > 0 ? config.todos.map((task, i) => {
                            const style = getTagStyle(task.type);
                            return (
                                <div key={i} className="todo-list-item" onClick={() => handleItemClick(task)}>
                                    <div className="todo-main">
                                        <span className="todo-tag" style={{background: style.bg, color: style.color, border: `1px solid ${style.border}`}}>{task.tag}</span>
                                        <span className="todo-content">{task.text}</span>
                                    </div>
                                    <span className="todo-meta">{task.time}</span>
                                </div>
                            );
                        }) : <div style={{padding:'20px', textAlign:'center', color:'#999'}}>暂无待办事项</div>}
                    </div>
                </div>
                {/* 趋势图保持不变 */}
                <div className="workspace-card">
                    <div className="card-header"><div className="section-title" style={{margin:0}}><i className="ri-bar-chart-box-line"></i> 生产/质量趋势</div></div>
                    <div className="card-body" style={{display:'flex', alignItems:'flex-end', justifyContent:'space-around', padding:'20px'}}>
                        {[65, 80, 45, 90, 75].map((h, i) => (
                            <div key={i} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'5px', height:'100%', justifyContent:'flex-end'}}>
                                <div style={{width:'30px', height:`${h}%`, background:'linear-gradient(to top, #1890FF, #69c0ff)', borderRadius:'4px 4px 0 0'}}></div>
                                <span style={{fontSize:'12px', color:'#999'}}>D-{5-i}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;