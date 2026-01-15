/**
 * @file: src/features/System/RoleDetail.jsx
 * @description: 角色与权限配置详情
 * - [Update] 使用递归组件渲染无限层级菜单权限树
 * - [Feature] 支持折叠/展开，支持父子级联选择
 */
import React, { useState, useEffect } from 'react';
import BaseModal from '../../components/Common/BaseModal';
import menuData from '../../data/menu.json'; // 引入真实菜单配置
import '../../styles/sys-comm-detail.css'; // 引用公共详情样式
import './RoleDetail.css';

// --- 递归树节点组件 ---
const PermissionTreeNode = ({ node, level = 0, checkedKeys, onCheck, onExpand, expandedKeys }) => {
    // 构造当前节点的唯一 Key (优先用 path，没有则用 id)
    // 注意：menu.json 里有些节点没有 path，需要用 id 或组合键
    const nodeKey = node.path || node.id;

    // 判断当前节点状态
    const isChecked = checkedKeys.includes(nodeKey);
    // 简单的半选逻辑：如果有子节点，且子节点部分被选中 (这里暂简化为全选/不选，高级半选需复杂计算)
    // 实际项目中通常需要计算 indeterminate 状态

    // 是否展开
    const isExpanded = expandedKeys.includes(nodeKey);
    const hasChildren = (node.groups && node.groups.length > 0) || (node.items && node.items.length > 0) || (node.children && node.children.length > 0);

    // 统一子节点列表
    let children = [];
    if (node.groups) children = node.groups; // Level 1 -> 2
    else if (node.items) children = node.items; // Level 2 -> 3
    else if (node.children) children = node.children; // Level 3 -> 4+ (如果有)

    // 处理勾选
    const handleCheck = () => {
        // 收集所有子孙节点的 keys
        const getAllChildKeys = (n) => {
            let keys = [];
            const k = n.path || n.id;
            if (k) keys.push(k);

            let kids = n.groups || n.items || n.children || [];
            kids.forEach(kid => {
                keys = keys.concat(getAllChildKeys(kid));
            });
            return keys;
        };

        const childKeys = getAllChildKeys(node);
        onCheck(nodeKey, childKeys, !isChecked);
    };

    return (
        <div className="perm-tree-node">
            <div
                className={`perm-node-content level-${level}`}
                style={{ paddingLeft: `${level * 24 + 10}px` }}
            >
                {/* 展开/收缩图标 */}
                <span
                    className={`perm-expand-icon ${hasChildren ? (isExpanded ? 'open' : '') : 'hidden'}`}
                    onClick={(e) => { e.stopPropagation(); onExpand(nodeKey); }}
                >
                    <i className="ri-arrow-right-s-fill"></i>
                </span>

                {/* 复选框 */}
                <label className="perm-checkbox-label">
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={handleCheck}
                    />
                    {/* 图标与名称 */}
                    {node.icon && <i className={`perm-node-icon ${node.icon}`}></i>}
                    <span className="perm-node-title">{node.title || node.label || node.name}</span>
                </label>
            </div>

            {/* 递归渲染子节点 */}
            {hasChildren && isExpanded && (
                <div className="perm-node-children">
                    {children.map(child => (
                        <PermissionTreeNode
                            key={child.id || child.path || child.label}
                            node={child}
                            level={level + 1}
                            checkedKeys={checkedKeys}
                            onCheck={onCheck}
                            onExpand={onExpand}
                            expandedKeys={expandedKeys}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const RoleDetail = ({ visible, record, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({});
    const [expandedKeys, setExpandedKeys] = useState([]); // 控制树的展开

    useEffect(() => {
        if (visible) {
            setFormData(record ? {
                ...record,
                permissions: record.permissions || []
            } : {
                code: '', name: '', category: '系统管理', desc: '', status: '启用', permissions: []
            });

            // 默认展开第一层
            const rootKeys = menuData.menu.map(m => m.id);
            setExpandedKeys(rootKeys);
        }
    }, [visible, record]);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    // --- 树操作逻辑 ---

    // 切换展开/收缩
    const handleExpand = (key) => {
        if (expandedKeys.includes(key)) {
            setExpandedKeys(prev => prev.filter(k => k !== key));
        } else {
            setExpandedKeys(prev => [...prev, key]);
        }
    };

    // 切换勾选 (级联)
    const handleCheckNode = (nodeKey, allChildKeys, isChecking) => {
        const currentPerms = formData.permissions || [];
        let newPerms;

        // 当前节点 + 所有子节点
        const keysToToggle = [nodeKey, ...allChildKeys].filter(k => k); // 过滤空值

        if (isChecking) {
            // 选中：合并去重
            newPerms = [...new Set([...currentPerms, ...keysToToggle])];
        } else {
            // 取消选中：移除这些 key
            newPerms = currentPerms.filter(p => !keysToToggle.includes(p));
        }

        handleChange('permissions', newPerms);
    };

    return (
        <BaseModal
            visible={visible}
            title={record?.id ? "配置角色权限" : "新增角色"}
            width="800px"
            onClose={onClose}
            footer={
                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <button className="btn outline" onClick={onClose}>取消</button>
                    <button className="btn btn-primary" onClick={() => onSubmit(formData)}>保存配置</button>
                </div>
            }
        >
            <div style={{padding:'10px 20px'}}>
                {/* 角色基本信息 (保持不变) */}
                <div className="form-grid-2">
                    <div className="form-item">
                        <label className="required">角色名称</label>
                        <input className="std-input" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
                    </div>
                    <div className="form-item">
                        <label className="required">角色编码</label>
                        <input className="std-input" value={formData.code || ''} onChange={e => handleChange('code', e.target.value)} disabled={!!record?.id} />
                    </div>
                    <div className="form-item">
                        <label className="required">角色分类</label>
                        <select className="std-input" value={formData.category || '系统管理'} onChange={e => handleChange('category', e.target.value)}>
                            <option value="系统管理">系统管理</option>
                            <option value="生产管理">生产管理</option>
                            <option value="质量管理">质量管理</option>
                            <option value="仓储物流">仓储物流</option>
                            <option value="其他">其他</option>
                        </select>
                    </div>
                    <div className="form-item">
                        <label>状态</label>
                        <select className="std-input" value={formData.status || '启用'} onChange={e => handleChange('status', e.target.value)}>
                            <option value="启用">启用</option>
                            <option value="停用">停用</option>
                        </select>
                    </div>
                </div>
                <div className="form-item" style={{marginBottom:'15px'}}>
                    <label>描述</label>
                    <input className="std-input" value={formData.desc || ''} onChange={e => handleChange('desc', e.target.value)} />
                </div>

                {/* 递归权限树 */}
                <div className="form-item">
                    <label style={{marginBottom:'8px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span style={{fontWeight:'bold'}}>菜单访问权限</span>
                        <span style={{fontWeight:'normal', color:'#999', fontSize:'12px'}}>
                            (已选: {(formData.permissions || []).length})
                        </span>
                    </label>
                    <div className="role-perm-tree-wrapper">
                        {menuData.menu.map(mod => (
                            <PermissionTreeNode
                                key={mod.id}
                                node={mod}
                                level={0}
                                checkedKeys={formData.permissions || []}
                                onCheck={handleCheckNode}
                                onExpand={handleExpand}
                                expandedKeys={expandedKeys}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export default RoleDetail;