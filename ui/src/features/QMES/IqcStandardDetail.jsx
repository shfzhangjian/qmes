/**
 * @file: src/features/QMES/IqcStandardDetail.jsx
 * @version: v1.0.0 (Master-Detail Structure)
 * @description: 进料检验标准详情 - 完全参考 AbnormalEventDetail 布局
 * - [Created] 2026-01-14: 基于 aed 风格实现主从表维护 (AI Copilot)
 */
import React, { useState, useEffect } from 'react';
import BaseModal from '../../components/Common/BaseModal';
import './IqcStandardDetail.css';

// 复用 AED 的基础 UI 组件定义
const Cell = ({ children, span = 1, className = '', style = {}, vertical, center, bold, bg }) => {
    const classes = ['iqs-cell', vertical ? 'iqs-vertical' : '', center ? 'iqs-center' : '', bold ? 'iqs-bold' : '', bg ? 'iqs-bg-gray' : '', className].filter(Boolean).join(' ');
    return <div className={classes} style={{ gridColumn: `span ${span}`, ...style }}>{children}</div>;
};

const IqcStandardDetail = ({ visible, onClose, record, isEditing }) => {
    const [data, setData] = useState({ items: [] });

    useEffect(() => {
        if (visible) {
            setData(record || { id: 'NEW', items: [{}, {}, {}] }); // 默认给3行从表
        }
    }, [visible, record]);

    if (!visible) return null;

    return (
        <div className="iqs-overlay">
            <div className="iqs-window">
                <div className="iqs-toolbar">
                    <div className="iqs-toolbar-left">
                        <div className="iqs-icon"><i className="ri-list-settings-line"></i></div>
                        <span className="iqs-title">进料检验标准 (IQC-STD)</span>
                    </div>
                    <div className="iqs-toolbar-right">
                        {isEditing && <button className="iqs-btn primary"><i className="ri-save-line"></i> 保存标准</button>}
                        <button className="iqs-btn" onClick={onClose}><i className="ri-close-line"></i> 关闭</button>
                    </div>
                </div>

                <div className="iqs-scroll-area">
                    <div className="iqs-paper">
                        <div className="iqs-header-title">进料检验标准</div>

                        {/* 主表信息 (Master) */}
                        <div className="iqs-grid-master">
                            <Cell bold bg>适用范围</Cell>
                            <Cell span={11}><input className="iqs-input" value={data.scope} /></Cell>

                            <Cell bold bg>BOM编号</Cell>
                            <Cell span={2} bg>构成名称</Cell>
                            <Cell bg>数量</Cell>
                            <Cell span={8} bg>描述</Cell>
                            {/* 示例BOM从表行 */}
                            <Cell><input className="iqs-input" /></Cell>
                            <Cell span={2}><input className="iqs-input" /></Cell>
                            <Cell><input className="iqs-input" /></Cell>
                            <Cell span={8}><input className="iqs-input" /></Cell>
                        </div>

                        {/* 从表信息 (Detail) - 检验项目 */}
                        <div className="iqs-grid-detail">
                            <Cell span={2} bold bg>检验项目</Cell>
                            <Cell span={6} bold bg>标准 (A面/B面)</Cell>
                            <Cell bold bg>SPC</Cell>
                            <Cell bold bg>工具</Cell>
                            <Cell bold bg>方法</Cell>
                            <Cell bold bg>抽样/判定</Cell>

                            {/* 动态行渲染 */}
                            {data.items.map((item, index) => (
                                <React.Fragment key={index}>
                                    <Cell vertical bold style={{gridRow: 'span 2'}}>规格</Cell>
                                    <Cell><input className="iqs-input" placeholder="项目名称" /></Cell>
                                    <Cell span={6}><input className="iqs-input" placeholder="输入标准公差" /></Cell>
                                    <Cell><input className="iqs-input" /></Cell>
                                    <Cell><input className="iqs-input" /></Cell>
                                    <Cell><input className="iqs-input" /></Cell>
                                    <Cell><input className="iqs-input" /></Cell>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IqcStandardDetail;