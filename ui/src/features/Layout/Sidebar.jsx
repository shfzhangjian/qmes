/**
 * @file: src/features/Layout/Sidebar.jsx
 * @version: v2.4.0 (Fix Build Errors)
 * @description: 侧边栏组件，修复引用路径错误
 */

import React, { useContext, useRef, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import './Sidebar.css';

const Sidebar = () => {
    const { activeMenu, setActiveMenu, toggleMegaMenu, menuData, navigate } = useContext(AppContext);
    const safeMenuData = Array.isArray(menuData) ? menuData : [];

    // 滚动容器引用
    const scrollRef = useRef(null);

    // 滚动指示器状态
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);

    // 检查滚动状态
    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        // 允许 1px 的误差
        const isUp = el.scrollTop > 1;
        const isDown = el.scrollHeight - el.scrollTop - el.clientHeight > 1;

        setCanScrollUp(isUp);
        setCanScrollDown(isDown);
    };

    useEffect(() => {
        checkScroll();
        // 监听窗口大小变化（可能影响滚动高度）
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [menuData]); // 数据变化时也要检查

    // 点击箭头滚动
    const scrollBy = (amount) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ top: amount, behavior: 'smooth' });
        }
    };

    return (
        <div className="sidebar mobile-scroll">

            {/* 顶部滚动指示器 */}
            <div
                className={`scroll-indicator up ${canScrollUp ? 'visible' : ''}`}
                onClick={() => scrollBy(-100)}
            >
                <i className="ri-arrow-up-s-line"></i>
            </div>

            <div
                className="sidebar-scroll-content"
                ref={scrollRef}
                onScroll={checkScroll}
            >
                {safeMenuData.map(item => (
                    <div
                        key={item.id}
                        className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            // 如果没有 groups，直接导航
                            if(!item.groups || item.groups.length === 0) {
                                setActiveMenu(item.id);
                                navigate(item);
                            } else {
                                setActiveMenu(item.id);
                                toggleMegaMenu(true);
                            }
                        }}
                        title={item.title}
                    >
                        <i className={item.icon || 'ri-function-line'}></i>
                        <span>{item.title ? item.title.substring(0,4) : '--'}</span>
                    </div>
                ))}

                {/* 占位符，防止最后一个菜单被底部按钮或指示器遮挡 */}
                <div style={{ height: '40px' }}></div>
            </div>

            {/* 底部滚动指示器 */}
            <div
                className={`scroll-indicator down ${canScrollDown ? 'visible' : ''}`}
                onClick={() => scrollBy(100)}
            >
                <i className="ri-arrow-down-s-line"></i>
            </div>

            <div className="menu-item fav-trigger" onClick={(e) => {
                e.stopPropagation();
                setActiveMenu('favorites');
                toggleMegaMenu(true);
            }}>
                <i className="ri-star-fill" style={{ color: '#FA8C16' }}></i>
                <span>收藏</span>
            </div>
        </div>
    );
};

export default Sidebar;