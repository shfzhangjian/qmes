/**
 * @file: src/context/AppContext.jsx
 * @version: v5.6.0 (Unified State Fix)
 * @description: 统一状态管理，兼容旧版变量名，修复布局崩溃问题
 */
import React, { createContext, useState, useEffect } from 'react';
import { fetchMenuData, fetchUserInfo, loginAPI } from '../services/api.js';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // --- 状态定义 ---
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 导航状态
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activePage, setActivePage] = useState('Dashboard');
  const [isMegaMenuOpen, setMegaMenuOpen] = useState(false);
  const [isAIOpen, setAIOpen] = useState(false);

  // 数据状态
  const [menuData, setMenuData] = useState([]);
  const [favorites, setFavorites] = useState(['待办任务', '我的消息']);

  // 全局配置
  const systemTitle = "禾臣新材料数字化智造协同一体化平台";
  const systemSubtitle = "基于安徽学府智能化开发架构";

  // --- 权限过滤 ---
  const filterMenuByRole = (menus, roleCode) => {
    if (!menus) return [];
    if (!roleCode || roleCode === 'ADM') return menus;

    const menuCopy = JSON.parse(JSON.stringify(menus));
    return menuCopy.map(module => {
      if (module.roles && !module.roles.includes('ALL') && !module.roles.includes(roleCode)) return null;

      if (module.groups) {
        module.groups = module.groups.map(group => {
          if (group.items) {
            group.items = group.items.filter(item =>
                !item.roles || item.roles.includes('ALL') || item.roles.includes(roleCode)
            );
          }
          return (group.items && group.items.length > 0) ? group : null;
        }).filter(Boolean);
      }

      if ((!module.groups || module.groups.length === 0) && !module.path) return null;
      return module;
    }).filter(Boolean);
  };

  // --- 初始化 ---
  useEffect(() => {
    const initApp = async () => {
      try {
        const user = await fetchUserInfo();
        const menus = await fetchMenuData();

        setCurrentUser(user);

        if (user && user.role) {
          setMenuData(filterMenuByRole(menus, user.role));
          setIsAuthenticated(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  // --- 操作方法 ---
  const login = async (u, p) => {
    const { user } = await loginAPI(u, p);
    const menus = await fetchMenuData();

    setCurrentUser(user);
    setMenuData(filterMenuByRole(menus, user.role));
    setIsAuthenticated(true);
    setActivePage('Dashboard');
    return user;
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const navigate = (target) => {
    const pageName = typeof target === 'string' ? target : (target.label || target.title);
    setActivePage(pageName);
    setMegaMenuOpen(false);
  };

  // 兼容性 Toggle 方法
  const toggleMegaMenu = (val) => setMegaMenuOpen(prev => typeof val === 'boolean' ? val : !prev);
  const toggleAIPanel = () => setAIOpen(prev => !prev);
  const toggleFavorite = (item) => {
    const name = typeof item === 'string' ? item : item.label;
    setFavorites(prev => prev.includes(name) ? prev.filter(i => i!==name) : [...prev, name]);
  };

  // --- Context Value (关键：兼容旧代码的所有命名) ---
  const value = {
    systemTitle, systemSubtitle,
    currentUser, setCurrentUser,
    isAuthenticated, loading: isLoading,
    login, logout,

    // 菜单状态 (兼容 activeModule 和 activeMenu)
    activeMenu, setActiveMenu, activeModule: activeMenu,

    // 页面状态
    activePage, navigate,

    // 侧滑菜单
    isMegaMenuOpen, toggleMegaMenu,

    // AI 面板 (兼容 isAIOpen 和 isAIPanelOpen)
    isAIOpen, isAIPanelOpen: isAIOpen, toggleAIPanel,

    // 数据
    menuData, favorites, toggleFavorite
  };

  return <AppContext.Provider value={value}>{!isLoading && children}</AppContext.Provider>;
};