/**
 * @file: src/features/System/GlobalSearch.jsx
 * @description: 全域搜索组件 - Page 模式下移除宽度限制，实现全屏铺满
 */
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';

const GlobalSearch = ({ mode = 'page' }) => { // mode: 'page' | 'modal'
    const { navigate } = useContext(AppContext);
    const [query, setQuery] = useState('');

    // --- 模拟大量数据 (用于演示分页) ---
    const allData = useMemo(() => {
        const base = [
            { id: 1, type: 'menu', title: '生产报表', path: '/rpt/mes/prod', desc: '查询每日生产产出与良率' },
            { id: 2, type: 'menu', title: '设备台账', path: '/mes/base/equip', desc: '全厂设备资产管理' },
            { id: 3, type: 'data', title: 'LOT-20260101-001', path: '/mes/lot/search', desc: '批次追溯信息 - 在制' },
            { id: 4, type: 'doc', title: 'ZJ17 维修手册 v2.0', path: '/doc/view/1024', desc: '设备部内部文档' },
        ];
        // 生成更多模拟数据
        for(let i=5; i<=45; i++) {
            base.push({
                id: i,
                type: i%3===0 ? 'menu' : i%3===1 ? 'data' : 'doc',
                title: `模拟搜索结果项 #${i} - ${i%2===0?'生产计划':'质量异常'}`,
                path: `/mock/path/${i}`,
                desc: `这是第 ${i} 条模拟数据的详细描述信息...`
            });
        }
        return base;
    }, []);

    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    // 动态页大小
    const pageSize = mode === 'modal' ? 5 : 10;

    useEffect(() => {
        if (!query && mode === 'page') {
            setFilteredData(allData);
        } else if (!query && mode === 'modal') {
            setFilteredData([]);
        } else {
            const lowerQ = query.toLowerCase();
            const filtered = allData.filter(item =>
                item.title.toLowerCase().includes(lowerQ) ||
                item.desc.toLowerCase().includes(lowerQ)
            );
            setFilteredData(filtered);
        }
        setCurrentPage(1);
    }, [query, allData, mode]);

    // 分页切片
    const currentList = useMemo(() => {
        if (mode === 'modal') return filteredData.slice(0, pageSize);
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize, mode]);

    const totalPages = Math.ceil(filteredData.length / pageSize);

    const handleNavigate = (item) => {
        navigate(item.path);
    };

    const handleMaximize = () => {
        navigate('/system/search');
    };

    return (
        <div className={`global-search-container ${mode}`} style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
            {/* 顶部搜索栏 */}
            <div className="search-header" style={{ padding: '15px 20px', borderBottom: '1px solid #eee', background: '#fff', flexShrink: 0 }}>
                {/* 移除 maxWidth 限制 */}
                <div style={{ width: '100%', margin: '0 auto' }}>
                    <div style={{ position: 'relative' }}>
                        <i className="ri-search-2-line" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#999' }}></i>
                        <input
                            type="text"
                            placeholder="搜索菜单、批次号、文档..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoFocus={mode === 'modal'}
                            style={{
                                width: '100%', padding: '8px 12px 8px 38px', fontSize: '14px',
                                border: '1px solid #d9d9d9', borderRadius: '6px', outline: 'none',
                                background: '#f9f9f9', transition: 'all 0.2s'
                            }}
                            className="hover-border-blue"
                        />
                    </div>
                    {/* 仅在页面模式显示标签 */}
                    {mode === 'page' && (
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                            {['最近访问', '生产', '设备', '报表'].map(tag => (
                                <span key={tag} className="tag" style={{ background: '#f5f5f5', color: '#666', cursor: 'pointer', padding: '2px 10px', fontSize: '12px', borderRadius: '12px' }} onClick={() => setQuery(tag)}>{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 结果列表区 */}
            <div className="search-body" style={{ flex: 1, overflowY: 'auto', background: '#fff', padding: mode === 'page' ? '20px' : '0' }}>
                {/* 移除 maxWidth 限制 */}
                <div style={{ width: '100%' }}>
                    {currentList.length > 0 ? (
                        <div className="result-list">
                            {currentList.map(item => (
                                <div key={item.id} onClick={() => handleNavigate(item)} className="search-result-item" style={{
                                    padding: '12px 20px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    transition: 'background 0.2s', gap: '12px'
                                }}>
                                    {/* 图标容器 */}
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                                        background: item.type === 'menu' ? '#e6f7ff' : item.type === 'data' ? '#f6ffed' : '#fff7e6',
                                        color: item.type === 'menu' ? '#1890ff' : item.type === 'data' ? '#52c41a' : '#faad14',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                                    }}>
                                        <i className={`ri-${item.type === 'menu' ? 'function' : item.type === 'data' ? 'database-2' : 'file-text'}-line`}></i>
                                    </div>

                                    {/* 内容容器 */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: '500', fontSize: '14px', color: '#333', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                                        <div style={{ fontSize: '12px', color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</div>
                                    </div>

                                    {/* Page 模式下的箭头 */}
                                    {mode === 'page' && <i className="ri-arrow-right-s-line" style={{ color: '#ccc', marginLeft: '10px' }}></i>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        query ? (
                            <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                                <i className="ri-search-eye-line" style={{ fontSize: '32px', marginBottom: '8px', display: 'block', opacity: 0.5 }}></i>
                                未找到相关内容
                            </div>
                        ) : (
                            mode === 'page' ? null : <div style={{ textAlign: 'center', color: '#ccc', padding: '40px 0', fontSize: '12px' }}>输入关键词开始搜索...</div>
                        )
                    )}
                </div>
            </div>

            {/* 底部区域 */}
            <div className="search-footer" style={{ borderTop: '1px solid #eee', padding: '10px 20px', background: '#fafafa', flexShrink: 0 }}>
                {/* 移除 maxWidth 限制 */}
                <div style={{ width: '100%' }}>
                    {mode === 'page' ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#999' }}>共 {filteredData.length} 条结果</div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn-page small">上一页</button>
                                <span style={{ fontSize: '12px', lineHeight: '24px', padding: '0 8px' }}>{currentPage} / {totalPages || 1}</span>
                                <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="btn-page small">下一页</button>
                            </div>
                        </div>
                    ) : (
                        // Modal 模式底部
                        <div
                            onClick={handleMaximize}
                            style={{ textAlign: 'center', color: '#1890ff', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                            查看全部搜索结果 ({filteredData.length}) <i className="ri-fullscreen-line"></i>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .hover-border-blue:focus { border-color: #1890ff !important; box-shadow: 0 0 0 2px rgba(24,144,255,0.1); }
                .search-result-item:hover { background: #f0f7ff !important; }
                .btn-page.small { padding: 2px 8px; font-size: 12px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; cursor: pointer; }
                .btn-page.small:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default GlobalSearch;