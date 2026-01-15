/**
 * @file: src/features/QMES/IqcRecordList.jsx
 * @version: v2.0.0 (Refactored)
 * @description: 进料检验记录列表 (IQC-REC)
 * - [Refactor] 严格对齐 IqcStandardList 结构与交互
 * - [UI] 引入 SmartForm, Toast, 状态标签配置
 */
import React, { useState, useMemo } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import IqcRecordDetail from './IqcRecordDetail';

// --- 通用 Toast 组件 (保持一致) ---
const Toast = ({ message, type = 'info' }) => (
    <div style={{
        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
        background: type === 'success' ? '#f6ffed' : (type === 'error' ? '#fff1f0' : '#e6f7ff'),
        border: `1px solid ${type === 'success' ? '#b7eb8f' : (type === 'error' ? '#ffa39e' : '#91d5ff')}`,
        padding: '10px 20px', borderRadius: '4px', zIndex: 3500, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        color: type === 'success' ? '#52c41a' : (type === 'error' ? '#ff4d4f' : '#1890ff'), fontWeight: 'bold'
    }}>
        <i className={`ri-${type === 'success' ? 'checkbox-circle' : (type === 'error' ? 'close-circle' : 'information')}-fill`} style={{marginRight:'5px'}}></i>
        {message}
    </div>
);

const IqcRecordList = () => {
    // --- 1. 状态管理 ---
    const [queryParams, setQueryParams] = useState({ keyword: '', result: '' });
    const [toast, setToast] = useState(null);

    const [detailVisible, setDetailVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // --- 2. 模拟数据 ---
    const [dataList, setDataList] = useState([
        { id: 'IQC-20260114-001', material: '3M双面胶-9448A', batch: 'B260110-01', supplier: '3M中国', result: 'PASS', date: '2026-01-14', inspector: '张质检', status: '已审核' },
        { id: 'IQC-20260114-002', material: 'PET离型膜-75u', batch: 'B260112-05', supplier: '康得新', result: 'FAIL', date: '2026-01-14', inspector: '李IQC', status: '待审核' },
        { id: 'IQC-20260114-003', material: 'OCA光学胶', batch: 'M250-009', supplier: '三菱', result: 'PASS', date: '2026-01-13', inspector: '王测试', status: '已审核' },
    ]);

    // --- 3. 过滤逻辑 ---
    const filteredData = useMemo(() => {
        return dataList.filter(item => {
            const matchKw = !queryParams.keyword ||
                item.material.toLowerCase().includes(queryParams.keyword.toLowerCase()) ||
                item.id.toLowerCase().includes(queryParams.keyword.toLowerCase());
            const matchRes = !queryParams.result || item.result === queryParams.result;
            return matchKw && matchRes;
        });
    }, [dataList, queryParams]);

    // --- 4. 交互处理 ---
    const showToast = (msg, type = 'info') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleOpenDetail = (record, editMode = false) => {
        if (!record) {
            // 初始化新单据
            const newRecord = {
                id: 'NEW',
                reportNo: `IQC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-XXX`,
                date: new Date().toISOString().split('T')[0],
                material: '',
                supplier: '',
                batch: '',
                result: 'PENDING',
                status: '草稿',
                items: [
                    // 默认带出一些空行
                    { id: 1, item: '外观', std: '无脏污/破损', unit: '-', vals: ['','','','',''], avg: '-', res: '' },
                    { id: 2, item: '尺寸', std: '100±0.5', unit: 'mm', vals: ['','','','',''], avg: '-', res: '' }
                ]
            };
            setCurrentRecord(newRecord);
        } else {
            setCurrentRecord({ ...record }); // Deep copy recommended in real app
        }
        setIsEditing(editMode);
        setDetailVisible(true);
    };

    const handleDetailSubmit = (updatedRecord) => {
        let msg = '保存成功';
        if (updatedRecord.id === 'NEW') {
            const newId = `IQC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(dataList.length + 1).padStart(3, '0')}`;
            const newItem = { ...updatedRecord, id: newId, status: '待审核' };
            setDataList(prev => [newItem, ...prev]);
            msg = `检验报告已生成：${newId}`;
        } else {
            setDataList(prev => prev.map(item => item.id === updatedRecord.id ? updatedRecord : item));
            msg = '检验记录更新成功';
        }
        showToast(msg, 'success');
        setDetailVisible(false);
    };

    const handleDelete = (id) => {
        if(window.confirm('确认删除此检验记录？')) {
            setDataList(prev => prev.filter(item => item.id !== id));
            showToast('删除成功', 'success');
        }
    };

    // 辅助配置
    const getResultConfig = (res) => {
        const map = {
            'PASS': { t: '合格', c: '#52c41a', bg: '#f6ffed' },
            'FAIL': { t: '不合格', c: '#ff4d4f', bg: '#fff1f0' },
            'PENDING': { t: '待定', c: '#faad14', bg: '#fffbe6' }
        };
        return map[res] || { t: res, c: '#333', bg: '#f5f5f5' };
    };

    // --- 5. 列定义 ---
    const columns = [
        { title: '报告编号', dataIndex: 'id', width: 160, fixed: 'left' },
        {
            title: '物料名称', dataIndex: 'material', width: 180,
            render: (t, r) => <a onClick={() => handleOpenDetail(r, false)} style={{fontWeight: 'bold', color:'#1890ff', cursor:'pointer'}}>{t}</a>
        },
        { title: '批次号', dataIndex: 'batch', width: 120 },
        { title: '供应商', dataIndex: 'supplier', width: 120 },
        {
            title: '检验结果', dataIndex: 'result', width: 100, align: 'center',
            render: v => {
                const conf = getResultConfig(v);
                return <span style={{color: conf.c, background: conf.bg, padding: '2px 8px', borderRadius: '4px', fontSize: '12px', border: `1px solid ${conf.c}40`, fontWeight:'bold'}}>{conf.t}</span>;
            }
        },
        { title: '检验日期', dataIndex: 'date', width: 110 },
        { title: '检验员', dataIndex: 'inspector', width: 90 },
        { title: '单据状态', dataIndex: 'status', width: 90 },
        {
            title: '操作', key: 'action', width: 180, fixed: 'right',
            render: (_, r) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="small-btn outline" onClick={() => handleOpenDetail(r, false)}>查看</button>
                    {r.status !== '已审核' && (
                        <button className="small-btn outline" style={{color:'#1890ff', borderColor:'#1890ff'}} onClick={() => handleOpenDetail(r, true)}>编辑</button>
                    )}
                    <button className="small-btn outline" style={{color:'#ff4d4f'}} onClick={() => handleDelete(r.id)}>删除</button>
                </div>
            )
        }
    ];

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '单号/物料名称', span: 1 },
                        { label: '结果', name: 'result', type: 'select', options: [{ value: 'PASS', label: '合格' }, { value: 'FAIL', label: '不合格' }], span: 1 },
                    ]}
                    data={queryParams}
                    onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{ fontWeight: 'bold' }}>进料检验记录 (IQC-REC)</div>
                    <button className="btn btn-primary" onClick={() => handleOpenDetail(null, true)}>
                        <i className="ri-add-line"></i> 新建检验单
                    </button>
                </>
            }
        >
            {toast && <Toast message={toast.message} type={toast.type} />}

            <QueryTable
                columns={columns}
                dataSource={filteredData}
                pagination={{ total: filteredData.length, current: 1, pageSize: 10 }}
            />

            <IqcRecordDetail
                visible={detailVisible}
                record={currentRecord}
                isEditing={isEditing}
                isModal={true}
                onClose={() => setDetailVisible(false)}
                onSubmit={handleDetailSubmit}
            />
        </PageLayout>
    );
};

export default IqcRecordList;