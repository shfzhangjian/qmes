/**
 * @file: src/context/SimulationContext.jsx
 * @version: v1.0.0 (Global State Init)
 * @description: 模拟业务数据上下文
 * 负责管理演示场景中的核心状态：异常单据流转、动态待办列表、全局弹窗控制。
 * 实现了文档中定义的 Ticket 模型和跨角色待办分发逻辑。
 * @lastModified: 2026-01-13 23:30:00
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { AppContext } from './AppContext';

export const SimulationContext = createContext();

export const SimulationProvider = ({ children }) => {
    const { currentUser } = useContext(AppContext);

    // --- 1. 全局弹窗状态管理 ---
    // activeModal: 'standard-import' | 'production-entry' | 'ticket-process' | null
    const [activeModal, setActiveModal] = useState(null);
    const [modalData, setModalData] = useState(null); // 传递给弹窗的上下文数据

    // --- 2. 模拟数据库：异常单据 (Tickets) ---
    const [tickets, setTickets] = useState([
        // 预置一条已流转到 QC 的单据，方便演示
        {
            id: 'HC/R-23-1-33',
            status: 'PENDING_VERIFY',
            initiator: '张操作',
            type: 'Quality',
            description: '原材料 PET 基膜表面存在晶点，影响涂布外观。',
            containment: '冻结该批次原料，切换备用供应商材料生产。 (王经理)',
            rootCause: '供应商生产环境洁净度不足，导致异物混入。 (赵工艺)',
            solution: '供应商已提交 8D 报告，并加装在线检测仪。 (赵工艺)',
            logs: [
                { role: 'OP', action: '发起', time: '2026-01-12 09:30' },
                { role: 'MGR', action: '围堵', time: '2026-01-12 10:15' },
                { role: 'PE', action: '分析', time: '2026-01-13 14:00' }
            ]
        }
    ]);

    // --- 3. 模拟数据库：待办事项 (Todos) ---
    // 根据角色动态生成，并随 ticket 状态变化而变化
    const [todos, setTodos] = useState([]);

    // 初始化/重置待办数据
    useEffect(() => {
        if (!currentUser) return;

        const role = currentUser.role;
        let baseTodos = [];

        // 3.1 基于文档规划的初始待办
        if (role === 'ADM') {
            baseTodos = [
                { id: 'ADM-01', title: '导入新版《进料检验标准》V2.0', type: 'task', status: 'pending', action: 'standard-import' },
                { id: 'ADM-02', title: '新员工账号开通申请', type: 'approval', status: 'pending' }
            ];
        } else if (role === 'OP') {
            baseTodos = [
                { id: 'OP-01', title: '10:00 节点工艺参数查录', type: 'record', status: 'pending', action: 'production-entry' },
                { id: 'OP-02', title: '涂布头清洁度检查 (SOP要求)', type: 'check', status: 'pending' }
            ];
        } else if (role === 'MGR') {
            baseTodos = [
                { id: 'MGR-01', title: 'HC-Film-T92 试产方案审批', type: 'approval', status: 'pending' }
            ];
        } else if (role === 'PE') {
            baseTodos = [
                { id: 'PE-01', title: 'RTO 蓄热体清理保养', type: 'maintenance', status: 'pending' }
            ];
        } else if (role === 'QC') {
            baseTodos = [
                { id: 'QC-01', title: '工单 WO-20260113 首件确认', type: 'check', status: 'pending' }
            ];
        }

        // 3.2 将 Tickets 映射为待办
        const ticketTodos = tickets.map(t => {
            // 逻辑：根据 Ticket 状态分发给不同角色
            if (t.status === 'PENDING_CONFIRM' && role === 'MGR') {
                return { id: `T-CONFIRM-${t.id}`, title: `异常初步确认: ${t.description.substring(0, 10)}...`, type: 'abnormal', status: 'pending', action: 'ticket-process', data: t };
            }
            if (t.status === 'PENDING_ANALYSIS' && (role === 'PE' || role === 'EQ')) {
                return { id: `T-ANALYZE-${t.id}`, title: `异常根因分析: ${t.id}`, type: 'abnormal', status: 'pending', action: 'ticket-process', data: t };
            }
            if (t.status === 'PENDING_VERIFY' && role === 'QC') {
                return { id: `T-VERIFY-${t.id}`, title: `纠正措施效果验证: ${t.id}`, type: 'abnormal', status: 'pending', action: 'ticket-process', data: t };
            }
            return null;
        }).filter(Boolean);

        setTodos([...baseTodos, ...ticketTodos]);

    }, [currentUser, tickets]);

    // --- 4. 核心 Action：打开功能弹窗 ---
    const openModal = (type, data = null) => {
        setModalData(data);
        setActiveModal(type);
    };

    const closeModal = () => {
        setActiveModal(null);
        setModalData(null);
    };

    // --- 5. 业务逻辑 Action ---

    // [OP] 发起异常
    const createTicket = (newTicket) => {
        const ticket = {
            ...newTicket,
            id: `HC/R-26-${Math.floor(Math.random() * 1000)}`,
            status: 'PENDING_CONFIRM',
            initiator: currentUser.name,
            logs: [{ role: 'OP', action: '发起', time: new Date().toLocaleString() }]
        };
        setTickets(prev => [ticket, ...prev]);
        return ticket;
    };

    // [MGR/PE/QC] 更新单据流转
    const updateTicket = (ticketId, updates, nextStatus) => {
        setTickets(prev => prev.map(t => {
            if (t.id === ticketId) {
                return {
                    ...t,
                    ...updates,
                    status: nextStatus,
                    logs: [...t.logs, { role: currentUser.role, action: getActionName(nextStatus), time: new Date().toLocaleString() }]
                };
            }
            return t;
        }));
    };

    const getActionName = (status) => {
        if (status === 'PENDING_ANALYSIS') return '确认&围堵';
        if (status === 'PENDING_VERIFY') return '分析&对策';
        if (status === 'CLOSED') return '验证&结案';
        return '更新';
    };

    // [IT] 导入标准
    const importStandard = () => {
        // 模拟耗时，然后移除 ADM 的待办
        setTimeout(() => {
            setTodos(prev => prev.filter(t => t.id !== 'ADM-01'));
            alert("导入成功！标准库已更新。");
            closeModal();
        }, 1000);
    };

    return (
        <SimulationContext.Provider value={{
            tickets, todos,
            activeModal, modalData,
            openModal, closeModal,
            createTicket, updateTicket, importStandard
        }}>
            {children}
        </SimulationContext.Provider>
    );
};