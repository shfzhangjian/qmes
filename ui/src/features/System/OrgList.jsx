/**
 * @file: src/features/System/OrgList.jsx
 * @description: 企业组织架构管理
 * - [Data] 增加 fullPath 字段生成逻辑，用于详情页显示完整路径
 * - [Logic] 编辑时自动查找父节点信息
 */
import React, { useState, useEffect } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import SmartForm from '../../components/Common/SmartForm';
import OrgDetail from './OrgDetail';
import '../../styles/components.css';
import './OrgList.css';

const OrgList = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [parentNode, setParentNode] = useState(null);
    const [queryParams, setQueryParams] = useState({ keyword: '', status: '' });

    const [expandedRowKeys, setExpandedRowKeys] = useState([]);
    const [treeData, setTreeData] = useState([]);

    // --- 初始模拟数据 ---
    const rawTreeData = [
        {
            id: 'ORG-001', name: '禾臣新材料股份有限公司', code: 'HC-CORP', type: '公司', leader: '董事长', phone: '0512-88888888', status: '启用',
            children: [
                {
                    id: 'DEPT-GM', name: '总经办', code: 'GM-OFFICE', type: '部门', leader: '总经理', phone: '8001', status: '启用',
                    children: [
                        { id: 'SEC-HR', name: '人力资源部', code: 'HR-DEPT', type: '部门', leader: '李HR', phone: '8002', status: '启用' },
                        { id: 'SEC-FIN', name: '财务部', code: 'FIN-DEPT', type: '部门', leader: '王财务', phone: '8003', status: '启用' },
                        { id: 'SEC-IT', name: '信息技术部', code: 'IT-DEPT', type: '部门', leader: '张IT', phone: '8004', status: '启用' }
                    ]
                },
                {
                    id: 'DEPT-PROD', name: '生产制造中心', code: 'MFG-CENTER', type: '中心', leader: '王生产', phone: '8100', status: '启用',
                    children: [
                        {
                            id: 'WS-01', name: '一车间(抛光垫)', code: 'WS-PAD', type: '车间', leader: '赵车间', phone: '8101', status: '启用',
                            children: [
                                { id: 'LINE-01', name: '配料工段', code: 'LINE-MIX', type: '工段', leader: '班长A', phone: '-', status: '启用' },
                                { id: 'LINE-02', name: '浇注工段', code: 'LINE-CAST', type: '工段', leader: '班长B', phone: '-', status: '启用' },
                                { id: 'LINE-03', name: '后处理工段', code: 'LINE-POST', type: '工段', leader: '班长C', phone: '-', status: '启用' },
                                { id: 'LINE-04', name: '包装工段', code: 'LINE-PACK', type: '工段', leader: '班长D', phone: '-', status: '启用' }
                            ]
                        },
                        {
                            id: 'WS-02', name: '二车间(掩膜版)', code: 'WS-MASK', type: '车间', leader: '钱车间', phone: '8102', status: '启用',
                            children: [
                                { id: 'LINE-05', name: '清洗工段', code: 'LINE-CLEAN', type: '工段', leader: '班长E', phone: '-', status: '启用' },
                                { id: 'LINE-06', name: '光刻工段', code: 'LINE-LITHO', type: '工段', leader: '班长F', phone: '-', status: '启用' }
                            ]
                        },
                        { id: 'WS-03', name: '三车间(研发试制)', code: 'WS-RND', type: '车间', leader: '孙车间', phone: '8103', status: '启用' }
                    ]
                },
                {
                    id: 'DEPT-ENG', name: '工程技术部', code: 'ENG-DEPT', type: '部门', leader: '张工艺', phone: '8200', status: '启用',
                    children: [
                        { id: 'TEAM-PE', name: 'PE工艺组', code: 'TEAM-PE', type: '班组', leader: '李PE', phone: '8201', status: '启用' },
                        { id: 'TEAM-ME', name: 'ME设备组', code: 'TEAM-ME', type: '班组', leader: '周ME', phone: '8202', status: '启用' },
                        { id: 'TEAM-IE', name: 'IE工业工程组', code: 'TEAM-IE', type: '班组', leader: '吴IE', phone: '8203', status: '启用' }
                    ]
                },
                {
                    id: 'DEPT-QM', name: '品质管理部', code: 'QM-DEPT', type: '部门', leader: '孙品质', phone: '8300', status: '启用',
                    children: [
                        { id: 'TEAM-IQC', name: 'IQC进料检', code: 'QC-IN', type: '班组', leader: '-', phone: '-', status: '启用' },
                        { id: 'TEAM-IPQC', name: 'IPQC过程检', code: 'QC-PROC', type: '班组', leader: '-', phone: '-', status: '启用' },
                        { id: 'TEAM-OQC', name: 'OQC出货检', code: 'QC-OUT', type: '班组', leader: '-', phone: '-', status: '启用' },
                        { id: 'TEAM-LAB', name: '实验室', code: 'QC-LAB', type: '班组', leader: '-', phone: '-', status: '启用' }
                    ]
                },
                {
                    id: 'DEPT-PMC', name: '计划物控部', code: 'PMC-DEPT', type: '部门', leader: '吴计划', phone: '8400', status: '启用',
                    children: [
                        { id: 'TEAM-PLAN', name: '计划组', code: 'PMC-PLAN', type: '班组', leader: '-', phone: '-', status: '启用' },
                        { id: 'TEAM-MAT', name: '物控组', code: 'PMC-MAT', type: '班组', leader: '-', phone: '-', status: '启用' }
                    ]
                },
                {
                    id: 'DEPT-WH', name: '仓储物流部', code: 'WH-DEPT', type: '部门', leader: '郑仓库', phone: '8500', status: '启用',
                    children: [
                        { id: 'WH-RAW', name: '原料仓', code: 'WH-01', type: '仓库', leader: '-', phone: '-', status: '启用' },
                        { id: 'WH-FG', name: '成品仓', code: 'WH-02', type: '仓库', leader: '-', phone: '-', status: '启用' },
                        { id: 'WH-WIP', name: '半成品仓', code: 'WH-03', type: '仓库', leader: '-', phone: '-', status: '启用' }
                    ]
                },
                {
                    id: 'DEPT-SALES', name: '销售部', code: 'SALES-DEPT', type: '部门', leader: '刘销售', phone: '8600', status: '启用', children: []
                },
                {
                    id: 'DEPT-PUR', name: '采购部', code: 'PUR-DEPT', type: '部门', leader: '陈采购', phone: '8700', status: '启用', children: []
                }
            ]
        }
    ];

    // --- 1. 数据转换：生成 fullPath ---
    const transformOrgData = (nodes, parentPath = '') => {
        return nodes.map(node => {
            const currentPath = parentPath ? `${parentPath} / ${node.name}` : node.name;
            return {
                ...node,
                fullPath: currentPath,
                children: node.children ? transformOrgData(node.children, currentPath) : []
            };
        });
    };

    useEffect(() => {
        const transformed = transformOrgData(rawTreeData);
        setTreeData(transformed);
        // 默认展开前两级
        setExpandedRowKeys(['ORG-001', 'DEPT-PROD', 'DEPT-ENG', 'DEPT-QM', 'WS-01', 'WS-02']);
    }, []);

    // --- 辅助函数：查找父节点 ---
    const findParentNode = (nodes, targetId, parent = null) => {
        for (const node of nodes) {
            if (node.id === targetId) {
                return parent;
            }
            if (node.children && node.children.length > 0) {
                const found = findParentNode(node.children, targetId, node);
                if (found) return found;
            }
        }
        return null;
    };

    // --- 交互逻辑 ---
    const handleExpand = (recordId) => {
        const keys = [...expandedRowKeys];
        const index = keys.indexOf(recordId);
        if (index > -1) {
            keys.splice(index, 1);
        } else {
            keys.push(recordId);
        }
        setExpandedRowKeys(keys);
    };

    const handleEdit = (r) => {
        // 查找父节点，以便在详情页显示完整的上级路径
        const parent = findParentNode(treeData, r.id);
        setCurrentRecord(r);
        setParentNode(parent);
        setModalVisible(true);
    };

    const handleAdd = (parent) => {
        setCurrentRecord(null);
        setParentNode(parent);
        setModalVisible(true);
    };

    const handleSubmit = (data) => {
        console.log('保存组织数据:', data);
        setModalVisible(false);
    };

    const renderRows = (nodes, level = 0) => {
        return nodes.map(node => {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = expandedRowKeys.includes(node.id);
            const indentSize = 24;

            return (
                <React.Fragment key={node.id}>
                    <tr className={`org-row level-${level} ${isExpanded ? 'expanded' : ''}`}>
                        <td className="org-name-cell">
                            <div style={{ paddingLeft: `${level * indentSize}px` }} className="org-name-wrapper">
                                {hasChildren ? (
                                    <span className={`expand-icon ${isExpanded ? 'open' : ''}`} onClick={() => handleExpand(node.id)}>
                                        <i className="ri-arrow-right-s-fill"></i>
                                    </span>
                                ) : (
                                    <span className="expand-placeholder"></span>
                                )}
                                <i className={`node-type-icon ri-${
                                    node.type==='公司'?'building-2-fill':
                                        (node.type==='中心'?'community-line':
                                            (node.type==='部门'?'team-line':
                                                (node.type==='车间'?'macbook-line':
                                                    (node.type==='仓库'?'store-3-line':'group-line'))))
                                }`} />
                                <span className="node-name">{node.name}</span>
                            </div>
                        </td>
                        <td><span className="code-text">{node.code}</span></td>
                        <td><span className={`q-tag ${node.type==='公司'?'primary':(node.type==='中心'?'purple':'default')}`}>{node.type}</span></td>
                        <td>{node.leader}</td>
                        <td>{node.phone}</td>
                        <td className="center">
                            <span className={`status-badge ${node.status==='启用'?'success':'disabled'}`}>{node.status}</span>
                        </td>
                        <td>
                            <div className="action-group">
                                <button className="mini-btn" onClick={()=>handleEdit(node)}>编辑</button>
                                <button className="mini-btn primary" onClick={()=>handleAdd(node)}>+ 下级</button>
                                {level > 0 && <button className="mini-btn danger">删除</button>}
                            </div>
                        </td>
                    </tr>
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
                        { label: '组织名称', name: 'keyword', placeholder: '输入名称查询' },
                        { label: '状态', name: 'status', type: 'select', options: [{label:'启用',value:'启用'},{label:'停用',value:'停用'}] }
                    ]}
                    data={queryParams} onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{fontWeight:'bold'}}>系统管理 &gt; 企业组织架构</div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button className="btn outline" onClick={() => setExpandedRowKeys([])}>全部收起</button>
                        <button className="btn btn-primary" onClick={()=>handleAdd(null)}><i className="ri-add-line"></i> 新增一级组织</button>
                    </div>
                </>
            }
        >
            <div className="org-table-wrapper">
                <div className="org-table-scroll">
                    <table className="org-table">
                        <thead>
                        <tr>
                            <th style={{width:'380px', paddingLeft:'40px'}}>组织名称</th>
                            <th style={{width:'150px'}}>组织编码</th>
                            <th style={{width:'100px'}}>类型</th>
                            <th style={{width:'120px'}}>负责人</th>
                            <th style={{width:'150px'}}>联系电话</th>
                            <th style={{width:'80px'}} className="center">状态</th>
                            <th style={{width:'180px'}}>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        {renderRows(treeData)}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrgDetail
                visible={modalVisible}
                record={currentRecord}
                parentNode={parentNode}
                onClose={() => setModalVisible(false)}
                onSubmit={handleSubmit}
            />
        </PageLayout>
    );
};

export default OrgList;