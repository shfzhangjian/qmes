/**
 * @file: src/features/AIAgent/AIAgent.jsx
 * @version: v5.2.0 (Auto Close Overlay)
 * @description:
 * 1. 新增点击遮罩层自动关闭面板的功能。
 * 2. 保持原有的侧边栏和 Header 逻辑不变。
 */
import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import logoSvg from '../../assets/logo.jpg'; // 引入 Logo
import './AIAgent.css';

const AIAgent = () => {
    const { isAIOpen, toggleAIPanel, navigate, systemTitle } = useContext(AppContext);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // ... (状态保持不变) ...
    const [historyList, setHistoryList] = useState([
        { id: 1, title: '生产异常分析', date: '今天' },
        { id: 2, title: '月度报表查询', date: '昨天' },
        { id: 3, title: '设备维护建议', date: '2天前' },
    ]);
    const [activeSessionId, setActiveSessionId] = useState(1);
    const [isHistoryDropdownOpen, setIsHistoryDropdownOpen] = useState(false);

    const [messages, setMessages] = useState([
        {
            role: 'system',
            content: '您好！我是您的工厂智能助手。您可以问我关于生产进度、设备状态或系统操作的问题。',
            timestamp: new Date().toLocaleTimeString()
        }
    ]);

    const msgEndRef = useRef(null);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // ... (useEffect 保持不变) ...
    useEffect(() => {
        msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isAIOpen, isTyping]);

    useEffect(() => {
        if (isAIOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
            document.body.classList.add('aip-open');
        } else {
            document.body.classList.remove('aip-open');
            setIsHistoryDropdownOpen(false);
        }

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsHistoryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isAIOpen]);

    const suggestions = ["打开待办任务", "查看生产报表", "设备异常分析", "系统使用帮助"];

    // ... (handleSend, handleNewChat, handleSwitchSession 保持不变) ...
    const handleSend = (text = input) => {
        if (!text.trim()) return;
        const userMsg = { role: 'user', content: text, timestamp: new Date().toLocaleTimeString() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);
        setTimeout(() => {
            let replyContent = "";
            let action = null;
            if (text.includes("任务") || text.includes("待办")) {
                replyContent = "好的，正在为您跳转到任务管理中心。";
                action = () => navigate('/flow/todo');
            } else {
                replyContent = `收到指令：“${text}”。智能助手正在为您处理...`;
            }
            const aiMsg = {
                role: 'system',
                content: replyContent,
                timestamp: new Date().toLocaleTimeString(),
                actionLabel: action ? "点击立即跳转" : null,
                action: action
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
            if (action && text.includes("打开")) setTimeout(action, 1500);
        }, 1200);
    };

    const handleNewChat = () => {
        setMessages([{ role: 'system', content: '新会话已开始。我是您的工厂智能助手，请问有什么可以帮您？', timestamp: new Date().toLocaleTimeString() }]);
        setActiveSessionId(Date.now());
        setIsHistoryDropdownOpen(false);
    };

    const handleSwitchSession = (id) => {
        setActiveSessionId(id);
        setIsHistoryDropdownOpen(false);
        setMessages([{ role: 'system', content: `已切换至历史会话 #${id}。`, timestamp: new Date().toLocaleTimeString() }]);
    };

    // 新增：点击遮罩层关闭
    const handleOverlayClick = () => {
        toggleAIPanel(false);
    };

    return (
        <>
            {/* 遮罩层：点击自动隐藏 */}
            <div
                className={`ai-panel-overlay ${isAIOpen ? 'open' : ''}`}
                onClick={handleOverlayClick}
            ></div>

            <div className={`ai-agent-panel ${isAIOpen ? 'open' : ''} ${isFullScreen ? 'full-screen' : ''}`} onClick={e => e.stopPropagation()}>

                {/* 左侧：历史会话侧边栏 (仅全屏模式显示) */}
                {isFullScreen && (
                    <div className="ai-history-sidebar">
                        <div className="new-chat-btn" onClick={handleNewChat}>
                            <i className="ri-add-line"></i> 新建对话
                        </div>
                        <div className="history-list">
                            <div className="history-group-label">近期活跃</div>
                            {historyList.map(item => (
                                <div
                                    key={item.id}
                                    className={`history-item ${activeSessionId === item.id ? 'active' : ''}`}
                                    onClick={() => handleSwitchSession(item.id)}
                                >
                                    <i className="ri-message-3-line"></i>
                                    <span className="history-title">{item.title}</span>
                                </div>
                            ))}
                        </div>
                        <div className="sidebar-footer">
                            <i className="ri-settings-4-line icon-btn"></i>
                            <i className="ri-user-smile-line icon-btn"></i>
                        </div>
                    </div>
                )}

                {/* 右侧：主聊天区域 */}
                <div className="ai-main-container">
                    {/* Header */}
                    <div className="ai-header">
                        <div className="ai-brand-group">
                            <div className="ai-logo-box">
                                <img src={logoSvg} alt="Logo" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                                <i className="ri-building-2-fill fallback-icon"></i>
                            </div>
                            <div className="ai-text-group">
                                <div className="ai-main-title">{systemTitle}</div>
                                <div
                                    className={`ai-sub-title ${!isFullScreen ? 'interactive' : ''}`}
                                    onClick={() => !isFullScreen && setIsHistoryDropdownOpen(!isHistoryDropdownOpen)}
                                    ref={dropdownRef}
                                >
                                    智能助手 Copilot
                                    {!isFullScreen && <i className={`ri-arrow-down-s-line dropdown-arrow ${isHistoryDropdownOpen ? 'rotate' : ''}`}></i>}

                                    {isHistoryDropdownOpen && !isFullScreen && (
                                        <div className="ai-history-dropdown">
                                            <div className="dropdown-item new-chat" onClick={(e) => { e.stopPropagation(); handleNewChat(); }}>
                                                <i className="ri-add-line"></i> 新建对话
                                            </div>
                                            <div className="dropdown-divider"></div>
                                            <div className="dropdown-label">近期历史</div>
                                            {historyList.map(item => (
                                                <div
                                                    key={item.id}
                                                    className={`dropdown-item ${activeSessionId === item.id ? 'active' : ''}`}
                                                    onClick={(e) => { e.stopPropagation(); handleSwitchSession(item.id); }}
                                                >
                                                    <span className="truncate">{item.title}</span>
                                                    <span className="date">{item.date}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="ai-actions">
                            <i className={`ri-${isFullScreen ? 'fullscreen-exit' : 'fullscreen'}-line icon-btn`}
                               title={isFullScreen ? "退出全屏" : "全屏模式"}
                               onClick={() => setIsFullScreen(!isFullScreen)}></i>
                            <i className="ri-close-line icon-btn close-btn"
                               title="关闭"
                               onClick={() => toggleAIPanel(false)}></i>
                        </div>
                    </div>

                    {/* Chat Body */}
                    <div className="ai-chat-area">
                        {messages.map((m, i) => (
                            <div key={i} className={`msg-row ${m.role}`}>
                                {m.role === 'system' && (
                                    <div className="msg-avatar system-avatar">
                                        <i className="ri-robot-2-fill"></i>
                                    </div>
                                )}
                                <div className="msg-content-wrapper">
                                    <div className="msg-bubble">
                                        {m.content}
                                        {m.action && (
                                            <div className="msg-action-link" onClick={m.action}>
                                                {m.actionLabel || "查看详情"} <i className="ri-arrow-right-line"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div className="msg-meta">{m.timestamp}</div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="msg-row system">
                                <div className="msg-avatar system-avatar"><i className="ri-robot-2-fill"></i></div>
                                <div className="msg-bubble typing"><span></span><span></span><span></span></div>
                            </div>
                        )}
                        <div ref={msgEndRef} style={{height: '1px'}}></div>
                    </div>

                    {/* Suggestions */}
                    {messages.length < 3 && !isTyping && (
                        <div className="ai-suggestions">
                            {suggestions.map((s, i) => (
                                <div key={i} className="suggestion-chip" onClick={() => handleSend(s)}>{s}</div>
                            ))}
                        </div>
                    )}

                    {/* Footer Input */}
                    <div className="ai-footer">
                        <div className="ai-input-wrapper">
                            <input
                                ref={inputRef}
                                className="ai-input"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSend()}
                                placeholder="输入指令或提问..."
                            />
                            <button
                                className={`ai-send-btn ${input.trim() ? 'active' : ''}`}
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isTyping}
                            >
                                <i className="ri-send-plane-fill"></i>
                            </button>
                        </div>
                        <div className="ai-footer-tip">
                            <i className="ri-shield-check-line"></i> 内容由 AI 生成，仅供内部参考
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIAgent;