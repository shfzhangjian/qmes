/**
 * @file: src/features/QMES/DefectDefinitionList.jsx
 * @description: 质检缺陷代码定义管理列表
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import DefectDefinitionDetail from './DefectDefinitionDetail';
import '../../styles/components.css';

const DefectDefinitionList = () => {
    const [queryParams, setQueryParams] = useState({ keyword: '', category: '', severity: '' });
    const [detailVisible, setDetailVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // --- 模拟数据 ---
    const [dataList, setDataList] = useState([
        {
            id: 'DEF-001', code: 'SFC-SCR-01', name: '表面划痕', category: '表面缺陷',
            severity: 'Major', standard: 'Q/HC-QC-008', status: '启用', version: 'V1.2',
            desc: '抛光垫工作面存在线性划痕', updater: '张品质', updateTime: '2026-01-10'
        },
        {
            id: 'DEF-002', code: 'SFC-PNL-02', name: '针孔/透光点', category: '表面缺陷',
            severity: 'Critical', standard: 'ISO-14644', status: '启用', version: 'V1.0',
            desc: '掩膜版铬层透光点', updater: '李研发', updateTime: '2026-01-12'
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
        if (data.id) {
            setDataList(prev => prev.map(item => item.id === data.id ? { ...item, ...data } : item));
        } else {
            setDataList(prev => [{ ...data, id: `DEF-${Date.now()}`, updateTime: new Date().toLocaleDateString(), updater: '当前用户' }, ...prev]);
        }
        setDetailVisible(false);
    };

    const columns = [
        { title: '缺陷编码', dataIndex: 'code', width: 140, fixed: 'left', render: t => <b style={{fontFamily:'monospace', color:'#1890ff'}}>{t}</b> },
        { title: '缺陷名称', dataIndex: 'name', width: 220 },
        { title: '分类', dataIndex: 'category', width: 100 },
        {
            title: '严重度', dataIndex: 'severity', width: 100, align: 'center',
            render: t => {
                const colors = { 'Critical': 'danger', 'Major': 'warning', 'Minor': 'primary' };
                return <span className={`q-tag ${colors[t]}`}>{t}</span>;
            }
        },
        { title: '版本', dataIndex: 'version', width: 80, align: 'center', render: t => <span className="q-tag purple">{t}</span> },
        { title: '状态', dataIndex: 'status', width: 80, align: 'center', render: t => <span className={`status-badge ${t==='启用'?'success':'disabled'}`}>{t}</span> },
        { title: '更新时间', dataIndex: 'updateTime', width: 120 },
        {
            title: '操作', key: 'op', width: 150, fixed: 'right',
            render: (_, r) => (
                <div style={{display:'flex', gap:'8px'}}>
                    <button className="small-btn outline" onClick={()=>handleView(r)}>查看</button>
                    <button className="small-btn outline" onClick={()=>handleEdit(r)}>编辑</button>
                </div>
            )
        }
    ];

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '编码/名称' },
                        { label: '分类', name: 'category', type: 'select', options: [{label:'表面缺陷',value:'表面缺陷'},{label:'尺寸公差',value:'尺寸公差'}] }
                    ]}
                    data={queryParams} onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{fontWeight:'bold'}}>质量基础数据 &gt; 质检缺陷库</div>
                    <button className="btn btn-primary" onClick={handleAdd}><i className="ri-add-line"></i> 新增缺陷代码</button>
                </>
            }
        >
            <QueryTable columns={columns} dataSource={dataList} pagination={{total: dataList.length}} />

            {detailVisible && (
                <DefectDefinitionDetail
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

export default DefectDefinitionList;