/**
 * @file: src/features/QMS/AbnormalEventList.jsx
 * @version: v2.0.0 (Separated List)
 * @description: 异常事件处置单列表管理
 * - 纯列表视图，负责查询、筛选、分页
 * - 调用 AbnormalEventDetail 进行详情查看和处理
 * - 增加关键词模糊搜索
 * @author: AI Copilot
 * @createDate: 2026-01-14
 */
import React, { useState, useMemo } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import AbnormalEventDetail from './AbnormalEventDetail'; // 引入详情组件

// --- 简单的 Toast 提示 ---
const Toast = ({ message, type = 'info', onClose }) => {
    // ... (保持原有的 Toast 代码或移至全局)
    return (
        <div style={{
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            background: type==='success'?'#f6ffed':'#e6f7ff', border: '1px solid #b7eb8f',
            padding: '10px 20px', borderRadius: '4px', zIndex: 3500, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
            {message}
        </div>
    );
};

const AbnormalEventList = () => {
    // --- 1. 列表状态 ---
    const [queryParams, setQueryParams] = useState({ dateRange: '', dept: '', keyword: '' });
    const [toast, setToast] = useState(null);

    // --- 2. 详情弹窗状态 ---
    const [detailVisible, setDetailVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // --- 3. 模拟数据 ---
    const [dataList, setDataList] = useState([
        { id: 'HC/R-23-001', date: '2026-01-12', dept: '生产部', type: '设备异常', level: '严重', status: 'PENDING_ANALYSIS', desc: '涂布机张力传感器数值跳动' },
        { id: 'HC/R-23-002', date: '2026-01-13', dept: '工艺部', type: '工艺异常', level: '轻微', status: 'CLOSED', desc: '烘箱温度曲线偏离标准' },
        { id: 'HC/R-23-003', date: '2026-01-14', dept: '品质部', type: '质量异常', level: '一般', status: 'PENDING_CONFIRM', desc: 'IQC 抽检发现批次色差' },
    ]);

    // --- 4. 过滤逻辑 (含关键词搜索) ---
    const filteredData = useMemo(() => {
        return dataList.filter(item => {
            const matchDept = !queryParams.dept || item.dept === queryParams.dept;
            // 关键词模糊匹配 ID, 描述, 类型
            const matchKw = !queryParams.keyword ||
                item.id.toLowerCase().includes(queryParams.keyword.toLowerCase()) ||
                item.desc.toLowerCase().includes(queryParams.keyword.toLowerCase()) ||
                item.type.includes(queryParams.keyword);

            return matchDept && matchKw;
        });
    }, [dataList, queryParams]);

    // --- 5. 交互处理 ---
    const showToast = (msg, type='info') => {
        setToast({message: msg, type});
        setTimeout(()=>setToast(null), 3000);
    };

    const handleOpenDetail = (record, editMode) => {
        setCurrentRecord(record || { id: `HC/R-23-NEW-${Date.now().toString().slice(-4)}`, status: 'DRAFT', date: new Date().toISOString().split('T')[0] });
        setIsEditing(editMode);
        setDetailVisible(true);
    };

    const handleDetailSubmit = (updatedRecord, msg) => {
        // 更新列表数据
        setDataList(prev => {
            const exists = prev.find(p => p.id === updatedRecord.id);
            if (exists) {
                return prev.map(p => p.id === updatedRecord.id ? updatedRecord : p);
            }
            return [updatedRecord, ...prev];
        });
        showToast(msg, 'success');
        setDetailVisible(false);
    };

    // --- 6. 列定义 ---
    const columns = [
        { title: '单据编号', dataIndex: 'id', width: 140, fixed: 'left' },
        { title: '发现时间', dataIndex: 'date', width: 120 },
        { title: '责任部门', dataIndex: 'dept', width: 100 },
        { title: '异常类别', dataIndex: 'type', width: 100 },
        { title: '等级', dataIndex: 'level', width: 80, render: v => <span style={{color:v==='严重'?'red':undefined}}>{v}</span> },
        { title: '异常描述', dataIndex: 'desc', width: 250 },
        {
            title: '当前状态', dataIndex: 'status', width: 120,
            render: v => {
                const map = {
                    'DRAFT': {t:'待发起', c:'#999'},
                    'PENDING_CONFIRM': {t:'待初步确认', c:'#faad14'},
                    'PENDING_QA_CONFIRM': {t:'待品质确认', c:'#faad14'},
                    'PENDING_CONTAINMENT': {t:'待围堵', c:'#faad14'},
                    'PENDING_ANALYSIS': {t:'待根因分析', c:'#1890ff'},
                    'PENDING_VERIFY': {t:'待效果验证', c:'#722ed1'},
                    'CLOSED': {t:'已结案', c:'#52c41a'}
                };
                const conf = map[v] || {t:v, c:'#333'};
                return <span style={{color: conf.c, background: `${conf.c}15`, padding:'2px 6px', borderRadius:'4px', fontSize:'12px'}}>{conf.t}</span>;
            }
        },
        {
            title: '操作', key: 'action', fixed: 'right', width: 140, render: (_, r) => (
                <div style={{display:'flex', gap:'8px'}}>
                    <button className="small-btn outline" onClick={() => handleOpenDetail(r, false)}>查看</button>
                    {r.status !== 'CLOSED' && (
                        <button className="small-btn outline" style={{color:'#1890ff', borderColor:'#1890ff'}} onClick={() => handleOpenDetail(r, true)}>处理</button>
                    )}
                </div>
            )
        }
    ];

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '搜单号/描述/类型', span: 1 },
                        { label: '责任部门', name: 'dept', type: 'select', options: [{ value: '生产部', label: '生产部' },{ value: '工艺部', label: '工艺部' }], span: 1 },
                        { label: '日期范围', name: 'dateRange', type: 'date', span: 1 },
                    ]}
                    data={queryParams}
                    onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{ fontWeight: 'bold' }}>异常事件处置列表 (HC/R-23-1-45)</div>
                    <button className="btn btn-primary" onClick={() => handleOpenDetail(null, true)}><i className="ri-add-line"></i> 发起异常</button>
                </>
            }
        >
            {toast && <Toast message={toast.message} type={toast.type} />}

            <QueryTable
                columns={columns}
                dataSource={filteredData}
                pagination={{ total: filteredData.length, current: 1, pageSize: 10 }}
                onPageChange={()=>{}}
            />

            {/* 详情弹窗独立组件 */}
            <AbnormalEventDetail
                visible={detailVisible}
                record={currentRecord}
                isEditing={isEditing}
                onClose={() => setDetailVisible(false)}
                onSubmit={handleDetailSubmit}
            />
        </PageLayout>
    );
};

export default AbnormalEventList;