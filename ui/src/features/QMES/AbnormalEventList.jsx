/**
 * @file: src/features/QMES/AbnormalEventList.jsx
 * @version: v2.1.0 (Full Process Simulation)
 * @description: 异常事件处置单列表管理
 * - [Data] 2026-01-14: 重构模拟数据，覆盖异常处理全生命周期(草稿->确认->围堵->分析->验证->结案)，方便演示。
 * - [UI] 2026-01-14: 根据状态动态显示操作按钮文本(如: 去确认, 去分析)，增强流程引导性。
 * @author: AI Copilot
 * @lastModified: 2026-01-14 14:30:00
 */
import React, { useState, useMemo } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import AbnormalEventDetail from './AbnormalEventDetail'; // 引入详情组件

// --- 简单的 Toast 提示 ---
const Toast = ({ message, type = 'info', onClose }) => {
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

const AbnormalEventList = () => {
    // --- 1. 列表状态 ---
    const [queryParams, setQueryParams] = useState({ dateRange: '', dept: '', keyword: '' });
    const [toast, setToast] = useState(null);

    // --- 2. 详情弹窗状态 ---
    const [detailVisible, setDetailVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // --- 3. 全流程模拟数据 (覆盖所有状态节点) ---
    const [dataList, setDataList] = useState([
        // 1. 草稿状态
        { id: 'ABN-2026-010', date: '2026-01-14', dept: '生产部', type: '设备异常', level: '一般', status: 'DRAFT', desc: '模切机刀模异常磨损，需更换 (草稿)' },

        // 2. 待初步确认 (发现人提交 -> 部门主管确认)
        { id: 'ABN-2026-008', date: '2026-01-14', dept: '生产部', type: '工艺异常', level: '轻微', status: 'PENDING_CONFIRM', desc: '涂布速度参数与SOP不符，操作员误调' },

        // 3. 待品质确认 (部门确认 -> 品质定性)
        { id: 'ABN-2026-007', date: '2026-01-13', dept: '工艺部', type: '质量异常', level: '一般', status: 'PENDING_QA_CONFIRM', desc: '首件检验厚度CPK不足1.33' },

        // 4. 待围堵 (品质定性 -> 临时措施)
        { id: 'ABN-2026-006', date: '2026-01-13', dept: '仓储部', type: '物料异常', level: '严重', status: 'PENDING_CONTAINMENT', desc: '原材料标签混料，库存需隔离' },

        // 5. 待根因分析 (已围堵 -> 填写8D分析/CAPA)
        { id: 'ABN-2026-005', date: '2026-01-12', dept: '生产部', type: '设备异常', level: '严重', status: 'PENDING_ANALYSIS', desc: '涂布机张力传感器数值跳动，导致周期性横纹' },

        // 6. 待效果验证 (措施已实施 -> 品质验证)
        { id: 'ABN-2026-004', date: '2026-01-10', dept: '厂务部', type: '厂务系统异常', level: '一般', status: 'PENDING_VERIFY', desc: '洁净室温湿度失控，空调机组故障已修缮' },

        // 7. 已结案
        { id: 'ABN-2026-001', date: '2026-01-05', dept: 'IT部', type: 'IT系统异常', level: '轻微', status: 'CLOSED', desc: 'MES系统标签打印服务中断 (已恢复)' },

        // 8. 演示用：关联NCR且已结案
        { id: 'ABN-2026-009', date: '2026-01-08', dept: '品质部', type: '质量异常', level: '严重', status: 'CLOSED', desc: '客户端投诉OCA溢胶 (关联NCR处置)', isRelated: '是', relatedNcrId: 'NCR-2026-055' },
    ]);

    // --- 4. 过滤逻辑 ---
    const filteredData = useMemo(() => {
        return dataList.filter(item => {
            const matchDept = !queryParams.dept || item.dept === queryParams.dept;
            const matchKw = !queryParams.keyword ||
                item.id.toLowerCase().includes(queryParams.keyword.toLowerCase()) ||
                item.desc.toLowerCase().includes(queryParams.keyword.toLowerCase()) ||
                item.type.includes(queryParams.keyword);
            return matchDept && matchKw;
        });
    }, [dataList, queryParams]);

    // --- 5. 交互处理 ---
    const showToast = (msg, type = 'info') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleOpenDetail = (record, editMode) => {
        // 如果是新增，初始化默认数据
        const newRecord = {
            id: `ABN-2026-${Math.floor(Math.random() * 1000)}`,
            status: 'DRAFT',
            date: new Date().toISOString().split('T')[0],
            dept: '生产部'
        };
        setCurrentRecord(record || newRecord);
        setIsEditing(editMode);
        setDetailVisible(true);
    };

    const handleDetailSubmit = (updatedRecord, msg) => {
        // 模拟状态流转逻辑 (演示用)
        let nextStatus = updatedRecord.status;

        // 简单的自动流转映射
        const statusFlow = {
            'DRAFT': 'PENDING_CONFIRM',
            'PENDING_CONFIRM': 'PENDING_QA_CONFIRM',
            'PENDING_QA_CONFIRM': 'PENDING_CONTAINMENT',
            'PENDING_CONTAINMENT': 'PENDING_ANALYSIS',
            'PENDING_ANALYSIS': 'PENDING_VERIFY',
            'PENDING_VERIFY': 'CLOSED' // 验证通过即结案
        };

        // 如果是提交操作（非保存草稿），则推进状态
        if (msg.includes('提交') && statusFlow[updatedRecord.status]) {
            nextStatus = statusFlow[updatedRecord.status];
            updatedRecord.status = nextStatus;
            msg = `操作成功！流程流转至：${getStatusConfig(nextStatus).t}`;
        }

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

    // 辅助函数：获取状态配置
    const getStatusConfig = (status) => {
        const map = {
            'DRAFT': { t: '草稿', c: '#999', action: '编辑' },
            'PENDING_CONFIRM': { t: '待初步确认', c: '#faad14', action: '去确认' },
            'PENDING_QA_CONFIRM': { t: '待品质确认', c: '#faad14', action: '品质定性' },
            'PENDING_CONTAINMENT': { t: '待围堵', c: '#faad14', action: '填写围堵' },
            'PENDING_ANALYSIS': { t: '待根因分析', c: '#1890ff', action: '填写分析' },
            'PENDING_VERIFY': { t: '待效果验证', c: '#722ed1', action: '验证效果' },
            'CLOSED': { t: '已结案', c: '#52c41a', action: '查看' }
        };
        return map[status] || { t: status, c: '#333', action: '查看' };
    };

    // --- 6. 列定义 ---
    const columns = [
        { title: '单据编号', dataIndex: 'id', width: 140, fixed: 'left' },
        { title: '发现时间', dataIndex: 'date', width: 120 },
        { title: '责任部门', dataIndex: 'dept', width: 100 },
        { title: '异常类别', dataIndex: 'type', width: 100 },
        {
            title: '等级', dataIndex: 'level', width: 80,
            render: v => <span style={{ fontWeight: v === '严重' ? 'bold' : 'normal', color: v === '严重' ? '#ff4d4f' : 'inherit' }}>{v}</span>
        },
        { title: '异常描述', dataIndex: 'desc', width: 250 },
        {
            title: '当前状态', dataIndex: 'status', width: 120,
            render: v => {
                const conf = getStatusConfig(v);
                return (
                    <span style={{
                        color: conf.c,
                        background: `${conf.c}15`,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        border: `1px solid ${conf.c}30`
                    }}>
                        {conf.t}
                    </span>
                );
            }
        },
        {
            title: '操作', key: 'action', fixed: 'right', width: 140,
            render: (_, r) => {
                const conf = getStatusConfig(r.status);
                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {/* 始终显示查看按钮 */}
                        <button className="small-btn outline" onClick={() => handleOpenDetail(r, false)}>查看</button>

                        {/* 根据状态动态显示处理按钮 */}
                        {r.status !== 'CLOSED' && (
                            <button
                                className="small-btn outline"
                                style={{ color: '#1890ff', borderColor: '#1890ff' }}
                                onClick={() => handleOpenDetail(r, true)}
                            >
                                {/* 显示具体的动作名称，如：去确认、填写分析 */}
                                {conf.action}
                            </button>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '搜单号/描述/类型', span: 1 },
                        { label: '责任部门', name: 'dept', type: 'select', options: [{ value: '生产部', label: '生产部' }, { value: '品质部', label: '品质部' }, { value: '工艺部', label: '工艺部' }], span: 1 },
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
                    <button className="btn btn-primary" onClick={() => handleOpenDetail(null, true)}>
                        <i className="ri-add-line"></i> 发起异常
                    </button>
                </>
            }
        >
            {toast && <Toast message={toast.message} type={toast.type} />}

            <QueryTable
                columns={columns}
                dataSource={filteredData}
                pagination={{ total: filteredData.length, current: 1, pageSize: 10 }}
                onPageChange={() => { }}
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