/**
 * @file: src/features/System/Construction.jsx
 * @description: 通用的 404 / 建设中页面
 * 当路由匹配但组件未注册，或路径不存在时显示
 */
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const Construction = () => {
    const { activePage, activePath, toggleAIPanel } = useContext(AppContext);

    return (
        <div className="content-card">
            <div className="card-header-sm">
                <span>系统提示</span>
                <button className="small-btn outline" onClick={() => toggleAIPanel(true)}>
                    <i className="ri-robot-line"></i> 询问 AI 助手
                </button>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', flexDirection: 'column' }}>
                <div style={{
                    width: '120px', height: '120px', background: '#f5f5f5', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
                }}>
                    <i className="ri-hammer-line" style={{ fontSize: '48px', color: '#ccc' }}></i>
                </div>
                <h2 style={{fontSize: '20px', color: '#333', marginBottom: '10px'}}>
                    页面正在建设中
                </h2>
                <p style={{ fontSize: '14px', marginBottom: '5px' }}>
                    您访问的路径: <code style={{background:'#f0f0f0', padding:'2px 6px', borderRadius:'4px'}}>{activePath}</code>
                </p>
                <p style={{ fontSize: '14px' }}>当前功能模块 [{activePage}] 尚未部署。</p>

                <div style={{marginTop: '30px', padding: '15px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px', fontSize: '12px', color: '#d46b08'}}>
                    <strong>开发提示 (Dev Hint):</strong><br/>
                    请在 <code>src/router/componentMap.jsx</code> 中注册此路径对应的组件。<br/>
                    新组件建议继承或参考 <code>InfoSystemList.jsx</code> 模板开发。
                </div>
            </div>
        </div>
    );
};

export default Construction;