/**
 * @file: src/features/Business/BrandList.jsx
 * @description: 产品品牌管理 (轻量级)
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import BaseModal from '../../components/Common/BaseModal';
import SmartForm from '../../components/Common/SmartForm';
import '../../styles/sys-comm-detail.css';

const BrandList = () => {
    const [queryParams, setQueryParams] = useState({ keyword: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);

    const [dataList, setDataList] = useState([
        { id: 'B001', code: 'BR-HC', name: '禾臣 (HeChen)', type: '自有品牌', status: '启用', desc: '公司主品牌，覆盖CMP耗材' },
        { id: 'B002', code: 'BR-DOW', name: '陶氏 (Dow)', type: '代理品牌', status: '启用', desc: '进口原材料品牌' },
        { id: 'B003', code: 'BR-CAB', name: '卡博特 (Cabot)', type: '代理品牌', status: '启用', desc: '研磨粒子品牌' },
        { id: 'B004', code: 'BR-OEM', name: 'OEM通用', type: '代工品牌', status: '启用', desc: '客户定制代工产品' }
    ]);

    const columns = [
        { title: '品牌编码', dataIndex: 'code', width: 150 },
        { title: '品牌名称', dataIndex: 'name', width: 200, render: t => <b>{t}</b> },
        { title: '类型', dataIndex: 'type', width: 120 },
        { title: '描述', dataIndex: 'desc', width: 250 },
        { title: '状态', dataIndex: 'status', width: 100, align: 'center', render: t => <span style={{color:t==='启用'?'#52c41a':'#ccc'}}>● {t}</span> },
        {
            title: '操作', key: 'op', width: 150, fixed: 'right',
            render: (_, r) => <button className="mini-btn outline" onClick={() => { setCurrentRecord(r); setModalVisible(true); }}>编辑</button>
        }
    ];

    const handleSubmit = () => {
        setModalVisible(false);
        // 模拟保存...
    };

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[{ label: '品牌名称', name: 'keyword', placeholder: '名称/编码' }]}
                    data={queryParams} onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{fontWeight:'bold'}}>业务基础数据 &gt; 产品品牌管理</div>
                    <button className="btn btn-primary" onClick={() => { setCurrentRecord({}); setModalVisible(true); }}><i className="ri-add-line"></i> 新增品牌</button>
                </>
            }
        >
            <QueryTable columns={columns} dataSource={dataList} pagination={{total: dataList.length}} />

            {/* 简单的内部弹窗 */}
            <BaseModal visible={modalVisible} title={currentRecord?.id ? "编辑品牌" : "新增品牌"} width="500px" onClose={() => setModalVisible(false)}
                       footer={<div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}><button className="btn outline" onClick={()=>setModalVisible(false)}>取消</button><button className="btn btn-primary" onClick={handleSubmit}>保存</button></div>}
            >
                <div style={{padding:'20px'}}>
                    <div className="form-item" style={{marginBottom:'15px'}}>
                        <label className="required">品牌名称</label>
                        <input className="std-input" defaultValue={currentRecord?.name} />
                    </div>
                    <div className="form-item" style={{marginBottom:'15px'}}>
                        <label className="required">品牌编码</label>
                        <input className="std-input" defaultValue={currentRecord?.code} />
                    </div>
                    <div className="form-item" style={{marginBottom:'15px'}}>
                        <label>类型</label>
                        <select className="std-input" defaultValue={currentRecord?.type}>
                            <option>自有品牌</option><option>代理品牌</option><option>代工品牌</option>
                        </select>
                    </div>
                    <div className="form-item">
                        <label>描述</label>
                        <textarea className="std-input" style={{height:'80px', paddingTop:'8px'}} defaultValue={currentRecord?.desc}></textarea>
                    </div>
                </div>
            </BaseModal>
        </PageLayout>
    );
};

export default BrandList;