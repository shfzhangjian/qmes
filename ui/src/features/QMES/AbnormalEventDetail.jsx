/**
 * @file: src/features/QMES/AbnormalEventDetail.jsx
 * @version: v15.0.2 (Fix Initialization Error)
 * @description: 异常事件处置单详情 - 修复版
 * - [Fix] 修复 "Cannot access 'calculateDuration' before initialization" 错误。
 * - [Fix] 调整代码顺序：Helper 函数定义移至 useEffect 之前。
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UploadModal from '../../components/Common/UploadModal';
import LogPanel from '../../components/Common/LogPanel';
import BaseModal from '../../components/Common/BaseModal';
import ProcessSubmitModal from '../../components/Business/ProcessSubmitModal';
import './AbnormalEventDetail.css';

// =============================================================================
// 1. 基础 UI 组件 (保持不变)
// =============================================================================

const Cell = ({ children, span = 1, className = '', style = {}, title, vertical, center, bold, bg, noWrap }) => {
    const classes = ['aed-cell', vertical ? 'aed-vertical' : '', center ? 'aed-center' : '', bold ? 'aed-bold' : '', bg ? 'aed-bg-yellow' : '', noWrap ? 'aed-nowrap' : '', className].filter(Boolean).join(' ');
    const computedStyle = { gridColumn: `span ${span}`, ...style };
    return <div className={classes} style={computedStyle} title={title}>{children}</div>;
};

const Label = ({ children }) => <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{children}</div>;

const Input = ({ value, onChange, align = 'left', placeholder, type = 'text', section, suggestions, isEditing, canEdit, style, forceReadOnly, underline }) => {
    const sectionEditable = !section || (canEdit && canEdit(section));
    const editable = !forceReadOnly && isEditing && sectionEditable;

    let finalStyle = { textAlign: align, ...style };
    let className = `aed-input ${!editable ? 'readonly' : 'editable-field'}`;

    if (underline) {
        finalStyle = { ...finalStyle, border: 'none', borderBottom: '1px solid #000', borderRadius: 0, backgroundColor: 'transparent', padding: '0 4px' };
    } else if (editable) {
        finalStyle = { ...finalStyle, backgroundColor: '#fff', border: '1px solid #d9d9d9', borderRadius: '2px', padding: '4px' };
    } else {
        finalStyle = { ...finalStyle, padding: '4px' };
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
            onKeyDown={(e) => {
                if (editable && isDateControl) {
                    e.preventDefault();
                }
            }}
            onClick={(e) => {
                if (editable && isDateControl && e.target.showPicker) {
                    e.target.showPicker();
                }
            }}
        />
    );
};

const Select = ({ value, onChange, options, section, isEditing, canEdit }) => {
    const editable = isEditing && (!section || canEdit(section));
    const editStyle = editable ? { backgroundColor: '#fff', border: '1px solid #d9d9d9', borderRadius: '2px' } : {};
    return editable ? <select className="aed-input" style={{ textIndent: '4px', ...editStyle }} value={value || ''} onChange={e => onChange && onChange(e.target.value)}><option value="">请选择</option>{options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select> : <div className="aed-input" style={{ display: 'flex', alignItems: 'center' }}>{value}</div>;
};

const TextArea = ({ value, onChange, rows = 3, placeholder, section, isEditing, canEdit }) => {
    const editable = isEditing && (!section || canEdit(section));
    const editStyle = editable ? { backgroundColor: '#e6f7ff', border: '1px dashed #1890ff' } : {};
    return <textarea className={`aed-textarea ${!editable ? 'readonly' : ''}`} style={{ minHeight: `${rows * 20}px`, ...editStyle }} rows={rows} value={value || ''} onChange={e => onChange && onChange(e.target.value)} placeholder={editable ? placeholder : ''} readOnly={!editable} />;
};

const CheckGroup = ({ options, value, onChange, section, isEditing, canEdit }) => {
    const editable = isEditing && (!section || canEdit(section));
    return <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', height: '100%', paddingLeft: '4px' }}>{options.map(opt => <label key={opt} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: editable ? 'pointer' : 'default', whiteSpace: 'nowrap' }}><span onClick={() => editable && onChange && onChange(opt)} style={{ fontSize: '16px', marginRight: '2px', lineHeight: 1, fontWeight: value === opt ? 'bold' : 'normal', color: editable ? '#1890ff' : 'inherit' }}>{value === opt ? '☑' : '☐'}</span>{opt}</label>)}</div>;
};

const ToolBtn = ({ children, onClick, type = 'default', iconOnly, active, className }) => {
    const classes = ['aed-btn', type, iconOnly ? 'icon-only' : '', active ? 'active' : '', className].filter(Boolean).join(' ');
    return <button className={classes} onClick={onClick}>{children}</button>;
};

const SectionAttachment = ({ sectionKey, isEditing, onUploadClick, files }) => {
    const sectionFile = files.find(f => f.section === sectionKey);
    return (
        <div className="aed-section-attach">
            {isEditing && !sectionFile && <span className="aed-attach-btn" onClick={() => onUploadClick(sectionKey)} style={{ color: '#1890ff', cursor: 'pointer', fontWeight: 'bold' }}><i className="ri-upload-2-line"></i> 上传附件</span>}
            {sectionFile && <div className="aed-attached-file"><i className="ri-attachment-2"></i> <span className="file-link" onClick={() => alert(`预览文件: ${sectionFile.name}`)}>{sectionFile.name}</span>{isEditing && <i className="ri-close-circle-fill remove-btn" onClick={() => onUploadClick(sectionKey, true)} style={{ marginLeft: '8px', color: '#ff4d4f', cursor: 'pointer' }}></i>}</div>}
        </div>
    );
};

// =============================================================================
// 2. 主组件 (AbnormalEventDetail)
// =============================================================================

const AbnormalEventDetail = (props) => {
    // -------------------------------------------------------------------------
    // 1. Hook 声明区 (必须在任何 return 之前！)
    // -------------------------------------------------------------------------

    // Props 处理
    const isModal = props.isModal || false;
    const visible = props.isOpen !== undefined ? props.isOpen : (props.visible !== undefined ? props.visible : true);
    const recordFromProps = props.data || props.record;
    const onCloseProp = props.onClose;
    const onSubmitProp = props.onUpdate || props.onSubmit;

    // Router Hooks
    const { id: routeId } = useParams();
    const navigate = useNavigate();

    // State Hooks
    const [data, setData] = useState({});
    const [tempTeam, setTempTeam] = useState([]);
    const [isEditing, setIsEditing] = useState(props.isEditing || false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [stepDuration, setStepDuration] = useState('');

    // Modal Visibility State
    const [showAttachmentDrawer, setShowAttachmentDrawer] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [logPanelVisible, setLogPanelVisible] = useState(false);
    const [relatedNcrVisible, setRelatedNcrVisible] = useState(false);
    const [processModalVisible, setProcessModalVisible] = useState(false);
    const [currentUploadSection, setCurrentUploadSection] = useState(null);
    const [fileList, setFileList] = useState([]);

    // Data Mock
    const mockLogs = {
        flows: [
            { node: '异常发起', status: 'done', operator: '张操作', time: '2026-01-12 09:30', comment: '发现涂布厚度异常' },
            { node: '初步确认', status: 'done', operator: '王经理', time: '2026-01-12 10:15', comment: '确认属实' }
        ],
        logs: [{ user: '张操作', action: '创建单据', time: '2026-01-12 09:25' }]
    };

    // -------------------------------------------------------------------------
    // 2. 辅助函数定义区 (关键修复：必须放在 useEffect 之前定义！)
    // -------------------------------------------------------------------------

    const calculateDuration = (startTime) => {
        if (!startTime) { setStepDuration('0小时'); return; }
        const start = new Date(startTime).getTime();
        const now = Date.now();
        const diffMs = now - start;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        const diffMonths = Math.floor(diffDays / 30);

        let durationStr = '';
        if (diffMonths > 0) durationStr = `${diffMonths}个月${diffDays % 30}天`;
        else if (diffDays > 0) durationStr = `${diffDays}天${diffHours % 24}小时`;
        else durationStr = `${diffHours}小时`;
        setStepDuration(durationStr);
    };

    const handleFieldChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
    const handleTeamChange = (id, field, value) => setTempTeam(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    const handleSetLeader = (id) => setTempTeam(prev => prev.map(item => ({ ...item, isLeader: item.id === id })));
    const handleOpenProcess = () => setProcessModalVisible(true);

    const handleProcessSubmit = (processData) => {
        const { nextStep, nextUser, comment, files, isFinish } = processData;
        let newData = { ...data, tempTeam };
        let msg = '';

        if (data.status === 'PENDING_CONFIRM') {
            const nowStr = new Date().toISOString().slice(0, 16);
            newData.confirmDept = '品质部';
            newData.confirmer = '当前用户';
            newData.confirmTime = nowStr;
        }

        newData.status = nextStep;

        if (isFinish) {
            if (files && files.length > 0) {
                const evidenceFiles = files.map(f => ({ ...f, section: 'verify', type: 'img' }));
                setFileList(prev => [...prev, ...evidenceFiles]);
            }
            newData.verifyResult = 'OK';
            newData.verifyComment = `[直接结案] ${comment}`;
            msg = `流程结束：${comment}`;
        } else {
            msg = `已流转至: ${nextUser} (${nextStep})`;
        }

        setProcessModalVisible(false);
        setIsEditing(false);
        if (onSubmitProp) onSubmitProp(newData, msg);
    };

    const handleNotifyTeam = () => {
        const validMembers = tempTeam.filter(m => m.dept && m.name && !m.sign);
        if (validMembers.length === 0) { alert('没有待通知的成员'); return; }
        if (window.confirm('确认通知选中成员？')) {
            setTimeout(() => {
                const today = new Date().toISOString().split('T')[0];
                setTempTeam(prev => prev.map(item => (item.dept && item.name && !item.sign) ? { ...item, sign: `${item.name} (Online)`, date: today } : item));
                alert('模拟：成员已签字确认');
            }, 1000);
        }
    };

    const checkCanEdit = (section) => {
        if (!isEditing || data.status === 'CLOSED') return false;
        const statusMap = {
            'DRAFT': ['discovery', 'common'],
            'PENDING_CONFIRM': ['confirm', 'containment', 'tempTeam'],
            'PENDING_QA_CONFIRM': ['confirm'],
            'PENDING_CONTAINMENT': ['containment'],
            'PENDING_ANALYSIS': ['analysis'],
            'PENDING_VERIFY': ['verify']
        };
        return (statusMap[data.status] || []).includes(section);
    };

    const handleSectionUpload = (section, isRemove) => {
        if (isRemove) {
            if (window.confirm('确认删除?')) setFileList(prev => prev.filter(f => f.section !== section));
        } else {
            setCurrentUploadSection(section);
            setUploadModalVisible(true);
        }
    };

    const handleUploadSuccess = (files) => {
        if (currentUploadSection) {
            setFileList(prev => [...prev.filter(f => f.section !== currentUploadSection), { ...files[0], section: currentUploadSection }]);
        } else {
            setFileList(prev => [...prev, ...files.map(f => ({ ...f, section: 'common' }))]);
        }
        setUploadModalVisible(false);
        setCurrentUploadSection(null);
    };

    // -------------------------------------------------------------------------
    // 3. Effect Hooks (初始化数据) - 放在辅助函数定义之后
    // -------------------------------------------------------------------------
    useEffect(() => {
        let initData = {};

        // 策略：优先使用 Props 传入的数据，其次尝试从 URL ID 模拟加载
        if (recordFromProps) {
            initData = { ...recordFromProps };
        } else if (routeId && !isModal) {
            console.log(`Fetching data for ID: ${routeId}`);
            initData = {
                id: routeId,
                status: 'PENDING_ANALYSIS',
                dept: '生产部',
                date: '2026-01-14',
                finder: '张操作',
                desc: '模拟数据：通过 URL 访问加载的异常详情。',
                type: '生产异常',
                level: '一般',
                stepStartTime: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
            };
        }

        // Data Mock Fixes & Defaults
        if (initData.id === 'ABN-2026-009') {
            initData.status = 'CLOSED';
            initData.isRelated = '是';
            initData.relatedNcrId = 'NCR-2026-055';
            initData.verifyResult = 'OK';
            initData.verifyUser = '李质检';
            initData.verifyDate = '2026-01-14';
            initData.verifyComment = '经连续3批次验证，问题未再复发。';
        }
        if (!initData.stepStartTime) {
            initData.stepStartTime = new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString();
        }

        setData(initData);
        // ✅ 此时 calculateDuration 已经定义，可以安全调用
        calculateDuration(initData.stepStartTime);

        // Init Team
        if (initData.tempTeam && initData.tempTeam.length > 0) {
            setTempTeam(initData.tempTeam);
        } else {
            setTempTeam([
                { id: 1, dept: '', name: '', sign: '', date: '', isLeader: false },
                { id: 2, dept: '', name: '', sign: '', date: '', isLeader: false },
                { id: 3, dept: '', name: '', sign: '', date: '', isLeader: false },
                { id: 4, dept: '', name: '', sign: '', date: '', isLeader: false }
            ]);
        }

        setFileList([
            { name: '现场异常照片.pdf', size: '2.4 MB', type: 'pdf', section: 'discovery' },
            { name: '改善对策报告.pptx', size: '5.1 MB', type: 'ppt', section: 'analysis' }
        ]);

        setIsEditing(props.isEditing || false);
        setIsMaximized(false);
        setShowAttachmentDrawer(false);
    }, [recordFromProps, routeId, isModal, props.isEditing]);

    // -------------------------------------------------------------------------
    // 4. 逻辑阻断区 (Guard Clause) - 必须放在所有 Hook 之后！
    // -------------------------------------------------------------------------
    if (!visible && !routeId) return null;

    // -------------------------------------------------------------------------
    // 5. Render Helpers
    // -------------------------------------------------------------------------

    const handleClose = () => {
        if (onCloseProp) {
            onCloseProp();
        } else {
            navigate(-1);
        }
    };

    const commonProps = { isEditing, canEdit: checkCanEdit };
    const hasRelatedProduct = data.isRelated === '是';
    const showRelatedLink = hasRelatedProduct && data.relatedNcrId;
    const discoveryRowSpan = 5 + (hasRelatedProduct ? 1 : 0);

    const overlayStyle = isModal ? { position: 'static', width: '100%', height: '100%', background: 'transparent', zIndex: 'auto' } : {};
    const windowStyle = isModal ? { width: '100%', height: '100%', borderRadius: 0, boxShadow: 'none', transform: 'none' } : {};
    const windowClass = `aed-window ${isMaximized && !isModal ? 'maximized' : ''}`;

    // -------------------------------------------------------------------------
    // 6. JSX 渲染区
    // -------------------------------------------------------------------------
    return (
        <div className="aed-overlay" style={overlayStyle}>
            <div className={windowClass} style={windowStyle} onClick={e => e.stopPropagation()}>
                <div className="aed-container">
                    {/* Toolbar */}
                    <div className="aed-toolbar">
                        <div className="aed-toolbar-left">
                            <div className="aed-icon"><i className="ri-file-warning-fill"></i></div>
                            <span className="aed-title">异常事件处置单</span>
                            <span className={`aed-status ${data.status === 'CLOSED' ? 'success' : ''}`}>
                                {getStatusLabel(data.status)}
                            </span>
                            {data.status !== 'CLOSED' && (
                                <div className="aed-duration-tag" title="当前步骤已停留时长">
                                    <i className="ri-time-line"></i> 耗时: {stepDuration}
                                </div>
                            )}
                        </div>
                        <div className="aed-toolbar-right">
                            {showRelatedLink && (
                                <div className="aed-related-tag" onClick={() => setRelatedNcrVisible(true)}>
                                    <i className="ri-link-m"></i> 关联NCR: {data.relatedNcrId}
                                </div>
                            )}
                            <ToolBtn onClick={() => setLogPanelVisible(true)}><i className="ri-history-line"></i> 日志</ToolBtn>
                            {!isEditing && data.status !== 'CLOSED' && (
                                <ToolBtn onClick={() => setIsEditing(true)}><i className="ri-edit-line"></i> 处理/编辑</ToolBtn>
                            )}
                            <ToolBtn active={showAttachmentDrawer} onClick={() => setShowAttachmentDrawer(!showAttachmentDrawer)}>
                                <i className="ri-attachment-2"></i> 附件 ({fileList.length}) {showAttachmentDrawer ? '▲' : '▼'}
                            </ToolBtn>
                            {isEditing && (
                                <>
                                    <ToolBtn onClick={() => { setIsEditing(false); alert('已保存草稿'); }}><i className="ri-save-3-line"></i> 保存</ToolBtn>
                                    <ToolBtn type="primary" onClick={handleOpenProcess}><i className="ri-send-plane-fill"></i> 提交/流转</ToolBtn>
                                </>
                            )}
                            <div className="aed-divider"></div>
                            {!isModal && (
                                <ToolBtn iconOnly onClick={() => setIsMaximized(!isMaximized)}><i className={`ri-${isMaximized ? 'fullscreen-exit' : 'fullscreen'}-line`}></i></ToolBtn>
                            )}
                            <ToolBtn iconOnly onClick={handleClose} className="close"><i className="ri-close-line"></i></ToolBtn>
                        </div>
                    </div>

                    <div className="aed-scroll-area">
                        <div className="aed-paper">
                            <div className="aed-header-row">
                                <div style={{ width: '200px' }}>编号: <span className="aed-underline">{data.id || 'NEW-001'}</span></div>
                                <div className="aed-header-title">异常事件处理单</div>
                                <div style={{ width: '200px', textAlign: 'right' }}>
                                    <div>版本: A/1</div>
                                    <div style={{ marginTop: '4px' }}>NO: <span className="aed-underline">001</span></div>
                                </div>
                            </div>

                            <div className="aed-grid">
                                {/* 1. 发现及确认 */}
                                <Cell span={1} vertical bold style={{ gridRow: `span ${discoveryRowSpan}` }}>发现及确认</Cell>
                                <Cell bold center className="aed-v-center">发现部门</Cell>
                                <Cell className="aed-v-center"><Select value={data.dept} options={['生产部', '品质部', '工艺部']} section="discovery" onChange={v => handleFieldChange('dept', v)} {...commonProps} /></Cell>
                                <Cell bold center className="aed-v-center">发现时间</Cell>
                                <Cell className="aed-v-center"><Input value={data.date} type="date" align="center" section="discovery" onChange={v => handleFieldChange('date', v)} {...commonProps} /></Cell>
                                <Cell bold center className="aed-v-center">发现人</Cell>
                                <Cell className="aed-v-center"><Input value={data.finder} align="center" section="discovery" onChange={v => handleFieldChange('finder', v)} {...commonProps} /></Cell>

                                <Cell bold center className="aed-v-center">确认部门</Cell>
                                <Cell className="aed-v-center"><Input value={data.confirmDept} section="confirm" placeholder="自动带入" onChange={v => handleFieldChange('confirmDept', v)} {...commonProps} /></Cell>
                                <Cell bold center className="aed-v-center">确认时间</Cell>
                                <Cell className="aed-v-center"><Input value={data.confirmTime} type="datetime-local" align="center" section="confirm" onChange={v => handleFieldChange('confirmTime', v)} {...commonProps} /></Cell>
                                <Cell bold center className="aed-v-center">确认人</Cell>
                                <Cell className="aed-v-center"><Input value={data.confirmer} align="center" section="confirm" placeholder="自动带入" onChange={v => handleFieldChange('confirmer', v)} {...commonProps} /></Cell>

                                <Cell bold center className="aed-v-center">异常类别</Cell>
                                <Cell span={5} className="aed-v-center">
                                    <CheckGroup options={['生产异常', '工艺异常', '设备异常', '厂务系统异常', 'IT系统异常', '安全事故']} value={data.type} section="confirm" onChange={v => handleFieldChange('type', v)} {...commonProps} />
                                </Cell>

                                <Cell bold center className="aed-v-center">异常等级</Cell>
                                <Cell span={1} className="aed-v-center">
                                    <CheckGroup options={['严重', '一般', '轻微']} value={data.level} section="confirm" onChange={v => handleFieldChange('level', v)} {...commonProps} />
                                </Cell>
                                <Cell bold center className="aed-v-center" span={2}>是否关联产品</Cell>
                                <Cell span={2} className="aed-v-center">
                                    <CheckGroup options={['否', '是']} value={data.isRelated} section="confirm" onChange={v => handleFieldChange('isRelated', v)} {...commonProps} />
                                    {hasRelatedProduct && <span style={{ fontSize: '10px', color: '#faad14', marginLeft: '5px' }}>(关联NCR)</span>}
                                </Cell>

                                {hasRelatedProduct && (
                                    <>
                                        <Cell bold center className="aed-v-center">关联产品</Cell>
                                        <Cell span={5} className="aed-v-center" bg>
                                            <div style={{ display: 'flex', width: '100%', gap: '10px', alignItems: 'center' }}>
                                                <div style={{ flex: 1 }}><Input value={data.prodModel} placeholder="产品型号" section="confirm" onChange={v => handleFieldChange('prodModel', v)} {...commonProps} /></div>
                                                <div style={{ flex: 1 }}><Input value={data.batchNo} placeholder="批次号" section="confirm" onChange={v => handleFieldChange('batchNo', v)} {...commonProps} /></div>
                                                {showRelatedLink && <div className="aed-link-btn" onClick={() => setRelatedNcrVisible(true)}><i className="ri-file-list-3-line"></i> 查看关联NCR</div>}
                                            </div>
                                        </Cell>
                                    </>
                                )}

                                <Cell span={6} style={{ padding: '8px', minHeight: '80px', position: 'relative' }}>
                                    <Label>异常描述:</Label>
                                    <TextArea value={data.desc || data.description} rows={3} section="discovery" onChange={v => handleFieldChange('desc', v)} {...commonProps} />
                                    <SectionAttachment sectionKey="discovery" isEditing={isEditing && checkCanEdit('discovery')} onUploadClick={handleSectionUpload} files={fileList} />
                                </Cell>

                                {/* 2. 临时小组 & 围堵 */}
                                <Cell span={1} vertical bold style={{ gridRow: 'span 5' }}>临时小组</Cell>
                                <Cell span={6} style={{ padding: '8px', minHeight: '80px', position: 'relative' }}>
                                    <Label>围堵措施:</Label>
                                    <TextArea value={data.containment} rows={3} section="containment" placeholder="请输入临时围堵方案..." onChange={v => handleFieldChange('containment', v)} {...commonProps} />
                                    <SectionAttachment sectionKey="containment" isEditing={isEditing && checkCanEdit('containment')} onUploadClick={handleSectionUpload} files={fileList} />

                                    <div style={{ color: '#faad14', fontSize: '12px', marginTop: '5px', display: 'flex', alignItems: 'center', background: '#fffbe6', padding: '4px', borderRadius: '2px' }}>
                                        <i className="ri-information-fill" style={{ marginRight: '4px' }}></i>
                                        <span>注：请勾选一名负责人，负责汇总上传整合所有会议资料，并完成最终步骤。</span>
                                    </div>

                                    {isEditing && checkCanEdit('tempTeam') && (
                                        <div style={{ textAlign: 'right', marginTop: '5px' }}>
                                            <button className="small-btn primary" onClick={handleNotifyTeam} style={{ fontSize: '12px' }}><i className="ri-notification-3-line"></i> 通知小组成员确认</button>
                                        </div>
                                    )}
                                </Cell>

                                {tempTeam.map((member) => (
                                    <Cell key={member.id} span={6} className="aed-no-padding">
                                        <div style={{ display: 'flex', height: '100%', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                                                <span style={{ fontWeight: 'bold', marginRight: '4px', fontSize: '12px' }}>部门:</span>
                                                <div style={{ flex: 1 }}><Input value={member.dept} underline placeholder="部门" section="tempTeam" isEditing={isEditing} canEdit={checkCanEdit} onChange={(v) => handleTeamChange(member.id, 'dept', v)} /></div>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 8px', borderLeft: '1px solid #000' }}>
                                                <span style={{ fontWeight: 'bold', marginRight: '4px', fontSize: '12px' }}>人员:</span>
                                                <div style={{ flex: 1 }}><Input value={member.name} underline placeholder="姓名" section="tempTeam" isEditing={isEditing} canEdit={checkCanEdit} onChange={(v) => handleTeamChange(member.id, 'name', v)} /></div>
                                            </div>
                                            <div style={{ width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #000', height: '100%' }}>
                                                <label style={{ cursor: isEditing ? 'pointer' : 'default', fontSize: '12px', display: 'flex', alignItems: 'center', color: member.isLeader ? '#1890ff' : '#666', fontWeight: member.isLeader ? 'bold' : 'normal' }}>
                                                    <input type="radio" name="teamLeader" checked={member.isLeader || false} onChange={() => isEditing && checkCanEdit('tempTeam') && handleSetLeader(member.id)} disabled={!isEditing || !checkCanEdit('tempTeam')} style={{ marginRight: '2px' }} />
                                                    负责人
                                                </label>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 8px', borderLeft: '1px solid #000' }}>
                                                <span style={{ fontWeight: 'bold', marginRight: '4px', fontSize: '12px' }}>签名:</span>
                                                <div style={{ flex: 1, color: member.sign ? '#1890ff' : '#ccc', fontStyle: member.sign ? 'italic' : 'normal', fontSize: '12px' }}>{member.sign || '(待通知)'}</div>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 8px', borderLeft: '1px solid #000' }}>
                                                <span style={{ fontWeight: 'bold', marginRight: '4px', fontSize: '12px' }}>日期:</span>
                                                <div style={{ flex: 1, fontSize: '12px' }}>{member.date}</div>
                                            </div>
                                        </div>
                                    </Cell>
                                ))}

                                {/* 3. 分析 & CAPA */}
                                <Cell span={1} vertical bold style={{ gridRow: 'span 2' }}>职责部门</Cell>
                                <Cell span={6} style={{ padding: '8px', position: 'relative' }}>
                                    <Label>根因分析:</Label>
                                    <TextArea value={data.rootCause} rows={3} section="analysis" placeholder="请进行5Why分析..." onChange={v => handleFieldChange('rootCause', v)} {...commonProps} />
                                    <SectionAttachment sectionKey="analysis" isEditing={isEditing && checkCanEdit('analysis')} onUploadClick={handleSectionUpload} files={fileList} />
                                    <div className="aed-sign-row">
                                        <span>责任部门: <input className="aed-sign-input readonly" readOnly value={data.respDept} /></span>
                                        <span>责任人: <input className="aed-sign-input readonly" readOnly value={data.respUser} /></span>
                                        <span>完成日期: <input className="aed-sign-input readonly" readOnly value={data.finishDate} /></span>
                                    </div>
                                </Cell>
                                <Cell span={6} style={{ padding: '8px', position: 'relative' }}>
                                    <Label>纠正预防措施 (CAPA):</Label>
                                    <TextArea value={data.capa} rows={3} section="analysis" placeholder="请填写长期对策..." onChange={v => handleFieldChange('capa', v)} {...commonProps} />
                                    <div className="aed-sign-row">
                                        <span>确认人: <input className="aed-sign-input readonly" readOnly value={data.capaConfirmer} /></span>
                                        <span>确认日期: <input className="aed-sign-input readonly" readOnly value={data.capaConfirmDate} /></span>
                                    </div>
                                </Cell>

                                {/* 4. 效果验证 */}
                                <Cell span={1} vertical bold>效果验证</Cell>
                                <Cell span={6} style={{ padding: '8px', position: 'relative' }}>
                                    <Label>品质部门确认:</Label>
                                    <div style={{ display: 'flex', gap: '40px', padding: '10px 20px' }}>
                                        <label><span style={{ fontSize: '16px', marginRight: '5px' }}>{data.verifyResult === 'OK' ? '☑' : '☐'}</span> 措施已落实，异常消除</label>
                                        <label><span style={{ fontSize: '16px', marginRight: '5px' }}>{data.verifyResult === 'NG' ? '☑' : '☐'}</span> 效果不佳，需重新分析</label>
                                    </div>
                                    <div style={{ marginTop: '5px', padding: '0 10px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>验证说明/备注:</div>
                                        <TextArea value={data.verifyComment} rows={2} section="verify" placeholder="请输入具体的验证情况或未关闭原因..." onChange={v => handleFieldChange('verifyComment', v)} {...commonProps} />
                                    </div>
                                    <SectionAttachment sectionKey="verify" isEditing={isEditing && checkCanEdit('verify')} onUploadClick={handleSectionUpload} files={fileList} />
                                    <div className="aed-sign-row" style={{ marginTop: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span>验证人: </span>
                                            <div style={{ width: '100px', marginLeft: '5px' }}><Input value={data.verifyUser} align="center" section="verify" underline onChange={v => handleFieldChange('verifyUser', v)} {...commonProps} /></div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                                            <span>日期: </span>
                                            <div style={{ width: '120px', marginLeft: '5px' }}><Input type="date" value={data.verifyDate} align="center" section="verify" underline onChange={v => handleFieldChange('verifyDate', v)} {...commonProps} /></div>
                                        </div>
                                    </div>
                                </Cell>

                                {/* Footer */}
                                <Cell span={7} className="aed-footer-note">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 5px', alignItems: 'center', height: '100%' }}>
                                        <span>注: 关联单据需同步结案</span>
                                        {showRelatedLink && <span style={{ color: '#52c41a', fontSize: '12px', fontWeight: 'bold' }}><i className="ri-checkbox-circle-fill"></i> 关联单据已同步结案</span>}
                                    </div>
                                </Cell>
                            </div>
                        </div>

                        <div style={{ height: showAttachmentDrawer ? '240px' : '0px', transition: 'height 0.3s' }}></div>
                    </div>

                    {/* Attachment Drawer */}
                    <div className={`aed-attachment-drawer ${showAttachmentDrawer ? 'open' : ''}`}>
                        <div className="drawer-header">
                            <span className="drawer-title"><i className="ri-attachment-2"></i> 附件列表 ({fileList.length})</span>
                            <div className="drawer-actions">
                                {isEditing && data.status === 'DRAFT' && <button className="small-btn primary" onClick={() => handleSectionUpload('common')}><i className="ri-upload-cloud-line"></i> 上传通用文件</button>}
                                <i className="ri-close-line icon-btn" onClick={() => setShowAttachmentDrawer(false)}></i>
                            </div>
                        </div>
                        <div className="drawer-body">
                            {fileList.length === 0 ? <div className="empty-state">暂无附件</div> : (
                                <div className="aed-file-grid">
                                    {fileList.map((file, i) => (
                                        <div key={i} className="aed-file-card">
                                            <i className={`ri-file-${file.type === 'pdf' ? 'pdf' : 'image'}-fill`} style={{ fontSize: '24px', color: '#1890ff' }}></i>
                                            <div style={{ fontSize: '12px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                                            <div style={{ fontSize: '10px', color: '#666', background: '#eee', padding: '2px', textAlign: 'center', borderRadius: '2px' }}>{getSectionLabel(file.section)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Modals --- */}
            <ProcessSubmitModal
                visible={processModalVisible}
                record={data}
                currentStep={data.status}
                onClose={() => setProcessModalVisible(false)}
                onProcessSubmit={handleProcessSubmit}
            />

            <BaseModal visible={relatedNcrVisible} title={`关联不合格品处置单: ${data.relatedNcrId}`} width="800px" onClose={() => setRelatedNcrVisible(false)} footer={null}>
                <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'SimSun' }}>
                    <div style={{ border: '2px solid #000', padding: '20px', position: 'relative', background: '#fff', textAlign: 'left' }}>
                        <div className="q-tag success" style={{ position: 'absolute', right: '10px', top: '10px', border: '2px solid #52c41a', color: '#52c41a', fontWeight: 'bold' }}>STATUS: CLOSED</div>
                        <h3 style={{ textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>不合格品处置单 (NCR)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', lineHeight: '1.8' }}>
                            <div><b>单据编号:</b> {data.relatedNcrId}</div>
                            <div><b>关联异常:</b> {data.id}</div>
                        </div>
                        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px', background: '#f9f9f9' }}>
                            <b>不良描述:</b> <br />关联异常事件 {data.id}：发现大面积晶点异常，判定为原材料污染。已安排隔离并退库。
                        </div>
                    </div>
                </div>
            </BaseModal>

            <UploadModal visible={uploadModalVisible} onClose={() => setUploadModalVisible(false)} onUploadSuccess={handleUploadSuccess} />
            <LogPanel visible={logPanelVisible} onClose={() => setLogPanelVisible(false)} logs={mockLogs.logs} flows={mockLogs.flows} />
        </div>
    );
};

// =============================================================================
// 3. Helpers
// =============================================================================

const getStatusLabel = (s) => ({ 'DRAFT': '草稿', 'PENDING_CONFIRM': '待初步确认', 'PENDING_QA_CONFIRM': '待品质确认', 'PENDING_CONTAINMENT': '待围堵', 'PENDING_ANALYSIS': '待根因分析', 'PENDING_VERIFY': '待效果验证', 'CLOSED': '已结案' }[s] || s);

const getSectionLabel = (sec) => ({ 'discovery': '发现阶段', 'confirm': '确认阶段', 'containment': '围堵阶段', 'analysis': '分析阶段', 'verify': '验证阶段', 'common': '通用附件' }[sec] || '未知来源');

export default AbnormalEventDetail;