/**
 * @file: src/features/Layout/Header.jsx
 * @version: v4.3.0 (Perm Tab Standalone)
 * @description: 将权限明细独立为 Tab 页，与组织归属同级
 */

import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import logoSvg from '../../assets/logo.jpg';
import NotificationCenter from '../System/NotificationCenter.jsx'; // 复用组件
import GlobalSearch from '../System/GlobalSearch.jsx'; // 复用组件
import './Header.css';

// --- 全屏模态框内容组件 ---
const ModalContent = ({ config, currentUser }) => {
    const { type } = config;
    const [activeTab, setActiveTab] = useState(type === 'settings' ? 'preference' : 'basic');


    // 3. 个人中心
    if (type === 'personal') {
        return (
            <div className="settings-layout">
                <div className="settings-nav">
                    {[
                        {key:'basic', label:'基本资料'},
                        {key:'org', label:'组织归属'},
                        {key:'perm', label:'权限明细'}, // 新增同级 Tab
                    ].map(item => (
                        <div key={item.key} className={`settings-nav-item ${activeTab === item.key ? 'active' : ''}`} onClick={() => setActiveTab(item.key)}>{item.label}</div>
                    ))}
                </div>
                <div className="settings-content">
                    {/* --- A. 基本资料 --- */}
                    {activeTab === 'basic' && (
                        <div className="fade-in">
                            <h3 className="content-title">基本资料</h3>
                            <div className="profile-header-card">
                                <div className="avatar-circle large">{currentUser.name[0]}</div>
                                <div>
                                    <h2 style={{margin:'0 0 5px 0', fontSize:'24px'}}>{currentUser.name}</h2>
                                    <div style={{color:'#666', fontSize:'14px'}}>{currentUser.dept} · {currentUser.job}</div>
                                </div>
                            </div>

                            <div className="aip-form-group"><label>工号</label><input className="aip-input" value="SD-2026001" readOnly style={{background:'#f5f5f5'}} /></div>
                            <div className="aip-form-group"><label>手机号</label><input className="aip-input" defaultValue="13800138000" /></div>
                            <div className="aip-form-group"><label>电子邮箱</label><input className="aip-input" defaultValue={`${currentUser.role.toLowerCase()}.user@qmes.com`} /></div>
                            <button className="btn btn-primary" style={{marginTop:'20px'}}>保存修改</button>
                        </div>
                    )}

                    {/* --- B. 组织归属 --- */}
                    {activeTab === 'org' && (
                        <div className="fade-in org-container">
                            <h3 className="content-title">我的组织全景</h3>

                            {/* 1. 电子工牌区 (行政) */}
                            <div className="org-identity-card">
                                <div className="id-card-header">
                                    <img src={logoSvg} className="id-logo" alt="logo" />
                                    <span className="id-company">禾臣新材料</span>
                                </div>
                                <div className="id-card-body">
                                    <div className="id-avatar">{currentUser.name[0]}</div>
                                    <div className="id-info">
                                        <div className="id-name">{currentUser.name}</div>
                                        <div className="id-post">{currentUser.job || '职员'}</div>
                                        <div className="id-dept">{currentUser.dept || '未分配部门'}</div>
                                    </div>
                                    <div className="id-meta">
                                        <div className="meta-item">
                                            <label>工号</label>
                                            <span>SD-9527</span>
                                        </div>
                                        <div className="meta-item">
                                            <label>入职日期</label>
                                            <span>2023-05-12</span>
                                        </div>
                                        <div className="meta-item">
                                            <label>直属上级</label>
                                            <span>王经理</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="id-card-footer">
                                    <span className="status-dot"></span> 在职 (Active)
                                </div>
                            </div>

                            {/* 2. 职能角色区 */}
                            <div className="functional-section">
                                <div className="section-header">
                                    <i className="ri-group-2-line"></i> 委员会与专项工作组
                                </div>
                                {(!currentUser.groups || currentUser.groups.length === 0) ? (
                                    <div className="empty-functional-state">
                                        <i className="ri-layout-masonry-line"></i>
                                        <span>当前未加入任何跨部门委员会或项目组</span>
                                    </div>
                                ) : (
                                    <div className="committee-grid">
                                        {currentUser.groups.map((g, i) => (
                                            <div key={i} className="committee-box">
                                                <div className="c-box-icon">
                                                    <i className={g.name.includes('PCRB') ? 'ri-git-merge-line' : 'ri-shield-check-line'}></i>
                                                </div>
                                                <div className="c-box-content">
                                                    <div className="c-box-name">{g.name}</div>
                                                    <div className={`c-box-role ${g.role === '负责人' ? 'head' : 'member'}`}>
                                                        {g.role}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 3. 系统权限 (底部通栏 - 简化版) */}
                            <div className="system-perm-bar">
                                <div className="perm-icon"><i className="ri-shield-keyhole-line"></i></div>
                                <div className="perm-info">
                                    <div className="perm-label">IT 系统权限简报</div>
                                    <div className="perm-value">
                                        角色代码: <code>{currentUser.role}</code>
                                        <span className="divider">|</span>
                                        策略组: <strong>{currentUser.roleName}</strong>
                                    </div>
                                </div>
                                {/* 引导跳转到权限 Tab */}
                                <button className="perm-action-btn" onClick={() => setActiveTab('perm')}>查看详细策略 <i className="ri-arrow-right-line"></i></button>
                            </div>
                        </div>
                    )}

                    {/* --- C. 权限明细 (独立 Tab) --- */}
                    {activeTab === 'perm' && (
                        <div className="fade-in">
                            <h3 className="content-title">权限策略明细</h3>

                            <div className="perm-detail-layout">
                                <div className="detail-header-info">
                                    <div className="info-block">
                                        <div className="label">当前系统角色</div>
                                        <div className="value big">{currentUser.roleName} ({currentUser.role})</div>
                                    </div>
                                    <div className="info-block">
                                        <div className="label">策略版本 ID</div>
                                        <div className="value mono">POL-2025-V4</div>
                                    </div>
                                </div>

                                <div className="perm-group">
                                    <div className="pg-title"><i className="ri-database-2-line"></i> 数据访问范围</div>
                                    <div className="pg-content">
                                        <span className="p-tag green">当前部门数据: <strong>读写 (RW)</strong></span>
                                        {(['ADM', 'MGR', 'QC'].includes(currentUser.role)) ?
                                            <span className="p-tag orange">跨部门共享数据: <strong>只读 (RO)</strong></span> :
                                            <span className="p-tag gray">跨部门共享数据: <strong>禁止 (Deny)</strong></span>
                                        }
                                        <span className="p-tag blue">公共基础数据: <strong>只读 (RO)</strong></span>
                                    </div>
                                </div>

                                <div className="perm-group">
                                    <div className="pg-title"><i className="ri-command-line"></i> 模块操作权限</div>
                                    <div className="pg-content">
                                        <span className="p-tag blue">通用查询/检索</span>
                                        {['ADM', 'MGR', 'PE', 'QC'].includes(currentUser.role) && <span className="p-tag blue">报表数据导出</span>}
                                        {['ADM', 'MGR'].includes(currentUser.role) && <span className="p-tag blue">单据电子审批</span>}
                                        {['ADM'].includes(currentUser.role) && <span className="p-tag red">系统参数配置</span>}
                                        {['OP'].includes(currentUser.role) && <span className="p-tag green">移动端报工填报</span>}
                                    </div>
                                </div>

                                <div className="perm-group">
                                    <div className="pg-title"><i className="ri-time-line"></i> 审计与合规</div>
                                    <div className="pg-text">
                                        <p>1. 您的所有<strong>“写入/修改/删除”</strong>操作将被记录在《系统操作日志》中，保留期限为 180 天。</p>
                                        <p>2. 敏感数据（如配方、成本）的访问将触发额外的安全审计。</p>
                                        <p style={{marginTop:'10px', color:'#999'}}>最近一次权限策略更新时间: 2026-01-01 12:00:00</p>
                                    </div>
                                </div>
                            </div>
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
                <div className="aip-form-group"><label>当前密码</label><input type="password" className="aip-input" /></div>
                <div className="aip-form-group"><label>新密码</label><input type="password" className="aip-input" /></div>
                <div className="aip-form-group"><label>确认新密码</label><input type="password" className="aip-input" /></div>
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
                        {key:'notification', label:'消息订阅'}
                    ].map(item => (
                        <div key={item.key} className={`settings-nav-item ${activeTab===item.key?'active':''}`} onClick={()=>setActiveTab(item.key)}>{item.label}</div>
                    ))}
                </div>
                <div className="settings-content">
                    <div className="fade-in">
                        <h3 className="content-title">界面偏好设置</h3>
                        <div className="aip-form-group"><label>默认语言</label><select className="aip-input"><option>简体中文</option></select></div>
                        <div className="aip-form-group"><label>主题风格</label><select className="aip-input"><option>企业蓝 (默认)</option><option>暗夜黑</option></select></div>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};


const Header = () => {
    const { currentUser, navigate, toggleAIPanel, logout, systemTitle, systemSubtitle } = useContext(AppContext);
    const [activePanel, setActivePanel] = useState(null);
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
    // 关闭当前面板的辅助函数
    const closePanel = () => setActivePanel(null);
    if (!currentUser) return null;

    return (
        <>
            <header className="header">
                {/* Brand 保持不变 */}
                <div className="brand" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}>
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
                    <i className="ri-home-4-line icon-btn" title="工作台" onClick={() => navigate('/dashboard')}></i>

                    {/* 搜索 - Modal */}
                    <div style={{position:'relative'}}>
                        <i className={`ri-search-line icon-btn ${activePanel==='search'?'active':''}`} title="搜索" onClick={() => togglePanel('search')}></i>
                        {activePanel === 'search' && (
                            <div className="header-dropdown panel-search" style={{width: '400px', height: '480px', display: 'flex', flexDirection: 'column', padding: 0, overflow:'hidden'}}>
                                {/* 组件内部自带 Footer，Header 只有容器 */}
                                <GlobalSearch mode="modal" onClose={closePanel} />
                            </div>
                        )}
                    </div>

                    {/* 通知 - Modal */}
                    <div style={{position:'relative'}}>
                        <div className="icon-btn" onClick={() => togglePanel('notice')}>
                            <i className={`ri-notification-3-line ${activePanel==='notice'?'active':''}`}></i>
                            <span className="badge-dot"></span>
                        </div>
                        {activePanel === 'notice' && (
                            <div className="header-dropdown panel-notice" style={{width: '360px', height: '480px', display: 'flex', flexDirection: 'column', padding: 0, overflow:'hidden'}}>
                                {/* 组件内部自带 Footer */}
                                <NotificationCenter mode="modal" onClose={closePanel} />
                            </div>
                        )}
                    </div>

                    <i className="ri-robot-line icon-btn" title="AI助手" style={{ color: '#1890FF' }} onClick={() => toggleAIPanel()}></i>

                    {/* 用户 - Dropdown (保持不变) */}
                    <div className="user-profile" style={{position: 'relative', cursor: 'pointer'}} onClick={() => togglePanel('user')}>
                        <span className="avatar-circle">{currentUser.name[0]}</span>
                        <div style={{display:'flex', flexDirection:'column', justifyContent:'center'}}>
                            <span style={{ fontSize: '13px', lineHeight:'1.2' }}>{currentUser.name}</span>
                            <span style={{ fontSize: '10px', color: '#999', lineHeight:'1' }}>
                                {currentUser.dept ? currentUser.dept : currentUser.roleName}
                            </span>
                        </div>
                        <i className="ri-arrow-down-s-line" style={{marginLeft:'5px', color:'#999'}}></i>

                        {activePanel === 'user' && (
                            <div className="header-dropdown panel-user" onClick={(e) => e.stopPropagation()}>
                                <div className="dropdown-item" onClick={() => openFullModal({type:'personal', title:'个人中心'})}><i className="ri-user-settings-line"></i> 个人中心</div>
                                <div className="dropdown-item" onClick={() => openFullModal({type:'password', title:'修改密码'})}><i className="ri-lock-password-line"></i> 修改密码</div>
                                <div className="divider"></div>
                                <div className="dropdown-item danger" onClick={() => logout()}><i className="ri-logout-box-line"></i> 退出登录</div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* AIP Overlay */}
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