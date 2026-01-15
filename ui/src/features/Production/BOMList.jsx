/**
 * @file: src/features/Production/BOMList.jsx
 * @description: 制造BOM管理
 * - [UI] 统一搜索栏和面包屑导航
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import BaseModal from '../../components/Common/BaseModal';
import './production.css';

const BOMList = () => {
    const [queryParams, setQueryParams] = useState({ keyword: '', type: '' });

    // --- 模拟数据 ---
    const [dataList] = useState([
        { id: 'BOM-CMP-300-V1', productCode: 'PAD-CMP-300', productName: '12寸晶圆CMP抛光垫', version: 'V1.0', type: '制造BOM', status: '已生效', items: 3, yield: '98%' },
        { id: 'RECIPE-PRE-A80', productCode: 'PUR-PRE-A80', productName: '聚氨酯预聚体-A80', version: 'V2.1', type: '配方BOM', status: '已生效', items: 4, yield: '99.5%' },
        { id: 'BOM-MSK-6025', productCode: 'MSK-BLK-6025', productName: '6025空白掩膜版', version: 'V0.9', type: '制造BOM', status: '草稿', items: 2, yield: '-' },
    ]);

    const [modalVisible, setModalVisible] = useState(false);
    const [currentBOM, setCurrentBOM] = useState(null);

    const columns = [
        { title: 'BOM编号', dataIndex: 'id', width: 140, fixed: 'left' },
        { title: '产品编码', dataIndex: 'productCode', width: 140 },
        { title: '产品名称', dataIndex: 'productName', width: 200 },
        { title: '类型', dataIndex: 'type', width: 100, align:'center', render: t => <span className={`q-tag ${t==='配方BOM'?'purple':'primary'}`}>{t}</span> },
        { title: '版本', dataIndex: 'version', width: 80, align:'center' },
        { title: '子项数', dataIndex: 'items', width: 80, align:'center' },
        { title: '标准得率', dataIndex: 'yield', width: 100, align:'center' },
        { title: '状态', dataIndex: 'status', width: 100, align:'center', render: t => <span style={{color:t==='已生效'?'#52c41a':'#faad14'}}>● {t}</span> },
        {
            title: '操作', key: 'op', width: 180, fixed: 'right',
            render: (_, r) => (
                <div style={{display:'flex', gap:'8px'}}>
                    <button className="small-btn outline" onClick={()=>handleView(r)}>结构详情</button>
                    <button className="small-btn outline">升版</button>
                </div>
            )
        }
    ];

    const handleView = (r) => {
        // 模拟加载详情数据
        let items = [];
        if(r.id.includes('CMP')) {
            items = [
                { no: 10, code: 'CAKE-IC1000', name: 'CMP抛光垫毛坯', spec: 'D800*T20', unit: '片', qty: 1, type: '半成品', loss: '0%' },
                { no: 20, code: 'ADH-3M-90', name: '3M背胶', spec: '300mm', unit: '片', qty: 1, type: '辅材', loss: '1%' },
                { no: 30, code: 'LABEL-CMP', name: '产品标签', spec: '-', unit: '张', qty: 1, type: '辅材', loss: '0.5%' },
            ];
        } else if(r.id.includes('RECIPE')) {
            items = [
                { no: 10, code: 'RM-ISO-01', name: '异氰酸酯', spec: '200kg/桶', unit: 'kg', qty: 100, type: '原材料', loss: '0.2%' },
                { no: 20, code: 'RM-POLY-02', name: '聚醚多元醇', spec: '200kg/桶', unit: 'kg', qty: 50, type: '原材料', loss: '0.2%' },
                { no: 30, code: 'CAT-01', name: '催化剂', spec: '1kg/瓶', unit: 'g', qty: 200, type: '原材料', loss: '5%' },
            ];
        }
        setCurrentBOM({...r, details: items});
        setModalVisible(true);
    };

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '产品编码/名称', span: 1 },
                        { label: 'BOM类型', name: 'type', type: 'select', options: [{label:'制造BOM', value:'制造BOM'},{label:'配方BOM', value:'配方BOM'}], span: 1 },
                    ]}
                    data={queryParams}
                    onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{fontWeight:'bold'}}>生产基础 &gt; 制造BOM</div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button className="btn outline"><i className="ri-search-line"></i> 反查</button>
                        <button className="btn btn-primary"><i className="ri-add-line"></i> 新建BOM</button>
                    </div>
                </>
            }
        >
            <QueryTable columns={columns} dataSource={dataList} pagination={{total: dataList.length}} />

            <BaseModal visible={modalVisible} title={`BOM详情: ${currentBOM?.productName} (${currentBOM?.version})`} width="900px" onClose={()=>setModalVisible(false)} footer={null}>
                <div style={{background:'#f5f7fa', padding:'15px', borderRadius:'4px', marginBottom:'15px', display:'flex', gap:'30px'}}>
                    <div><b>产品编码:</b> {currentBOM?.productCode}</div>
                    <div><b>基准数量:</b> 1 {currentBOM?.type==='配方BOM'?'批(Batch)':'PCS'}</div>
                    <div><b>BOM类型:</b> {currentBOM?.type}</div>
                    <div><b>生效日期:</b> 2026-01-01</div>
                </div>

                <h4 style={{margin:'0 0 10px 0'}}>子项清单</h4>
                <table className="sub-table">
                    <thead>
                    <tr>
                        <th style={{width:'50px'}}>序号</th>
                        <th style={{width:'120px'}}>子件编码</th>
                        <th>子件名称</th>
                        <th>类型</th>
                        <th>规格</th>
                        <th style={{textAlign:'center'}}>单位</th>
                        <th style={{textAlign:'right'}}>单耗数量</th>
                        <th style={{textAlign:'right'}}>损耗率</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentBOM?.details?.map((item, i) => (
                        <tr key={i}>
                            <td style={{textAlign:'center'}}>{item.no}</td>
                            <td style={{fontFamily:'monospace', color:'#1890ff'}}>{item.code}</td>
                            <td>{item.name}</td>
                            <td><span className="q-tag">{item.type}</span></td>
                            <td>{item.spec}</td>
                            <td style={{textAlign:'center'}}>{item.unit}</td>
                            <td style={{textAlign:'right', fontWeight:'bold'}}>{item.qty}</td>
                            <td style={{textAlign:'right', color:'#999'}}>{item.loss}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </BaseModal>
        </PageLayout>
    );
};

export default BOMList;