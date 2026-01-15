/**
 * @file: src/features/Production/FactoryModelList.jsx
 * @description: 工厂物理建模 (Factory Modeling)
 * - [行业特性] 支持半导体洁净室等级 (Class 100/1000)
 * - [结构] 树状表格展示: 工厂 -> 车间 -> 产线 -> 工位
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import BaseModal from '../../components/Common/BaseModal';
import SmartForm from '../../components/Common/SmartForm'; // 引入搜索表单
import './production.css'; // 引入专用样式

const FactoryModelList = () => {
    // --- 状态管理 ---
    const [queryParams, setQueryParams] = useState({ keyword: '', type: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [currentNode, setCurrentNode] = useState(null);

    // --- 模拟数据：模拟某半导体材料工厂结构 ---
    const [treeData, setTreeData] = useState([
        {
            id: 'FAC-SZ01', name: '禾臣新材料(苏州)工厂', type: '工厂', env: '普通', status: '正常', manager: '张厂长',
            children: [
                {
                    id: 'WS-PUR-01', name: '配料合成车间', type: '车间', env: 'Class 10000', manager: '李主任',
                    children: [
                        { id: 'LINE-PRE-A', name: '预聚体合成线 A', type: '产线', equipCount: 5, status: '运行中' },
                        { id: 'LINE-PRE-B', name: '预聚体合成线 B', type: '产线', equipCount: 5, status: '维护中' }
                    ]
                },
                {
                    id: 'WS-CAST-02', name: '精密成型车间', type: '车间', env: 'Class 1000', manager: '王主任',
                    children: [
                        { id: 'LINE-CAST-01', name: '抛光垫浇注线 01', type: '产线', equipCount: 8, status: '运行中' },
                        { id: 'LINE-CAST-02', name: '抛光垫浇注线 02', type: '产线', equipCount: 8, status: '运行中' }
                    ]
                },
                {
                    id: 'WS-POST-03', name: '后道加工车间', type: '车间', env: 'Class 100', manager: '赵主任',
                    children: [
                        { id: 'LINE-CNC-01', name: '精密开槽线', type: '产线', equipCount: 12, status: '运行中' },
                        { id: 'LINE-LAM-01', name: '无尘贴合/清洗线', type: '产线', equipCount: 6, status: '运行中' }
                    ]
                }
            ]
        },
        {
            id: 'FAC-WH01', name: '禾臣新材料(芜湖)基地', type: '工厂', env: 'Class 10', status: '试运行', manager: '周厂长',
            children: [
                {
                    id: 'WS-MSK-01', name: '光刻车间', type: '车间', env: 'Class 10', manager: '吴博士',
                    children: []
                }
            ]
        }
    ]);

    // --- 递归渲染树表格行 ---
    const renderRows = (nodes, level = 0) => {
        return nodes.map(node => (
            <React.Fragment key={node.id}>
                <tr style={{background: level === 0 ? '#fafafa' : '#fff'}}>
                    <td style={{paddingLeft: '15px'}}>
                        <div style={{display:'flex', alignItems:'center'}}>
                            <span style={{width: `${level * 24}px`, display:'inline-block'}}></span>
                            {level > 0 && <span style={{color:'#ccc', marginRight:'4px'}}>└─</span>}
                            <i className={`ri-${node.type==='工厂'?'building':(node.type==='车间'?'community':(node.type==='产线'?'node-tree':'macbook'))}-line tree-node-icon`}></i>
                            <span style={{fontWeight: node.type==='工厂'?'bold':'normal'}}>{node.name}</span>
                        </div>
                    </td>
                    <td><span style={{fontFamily:'monospace', color:'#666'}}>{node.id}</span></td>
                    <td>
                        <span className={`q-tag ${node.type==='工厂'?'primary':(node.type==='车间'?'purple':'warning')}`}>{node.type}</span>
                    </td>
                    <td>
                        {/* 洁净度高亮显示 */}
                        {node.env && node.env.includes('Class') ?
                            <span className="q-tag success">{node.env}</span> :
                            <span style={{color:'#999'}}>{node.env || '-'}</span>
                        }
                    </td>
                    <td>{node.manager || '-'}</td>
                    <td>{node.equipCount ? `${node.equipCount} 台` : '-'}</td>
                    <td>
                        <span style={{color: node.status==='维护中'?'#faad14':'#52c41a', fontWeight:'bold'}}>
                            ● {node.status}
                        </span>
                    </td>
                    <td>
                        <div style={{display:'flex', gap:'8px'}}>
                            <button className="small-btn outline" onClick={()=>handleEdit(node)}>编辑</button>
                            {node.type !== '产线' && <button className="small-btn outline" style={{color:'#1890ff'}} onClick={()=>handleAdd(node)}>+ 下级</button>}
                        </div>
                    </td>
                </tr>
                {node.children && node.children.length > 0 && renderRows(node.children, level + 1)}
            </React.Fragment>
        ));
    };

    const handleEdit = (node) => { setCurrentNode(node); setModalVisible(true); };
    const handleAdd = (parentNode) => {
        setCurrentNode({ parentId: parentNode.id, parentName: parentNode.name, type: getNextType(parentNode.type) });
        setModalVisible(true);
    };

    const getNextType = (type) => {
        if(type === '工厂') return '车间';
        if(type === '车间') return '产线';
        return '工位';
    };

    return (
        <PageLayout
            // 1. 添加搜索表单
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '名称/编码', span: 1 },
                        { label: '节点类型', name: 'type', type: 'select', options: [{label:'工厂',value:'工厂'},{label:'车间',value:'车间'},{label:'产线',value:'产线'}], span: 1 },
                    ]}
                    data={queryParams}
                    onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4} // 保持一行显示
                />
            }
            // 2. 更新工具栏：添加面包屑和主按钮
            toolbar={
                <>
                    <div style={{ fontWeight: 'bold' }}>生产基础 &gt; 工厂建模</div>
                    <button className="btn btn-primary" onClick={()=>handleAdd({id:'ROOT', name:'ROOT', type:'ROOT'})}>
                        <i className="ri-add-line"></i> 新建工厂
                    </button>
                </>
            }
        >
            <div className="q-table-container" style={{padding:'0', border:'none'}}>
                <table className="q-table" style={{borderLeft:'1px solid #eee', borderRight:'1px solid #eee'}}>
                    <thead>
                    <tr>
                        <th style={{width:'320px', paddingLeft:'20px'}}>组织名称</th>
                        <th>编码</th>
                        <th>类型</th>
                        <th>环境等级 (洁净度)</th>
                        <th>负责人</th>
                        <th>关联设备</th>
                        <th>状态</th>
                        <th style={{width:'180px'}}>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    {renderRows(treeData)}
                    </tbody>
                </table>
            </div>

            {/* 编辑/新增弹窗 */}
            <BaseModal
                visible={modalVisible}
                title={currentNode?.id ? "编辑节点信息" : `新增节点 (上级: ${currentNode?.parentName || '根节点'})`}
                onClose={()=>setModalVisible(false)}
                width="600px"
            >
                <div className="form-item" style={{marginBottom:'15px'}}>
                    <label className="required">节点类型</label>
                    <select className="std-input" defaultValue={currentNode?.type}>
                        <option>工厂</option><option>车间</option><option>产线</option><option>工位</option>
                    </select>
                </div>
                <div className="form-item" style={{marginBottom:'15px'}}>
                    <label className="required">节点名称</label>
                    <input className="std-input" defaultValue={currentNode?.name} placeholder="请输入名称，如：精密成型车间" />
                </div>
                <div className="form-item" style={{marginBottom:'15px'}}>
                    <label className="required">节点编码</label>
                    <input className="std-input" defaultValue={currentNode?.id} placeholder="请输入唯一编码" />
                </div>
                <div className="form-grid-2">
                    <div className="form-item">
                        <label>洁净度等级</label>
                        <select className="std-input" defaultValue={currentNode?.env || '普通'}>
                            <option>普通</option>
                            <option>Class 100000 (十万级)</option>
                            <option>Class 10000 (万级)</option>
                            <option>Class 1000 (千级)</option>
                            <option>Class 100 (百级)</option>
                            <option>Class 10 (十级)</option>
                        </select>
                    </div>
                    <div className="form-item">
                        <label>负责人</label>
                        <input className="std-input" defaultValue={currentNode?.manager} />
                    </div>
                </div>
            </BaseModal>
        </PageLayout>
    );
};

export default FactoryModelList;