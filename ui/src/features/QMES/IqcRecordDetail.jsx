/**
 * @file: src/features/QMES/IqcRecordDetail.jsx
 * @version: v1.0.0
 * @description: 进料检验记录录入 - 支持 5 次实测数据录入与自动判定
 */
import React, { useState } from 'react';
import './IqcRecordDetail.css';

const IqcRecordDetail = ({ visible, onClose, record }) => {
    // 主表状态
    const [master, setMaster] = useState({});
    // 从表状态 (测量项)
    const [details, setDetails] = useState([
        { id: 1, name: '宽幅公差', std: '100±0.5', v: ['', '', '', '', ''], avg: '', judge: '' },
        { id: 2, name: '厚度公差', std: '0.15±0.01', v: ['', '', '', '', ''], avg: '', judge: '' }
    ]);

    const handleValueChange = (rowIndex, vIndex, val) => {
        const newDetails = [...details];
        newDetails[rowIndex].v[vIndex] = val;

        // 自动计算平均值 (演示逻辑)
        const nums = newDetails[rowIndex].v.filter(n => n !== '').map(Number);
        if(nums.length > 0) {
            const avg = (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(3);
            newDetails[rowIndex].avg = avg;
            // 简单判定逻辑 (示例)
            newDetails[rowIndex].judge = 'A';
        }
        setDetails(newDetails);
    };

    if (!visible) return null;

    return (
        <div className="iqr-overlay">
            <div className="iqr-window">
                <div className="iqr-toolbar">
                    <span className="iqr-title">执行进料检验</span>
                    <button className="iqs-btn primary" onClick={() => alert('已提交判定')}>完成检验</button>
                </div>

                <div className="iqr-scroll-area">
                    <div className="iqr-paper">
                        <h1 style={{textAlign:'center'}}>进料检验记录表</h1>

                        {/* 主信息区 (Master) */}
                        <div className="iqr-grid-header">
                            <div className="iqr-label">物料名称</div>
                            <div className="iqr-val"><input className="iqr-input" /></div>
                            <div className="iqr-label">批次号</div>
                            <div className="iqr-val"><input className="iqr-input" /></div>
                            <div className="iqr-label">供应商</div>
                            <div className="iqr-val"><input className="iqr-input" /></div>
                        </div>

                        {/* 检验明细区 (Detail - 13列) */}
                        <table className="iqr-table">
                            <thead>
                            <tr>
                                <th rowSpan="2" style={{width:'40px'}}>项次</th>
                                <th rowSpan="2">检查项目</th>
                                <th rowSpan="2" style={{width:'80px'}}>标准</th>
                                <th colSpan="5">检查结果 (实测)</th>
                                <th rowSpan="2">平均值</th>
                                <th rowSpan="2">判定</th>
                            </tr>
                            <tr>
                                <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th>
                            </tr>
                            </thead>
                            <tbody>
                            {details.map((row, rIdx) => (
                                <tr key={row.id}>
                                    <td>{row.id}</td>
                                    <td>{row.name}</td>
                                    <td className="iqr-bg-light">{row.std}</td>
                                    {row.v.map((val, vIdx) => (
                                        <td key={vIdx}>
                                            <input
                                                className="iqr-cell-input"
                                                value={val}
                                                onChange={(e) => handleValueChange(rIdx, vIdx, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                    <td className="iqr-bold">{row.avg}</td>
                                    <td className={row.judge === 'A' ? 'iqr-pass' : ''}>{row.judge}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <div className="iqr-footer-judge">
                            判定结论：
                            <label><input type="radio" name="res" /> 合格(Accepted)</label>
                            <label><input type="radio" name="res" /> 不合格(Rejected)</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IqcRecordDetail;