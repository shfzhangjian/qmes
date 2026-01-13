/**
 * @file: src/features/System/NotificationCenter.jsx
 * @version: v1.3.0 (Full Width Fix)
 * @description: 消息通知中心 - Page 模式下移除宽度限制，实现全屏铺满
 */
import React, { useState, useMemo, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const NotificationCenter = ({ mode = 'page' , onClose }) => {
    const { navigate } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState('all'); // all, unread, read
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // --- 模拟大量消息 ---
    const allMessages = useMemo(() => {
        const base = [
            { id: 1, type: 'error', title: '数据采集异常', time: '10分钟前', status: 'unread', content: '传感器数据中断，持续时间超过 5 分钟...' },
            { id: 2, type: 'warning', title: '月度能耗指标即将超出预定阈值', time: '30分钟前', status: 'unread', content: '当前电耗已达月度计划的 92%...' },
            { id: 3, type: 'success', title: '设备年度检修计划已审批通过', time: '昨天 16:30', status: 'read', content: '您的《2026年度 ZJ17 检修计划》已通过...' },
            { id: 4, type: 'info', title: '系统版本更新公告 v3.0', time: '前天 08:00', status: 'read', content: '系统将于本周五晚进行不停机更新...' },
            { id: 5, type: 'info', title: '关于五一假期安全生产的通知', time: '3天前', status: 'read', content: '请各部门做好节前安全检查...' },
        ];
        // 生成更多
        for(let i=6; i<=35; i++) {
            base.push({
                id: i,
                type: ['info','warning','success'][i%3],
                title: `模拟系统通知消息 #${i}`,
                time: `${i}天前`,
                status: i%4===0 ? 'unread' : 'read',
                content: '这是一条用于演示分页功能的模拟消息内容，请忽略具体文本...'
            });
        }
        return base;
    }, []);

    const pageSize = mode === 'modal' ? 5 : 10;

    // 过滤逻辑
    const filteredList = useMemo(() => {
        return allMessages.filter(m => {
            const matchTab = activeTab === 'all' || (activeTab === 'unread' ? m.status === 'unread' : m.status === 'read');
            const matchSearch = m.title.includes(search) || m.content.includes(search);
            return matchTab && matchSearch;
        });
    }, [activeTab, search, allMessages]);

    // 分页切片
    const currentList = useMemo(() => {
        if (mode === 'modal') return filteredList.slice(0, pageSize);
        const start = (currentPage - 1) * pageSize;
        return filteredList.slice(start, start + pageSize);
    }, [filteredList, currentPage, pageSize, mode]);

    const totalPages = Math.ceil(filteredList.length / pageSize);

    // 跳转处理
    const handleMaximize = () => {
        navigate('/msg/list');
        if (onClose) onClose(); // 关键：关闭外部蒙层
    };

    return (
        <div className={`notification-container ${mode}`} style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
            {/* 顶部工具栏 */}
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', background: '#fff', flexShrink: 0 }}>
                {/* 移除 maxWidth 限制，使其铺满 */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '20px', fontWeight: '600', fontSize: '14px' }}>
                        {['all', 'unread', 'read'].map(tab => (
                            <span
                                key={tab}
                                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                                style={{
                                    cursor: 'pointer',
                                    color: activeTab === tab ? '#1890ff' : '#666',
                                    borderBottom: activeTab === tab ? '2px solid #1890ff' : '2px solid transparent',
                                    paddingBottom: '4px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab === 'all' ? '全部' : tab === 'unread' ? '未读' : '已读'}
                            </span>
                        ))}
                    </div>
                    {/* 搜索框 */}
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="搜索..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                            style={{
                                padding: '6px 10px 6px 28px', borderRadius: '15px', border: '1px solid #eee',
                                fontSize: '12px', outline: 'none', width: mode==='modal' ? '120px' : '240px', background:'#f9f9f9',
                                transition: 'width 0.2s'
                            }}
                            className="search-input"
                        />
                        <i className="ri-search-line" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize:'12px' }}></i>
                    </div>
                </div>
            </div>

            {/* 消息列表主体 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0', background: '#fff' }}>
                {/* 移除 maxWidth 限制 */}
                <div style={{ width: '100%' }}>
                    {currentList.map(m => (
                        <div key={m.id} className="msg-item" style={{
                            padding: '12px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: '12px',
                            background: m.status === 'unread' ? '#fff' : '#fafafa', cursor: 'pointer', transition: 'background 0.2s',
                            alignItems: 'flex-start'
                        }}>
                            {/* 图标容器 */}
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px',
                                background: m.type === 'error' ? '#ff4d4f' : m.type === 'warning' ? '#faad14' : m.type === 'success' ? '#52c41a' : '#1890ff'
                            }}>
                                <i className={`ri-${m.type === 'error' ? 'alert' : m.type === 'warning' ? 'alarm-warning' : m.type === 'success' ? 'checkbox-circle' : 'notification-3'}-line`}></i>
                            </div>

                            {/* 内容容器 */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: m.status === 'unread' ? '600' : '500', color: '#333', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 'calc(100% - 80px)' }}>{m.title}</span>
                                    <span style={{ fontSize: '12px', color: '#999', flexShrink: 0 }}>{m.time}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {m.content}
                                </div>
                            </div>

                            {/* 未读红点 */}
                            {m.status === 'unread' && (
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'red', marginTop: '6px', flexShrink: 0 }}></div>
                            )}
                        </div>
                    ))}
                    {filteredList.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#ccc', fontSize: '13px' }}>暂无消息</div>}
                </div>
            </div>

            {/* 底部区域 */}
            <div className="notification-footer" style={{ borderTop: '1px solid #eee', padding: '10px 20px', background: '#fafafa', flexShrink: 0 }}>
                {/* 移除 maxWidth 限制 */}
                <div style={{ width: '100%' }}>
                    {mode === 'page' ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#999' }}>共 {filteredList.length} 条消息</div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn-page small">上一页</button>
                                <span style={{ fontSize: '12px', lineHeight: '24px', padding: '0 8px' }}>{currentPage} / {totalPages || 1}</span>
                                <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="btn-page small">下一页</button>
                            </div>
                        </div>
                    ) : (
                        // Modal 模式底部
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#999', cursor: 'pointer' }}>全部已读</span>
                            <div
                                onClick={handleMaximize}
                                style={{ color: '#1890ff', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                进入消息中心 <i className="ri-fullscreen-line"></i>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .msg-item:hover { background: #f0f7ff !important; }
                .search-input:focus { width: ${mode==='modal'?'140px':'240px'} !important; border-color: #1890ff !important; }
                .btn-page.small { padding: 2px 8px; font-size: 12px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; cursor: pointer; }
                .btn-page.small:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default NotificationCenter;