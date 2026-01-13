/**
 * @file: src/context/AppContext.jsx
 * @version: v4.3.0 (Backend Driven Role)
 * @description: 登录逻辑优化，角色信息完全由后端 API 返回，不再由前端手动指定
 */

import React, { createContext, useState, useEffect } from 'react';
import { fetchMenuData, fetchUserInfo, loginAPI } from '../services/api.js';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // --- 0. 全局配置 ---
  const systemTitle = "禾臣新材料数字化智造协同一体化平台";
  const systemSubtitle = "基于安徽学府智能化开发架构";

  // --- 1. 核心认证状态 ---
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- 2. 界面与菜单状态 ---
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isMegaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('待办门户');
  const [isAIOpen, setAIOpen] = useState(false);

  const [fullMenuData, setFullMenuData] = useState([]);
  const [menuData, setMenuData] = useState([]);

  // --- 3. 收藏夹状态 ---
  const [favorites, setFavorites] = useState(['待办任务', '我的消息']);

  // --- 4. 核心：权限过滤算法 ---
  const filterMenuByRole = (menus, roleCode) => {
    if (!menus) return [];
    if (!roleCode || roleCode === 'ADM') return menus;

    const filterRecursive = (items) => {
      return items.filter(item => {
        if (item.items) {
          const filteredItems = filterRecursive(item.items);
          if (filteredItems.length > 0) {
            item.items = filteredItems;
            return true;
          }
          return false;
        }
        if (item.children) {
          const filteredChildren = filterRecursive(item.children);
          if (filteredChildren.length > 0) {
            item.children = filteredChildren;
            return true;
          }
          return false;
        }
        if (item.roles) {
          return item.roles.includes(roleCode) || item.roles.includes('ALL');
        }
        return true;
      });
    };

    const menuCopy = JSON.parse(JSON.stringify(menus));
    return menuCopy.filter(module => {
      if (module.groups) {
        module.groups = filterRecursive(module.groups);
        if (module.groups.length === 0 && !module.path) return false;
      }
      // 顶级菜单权限检查
      if (module.roles && !module.roles.includes('ADM') && !module.roles.includes('ALL') && !module.roles.includes(roleCode)) {
        return false;
      }
      return true;
    });
  };

  // --- 5. 初始化 ---
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('[App] 初始化检查会话...');
        const user = await fetchUserInfo();
        setCurrentUser(user);

        const menus = await fetchMenuData();
        setFullMenuData(menus);

        // 使用后端返回的 role 进行过滤
        if (user && user.role) {
          const filtered = filterMenuByRole(menus, user.role);
          setMenuData(filtered);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log('[App] 未登录或会话过期');
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  // --- 6. 核心动作 ---
  // 更新：移除多余参数，仅需 username/password
  const login = async (username, password) => {
    try {
      console.log('[App] 调用登录:', username);
      const { user } = await loginAPI(username, password);

      // user 对象中已经包含了 role 和 roleName (由 api.js 提供)
      setCurrentUser(user);

      // 加载并过滤菜单
      const menus = await fetchMenuData();
      setFullMenuData(menus);
      const filtered = filterMenuByRole(menus, user.role);
      setMenuData(filtered);

      // 重置首页
      setActivePage('待办门户');
      setActiveMenu('dashboard');

      setIsAuthenticated(true);
      return user;
    } catch (error) {
      console.error('[App] 登录失败:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('tspm_token');
    localStorage.removeItem('tspm_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setMegaMenuOpen(false);
    setAIOpen(false);
    setActivePage('待办门户');
  };

  const navigate = (target) => {
    const pageName = typeof target === 'string' ? target : target.label || target.title;
    setActivePage(pageName);
    setMegaMenuOpen(false);
  };

  const toggleFavorite = (item) => {
    const title = typeof item === 'string' ? item : item.label;
    setFavorites(prev => {
      if (prev.includes(title)) return prev.filter(t => t !== title);
      return [...prev, title];
    });
  };

  const toggleMegaMenu = (isOpen) => setMegaMenuOpen(isOpen);
  const toggleAIPanel = (isOpen) => setAIOpen(prev => isOpen ?? !prev);
  const setRole = (role) => setCurrentUser(prev => ({ ...prev, role }));

  useEffect(() => {
    if (isAIOpen) document.body.classList.add('aip-open');
    else document.body.classList.remove('aip-open');
  }, [isAIOpen]);

  return (
      <AppContext.Provider value={{
        systemTitle,
        systemSubtitle,
        isAuthenticated, login, logout,
        currentUser, setCurrentUser, setRole, isLoading,
        activeMenu, setActiveMenu,
        isMegaMenuOpen, toggleMegaMenu,
        activePage, navigate,
        isAIOpen, toggleAIPanel,
        menuData,
        favorites, toggleFavorite
      }}>
        {children}
      </AppContext.Provider>
  );
};