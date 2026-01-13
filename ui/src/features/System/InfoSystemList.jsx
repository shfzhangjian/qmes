/**
 * @file: src/features/System/InfoSystemList.jsx
 * @description: 通用的 [列表-查询-详情] 组件模板
 * 演示了标准的 CRUD 页面结构，支持搜索过滤和详情弹窗
 */
import React, { useState, useMemo } from 'react';

// --- 模拟数据 ---
const MOCK_SYSTEMS = Array.from({ length: 25 }).map((_, i) => ({
    id: `SYS-${1000 + i}`,
    name: ['MES 制造执行系统', 'ERP 企业资源计划', 'QMS 质量管理', 'WMS 仓储管理', 'SCADA 数据采集'][i % 5] + (i > 4 ? ` (节点 ${i})` : ''),
    status: i % 4 === 0 ? 'maintenance' : 'active',
    version: `v${(i % 3) + 1}.0.${i}`,
    deployTime: '2025-12-01',
    owner: ['张三', '李四', '王五'][i % 3],
    desc: '核心生产业务支撑系统，负责全厂调度与数据追踪。'
}));

const InfoSystemList = () => {
    // 状态管理
    const [query, setQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null); // 用于详情弹窗，null 表示关闭

    // 数据过滤 (前端搜索)
    const filteredData = useMemo(() => {
        return MOCK_SYSTEMS.filter(item =>
            item.name.includes(query) || item.id.includes(query)
        );
    }, [query]);

    return (
        <div className="content-card fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 1. 头部与查询区 */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>信息系统注册表</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ position: 'relative' }}>
                        <i className="ri-search-line" style={{ position: 'absolute', left: '10px', top: '8px', color: '#999' }}></i>
                        <input
                            type="text"
                            placeholder="搜索系统名称或ID..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            style={{ padding: '8px 12px 8px 35px', border: '1px solid #d9d9d9', borderRadius: '4px', outline: 'none', width: '240px' }}
                        />
                    </div>
                    <button className="btn btn-primary"><i className="ri-add-line"></i> 新增系统</button>
                </div>
            </div>

            {/* 2. 数据列表区 */}
            <div style={{ flex: 1, overflow: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead style={{ background: '#fafafa', position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>系统ID</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>系统名称</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>版本</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>状态</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>负责人</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredData.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                            <td style={{ padding: '12px', fontFamily: 'monospace', color: '#666' }}>{item.id}</td>
                            <td style={{ padding: '12px', fontWeight: '500' }}>{item.name}</td>
                            <td style={{ padding: '12px' }}><span className="tag" style={{background:'#f0f5ff', color:'#2f54eb'}}>{item.version}</span></td>
                            <td style={{ padding: '12px' }}>
                                {item.status === 'active' ?
                                    <span style={{color:'#52c41a'}}><i className="ri-checkbox-circle-fill"></i> 运行中</span> :
                                    <span style={{color:'#faad14'}}><i className="ri-tools-fill"></i> 维护中</span>
                                }
                            </td>
                            <td style={{ padding: '12px' }}>{item.owner}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                <button
                                    className="small-btn outline"
                                    onClick={() => setSelectedItem(item)}
                                    style={{ color: '#1890ff', borderColor: '#1890ff' }}
                                >
                                    详情
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {filteredData.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>未找到匹配的数据</div>
                )}
            </div>

            {/* 3. 详情模态框 (Modal) */}
            {selectedItem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setSelectedItem(null)}>
                    <div style={{
                        width: '600px', background: '#fff', borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        animation: 'fadeIn 0.2s ease-out'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ margin: 0 }}>系统详情: {selectedItem.name}</h3>
                            <i className="ri-close-line" style={{ cursor: 'pointer', fontSize: '20px' }} onClick={() => setSelectedItem(null)}></i>
                        </div>
                        <div style={{ padding: '30px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div><label style={{color:'#999', fontSize:'12px'}}>系统 ID</label><div style={{fontWeight:'bold'}}>{selectedItem.id}</div></div>
                                <div><label style={{color:'#999', fontSize:'12px'}}>当前版本</label><div>{selectedItem.version}</div></div>
                                <div><label style={{color:'#999', fontSize:'12px'}}>部署时间</label><div>{selectedItem.deployTime}</div></div>
                                <div><label style={{color:'#999', fontSize:'12px'}}>技术负责人</label><div>{selectedItem.owner}</div></div>
                                <div style={{gridColumn: 'span 2'}}><label style={{color:'#999', fontSize:'12px'}}>功能描述</label><div style={{marginTop:'5px', lineHeight:'1.5'}}>{selectedItem.desc}</div></div>
                            </div>
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid #eee', textAlign: 'right', background:'#fafafa', borderRadius:'0 0 8px 8px' }}>
                            <button className="btn btn-primary" onClick={() => setSelectedItem(null)}>关闭</button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );
};

export default InfoSystemList;