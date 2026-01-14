/**
 * @file: src/features/Simulation/TicketProcessModal.jsx
 * @version: v1.0.0
 * @description: 核心流程 - 异常协同处理弹窗
 * 支持全流程节点操作：OP发起 -> MGR确认&围堵 -> PE分析&对策 -> QC验证&结案。
 * 根据当前用户角色和单据状态动态渲染不同的输入区域。
 * @lastModified: 2026-01-13 23:30:00
 */
import React, { useContext, useState, useEffect } from 'react';
import { SimulationContext } from '../../context/SimulationContext';
import { AppContext } from '../../context/AppContext';

const TicketProcessModal = () => {
    const { closeModal, modalData, createTicket, updateTicket } = useContext(SimulationContext);
    const { currentUser } = useContext(AppContext);

    // 如果没有 modalData，说明是 OP 发起新异常
    const isNew = !modalData;
    const ticket = modalData || {};

    // 表单状态
    const [formData, setFormData] = useState({
        type: '设备异常',
        urgency: '高',
        description: '',
        containment: '',
        rootCause: '',
        solution: '',
        verifyResult: ''
    });

    useEffect(() => {
        if (!isNew) {
            setFormData(prev => ({...prev, ...ticket}));
        }
    }, [ticket, isNew]);

    const handleSubmit = () => {
        if (isNew) {
            // OP 发起
            createTicket({
                type: formData.type,
                description: formData.description,
                priority: formData.urgency
            });
            alert("异常单已发起，已通知生产经理！");
        } else {
            // 流程处理
            if (currentUser.role === 'MGR' && ticket.status === 'PENDING_CONFIRM') {
                updateTicket(ticket.id, { containment: formData.containment }, 'PENDING_ANALYSIS');
                alert("已确认并转交 PE 分析");
            } else if (['PE', 'EQ'].includes(currentUser.role) && ticket.status === 'PENDING_ANALYSIS') {
                updateTicket(ticket.id, { rootCause: formData.rootCause, solution: formData.solution }, 'PENDING_VERIFY');
                alert("对策已提交 QC 验证");
            } else if (currentUser.role === 'QC' && ticket.status === 'PENDING_VERIFY') {
                updateTicket(ticket.id, { verifyResult: '合格' }, 'CLOSED');
                alert("单据已结案");
            }
        }
        closeModal();
    };

    // --- 渲染辅助 ---
    const ReadOnlyField = ({ label, value }) => (
        <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', color: '#999' }}>{label}</label>
            <div style={{ fontSize: '14px', color: '#333', padding: '8px', background: '#f9f9f9', borderRadius: '4px' }}>{value || '-'}</div>
        </div>
    );

    return (
        <div className="aip-modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* 1. 基础信息区 (所有阶段可见) */}
            <div className="section-card" style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#1890ff' }}>
                    <i className="ri-file-warning-line"></i> 异常描述 (OP)
                </div>
                {isNew ? (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div className="aip-form-group">
                                <label>异常类别</label>
                                <select className="aip-input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option>设备异常</option><option>工艺异常</option><option>质量异常</option>
                                </select>
                            </div>
                            <div className="aip-form-group">
                                <label>紧急程度</label>
                                <select className="aip-input" value={formData.urgency} onChange={e => setFormData({ ...formData, urgency: e.target.value })}>
                                    <option>中</option><option>高</option><option>紧急</option>
                                </select>
                            </div>
                        </div>
                        <div className="aip-form-group">
                            <label>问题详细描述</label>
                            <textarea className="aip-input" rows="3" placeholder="请详细描述异常现象、发生位置、持续时间..."
                                      value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                            <span className="tag" style={{ background: '#fff1f0', color: '#f5222d', border: '1px solid #ffa39e' }}>{ticket.type}</span>
                            <span style={{ fontSize: '13px', color: '#999' }}>发起人: {ticket.initiator}</span>
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{ticket.description}</div>
                    </>
                )}
            </div>

            {/* 2. 围堵措施 (MGR) */}
            {!isNew && (ticket.status !== 'PENDING_CONFIRM' || currentUser.role === 'MGR') && (
                <div className="section-card" style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', background: ticket.status === 'PENDING_CONFIRM' ? '#fff' : '#fcfcfc' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#faad14' }}>
                        <i className="ri-shield-cross-line"></i> 围堵措施 (MGR)
                    </div>
                    {ticket.status === 'PENDING_CONFIRM' && currentUser.role === 'MGR' ? (
                        <textarea className="aip-input" rows="2" placeholder="请输入临时围堵措施（如停机、隔离）..."
                                  value={formData.containment} onChange={e => setFormData({ ...formData, containment: e.target.value })}
                        ></textarea>
                    ) : (
                        <ReadOnlyField label="临时措施" value={ticket.containment} />
                    )}
                </div>
            )}

            {/* 3. 根因与对策 (PE) */}
            {!isNew && (['PENDING_VERIFY', 'CLOSED'].includes(ticket.status) || (ticket.status === 'PENDING_ANALYSIS' && ['PE', 'EQ'].includes(currentUser.role))) && (
                <div className="section-card" style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#722ed1' }}>
                        <i className="ri-microscope-line"></i> 分析与对策 (PE)
                    </div>
                    {ticket.status === 'PENDING_ANALYSIS' ? (
                        <>
                            <div className="aip-form-group">
                                <label>根本原因分析</label>
                                <textarea className="aip-input" rows="2" value={formData.rootCause} onChange={e => setFormData({ ...formData, rootCause: e.target.value })}></textarea>
                            </div>
                            <div className="aip-form-group">
                                <label>纠正预防措施</label>
                                <textarea className="aip-input" rows="2" value={formData.solution} onChange={e => setFormData({ ...formData, solution: e.target.value })}></textarea>
                            </div>
                        </>
                    ) : (
                        <>
                            <ReadOnlyField label="根本原因" value={ticket.rootCause} />
                            <ReadOnlyField label="解决方案" value={ticket.solution} />
                        </>
                    )}
                </div>
            )}

            {/* 4. 效果验证 (QC) */}
            {!isNew && (ticket.status === 'CLOSED' || (ticket.status === 'PENDING_VERIFY' && currentUser.role === 'QC')) && (
                <div className="section-card" style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#52c41a' }}>
                        <i className="ri-checkbox-circle-line"></i> 效果验证 (QC)
                    </div>
                    {ticket.status === 'PENDING_VERIFY' ? (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                            <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                            经现场确认，对策有效，问题已解决。
                        </label>
                    ) : (
                        <div style={{ color: '#52c41a', fontWeight: 'bold' }}> <i className="ri-check-double-line"></i> 验证通过 (已结案) </div>
                    )}
                </div>
            )}

            {/* 底部操作栏 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button className="btn outline" onClick={closeModal}>取消</button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                    {isNew ? '发起流程' :
                        ticket.status === 'PENDING_CONFIRM' ? '确认并转交' :
                            ticket.status === 'PENDING_ANALYSIS' ? '提交对策' :
                                ticket.status === 'PENDING_VERIFY' ? '验证结案' : '确定'}
                </button>
            </div>
        </div>
    );
};

export default TicketProcessModal;