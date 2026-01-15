/**
 * @file: src/features/System/MenuDetail.jsx
 * @description: 菜单节点编辑弹窗
 * - [Feature] 显示上级菜单完整路径 (参考 OrgDetail)
 */
import React, { useState, useEffect } from 'react';
import BaseModal from '../../components/Common/BaseModal';
import RolePicker from '../../components/Common/RolePicker';
import '../../styles/sys-comm-detail.css';
import './MenuDetail.css';

const MenuDetail = ({ visible, record, parent, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({});
    const [rolePickerVisible, setRolePickerVisible] = useState(false);

    // 根据父节点推断默认类型
    const getDefaultType = (p) => {
        if (!p) return 'MODULE';
        if (p.type === 'MODULE') return 'GROUP';
        if (p.type === 'GROUP') return 'MENU';
        if (p.type === 'MENU') return 'BUTTON';
        return 'BUTTON';
    };

    useEffect(() => {
        if (visible) {
            if (record) {
                // 编辑
                setFormData({ ...record });
            } else {
                // 新增
                setFormData({
                    id: '',
                    name: '',
                    type: getDefaultType(parent),
                    icon: 'ri-checkbox-blank-circle-line',
                    path: '',
                    perm: '',
                    roles: parent?.roles || ['超级管理员'], // 默认继承父级权限 (中文)
                    sort: 10,
                    status: '启用'
                });
            }
        }
    }, [visible, record, parent]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRoleConfirm = (roles) => {
        handleChange('roles', roles);
        setRolePickerVisible(false);
    };

    const getTitle = () => {
        const action = record ? '编辑' : '新增';
        const typeName = formData.type === 'MODULE' ? '模块' : (formData.type === 'GROUP' ? '分组' : (formData.type === 'MENU' ? '菜单' : '按钮'));
        return `${action}${typeName}`;
    };

    return (
        <BaseModal
            visible={visible}
            title={getTitle()}
            width="600px"
            onClose={onClose}
            footer={
                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <button className="btn outline" onClick={onClose}>取消</button>
                    <button className="btn btn-primary" onClick={() => onSubmit(formData)}>保存</button>
                </div>
            }
        >
            <div style={{padding:'20px'}}>
                {/* 上级信息提示 (OrgDetail 风格) */}
                <div className="menu-parent-info">
                    <i className="ri-git-merge-line"></i>
                    <span>上级路径：</span>
                    <strong>{parent ? (parent.fullPath || parent.name) : '无 (作为根节点)'}</strong>
                </div>

                <div className="form-grid-2">
                    <div className="form-item">
                        <label className="required">节点类型</label>
                        <select className="std-input" value={formData.type} onChange={e => handleChange('type', e.target.value)} disabled={!!record}>
                            <option value="MODULE">模块 (Level 1)</option>
                            <option value="GROUP">分组 (Level 2)</option>
                            <option value="MENU">菜单 (Level 3)</option>
                            <option value="BUTTON">按钮/权限 (Level 4)</option>
                        </select>
                    </div>
                    <div className="form-item">
                        <label className="required">显示名称</label>
                        <input className="std-input" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
                    </div>
                </div>

                {/* 图标与排序 */}
                {formData.type !== 'BUTTON' && (
                    <div className="form-grid-2">
                        <div className="form-item">
                            <label>菜单图标</label>
                            <div style={{display:'flex', gap:'8px'}}>
                                <div className="icon-preview"><i className={formData.icon}></i></div>
                                <input className="std-input" value={formData.icon || ''} onChange={e => handleChange('icon', e.target.value)} placeholder="ri-icon-name" />
                            </div>
                        </div>
                        <div className="form-item">
                            <label>显示排序</label>
                            <input className="std-input" type="number" value={formData.sort || 0} onChange={e => handleChange('sort', e.target.value)} />
                        </div>
                    </div>
                )}

                {/* 路由与权限 */}
                <div className="form-item" style={{marginTop:'15px'}}>
                    {formData.type === 'BUTTON' ? (
                        <>
                            <label>权限标识 (Permission Code)</label>
                            <input className="std-input" value={formData.perm || ''} onChange={e => handleChange('perm', e.target.value)} placeholder="如: sys:user:add" />
                        </>
                    ) : (
                        <>
                            <label>路由路径 (Route Path)</label>
                            <input className="std-input" value={formData.path || ''} onChange={e => handleChange('path', e.target.value)} placeholder="如: /system/users (分组可不填)" />
                        </>
                    )}
                </div>

                {/* 角色权限 */}
                <div className="form-item" style={{marginTop:'15px'}}>
                    <label>访问角色</label>
                    <div className="role-tags-container">
                        {formData.roles?.map(r => (
                            <span key={r} className="role-tag">
                                {r} <i className="ri-close-line" onClick={() => handleChange('roles', formData.roles.filter(x => x !== r))}></i>
                            </span>
                        ))}
                        <button className="mini-btn outline" onClick={() => setRolePickerVisible(true)} style={{marginLeft:'auto'}}>+ 选择</button>
                    </div>
                </div>

                {/* 描述 */}
                <div className="form-item" style={{marginTop:'15px'}}>
                    <label>描述说明</label>
                    <textarea className="std-input" style={{height:'60px', paddingTop:'6px'}} value={formData.desc || ''} onChange={e => handleChange('desc', e.target.value)} />
                </div>
            </div>

            <RolePicker
                visible={rolePickerVisible}
                initialSelected={formData.roles}
                onClose={() => setRolePickerVisible(false)}
                onConfirm={handleRoleConfirm}
            />
        </BaseModal>
    );
};

export default MenuDetail;