/**
 * @file: src/features/QMES/IqcRuleList.jsx
 * @description: 质检检验规则管理
 * - [Feature] 支持全检、百分比、国标AQL三种类型的展示
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import IqcRuleDetail from './IqcRuleDetail';
import '../../styles/components.css';

const IqcRuleList = () => {
    const [queryParams, setQueryParams] = useState({ keyword: '', type: '', status: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // --- 模拟数据 ---
    const [dataList, setDataList] = useState([
        {
            id: 'R001', code: 'GB2828-AQL-0.65', name: '国标AQL 0.65 关键管控',
            samplingType: 'GB2828', status: '启用', updater: '张三', updateTime: '2026-01-10',
            aqlRule: { level: 'II', major: '0.65' }
        },
        {
            id: 'R002', code: 'PCT-20-100', name: '一般物料 20% 抽检',
            samplingType: 'PERCENT', status: '启用', updater: '李四', updateTime: '2026-01-11',
            percentageRule: { normal: { sample: 20 } }
        },
        {
            id: 'R003', code: 'FULL-CHECK', name: '高风险全检',
            samplingType: 'FULL', status: '启用', updater: '王五', updateTime: '2026-01-05'
        }
    ]);

    const handleEdit = (record) => {
        setCurrentRecord(record);
        setIsEditing(true);
        setModalVisible(true);
    };

    const handleAdd = () => {
        setCurrentRecord(null);
        setIsEditing(true);
        setModalVisible(true);
    };

    const handleSubmit = (data) => {
        if (data.id) {
            setDataList(prev => prev.map(item => item.id === data.id ? { ...item, ...data } : item));
        } else {
            setDataList(prev => [{ ...data, id: `R-${Date.now()}`, updater:'当前用户', updateTime: new Date().toISOString().split('T')[0] }, ...prev]);
        }
        setModalVisible(false);
    };

    const columns = [
        { title: '规则编码', dataIndex: 'code', width: 150 },
        { title: '规则名称', dataIndex: 'name', width: 250 },
        { title: '抽样方案', dataIndex: 'samplingType', width: 120, render: t => {
                if(t==='FULL') return <span className="q-tag purple">全检抽样</span>;
                if(t==='PERCENT') return <span className="q-tag orange">百分比抽样</span>;
                return <span className="q-tag primary">国标AQL</span>;
            }},
        { title: '核心参数', dataIndex: 'desc', width: 200, render: (t, r) => {
                if(r.samplingType === 'GB2828') return `Level: ${r.aqlRule?.level}, Major: ${r.aqlRule?.major}`;
                if(r.samplingType === 'PERCENT') return `Sample: ${r.percentageRule?.normal?.sample}%`;
                return '100% 全检';
            }},
        { title: '状态', dataIndex: 'status', width: 100, align:'center' },
        { title: '维护人', dataIndex: 'updater', width: 100 },
        { title: '操作', key: 'op', width: 120, fixed: 'right', render: (_, r) => <button className="small-btn outline" onClick={()=>handleEdit(r)}>编辑</button> }
    ];

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '编码/名称' },
                        { label: '抽样方案', name: 'type', type: 'select', options: [{label:'全检抽样',value:'FULL'},{label:'百分比抽样',value:'PERCENT'},{label:'国标AQL',value:'GB2828'}] }
                    ]}
                    data={queryParams} onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{fontWeight:'bold'}}>检验基础数据 &gt; 检验规则定义</div>
                    <button className="btn btn-primary" onClick={handleAdd}><i className="ri-add-line"></i> 新建规则</button>
                </>
            }
        >
            <QueryTable columns={columns} dataSource={dataList} pagination={{total: dataList.length}} />
            <IqcRuleDetail visible={modalVisible} record={currentRecord} isEditing={isEditing} onClose={() => setModalVisible(false)} onSubmit={handleSubmit} />
        </PageLayout>
    );
};

export default IqcRuleList;