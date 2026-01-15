/**
 * @file: src/features/Production/ProductionOrderList.jsx
 * @description: 生产订单管理列表 (MO - Manufacturing Order)
 * - [UI] 严格参考 QMES 系统标准列表风格
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import ProductionOrderDetail from './ProductionOrderDetail';
import '../../styles/components.css';

const ProductionOrderList = () => {
    const [queryParams, setQueryParams] = useState({ keyword: '', status: '', priority: '' });
    const [detailVisible, setDetailVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // --- 模拟数据: 半导体耗材生产指令 ---
    const [dataList, setDataList] = useState([
        {
            id: 'MO-20260116-001', productCode: 'PAD-CMP-300', productName: '12寸CMP抛光垫',
            qty: 500, unit: '片', planStart: '2026-01-18', planEnd: '2026-01-25',
            priority: '紧急', status: '待排产', version: 'V1.0', updater: '吴计划', updateTime: '2026-01-16'
        },
        {
            id: 'MO-20260116-002', productCode: 'MSK-QTZ-6025', productName: '6025石英空白掩膜版',
            qty: 100, unit: '盒', planStart: '2026-01-17', planEnd: '2026-01-22',
            priority: '高', status: '进行中', version: 'V1.1', updater: '张工艺', updateTime: '2026-01-15'
        },
        {
            id: 'MO-20260115-008', productCode: 'VAC-CER-300', productName: '300mm陶瓷吸附垫',
            qty: 20, unit: '个', planStart: '2026-01-20', planEnd: '2026-02-05',
            priority: '普通', status: '已完成', version: 'V1.0', updater: '王计划', updateTime: '2026-01-14'
        }
    ]);

    const handleView = (record) => {
        setCurrentRecord(record);
        setIsEditing(false);
        setDetailVisible(true);
    };

    const handleEdit = (record) => {
        setCurrentRecord(JSON.parse(JSON.stringify(record)));
        setIsEditing(true);
        setDetailVisible(true);
    };

    const handleAdd = () => {
        setCurrentRecord(null);
        setIsEditing(true);
        setDetailVisible(true);
    };

    const handleSubmit = (data) => {
        if (data.id && data.id !== 'NEW') {
            setDataList(prev => prev.map(item => item.id === data.id ? { ...item, ...data } : item));
        } else {
            setDataList(prev => [{ ...data, id: `MO-${Date.now()}`, updateTime: '今天', updater: '当前用户', status: '待排产' }, ...prev]);
        }
        setDetailVisible(false);
    };

    const columns = [
        { title: '订单编号', dataIndex: 'id', width: 160, fixed: 'left', render: t => <b style={{fontFamily:'monospace', color:'#1890ff'}}>{t}</b> },
        { title: '产品', dataIndex: 'productName', width: 200, render: (t, r) => <span>{t}<br/><small style={{color:'#999'}}>{r.productCode}</small></span> },
        { title: '计划数量', dataIndex: 'qty', width: 100, align: 'right', render: (t, r) => <b>{t} {r.unit}</b> },
        {
            title: '优先级', dataIndex: 'priority', width: 80, align: 'center',
            render: t => <span className={`q-tag ${t==='紧急'?'danger':(t==='高'?'warning':'primary')}`}>{t}</span>
        },
        { title: '计划开始', dataIndex: 'planStart', width: 110 },
        { title: '计划完工', dataIndex: 'planEnd', width: 110 },
        { title: '状态', dataIndex: 'status', width: 90, align: 'center', render: t => <span className={`status-badge ${t==='进行中'?'success':(t==='待排产'?'warning':'disabled')}`}>{t}</span> },
        { title: '维护人', dataIndex: 'updater', width: 90 },
        {
            title: '操作', key: 'op', width: 140, fixed: 'right',
            render: (_, r) => (
                <div className="action-group">
                    <button className="mini-btn outline" onClick={()=>handleView(r)}>详情</button>
                    <button className="mini-btn primary" onClick={()=>handleEdit(r)}>编辑</button>
                </div>
            )
        }
    ];

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[
                        { label: '订单/产品', name: 'keyword', placeholder: '编号/编码/名称' },
                        { label: '订单状态', name: 'status', type: 'select', options: [{label:'待排产',value:'待排产'},{label:'进行中',value:'进行中'},{label:'已完成',value:'已完成'}] },
                        { label: '优先级', name: 'priority', type: 'select', options: [{label:'紧急',value:'紧急'},{label:'高',value:'高'},{label:'普通',value:'普通'}] }
                    ]}
                    data={queryParams} onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{fontWeight:'bold'}}>生产管理 &gt; 生产订单</div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button className="btn outline"><i className="ri-file-excel-line"></i> 导出工单</button>
                        <button className="btn btn-primary" onClick={handleAdd}><i className="ri-add-line"></i> 新建生产订单</button>
                    </div>
                </>
            }
        >
            <QueryTable columns={columns} dataSource={dataList} pagination={{total: dataList.length}} />

            {detailVisible && (
                <ProductionOrderDetail
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

export default ProductionOrderList;