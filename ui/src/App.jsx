/**
 * @file: src/App.jsx
 * @version: v3.2.0 (Fix Route)
 * @description: 修复视图路由判断逻辑，支持新的菜单名称 "待办门户"
 */
import React, { useContext } from 'react';
import { AppContext, AppProvider } from './context/AppContext.jsx';
import Header from './features/Layout/Header.jsx';
import Sidebar from './features/Layout/Sidebar.jsx';
import MegaMenu from './features/Layout/MegaMenu.jsx';
import AIAgent from './features/AIAgent/AIAgent.jsx';
import Dashboard from './features/Dashboard/Dashboard.jsx';
import PlanningCenter from './features/Planning/PlanningCenter.jsx';
import Login from './features/Auth/Login.jsx';
import './styles/index.css';

const AppLayout = () => {
    const {
        activePage, setMegaMenuOpen, toggleAIPanel,
        isLoading, isAuthenticated
    } = useContext(AppContext);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: '#666', flexDirection: 'column' }}>
                <p>系统初始化...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Login />;
    }

    return (
        <div className="app-root">
            <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
            <Header />
            <div className="app-body" onClick={() => setMegaMenuOpen(false)}>
                <Sidebar />
                <MegaMenu />
                <main className="main-content">
                    <div className="breadcrumb">
                        <i className="ri-home-line"></i> <span>/</span> {activePage}
                    </div>

                    {/* 路由逻辑修正: 兼容旧名称和新名称 */}
                    {(activePage === '主工作台' || activePage === '待办门户') ? <Dashboard /> :
                        (activePage === '保养计划' || activePage === '计划排程') ? <PlanningCenter /> :
                            <div className="content-card">
                                <div className="card-header-sm">
                                    <span>{activePage}</span>
                                    <button className="small-btn outline" onClick={() => toggleAIPanel(true)}>
                                        <i className="ri-sparkling-fill"></i> AIP 助手
                                    </button>
                                </div>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', flexDirection: 'column' }}>
                                    <i className="ri-layout-masonry-line" style={{ fontSize: '48px', marginBottom: '20px' }}></i>
                                    <p>功能模块 [{activePage}] 正在建设中...</p>
                                    <p style={{ fontSize: '12px' }}>您可以尝试点击 "待办门户" 或 "计划排程"</p>
                                </div>
                            </div>
                    }
                </main>
            </div>
            <AIAgent />
        </div>
    );
};

export default function App() {
    return (
        <AppProvider>
            <AppLayout />
        </AppProvider>
    );
}