/**
 * @file: src/features/Layout/MegaMenu.jsx
 * @version: v4.0.0 (Windows Cascade Style)
 * @description: 巨型菜单重构 - 实现 Windows 风格的多级级联菜单 (Hover 展开)
 */

import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import './MegaMenu.css';

const MegaMenu = () => {
    const {
        isMegaMenuOpen, activeMenu, toggleMegaMenu, navigate, menuData,
        favorites, toggleFavorite
    } = useContext(AppContext);

    const safeMenuData = Array.isArray(menuData) ? menuData : [];
    const currentModule = safeMenuData.find(m => m.id === activeMenu);

    if (!isMegaMenuOpen) return null;

    // 渲染星星
    const StarBtn = ({ item }) => {
        const title = typeof item === 'string' ? item : item.label;
        const isFav = favorites.includes(title);
        return (
            <i
                className={`ri-star-${isFav ? 'fill' : 'line'} fav-icon ${isFav ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
                title={isFav ? "取消收藏" : "加入收藏"}
            ></i>
        );
    };

    // 递归渲染菜单项
    const renderMenuItem = (item, index, depth = 0) => {
        // 1. 数据标准化
        const label = typeof item === 'string' ? item : item.label || item.title;
        const desc = item.desc || item.path || '';
        // 检查是否有子菜单 (兼容 groups, items, children)
        const children = item.groups || item.items || item.children;
        const hasChildren = children && children.length > 0;

        // 2. 渲染逻辑
        return (
            <div key={index} className="rich-menu-item" onClick={(e) => {
                if (!hasChildren) {
                    e.stopPropagation();
                    navigate(item);
                }
            }}>
                {/* 图标 (仅第一级显示，或者都有) */}
                <div className="item-icon-box">
                    <i className={item.icon || (hasChildren ? 'ri-folder-3-line' : 'ri-function-line')}></i>
                </div>

                {/* 内容 */}
                <div className="item-content">
                    <div className="item-title-row">
                        <span className="item-title">{label}</span>
                        {!hasChildren && <StarBtn item={item} />}
                        {hasChildren && <i className="ri-arrow-right-s-line submenu-indicator"></i>}
                    </div>
                    {/* 仅叶子节点显示描述 */}
                    {!hasChildren && desc && <div className="item-desc">{desc}</div>}
                </div>

                {/* 3. 递归子菜单 (Popover) */}
                {hasChildren && (
                    <div className="submenu-popover">
                        {children.map((child, idx) => renderMenuItem(child, idx, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`mega-menu-panel ${isMegaMenuOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="mega-menu-header">
                <div className="mega-menu-title">
                    {activeMenu === 'favorites' ?
                        <><i className="ri-star-fill" style={{ color: '#FA8C16' }}></i> 我的收藏</> :
                        <><i className={currentModule?.icon || 'ri-apps-line'}></i> {currentModule?.title || '功能菜单'}</>
                    }
                </div>
                <i className="ri-close-line icon-btn" onClick={() => toggleMegaMenu(false)}></i>
            </div>

            {activeMenu !== 'favorites' && (
                <input type="text" className="menu-search-input" placeholder="查找功能..." />
            )}

            <div className="menu-groups-container">
                {activeMenu === 'favorites' ? (
                    <div className="favorites-list">
                        {favorites.length === 0 ? <div style={{padding:'20px', color:'#999', fontSize:'13px', textAlign:'center'}}>暂无收藏</div> : null}
                        {favorites.map((fav, i) => (
                            <div key={i} className="rich-menu-item" onClick={() => navigate(fav)}>
                                <div className="item-icon-box"><i className="ri-star-fill" style={{color:'#FA8C16'}}></i></div>
                                <div className="item-content">
                                    <div className="item-title-row"><span className="item-title">{typeof fav==='string'?fav:fav.label}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // 渲染当前模块下的所有分组 (作为第一级菜单项)
                    currentModule?.groups?.map((group, idx) => (
                        <React.Fragment key={idx}>
                            {/* 分组标题作为分隔符 */}
                            {group.title && <div className="group-header-label">{group.title}</div>}
                            {/* 渲染组内项 */}
                            {group.items ? group.items.map((item, i) => renderMenuItem(item, i)) : renderMenuItem(group, idx)}
                        </React.Fragment>
                    ))
                )}
            </div>
        </div>
    );
};

export default MegaMenu;