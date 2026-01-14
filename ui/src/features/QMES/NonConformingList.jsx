/**
 * @file: src/features/QMES/NonConformingList.jsx
 * @version: v8.0.0 (Mock Data for Full Workflow)
 * @description: 不合格品处置列表 - 包含覆盖全流程的模拟数据
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import NonConformingDetail from './NonConformingDetail';

const NonConformingList = () => {
    // --- 状态管理 ---
    const [queryParams, setQueryParams] = useState({ keyword: '', status: '' });
    const [detailVisible, setDetailVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // --- 模拟数据 (覆盖全流程状态) ---
    const [dataList, setDataList] = useState([
        {
            id: 'NCR-2026-001', date: '2026-01-14', name: 'PET基膜', qty: '20卷', step: 'IQC',
            type: '原材料', status: 'DRAFT', desc: '厚度不均，CPK < 1.0',
            creator: '张三'
        },
        {
            id: 'NCR-2026-002', date: '2026-01-13', name: 'HC-OCA-50u', qty: '500m', step: '涂布',
            type: '半成品', status: 'PENDING_HEAD', desc: '表面检测仪报晶点超标',
            finder: '李四', createTime: '2026-01-13 10:00'
        },
        {
            id: 'NCR-2026-003', date: '2026-01-12', name: '离型膜', qty: '1000m', step: '分切',
            type: '半成品', status: 'PENDING_QA', desc: '端面不齐',
            confirmer: '王经理', confirmDate: '2026-01-12 14:00'
        },
        {
            id: 'NCR-2026-004', date: '2026-01-11', name: '保护膜', qty: '50卷', step: '包装',
            type: '成品', status: 'PENDING_REVIEW', desc: '标签打印错误',
            level: '一般', respDept: ['生产部', '品质部'], // 多部门会签中
            qaPerson: '赵QA', qaDate: '2026-01-11 16:00'
        },
        {
            id: 'NCR-2026-005', date: '2026-01-10', name: '光学胶', qty: '200kg', step: '配料',
            type: '原材料', status: 'PENDING_FINAL', desc: '粘度异常',
            level: '严重', respDept: ['研发部', '工艺部'],
            rdResult: '报废', rdComment: '配方比例错误，无法修复', rdSign: '钱研发',
            peResult: '报废', peComment: '同意研发意见', peSign: '孙工艺'
        },
        {
            id: 'NCR-2026-006', date: '2026-01-09', name: 'UV胶水', qty: '10kg', step: 'IQC',
            type: '原材料', status: 'CLOSED', desc: '过期',
            finalResult: '报废', finalConclusion: '批准报废，扣除供应商货款。', finalSign: '周总'
        }
    ]);

    // --- 状态配置 ---
    const getStatusConfig = (status) => {
        const map = {
            'DRAFT': { t: '草稿', c: '#999', action: '编辑' },
            'PENDING_HEAD': { t: '待部门确认', c: '#faad14', action: '去确认' },
            'PENDING_QA': { t: '待品质确认', c: '#13c2c2', action: '去分发' },
            'PENDING_REVIEW': { t: '会签中', c: '#722ed1', action: '去评审' },
            'PENDING_FINAL': { t: '待最终结论', c: '#eb2f96', action: '去结案' },
            'CLOSED': { t: '已结案', c: '#52c41a', action: '查看' }
        };
        return map[status] || { t: status, c: '#333', action: '查看' };
    };

    const handleOpenDetail = (record, editMode) => {
        const initData = record || {
            id: `NCR-2026-${Math.floor(Math.random() * 1000)}`,
            status: 'DRAFT',
            date: new Date().toISOString().split('T')[0],
            qty: '',
            step: ''
        };
        setCurrentRecord(initData);
        setIsEditing(editMode);
        setDetailVisible(true);
    };

    const handleSubmit = (newData, msg) => {
        setDataList(prev => {
            const exists = prev.find(p => p.id === newData.id);
            if(exists) return prev.map(p => p.id === newData.id ? newData : p);
            return [newData, ...prev];
        });
        // 不关闭弹窗，模拟连续操作，或者刷新列表
        alert(msg || '保存成功');
        setDetailVisible(false);
    };

    const columns = [
        { title: '单据编号', dataIndex: 'id', width: 140, fixed: 'left' },
        { title: '发生日期', dataIndex: 'date', width: 120 },
        { title: '品名', dataIndex: 'name', width: 120 },
        { title: '类型', dataIndex: 'type', width: 80 },
        { title: '工序', dataIndex: 'step', width: 80 },
        { title: '数量', dataIndex: 'qty', width: 80 },
        {
            title: '状态', dataIndex: 'status', width: 120,
            render: v => {
                const conf = getStatusConfig(v);
                return <span style={{ color: conf.c, background: `${conf.c}15`, padding: '2px 8px', borderRadius: '4px', fontSize: '12px', border: `1px solid ${conf.c}30` }}>{conf.t}</span>;
            }
        },
        {
            title: '操作', key: 'op', fixed: 'right', width: 140,
            render: (_, r) => {
                const conf = getStatusConfig(r.status);
                return (
                    <div style={{display:'flex', gap:'8px'}}>
                        <button className="small-btn outline" onClick={() => handleOpenDetail(r, false)}>查看</button>
                        {r.status !== 'CLOSED' && (
                            <button className="small-btn outline" style={{color:'#1890ff', borderColor:'#1890ff'}} onClick={() => handleOpenDetail(r, true)}>
                                {conf.action}
                            </button>
                        )}
                    </div>
                );
            }
        }
    ];

    const filteredData = dataList.filter(item => !queryParams.keyword || item.id.includes(queryParams.keyword) || item.name.includes(queryParams.keyword));

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '单号/品名' },
                        { label: '状态', name: 'status', type: 'select', options: Object.keys(getStatusConfig('')).map(k=>({value:k, label:getStatusConfig(k).t})) }
                    ]}
                    data={queryParams}
                    onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{fontWeight:'bold', fontSize:'16px'}}>不合格品处置列表 (HC/R-23-1-01)</div>
                    <button className="btn btn-primary" onClick={() => handleOpenDetail(null, true)}><i className="ri-add-line"></i> 开具处置单</button>
                </>
            }
        >
            <QueryTable columns={columns} dataSource={filteredData} pagination={{total: filteredData.length, current:1}} onPageChange={()=>{}} />

            <NonConformingDetail
                visible={detailVisible}
                record={currentRecord}
                isEditing={isEditing}
                onClose={() => setDetailVisible(false)}
                onSubmit={handleSubmit}
            />
        </PageLayout>
    );
};

export default NonConformingList;