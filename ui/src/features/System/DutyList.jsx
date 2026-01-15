/**
 * @file: src/features/System/DutyList.jsx
 * @description: 工作岗位管理列表
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import DutyDetail from './DutyDetail';

const DutyList = () => {
    const [queryParams, setQueryParams] = useState({ keyword: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);

    const [dataList] = useState([
        { id: 'DUTY-001', code: 'GM', name: '总经理', level: 'L1', type: '管理岗', desc: '公司全面管理', status: '启用' },
        { id: 'DUTY-002', code: 'PROD-DIR', name: '生产总监', level: 'L2', type: '管理岗', desc: '负责生产制造中心', status: '启用' },
        { id: 'DUTY-004', code: 'PE-LEADER', name: 'PE主管', level: 'L4', type: '技术岗', desc: '负责工程技术团队', status: '启用' },
        { id: 'DUTY-006', code: 'ENG', name: '工程师', level: 'L5', type: '技术岗', desc: '工艺/设备/质量工程师', status: '启用' },
        { id: 'DUTY-007', code: 'OP', name: '操作工', level: 'L6', type: '作业岗', desc: '一线生产作业', status: '启用' },
    ]);

    const columns = [
        { title: '岗位编码', dataIndex: 'code', width: 120, fixed:'left' },
        { title: '岗位名称', dataIndex: 'name', width: 150, render: t => <b>{t}</b> },
        { title: '职级', dataIndex: 'level', width: 80, align:'center', render: t => <span className="q-tag">{t}</span> },
        { title: '岗位类型', dataIndex: 'type', width: 100 },
        { title: '职责描述', dataIndex: 'desc', width: 250 },
        { title: '状态', dataIndex: 'status', width: 80, align:'center', render: t => <span style={{color:t==='启用'?'#52c41a':'#ccc'}}>● {t}</span> },
        {
            title: '操作', key: 'op', width: 120, fixed: 'right',
            render: (_, r) => <button className="small-btn outline" onClick={() => { setCurrentRecord(r); setModalVisible(true); }}>编辑</button>
        }
    ];

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '岗位名称/编码' },
                        { label: '类型', name: 'type', type: 'select', options: [{label:'管理岗',value:'管理岗'},{label:'技术岗',value:'技术岗'}] }
                    ]}
                    data={queryParams} onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{fontWeight:'bold'}}>系统管理 &gt; 岗位管理</div>
                    <button className="btn btn-primary" onClick={() => { setCurrentRecord(null); setModalVisible(true); }}><i className="ri-add-line"></i> 新增岗位</button>
                </>
            }
        >
            <QueryTable columns={columns} dataSource={dataList} pagination={{total: dataList.length}} />

            <DutyDetail
                visible={modalVisible}
                record={currentRecord}
                onClose={() => setModalVisible(false)}
                onSubmit={() => setModalVisible(false)}
            />
        </PageLayout>
    );
};

export default DutyList;