/**
 * @file: src/features/TaskCenter/TaskCenter.jsx
 * @version: v1.0.0
 * @description: 独立任务中心组件，提供完整的任务管理视图
 * @createDate: 2026-01-13
 */

import React, { useState, useMemo, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

// --- 模拟数据 (完整版) ---
const generateMockTasks = () => {
    const types = ['审批', '点检', '异常', '保养', '会议', '培训', '审核'];
    const statuses = ['待办', '进行中', '已完成'];
    const tasks = [];
    // 生成更多数据以演示分页
    for (let i = 1; i <= 65; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        tasks.push({
            id: `TASK-2026-${String(i).padStart(3, '0')}`,
            tag: type,
            type: type === '异常' ? 'red' : type === '点检' || type === '培训' ? 'orange' : 'blue',
            text: `${type === '审批' ? 'HC-Film' : type === '异常' ? '设备报警' : '日常任务'} - 模拟任务事项描述 #${i}`,
            time: '2026-01-13 10:00',
            status: status,
            priority: type === '异常' ? '高' : '中'
        });
    }
    // 插入演示置顶数据
    tasks.unshift(
        { id: 'TASK-TOP-01', tag: '审批', type: 'blue', text: 'HC-Film-T92 新产品试产方案审批', time: '09:00', status: '待办', priority: '高' },
        { id: 'TASK-TOP-02', tag: '异常', type: 'red', text: '分切机 #2 张力波动报警处理', time: '11:15', status: '待办', priority: '紧急' },
        { id: 'TASK-TOP-03', tag: '会议', type: 'blue', text: 'MRB 委员会材料评审会议 (会议室3)', time: '14:30', status: '进行中', priority: '中' }
    );
    return tasks;
};

const ALL_TASKS = generateMockTasks();

const TaskCenter = () => {
    const { navigate } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState('全部');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // 每页显示10条

    // 过滤逻辑
    const filteredTasks = useMemo(() => {
        return ALL_TASKS.filter(task => {
            const matchStatus = activeTab === '全部' || task.status === activeTab;
            const matchSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase()) || task.id.toLowerCase().includes(searchQuery.toLowerCase());
            return matchStatus && matchSearch;
        });
    }, [activeTab, searchQuery]);

    // 分页逻辑
    const totalPages = Math.ceil(filteredTasks.length / pageSize);
    const currentTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="task-center-container fade-in" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>

            {/* 顶部面包屑与标题 */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                        <span onClick={() => navigate('Dashboard')} style={{ cursor: 'pointer', color:'#666' }}>首页</span> / 流程中心 / 我的任务
                    </div>
                    <h2 style={{ fontSize: '24px', margin: 0, fontWeight: 'bold', color: '#333' }}>任务管理中心</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn outline" onClick={() => window.print()}><i className="ri-printer-line"></i> 打印清单</button>
                    <button className="btn btn-primary"><i className="ri-add-line"></i> 发起新流程</button>
                </div>
            </div>

            {/* 筛选工具栏 */}
            <div className="task-toolbar" style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div className="status-tabs" style={{ display: 'flex', gap: '5px' }}>
                    {['全部', '待办', '进行中', '已完成'].map(tab => (
                        <div
                            key={tab}
                            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                            style={{
                                padding: '6px 20px', cursor: 'pointer', fontSize: '14px', borderRadius: '20px',
                                background: activeTab === tab ? '#e6f7ff' : '#f5f5f5',
                                color: activeTab === tab ? '#1890ff' : '#666',
                                fontWeight: activeTab === tab ? 'bold' : 'normal',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>
                <div className="search-box" style={{ position: 'relative', width: '300px' }}>
                    <i className="ri-search-line" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}></i>
                    <input
                        type="text"
                        placeholder="输入任务号、内容或标签关键词..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #d9d9d9', borderRadius: '6px', outline: 'none', fontSize: '14px' }}
                    />
                </div>
            </div>

            {/* 任务列表主体 */}
            <div style={{ flex: 1, background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* 表头 */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px 100px 140px 100px', padding: '15px 20px', background: '#fafafa', borderBottom: '1px solid #eee', color: '#999', fontSize: '13px', fontWeight: 'bold' }}>
                    <div>任务编号</div>
                    <div>任务内容摘要</div>
                    <div>优先级</div>
                    <div>当前状态</div>
                    <div>截止/创建时间</div>
                    <div style={{ textAlign: 'center' }}>操作</div>
                </div>

                {/* 列表内容 */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {currentTasks.length > 0 ? (
                        currentTasks.map(task => (
                            <div key={task.id} className="task-row" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px 100px 140px 100px', padding: '15px 20px', borderBottom: '1px solid #f9f9f9', alignItems: 'center', fontSize: '14px', transition: 'background 0.2s' }}>
                                <div style={{ fontFamily: 'monospace', color: '#666', fontWeight: 'bold' }}>{task.id.split('-').slice(1).join('-')}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className="tag" style={{
                                        fontSize: '12px', padding: '2px 8px', borderRadius: '4px',
                                        background: task.type === 'red' ? '#fff1f0' : task.type === 'orange' ? '#fff7e6' : '#e6f7ff',
                                        color: task.type === 'red' ? '#ff4d4f' : task.type === 'orange' ? '#faad14' : '#1890ff',
                                        border: `1px solid ${task.type === 'red' ? '#ffa39e' : task.type === 'orange' ? '#ffe58f' : '#91caff'}`
                                    }}>{task.tag}</span>
                                    <span style={{ color: '#333', fontWeight: '500' }}>{task.text.split('-').pop().trim()}</span>
                                </div>
                                <div>
                                    <span style={{
                                        color: task.priority === '紧急' ? '#ff4d4f' : task.priority === '高' ? '#faad14' : '#52c41a',
                                        fontWeight: task.priority === '紧急' ? 'bold' : 'normal'
                                    }}>{task.priority}</span>
                                </div>
                                <div>
                                    <span style={{
                                        display: 'inline-block', padding: '4px 8px', borderRadius: '12px', fontSize: '12px',
                                        background: task.status === '待办' ? '#fff7e6' : task.status === '进行中' ? '#e6f7ff' : '#f6ffed',
                                        color: task.status === '待办' ? '#faad14' : task.status === '进行中' ? '#1890ff' : '#52c41a'
                                    }}>
                                        {task.status}
                                    </span>
                                </div>
                                <div style={{ color: '#999', fontSize: '13px' }}>{task.time}</div>
                                <div style={{ textAlign: 'center' }}>
                                    <button style={{ border: 'none', background: 'transparent', color: '#1890ff', cursor: 'pointer', fontWeight: 'bold' }}>办理</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#ccc' }}>
                            <i className="ri-file-search-line" style={{ fontSize: '48px', marginBottom: '15px', display: 'block' }}></i>
                            暂无符合条件的任务数据
                        </div>
                    )}
                </div>

                {/* 分页 Footer */}
                <div style={{ padding: '15px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                        显示第 {filteredTasks.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} 到 {Math.min(currentPage * pageSize, filteredTasks.length)} 条，共 {filteredTasks.length} 条
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn-page" style={{ padding: '6px 12px', border: '1px solid #d9d9d9', background: '#fff', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.6 : 1 }}>上一页</button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                style={{
                                    width: '32px', height: '32px', border: activeTab === i + 1 ? 'none' : '1px solid #d9d9d9',
                                    background: currentPage === i + 1 ? '#1890ff' : '#fff',
                                    color: currentPage === i + 1 ? '#fff' : '#666',
                                    borderRadius: '4px', cursor: 'pointer'
                                }}
                            >{i + 1}</button>
                        )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                        {/* 简易的分页逻辑，仅展示部分页码 */}
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="btn-page" style={{ padding: '6px 12px', border: '1px solid #d9d9d9', background: '#fff', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.6 : 1 }}>下一页</button>
                    </div>
                </div>
            </div>

            <style>{`
                .task-row:hover { background: #f0f7ff !important; }
                .fade-in { animation: fadeIn 0.4s ease-out; }
            `}</style>
        </div>
    );
};

export default TaskCenter;