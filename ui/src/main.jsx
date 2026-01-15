import React from 'react'
import ReactDOM from 'react-dom/client'
// 1. 引入 Router
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
// 确保引入了 SimulationProvider (如果之前是在 App.jsx 里引用的，这里也要调整)
import { SimulationProvider } from './context/SimulationContext.jsx'
import 'remixicon/fonts/remixicon.css'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* 2. 将 BrowserRouter 放在最外层，包裹所有 Provider */}
        <BrowserRouter>
            <AppProvider>
                <SimulationProvider>
                    <App />
                </SimulationProvider>
            </AppProvider>
        </BrowserRouter>
    </React.StrictMode>,
)