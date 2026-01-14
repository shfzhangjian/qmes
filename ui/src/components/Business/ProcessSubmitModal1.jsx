/**
 * @file: src/components/Business/ProcessSubmitModal.jsx
 * @version: v14.7.0 (Audit Flag & Flow Description)
 * @description: 流程提交确认弹窗 - 业务逻辑增强版
 * - [Config] 增加 `audit` 属性：控制是否显示“通过/驳回”选项。默认为 false (仅提交)。
 * - [Config] `next` 数组升级为对象数组：包含 `{ step, desc }`，用于在下拉框显示业务含义（如“非异常”）。
 * - [UI] 根据 `audit` 动态渲染审批区域。
 * - [UI] 下拉框优先展示 `desc` 流向说明。
 */
import React, { useState, useEffect } from 'react';
import BaseModal from '../Common/BaseModal';
import UserPicker from '../Common/UserPicker';

// 状态码中文映射
const STATUS_MAP = {
    'DRAFT': '草稿',
    'PENDING_CONFIRM': '待初步确认',
    'PENDING_QA_CONFIRM': '待品质确认',
    'PENDING_CONTAINMENT': '待围堵措施',
    'PENDING_ANALYSIS': '待根因分析',
    'PENDING_VERIFY': '待效果验证',
    'CLOSED': '已结案'
};

const ProcessSubmitModal = ({ visible, record, currentStep, onClose, onProcessSubmit }) => {

    // --- 1. 增强版流程配置 ---
    // audit: true (显示通过/驳回), false (仅显示下一步，默认通过)
    // next: 数组，包含 { step: '节点ID', desc: '流向说明' }
    const FLOW_CONFIG = {
        'DRAFT': {
            audit: false, // 提交节点，无驳回
            next: [
                { step: 'PENDING_CONFIRM', desc: '提交初步确认' }
            ],
            back: []
        },
        'PENDING_CONFIRM': {
            audit: true, // 需要审核：是异常 vs 不是异常
            next: [
                { step: 'PENDING_QA_CONFIRM', desc: '确认异常 (转品质确认)' },
                { step: 'CLOSED', desc: '非异常 (直接关闭)' } // [User Request] 场景：非异常结束
            ],
            back: [
                { step: 'DRAFT', desc: '信息不全，退回草稿' }
            ]
        },
        'PENDING_QA_CONFIRM': {
            audit: true,
            next: [
                { step: 'PENDING_CONTAINMENT', desc: '确认并制定围堵' }
            ],
            back: [
                { step: 'PENDING_CONFIRM', desc: '退回初步确认' },
                { step: 'DRAFT', desc: '退回发起人' }
            ]
        },
        'PENDING_CONTAINMENT': {
            audit: false, // 执行节点，通常只需提交
            next: [
                { step: 'PENDING_ANALYSIS', desc: '完成围堵，进入分析' }
            ],
            back: []
        },
        'PENDING_ANALYSIS': {
            audit: false, // 执行节点
            next: [
                { step: 'PENDING_VERIFY', desc: '完成分析，申请验证' }
            ],
            back: []
        },
        'PENDING_VERIFY': {
            audit: true, // 验证节点，需要判断结果
            next: [
                { step: 'CLOSED', desc: '验证有效 (结案)' }
            ],
            back: [
                { step: 'PENDING_ANALYSIS', desc: '验证无效 (退回分析)' }
            ]
        }
    };

    const currentConfig = FLOW_CONFIG[currentStep] || { audit: false, next: [], back: [] };
    // 如果配置中未显式设置 audit，默认为 false
    const isAuditNode = currentConfig.audit === true;

    // --- State ---
    const [result, setResult] = useState('PASS'); // PASS | REJECT
    const [targetStep, setTargetStep] = useState(''); // 选中的下一环节 ID
    const [nextUser, setNextUser] = useState('');
    const [comment, setComment] = useState('');
    const [files, setFiles] = useState([]);

    // --- Effect: 初始化 ---
    useEffect(() => {
        if (visible) {
            setResult('PASS');
            setNextUser('');
            setFiles([]);
            setComment('同意，请继续处理。');

            // 默认选中第一个 next 路径
            if (currentConfig.next && currentConfig.next.length > 0) {
                setTargetStep(currentConfig.next[0].step);
            } else {
                setTargetStep('');
            }
        }
    }, [visible, currentStep]);

    // --- Effect: 切换审批结果 -> 更新流向选项 ---
    useEffect(() => {
        if (!visible) return;

        // 根据结果获取对应的选项列表 (next 或 back)
        const options = result === 'PASS' ? currentConfig.next : currentConfig.back;

        // 默认选中第一个
        if (options && options.length > 0) {
            setTargetStep(options[0].step);
        } else {
            setTargetStep('');
        }

        // 自动填充意见
        if (result === 'PASS') {
            if (!comment || comment.includes('驳回')) setComment('同意，请继续处理。');
        } else {
            setComment(''); // 驳回时清空，强制用户填写
        }
    }, [result]);

    const isFinish = targetStep === 'CLOSED';
    const isReject = result === 'REJECT';

    // 获取当前应该显示的选项列表
    const currentOptions = result === 'PASS' ? currentConfig.next : currentConfig.back;

    // --- Handlers ---
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const f = e.target.files[0];
            setFiles(p => [...p, { name: f.name, size: (f.size/1024).toFixed(1)+'KB', uid: Date.now() }]);
        }
    };
    const removeFile = (uid) => setFiles(p => p.filter(f => f.uid !== uid));

    const handleSubmit = () => {
        if (!targetStep) {
            alert('错误：未选择有效的流转路径！');
            return;
        }
        // 通过且非结案，需选人
        if (result === 'PASS' && !isFinish && !nextUser) {
            alert('请指定下一环节的办理人！');
            return;
        }
        // 驳回必填意见
        if (isReject && !comment) {
            alert('驳回时必须填写处理意见！');
            return;
        }

        onProcessSubmit({
            nextStep: targetStep,
            nextUser: isReject ? '原处理人' : nextUser,
            comment: isReject ? `[驳回] ${comment}` : comment,
            files,
            isFinish,
            isReject
        });
    };

    return (
        <BaseModal
            visible={visible}
            title="流程流转办理"
            width="600px"
            onClose={onClose}
            onOk={handleSubmit}
        >
            <div style={{ padding: '15px 25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>

                {/* 1. 状态与审批结果 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f7fa', padding: '10px 15px', borderRadius: '4px', border: '1px solid #e4e7ed' }}>
                    <div style={{ fontSize: '13px', color: '#606266' }}>
                        当前环节: <strong style={{ color: '#303133', marginLeft: '5px' }}>{STATUS_MAP[currentStep] || currentStep}</strong>
                    </div>

                    {/* [Logic] 只有 audit=true 才显示 通过/驳回，否则默认通过 */}
                    {isAuditNode ? (
                        <div style={{ display: 'flex', gap: '15px', fontSize: '14px' }}>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <input type="radio" name="res" checked={result === 'PASS'} onChange={() => setResult('PASS')} style={{ marginRight: '4px' }} />
                                <span style={{ color: '#52c41a', fontWeight: 'bold' }}>通过</span>
                            </label>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <input type="radio" name="res" checked={result === 'REJECT'} onChange={() => setResult('REJECT')} style={{ marginRight: '4px' }} />
                                <span style={{ color: '#f5222d', fontWeight: 'bold' }}>驳回</span>
                            </label>
                        </div>
                    ) : (
                        <div style={{ color: '#1890ff', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                            <i className="ri-arrow-right-circle-fill" style={{ marginRight: '4px' }}></i> 提交下一步
                        </div>
                    )}
                </div>

                {/* 2. 灵活流向选择 (支持 desc 说明) */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>
                            {isAuditNode && isReject ? '退回至' : '下一环节'}
                            <span style={{ color: '#999', fontWeight: 'normal' }}> (流向)</span>
                        </label>

                        {currentOptions && currentOptions.length > 1 ? (
                            <select
                                className="browser-default-select"
                                style={{ width: '100%', height: '34px', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '0 8px', fontSize: '13px' }}
                                value={targetStep}
                                onChange={e => setTargetStep(e.target.value)}
                            >
                                {currentOptions.map(opt => (
                                    <option key={opt.step} value={opt.step}>
                                        {/* [Display] 优先显示 desc 说明，没有则显示状态名 */}
                                        {opt.desc ? `[${opt.desc}] -> ${STATUS_MAP[opt.step]||opt.step}` : (STATUS_MAP[opt.step] || opt.step)}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div style={{ height: '34px', lineHeight: '34px', background: '#f5f5f5', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '0 10px', color: '#333', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {currentOptions && currentOptions.length > 0 ? (
                                    /* 单一路径也显示说明 */
                                    currentOptions[0].desc ?
                                        `${currentOptions[0].desc}` :
                                        (STATUS_MAP[currentOptions[0].step] || currentOptions[0].step)
                                ) : (
                                    <span style={{color: '#999'}}>无后续节点配置</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 3. 办理人 (仅通过且非结案显示) */}
                    {result === 'PASS' && !isFinish && (
                        <div style={{ flex: 1.5 }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>
                                指定办理人 <span style={{ color: 'red' }}>*</span>
                            </label>
                            <UserPicker
                                value={nextUser}
                                onChange={(val) => setNextUser(val)}
                                placeholder="输入或点击选择..."
                            />
                        </div>
                    )}
                </div>

                {/* 4. 处理意见 */}
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>
                        处理意见 {isReject && <span style={{ color: 'red' }}>*</span>}
                    </label>
                    <textarea
                        style={{
                            width: '100%',
                            height: '70px',
                            padding: '6px 8px',
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px',
                            resize: 'none',
                            fontSize: '13px',
                            fontFamily: 'inherit'
                        }}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder={isReject ? "请输入驳回原因..." : "请输入意见..."}
                    />
                </div>

                {/* 5. 佐证材料 */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '13px', margin: 0 }}>佐证材料</label>
                        <label style={{ cursor: 'pointer', color: '#1890ff', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                            <i className="ri-attachment-line" style={{ marginRight: '2px' }}></i> 添加附件
                            <input type="file" style={{ display: 'none' }} onChange={handleFileChange} />
                        </label>
                    </div>
                    {files.length > 0 && (
                        <div style={{ background: '#fafafa', padding: '4px 8px', borderRadius: '4px', border: '1px solid #eee', maxHeight: '60px', overflowY: 'auto' }}>
                            {files.map(f => (
                                <div key={f.uid} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '2px 0' }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>{f.name}</span>
                                    <i className="ri-close-line" onClick={() => removeFile(f.uid)} style={{ cursor: 'pointer', color: '#ff4d4f' }}></i>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </BaseModal>
    );
};

export default ProcessSubmitModal;