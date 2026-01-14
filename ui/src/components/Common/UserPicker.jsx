/**
 * @file: src/components/Common/UserPicker.jsx
 * @version: v1.0.0
 * @description: 仿钉钉风格人员选择器 + 内联智能搜索
 */
import React, { useState, useEffect, useRef } from 'react';
import './UserPicker.css';

// --- 模拟组织架构数据 ---
const MOCK_DB = {
    depts: [
        { id: 'd1', name: '品质管理部' },
        { id: 'd2', name: '生产制造部' },
        { id: 'd3', name: '工艺技术部' },
        { id: 'd4', name: '研发中心' }
    ],
    users: [
        { id: '1001', name: '张三', deptId: 'd1', deptName: '品质管理部' },
        { id: '1002', name: '李四', deptId: 'd1', deptName: '品质管理部' },
        { id: '1003', name: '王五', deptId: 'd2', deptName: '生产制造部' },
        { id: '1004', name: '赵六', deptId: 'd2', deptName: '生产制造部' },
        { id: '1005', name: '钱七', deptId: 'd3', deptName: '工艺技术部' },
        { id: '1008', name: '孙八', deptId: 'd4', deptName: '研发中心' },
    ]
};

const UserPicker = ({ value, onChange, placeholder = "请输入姓名或工号" }) => {
    // 内部状态
    const [inputValue, setInputValue] = useState(value || '');
    const [showDropdown, setShowDropdown] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    // 弹窗状态
    const [currentDept, setCurrentDept] = useState(null); // null = 根目录
    const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: '禾臣新材料' }]);
    const [selectedUser, setSelectedUser] = useState(null);

    const wrapperRef = useRef(null);

    // 点击外部关闭下拉
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 1. 内联查询逻辑
    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        onChange(val); // 允许直接输入文本

        if (val.trim()) {
            const hits = MOCK_DB.users.filter(u =>
                u.name.includes(val) || u.id.includes(val) || u.deptName.includes(val)
            );
            setSuggestions(hits);
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    };

    const handleSelectSuggestion = (user) => {
        const display = `${user.name}`; // 最终填入输入框的值
        setInputValue(display);
        onChange(display, user); // 传递完整对象给父组件
        setShowDropdown(false);
    };

    // 2. 通讯录弹窗逻辑
    const openModal = () => {
        setModalVisible(true);
        setCurrentDept(null);
        setBreadcrumbs([{ id: null, name: 'QMES公司' }]);
        setSelectedUser(null);
    };

    const handleDeptClick = (dept) => {
        setCurrentDept(dept.id);
        setBreadcrumbs([...breadcrumbs, dept]);
    };

    const handleBreadcrumbClick = (index) => {
        const newBread = breadcrumbs.slice(0, index + 1);
        setBreadcrumbs(newBread);
        setCurrentDept(newBread[newBread.length - 1].id);
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
    };

    const confirmModal = () => {
        if (selectedUser) {
            handleSelectSuggestion(selectedUser);
        }
        setModalVisible(false);
    };

    // 渲染部门或用户列表
    const renderModalContent = () => {
        if (!currentDept) {
            // 根目录：显示部门列表
            return MOCK_DB.depts.map(d => (
                <div key={d.id} className="ding-dept-item" onClick={() => handleDeptClick(d)}>
                    <i className="ri-folder-3-fill" style={{color: '#ffcd36', fontSize:'20px', marginRight:'10px'}}></i>
                    <span>{d.name}</span>
                    <i className="ri-arrow-right-s-line" style={{marginLeft:'auto', color:'#ccc'}}></i>
                </div>
            ));
        } else {
            // 部门内：显示用户列表
            const users = MOCK_DB.users.filter(u => u.deptId === currentDept);
            if (users.length === 0) return <div style={{padding:'20px', textAlign:'center', color:'#999'}}>该部门暂无人员</div>;

            return users.map(u => (
                <div key={u.id} className="ding-list-item" onClick={() => handleUserSelect(u)} style={{background: selectedUser?.id === u.id ? '#e6f7ff' : ''}}>
                    <div className="ding-avatar">{u.name.substr(0,1)}</div>
                    <div>
                        <div style={{fontWeight:'bold'}}>{u.name}</div>
                        <div style={{fontSize:'12px', color:'#666'}}>工号: {u.id} | {u.deptName}</div>
                    </div>
                    {selectedUser?.id === u.id && <i className="ri-check-line" style={{marginLeft:'auto', color:'#1890ff', fontWeight:'bold'}}></i>}
                </div>
            ));
        }
    };

    return (
        <div className="up-wrapper" ref={wrapperRef}>
            <div className="up-input-group">
                <input
                    type="text"
                    className="up-input"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    onFocus={() => inputValue && setShowDropdown(true)}
                />
                <div className="up-icon-btn" onClick={openModal} title="打开通讯录">
                    <i className="ri-contacts-book-2-fill"></i>
                </div>
            </div>

            {/* 内联下拉提示 */}
            {showDropdown && suggestions.length > 0 && (
                <div className="up-dropdown">
                    {suggestions.map(u => (
                        <div key={u.id} className="up-item" onClick={() => handleSelectSuggestion(u)}>
                            <div className="up-item-info">
                                <span style={{fontWeight:'bold', color:'#333'}}>{u.name}</span>
                                <span className="up-item-sub">{u.id} - {u.deptName}</span>
                            </div>
                            <i className="ri-user-add-line" style={{color:'#ccc'}}></i>
                        </div>
                    ))}
                </div>
            )}

            {/* 通讯录弹窗 Modal */}
            {modalVisible && (
                <div className="ding-modal-mask">
                    <div className="ding-modal">
                        <div className="ding-header">
                            <span>选择办理人</span>
                            <i className="ri-close-line icon-btn" onClick={() => setModalVisible(false)} style={{cursor:'pointer', fontWeight:'normal'}}></i>
                        </div>
                        <div className="ding-body">
                            <div className="ding-sidebar">
                                <div style={{padding:'0 15px', fontSize:'12px', color:'#999', marginBottom:'10px'}}>组织架构</div>
                                {MOCK_DB.depts.map(d => (
                                    <div key={d.id} className="ding-dept-item" onClick={() => { setCurrentDept(d.id); setBreadcrumbs([{ id: null, name: 'QMES公司' }, d]); }} style={{background: currentDept === d.id ? '#e6f7ff' : '', padding:'8px 15px'}}>
                                        <i className="ri-building-4-line" style={{marginRight:'8px'}}></i> {d.name}
                                    </div>
                                ))}
                            </div>
                            <div className="ding-content">
                                <div className="ding-breadcrumb">
                                    {breadcrumbs.map((b, i) => (
                                        <span key={b.id || 'root'}>
                                            <span onClick={() => handleBreadcrumbClick(i)}>{b.name}</span>
                                            {i < breadcrumbs.length - 1 && <span style={{margin:'0 5px', color:'#999'}}>/</span>}
                                        </span>
                                    ))}
                                </div>
                                <div className="ding-list">
                                    {renderModalContent()}
                                </div>
                            </div>
                        </div>
                        <div className="ding-footer">
                            <button className="small-btn" onClick={() => setModalVisible(false)}>取消</button>
                            <button className="small-btn primary" disabled={!selectedUser} onClick={confirmModal}>确定</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPicker;