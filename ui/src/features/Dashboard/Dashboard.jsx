/**
 * @file: src/features/Dashboard/Dashboard.jsx
 * @description: 数字化智造协同工作台 (Dashboard)
 * - [Feature] 待办事项支持点击弹出对应业务表单 (Abnormal, NCR, ProcessRoute)
 * - [Integration] 集成了 QMES 和 Production 模块的详情组件
 */
import React, { useState, useEffect, Suspense } from 'react';
import menuData from '../../data/menu.json';
import BaseModal from '../../components/Common/BaseModal';
import './dashboard.css';

// --- 懒加载业务详情组件 ---
// 注意：实际项目中应确保路径正确，这里假设都在对应目录下
const AbnormalEventDetail = React.lazy(() => import('../QMES/AbnormalEventDetail'));
const NonConformingDetail = React.lazy(() => import('../QMES/NonConformingDetail'));
const ProcessRouteDetail = React.lazy(() => import('../Production/ProcessRouteDetail'));

const Dashboard = () => {
    const user = { name: '张工艺', role: 'SUPER_ADMIN', dept: '工程部' };

    // --- 状态 ---
    const [shortcuts, setShortcuts] = useState([]);
    const [configVisible, setConfigVisible] = useState(false);
    const [allAvailableMenus, setAllAvailableMenus] = useState([]);
    const [selectedPaths, setSelectedPaths] = useState([]);

    // --- 业务弹窗状态 ---
    const [activeModal, setActiveModal] = useState(null); // 'ABNORMAL', 'NCR', 'ROUTE', null
    const [currentDetailRecord, setCurrentDetailRecord] = useState(null);

    // --- 1. 增强的待办数据 (包含 modalType 和模拟 record) ---
    const todos = [
        {
            id: 101, type: 'approval', title: '工艺变更申请 (ECN-20260115-01)', content: '12寸CMP抛光垫固化曲线调整', time: '10:30', status: '待审批', level: 'high',
            modalType: 'ROUTE', // 关联工艺路线
            record: { id: 'PR-CMP-001', name: '12寸CMP抛光垫标准工艺', version: 'V1.2', status: '已发布', product: 'PAD-CMP-300', productName: '12寸晶圆CMP抛光垫' }
        },
        {
            id: 105, type: 'approval', title: '不合格品处置 (NCR-20260114-05)', content: '表面气泡超标 (涉及批次: B260114-02)', time: '昨天', status: '待确认', level: 'medium',
            modalType: 'NCR', // 关联不合格品单
            record: { id: 'NCR-20260114-05', source: '制程检验', itemCode: 'PAD-CMP-300', itemName: '12寸CMP抛光垫', qty: 25, defect: '表面气泡', status: '待评审' }
        },
        {
            id: 103, type: 'alert', title: '生产异常报告 (ABN-20260115-02)', content: '固化炉 Oven-02 温度偏差 > 5℃', time: '08:50', status: '处理中', level: 'high',
            modalType: 'ABNORMAL', // 关联异常单
            record: { id: 'ABN-20260115-02', type: '设备异常', line: 'Line-02', station: '固化', desc: '温度波动异常', status: '处理中' }
        },
        { id: 102, type: 'task', title: '首件检验 (FAI)', content: '机加线-03号机 / 批次: B260115-A', time: '09:15', status: '待检验', level: 'medium', modalType: null }, // 暂无对应弹窗
        { id: 104, type: 'notice', title: '生产排程更新', content: '下周生产计划已发布，请确认物料需求', time: '昨天', status: '未读', level: 'low', modalType: null },
    ];

    // --- 初始化菜单 (保持原有逻辑) ---
    useEffect(() => {
        const flatMenus = [];
        menuData.menu.forEach(level1 => {
            if (hasPermission(level1.roles, user.role)) {
                level1.groups?.forEach(group => {
                    group.items?.forEach(item => {
                        if (hasPermission(item.roles, user.role) && item.path) {
                            flatMenus.push({ ...item, parentTitle: level1.title });
                        }
                    });
                });
            }
        });
        setAllAvailableMenus(flatMenus);
        const savedShortcuts = localStorage.getItem(`shortcuts_${user.name}`);
        if (savedShortcuts) {
            setShortcuts(JSON.parse(savedShortcuts));
            setSelectedPaths(JSON.parse(savedShortcuts).map(s => s.path));
        } else {
            const defaults = flatMenus.slice(0, 8);
            setShortcuts(defaults);
            setSelectedPaths(defaults.map(s => s.path));
        }
    }, [user.name, user.role]);

    const hasPermission = (roles, userRole) => !roles || roles.includes('ALL') || roles.includes(userRole);

    // --- 快捷方式配置 ---
    const toggleShortcut = (menuItem) => {
        if (selectedPaths.includes(menuItem.path)) setSelectedPaths(prev => prev.filter(p => p !== menuItem.path));
        else {
            if (selectedPaths.length >= 8) return alert("最多只能添加 8 个快捷方式");
            setSelectedPaths(prev => [...prev, menuItem.path]);
        }
    };

    const saveConfig = () => {
        const newShortcuts = allAvailableMenus.filter(m => selectedPaths.includes(m.path));
        setShortcuts(newShortcuts);
        localStorage.setItem(`shortcuts_${user.name}`, JSON.stringify(newShortcuts));
        setConfigVisible(false);
    };

    // --- 核心：处理待办点击 ---
    const handleTodoClick = (todo) => {
        if (todo.modalType && todo.record) {
            setCurrentDetailRecord(todo.record);
            setActiveModal(todo.modalType);
        } else {
            // 对于没有对应弹窗的，还是跳转路由
            console.log('跳转至流程中心:', todo.id);
            window.location.hash = '/flow/todo';
        }
    };

    // --- 静态数据 ---
    const stats = [
        { id: 1, title: '今日产量 (pcs)', value: '1,280', sub: '计划: 1,500', trend: 'down', percent: '-14%', icon: 'ri-apps-2-line', color: 'blue' },
        { id: 2, title: '直通率 (FPY)', value: '98.5%', sub: '目标: 99.0%', trend: 'up', percent: '+0.2%', icon: 'ri-pie-chart-2-line', color: 'green' },
        { id: 3, title: '设备OEE', value: '86.2%', sub: '运行中: 12台', trend: 'up', percent: '+1.5%', icon: 'ri-cpu-line', color: 'purple' },
        { id: 4, title: '待办事项', value: '12', sub: '紧急: 3', trend: 'flat', percent: '0', icon: 'ri-task-line', color: 'orange' },
    ];
    const chartData = [{label:'08:00',value:80},{label:'10:00',value:120},{label:'12:00',value:95},{label:'14:00',value:150},{label:'16:00',value:140},{label:'18:00',value:60},{label:'20:00',value:0},{label:'22:00',value:0}];
    const renderTrend = (trend, percent) => {
        if (trend === 'up') return <span className="trend up"><i className="ri-arrow-up-fill"></i> {percent}</span>;
        if (trend === 'down') return <span className="trend down"><i className="ri-arrow-down-fill"></i> {percent}</span>;
        return <span className="trend flat">-</span>;
    };
    const colors = ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#2f54eb'];

    return (
        <div className="dashboard-container one-screen">
            <div className="dash-header compact">
                <div className="welcome-text">
                    <h2 style={{fontSize:'18px'}}>早安，{user.name}</h2>
                    <p style={{fontSize:'12px'}}>{user.dept} | {user.role} | 2026年01月15日</p>
                </div>
                <div className="header-stats">
                    <span className="h-stat">待处理: <b>12</b></span>
                    <span className="h-stat">消息: <b>5</b></span>
                </div>
            </div>

            <div className="kpi-grid compact">
                {stats.map(stat => (
                    <div key={stat.id} className="kpi-card">
                        <div className="kpi-icon small" style={{ backgroundColor: `var(--theme-${stat.color}-bg)`, color: `var(--theme-${stat.color})` }}>
                            <i className={stat.icon}></i>
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-title">{stat.title}</div>
                            <div className="kpi-row">
                                <div className="kpi-value">{stat.value}</div>
                                {renderTrend(stat.trend, stat.percent)}
                            </div>
                            <div className="kpi-sub">{stat.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dash-main-layout fill-height">
                <div className="dash-left-col">
                    <div className="dash-card shortcuts-card compact">
                        <div className="card-header small">
                            <span className="card-title"><i className="ri-apps-fill"></i> 快捷导航</span>
                            <span className="card-extra" onClick={() => setConfigVisible(true)} title="配置快捷方式"><i className="ri-settings-3-line"></i> 配置</span>
                        </div>
                        <div className="shortcuts-grid">
                            {shortcuts.length === 0 ? <div className="empty-tip">点击右上角配置添加</div> :
                                shortcuts.map((sc, i) => (
                                    <div key={sc.path} className="shortcut-item" onClick={() => window.location.hash = sc.path}>
                                        <div className="sc-icon" style={{background: colors[i % colors.length]}}><i className={sc.icon}></i></div>
                                        <span className="sc-name">{sc.label}</span>
                                    </div>
                                ))
                            }
                            {Array.from({length: Math.max(0, 8 - shortcuts.length)}).map((_, i) => <div key={`empty-${i}`} className="shortcut-item empty"></div>)}
                        </div>
                    </div>

                    <div className="dash-card todo-card flex-grow">
                        <div className="card-header small">
                            <span className="card-title"><i className="ri-list-check"></i> 待办任务</span>
                            <span className="card-extra text-link" onClick={() => window.location.hash = '/flow/todo'}>查看全部 <i className="ri-arrow-right-s-line"></i></span>
                        </div>
                        <div className="todo-list scrollable">
                            {todos.map(todo => (
                                <div key={todo.id} className="todo-item" onClick={() => handleTodoClick(todo)}>
                                    <div className={`todo-icon type-${todo.type}`}>
                                        <i className={todo.type === 'alert' ? 'ri-alarm-warning-fill' : (todo.type === 'approval' ? 'ri-stamp-fill' : 'ri-task-fill')}></i>
                                    </div>
                                    <div className="todo-content">
                                        <div className="todo-title">
                                            {todo.title}
                                            {todo.level === 'high' && <span className="tag-urgent">紧急</span>}
                                        </div>
                                        <div className="todo-desc">{todo.content}</div>
                                    </div>
                                    <div className="todo-meta">
                                        <div className="todo-time">{todo.time}</div>
                                        {todo.modalType ?
                                            <button className="mini-btn primary" onClick={(e) => { e.stopPropagation(); handleTodoClick(todo); }}>办理</button> :
                                            <button className="mini-btn outline" onClick={(e) => { e.stopPropagation(); handleTodoClick(todo); }}>查看</button>
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="dash-right-col">
                    <div className="dash-card chart-card flex-grow-half">
                        <div className="card-header small"><span className="card-title"><i className="ri-bar-chart-fill"></i> 实时产出</span></div>
                        <div className="chart-container compact">
                            <div className="css-bar-chart">
                                {chartData.map((d, i) => (
                                    <div key={i} className="bar-group">
                                        <div className="bar-value">{d.value}</div>
                                        <div className="bar" style={{height: `${(d.value / 150) * 100}%`}}></div>
                                        <div className="bar-label">{d.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="dash-card notice-card flex-grow-half">
                        <div className="card-header small"><span className="card-title"><i className="ri-notification-3-fill"></i> 质量通报</span></div>
                        <div className="notice-list scrollable">
                            <div className="notice-item"><span className="notice-tag red">重要</span><span className="notice-text">加强 CMP 抛光垫表面异物管控</span></div>
                            <div className="notice-item"><span className="notice-tag blue">通知</span><span className="notice-text">本周五下午 14:00 全厂 5S 检查</span></div>
                            <div className="notice-item"><span className="notice-tag gray">维护</span><span className="notice-text">系统今晚 23:00 例行维护</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 配置快捷方式模态框 */}
            <BaseModal visible={configVisible} title="配置快捷导航 (最多 8 个)" width="600px" onClose={() => setConfigVisible(false)} footer={<div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}><button className="btn outline" onClick={() => setConfigVisible(false)}>取消</button><button className="btn btn-primary" onClick={saveConfig}>保存配置</button></div>}>
                <div className="shortcut-config-container">
                    {Object.entries(allAvailableMenus.reduce((acc, item) => { (acc[item.parentTitle] = acc[item.parentTitle] || []).push(item); return acc; }, {})).map(([groupTitle, items]) => (
                        <div key={groupTitle} className="sc-config-group">
                            <div className="sc-group-title">{groupTitle}</div>
                            <div className="sc-group-items">
                                {items.map(item => (
                                    <div key={item.path} className={`sc-option ${selectedPaths.includes(item.path) ? 'selected' : ''}`} onClick={() => toggleShortcut(item)}>
                                        <i className={item.icon}></i><span>{item.label}</span>
                                        {selectedPaths.includes(item.path) && <i className="ri-checkbox-circle-fill check-mark"></i>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </BaseModal>

            {/* 业务详情弹窗容器 (使用 Suspense 处理懒加载) */}
            <Suspense fallback={<div className="loading-spinner">Loading module...</div>}>
                {activeModal === 'ABNORMAL' && (
                    <AbnormalEventDetail
                        visible={true}
                        record={currentDetailRecord}
                        isEditing={true} // 办理状态
                        onClose={() => setActiveModal(null)}
                    />
                )}
                {activeModal === 'NCR' && (
                    <NonConformingDetail
                        visible={true}
                        record={currentDetailRecord}
                        isEditing={true}
                        onClose={() => setActiveModal(null)}
                    />
                )}
                {activeModal === 'ROUTE' && (
                    <ProcessRouteDetail
                        visible={true}
                        record={currentDetailRecord}
                        isEditing={true}
                        onClose={() => setActiveModal(null)}
                    />
                )}
            </Suspense>
        </div>
    );
};

export default Dashboard;