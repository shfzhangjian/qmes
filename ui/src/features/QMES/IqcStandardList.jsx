/**
 * @file: src/features/QMES/IqcStandardList.jsx
 * @version: v1.0.0
 * @description: 进料检验标准管理列表
 * - [Created] 2026-01-14: 初始化进料标准模块，支持增删改查 (AI Copilot)
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import IqcStandardDetail from './IqcStandardDetail';

const IqcStandardList = () => {
    const [queryParams, setQueryParams] = useState({ keyword: '', category: '' });
    const [detailVisible, setDetailVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);

    // 模拟标准数据
    const [dataList] = useState([
        { id: 'STD-2026-001', name: '双面胶带进料标准', model: '3M-9448A', category: '胶带类', version: 'A/1', updater: '张工艺', updateTime: '2026-01-10' },
        { id: 'STD-2026-002', name: 'PET离型膜检验标准', model: 'PET-75-SK', category: '薄膜类', version: 'B/2', updater: '李质量', updateTime: '2026-01-12' },
    ]);

    const columns = [
        { title: '标准编号', dataIndex: 'id', width: 140 },
        { title: '标准名称', dataIndex: 'name', width: 200 },
        { title: '适用型号', dataIndex: 'model', width: 150 },
        { title: '物料类别', dataIndex: 'category', width: 100 },
        { title: '版本', dataIndex: 'version', width: 80 },
        { title: '最后修改人', dataIndex: 'updater', width: 100 },
        { title: '修改时间', dataIndex: 'updateTime', width: 150 },
        {
            title: '操作', key: 'action', width: 150, fixed: 'right',
            render: (_, r) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="small-btn outline" onClick={() => { setCurrentRecord(r); setDetailVisible(true); }}>编辑</button>
                    <button className="small-btn outline" style={{ color: '#ff4d4f' }}>删除</button>
                </div>
            )
        }
    ];

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '搜索名称/型号', span: 1 },
                        { label: '物料类别', name: 'category', type: 'select', options: [{ value: '胶带类', label: '胶带类' }, { value: '薄膜类', label: '薄膜类' }], span: 1 },
                    ]}
                    data={queryParams}
                    onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{ fontWeight: 'bold' }}>检验标准库 (IQC-STD)</div>
                    <button className="btn btn-primary" onClick={() => { setCurrentRecord(null); setDetailVisible(true); }}>
                        <i className="ri-add-line"></i> 新增标准
                    </button>
                </>
            }
        >
            <QueryTable columns={columns} dataSource={dataList} />
            <IqcStandardDetail
                visible={detailVisible}
                record={currentRecord}
                onClose={() => setDetailVisible(false)}
            />
        </PageLayout>
    );
};

export default IqcStandardList;