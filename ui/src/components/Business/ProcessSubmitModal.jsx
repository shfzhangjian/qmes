/**
 * @file: src/components/Business/ProcessSubmitModal.jsx
 * @description: 专用的流程提交确认组件 (替代 Simulation 下的旧组件)
 */
import React, { useState, useEffect } from 'react';
import BaseModal from '../Common/BaseModal';

const ProcessSubmitModal = ({ visible, onClose, record, currentStep, onProcessSubmit }) => {
    if (!visible || !record) return null;

    // --- State ---
    const [nextStep, setNextStep] = useState('');
    const [nextUser, setNextUser] = useState('');
    const [comment, setComment] = useState('');
    const [duration, setDuration] = useState('0小时');
    const [files, setFiles] = useState([]);

    // --- 路由配置 ---
    const flowConfig = {
        'PENDING_CONFIRM': {
            title: '待初步确认',
            routes: [
                { label: '确认属实 -> 转品质确认', value: 'PENDING_QA_CONFIRM', targetDept: '品质部', type: 'normal' },
                { label: '非异常/误报 -> 直接结案', value: 'CLOSED', targetDept: '系统', type: 'finish' }
            ]
        },
        'PENDING_QA_CONFIRM': {
            title: '待品质确认',
            routes: [
                { label: '确认异常 -> 转围堵措施', value: 'PENDING_CONTAINMENT', targetDept: '责任部门', type: 'normal' }
            ]
        },
        'DEFAULT': {
            title: '处理中',
            routes: [{ label: '提交下一步', value: 'NEXT_STEP', targetDept: '下一节点', type: 'normal' }]
        }
    };

    const currentConfig = flowConfig[currentStep] || flowConfig['DEFAULT'];

    // --- Init ---
    useEffect(() => {
        if (visible) {
            const hours = Math.floor(Math.random() * 24);
            setDuration(`${hours}小时`);
            if (currentConfig.routes.length > 0) setNextStep(currentConfig.routes[0].value);
            setNextUser(''); setComment(''); setFiles([]);
        }
    }, [visible, currentStep]);

    // --- Logic ---
    const selectedRoute = currentConfig.routes.find(r => r.value === nextStep) || {};
    const isFinish = selectedRoute.type === 'finish';

    const getCandidates = (dept) => {
        const mockUsers = { '品质部': ['李质检', '赵QA'], '责任部门': ['孙主管'], '生产部': ['吴生产'] };
        return mockUsers[dept] || ['系统自动'];
    };

    const handleSubmit = () => {
        if (!nextStep) return alert('请选择下一步骤');
        onProcessSubmit({ nextStep, nextUser: isFinish ? 'SYSTEM' : nextUser, comment, files, isFinish });
    };

    return (
        <BaseModal visible={visible} title="流程提交确认" width="600px" onClose={onClose} onOk={handleSubmit}>
            <div style={{ padding: '0 10px' }}>
                {/* 顶部信息 */}
                <div style={{ background: '#f5f7fa', padding: '10px', borderRadius: '4px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                    <div><span style={{color:'#999'}}>单据类型:</span> <b>{record.type || '异常处置单'}</b></div>
                    <div><span style={{color:'#999'}}>当前步骤:</span> <span style={{color:'#1890ff', fontWeight:'bold'}}>{currentConfig.title}</span></div>
                </div>

                {/* 1. 步骤选择 */}
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>1. 选择下一步骤:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {currentConfig.routes.map(route => (
                            <label key={route.value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '8px', border: nextStep === route.value ? '1px solid #1890ff' : '1px solid #eee', borderRadius: '4px', background: nextStep === route.value ? '#e6f7ff' : '#fff' }}>
                                <input type="radio" name="nextStep" value={route.value} checked={nextStep === route.value} onChange={(e) => setNextStep(e.target.value)} style={{ marginRight: '8px' }} />
                                <span>{route.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 2. 办理人 */}
                {!isFinish && (
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>2. 选择办理人 ({selectedRoute.targetDept}):</div>
                        <select style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }} value={nextUser} onChange={(e) => setNextUser(e.target.value)}>
                            <option value="">-- 请选择 --</option>
                            {getCandidates(selectedRoute.targetDept).map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                )}

                {/* 3. 意见 */}
                <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{isFinish ? '3. 结案说明 (必填):' : '3. 处理意见:'}</div>
                    <textarea style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px', minHeight: '80px' }} placeholder="请输入..." value={comment} onChange={(e) => setComment(e.target.value)} />
                </div>
            </div>
        </BaseModal>
    );
};

export default ProcessSubmitModal;