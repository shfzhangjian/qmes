/**
 * @file: src/context/AppContext.jsx
 * @version: v7.0.1 (Crash Fix)
 * @description: 修复白屏问题 - 增加 menuData 遍历安全检查，并恢复 setMegaMenuOpen 兼容性接口
 */
import React, { createContext, useState, useEffect } from 'react';
import { fetchMenuData, fetchUserInfo, loginAPI } from '../services/api.js';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // --- 基础状态 ---
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- 导航状态 ---
  const [activePath, setActivePath] = useState('/dashboard');
  const [activePage, setActivePage] = useState('待办门户');
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // 面包屑栈
  const [breadcrumbStack, setBreadcrumbStack] = useState([]);

  // UI 状态
  const [isMegaMenuOpen, setMegaMenuOpen] = useState(false);
  const [isAIOpen, setAIOpen] = useState(false);

  // 数据缓存
  const [menuData, setMenuData] = useState([]);
  const [favorites, setFavorites] = useState(['待办任务', '我的消息']);

  const systemTitle = "禾臣新材料数字化智造协同一体化平台";
  const systemSubtitle = "基于安徽学府智能化开发架构";

  // ============================================================
  // 核心路由逻辑 (Hash Router Engine)
  // ============================================================

  useEffect(() => {
    const handleHashChange = () => {
      try {
        const hash = window.location.hash.slice(1);
        const path = hash || '/dashboard';

        console.log('[Router] Hash changed to:', path);

        setActivePath(path);

        // 简单的标题映射
        if(path === '/system/search') setActivePage('全域搜索');
        else if(path === '/msg/list') setActivePage('消息通知中心');
        else findTitleByPath(path);
      } catch (err) {
        console.warn('[Router] Navigation Error:', err);
      }
    };

    if (isAuthenticated) {
      handleHashChange(); // 初始化执行一次
      window.addEventListener('hashchange', handleHashChange);
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated, menuData]);

  // 辅助：根据 path 查找 title
  // 修复：增加空值检查，防止 menuData 为空时白屏
  const findTitleByPath = (path) => {
    let foundTitle = '';

    const traverse = (items) => {
      if (!items || !Array.isArray(items)) return; // 安全检查

      for (const item of items) {
        if (item.path === path) {
          foundTitle = item.label || item.title;
          return;
        }
        if (item.groups) traverse(item.groups);
        if (item.items) traverse(item.items);
      }
    };

    if (menuData && menuData.length > 0) {
      traverse(menuData);
    }

    if (foundTitle) setActivePage(foundTitle);
  };

  /**
   * 增强版导航方法
   */
  const navigate = (target, options = {}) => {
    let path = '/dashboard';

    if (typeof target === 'string') {
      if (target === '我的任务') path = '/flow/todo';
      else if (target.startsWith('/')) path = target;
      // title = target;
    } else if (typeof target === 'object') {
      path = target.path || '/404';
      if (target.id) setActiveMenu(target.id);
    }

    // 处理面包屑堆栈
    if (options.referrer) {
      setBreadcrumbStack(prev => {
        const last = prev[prev.length - 1];
        if (!last || last.path !== options.referrer.path) {
          return [...prev, options.referrer];
        }
        return prev;
      });
    } else {
      if (!options.keepStack) {
        setBreadcrumbStack([]);
      }
    }

    window.location.hash = path;
    setMegaMenuOpen(false);
  };

  // ============================================================
  // 初始化与登录逻辑
  // ============================================================

  useEffect(() => {
    const initApp = async () => {
      try {
        const user = await fetchUserInfo();
        const menus = await fetchMenuData();

        setCurrentUser(user);
        // 确保 menus 是数组
        setMenuData(Array.isArray(menus) ? menus : []);
        setIsAuthenticated(true);

        if (!window.location.hash) {
          window.location.hash = '/dashboard';
        }

      } catch (error) {
        console.log('未登录或会话过期');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  const login = async (u, p) => {
    const { user } = await loginAPI(u, p);
    const menus = await fetchMenuData();
    setCurrentUser(user);
    setMenuData(menus || []);
    setIsAuthenticated(true);
    window.location.hash = '/dashboard';
    return user;
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setCurrentUser(null);
    window.location.hash = '';
  };

  // 兼容性 Toggle 方法
  const toggleMegaMenu = (val) => setMegaMenuOpen(prev => typeof val === 'boolean' ? val : !prev);
  const toggleAIPanel = (val) => setAIOpen(prev => typeof val === 'boolean' ? val : !prev);

  const toggleFavorite = (item) => {
    const name = typeof item === 'string' ? item : item.label;
    setFavorites(prev => prev.includes(name) ? prev.filter(i => i!==name) : [...prev, name]);
  };

  const value = {
    systemTitle, systemSubtitle,
    currentUser, setCurrentUser,
    isAuthenticated, loading: isLoading,
    login, logout,

    activeMenu, setActiveMenu,
    activePage, activePath, navigate,
    breadcrumbStack, setBreadcrumbStack,

    isMegaMenuOpen,
    toggleMegaMenu,
    setMegaMenuOpen: toggleMegaMenu, // 关键修复：添加别名，防止 App.jsx 调用旧方法报错

    isAIOpen, toggleAIPanel,

    menuData, favorites, toggleFavorite
  };

  return <AppContext.Provider value={value}>{!isLoading && children}</AppContext.Provider>;
};