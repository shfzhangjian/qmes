/**
 * @file: src/App.jsx
 * @version: v5.0.2
 * @description: 应用主入口，包含错误边界保护与动态路由渲染
 * @lastModified: 2026-01-13 16:55:00
 */
import React, { useContext, Suspense } from 'react';
import { AppContext, AppProvider } from './context/AppContext.jsx';
import Header from './features/Layout/Header.jsx';
import Sidebar from './features/Layout/Sidebar.jsx';
import MegaMenu from './features/Layout/MegaMenu.jsx';
import AIAgent from './features/AIAgent/AIAgent.jsx';
import Login from './features/Auth/Login.jsx';
import Construction from './features/System/Construction.jsx';
import componentMap from './router/componentMap.jsx';
import './styles/index.css';

// --- 简易错误边界组件 ---
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
                    <h2>系统渲染出错 (Runtime Error)</h2>
                    <pre>{this.state.error?.toString()}</pre>
                    <button onClick={() => window.location.reload()}>刷新页面</button>
                </div>
            );
        }
        return this.props.children;
    }
}

// --- 页面渲染器 ---
const PageRenderer = () => {
    const { activePath } = useContext(AppContext);
    const Component = componentMap[activePath];

    if (Component) {
        return (
            <Suspense fallback={<div className="loading-spinner">加载模块中...</div>}>
                <Component />
            </Suspense>
        );
    }
    // 404 Fallback
    return <Construction />;
};

const AppLayout = () => {
    const { setMegaMenuOpen, isLoading, isAuthenticated, activePage, activePath } = useContext(AppContext);

    if (isLoading) return <div style={{padding:'50px',textAlign:'center'}}>系统初始化...</div>;
    if (!isAuthenticated) return <Login />;

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
                        <span style={{fontSize:'12px', color:'#ccc', marginLeft:'8px'}}>({activePath})</span>
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
            <AppLayout />
        </AppProvider>
    );
}