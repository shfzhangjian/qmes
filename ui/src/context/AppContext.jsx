/**
 * @file: src/context/AppContext.jsx
 * @version: v6.1.3
 * @description: 修复登录跳转逻辑，确保登录后正确导航至 Dashboard
 * @lastModified: 2026-01-13 17:05:00
 */
import React, { createContext, useState, useEffect } from 'react';
import { fetchMenuData, fetchUserInfo, loginAPI } from '../services/api.js';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // --- 基础状态 ---
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- 路由与导航状态 ---
  const [activePath, setActivePath] = useState('/dashboard');
  const [activePage, setActivePage] = useState('待办门户');
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // --- UI 状态 ---
  const [isMegaMenuOpen, setMegaMenuOpen] = useState(false);
  const [isAIOpen, setAIOpen] = useState(false);

  // --- 数据缓存 ---
  const [menuData, setMenuData] = useState([]);
  const [favorites, setFavorites] = useState(['待办任务', '我的消息']);

  const systemTitle = "禾臣新材料数字化智造协同一体化平台";
  const systemSubtitle = "基于安徽学府智能化开发架构";

  // ============================================================
  // 核心路由逻辑 (Hash Router Engine)
  // ============================================================

  useEffect(() => {
    const handleHashChange = () => {
      // 如果未登录，不处理 Hash 逻辑，避免干扰
      // 注意：这里不能直接依赖 isAuthenticated 闭包变量，因为它可能不是最新的
      // 我们会在 useEffect 依赖中加入 isAuthenticated

      const hash = window.location.hash.slice(1);
      const path = hash || '/dashboard'; // 默认为 /dashboard

      console.log('[Router] Hash changed to:', path);

      setActivePath(path);
      findTitleByPath(path);
    };

    // 只有当认证通过后，才开始响应路由变化
    if (isAuthenticated) {
      handleHashChange(); // 初始化执行一次
      window.addEventListener('hashchange', handleHashChange);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [menuData, isAuthenticated]); // 依赖 isAuthenticated

  // 辅助：根据 path 查找 title 和 menuId
  const findTitleByPath = (path) => {
    let foundTitle = '';
    let foundId = '';

    const traverse = (items) => {
      for (const item of items) {
        if (item.path === path) {
          foundTitle = item.label || item.title;
          foundId = item.id;
          return;
        }
        if (item.groups) traverse(item.groups);
        if (item.items) traverse(item.items);
      }
    };
    traverse(menuData);
    if (foundTitle) setActivePage(foundTitle);
    // if (foundId) setActiveMenu(foundId);
  };

  // 2. 导航动作
  const navigate = (target) => {
    let path = '/dashboard';
    let title = '待办门户';

    if (typeof target === 'string') {
      if (target === '我的任务') path = '/flow/todo';
      else if (target === '计划排程') path = '/planning/center';
      else if (target === '信息系统') path = '/system/info';
      else if (target.startsWith('/')) path = target;
      title = target;
    } else if (typeof target === 'object') {
      path = target.path || '/404';
      title = target.label || target.title;
      if (target.id) setActiveMenu(target.id);
    }

    window.location.hash = path;
    setMegaMenuOpen(false);
  };

  // ============================================================
  // 初始化与登录逻辑
  // ============================================================

  // 初始化 App
  useEffect(() => {
    const initApp = async () => {
      try {
        const user = await fetchUserInfo(); // 尝试获取本地存储的用户信息
        const menus = await fetchMenuData();

        setCurrentUser(user);
        setMenuData(menus);
        setIsAuthenticated(true); // 设置为已认证

        // 如果 URL 没有 Hash，自动加上 /dashboard
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
    setMenuData(menus);
    setIsAuthenticated(true);

    // 登录成功后，强制跳转到 Dashboard
    window.location.hash = '/dashboard';

    return user;
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setCurrentUser(null);
    window.location.hash = ''; // 清除 Hash
  };

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
    isMegaMenuOpen, toggleMegaMenu,
    isAIOpen, toggleAIPanel,
    menuData, favorites, toggleFavorite
  };

  return <AppContext.Provider value={value}>{!isLoading && children}</AppContext.Provider>;
};