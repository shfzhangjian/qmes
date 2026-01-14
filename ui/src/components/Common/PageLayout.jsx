import React from 'react';
import '../../styles/components.css';

/**
 * 页面标准布局容器
 * @param {ReactNode} searchForm - 顶部的搜索表单区域
 * @param {ReactNode} toolbar - 表格上方的工具栏（按钮区）
 * @param {ReactNode} children - 主体内容（通常是表格）
 * @param {ReactNode} footer - 底部（通常是分页，如果表格组件没带的话）
 */
const PageLayout = ({ searchForm, toolbar, children, footer, className = '' }) => {
    return (
        <div className={`q-page-container fade-in ${className}`}>
            {/* 1. 搜索区 (可选) */}
            {searchForm && (
                <div className="q-search-panel">
                    {searchForm}
                </div>
            )}

            {/* 2. 主体区 */}
            <div className="q-body-panel">
                {/* 工具栏 */}
                {toolbar && (
                    <div className="q-toolbar">
                        {toolbar}
                    </div>
                )}

                {/* 内容区 (表格) */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {children}
                </div>

                {/* 底部 (可选) */}
                {footer && (
                    <div className="q-footer" style={{ borderTop: '1px solid #eee' }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageLayout;