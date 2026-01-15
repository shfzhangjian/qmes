/**
 * @file: src/features/Business/PartnerList.jsx
 * @description: 客商信息档案管理 (Customers & Suppliers)
 * - [Industry] 模拟半导体行业上下游 (如中芯国际、陶氏化学)
 * - [UI] 标准查询列表 + 独立详情弹窗
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import PartnerDetail from './PartnerDetail';
import '../../styles/components.css';

const PartnerList = () => {
    const [queryParams, setQueryParams] = useState({ keyword: '', type: '', status: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);

    // --- 模拟数据 ---
    const [dataList, setDataList] = useState([
        {
            id: 'CUST-001', code: 'C-SMIC-SH', name: '中芯国际(上海)', type: '客户',
            level: '战略', contact: '李经理', phone: '13900001111',
            region: '华东区', status: '启用', credit: 'AAA', desc: '主要采购：12寸CMP抛光垫'
        },
        {
            id: 'CUST-002', code: 'C-YMTC-WH', name: '长江存储(YMTC)', type: '客户',
            level: '重点', contact: '王工', phone: '13900002222',
            region: '华中区', status: '启用', credit: 'AA', desc: '主要采购：石英掩膜版'
        },
        {
            id: 'SUP-001', code: 'S-DOW-US', name: '陶氏化学(Dow)', type: '供应商',
            level: '合格', contact: 'Mr. Smith', phone: '+1-555-0199',
            region: '海外', status: '启用', credit: '-', desc: '供应：聚氨酯预聚体'
        },
        {
            id: 'SUP-002', code: 'S-CABOT', name: '卡博特(Cabot)', type: '供应商',
            level: '合格', contact: '赵销售', phone: '13812345678',
            region: '华东区', status: '启用', credit: '-', desc: '供应：气相二氧化硅'
        },
        {
            id: 'CUST-003', code: 'C-HLMC', name: '华虹宏力', type: '客户',
            level: '一般', contact: '周采购', phone: '13666668888',
            region: '华东区', status: '潜在', credit: 'A', desc: '试样阶段：CMP软垫'
        }
    ]);

    const columns = [
        { title: '客商编码', dataIndex: 'code', width: 140, fixed: 'left', render: t => <b style={{fontFamily:'monospace', color:'#1890ff'}}>{t}</b> },
        { title: '客商名称', dataIndex: 'name', width: 200, render: t => <b>{t}</b> },
        {
            title: '类型', dataIndex: 'type', width: 100, align: 'center',
            render: t => <span className={`q-tag ${t==='客户'?'blue':'orange'}`}>{t}</span>
        },
        { title: '等级/资质', dataIndex: 'level', width: 100, align: 'center' },
        { title: '联系人', dataIndex: 'contact', width: 100 },
        { title: '联系电话', dataIndex: 'phone', width: 140 },
        { title: '所属区域', dataIndex: 'region', width: 100 },
        {
            title: '状态', dataIndex: 'status', width: 80, align: 'center',
            render: t => <span style={{color: t==='启用'?'#52c41a':(t==='潜在'?'#faad14':'#ccc')}}>● {t}</span>
        },
        {
            title: '操作', key: 'op', width: 180, fixed: 'right',
            render: (_, r) => (
                <div style={{display:'flex', gap:'8px'}}>
                    <button className="small-btn outline" onClick={() => { setCurrentRecord(r); setModalVisible(true); }}>编辑</button>
                    <button className="small-btn outline" style={{color:'#1890ff'}}>联系人</button>
                    <button className="small-btn outline" style={{color:'#1890ff'}}>合同</button>
                </div>
            )
        }
    ];

    const handleSubmit = (data) => {
        if (data.id) {
            setDataList(prev => prev.map(item => item.id === data.id ? data : item));
        } else {
            setDataList(prev => [{ ...data, id: `P-${Date.now()}` }, ...prev]);
        }
        setModalVisible(false);
    };

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '名称/编码/联系人' },
                        { label: '客商类型', name: 'type', type: 'select', options: [{label:'客户',value:'客户'},{label:'供应商',value:'供应商'},{label:'合作伙伴',value:'合作伙伴'}] },
                        { label: '状态', name: 'status', type: 'select', options: [{label:'启用',value:'启用'},{label:'潜在',value:'潜在'},{label:'停用',value:'停用'}] }
                    ]}
                    data={queryParams} onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{fontWeight:'bold'}}>业务基础数据 &gt; 客商信息档案</div>
                    <button className="btn btn-primary" onClick={() => { setCurrentRecord(null); setModalVisible(true); }}>
                        <i className="ri-add-line"></i> 新增客商
                    </button>
                </>
            }
        >
            <QueryTable columns={columns} dataSource={dataList} pagination={{total: dataList.length}} />

            <PartnerDetail
                visible={modalVisible}
                record={currentRecord}
                onClose={() => setModalVisible(false)}
                onSubmit={handleSubmit}
            />
        </PageLayout>
    );
};

export default PartnerList;