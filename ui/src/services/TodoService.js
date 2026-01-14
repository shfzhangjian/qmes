/**
 * @file: src/services/TodoService.js
 * @version: v2.0.0 (Mock Backend)
 * @description: 待办服务聚合层
 * 升级说明：
 * 1. 移除硬编码逻辑，改为从 src/data/mock 异步加载 JSON。
 * 2. 实现统一的数据清洗与格式化 (Standard Schema)。
 * 3. 提供基于角色的模拟查询能力。
 */

// 模拟异步请求延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 导入模拟数据 (Vite Glob Import 方式或直接 Import)
import abnormalData from '../data/mock/task_abnormal.json';
import ncrData from '../data/mock/task_ncr.json';

/**
 * 核心：标准待办数据模型 (Standard Todo Schema)
 * @typedef {Object} TodoItem
 * @property {string} id - 唯一任务ID
 * @property {string} type - 视觉类型 (red/orange/blue/green)
 * @property {string} tag - 标签文本 (异常/NCR/审批)
 * @property {string} text - 任务标题/内容
 * @property {string} desc - 详细描述 (用于列表副标题)
 * @property {string} time - 时间字符串
 * @property {string} status - 状态文本 (待办/进行中/已完成)
 * @property {string} priority - 优先级 (紧急/高/中/低)
 * @property {string} componentKey - 关联的详情组件Key (用于动态加载)
 * @property {Object} rawData - 原始业务数据
 */

/**
 * 获取所有任务 (模拟后端查询)
 * @param {Object} filter - 过滤条件 { role, status, type }
 */
export const fetchTodos = async (filter = {}) => {
    await delay(300); // 模拟网络延迟

    // 1. 合并所有数据源
    let allTasks = [
        ...abnormalData.map(item => mapToSchema(item, 'abnormal')),
        ...ncrData.map(item => mapToSchema(item, 'ncr'))
    ];

    // 2. 执行过滤逻辑 (模拟后端 SQL Where)
    if (filter.role && filter.role !== 'ADM') {
        // 简单模拟：如果是管理员看所有，否则看 handler 匹配或 handler='ALL'
        // 实际业务中会有更复杂的 ACL 控制
        allTasks = allTasks.filter(t => t.handler === filter.role || t.handler === 'ALL');
    }

    if (filter.status) {
        // 映射前端状态 Tab 到后端状态
        if (filter.status === '待办') {
            allTasks = allTasks.filter(t => !['CLOSED', 'DONE'].includes(t.rawData.status));
        } else if (filter.status === '已完成') {
            allTasks = allTasks.filter(t => ['CLOSED', 'DONE'].includes(t.rawData.status));
        }
    }

    // 3. 排序 (按时间倒序)
    return allTasks.sort((a, b) => new Date(b.time) - new Date(a.time));
};

/**
 * 数据适配器：将不同业务的 JSON 转换为统一 UI 格式
 */
const mapToSchema = (item, sourceType) => {
    // 状态映射 UI 颜色/文本
    const isClosed = ['CLOSED', 'DONE'].includes(item.status);

    let typeColor = 'blue';
    let tagName = '任务';

    if (sourceType === 'abnormal') {
        typeColor = 'red';
        tagName = '异常';
    } else if (sourceType === 'ncr') {
        typeColor = 'orange';
        tagName = 'NCR';
    }

    return {
        id: item.id,
        type: typeColor, // UI badge color
        tag: tagName,    // UI badge text
        title: item.title,
        desc: item.desc,
        status: isClosed ? '已完成' : '待办', // 简化状态用于列表展示
        priority: mapPriorityCN(item.priority),
        time: item.createTime.substring(0, 16),
        handler: item.handler, // 用于权限过滤
        componentKey: item.componentKey, // 关键：指向详情组件
        rawData: item // 保留原始数据以备详情弹窗使用
    };
};

const mapPriorityCN = (p) => {
    const map = { 'urgent': '紧急', 'high': '高', 'medium': '中', 'low': '低' };
    return map[p] || '中';
};

export default {
    fetchTodos
};