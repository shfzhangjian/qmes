import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import BaseModal from '../../components/Common/BaseModal';

const ComponentDemo = () => {
    // --- 状态管理 ---
    const [queryParams, setQueryParams] = useState({ keyword: '', status: '' });
    const [selectedIds, setSelectedIds] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState({});

    // --- 模拟数据 ---
    const mockData = Array.from({length: 12}).map((_, i) => ({
        id: `DEMO-${100+i}`,
        name: `测试设备 ${i+1}`,
        type: i % 2 === 0 ? '生产设备' : '检测仪器',
        status: i % 3 === 0 ? 'fault' : 'active',
        lastMaint: '2026-01-14',
        manager: '张三'
    }));

    // --- 列定义 ---
    const columns = [
        { title: '设备编号', dataIndex: 'id', width: 120, fixed: 'left' },
        { title: '设备名称', dataIndex: 'name', width: 150 },
        { title: '类型', dataIndex: 'type', width: 120 },
        {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: (val) => val === 'active'
                ? <span className="q-tag success">正常</span>
                : <span className="q-tag error">故障</span>
        },
        { title: '上次保养', dataIndex: 'lastMaint', width: 150 },
        { title: '负责人', dataIndex: 'manager', width: 100 },
        {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <div style={{display:'flex', gap:'8px'}}>
                    <button className="small-btn outline" onClick={() => handleEdit(record)}>编辑</button>
                    <button className="small-btn outline" style={{color:'red', borderColor:'transparent'}}>删除</button>
                </div>
            )
        }
    ];

    // --- 搜索表单配置 ---
    const searchFields = [
        { label: '关键词', name: 'keyword', placeholder: '设备名称/编号', span: 1 },
        { label: '状态', name: 'status', type: 'select', options: [{value:'active', label:'正常'}, {value:'fault', label:'故障'}], span: 1 }
    ];

    // --- 编辑表单配置 ---
    const editFields = [
        { label: '设备编号', name: 'id', disabled: true, span: 2 },
        { label: '设备名称', name: 'name', required: true, span: 1 },
        { label: '设备类型', name: 'type', type: 'select', options: [{value:'生产设备', label:'生产设备'}, {value:'检测仪器', label:'检测仪器'}], span: 1 },
        { label: '当前状态', name: 'status', type: 'select', options: [{value:'active', label:'正常'}, {value:'fault', label:'故障'}], span: 1 },
        { label: '负责人', name: 'manager', span: 1 },
        { label: '保养日期', name: 'lastMaint', type: 'date', span: 2 },
        { label: '备注说明', name: 'remark', type: 'textarea', span: 2 }
    ];

    // --- 事件处理 ---
    const handleSearch = (key, val) => setQueryParams({...queryParams, [key]: val});

    const handleEdit = (record) => {
        setCurrentRecord({...record});
        setModalVisible(true);
    };

    const handleSave = () => {
        alert(`保存成功: ${currentRecord.name}`);
        setModalVisible(false);
    };

    return (
        <PageLayout
            // 1. 顶部搜索
            searchForm={
                <div style={{display:'flex', alignItems:'flex-end', gap:'20px'}}>
                    <div style={{flex:1}}>
                        <SmartForm
                            fields={searchFields}
                            data={queryParams}
                            onChange={handleSearch}
                            columns={4}
                        />
                    </div>
                    <div style={{display:'flex', gap:'10px', marginBottom:'5px'}}>
                        <button className="btn btn-primary"><i className="ri-search-line"></i> 查询</button>
                        <button className="btn outline">重置</button>
                    </div>
                </div>
            }
            // 2. 工具栏
            toolbar={
                <>
                    <div style={{fontWeight:'bold', fontSize:'16px'}}>设备台账列表</div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button className="btn btn-primary" onClick={() => handleEdit({})}><i className="ri-add-line"></i> 新增设备</button>
                        <button className="btn outline" disabled={selectedIds.length === 0}><i className="ri-delete-bin-line"></i> 批量删除</button>
                        <button className="btn outline"><i className="ri-download-line"></i> 导出</button>
                    </div>
                </>
            }
            // 3. 底部 (Pagination)
            footer={null} // QueryTable 自带了
        >
            {/* 4. 核心表格 */}
            <QueryTable
                columns={columns}
                dataSource={mockData}
                pagination={{ current: 1, pageSize: 10, total: 100 }}
                onPageChange={(p) => console.log('Page:', p)}
                rowSelection={true}
                onSelectChange={(keys) => setSelectedIds(keys)}
            />

            {/* 5. 弹窗表单 */}
            <BaseModal
                visible={modalVisible}
                title={currentRecord.id ? "编辑设备" : "新增设备"}
                width="700px"
                onClose={() => setModalVisible(false)}
                onOk={handleSave}
            >
                <SmartForm
                    fields={editFields}
                    data={currentRecord}
                    onChange={(k, v) => setCurrentRecord({...currentRecord, [k]: v})}
                    columns={2}
                />
            </BaseModal>
        </PageLayout>
    );
};

export default ComponentDemo;