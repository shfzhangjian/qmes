/**
 * @file: src/features/Dashboard/Dashboard.jsx
 * @version: v3.1.0 (QMS Routes Integration)
 * @description: 仪表盘组件，适配五大核心角色场景。
 * 新增 SQE (供应商质量工程师) 角色配置，并集成 IQC/NCR 快捷入口。
 * @lastModified: 2026-01-14 20:00:00
 */
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { SimulationContext } from '../../context/SimulationContext';
import './dashboard.css';

const Dashboard = () => {
    const { currentUser, navigate } = useContext(AppContext);
    const { todos, openTodoDetail } = useContext(SimulationContext);

    // --- 角色配置表 (根据设计文档 V1.1 & QMS集成) ---
    const getRoleConfig = (role) => {
        const configs = {
            'ADM': {
                metrics: [
                    { label: '在线终端', value: '128', unit: '台', status: 'success' },
                    { label: '主数据完整度', value: '99.2', unit: '%', status: 'success' },
                    { label: 'QMES标准覆盖', value: '100', unit: '%', status: 'primary' }
                ],
                shortcuts: [
                    { label: '主数据管理', icon: 'ri-database-2-line', color: '#1890ff', action: () => alert('打开主数据管理') },
                    { label: 'QMES标准', icon: 'ri-ruler-2-line', color: '#52c41a', action: () => navigate('/qms/iqc/standard') }, // 更新：指向 QMS 标准路由
                    { label: '权限管理', icon: 'ri-shield-user-line', color: '#faad14', action: () => navigate('/system/user') },
                    { label: '审计日志', icon: 'ri-file-list-3-line', color: '#722ed1', action: () => navigate('/system/log') }
                ],
                aiHint: "监测到新导入的 HC-OCA-2026 产品缺少 FQC 检验标准，请及时从行业标准库导入。"
            },
            'OP': {
                metrics: [
                    { label: '当前机速', value: '45.2', unit: 'm/min', status: 'success' },
                    { label: '烘箱温度', value: '120.5', unit: '°C', status: 'success' },
                    { label: '本班异常', value: '0', unit: '起', status: 'success' }
                ],
                shortcuts: [
                    { label: '生产填报', icon: 'ri-edit-box-line', color: '#1890ff', action: () => openModal('production-entry') }, // 触发弹窗
                    { label: '异常上报', icon: 'ri-alarm-warning-line', color: '#ff4d4f', action: () => openModal('ticket-process') }, // 触发弹窗
                    { label: '投料扫描', icon: 'ri-qr-scan-2-line', color: '#52c41a', action: () => alert('开启摄像头扫描...') },
                    { label: '换卷记录', icon: 'ri-refresh-line', color: '#722ed1', action: () => alert('跳转换卷记录') }
                ],
                aiHint: "当前生产 HC-OCA-2026。请注意：若发现连续 3 米涂布不均，请立即停机并上报异常。"
            },
            'MGR': {
                metrics: [
                    { label: '光学膜直通率', value: '98.5', unit: '%', status: 'success' },
                    { label: '异常处置率', value: '80', unit: '%', status: 'warning' },
                    { label: 'CMP垫产量', value: '320', unit: '片', status: 'success' }
                ],
                shortcuts: [
                    { label: '异常看板', icon: 'ri-dashboard-line', color: '#ff4d4f', action: () => navigate('/flow/todo') },
                    { label: '生产日报', icon: 'ri-file-chart-line', color: '#1890ff', action: () => navigate('/rpt/mes/prod') },
                    { label: '工单审批', icon: 'ri-checkbox-circle-line', color: '#52c41a', action: () => navigate('/flow/todo') },
                    { label: '良率分析', icon: 'ri-bar-chart-2-line', color: '#722ed1', action: () => navigate('/rpt/qms/rate') }
                ],
                aiHint: "收到 2号涂布机 上报的 '涂布厚度超差' 异常。请立即组织工艺、设备部门进行现场确认。"
            },
            'QC': {
                metrics: [
                    { label: '待结案异常', value: '2', unit: '件', status: 'warning' },
                    { label: '待检批次', value: '5', unit: '批', status: 'warning' },
                    { label: 'IQC合格率', value: '96.2', unit: '%', status: 'success' }
                ],
                shortcuts: [
                    // 更新：IQC记录入口
                    { label: 'IQC记录', icon: 'ri-file-list-line', color: '#1890ff', action: () => navigate('/qms/iqc/record') },
                    // 更新：标准管理入口
                    { label: '检验标准', icon: 'ri-book-read-line', color: '#00b578', action: () => navigate('/qms/iqc/standard') },
                    { label: 'NCR处置', icon: 'ri-alarm-warning-line', color: '#ff4d4f', action: () => navigate('/qms/ncr/list') },
                    { label: '8D评审', icon: 'ri-file-search-line', color: '#722ed1', action: () => navigate('/qms/8d') }
                ],
                aiHint: "关于原材料 PET 基膜的异常，供应商已提交 8D 报告。请进行效果验证以闭环结案。"
            },
            'PE': {
                metrics: [
                    { label: 'OEE', value: '82.5', unit: '%', status: 'success' },
                    { label: '待分析异常', value: '1', unit: '件', status: 'error' },
                    { label: '工艺变更', value: '3', unit: '项', status: 'primary' }
                ],
                shortcuts: [
                    { label: '根因分析', icon: 'ri-search-eye-line', color: '#1890ff', action: () => navigate('/flow/todo') },
                    { label: '维修记录', icon: 'ri-tools-line', color: '#52c41a', action: () => navigate('/mes/base/equip') },
                    { label: '参数优化', icon: 'ri-equalizer-line', color: '#faad14', action: () => navigate('/mes/param/conf') },
                    { label: 'ECN申请', icon: 'ri-git-merge-line', color: '#722ed1', action: () => navigate('/qms/ecn/apply') }
                ],
                aiHint: "请针对 2号机张力波动 异常填写根因分析报告。建议检查张力传感器校准记录。"
            },
            // [新增] SQE 角色配置
            'SQE': {
                metrics: [
                    { label: '供应商总数', value: '45', unit: '家', status: 'primary' },
                    { label: '准入审核中', value: '2', unit: '家', status: 'warning' },
                    { label: '来料合格率', value: '96.5', unit: '%', status: 'success' }
                ],
                shortcuts: [
                    { label: 'IQC记录', icon: 'ri-file-list-line', color: '#1890ff', action: () => navigate('/qms/iqc/record') },
                    { label: '供应商档案', icon: 'ri-truck-line', color: '#52c41a', action: () => navigate('/srm/supplier') },
                    { label: 'NCR处理', icon: 'ri-alarm-warning-line', color: '#faad14', action: () => navigate('/qms/ncr/list') },
                    { label: '绩效评分', icon: 'ri-pie-chart-line', color: '#722ed1', action: () => navigate('/rpt/srm/score') }
                ],
                aiHint: "供应商 'XX化工' 的最近三批次原料连续出现杂质超标，建议发起针对性稽核。"
            }
        };
        // 默认回退到 ADM
        return configs[role] || configs['ADM'];
    };

    const conf = getRoleConfig(currentUser?.role);

    // 处理待办点击
    const handleTodoClick = (todo) => {
        if (todo.componentKey) {
            // 优先使用动态详情弹窗
            openTodoDetail(todo);
        } else if (todo.action) {
            // 兼容旧逻辑
            openModal(todo.action, todo.data);
        } else {
            alert(`点击了: ${todo.title}`);
        }
    };

    return (
        <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* Banner 区域 */}
            <div className="aip-summary-card" style={{
                flexShrink: 0, padding: '16px 24px', marginBottom: '15px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#fff', borderRadius: '8px', border: '1px solid #e8e8e8'
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <h2 style={{ margin: 0, fontSize: '18px', color: '#333' }}>早安，{currentUser?.name}</h2>
                        <span className="tag" style={{ background: '#e6f7ff', color: '#1890ff', border: '1px solid #91caff' }}>{currentUser?.roleName}</span>
                    </div>
                    <div style={{ color: '#666', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <i className="ri-sparkling-fill" style={{ color: '#faad14', marginTop: '2px' }}></i>
                        <span>{conf.aiHint}</span>
                    </div>
                </div>

                {/* 快捷入口 & 指标 */}
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        {conf.shortcuts.map((s, i) => (
                            <div key={i} className="shortcut-item" onClick={s.action} style={{cursor:'pointer', textAlign:'center'}}>
                                <div className="shortcut-icon-box" style={{ background: `${s.color}15`, color: s.color }}>
                                    <i className={s.icon}></i>
                                </div>
                                <div style={{ fontSize: '11px', color: '#666', marginTop:'4px' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ width: '1px', height: '40px', background: '#eee' }}></div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        {conf.metrics.map((m, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>{m.label}</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: m.status === 'error' ? '#ff4d4f' : m.status === 'warning' ? '#faad14' : '#1890ff' }}>
                                    {m.value} <span style={{ fontSize: '11px', color: '#999', fontWeight: 'normal' }}>{m.unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid 区域：待办 + 报表 */}
            <div className="dashboard-grid" style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', overflow: 'hidden' }}>

                {/* 左侧：动态待办列表 */}
                <div className="dashboard-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px' }}>
                    <div className="card-header-sm" style={{ padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                        <span><i className="ri-list-check" style={{ color: '#1890ff', marginRight: '6px' }}></i> 待办事项 / 任务中心</span>
                        <div className="more-link" onClick={() => navigate('/flow/todo')}>更多任务 <i className="ri-arrow-right-s-line"></i></div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {todos.length > 0 ? todos.map((todo, i) => (
                            <div key={todo.id} className="todo-item" onClick={() => handleTodoClick(todo)} style={{ padding: '12px 16px', borderBottom: '1px solid #f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className="tag" style={{
                                        background: todo.type === 'abnormal' ? '#fff1f0' : '#e6f7ff',
                                        color: todo.type === 'abnormal' ? '#ff4d4f' : '#1890ff',
                                        border: `1px solid ${todo.type === 'abnormal' ? '#ffa39e' : '#91caff'}`
                                    }}>
                                        {todo.type === 'abnormal' ? '异常' : '任务'}
                                    </span>
                                    <span style={{ fontSize: '13px', color: '#333' }}>{todo.title}</span>
                                </div>
                                <button className="small-btn outline" style={{ color: '#1890ff', borderColor: '#1890ff' }}>处理</button>
                            </div>
                        )) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#ccc' }}>
                                <i className="ri-task-line" style={{ fontSize: '32px', marginBottom: '10px', display: 'block' }}></i>
                                当前无待办事项
                            </div>
                        )}
                    </div>
                </div>

                {/* 右侧：趋势图 (保持原样，略做适配) */}
                <div className="dashboard-card" style={{ height: '100%', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px', display:'flex', flexDirection:'column' }}>
                    <div className="card-header-sm">
                        <span><i className="ri-bar-chart-box-line" style={{ color: '#1890ff', marginRight: '6px' }}></i> 生产趋势</span>
                    </div>
                    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc' }}>
                        (图表组件占位)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;