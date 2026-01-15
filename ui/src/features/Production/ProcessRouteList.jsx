/**
 * @file: src/features/Production/ProcessRouteList.jsx
 * @description: 工艺路线 (Routing) 管理列表
 * - [功能] 从 JSON 加载模拟数据，CRUD 操作
 * - [交互] 调用详情弹窗进行深度编辑
 */
import React, { useState, useEffect } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import ProcessRouteDetail from './ProcessRouteDetail';
import initialData from '../../data/mock/processRoutes.json'; // 导入模拟数据
import './production.css';

const ProcessRouteList = () => {
    // --- 状态 ---
    const [queryParams, setQueryParams] = useState({ keyword: '', product: '', status: '' });
    const [detailVisible, setDetailVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [dataList, setDataList] = useState([]);

    // --- 加载初始数据 ---
    useEffect(() => {
        setDataList(initialData);
    }, []);

    // --- CRUD 操作 ---
    const handleAdd = () => {
        setCurrentRecord(null); // 新增时传递 null
        setIsEditing(true);
        setDetailVisible(true);
    };

    const handleEdit = (record) => {
        setCurrentRecord(JSON.parse(JSON.stringify(record))); // Deep copy
        setIsEditing(true);
        setDetailVisible(true);
    };

    const handleView = (record) => {
        setCurrentRecord(JSON.parse(JSON.stringify(record))); // Deep copy
        setIsEditing(false); // 只读模式
        setDetailVisible(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('确认删除该工艺路线吗？')) {
            setDataList(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleSubmit = (newData) => {
        if (newData.id === 'NEW') {
            const newItem = { ...newData, id: `PR-${Date.now()}`, updateTime: new Date().toISOString().split('T')[0], updater: '当前用户' };
            setDataList([newItem, ...dataList]);
        } else {
            setDataList(dataList.map(item => item.id === newData.id ? { ...newData, updateTime: new Date().toISOString().split('T')[0] } : item));
        }
        setDetailVisible(false);
    };

    // --- 表格配置 ---
    const columns = [
        { title: '工艺编号', dataIndex: 'id', width: 140, fixed: 'left', render: t => <b style={{fontFamily:'monospace', color:'#1890ff'}}>{t}</b> },
        { title: '工艺名称', dataIndex: 'name', width: 200 },
        { title: '对应产品', dataIndex: 'productName', width: 200, render: (t,r) => <span>{t} <span style={{fontSize:'12px', color:'#999'}}>({r.product})</span></span> },
        { title: '工艺类型', dataIndex: 'type', width: 100 },
        { title: '版本', dataIndex: 'version', width: 80, align:'center', render: t => <span className="q-tag primary">{t}</span> },
        { title: '工序数', dataIndex: 'nodes', width: 80, align:'center', render: (t,r) => r.nodes?.length || 0 },
        { title: '状态', dataIndex: 'status', width: 100, align:'center', render: t => <span style={{color:t==='已发布'?'#52c41a':'#faad14', fontWeight:'bold'}}>● {t}</span> },
        { title: '维护人', dataIndex: 'updater', width: 100 },
        { title: '更新时间', dataIndex: 'updateTime', width: 120 },
        {
            title: '操作', key: 'op', width: 200, fixed: 'right',
            render: (_, r) => (
                <div style={{display:'flex', gap:'8px'}}>
                    <button className="small-btn outline" onClick={()=>handleView(r)}>查看</button>
                    {r.status === '草稿' && (
                        <>
                            <button className="small-btn outline" style={{color:'#1890ff', borderColor:'#1890ff'}} onClick={()=>handleEdit(r)}>设计</button>
                            <button className="small-btn outline" style={{color:'#ff4d4f'}} onClick={()=>handleDelete(r.id)}>删除</button>
                        </>
                    )}
                    {r.status === '已发布' && (
                        <button className="small-btn outline" style={{color:'#faad14'}} onClick={()=>{/* 升版逻辑 */ alert('创建新版本草稿...')}}>升版</button>
                    )}
                </div>
            )
        }
    ];

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '工艺编号/名称', span: 1 },
                        { label: '产品', name: 'product', placeholder: '产品编码', span: 1 },
                        { label: '状态', name: 'status', type: 'select', options: [{label:'已发布', value:'已发布'},{label:'草稿', value:'草稿'}], span: 1 },
                    ]}
                    data={queryParams}
                    onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{fontWeight:'bold'}}>生产基础 &gt; 工艺路线</div>
                    <button className="btn btn-primary" onClick={handleAdd}><i className="ri-add-line"></i> 新增工艺</button>
                </>
            }
        >
            <QueryTable columns={columns} dataSource={dataList} pagination={{total: dataList.length}} />

            {detailVisible && (
                <ProcessRouteDetail
                    visible={detailVisible}
                    record={currentRecord}
                    isEditing={isEditing}
                    onClose={() => setDetailVisible(false)}
                    onSubmit={handleSubmit}
                />
            )}
        </PageLayout>
    );
};

export default ProcessRouteList;