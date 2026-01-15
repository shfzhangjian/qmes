/**
 * @file: src/features/System/OrgDetail.jsx
 * @description: 组织架构详情/编辑弹窗
 * - [Feature] 显示完整上级路径
 */
import React, { useState, useEffect } from 'react';
import BaseModal from '../../components/Common/BaseModal';
import '../../styles/sys-comm-detail.css'; // 引用公共详情样式
import './OrgDetail.css';    // 组件专用样式

const OrgDetail = ({ visible, record, parentNode, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (visible) {
            if (record) {
                // 编辑模式
                setFormData({ ...record });
            } else {
                // 新增模式
                setFormData({
                    id: '', // ID 后端生成
                    name: '',
                    code: '',
                    type: '部门',
                    leader: '',
                    phone: '',
                    status: '启用',
                    parentId: parentNode?.id,
                    // parentName 实际上逻辑上不再需要存储在 formData 里提交，这里仅作 UI 展示依赖 parentNode
                });
            }
        }
    }, [visible, record, parentNode]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!formData.name || !formData.code) {
            alert('请填写必填项');
            return;
        }
        onSubmit(formData);
    };

    return (
        <BaseModal
            visible={visible}
            title={record ? "编辑组织节点" : "新增下级组织"}
            width="600px"
            onClose={onClose}
            footer={
                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <button className="btn outline" onClick={onClose}>取消</button>
                    <button className="btn btn-primary" onClick={handleSave}>保存</button>
                </div>
            }
        >
            <div className="org-form-container">
                {/* 上级信息提示 - 显示完整路径 */}
                <div className="org-parent-info">
                    <i className="ri-git-merge-line"></i>
                    <span>上级组织：</span>
                    <strong>{parentNode ? (parentNode.fullPath || parentNode.name) : '无 (作为一级根节点)'}</strong>
                </div>

                <div className="form-grid-2">
                    <div className="form-item">
                        <label className="required">组织名称</label>
                        <input className="std-input" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} placeholder="如：工程技术部" />
                    </div>
                    <div className="form-item">
                        <label className="required">组织编码</label>
                        <input className="std-input" value={formData.code || ''} onChange={e => handleChange('code', e.target.value)} placeholder="如：ENG-DEPT" />
                    </div>
                    <div className="form-item">
                        <label className="required">组织类型</label>
                        <select className="std-input" value={formData.type || '部门'} onChange={e => handleChange('type', e.target.value)}>
                            <option>公司</option>
                            <option>中心</option>
                            <option>部门</option>
                            <option>车间</option>
                            <option>班组</option>
                            <option>工段</option>
                            <option>仓库</option>
                        </select>
                    </div>
                    <div className="form-item">
                        <label>负责人</label>
                        <input className="std-input" value={formData.leader || ''} onChange={e => handleChange('leader', e.target.value)} />
                    </div>
                    <div className="form-item">
                        <label>联系电话</label>
                        <input className="std-input" value={formData.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
                    </div>
                    <div className="form-item">
                        <label>状态</label>
                        <select className="std-input" value={formData.status || '启用'} onChange={e => handleChange('status', e.target.value)}>
                            <option>启用</option>
                            <option>停用</option>
                        </select>
                    </div>
                </div>
                <div className="form-item" style={{marginTop: '10px'}}>
                    <label>备注说明</label>
                    <textarea className="std-input" style={{height:'60px', paddingTop:'8px'}} value={formData.remark || ''} onChange={e => handleChange('remark', e.target.value)} />
                </div>
            </div>
        </BaseModal>
    );
};

export default OrgDetail;