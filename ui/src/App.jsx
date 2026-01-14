/**
 * @file: src/App.jsx
 * @version: v7.0.0 (Simulation Integration)
 * @description: 应用主入口
 * 集成 AppProvider 和 SimulationProvider，以及全局弹窗容器 GlobalModalContainer。
 * 包含错误边界 (ErrorBoundary) 和路由渲染 (PageRenderer)。
 * @lastModified: 2026-01-13 23:30:00
 */
import React, { useContext, Suspense } from 'react';
import { AppProvider, AppContext } from './context/AppContext.jsx';
import { SimulationProvider, SimulationContext } from './context/SimulationContext.jsx'; // 引入新 Provider
import Header from './features/Layout/Header.jsx';
import Sidebar from './features/Layout/Sidebar.jsx';
import MegaMenu from './features/Layout/MegaMenu.jsx';
import AIAgent from './features/AIAgent/AIAgent.jsx';
import Login from './features/Auth/Login.jsx';
import Construction from './features/System/Construction.jsx';
import componentMap from './router/componentMap.jsx';

// 引入新弹窗组件
import StandardImportModal from './features/Simulation/StandardImportModal.jsx';
import ProductionEntryModal from './features/Simulation/ProductionEntryModal.jsx';
import TicketProcessModal from './features/Simulation/TicketProcessModal.jsx';

import './styles/index.css';
import './styles/components.css';

// ... (ErrorBoundary & PageRenderer 保持不变) ...
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return <div style={{ padding: '40px', color: 'red' }}><h2>模块加载失败</h2><pre>{this.state.error?.toString()}</pre></div>;
        }
        return this.props.children;
    }
}

const PageRenderer = () => {
    const { activePath } = useContext(AppContext);
    const Component = componentMap[activePath];
    if (Component) {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <div className="fade-in" style={{height: '100%'}}><Component /></div>
            </Suspense>
        );
    }
    return <Construction />;
};

// 全局弹窗渲染器
const GlobalModalContainer = () => {
    const { activeModal, closeModal, modalData } = useContext(SimulationContext);

    if (!activeModal) return null;

    let title = '系统弹窗';
    let Component = null;

    switch (activeModal) {
        case 'standard-import':
            title = '导入检验标准';
            Component = StandardImportModal;
            break;
        case 'production-entry':
            title = '生产记录填报';
            Component = ProductionEntryModal;
            break;
        case 'ticket-process':
            title = modalData ? `异常处置: ${modalData.id}` : '发起异常流程';
            Component = TicketProcessModal;
            break;
        default:
            return null;
    }

    return (
        <div className="aip-global-overlay open" onClick={closeModal}>
            <div className="aip-modal-container" onClick={e => e.stopPropagation()} style={{ width: '700px', height: 'auto', maxHeight: '90vh' }}>
                <div className="aip-modal-header">
                    <div className="aip-modal-title">{title}</div>
                    <i className="ri-close-line icon-btn" onClick={closeModal} style={{ fontSize: '24px' }}></i>
                </div>
                <Component />
            </div>
        </div>
    );
};

const AppLayout = () => {
    const { activePage, breadcrumbStack, navigate, toggleMegaMenu, isLoading, isAuthenticated } = useContext(AppContext);

    if (isLoading) return <div className="loading-screen">初始化...</div>;
    if (!isAuthenticated) return <Login />;

    return (
        <div className="app-root">
            <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
            <Header />
            <div className="app-body" onClick={() => toggleMegaMenu(false)}>
                <Sidebar />
                <MegaMenu />
                <main className="main-content">
                    <div className="breadcrumb">
                        <i className="ri-home-line" onClick={() => navigate('/dashboard')} style={{cursor:'pointer'}}></i>
                        {breadcrumbStack.map((crumb, i) => (
                            <React.Fragment key={i}>
                                <span>/</span><span onClick={()=>navigate(crumb.path)} style={{cursor:'pointer'}}>{crumb.title}</span>
                            </React.Fragment>
                        ))}
                        <span>/</span><span style={{fontWeight:'500', color:'#333'}}>{activePage}</span>
                    </div>
                    <ErrorBoundary><PageRenderer /></ErrorBoundary>
                </main>
            </div>
            <AIAgent />
            <GlobalModalContainer /> {/* 注入全局弹窗层 */}
        </div>
    );
};

export default function App() {
    return (
        <AppProvider>
            <SimulationProvider> {/* 注入业务 Context */}
                <AppLayout />
            </SimulationProvider>
        </AppProvider>
    );
}