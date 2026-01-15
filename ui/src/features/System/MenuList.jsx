/**
 * @file: src/features/System/MenuList.jsx
 * @description: 系统菜单定义管理 (树形表格版 - 增强版)
 * - [Fix] 编辑模式下正确查找并传递父节点信息
 * - [Update] 批量移动使用 MenuPicker 选择目标父节点，并显示完整路径
 */
import React, { useState, useEffect } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import SmartForm from '../../components/Common/SmartForm';
import MenuDetail from './MenuDetail';
import BaseModal from '../../components/Common/BaseModal';
import MenuPicker from '../../components/Common/MenuPicker'; // 引入菜单选择器
import initialMenuData from '../../data/menu.json';
import '../../styles/sys-comm-detail.css';
import './MenuList.css';

// 角色代码转中文映射 (用于数据转换)
const ROLE_MAP = {
    'SUPER_ADMIN': '超级管理员',
    'ADM': '系统管理员',
    'MGR': '部门经理',
    'PE': '工艺工程师',
    'QC': '质检员',
    'PMC': '计划员',
    'WH': '仓管员',
    'ALL': '全员'
};

const MenuList = () => {
    const [treeData, setTreeData] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([]);

    const [detailVisible, setDetailVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [parentRecord, setParentRecord] = useState(null);

    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', content: '', onConfirm: null });

    const [moveModalVisible, setMoveModalVisible] = useState(false);
    const [targetParentId, setTargetParentId] = useState('');
    const [menuPickerVisible, setMenuPickerVisible] = useState(false); // 菜单选择器状态

    const [queryParams, setQueryParams] = useState({ keyword: '' });

    useEffect(() => {
        const transformedData = transformMenuData(initialMenuData.menu);
        setTreeData(transformedData);
        setExpandedKeys(transformedData.map(node => node.id));
    }, []);

    // 转换数据并将角色转为中文，同时生成 fullPath
    const transformMenuData = (menuArray) => {
        return menuArray.map(level1 => {
            const modulePath = level1.title;
            return {
                id: level1.id,
                name: level1.title,
                type: 'MODULE',
                icon: level1.icon,
                path: '',
                roles: level1.roles?.map(r => ROLE_MAP[r] || r) || [],
                status: '启用',
                fullPath: modulePath,
                children: level1.groups?.map((group, gIdx) => {
                    const groupPath = `${modulePath} > ${group.title || '分组'}`;
                    return {
                        id: `${level1.id}_g${gIdx}`,
                        name: group.title || '未命名分组',
                        type: 'GROUP',
                        icon: 'ri-folder-line',
                        path: '',
                        roles: [],
                        status: '启用',
                        fullPath: groupPath,
                        children: group.items?.map((item, iIdx) => {
                            const menuPath = `${groupPath} > ${item.label}`;
                            return {
                                id: `${level1.id}_g${gIdx}_m${iIdx}`,
                                name: item.label,
                                type: 'MENU',
                                icon: item.icon,
                                path: item.path,
                                roles: item.roles?.map(r => ROLE_MAP[r] || r) || [],
                                desc: item.desc,
                                status: '启用',
                                fullPath: menuPath,
                                children: []
                            };
                        })
                    };
                })
            };
        });
    };

    // --- 核心辅助函数：递归查找父节点 ---
    const findParentNode = (nodes, targetId, parent = null) => {
        for (const node of nodes) {
            if (node.id === targetId) {
                return parent;
            }
            if (node.children && node.children.length > 0) {
                const found = findParentNode(node.children, targetId, node);
                if (found !== undefined) return found;
            }
        }
        return undefined;
    };

    // --- 辅助函数：根据ID查找节点 (用于获取详情如 fullPath) ---
    const findNode = (nodes, id) => {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children && node.children.length > 0) {
                const found = findNode(node.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    // --- 交互逻辑 ---
    const handleExpand = (id) => {
        setExpandedKeys(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);
    };

    const handleSelect = (id) => {
        setSelectedKeys(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = [];
            const traverse = (nodes) => {
                nodes.forEach(n => {
                    allIds.push(n.id);
                    if (n.children) traverse(n.children);
                });
            };
            traverse(treeData);
            setSelectedKeys(allIds);
        } else {
            setSelectedKeys([]);
        }
    };

    // --- 增删改查 ---
    const handleEdit = (record) => {
        const parent = findParentNode(treeData, record.id);
        setCurrentRecord(record);
        setParentRecord(parent);
        setDetailVisible(true);
    };

    const handleAdd = (parent) => {
        setCurrentRecord(null);
        setParentRecord(parent);
        setDetailVisible(true);
    };

    const openConfirm = (title, content, onConfirm) => {
        setConfirmConfig({ title, content, onConfirm });
        setConfirmVisible(true);
    };

    const handleBatchDelete = () => {
        if (selectedKeys.length === 0) return alert('请先选择要删除的项');
        openConfirm('确认删除', `您确定要删除选中的 ${selectedKeys.length} 个菜单项及其子节点吗？`, () => {
            const deleteNodes = (nodes) => {
                return nodes.filter(n => !selectedKeys.includes(n.id)).map(n => ({
                    ...n,
                    children: n.children ? deleteNodes(n.children) : []
                }));
            };
            setTreeData(prev => deleteNodes(prev));
            setSelectedKeys([]);
            setConfirmVisible(false);
            alert('删除成功');
        });
    };

    const handleDelete = (id) => {
        openConfirm('确认删除', '确认删除该节点及其子节点吗？', () => {
            const deleteNodes = (nodes) => {
                return nodes.filter(n => n.id !== id).map(n => ({
                    ...n,
                    children: n.children ? deleteNodes(n.children) : []
                }));
            };
            setTreeData(prev => deleteNodes(prev));
            setConfirmVisible(false);
        });
    };

    const handleBatchStatus = (status) => {
        if (selectedKeys.length === 0) return alert('请先选择要操作的项');
        openConfirm(`确认${status}`, `确定将选中的 ${selectedKeys.length} 个菜单状态设置为“${status}”吗？`, () => {
            const updateStatus = (nodes) => {
                return nodes.map(n => ({
                    ...n,
                    status: selectedKeys.includes(n.id) ? status : n.status,
                    children: n.children ? updateStatus(n.children) : []
                }));
            };
            setTreeData(prev => updateStatus(prev));
            setSelectedKeys([]);
            setConfirmVisible(false);
        });
    };

    // --- 移动菜单逻辑 ---
    const handleBatchMove = () => {
        if (selectedKeys.length === 0) return alert('请先选择要移动的项');
        setTargetParentId('');
        setMoveModalVisible(true);
    };

    const confirmMove = () => {
        if (!targetParentId) return alert('请选择目标父节点');
        // 实际逻辑中需要检查 targetParentId 是否为 selectedKeys 的子节点，防止循环
        alert(`已将 ${selectedKeys.length} 个菜单移动到目标节点 (ID: ${targetParentId}) 下。`);
        setMoveModalVisible(false);
        setSelectedKeys([]);
    };

    const handleTargetMenuSelect = (keys) => {
        if (keys && keys.length > 0) {
            setTargetParentId(keys[0]);
        }
        setMenuPickerVisible(false);
    };

    const handleMoveOrder = (node, direction, siblings) => {
        const index = siblings.findIndex(n => n.id === node.id);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === siblings.length - 1) return;

        const newSiblings = [...siblings];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newSiblings[index], newSiblings[swapIndex]] = [newSiblings[swapIndex], newSiblings[index]];

        const updateTree = (nodes) => {
            if (nodes.some(n => n.id === node.id)) {
                return newSiblings;
            }
            return nodes.map(n => ({
                ...n,
                children: n.children ? updateTree(n.children) : []
            }));
        };
        setTreeData(prev => updateTree(prev));
    };

    const handleSubmit = (formData) => {
        console.log('Save:', formData);
        setDetailVisible(false);
    };

    const renderRows = (nodes, level = 0, siblings = []) => {
        return nodes.map((node, index) => {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = expandedKeys.includes(node.id);
            const indentSize = 24;

            const typeConfig = {
                'MODULE': { color: 'blue', label: '模块', icon: 'ri-apps-line' },
                'GROUP':  { color: 'orange', label: '分组', icon: 'ri-folder-3-line' },
                'MENU':   { color: 'green', label: '菜单', icon: 'ri-menu-line' },
                'BUTTON': { color: 'cyan', label: '按钮', icon: 'ri-cursor-line' }
            };
            const typeInfo = typeConfig[node.type] || { color: 'default', label: node.type, icon: 'ri-file-line' };

            return (
                <React.Fragment key={node.id}>
                    <tr className={`org-row level-${level} ${selectedKeys.includes(node.id) ? 'selected-row' : ''}`}>
                        <td className="center">
                            <input type="checkbox" checked={selectedKeys.includes(node.id)} onChange={() => handleSelect(node.id)} />
                        </td>
                        <td className="org-name-cell">
                            <div style={{ paddingLeft: `${level * indentSize + 10}px` }} className="org-name-wrapper">
                                {hasChildren ? (
                                    <span className={`expand-icon ${isExpanded ? 'open' : ''}`} onClick={() => handleExpand(node.id)}>
                                        <i className="ri-arrow-right-s-fill"></i>
                                    </span>
                                ) : (
                                    <span className="expand-placeholder"></span>
                                )}
                                <i className={`node-type-icon ${node.icon || typeInfo.icon}`} style={{color: node.type==='BUTTON'?'#999':'#1890ff'}}></i>
                                <span className="node-name" style={{fontWeight: node.type==='MODULE'?600:400}}>{node.name}</span>
                            </div>
                        </td>
                        <td className="center"><span className={`q-tag ${typeInfo.color}`}>{typeInfo.label}</span></td>
                        <td><span className="code-text">{node.type === 'BUTTON' ? node.perm : node.path}</span></td>
                        <td>
                            <div style={{display:'flex', gap:'4px', flexWrap:'wrap'}}>
                                {node.roles?.slice(0, 2).map(r => <span key={r} className="q-tag">{r}</span>)}
                                {node.roles?.length > 2 && <span className="q-tag">...</span>}
                            </div>
                        </td>
                        <td className="center"><span className={`status-badge ${node.status==='启用'?'success':'disabled'}`}>{node.status}</span></td>
                        <td className="center">
                            <div className="sort-actions">
                                <i className={`ri-arrow-up-line ${index === 0 ? 'disabled' : ''}`} onClick={() => handleMoveOrder(node, 'up', nodes)} title="上移"></i>
                                <i className={`ri-arrow-down-line ${index === nodes.length - 1 ? 'disabled' : ''}`} onClick={() => handleMoveOrder(node, 'down', nodes)} title="下移"></i>
                            </div>
                        </td>
                        <td>
                            <div className="action-group nowrap">
                                <button className="mini-btn" onClick={() => handleEdit(node)}>编辑</button>
                                <button className="mini-btn primary" onClick={() => handleAdd(node)}>+下级</button>
                                <button className="mini-btn danger" onClick={() => handleDelete(node.id)}>删</button>
                            </div>
                        </td>
                    </tr>
                    {hasChildren && isExpanded && renderRows(node.children, level + 1, node.children)}
                </React.Fragment>
            );
        });
    };

    // 获取选中目标节点的完整路径，用于显示
    const targetNode = findNode(treeData, targetParentId);
    const targetDisplayText = targetNode ? (targetNode.fullPath || targetNode.name) : targetParentId;

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[{ label: '菜单名称', name: 'keyword', placeholder: '搜索菜单...' }]}
                    data={queryParams} onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{fontWeight:'bold'}}>开发调试 &gt; 系统菜单定义</div>
                    <div style={{display:'flex', gap:'10px'}}>
                        {selectedKeys.length > 0 && (
                            <>
                                <button className="btn outline" onClick={handleBatchMove}><i className="ri-drag-move-line"></i> 移动</button>
                                <button className="btn outline" onClick={() => handleBatchStatus('启用')}>启用</button>
                                <button className="btn outline" onClick={() => handleBatchStatus('停用')}>停用</button>
                                <button className="btn outline" style={{color:'#ff4d4f', borderColor:'#ff4d4f'}} onClick={handleBatchDelete}><i className="ri-delete-bin-line"></i> 删除</button>
                            </>
                        )}
                        <button className="btn outline" onClick={() => setExpandedKeys([])}>全部折叠</button>
                        <button className="btn btn-primary" onClick={() => handleAdd(null)}><i className="ri-add-line"></i> 新增根节点</button>
                    </div>
                </>
            }
        >
            <div className="org-table-wrapper">
                <div className="org-table-scroll">
                    <table className="org-table">
                        <thead>
                        <tr>
                            <th width="40" className="center"><input type="checkbox" onChange={handleSelectAll} /></th>
                            <th style={{width:'280px', paddingLeft:'40px'}}>菜单名称</th>
                            <th style={{width:'80px'}} className="center">类型</th>
                            <th style={{width:'220px'}}>路由路径 / 权限标识</th>
                            <th>访问角色</th>
                            <th style={{width:'80px'}} className="center">状态</th>
                            <th style={{width:'80px'}} className="center">排序</th>
                            <th style={{width:'160px'}}>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        {renderRows(treeData, 0, treeData)}
                        </tbody>
                    </table>
                </div>
            </div>

            <MenuDetail
                visible={detailVisible}
                record={currentRecord}
                parent={parentRecord}
                onClose={() => setDetailVisible(false)}
                onSubmit={handleSubmit}
            />

            {/* 确认对话框 */}
            <BaseModal
                visible={confirmVisible}
                title={confirmConfig.title}
                width="400px"
                onClose={() => setConfirmVisible(false)}
                footer={<div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}><button className="btn outline" onClick={() => setConfirmVisible(false)}>取消</button><button className="btn btn-primary" onClick={confirmConfig.onConfirm}>确定</button></div>}
            >
                <div style={{padding:'20px', display:'flex', alignItems:'start', gap:'10px'}}>
                    <i className="ri-question-line" style={{fontSize:'24px', color:'#faad14'}}></i>
                    <div style={{marginTop:'2px', lineHeight:'1.5', color:'#333'}}>{confirmConfig.content}</div>
                </div>
            </BaseModal>

            {/* 移动菜单弹窗 */}
            <BaseModal
                visible={moveModalVisible}
                title={`批量移动 (${selectedKeys.length} 项)`}
                width="500px"
                onClose={() => setMoveModalVisible(false)}
                footer={
                    <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                        <button className="btn outline" onClick={() => setMoveModalVisible(false)}>取消</button>
                        <button className="btn btn-primary" onClick={confirmMove}>开始移动</button>
                    </div>
                }
            >
                <div style={{padding:'20px'}}>
                    <div className="form-item">
                        <label className="required">目标父节点</label>
                        <div style={{display: 'flex', gap: '8px'}}>
                            <input
                                className="std-input"
                                placeholder="请选择目标模块或分组"
                                value={targetDisplayText}
                                readOnly
                                onClick={() => setMenuPickerVisible(true)}
                                style={{cursor:'pointer', backgroundColor: '#fff'}}
                            />
                            <button className="mini-btn outline" onClick={() => setMenuPickerVisible(true)}>
                                <i className="ri-node-tree"></i> 选择
                            </button>
                        </div>
                        <div style={{fontSize:'12px', color:'#999', marginTop:'8px'}}>* 将选中的菜单项移动到该节点下作为子菜单。</div>
                    </div>
                </div>
            </BaseModal>

            {/* 菜单选择器 (单选模式) */}
            <MenuPicker
                visible={menuPickerVisible}
                title="选择目标父节点"
                multiple={false}
                initialSelectedKeys={targetParentId ? [targetParentId] : []}
                onClose={() => setMenuPickerVisible(false)}
                onConfirm={handleTargetMenuSelect}
            />
        </PageLayout>
    );
};

export default MenuList;