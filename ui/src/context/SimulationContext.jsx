/**
 * @file: src/context/SimulationContext.jsx
 * @version: v3.0.0 (Native Modal Support)
 * @description: 模拟业务数据上下文
 * 核心升级：
 * - [Fix] 修复 Dashboard 弹窗风格不一致问题。
 * - [Feat] 支持 "Native Modal" 模式：对于自带完善 UI (如 AbnormalEventDetail) 的组件，
 * 不再强制包裹通用外壳，直接渲染以保持 100% 原生体验。
 */
import React, { createContext, useState, useContext, useEffect, Suspense } from 'react';
import { AppContext } from './AppContext';
import { fetchTodos } from '../services/TodoService';

// --- 1. 动态组件注册表 (配置增强) ---
// 格式: key: { component: LazyComponent, native: boolean }
// native: true 表示该组件自带 Overlay 和 Window，不需要 Context 再包一层
const RegistryConfig = {
    // 异常详情页 (自带全套 UI)
    'AbnormalEventDetail': {
        component: React.lazy(() => import('../features/QMES/AbnormalEventDetail.jsx')),
        native: true
    },
    // NCR 详情页 (自带全套 UI)
    'NonConformingDetail': {
        component: React.lazy(() => import('../features/QMES/NonConformingDetail.jsx')),
        native: true
    },
    // 默认详情页 (纯内容，需要包裹)
    'DefaultDetail': {
        component: React.lazy(() => import('../components/DetailModal.jsx')),
        native: false
    },

    // 旧功能弹窗
    'standard-import': { component: React.lazy(() => import('../features/Simulation/StandardImportModal.jsx')), native: false },
    'production-entry': { component: React.lazy(() => import('../features/Simulation/ProductionEntryModal.jsx')), native: false },
    'ticket-process': { component: React.lazy(() => import('../features/Simulation/TicketProcessModal.jsx')), native: false }
};

export const SimulationContext = createContext();

export const SimulationProvider = ({ children }) => {
    const { currentUser } = useContext(AppContext);

    // --- State ---
    const [activeModal, setActiveModal] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [CurrentModalObj, setCurrentModalObj] = useState(null); // 存储当前选中的配置对象 { component, native }

    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState([]);

    // --- Effect: 加载待办 ---
    useEffect(() => {
        if (currentUser) loadUserTodos();
    }, [currentUser]);

    const loadUserTodos = async () => {
        setLoading(true);
        try {
            const data = await fetchTodos({ role: currentUser.role });
            setTodos(data);
        } catch (e) {
            console.error("Failed to load todos:", e);
        } finally {
            setLoading(false);
        }
    };

    // --- Action: 打开动态详情 ---
    const openTodoDetail = (todoItem) => {
        const key = todoItem.componentKey || 'DefaultDetail';
        const config = RegistryConfig[key] || RegistryConfig['DefaultDetail'];

        setCurrentModalObj(config);
        setModalData(todoItem.rawData || todoItem);
        setActiveModal('dynamic-detail-view');
    };

    // --- Action: 打开普通弹窗 ---
    const openModal = (type, data = null) => {
        const config = RegistryConfig[type];
        if (config) {
            setCurrentModalObj(config);
            setModalData(data);
            setActiveModal(type);
        } else {
            // 兼容未注册的旧逻辑 (纯标记)
            setCurrentModalObj(null);
            setModalData(data);
            setActiveModal(type);
        }
    };

    const closeModal = () => {
        setActiveModal(null);
        setModalData(null);
        setCurrentModalObj(null);
    };

    // --- Business Actions ---
    const createTicket = (newTicket) => {
        const ticketId = `HC/R-26-${Math.floor(Math.random() * 1000)}`;
        const ticket = { ...newTicket, id: ticketId, status: 'PENDING_CONFIRM', createTime: new Date().toLocaleString() };
        setTickets(prev => [ticket, ...prev]);
        setTodos(prev => [{
            id: `TASK-${ticketId}`, type: 'red', tag: '异常', text: `(新) ${ticket.description}`, priority: '高', status: '待办', time: '刚刚', componentKey: 'AbnormalEventDetail', rawData: ticket
        }, ...prev]);
        return ticket;
    };

    const importStandard = () => {
        setTimeout(() => {
            alert("导入成功！标准库已更新。");
            setTodos(prev => prev.filter(t => t.id !== 'ADM-2026-001'));
            closeModal();
        }, 800);
    };

    const updateTicket = (id, updates) => {
        setTodos(prev => prev.map(item => {
            if (item.rawData && item.rawData.id === id) {
                const newRaw = { ...item.rawData, ...updates };
                return { ...item, rawData: newRaw, status: newRaw.status === 'CLOSED' ? '已完成' : item.status };
            }
            return item;
        }));
    };

    // --- 渲染逻辑 ---
    // 提取当前组件
    const ModalComponent = CurrentModalObj?.component;
    const isNative = CurrentModalObj?.native;

    return (
        <SimulationContext.Provider value={{
            todos, loading, tickets, activeModal, modalData,
            refreshTodos: loadUserTodos, openTodoDetail, openModal, closeModal,
            createTicket, updateTicket, importStandard
        }}>
            {children}

            {/* --- 全局弹窗挂载点 --- */}
            {activeModal && ModalComponent && (
                <Suspense fallback={<div className="aip-global-loading"><i className="ri-loader-4-line spin"></i> 加载中...</div>}>

                    {/* 分支 1: Native 模式 (AbnormalEventDetail 等) */}
                    {/* 直接渲染组件，不加任何外壳，让组件自己控制 Overlay 和 Window */}
                    {isNative ? (
                        <ModalComponent
                            visible={true}         // 兼容旧属性名
                            isOpen={true}          // 兼容新属性名
                            data={modalData}       // 数据
                            record={modalData}     // 兼容旧属性名
                            onClose={closeModal}   // 关闭回调
                            onUpdate={updateTicket}
                            // 关键：不传 isModal={true} 或者传 false，让组件保持其 "独立窗口" 的样式 (带阴影、带遮罩)
                            isModal={false}
                        />
                    ) : (
                        // 分支 2: 通用模式 (DefaultDetail 等)
                        // 使用通用白色外壳包裹
                        <div className="aip-global-overlay open" style={{ zIndex: 1050 }}>
                            <div className="aip-modal-container" style={defaultContainerStyle}>
                                <div className="aip-modal-header" style={defaultHeaderStyle}>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                                        {modalData?.title || '任务详情'}
                                    </div>
                                    <i className="ri-close-line" onClick={closeModal} style={{ fontSize: '24px', cursor: 'pointer' }}></i>
                                </div>
                                <div className="aip-modal-body" style={{ flex: 1, overflowY: 'auto' }}>
                                    <ModalComponent
                                        data={modalData}
                                        isOpen={true}
                                        onClose={closeModal}
                                        onUpdate={updateTicket}
                                        isModal={true} // 告诉内部组件它是被包裹的
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </Suspense>
            )}

            <style>{`
                .aip-global-overlay {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(3px);
                    display: flex; justify-content: center; align-items: center;
                    opacity: 1; pointer-events: auto;
                }
                .aip-global-loading {
                    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.7); color: white; padding: 15px 30px;
                    border-radius: 4px; z-index: 9999; display: flex; align-items: center; gap: 10px;
                }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </SimulationContext.Provider>
    );
};

// 样式常量
const defaultContainerStyle = {
    width: '900px', height: '85vh', background: '#fff', borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
};
const defaultHeaderStyle = {
    padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa'
};