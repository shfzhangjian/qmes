/**
 * @file: src/features/Dashboard/Dashboard.jsx
 * @version: v2.3.0 (Cleaned)
 * @description: 禾臣新材料专属工作台 - 移除内嵌列表，链接至独立任务中心
 * @createDate: 2026-01-12
 * @lastModified: 2026-01-13
 */

import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

// --- 简版模拟数据 (仅用于 Dashboard 预览) ---
const getDashboardTodos = () => {
    return [
        { tag: '审批', type: 'blue', text: 'HC-Film-T92 新产品试产方案审批', time: '09:00' },
        { tag: '点检', type: 'orange', text: '涂布头精密清洗与点检 (每班)', time: '10:30' },
        { tag: '异常', type: 'red', text: '分切机 #2 张力波动报警处理', time: '11:15' },
        { tag: '保养', type: 'blue', text: 'RTO 蓄热体定期清理保养计划', time: '13:00' },
        { tag: '会议', type: 'blue', text: 'MRB 委员会材料评审会议 (会议室3)', time: '14:30' },
        { tag: '培训', type: 'orange', text: '新入职操作工安全规范培训', time: '15:00' },
        { tag: '审核', type: 'blue', text: 'Q4 季度供应商绩效考核表审核', time: '16:00' },
        { tag: '异常', type: 'red', text: '纯水系统电导率异常告警', time: '16:20' }
    ];
};

const Dashboard = () => {
    const { currentUser, navigate } = useContext(AppContext);

    // 获取简版待办数据
    const simpleTodoList = getDashboardTodos();

    // 根据禾臣新材料的业务场景定制角色视图
    const getRoleConfig = (role) => {
        const configs = {
            'ADM': {
                title: '数字化工厂全景概览',
                stats: [
                    { label: '在线终端', value: '128', unit: '台' },
                    { label: '接口 QPS', value: '450', unit: '次/秒' },
                    { label: '数据湖存储', value: '8.2', unit: 'TB' }
                ],
                shortcuts: ['系统配置', '权限管理', '审计日志', '数据字典']
            },
            'OP': {
                title: 'No.3 精密涂布线工作台',
                stats: [
                    { label: '当前涂布速度', value: '45.2', unit: 'm/min', status: 'normal' },
                    { label: '烘箱区温度', value: '120.5', unit: '°C', status: 'normal' },
                    { label: '膜厚在线检测', value: '25.0±0.2', unit: 'µm', status: 'success' }
                ],
                shortcuts: ['投料扫描', '换卷记录', '首检录入', '异常停机', '粘度记录']
            },
            'EQ': {
                title: '设备与能源监控中心',
                stats: [
                    { label: 'RTO 焚烧温', value: '850', unit: '°C', status: 'normal' },
                    { label: '待处理工单', value: '2', unit: '个', status: 'warning' },
                    { label: '备件库存预警', value: '3', unit: '项', status: 'error' }
                ],
                shortcuts: ['维修接单', '润滑保养', '备件领用', '分切刀模检查']
            },
            'MGR': {
                title: '洁净车间驾驶舱 (Class 1000)',
                stats: [
                    { label: '光学膜直通率', value: '98.5%', unit: '', status: 'success' },
                    { label: '溶剂回收率', value: '95.2%', unit: '', status: 'normal' },
                    { label: 'CMP垫产量', value: '320', unit: '片', status: 'normal' }
                ],
                shortcuts: ['生产日报', '成本分析', '良率柏拉图', '环境监测(EMS)']
            },
            'QC': {
                title: '实验室质检工作台',
                stats: [
                    { label: '待检批次', value: '5', unit: '批', status: 'warning' },
                    { label: '光学雾度(Haze)', value: '0.8%', unit: '', status: 'normal' },
                    { label: '剥离力测试', value: 'Pass', unit: '', status: 'success' }
                ],
                shortcuts: ['IQC来料', 'FQC终检', 'COA打印', '留样管理']
            }
        };
        return configs[role] || configs['ADM'];
    };

    const conf = getRoleConfig(currentUser?.role || 'ADM');

    const getStatusColor = (status) => {
        if (status === 'success') return '#52c41a';
        if (status === 'warning') return '#faad14';
        if (status === 'error') return '#ff4d4f';
        return '#1890FF';
    };

    return (
        <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* AI 晨报卡片 */}
            <div className="aip-summary-card" style={{ flexShrink: 0 }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        早安，{currentUser?.name}
                        <span className="tag" style={{ background: '#e6f7ff', color: '#1890ff', fontWeight: 'normal' }}>
                            {currentUser?.role === 'OP' ? '早班' : '在岗'}
                        </span>
                    </h2>
                    <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                        {currentUser?.role === 'OP' ? (
                            <>系统检测到 <strong>HC-OCA-2026 光学胶</strong> 批次即将生产。AI 建议重点关注 <strong>微凹辊涂布头</strong> 清洁度，防止产生晶点缺陷。</>
                        ) : currentUser?.role === 'MGR' ? (
                            <>昨日 <strong>CMP 抛光垫车间</strong> 产出创本月新高。今日重点关注 <strong>RTO 废气处理系统</strong> 的各塔压差波动。</>
                        ) : (
                            <>系统运行平稳。今日计划生产 <strong>32 批次</strong>，洁净室环境指标（温湿度/压差/尘埃粒子）均在管控范围内。</>
                        )}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        {conf.shortcuts.map(s => <button key={s} className="small-btn outline">{s}</button>)}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    {conf.stats.map((stat, i) => (
                        <div key={i} className="stat-box">
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>{stat.label}</div>
                            <div className="value" style={{ color: getStatusColor(stat.status) }}>
                                {stat.value}<span style={{ fontSize: '12px', marginLeft: '2px', color: '#666' }}>{stat.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dashboard-grid" style={{ flex: 1, minHeight: 0 }}>

                {/* 待办事项卡片 - 增加跳转 */}
                <div className="dashboard-card" style={{ height: '100%' }}>
                    <div className="card-header-sm" style={{ flexShrink: 0 }}>
                        <span><i className="ri-list-check"></i> 待办事项 / 异常跟进</span>
                        <span
                            style={{ fontSize: '12px', color: '#1890FF', cursor: 'pointer', display:'flex', alignItems:'center', gap:'2px' }}
                            onClick={() => navigate('我的任务')}
                            title="跳转到流程中心-我的任务"
                        >
                            更多 <i className="ri-arrow-right-s-line"></i>
                        </span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
                        {simpleTodoList.map((task, i) => (
                            <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="tag" style={{
                                        background: task.type === 'red' ? '#fff1f0' : task.type === 'orange' ? '#fff7e6' : '#e6f7ff',
                                        color: task.type === 'red' ? '#ff4d4f' : task.type === 'orange' ? '#faad14' : '#1890ff',
                                        flexShrink: 0
                                    }}>
                                        {task.tag}
                                    </span>
                                    <span style={{ fontSize: '13px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }} title={task.text}>{task.text}</span>
                                </div>
                                <span style={{ fontSize: '12px', color: '#999', flexShrink: 0 }}>{task.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 生产趋势图 */}
                <div className="dashboard-card" style={{ height: '100%' }}>
                    <div className="card-header-sm" style={{ flexShrink: 0 }}>
                        <span><i className="ri-bar-chart-fill"></i> 产能与良率趋势 (近5日)</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '15px', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100%', paddingBottom: '10px' }}>
                            {[
                                { day: '周一', val: 65, rate: 98 },
                                { day: '周二', val: 80, rate: 97 },
                                { day: '周三', val: 45, rate: 99 },
                                { day: '周四', val: 90, rate: 98 },
                                { day: '今天', val: 75, rate: 98.5 }
                            ].map((d, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: 1 }}>
                                    <div style={{ fontSize: '12px', color: '#1890ff', fontWeight: 'bold' }}>{d.rate}%</div>
                                    <div style={{ width: '40%', background: 'linear-gradient(to top, #1890FF, #69c0ff)', height: `${d.val}%`, borderRadius: '4px 4px 0 0', opacity: 0.9 }}></div>
                                    <div style={{ fontSize: '12px', color: '#999' }}>{d.day}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '5px', flexShrink: 0 }}>
                            <span style={{ marginRight: '15px' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#1890ff', borderRadius: '50%' }}></span> 涂布米数 (km)</span>
                            <span>良率 (Yield)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;