/**
 * @file: src/features/Production/ProcessRouteDetail.jsx
 * @description: 工艺路线深度编辑器 (完整版)
 * - [UI Update] SPC 列改为使用 ✅ 图标 (与 QcItemPicker 保持一致)
 * - [Interaction] 编辑模式下点击图标可切换 SPC 状态
 */
import React, { useState, useEffect } from 'react';
import metaData from '../../data/mock/processMeta.json';
import QcItemPicker from './QcItemPicker';
import './production.css';
import './ProcessRouteDetail.css';

// --- Components ---
const ToolBtn = ({ children, onClick, type = 'default', iconOnly, active, className, title, disabled }) => {
    const classes = ['pr-btn', type, iconOnly ? 'icon-only' : '', active ? 'active' : '', className].filter(Boolean).join(' ');
    return <button className={classes} onClick={onClick} title={title} disabled={disabled}>{children}</button>;
};

const ProcessRouteDetail = ({ visible, record, isEditing: initialIsEditing, onClose, onSubmit }) => {
    // --- State ---
    const [header, setHeader] = useState({});
    const [nodes, setNodes] = useState([]);
    const [activeNodeId, setActiveNodeId] = useState(null);
    const [activeTab, setActiveTab] = useState('basic');
    const [isMaximized, setIsMaximized] = useState(false);
    const [isEditing, setIsEditing] = useState(initialIsEditing);

    const [pickerVisible, setPickerVisible] = useState(false);

    // History & Preview
    const [historyVisible, setHistoryVisible] = useState(false);
    const [historyList, setHistoryList] = useState([]);
    const [previewMode, setPreviewMode] = useState(false);
    const [workingState, setWorkingState] = useState(null);

    // --- Helpers ---
    const generateMockSubData = (nodeId, type) => {
        const baseId = nodeId * 10000 + Date.now() % 10000;
        if (type === 'materials') {
            return metaData.materialLib.map((m, i) => ({
                ...m, id: baseId + i, qty: (Math.random() * 100).toFixed(1)
            })).slice(0, 8);
        } else if (type === 'outputs') {
            return metaData.outputLib.map((o, i) => ({
                ...o, id: baseId + i, code: `${o.code}-${nodeId}`
            })).slice(0, 5);
        } else if (type === 'qcStandards') {
            return metaData.qcLib.map((q, i) => ({
                ...q, id: baseId + i
            })).slice(0, 10);
        }
        return [];
    };

    // --- Effect: Init ---
    useEffect(() => {
        if (visible) {
            setPreviewMode(false);
            setWorkingState(null);
            setHistoryVisible(false);

            if (record) {
                const initHeader = { ...record };
                const initNodes = record.nodes ? JSON.parse(JSON.stringify(record.nodes)) : [];
                setHeader(initHeader);
                setNodes(initNodes);
                if (initNodes.length > 0) setActiveNodeId(initNodes[0].id);
                setHistoryList([{ version: 'V1.0', date: '2025-12-28', user: 'System', action: '创建', snapshot: { header: initHeader, nodes: initNodes } }]);
            } else {
                setHeader({ id: 'NEW', name: '12寸CMP抛光垫标准工艺', product: 'PAD-CMP-300', productName: '12寸晶圆CMP抛光垫', version: 'V1.0', status: '草稿', type: '量产工艺' });
                const mockNodes = metaData.opDefs.map(op => ({
                    ...op,
                    materials: generateMockSubData(op.id, 'materials'),
                    outputs: generateMockSubData(op.id, 'outputs'),
                    qcStandards: generateMockSubData(op.id, 'qcStandards')
                }));
                setNodes(mockNodes);
                setActiveNodeId(mockNodes[0].id);
                setHistoryList([]);
            }
        }
    }, [visible, record]);

    // --- Handlers: Publish/History ---
    const handlePublish = () => {
        if (!window.confirm(`确定要发布当前版本 ${header.version} 吗？`)) return;
        const snapshot = { header: { ...header, status: '已发布' }, nodes: JSON.parse(JSON.stringify(nodes)) };
        const nextVer = header.version.replace(/(\d+)$/, (match) => parseInt(match) + 1);
        const newHistoryItem = { version: header.version, date: new Date().toLocaleString(), user: '当前用户', action: '发布', remark: '常规发布', snapshot: snapshot };

        setHistoryList([newHistoryItem, ...historyList]);
        setHeader({ ...header, status: '已发布' });
        setHistoryVisible(true);
        onSubmit({...header, nodes, status: '已发布'});
    };

    const handlePreviewHistory = (item) => {
        if (!item.snapshot) return alert("无快照");
        if (!previewMode) setWorkingState({ header, nodes, activeNodeId, isEditing });
        setHeader(item.snapshot.header);
        setNodes(item.snapshot.nodes);
        if (item.snapshot.nodes.length > 0) setActiveNodeId(item.snapshot.nodes[0].id);
        setIsEditing(false);
        setPreviewMode(true);
    };

    const handleExitPreview = () => {
        if (workingState) {
            setHeader(workingState.header);
            setNodes(workingState.nodes);
            setActiveNodeId(workingState.activeNodeId);
            setIsEditing(workingState.isEditing);
        }
        setPreviewMode(false);
        setWorkingState(null);
    };

    // --- Handlers: Nodes & SubTables ---
    const handleAddNode = () => {
        const newId = Date.now();
        const newNode = {
            id: newId, opCode: `OP${(nodes.length + 1) * 10}`, opName: '新工序', type: '生产', wc: '', stdTime: 0,
            materials: [], outputs: [], qcStandards: []
        };
        setNodes([...nodes, newNode]);
        setActiveNodeId(newId);
        setActiveTab('basic');
    };

    const handleDeleteNode = (id) => {
        if (window.confirm('删除节点?')) {
            const newNodes = nodes.filter(n => n.id !== id);
            setNodes(newNodes);
            if (activeNodeId === id) setActiveNodeId(newNodes.length > 0 ? newNodes[0].id : null);
        }
    };

    const handleNodeChange = (field, value) => {
        setNodes(nodes.map(n => n.id === activeNodeId ? { ...n, [field]: value } : n));
    };

    const handleSubTableAdd = (field, template) => {
        const newNode = nodes.find(n => n.id === activeNodeId);
        if (!newNode) return;
        const newList = [...(newNode[field] || []), { ...template, id: Date.now() }];
        handleNodeChange(field, newList);
    };

    const handleSubTableDelete = (field, itemId) => {
        const newNode = nodes.find(n => n.id === activeNodeId);
        if (!newNode) return;
        const newList = newNode[field].filter(i => i.id !== itemId);
        handleNodeChange(field, newList);
    };

    const handleSubTableChange = (field, itemId, key, value) => {
        const newNode = nodes.find(n => n.id === activeNodeId);
        if (!newNode) return;
        const newList = newNode[field].map(i => i.id === itemId ? { ...i, [key]: value } : i);
        handleNodeChange(field, newList);
    };

    // --- Handlers: QC Picker ---
    const handleQcItemsSelected = (selectedItems) => {
        const newNode = nodes.find(n => n.id === activeNodeId);
        if (!newNode) return;

        const newStandards = selectedItems.map(item => ({
            ...item,
            id: Date.now() + Math.random(),
        }));

        const newList = [...(newNode.qcStandards || []), ...newStandards];
        handleNodeChange('qcStandards', newList);
    };

    // --- Render ---
    const activeNode = nodes.find(n => n.id === activeNodeId);
    if (!visible) return null;
    const windowClass = `pr-window ${isMaximized ? 'maximized' : ''}`;

    return (
        <div className="overlay-fixed">
            <div className={windowClass}>
                {/* Toolbar */}
                <div className="pr-toolbar">
                    <div className="pr-toolbar-left">
                        <div className="pr-icon"><i className="ri-node-tree"></i></div>
                        <span className="pr-title">工艺路线设计</span>
                        <span className={`pr-status-tag ${header.status === '已发布' ? 'success' : 'warning'}`}>{header.status}</span>
                        <span className="pr-version-tag">{header.version}</span>
                        {previewMode && <span className="q-tag warning" style={{marginLeft:'10px'}}><i className="ri-eye-line"></i> 历史快照预览模式</span>}
                    </div>
                    <div className="pr-toolbar-right">
                        {previewMode ? (
                            <ToolBtn type="primary" onClick={handleExitPreview}><i className="ri-logout-box-r-line"></i> 退出预览</ToolBtn>
                        ) : (
                            <>
                                {isEditing ? (
                                    <>
                                        <ToolBtn onClick={() => alert('暂存')}><i className="ri-save-3-line"></i> 暂存</ToolBtn>
                                        <ToolBtn type="primary" onClick={handlePublish}><i className="ri-send-plane-fill"></i> 发布</ToolBtn>
                                    </>
                                ) : (
                                    <ToolBtn onClick={() => setIsEditing(true)}><i className="ri-edit-line"></i> 编辑</ToolBtn>
                                )}
                            </>
                        )}
                        <div className="pr-divider"></div>
                        <ToolBtn iconOnly active={historyVisible} onClick={() => setHistoryVisible(!historyVisible)} title="查看历史"><i className="ri-history-line"></i></ToolBtn>
                        <div className="pr-divider"></div>
                        <ToolBtn iconOnly onClick={() => setIsMaximized(!isMaximized)} title={isMaximized?"还原":"最大化"}><i className={`ri-${isMaximized ? 'fullscreen-exit' : 'fullscreen'}-line`}></i></ToolBtn>
                        <ToolBtn iconOnly onClick={onClose} className="close"><i className="ri-close-line"></i></ToolBtn>
                    </div>
                </div>

                <div className="pr-main-container" style={{background: previewMode ? '#fffbe6' : '#fff'}}>
                    {/* Header */}
                    <div className="pr-header-area" style={{background: previewMode ? '#fffbe6' : '#fafafa'}}>
                        <div className="pr-header-form">
                            <div className="form-item"><label>工艺名称</label><input className="std-input" value={header.name||''} onChange={e=>setHeader({...header, name:e.target.value})} disabled={!isEditing} /></div>
                            <div className="form-item"><label>产品编码</label><input className="std-input" value={header.product||''} onChange={e=>setHeader({...header, product:e.target.value})} disabled={!isEditing} /></div>
                            <div className="form-item"><label>产品名称</label><input className="std-input" value={header.productName||''} onChange={e=>setHeader({...header, productName:e.target.value})} disabled={!isEditing} /></div>
                            <div className="form-item"><label>工艺类型</label><select className="std-input" value={header.type} onChange={e=>setHeader({...header, type:e.target.value})} disabled={!isEditing}><option>量产工艺</option><option>试制工艺</option><option>返工工艺</option></select></div>
                            <div className="form-item"><label>生效日期</label><input className="std-input" type="date" disabled={!isEditing} /></div>
                        </div>
                    </div>

                    {/* Editor Body */}
                    <div className="pr-editor-body" style={{background: previewMode ? '#fffbe6' : '#fff'}}>
                        {/* Sidebar */}
                        <div className="pr-sidebar" style={{background: previewMode ? '#fffbe6' : '#f5f7fa'}}>
                            <div className="pr-sidebar-header" style={{background: previewMode ? '#fffbe6' : '#fff'}}>
                                <span>工序流程 ({nodes.length})</span>
                                {isEditing && <button className="mini-btn primary" onClick={handleAddNode}><i className="ri-add-line"></i></button>}
                            </div>
                            <div className="pr-node-list">
                                {nodes.map((node, index) => (
                                    <div key={node.id} className={`pr-node-item ${node.id === activeNodeId ? 'active' : ''}`} onClick={() => setActiveNodeId(node.id)} style={{background: node.id === activeNodeId && !previewMode ? '#e6f7ff' : 'transparent'}}>
                                        <div className="pr-node-seq">{index + 10}</div>
                                        <div className="pr-node-info"><div className="pr-node-title">{node.opName}</div><div className="pr-node-code">{node.opCode}</div></div>
                                        {isEditing && <div className="pr-node-actions"><i className="ri-delete-bin-line danger-icon" onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}></i></div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="pr-content" style={{background: previewMode ? '#fffbe6' : '#fff'}}>
                            {activeNode ? (
                                <>
                                    <div className="pr-tabs" style={{background: previewMode ? '#fffbe6' : '#fafafa'}}>
                                        <div className={`pr-tab ${activeTab==='basic'?'active':''}`} onClick={()=>setActiveTab('basic')}><i className="ri-settings-line"></i> 基础定义</div>
                                        <div className={`pr-tab ${activeTab==='input'?'active':''}`} onClick={()=>setActiveTab('input')}><i className="ri-input-method-line"></i> 投入物料 ({activeNode.materials?.length||0})</div>
                                        <div className={`pr-tab ${activeTab==='output'?'active':''}`} onClick={()=>setActiveTab('output')}><i className="ri-logout-box-line"></i> 产出物料 ({activeNode.outputs?.length||0})</div>
                                        <div className={`pr-tab ${activeTab==='quality'?'active':''}`} onClick={()=>setActiveTab('quality')}><i className="ri-shield-check-line"></i> 检验标准 ({activeNode.qcStandards?.length||0})</div>
                                    </div>

                                    <div className="pr-tab-content">
                                        {activeTab === 'basic' && (
                                            <div className="form-grid-2">
                                                <div className="form-item"><label className="required">工序代码</label><input className="std-input" value={activeNode.opCode} onChange={e=>handleNodeChange('opCode', e.target.value)} disabled={!isEditing} /></div>
                                                <div className="form-item"><label className="required">工序名称</label><input className="std-input" value={activeNode.opName} onChange={e=>handleNodeChange('opName', e.target.value)} disabled={!isEditing} /></div>
                                                <div className="form-item"><label>类型</label><select className="std-input" value={activeNode.type} onChange={e=>handleNodeChange('type', e.target.value)} disabled={!isEditing}><option>生产</option><option>质检</option><option>包装</option><option>配料</option><option>热处理</option><option>机加</option><option>准备</option></select></div>
                                                <div className="form-item"><label>工作中心</label><input className="std-input" value={activeNode.wc} onChange={e=>handleNodeChange('wc', e.target.value)} disabled={!isEditing} /></div>
                                                <div className="form-item"><label>工时 (min)</label><input className="std-input" type="number" value={activeNode.stdTime} onChange={e=>handleNodeChange('stdTime', e.target.value)} disabled={!isEditing} /></div>
                                                <div className="form-item"><label>SOP</label><input className="std-input" value={activeNode.sop} onChange={e=>handleNodeChange('sop', e.target.value)} disabled={!isEditing} /></div>
                                            </div>
                                        )}

                                        {(activeTab === 'input' || activeTab === 'output') && (
                                            <div className="table-wrapper">
                                                <div className="section-header">
                                                    <span>{activeTab === 'input' ? '投入清单' : '产出清单'}</span>
                                                    {isEditing && <button className="mini-btn primary" onClick={()=>handleSubTableAdd(activeTab === 'input' ? 'materials' : 'outputs', {code:'', name:''})}>+ 添加</button>}
                                                </div>
                                                <div className="table-scroll">
                                                    <table className="sub-table">
                                                        <thead><tr><th>编码</th><th>名称</th><th width="80">数量</th><th width="60">单位</th><th width="50">操作</th></tr></thead>
                                                        <tbody>
                                                        {(activeNode[activeTab === 'input' ? 'materials' : 'outputs'] || []).map(m => (
                                                            <tr key={m.id}>
                                                                <td><input className="cell-input" value={m.code} onChange={e=>handleSubTableChange(activeTab === 'input'?'materials':'outputs', m.id, 'code', e.target.value)} disabled={!isEditing} /></td>
                                                                <td><input className="cell-input" value={m.name} onChange={e=>handleSubTableChange(activeTab === 'input'?'materials':'outputs', m.id, 'name', e.target.value)} disabled={!isEditing} /></td>
                                                                <td><input className="cell-input center" type="number" value={m.qty} onChange={e=>handleSubTableChange(activeTab === 'input'?'materials':'outputs', m.id, 'qty', e.target.value)} disabled={!isEditing} /></td>
                                                                <td className="center">{m.unit}</td>
                                                                <td className="center">{isEditing && <i className="ri-delete-bin-line danger-icon" onClick={()=>handleSubTableDelete(activeTab === 'input'?'materials':'outputs', m.id)}></i>}</td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* QC Standards Tab - SPC Column changed to Icon */}
                                        {activeTab === 'quality' && (
                                            <div className="table-wrapper">
                                                <div className="section-header">
                                                    <span>检验项目</span>
                                                    {isEditing && (
                                                        <div style={{display:'flex', gap:'8px'}}>
                                                            <button className="mini-btn outline" onClick={()=>handleSubTableAdd('qcStandards', {name:'', category:''})}>+ 手动添加</button>
                                                            <button className="mini-btn primary" onClick={()=>setPickerVisible(true)}>+ 从库中引入</button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="table-scroll">
                                                    <table className="sub-table">
                                                        <thead>
                                                        <tr>
                                                            <th width="40" className="center">No</th>
                                                            <th width="80">分类</th>
                                                            <th width="150">检验项目</th>
                                                            <th width="120">引用标准</th>
                                                            <th width="80">规格值</th>
                                                            <th width="50" className="center">单位</th>
                                                            <th width="50" className="center">SPC</th>
                                                            <th width="100">工具</th>
                                                            <th width="80">方法</th>
                                                            <th width="60">样本</th>
                                                            <th width="60">位置</th>
                                                            <th width="60">频次</th>
                                                            <th width="80">判定</th>
                                                            <th width="50" className="center">Op</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {activeNode.qcStandards?.map((qc, index) => (
                                                            <tr key={qc.id}>
                                                                <td className="center text-gray">{index + 1}</td>
                                                                <td><input className="cell-input" value={qc.category} onChange={e=>handleSubTableChange('qcStandards', qc.id, 'category', e.target.value)} disabled={!isEditing} /></td>
                                                                <td><input className="cell-input" value={qc.name} onChange={e=>handleSubTableChange('qcStandards', qc.id, 'name', e.target.value)} disabled={!isEditing} style={{fontWeight:'bold'}} /></td>
                                                                <td><input className="cell-input" value={qc.stdCode} onChange={e=>handleSubTableChange('qcStandards', qc.id, 'stdCode', e.target.value)} disabled={!isEditing} placeholder="标准号" style={{color:'#1890ff'}} /></td>
                                                                <td><input className="cell-input" value={qc.stdVal} onChange={e=>handleSubTableChange('qcStandards', qc.id, 'stdVal', e.target.value)} disabled={!isEditing} /></td>
                                                                <td className="center">{qc.stdUnit}</td>
                                                                {/* SPC Column Modified Here: Clickable Icon */}
                                                                <td
                                                                    className="center"
                                                                    onClick={() => isEditing && handleSubTableChange('qcStandards', qc.id, 'spc', !qc.spc)}
                                                                    style={{cursor: isEditing ? 'pointer' : 'default', userSelect: 'none'}}
                                                                >
                                                                    {qc.spc ? '✅' : '-'}
                                                                </td>
                                                                <td><input className="cell-input" value={qc.tool} onChange={e=>handleSubTableChange('qcStandards', qc.id, 'tool', e.target.value)} disabled={!isEditing} /></td>
                                                                <td><input className="cell-input" value={qc.method} onChange={e=>handleSubTableChange('qcStandards', qc.id, 'method', e.target.value)} disabled={!isEditing} /></td>
                                                                <td><input className="cell-input" value={qc.sample} onChange={e=>handleSubTableChange('qcStandards', qc.id, 'sample', e.target.value)} disabled={!isEditing} /></td>
                                                                <td><input className="cell-input" value={qc.pos} onChange={e=>handleSubTableChange('qcStandards', qc.id, 'pos', e.target.value)} disabled={!isEditing} /></td>
                                                                <td><input className="cell-input" value={qc.freq} onChange={e=>handleSubTableChange('qcStandards', qc.id, 'freq', e.target.value)} disabled={!isEditing} /></td>
                                                                <td><input className="cell-input" value={qc.judge} onChange={e=>handleSubTableChange('qcStandards', qc.id, 'judge', e.target.value)} disabled={!isEditing} /></td>
                                                                <td className="center">{isEditing && <i className="ri-delete-bin-line danger-icon" onClick={()=>handleSubTableDelete('qcStandards', qc.id)}></i>}</td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : <div className="empty-state-full"><i className="ri-node-tree"></i><p>请在左侧选择或添加工序</p></div>}
                        </div>

                        {/* History Drawer */}
                        <div className={`pr-history-drawer ${historyVisible ? 'visible' : ''}`}>
                            <div className="pr-history-header"><span>历史版本</span><i className="ri-close-line close-btn" onClick={() => setHistoryVisible(false)}></i></div>
                            <div className="pr-history-list">
                                {historyList.length === 0 ? <div className="empty-tip" style={{padding:'20px'}}>暂无历史</div> :
                                    historyList.map((item, index) => (
                                        <div key={index} className={`pr-history-item ${item.snapshot?'clickable':''}`} onClick={()=>handlePreviewHistory(item)} title="点击预览快照">
                                            <div className="ph-row-1"><span className="ph-ver">{item.version}</span><span className="ph-date">{item.date}</span></div>
                                            <div className="ph-row-2"><span className="ph-user">{item.user}</span><span className="ph-action">{item.action}</span></div>
                                            {item.remark && <div className="ph-remark">{item.remark}</div>}
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <QcItemPicker visible={pickerVisible} onClose={()=>setPickerVisible(false)} onSelect={handleQcItemsSelected} />
        </div>
    );
};

export default ProcessRouteDetail;