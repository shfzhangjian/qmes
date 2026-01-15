/**
 * @file: src/features/System/DutyDetail.jsx
 * @description: 岗位管理详情
 */
import React, { useState, useEffect } from 'react';
import BaseModal from '../../components/Common/BaseModal';
import '../../styles/sys-comm-detail.css'; // 引用公共详情样式
import './DutyDetail.css';

const DutyDetail = ({ visible, record, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (visible) {
            setFormData(record || {
                code: '', name: '', level: 'L1', type: '作业岗', desc: '', status: '启用'
            });
        }
    }, [visible, record]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <BaseModal
            visible={visible}
            title={record?.id ? "编辑岗位" : "新增岗位"}
            width="550px"
            onClose={onClose}
            footer={
                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <button className="btn outline" onClick={onClose}>取消</button>
                    <button className="btn btn-primary" onClick={() => onSubmit(formData)}>保存</button>
                </div>
            }
        >
            <div style={{padding:'10px 20px'}}>
                <div className="form-item" style={{marginBottom:'15px'}}>
                    <label className="required">岗位名称</label>
                    <input className="std-input" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} placeholder="如：高级工程师" />
                </div>
                <div className="form-item" style={{marginBottom:'15px'}}>
                    <label className="required">岗位编码</label>
                    <input className="std-input" value={formData.code || ''} onChange={e => handleChange('code', e.target.value)} placeholder="如：SENIOR-ENG" />
                </div>
                <div className="form-grid-2">
                    <div className="form-item">
                        <label>职级</label>
                        <select className="std-input" value={formData.level || 'L1'} onChange={e => handleChange('level', e.target.value)}>
                            <option>L1</option><option>L2</option><option>L3</option><option>L4</option><option>L5</option><option>L6</option>
                        </select>
                    </div>
                    <div className="form-item">
                        <label>岗位类型</label>
                        <select className="std-input" value={formData.type || '作业岗'} onChange={e => handleChange('type', e.target.value)}>
                            <option>管理岗</option><option>技术岗</option><option>作业岗</option><option>辅助岗</option>
                        </select>
                    </div>
                </div>
                <div className="form-item" style={{marginTop:'15px'}}>
                    <label>职责描述</label>
                    <textarea
                        className="std-input duty-desc-area"
                        value={formData.desc || ''}
                        onChange={e => handleChange('desc', e.target.value)}
                        placeholder="请输入该岗位的主要职责..."
                    />
                </div>
            </div>
        </BaseModal>
    );
};

export default DutyDetail;