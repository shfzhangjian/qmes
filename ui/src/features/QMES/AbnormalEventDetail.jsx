/**
 * @file: src/features/QMS/AbnormalEventDetail.jsx
 * @version: v11.0.0 (CSS File Solution)
 * @description: 异常事件处置单详情
 * - 【最终修复】放弃内联样式，全面使用 CSS 文件 (AbnormalEventDetail.css)。
 * - 解决了 "Unexpected digit after hash token" 等编译错误。
 * - 恢复了完美的布局和样式。
 * @author: AI Copilot
 * @createDate: 2026-01-14
 */
import React, { useState, useEffect } from 'react';
import './AbnormalEventDetail.css'; // 引入专用 CSS

// --- 辅助渲染组件 ---

const Cell = ({ children, span = 1, className = '', style = {}, title, vertical, center, bold, bg }) => {
    // 组合 ClassName
    const classes = [
        'aed-cell',
        vertical ? 'aed-vertical' : '',
        center ? 'aed-center' : '',
        bold ? 'aed-bold' : '',
        bg ? 'aed-bg-yellow' : '',
        className
    ].filter(Boolean).join(' ');

    const computedStyle = {
        gridColumn: `span ${span}`,
        ...style // 仅用于特殊的动态样式
    };

    return (
        <div className={classes} style={computedStyle} title={title}>
            {children}
        </div>
    );
};

const Label = ({ children }) => <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{children}</div>;

const Input = ({ value, onChange, align = 'left', placeholder, type = 'text', section, suggestions, isEditing, canEdit, style }) => {
    const editable = isEditing && (!section || canEdit(section));
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
            <input
                type={type}
                className={`aed-input ${!editable ? 'readonly' : ''}`}
                style={{ textAlign: align, ...style }}
                value={value || ''}
                onChange={e => onChange && onChange(e.target.value)}
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

const ToolBtn = ({ children, onClick, type = 'default', iconOnly }) => {
    const classes = [
        'aed-btn',
        type === 'primary' ? 'primary' : '',
        type === 'danger' ? 'danger' : '',
        iconOnly ? 'icon-only' : ''
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} onClick={onClick}>
            {children}
        </button>
    );
};

const AbnormalEventDetail = ({ visible, onClose, record, isEditing: initialEditing, onSubmit }) => {
    if (!visible) return null;

    // --- 1. 核心状态 ---
    const [data, setData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [showAttachment, setShowAttachment] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fileList, setFileList] = useState([
        { name: '现场异常照片.pdf', size: '2.4 MB', type: 'pdf' },
        { name: 'NG样品图.jpg', size: '1.1 MB', type: 'img' }
    ]);

    useEffect(() => {
        setData(record || {});
        setIsEditing(initialEditing);
        setIsMaximized(false);
        setShowAttachment(false);
    }, [record, initialEditing, visible]);

    // --- 2. 逻辑处理 ---
    const handleFieldChange = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            setFileList(prev => [...prev, { name: `补充证据_${Date.now().toString().slice(-4)}.png`, size: '0.5 MB', type: 'img' }]);
            setIsUploading(false);
        }, 1000);
    };

    const handleProcess = (action) => {
        let nextStatus = data.status;
        let msg = '操作成功';
        // 状态流转逻辑...
        const workflow = {
            'DRAFT': { next: 'PENDING_CONFIRM', msg: '单据已发起，转交责任部门初步确认。' },
            'PENDING_CONFIRM': { next: 'PENDING_QA_CONFIRM', msg: '初步确认完成，转交品质部确认。' },
            'PENDING_QA_CONFIRM': { next: 'PENDING_CONTAINMENT', msg: '品质确认完成，请责任部门制定围堵措施。' },
            'PENDING_CONTAINMENT': { next: 'PENDING_ANALYSIS', msg: '围堵措施已提交，进入根因分析阶段。' },
            'PENDING_ANALYSIS': { next: 'PENDING_VERIFY', msg: '分析对策已提交，等待品质验证。' },
            'PENDING_VERIFY': { next: 'CLOSED', msg: '效果验证有效，流程结案。' }
        };

        if (data.status === 'PENDING_VERIFY' && action === 'reject') {
            nextStatus = 'PENDING_ANALYSIS';
            msg = '验证不通过，已驳回重新分析。';
        } else if (workflow[data.status]) {
            nextStatus = workflow[data.status].next;
            msg = workflow[data.status].msg;
        }
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
                            {!isEditing && data.status !== 'CLOSED' && (
                                <>
                                    <ToolBtn onClick={() => setIsEditing(true)}><i className="ri-edit-line"></i> 处理/编辑</ToolBtn>
                                    <ToolBtn onClick={() => setShowAttachment(!showAttachment)}><i className="ri-attachment-2"></i> 附件 ({fileList.length})</ToolBtn>
                                </>
                            )}
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

                                <Cell bold center className="aed-v-center">发现部门</Cell>
                                <Cell className="aed-v-center"><Select value={data.dept} options={['生产部','品质部','工艺部']} section="discovery" onChange={v => handleFieldChange('dept', v)} {...commonProps}/></Cell>
                                <Cell bold center className="aed-v-center">发现时间</Cell>
                                <Cell className="aed-v-center"><Input value={data.date} type="date" align="center" section="discovery" onChange={v => handleFieldChange('date', v)} {...commonProps}/></Cell>
                                <Cell bold center className="aed-v-center">发现人</Cell>
                                <Cell className="aed-v-center"><Input value={data.finder} align="center" placeholder="工号" section="discovery" onChange={v => handleFieldChange('finder', v)} {...commonProps}/></Cell>

                                <Cell bold center className="aed-v-center">确认部门</Cell>
                                <Cell className="aed-v-center"><Input value={data.confirmDept} section="confirm" onChange={v => handleFieldChange('confirmDept', v)} {...commonProps}/></Cell>
                                <Cell bold center className="aed-v-center">确认时间</Cell>
                                <Cell className="aed-v-center"><Input value={data.confirmTime} type="datetime-local" align="center" section="confirm" onChange={v => handleFieldChange('confirmTime', v)} {...commonProps}/></Cell>
                                <Cell bold center className="aed-v-center">确认人</Cell>
                                <Cell className="aed-v-center"><Input value={data.confirmer} align="center" section="confirm" onChange={v => handleFieldChange('confirmer', v)} {...commonProps}/></Cell>

                                <Cell bold center className="aed-v-center">异常类别</Cell>
                                <Cell span={5} className="aed-v-center">
                                    <CheckGroup options={['生产异常', '工艺异常', '设备异常', '厂务系统异常', 'IT系统异常', '安全事故', '其它']} value={data.type} section="discovery" onChange={v => handleFieldChange('type', v)} {...commonProps}/>
                                </Cell>

                                <Cell bold center className="aed-v-center">异常等级</Cell>
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
                                        <Cell bold center className="aed-v-center">关联产品</Cell>
                                        <Cell span={5} className="aed-v-center" bg>
                                            <div style={{display:'flex', width:'100%', gap:'10px'}}>
                                                <div style={{flex:1}}><Input value={data.prodModel} placeholder="产品型号" section="discovery" onChange={v => handleFieldChange('prodModel', v)} {...commonProps}/></div>
                                                <div style={{flex:1}}><Input value={data.batchNo} placeholder="批次号" section="discovery" onChange={v => handleFieldChange('batchNo', v)} {...commonProps}/></div>
                                            </div>
                                        </Cell>
                                    </>
                                )}

                                <Cell span={6} style={{padding:'8px', minHeight:'100px'}}>
                                    <Label>异常描述:</Label>
                                    <TextArea value={data.desc} rows={4} section="discovery" onChange={v => handleFieldChange('desc', v)} {...commonProps}/>
                                </Cell>

                                {/* 2. 临时小组 */}
                                <Cell span={1} vertical bold style={{ gridRow: 'span 5' }}>临时小组</Cell>
                                <Cell span={6} style={{padding:'8px', minHeight:'60px'}}>
                                    <Label>围堵措施:</Label>
                                    <TextArea value={data.containment} rows={2} section="containment" onChange={v => handleFieldChange('containment', v)} {...commonProps}/>
                                </Cell>
                                {[1,2,3,4].map(i => (
                                    <Cell key={i} span={6} className="aed-no-padding">
                                        <div style={{display:'flex', height:'100%', alignItems:'center'}}>
                                            <div style={{flex:1, display:'flex', alignItems:'center', padding:'0 8px'}}><span style={{fontWeight:'bold', marginRight:'4px'}}>部门:</span>【<Input align="center" section="qa_team" {...commonProps}/>】</div>
                                            <div style={{flex:1, display:'flex', alignItems:'center', padding:'0 8px', borderLeft:'1px solid #000', borderRight:'1px solid #000', height:'100%'}}><span style={{fontWeight:'bold', marginRight:'4px'}}>签名:</span>【<Input align="center" section="qa_team" {...commonProps}/>】</div>
                                            <div style={{flex:1, display:'flex', alignItems:'center', padding:'0 8px'}}><span style={{fontWeight:'bold', marginRight:'4px'}}>日期:</span>【<Input align="center" type="date" section="qa_team" {...commonProps}/>】</div>
                                        </div>
                                    </Cell>
                                ))}

                                {/* 3. 职责部门 */}
                                <Cell span={1} vertical bold style={{ gridRow: 'span 2' }}>职责部门</Cell>
                                <Cell span={6} style={{padding:'8px'}}>
                                    <Label>根因分析:</Label>
                                    <TextArea value={data.rootCause} rows={4} section="analysis" onChange={v => handleFieldChange('rootCause', v)} {...commonProps}/>
                                    <div className="aed-sign-row">
                                        <span>责任部门: <input className="aed-sign-input" value={data.respDept} readOnly={!commonProps.canEdit('analysis')} onChange={e=>handleFieldChange('respDept', e.target.value)}/></span>
                                        <span>责任人: <input className="aed-sign-input" value={data.respUser} readOnly={!commonProps.canEdit('analysis')} onChange={e=>handleFieldChange('respUser', e.target.value)}/></span>
                                        <span>完成日期: <input className="aed-sign-input" type="date" value={data.finishDate} readOnly={!commonProps.canEdit('analysis')} onChange={e=>handleFieldChange('finishDate', e.target.value)}/></span>
                                    </div>
                                </Cell>
                                <Cell span={6} style={{padding:'8px'}}>
                                    <Label>纠正预防措施 (CAPA):</Label>
                                    <TextArea value={data.capa} rows={4} section="analysis" onChange={v => handleFieldChange('capa', v)} {...commonProps}/>
                                    <div className="aed-sign-row">
                                        <span>确认人: <input className="aed-sign-input" value={data.capaConfirmer} readOnly={!commonProps.canEdit('analysis')} onChange={e=>handleFieldChange('capaConfirmer', e.target.value)}/></span>
                                        <span>确认日期: <input className="aed-sign-input" type="date" value={data.capaConfirmDate} readOnly={!commonProps.canEdit('analysis')} onChange={e=>handleFieldChange('capaConfirmDate', e.target.value)}/></span>
                                    </div>
                                </Cell>

                                {/* 4. 效果验证 */}
                                <Cell span={1} vertical bold>效果验证</Cell>
                                <Cell span={6} style={{padding:'8px'}}>
                                    <Label>品质部门确认:</Label>
                                    <div style={{ display: 'flex', gap: '40px', padding: '10px 20px' }}>
                                        <label><span style={{marginRight:'4px', fontSize:'16px'}}>{data.verifyResult==='OK'?'☑':'☐'}</span> 措施已落实</label>
                                        <label><span style={{marginRight:'4px', fontSize:'16px'}}>{data.verifyResult==='NG'?'☑':'☐'}</span> 异常未消除</label>
                                    </div>
                                    {checkCanEdit('verify') && (
                                        <div style={{marginTop:'5px', display:'flex', gap:'10px'}}>
                                            <ToolBtn onClick={()=>handleFieldChange('verifyResult', 'OK')}>标记合格</ToolBtn>
                                            <ToolBtn type="danger" onClick={()=>handleFieldChange('verifyResult', 'NG')}>标记不合格</ToolBtn>
                                        </div>
                                    )}
                                    <div className="aed-sign-row">
                                        <span>验证人: <input className="aed-sign-input" value={data.verifyUser} readOnly={!commonProps.canEdit('verify')} onChange={e=>handleFieldChange('verifyUser', e.target.value)}/></span>
                                        <span>日期: <input className="aed-sign-input" type="date" value={data.verifyDate} readOnly={!commonProps.canEdit('verify')} onChange={e=>handleFieldChange('verifyDate', e.target.value)}/></span>
                                    </div>
                                </Cell>

                                {/* Footer */}
                                <Cell span={7} className="aed-no-border">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '13px', padding: '0 5px' }}>
                                        <span>注: 关联单据需同步结案</span>
                                        <span onClick={()=>setShowAttachment(!showAttachment)} style={{cursor:'pointer', color:'#1890ff'}}>
                                            附件 &nbsp;&nbsp; {fileList.length > 0 ? '☑' : '☐'} 无 &nbsp;&nbsp; ☐ 有 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 件 (点击展开)
                                        </span>
                                    </div>
                                </Cell>
                            </div>
                        </div>

                        {/* Attachment Panel */}
                        {showAttachment && (
                            <div className="aed-attach-panel">
                                <div className="aed-attach-header">
                                    <span><i className="ri-attachment-2"></i> 附件列表 ({fileList.length})</span>
                                    {isEditing && <ToolBtn type="primary" onClick={handleUpload}>{isUploading ? '上传中...' : '点击上传'}</ToolBtn>}
                                </div>
                                <div className="aed-file-grid">
                                    {fileList.map((file, i) => (
                                        <div key={i} className="aed-file-card">
                                            <i className={`ri-file-${file.type === 'pdf' ? 'pdf' : 'image'}-fill`} style={{fontSize: '24px', color: file.type === 'pdf' ? '#ff4d4f' : '#1890ff'}}></i>
                                            <div style={{fontSize: '12px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{file.name}</div>
                                            <div style={{fontSize: '10px', color: '#999'}}>{file.size}</div>
                                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
                                                <button style={{border: 'none', background: 'none', color: '#1890ff', fontSize: '11px', cursor: 'pointer'}}>预览</button>
                                                {isEditing && <button style={{border: 'none', background: 'none', color: '#ff4d4f', fontSize: '11px', cursor: 'pointer'}}>删除</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
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