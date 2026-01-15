/**
 * @file: src/features/QMES/IqcRecordDetail.jsx
 * @description: 进料检验报告详情 (修复版)
 * - [UI] 纯中文界面 (移除所有英文)
 * - [Fix] 修复表格输入框样式，确保对齐
 */
import React, { useState, useEffect } from 'react';
import UploadModal from '../../components/Common/UploadModal';
import './IqcRecordDetail.css';

// --- 内部通用按钮组件 ---
const ToolBtn = ({ children, onClick, type = 'default', iconOnly, active, danger }) => {
    const classes = ['iqr-btn', type, iconOnly ? 'icon-only' : '', active ? 'active' : '', danger ? 'danger' : ''].filter(Boolean).join(' ');
    return <button className={classes} onClick={onClick}>{children}</button>;
};

const IqcRecordDetail = (props) => {
    const visible = props.isOpen !== undefined ? props.isOpen : (props.visible !== undefined ? props.visible : true);
    const { isEditing: propIsEditing, record, onClose, onSubmit } = props;

    // --- 状态管理 ---
    const [isMaximized, setIsMaximized] = useState(false);
    const [header, setHeader] = useState({
        id: '', reportNo: '', date: '', material: '', supplier: '',
        batch: '', qty: '', result: '', inspector: '', status: ''
    });
    const [items, setItems] = useState([]);

    // UI 状态
    const [showAttachmentDrawer, setShowAttachmentDrawer] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);

    // --- 初始化数据 ---
    useEffect(() => {
        if (visible) {
            if (record) {
                const baseHeader = {
                    id: record.id,
                    reportNo: record.id === 'NEW' ? record.reportNo : record.id,
                    date: record.date || new Date().toISOString().split('T')[0],
                    material: record.material || '',
                    supplier: record.supplier || '',
                    batch: record.batch || '',
                    qty: record.qty || '1000',
                    result: record.result || '草稿',
                    inspector: record.inspector || '当前用户',
                    status: record.status || '草稿'
                };
                setHeader(baseHeader);

                if (record.items && record.items.length > 0) {
                    setItems(record.items);
                } else if(record.id !== 'NEW') {
                    // 模拟数据
                    setItems([
                        { id: 1, item: '厚度', std: '0.1±0.01', unit: 'mm', vals: ['0.101','0.102','0.099','0.100','0.101'], avg: '0.101', res: 'OK' },
                        { id: 2, item: '外观', std: '无异物', unit: '-', vals: ['OK','OK','OK','OK','OK'], avg: '-', res: 'OK' }
                    ]);
                } else {
                    setItems(record.items || []);
                }

                // 模拟附件
                if(record.id !== 'NEW') {
                    setFileList([
                        { name: '出货检验报告_2026.pdf', size: '1.2MB' },
                        { name: '外观异常照片.jpg', size: '2.4MB' }
                    ]);
                } else {
                    setFileList([]);
                }
            }
            setIsMaximized(false);
            setShowAttachmentDrawer(false);
        }
    }, [visible, record]);

    // --- 交互处理 ---
    const handleValChange = (id, idx, val) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const newVals = [...item.vals];
                newVals[idx] = val;
                // 简单计算平均值
                let avg = '-';
                if (item.unit !== '-') {
                    const nums = newVals.map(Number).filter(n => !isNaN(n) && n !== 0 && val !== '');
                    if (nums.length > 0) avg = (nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(3);
                }
                return { ...item, vals: newVals, avg };
            }
            return item;
        }));
    };

    const handleJudgeChange = (val) => setHeader(prev => ({ ...prev, result: val }));

    const handleSave = () => {
        if (onSubmit) onSubmit({ ...header, items });
    };

    if (!visible) return null;

    const isEditable = propIsEditing && header.status !== '已审核';

    return (
        <div className="iqr-overlay">
            <div className={`iqr-window ${isMaximized ? 'maximized' : ''}`}>

                {/* 顶部工具栏 */}
                <div className="iqr-toolbar">
                    <div className="iqr-toolbar-left">
                        <div className="iqr-icon"><i className="ri-file-list-3-fill"></i></div>
                        <span className="iqr-title">进料检验报告</span>
                        <span className={`iqr-status-tag ${header.result === 'PASS' ? 'success' : (header.result === 'FAIL' ? 'error' : '')}`}>
                            {header.result === 'PASS' ? '合格' : (header.result === 'FAIL' ? '不合格' : header.result)}
                        </span>
                    </div>
                    <div className="iqr-toolbar-right">
                        <ToolBtn active={showAttachmentDrawer} onClick={() => setShowAttachmentDrawer(!showAttachmentDrawer)}>
                            <i className="ri-attachment-2"></i> 附件 ({fileList.length})
                        </ToolBtn>

                        {isEditable && (
                            <>
                                <div className="iqr-divider-v"></div>
                                <ToolBtn onClick={() => setUploadModalVisible(true)}><i className="ri-upload-cloud-line"></i> 上传报告</ToolBtn>
                                <ToolBtn type="primary" onClick={handleSave}><i className="ri-save-3-line"></i> 保存/提交</ToolBtn>
                            </>
                        )}

                        <div className="iqr-divider-v"></div>
                        <ToolBtn iconOnly onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? "还原" : "最大化"}>
                            <i className={`ri-${isMaximized ? 'fullscreen-exit' : 'fullscreen'}-line`}></i>
                        </ToolBtn>
                        <ToolBtn iconOnly onClick={onClose} className="close"><i className="ri-close-line"></i></ToolBtn>
                    </div>
                </div>

                {/* 主内容区域 */}
                <div className="iqr-scroll-area">
                    <div className="iqr-paper">
                        {/* 头部行 */}
                        <div className="iqr-header-row">
                            <div className="iqr-field-group">
                                <label>单据编号:</label>
                                <input className="iqr-inline-input" value={header.reportNo} readOnly />
                            </div>
                            <div className="iqr-header-title">进料检验报告</div>
                            <div className="iqr-field-group right">
                                <label>检验日期:</label>
                                <input className="iqr-inline-input" value={header.date} readOnly={!isEditable} onChange={e=>setHeader({...header, date:e.target.value})} />
                            </div>
                        </div>

                        {/* 基础信息表格 */}
                        <table className="iqr-table master">
                            <colgroup><col width="100" /><col width="150" /><col width="100" /><col width="150" /><col width="100" /><col width="*" /></colgroup>
                            <tbody>
                            <tr>
                                <th>供应商</th>
                                <td><input className="iqr-input" value={header.supplier} readOnly={!isEditable} onChange={e=>setHeader({...header, supplier:e.target.value})} /></td>
                                <th>物料名称</th>
                                <td><input className="iqr-input" value={header.material} readOnly={!isEditable} onChange={e=>setHeader({...header, material:e.target.value})} /></td>
                                <th>批次号</th>
                                <td><input className="iqr-input" value={header.batch} readOnly={!isEditable} onChange={e=>setHeader({...header, batch:e.target.value})} /></td>
                            </tr>
                            <tr>
                                <th>接收数量</th>
                                <td><input className="iqr-input" value={header.qty} readOnly={!isEditable} onChange={e=>setHeader({...header, qty:e.target.value})} /></td>
                                <th>检验方式</th>
                                <td>GB2828-Lv2</td>
                                <th>抽样数</th>
                                <td>5 PCS</td>
                            </tr>
                            </tbody>
                        </table>

                        {/* 检验数据表格 */}
                        <div className="iqr-section-header">
                            <div className="iqr-section-title">实测数据记录</div>
                        </div>
                        <div className="iqr-table-container">
                            <table className="iqr-table">
                                <colgroup>
                                    <col width="40" /><col width="120" /><col width="100" /><col width="50" />
                                    <col width="60" /><col width="60" /><col width="60" /><col width="60" /><col width="60" />
                                    <col width="70" /><col width="70" />
                                </colgroup>
                                <thead>
                                <tr>
                                    <th rowSpan="2">#</th>
                                    <th rowSpan="2">检验项目</th>
                                    <th rowSpan="2">规格标准</th>
                                    <th rowSpan="2">单位</th>
                                    <th colSpan="5">实测值 (样本 1~5)</th>
                                    <th rowSpan="2">平均值</th>
                                    <th rowSpan="2">判定</th>
                                </tr>
                                <tr><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>
                                </thead>
                                <tbody>
                                {items.map((r, i) => (
                                    <tr key={r.id}>
                                        <td className="center">{i+1}</td>
                                        <td><input className="iqr-input" value={r.item} readOnly /></td>
                                        <td className="center"><input className="iqr-input center" value={r.std} readOnly /></td>
                                        <td className="center">{r.unit}</td>
                                        {r.vals.map((v, vIdx) => (
                                            <td key={vIdx} className="center">
                                                <input
                                                    className="iqr-input center"
                                                    value={v}
                                                    readOnly={!isEditable}
                                                    onChange={(e)=>handleValChange(r.id, vIdx, e.target.value)}
                                                />
                                            </td>
                                        ))}
                                        <td className="center bold">{r.avg}</td>
                                        <td className="center">
                                            <input className="iqr-input center bold" value={r.res}
                                                   style={{color: r.res==='OK'?'green':(r.res==='NG'?'red':'inherit')}}
                                                   readOnly={!isEditable}
                                                   onChange={e=>{
                                                       const n=[...items]; n[i].res=e.target.value; setItems(n);
                                                   }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && <tr><td colSpan="11" className="center text-gray" style={{padding:'20px'}}>暂无检验项目数据</td></tr>}
                                </tbody>
                            </table>
                        </div>

                        {/* 最终判定 */}
                        <div className={`iqr-judge-box ${header.result}`}>
                            <div className="judge-title">最终判定:</div>
                            <div className="judge-options">
                                <label className={header.result === 'PASS' ? 'active pass' : ''}>
                                    <input type="radio" name="res" checked={header.result==='PASS'} onChange={()=>isEditable && handleJudgeChange('PASS')} disabled={!isEditable} />
                                    <i className="ri-checkbox-circle-line"></i> 合格
                                </label>
                                <label className={header.result === 'FAIL' ? 'active fail' : ''}>
                                    <input type="radio" name="res" checked={header.result==='FAIL'} onChange={()=>isEditable && handleJudgeChange('FAIL')} disabled={!isEditable} />
                                    <i className="ri-close-circle-line"></i> 不合格
                                </label>
                            </div>
                        </div>

                        {/* 底部签名 */}
                        <div className="iqr-sign-row">
                            <div>检验员: <input className="iqr-inline-input small" value={header.inspector} readOnly /></div>
                            <div>审核人: <input className="iqr-inline-input small" readOnly /></div>
                        </div>
                    </div>
                </div>

                {/* 附件抽屉 (卡片式) */}
                <div className={`iqr-attachment-drawer ${showAttachmentDrawer ? 'open' : ''}`}>
                    <div className="drawer-header">
                        <span className="drawer-title"><i className="ri-attachment-2"></i> 关联附件 ({fileList.length})</span>
                        <div style={{display:'flex', gap:'10px'}}>
                            {isEditable && <button className="iqr-btn primary" onClick={()=>setUploadModalVisible(true)}><i className="ri-upload-2-fill"></i> 上传文件</button>}
                            <i className="ri-close-line icon-btn" onClick={() => setShowAttachmentDrawer(false)}></i>
                        </div>
                    </div>
                    <div className="drawer-body">
                        {fileList.length === 0 ? <div className="empty-state"><i className="ri-folder-open-line"></i><span>暂无附件</span></div> : (
                            <div className="iqr-file-grid">
                                {fileList.map((f, i) => (
                                    <div key={i} className="iqr-file-card" onClick={()=>alert(`预览: ${f.name}`)}>
                                        <i className={`file-icon ri-file-${f.name.endsWith('pdf')?'pdf':'text'}-fill`}></i>
                                        <div className="file-name" title={f.name}>{f.name}</div>
                                        <div className="file-meta">{f.size}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
            <UploadModal visible={uploadModalVisible} onClose={() => setUploadModalVisible(false)} onUploadSuccess={()=>{}} />
        </div>
    );
};

export default IqcRecordDetail;