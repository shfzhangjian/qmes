/**
 * @file: src/features/Production/ProductionOrderDetail.jsx
 * @description: 生产订单详情全屏编辑器 (自包含样式版)
 * - [Fix] 解决 CSS 路径解析失败问题，将样式整合至 JSX 确保预览正常
 * - [Fix] 确保 renderTableHeader 在正确的作用域内定义
 * - [UI] BOM与工艺路线表格对齐规则编辑器风格
 * - [Feature] 实现BOM与工艺路线的选择、行级维护与版本快照
 */
import React, { useState, useEffect, useRef } from 'react';

// 图标按钮组件
const ToolBtn = ({ children, onClick, type = 'default', iconOnly, active, title, disabled, className }) => {
    const classes = ['mdo-btn', type, iconOnly ? 'icon-only' : '', active ? 'active' : '', className].filter(Boolean).join(' ');
    return <button className={classes} onClick={onClick} title={title} disabled={disabled}>{children}</button>;
};

const ProductionOrderDetail = ({ visible, record, isEditing: initialIsEditing, onClose, onSubmit }) => {
    // --- 状态管理 ---
    const [formData, setFormData] = useState({});
    const [bomItems, setBomItems] = useState([]); // BOM 明细
    const [routeItems, setRouteItems] = useState([]); // 工艺明细
    const [activeTab, setActiveTab] = useState('bom'); // 'bom' | 'route'
    const [isMaximized, setIsMaximized] = useState(false);
    const [isEditing, setIsEditing] = useState(initialIsEditing);

    // 版本管理
    const [historyVisible, setHistoryVisible] = useState(false);
    const [historyList, setHistoryList] = useState([]);
    const [previewMode, setPreviewMode] = useState(false);
    const [activeHistoryId, setActiveHistoryId] = useState(null);
    const backupDataRef = useRef(null);

    // --- 初始化数据 ---
    useEffect(() => {
        if (visible) {
            setIsMaximized(false);
            setPreviewMode(false);
            if (record && record.id !== 'NEW') {
                setFormData({ ...record });
                // 模拟数据加载
                setBomItems([
                    { id: 1, matCode: 'RM-PUR-001', matName: '聚氨酯预聚体', reqQty: 2500, unit: 'kg', warehouse: 'A1冷库' },
                    { id: 2, matCode: 'RM-MOCA-02', matName: '固化剂', reqQty: 300, unit: 'kg', warehouse: 'A2库' }
                ]);
                setRouteItems([
                    { id: 10, seq: 10, opCode: 'OP10', opName: '原料预混', wc: 'WC-MIX-01', stdTime: 30 },
                    { id: 20, seq: 20, opCode: 'OP20', opName: '离心浇注', wc: 'WC-CAST-01', stdTime: 45 }
                ]);
                setHistoryList([
                    { id: 'h1', ver: 'V1.0', updateTime: '2026-01-15 10:00', updater: '吴计划', remark: '初始下达', snapshot: { formData: {...record}, bomItems: [], routeItems: [] } }
                ]);
            } else {
                setFormData({ id: 'NEW', qty: 0, priority: '普通', status: '草稿', version: 'V1.0', planStart: '', planEnd: '', productName: '', productCode: '', unit: '片' });
                setBomItems([]);
                setRouteItems([]);
                setHistoryList([]);
            }
        }
    }, [visible, record]);

    // --- 内部渲染助手 ---
    const renderTableHeader = () => {
        if (activeTab === 'bom') {
            return (
                <thead>
                <tr>
                    <th width="40" className="center">No</th>
                    <th width="150">物料编码</th>
                    <th>物料名称</th>
                    <th width="80" className="center">单位</th>
                    <th width="120" className="center">需求用量</th>
                    <th width="150">领料仓库</th>
                    <th width="50" className="center">操作</th>
                </tr>
                </thead>
            );
        }
        return (
            <thead>
            <tr>
                <th width="60" className="center">序号</th>
                <th width="120">工序代码</th>
                <th>工序名称</th>
                <th width="150">作业中心</th>
                <th width="100" className="center">标准工时(m)</th>
                <th width="50" className="center">操作</th>
            </tr>
            </thead>
        );
    };

    const renderTableBody = () => {
        if (activeTab === 'bom') {
            return (
                <tbody>
                {bomItems.map((item, i) => (
                    <tr key={item.id}>
                        <td className="center text-gray">{i + 1}</td>
                        <td><input className="cell-input" value={item.matCode} onChange={e => handleUpdateBomRow(item.id, 'matCode', e.target.value)} disabled={!isEditing} placeholder="选择或输入" /></td>
                        <td><input className="cell-input" value={item.matName} onChange={e => handleUpdateBomRow(item.id, 'matName', e.target.value)} disabled={!isEditing} /></td>
                        <td className="center">{item.unit}</td>
                        <td><input className="cell-input center" type="number" value={item.reqQty} onChange={e => handleUpdateBomRow(item.id, 'reqQty', e.target.value)} disabled={!isEditing} style={{ fontWeight: 'bold', color: '#1890ff' }} /></td>
                        <td><input className="cell-input" value={item.warehouse} onChange={e => handleUpdateBomRow(item.id, 'warehouse', e.target.value)} disabled={!isEditing} /></td>
                        <td className="center">
                            {isEditing && <i className="ri-delete-bin-line danger-icon" onClick={() => handleDeleteBomRow(item.id)}></i>}
                        </td>
                    </tr>
                ))}
                {bomItems.length === 0 && <tr><td colSpan={7} className="center text-gray" style={{ padding: '40px' }}>未维护生产用料</td></tr>}
                </tbody>
            );
        }
        return (
            <tbody>
            {routeItems.map((node, i) => (
                <tr key={node.id}>
                    <td className="center"><input className="cell-input center" type="number" value={node.seq} onChange={e => handleUpdateRouteRow(node.id, 'seq', e.target.value)} disabled={!isEditing} /></td>
                    <td><input className="cell-input" value={node.opCode} onChange={e => handleUpdateRouteRow(node.id, 'opCode', e.target.value)} disabled={!isEditing} /></td>
                    <td><input className="cell-input" value={node.opName} onChange={e => handleUpdateRouteRow(node.id, 'opName', e.target.value)} disabled={!isEditing} style={{ fontWeight: '500' }} /></td>
                    <td><input className="cell-input" value={node.wc} onChange={e => handleUpdateRouteRow(node.id, 'wc', e.target.value)} disabled={!isEditing} /></td>
                    <td><input className="cell-input center" type="number" value={node.stdTime} onChange={e => handleUpdateRouteRow(node.id, 'stdTime', e.target.value)} disabled={!isEditing} /></td>
                    <td className="center">
                        {isEditing && <i className="ri-delete-bin-line danger-icon" onClick={() => handleDeleteRouteRow(node.id)}></i>}
                    </td>
                </tr>
            ))}
            {routeItems.length === 0 && <tr><td colSpan={6} className="center text-gray" style={{ padding: '40px' }}>请定义生产工艺步骤</td></tr>}
            </tbody>
        );
    };

    // --- 业务函数 ---
    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleUpdateBomRow = (id, key, val) => setBomItems(bomItems.map(item => item.id === id ? { ...item, [key]: val } : item));
    const handleAddBomRow = () => setBomItems([...bomItems, { id: Date.now(), matCode: '', matName: '', reqQty: 0, unit: 'pcs', warehouse: '' }]);
    const handleDeleteBomRow = (id) => setBomItems(bomItems.filter(item => item.id !== id));

    const handleUpdateRouteRow = (id, key, val) => setRouteItems(routeItems.map(item => item.id === id ? { ...item, [key]: val } : item));
    const handleAddRouteRow = () => {
        const nextSeq = routeItems.length > 0 ? Math.max(...routeItems.map(r => r.seq)) + 10 : 10;
        setRouteItems([...routeItems, { id: Date.now(), seq: nextSeq, opCode: '', opName: '', wc: '', stdTime: 0 }]);
    };
    const handleDeleteRouteRow = (id) => setRouteItems(routeItems.filter(item => item.id !== id));

    const handleSelectBomTemplate = () => {
        if (!window.confirm('从物料主数据引入标准BOM将覆盖当前列表，是否继续？')) return;
        setBomItems([
            { id: Date.now() + 1, matCode: 'RM-PUR-001', matName: '聚氨酯预聚体', reqQty: (formData.qty * 5).toFixed(2), unit: 'kg', warehouse: 'A1冷库' },
            { id: Date.now() + 2, matCode: 'RM-MOCA-02', matName: '固化剂', reqQty: (formData.qty * 0.6).toFixed(2), unit: 'kg', warehouse: 'A2库' }
        ]);
    };

    const handlePublish = () => {
        if (!window.confirm(`确认发布并执行当前版本 ${formData.version} 吗？`)) return;
        const nextVer = formData.version.replace(/(\d+)$/, (m) => parseInt(m) + 1);
        const newHist = {
            id: Date.now(), ver: formData.version, updateTime: new Date().toLocaleString(),
            updater: '当前用户', remark: '订单修正下达',
            snapshot: { formData: { ...formData }, bomItems: [...bomItems], routeItems: [...routeItems] }
        };
        setHistoryList([newHist, ...historyList]);
        setFormData({ ...formData, version: nextVer, status: '进行中' });
        setHistoryVisible(true);
        if (onSubmit) onSubmit({ ...formData, version: nextVer });
    };

    const handlePreviewHistory = (h) => {
        if (!backupDataRef.current) backupDataRef.current = { formData, bomItems, routeItems };
        setFormData(h.snapshot.formData);
        setBomItems(h.snapshot.bomItems || []);
        setRouteItems(h.snapshot.routeItems || []);
        setPreviewMode(true);
        setIsEditing(false);
        setActiveHistoryId(h.id);
        setHistoryVisible(false);
    };

    const handleExitPreview = () => {
        if (backupDataRef.current) {
            setFormData(backupDataRef.current.formData);
            setBomItems(backupDataRef.current.bomItems);
            setRouteItems(backupDataRef.current.routeItems);
            backupDataRef.current = null;
        }
        setPreviewMode(false);
        setIsEditing(true);
        setActiveHistoryId(null);
    };

    if (!visible) return null;
    const windowClass = `mdo-window ${isMaximized ? 'maximized' : ''}`;

    return (
        <div className="overlay-fixed">
            <style>{`
                .overlay-fixed { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); z-index: 2000; display: flex; justify-content: center; alignItems: center; backdrop-filter: blur(3px); }
                .mdo-window { background-color: #fff; width: 1050px; height: 88vh; border-radius: 8px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); display: flex; flex-direction: column; overflow: hidden; position: relative; transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1); }
                .mdo-window.maximized { width: 100vw; height: 100vh; border-radius: 0; top: 0 !important; left: 0 !important; }
                .iqs-preview-banner { background-color: #fffbe6; border-bottom: 1px solid #ffe58f; padding: 8px 24px; color: #856404; font-size: 13px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
                .iqs-preview-banner .exit-link { color: #1890ff; cursor: pointer; font-weight: 600; }
                .mdo-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 0 20px; background-color: #fff; border-bottom: 1px solid #e8e8e8; height: 56px; flex-shrink: 0; z-index: 10; }
                .mdo-toolbar-left, .mdo-toolbar-right { display: flex; align-items: center; gap: 12px; }
                .mdo-icon { width: 32px; height: 32px; background: linear-gradient(135deg, #1890ff, #0050b3); color: #fff; border-radius: 6px; display: flex; justify-content: center; align-items: center; font-size: 18px; box-shadow: 0 2px 6px rgba(24, 144, 255, 0.2); }
                .mdo-title { font-size: 16px; font-weight: 600; color: #333; }
                .mdo-status-tag { font-size: 12px; padding: 2px 8px; border-radius: 4px; font-weight: 500; border: 1px solid transparent; }
                .mdo-status-tag.success { background: #f6ffed; color: #52c41a; border-color: #b7eb8f; border: 1px solid; }
                .mdo-status-tag.disabled { background: #f5f5f5; color: #999; border-color: #d9d9d9; border: 1px solid; }
                .mdo-version-tag { font-family: 'Consolas', monospace; background: #f0f2f5; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #595959; }
                .mdo-divider { width: 1px; height: 24px; background: #e8e8e8; margin: 0 4px; }
                .mdo-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 0 16px; height: 32px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; cursor: pointer; font-size: 13px; color: #595959; transition: all 0.2s; }
                .mdo-btn:hover:not(:disabled) { color: #1890ff; border-color: #1890ff; background-color: #f0f7ff; }
                .mdo-btn.primary { background: #1890ff; color: #fff; border: none; }
                .mdo-btn.close:hover { background: #ff4d4f; color: #fff; border-color: #ff4d4f; }
                .mdo-body { flex: 1; display: flex; flex-direction: column; overflow-y: auto; background: #f5f7fa; padding-bottom: 20px; }
                .mdo-section { background: #fff; margin: 16px 24px 0 24px; border: 1px solid #e8e8e8; border-radius: 4px; padding: 20px; flex-shrink: 0; }
                .section-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 16px; padding-left: 8px; border-left: 3px solid #1890ff; line-height: 1; }
                .mdo-table-section { flex: 1; display: flex; flex-direction: column; margin: 16px 24px 0 24px; background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
                .mdo-tabs { display: flex; border-bottom: 1px solid #e8e8e8; background: #fafafa; }
                .mdo-tab { padding: 12px 24px; cursor: pointer; font-size: 13px; color: #595959; border-bottom: 2px solid transparent; transition: all 0.2s; font-weight: 500; }
                .mdo-tab:hover { color: #1890ff; }
                .mdo-tab.active { color: #1890ff; border-bottom-color: #1890ff; background: #fff; }
                .mdo-table-wrapper { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
                .section-header { padding: 12px 16px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #fff; font-weight: 600; }
                .table-scroll { flex: 1; overflow: auto; background: #fff; }
                .sub-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .sub-table th { background: #f7f9fb; padding: 10px 12px; border-bottom: 2px solid #e8e8e8; border-right: 1px solid #f0f0f0; text-align: left; font-weight: 600; color: #595959; position: sticky; top: 0; z-index: 5; white-space: nowrap; }
                .sub-table td { padding: 0; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f0f0f0; height: 38px; vertical-align: middle; }
                .sub-table tr:hover td { background-color: #f0f7ff; }
                .cell-input { width: 100%; height: 38px; border: 1px solid transparent; background: transparent; padding: 0 10px; font-size: 13px; outline: none; transition: all 0.2s; }
                .cell-input:focus { background: #fff; border-color: #1890ff; box-shadow: inset 0 0 0 1px #1890ff; z-index: 1; }
                .cell-input.center { text-align: center; }
                .mdo-history-drawer { position: absolute; top: 0; right: -320px; width: 320px; height: 100%; background: #fff; border-left: 1px solid #e8e8e8; box-shadow: -4px 0 16px rgba(0,0,0,0.1); z-index: 100; transition: right 0.3s cubic-bezier(0.23, 1, 0.32, 1); display: flex; flex-direction: column; }
                .mdo-history-drawer.visible { right: 0; }
                .drawer-header { height: 56px; padding: 0 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; background: #fafafa; font-weight: bold; }
                .drawer-body { flex: 1; overflow-y: auto; padding: 16px; background: #fcfcfc; }
                .history-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 6px; padding: 12px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; }
                .history-card:hover { border-color: #1890ff; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
                .history-card.active { border-color: #1890ff; background-color: #e6f7ff; }
                .danger-icon { color: #ff4d4f; cursor: pointer; padding: 4px; transition: all 0.2s; }
                .center { text-align: center; }
                .form-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px 24px; }
                .form-item { display: flex; flex-direction: column; gap: 6px; }
                .form-item label { font-size: 12px; color: #666; font-weight: 500; }
                .std-input { width: 100%; height: 32px; border: 1px solid #d9d9d9; border-radius: 4px; padding: 0 10px; font-size: 13px; transition: all 0.2s; }
                .std-input:focus { border-color: #1890ff; box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1); outline: none; }
                .required::after { content: ' *'; color: #ff4d4f; }
            `}</style>

            <div className={windowClass}>
                {previewMode && (
                    <div className="iqs-preview-banner">
                        <span><i className="ri-history-line"></i> 您正在预览历史版本快照 <b>{formData.version}</b> (只读)</span>
                        <span className="exit-link" onClick={handleExitPreview}>退出预览并返回工作版</span>
                    </div>
                )}

                {/* 1. 工具栏 */}
                <div className="mdo-toolbar">
                    <div className="mdo-toolbar-left">
                        <div className="mdo-icon"><i className="ri-file-list-3-line"></i></div>
                        <span className="mdo-title">生产订单 (MO) 设计器</span>
                        <span className={`mdo-status-tag ${formData.status === '草稿' ? 'disabled' : 'success'}`}>{formData.status}</span>
                        <span className="mdo-version-tag">{formData.version}</span>
                    </div>
                    <div className="mdo-toolbar-right">
                        {previewMode ? (
                            <ToolBtn type="primary" onClick={handleExitPreview}><i className="ri-logout-box-r-line"></i> 退出预览</ToolBtn>
                        ) : (
                            <>
                                {isEditing ? (
                                    <>
                                        <ToolBtn onClick={() => alert('暂存成功')}><i className="ri-save-3-line"></i> 暂存</ToolBtn>
                                        <ToolBtn type="primary" onClick={handlePublish}><i className="ri-send-plane-fill"></i> 发布下达</ToolBtn>
                                    </>
                                ) : (
                                    <ToolBtn onClick={() => setIsEditing(true)}><i className="ri-edit-line"></i> 开启编辑</ToolBtn>
                                )}
                            </>
                        )}
                        <div className="mdo-divider"></div>
                        <ToolBtn iconOnly active={historyVisible} onClick={() => setHistoryVisible(!historyVisible)} title="版本历史"><i className="ri-history-line"></i></ToolBtn>
                        <div className="mdo-divider"></div>
                        <ToolBtn iconOnly onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? "还原" : "最大化"}><i className={`ri-${isMaximized ? 'fullscreen-exit' : 'fullscreen'}-line`}></i></ToolBtn>
                        <ToolBtn iconOnly onClick={onClose} className="close"><i className="ri-close-line"></i></ToolBtn>
                    </div>
                </div>

                {/* 2. 主体 */}
                <div className="mdo-body" style={{ background: previewMode ? '#fffbe6' : '#f5f7fa' }}>
                    <div className="mdo-section" style={{ background: previewMode ? '#fffbe6' : '#fff' }}>
                        <div className="section-title">订单核心属性</div>
                        <div className="form-grid-3">
                            <div className="form-item">
                                <label className="required">订单编号</label>
                                <input className="std-input" value={formData.id || ''} disabled />
                            </div>
                            <div className="form-item">
                                <label className="required">生产产品</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input className="std-input" value={formData.productName ? `${formData.productName} (${formData.productCode})` : ''} disabled />
                                    <button className="mdo-btn icon-only" disabled={!isEditing} onClick={() => alert('选择产品模块')}><i className="ri-search-line"></i></button>
                                </div>
                            </div>
                            <div className="form-item">
                                <label className="required">计划产量</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input className="std-input" type="number" value={formData.qty || 0} onChange={e => handleChange('qty', e.target.value)} disabled={!isEditing} />
                                    <span style={{ fontSize: '12px', color: '#666' }}>{formData.unit}</span>
                                </div>
                            </div>
                            <div className="form-item">
                                <label className="required">优先级</label>
                                <select className="std-input" value={formData.priority} onChange={e => handleChange('priority', e.target.value)} disabled={!isEditing}>
                                    <option>普通</option><option>高</option><option>紧急</option>
                                </select>
                            </div>
                            <div className="form-item">
                                <label className="required">开始日期</label>
                                <input className="std-input" type="date" value={formData.planStart} onChange={e => handleChange('planStart', e.target.value)} disabled={!isEditing} />
                            </div>
                            <div className="form-item">
                                <label className="required">交付日期</label>
                                <input className="std-input" type="date" value={formData.planEnd} onChange={e => handleChange('planEnd', e.target.value)} disabled={!isEditing} />
                            </div>
                        </div>
                    </div>

                    {/* 3. 动态维护区域 */}
                    <div className="mdo-table-section">
                        <div className="mdo-tabs">
                            <div className={`mdo-tab ${activeTab === 'bom' ? 'active' : ''}`} onClick={() => setActiveTab('bom')}><i className="ri-box-3-line"></i> 生产用料 (BOM)</div>
                            <div className={`mdo-tab ${activeTab === 'route' ? 'active' : ''}`} onClick={() => setActiveTab('route')}><i className="ri-route-line"></i> 生产工艺 (Routing)</div>
                        </div>

                        <div className="mdo-table-wrapper">
                            <div className="section-header">
                                <span>{activeTab === 'bom' ? '物料需求清单' : '生产工序卡'} (共 {activeTab === 'bom' ? bomItems.length : routeItems.length} 项)</span>
                                {isEditing && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {activeTab === 'bom' ? (
                                            <>
                                                <button className="mini-btn" onClick={handleSelectBomTemplate}>引入标准BOM</button>
                                                <button className="mini-btn primary" onClick={handleAddBomRow}>+ 新增物料</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="mini-btn">从工艺库引入</button>
                                                <button className="mini-btn primary" onClick={handleAddRouteRow}>+ 插入工序</button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="table-scroll">
                                <table className="sub-table">
                                    {renderTableHeader()}
                                    {renderTableBody()}
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="mdo-section" style={{ marginTop: 'auto', background: previewMode ? '#fffbe6' : '#fff' }}>
                        <div className="form-item">
                            <label>计划备注</label>
                            <textarea className="std-input" style={{ height: '60px', padding: '8px' }} value={formData.desc || ''} onChange={e => handleChange('desc', e.target.value)} disabled={!isEditing} placeholder="输入排产注意事项..." />
                        </div>
                    </div>
                </div>

                {/* 4. 历史快照抽屉 */}
                <div className={`mdo-history-drawer ${historyVisible ? 'visible' : ''}`}>
                    <div className="drawer-header">
                        <span className="drawer-title"><i className="ri-history-line"></i> 版本追溯</span>
                        <i className="ri-close-line close-icon" onClick={() => setHistoryVisible(false)}></i>
                    </div>
                    <div className="drawer-body">
                        {historyList.map(h => (
                            <div key={h.id} className={`history-card ${activeHistoryId === h.id ? 'active' : ''}`} onClick={() => handlePreviewHistory(h)}>
                                <div className="hc-header"><span className="hc-ver">{h.ver}</span><span className="hc-date">{h.updateTime}</span></div>
                                <div className="hc-meta"><span>{h.updater}</span></div>
                                <div className="hc-remark">{h.remark}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductionOrderDetail;