/**
 * @file: src/main.jsx
 * @description: 应用入口，必须使用 AppProvider 包裹 App，否则会报 Context undefined 错误
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// 1. 引入 Provider (注意名字是 AppProvider)
import { AppProvider } from './context/AppContext.jsx'
// 2. 引入全局样式
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* 3. 关键：必须在这里包裹 AppProvider */}
        <AppProvider>
            <App />
        </AppProvider>
    </React.StrictMode>,
)