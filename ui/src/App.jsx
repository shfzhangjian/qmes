/**
 * @file: src/App.jsx
 * @version: v6.1.0 (Fix Context Method)
 * @description: 修复 setMegaMenuOpen 未定义的错误，改用 toggleMegaMenu
 */
import React, { useContext, Suspense } from 'react';
import { AppContext, AppProvider } from './context/AppContext.jsx';
import Header from './features/Layout/Header.jsx';
import Sidebar from './features/Layout/Sidebar.jsx';
import MegaMenu from './features/Layout/MegaMenu.jsx';
import AIAgent from './features/AIAgent/AIAgent.jsx';
import Login from './features/Auth/Login.jsx';
import Construction from './features/System/Construction.jsx';
import componentMap from './router/componentMap.jsx'; // 引入路由表
import './styles/index.css';

// --- 错误边界 ---
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

// --- 动态页面渲染器 ---
const PageRenderer = () => {
    const { activePath } = useContext(AppContext);

    // 1. 在注册表中查找组件
    const Component = componentMap[activePath];

    // 2. 加载状态 UI
    const LoadingFallback = (
        <div style={{ padding: '50px', textAlign: 'center', color: '#999' }}>
            <i className="ri-loader-4-line spin" style={{ fontSize: '24px', marginRight: '8px' }}></i>
            正在加载资源模块...
        </div>
    );

    // 3. 渲染逻辑
    if (Component) {
        return (
            <Suspense fallback={LoadingFallback}>
                <div className="fade-in" style={{height: '100%'}}>
                    <Component />
                </div>
            </Suspense>
        );
    }

    // 4. 404 / 建设中页面
    return <Construction />;
};

const AppLayout = () => {
    const {
        activePage,
        toggleMegaMenu, // 使用 toggleMegaMenu 代替 setMegaMenuOpen
        isLoading,
        isAuthenticated
    } = useContext(AppContext);

    if (isLoading) return <div className="loading-screen">系统初始化...</div>;
    if (!isAuthenticated) return <Login />;

    return (
        <div className="app-root">
            <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />

            <Header />

            {/* 点击主区域关闭菜单，使用 toggleMegaMenu(false) */}
            <div className="app-body" onClick={() => toggleMegaMenu(false)}>
                <Sidebar />
                <MegaMenu />

                <main className="main-content">
                    {/* 路径面包屑 */}
                    <div className="breadcrumb">
                        <i className="ri-home-line"></i>
                        <span>/</span>
                        <span style={{fontWeight: '500'}}>{activePage}</span>
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