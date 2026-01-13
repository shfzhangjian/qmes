/**
 * @file: src/features/System/IframeView.jsx
 * @description: Iframe 容器组件，用于嵌入外部 URL
 */
import React, { useEffect, useState } from 'react';

const IframeView = () => {
    // 实际项目中，URL 应该通过 URL 参数传递，例如 /system/iframe?src=encodedUrl
    // 由于我们使用的是简单的 hash 路由，这里模拟从 hash 或 localStorage 获取参数
    // 或者可以约定一个全局变量传递

    // 简易实现：假设 URL 固定演示，或通过 window.iframeTargetUrl 获取
    const url = window.iframeTargetUrl || 'https://www.bing.com';
    const [loading, setLoading] = useState(true);

    return (
        <div className="content-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 15px', borderBottom: '1px solid #eee', background: '#f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#999' }}>外部资源: {url}</span>
                <a href={url} target="_blank" rel="noreferrer" className="small-btn outline"><i className="ri-external-link-line"></i> 新窗口打开</a>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
                {loading && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', zIndex: 1 }}>
                        <i className="ri-loader-4-line spin" style={{ fontSize: '24px', color: '#1890ff' }}></i>
                    </div>
                )}
                <iframe
                    src={url}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    onLoad={() => setLoading(false)}
                    title="Embedded View"
                />
            </div>
        </div>
    );
};

export default IframeView;