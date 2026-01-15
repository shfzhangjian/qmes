/**
 * @file: src/features/Production/ProductList.jsx
 * @description: 产品信息档案管理 (Product Information Management)
 * - [Industry] 半导体耗材行业数据模拟 (CMP垫、吸附垫、掩膜版)
 * - [UI] 标准列表 + 弹窗详情
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import ProductDetail from './ProductDetail';
import '../../styles/components.css';

const ProductList = () => {
    const [queryParams, setQueryParams] = useState({ keyword: '', type: '', status: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);

    // --- 模拟数据：禾臣新材料产品体系 ---
    const [dataList, setDataList] = useState([
        {
            id: 'PROD-CMP-001', code: 'PAD-IC1000-12', name: '12寸CMP抛光硬垫', category: '抛光耗材',
            spec: 'D300mm*T2.0mm / 孔隙率30%', unit: '片', process: 'PR-CMP-HARD-V1', bom: 'BOM-PAD-001',
            manager: '张工艺', status: '启用', remark: '对标 IC1000，用于 Cu/Oxide 工艺'
        },
        {
            id: 'PROD-CMP-002', code: 'PAD-SUBA-12', name: '12寸CMP抛光软垫', category: '抛光耗材',
            spec: 'D300mm*T1.5mm / 聚氨酯发泡', unit: '片', process: 'PR-CMP-SOFT-V2', bom: 'BOM-PAD-002',
            manager: '张工艺', status: '启用', remark: '对标 Suba IV，用于精抛'
        },
        {
            id: 'PROD-VAC-003', code: 'VAC-CER-300', name: '300mm陶瓷吸附垫', category: '工装夹具',
            spec: 'D300mm / 微孔陶瓷 / 平面度<5um', unit: '个', process: 'PR-VAC-CER-V1', bom: 'BOM-VAC-001',
            manager: '李设备', status: '试产', remark: '用于晶圆减薄机'
        },
        {
            id: 'PROD-MSK-004', code: 'MSK-QTZ-6025', name: '6025石英空白掩膜版', category: '光刻耗材',
            spec: '6"x6"x0.25" / 镀铬 / 涂胶', unit: '盒', process: 'PR-MSK-6025-V3', bom: 'BOM-MSK-004',
            manager: '王研发', status: '启用', remark: '高纯合成石英基板'
        },
        {
            id: 'PROD-MSK-005', code: 'MSK-SL-5009', name: '5009苏打掩膜版', category: '光刻耗材',
            spec: '5"x5"x0.09" / 蓝玻璃', unit: '盒', process: 'PR-MSK-5009-V1', bom: 'BOM-MSK-005',
            manager: '王研发', status: '停用', remark: '低端市场产品，逐步淘汰'
        }
    ]);

    // --- 表格配置 ---
    const columns = [
        { title: '产品编码', dataIndex: 'code', width: 140, fixed: 'left', render: t => <b style={{fontFamily:'monospace', color:'#1890ff'}}>{t}</b> },
        { title: '产品名称', dataIndex: 'name', width: 200, render: (t,r) => <span>{t} <span style={{fontSize:'12px', color:'#999'}}>({r.unit})</span></span> },
        { title: '产品分类', dataIndex: 'category', width: 100, align: 'center', render: t => <span className="q-tag">{t}</span> },
        { title: '规格型号', dataIndex: 'spec', width: 220, render: t => <span style={{fontSize:'12px'}}>{t}</span> },
        { title: '默认工艺', dataIndex: 'process', width: 140, render: t => <span style={{color:'#1890ff', cursor:'pointer'}}>{t}</span> },
        { title: 'BOM版本', dataIndex: 'bom', width: 120 },
        { title: '负责人', dataIndex: 'manager', width: 80 },
        { title: '状态', dataIndex: 'status', width: 80, align: 'center', render: t => <span style={{color:t==='启用'?'#52c41a':'#ccc'}}>● {t}</span> },
        {
            title: '操作', key: 'op', width: 180, fixed: 'right',
            render: (_, r) => (
                <div style={{display:'flex', gap:'8px'}}>
                    <button className="small-btn outline" onClick={()=>handleEdit(r)}>编辑</button>
                    <button className="small-btn outline" style={{color:'#1890ff'}}>BOM</button>
                    <button className="small-btn outline" style={{color:'#1890ff'}}>工艺</button>
                </div>
            )
        }
    ];

    const handleEdit = (r) => { setCurrentRecord(r); setModalVisible(true); };
    const handleAdd = () => { setCurrentRecord(null); setModalVisible(true); };

    const handleSubmit = (data) => {
        if (data.id) { // 编辑
            setDataList(prev => prev.map(item => item.id === data.id ? { ...item, ...data } : item));
        } else { // 新增
            setDataList(prev => [{ ...data, id: `PROD-${Date.now()}`, code: `NEW-${Date.now()}` }, ...prev]);
        }
        setModalVisible(false);
    };

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '编码/名称/规格' },
                        { label: '分类', name: 'type', type: 'select', options: [{label:'抛光耗材',value:'抛光耗材'},{label:'光刻耗材',value:'光刻耗材'},{label:'工装夹具',value:'工装夹具'}] },
                        { label: '状态', name: 'status', type: 'select', options: [{label:'启用',value:'启用'},{label:'停用',value:'停用'}] }
                    ]}
                    data={queryParams} onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{fontWeight:'bold'}}>生产基础 &gt; 产品信息档案</div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button className="btn outline"><i className="ri-upload-line"></i> 导入</button>
                        <button className="btn btn-primary" onClick={handleAdd}><i className="ri-add-line"></i> 新建产品</button>
                    </div>
                </>
            }
        >
            <QueryTable columns={columns} dataSource={dataList} pagination={{total: dataList.length}} />

            <ProductDetail
                visible={modalVisible}
                record={currentRecord}
                onClose={() => setModalVisible(false)}
                onSubmit={handleSubmit}
            />
        </PageLayout>
    );
};

export default ProductList;