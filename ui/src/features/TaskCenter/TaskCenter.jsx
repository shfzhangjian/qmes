/**
 * @file: src/features/TaskCenter/TaskCenter.jsx
 * @version: v2.0.0 (Connected)
 * @description: 任务中心 - 已对接 Mock Backend 数据
 * 修改点：
 * 1. 移除内部 mock 数据，改用 SimulationContext.todos。
 * 2. 对接 openTodoDetail 实现点击查看详情。
 * 3. 保持原有 Flex 布局和样式类名不变。
 */

import React, { useState, useMemo, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { SimulationContext } from '../../context/SimulationContext';

const TaskCenter = () => {
    // 引入全局 Context
    const { todos, openTodoDetail, refreshTodos, loading } = useContext(SimulationContext);

    const [activeTab, setActiveTab] = useState('全部');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // 确保进入页面时数据是最新的
    useEffect(() => {
        refreshTodos();
    }, []);

    // 过滤逻辑 (基于 Context 中的 todos)
    const filteredTasks = useMemo(() => {
        return todos.filter(task => {
            const matchStatus = activeTab === '全部' ||
                (activeTab === '待办' && task.status !== '已完成') ||
                (activeTab === '已完成' && task.status === '已完成');

            const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.id.toLowerCase().includes(searchQuery.toLowerCase());

            return matchStatus && matchSearch;
        });
    }, [todos, activeTab, searchQuery]);

    // 分页计算
    const totalPages = Math.ceil(filteredTasks.length / pageSize);
    const currentTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="task-center-container fade-in" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>

            {/* ... (顶部 Header 保持不变) ... */}
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                    <h2 style={{ fontSize: '20px', margin: 0, fontWeight: 'bold', color: '#333' }}>任务管理中心</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn outline" onClick={() => refreshTodos()}><i className={`ri-refresh-line ${loading?'spin':''}`}></i> 刷新</button>
                    <button className="btn btn-primary"><i className="ri-add-line"></i> 发起新流程</button>
                </div>
            </div>

            {/* ... (Filter Toolbar 保持不变) ... */}
            <div className="task-toolbar" style={{ background: '#fff', padding: '12px 15px', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                <div className="status-tabs" style={{ display: 'flex', gap: '5px' }}>
                    {['全部', '待办', '进行中', '已完成'].map(tab => (
                        <div
                            key={tab}
                            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                            style={{
                                padding: '5px 16px', cursor: 'pointer', fontSize: '13px', borderRadius: '4px',
                                background: activeTab === tab ? '#e6f7ff' : 'transparent',
                                color: activeTab === tab ? '#1890ff' : '#666',
                                fontWeight: activeTab === tab ? '600' : 'normal',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>
                <div className="search-box" style={{ position: 'relative', width: '260px' }}>
                    <i className="ri-search-line" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}></i>
                    <input
                        type="text"
                        placeholder="搜索任务..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        style={{ width: '100%', padding: '8px 10px 8px 32px', border: '1px solid #d9d9d9', borderRadius: '4px', outline: 'none', fontSize: '13px' }}
                    />
                </div>
            </div>

            {/* 任务列表主体 */}
            <div style={{ flex: 1, background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

                {/* 表头 (保持不变) */}
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 100px 100px 140px 100px', padding: '12px 20px', background: '#fafafa', borderBottom: '1px solid #eee', color: '#999', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>
                    <div>任务编号</div>
                    <div>任务内容摘要</div>
                    <div>优先级</div>
                    <div>当前状态</div>
                    <div>发起时间</div>
                    <div style={{ textAlign: 'center' }}>操作</div>
                </div>

                {/* 列表内容 */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{padding:'40px', textAlign:'center', color:'#999'}}>加载中...</div>
                    ) : currentTasks.length > 0 ? (
                        currentTasks.map(task => (
                            <div key={task.id} className="task-row" style={{ display: 'grid', gridTemplateColumns: '140px 1fr 100px 100px 140px 100px', padding: '12px 20px', borderBottom: '1px solid #f9f9f9', alignItems: 'center', fontSize: '13px', transition: 'background 0.2s' }}>
                                <div style={{ fontFamily: 'monospace', color: '#666', fontWeight: 'bold' }}>{task.id}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                    <span className="tag" style={{
                                        fontSize: '11px', padding: '1px 6px', borderRadius: '3px', flexShrink: 0,
                                        background: `${task.type === 'red' ? '#fff1f0' : task.type === 'orange' ? '#fff7e6' : '#e6f7ff'}`,
                                        color: `${task.type === 'red' ? '#ff4d4f' : task.type === 'orange' ? '#faad14' : '#1890ff'}`,
                                        border: `1px solid ${task.type === 'red' ? '#ffa39e' : task.type === 'orange' ? '#ffe58f' : '#91caff'}`
                                    }}>{task.tag}</span>
                                    <span style={{ color: '#333', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={task.title}>{task.title}</span>
                                </div>
                                <div>
                                    <span style={{
                                        color: task.priority === '紧急' ? '#ff4d4f' : task.priority === '高' ? '#faad14' : '#52c41a',
                                        fontWeight: ['紧急','高'].includes(task.priority) ? 'bold' : 'normal'
                                    }}>{task.priority}</span>
                                </div>
                                <div>
                                    <span style={{
                                        display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '11px',
                                        background: task.status === '待办' ? '#fff7e6' : '#f6ffed',
                                        color: task.status === '待办' ? '#faad14' : '#52c41a'
                                    }}>
                                        {task.status}
                                    </span>
                                </div>
                                <div style={{ color: '#999', fontSize: '12px' }}>{task.time}</div>
                                <div style={{ textAlign: 'center' }}>
                                    {/* 关键修改：点击触发 openTodoDetail */}
                                    <button
                                        onClick={() => openTodoDetail(task)}
                                        style={{ border: 'none', background: 'transparent', color: '#1890ff', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                                    >
                                        {task.status === '待办' ? '办理' : '查看'}
                                    </button>
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

                {/* ... (Footer 分页保持不变) ... */}
                <div style={{ padding: '10px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', flexShrink: 0 }}>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                        共 {filteredTasks.length} 条
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn-page" style={{ padding: '4px 10px', border: '1px solid #eee', background: '#fff', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>上一页</button>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="btn-page" style={{ padding: '4px 10px', border: '1px solid #eee', background: '#fff', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '12px' }}>下一页</button>
                    </div>
                </div>
            </div>
            <style>{`
                .task-row:hover { background: #f5faff !important; }
                .fade-in { animation: fadeIn 0.3s ease-out; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default TaskCenter;