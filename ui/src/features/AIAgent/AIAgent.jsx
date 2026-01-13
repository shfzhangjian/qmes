/**
 * @file: src/features/AIAgent/AIAgent.jsx
 * @version: v2.2.0 (Style Separated)
 * @description: 将 CSS 提取到 AIAgent.css，保持功能不变
 * @createDate: 2026-01-13
 * @lastModified: 2026-01-13
 */

import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import './AIAgent.css'; // 引入独立样式

const AIAgent = () => {
    const { isAIOpen, toggleAIPanel } = useContext(AppContext);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [activeArtifact, setActiveArtifact] = useState(null); // 右侧面板当前展示的内容

    // 模拟历史会话数据
    const [historySessions, setHistorySessions] = useState([
        { id: 1, title: 'OEE 异常分析报告', time: '10:20' },
        { id: 2, title: 'ZJ17 维修备件查询', time: '昨天' },
        { id: 3, title: '生产计划自动排程', time: '前天' }
    ]);

    const [messages, setMessages] = useState([
        { role: 'system', content: '您好，我是工厂智能助手。我已连接实时数据湖。' }
    ]);
    const [input, setInput] = useState('');
    const msgEndRef = useRef(null);

    // 监听全局自定义事件
    useEffect(() => {
        const handleContextTrigger = (e) => {
            const { prompt, contextData } = e.detail;
            if (!isAIOpen) toggleAIPanel(true);

            setMessages(prev => [...prev, {
                role: 'user',
                content: `【上下文分析】${prompt}`,
                isContext: true
            }]);
            // ... Mock Logic ...
        };
        window.addEventListener('AI_CONTEXT_TRIGGER', handleContextTrigger);
        return () => window.removeEventListener('AI_CONTEXT_TRIGGER', handleContextTrigger);
    }, [isAIOpen, toggleAIPanel]);

    // 自动滚动到底部
    useEffect(() => {
        msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isAIOpen, isFullScreen]);

    const handleSend = () => {
        if(!input.trim()) return;
        setMessages(prev => [...prev, { role: 'user', content: input }]);

        // 模拟 AI 回复及 Artifacts 生成
        setTimeout(() => {
            let replyContent = "收到。正在处理您的请求...";
            let artifact = null;

            if(input.includes("分析")) {
                replyContent = { type: 'card', title: 'OEE 效能分析', content: '今日卷包车间平均 OEE 为 92.5%，同比上升 1.2%。' };
                artifact = { title: 'OEE 深度分析看板', type: 'chart', data: 'chart-data-mock' };
            }
            else if(input.includes("排程")) {
                replyContent = "已为您生成下周维修计划草稿。";
                artifact = { title: '智能排程甘特图', type: 'gantt', data: 'gantt-data-mock' };
            }
            else if(input.includes("故障")) {
                replyContent = { type: 'card', title: '故障诊断', content: '检测到 PROTOS #2 报出 "E-202 电机过载"。' };
                artifact = { title: '故障堆栈与维修建议', type: 'log', data: 'log-data-mock' };
            }

            setMessages(prev => [...prev, { role: 'system', content: replyContent }]);

            // 如果有工件生成，且在全屏模式下，自动打开右侧面板
            if (artifact && isFullScreen) {
                setActiveArtifact(artifact);
            }
        }, 1000);
        setInput('');
    };

    // 渲染工件内容 (右侧面板)
    const renderArtifactContent = () => {
        if (!activeArtifact) return <div className="empty-state">暂无深度洞察内容<br/>在对话中请求"分析"或"报表"以生成</div>;

        return (
            <div className="artifact-content">
                <div className="artifact-header">
                    <span className="tag">{activeArtifact.type.toUpperCase()}</span>
                    <h4>{activeArtifact.title}</h4>
                </div>
                <div className="artifact-body">
                    {/* 这里是模拟的图表/报表占位符 */}
                    <div className="mock-chart-placeholder">
                        <i className="ri-bar-chart-grouped-line" style={{fontSize: '48px', color: '#1890FF', opacity: 0.5}}></i>
                        <p>交互式图表渲染区域</p>
                        <div style={{width: '80%', height: '10px', background: '#eee', margin: '10px auto', borderRadius: '4px'}}></div>
                        <div style={{width: '60%', height: '10px', background: '#eee', margin: '10px auto', borderRadius: '4px'}}></div>
                    </div>
                    <div style={{padding: '20px', fontSize: '13px', color: '#666', lineHeight: '1.6'}}>
                        <p><strong>AI 洞察：</strong></p>
                        <p>根据实时数据流分析，该设备在早班期间效率出现波动。建议检查供料系统稳定性。</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* 遮罩层 (仅在非全屏模式下显示，全屏模式自带背景) */}
            {isAIOpen && !isFullScreen && (
                <div
                    className="ai-overlay"
                    style={{
                        position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex: 2400,
                        background: 'transparent' // 透明遮罩用于点击关闭
                    }}
                    onClick={() => toggleAIPanel(false)}
                ></div>
            )}

            <div className={`ai-agent-panel ${isAIOpen ? 'open' : ''} ${isFullScreen ? 'full-screen' : ''}`} onClick={e => e.stopPropagation()}>

                {/* 1. 全屏布局：左侧栏 (历史记录) */}
                {isFullScreen && (
                    <div className="ai-history-sidebar">
                        <div className="sidebar-header">历史会话</div>
                        <div className="history-list">
                            <div className="history-item active">
                                <i className="ri-message-3-line"></i> 当前会话
                            </div>
                            {historySessions.map(s => (
                                <div key={s.id} className="history-item">
                                    <i className="ri-chat-history-line"></i>
                                    <div className="text">
                                        <div className="title">{s.title}</div>
                                        <div className="time">{s.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="sidebar-footer">
                            <button className="new-chat-btn"><i className="ri-add-line"></i> 新对话</button>
                        </div>
                    </div>
                )}

                {/* 2. 中间：主对话区域 (全屏时作为中间栏，非全屏时是唯一内容) */}
                <div className="ai-main-section">
                    <div className="ai-header">
                        <div style={{ fontWeight: 'bold', display:'flex', alignItems:'center', gap:'8px' }}>
                            <i className="ri-robot-line" style={{color: '#1890FF'}}></i>
                            {isFullScreen ? '工厂智能助手 Copilot' : '智能助手'}
                        </div>
                        <div style={{display:'flex', gap:'10px'}}>
                            <i
                                className={`ri-${isFullScreen ? 'fullscreen-exit' : 'fullscreen'}-line icon-btn`}
                                title={isFullScreen ? "退出全屏" : "全屏模式"}
                                onClick={() => setIsFullScreen(!isFullScreen)}
                            ></i>
                            <i className="ri-close-line icon-btn" onClick={() => toggleAIPanel(false)}></i>
                        </div>
                    </div>

                    <div className="ai-chat-area">
                        {messages.map((m, i) => (
                            <div key={i} className={`msg ${m.role} ${m.isContext ? 'context-msg' : ''}`}>
                                <div className="msg-bubble">
                                    {typeof m.content === 'string' ? m.content : (
                                        <div className="ai-card">
                                            <div className="ai-card-head">{m.content.title}</div>
                                            <div className="ai-card-body">{m.content.content}</div>
                                            {/* 在全屏模式下，提供查看详情按钮 */}
                                            {isFullScreen && (
                                                <div className="ai-card-actions">
                                                    <button onClick={() => setActiveArtifact({title: m.content.title + '详情', type: 'report'})}>
                                                        打开深度面板 <i className="ri-arrow-right-line"></i>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={msgEndRef}></div>
                    </div>

                    <div className="ai-footer">
                        <div className="ai-input-box">
                            <input className="ai-input" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="输入指令..." />
                            <i className="ri-send-plane-fill icon-btn" style={{ fontSize: '16px', color: '#1890FF' }} onClick={handleSend}></i>
                        </div>
                    </div>
                </div>

                {/* 3. 全屏布局：右侧栏 (Artifacts) */}
                {isFullScreen && (
                    <div className="ai-artifacts-panel">
                        <div className="panel-title">深度洞察 (Artifacts)</div>
                        <div className="panel-content">
                            {renderArtifactContent()}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AIAgent;