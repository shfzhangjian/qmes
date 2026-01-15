/**
 * @file: src/App.jsx
 * @version: v6.3.0 (Simulation Integration)
 * @description: 接入 SimulationContext，为应用提供动态模拟数据支持
 */
import React, { useContext, Suspense } from 'react';
import { AppContext, AppProvider } from './context/AppContext.jsx';
import { SimulationProvider } from './context/SimulationContext.jsx'; // 引入
import Header from './features/Layout/Header.jsx';
import Sidebar from './features/Layout/Sidebar.jsx';
import MegaMenu from './features/Layout/MegaMenu.jsx';
import AIAgent from './features/AIAgent/AIAgent.jsx';
import Login from './features/Auth/Login.jsx';
import Construction from './features/System/Construction.jsx';
import componentMap from './router/componentMap.jsx';
import './styles/index.css';

// ... (ErrorBoundary 和 PageRenderer 保持不变) ...
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
            return (
                <div style={{ padding: '40px', color: 'red' }}>
                    <h2>模块加载失败</h2>
                    <pre>{this.state.error?.toString()}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

const PageRenderer = () => {
    const { activePath } = useContext(AppContext);
    const Component = componentMap[activePath];
    const LoadingFallback = (
        <div style={{ padding: '50px', textAlign: 'center', color: '#999' }}>
            <i className="ri-loader-4-line spin" style={{ fontSize: '24px', marginRight: '8px' }}></i>
            正在加载资源模块...
        </div>
    );
    if (Component) {
        return (
            <Suspense fallback={LoadingFallback}>
                <div className="fade-in" style={{height: '100%'}}>
                    <Component />
                </div>
            </Suspense>
        );
    }
    return <Construction />;
};

const AppLayout = () => {
    const {
        activePage, breadcrumbStack, navigate, toggleMegaMenu, isLoading, isAuthenticated
    } = useContext(AppContext);

    if (isLoading) return <div className="loading-screen">系统初始化...</div>;
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
                                <span>/</span><span className="crumb-link" onClick={() => navigate(crumb.path)}>{crumb.title}</span>
                            </React.Fragment>
                        ))}
                        <span>/</span><span style={{fontWeight: '500', color: '#333'}}>{activePage}</span>
                    </div>
                    <ErrorBoundary>
                        <PageRenderer />
                    </ErrorBoundary>
                </main>
            </div>
            <AIAgent />
        </div>
    );
};

export default function App() {
    return (
        <AppProvider>
            {/* 注入模拟数据层 */}
            <SimulationProvider>
                <AppLayout />
            </SimulationProvider>
        </AppProvider>
    );
}