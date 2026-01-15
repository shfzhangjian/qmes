/**
 * @file: src/features/System/UserDetail.jsx
 * @description: 用户管理详情弹窗
 * - [Update] 使用 RolePicker 替代 Checkbox 实现角色选择
 * - [Update] 使用 DeptPicker 替代 Select 实现部门选择
 * - [Data] 角色数据使用全中文
 */
import React, { useState, useEffect } from 'react';
import BaseModal from '../../components/Common/BaseModal';
import RolePicker from '../../components/Common/RolePicker'; // 引入角色选择器
import DeptPicker from '../../components/Common/DeptPicker'; // 引入部门选择器
import '../../styles/sys-comm-detail.css';
import './UserDetail.css';

const UserDetail = ({ visible, record, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({});
    const [rolePickerVisible, setRolePickerVisible] = useState(false);
    const [deptPickerVisible, setDeptPickerVisible] = useState(false);

    useEffect(() => {
        if (visible) {
            setFormData(record ? {
                ...record,
                roles: record.roles || []
            } : {
                username: '', name: '', dept: '', duty: '', roles: [],
                phone: '', email: '', status: '启用'
            });
        }
    }, [visible, record]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // --- 角色处理 ---
    const handleRoleConfirm = (newRoles) => {
        handleChange('roles', newRoles);
        setRolePickerVisible(false);
    };

    const removeRole = (roleToRemove) => {
        handleChange('roles', formData.roles.filter(r => r !== roleToRemove));
    };

    // --- 部门处理 ---
    const handleDeptSelect = (deptName) => {
        handleChange('dept', deptName);
        // 如果需要，这里也可以根据部门自动带出一些默认岗位或角色
    };

    return (
        <BaseModal
            visible={visible}
            title={record?.id ? "编辑用户" : "新增用户"}
            width="750px"
            onClose={onClose}
            footer={
                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <button className="btn outline" onClick={onClose}>取消</button>
                    <button className="btn btn-primary" onClick={() => onSubmit(formData)}>保存</button>
                </div>
            }
        >
            <div className="user-form-grid">
                {/* 左侧头像 */}
                <div className="avatar-section">
                    <div className="user-avatar-preview">
                        <i className="ri-user-line"></i>
                    </div>
                    <span className="upload-btn-text">上传头像</span>
                </div>

                {/* 右侧表单 */}
                <div className="form-section">
                    <div className="form-grid-2">
                        <div className="form-item">
                            <label className="required">登录账号 (工号)</label>
                            <input className="std-input" value={formData.username || ''} onChange={e => handleChange('username', e.target.value)} disabled={!!record?.id} />
                        </div>
                        <div className="form-item">
                            <label className="required">用户姓名</label>
                            <input className="std-input" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
                        </div>

                        {/* 部门选择：改为弹出式选择器 */}
                        <div className="form-item">
                            <label className="required">所属部门</label>
                            <div style={{display: 'flex', gap: '8px'}}>
                                <input
                                    className="std-input"
                                    value={formData.dept || ''}
                                    readOnly
                                    placeholder="请选择部门"
                                    onClick={() => setDeptPickerVisible(true)}
                                    style={{cursor: 'pointer', backgroundColor: '#fff'}}
                                />
                                <button
                                    className="mini-btn outline"
                                    onClick={() => setDeptPickerVisible(true)}
                                    title="打开部门树"
                                >
                                    <i className="ri-node-tree"></i>
                                </button>
                            </div>
                        </div>

                        <div className="form-item">
                            <label className="required">岗位/职务</label>
                            <select className="std-input" value={formData.duty || ''} onChange={e => handleChange('duty', e.target.value)}>
                                <option value="">请选择</option>
                                <option>PE主管</option><option>品质经理</option><option>生产总监</option><option>仓库主管</option><option>PMC专员</option><option>普通员工</option>
                            </select>
                        </div>
                        <div className="form-item">
                            <label>手机号</label>
                            <input className="std-input" value={formData.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
                        </div>
                        <div className="form-item">
                            <label>邮箱</label>
                            <input className="std-input" value={formData.email || ''} onChange={e => handleChange('email', e.target.value)} />
                        </div>
                    </div>

                    {/* 角色选择区域 */}
                    <div className="form-item" style={{marginTop: '15px'}}>
                        <label className="required">关联角色</label>
                        <div style={{
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px',
                            padding: '8px',
                            minHeight: '40px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px',
                            alignItems: 'center'
                        }}>
                            {formData.roles && formData.roles.map(role => (
                                <span key={role} className="q-tag primary" style={{display:'flex', alignItems:'center', gap:'4px'}}>
                                    {role}
                                    <i className="ri-close-line"
                                       style={{cursor:'pointer', fontSize:'12px'}}
                                       onClick={() => removeRole(role)}
                                    ></i>
                                </span>
                            ))}
                            <button
                                className="mini-btn outline"
                                style={{borderStyle:'dashed', color:'#1890ff', borderColor:'#1890ff'}}
                                onClick={() => setRolePickerVisible(true)}
                            >
                                <i className="ri-add-line"></i> 选择角色
                            </button>
                        </div>
                    </div>

                    <div className="form-item" style={{marginTop: '10px'}}>
                        <label>账号状态</label>
                        <div style={{display:'flex', alignItems:'center', gap:'15px', height:'32px'}}>
                            <label style={{display:'flex', alignItems:'center', gap:'4px', cursor:'pointer'}}>
                                <input type="radio" name="u_status" checked={formData.status === '启用'} onChange={() => handleChange('status', '启用')} /> 启用
                            </label>
                            <label style={{display:'flex', alignItems:'center', gap:'4px', cursor:'pointer'}}>
                                <input type="radio" name="u_status" checked={formData.status === '停用'} onChange={() => handleChange('status', '停用')} /> 停用
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* 角色选择弹窗 */}
            <RolePicker
                visible={rolePickerVisible}
                initialSelected={formData.roles}
                onClose={() => setRolePickerVisible(false)}
                onConfirm={handleRoleConfirm}
            />

            {/* 部门选择弹窗 */}
            <DeptPicker
                visible={deptPickerVisible}
                initialValue={formData.dept}
                onClose={() => setDeptPickerVisible(false)}
                onSelect={handleDeptSelect}
            />
        </BaseModal>
    );
};

export default UserDetail;