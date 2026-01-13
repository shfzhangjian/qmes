/**
 * @file: src/components/DetailModal.jsx
 * @version: v2.3.0 (Responsive Width)
 * @description: 通用详情模态框，最大化时标题栏采用 Banner 风格，并集成系统 Logo。最大化时内容宽度自适应铺满。
 */
import React, { useState, useEffect } from 'react';
import logoSvg from '../assets/logo.jpg'; // 引入 Logo

const DetailModal = ({ isOpen, onClose, data }) => {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsMaximized(false);
        }
    }, [isOpen]);

    if (!isOpen || !data) return null;

    const title = data.modalTitle || data.title || '详情预览';
    const initialWidth = data.width || '600px';
    const initialHeight = data.height || 'auto';
    const canMaximize = data.canMaximize !== false;

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    const modalStyle = isMaximized ? {
        width: '100vw',
        height: '100vh',
        maxWidth: '100%',
        maxHeight: '100%',
        borderRadius: 0,
        margin: 0
    } : {
        width: initialWidth,
        height: initialHeight,
        maxHeight: '85vh',
        borderRadius: '8px',
    };

    return (
        <div className="aip-global-overlay open" onClick={onClose}>
            <div
                className="aip-modal-container"
                onClick={e => e.stopPropagation()}
                style={{
                    ...modalStyle,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    overflow: 'hidden'
                }}
            >
                {/* Header: 最大化时显示 Banner 风格，普通模式显示简洁风格 */}
                <div className="aip-modal-header" style={{
                    flexShrink: 0,
                    padding: isMaximized ? '15px 30px' : '20px 30px',
                    background: '#fff',
                    borderBottom: '1px solid #eee'
                }}>
                    {isMaximized ? (
                        /* Banner 风格标题 */
                        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '36px', height: '36px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <img
                                    src={logoSvg}
                                    alt="Logo"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        if(e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                                {/* Fallback icon if image fails */}
                                <i className="ri-building-2-fill" style={{ fontSize: '24px', color: '#1890FF', display: 'none' }}></i>
                            </div>
                            <div className="brand-text-group" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="main-title" style={{ fontSize: '18px', fontWeight: '600', color: '#333', lineHeight: '1.2' }}>
                                    {title}
                                </div>
                                <div className="sub-title" style={{ fontSize: '11px', color: '#999', fontStyle: 'italic' }}>
                                    (智能助手辅助浏览)
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* 普通简洁标题 */
                        <div className="aip-modal-title" style={{ fontSize: '20px', fontWeight: 'bold' }}>{title}</div>
                    )}

                    {/* 操作按钮区 */}
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {canMaximize && (
                            <i
                                className={`icon-btn ri-${isMaximized ? 'fullscreen-exit-line' : 'fullscreen-line'}`}
                                onClick={toggleMaximize}
                                title={isMaximized ? "还原窗口" : "全屏查看"}
                                style={{ fontSize: '20px', cursor: 'pointer', color: '#666' }}
                            ></i>
                        )}
                        <i
                            className="ri-close-line icon-btn"
                            onClick={onClose}
                            title="关闭"
                            style={{ fontSize: '24px', cursor: 'pointer', color: '#666' }}
                        ></i>
                    </div>
                </div>

                {/* Body */}
                <div className="aip-modal-body" style={{ flex: 1, padding: '30px', overflowY: 'auto', background: '#fafafa' }}>
                    <div style={{
                        // 关键修改：最大化时宽度铺满 (100%)，普通模式下保持限制 (900px，虽然受限于弹窗宽度实际是 100%)
                        maxWidth: isMaximized ? '100%' : '900px',
                        margin: '0 auto',
                        background: '#fff',
                        padding: '30px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                        // 增加高度样式，使其在宽屏下视觉更饱满
                        minHeight: isMaximized ? 'calc(100vh - 160px)' : 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '24px' }}>{data.title}</h2>
                            <span className="tag" style={{ background: '#e6f7ff', color: '#1890ff', border: '1px solid #91caff', padding: '4px 8px' }}>
                                {data.type?.toUpperCase() || 'ITEM'}
                            </span>
                        </div>

                        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #eee' }}>
                            <p style={{ margin: 0, color: '#555', lineHeight: '1.8', fontSize: '14px' }}>
                                {data.desc || data.content || '暂无详细描述信息...'}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', fontSize: '14px', color: '#666', borderTop: '1px dashed #eee', paddingTop: '20px' }}>
                            <div><span style={{ color: '#999' }}>ID:</span> <span style={{ fontFamily: 'monospace' }}>{data.id}</span></div>
                            <div><span style={{ color: '#999' }}>Path:</span> {data.path}</div>
                            <div><span style={{ color: '#999' }}>Date:</span> 2026-01-13</div>
                            <div><span style={{ color: '#999' }}>Status:</span> <span style={{ color: '#52c41a' }}>Active</span></div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '15px 30px', borderTop: '1px solid #eee', textAlign: 'right', background: '#fff', flexShrink: 0 }}>
                    <button className="btn outline" onClick={onClose} style={{ marginRight: '10px' }}>关闭</button>
                    <button className="btn btn-primary" onClick={() => alert('点击了处理按钮')}>前往处理</button>
                </div>
            </div>
        </div>
    );
};

export default DetailModal;