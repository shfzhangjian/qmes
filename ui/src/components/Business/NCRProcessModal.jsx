/**
 * @file: src/components/Business/NCRProcessModal.jsx
 * @description: 不合格品处置单专用流转弹窗
 * - [Feature] PENDING_QA -> PENDING_REVIEW: 动态根据选中的责任部门生成人员选择框。
 */
import React, { useState, useEffect } from 'react';
import BaseModal from '../Common/BaseModal';
import '../Common/UserPicker.css';

const NCRProcessModal = ({ visible, onClose, currentStatus, onProcessSubmit, data }) => {
    const [comment, setComment] = useState('');
    const [nextUser, setNextUser] = useState('');
    const [selectedReviewers, setSelectedReviewers] = useState({}); // { '研发部': '张工', '生产部': '李主管' }

    // 获取责任部门列表 (数组或逗号分隔字符串)
    const respDepts = Array.isArray(data?.respDept) ? data.respDept : (data?.respDept || '').split(',').filter(Boolean);

    // 状态流转配置
    const config = {
        'DRAFT': { title: '提交至部门确认', nextStep: 'PENDING_HEAD', role: '部门负责人' },
        'PENDING_HEAD': { title: '确认并提交品质部', nextStep: 'PENDING_QA', role: '品质工程师' },
        'PENDING_QA': { title: '发起评审会签', nextStep: 'PENDING_REVIEW', role: '各部门评审人' },
        'PENDING_REVIEW': { title: '提交最终结论', nextStep: 'PENDING_FINAL', role: '品质担当' },
        'PENDING_FINAL': { title: '结案归档', nextStep: 'CLOSED', role: '系统归档' }
    }[currentStatus] || {};

    const handleSubmit = () => {
        // 校验逻辑
        if (currentStatus === 'PENDING_QA') {
            const missing = respDepts.filter(d => !selectedReviewers[d]);
            if (missing.length > 0) {
                alert(`请为以下部门选择评审人: ${missing.join(', ')}`);
                return;
            }
        } else if (currentStatus !== 'PENDING_FINAL' && !nextUser) {
            // alert('请选择下一节点处理人'); // 演示时可放宽
        }

        onProcessSubmit({
            nextStep: config.nextStep,
            nextUser,
            comment,
            reviewers: selectedReviewers
        });
        setComment('');
        setNextUser('');
        setSelectedReviewers({});
    };

    // 动态渲染内容
    const renderContent = () => {
        // 特殊阶段：品质确认 -> 分发给各部门
        if (currentStatus === 'PENDING_QA') {
            return (
                <div>
                    <div style={{marginBottom:'15px', color:'#faad14', fontSize:'13px', background:'#fffbe6', padding:'8px', borderRadius:'4px'}}>
                        <i className="ri-information-fill"></i> 您已选定 {respDepts.length} 个责任单位，请为每个单位指定评审负责人：
                    </div>
                    {respDepts.length === 0 ? <div style={{color:'red'}}>未在表单中选择责任单位！请关闭并在表单中勾选。</div> :
                        respDepts.map(dept => (
                            <div key={dept} style={{marginBottom:'12px', display:'flex', alignItems:'center'}}>
                                <span style={{width:'100px', fontWeight:'bold', textAlign:'right', marginRight:'10px'}}>{dept}:</span>
                                <select
                                    className="u-picker-select"
                                    style={{flex:1, border:'1px solid #d9d9d9', padding:'6px', borderRadius:'4px'}}
                                    onChange={(e) => setSelectedReviewers(prev => ({...prev, [dept]: e.target.value}))}
                                >
                                    <option value="">请选择人员...</option>
                                    <option value={`${dept}经理`}>{dept}经理</option>
                                    <option value={`${dept}主管`}>{dept}主管</option>
                                    <option value={`${dept}工程师`}>{dept}工程师</option>
                                </select>
                            </div>
                        ))
                    }
                    <div style={{marginTop:'15px'}}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight:'bold' }}>分发备注:</label>
                        <textarea
                            style={{ width: '100%', height: '60px', padding: '6px', border: '1px solid #ddd', resize: 'none' }}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="给评审人员的留言..."
                        />
                    </div>
                </div>
            );
        }

        // 通用阶段
        return (
            <div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight:'bold' }}>下一节点处理人 ({config.role}):</label>
                    <select className="u-picker-select" style={{width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'4px'}} value={nextUser} onChange={e => setNextUser(e.target.value)}>
                        <option value="">请选择...</option>
                        <option value="张主管">张主管 (生产)</option>
                        <option value="李品质">李品质 (QE)</option>
                        <option value="王经理">王经理 (PM)</option>
                        <option value="系统管理员">系统管理员</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight:'bold' }}>处理意见:</label>
                    <textarea
                        style={{ width: '100%', height: '100px', padding: '8px', border: '1px solid #ddd', resize: 'none', borderRadius:'4px' }}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="请输入处理意见..."
                    />
                </div>
            </div>
        );
    };

    return (
        <BaseModal
            visible={visible}
            title={config.title || '流程提交'}
            onClose={onClose}
            width="550px"
            footer={
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button className="ncr-btn" onClick={onClose}>取消</button>
                    <button className="ncr-btn primary" onClick={handleSubmit}>确认提交</button>
                </div>
            }
        >
            <div style={{ padding: '20px' }}>
                {renderContent()}
            </div>
        </BaseModal>
    );
};

export default NCRProcessModal;