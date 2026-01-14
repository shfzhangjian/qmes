/**
 * @file: src/features/QMES/IqcStandardDetail.jsx
 * @version: v8.0.0 (SPC Switch & Divider & Real Preview)
 * @description: 进料检验标准详情
 * - [UI] SPC 列改为 On/Off 开关组件
 * - [UI] 表格第一列与第二列之间增加明显分割线
 * - [Feat] 历史预览功能实装：点击历史可查看不同版本数据，退出自动还原
 */
import React, { useState, useEffect, useRef } from 'react';
import UploadModal from '../../components/Common/UploadModal';
import './IqcStandardDetail.css';

const ToolBtn = ({ children, onClick, type = 'default', iconOnly, active, danger, disabled }) => {
    const classes = ['iqs-btn', type, iconOnly ? 'icon-only' : '', active ? 'active' : '', danger ? 'danger' : ''].filter(Boolean).join(' ');
    return <button className={classes} onClick={onClick} disabled={disabled}>{children}</button>;
};

// 新增：SPC 开关组件
const SpcSwitch = ({ checked, onChange, disabled }) => (
    <div
        className={`iqs-switch ${checked ? 'on' : 'off'} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && onChange(!checked)}
        title={checked ? "SPC Control: ON" : "SPC Control: OFF"}
    >
        <span className="switch-text">{checked ? 'ON' : 'OFF'}</span>
        <div className="switch-handle"></div>
    </div>
);

const IqcStandardDetail = (props) => {
    const visible = props.isOpen !== undefined ? props.isOpen : (props.visible !== undefined ? props.visible : true);
    const { isEditing: propIsEditing, record, onClose, onSubmit } = props;

    // --- State ---
    const [isMaximized, setIsMaximized] = useState(false);

    // 当前显示的业务数据
    const [header, setHeader] = useState({
        docNo: '', ver: '', productModel: '', scopeDesc: '', process: [],
        updater: '', updateTime: '', approver: '', status: ''
    });
    const [components, setComponents] = useState([]);
    const [items, setItems] = useState([]);
    const [fileList, setFileList] = useState([]);

    // 备份数据 (用于预览历史后恢复)
    const backupDataRef = useRef(null);

    // UI 交互状态
    const [selectedComps, setSelectedComps] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showAttachmentDrawer, setShowAttachmentDrawer] = useState(false);
    const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);

    // 历史与预览模式
    const [historyList, setHistoryList] = useState([]);
    const [previewMode, setPreviewMode] = useState(false);
    const [activeHistoryId, setActiveHistoryId] = useState(null);

    const isEditable = propIsEditing && !previewMode;

    // --- Effects ---
    useEffect(() => {
        if (visible) {
            // 1. 初始化最新数据
            if (record && record.id !== 'NEW') {
                const initHeader = { ...record, docNo: 'SIP-2026-001', ver: 'A/2', productModel: 'M1', scopeDesc: '适用于2026年新产线', process: ['IQC'], updater: '张三', updateTime: '2026-01-15', status: '生效中' };
                const initComps = [
                    { id: 1, name: '基材', spec: 'PET膜', qty: '1', unit: '卷' },
                    { id: 2, name: '胶水', spec: '丙烯酸', qty: '15', unit: 'g/m2' }
                ];
                const initItems = [
                    { id: 1, category: '外观', name: '包装完整性', stdVal: '无破损/脏污', stdUnit: '-', spc: false, tool: '目视', method: '全检', sample: '全部', pos: '外箱', freq: '每批', judge: 'ACC' },
                    { id: 2, category: '尺寸', name: '厚度公差', stdVal: '0.125±0.01', stdUnit: 'mm', spc: true, tool: '千分尺', method: '抽检', sample: '5pcs', pos: '四角', freq: '每卷', judge: 'CPK>1.33' }
                ];

                setHeader(initHeader);
                setComponents(initComps);
                setItems(initItems);

                // 2. 模拟历史版本数据 (用于演示预览切换)
                setHistoryList([
                    {
                        id: 'h2', ver: 'A/1', updateTime: '2026-01-10', updater: '张三', remark: '修订厚度标准',
                        data: {
                            header: { ...initHeader, ver: 'A/1', updateTime: '2026-01-10', scopeDesc: '适用于旧产线' },
                            components: initComps,
                            items: [
                                { id: 1, category: '外观', name: '包装完整性', stdVal: '无破损', stdUnit: '-', spc: false, tool: '目视', method: '全检', sample: 'All', pos: '-', freq: '-', judge: 'ACC' },
                                { id: 2, category: '尺寸', name: '厚度公差', stdVal: '0.125±0.05', stdUnit: 'mm', spc: false, tool: '游标卡尺', method: '抽检', sample: '3pcs', pos: '随机', freq: '-', judge: 'Pass' }
                            ]
                        }
                    },
                    {
                        id: 'h1', ver: 'A/0', updateTime: '2025-12-01', updater: '王五', remark: '初始发行',
                        data: {
                            header: { ...initHeader, ver: 'A/0', updateTime: '2025-12-01', status: '已归档' },
                            components: [],
                            items: [{ id: 1, category: '外观', name: '初步检查', stdVal: 'OK', stdUnit: '-', spc: false, tool: '目视', method: '全检', sample: '1', pos: '-', freq: '-', judge: 'OK' }]
                        }
                    }
                ]);
            } else {
                // 新增模式
                setHeader({ docNo: 'NEW-SIP', ver: 'A/0', productModel: '', scopeDesc: '', process: ['IQC'], updater: '当前用户', updateTime: new Date().toISOString().split('T')[0], approver: '', status: '草稿' });
                setComponents([]); setItems([]); setHistoryList([]);
            }

            // 重置状态
            setIsMaximized(false);
            setPreviewMode(false);
            setActiveHistoryId(null);
            setShowHistoryDrawer(false);
            setSelectedComps([]);
            setSelectedItems([]);
            backupDataRef.current = null;
        }
    }, [visible, record]);

    // --- Handlers ---
    const handleSelectAll = (e, data, setFn) => setFn(e.target.checked ? data.map(i => i.id) : []);
    const handleSelect = (id, list, setFn) => setFn(list.includes(id) ? list.filter(i => i !== id) : [...list, id]);

    const handleBatchDelete = (type) => {
        if(type==='comp') {
            setComponents(prev => prev.filter(c => !selectedComps.includes(c.id)));
            setSelectedComps([]);
        } else {
            setItems(prev => prev.filter(i => !selectedItems.includes(i.id)));
            setSelectedItems([]);
        }
    };

    const handleAdd = (type) => {
        const newId = Date.now();
        if(type==='comp') setComponents([...components, { id: newId, name: '', spec: '', qty: '', unit: '' }]);
        else setItems([...items, { id: newId, category: '', name: '', stdVal: '', stdUnit: '', spc: false, tool: '', method: '', sample: '', pos: '', freq: '', judge: '' }]);
    };

    const handlePublish = () => {
        if (window.confirm(`确认发布当前标准 (版本: ${header.ver}) 吗？\n\n1. 旧版本自动归档\n2. 新记录应用新标准`)) {
            // 将当前状态存入历史
            const newHist = {
                id: Date.now(), ver: header.ver, updateTime: header.updateTime, updater: header.updater, remark: '版本发布归档',
                data: { header: {...header}, components: [...components], items: [...items] }
            };
            setHistoryList([newHist, ...historyList]);

            // 版本号 +1
            const nextVer = header.ver.split('/')[0] + '/' + (parseInt(header.ver.split('/')[1] || 0) + 1);
            setHeader(prev => ({ ...prev, ver: nextVer, status: '生效中', updateTime: new Date().toISOString().split('T')[0] }));
            alert(`发布成功！新版本 ${nextVer} 已生效。`);
            if(onSubmit) onSubmit(header);
        }
    };

    // 预览历史：核心逻辑
    const handlePreviewHistory = (hist) => {
        // 1. 备份当前数据 (如果还没备份过)
        if (!backupDataRef.current) {
            backupDataRef.current = { header, components, items };
        }
        // 2. 加载历史数据
        if (hist.data) {
            setHeader(hist.data.header);
            setComponents(hist.data.components || []);
            setItems(hist.data.items || []);
        }
        // 3. 切换状态
        setPreviewMode(true);
        setActiveHistoryId(hist.id);
        setShowHistoryDrawer(false); // 关闭抽屉方便查看
    };

    // 退出预览：恢复数据
    const handleExitPreview = () => {
        if (backupDataRef.current) {
            setHeader(backupDataRef.current.header);
            setComponents(backupDataRef.current.components);
            setItems(backupDataRef.current.items);
            backupDataRef.current = null; // 清空备份
        }
        setPreviewMode(false);
        setActiveHistoryId(null);
    };

    if (!visible) return null;

    return (
        <div className="iqs-overlay">
            <div className={`iqs-window ${isMaximized ? 'maximized' : ''}`}>

                {previewMode && (
                    <div className="iqs-preview-banner">
                        <i className="ri-history-line"></i> 当前正在预览历史版本 {header.ver} (只读)。
                        <span className="link-btn" onClick={handleExitPreview}>退出预览，返回最新版</span>
                    </div>
                )}

                {/* Toolbar */}
                <div className="iqs-toolbar">
                    <div className="iqs-toolbar-left">
                        <div className="iqs-icon"><i className="ri-file-settings-line"></i></div>
                        <span className="iqs-title">进料检验标准 (SIP)</span>
                        <span className={`iqs-status-tag ${header.status === '生效中' ? 'active' : ''}`}>{header.status}</span>
                    </div>
                    <div className="iqs-toolbar-right">
                        <ToolBtn active={showHistoryDrawer} onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}>
                            <i className="ri-time-line"></i> 历史 ({historyList.length})
                        </ToolBtn>

                        <ToolBtn active={showAttachmentDrawer} onClick={() => setShowAttachmentDrawer(!showAttachmentDrawer)}>
                            <i className="ri-attachment-2"></i> 附件 ({fileList.length})
                        </ToolBtn>

                        {isEditable && (
                            <>
                                <div className="iqs-divider-v"></div>
                                <ToolBtn onClick={() => setUploadModalVisible(true)}><i className="ri-upload-cloud-line"></i> 上传</ToolBtn>
                                <ToolBtn onClick={() => alert('已暂存')}><i className="ri-save-3-line"></i> 暂存</ToolBtn>
                                <ToolBtn type="primary" onClick={handlePublish}><i className="ri-rocket-line"></i> 发布</ToolBtn>
                            </>
                        )}

                        <div className="iqs-divider-v"></div>
                        <ToolBtn iconOnly onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? "还原" : "最大化"}>
                            <i className={`ri-${isMaximized ? 'fullscreen-exit' : 'fullscreen'}-line`}></i>
                        </ToolBtn>
                        <ToolBtn iconOnly onClick={onClose} className="close"><i className="ri-close-line"></i></ToolBtn>
                    </div>
                </div>

                {/* Main Content */}
                <div className={`iqs-scroll-area ${previewMode ? 'preview-bg' : ''}`}>
                    <div className="iqs-paper">
                        {/* Header Inputs */}
                        <div className="iqs-header-row">
                            <div className="iqs-field-group">
                                <label>编号:</label> <input className="iqs-inline-input" value={header.docNo} readOnly />
                            </div>
                            <div className="iqs-header-title">进料检验标准书</div>
                            <div className="iqs-field-group right">
                                <label>版本:</label> <input className="iqs-inline-input small" value={header.ver} onChange={e => setHeader({...header, ver: e.target.value})} readOnly={!isEditable} />
                            </div>
                        </div>

                        {/* Master Table */}
                        <table className="iqs-table master">
                            <colgroup><col width="100" /><col width="150" /><col width="100" /><col width="*" /><col width="100" /><col width="100" /></colgroup>
                            <tbody>
                            <tr>
                                <th>适用产品</th>
                                <td>
                                    {isEditable ? (
                                        <select className="iqs-select" value={header.productModel} onChange={e => setHeader({...header, productModel: e.target.value})}>
                                            <option value="">-- 请选择 --</option><option value="M1">Model-A</option><option value="M2">Model-B</option>
                                        </select>
                                    ) : (header.productModel || '/')}
                                </td>
                                <th>适用范围</th>
                                <td colSpan={3}><input className="iqs-input" value={header.scopeDesc} readOnly={!isEditable} onChange={e => setHeader({...header, scopeDesc: e.target.value})} /></td>
                            </tr>
                            <tr>
                                <th>检验工序</th>
                                <td colSpan={5}>
                                    <div style={{display:'flex', gap:'15px'}}>
                                        {['IQC (进料)', 'IPQC (制程)', 'LQC (线边)', 'ORT (信赖性)'].map(opt => (
                                            <label key={opt} style={{cursor: isEditable?'pointer':'default'}}>
                                                <input type="checkbox" disabled={!isEditable} checked={header.process.includes(opt.split(' ')[0])}
                                                       onChange={e => {
                                                           const val = opt.split(' ')[0];
                                                           setHeader({...header, process: e.target.checked ? [...header.process, val] : header.process.filter(p=>p!==val)});
                                                       }}
                                                /> {opt}
                                            </label>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th>修正人</th><td><input className="iqs-input center" value={header.updater} readOnly /></td>
                                <th>修正时间</th><td><input className="iqs-input center" value={header.updateTime} readOnly /></td>
                                <th>审批人</th><td><input className="iqs-input center" value={header.approver} readOnly={!isEditable} onChange={e=>setHeader({...header, approver:e.target.value})} /></td>
                            </tr>
                            </tbody>
                        </table>

                        {/* Sub Table 1: Composition */}
                        <div className="iqs-section-header">
                            <div className="iqs-section-title">1. 产品构成</div>
                            {isEditable && <div className="iqs-actions"><button className="mini-btn danger" onClick={()=>handleBatchDelete('comp')}>删除选中</button><button className="mini-btn primary" onClick={()=>handleAdd('comp')}>+ 新增</button></div>}
                        </div>
                        <div className="iqs-table-container short">
                            <table className="iqs-table">
                                <colgroup><col width="40" /><col width="50" /><col width="200" /><col width="200" /><col width="100" /><col width="100" /></colgroup>
                                <thead>
                                <tr>
                                    <th className="sticky-col c1"><input type="checkbox" onChange={e=>handleSelectAll(e, components, setSelectedComps)} checked={components.length>0 && selectedComps.length===components.length} disabled={!isEditable} /></th>
                                    <th className="sticky-col c2">序号</th>
                                    <th>构成名称</th><th>规格/型号</th><th>单位用量</th><th>单位</th>
                                </tr>
                                </thead>
                                <tbody>
                                {components.map((c, i) => (
                                    <tr key={c.id}>
                                        <td className="sticky-col c1 center"><input type="checkbox" checked={selectedComps.includes(c.id)} onChange={()=>handleSelect(c.id, selectedComps, setSelectedComps)} disabled={!isEditable} /></td>
                                        <td className="sticky-col c2 center">{i+1}</td>
                                        <td><input className="iqs-input" value={c.name} readOnly={!isEditable} onChange={e=>{const n=[...components];n[i].name=e.target.value;setComponents(n)}} /></td>
                                        <td><input className="iqs-input" value={c.spec} readOnly={!isEditable} onChange={e=>{const n=[...components];n[i].spec=e.target.value;setComponents(n)}} /></td>
                                        <td><input className="iqs-input center" value={c.qty} readOnly={!isEditable} onChange={e=>{const n=[...components];n[i].qty=e.target.value;setComponents(n)}} /></td>
                                        <td><input className="iqs-input center" value={c.unit} readOnly={!isEditable} onChange={e=>{const n=[...components];n[i].unit=e.target.value;setComponents(n)}} /></td>
                                    </tr>
                                ))}
                                {components.length===0 && <tr><td colSpan={6} className="center text-gray">无数据</td></tr>}
                                </tbody>
                            </table>
                        </div>

                        {/* Sub Table 2: Items (Key Update Here) */}
                        <div className="iqs-section-header">
                            <div className="iqs-section-title">2. 检验项目</div>
                            {isEditable && <div className="iqs-actions"><button className="mini-btn danger" onClick={()=>handleBatchDelete('item')}>删除选中</button><button className="mini-btn primary" onClick={()=>handleAdd('item')}>+ 新增</button></div>}
                        </div>
                        <div className="iqs-table-container tall">
                            <table className="iqs-table">
                                <colgroup>
                                    <col width="40" /><col width="50" />
                                    <col width="80" /><col width="180" /><col width="120" /><col width="60" />
                                    <col width="80" /> {/* SPC Width increased for toggle */}
                                    <col width="100" /><col width="100" /><col width="80" /><col width="100" /><col width="80" /><col width="120" />
                                </colgroup>
                                <thead>
                                <tr>
                                    <th className="sticky-col c1" rowSpan="2"><input type="checkbox" onChange={e=>handleSelectAll(e, items, setSelectedItems)} checked={items.length>0 && selectedItems.length===items.length} disabled={!isEditable} /></th>
                                    <th className="sticky-col c2" rowSpan="2">序号</th>
                                    <th rowSpan="2">分类</th><th rowSpan="2">检验项目名称</th><th colSpan="2">规格标准</th><th rowSpan="2">SPC</th><th rowSpan="2">工具</th><th rowSpan="2">方法</th><th rowSpan="2">样本量</th><th rowSpan="2">位置</th><th rowSpan="2">频次</th><th rowSpan="2">判定</th>
                                </tr>
                                <tr><th>规格值</th><th>单位</th></tr>
                                </thead>
                                <tbody>
                                {items.map((item, i) => (
                                    <tr key={item.id}>
                                        <td className="sticky-col c1 center"><input type="checkbox" checked={selectedItems.includes(item.id)} onChange={()=>handleSelect(item.id, selectedItems, setSelectedItems)} disabled={!isEditable} /></td>
                                        <td className="sticky-col c2 center">{i+1}</td>
                                        <td><input className="iqs-input" value={item.category} readOnly={!isEditable} onChange={e=>{const n=[...items];n[i].category=e.target.value;setItems(n)}} /></td>
                                        <td><input className="iqs-input" value={item.name} readOnly={!isEditable} onChange={e=>{const n=[...items];n[i].name=e.target.value;setItems(n)}} /></td>
                                        <td><input className="iqs-input" value={item.stdVal} readOnly={!isEditable} onChange={e=>{const n=[...items];n[i].stdVal=e.target.value;setItems(n)}} /></td>
                                        <td><input className="iqs-input center" value={item.stdUnit} readOnly={!isEditable} onChange={e=>{const n=[...items];n[i].stdUnit=e.target.value;setItems(n)}} /></td>

                                        {/* --- SPC 改为 On/Off 开关 --- */}
                                        <td className="center">
                                            <SpcSwitch
                                                checked={item.spc}
                                                disabled={!isEditable}
                                                onChange={(val) => {const n=[...items];n[i].spc=val;setItems(n)}}
                                            />
                                        </td>

                                        <td><input className="iqs-input center" value={item.tool} readOnly={!isEditable} onChange={e=>{const n=[...items];n[i].tool=e.target.value;setItems(n)}} /></td>
                                        <td><input className="iqs-input center" value={item.method} readOnly={!isEditable} onChange={e=>{const n=[...items];n[i].method=e.target.value;setItems(n)}} /></td>
                                        <td><input className="iqs-input center" value={item.sample} readOnly={!isEditable} onChange={e=>{const n=[...items];n[i].sample=e.target.value;setItems(n)}} /></td>
                                        <td><input className="iqs-input center" value={item.pos} readOnly={!isEditable} onChange={e=>{const n=[...items];n[i].pos=e.target.value;setItems(n)}} /></td>
                                        <td><input className="iqs-input center" value={item.freq} readOnly={!isEditable} onChange={e=>{const n=[...items];n[i].freq=e.target.value;setItems(n)}} /></td>
                                        <td><input className="iqs-input center bold" value={item.judge} readOnly={!isEditable} onChange={e=>{const n=[...items];n[i].judge=e.target.value;setItems(n)}} /></td>
                                    </tr>
                                ))}
                                {items.length===0 && <tr><td colSpan={13} className="center text-gray" style={{padding:'20px'}}>暂无检验项目，请点击右上角新增</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Drawers */}
                <div className={`iqs-history-drawer ${showHistoryDrawer ? 'open' : ''}`}>
                    <div className="drawer-header">
                        <span className="drawer-title"><i className="ri-history-line"></i> 版本演变 ({historyList.length})</span>
                        <i className="ri-close-line icon-btn" onClick={() => setShowHistoryDrawer(false)}></i>
                    </div>
                    {/* 在 IqcStandardDetail.jsx 的 Drawer Body 中替换内容 */}

                    <div className="drawer-body">
                        {historyList.length === 0 && <div className="empty-state">暂无历史版本</div>}

                        {historyList.map((h) => {
                            const isActive = h.id === activeHistoryId;

                            return (
                                <div key={h.id} className={`history-card ${isActive ? 'active' : ''}`}>
                                    {/* 头部：版本 + 图标 */}
                                    <div className="hc-header">
                                        <span className="hc-ver">{h.ver}</span>
                                        {/* 根据状态显示不同图标：正在预览显示眼睛，否则显示历史时钟 */}
                                        <i
                                            className={`hc-status-icon ${isActive ? 'ri-eye-line' : 'ri-history-line'}`}
                                            title={isActive ? "正在预览当前版本" : "历史归档版本"}
                                        ></i>
                                    </div>

                                    {/* 信息行 */}
                                    <div className="hc-meta-row">
                                        <div className="hc-user">
                                            <i className="ri-user-smile-line" style={{color:'#1890ff'}}></i>
                                            {h.updater}
                                        </div>
                                        <div className="hc-date">
                                            <i className="ri-calendar-2-line"></i>
                                            {h.updateTime}
                                        </div>
                                    </div>

                                    {/* 备注 */}
                                    <div className="hc-remark">
                                        {h.remark ? h.remark : <span style={{color:'#ccc', fontStyle:'italic'}}>无备注</span>}
                                    </div>

                                    {/* 按钮 */}
                                    <button className="hc-btn" onClick={() => handlePreviewHistory(h)}>
                                        {isActive ? (
                                            <><i className="ri-eye-fill"></i> 正在预览</>
                                        ) : (
                                            <><i className="ri-time-line"></i> 切换至此版本</>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ---------------- 修改后的附件抽屉 ---------------- */}
                <div className={`iqs-attachment-drawer ${showAttachmentDrawer ? 'open' : ''}`}>
                    <div className="drawer-header">
        <span className="drawer-title">
            <i className="ri-attachment-2"></i> 关联附件 ({fileList.length})
        </span>
                        <div style={{display:'flex', gap:'10px'}}>
                            {/* 模拟上传按钮 */}
                            {isEditable && (
                                <button className="mini-btn primary" onClick={() => setUploadModalVisible(true)}>
                                    <i className="ri-upload-2-fill"></i> 上传新文件
                                </button>
                            )}
                            <i className="ri-close-line icon-btn" onClick={() => setShowAttachmentDrawer(false)}></i>
                        </div>
                    </div>
                    <div className="drawer-body">
                        {fileList.length === 0 ? (
                            <div className="empty-state">
                                <i className="ri-folder-open-line"></i>
                                <span>当前标准暂无关联技术文档</span>
                            </div>
                        ) : (
                            <div className="iqs-file-grid">
                                {fileList.map((f, i) => {
                                    // 简单的文件类型判断逻辑
                                    const isPdf = f.name && f.name.toLowerCase().endsWith('pdf');
                                    const isImg = f.name && f.name.match(/\.(jpeg|jpg|png|gif)$/i);
                                    let iconClass = 'ri-file-text-fill';
                                    if(isPdf) iconClass = 'ri-file-pdf-fill';
                                    if(isImg) iconClass = 'ri-image-fill';

                                    return (
                                        <div key={i} className="iqs-file-card" onClick={() => alert(`预览文件: ${f.name}`)}>
                                            <i className={`${iconClass} file-icon`}></i>
                                            <div className="file-name" title={f.name}>{f.name}</div>
                                            <div className="file-meta">
                                                {f.size || 'Unknown Size'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <UploadModal visible={uploadModalVisible} onClose={() => setUploadModalVisible(false)} onUploadSuccess={()=>{}} />
        </div>
    );
};

export default IqcStandardDetail;