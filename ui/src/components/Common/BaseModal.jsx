import React from 'react';
import '../../styles/components.css'; // 确保样式加载

/**
 * 通用业务弹窗
 * @param {Boolean} visible - 是否显示
 * @param {String} title - 标题
 * @param {Function} onClose - 关闭回调
 * @param {Function} onOk - 确定回调
 * @param {String} width - 宽度 (e.g. '800px')
 * @param {ReactNode} children - 内容
 * @param {ReactNode} footer - 自定义底部，传 null 隐藏
 */
const BaseModal = ({ visible, title, onClose, onOk, width = '600px', children, footer }) => {
    if (!visible) return null;

    return (
        <div className="aip-global-overlay open" onClick={onClose}>
            <div
                className="aip-modal-container"
                style={{ width: width, height: 'auto', maxHeight: '90vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="aip-modal-header">
                    <div className="aip-modal-title">{title || '系统窗口'}</div>
                    <i className="ri-close-line icon-btn" onClick={onClose} style={{ fontSize: '24px' }}></i>
                </div>

                {/* Body */}
                <div className="aip-modal-body" style={{ padding: '20px' }}>
                    {children}
                </div>

                {/* Footer */}
                {footer !== null && (
                    <div style={{ padding: '15px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#fff' }}>
                        {footer ? footer : (
                            <>
                                <button className="btn outline" onClick={onClose}>取消</button>
                                <button className="btn btn-primary" onClick={onOk}>确定</button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BaseModal;