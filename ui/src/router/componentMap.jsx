/**
 * @file: src/router/componentMap.jsx
 * @description: 自动化路由注册表 (Auto-Discovery Router)
 * 核心升级：不再手动硬编码路由，而是利用 Vite 的 import.meta.glob 自动扫描所有业务模块的路由配置。
 * * 扩展规则：
 * 1. 在 src/features/ 任意子目录下新建文件，命名格式必须为 `*.routes.js`。
 * 2. 该文件默认导出 (export default) 一个对象，Key为路径，Value为懒加载组件。
 * 3. 系统会自动合并所有配置。
 */

// 扫描 src/features 下所有以 .routes.js 结尾的文件
// eager: true 表示立即加载配置对象本身（不是加载组件代码，而是加载路由表）
const modules = import.meta.glob('../features/**/*.routes.js', { eager: true });

const componentMap = {};

// 遍历并合并所有模块的路由配置
Object.keys(modules).forEach((path) => {
    const routeModule = modules[path];
    // 获取模块导出的路由对象
    const routes = routeModule.default || {};

    // 合并到总路由表中
    Object.assign(componentMap, routes);
});

console.log(`[Router] 已自动装载 ${Object.keys(componentMap).length} 个路由节点`, componentMap);

export default componentMap;