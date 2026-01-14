/**
 * @file: src/features/QMES/NonConformingDetail.jsx
 * @version: v17.0.0 (Style Match: Final Conclusion like R&D)
 * @description: 不合格品处置单详情 - 最终视觉统一版
 * - [UI Fix] "最终结论"的输入框和签字样式完全对齐"评审会签"（透明背景、斜体、无边框感）。
 * - [Feature] 保持所有工作流、权限控制、自动签字逻辑不变。
 */
import React, { useState, useEffect } from 'react';
import BaseModal from '../../components/Common/BaseModal';
import LogPanel from '../../components/Common/LogPanel';
import UploadModal from '../../components/Common/UploadModal';
import NCRProcessModal from '../../components/Business/NCRProcessModal';
import './NonConformingDetail.css';

// =============================================================================
// 1. 基础 UI 组件
// =============================================================================

const Cell = ({ children, span = 1, className = '', style = {}, vertical, center, bold, bg, noWrap, highlight }) => {
    const classes = [
        'ncr-cell',
        vertical ? 'ncr-vertical' : '',
        center ? 'ncr-center' : '',
        bold ? 'ncr-bold' : '',
        bg ? 'ncr-bg-gray' : '',
        noWrap ? 'ncr-nowrap' : '',
        highlight ? 'ncr-row-active' : '',
        className
    ].filter(Boolean).join(' ');

    const computedStyle = { gridColumn: `span ${span}`, ...style };
    return <div className={classes} style={computedStyle}>{children}</div>;
};

const Label = ({ children }) => <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{children}</div>;

const Input = ({ value, onChange, align = 'center', placeholder, type = 'text', section, isEditing, canEdit, style, underline, forceReadOnly }) => {
    const editable = !forceReadOnly && isEditing && (!section || (canEdit && canEdit(section)));
    let finalStyle = { textAlign: align, ...style };
    let className = `ncr-input ${!editable ? 'readonly' : 'editable-field'}`;

    if (underline) {
        finalStyle = { ...finalStyle, borderBottom: '1px solid #000', borderRadius: 0, padding: '0 4px', background: 'transparent' };
    } else if (editable) {
        finalStyle = { ...finalStyle, backgroundColor: '#fff', border: '1px solid #d9d9d9', borderRadius: '2px' };
    }

    const isDateControl = type === 'date' || type === 'datetime-local';
    const renderType = (isDateControl && !editable) ? 'text' : type;

    let displayValue = value || '';
    if (renderType === 'text' && type === 'datetime-local' && displayValue.includes('T')) {
        displayValue = displayValue.replace('T', ' ');
    }

    return (
        <input
            type={renderType}
            className={className}
            style={finalStyle}
            value={displayValue}
            onChange={e => editable && onChange && onChange(e.target.value)}
            readOnly={!editable}
            placeholder={editable ? placeholder : ''}
            onKeyDown={(e) => { if (editable && isDateControl) e.preventDefault(); }}
            onClick={(e) => { if (editable && isDateControl && e.target.showPicker) e.target.showPicker(); }}
        />
    );
};

const TextArea = ({ value, onChange, rows = 3, section, isEditing, canEdit, placeholder, style, forceReadOnly }) => {
    const editable = !forceReadOnly && isEditing && (!section || (canEdit && canEdit(section)));
    return (
        <textarea
            className={`ncr-textarea ${!editable ? 'readonly' : 'editable-field'}`}
            style={{
                ...style,
                backgroundColor: editable ? '#fff' : 'transparent',
                border: editable ? '1px solid #d9d9d9' : 'none'
            }}
            rows={rows}
            value={value || ''}
            readOnly={!editable}
            placeholder={editable ? placeholder : ""}
            onChange={e => editable && onChange && onChange(e.target.value)}
        />
    );
};

const CheckGroup = ({ options, value, onChange, section, isEditing, canEdit, align = 'center', forceReadOnly, multiple = false }) => {
    const editable = !forceReadOnly && isEditing && (!section || (canEdit && canEdit(section)));
    const isChecked = (opt) => multiple ? (Array.isArray(value) ? value.includes(opt) : false) : value === opt;
    const handleClick = (opt) => {
        if (!editable || !onChange) return;
        if (multiple) {
            const currentArr = Array.isArray(value) ? [...value] : [];
            onChange(currentArr.includes(opt) ? currentArr.filter(v => v !== opt) : [...currentArr, opt]);
        } else {
            onChange(opt);
        }
    };
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', height: '100%', justifyContent: align === 'left' ? 'flex-start' : 'center', paddingLeft: align === 'left' ? '10px' : '0' }}>
            {options.map(opt => {
                const checked = isChecked(opt);
                return (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: editable ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
                        <span onClick={() => handleClick(opt)} style={{ fontSize: '16px', marginRight: '2px', lineHeight: 1, fontWeight: checked ? 'bold' : 'normal', color: (editable && checked) ? '#1890ff' : 'inherit' }}>{checked ? '☑' : '☐'}</span>
                        {opt}
                    </label>
                );
            })}
        </div>
    );
};

const ToolBtn = ({ children, onClick, type = 'default', iconOnly, active, className }) => {
    const classes = ['ncr-btn', type, iconOnly ? 'icon-only' : '', active ? 'active' : '', className].filter(Boolean).join(' ');
    return <button type="button" className={classes} onClick={onClick}>{children}</button>;
};

const SectionAttachment = ({ sectionKey, isEditing, onUploadClick, files }) => {
    const sectionFile = files.find(f => f.section === sectionKey);
    return (
        <div className="ncr-section-attach" style={{position:'absolute', bottom:'5px', right:'5px', zIndex:5}}>
            {isEditing && !sectionFile && (
                <span className="ncr-attach-btn" onClick={() => onUploadClick(sectionKey)} style={{ color: '#1890ff', cursor: 'pointer', fontWeight: 'bold', fontSize:'11px', display:'flex', alignItems:'center', background:'rgba(255,255,255,0.9)', border:'1px solid #d9d9d9', padding:'2px 6px', borderRadius:'4px' }}>
                    <i className="ri-upload-2-line" style={{marginRight:'2px'}}></i> 上传
                </span>
            )}
            {sectionFile && (
                <div className="ncr-attached-file" style={{background:'#e6f7ff', padding:'2px 6px', borderRadius:'4px', fontSize:'11px', color:'#1890ff', display:'flex', alignItems:'center', border: '1px solid #91d5ff'}}>
                    <i className="ri-attachment-2"></i>
                    <span style={{maxWidth:'100px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', cursor:'pointer'}} onClick={() => alert(`预览文件: ${sectionFile.name}`)}>{sectionFile.name}</span>
                    {isEditing && <i className="ri-close-circle-fill" onClick={() => onUploadClick(sectionKey, true)} style={{ marginLeft: '5px', color: '#ff4d4f', cursor: 'pointer' }}></i>}
                </div>
            )}
        </div>
    );
};

// =============================================================================
// 2. 主组件 (NonConformingDetail)
// =============================================================================

const NonConformingDetail = ({ visible, onClose, record, isEditing: initialEditing, onSubmit }) => {
    if (!visible) return null;

    // --- State ---
    const [data, setData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [currentUser] = useState({ name: '张工', dept: '研发部' });
    const [showAttachmentDrawer, setShowAttachmentDrawer] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [processModalVisible, setProcessModalVisible] = useState(false);
    const [logPanelVisible, setLogPanelVisible] = useState(false);
    const [relatedABNVisible, setRelatedABNVisible] = useState(false);
    const [currentUploadSection, setCurrentUploadSection] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [logs, setLogs] = useState([]);
    const [stepDuration, setStepDuration] = useState('0小时');

    // --- Init ---
    useEffect(() => {
        const initData = record || {};
        if (!initData.id) {
            initData.id = 'HC/R-23-1-01';
            initData.status = 'DRAFT';
            initData.date = new Date().toISOString().split('T')[0];
        }
        if (initData.respDept && !Array.isArray(initData.respDept)) {
            initData.respDept = initData.respDept.split(',').filter(Boolean);
        } else if (!initData.respDept) {
            initData.respDept = [];
        }
        setData({ ...initData });
        if (initData.status !== 'DRAFT') {
            setFileList([{ name: '现场不良图_01.jpg', size: '1.2 MB', type: 'img', section: 'desc' }]);
        } else {
            setFileList([]);
        }
        setLogs([{ time: '2026-01-14 09:00', user: 'System', action: '初始化', comment: 'Ready' }]);
        setIsEditing(initialEditing);
        setIsMaximized(false);
        setStepDuration('1天2小时');
    }, [record, initialEditing, visible]);

    const deptMap = {'研发部': 'rd', '工艺部': 'pe', '生产部': 'prod', '品质部': 'qc', 'CS (客服)': 'cs', '事业部总监': 'dir', '总经理': 'gm'};

    // --- Permission ---
    const checkCanEdit = (section) => {
        if (!isEditing) return false;
        const s = data.status;
        if (s === 'DRAFT') return section === 'desc';
        if (s === 'PENDING_HEAD') return section === 'confirm_head';
        if (s === 'PENDING_QA') return section === 'qa_confirm';
        if (s === 'PENDING_REVIEW') {
            const userDeptKey = deptMap[currentUser.dept];
            return section === `review_${userDeptKey}`;
        }
        if (s === 'PENDING_FINAL') return section === 'final';
        return false;
    };

    const handleFieldChange = (field, value) => {
        setData(prev => {
            const newData = { ...prev, [field]: value };
            if (field.includes('Comment') || field.includes('Result')) {
                const prefix = field.replace('Comment', '').replace('Result', '');
                const signField = `${prefix}Sign`;
                const userDeptKey = deptMap[currentUser.dept];
                if (prefix === userDeptKey) {
                    const today = new Date().toISOString().split('T')[0];
                    newData[signField] = `${currentUser.name} / ${today}`;
                }
            }
            return newData;
        });
    };

    // --- Workflow ---
    const handleProcessOpen = () => {
        if (data.status === 'DRAFT' && !data.desc) return alert('请填写不良描述！');
        if (data.status === 'PENDING_QA' && (!data.respDept || data.respDept.length === 0)) return alert('请至少选择一个责任单位！');
        setProcessModalVisible(true);
    };

    const handleProcessSubmit = (processData) => {
        const { nextStep } = processData;
        let newData = { ...data };
        if (data.status === 'DRAFT') newData.finder = currentUser.name;
        if (data.status === 'PENDING_HEAD') newData.confirmer = '部门经理';
        if (data.status === 'PENDING_QA') { newData.qaPerson = currentUser.name; newData.qaDate = new Date().toISOString().split('T')[0]; }
        if (data.status === 'PENDING_FINAL') newData.finalSign = '总经理';
        newData.status = nextStep;
        setData(newData);
        setProcessModalVisible(false);
        setIsEditing(false);
        if (onSubmit) onSubmit(newData, `流转成功: ${nextStep}`);
    };

    const handleSectionUpload = (section, isRemove) => { if (isRemove) { if (window.confirm('确认删除?')) setFileList(prev => prev.filter(f => f.section !== section)); } else { setCurrentUploadSection(section); setUploadModalVisible(true); } };
    const handleUploadSuccess = (files) => { setFileList(prev => [...prev, { ...files[0], section: currentUploadSection }]); setUploadModalVisible(false); };
    const getStatusLabel = (s) => ({ 'DRAFT': '草稿', 'PENDING_HEAD': '待部门确认', 'PENDING_QA': '待品质确认', 'PENDING_REVIEW': '会签中', 'PENDING_FINAL': '待最终结论', 'CLOSED': '已结案' }[s] || s);
    const hasRelated = data.isRelated === '是';
    const isSectionActive = (stage) => data.status === stage && isEditing;

    return (
        <div className="ncr-overlay">
            <div className={`ncr-window ${isMaximized ? 'maximized' : ''}`} onClick={e => e.stopPropagation()}>

                {/* Toolbar */}
                <div className="ncr-toolbar">
                    <div className="ncr-toolbar-left">
                        <div className="ncr-icon"><i className="ri-file-damage-fill"></i></div>
                        <span className="ncr-title">不合格品处置单</span>
                        <span className={`ncr-status ${data.status === 'CLOSED' ? 'success' : ''}`}>{getStatusLabel(data.status)}</span>
                    </div>
                    <div className="ncr-toolbar-right">
                        {hasRelated && <div className="ncr-related-tag" onClick={() => setRelatedABNVisible(true)}><i className="ri-link-m"></i> 关联异常: {data.relatedId}</div>}
                        <ToolBtn onClick={() => setLogPanelVisible(true)}><i className="ri-history-line"></i> 日志</ToolBtn>
                        {!isEditing && data.status !== 'CLOSED' && <ToolBtn onClick={() => setIsEditing(true)}><i className="ri-edit-line"></i> 处理/编辑</ToolBtn>}
                        <ToolBtn active={showAttachmentDrawer} onClick={() => { console.log('Files:', fileList); setShowAttachmentDrawer(!showAttachmentDrawer); }}><i className="ri-attachment-2"></i> 附件 ({fileList.length}) {showAttachmentDrawer ? '▲' : '▼'}</ToolBtn>
                        {isEditing && (
                            <>
                                <ToolBtn onClick={() => setIsEditing(false)}><i className="ri-save-3-line"></i> 暂存</ToolBtn>
                                <ToolBtn type="primary" onClick={handleProcessOpen}><i className="ri-send-plane-fill"></i> 提交/流转</ToolBtn>
                            </>
                        )}
                        <div className="ncr-divider"></div>
                        <ToolBtn iconOnly onClick={() => setIsMaximized(!isMaximized)}><i className={`ri-${isMaximized ? 'fullscreen-exit' : 'fullscreen'}-line`}></i></ToolBtn>
                        <ToolBtn iconOnly onClick={onClose} className="close"><i className="ri-close-line"></i></ToolBtn>
                    </div>
                </div>

                {/* Paper */}
                <div className="ncr-scroll-area">
                    <div className="ncr-paper">
                        <div className="ncr-header-row">
                            <div style={{width:'250px'}}>编号: <span className="ncr-underline">{data.id}</span></div>
                            <div className="ncr-header-title">不合格品处置单</div>
                            <div style={{width:'250px', textAlign:'right'}}>NO: <Input value={data.seq} underline style={{width:'80px', display:'inline-block', textAlign:'center'}} isEditing={isEditing} canEdit={()=>true} onChange={v=>handleFieldChange('seq', v)} /></div>
                        </div>

                        <div className="ncr-grid">

                            {/* 1. 不合格说明 */}
                            <Cell vertical center bold style={{ gridRow: 'span 6', letterSpacing: '6px', fontSize: '14px' }}>不合格说明</Cell>
                            <Cell center highlight={isSectionActive('DRAFT')}>类型</Cell>
                            <Cell span={5} highlight={isSectionActive('DRAFT')}><CheckGroup options={['半成品', '成品']} value={data.type} align="left" isEditing={isEditing} section="desc" canEdit={checkCanEdit} onChange={v=>handleFieldChange('type',v)} /></Cell>
                            <Cell center highlight={isSectionActive('DRAFT')}>发生日期</Cell>
                            <Cell span={2} highlight={isSectionActive('DRAFT')}><Input type="date" value={data.date} isEditing={isEditing} section="desc" canEdit={checkCanEdit} onChange={v=>handleFieldChange('date',v)} /></Cell>
                            <Cell center highlight={isSectionActive('DRAFT')}>发生工序</Cell>
                            <Cell span={2} highlight={isSectionActive('DRAFT')}><Input value={data.step} isEditing={isEditing} section="desc" canEdit={checkCanEdit} onChange={v=>handleFieldChange('step',v)} /></Cell>
                            <Cell center highlight={isSectionActive('DRAFT')}>品名</Cell>
                            <Cell span={2} highlight={isSectionActive('DRAFT')}><Input value={data.name} isEditing={isEditing} section="desc" canEdit={checkCanEdit} onChange={v=>handleFieldChange('name',v)} /></Cell>
                            <Cell center highlight={isSectionActive('DRAFT')}>数量</Cell>
                            <Cell span={2} highlight={isSectionActive('DRAFT')}><Input value={data.qty} isEditing={isEditing} section="desc" canEdit={checkCanEdit} onChange={v=>handleFieldChange('qty',v)} /></Cell>
                            <Cell center highlight={isSectionActive('DRAFT')}>规格</Cell>
                            <Cell span={2} highlight={isSectionActive('DRAFT')}><Input value={data.spec} isEditing={isEditing} section="desc" canEdit={checkCanEdit} onChange={v=>handleFieldChange('spec',v)} /></Cell>
                            <Cell center highlight={isSectionActive('DRAFT')}>批号</Cell>
                            <Cell span={2} highlight={isSectionActive('DRAFT')}><Input value={data.batchNo} isEditing={isEditing} section="desc" canEdit={checkCanEdit} onChange={v=>handleFieldChange('batchNo',v)} /></Cell>
                            <Cell center style={{minHeight:'100px'}} highlight={isSectionActive('DRAFT')}>不良描述</Cell>
                            <Cell span={5} highlight={isSectionActive('DRAFT')} style={{padding:'8px', verticalAlign:'top', position:'relative'}}>
                                <TextArea value={data.desc} rows={4} style={{height:'100%'}} isEditing={isEditing} section="desc" canEdit={checkCanEdit} onChange={v=>handleFieldChange('desc',v)} />
                                {(checkCanEdit('desc') || fileList.some(f=>f.section==='desc')) && <SectionAttachment sectionKey="desc" isEditing={isEditing && checkCanEdit('desc')} onUploadClick={handleSectionUpload} files={fileList} />}
                            </Cell>
                            <Cell center highlight={isSectionActive('DRAFT')}>担当</Cell>
                            <Cell span={2} highlight={isSectionActive('DRAFT')}><Input value={data.finder} isEditing={isEditing} section="desc" canEdit={checkCanEdit} placeholder="发起人" onChange={v=>handleFieldChange('finder',v)} /></Cell>
                            <Cell center highlight={isSectionActive('PENDING_HEAD')}>确认</Cell>
                            <Cell span={2} highlight={isSectionActive('PENDING_HEAD')}><Input value={data.confirmer} isEditing={isEditing} section="confirm_head" canEdit={checkCanEdit} placeholder="部门负责人" onChange={v=>handleFieldChange('confirmer',v)} /></Cell>

                            {/* 2. 品质确认 */}
                            <Cell vertical center bold style={{ gridRow: 'span 3', letterSpacing: '6px', fontSize: '14px' }}>品质确认</Cell>
                            <Cell center highlight={isSectionActive('PENDING_QA')}>不合格等级</Cell>
                            <Cell span={5} highlight={isSectionActive('PENDING_QA')}><CheckGroup options={['轻微', '一般', '严重']} value={data.level} isEditing={isEditing} section="qa_confirm" canEdit={checkCanEdit} onChange={v=>handleFieldChange('level',v)} /></Cell>
                            <Cell center highlight={isSectionActive('PENDING_QA')}>责任单位</Cell>
                            <Cell span={5} highlight={isSectionActive('PENDING_QA')}><CheckGroup options={['研发部', '工艺部', '生产部', '设备部', '品质部']} value={data.respDept} multiple={true} isEditing={isEditing} section="qa_confirm" canEdit={checkCanEdit} onChange={v=>handleFieldChange('respDept',v)} /></Cell>
                            <Cell center highlight={isSectionActive('PENDING_QA')}>日期</Cell>
                            <Cell span={2} highlight={isSectionActive('PENDING_QA')}><Input type="date" value={data.qaDate} isEditing={isEditing} section="qa_confirm" canEdit={checkCanEdit} onChange={v=>handleFieldChange('qaDate',v)} /></Cell>
                            <Cell center highlight={isSectionActive('PENDING_QA')}>担当</Cell>
                            <Cell span={2} highlight={isSectionActive('PENDING_QA')}><Input value={data.qaPerson} isEditing={isEditing} section="qa_confirm" canEdit={checkCanEdit} placeholder="QA签字" onChange={v=>handleFieldChange('qaPerson',v)} /></Cell>

                            {/* 3. 评审会签 */}
                            <Cell vertical center bold style={{ gridRow: 'span 8', letterSpacing: '6px', fontSize: '14px', background:'#f9f9f9' }}>评审会签</Cell>
                            <Cell center bold style={{background:'#f9f9f9'}}>部门</Cell>
                            <Cell center bold span={3} style={{background:'#f9f9f9'}}>结论意见</Cell>
                            <Cell center bold span={2} style={{background:'#f9f9f9'}}>签字 / 日期</Cell>

                            {['研发部', '工艺部', '生产部', '品质部', 'CS (客服)', '事业部总监', '总经理'].map((deptName, idx) => {
                                const field = deptMap[deptName];
                                const sectionKey = `review_${field}`;
                                const isMyRow = data.status === 'PENDING_REVIEW' && currentUser.dept === deptName;
                                return (
                                    <React.Fragment key={idx}>
                                        <Cell center bold highlight={isMyRow}>{deptName}</Cell>
                                        <Cell span={3} highlight={isMyRow} style={{ display: 'flex', flexDirection: 'column', padding:'4px', justifyContent:'space-between' }}>
                                            <TextArea
                                                value={data[`${field}Comment`]} section={sectionKey}
                                                isEditing={isEditing} canEdit={checkCanEdit}
                                                onChange={v => handleFieldChange(`${field}Comment`, v)}
                                                rows={2} placeholder={isMyRow ? "在此填写意见(自动签字)..." : ""}
                                                style={{border:'none', background:'transparent', fontStyle:'italic', height:'40px', resize:'none', borderBottom:'1px dashed #eee'}}
                                            />
                                            <div style={{paddingTop:'2px'}}>
                                                <CheckGroup options={['降级', '报废', '返工', '特采']} value={data[`${field}Result`]} section={sectionKey} isEditing={isEditing} canEdit={checkCanEdit} onChange={v => handleFieldChange(`${field}Result`, v)} />
                                            </div>
                                        </Cell>
                                        <Cell span={2} highlight={isMyRow}>
                                            <Input value={data[`${field}Sign`]} forceReadOnly={true} placeholder={isMyRow ? "(自动带入)" : ""} />
                                        </Cell>
                                    </React.Fragment>
                                );
                            })}

                            {/* 4. 最终结论 (样式对齐修复) */}
                            <Cell vertical center bold style={{ letterSpacing: '6px', fontSize: '14px' }}>最终结论</Cell>
                            <Cell span={4} highlight={isSectionActive('PENDING_FINAL')} style={{padding:'8px', display:'flex', flexDirection:'column', height:'100px'}}>
                                <div style={{marginBottom:'5px'}}>
                                    <span style={{fontWeight:'bold', marginRight:'10px'}}>最终状态:</span>
                                    <span style={{display:'inline-block'}}>
                                        <CheckGroup options={['降级', '报废', '返工', '特采']} value={data.finalResult} align="left" section="final" isEditing={isEditing} canEdit={checkCanEdit} onChange={v => handleFieldChange('finalResult', v)} />
                                    </span>
                                </div>
                                <div style={{flex:1, display:'flex', flexDirection:'column'}}>
                                    <div style={{fontSize:'11px', color:'#888', marginBottom:'2px'}}>确认结论：</div>
                                    {/* [Fix] 样式与评审会签一致：透明背景、斜体、宽度撑满 */}
                                    <TextArea
                                        value={data.finalConclusion}
                                        section="final"
                                        isEditing={isEditing}
                                        canEdit={checkCanEdit}
                                        onChange={v => handleFieldChange('finalConclusion', v)}
                                        rows={2}
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            fontStyle: 'italic',
                                            resize: 'none',
                                            width: '100%',
                                            flex: 1
                                        }}
                                    />
                                </div>
                            </Cell>
                            <Cell span={2} highlight={isSectionActive('PENDING_FINAL')} style={{position:'relative', verticalAlign:'bottom'}}>
                                <div style={{marginTop:'45px'}}>
                                    <Input
                                        value={data.finalSign}
                                        section="final"
                                        isEditing={isEditing}
                                        canEdit={checkCanEdit}
                                        onChange={v => handleFieldChange('finalSign', v)}
                                    />
                                </div>
                            </Cell>
                        </div>
                        <div className="ncr-footer-note"><span>制定/修订部门: 材料事业部品质</span></div>
                    </div>
                </div>

                <NCRProcessModal visible={processModalVisible} currentStatus={data.status} data={data} onClose={() => setProcessModalVisible(false)} onProcessSubmit={handleProcessSubmit} />
                <UploadModal visible={uploadModalVisible} onClose={() => setUploadModalVisible(false)} onUploadSuccess={handleUploadSuccess} />
                <LogPanel visible={logPanelVisible} onClose={() => setLogPanelVisible(false)} logs={logs} flows={[]} />
                <div className={`ncr-attachment-drawer ${showAttachmentDrawer ? 'open' : ''}`}>
                    <div className="drawer-header"><span className="drawer-title"><i className="ri-attachment-2"></i> 附件列表 ({fileList.length})</span><div className="drawer-actions">{isEditing && <button className="small-btn primary" onClick={() => handleSectionUpload('common')}><i className="ri-upload-cloud-line"></i> 上传文件</button>}<i className="ri-close-line icon-btn" onClick={() => setShowAttachmentDrawer(false)}></i></div></div>
                    <div className="drawer-body">{fileList.length === 0 ? <div className="empty-state">暂无附件</div> : <div className="ncr-file-grid">{fileList.map((file, i) => <div key={i} className="ncr-file-card"><i className={`ri-file-${file.type === 'pdf' ? 'pdf' : 'image'}-fill`} style={{ fontSize: '24px', color: '#1890ff' }}></i><div style={{ fontSize: '12px', fontWeight: 'bold' }}>{file.name}</div><div style={{ fontSize: '10px', color: '#666' }}>{file.section || '通用'}</div></div>)}</div>}</div>
                </div>
                <BaseModal visible={relatedABNVisible} title={`关联异常: ${data.relatedId}`} onClose={()=>setRelatedABNVisible(false)} width="800px" footer={null}><div style={{padding:'40px',textAlign:'center'}}>View Only</div></BaseModal>
            </div>
        </div>
    );
};

export default NonConformingDetail;