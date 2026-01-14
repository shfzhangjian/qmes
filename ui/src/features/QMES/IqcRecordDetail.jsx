/**
 * @file: src/features/QMES/IqcRecordDetail.jsx
 * @description: 进料检验报告 (IQC Report)
 * - [Refactor] 使用 Grid 布局替代 Table，支持 5 次测量值录入
 * - [UI] 风格对齐 AbnormalEventDetail
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './IqcRecordDetail.css';

// --- 复用 Helper 组件 ---
const Cell = ({ children, span = 1, className = '', style = {}, center, bold, bg }) => {
    const classes = ['iqr-cell', center ? 'iqr-center' : '', bold ? 'iqr-bold' : '', bg ? 'iqr-bg-gray' : '', className].filter(Boolean).join(' ');
    return <div className={classes} style={{ gridColumn: `span ${span}`, ...style }}>{children}</div>;
};

const Input = ({ value, onChange, align = 'left', placeholder, type='text' }) => (
    <input
        className="iqr-input" style={{ textAlign: align }} type={type}
        value={value || ''} onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder}
    />
);

const IqcRecordDetail = (props) => {
    const navigate = useNavigate();
    const visible = props.isOpen !== undefined ? props.isOpen : (props.visible !== undefined ? props.visible : true);
    const isModal = props.isModal || false;

    // 数据状态
    const [info, setInfo] = useState({
        reportNo: 'IQC-20260114-05', date: '2026-01-14', supplier: 'XXX科技',
        partNo: 'RM-2026-001', name: '电池隔膜', batchNo: 'B20260112', qty: '5000 m'
    });

    const [records, setRecords] = useState([
        { id: 1, item: '厚度', std: '12±1', unit: 'µm', vals: ['12.1', '12.0', '11.9', '12.2', '12.0'], avg: '12.04', res: 'OK' },
        { id: 2, item: '宽度', std: '100±2', unit: 'mm', vals: ['100.1', '99.8', '100.0', '100.2', '99.9'], avg: '100.0', res: 'OK' },
        { id: 3, item: '外观', std: '无异物', unit: '-', vals: ['OK', 'OK', 'OK', 'OK', 'OK'], avg: '-', res: 'OK' },
    ]);

    const handleValChange = (rowId, idx, val) => {
        const newRecords = records.map(r => {
            if (r.id === rowId) {
                const newVals = [...r.vals];
                newVals[idx] = val;
                // 简单模拟计算平均值
                const nums = newVals.map(Number).filter(n => !isNaN(n));
                const avg = nums.length > 0 && r.unit !== '-' ? (nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(2) : '-';
                return { ...r, vals: newVals, avg };
            }
            return r;
        });
        setRecords(newRecords);
    };

    const handleClose = () => props.onClose ? props.onClose() : navigate(-1);
    if (!visible) return null;

    return (
        <div className={`iqr-wrapper ${isModal ? 'modal-mode' : ''}`}>
            <div className="iqr-window">
                {/* Toolbar */}
                <div className="iqr-toolbar">
                    <div className="iqr-toolbar-left">
                        <div className="iqr-icon"><i className="ri-file-list-3-line"></i></div>
                        <span className="iqr-title">进料检验报告 (IQC Report)</span>
                    </div>
                    <div className="iqr-toolbar-right">
                        <button className="iqr-btn primary" onClick={()=>alert('提交成功')}><i className="ri-check-double-line"></i> 提交判定</button>
                        <button className="iqr-btn icon-only" onClick={handleClose}><i className="ri-close-line"></i></button>
                    </div>
                </div>

                {/* Paper Area */}
                <div className="iqr-scroll-area">
                    <div className="iqr-paper">
                        <div className="iqr-header-row">
                            <div>NO: <span className="iqr-underline">{info.reportNo}</span></div>
                            <div className="iqr-header-title">进料检验报告</div>
                            <div>日期: {info.date}</div>
                        </div>

                        {/* Master Info Grid */}
                        <div className="iqr-grid-master">
                            <Cell bold center bg>供应商</Cell>
                            <Cell span={3}><Input value={info.supplier} onChange={v=>setInfo({...info, supplier:v})} /></Cell>
                            <Cell bold center bg>批次号</Cell>
                            <Cell span={3}><Input value={info.batchNo} /></Cell>

                            <Cell bold center bg>物料代码</Cell>
                            <Cell span={3}><Input value={info.partNo} /></Cell>
                            <Cell bold center bg>物料名称</Cell>
                            <Cell span={3}><Input value={info.name} /></Cell>

                            <Cell bold center bg>接收数量</Cell>
                            <Cell span={3}><Input value={info.qty} /></Cell>
                            <Cell bold center bg>检验方式</Cell>
                            <Cell span={3}><Input value="GB2828-Lv2" /></Cell>
                        </div>

                        <div className="iqr-sub-title">实测数据记录</div>

                        {/* Measurements Grid (13 cols) */}
                        <div className="iqr-grid-record">
                            {/* Header */}
                            <Cell bold center bg span={1} style={{gridRow:'span 2'}}>序号</Cell>
                            <Cell bold center bg span={2} style={{gridRow:'span 2'}}>检验项目</Cell>
                            <Cell bold center bg span={2} style={{gridRow:'span 2'}}>规格标准</Cell>
                            <Cell bold center bg span={1} style={{gridRow:'span 2'}}>单位</Cell>
                            <Cell bold center bg span={5}>实测值 (Sample 1-5)</Cell>
                            <Cell bold center bg span={1} style={{gridRow:'span 2'}}>平均值</Cell>
                            <Cell bold center bg span={1} style={{gridRow:'span 2'}}>判定</Cell>

                            {/* Sub Header for samples */}
                            <Cell center bg>#1</Cell><Cell center bg>#2</Cell><Cell center bg>#3</Cell><Cell center bg>#4</Cell><Cell center bg>#5</Cell>

                            {/* Rows */}
                            {records.map((r, idx) => (
                                <React.Fragment key={r.id}>
                                    <Cell center>{idx+1}</Cell>
                                    <Cell span={2}><Input value={r.item} /></Cell>
                                    <Cell center span={2}><Input value={r.std} align="center" /></Cell>
                                    <Cell center><Input value={r.unit} align="center" /></Cell>
                                    {r.vals.map((v, vIdx) => (
                                        <Cell key={vIdx} center>
                                            <Input value={v} align="center" onChange={(val)=>handleValChange(r.id, vIdx, val)} />
                                        </Cell>
                                    ))}
                                    <Cell center bold>{r.avg}</Cell>
                                    <Cell center bold style={{color: r.res==='OK'?'green':'red'}}>{r.res}</Cell>
                                </React.Fragment>
                            ))}

                            {/* Padding Rows */}
                            <React.Fragment>
                                <Cell center>4</Cell><Cell span={2}></Cell><Cell span={2}></Cell><Cell></Cell>
                                <Cell></Cell><Cell></Cell><Cell></Cell><Cell></Cell><Cell></Cell><Cell></Cell><Cell></Cell>
                            </React.Fragment>
                        </div>

                        {/* Conclusion */}
                        <div className="iqr-judge-box">
                            <div className="judge-title">最终判定 (Conclusion):</div>
                            <div className="judge-options">
                                <label><input type="radio" name="judge" defaultChecked /> <span className="pass">合格 (Accepted)</span></label>
                                <label><input type="radio" name="judge" /> <span className="fail">不合格 (Rejected)</span></label>
                                <label><input type="radio" name="judge" /> <span>特采 (Concession)</span></label>
                            </div>
                            <div className="judge-remark">
                                <span>备注:</span>
                                <input className="iqr-input" style={{borderBottom: '1px solid #000', width: '80%'}} placeholder="无异常" />
                            </div>
                        </div>

                        <div className="iqr-sign-row">
                            <div>检验员: <span className="sign">李质检</span></div>
                            <div>审核: <span className="sign">王主管</span></div>
                            <div>日期: 2026-01-14</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IqcRecordDetail;