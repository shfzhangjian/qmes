/**
 * @file: src/components/Business/ProcessSubmitModal.jsx
 * @description: 严格基于 PDF 流程的流转控制器
 * @version: v15.0.0 (PDF Implementation)
 */
import React, { useState, useEffect } from 'react';
import BaseModal from '../Common/BaseModal';

// --- 1. 状态字典 (中文映射) ---
const STATUS_MAP = {
    'DRAFT': '草稿/发起',
    'PENDING_CONFIRM': '待初步确认',
    'PENDING_QA_CONFIRM': '待品质确认',
    'PENDING_CONTAINMENT': '待围堵措施',
    'PENDING_ANALYSIS': '待根因分析',
    'PENDING_VERIFY': '待效果验证',
    'CLOSED': '已结案'
};

// --- 2. 账号候选人 (来源于 Login.jsx) ---
// 实际开发中应从后端 API 获取，这里为了模拟演示直接硬编码
const CANDIDATES = {
    'MGR': [
        { value: 'mgr', label: '王经理 (生产部)' },
        { value: 'eq', label: '孙设备 (设备部)' } // 假设设备经理也是主管级
    ],
    'QC': [
        { value: 'qc', label: '李质检 (品质部)' },
        { value: 'sqe', label: '郑SQE (品质部)' }
    ],
    'RESP': [ // 责任人
        { value: 'eq', label: '孙设备 (设备部)' },
        { value: 'pe', label: '赵工艺 (工艺部)' },
        { value: 'op', label: '张操作 (生产部)' }
    ],
    'ALL': [
        { value: 'admin', label: 'IT管理员' }
    ]
};

const ProcessSubmitModal = ({ visible, currentStep, onClose, onProcessSubmit }) => {

    // --- 3. 核心流程配置 (Strictly based on PDF) ---
    // audit: 是否显示 [通过/驳回]
    // role: 下一步建议的办理人角色 (用于过滤下拉框)
    const FLOW_CONFIG = {
        'DRAFT': {
            audit: false,
            next: [{ step: 'PENDING_CONFIRM', desc: '提交初步确认' }],
            role: 'MGR'
        },
        'PENDING_CONFIRM': {
            audit: true, // 主管审核
            next: [
                { step: 'PENDING_QA_CONFIRM', desc: '确认异常 -> 转品质确认' }, // PDF路径1
                { step: 'CLOSED', desc: '非异常/误报 -> 直接结案' },         // PDF路径2
                { step: 'CLOSED', desc: '关联产品 -> 转NCR并结案' }          // PDF路径3
            ],
            back: [{ step: 'DRAFT', desc: '信息不全 -> 退回发起人' }],
            role: 'QC' // 如果转品质，默认找 QC
        },
        'PENDING_QA_CONFIRM': {
            audit: true, // 品质审核等级
            next: [{ step: 'PENDING_CONTAINMENT', desc: '定级完成 -> 转围堵措施' }],
            back: [{ step: 'PENDING_CONFIRM', desc: '判定有误 -> 退回初步确认' }],
            role: 'RESP' // 转给责任部门填写围堵
        },
        'PENDING_CONTAINMENT': {
            audit: false, // 执行节点
            next: [{ step: 'PENDING_ANALYSIS', desc: '围堵已落实 -> 转根因分析' }],
            role: 'RESP' // 通常还是责任部门自己做分析
        },
        'PENDING_ANALYSIS': {
            audit: false, // 执行节点
            next: [{ step: 'PENDING_VERIFY', desc: '对策已实施 -> 申请效果验证' }],
            role: 'QC' // 找品质验证
        },
        'PENDING_VERIFY': {
            audit: true, // 品质验证结果
            next: [{ step: 'CLOSED', desc: '验证合格 -> 流程闭环' }],
            back: [{ step: 'PENDING_ANALYSIS', desc: '验证NG -> 退回重新分析' }],
            role: null // 结案无需选人
        }
    };

    const currentConfig = FLOW_CONFIG[currentStep] || { audit: false, next: [], back: [] };

    // --- State ---
    const [result, setResult] = useState('PASS'); // PASS | REJECT
    const [targetStep, setTargetStep] = useState('');
    const [nextUser, setNextUser] = useState('');
    const [comment, setComment] = useState('');
    const [files, setFiles] = useState([]);

    // --- Effect ---
    useEffect(() => {
        if (visible) {
            setResult('PASS');
            setNextUser('');
            setFiles([]);
            setComment('同意，请继续处理。');
            // 默认选中第一个路径
            if (currentConfig.next && currentConfig.next.length > 0) {
                setTargetStep(currentConfig.next[0].step);
            }
        }
    }, [visible, currentStep]);

    // 切换 Pass/Reject 时切换下拉选项
    useEffect(() => {
        const options = result === 'PASS' ? currentConfig.next : currentConfig.back;
        if (options && options.length > 0) setTargetStep(options[0].step);

        // 自动修正说明
        if (result === 'PASS') {
            if (!comment || comment.includes('驳回')) setComment('同意，请继续处理。');
        } else {
            setComment('');
        }
    }, [result]);

    // 计算当前应该显示的候选人列表
    const getCandidateList = () => {
        if (targetStep === 'CLOSED') return []; // 结案不需要选人
        // 简单映射：根据当前步骤的配置决定下个角色的池子
        const roleType = currentConfig.role || 'ALL';
        return CANDIDATES[roleType] || CANDIDATES['ALL'];
    };

    const handleSubmit = () => {
        if (!targetStep) return alert('请选择流转路径！');
        if (result === 'PASS' && targetStep !== 'CLOSED' && !nextUser) return alert('请指定下一环节办理人！');
        if (result === 'REJECT' && !comment) return alert('驳回必须填写意见！');

        // 查找办理人详情用于显示
        const userObj = getCandidateList().find(u => u.value === nextUser);

        onProcessSubmit({
            nextStep: targetStep,
            nextUser: nextUser, // 存 ID
            nextUserName: userObj ? userObj.label : '', // 存名字方便显示
            comment: result === 'REJECT' ? `[驳回] ${comment}` : comment,
            files,
            isFinish: targetStep === 'CLOSED',
            isReject: result === 'REJECT'
        });
    };

    // 选项列表
    const stepOptions = result === 'PASS' ? currentConfig.next : currentConfig.back;
    const isFinish = targetStep === 'CLOSED';

    return (
        <BaseModal visible={visible} title="流程流转办理" width="550px" onClose={onClose} onOk={handleSubmit}>
            <div style={{ padding: '15px 20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>

                {/* 1. 审批结果 (Audit Mode) */}
                <div style={{ background: '#f5f7fa', padding: '10px', borderRadius: '4px', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '13px' }}>当前环节: <b>{STATUS_MAP[currentStep]}</b></div>
                    {currentConfig.audit ? (
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#52c41a', fontWeight: 'bold' }}>
                                <input type="radio" checked={result === 'PASS'} onChange={() => setResult('PASS')} style={{ marginRight: '4px' }} /> 通过
                            </label>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#ff4d4f', fontWeight: 'bold' }}>
                                <input type="radio" checked={result === 'REJECT'} onChange={() => setResult('REJECT')} style={{ marginRight: '4px' }} /> 驳回
                            </label>
                        </div>
                    ) : (
                        <span style={{ color: '#1890ff', fontWeight: 'bold', fontSize: '12px' }}><i className="ri-arrow-right-line"></i> 提交下一步</span>
                    )}
                </div>

                {/* 2. 流向与办理人 */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>下一环节 (流向)</label>
                        <select
                            style={{ width: '100%', padding: '6px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                            value={targetStep}
                            onChange={e => setTargetStep(e.target.value)}
                        >
                            {stepOptions && stepOptions.map(opt => (
                                <option key={opt.step} value={opt.step}>{opt.desc}</option>
                            ))}
                        </select>
                    </div>
                    {!isFinish && (
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>指定办理人 <span style={{color:'red'}}>*</span></label>
                            <select
                                style={{ width: '100%', padding: '6px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                                value={nextUser}
                                onChange={e => setNextUser(e.target.value)}
                            >
                                <option value="">-- 请选择 --</option>
                                {getCandidateList().map(u => (
                                    <option key={u.value} value={u.value}>{u.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* 3. 意见 */}
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>处理意见</label>
                    <textarea
                        style={{ width: '100%', height: '80px', padding: '6px', border: '1px solid #d9d9d9', borderRadius: '4px', resize: 'none' }}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="请输入..."
                    />
                </div>

                {/* 4. 附件 (简化版) */}
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>佐证材料 (可选)</label>
                    <input type="file" onChange={(e) => setFiles([...e.target.files])} />
                </div>
            </div>
        </BaseModal>
    );
};

export default ProcessSubmitModal;