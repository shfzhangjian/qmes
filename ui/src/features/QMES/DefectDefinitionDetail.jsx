/**
 * @file: src/features/QMES/DefectDefinitionDetail.jsx
 * @description: 质检缺陷详情窗口
 * - [UI] 自定义遮罩+全屏窗口，支持最大化、版本回溯
 */
import React, { useState, useEffect, useRef } from 'react';
import '../../styles/sys-comm-detail.css';
import './DefectDefinitionDetail.css';

const ToolBtn = ({ children, onClick, type = 'default', iconOnly, active, title, disabled, className }) => {
    const classes = ['dfd-btn', type, iconOnly ? 'icon-only' : '', active ? 'active' : '', className].filter(Boolean).join(' ');
    return <button className={classes} onClick={onClick} title={title} disabled={disabled}>{children}</button>;
};

const DefectDefinitionDetail = ({ visible, record, isEditing: initialIsEditing, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({});
    const [causeList, setCauseList] = useState([]);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isEditing, setIsEditing] = useState(initialIsEditing);

    // --- 版本与历史管理 ---
    const [historyVisible, setHistoryVisible] = useState(false);
    const [historyList, setHistoryList] = useState([]);
    const [previewMode, setPreviewMode] = useState(false);
    const [activeHistoryId, setActiveHistoryId] = useState(null);
    const backupDataRef = useRef(null);

    useEffect(() => {
        if (visible) {
            setIsMaximized(false);
            setPreviewMode(false);
            setHistoryVisible(false);
            if (record) {
                setFormData({ ...record });
                setCauseList([
                    { id: 1, cause: '模具磨损', solution: '定期抛光模具', dept: '工程部' },
                    { id: 2, cause: '原材料杂质', solution: '加强进料管控', dept: '品质部' }
                ]);
                setHistoryList([
                    {
                        id: 'h1', ver: 'V1.1', updateTime: '2025-12-20', updater: '张品质', remark: '优化缺陷描述',
                        snapshot: { formData: { ...record, version: 'V1.1' }, causeList: [] }
                    }
                ]);
            } else {
                setFormData({ code: '', name: '', category: '表面缺陷', severity: 'Major', status: '草稿', version: 'V1.0' });
                setCauseList([]);
                setHistoryList([]);
            }
        }
    }, [visible, record]);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
    const handleCauseChange = (id, key, val) => setCauseList(causeList.map(c => c.id === id ? { ...c, [key]: val } : c));
    const handleAddCause = () => setCauseList([...causeList, { id: Date.now(), cause: '', solution: '', dept: '' }]);
    const handleDeleteCause = (id) => setCauseList(causeList.filter(c => c.id !== id));

    // --- 核心逻辑: 发布 ---
    const handlePublish = () => {
        if (!window.confirm(`确认发布当前版本 ${formData.version} 吗？发布后将归档历史。`)) return;
        const nextVer = formData.version.replace(/(\d+)$/, (m) => parseInt(m) + 1);
        const newHist = {
            id: Date.now(), ver: formData.version, updateTime: new Date().toLocaleString(),
            updater: '当前用户', remark: '正式发布',
            snapshot: { formData: JSON.parse(JSON.stringify(formData)), causeList: [...causeList] }
        };
        setHistoryList([newHist, ...historyList]);
        setFormData({ ...formData, version: nextVer, status: '启用' });
        setHistoryVisible(true);
        if (onSubmit) onSubmit({ ...formData, version: nextVer });
    };

    // --- 核心逻辑: 预览回溯 ---
    const handlePreviewHistory = (h) => {
        if (!backupDataRef.current) backupDataRef.current = { formData, causeList };
        setFormData(h.snapshot.formData);
        setCauseList(h.snapshot.causeList || []);
        setPreviewMode(true);
        setIsEditing(false);
        setActiveHistoryId(h.id);
        setHistoryVisible(false);
    };

    const handleExitPreview = () => {
        if (backupDataRef.current) {
            setFormData(backupDataRef.current.formData);
            setCauseList(backupDataRef.current.causeList);
            backupDataRef.current = null;
        }
        setPreviewMode(false);
        setIsEditing(true);
        setActiveHistoryId(null);
    };

    if (!visible) return null;

    const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(2px)' };
    const windowClass = `dfd-window ${isMaximized ? 'maximized' : ''}`;

    return (
        <div style={overlayStyle}>
            <div className={windowClass}>

                {previewMode && (
                    <div className="iqs-preview-banner">
                        <span><i className="ri-history-line"></i> 您当前正在预览历史快照 <b>{formData.version}</b> (只读模式)</span>
                        <span className="exit-link" onClick={handleExitPreview}>退出预览并返回工作版</span>
                    </div>
                )}

                {/* 工具栏 */}
                <div className="dfd-toolbar">
                    <div className="dfd-toolbar-left">
                        <div className="dfd-icon"><i className="ri-bug-line"></i></div>
                        <span className="dfd-title">缺陷代码定义详情</span>
                        <span className={`dfd-status-tag ${formData.status === '启用' ? 'success' : 'disabled'}`}>{formData.status}</span>
                        <span className="dfd-version-tag">{formData.version}</span>
                    </div>
                    <div className="dfd-toolbar-right">
                        {previewMode ? (
                            <ToolBtn type="primary" onClick={handleExitPreview}><i className="ri-logout-box-r-line"></i> 退出预览</ToolBtn>
                        ) : (
                            <>
                                {isEditing ? (
                                    <>
                                        <ToolBtn onClick={() => alert('已保存暂存')}><i className="ri-save-3-line"></i> 暂存</ToolBtn>
                                        <ToolBtn type="primary" onClick={handlePublish}><i className="ri-send-plane-fill"></i> 发布生效</ToolBtn>
                                    </>
                                ) : (
                                    <ToolBtn onClick={() => setIsEditing(true)}><i className="ri-edit-line"></i> 编辑代码</ToolBtn>
                                )}
                            </>
                        )}
                        <div className="dfd-divider"></div>
                        <ToolBtn iconOnly active={historyVisible} onClick={() => setHistoryVisible(!historyVisible)} title="查看版本历史"><i className="ri-history-line"></i></ToolBtn>
                        <div className="dfd-divider"></div>
                        <ToolBtn iconOnly onClick={() => setIsMaximized(!isMaximized)} title={isMaximized?"还原":"最大化"}><i className={`ri-${isMaximized ? 'fullscreen-exit' : 'fullscreen'}-line`}></i></ToolBtn>
                        <ToolBtn iconOnly onClick={onClose} className="close"><i className="ri-close-line"></i></ToolBtn>
                    </div>
                </div>

                {/* 内容 */}
                <div className="dfd-body" style={{background: previewMode ? '#fffbe6' : '#f5f7fa'}}>
                    <div className="dfd-section" style={{background: previewMode ? '#fffbe6' : '#fff'}}>
                        <div className="section-title">核心属性定义</div>
                        <div className="form-grid-3">
                            <div className="form-item">
                                <label className="required">代码/编码</label>
                                <input className="std-input" value={formData.code || ''} onChange={e => handleChange('code', e.target.value)} disabled={!!record || !isEditing} />
                            </div>
                            <div className="form-item">
                                <label className="required">缺陷名称 (CN)</label>
                                <input className="std-input" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} disabled={!isEditing} />
                            </div>
                            <div className="form-item">
                                <label className="required">严重度</label>
                                <select className="std-input" value={formData.severity || 'Major'} onChange={e => handleChange('severity', e.target.value)} disabled={!isEditing}>
                                    <option value="Critical">Critical (致命)</option>
                                    <option value="Major">Major (严重)</option>
                                    <option value="Minor">Minor (轻微)</option>
                                </select>
                            </div>
                            <div className="form-item">
                                <label>缺陷分类</label>
                                <select className="std-input" value={formData.category || '表面缺陷'} onChange={e => handleChange('category', e.target.value)} disabled={!isEditing}>
                                    <option>表面缺陷</option><option>尺寸公差</option><option>物理性能</option>
                                </select>
                            </div>
                            <div className="form-item">
                                <label>判定标准引用</label>
                                <input className="std-input" value={formData.standard || ''} onChange={e => handleChange('standard', e.target.value)} disabled={!isEditing} />
                            </div>
                            <div className="form-item">
                                <label>状态</label>
                                <select className="std-input" value={formData.status || '启用'} onChange={e => handleChange('status', e.target.value)} disabled={!isEditing}>
                                    <option>启用</option><option>停用</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-item" style={{marginTop:'12px'}}>
                            <label>缺陷现象详细描述</label>
                            <textarea className="std-input" style={{height:'50px'}} value={formData.desc || ''} onChange={e => handleChange('desc', e.target.value)} disabled={!isEditing} />
                        </div>
                    </div>

                    {/* 原因分析表格 - 编辑器风格 */}
                    <div className="dfd-table-section">
                        <div className="section-header">
                            <span><i className="ri-list-settings-line"></i> 可能原因及对策建议</span>
                            {isEditing && <button className="mini-btn primary" onClick={handleAddCause}>+ 新增行</button>}
                        </div>
                        <div className="table-scroll">
                            <table className="sub-table">
                                <thead>
                                <tr>
                                    <th width="50" className="center">No</th>
                                    <th width="240">主要原因 (Cause)</th>
                                    <th>推荐对策 (Countermeasure)</th>
                                    <th width="120">责任单位</th>
                                    <th width="60" className="center">操作</th>
                                </tr>
                                </thead>
                                <tbody>
                                {causeList.map((c, i) => (
                                    <tr key={c.id}>
                                        <td className="center text-gray">{i + 1}</td>
                                        <td><input className="cell-input" value={c.cause} onChange={e => handleCauseChange(c.id, 'cause', e.target.value)} disabled={!isEditing} /></td>
                                        <td><input className="cell-input" value={c.solution} onChange={e => handleCauseChange(c.id, 'solution', e.target.value)} disabled={!isEditing} /></td>
                                        <td><input className="cell-input" value={c.dept} onChange={e => handleCauseChange(c.id, 'dept', e.target.value)} disabled={!isEditing} /></td>
                                        <td className="center">
                                            {isEditing && <i className="ri-delete-bin-line danger-icon" onClick={()=>handleDeleteCause(c.id)}></i>}
                                        </td>
                                    </tr>
                                ))}
                                {causeList.length === 0 && <tr><td colSpan={5} className="center text-gray" style={{padding:'20px'}}>暂无经验库数据</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 历史抽屉 */}
                <div className={`dfd-history-drawer ${historyVisible ? 'visible' : ''}`}>
                    <div className="drawer-header">
                        <span className="drawer-title"><i className="ri-history-line"></i> 版本历史</span>
                        <i className="ri-close-line icon-btn" onClick={() => setHistoryVisible(false)}></i>
                    </div>
                    <div className="drawer-body">
                        {historyList.length === 0 ? <div className="empty-tip">无历史快照</div> :
                            historyList.map(h => (
                                <div key={h.id} className={`history-card ${activeHistoryId === h.id ? 'active' : ''}`} onClick={() => handlePreviewHistory(h)}>
                                    <div className="hc-header"><span className="hc-ver">{h.ver}</span><span className="hc-date">{h.updateTime}</span></div>
                                    <div className="hc-meta"><span>{h.updater}</span></div>
                                    <div className="hc-remark">{h.remark}</div>
                                </div>
                            ))
                        }
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DefectDefinitionDetail;