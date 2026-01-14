/**
 * @file: src/features/QMS/AbnormalEventDetail.jsx
 * @version: v13.0.0 (Strict ReadOnly & Section Attachments)
 * @description: 异常事件处置单详情 - 深度定制版
 * - [Fix] 临时小组、底部签字栏强制只读且不换行。
 * - [Remove] 移除效果验证的人工判定按钮。
 * - [Feature] 5个核心区块增加独立上传按钮，支持单文件挂载。
 * - [UI] 附件列表增加来源区分，表单内显示关联附件。
 * @author: AI Copilot
 * @lastModified: 2026-01-14
 */
import React, { useState, useEffect } from 'react';
import UploadModal from '../../components/Common/UploadModal';
import LogPanel from '../../components/Common/LogPanel';
import './AbnormalEventDetail.css';

// --- 辅助渲染组件 ---

const Cell = ({ children, span = 1, className = '', style = {}, title, vertical, center, bold, bg, noWrap }) => {
    const classes = [
        'aed-cell',
        vertical ? 'aed-vertical' : '',
        center ? 'aed-center' : '',
        bold ? 'aed-bold' : '',
        bg ? 'aed-bg-yellow' : '',
        noWrap ? 'aed-nowrap' : '',
        className
    ].filter(Boolean).join(' ');

    const computedStyle = {
        gridColumn: `span ${span}`,
        ...style
    };

    return (
        <div className={classes} style={computedStyle} title={title}>
            {children}
        </div>
    );
};

const Label = ({ children }) => <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{children}</div>;

// 增强版 Input
const Input = ({ value, onChange, align = 'left', placeholder, type = 'text', section, suggestions, isEditing, canEdit, style, forceReadOnly }) => {
    const editable = !forceReadOnly && isEditing && (!section || canEdit(section));

    const handleFocus = (e) => {
        if (editable && (type === 'date' || type === 'datetime-local')) {
            e.target.type = type;
            e.target.showPicker && e.target.showPicker();
        }
    };

    const handleBlur = (e) => {
        if ((type === 'date' || type === 'datetime-local') && !e.target.value) {
            e.target.type = 'text';
        }
    };

    const inputType = (type === 'date' || type === 'datetime-local') && !value ? 'text' : type;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
            <input
                type={inputType}
                className={`aed-input ${!editable ? 'readonly' : ''}`}
                style={{ textAlign: align, ...style }}
                value={value || ''}
                onChange={e => editable && onChange && onChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={editable ? placeholder : ''}
                readOnly={!editable}
                list={suggestions ? `list-${placeholder?.replace(/\s+/g, '-')}` : undefined}
            />
            {editable && suggestions && (
                <datalist id={`list-${placeholder?.replace(/\s+/g, '-')}`}>
                    {suggestions.map(s => <option key={s} value={s} />)}
                </datalist>
            )}
        </div>
    );
};

const Select = ({ value, onChange, options, section, isEditing, canEdit }) => {
    const editable = isEditing && (!section || canEdit(section));
    return editable ? (
        <select className="aed-input" style={{ textIndent: '4px' }} value={value || ''} onChange={e => onChange && onChange(e.target.value)}>
            <option value="">请选择</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    ) : (
        <div className="aed-input" style={{ display: 'flex', alignItems: 'center' }}>{value}</div>
    );
};

const TextArea = ({ value, onChange, rows = 3, placeholder, section, isEditing, canEdit }) => {
    const editable = isEditing && (!section || canEdit(section));
    return (
        <textarea
            className={`aed-textarea ${!editable ? 'readonly' : ''}`}
            style={{ minHeight: `${rows * 20}px` }}
            rows={rows}
            value={value || ''}
            onChange={e => onChange && onChange(e.target.value)}
            placeholder={editable ? placeholder : ''}
            readOnly={!editable}
        />
    );
};

const CheckGroup = ({ options, value, onChange, section, isEditing, canEdit }) => {
    const editable = isEditing && (!section || canEdit(section));
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', height: '100%', paddingLeft: '4px' }}>
            {options.map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: editable ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
                    <span
                        onClick={() => editable && onChange && onChange(opt)}
                        style={{ fontSize: '16px', marginRight: '2px', lineHeight: 1, fontWeight: value === opt ? 'bold' : 'normal' }}
                    >
                        {value === opt ? '☑' : '☐'}
                    </span>
                    {opt}
                </label>
            ))}
        </div>
    );
};

const ToolBtn = ({ children, onClick, type = 'default', iconOnly, active }) => {
    const classes = [
        'aed-btn',
        type === 'primary' ? 'primary' : '',
        type === 'danger' ? 'danger' : '',
        iconOnly ? 'icon-only' : '',
        active ? 'active' : ''
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} onClick={onClick}>
            {children}
        </button>
    );
};

// 区块附件上传与显示组件
const SectionAttachment = ({ sectionKey, isEditing, onUploadClick, files }) => {
    const sectionFile = files.find(f => f.section === sectionKey);

    return (
        <div className="aed-section-attach">
            {/* 上传按钮 */}
            {isEditing && !sectionFile && (
                <span
                    className="aed-attach-btn"
                    onClick={() => onUploadClick(sectionKey)}
                    title="上传关联附件"
                >
                    <i className="ri-attachment-line"></i> 上传附件
                </span>
            )}

            {/* 已上传文件显示 (右下角) */}
            {sectionFile && (
                <div className="aed-attached-file">
                    <i className="ri-attachment-2"></i>
                    <span className="file-link" onClick={() => alert(`预览: ${sectionFile.name}`)}>{sectionFile.name}</span>
                    {isEditing && (
                        <i className="ri-close-circle-fill remove-btn" title="删除" onClick={() => onUploadClick(sectionKey, true)}></i>
                    )}
                </div>
            )}
        </div>
    );
};

const AbnormalEventDetail = ({ visible, onClose, record, isEditing: initialEditing, onSubmit }) => {
    if (!visible) return null;

    // --- 1. 核心状态 ---
    const [data, setData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    // 面板控制状态
    const [showAttachmentDrawer, setShowAttachmentDrawer] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [logPanelVisible, setLogPanelVisible] = useState(false);

    // 当前正在上传的区块标记
    const [currentUploadSection, setCurrentUploadSection] = useState(null);

    // 附件数据 (增加 section 字段标识来源)
    const [fileList, setFileList] = useState([
        { name: '现场异常照片.pdf', size: '2.4 MB', type: 'pdf', section: 'desc' },
        { name: 'NG样品图.jpg', size: '1.1 MB', type: 'img', section: 'common' }
    ]);

    // 模拟日志数据
    const mockLogs = {
        flows: [
            { node: '异常发起', status: 'done', operator: '张操作', time: '2026-01-12 09:30', comment: '发现涂布厚度异常，已停机。' },
            { node: '初步确认', status: 'done', operator: '王经理', time: '2026-01-12 10:15', comment: '确认属实，转交品质确认。' },
            { node: '品质确认', status: 'done', operator: '李质检', time: '2026-01-12 10:45', comment: '确认为批量质量事故。' },
            { node: '围堵措施', status: 'done', operator: '赵工艺', time: '2026-01-12 14:00', comment: '已隔离库存，并通知下道工序。' },
            { node: '根因分析', status: 'processing', operator: '赵工艺', time: '处理中...', comment: '' }
        ],
        logs: [
            { user: '张操作', action: '创建单据', time: '2026-01-12 09:25' },
            { user: '张操作', action: '提交审批', time: '2026-01-12 09:30' },
            { user: '王经理', action: '查看详情', time: '2026-01-12 10:05' },
            { user: '王经理', action: '审批通过', time: '2026-01-12 10:15' }
        ]
    };

    useEffect(() => {
        const initData = record || {};
        const safeData = {
            ...initData,
            date: initData.date || '',
            confirmTime: initData.confirmTime || '',
            finishDate: initData.finishDate || '',
            capaConfirmDate: initData.capaConfirmDate || '',
            verifyDate: initData.verifyDate || ''
        };
        setData(safeData);
        setIsEditing(initialEditing);
        setIsMaximized(false);
        setShowAttachmentDrawer(false);
    }, [record, initialEditing, visible]);

    // --- 2. 逻辑处理 ---
    const handleFieldChange = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    // 触发区块上传
    const handleSectionUpload = (section, isRemove = false) => {
        if (isRemove) {
            // 删除该区块的附件
            if(window.confirm('确定要删除该关联附件吗？')) {
                setFileList(prev => prev.filter(f => f.section !== section));
            }
        } else {
            // 打开上传弹窗
            setCurrentUploadSection(section);
            setUploadModalVisible(true);
        }
    };

    // 上传成功回调
    const handleUploadSuccess = (newFiles) => {
        // 如果是指定区块上传，只取第一个文件（因为限制只能传一个）
        if (currentUploadSection) {
            const fileToAdd = newFiles[0];
            if (fileToAdd) {
                // 先移除该区块旧文件，再添加新文件
                setFileList(prev => [
                    ...prev.filter(f => f.section !== currentUploadSection),
                    { ...fileToAdd, section: currentUploadSection }
                ]);
            }
        } else {
            // 通用上传 (底部抽屉按钮触发)
            setFileList(prev => [...prev, ...newFiles.map(f => ({ ...f, section: 'common' }))]);
        }
        setUploadModalVisible(false);
        setCurrentUploadSection(null);
    };

    const getSectionLabel = (sec) => {
        const map = {
            'desc': '异常描述',
            'containment': '围堵措施',
            'rootCause': '根因分析',
            'capa': '纠正措施',
            'verify': '品质确认',
            'common': '通用附件'
        };
        return map[sec] || '未知来源';
    };

    const handleProcess = (action) => {
        let nextStatus = data.status;
        let msg = '操作成功';
        if (onSubmit) onSubmit({ ...data, status: nextStatus }, msg);
    };

    const checkCanEdit = (section) => {
        if (!isEditing) return false;
        if (data.status === 'DRAFT') return true;
        const map = {
            'PENDING_CONFIRM': ['confirm'],
            'PENDING_QA_CONFIRM': ['qa_team'],
            'PENDING_CONTAINMENT': ['containment', 'qa_team'],
            'PENDING_ANALYSIS': ['analysis'],
            'PENDING_VERIFY': ['verify']
        };
        const editableSections = map[data.status] || [];
        return editableSections.includes(section);
    };

    const hasRelatedProduct = data.isRelated === '是';
    const discoveryRowSpan = 5 + (hasRelatedProduct ? 1 : 0);
    const commonProps = { isEditing, canEdit: checkCanEdit };

    return (
        <div className="aed-overlay" onClick={onClose}>
            <div className={`aed-window ${isMaximized ? 'maximized' : ''}`} onClick={e => e.stopPropagation()}>

                <div className="aed-container">
                    {/* Toolbar */}
                    <div className="aed-toolbar">
                        <div className="aed-toolbar-left">
                            <div className="aed-icon"><i className="ri-file-warning-fill"></i></div>
                            <span className="aed-title">异常事件处置单</span>
                            <span className="aed-id">{data.id}</span>
                            <span className="aed-status">{getStatusLabel(data.status)}</span>
                        </div>

                        <div className="aed-toolbar-right">
                            <ToolBtn onClick={() => setLogPanelVisible(true)}><i className="ri-history-line"></i> 日志</ToolBtn>

                            {!isEditing && data.status !== 'CLOSED' && (
                                <>
                                    <ToolBtn onClick={() => setIsEditing(true)}><i className="ri-edit-line"></i> 处理/编辑</ToolBtn>
                                </>
                            )}

                            <ToolBtn
                                active={showAttachmentDrawer}
                                onClick={() => setShowAttachmentDrawer(!showAttachmentDrawer)}
                            >
                                <i className="ri-attachment-2"></i> 附件 ({fileList.length}) {showAttachmentDrawer ? '▲' : '▼'}
                            </ToolBtn>

                            {isEditing && (
                                <>
                                    {data.status === 'PENDING_VERIFY' && (
                                        <ToolBtn type="danger" onClick={() => handleProcess('reject')}><i className="ri-close-circle-line"></i> 驳回</ToolBtn>
                                    )}
                                    <ToolBtn onClick={() => { setIsEditing(false); alert('已保存草稿'); }}><i className="ri-save-3-line"></i> 保存</ToolBtn>
                                    <ToolBtn type="primary" onClick={() => handleProcess('submit')}><i className="ri-send-plane-fill"></i> 提交下一步</ToolBtn>
                                </>
                            )}
                            <div className="aed-divider"></div>
                            <ToolBtn iconOnly onClick={() => setIsMaximized(!isMaximized)}><i className={`ri-${isMaximized ? 'fullscreen-exit' : 'fullscreen'}-line`}></i></ToolBtn>
                            <ToolBtn iconOnly onClick={onClose} className="close"><i className="ri-close-line"></i></ToolBtn>
                        </div>
                    </div>

                    {/* Paper Area */}
                    <div className="aed-scroll-area">
                        <div className="aed-paper">
                            <div className="aed-header-row">
                                <div style={{width:'200px'}}>编号: <span className="aed-underline">{data.id}</span></div>
                                <div className="aed-header-title">异常事件处理单</div>
                                <div style={{width:'200px', textAlign:'right'}}>
                                    <div>版本版次号: A/1</div>
                                    <div style={{marginTop:'4px'}}>序号: <span className="aed-underline" style={{minWidth:'40px', display:'inline-block'}}>001</span></div>
                                </div>
                            </div>

                            <div className="aed-grid">
                                {/* 1. 发现及确认 */}
                                <Cell span={1} vertical bold style={{ gridRow: `span ${discoveryRowSpan}` }}>发现及确认</Cell>

                                <Cell bold center className="aed-v-center" noWrap>发现部门</Cell>
                                <Cell className="aed-v-center"><Select value={data.dept} options={['生产部','品质部','工艺部']} section="discovery" onChange={v => handleFieldChange('dept', v)} {...commonProps}/></Cell>
                                <Cell bold center className="aed-v-center" noWrap>发现时间</Cell>
                                <Cell className="aed-v-center"><Input value={data.date} type="date" align="center" section="discovery" onChange={v => handleFieldChange('date', v)} {...commonProps}/></Cell>
                                <Cell bold center className="aed-v-center" noWrap>发现人</Cell>
                                <Cell className="aed-v-center"><Input value={data.finder} align="center" placeholder="工号" section="discovery" onChange={v => handleFieldChange('finder', v)} {...commonProps}/></Cell>

                                <Cell bold center className="aed-v-center" noWrap>确认部门</Cell>
                                <Cell className="aed-v-center"><Input value={data.confirmDept} section="confirm" onChange={v => handleFieldChange('confirmDept', v)} {...commonProps}/></Cell>
                                <Cell bold center className="aed-v-center" noWrap>确认时间</Cell>
                                <Cell className="aed-v-center"><Input value={data.confirmTime} type="datetime-local" align="center" section="confirm" onChange={v => handleFieldChange('confirmTime', v)} {...commonProps}/></Cell>
                                <Cell bold center className="aed-v-center" noWrap>确认人</Cell>
                                <Cell className="aed-v-center"><Input value={data.confirmer} align="center" section="confirm" onChange={v => handleFieldChange('confirmer', v)} {...commonProps}/></Cell>

                                <Cell bold center className="aed-v-center" noWrap>异常类别</Cell>
                                <Cell span={5} className="aed-v-center">
                                    <CheckGroup options={['生产异常', '工艺异常', '设备异常', '厂务系统异常', 'IT系统异常', '安全事故', '其它']} value={data.type} section="discovery" onChange={v => handleFieldChange('type', v)} {...commonProps}/>
                                </Cell>

                                <Cell bold center className="aed-v-center" noWrap>异常等级</Cell>
                                <Cell span={1} className="aed-v-center">
                                    <CheckGroup options={['严重', '一般', '轻微']} value={data.level} section="confirm" onChange={v => handleFieldChange('level', v)} {...commonProps}/>
                                </Cell>
                                <Cell bold center className="aed-v-center" span={2}>是否关联产品</Cell>
                                <Cell span={2} className="aed-v-center">
                                    <CheckGroup options={['否', '是']} value={data.isRelated} section="discovery" onChange={v => handleFieldChange('isRelated', v)} {...commonProps}/>
                                    {hasRelatedProduct && <span style={{fontSize:'10px', color:'#faad14', marginLeft:'5px'}}>(关联NCR)</span>}
                                </Cell>

                                {hasRelatedProduct && (
                                    <>
                                        <Cell bold center className="aed-v-center" noWrap>关联产品</Cell>
                                        <Cell span={5} className="aed-v-center" bg>
                                            <div style={{display:'flex', width:'100%', gap:'10px'}}>
                                                <div style={{flex:1}}><Input value={data.prodModel} placeholder="产品型号" section="discovery" onChange={v => handleFieldChange('prodModel', v)} {...commonProps}/></div>
                                                <div style={{flex:1}}><Input value={data.batchNo} placeholder="批次号" section="discovery" onChange={v => handleFieldChange('batchNo', v)} {...commonProps}/></div>
                                            </div>
                                        </Cell>
                                    </>
                                )}

                                <Cell span={6} style={{padding:'8px', minHeight:'100px', position:'relative'}}>
                                    <Label>异常描述:</Label>
                                    <TextArea value={data.desc} rows={4} section="discovery" onChange={v => handleFieldChange('desc', v)} {...commonProps}/>
                                    <SectionAttachment sectionKey="desc" isEditing={isEditing && checkCanEdit('discovery')} onUploadClick={handleSectionUpload} files={fileList} />
                                </Cell>

                                {/* 2. 临时小组 (全部只读 + 不换行) */}
                                <Cell span={1} vertical bold style={{ gridRow: 'span 5' }}>临时小组</Cell>
                                <Cell span={6} style={{padding:'8px', minHeight:'60px', position:'relative'}}>
                                    <Label>围堵措施:</Label>
                                    <TextArea value={data.containment} rows={2} section="containment" onChange={v => handleFieldChange('containment', v)} {...commonProps}/>
                                    <SectionAttachment sectionKey="containment" isEditing={isEditing && checkCanEdit('containment')} onUploadClick={handleSectionUpload} files={fileList} />
                                </Cell>
                                {[1,2,3,4].map(i => (
                                    <Cell key={i} span={6} className="aed-no-padding">
                                        <div style={{display:'flex', height:'100%', alignItems:'center', whiteSpace:'nowrap', overflow:'hidden'}}>
                                            <div style={{flex:1, display:'flex', alignItems:'center', padding:'0 8px'}}><span style={{fontWeight:'bold', marginRight:'4px'}}>部门:</span>【<Input align="center" forceReadOnly={true} {...commonProps}/>】</div>
                                            <div style={{flex:1, display:'flex', alignItems:'center', padding:'0 8px', borderLeft:'1px solid #000', borderRight:'1px solid #000', height:'100%'}}><span style={{fontWeight:'bold', marginRight:'4px'}}>签名:</span>【<Input align="center" forceReadOnly={true} {...commonProps}/>】</div>
                                            <div style={{flex:1, display:'flex', alignItems:'center', padding:'0 8px'}}><span style={{fontWeight:'bold', marginRight:'4px'}}>日期:</span>【<Input align="center" type="date" forceReadOnly={true} {...commonProps}/>】</div>
                                        </div>
                                    </Cell>
                                ))}

                                {/* 3. 职责部门 */}
                                <Cell span={1} vertical bold style={{ gridRow: 'span 2' }}>职责部门</Cell>
                                <Cell span={6} style={{padding:'8px', position:'relative'}}>
                                    <Label>根因分析:</Label>
                                    <TextArea value={data.rootCause} rows={4} section="analysis" onChange={v => handleFieldChange('rootCause', v)} {...commonProps}/>
                                    <SectionAttachment sectionKey="rootCause" isEditing={isEditing && checkCanEdit('analysis')} onUploadClick={handleSectionUpload} files={fileList} />
                                    <div className="aed-sign-row">
                                        {/* 签字项强制只读 */}
                                        <span>责任部门: <input className="aed-sign-input readonly" readOnly value={data.respDept} /></span>
                                        <span>责任人: <input className="aed-sign-input readonly" readOnly value={data.respUser} /></span>
                                        <span>完成日期: <input className="aed-sign-input readonly" readOnly value={data.finishDate} /></span>
                                    </div>
                                </Cell>
                                <Cell span={6} style={{padding:'8px', position:'relative'}}>
                                    <Label>纠正预防措施 (CAPA):</Label>
                                    <TextArea value={data.capa} rows={4} section="analysis" onChange={v => handleFieldChange('capa', v)} {...commonProps}/>
                                    <SectionAttachment sectionKey="capa" isEditing={isEditing && checkCanEdit('analysis')} onUploadClick={handleSectionUpload} files={fileList} />
                                    <div className="aed-sign-row">
                                        {/* 签字项强制只读 */}
                                        <span>确认人: <input className="aed-sign-input readonly" readOnly value={data.capaConfirmer} /></span>
                                        <span>确认日期: <input className="aed-sign-input readonly" readOnly value={data.capaConfirmDate} /></span>
                                    </div>
                                </Cell>

                                {/* 4. 效果验证 */}
                                <Cell span={1} vertical bold>效果验证</Cell>
                                <Cell span={6} style={{padding:'8px', position:'relative'}}>
                                    <Label>品质部门确认:</Label>
                                    <div style={{ display: 'flex', gap: '40px', padding: '10px 20px' }}>
                                        <label><span style={{marginRight:'4px', fontSize:'16px'}}>{data.verifyResult==='OK'?'☑':'☐'}</span> 措施已落实</label>
                                        <label><span style={{marginRight:'4px', fontSize:'16px'}}>{data.verifyResult==='NG'?'☑':'☐'}</span> 异常未消除</label>
                                    </div>
                                    <SectionAttachment sectionKey="verify" isEditing={isEditing && checkCanEdit('verify')} onUploadClick={handleSectionUpload} files={fileList} />

                                    <div className="aed-sign-row">
                                        {/* 签字项强制只读 */}
                                        <span>验证人: <input className="aed-sign-input readonly" readOnly value={data.verifyUser} /></span>
                                        <span>日期: <input className="aed-sign-input readonly" readOnly value={data.verifyDate} /></span>
                                    </div>
                                </Cell>

                                {/* Footer 注释 */}
                                <Cell span={7} className="aed-no-border">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '13px', padding: '0 5px' }}>
                                        <span>注: 关联单据需同步结案</span>
                                    </div>
                                </Cell>
                            </div>
                        </div>

                        {/* 底部垫高 */}
                        <div style={{ height: showAttachmentDrawer ? '240px' : '0px', transition: 'height 0.3s' }}></div>
                    </div>

                    {/* 底部固定附件抽屉 */}
                    <div className={`aed-attachment-drawer ${showAttachmentDrawer ? 'open' : ''}`}>
                        <div className="drawer-header">
                            <span className="drawer-title"><i className="ri-attachment-2"></i> 附件列表 ({fileList.length})</span>
                            <div className="drawer-actions">
                                {isEditing && (
                                    <button className="small-btn primary" onClick={() => handleSectionUpload(null)}>
                                        <i className="ri-upload-cloud-line"></i> 上传通用文件
                                    </button>
                                )}
                                <i className="ri-close-line icon-btn" onClick={() => setShowAttachmentDrawer(false)}></i>
                            </div>
                        </div>
                        <div className="drawer-body">
                            {fileList.length === 0 ? (
                                <div className="empty-state">暂无附件</div>
                            ) : (
                                <div className="aed-file-grid">
                                    {fileList.map((file, i) => (
                                        <div key={i} className="aed-file-card">
                                            <i className={`ri-file-${file.type === 'pdf' ? 'pdf' : 'image'}-fill`} style={{fontSize: '24px', color: file.type === 'pdf' ? '#ff4d4f' : '#1890ff'}}></i>
                                            <div style={{fontSize: '12px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{file.name}</div>
                                            <div style={{fontSize: '10px', color: '#999'}}>{file.size}</div>
                                            {/* 显示来源 */}
                                            <div style={{fontSize: '10px', color: '#666', marginTop:'2px', background:'#eee', padding:'2px 4px', borderRadius:'2px', textAlign:'center'}}>
                                                来源: {getSectionLabel(file.section)}
                                            </div>
                                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop:'auto'}}>
                                                <button style={{border: 'none', background: 'none', color: '#1890ff', fontSize: '11px', cursor: 'pointer'}}>预览</button>
                                                {isEditing && <button style={{border: 'none', background: 'none', color: '#ff4d4f', fontSize: '11px', cursor: 'pointer'}}>删除</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 弹窗层 */}
            <UploadModal
                visible={uploadModalVisible}
                onClose={() => setUploadModalVisible(false)}
                onUploadSuccess={handleUploadSuccess}
            />

            <LogPanel
                visible={logPanelVisible}
                onClose={() => setLogPanelVisible(false)}
                logs={mockLogs.logs}
                flows={mockLogs.flows}
            />
        </div>
    );
};

const getStatusLabel = (s) => {
    const map = {
        'DRAFT': '草稿',
        'PENDING_CONFIRM': '待初步确认',
        'PENDING_QA_CONFIRM': '待品质确认',
        'PENDING_CONTAINMENT': '待围堵',
        'PENDING_ANALYSIS': '待根因分析',
        'PENDING_VERIFY': '待效果验证',
        'CLOSED': '已结案'
    };
    return map[s] || s;
};

export default AbnormalEventDetail;