/**
 * @file: src/components/Common/LogPanel.jsx
 * @description: 居中弹出的通用日志面板
 */
import React, { useState } from 'react';
import '../../styles/components.css';

const LogPanel = ({ visible, onClose, logs = [], flows = [] }) => {
    const [activeTab, setActiveTab] = useState('flow');
    const [search, setSearch] = useState('');

    if (!visible) return null;
    const filteredFlows = flows.filter(f => f.node.includes(search) || f.operator.includes(search));

    return (
        <div className="aip-global-overlay open" style={{zIndex: 2500}} onClick={onClose}>
            <div className="aip-modal-container" style={{ width: '700px', height: '600px', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', borderRadius: '8px', margin: 0, display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                <div className="aip-modal-header" style={{ padding: '15px 20px', borderBottom: '1px solid #e8e8e8' }}>
                    <div className="aip-modal-title">单据日志记录</div>
                    <i className="ri-close-line icon-btn" onClick={onClose}></i>
                </div>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <button onClick={() => setActiveTab('flow')} style={{ flex: 1, padding: '8px', border: activeTab === 'flow' ? '1px solid #1890ff' : '1px solid #d9d9d9', background: activeTab === 'flow' ? '#e6f7ff' : '#fff', color: activeTab === 'flow' ? '#1890ff' : '#666', borderRadius: '4px', cursor: 'pointer' }}><i className="ri-git-merge-line"></i> 流程日志</button>
                        <button onClick={() => setActiveTab('oper')} style={{ flex: 1, padding: '8px', border: activeTab === 'oper' ? '1px solid #1890ff' : '1px solid #d9d9d9', background: activeTab === 'oper' ? '#e6f7ff' : '#fff', color: activeTab === 'oper' ? '#1890ff' : '#666', borderRadius: '4px', cursor: 'pointer' }}><i className="ri-file-list-3-line"></i> 操作日志</button>
                    </div>
                    <input type="text" placeholder="搜索操作人、节点..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: '4px', fontSize: '13px' }} />
                </div>
                <div className="aip-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '0', background: '#fff' }}>
                    {activeTab === 'flow' && (
                        <div style={{ padding: '20px 30px' }}>
                            {filteredFlows.map((node, i) => (
                                <div key={i} style={{ display: 'flex', gap: '15px', position: 'relative', paddingBottom: '30px' }}>
                                    {i !== filteredFlows.length - 1 && <div style={{ position: 'absolute', left: '15px', top: '30px', bottom: 0, width: '2px', background: '#e8e8e8' }}></div>}
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, zIndex: 1, background: node.status === 'done' ? '#f6ffed' : '#e6f7ff', color: node.status === 'done' ? '#52c41a' : '#1890ff', border: '1px solid #d9d9d9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className={`ri-${node.status === 'done' ? 'check-line' : 'loader-4-line'}`}></i></div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{node.node} <span style={{ fontSize: '12px', color: '#999', fontWeight: 'normal', marginLeft: '10px' }}>{node.time}</span></div>
                                        <div style={{ fontSize: '13px', color: '#666' }}>操作人: <span style={{ color: '#1890ff' }}>{node.operator}</span></div>
                                        {node.comment && <div style={{ fontSize: '13px', color: '#555', background: '#fafafa', padding: '5px 10px', borderRadius: '4px', marginTop: '5px' }}>{node.comment}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'oper' && <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>暂无操作日志数据</div>}
                </div>
            </div>
        </div>
    );
};
export default LogPanel;