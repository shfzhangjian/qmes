/**
 * @file: src/features/Production/WorkOrderExecution.jsx
 * @description: 数字化生产执行一张网 (MES + QMES 深度集成)
 * - [Fix] 修复了 JSX 中 '>' 符号未转义导致的编译错误
 * - [Feature] 集成看板视图、工序流转、报工、投料、异常、质检、入库等全功能
 */
import React, { useState, useEffect } from 'react';

// =============================================================================
// 1. 业务 Mock 组件集 (模拟外部质量与仓储界面联跳)
// =============================================================================

const MockAbnormalEvent = ({ visible, record, onClose }) => {
    if (!visible) return null;
    return (
        <div className="overlay-fixed" style={{ zIndex: 6000 }}>
            <div className="mdo-window" style={{ borderTop: '4px solid #ff4d4f', height: '65vh', width: '800px' }}>
                <div className="mdo-toolbar">
                    <div className="mdo-toolbar-left">
                        <i className="ri-alarm-warning-fill" style={{ color: '#ff4d4f', fontSize: '20px' }}></i>
                        <span className="mdo-title">安灯 (Andon) 异常申报 - {record.node}</span>
                    </div>
                    <div className="mdo-toolbar-right">
                        <button className="mdo-btn primary" style={{backgroundColor:'#ff4d4f'}} onClick={onClose}>确认提交异常</button>
                        <button className="mdo-btn" onClick={onClose}>取消</button>
                    </div>
                </div>
                <div className="mdo-body" style={{ background: '#fff1f0', padding: '24px' }}>
                    <div className="mdo-section">
                        <div className="section-title">现场异常详情</div>
                        <div className="form-grid-3">
                            <div className="form-item"><label className="required">发现人</label><input className="std-input" defaultValue="张作业" /></div>
                            <div className="form-item"><label className="required">异常分类</label><select className="std-input"><option>设备故障</option><option>物料短缺</option><option>安全隐患</option></select></div>
                            <div className="form-item"><label className="required">紧急度</label><select className="std-input"><option>P0 - 停产</option><option>P1 - 减速</option><option>P2 - 提醒</option></select></div>
                        </div>
                        <div className="form-item" style={{ marginTop: '16px' }}>
                            <label className="required">现象描述</label>
                            <textarea className="std-input" style={{ height: '100px' }} placeholder="请详细描述异常现象，系统将自动通知值班机修及线长..." />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MockIqcRecord = ({ visible, record, onClose, onPass, onFail }) => {
    if (!visible) return null;
    return (
        <div className="overlay-fixed" style={{ zIndex: 6000 }}>
            <div className="mdo-window" style={{ borderTop: '4px solid #faad14', height: '75vh', width: '900px' }}>
                <div className="mdo-toolbar">
                    <div className="mdo-toolbar-left">
                        <i className="ri-shield-check-fill" style={{ color: '#faad14', fontSize: '20px' }}></i>
                        <span className="mdo-title">IPQC 过程检验 - {record.node}</span>
                    </div>
                    <div className="mdo-toolbar-right">
                        <button className="mdo-btn" style={{ backgroundColor: '#52c41a', color: '#fff' }} onClick={onPass}>结果合格并结案</button>
                        <button className="mdo-btn" style={{ backgroundColor: '#ff4d4f', color: '#fff' }} onClick={onFail}>结果不合格(开NCR)</button>
                        <button className="mdo-btn" onClick={onClose}>返回修改</button>
                    </div>
                </div>
                <div className="mdo-body" style={{ background: '#fffbe6', padding: '24px' }}>
                    <div className="mdo-section">
                        <div className="section-title">检验项目配置 (KPC点)</div>
                        <table className="sub-table compact">
                            <thead><tr><th>检验项目</th><th>检验标准</th><th>检测实绩</th><th>判定</th></tr></thead>
                            <tbody>
                            <tr><td>固化腔温度</td><td>110±5 ℃</td><td><input className="cell-input center" defaultValue="112" /></td><td><span className="q-tag success">OK</span></td></tr>
                            <tr><td>抛光垫硬度</td><td>55±3 D</td><td><input className="cell-input center" defaultValue="56" /></td><td><span className="q-tag success">OK</span></td></tr>
                            <tr><td>表面气泡</td><td>无直径 &gt; 0.1mm 气泡</td><td><input className="cell-input center" defaultValue="符合" /></td><td><span className="q-tag success">OK</span></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MockNonConforming = ({ visible, record, onClose }) => {
    if (!visible) return null;
    return (
        <div className="overlay-fixed" style={{ zIndex: 6100 }}>
            <div className="mdo-window" style={{ borderTop: '4px solid #722ed1', height: '50vh', width: '700px' }}>
                <div className="mdo-toolbar">
                    <div className="mdo-toolbar-left"><i className="ri-file-warning-fill" style={{ color: '#722ed1', fontSize: '20px' }}></i><span className="mdo-title">NCR 不合格品处置系统</span></div>
                    <div className="mdo-toolbar-right"><button className="mdo-btn primary" onClick={onClose}>隔离处置</button><button className="mdo-btn" onClick={onClose}>关闭</button></div>
                </div>
                <div className="mdo-body" style={{ background: '#f9f0ff', padding: '24px' }}>
                    <div className="form-grid-2">
                        <div className="form-item"><label>不合格代码</label><input className="std-input" value="SFC-SCR-01" disabled /></div>
                        <div className="form-item"><label>处置方案</label><select className="std-input"><option>返修</option><option>特采</option><option>报废</option></select></div>
                    </div>
                    <textarea className="std-input" style={{ marginTop: '16px', height: '80px' }} defaultValue="判定结果：表面划伤。申请对该批次进行离线复检..." />
                </div>
            </div>
        </div>
    );
};

const MockWarehouseEntry = ({ visible, record, onClose }) => {
    if (!visible) return null;
    return (
        <div className="overlay-fixed" style={{ zIndex: 6000 }}>
            <div className="mdo-window" style={{ borderTop: '4px solid #13c2c2', height: '50vh', width: '600px' }}>
                <div className="mdo-toolbar">
                    <div className="mdo-toolbar-left"><i className="ri-inbox-archive-fill" style={{ color: '#13c2c2' }}></i><span className="mdo-title">成品入库申请 (ERP/WMS联通)</span></div>
                    <div className="mdo-toolbar-right"><button className="mdo-btn primary" style={{backgroundColor:'#13c2c2'}} onClick={onClose}>同步至仓库</button><button className="mdo-btn" onClick={onClose}>取消</button></div>
                </div>
                <div className="mdo-body" style={{ padding: '24px' }}>
                    <div className="form-grid-2">
                        <div className="form-item"><label>待入库产品</label><input className="std-input" value={record.prodName} disabled /></div>
                        <div className="form-item"><label>完工入库量</label><input className="std-input" value={record.qty} disabled /></div>
                        <div className="form-item"><label>存储库位</label><input className="std-input" defaultValue="FG-B1-02-15" /></div>
                        <div className="form-item"><label>批次号</label><input className="std-input" value={record.woId} disabled /></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// 2. 主执行看板工作台
// =============================================================================

const App = () => {
    // --- 状态控制 ---
    const [currentWO, setCurrentWO] = useState(null);
    const [activeNode, setActiveNode] = useState(null);
    const [workStatus, setWorkStatus] = useState('IDLE'); // IDLE, RUNNING, PAUSED, QC_PENDING
    const [actualData, setActualData] = useState({ okQty: 0, ngQty: 0, laborTime: 45, startTime: '--:--' });
    const [modalType, setModalType] = useState(null);
    const [activities, setActivities] = useState([]); // 动态流记录

    // --- 初始化模拟数据 ---
    useEffect(() => {
        const mockWO = {
            id: 'WO-260116-A01',
            productName: '12寸CMP抛光垫',
            productCode: 'PAD-CMP-300',
            planQty: 500,
            unit: '片',
            route: [
                { id: 10, seq: 10, name: '原料预混', status: 'finished', wc: '配料中心-01', operator: '张三', time: '08:30' },
                { id: 20, seq: 20, name: '离心浇注', status: 'running', wc: '浇注产线-A', operator: '李工', progress: 65 },
                { id: 30, seq: 30, name: '高温固化', status: 'pending', wc: '固化炉-05', qcNeeded: true },
                { id: 40, seq: 40, name: '成品检包', status: 'pending', wc: '洁净包装间', oqcNeeded: true }
            ],
            materials: [
                { id: 1, code: 'RM-PUR-001', name: '聚氨酯预聚体', req: 2500, used: 1200, unit: 'kg' },
                { id: 2, code: 'RM-MOCA-02', name: '固化剂', req: 300, used: 140, unit: 'kg' }
            ]
        };
        setCurrentWO(mockWO);
        setActiveNode(mockWO.route[1]);
        setActivities([
            { time: '10:15:20', text: '<b>[报工]</b> 操作员 张三 录入合格品 25 片。', icon: '#1890ff' },
            { time: '09:15:00', text: '<b>[完工]</b> 工序 [原料预混] 已顺利结单。', icon: '#52c41a' },
            { time: '08:30:15', text: '<b>[系统]</b> 工单 WO-260116-A01 正式下达。', icon: '#faad14' }
        ]);
    }, []);

    const addActivity = (text, icon = '#1890ff') => {
        setActivities([{ time: new Date().toLocaleTimeString(), text, icon }, ...activities]);
    };

    // --- 交互执行器 ---
    const handleStart = () => {
        setWorkStatus('RUNNING');
        setActualData({ ...actualData, startTime: new Date().toLocaleTimeString().slice(0, 5) });
        addActivity(`<b>[开工]</b> 工序 [${activeNode.name}] 开始作业。`);
    };

    const handleFinishStep = () => {
        if (activeNode.qcNeeded) {
            setWorkStatus('QC_PENDING');
            setModalType('QC');
        } else {
            addActivity(`<b>[完工]</b> 工序 [${activeNode.name}] 已提交完工申请。`, '#52c41a');
            setWorkStatus('IDLE');
        }
    };

    const handleQCResult = (passed) => {
        if (passed) {
            setModalType(null);
            setWorkStatus('IDLE');
            addActivity(`<b>[质检]</b> 工序 [${activeNode.name}] 检验通过。`, '#52c41a');
            if (activeNode.oqcNeeded) setModalType('WAREHOUSE');
        } else {
            setModalType('NCR');
        }
    };

    if (!currentWO) return <div className="loading-mask">任务调度中...</div>;

    return (
        <div className="mes-workbench">
            <style>{`
        .mes-workbench { height: 100vh; display: flex; flex-direction: column; background: #f0f2f5; font-family: -apple-system, system-ui, sans-serif; overflow: hidden; }
        
        /* 顶部看板条 */
        .exec-top-kanban { height: 80px; background: #001529; color: #fff; display: flex; align-items: center; padding: 0 24px; gap: 48px; border-bottom: 2px solid #1890ff; }
        .kb-item { display: flex; flex-direction: column; gap: 6px; }
        .kb-label { font-size: 11px; color: #8c8c8c; text-transform: uppercase; font-weight: bold; }
        .kb-value { font-size: 20px; font-weight: 800; font-family: 'Consolas', monospace; }
        
        .layout-main { flex: 1; display: flex; overflow: hidden; }

        /* 左侧工位工艺轴 */
        .exec-sidebar { width: 280px; background: #fff; border-right: 1px solid #d9d9d9; display: flex; flex-direction: column; }
        .sb-header { padding: 16px; font-weight: bold; border-bottom: 1px solid #f0f0f0; background: #fafafa; display: flex; justify-content: space-between; }
        .route-path { flex: 1; overflow-y: auto; padding: 24px 16px; }
        .node-step { position: relative; padding-left: 48px; padding-bottom: 36px; cursor: pointer; }
        .node-step::before { content: ''; position: absolute; left: 19px; top: 18px; bottom: 0; width: 2px; background: #e8e8e8; }
        .node-step.finished::before { background: #52c41a; }
        .node-step:last-child::before { display: none; }
        .node-dot { position: absolute; left: 0; top: 0; width: 38px; height: 38px; border-radius: 50%; background: #fff; border: 2px solid #d9d9d9; z-index: 2; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; transition: 0.3s; }
        
        .node-step.finished .node-dot { background: #52c41a; border-color: #52c41a; color: #fff; }
        .node-step.running .node-dot { background: #1890ff; border-color: #1890ff; color: #fff; box-shadow: 0 0 10px rgba(24, 144, 255, 0.4); }
        .node-step.active .node-card { border-color: #1890ff; background: #f0f7ff; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .node-card { border: 1px solid #e8e8e8; padding: 14px; border-radius: 8px; transition: 0.2s; }
        .node-name { font-weight: 700; font-size: 15px; margin-bottom: 6px; }

        /* 中央主控制台 */
        .exec-center { flex: 1; display: flex; flex-direction: column; background: #f5f7fa; overflow-y: auto; }
        .control-panel { background: #fff; padding: 20px 24px; border-bottom: 1px solid #e8e8e8; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; }
        
        .status-pill { padding: 6px 14px; border-radius: 30px; font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
        .status-pill.RUNNING { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
        .status-pill.RUNNING::before { content:''; width:10px; height:10px; background:#1890ff; border-radius:50%; animation: blink 1s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.2; } 100% { opacity: 1; } }

        .exec-card { background: #fff; margin: 20px 24px 0 24px; border-radius: 10px; border: 1px solid #e8e8e8; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
        .section-title { font-size: 16px; font-weight: 800; margin-bottom: 20px; border-left: 5px solid #1890ff; padding-left: 12px; display: flex; justify-content: space-between; }

        .sub-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .sub-table th { background: #f7f9fb; padding: 14px; text-align: left; border-bottom: 2px solid #e8e8e8; color: #595959; }
        .sub-table td { padding: 14px; border-bottom: 1px solid #f0f0f0; }
        .cell-input { width: 100%; border: 1px solid transparent; background: transparent; padding: 8px; border-radius: 4px; outline: none; transition: 0.2s; }
        .cell-input:focus { background: #fff; border-color: #1890ff; box-shadow: inset 0 0 0 1px #1890ff; }

        /* 右侧动态记录流 */
        .exec-stream { width: 320px; background: #fff; border-left: 1px solid #d9d9d9; display: flex; flex-direction: column; }
        .stream-list { flex: 1; overflow-y: auto; padding: 20px; }
        .stream-item { display: flex; gap: 14px; padding-bottom: 24px; position: relative; }
        .stream-item::before { content:''; position:absolute; left:7px; top:22px; bottom:0; width:1px; background:#f0f0f0; }
        .stream-icon { width:14px; height:14px; border-radius:50%; background:#1890ff; z-index:2; margin-top:4px; border: 3px solid #fff; box-shadow: 0 0 0 1px #1890ff; }
        .stream-time { color: #bfbfbf; font-size: 11px; margin-bottom: 6px; font-family: monospace; }
        .stream-text { color: #555; font-size: 13px; line-height: 1.6; }

        /* 公共原子组件 */
        .mdo-btn { display: inline-flex; align-items: center; gap: 8px; padding: 0 20px; height: 40px; border: 1px solid #d9d9d9; background: #fff; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; transition: 0.2s; }
        .mdo-btn.primary { background: #1890ff; color: #fff; border: none; box-shadow: 0 2px 6px rgba(24,144,255,0.3); }
        .mdo-btn.danger { background: #ff4d4f; color: #fff; border: none; }
        .form-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .std-input { height: 40px; border: 1px solid #d9d9d9; border-radius: 6px; padding: 0 14px; font-size: 15px; outline: none; transition: 0.2s; }
        .std-input:focus { border-color: #1890ff; box-shadow: 0 0 0 2px rgba(24,144,255,0.1); }
        .overlay-fixed { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.55); display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); }
        .mdo-window { background: #fff; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
        .mdo-toolbar { height: 60px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; padding: 0 24px; flex-shrink: 0; }
        .mdo-title { font-weight: 800; font-size: 17px; }
        .q-tag { padding: 2px 10px; border-radius: 6px; font-size: 12px; border: 1px solid #d9d9d9; font-weight: bold; }
        .q-tag.success { background: #f6ffed; color: #52c41a; border-color: #b7eb8f; }
        .required::after { content: ' *'; color: #ff4d4f; }
      `}</style>

            {/* 1. 顶部看板 */}
            <header className="exec-top-kanban">
                <div className="kb-item">
                    <span className="kb-label">当前运行工单</span>
                    <span className="kb-value" style={{ color: '#69c0ff' }}>{currentWO.id}</span>
                </div>
                <div className="kb-item">
                    <span className="kb-label">产品物料</span>
                    <span className="kb-value">{currentWO.productName}</span>
                </div>
                <div className="kb-item">
                    <span className="kb-label">计划交付</span>
                    <span className="kb-value">500 <small style={{fontSize:12, color:'#8c8c8c'}}>{currentWO.unit}</small></span>
                </div>
                <div className="kb-item" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <span className="kb-label">线体预警</span>
                    <span className="kb-value" style={{ color: '#ff4d4f' }}>安灯 P1 <i className="ri-error-warning-fill"></i></span>
                </div>
            </header>

            <div className="layout-main">
                {/* 2. 左侧工艺轴 */}
                <aside className="exec-sidebar">
                    <div className="sb-header"><span>工艺路线导航</span><i className="ri-node-tree"></i></div>
                    <div className="route-path">
                        {currentWO.route.map(node => (
                            <div key={node.id} className={`node-step ${node.status} ${activeNode?.id === node.id ? 'active' : ''}`} onClick={() => setActiveNode(node)}>
                                <div className="node-dot">{node.status === 'finished' ? <i className="ri-check-line"></i> : node.seq}</div>
                                <div className="node-card">
                                    <div className="node-name">{node.name}</div>
                                    <div className="node-meta">{node.wc} {node.time && `| ${node.time}`}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* 3. 中央作业区 */}
                <main className="exec-center">
                    <div className="control-panel">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <span className={`status-pill ${workStatus}`}>{workStatus === 'RUNNING' ? '作业中' : '待开工'}</span>
                            <span style={{ fontSize: '20px', fontWeight: '800' }}>工序：{activeNode.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="mdo-btn" onClick={() => alert('已向物流部发出补料指令')}><i className="ri-truck-line"></i> 送料呼叫</button>
                            <button className="mdo-btn danger" onClick={() => alert('维修请求已发送')}><i className="ri-tools-line"></i> 呼叫维修</button>
                            <div className="mdo-divider"></div>
                            {workStatus === 'IDLE' ? (
                                <button className="mdo-btn primary" onClick={handleStart}><i className="ri-play-fill"></i> 标记开工</button>
                            ) : (
                                <button className="mdo-btn primary" style={{ backgroundColor: '#52c41a' }} onClick={handleFinishStep}><i className="ri-checkbox-circle-line"></i> 提交完工</button>
                            )}
                        </div>
                    </div>

                    {/* 报产报工卡片 */}
                    <div className="exec-card">
                        <div className="section-title">作业实绩实时报工 (Production Reporting)</div>
                        <div className="form-grid-4">
                            <div className="form-item"><label className="required">合格产量</label><input className="std-input" type="number" style={{ fontSize: '22px', color: '#1890ff', fontWeight: '800' }} value={actualData.okQty} onChange={e => setActualData({ ...actualData, okQty: e.target.value })} /></div>
                            <div className="form-item"><label>不合格数量</label><input className="std-input" type="number" style={{ color: '#ff4d4f' }} value={actualData.ngQty} onChange={e => setActualData({ ...actualData, ngQty: e.target.value })} /></div>
                            <div className="form-item"><label className="required">实绩工时 (min)</label><input className="std-input" type="number" value={actualData.laborTime} onChange={e => setActualData({ ...actualData, laborTime: e.target.value })} /></div>
                            <div className="form-item"><label>作业开启时刻</label><input className="std-input" value={actualData.startTime} disabled /></div>
                        </div>

                        {/* 投料消耗编辑器 */}
                        <div style={{ marginTop: '28px' }}>
                            <div className="section-title"><span><i className="ri-ink-bottle-line"></i> 工序投料记录 (BOM Consumption)</span><button className="q-tag primary" onClick={() => alert('扫码器就绪')}>扫码投料</button></div>
                            <table className="sub-table">
                                <thead><tr><th>物料名称</th><th width="100">计划需求</th><th width="100">累计已投</th><th width="140">本次消耗</th><th>物料批次 (Batch)</th></tr></thead>
                                <tbody>
                                {currentWO.materials.map(m => (
                                    <tr key={m.id}>
                                        <td><b>{m.name}</b><br/><small>{m.code}</small></td>
                                        <td>{m.req} {m.unit}</td><td>{m.used}</td>
                                        <td><input className="cell-input center" type="number" defaultValue={0} style={{ fontWeight: 'bold', color: '#1890ff' }} /></td>
                                        <td><input className="cell-input" placeholder="扫码录入批次号" /></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 异常与质量快捷控制区 */}
                    <div style={{ display: 'flex', gap: '24px', padding: '0 24px 24px 24px' }}>
                        <div className="exec-card" style={{ flex: 1, margin: 0, borderLeft: '5px solid #ff4d4f', background: '#fff' }}>
                            <div className="section-title" style={{ border: 'none', padding: 0 }}>异常事件申报</div>
                            <p style={{ fontSize: '13px', color: '#8c8c8c', margin: '12px 0' }}>发现设备参数漂移、物料批次错误或安全隐患时，请立即触发申报。</p>
                            <button className="mdo-btn danger" style={{ width: '100%' }} onClick={() => setModalType('ABNORMAL')}><i className="ri-alarm-warning-line"></i> 上报现场异常</button>
                        </div>
                        <div className="exec-card" style={{ flex: 1, margin: 0, borderLeft: '5px solid #faad14', background: '#fff' }}>
                            <div className="section-title" style={{ border: 'none', padding: 0 }}>质量红线卡控</div>
                            <p style={{ fontSize: '13px', color: '#8c8c8c', margin: '12px 0' }}>本工序已标记为 IPQC 强控点。完工提交前必须通过检验判定。</p>
                            <button className="mdo-btn" style={{ width: '100%', borderColor: '#faad14', color: '#faad14' }} onClick={() => setModalType('QC')}><i className="ri-shield-check-line"></i> 执行质检作业</button>
                        </div>
                    </div>
                </main>

                {/* 4. 右侧动态流 */}
                <aside className="exec-stream">
                    <div className="sb-header"><span>现场实时日志</span><i className="ri-history-line"></i></div>
                    <div className="stream-list">
                        {activities.map((act, i) => (
                            <div key={i} className="stream-item">
                                <div className="stream-icon" style={{ backgroundColor: act.icon, boxShadow: `0 0 0 1px ${act.icon}` }}></div>
                                <div className="stream-content">
                                    <div className="stream-time">{act.time}</div>
                                    <div className="stream-text" dangerouslySetInnerHTML={{ __html: act.text }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>

            {/* 5. 弹窗集成2 */}
            <MockAbnormalEvent visible={modalType === 'ABNORMAL'} record={{ node: activeNode.name }} onClose={() => setModalType(null)} />
            <MockIqcRecord visible={modalType === 'QC'} record={{ node: activeNode.name }} onClose={() => setModalType(null)} onPass={() => handleQCResult(true)} onFail={() => handleQCResult(false)} />
            <MockNonConforming visible={modalType === 'NCR'} record={{ source: currentWO.id }} onClose={() => setModalType(null)} />
            <MockWarehouseEntry visible={modalType === 'WAREHOUSE'} record={{ prodName: currentWO.productName, qty: actualData.okQty || 125, woId: currentWO.id }} onClose={() => setModalType(null)} />
        </div>
    );
};

export default App;