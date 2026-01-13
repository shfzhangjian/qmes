/**
 * @file: src/features/AIAgent/AIAgent.jsx
 * @version: v3.0.0 (Navigation Enabled)
 * @description: AI 助手现在可以识别跳转指令，驱动应用导航
 */

import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import './AIAgent.css';

const AIAgent = () => {
    const { isAIOpen, toggleAIPanel, navigate } = useContext(AppContext);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // ... (保留之前的历史记录状态) ...
    const [messages, setMessages] = useState([
        { role: 'system', content: '您好，我是工厂智能助手。您可以让我“打开任务中心”或“查询信息系统”。' }
    ]);
    const [input, setInput] = useState('');
    const msgEndRef = useRef(null);

    // 自动滚动
    useEffect(() => {
        msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isAIOpen]);

    const handleSend = () => {
        if(!input.trim()) return;
        setMessages(prev => [...prev, { role: 'user', content: input }]);

        const userInput = input;
        setInput(''); // 清空输入框

        // --- 简单的 AI 意图识别 (模拟) ---
        setTimeout(() => {
            let replyContent = "收到。";

            // 1. 识别跳转指令
            if (userInput.includes("任务") || userInput.includes("待办")) {
                replyContent = "好的，正在为您跳转到任务管理中心...";
                navigate('/flow/todo'); // 驱动跳转
            }
            else if (userInput.includes("排程") || userInput.includes("计划")) {
                replyContent = "已为您打开计划排程看板。";
                navigate('/planning/center');
            }
            else if (userInput.includes("系统") || userInput.includes("注册表")) {
                replyContent = "正在打开信息系统注册列表，您可以在此查询 MES、ERP 等系统状态。";
                navigate('/system/info'); // 跳转到新页面
            }
            // 2. 识别分析指令 (保留原有功能)
            else if (userInput.includes("分析")) {
                replyContent = { type: 'card', title: 'OEE 效能分析', content: '今日卷包车间平均 OEE 为 92.5%，同比上升 1.2%。' };
            }
            else {
                replyContent = "抱歉，我还在学习中。您可以尝试说“打开信息系统”或“查看任务”。";
            }

            setMessages(prev => [...prev, { role: 'system', content: replyContent }]);
        }, 800);
    };

    // ... (保留 renderArtifactContent 和其他 UI 结构，与之前一致，只需修改 handleSend) ...

    return (
        <div className={`ai-agent-panel ${isAIOpen ? 'open' : ''} ${isFullScreen ? 'full-screen' : ''}`} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="ai-header">
                <div style={{ fontWeight: 'bold', display:'flex', alignItems:'center', gap:'8px' }}>
                    <i className="ri-robot-line" style={{color: '#1890FF'}}></i>
                    智能助手 (Nav Enabled)
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                    <i className={`ri-${isFullScreen ? 'fullscreen-exit' : 'fullscreen'}-line icon-btn`} onClick={() => setIsFullScreen(!isFullScreen)}></i>
                    <i className="ri-close-line icon-btn" onClick={() => toggleAIPanel(false)}></i>
                </div>
            </div>

            {/* Chat Area */}
            <div className="ai-chat-area">
                {messages.map((m, i) => (
                    <div key={i} className={`msg ${m.role}`}>
                        <div className="msg-bubble">
                            {typeof m.content === 'string' ? m.content : (
                                <div className="ai-card">
                                    <div className="ai-card-head">{m.content.title}</div>
                                    <div className="ai-card-body">{m.content.content}</div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={msgEndRef}></div>
            </div>

            {/* Footer */}
            <div className="ai-footer">
                <div className="ai-input-box">
                    <input
                        className="ai-input"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="尝试输入：打开信息系统..."
                    />
                    <i className="ri-send-plane-fill icon-btn" style={{ fontSize: '16px', color: '#1890FF' }} onClick={handleSend}></i>
                </div>
            </div>
        </div>
    );
};

export default AIAgent;