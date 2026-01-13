/**
 * @file: src/main.jsx
 * @description: React 应用入口文件，负责挂载根组件 App 到 DOM
 * @createDate: 2026-01-12
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// 全局引入 RemixIcon 样式，解决图标不显示的问题
import 'remixicon/fonts/remixicon.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)