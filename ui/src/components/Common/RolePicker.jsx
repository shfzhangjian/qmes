/**
 * @file: src/components/Common/RolePicker.jsx
 * @description: 通用角色选择器
 * - 支持按分类展示角色
 * - 支持多选
 * - 支持搜索
 * - [Update] 角色ID使用中文名称，确保与UserList/UserDetail一致
 */
import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import '../../styles/sys-comm-detail.css'; // 复用通用样式

// 模拟角色数据（带分类）- 使用中文作为 Key
const MOCK_ROLES = [
    {
        category: '系统管理',
        roles: [
            { code: '超级管理员', name: '超级管理员', desc: '系统最高权限' },
            { code: '部门经理', name: '部门经理', desc: '负责部门管理' }
        ]
    },
    {
        category: '生产管理',
        roles: [
            { code: '计划员', name: '计划员', desc: '负责排产' },
            { code: '工艺工程师', name: '工艺工程师', desc: '负责工艺路线' }
        ]
    },
    {
        category: '质量管理',
        roles: [
            { code: '质检员', name: '质检员', desc: '负责日常检验' }
        ]
    },
    {
        category: '仓储物流',
        roles: [
            { code: '仓管员', name: '仓管员', desc: '负责出入库' }
        ]
    }
];

const RolePicker = ({ visible, initialSelected = [], onClose, onConfirm, title = "选择角色" }) => {
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [displayList, setDisplayList] = useState(MOCK_ROLES);

    useEffect(() => {
        if (visible) {
            setSelectedRoles(initialSelected || []);
            setKeyword('');
            setDisplayList(MOCK_ROLES);
        }
    }, [visible, initialSelected]);

    // 搜索过滤
    const handleSearch = (val) => {
        setKeyword(val);
        if (!val) {
            setDisplayList(MOCK_ROLES);
            return;
        }
        const lower = val.toLowerCase();
        const filtered = MOCK_ROLES.map(group => ({
            ...group,
            roles: group.roles.filter(r => r.name.includes(val) || r.code.includes(val))
        })).filter(group => group.roles.length > 0);
        setDisplayList(filtered);
    };

    const toggleRole = (code) => {
        if (selectedRoles.includes(code)) {
            setSelectedRoles(selectedRoles.filter(c => c !== code));
        } else {
            setSelectedRoles([...selectedRoles, code]);
        }
    };

    const handleConfirm = () => {
        onConfirm(selectedRoles);
        onClose();
    };

    return (
        <BaseModal
            visible={visible}
            title={title}
            width="600px"
            onClose={onClose}
            footer={
                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <div style={{flex:1, textAlign:'left', lineHeight:'32px', color:'#666'}}>
                        已选: <b>{selectedRoles.length}</b> 项
                    </div>
                    <button className="btn outline" onClick={onClose}>取消</button>
                    <button className="btn btn-primary" onClick={handleConfirm}>确认</button>
                </div>
            }
        >
            <div style={{padding:'10px 20px'}}>
                <div style={{marginBottom:'15px'}}>
                    <input
                        className="std-input"
                        placeholder="搜索角色名称..."
                        value={keyword}
                        onChange={e => handleSearch(e.target.value)}
                    />
                </div>

                <div style={{height:'350px', overflowY:'auto', border:'1px solid #eee', borderRadius:'4px', padding:'10px'}}>
                    {displayList.length === 0 ? (
                        <div style={{textAlign:'center', color:'#999', marginTop:'20px'}}>无匹配角色</div>
                    ) : (
                        displayList.map(group => (
                            <div key={group.category} style={{marginBottom:'15px'}}>
                                <div style={{
                                    background:'#f5f7fa',
                                    padding:'5px 10px',
                                    borderRadius:'4px',
                                    fontWeight:'bold',
                                    color:'#333',
                                    marginBottom:'8px',
                                    fontSize:'13px'
                                }}>
                                    {group.category}
                                </div>
                                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                                    {group.roles.map(role => (
                                        <div
                                            key={role.code}
                                            onClick={() => toggleRole(role.code)}
                                            style={{
                                                display:'flex',
                                                alignItems:'center',
                                                gap:'8px',
                                                padding:'8px',
                                                border: selectedRoles.includes(role.code) ? '1px solid #1890ff' : '1px solid #e8e8e8',
                                                background: selectedRoles.includes(role.code) ? '#e6f7ff' : '#fff',
                                                borderRadius:'4px',
                                                cursor:'pointer',
                                                transition:'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedRoles.includes(role.code)}
                                                onChange={() => {}} // handled by div click
                                                style={{pointerEvents:'none'}}
                                            />
                                            <div style={{flex:1}}>
                                                <div style={{fontSize:'13px', fontWeight:'500'}}>{role.name}</div>
                                                <div style={{fontSize:'12px', color:'#999'}}>{role.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </BaseModal>
    );
};

export default RolePicker;