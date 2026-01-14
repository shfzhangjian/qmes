/**
 * @file: src/features/QMES/IqcRecordList.jsx
 * @version: v1.0.0
 * @description: 进料检验记录列表
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import IqcRecordDetail from './IqcRecordDetail';

const IqcRecordList = () => {
    const [detailVisible, setDetailVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);

    const [dataList] = useState([
        { id: 'IQC-20260114-001', material: '双面胶', batch: '2026011001', supplier: 'V001', result: 'PASS', date: '2026-01-14' },
    ]);

    const columns = [
        { title: '记录编号', dataIndex: 'id', width: 160 },
        { title: '物料品名', dataIndex: 'material', width: 150 },
        { title: '批次号', dataIndex: 'batch', width: 120 },
        { title: '供应商', dataIndex: 'supplier', width: 100 },
        {
            title: '判定结果', dataIndex: 'result', width: 100,
            render: v => <span style={{ color: v === 'PASS' ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>{v}</span>
        },
        { title: '检验日期', dataIndex: 'date', width: 120 },
        {
            title: '操作', key: 'action', width: 120,
            render: (_, r) => <button className="small-btn outline" onClick={() => { setCurrentRecord(r); setDetailVisible(true); }}>查看详情</button>
        }
    ];

    return (
        <PageLayout
            toolbar={
                <>
                    <div style={{ fontWeight: 'bold' }}>进料检验记录表 (IQC-REC)</div>
                    <button className="btn btn-primary" onClick={() => { setCurrentRecord(null); setDetailVisible(true); }}>
                        <i className="ri-edit-2-line"></i> 执行检验
                    </button>
                </>
            }
        >
            <QueryTable columns={columns} dataSource={dataList} />
            <IqcRecordDetail visible={detailVisible} record={currentRecord} onClose={() => setDetailVisible(false)} />
        </PageLayout>
    );
};

export default IqcRecordList;