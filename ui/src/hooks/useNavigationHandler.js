/**
 * @file: src/hooks/useNavigationHandler.js
 * @description: 统一跳转逻辑封装 Hook
 */
import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

export const useNavigationHandler = () => {
    const { navigate, activePage, activePath } = useContext(AppContext);

    // 控制内部详情模态框的显示
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailData, setDetailData] = useState(null);

    /**
     * 处理点击跳转
     * @param {object} item - 数据项
     * @param {string} item.jumpType - 跳转类型: 'modal' | 'view' | 'blank' | 'iframe'
     * @param {string} item.target - 目标: URL 或 内部 Path
     * @param {string} item.title - 标题
     * @param {string} item.modalTitle - 模态框特定标题 (可选)
     * @param {string} item.width - 模态框宽度 (可选)
     * @param {boolean} item.canMaximize - 是否允许最大化 (可选, 默认true)
     */
    const handleJump = (item) => {
        const type = item.jumpType || 'view'; // 默认 view
        const target = item.path || item.target;

        console.log('[NavHandler] Jump:', type, target);

        switch (type) {
            case 'modal':
                // 类型 1: 弹出蒙层详情
                // 将整个 item 传递给 modal，以便 modal 读取配置
                setDetailData(item);
                setDetailModalOpen(true);
                break;

            case 'view':
                // 类型 2: 跳转具体视图 (内部路由)
                navigate(target, {
                    referrer: { title: activePage, path: activePath },
                    keepStack: true
                });
                break;

            case 'blank':
                // 类型 3: 弹出新页面 (Blank)
                window.open(target, '_blank');
                break;

            case 'iframe':
                // 类型 4: Iframe 嵌入
                window.iframeTargetUrl = target;
                navigate('/system/iframe', {
                    referrer: { title: activePage, path: activePath },
                    keepStack: true
                });
                break;

            default:
                console.warn('Unknown jump type:', type);
                navigate(target);
        }
    };

    const closeDetailModal = () => {
        setDetailModalOpen(false);
        setDetailData(null);
    };

    return {
        handleJump,
        detailModalOpen,
        detailData,
        closeDetailModal
    };
};