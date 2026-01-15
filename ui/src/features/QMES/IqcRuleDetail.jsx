/**
 * @file: src/features/QMES/IqcRuleDetail.jsx
 * @description: 检验规则详情页
 * - [Refactor] 移除底栏日志，增加版本发布与历史快照回溯功能
 * - [Feature] 动态表单联动: 全检 / 百分比 / 国标 AQL
 * - [UI] 严格参考 AbnormalEventDetail 风格 (全屏弹窗)
 */
import React, { useState, useEffect, useRef } from 'react';
import '../../styles/sys-comm-detail.css'; // 通用样式
import './IqcRuleDetail.css'; // 组件样式

const ToolBtn = ({ children, onClick, type = 'default', iconOnly, active, title, disabled }) => {
    const classes = ['iqr-btn', type, iconOnly ? 'icon-only' : '', active ? 'active' : ''].filter(Boolean).join(' ');
    return <button className={classes} onClick={onClick} title={title} disabled={disabled}>{children}</button>;
};

const IqcRuleDetail = ({ visible, record, isEditing: initialIsEditing, onClose, onSubmit }) => {
    // --- 状态 ---
    const [formData, setFormData] = useState({});
    const [ruleItems, setRuleItems] = useState([]); // 仅用于 GB2828 的明细表
    const [activeTab, setActiveTab] = useState('normal'); // normal, tightened, reduced
    const [isMaximized, setIsMaximized] = useState(false);
    const [isEditing, setIsEditing] = useState(initialIsEditing);

    // 版本控制相关状态
    const [historyVisible, setHistoryVisible] = useState(false);
    const [historyList, setHistoryList] = useState([]);
    const [previewMode, setPreviewMode] = useState(false);
    const [activeHistoryId, setActiveHistoryId] = useState(null);

    // 备份数据引用 (用于退出预览时恢复当前正在编辑的内容)
    const backupDataRef = useRef(null);

    // --- 初始化 ---
    useEffect(() => {
        if (visible) {
            setIsMaximized(false);
            setPreviewMode(false);
            setHistoryVisible(false);
            setActiveHistoryId(null);
            backupDataRef.current = null;

            if (record) {
                // 编辑模式：加载数据
                const initData = {
                    ...record,
                    percentageRule: record.percentageRule || { normal: { sample: '', pass: '' }, reduced: { sample: '', pass: '' }, tightened: { sample: '', pass: '' } },
                    aqlRule: record.aqlRule || { level: 'II', critical: '0.010', major: '0.65', minor: '2.5' },
                    transferRule: record.transferRule || { normalToTight: 5, tightToNormal: 5, normalToReduced: 10 }
                };
                setFormData(initData);

                // 如果是国标，加载明细 (模拟)
                if (record.samplingType === 'GB2828') {
                    setRuleItems([
                        { id: 1, min: 1, max: 8, code: 'A', sampleSize: 2, ac: 0, re: 1, k: '-' },
                        { id: 2, min: 9, max: 15, code: 'B', sampleSize: 3, ac: 0, re: 1, k: '-' },
                    ]);
                } else {
                    setRuleItems([]);
                }

                // 模拟历史记录
                setHistoryList([
                    {
                        id: 'hist_v1', ver: 'V1.0', updateTime: '2025-12-01', updater: '张品质', remark: '系统初始化导入',
                        snapshot: {
                            formData: { ...initData, version: 'V1.0' },
                            ruleItems: []
                        }
                    }
                ]);
            } else {
                // 新增模式：默认值
                setFormData({
                    code: '', name: '', samplingType: 'GB2828',
                    desc: '', status: '启用', version: 'V1.0',
                    percentageRule: {
                        normal: { sample: 20, pass: 100 },
                        reduced: { sample: 10, pass: 100 },
                        tightened: { sample: 50, pass: 100 }
                    },
                    aqlRule: { level: 'II', critical: '0.010', major: '0.65', minor: '2.5' },
                    transferRule: { normalToTight: 5, tightToNormal: 5, normalToReduced: 10 }
                });
                setRuleItems([]);
                setHistoryList([]);
            }
        }
    }, [visible, record]);

    // --- 字段变更处理 (保持原有功能) ---
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDeepChange = (parentField, subField, key, value) => {
        setFormData(prev => ({
            ...prev,
            [parentField]: {
                ...prev[parentField],
                [subField]: { ...prev[parentField][subField], [key]: value }
            }
        }));
    };

    const handleSubChange = (parentField, key, value) => {
        setFormData(prev => ({
            ...prev,
            [parentField]: { ...prev[parentField], [key]: value }
        }));
    };

    const handleItemChange = (id, field, value) => {
        setRuleItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleAddItem = () => {
        const lastItem = ruleItems[ruleItems.length - 1];
        const newMin = lastItem ? parseInt(lastItem.max) + 1 : 1;
        setRuleItems([...ruleItems, {
            id: Date.now(), min: newMin, max: newMin + 10, code: '?', sampleSize: 0, ac: 0, re: 1, k: 0
        }]);
    };

    const handleDeleteItem = (id) => {
        setRuleItems(prev => prev.filter(i => i.id !== id));
    };

    // --- 核心功能：版本发布 ---
    const handlePublish = () => {
        if (!window.confirm(`确认发布并归档当前版本 ${formData.version} 吗？`)) return;

        const snapshot = {
            formData: JSON.parse(JSON.stringify(formData)),
            ruleItems: JSON.parse(JSON.stringify(ruleItems))
        };

        const newHist = {
            id: Date.now(),
            ver: formData.version,
            updateTime: new Date().toLocaleString(),
            updater: '当前用户',
            remark: '发布正式生效',
            snapshot: snapshot
        };

        setHistoryList([newHist, ...historyList]);

        // 版本升级逻辑 V1.0 -> V1.1
        const nextVer = formData.version.replace(/(\d+)$/, (match) => parseInt(match) + 1);
        setFormData(prev => ({ ...prev, version: nextVer, status: '启用' }));

        setHistoryVisible(true);
        if(onSubmit) onSubmit({...formData, items: ruleItems});
    };

    // --- 核心功能：历史回溯预览 ---
    const handlePreviewHistory = (hist) => {
        if (!hist.snapshot) return alert("该版本无快照数据");

        // 备份当前正在工作的数据
        if (!backupDataRef.current) {
            backupDataRef.current = { formData, ruleItems };
        }

        setFormData(hist.snapshot.formData);
        setRuleItems(hist.snapshot.ruleItems || []);
        setPreviewMode(true);
        setIsEditing(false);
        setActiveHistoryId(hist.id);
        setHistoryVisible(false);
    };

    const handleExitPreview = () => {
        if (backupDataRef.current) {
            setFormData(backupDataRef.current.formData);
            setRuleItems(backupDataRef.current.ruleItems);
            backupDataRef.current = null;
        }
        setPreviewMode(false);
        setIsEditing(true);
        setActiveHistoryId(null);
    };

    // 样式计算
    const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(2px)' };
    const windowClass = `iqr-window ${isMaximized ? 'maximized' : ''}`;

    const renderTableHeader = () => {
        const type = formData.samplingType;
        return (
            <thead>
            <tr>
                <th width="50" className="center">序号</th>
                <th width="120" className="center">批量下限 (≥)</th>
                <th width="120" className="center">批量上限 (≤)</th>
                <th width="80" className="center">样本字码</th>
                <th width="100" className="center">样本量</th>
                <th width="80" className="center">AC (接收)</th>
                <th width="80" className="center">RE (拒收)</th>
                <th width="100" className="center">k值 (系数)</th>
                <th width="60" className="center">操作</th>
            </tr>
            </thead>
        );
    };

    const renderTableBody = () => {
        return (
            <tbody>
            {ruleItems.map((item, index) => (
                <tr key={item.id}>
                    <td className="center text-gray">{index + 1}</td>
                    <td><input className="cell-input center" type="number" value={item.min} onChange={e=>handleItemChange(item.id, 'min', e.target.value)} disabled={!isEditing} /></td>
                    <td><input className="cell-input center" type="number" value={item.max} onChange={e=>handleItemChange(item.id, 'max', e.target.value)} disabled={!isEditing} /></td>
                    <td><input className="cell-input center" value={item.code} onChange={e=>handleItemChange(item.id, 'code', e.target.value)} disabled={!isEditing} style={{fontWeight:'bold', color:'#1890ff'}} /></td>
                    <td><input className="cell-input center" type="number" value={item.sampleSize} onChange={e=>handleItemChange(item.id, 'sampleSize', e.target.value)} disabled={!isEditing} style={{fontWeight:'bold'}} /></td>
                    <td><input className="cell-input center" type="number" value={item.ac} onChange={e=>handleItemChange(item.id, 'ac', e.target.value)} disabled={!isEditing} style={{color:'#52c41a', fontWeight:'bold'}} /></td>
                    <td><input className="cell-input center" type="number" value={item.re} onChange={e=>handleItemChange(item.id, 're', e.target.value)} disabled={!isEditing} style={{color:'#ff4d4f', fontWeight:'bold'}} /></td>
                    <td><input className="cell-input center" type="number" value={item.k} onChange={e=>handleItemChange(item.id, 'k', e.target.value)} disabled={!isEditing} placeholder="-" /></td>
                    <td className="center">
                        {isEditing && <i className="ri-delete-bin-line danger-icon" onClick={()=>handleDeleteItem(item.id)}></i>}
                    </td>
                </tr>
            ))}
            {ruleItems.length === 0 && <tr><td colSpan={9} className="center text-gray" style={{padding:'20px'}}>请添加抽样方案</td></tr>}
            </tbody>
        );
    };

    if (!visible) return null;

    return (
        <div style={overlayStyle}>
            <div className={windowClass}>

                {/* 预览模式横幅 */}
                {previewMode && (
                    <div className="iqs-preview-banner">
                        <span><i className="ri-history-line"></i> 您当前正在预览历史快照 <b>{formData.version}</b> (只读模式)</span>
                        <span className="exit-link" onClick={handleExitPreview}>退出预览并返回工作版</span>
                    </div>
                )}

                {/* 1. 顶部工具栏 */}
                <div className="iqr-toolbar">
                    <div className="iqr-toolbar-left">
                        <div className="iqr-icon"><i className="ri-ruler-2-line"></i></div>
                        <span className="iqr-title">检验策略配置</span>
                        <span className={`iqr-status-tag ${formData.status === '启用' ? 'success' : 'disabled'}`}>{formData.status}</span>
                        <span className="iqr-version-tag">{formData.version}</span>
                    </div>
                    <div className="iqr-toolbar-right">
                        {previewMode ? (
                            <ToolBtn type="primary" onClick={handleExitPreview}><i className="ri-logout-box-r-line"></i> 退出预览</ToolBtn>
                        ) : (
                            <>
                                {isEditing ? (
                                    <>
                                        <ToolBtn onClick={() => alert('已暂存')}><i className="ri-save-3-line"></i> 暂存</ToolBtn>
                                        <ToolBtn type="primary" onClick={handlePublish}><i className="ri-send-plane-fill"></i> 发布</ToolBtn>
                                    </>
                                ) : (
                                    <ToolBtn onClick={() => setIsEditing(true)}><i className="ri-edit-line"></i> 编辑</ToolBtn>
                                )}
                            </>
                        )}
                        <div className="iqr-divider"></div>
                        <ToolBtn iconOnly active={historyVisible} onClick={() => setHistoryVisible(!historyVisible)} title="查看版本历史"><i className="ri-history-line"></i></ToolBtn>
                        <div className="iqr-divider"></div>
                        <ToolBtn iconOnly onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? "还原" : "最大化"}>
                            <i className={`ri-${isMaximized ? 'fullscreen-exit' : 'fullscreen'}-line`}></i>
                        </ToolBtn>
                        <ToolBtn iconOnly onClick={onClose} className="close"><i className="ri-close-line"></i></ToolBtn>
                    </div>
                </div>

                {/* 2. 主内容区域 */}
                <div className="iqr-body" style={{background: previewMode ? '#fffbe6' : '#f5f7fa'}}>

                    {/* 2.1 基础信息区域 */}
                    <div className="iqr-section" style={{background: previewMode ? '#fffbe6' : '#fff'}}>
                        <div className="section-title">基础信息</div>
                        <div className="form-grid-2">
                            <div className="form-item">
                                <label className="required">规则编码</label>
                                <input className="std-input" value={formData.code || ''} onChange={e => handleChange('code', e.target.value)} disabled={!!record} placeholder="自动生成" />
                            </div>
                            <div className="form-item">
                                <label className="required">规则名称</label>
                                <input className="std-input" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} disabled={!isEditing} />
                            </div>
                            <div className="form-item">
                                <label className="required">抽样方案</label>
                                <select className="std-input" value={formData.samplingType || 'GB2828'} onChange={e => handleChange('samplingType', e.target.value)} disabled={!isEditing}>
                                    <option value="FULL">全检抽样</option>
                                    <option value="PERCENT">百分比抽样</option>
                                    <option value="GB2828">GB/T 2828.1-2012 (国标)</option>
                                </select>
                            </div>
                            <div className="form-item">
                                <label>状态</label>
                                <select className="std-input" value={formData.status || '启用'} onChange={e => handleChange('status', e.target.value)} disabled={!isEditing}>
                                    <option>启用</option><option>停用</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 2.2 动态配置区域 */}
                    {formData.samplingType === 'FULL' && (
                        <div className="iqr-section empty-state">
                            <i className="ri-checkbox-circle-line"></i>
                            <p>当前选择【全检抽样】，所有物料均需 100% 检验，无需配置抽样参数。</p>
                        </div>
                    )}

                    {formData.samplingType === 'PERCENT' && (
                        <div className="iqr-section" style={{background: previewMode ? '#fffbe6' : '#fff'}}>
                            <div className="section-title">定比例抽样规则</div>
                            <div className="percent-rule-table">
                                <div className="pr-header">
                                    <span>检验严格度</span>
                                    <span>抽样数量百分比 (%)</span>
                                    <span>合格数量百分比 (%)</span>
                                </div>
                                <div className="pr-row">
                                    <span className="row-label normal">正常抽样</span>
                                    <input className="std-input" type="number" value={formData.percentageRule?.normal?.sample} onChange={e => handleDeepChange('percentageRule', 'normal', 'sample', e.target.value)} disabled={!isEditing} />
                                    <input className="std-input" type="number" value={formData.percentageRule?.normal?.pass} onChange={e => handleDeepChange('percentageRule', 'normal', 'pass', e.target.value)} disabled={!isEditing} />
                                </div>
                                <div className="pr-row">
                                    <span className="row-label reduced">放宽抽样</span>
                                    <input className="std-input" type="number" value={formData.percentageRule?.reduced?.sample} onChange={e => handleDeepChange('percentageRule', 'reduced', 'sample', e.target.value)} disabled={!isEditing} />
                                    <input className="std-input" type="number" value={formData.percentageRule?.reduced?.pass} onChange={e => handleDeepChange('percentageRule', 'reduced', 'pass', e.target.value)} disabled={!isEditing} />
                                </div>
                                <div className="pr-row">
                                    <span className="row-label tightened">加严抽样</span>
                                    <input className="std-input" type="number" value={formData.percentageRule?.tightened?.sample} onChange={e => handleDeepChange('percentageRule', 'tightened', 'sample', e.target.value)} disabled={!isEditing} />
                                    <input className="std-input" type="number" value={formData.percentageRule?.tightened?.pass} onChange={e => handleDeepChange('percentageRule', 'tightened', 'pass', e.target.value)} disabled={!isEditing} />
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.samplingType === 'GB2828' && (
                        <>
                            {/* 国标转移规则编辑器 */}
                            <div className="iqr-section" style={{background: previewMode ? '#fffbe6' : '#fff'}}>
                                <div className="section-title">转移规则逻辑编辑器 (Transition Rules)</div>
                                <div className="rule-editor-container">
                                    <div className="logic-block">
                                        <div className="logic-sentence">
                                            <span className="node normal">正常</span>
                                            <i className="ri-arrow-right-line"></i>
                                            <span className="node tightened">加严</span>
                                            <span className="logic-text">逻辑：连续</span>
                                            <input className="logic-input" value={formData.transferRule?.normalToTight} onChange={e => handleSubChange('transferRule', 'normalToTight', e.target.value)} disabled={!isEditing} />
                                            <span className="logic-text">批次内有</span>
                                            <input className="logic-input" value={formData.transferRule?.tightInX} onChange={e => handleSubChange('transferRule', 'tightInX', e.target.value)} disabled={!isEditing} />
                                            <span className="logic-text">批不接收。</span>
                                        </div>
                                    </div>
                                    <div className="logic-block">
                                        <div className="logic-sentence">
                                            <span className="node tightened">加严</span>
                                            <i className="ri-arrow-right-line"></i>
                                            <span className="node normal">正常</span>
                                            <span className="logic-text">逻辑：连续</span>
                                            <input className="logic-input" value={formData.transferRule?.tightToNormal} onChange={e => handleSubChange('transferRule', 'tightToNormal', e.target.value)} disabled={!isEditing} />
                                            <span className="logic-text">批次被接收。</span>
                                        </div>
                                    </div>
                                    <div className="logic-block">
                                        <div className="logic-sentence">
                                            <span className="node normal">正常</span>
                                            <i className="ri-arrow-right-line"></i>
                                            <span className="node reduced">放宽</span>
                                            <span className="logic-text">逻辑：连续</span>
                                            <input className="logic-input" value={formData.transferRule?.normalToReduced} onChange={e => handleSubChange('transferRule', 'normalToReduced', e.target.value)} disabled={!isEditing} />
                                            <span className="logic-text">批次被接收且生产正常。</span>
                                        </div>
                                    </div>
                                    <div className="logic-block">
                                        <div className="logic-sentence">
                                            <span className="node reduced">放宽</span>
                                            <i className="ri-arrow-right-line"></i>
                                            <span className="node normal">正常</span>
                                            <span className="logic-text">逻辑：</span>
                                            <input className="logic-input" value={formData.transferRule?.reducedToNormal} onChange={e => handleSubChange('transferRule', 'reducedToNormal', e.target.value)} disabled={!isEditing} />
                                            <span className="logic-text">批次不接收。</span>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </>
                    )}

                    {/* 底部备注 */}
                    <div className="iqr-section" style={{background: previewMode ? '#fffbe6' : '#fff'}}>
                        <div className="form-item">
                            <label>备注说明</label>
                            <textarea className="std-input" style={{height:'80px', paddingTop:'8px'}} value={formData.desc || ''} onChange={e => handleChange('desc', e.target.value)} disabled={!isEditing}></textarea>
                        </div>
                    </div>
                </div>

                {/* 3. 历史版本抽屉 */}
                <div className={`iqr-history-drawer ${historyVisible ? 'visible' : ''}`}>
                    <div className="drawer-header">
                        <span className="drawer-title"><i className="ri-history-line"></i> 版本历史快照</span>
                        <i className="ri-close-line close-icon" onClick={() => setHistoryVisible(false)}></i>
                    </div>
                    <div className="drawer-body">
                        {historyList.length === 0 ? <div className="empty-tip">暂无历史归档记录</div> :
                            historyList.map(h => (
                                <div key={h.id} className={`history-card ${activeHistoryId === h.id ? 'active' : ''}`} onClick={() => handlePreviewHistory(h)}>
                                    <div className="hc-header">
                                        <span className="hc-ver">{h.ver}</span>
                                        <span className="hc-date">{h.updateTime}</span>
                                    </div>
                                    <div className="hc-meta">
                                        <span className="hc-user"><i className="ri-user-line"></i> {h.updater}</span>
                                    </div>
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

export default IqcRuleDetail;