/**
 * @file: src/features/System/GlobalSearch.jsx
 * @version: v2.1.0 (Modal Config Demo)
 * @description: 全域搜索组件 - 更新演示数据以展示增强的 Modal 功能
 */
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNavigationHandler } from '../../hooks/useNavigationHandler.js'; // 引入 Hook
import DetailModal from '../../components/DetailModal.jsx'; // 引入 Modal

const GlobalSearch = ({ mode = 'page' , onClose }) => {
    const { navigate } = useContext(AppContext);
    const [query, setQuery] = useState('');

    // 使用 Hook
    const { handleJump, detailModalOpen, detailData, closeDetailModal } = useNavigationHandler();

    // --- 模拟数据 (带 jumpType 和 modal 配置) ---
    const allData = useMemo(() => {
        return [
            {
                id: 1, type: 'menu', jumpType: 'view',
                title: '生产报表 (View)', path: '/rpt/mes/prod',
                desc: '跳转内部视图，带面包屑返回'
            },
            {
                id: 2, type: 'data', jumpType: 'modal',
                title: 'LOT-2026-001 (Modal 标准)', path: '/mes/lot/1',
                desc: '点击弹出标准详情模态框，支持最大化',
                modalTitle: '批次详细信息预览' // 自定义标题
            },
            {
                id: 3, type: 'doc', jumpType: 'modal',
                title: '简易通知 (Modal 小窗口)', path: '#',
                desc: '固定大小的小窗口，禁止最大化',
                width: '400px', height: '300px', canMaximize: false, modalTitle: '系统通知'
            },
            {
                id: 4, type: 'web', jumpType: 'iframe',
                title: '百度搜索 (Iframe)', path: 'https://www.bing.com',
                desc: '内部 Iframe 嵌入显示'
            },
            {
                id: 5, type: 'doc', jumpType: 'blank',
                title: '用户手册 PDF (Blank)', path: 'https://example.com/manual.pdf',
                desc: '新标签页打开外部链接'
            },
            // ... 更多数据
            ...Array.from({length: 15}).map((_, i) => ({
                id: 10+i, type: 'menu', jumpType: 'view', title: `模拟结果 #${10+i}`, path: `/mock/${i}`, desc: '默认跳转视图'
            }))
        ];
    }, []);

    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = mode === 'modal' ? 5 : 10;

    useEffect(() => {
        if (!query && mode === 'page') setFilteredData(allData);
        else if (!query && mode === 'modal') setFilteredData([]);
        else {
            const lowerQ = query.toLowerCase();
            setFilteredData(allData.filter(item =>
                item.title.toLowerCase().includes(lowerQ) ||
                item.desc.toLowerCase().includes(lowerQ)
            ));
        }
        setCurrentPage(1);
    }, [query, allData, mode]);

    const currentList = useMemo(() => {
        if (mode === 'modal') return filteredData.slice(0, pageSize);
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize, mode]);

    const totalPages = Math.ceil(filteredData.length / pageSize);

    // 跳转处理
    const handleMaximize = () => {
        navigate('/system/search');
        if (onClose) onClose(); // 关键：关闭外部蒙层
    };

    const onItemClick = (item) => {
        handleJump(item);
        // 如果是跳转视图类型，也应该关闭蒙层
        if (['view', 'iframe'].includes(item.jumpType) && onClose) {
            onClose();
        }
    };

    return (
        <div className={`global-search-container ${mode}`} style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
            {/* Header */}
            <div className="search-header" style={{ padding: '15px 20px', borderBottom: '1px solid #eee', background: '#fff', flexShrink: 0 }}>
                <div style={{ width: '100%', margin: '0 auto' }}>
                    <div style={{ position: 'relative' }}>
                        <i className="ri-search-2-line" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#999' }}></i>
                        <input
                            type="text" placeholder="搜索 (试搜: modal, view)..."
                            value={query} onChange={e => setQuery(e.target.value)} autoFocus={mode === 'modal'}
                            style={{ width: '100%', padding: '8px 12px 8px 38px', fontSize: '14px', border: '1px solid #d9d9d9', borderRadius: '6px', outline: 'none', background: '#f9f9f9', transition: 'all 0.2s' }}
                            className="hover-border-blue"
                        />
                    </div>
                    {mode === 'page' && (
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                            {['生产', '设备', 'modal', 'iframe'].map(tag => (
                                <span key={tag} className="tag" style={{ background: '#f5f5f5', color: '#666', cursor: 'pointer', padding: '2px 10px', fontSize: '12px', borderRadius: '12px' }} onClick={() => setQuery(tag)}>{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="search-body" style={{ flex: 1, overflowY: 'auto', background: '#fff', padding: mode === 'page' ? '20px' : '0' }}>
                <div style={{ width: '100%', maxWidth: mode === 'page' ? '100%' : '100%', margin: '0 auto' }}>
                    {currentList.length > 0 ? (
                        <div className="result-list">
                            {currentList.map(item => (
                                <div key={item.id} onClick={() => onItemClick(item)} className="search-result-item" style={{
                                    padding: '12px 20px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    transition: 'background 0.2s', gap: '12px'
                                }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                                        background: item.type === 'menu' ? '#e6f7ff' : item.type === 'data' ? '#f6ffed' : '#fff7e6',
                                        color: item.type === 'menu' ? '#1890ff' : item.type === 'data' ? '#52c41a' : '#faad14',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                                    }}>
                                        <i className={`ri-${item.type === 'menu' ? 'function' : item.type === 'data' ? 'database-2' : item.type==='web'?'global':'file-text'}-line`}></i>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: '500', fontSize: '14px', color: '#333', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.title}
                                            <span style={{fontSize:'10px', color:'#999', marginLeft:'8px', border:'1px solid #eee', padding:'0 4px', borderRadius:'2px'}}>
                                                {item.jumpType?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</div>
                                    </div>
                                    {mode === 'page' && <i className="ri-arrow-right-s-line" style={{ color: '#ccc', marginLeft: '10px' }}></i>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        query ? <div style={{textAlign:'center', padding:'40px', color:'#999'}}>无结果</div> : null
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="search-footer" style={{ borderTop: '1px solid #eee', padding: '10px 20px', background: '#fafafa', flexShrink: 0 }}>
                {mode === 'modal' ? (
                    <div onClick={handleMaximize} style={{textAlign:'center', cursor:'pointer', color:'#1890ff', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px'}}>
                        查看全部结果 ({filteredData.length}) <i className="ri-fullscreen-line"></i>
                    </div>
                ) : (
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#666'}}>
                        <span>共 {filteredData.length} 条</span>
                        <span>
                           <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn-page small" style={{marginRight:'5px'}}>上一页</button>
                            {currentPage} / {totalPages||1}
                            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="btn-page small" style={{marginLeft:'5px'}}>下一页</button>
                       </span>
                    </div>
                )}
            </div>

            {/* 渲染详情模态框 (Portal) */}
            <DetailModal
                isOpen={detailModalOpen}
                onClose={closeDetailModal}
                data={detailData}
            />

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