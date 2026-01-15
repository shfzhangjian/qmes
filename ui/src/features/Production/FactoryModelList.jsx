/**
 * @file: src/features/Production/FactoryModelList.jsx
 * @description: 工厂物理建模 (Factory Modeling) - 树形表格增强版
 * - [Update] 拆分详情弹窗到 FactoryModelDetail.jsx
 * - [Update] 引入 FactoryModelDetail 组件
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import SmartForm from '../../components/Common/SmartForm';
import FactoryModelDetail from './FactoryModelDetail'; // 引入独立详情组件
import './FactoryModelList.css'; // 复用系统组织架构的树形表格样式

const FactoryModelList = () => {
    // --- 状态管理 ---
    const [queryParams, setQueryParams] = useState({ keyword: '', type: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [parentNode, setParentNode] = useState(null); // 新增：记录父节点信息
    const [expandedRowKeys, setExpandedRowKeys] = useState(['FAC-SZ01', 'WS-PUR-01', 'WS-CAST-02']);

    // --- 模拟数据 ---
    const [treeData, setTreeData] = useState([
        {
            id: 'FAC-SZ01', name: '禾臣新材料(苏州)工厂', type: '工厂', env: '普通', status: '正常', manager: '张厂长',
            children: [
                {
                    id: 'WS-PUR-01', name: '配料合成车间', type: '车间', env: 'Class 10000', manager: '李主任',
                    children: [
                        {
                            id: 'LINE-PRE-A', name: '预聚体合成线 A', type: '产线', equipCount: 5, status: '运行中',
                            children: [
                                { id: 'ST-MIX-A1', name: '预混工位 A1', type: '工位', status: '正常' },
                                { id: 'ST-REACT-A2', name: '反应工位 A2', type: '工位', status: '正常' }
                            ]
                        },
                        {
                            id: 'LINE-PRE-B', name: '预聚体合成线 B', type: '产线', equipCount: 5, status: '维护中',
                            children: []
                        }
                    ]
                },
                {
                    id: 'WS-CAST-02', name: '精密成型车间', type: '车间', env: 'Class 1000', manager: '王主任',
                    children: [
                        {
                            id: 'LINE-CAST-01', name: '抛光垫浇注线 01', type: '产线', equipCount: 8, status: '运行中',
                            children: [
                                { id: 'ST-MOLD-01', name: '模具准备工位', type: '工位', status: '正常' },
                                { id: 'ST-POUR-01', name: '浇注工位', type: '工位', status: '正常' },
                                { id: 'ST-OVEN-01', name: '固化炉 A', type: '工位', status: '正常' }
                            ]
                        },
                        {
                            id: 'LINE-CAST-02', name: '抛光垫浇注线 02', type: '产线', equipCount: 8, status: '运行中', children: []
                        },
                        { id: 'LINE-CAST-03', name: '抛光垫浇注线 03 (备用)', type: '产线', equipCount: 8, status: '停用', children: [] }
                    ]
                },
                {
                    id: 'WS-POST-03', name: '后道加工车间', type: '车间', env: 'Class 100', manager: '赵主任',
                    children: [
                        { id: 'LINE-CNC-01', name: '精密开槽线', type: '产线', equipCount: 12, status: '运行中', children: [] },
                        { id: 'LINE-LAM-01', name: '无尘贴合/清洗线', type: '产线', equipCount: 6, status: '运行中', children: [] },
                        { id: 'LINE-PACK-01', name: '洁净包装线', type: '产线', equipCount: 4, status: '运行中', children: [] }
                    ]
                }
            ]
        },
        {
            id: 'FAC-WH01', name: '禾臣新材料(芜湖)基地', type: '工厂', env: 'Class 10', status: '试运行', manager: '周厂长',
            children: [
                {
                    id: 'WS-MSK-01', name: '光刻车间', type: '车间', env: 'Class 10', manager: '吴博士',
                    children: [
                        { id: 'LINE-LITHO-01', name: '光刻线 01', type: '产线', equipCount: 3, status: '调试', children: [] },
                        { id: 'LINE-ETCH-01', name: '蚀刻线 01', type: '产线', equipCount: 2, status: '调试', children: [] }
                    ]
                },
                { id: 'WS-TEST-01', name: '检测中心', type: '车间', env: 'Class 100', manager: '郑经理', children: [] }
            ]
        }
    ]);

    // --- 辅助函数：查找父节点 ---
    // 为了在编辑时也能显示上级信息，简单实现一个查找逻辑
    const findParentNode = (nodes, targetId, parent = null) => {
        for (const node of nodes) {
            if (node.id === targetId) return parent;
            if (node.children && node.children.length > 0) {
                const found = findParentNode(node.children, targetId, node);
                if (found) return found;
            }
        }
        return null;
    };

    // --- 交互逻辑 ---
    const handleExpand = (id) => {
        const keys = [...expandedRowKeys];
        const index = keys.indexOf(id);
        if (index > -1) {
            keys.splice(index, 1);
        } else {
            keys.push(id);
        }
        setExpandedRowKeys(keys);
    };

    const handleEdit = (node) => {
        const parent = findParentNode(treeData, node.id);
        setCurrentRecord(node);
        setParentNode(parent);
        setModalVisible(true);
    };

    const handleAdd = (parent) => {
        setCurrentRecord(null);
        setParentNode(parent);
        setModalVisible(true);
    };

    const handleSubmit = (data) => {
        console.log('保存工厂模型:', data);
        setModalVisible(false);
        // 这里应添加实际的数据更新逻辑
    };

    // --- 递归渲染表格行 ---
    const renderRows = (nodes, level = 0) => {
        return nodes.map(node => {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = expandedRowKeys.includes(node.id);
            const indentSize = 24;

            // 类型配置
            const typeConfig = {
                '工厂': { icon: 'building-2-fill', color: 'primary' },
                '车间': { icon: 'community-line', color: 'purple' },
                '产线': { icon: 'node-tree', color: 'warning' },
                '工位': { icon: 'macbook-line', color: 'default' }
            };
            const typeInfo = typeConfig[node.type] || { icon: 'file-line', color: 'default' };

            return (
                <React.Fragment key={node.id}>
                    <tr className={`org-row level-${level} ${isExpanded ? 'expanded' : ''}`}>
                        {/* 树形名称列 */}
                        <td className="org-name-cell">
                            <div style={{ paddingLeft: `${level * indentSize + 10}px` }} className="org-name-wrapper">
                                {/* 展开/收缩图标 */}
                                {hasChildren ? (
                                    <span
                                        className={`expand-icon ${isExpanded ? 'open' : ''}`}
                                        onClick={() => handleExpand(node.id)}
                                    >
                                        <i className="ri-arrow-right-s-fill"></i>
                                    </span>
                                ) : (
                                    <span className="expand-placeholder"></span>
                                )}

                                {/* 节点类型图标 */}
                                <i className={`node-type-icon ri-${typeInfo.icon}`} style={{color: node.type==='工位'?'#999':'#1890ff'}}></i>

                                <span className="node-name">{node.name}</span>
                            </div>
                        </td>

                        <td><span className="code-text">{node.id}</span></td>

                        <td className="center">
                            <span className={`q-tag ${typeInfo.color}`}>{node.type}</span>
                        </td>

                        {/* 洁净度高亮 */}
                        <td>
                            {node.env && node.env.includes('Class') ?
                                <span className="q-tag success" style={{fontSize:'11px'}}>{node.env}</span> :
                                <span style={{color:'#999'}}>{node.env || '-'}</span>
                            }
                        </td>

                        <td>{node.manager || '-'}</td>
                        <td className="center">{node.equipCount ? `${node.equipCount}` : '-'}</td>

                        <td className="center">
                            <span className={`status-badge ${node.status==='正常'||node.status==='运行中' ? 'success' : (node.status==='维护中'?'warning':'disabled')}`}>
                                {node.status}
                            </span>
                        </td>

                        <td>
                            <div className="action-group nowrap">
                                <button className="mini-btn" onClick={()=>handleEdit(node)}>编辑</button>
                                {node.type !== '工位' && (
                                    <button className="mini-btn primary" onClick={()=>handleAdd(node)}>+下级</button>
                                )}
                                <button className="mini-btn danger">删</button>
                            </div>
                        </td>
                    </tr>
                    {/* 递归渲染子节点 */}
                    {hasChildren && isExpanded && renderRows(node.children, level + 1)}
                </React.Fragment>
            );
        });
    };

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '名称/编码', span: 1 },
                        { label: '节点类型', name: 'type', type: 'select', options: [{label:'工厂',value:'工厂'},{label:'车间',value:'车间'},{label:'产线',value:'产线'}], span: 1 },
                    ]}
                    data={queryParams}
                    onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{ fontWeight: 'bold' }}>生产基础 &gt; 工厂建模</div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button className="btn outline" onClick={() => setExpandedRowKeys([])}>全部折叠</button>
                        <button className="btn btn-primary" onClick={()=>handleAdd(null)}>
                            <i className="ri-add-line"></i> 新建工厂
                        </button>
                    </div>
                </>
            }
        >
            <div className="org-table-wrapper">
                <div className="org-table-scroll">
                    <table className="org-table">
                        <thead>
                        <tr>
                            <th style={{width:'320px', paddingLeft:'40px'}}>组织名称</th>
                            <th style={{width:'150px'}}>编码</th>
                            <th style={{width:'80px'}} className="center">类型</th>
                            <th style={{width:'150px'}}>环境等级 (洁净度)</th>
                            <th style={{width:'100px'}}>负责人</th>
                            <th style={{width:'80px'}} className="center">设备数</th>
                            <th style={{width:'100px'}} className="center">状态</th>
                            <th style={{width:'160px'}}>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        {renderRows(treeData)}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 独立的详情弹窗组件 */}
            <FactoryModelDetail
                visible={modalVisible}
                record={currentRecord}
                parentNode={parentNode}
                onClose={() => setModalVisible(false)}
                onSubmit={handleSubmit}
            />
        </PageLayout>
    );
};

export default FactoryModelList;