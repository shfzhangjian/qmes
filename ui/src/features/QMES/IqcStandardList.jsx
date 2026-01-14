/**
 * @file: src/features/QMES/IqcStandardList.jsx
 * @version: v2.1.0 (Full Feature)
 * @description: 进料检验标准管理列表 (IQC-STD)
 * - [Refactor] 2026-01-14: 完全对齐 AbnormalEventList 结构 (分页, Toast, 状态配置)
 * - [UI] 增加状态标签颜色与操作引导按钮
 */
import React, { useState, useMemo } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import IqcStandardDetail from './IqcStandardDetail'; // 引入详情组件

// --- 简单的 Toast 提示 (与 AbnormalEventList 保持一致) ---
const Toast = ({ message, type = 'info' }) => {
    return (
        <div style={{
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            background: type === 'success' ? '#f6ffed' : '#e6f7ff', border: '1px solid #b7eb8f',
            padding: '10px 20px', borderRadius: '4px', zIndex: 3500, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
            {message}
        </div>
    );
};

const IqcStandardList = () => {
    // --- 1. 列表状态 ---
    const [queryParams, setQueryParams] = useState({ keyword: '', category: '' });
    const [toast, setToast] = useState(null);

    // --- 2. 详情弹窗状态 ---
    const [detailVisible, setDetailVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // --- 3. 模拟数据 ---
    const [dataList, setDataList] = useState([
        { id: 'STD-2026-001', name: '双面胶带进料标准', model: '3M-9448A', category: '胶带类', version: 'A/1', updater: '张工艺', updateTime: '2026-01-10', status: 'ACTIVE' },
        { id: 'STD-2026-002', name: 'PET离型膜检验标准', model: 'PET-75-SK', category: '薄膜类', version: 'B/2', updater: '李质量', updateTime: '2026-01-12', status: 'DRAFT' },
        { id: 'STD-2026-003', name: 'OCA光学胶检验标准', model: 'Mitsubishi-250', category: '胶类', version: 'A/0', updater: '王研发', updateTime: '2026-01-13', status: 'ACTIVE' },
        { id: 'STD-2026-004', name: '泡棉缓冲垫标准', model: 'PORON-0.5', category: '辅材', version: 'A/0', updater: '赵工程', updateTime: '2026-01-14', status: 'OBSOLETE' },
    ]);

    // --- 4. 过滤逻辑 ---
    const filteredData = useMemo(() => {
        return dataList.filter(item => {
            const matchKw = !queryParams.keyword ||
                item.name.toLowerCase().includes(queryParams.keyword.toLowerCase()) ||
                item.model.toLowerCase().includes(queryParams.keyword.toLowerCase());
            const matchCat = !queryParams.category || item.category === queryParams.category;
            return matchKw && matchCat;
        });
    }, [dataList, queryParams]);

    // --- 5. 交互处理 ---
    const showToast = (msg, type = 'info') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleOpenDetail = (record, editMode = false) => {
        // 新增初始化逻辑
        if (!record) {
            const newRecord = {
                id: 'NEW',
                name: '',
                model: '',
                category: '',
                version: 'A/0',
                date: new Date().toISOString().split('T')[0],
                items: [],
                status: 'DRAFT'
            };
            setCurrentRecord(newRecord);
        } else {
            setCurrentRecord({ ...record });
        }

        setIsEditing(editMode);
        setDetailVisible(true);
    };

    const handleDetailSubmit = (updatedRecord) => {
        // 模拟保存逻辑
        let msg = '保存成功';
        if (updatedRecord.id === 'NEW') {
            // 模拟生成 ID
            const newId = `STD-2026-${String(dataList.length + 1).padStart(3, '0')}`;
            const newItem = { ...updatedRecord, id: newId, status: 'ACTIVE', updateTime: new Date().toISOString().split('T')[0] };
            setDataList(prev => [newItem, ...prev]);
            msg = `新建标准成功：${newId}`;
        } else {
            setDataList(prev => prev.map(item => item.id === updatedRecord.id ? { ...updatedRecord, updateTime: new Date().toISOString().split('T')[0] } : item));
            msg = '标准更新成功';
        }

        showToast(msg, 'success');
        setDetailVisible(false);
    };

    const handleDelete = (id) => {
        if(window.confirm('确认删除该标准？此操作不可恢复。')) {
            setDataList(prev => prev.filter(item => item.id !== id));
            showToast('删除成功', 'success');
        }
    };

    // 辅助函数：获取状态配置
    const getStatusConfig = (status) => {
        const map = {
            'DRAFT': { t: '草稿', c: '#faad14', bg: '#fffbe6' },
            'ACTIVE': { t: '生效中', c: '#52c41a', bg: '#f6ffed' },
            'OBSOLETE': { t: '已作废', c: '#ff4d4f', bg: '#fff1f0' }
        };
        return map[status] || { t: status, c: '#333', bg: '#f5f5f5' };
    };

    // --- 6. 列定义 ---
    const columns = [
        { title: '标准编号', dataIndex: 'id', width: 140, fixed: 'left' },
        {
            title: '标准名称', dataIndex: 'name', width: 200,
            render: (t, r) => <a onClick={() => handleOpenDetail(r, false)} style={{fontWeight: 'bold', color:'#1890ff', cursor:'pointer'}}>{t}</a>
        },
        { title: '适用型号', dataIndex: 'model', width: 150 },
        { title: '物料类别', dataIndex: 'category', width: 100 },
        { title: '版本', dataIndex: 'version', width: 80, align: 'center' },
        {
            title: '状态', dataIndex: 'status', width: 100, align: 'center',
            render: v => {
                const conf = getStatusConfig(v);
                return (
                    <span style={{
                        color: conf.c,
                        background: conf.bg,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        border: `1px solid ${conf.c}40`
                    }}>
                        {conf.t}
                    </span>
                );
            }
        },
        { title: '更新时间', dataIndex: 'updateTime', width: 120 },
        {
            title: '操作', key: 'action', width: 180, fixed: 'right',
            render: (_, r) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="small-btn outline" onClick={() => handleOpenDetail(r, false)}>查看</button>
                    {r.status !== 'OBSOLETE' && (
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
                    <button
                        className="btn btn-primary"
                        onClick={() => handleOpenDetail(null, true)}
                    >
                        <i className="ri-add-line"></i> 新增标准
                    </button>
                </>
            }
        >
            {toast && <Toast message={toast.message} type={toast.type} />}

            <QueryTable
                columns={columns}
                dataSource={filteredData}
                pagination={{ total: filteredData.length, current: 1, pageSize: 10 }} // 模拟分页参数
                onPageChange={() => {}} // 模拟分页回调
            />

            {/* 详情弹窗 (配置与 AbnormalEventList 逻辑一致) */}
            <IqcStandardDetail
                visible={detailVisible}
                record={currentRecord}
                isEditing={isEditing}
                isModal={true}          // 关键：确保以弹窗模式渲染 (Fixed Overlay)
                onClose={() => setDetailVisible(false)}
                onSubmit={handleDetailSubmit}
            />
        </PageLayout>
    );
};

export default IqcStandardList;