/**
 * @file: src/features/Layout/Header.jsx
 * @version: v3.7.0 (Show Role Name)
 * @description: 用户信息区域现在显示中文角色名称，而非代码
 */

import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import logoSvg from '../../assets/logo.jpg';
import './Header.css';

// --- 全屏模态框内容组件 ---
const ModalContent = ({ config, currentUser }) => {
    const { type } = config;
    const [activeTab, setActiveTab] = useState(type === 'settings' ? 'preference' : 'basic');

    // 1. 消息通知中心
    if (type === 'messages') {
        const messages = [
            { type: 'error', title: '制丝线 2号烘丝机数据采集异常', time: '12-18 10:20', status: '未读', content: '传感器数据中断，持续时间超过 5 分钟，请立即检查网络连接及 PLC 状态。' },
            { type: 'warning', title: '月度能耗指标即将超出预定阈值', time: '12-18 09:45', status: '未读', content: '当前电耗已达月度计划的 92%，预计将在 3 天后超标。' },
            { type: 'success', title: '设备年度检修计划已审批通过', time: '12-17 16:30', status: '已读', content: '您的《2026年度 ZJ17 卷接机组检修计划》已由设备部经理审批通过。' },
            { type: 'info', title: '系统版本更新公告 v3.0', time: '12-16 08:00', status: '已读', content: '系统将于本周五晚进行不停机更新，新增 AI 智能排程功能。' }
        ];
        return (
            <div className="message-modal-content">
                <h3 className="modal-section-title">消息通知中心</h3>
                <div className="message-list">
                    {messages.map((m, i) => (
                        <div key={i} className={`message-full-item ${m.type}`}>
                            <div className="msg-icon">
                                <i className={`ri-${m.type === 'error' ? 'alert' : m.type === 'warning' ? 'alarm-warning' : m.type === 'success' ? 'checkbox-circle' : 'information'}-line`}></i>
                            </div>
                            <div className="msg-content">
                                <div className="msg-header">
                                    <span className="msg-title">{m.title}</span>
                                    <span className={`msg-status ${m.status==='未读'?'unread':''}`}>{m.status}</span>
                                </div>
                                <div className="msg-body">{m.content}</div>
                                <div className="msg-time">{m.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 2. 全域搜索结果
    if (type === 'search') {
        const query = (config.query || "").toLowerCase();
        const allCategories = [
            {
                label: "业务功能",
                results: [
                    { title: "设备运行效率分析 (OEE)", path: "集控中心 / 设备洞察 / 效能分析", icon: "ri-line-chart-line" },
                    { title: "专项检查标准管理", path: "设备管理 / 专项管理 / 检查管理", icon: "ri-list-check" },
                    { title: "制丝计划看板", path: "生产管理 / 制丝计划", icon: "ri-layout-grid-line" }
                ]
            },
            {
                label: "数据报表",
                results: [
                    { title: "2025年度能耗统计总表", path: "知识与计量 / 报表中心 / 能源", icon: "ri-file-list-3-line" },
                    { title: "班组产量对比分析月报", path: "生产管理 / 卷包执行 / 统计报表", icon: "ri-bar-chart-box-line" }
                ]
            }
        ];
        const filtered = allCategories.map(cat => ({
            ...cat,
            results: cat.results.filter(r => r.title.toLowerCase().includes(query) || r.path.toLowerCase().includes(query))
        })).filter(cat => cat.results.length > 0);

        return (
            <div className="search-modal-content">
                <div className="search-header-bar">
                    <input className="aip-input large" defaultValue={config.query} placeholder="在此结果中二次检索..." />
                    <button className="btn btn-primary">重新检索</button>
                </div>
                {filtered.length === 0 ? (
                    <div className="empty-search"><i className="ri-search-2-line"></i><p>未找到与 "{config.query}" 相关的结果</p></div>
                ) : (
                    filtered.map((cat, idx) => (
                        <div key={idx} className="search-group">
                            <h4 className="group-title">{cat.label}</h4>
                            <div className="group-list">
                                {cat.results.map((res, rIdx) => (
                                    <div key={rIdx} className="search-result-row">
                                        <div className="row-icon"><i className={res.icon}></i></div>
                                        <div className="row-info"><div className="row-title">{res.title}</div><div className="row-path">{res.path}</div></div>
                                        <i className="ri-arrow-right-s-line arrow"></i>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    }

    // 3. 个人中心
    if (type === 'personal') {
        return (
            <div className="settings-layout">
                <div className="settings-nav">
                    {[
                        {key:'basic', label:'基本资料'},
                        {key:'security', label:'安全设置'},
                        {key:'permission', label:'权限看板'}
                    ].map(item => (
                        <div key={item.key} className={`settings-nav-item ${activeTab === item.key ? 'active' : ''}`} onClick={() => setActiveTab(item.key)}>{item.label}</div>
                    ))}
                </div>
                <div className="settings-content">
                    {activeTab === 'basic' && (
                        <div className="fade-in">
                            <h3 className="content-title">基本资料</h3>
                            <div className="aip-form-group">
                                <label>头像</label>
                                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                    <div className="avatar-circle large">{currentUser.name[0]}</div>
                                    <button className="small-btn outline">更换头像</button>
                                </div>
                            </div>
                            <div className="aip-form-group"><label>姓名</label><input className="aip-input" value={currentUser.name} readOnly /></div>
                            <div className="aip-form-group"><label>工号</label><input className="aip-input" value="SD-9527" readOnly style={{background:'#f5f5f5'}} /></div>
                            <div className="aip-form-group"><label>角色</label><input className="aip-input" value={currentUser.role} readOnly style={{background:'#f5f5f5'}} /></div>
                            <div className="aip-form-group"><label>电子邮箱</label><input className="aip-input" defaultValue="yuan.ss@sdzy.com" /></div>
                            <button className="btn btn-primary" style={{marginTop:'20px'}}>保存修改</button>
                        </div>
                    )}
                    {activeTab === 'security' && (
                        <div className="fade-in">
                            <h3 className="content-title">账户安全设置</h3>
                            <div className="security-alert"><i className="ri-shield-check-line"></i> 您的账户安全等级为：<strong>高</strong></div>
                            <div className="list-item"><div><strong>登录双重认证 (2FA)</strong><div className="sub-text">在新设备登录时需要验证码</div></div><span className="tag-active">已开启</span></div>
                            <div className="list-item"><div><strong>异地登录提醒</strong><div className="sub-text">检测到异常IP时发送邮件</div></div><span className="tag-active">已开启</span></div>
                            <h4 style={{marginTop:'30px', marginBottom:'15px'}}>近期登录日志</h4>
                            <table className="simple-table">
                                <thead><tr><th>时间</th><th>设备</th><th>IP</th><th>状态</th></tr></thead>
                                <tbody>
                                <tr><td>2025-12-19 09:00</td><td>Chrome (Win)</td><td>10.20.4.55</td><td style={{color:'green'}}>成功</td></tr>
                                <tr><td>2025-12-18 14:20</td><td>Safari (Mobile)</td><td>192.168.1.102</td><td style={{color:'green'}}>成功</td></tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                    {activeTab === 'permission' && (
                        <div className="fade-in">
                            <h3 className="content-title">权限看板</h3>
                            <div style={{display:'flex', gap:'20px', marginBottom:'30px'}}>
                                <div style={{flex:1, background:'#f0f7ff', padding:'20px', borderRadius:'8px', border:'1px solid #adc6ff'}}>
                                    <div style={{color:'#1890ff', fontWeight:'700', marginBottom:'5px'}}>系统角色</div>
                                    <div style={{fontSize:'13px'}}>高级管理员, 设备工程师</div>
                                </div>
                                <div style={{flex:1, background:'#f6ffed', padding:'20px', borderRadius:'8px', border:'1px solid #b7eb8f'}}>
                                    <div style={{color:'#52c41a', fontWeight:'700', marginBottom:'5px'}}>数据范围</div>
                                    <div style={{fontSize:'13px'}}>全厂设备数据, 生产计划(只读)</div>
                                </div>
                            </div>
                            <h4 style={{marginBottom:'15px'}}>功能操作权限明细</h4>
                            <div className="permission-tags">
                                <span className="p-tag green">设备台账: <strong>读写</strong></span>
                                <span className="p-tag green">维修工单: <strong>审批</strong></span>
                                <span className="p-tag orange">备件采购: <strong>申请</strong></span>
                                <span className="p-tag red">用户管理: <strong>禁止</strong></span>
                            </div>
                            <h4 style={{marginTop:'30px', marginBottom:'15px'}}>敏感操作审计日志</h4>
                            <table className="simple-table">
                                <thead><tr><th>时间</th><th>操作模块</th><th>动作</th><th>结果</th></tr></thead>
                                <tbody>
                                <tr><td>12-19 10:15</td><td>系统设置</td><td>修改密码策略</td><td>成功</td></tr>
                                <tr><td>12-18 16:00</td><td>设备台账</td><td>删除记录 #9921</td><td>成功</td></tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 4. 修改密码
    if (type === 'password') {
        return (
            <div style={{maxWidth: '460px', margin: '40px auto'}}>
                <h3 style={{marginBottom:'20px', textAlign:'center'}}>修改账户密码</h3>
                <div className="aip-form-group"><label>当前密码</label><input type="password" class="aip-input" /></div>
                <div className="aip-form-group"><label>新密码</label><input type="password" class="aip-input" /></div>
                <div className="aip-form-group"><label>确认新密码</label><input type="password" class="aip-input" /></div>
                <button className="btn btn-primary" style={{width:'100%', height:'42px', marginTop:'20px'}}>确认修改</button>
            </div>
        );
    }

    // 5. 系统设置
    if (type === 'settings') {
        return (
            <div className="settings-layout">
                <div className="settings-nav">
                    {[
                        {key:'preference', label:'偏好设置'},
                        {key:'notification', label:'消息订阅'},
                        {key:'developer', label:'开发者选项'}
                    ].map(item => (
                        <div key={item.key} className={`settings-nav-item ${activeTab===item.key?'active':''}`} onClick={()=>setActiveTab(item.key)}>{item.label}</div>
                    ))}
                </div>
                <div className="settings-content">
                    {activeTab === 'preference' && (
                        <div className="fade-in">
                            <h3 className="content-title">界面偏好设置</h3>
                            <div className="aip-form-group"><label>默认语言</label><select className="aip-input"><option>简体中文</option><option>English</option></select></div>
                            <div className="aip-form-group"><label>深色模式</label><select className="aip-input"><option>自动 (跟随系统)</option><option>始终开启</option><option>始终关闭</option></select></div>
                            <div className="aip-form-group">
                                <label>字体大小</label>
                                <div style={{display:'flex', gap:'10px'}}>
                                    <button className="small-btn outline">标准</button>
                                    <button className="small-btn outline">中等</button>
                                    <button className="small-btn outline">大</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'notification' && (
                        <div className="fade-in">
                            <h3 className="content-title">消息通知订阅</h3>
                            <div className="list-item"><div><strong>设备故障告警</strong><div className="sub-text">机台停机、参数超限等紧急通知</div></div><span className="tag-active">已开启</span></div>
                            <div className="list-item"><div><strong>流程审批任务</strong><div className="sub-text">待办事项、抄送我的单据</div></div><span className="tag-active">已开启</span></div>
                            <div className="list-item"><div><strong>生产报表推送</strong><div className="sub-text">每日早班生产简报</div></div><span className="tag-inactive">已关闭</span></div>
                        </div>
                    )}
                    {activeTab === 'developer' && (
                        <div className="fade-in">
                            <h3 className="content-title">开发者选项</h3>
                            <div style={{padding:'15px', background:'#fff1f0', border:'1px dashed #ffccc7', borderRadius:'6px', marginBottom:'20px'}}>
                                <div style={{color:'#cf1322', fontWeight:'bold', fontSize:'13px', marginBottom:'5px'}}>⚠️ 警告</div>
                                <div style={{fontSize:'12px', color:'#666'}}>以下选项仅供开发人员调试使用，错误操作可能导致系统异常。</div>
                            </div>
                            <div className="aip-form-group"><label>API Endpoint</label><input className="aip-input" value="https://api.prod.sdzy.com/v1" disabled style={{background:'#eee', color:'#999'}}/></div>
                            <div className="list-item"><div><strong>显示详细错误堆栈</strong></div><input type="checkbox" defaultChecked /></div>
                            <div style={{marginTop:'30px', borderTop:'1px solid #eee', paddingTop:'20px'}}>
                                <label style={{display:'block', marginBottom:'10px'}}>高级操作</label>
                                <button className="small-btn outline" onClick={()=>alert('缓存已清除')}>清除本地缓存</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};


const Header = () => {
    const { currentUser, navigate, toggleAIPanel, logout, systemTitle, systemSubtitle } = useContext(AppContext);
    const [activePanel, setActivePanel] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalConfig, setModalConfig] = useState(null);
    const headerRightRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (headerRightRef.current && !headerRightRef.current.contains(event.target)) {
                setActivePanel(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const togglePanel = (panel) => setActivePanel(activePanel === panel ? null : panel);
    const openFullModal = (config) => { setActivePanel(null); setModalConfig(config); };

    if (!currentUser) return null;

    return (
        <>
            <header className="header">
                <div className="brand" onClick={() => navigate('主工作台')} style={{cursor: 'pointer'}}>
                    <div className="logo-container">
                        <img src={logoSvg} alt="Logo" style={{height: '36px', display: 'block'}} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                        <i className="ri-building-2-line fallback-logo" style={{display:'none', fontSize: '24px', color:'#1890FF'}}></i>
                    </div>
                    <div className="brand-text-group">
                        <div className="main-title">{systemTitle}</div>
                        <div className="sub-title">({systemSubtitle})</div>
                    </div>
                </div>

                <div className="header-right" ref={headerRightRef}>
                    <i className="ri-home-4-line icon-btn" title="工作台" onClick={() => navigate('主工作台')}></i>

                    {/* 搜索 */}
                    <div style={{position:'relative'}}>
                        <i className={`ri-search-line icon-btn ${activePanel==='search'?'active':''}`} title="搜索" onClick={() => togglePanel('search')}></i>
                        {activePanel === 'search' && (
                            <div className="header-dropdown panel-search">
                                <div className="panel-body">
                                    <div className="search-box-inner">
                                        <i className="ri-search-line"></i>
                                        <input autoFocus placeholder="输入关键词..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && openFullModal({type:'search', title:'全域搜索', query: searchQuery})} />
                                    </div>
                                    <div className="search-tags"><span>生产报表</span><span>OEE分析</span><span>备件</span></div>
                                </div>
                                <div className="panel-footer" onClick={() => openFullModal({type:'search', title:'全域搜索', query: searchQuery})}>查看全部搜索结果 <i className="ri-arrow-right-s-line"></i></div>
                            </div>
                        )}
                    </div>

                    {/* 通知 */}
                    <div style={{position:'relative'}}>
                        <div className="icon-btn" onClick={() => togglePanel('notice')}>
                            <i className={`ri-notification-3-line ${activePanel==='notice'?'active':''}`}></i>
                            <span className="badge-dot"></span>
                        </div>
                        {activePanel === 'notice' && (
                            <div className="header-dropdown panel-notice">
                                <div className="panel-header"><span>通知 (3)</span><span className="clear-btn">清空</span></div>
                                <div className="panel-body list">
                                    <div className="notice-item unread">
                                        <div className="icon-wrap error"><i className="ri-alert-line"></i></div>
                                        <div className="info"><div className="title">制丝线 2号烘丝机异常</div><div className="time">10分钟前</div></div>
                                    </div>
                                    <div className="notice-item unread">
                                        <div className="icon-wrap warning"><i className="ri-alarm-warning-line"></i></div>
                                        <div className="info"><div className="title">能耗指标预警</div><div className="time">30分钟前</div></div>
                                    </div>
                                </div>
                                <div className="panel-footer" onClick={() => openFullModal({type:'messages', title:'消息通知中心'})}>查看所有消息 <i className="ri-arrow-right-s-line"></i></div>
                            </div>
                        )}
                    </div>

                    <i className="ri-robot-line icon-btn" title="AI助手" style={{ color: '#1890FF' }} onClick={() => toggleAIPanel()}></i>

                    {/* 用户 - 显示 roleName */}
                    <div className="user-profile" style={{position: 'relative', cursor: 'pointer'}} onClick={() => togglePanel('user')}>
                        <span className="avatar-circle">{currentUser.name[0]}</span>
                        <div style={{display:'flex', flexDirection:'column', justifyContent:'center'}}>
                            <span style={{ fontSize: '13px', lineHeight:'1.2' }}>{currentUser.name}</span>
                            {/* 优先显示 roleName，如果没有则显示 code */}
                            <span style={{ fontSize: '10px', color: '#999', lineHeight:'1' }}>
                    {currentUser.roleName ? currentUser.roleName.split('(')[0] : currentUser.role}
                </span>
                        </div>
                        <i className="ri-arrow-down-s-line" style={{marginLeft:'5px', color:'#999'}}></i>

                        {activePanel === 'user' && (
                            <div className="header-dropdown panel-user" onClick={(e) => e.stopPropagation()}>
                                <div className="dropdown-item" onClick={() => openFullModal({type:'personal', title:'个人中心'})}><i className="ri-user-settings-line"></i> 个人中心</div>
                                <div className="dropdown-item" onClick={() => openFullModal({type:'password', title:'修改密码'})}><i className="ri-lock-password-line"></i> 修改密码</div>
                                <div className="dropdown-item" onClick={() => openFullModal({type:'settings', title:'系统设置'})}><i className="ri-settings-3-line"></i> 系统设置</div>
                                <div className="divider"></div>
                                <div className="dropdown-item danger" onClick={() => logout()}><i className="ri-logout-box-line"></i> 退出登录</div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* 统一的全屏模态框 (AIP Overlay) */}
            {modalConfig && (
                <div className="aip-global-overlay open" onClick={() => setModalConfig(null)}>
                    <div className="aip-modal-container" onClick={e => e.stopPropagation()}>
                        <div className="aip-modal-header">
                            <div className="aip-modal-title">{modalConfig.title}</div>
                            <i className="ri-close-line icon-btn" onClick={() => setModalConfig(null)} style={{fontSize:'24px'}}></i>
                        </div>
                        <div className="aip-modal-body">
                            <ModalContent config={modalConfig} currentUser={currentUser} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;