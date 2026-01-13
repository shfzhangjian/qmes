/**
 * @file: src/context/SimulationContext.jsx
 * @description: 模拟业务数据层 - 管理异常单据、生产记录及流程状态流转
 * @version: v1.0.0
 */
import React, { createContext, useState, useEffect } from 'react';

export const SimulationContext = createContext();

export const SimulationProvider = ({ children }) => {
    // --- 1. 模拟数据库 (State) ---

    // A. 异常单据列表
    const [abnormalTickets, setAbnormalTickets] = useState([
        {
            id: 'HC/R-23-1-45',
            status: 'PENDING_CONFIRM', // 待确认
            type: '工艺异常',
            level: '轻微',
            desc: '涂布头出胶不均，造成连续3米厚度超差',
            initiator: '张操作',
            createTime: '2026-01-13 09:30',
            // 流程节点数据
            confirmData: null, // MGR 确认数据
            analysisData: null, // PE 分析数据
            verifyData: null    // QC 验证数据
        },
        {
            id: 'HC/R-23-1-42',
            status: 'PENDING_VERIFY', // 待验证
            type: '质量异常',
            level: '一般',
            desc: '分切端面毛刺超标 > 0.5mm',
            initiator: '李质检',
            createTime: '2026-01-12 14:00',
            confirmData: { user: '王经理', time: '2026-01-12 14:30', note: '已隔离不良品' },
            analysisData: { user: '赵工艺', time: '2026-01-12 16:00', cause: '刀模磨损', solution: '更换刀模' },
            verifyData: null
        }
    ]);

    // B. 生产记录
    const [productionRecords, setProductionRecords] = useState([
        { id: 1, machine: 'No.3 涂布机', speed: 45.2, temp: 120.5, tension: 25.0, time: '2026-01-13 09:00', user: '张操作' }
    ]);

    // C. 系统标准库状态
    const [standardLibraryStatus, setStandardLibraryStatus] = useState({
        coverage: 99.2, // 覆盖率
        missing: ['HC-OCA-2026 FQC标准'] // 缺失项
    });

    // --- 2. Action 方法 (模拟 API 调用) ---

    // 发起异常
    const createAbnormalTicket = (ticketData) => {
        const newTicket = {
            id: `HC/R-26-${Math.floor(Math.random() * 1000)}`,
            status: 'PENDING_CONFIRM',
            createTime: new Date().toLocaleString(),
            ...ticketData
        };
        setAbnormalTickets(prev => [newTicket, ...prev]);
        return newTicket;
    };

    // 推进流程 (MGR确认 -> PE分析 -> QC验证)
    const updateTicketFlow = (ticketId, actionType, payload) => {
        setAbnormalTickets(prev => prev.map(ticket => {
            if (ticket.id !== ticketId) return ticket;

            let updates = {};
            switch (actionType) {
                case 'CONFIRM': // MGR 确认
                    updates = {
                        status: 'PENDING_ANALYSIS',
                        confirmData: { ...payload, time: new Date().toLocaleString() }
                    };
                    break;
                case 'ANALYZE': // PE 分析
                    updates = {
                        status: 'PENDING_VERIFY',
                        analysisData: { ...payload, time: new Date().toLocaleString() }
                    };
                    break;
                case 'VERIFY': // QC 验证
                    updates = {
                        status: 'CLOSED',
                        verifyData: { ...payload, time: new Date().toLocaleString() }
                    };
                    break;
                default:
                    break;
            }
            return { ...ticket, ...updates };
        }));
    };

    // 提交生产记录
    const addProductionRecord = (record) => {
        setProductionRecords(prev => [{ id: Date.now(), ...record, time: new Date().toLocaleString() }, ...prev]);
    };

    // 导入标准 (IT场景)
    const importStandard = () => {
        setStandardLibraryStatus({
            coverage: 100,
            missing: []
        });
    };

    // --- 3. 辅助查询 ---

    // 获取当前角色的待办数
    const getTodoCount = (role) => {
        if (role === 'MGR') return abnormalTickets.filter(t => t.status === 'PENDING_CONFIRM').length;
        if (role === 'PE' || role === 'EQ') return abnormalTickets.filter(t => t.status === 'PENDING_ANALYSIS').length;
        if (role === 'QC') return abnormalTickets.filter(t => t.status === 'PENDING_VERIFY').length;
        return 0;
    };

    const value = {
        abnormalTickets,
        productionRecords,
        standardLibraryStatus,
        createAbnormalTicket,
        updateTicketFlow,
        addProductionRecord,
        importStandard,
        getTodoCount
    };

    return (
        <SimulationContext.Provider value={value}>
            {children}
        </SimulationContext.Provider>
    );
};