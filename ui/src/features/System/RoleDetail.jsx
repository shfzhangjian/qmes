/**
 * @file: src/features/System/RoleDetail.jsx
 * @description: 角色与权限配置详情
 * - [Update] 使用递归组件渲染无限层级菜单权限树
 * - [Feature] 支持折叠/展开，支持父子级联选择
 * - [Feature] 新增菜单权限搜索过滤和只显示已选功能
 */
import React, { useState, useEffect, useMemo } from 'react';
import BaseModal from '../../components/Common/BaseModal';
import menuData from '../../data/menu.json'; // 引入真实菜单配置
import '../../styles/sys-comm-detail.css'; // 引用公共详情样式
import './RoleDetail.css';

// --- 递归树节点组件 ---
const PermissionTreeNode = ({ node, level = 0, checkedKeys, onCheck, onExpand, expandedKeys }) => {
    // 构造当前节点的唯一 Key (优先用 path，没有则用 id)
    const nodeKey = node.path || node.id;

    // 判断当前节点状态
    const isChecked = checkedKeys.includes(nodeKey);

    // 是否展开
    const isExpanded = expandedKeys.includes(nodeKey);

    // 动态获取子节点（适配不同层级的字段名）
    let children = [];
    if (node.groups && node.groups.length > 0) children = node.groups;
    else if (node.items && node.items.length > 0) children = node.items;
    else if (node.children && node.children.length > 0) children = node.children;

    const hasChildren = children.length > 0;

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

// --- 开关组件 ---
const ToggleSwitch = ({ checked, onChange, label }) => (
    <div
        style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', userSelect:'none'}}
        onClick={() => onChange(!checked)}
    >
        <div style={{
            width:'36px', height:'18px', borderRadius:'9px',
            background: checked ? '#1890ff' : '#ccc',
            position:'relative', transition:'all 0.2s'
        }}>
            <div style={{
                width:'14px', height:'14px', borderRadius:'50%', background:'#fff',
                position:'absolute', top:'2px', left: checked ? '20px' : '2px', transition:'all 0.2s'
            }}></div>
        </div>
        <span style={{fontSize:'12px', color:'#666'}}>{label}</span>
    </div>
);

const RoleDetail = ({ visible, record, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({});
    const [expandedKeys, setExpandedKeys] = useState([]); // 控制树的展开
    const [filterKeyword, setFilterKeyword] = useState(''); // 搜索关键词
    const [showCheckedOnly, setShowCheckedOnly] = useState(false); // 只显示已选

    useEffect(() => {
        if (visible) {
            setFormData(record ? {
                ...record,
                permissions: record.permissions || []
            } : {
                code: '', name: '', category: '系统管理', desc: '', status: '启用', permissions: []
            });
            setFilterKeyword('');
            setShowCheckedOnly(false);

            // 默认展开第一层
            const rootKeys = menuData.menu.map(m => m.id);
            setExpandedKeys(rootKeys);
        }
    }, [visible, record]);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    // --- 树操作逻辑 ---
    const handleExpand = (key) => {
        if (expandedKeys.includes(key)) {
            setExpandedKeys(prev => prev.filter(k => k !== key));
        } else {
            setExpandedKeys(prev => [...prev, key]);
        }
    };

    const handleCheckNode = (nodeKey, allChildKeys, isChecking) => {
        const currentPerms = formData.permissions || [];
        let newPerms;
        const keysToToggle = [nodeKey, ...allChildKeys].filter(k => k);
        if (isChecking) {
            newPerms = [...new Set([...currentPerms, ...keysToToggle])];
        } else {
            newPerms = currentPerms.filter(p => !keysToToggle.includes(p));
        }
        handleChange('permissions', newPerms);
    };

    // --- 过滤逻辑 ---
    const filteredMenuData = useMemo(() => {
        // 递归过滤函数
        const filterNodes = (nodes) => {
            return nodes.map(node => {
                // 确定子节点字段
                let childField = 'children';
                if (node.groups) childField = 'groups';
                else if (node.items) childField = 'items';

                const children = node[childField] || [];
                const filteredChildren = filterNodes(children);

                // 匹配条件
                const name = node.title || node.label || node.name || '';
                const key = node.path || node.id;

                // 1. 关键词匹配
                const matchesKeyword = !filterKeyword || name.toLowerCase().includes(filterKeyword.toLowerCase());

                // 2. 已选匹配 (如果是"只显示已选"模式)
                const isChecked = (formData.permissions || []).includes(key);
                const hasVisibleChildren = filteredChildren.length > 0;

                // 节点可见性判断：
                // A. 如果只显示已选：(自己被选中 OR 有被选中的子节点) AND (关键词匹配逻辑)
                //    但通常逻辑是：(满足关键词 OR 子节点满足) AND (满足已选 OR 子节点满足)

                // 简化逻辑：
                // 节点保留条件：(有可见子节点) OR (自身同时满足所有过滤条件)

                let isSelfVisible = true;

                // 检查关键词
                if (filterKeyword && !matchesKeyword) isSelfVisible = false;

                // 检查已选
                if (showCheckedOnly && !isChecked) isSelfVisible = false;

                if (isSelfVisible || hasVisibleChildren) {
                    // 如果是因为子节点可见而保留父节点，或者自身可见
                    return { ...node, [childField]: filteredChildren };
                }
                return null;
            }).filter(Boolean);
        };

        const result = filterNodes(menuData.menu);
        return result;
    }, [formData.permissions, filterKeyword, showCheckedOnly]);

    // 当过滤条件变化时，自动展开所有可见节点
    useEffect(() => {
        if (filterKeyword || showCheckedOnly) {
            const getAllKeys = (nodes) => {
                let keys = [];
                nodes.forEach(n => {
                    keys.push(n.path || n.id);
                    const children = n.groups || n.items || n.children;
                    if (children) keys = keys.concat(getAllKeys(children));
                });
                return keys;
            };
            setExpandedKeys(getAllKeys(filteredMenuData));
        }
    }, [filteredMenuData, filterKeyword, showCheckedOnly]);

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
                {/* 角色基本信息 */}
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

                {/* 权限树区域 */}
                <div className="form-item">
                    <div style={{marginBottom:'8px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                            <span style={{fontWeight:'bold'}}>菜单访问权限</span>
                            <span style={{fontWeight:'normal', color:'#999', fontSize:'12px'}}>
                                (已选: {(formData.permissions || []).length})
                            </span>
                        </div>
                        {/* 过滤工具栏 */}
                        <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                            <input
                                className="std-input"
                                placeholder="输入菜单名称过滤..."
                                value={filterKeyword}
                                onChange={e => setFilterKeyword(e.target.value)}
                                style={{width:'180px', height:'28px', fontSize:'12px'}}
                            />
                            <ToggleSwitch
                                label="只显示已选"
                                checked={showCheckedOnly}
                                onChange={setShowCheckedOnly}
                            />
                        </div>
                    </div>
                    <div className="role-perm-tree-wrapper">
                        {filteredMenuData.length > 0 ? (
                            filteredMenuData.map(mod => (
                                <PermissionTreeNode
                                    key={mod.id}
                                    node={mod}
                                    level={0}
                                    checkedKeys={formData.permissions || []}
                                    onCheck={handleCheckNode}
                                    onExpand={handleExpand}
                                    expandedKeys={expandedKeys}
                                />
                            ))
                        ) : (
                            <div style={{padding:'20px', textAlign:'center', color:'#999', fontSize:'13px'}}>
                                未找到匹配的菜单项
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export default RoleDetail;