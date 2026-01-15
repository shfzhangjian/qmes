/**
 * @file: src/components/Common/MenuPicker.jsx
 * @description: 通用菜单选择器
 * - [Data] 源自 menu.json
 * - [Feature] 支持单选 (Parent Menu) 和 多选 (Role Permissions)
 * - [UI] 树形结构，支持搜索
 */
import React, { useState, useEffect, useMemo } from 'react';
import BaseModal from './BaseModal';
import menuData from '../../data/menu.json';
import '../../styles/sys-comm-detail.css'; // 复用基础样式

const MenuPicker = ({
                        visible,
                        initialSelectedKeys = [], // 初始选中的 keys (path 或 id)
                        onClose,
                        onConfirm,
                        title = "选择菜单",
                        multiple = true // 默认多选
                    }) => {
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [flatTree, setFlatTree] = useState([]); // 用于搜索和联动的扁平数据
    const [treeData, setTreeData] = useState([]);

    // --- 1. 数据转换与初始化 ---
    useEffect(() => {
        if (visible) {
            const { tree, flat, allKeys } = transformData(menuData.menu);
            setTreeData(tree);
            setFlatTree(flat);
            setSelectedKeys(initialSelectedKeys || []);
            setKeyword('');
            // 默认展开所有一级模块
            setExpandedKeys(allKeys.filter(k => !k.includes('_g') && !k.includes('/')));
        }
    }, [visible, initialSelectedKeys]);

    // 将 menu.json 转换为标准 Tree 结构
    const transformData = (rawMenus) => {
        const tree = [];
        const flat = [];
        const allKeys = [];

        rawMenus.forEach(mod => {
            const modKey = mod.id; // 模块ID
            allKeys.push(modKey);

            const modNode = {
                key: modKey,
                title: mod.title,
                icon: mod.icon,
                type: 'MODULE',
                children: []
            };
            flat.push(modNode);

            mod.groups?.forEach((group, gIdx) => {
                const groupKey = `${modKey}_g${gIdx}`; // 分组ID
                allKeys.push(groupKey);

                const groupNode = {
                    key: groupKey,
                    title: group.title,
                    icon: 'ri-folder-3-line',
                    type: 'GROUP',
                    parentKey: modKey,
                    children: []
                };
                flat.push(groupNode);

                group.items?.forEach((item, iIdx) => {
                    // 使用 path 作为 key (如果是权限分配)，或者生成唯一ID
                    // 这里优先使用 path，如果 path 为空则生成 ID
                    const itemKey = item.path || `${groupKey}_m${iIdx}`;
                    allKeys.push(itemKey);

                    const itemNode = {
                        key: itemKey,
                        title: item.label,
                        icon: item.icon,
                        type: 'MENU',
                        parentKey: groupKey
                    };
                    flat.push(itemNode);
                    groupNode.children.push(itemNode);
                });

                modNode.children.push(groupNode);
            });

            tree.push(modNode);
        });

        return { tree, flat, allKeys };
    };

    // --- 2. 交互逻辑 ---
    const handleExpand = (e, key) => {
        e.stopPropagation();
        if (expandedKeys.includes(key)) {
            setExpandedKeys(prev => prev.filter(k => k !== key));
        } else {
            setExpandedKeys(prev => [...prev, key]);
        }
    };

    // 级联选择逻辑 (多选模式)
    const handleSelect = (node) => {
        if (multiple) {
            let newSelected = [...selectedKeys];
            const isSelected = newSelected.includes(node.key);

            if (isSelected) {
                // 取消选中：同时取消所有子节点
                const keysToRemove = getAllChildKeys(node);
                newSelected = newSelected.filter(k => !keysToRemove.includes(k));
            } else {
                // 选中：同时选中所有子节点
                const keysToAdd = getAllChildKeys(node);
                // 并集去重
                newSelected = [...new Set([...newSelected, ...keysToAdd])];
            }
            setSelectedKeys(newSelected);
        } else {
            // 单选模式
            setSelectedKeys([node.key]);
        }
    };

    // 获取节点及其所有子节点的 key
    const getAllChildKeys = (node) => {
        let keys = [node.key];
        if (node.children) {
            node.children.forEach(child => {
                keys = keys.concat(getAllChildKeys(child));
            });
        }
        return keys;
    };

    // --- 3. 渲染逻辑 ---
    const renderTreeNodes = (nodes, level = 0) => {
        return nodes.map(node => {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = expandedKeys.includes(node.key);
            const isSelected = selectedKeys.includes(node.key);

            // 搜索过滤：如果节点或其子节点包含关键字，则显示
            const isMatch = node.title.toLowerCase().includes(keyword.toLowerCase());
            // 简单的过滤展示逻辑：如果父节点不匹配但子节点匹配，父节点也要显示。
            // 这里简化为：只要 keyword 为空，或者 title 匹配，或者 children 中有匹配的，就渲染
            // 严谨的树过滤比较复杂，这里仅做简单的高亮匹配
            const highlight = keyword && isMatch;

            // 如果有 keyword，且当前节点不匹配且没有子节点匹配，隐藏 (简单处理)
            if (keyword && !isMatch && !hasChildrenMatch(node, keyword)) {
                return null;
            }

            return (
                <div key={node.key} className="menu-tree-node">
                    <div
                        className={`menu-node-content ${isSelected ? 'selected' : ''} ${multiple ? '' : 'single-mode'}`}
                        style={{ paddingLeft: `${level * 20 + 10}px` }}
                        onClick={() => handleSelect(node)}
                    >
                        {/* 展开/收缩图标 */}
                        <span
                            className={`expand-icon ${hasChildren ? (isExpanded ? 'open' : '') : 'hidden'}`}
                            onClick={(e) => hasChildren && handleExpand(e, node.key)}
                        >
                            <i className="ri-arrow-right-s-fill"></i>
                        </span>

                        {/* 复选框 (仅多选模式) */}
                        {multiple && (
                            <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                style={{marginRight: '8px', cursor: 'pointer'}}
                            />
                        )}

                        {/* 图标 */}
                        <i className={`node-icon ${node.icon}`} style={{color: highlight ? '#ff4d4f' : '#1890ff', marginRight:'6px'}}></i>

                        {/* 标题 */}
                        <span className="node-title" style={{color: highlight ? '#ff4d4f' : 'inherit', fontWeight: isSelected?500:400}}>
                            {node.title}
                        </span>

                        {/* 类型标签 */}
                        <span className={`node-tag ${node.type}`}>{node.type}</span>
                    </div>

                    {/* 子节点 */}
                    {hasChildren && (isExpanded || keyword) && (
                        <div className="menu-node-children">
                            {renderTreeNodes(node.children, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    const hasChildrenMatch = (node, kw) => {
        if (!node.children) return false;
        return node.children.some(child =>
            child.title.toLowerCase().includes(kw.toLowerCase()) || hasChildrenMatch(child, kw)
        );
    };

    const handleConfirmFn = () => {
        onConfirm(selectedKeys);
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
                    <div style={{flex:1, textAlign:'left', lineHeight:'32px', color:'#666', paddingLeft:'10px'}}>
                        已选: <span style={{fontWeight:'bold', color:'#1890ff'}}>{selectedKeys.length}</span> 项
                    </div>
                    <button className="btn outline" onClick={onClose}>取消</button>
                    <button className="btn btn-primary" onClick={handleConfirmFn}>确认</button>
                </div>
            }
        >
            <div className="menu-picker-container">
                <div className="search-bar" style={{padding: '10px 20px', borderBottom: '1px solid #eee'}}>
                    <input
                        className="std-input"
                        placeholder="搜索菜单名称..."
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                    />
                </div>
                <div className="tree-scroll-area" style={{height: '450px', overflowY: 'auto', padding: '10px 0'}}>
                    {renderTreeNodes(treeData)}
                </div>
            </div>

            <style>{`
                .menu-tree-node {
                    user-select: none;
                }
                .menu-node-content {
                    display: flex;
                    align-items: center;
                    padding: 6px 10px;
                    cursor: pointer;
                    transition: background 0.2s;
                    border-bottom: 1px solid transparent;
                }
                .menu-node-content:hover {
                    background-color: #f5f7fa;
                }
                .menu-node-content.selected.single-mode {
                    background-color: #e6f7ff;
                    color: #1890ff;
                }
                
                .expand-icon {
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #999;
                    cursor: pointer;
                    transition: transform 0.2s;
                    margin-right: 2px;
                }
                .expand-icon.open {
                    transform: rotate(90deg);
                    color: #333;
                }
                .expand-icon.hidden {
                    visibility: hidden;
                }
                
                .node-icon {
                    font-size: 16px;
                }
                
                .node-title {
                    margin-right: 8px;
                    flex: 1;
                    font-size: 13px;
                }

                .node-tag {
                    font-size: 10px;
                    padding: 1px 4px;
                    border-radius: 3px;
                    background: #f0f0f0;
                    color: #999;
                }
                .node-tag.MODULE { background: #e6f7ff; color: #1890ff; }
                .node-tag.GROUP { background: #fff7e6; color: #fa8c16; }
            `}</style>
        </BaseModal>
    );
};

export default MenuPicker;