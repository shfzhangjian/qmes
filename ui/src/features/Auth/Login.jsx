/**
 * @file: src/features/Auth/Login.jsx
 * @version: v5.4.0 (Org Select)
 * @description: 登录页适配新的组织架构显示
 */

import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import logoSvg from '../../assets/logo.jpg';
import '../../styles/login.css';

const Login = () => {
    const { login, systemTitle, systemSubtitle } = useContext(AppContext);
    const [isDemoMode, setIsDemoMode] = useState(false);

    // 适配新组织架构的演示列表
    const ACCOUNT_OPTIONS = [
        { value: '', label: '--- 请选择演示账号 ---' },
        { value: 'admin', label: 'IT管理员 (信息化部 - IT主管)' },
        { value: 'mgr',   label: '王经理 (生产部 - 生产经理) [MRB会员]' },
        { value: 'pe',    label: '赵工艺 (工艺部 - 高级工程师) [PCRB负责人]' },
        { value: 'qc',    label: '李质检 (品质部 - QA工程师) [MRB专家]' },
        { value: 'op',    label: '张操作 (生产部 - 一线操作工)' },
        { value: 'eq',    label: '孙设备 (设备部 - 设备主管)' },
        { value: 'wh',    label: '周仓储 (仓管部 - 仓库管理员)' },
        { value: 'pur',   label: '钱采购 (采购部 - 采购专员)' },
        { value: 'mkt',   label: '吴市场 (市场部 - 客户经理)' },
        { value: 'sqe',   label: '郑SQE (品质部 - SQE工程师)' },
        { value: 'guest', label: '访客 (外部)' }
    ];

    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleQuickSelect = (e) => {
        const user = e.target.value;
        if (user) {
            setFormData({ username: user, password: '123456' });
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username) {
            setError('请输入用户名');
            return;
        }
        setError('');
        setLoading(true);

        try {
            await login(formData.username, formData.password);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <div className="logo-icon" style={{background:'transparent', boxShadow:'none'}}>
                        <img src={logoSvg} alt="Logo" style={{width:'64px', height:'64px'}} />
                    </div>
                    <h1 style={{fontSize:'22px'}}>{systemTitle}</h1>
                    <p style={{fontStyle: 'italic', fontSize: '13px', color:'#999', marginTop: '5px'}}>
                        ({systemSubtitle})
                    </p>
                </div>

                <div className="demo-toggle-bar">
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={isDemoMode}
                            onChange={e => setIsDemoMode(e.target.checked)}
                        />
                        <span className="slider round"></span>
                    </label>
                    <span className="toggle-label" onClick={() => setIsDemoMode(!isDemoMode)}>开启演示模式</span>
                </div>

                {isDemoMode && (
                    <div className="quick-select-wrapper fade-in-down">
                        <i className="ri-building-4-line" style={{marginRight:'8px'}}></i>
                        <select className="quick-select" onChange={handleQuickSelect} defaultValue="">
                            {ACCOUNT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <div className="input-icon"><i className="ri-user-line"></i></div>
                        <input
                            type="text"
                            placeholder="请输入用户名"
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <div className="input-icon"><i className="ri-lock-line"></i></div>
                        <input
                            type="password"
                            placeholder="请输入密码"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    {error && <div className="error-msg"><i className="ri-error-warning-line"></i> {error}</div>}

                    <button type="submit" className={`login-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                        {loading ? (
                            <><i className="ri-loader-4-line spin"></i> 登录中...</>
                        ) : (
                            '登 录'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <span>v5.4.0 (Org+)</span>
                    <span>© 2026 Smart Factory</span>
                </div>
            </div>

            <div className="bg-shape shape-1"></div>
            <div className="bg-shape shape-2"></div>

            <style>{`
        .login-box {
            display: block; 
            width: 420px;
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(10px);
            padding: 40px 40px 30px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            z-index: 10;
            border: 1px solid #fff;
        }
        .login-header { margin-bottom: 20px; text-align: center; }
        .demo-toggle-bar { display: flex; align-items: center; justify-content: flex-end; margin-bottom: 15px; font-size: 12px; color: #666; }
        .toggle-label { cursor: pointer; margin-left: 8px; user-select: none; }
        .switch { position: relative; display: inline-block; width: 32px; height: 18px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 18px; }
        .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #1890ff; }
        input:checked + .slider:before { transform: translateX(14px); }
        .quick-select-wrapper { margin-bottom: 20px; padding: 8px 12px; background: #f0f7ff; border: 1px dashed #adc6ff; border-radius: 6px; display: flex; align-items: center; font-size: 13px; color: #1890ff; }
        .quick-select { flex: 1; padding: 6px; border: 1px solid #d9d9d9; border-radius: 4px; outline: none; color: #333; cursor: pointer; font-size: 12px; }
        .fade-in-down { animation: fadeInDown 0.3s ease-out; }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
};

export default Login;