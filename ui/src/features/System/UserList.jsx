/**
 * @file: src/features/System/UserList.jsx
 * @description: 系统用户管理
 * - [Update] 支持批量分配角色
 * - [UI] 优化角色列展示 (Tag + 溢出隐藏)
 * - [Data] 角色数据全中文显示
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import UserDetail from './UserDetail';
import RolePicker from '../../components/Common/RolePicker'; // 引入角色选择器

const UserList = () => {
    const [queryParams, setQueryParams] = useState({ keyword: '', dept: '', status: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [rolePickerVisible, setRolePickerVisible] = useState(false);
    const [rolePickerMode, setRolePickerMode] = useState('add'); // 'add' | 'remove'
    const [currentRecord, setCurrentRecord] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // 选中行

    // --- 模拟数据 (角色全中文) ---
    const [dataList, setDataList] = useState([
        { id: 'U001', username: 'admin', name: '系统管理员', dept: '总经办', duty: 'IT经理', roles: ['超级管理员', '部门经理'], phone: '13800138000', email: 'admin@hechen.com', status: '启用' },
        { id: 'U002', username: 'pe_zhang', name: '张工艺', dept: '工程技术部', duty: 'PE主管', roles: ['工艺工程师', '部门经理'], phone: '13912345678', email: 'zhang.gy@hechen.com', status: '启用' },
        { id: 'U003', username: 'qc_sun', name: '孙品质', dept: '品质管理部', duty: '品质经理', roles: ['质检员'], phone: '13987654321', email: 'sun.qc@hechen.com', status: '启用' },
        { id: 'U004', username: 'wh_li', name: '李仓管', dept: '仓储物流部', duty: '仓管员', roles: ['仓管员', '质检员'], phone: '13700000000', email: 'li.wh@hechen.com', status: '启用' },
    ]);

    const columns = [
        {
            title: '选择', key: 'selection', width: 50, fixed: 'left', align: 'center',
            renderHeader: () => <input type="checkbox" onChange={handleSelectAll} checked={selectedRowKeys.length === dataList.length && dataList.length > 0} />,
            render: (_, r) => <input type="checkbox" checked={selectedRowKeys.includes(r.id)} onChange={() => handleSelectRow(r.id)} />
        },
        { title: '工号/账号', dataIndex: 'username', width: 120, fixed:'left', render: t => <b>{t}</b> },
        { title: '姓名', dataIndex: 'name', width: 120 },
        { title: '所属部门', dataIndex: 'dept', width: 150 },
        { title: '岗位', dataIndex: 'duty', width: 150 },
        {
            title: '系统角色',
            dataIndex: 'roles',
            width: 250,
            render: (roles) => {
                if (!roles || roles.length === 0) return <span style={{color:'#ccc'}}>-</span>;
                const displayRoles = roles.slice(0, 2);
                const moreCount = roles.length - 2;
                return (
                    <div style={{display:'flex', gap:'4px', alignItems:'center'}}>
                        {displayRoles.map(r => <span key={r} className="q-tag primary">{r}</span>)}
                        {moreCount > 0 && <span className="q-tag" style={{background:'#f0f0f0', color:'#999'}}>+{moreCount}</span>}
                    </div>
                );
            }
        },
        { title: '手机号', dataIndex: 'phone', width: 120 },
        { title: '状态', dataIndex: 'status', width: 80, align:'center', render: t => <span style={{color:t==='启用'?'#52c41a':'#ccc'}}>● {t}</span> },
        {
            title: '操作', key: 'op', width: 150, fixed: 'right',
            render: (_, r) => (
                <div style={{display:'flex', gap:'8px'}}>
                    <button className="small-btn outline" onClick={() => { setCurrentRecord(r); setModalVisible(true); }}>编辑</button>
                    <button className="small-btn outline" style={{color:'#faad14'}}>重置</button>
                </div>
            )
        }
    ];

    // --- 批量选择逻辑 ---
    const handleSelectAll = (e) => setSelectedRowKeys(e.target.checked ? dataList.map(i => i.id) : []);
    const handleSelectRow = (id) => setSelectedRowKeys(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);

    // --- 批量角色操作 ---
    const openBatchRolePicker = (mode) => {
        if (selectedRowKeys.length === 0) return alert('请先选择用户！');
        setRolePickerMode(mode);
        setRolePickerVisible(true);
    };

    const handleBatchRoleConfirm = (selectedRoles) => {
        // selectedRoles 这里也是中文名称数组
        if (selectedRoles.length === 0) return;

        setDataList(prev => prev.map(user => {
            if (!selectedRowKeys.includes(user.id)) return user;

            const currentRoles = new Set(user.roles || []);
            if (rolePickerMode === 'add') {
                selectedRoles.forEach(r => currentRoles.add(r));
            } else {
                selectedRoles.forEach(r => currentRoles.delete(r));
            }
            return { ...user, roles: Array.from(currentRoles) };
        }));

        setRolePickerVisible(false);
        setSelectedRowKeys([]);
        alert(`批量${rolePickerMode === 'add' ? '追加' : '移除'}角色成功！`);
    };

    // --- 单个保存 ---
    const handleSubmit = (data) => {
        if (data.id) {
            setDataList(prev => prev.map(item => item.id === data.id ? data : item));
        } else {
            setDataList(prev => [...prev, { ...data, id: `U${Date.now()}` }]);
        }
        setModalVisible(false);
    };

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '姓名/工号' },
                        { label: '部门', name: 'dept', placeholder: '所属部门' },
                        { label: '状态', name: 'status', type: 'select', options: [{label:'启用',value:'启用'},{label:'停用',value:'停用'}] }
                    ]}
                    data={queryParams} onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            toolbar={
                <>
                    <div style={{fontWeight:'bold'}}>系统管理 &gt; 用户管理</div>
                    <div style={{display:'flex', gap:'10px'}}>
                        {selectedRowKeys.length > 0 && (
                            <>
                                <button className="btn outline" onClick={() => openBatchRolePicker('add')}><i className="ri-user-add-line"></i> 批量追加角色</button>
                                <button className="btn outline" style={{color:'#ff4d4f', borderColor:'#ff4d4f'}} onClick={() => openBatchRolePicker('remove')}><i className="ri-user-unfollow-line"></i> 批量移除角色</button>
                            </>
                        )}
                        <button className="btn btn-primary" onClick={() => { setCurrentRecord(null); setModalVisible(true); }}><i className="ri-add-line"></i> 新增用户</button>
                    </div>
                </>
            }
        >
            <QueryTable columns={columns} dataSource={dataList} pagination={{total: dataList.length}} />

            <UserDetail
                visible={modalVisible}
                record={currentRecord}
                onClose={() => setModalVisible(false)}
                onSubmit={handleSubmit}
            />

            <RolePicker
                visible={rolePickerVisible}
                title={rolePickerMode === 'add' ? "批量追加角色" : "批量移除角色"}
                initialSelected={[]}
                onClose={() => setRolePickerVisible(false)}
                onConfirm={handleBatchRoleConfirm}
            />
        </PageLayout>
    );
};

export default UserList;