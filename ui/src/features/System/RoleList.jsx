/**
 * @file: src/features/System/RoleList.jsx
 * @description: 人员权限配置列表
 * - [Update] 增加“角色分类”字段展示和筛选
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import RoleDetail from './RoleDetail';

const RoleList = () => {
    const [queryParams, setQueryParams] = useState({ keyword: '', category: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);

    // --- 模拟数据 ---
    const [dataList, setDataList] = useState([
        { id: 'R001', code: 'SUPER_ADMIN', name: '超级管理员', category: '系统管理', count: 2, desc: '系统最高权限', status: '启用' },
        { id: 'R002', code: 'MGR', name: '部门经理', category: '系统管理', count: 5, desc: '各部门负责人', status: '启用' },
        { id: 'R003', code: 'PE', name: '工艺工程师', category: '生产管理', count: 12, desc: '负责BOM、工艺路线维护', status: '启用' },
        { id: 'R004', code: 'QC', name: '质检员', category: '质量管理', count: 8, desc: '负责IQC、IPQC、OQC', status: '启用' },
        { id: 'R005', code: 'WH', name: '仓管员', category: '仓储物流', count: 6, desc: '负责出入库操作', status: '启用' },
        { id: 'R006', code: 'PMC', name: '计划员', category: '生产管理', count: 3, desc: '负责生产计划排程', status: '启用' }
    ]);

    const columns = [
        { title: '角色编码', dataIndex: 'code', width: 150, fixed:'left', render: t => <b>{t}</b> },
        { title: '角色名称', dataIndex: 'name', width: 150 },
        { title: '角色分类', dataIndex: 'category', width: 120, render: t => <span className="q-tag">{t}</span> },
        { title: '关联用户数', dataIndex: 'count', width: 100, align:'center', render: t => <span className="q-tag">{t} 人</span> },
        { title: '描述', dataIndex: 'desc', width: 250 },
        { title: '状态', dataIndex: 'status', width: 100, align:'center', render: t => <span style={{color:t==='启用'?'#52c41a':'#ccc'}}>● {t}</span> },
        {
            title: '操作', key: 'op', width: 150, fixed: 'right',
            render: (_, r) => (
                <div style={{display:'flex', gap:'8px'}}>
                    <button className="small-btn outline" onClick={() => { setCurrentRecord(r); setModalVisible(true); }}>权限配置</button>
                    {r.code !== 'SUPER_ADMIN' && <button className="small-btn outline" style={{color:'#ff4d4f'}}>删除</button>}
                </div>
            )
        }
    ];

    const handleSubmit = (data) => {
        if (data.id) {
            setDataList(prev => prev.map(item => item.id === data.id ? data : item));
        } else {
            setDataList(prev => [...prev, { ...data, id: `R${Date.now()}`, count: 0 }]);
        }
        setModalVisible(false);
    };

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '角色名称/编码' },
                        { label: '分类', name: 'category', type: 'select', options: [{label:'系统管理',value:'系统管理'},{label:'生产管理',value:'生产管理'},{label:'质量管理',value:'质量管理'},{label:'仓储物流',value:'仓储物流'}] }
                    ]}
                    data={queryParams} onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{fontWeight:'bold'}}>系统管理 &gt; 人员权限配置</div>
                    <button className="btn btn-primary" onClick={() => { setCurrentRecord(null); setModalVisible(true); }}><i className="ri-shield-user-line"></i> 新增角色</button>
                </>
            }
        >
            <QueryTable columns={columns} dataSource={dataList} pagination={{total: dataList.length}} />

            <RoleDetail
                visible={modalVisible}
                record={currentRecord}
                onClose={() => setModalVisible(false)}
                onSubmit={handleSubmit}
            />
        </PageLayout>
    );
};

export default RoleList;