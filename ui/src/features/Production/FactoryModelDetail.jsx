/**
 * @file: src/features/Production/FactoryModelDetail.jsx
 * @description: 工厂物理建模详情/编辑弹窗
 * - [Feature] 独立的表单组件，支持新增和编辑
 * - [UI] 显示上级节点路径
 */
import React, { useState, useEffect } from 'react';
import BaseModal from '../../components/Common/BaseModal';
import '../../styles/sys-comm-detail.css'; // 引用公共详情样式
import './FactoryModelDetail.css'; // 引用组件专用样式

const FactoryModelDetail = ({ visible, record, parentNode, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (visible) {
            if (record) {
                // 编辑模式
                setFormData({ ...record });
            } else {
                // 新增模式
                setFormData({
                    id: '', // ID 后端生成或前端手动输入
                    name: '',
                    type: parentNode ? getNextType(parentNode.type) : '工厂',
                    manager: '',
                    env: '普通',
                    equipCount: 0,
                    status: '正常',
                    parentId: parentNode?.id,
                    parentName: parentNode?.name,
                    remark: ''
                });
            }
        }
    }, [visible, record, parentNode]);

    // 根据父级类型自动推断下一级类型
    const getNextType = (parentType) => {
        if (!parentType) return '工厂';
        if (parentType === '工厂') return '车间';
        if (parentType === '车间') return '产线';
        if (parentType === '产线') return '工位';
        return '工位';
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!formData.name || !formData.id) {
            alert('请填写必填项 (名称、编码)');
            return;
        }
        onSubmit(formData);
    };

    const getTitle = () => {
        if (record) return `编辑${formData.type || '节点'}`;
        return `新增${formData.type || '节点'}`;
    };

    return (
        <BaseModal
            visible={visible}
            title={getTitle()}
            onClose={onClose}
            width="600px"
            footer={
                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <button className="btn outline" onClick={onClose}>取消</button>
                    <button className="btn btn-primary" onClick={handleSave}>保存</button>
                </div>
            }
        >
            <div className="fm-form-container">
                {/* 上级信息提示 */}
                <div className="fm-parent-info">
                    <i className="ri-node-tree"></i>
                    <span>上级节点：</span>
                    <strong>{parentNode ? (parentNode.fullPath || parentNode.name) : '无 (作为根节点)'}</strong>
                </div>

                <div className="form-grid-2">
                    <div className="form-item">
                        <label className="required">节点类型</label>
                        <select className="std-input" value={formData.type || '工厂'} onChange={e => handleChange('type', e.target.value)} disabled={!!record}>
                            <option>工厂</option><option>车间</option><option>产线</option><option>工位</option>
                        </select>
                    </div>
                    <div className="form-item">
                        <label className="required">节点名称</label>
                        <input className="std-input" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} placeholder="请输入名称" />
                    </div>
                    <div className="form-item">
                        <label className="required">节点编码</label>
                        <input className="std-input" value={formData.id || ''} onChange={e => handleChange('id', e.target.value)} placeholder="请输入唯一编码" disabled={!!record} />
                    </div>
                    <div className="form-item">
                        <label>负责人</label>
                        <input className="std-input" value={formData.manager || ''} onChange={e => handleChange('manager', e.target.value)} />
                    </div>
                </div>

                <div className="form-grid-2">
                    <div className="form-item">
                        <label>洁净度等级</label>
                        <select className="std-input" value={formData.env || '普通'} onChange={e => handleChange('env', e.target.value)}>
                            <option>普通</option>
                            <option>Class 100000 (十万级)</option>
                            <option>Class 10000 (万级)</option>
                            <option>Class 1000 (千级)</option>
                            <option>Class 100 (百级)</option>
                            <option>Class 10 (十级)</option>
                        </select>
                    </div>
                    <div className="form-item">
                        <label>状态</label>
                        <select className="std-input" value={formData.status || '正常'} onChange={e => handleChange('status', e.target.value)}>
                            <option>正常</option><option>维护中</option><option>停用</option>
                        </select>
                    </div>
                </div>

                <div className="form-item" style={{marginTop:'10px'}}>
                    <label>描述/备注</label>
                    <textarea className="std-input" style={{height:'60px', paddingTop:'8px'}} value={formData.remark || ''} onChange={e => handleChange('remark', e.target.value)}></textarea>
                </div>
            </div>
        </BaseModal>
    );
};

export default FactoryModelDetail;