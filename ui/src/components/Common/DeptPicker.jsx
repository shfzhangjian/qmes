/**
 * @file: src/components/Common/DeptPicker.jsx
 * @description: 通用部门选择器 (Department Picker)
 * - [Feature] 支持树形结构展示
 * - [Feature] 支持搜索过滤
 * - [Feature] 最近选择部门胶囊
 * - [Feature] 单选模式 (默认) / 多选模式 (可扩展)
 */
import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import '../../features/System/OrgList.css'; // 复用 OrgList 的树形样式
import '../../styles/sys-comm-detail.css'; // 复用通用样式

// --- 模拟组织数据 (与 OrgList.jsx 保持一致) ---
const MOCK_ORG_TREE = [
    {
        id: 'ORG-001', name: '禾臣新材料股份有限公司', code: 'HC-CORP', type: '公司',
        children: [
            {
                id: 'DEPT-GM', name: '总经办', code: 'GM-OFFICE', type: '部门',
                children: [
                    { id: 'SEC-HR', name: '人力资源部', code: 'HR-DEPT', type: '部门' },
                    { id: 'SEC-FIN', name: '财务部', code: 'FIN-DEPT', type: '部门' },
                    { id: 'SEC-IT', name: '信息技术部', code: 'IT-DEPT', type: '部门' }
                ]
            },
            {
                id: 'DEPT-PROD', name: '生产制造中心', code: 'MFG-CENTER', type: '中心',
                children: [
                    {
                        id: 'WS-01', name: '一车间(抛光垫)', code: 'WS-PAD', type: '车间',
                        children: [
                            { id: 'LINE-01', name: '配料工段', code: 'LINE-MIX', type: '工段' },
                            { id: 'LINE-02', name: '浇注工段', code: 'LINE-CAST', type: '工段' }
                        ]
                    },
                    { id: 'WS-02', name: '二车间(掩膜版)', code: 'WS-MASK', type: '车间' },
                    { id: 'WS-03', name: '三车间(研发试制)', code: 'WS-RND', type: '车间' }
                ]
            },
            {
                id: 'DEPT-ENG', name: '工程技术部', code: 'ENG-DEPT', type: '部门',
                children: [
                    { id: 'TEAM-PE', name: 'PE工艺组', code: 'TEAM-PE', type: '班组' },
                    { id: 'TEAM-ME', name: 'ME设备组', code: 'TEAM-ME', type: '班组' }
                ]
            },
            {
                id: 'DEPT-QM', name: '品质管理部', code: 'QM-DEPT', type: '部门',
                children: [
                    { id: 'TEAM-IQC', name: 'IQC进料检', code: 'QC-IN', type: '班组' },
                    { id: 'TEAM-OQC', name: 'OQC出货检', code: 'QC-OUT', type: '班组' }
                ]
            },
            { id: 'DEPT-PMC', name: '计划物控部', code: 'PMC-DEPT', type: '部门', children: [] },
            { id: 'DEPT-WH', name: '仓储物流部', code: 'WH-DEPT', type: '部门', children: [] },
            { id: 'DEPT-SALES', name: '销售部', code: 'SALES-DEPT', type: '部门', children: [] },
            { id: 'DEPT-PUR', name: '采购部', code: 'PUR-DEPT', type: '部门', children: [] }
        ]
    }
];

const DeptPicker = ({ visible, initialValue, onClose, onSelect, title = "选择所属部门" }) => {
    const [selectedId, setSelectedId] = useState(null);
    const [selectedName, setSelectedName] = useState('');
    const [keyword, setKeyword] = useState('');
    const [expandedKeys, setExpandedKeys] = useState(['ORG-001', 'DEPT-PROD', 'DEPT-ENG', 'DEPT-GM']); // 默认展开
    const [recentDepts, setRecentDepts] = useState([]);

    useEffect(() => {
        if (visible) {
            // 如果传入的是名称，尝试反查ID（这里简化处理，主要根据ID高亮）
            // 实际场景通常存ID，显名。这里假设 initialValue 可能是 name
            // 为了简化，我们主要依赖用户重新选择
            setSelectedId(null);
            setSelectedName(initialValue || '');
            setKeyword('');

            // 模拟从本地存储读取最近选择
            // const stored = JSON.parse(localStorage.getItem('recent_depts') || '[]');
            // setRecentDepts(stored.length ? stored : ['工程技术部', '品质管理部', '一车间(抛光垫)']);
            setRecentDepts(['工程技术部', '品质管理部', '一车间(抛光垫)']);
        }
    }, [visible, initialValue]);

    // --- 树形操作 ---
    const handleExpand = (e, nodeId) => {
        e.stopPropagation();
        if (expandedKeys.includes(nodeId)) {
            setExpandedKeys(prev => prev.filter(k => k !== nodeId));
        } else {
            setExpandedKeys(prev => [...prev, nodeId]);
        }
    };

    const handleNodeClick = (node) => {
        setSelectedId(node.id);
        setSelectedName(node.name);
    };

    // --- 最近选择操作 ---
    const handleRecentClick = (deptName) => {
        setSelectedName(deptName);
        // 这里为了简化，不反查ID高亮树节点，只设置选中名称
        setSelectedId(null);
    };

    // --- 递归渲染树节点 ---
    // filterData: 根据关键词过滤后的数据（简单实现：如果父节点匹配或子节点匹配都显示）
    // 这里为了保持树结构，仅做简单高亮，不破坏树结构
    const renderTree = (nodes, level = 0) => {
        return nodes.map(node => {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = expandedKeys.includes(node.id);
            const isSelected = selectedId === node.id || (selectedName && node.name === selectedName); // 支持按名称回显高亮
            const isMatch = keyword && node.name.toLowerCase().includes(keyword.toLowerCase());

            return (
                <div key={node.id} className="dept-tree-node">
                    <div
                        className={`dept-node-content ${isSelected ? 'selected' : ''}`}
                        style={{ paddingLeft: `${level * 20 + 10}px` }}
                        onClick={() => handleNodeClick(node)}
                    >
                        {/* 展开/收缩图标 */}
                        <span
                            className={`expand-icon ${hasChildren ? (isExpanded ? 'open' : '') : 'hidden'}`}
                            onClick={(e) => hasChildren && handleExpand(e, node.id)}
                        >
                            <i className="ri-arrow-right-s-fill"></i>
                        </span>

                        {/* 图标 */}
                        <i className={`node-type-icon ri-${
                            node.type==='公司'?'building-2-fill':
                                (node.type==='中心'?'community-line':
                                    (node.type==='部门'?'team-line':
                                        (node.type==='车间'?'macbook-line':
                                            (node.type==='班组'?'group-line':'user-line'))))
                        }`} style={{color: isMatch ? '#ff4d4f' : '#1890ff'}}></i>

                        {/* 名称 */}
                        <span className="node-name" style={{color: isMatch ? '#ff4d4f' : 'inherit'}}>
                            {node.name}
                        </span>
                        {/* 编码 */}
                        <span className="node-code">{node.code}</span>
                    </div>

                    {/* 子节点 */}
                    {hasChildren && isExpanded && (
                        <div className="dept-node-children">
                            {renderTree(node.children, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    const handleConfirm = () => {
        if (!selectedName) {
            alert('请选择一个部门');
            return;
        }

        // 更新最近选择 (模拟存储)
        const newRecent = [selectedName, ...recentDepts.filter(d => d !== selectedName)].slice(0, 3);
        // localStorage.setItem('recent_depts', JSON.stringify(newRecent));

        onSelect(selectedName); // 返回部门名称
        onClose();
    };

    return (
        <BaseModal
            visible={visible}
            title={title}
            width="500px"
            onClose={onClose}
            footer={
                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <div style={{flex:1, textAlign:'left', lineHeight:'32px', color:'#666', paddingLeft:'10px'}}>
                        已选: <span style={{fontWeight:'bold', color:'#1890ff'}}>{selectedName || '无'}</span>
                    </div>
                    <button className="btn outline" onClick={onClose}>取消</button>
                    <button className="btn btn-primary" onClick={handleConfirm}>确认</button>
                </div>
            }
        >
            <div className="dept-picker-container">
                <div className="search-bar" style={{padding: '10px 20px', borderBottom: '1px solid #eee'}}>
                    <input
                        className="std-input"
                        placeholder="输入部门名称搜索..."
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                    />

                    {/* 最近选择区域 */}
                    {recentDepts.length > 0 && (
                        <div style={{marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px'}}>
                            <span style={{color: '#999'}}>最近选择:</span>
                            {recentDepts.map(dept => (
                                <span
                                    key={dept}
                                    className="recent-dept-tag"
                                    onClick={() => handleRecentClick(dept)}
                                    style={{
                                        background: selectedName === dept ? '#e6f7ff' : '#f5f5f5',
                                        color: selectedName === dept ? '#1890ff' : '#666',
                                        border: selectedName === dept ? '1px solid #1890ff' : '1px solid #d9d9d9',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {dept}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="tree-scroll-area" style={{height: '350px', overflowY: 'auto', padding: '10px 0'}}>
                    {renderTree(MOCK_ORG_TREE)}
                </div>
            </div>

            <style>{`
                .dept-tree-node {
                    user-select: none;
                }
                .dept-node-content {
                    display: flex;
                    align-items: center;
                    padding: 8px 10px;
                    cursor: pointer;
                    transition: background 0.2s;
                    border-bottom: 1px solid transparent;
                }
                .dept-node-content:hover {
                    background-color: #f5f7fa;
                }
                .dept-node-content.selected {
                    background-color: #e6f7ff;
                    color: #1890ff;
                    font-weight: 500;
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
                    margin-right: 4px;
                }
                .expand-icon.open {
                    transform: rotate(90deg);
                    color: #333;
                }
                .expand-icon.hidden {
                    visibility: hidden;
                }
                .node-type-icon {
                    margin-right: 8px;
                    font-size: 16px;
                }
                .node-name {
                    margin-right: 10px;
                }
                .node-code {
                    font-size: 12px;
                    color: #999;
                    background: #f5f5f5;
                    padding: 1px 4px;
                    border-radius: 3px;
                }
                .recent-dept-tag:hover {
                    color: #1890ff !important;
                    border-color: #1890ff !important;
                }
            `}</style>
        </BaseModal>
    );
};

export default DeptPicker;