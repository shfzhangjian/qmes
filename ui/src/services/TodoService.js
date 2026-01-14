/**
 * @file: src/services/TodoService.js
 * @description: 待办事项统一服务聚合层
 * 核心功能：
 * 1. 定义标准待办结构 (Standard Todo Structure)
 * 2. 从各业务模块(localStorage/API)聚合数据
 * 3. 提供统一的跳转路由逻辑
 */

// --- 1. 标准待办结构定义 ---
/*
const TodoItem = {
    id: "TASK-001",           // 唯一任务ID
    businessId: "ABN-2026-001", // 业务单据号
    type: "abnormal",         // 业务类型: abnormal | check | approval
    title: "涂布机张力异常处理", // 任务标题
    desc: "待初步确认 - 生产部", // 任务描述
    priority: "high",         // 优先级: high | medium | low
    status: "pending",        // 状态: pending | processing | done
    time: "2026-01-14 10:00", // 时间
    route: "/qms/abnormal",   // 跳转路由
    handler: "mgr",           // 当前处理人ID
};
*/

// --- 2. 业务数据适配器 ---

// 适配器：将异常单转换为标准待办
const mapAbnormalToTodo = (ticket) => {
    let priority = 'medium';
    if (ticket.level === '严重') priority = 'high';
    else if (ticket.level === '轻微') priority = 'low';

    // 状态映射
    const isDone = ticket.status === 'CLOSED';

    return {
        id: `TASK-${ticket.id}`,
        businessId: ticket.id,
        type: 'abnormal',
        tag: '异常',
        title: ticket.desc || '未填写描述',
        desc: `[${getStatusCN(ticket.status)}] ${ticket.dept || ''}`,
        priority: priority,
        status: isDone ? 'done' : 'pending',
        time: ticket.updateTime || ticket.date,
        route: '/qms/abnormal', // 关键：定义跳转目标页面
        handler: ticket.currentHandler,
        rawData: ticket
    };
};

// 辅助：状态转中文
const getStatusCN = (s) => ({
    'DRAFT': '草稿',
    'PENDING_CONFIRM': '待初步确认',
    'PENDING_QA_CONFIRM': '待品质确认',
    'PENDING_CONTAINMENT': '待围堵',
    'PENDING_ANALYSIS': '待分析',
    'PENDING_VERIFY': '待验证',
    'CLOSED': '已结案'
}[s] || s);

// --- 3. 核心服务方法 ---

/**
 * 获取我的待办列表 (聚合所有业务)
 * @param {Object} user 当前登录用户对象
 */
export const getMyTodos = (user) => {
    if (!user) return [];

    // 1. 获取异常模块数据 (模拟从 DB/LocalStorage 取)
    const storedTickets = JSON.parse(localStorage.getItem('QMES_ABNORMAL_TICKETS') || '[]');

    // 2. 过滤属于我的任务
    const myAbnormalTasks = storedTickets
        .filter(t => t.currentHandler === user.username && t.status !== 'CLOSED')
        .map(mapAbnormalToTodo);

    // 3. (可选) 这里可以合并其他模块任务，如审批流、点检任务等
    // const myApprovalTasks = ...

    // 4. 按时间倒序排列
    return [...myAbnormalTasks].sort((a, b) => new Date(b.time) - new Date(a.time));
};

/**
 * 获取待办统计数据 (用于Dashboard Badge)
 */
export const getTodoStats = (user) => {
    const todos = getMyTodos(user);
    return {
        total: todos.length,
        high: todos.filter(t => t.priority === 'high').length
    };
};