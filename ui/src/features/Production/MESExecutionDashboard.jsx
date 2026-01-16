import React, { useState, useEffect, useMemo } from 'react';
import {
    Play, Pause, Square, ClipboardList, Box, Wrench, AlertTriangle,
    CheckCircle, History, ArrowRight, BarChart3, AlertOctagon,
    Package, Truck, Thermometer, Activity, XCircle, Search, Menu,
    ChevronLeft, ChevronRight, Save, Upload, Camera, Scale, Clock, CheckSquare,
    BookOpen, FileText, Monitor
} from 'lucide-react';
import './MESExecutionDashboard.css'; // 引入标准CSS

/**
 * 模拟数据：针对半导体精抛材料及空白掩膜版
 */
const MOCK_DATA = {
    currentUser: { name: "张工 (OP-001)", shift: "早班 A组", station: "CMP-05精加工台" },
    workOrders: [
        {
            id: "WO-20240520-001",
            productName: "CMP抛光软垫 (IC1000型)",
            productCode: "MTL-CMP-00X",
            batchNo: "BATCH-2405-A01",
            planQty: 200,
            completedQty: 45,
            status: "生产中", // PENDING, RUNNING, PAUSED, COMPLETED
            currentStepIndex: 2,
            priority: "HIGH",
            routing: [
                { id: 10, name: "原料配比与混合", status: "COMPLETED", operator: "李四" },
                { id: 20, name: "精密浇注模压", status: "COMPLETED", operator: "王五" },
                { id: 30, name: "CNC开槽与研磨", status: "IN_PROGRESS", type: "CRITICAL", qcRequired: true }, // 当前工序
                { id: 40, name: "超声波清洗", status: "PENDING", type: "NORMAL", qcRequired: false },
                { id: 50, name: "最终质检(FQC)", status: "PENDING", type: "QC", qcRequired: true },
                { id: 60, name: "洁净包装入库", status: "PENDING", type: "NORMAL", qcRequired: false },
            ],
            materials: [
                { name: "聚氨酯预聚体", required: "50kg", consumed: "12kg", batch: "MAT-2401-001" },
                { name: "高硬度固化剂", required: "5kg", consumed: "1.2kg", batch: "MAT-2401-002" }
            ]
        },
        {
            id: "WO-20240520-003",
            productName: "6025石英空白掩膜版",
            productCode: "MSK-QTZ-6025",
            batchNo: "BATCH-2405-B09",
            planQty: 50,
            completedQty: 0,
            status: "PENDING",
            currentStepIndex: 0,
            priority: "NORMAL",
            routing: [
                { id: 10, name: "基板粗抛", status: "PENDING", type: "NORMAL" },
                { id: 20, name: "双面精抛", status: "PENDING", type: "CRITICAL" },
                { id: 30, name: "清洗检测", status: "PENDING", type: "QC" }
            ],
            materials: [
                { name: "合成石英基板", required: "50pcs", consumed: "0" },
                { name: "CeO2研磨液", required: "20L", consumed: "0" }
            ]
        },
        {
            id: "WO-20240521-005",
            productName: "陶瓷吸附垫 (Vacuum Chuck)",
            productCode: "VAC-CER-200",
            batchNo: "BATCH-2405-C02",
            planQty: 10,
            completedQty: 8,
            status: "PAUSED",
            currentStepIndex: 3,
            priority: "LOW",
            routing: [
                { id: 10, name: "粉末成型", status: "COMPLETED" },
                { id: 20, name: "高温烧结", status: "COMPLETED" },
                { id: 30, name: "平面磨削", status: "COMPLETED" },
                { id: 40, name: "激光打孔", status: "PAUSED", pauseReason: "设备过热报警" },
                { id: 50, name: "出货检验", status: "PENDING" }
            ],
            materials: []
        }
    ]
};

// --- 子组件: 异常事件详情 (Andon) ---
const AbnormalEventDetail = ({ isOpen, onClose, onSubmit, orderId, stepName }) => {
    if (!isOpen) return null;
    return (
        <div className="mes-modal-overlay">
            <div className="mes-modal-content">
                <div className="mes-modal-header red">
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '1.125rem'}}>
                        <AlertTriangle className="h-6 w-6" />
                        <span>异常事件报告 (Andon)</span>
                    </div>
                    <button onClick={onClose} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}><XCircle /></button>
                </div>
                <div className="mes-modal-body">
                    <div style={{backgroundColor: '#fef2f2', padding: '12px', borderRadius: '6px', border: '1px solid #fee2e2', color: '#991b1b', marginBottom: '16px', fontSize: '0.875rem'}}>
                        <strong>关联工单:</strong> {orderId} <br/>
                        <strong>发生工序:</strong> {stepName}
                    </div>
                    <div className="mes-input-group">
                        <label className="mes-input-label">异常类型</label>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px'}}>
                            {['设备故障', '物料异常', '工艺品质', '安全隐患', '缺料等待', '其他'].map(type => (
                                <button key={type} className="mes-btn mes-btn-secondary" style={{fontSize: '0.875rem'}}>
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mes-input-group">
                        <label className="mes-input-label">详细描述</label>
                        <textarea className="mes-textarea" placeholder="请详细描述异常现象、发生时间及初步影响..."></textarea>
                    </div>
                </div>
                <div className="mes-modal-footer">
                    <button onClick={onClose} className="mes-btn mes-btn-secondary">取消</button>
                    <button onClick={() => { alert("异常已上报，并推送到班组长看板"); onSubmit(); }} className="mes-btn mes-btn-danger">
                        立即上报并呼叫
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 子组件: 设备报修 (Device Repair) ---
const DeviceRepairModal = ({ isOpen, onClose, onSubmit, station }) => {
    if (!isOpen) return null;
    return (
        <div className="mes-modal-overlay">
            <div className="mes-modal-content">
                <div className="mes-modal-header orange">
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '1.125rem'}}>
                        <Wrench className="h-6 w-6" />
                        <span>设备报修申请 (Maintenance)</span>
                    </div>
                    <button onClick={onClose} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}><XCircle /></button>
                </div>
                <div className="mes-modal-body">
                    <div className="mes-input-group">
                        <label className="mes-input-label">设备编号/机台</label>
                        <input type="text" value={station} disabled className="mes-select" style={{backgroundColor: '#f3f4f6'}} />
                    </div>
                    <div className="mes-input-group">
                        <label className="mes-input-label">故障分类</label>
                        <select className="mes-select">
                            <option>机械故障 (Mechanical)</option>
                            <option>电气故障 (Electrical)</option>
                            <option>软件/系统报错 (Software)</option>
                            <option>辅助设备异常 (Auxiliary)</option>
                        </select>
                    </div>
                    <div className="mes-input-group">
                        <label className="mes-input-label">故障描述</label>
                        <textarea className="mes-textarea" placeholder="请描述故障现象、报错代码等..."></textarea>
                    </div>
                    <div style={{display:'flex', gap:'8px'}}>
                        <label style={{display:'flex', alignItems:'center', gap:'4px', fontSize:'0.875rem'}}>
                            <input type="checkbox" /> 造成停机 (Machine Down)
                        </label>
                    </div>
                </div>
                <div className="mes-modal-footer">
                    <button onClick={onClose} className="mes-btn mes-btn-secondary">取消</button>
                    <button onClick={() => { alert("报修单已生成，维修人员正在赶来"); onSubmit(); }} className="mes-btn mes-btn-orange">
                        提交报修
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 子组件: 作业指导书 (SOP) ---
const SOPModal = ({ isOpen, onClose, stepName }) => {
    if (!isOpen) return null;
    return (
        <div className="mes-modal-overlay">
            <div className="mes-modal-content" style={{maxWidth: '800px', height: '80vh', display:'flex', flexDirection:'column'}}>
                <div className="mes-modal-header gray">
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '1.125rem'}}>
                        <BookOpen className="h-6 w-6" />
                        <span>作业指导书 (SOP) - {stepName}</span>
                    </div>
                    <button onClick={onClose} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}><XCircle /></button>
                </div>
                <div className="mes-modal-body" style={{flex: 1, overflowY: 'auto', backgroundColor: '#f9fafb'}}>
                    {/* 模拟 PDF 内容 */}
                    <div style={{textAlign:'center', marginBottom:'24px'}}>
                        <h2 style={{fontSize:'1.5rem', fontWeight:'bold', color:'#374151'}}>标准化作业流程 (SOP)</h2>
                        <div style={{color:'#6b7280', fontSize:'0.875rem'}}>文件编号: SOP-CMP-030 | 版本: V2.4</div>
                    </div>

                    <div style={{backgroundColor:'white', padding:'24px', borderRadius:'8px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', marginBottom:'16px'}}>
                        <h3 style={{fontWeight:'bold', borderBottom:'1px solid #e5e7eb', paddingBottom:'8px', marginBottom:'12px'}}>1. 准备工作</h3>
                        <p style={{fontSize:'0.875rem', lineHeight:'1.6', color:'#4b5563'}}>
                            1.1 检查机台气压是否在 0.5-0.7 MPa 范围内。<br/>
                            1.2 确认研磨液 (Slurry) 液位充足，无沉淀。<br/>
                            1.3 佩戴好防尘手套和护目镜。
                        </p>
                    </div>

                    <div style={{backgroundColor:'white', padding:'24px', borderRadius:'8px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', marginBottom:'16px'}}>
                        <h3 style={{fontWeight:'bold', borderBottom:'1px solid #e5e7eb', paddingBottom:'8px', marginBottom:'12px'}}>2. 操作步骤</h3>
                        <div style={{display:'flex', gap:'16px', alignItems:'flex-start'}}>
                            <div style={{flex:1, aspectRatio:'4/3', backgroundColor:'#e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', borderRadius:'4px'}}>
                                [示意图 A: 装夹]
                            </div>
                            <div style={{flex:2}}>
                                <p style={{fontSize:'0.875rem', lineHeight:'1.6', color:'#4b5563'}}>
                                    2.1 将抛光垫对准定位孔，平铺于转盘上。<br/>
                                    2.2 启动真空吸附 (Vacuum On)，确认吸附数值 &gt; -80kPa。<br/>
                                    2.3 启动修整臂，进行预修整 (Pre-Conditioning) 2分钟。
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{backgroundColor:'white', padding:'24px', borderRadius:'8px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
                        <h3 style={{fontWeight:'bold', borderBottom:'1px solid #e5e7eb', paddingBottom:'8px', marginBottom:'12px'}}>3. 关键质控点 (CTQ)</h3>
                        <ul style={{fontSize:'0.875rem', lineHeight:'1.6', color:'#dc2626', listStyleType:'disc', paddingLeft:'20px'}}>
                            <li>必须确认抛光垫表面无异物。</li>
                            <li>研磨液流量需稳定在 200ml/min。</li>
                        </ul>
                    </div>
                </div>
                <div className="mes-modal-footer">
                    <button onClick={onClose} className="mes-btn mes-btn-secondary">关闭</button>
                </div>
            </div>
        </div>
    );
};

// --- 新增全屏视图组件 1: 操作工报工看板 ---
const OperatorReportingBoard = ({ order, step, onBack, onSubmit }) => {
    const [goodQty, setGoodQty] = useState(0);
    const [badQty, setBadQty] = useState(0);
    const [machineHours, setMachineHours] = useState(4.5);

    return (
        <div className="mes-full-page">
            {/* 顶栏 */}
            <div className="mes-page-header">
                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    <button onClick={onBack} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}><ChevronLeft size={24} /></button>
                    <div>
                        <h2 style={{fontSize:'1.25rem', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px', margin:0}}><Package /> 生产报工工作台</h2>
                        <div style={{fontSize:'0.75rem', opacity:0.8}}>{order.id} | {order.productName}</div>
                    </div>
                </div>
                <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:'bold', fontSize:'1.125rem'}}>{step.name}</div>
                    <div style={{fontSize:'0.75rem', backgroundColor:'rgba(0,0,0,0.2)', padding:'2px 8px', borderRadius:'4px', display:'inline-block'}}>OP: 张工</div>
                </div>
            </div>

            <div className="mes-page-content" style={{display:'grid', gridTemplateColumns:'8fr 4fr', gap:'24px'}}>
                {/* 左侧：产量录入 */}
                <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
                    <div className="mes-card top-aligned">
                        <h3 style={{fontWeight:'bold', color:'#374151', marginBottom:'24px', display:'flex', alignItems:'center', gap:'8px', borderBottom:'1px solid #f3f4f6', paddingBottom:'8px'}}>
                            <Scale style={{color:'#3b82f6'}}/> 本次产出录入 (Output Entry)
                        </h3>

                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'32px'}}>
                            <div style={{backgroundColor:'#f0fdf4', borderRadius:'12px', padding:'24px', border:'1px solid #dcfce7', display:'flex', flexDirection:'column', alignItems:'center'}}>
                                <span style={{color:'#166534', fontWeight:'bold', fontSize:'1.125rem', marginBottom:'16px'}}>合格品数量 (OK)</span>
                                <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                                    <button onClick={() => setGoodQty(Math.max(0, goodQty - 1))} className="mes-btn" style={{width:'48px', height:'48px', borderRadius:'50%', fontSize:'1.5rem', border:'1px solid #bbf7d0', color:'#16a34a', background:'white'}}>-</button>
                                    <input
                                        type="number"
                                        value={goodQty}
                                        onChange={(e) => setGoodQty(Number(e.target.value))}
                                        style={{width:'100px', textAlign:'center', fontSize:'3rem', fontWeight:'bold', background:'transparent', border:'none', borderBottom:'2px solid #86efac', outline:'none', color:'#1f2937'}}
                                    />
                                    <button onClick={() => setGoodQty(goodQty + 1)} className="mes-btn" style={{width:'48px', height:'48px', borderRadius:'50%', fontSize:'1.5rem', border:'1px solid #bbf7d0', color:'#16a34a', background:'white'}}>+</button>
                                </div>
                                <span style={{fontSize:'0.75rem', color:'#16a34a', marginTop:'8px'}}>单位: PCS</span>
                            </div>

                            <div style={{backgroundColor:'#fef2f2', borderRadius:'12px', padding:'24px', border:'1px solid #fee2e2', display:'flex', flexDirection:'column', alignItems:'center'}}>
                                <span style={{color:'#991b1b', fontWeight:'bold', fontSize:'1.125rem', marginBottom:'16px'}}>不良品数量 (NG)</span>
                                <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                                    <button onClick={() => setBadQty(Math.max(0, badQty - 1))} className="mes-btn" style={{width:'48px', height:'48px', borderRadius:'50%', fontSize:'1.5rem', border:'1px solid #fecaca', color:'#dc2626', background:'white'}}>-</button>
                                    <input
                                        type="number"
                                        value={badQty}
                                        onChange={(e) => setBadQty(Number(e.target.value))}
                                        style={{width:'100px', textAlign:'center', fontSize:'3rem', fontWeight:'bold', background:'transparent', border:'none', borderBottom:'2px solid #fca5a5', outline:'none', color:'#1f2937'}}
                                    />
                                    <button onClick={() => setBadQty(badQty + 1)} className="mes-btn" style={{width:'48px', height:'48px', borderRadius:'50%', fontSize:'1.5rem', border:'1px solid #fecaca', color:'#dc2626', background:'white'}}>+</button>
                                </div>
                                <span style={{fontSize:'0.75rem', color:'#dc2626', marginTop:'8px'}}>需关联不良代码</span>
                            </div>
                        </div>

                        {badQty > 0 && (
                            <div style={{marginTop:'24px', animation:'zoomIn 0.3s'}}>
                                <label className="mes-input-label" style={{marginBottom:'8px'}}>不良原因选择 (Defect Code)</label>
                                <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                                    {['外观划痕', '尺寸超差', '崩边', '杂质污染'].map(reason => (
                                        <button key={reason} className="mes-btn" style={{backgroundColor:'#f3f4f6', borderRadius:'9999px', fontSize:'0.875rem'}}>
                                            {reason}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mes-card top-aligned">
                        <h3 style={{fontWeight:'bold', color:'#374151', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px', borderBottom:'1px solid #f3f4f6', paddingBottom:'8px'}}>
                            <Box style={{color:'#f97316'}}/> 关键物料投料消耗 (Material Consumption)
                        </h3>
                        <table className="mes-table">
                            <thead>
                            <tr>
                                <th>物料名称</th>
                                <th>批次号 (Batch)</th>
                                <th>消耗数量</th>
                                <th>操作</th>
                            </tr>
                            </thead>
                            <tbody>
                            {order.materials.map((mat, i) => (
                                <tr key={i}>
                                    <td style={{fontWeight:'500'}}>{mat.name}</td>
                                    <td style={{fontFamily:'monospace', color:'#6b7280'}}>
                                        <input type="text" defaultValue={mat.batch || ''} placeholder="扫码录入批次" style={{width:'140px', border:'1px solid #e5e7eb', borderRadius:'4px', padding:'4px', fontSize:'0.875rem'}} />
                                    </td>
                                    <td>
                                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                            <input type="text" style={{width:'80px', border:'1px solid #d1d5db', borderRadius:'4px', padding:'4px', textAlign:'center'}} defaultValue="10" />
                                            <span style={{color:'#6b7280'}}>kg</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button style={{color:'#2563eb', background:'none', border:'none', cursor:'pointer'}}><Camera size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 右侧：工时与提交 */}
                <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
                    {/* 修改：添加 top-aligned 类，使内容靠上对齐 */}
                    <div className="mes-card top-aligned" style={{flex:1}}>
                        <h3 style={{fontWeight:'bold', color:'#374151', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px'}}>
                            <Clock style={{color:'#a855f7'}}/> 工时确认
                        </h3>
                        <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
                            <div className="mes-hours-grid">
                                <div>
                                    <label style={{fontSize:'0.875rem', color:'#6b7280', display:'block', marginBottom:'4px'}}>机器工时 (MH)</label>
                                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                        <input type="number" value={machineHours} style={{border:'1px solid #d1d5db', borderRadius:'6px', padding:'8px', width:'100%', fontWeight:'bold', backgroundColor:'#f3f4f6'}} readOnly />
                                        <span style={{color:'#6b7280', fontSize:'0.875rem'}}>H</span>
                                    </div>
                                </div>
                                <div>
                                    <label style={{fontSize:'0.875rem', color:'#6b7280', display:'block', marginBottom:'4px'}}>人工工时 (LH)</label>
                                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                        <input type="number" defaultValue={4.5} style={{border:'1px solid #d1d5db', borderRadius:'6px', padding:'8px', width:'100%', fontWeight:'bold'}} />
                                        <span style={{color:'#6b7280', fontSize:'0.875rem'}}>H</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{backgroundColor:'#fefce8', padding:'12px', borderRadius:'6px', fontSize:'0.75rem', color:'#854d0e', border:'1px solid #fef08a'}}>
                                <strong>提示：</strong> 当前标准CT为 45min。如机器工时与标准差异过大，请在备注中说明停机原因。
                            </div>
                            <div>
                                <label className="mes-input-label">备注 (Remarks)</label>
                                <textarea className="mes-textarea" style={{minHeight:'80px'}} placeholder="填写异常停机或换模说明..."></textarea>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onSubmit}
                        className="mes-btn"
                        style={{width:'100%', padding:'16px', background:'linear-gradient(to right, #2563eb, #1d4ed8)', color:'white', borderRadius:'12px', fontSize:'1.25rem', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}
                    >
                        <Save size={24} /> 确认报工
                    </button>

                    <button
                        onClick={onBack}
                        className="mes-btn"
                        style={{width:'100%', padding:'12px', backgroundColor:'white', border:'1px solid #d1d5db', color:'#4b5563', borderRadius:'12px', fontWeight:'bold'}}
                    >
                        取消 / 返回
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 新增全屏视图组件 2: 质检员工作台 ---
const QualityInspectionBoard = ({ order, step, onBack, onSubmit }) => {
    return (
        <div className="mes-full-page">
            {/* 顶栏 */}
            <div className="mes-page-header purple">
                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    <button onClick={onBack} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}><ChevronLeft size={24} /></button>
                    <div>
                        <h2 style={{fontSize:'1.25rem', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px', margin:0}}><ClipboardList /> QMES 质检执行工作台</h2>
                        <div style={{fontSize:'0.75rem', opacity:0.8}}>{order.id} | {order.productName}</div>
                    </div>
                </div>
                <div style={{display:'flex', gap:'16px', alignItems:'center'}}>
                    <div style={{textAlign:'right'}}>
                        <div style={{fontWeight:'bold', fontSize:'1.125rem'}}>{step.name} (IPQC)</div>
                        <div style={{fontSize:'0.75rem', opacity:0.8}}>检验员: QC-009</div>
                    </div>
                    <button style={{backgroundColor:'rgba(255,255,255,0.1)', border:'none', color:'white', padding:'8px 12px', borderRadius:'6px', fontSize:'0.875rem', cursor:'pointer'}}>查看 SIP 标准书</button>
                </div>
            </div>

            <div style={{flex:1, overflow:'hidden', display:'grid', gridTemplateColumns:'4fr 8fr'}}>
                {/* 左侧：检验标准/图示 */}
                <div style={{backgroundColor:'white', borderRight:'1px solid #e5e7eb', padding:'24px', overflowY:'auto'}}>
                    <h3 style={{fontWeight:'bold', color:'#1f2937', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px'}}>
                        <Menu size={18} /> 检验规范 (Inspection Std)
                    </h3>

                    <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
                        <div style={{backgroundColor:'#f9fafb', padding:'16px', borderRadius:'8px', border:'1px solid #f3f4f6'}}>
                            <h4 style={{fontWeight:'bold', fontSize:'0.875rem', color:'#374151', marginBottom:'8px'}}>1. 表面缺陷检测</h4>
                            <div style={{aspectRatio:'16/9', backgroundColor:'#e5e7eb', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', marginBottom:'8px'}}>
                                [产品外观标准示意图]
                            </div>
                            <p style={{fontSize:'0.75rem', color:'#4b5563', lineHeight:'1.5', margin:0}}>
                                - 观察距离: 30cm <br/>
                                - 光照强度: &gt;1000 Lux <br/>
                                - 重点检查区域: 中心有效区 Ø200mm
                            </p>
                        </div>

                        <div style={{backgroundColor:'#f9fafb', padding:'16px', borderRadius:'8px', border:'1px solid #f3f4f6'}}>
                            <h4 style={{fontWeight:'bold', fontSize:'0.875rem', color:'#374151', marginBottom:'8px'}}>2. 尺寸测量点位</h4>
                            <div style={{aspectRatio:'1/1', backgroundColor:'#e5e7eb', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', marginBottom:'8px'}}>
                                [多点测厚位置图]
                            </div>
                            <p style={{fontSize:'0.75rem', color:'#4b5563', lineHeight:'1.5', margin:0}}>
                                - 使用工具: 数显千分尺 <br/>
                                - 测量点数: 5点 (中心+四周)
                            </p>
                        </div>
                    </div>
                </div>

                {/* 右侧：检验录入单 */}
                <div style={{backgroundColor:'#f9fafb', padding:'32px', overflowY:'auto'}}>
                    <div style={{maxWidth:'896px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'24px'}}>

                        <div style={{backgroundColor:'white', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden'}}>
                            <div style={{backgroundColor:'#f9fafb', padding:'12px 24px', borderBottom:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <span style={{fontWeight:'bold', color:'#374151'}}>检验项目录入</span>
                                <span style={{fontSize:'0.75rem', backgroundColor:'#fef9c3', color:'#854d0e', padding:'4px 8px', borderRadius:'4px', border:'1px solid #fef08a'}}>抽样数量: 5 PCS</span>
                            </div>

                            <table className="mes-table">
                                <thead>
                                <tr>
                                    <th style={{width:'25%'}}>检验项目</th>
                                    <th style={{width:'25%'}}>规格/标准</th>
                                    <th style={{width:'33%'}}>实测记录</th>
                                    <th style={{textAlign:'center'}}>判定</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td style={{fontWeight:'500'}}>表面划痕</td>
                                    <td style={{color:'#6b7280'}}>无明显划痕, 凹坑&lt;0.1mm</td>
                                    <td>
                                        <div style={{display:'flex', gap:'8px'}}>
                                            <button style={{flex:1, padding:'6px', border:'1px solid #bbf7d0', backgroundColor:'#f0fdf4', color:'#15803d', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'bold', cursor:'pointer'}}>OK</button>
                                            <button style={{flex:1, padding:'6px', border:'1px solid #e5e7eb', backgroundColor:'white', color:'#6b7280', borderRadius:'4px', fontSize:'0.75rem', cursor:'pointer'}}>NG</button>
                                        </div>
                                    </td>
                                    <td style={{textAlign:'center'}}><CheckCircle size={18} style={{color:'#22c55e', margin:'0 auto'}}/></td>
                                </tr>
                                <tr>
                                    <td style={{fontWeight:'500'}}>总厚度 (Thickness)</td>
                                    <td style={{color:'#6b7280'}}>1.270 ± 0.020 mm</td>
                                    <td>
                                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                            <input type="number" placeholder="Value 1" style={{width:'80px', border:'1px solid #d1d5db', borderRadius:'6px', padding:'6px', outline:'none'}} />
                                            <input type="number" placeholder="Value 2" style={{width:'80px', border:'1px solid #d1d5db', borderRadius:'6px', padding:'6px', outline:'none'}} />
                                            <input type="number" placeholder="Value 3" style={{width:'80px', border:'1px solid #d1d5db', borderRadius:'6px', padding:'6px', outline:'none'}} />
                                        </div>
                                    </td>
                                    <td style={{textAlign:'center'}}><span style={{color:'#d1d5db'}}>-</span></td>
                                </tr>
                                <tr>
                                    <td style={{fontWeight:'500'}}>硬度 (Hardness)</td>
                                    <td style={{color:'#6b7280'}}>55 ± 5 Shore D</td>
                                    <td>
                                        <input type="number" placeholder="实测值" style={{width:'100%', border:'1px solid #d1d5db', borderRadius:'6px', padding:'6px', outline:'none'}} />
                                    </td>
                                    <td style={{textAlign:'center'}}><span style={{color:'#d1d5db'}}>-</span></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mes-card">
                            <h4 style={{fontWeight:'bold', color:'#374151', marginBottom:'16px'}}>异常及附件</h4>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px'}}>
                                <div>
                                    <label className="mes-input-label">上传图片/附件</label>
                                    <div style={{border:'2px dashed #d1d5db', borderRadius:'8px', padding:'24px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#9ca3af', cursor:'pointer'}}>
                                        <Camera size={24} style={{marginBottom:'8px'}}/>
                                        <span style={{fontSize:'0.75rem'}}>点击拍摄或上传照片</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="mes-input-label">质检备注</label>
                                    <textarea className="mes-textarea" style={{height:'96px', resize:'none'}} placeholder="输入任何额外的检验发现..."></textarea>
                                </div>
                            </div>
                        </div>

                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'16px'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                <input type="checkbox" id="pass" style={{width:'20px', height:'20px'}} />
                                <label htmlFor="pass" style={{fontSize:'0.875rem', fontWeight:'bold', color:'#374151', userSelect:'none'}}>我确认以上检验数据真实有效</label>
                            </div>
                            <div style={{display:'flex', gap:'16px'}}>
                                <button onClick={onBack} className="mes-btn" style={{padding:'12px 24px', backgroundColor:'white', border:'1px solid #d1d5db', color:'#4b5563'}}>暂存</button>
                                <button onClick={onSubmit} className="mes-btn" style={{padding:'12px 32px', backgroundColor:'#7e22ce', color:'white', display:'flex', alignItems:'center', gap:'8px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}>
                                    <CheckSquare size={18} /> 提交判定
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 主应用组件 ---
export default function MESExecutionDashboard() {
    // 视图状态控制: 'DASHBOARD' | 'OPERATOR_REPORT' | 'QC_INSPECTOR'
    const [currentView, setCurrentView] = useState('DASHBOARD');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const [selectedOrderId, setSelectedOrderId] = useState("WO-20240520-001");
    const [orders, setOrders] = useState(MOCK_DATA.workOrders);

    // Modal States
    const [activeModal, setActiveModal] = useState(null);

    const currentOrder = useMemo(() =>
            orders.find(o => o.id === selectedOrderId) || orders[0]
        , [selectedOrderId, orders]);

    const currentStep = currentOrder.routing[currentOrder.currentStepIndex] || {};

    // Clock Effect
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Actions
    const handleStatusChange = (newStatus) => {
        const updatedOrders = orders.map(o => {
            if (o.id === selectedOrderId) {
                return { ...o, status: newStatus };
            }
            return o;
        });
        setOrders(updatedOrders);
    };

    const handleNextStep = () => {
        const updatedOrders = orders.map(o => {
            if (o.id === selectedOrderId && o.currentStepIndex < o.routing.length - 1) {
                return {
                    ...o,
                    currentStepIndex: o.currentStepIndex + 1,
                    routing: o.routing.map((step, idx) =>
                        idx === o.currentStepIndex ? { ...step, status: 'COMPLETED' } :
                            idx === o.currentStepIndex + 1 ? { ...step, status: 'IN_PROGRESS' } : step
                    )
                };
            }
            return o;
        });
        setOrders(updatedOrders);
    };

    const getStatusClass = (status) => {
        switch(status) {
            case '生产中': return 'mes-status-running';
            case 'PAUSED': return 'mes-status-paused';
            default: return 'mes-status-pending';
        }
    };

    // 默认 Dashboard 视图
    return (
        <div className="mes-dashboard-container">

            {/* 1. 左侧侧边栏 (始终显示) */}
            <aside className={`mes-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="mes-sidebar-toggle" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                    {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </div>

                <div className="mes-sidebar-header">
                    <div className="mes-title-row">
                        <div className="mes-icon-box"><Activity size={20} color="white" /></div>
                        <h1 className="mes-title-text">工单执行面板</h1>
                    </div>
                    <div className="mes-user-info">
                        {MOCK_DATA.currentUser.shift} | {MOCK_DATA.currentUser.station}
                    </div>
                </div>

                <div className="mes-search-box">
                    <div className="mes-search-input-wrapper">
                        <Search className="mes-search-icon" />
                        <input type="text" placeholder="扫描工单号 / 批次号" className="mes-search-input" />
                    </div>
                </div>

                <div className="mes-order-list">
                    {orders.map(order => (
                        <div
                            key={order.id}
                            onClick={() => setSelectedOrderId(order.id)}
                            className={`mes-order-card ${selectedOrderId === order.id ? 'active' : ''}`}
                        >
                            <div className="mes-order-header">
                                <span className="mes-order-id">{order.id}</span>
                                <span className={`mes-status-badge ${getStatusClass(order.status)}`}>
                  {order.status === 'RUNNING' ? '生产中' : order.status === 'PAUSED' ? '暂停' : '待产'}
                </span>
                            </div>
                            <h3 className="mes-order-title">{order.productName}</h3>
                            <div className="mes-order-details" style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'#64748b'}}>
                                <span>进度: {Math.round((order.completedQty / order.planQty) * 100)}%</span>
                                <span>当前: {order.routing[order.currentStepIndex]?.name || '完成'}</span>
                            </div>
                            <div className="mes-progress-bar-bg">
                                <div
                                    className="mes-progress-bar-fill"
                                    style={{ width: `${(order.completedQty / order.planQty) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* 2. 主内容区域 (动态切换) */}
            <main className="mes-main">

                {currentView === 'DASHBOARD' && (
                    <>
                        {/* Header */}
                        <header className="mes-header">
                            <div className="mes-header-left">
                                <div className={`mes-status-indicator ${orders.some(o => o.status === 'RUNNING') ? 'running' : ''}`}></div>
                                <span className="mes-product-title">
                   {currentOrder.productName}
                                    <span className="mes-product-code">
                     {currentOrder.productCode}
                   </span>
                 </span>
                            </div>
                            <div className="mes-header-right">
                                <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.875rem', color:'#4b5563'}}>
                                    <Thermometer size={18} />
                                    <span>车间温度: 22.5°C</span>
                                </div>
                                <div className="mes-header-time">
                                    <div className="mes-time-text">{currentTime.toLocaleTimeString()}</div>
                                    <div className="mes-date-text">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                </div>
                            </div>
                        </header>

                        {/* Dashboard Content */}
                        <div className="mes-content-scroll">

                            {/* Top Cards */}
                            <div className="mes-kpi-grid">
                                <div className="mes-card">
                                    <span className="mes-card-label">生产进度 (Qty)</span>
                                    <div className="mes-kpi-value-row">
                                        <span className="mes-kpi-big">{currentOrder.completedQty}</span>
                                        <span className="mes-kpi-sub">/ {currentOrder.planQty}</span>
                                    </div>
                                    <div className="mes-progress-bar-bg">
                                        <div className="mes-progress-bar-fill" style={{width: `${(currentOrder.completedQty/currentOrder.planQty)*100}%`}}></div>
                                    </div>
                                </div>

                                <div className="mes-card">
                                    <span className="mes-card-label">当前工序状态</span>
                                    <div style={{marginTop:'8px', display:'flex', alignItems:'center', gap:'12px'}}>
                                        <div className={`mes-status-tag ${getStatusClass(currentOrder.status)}`}>
                                            {currentOrder.status === 'RUNNING' && <Activity className="animate-spin-slow" size={20} />}
                                            {currentOrder.status}
                                        </div>
                                    </div>
                                    <div style={{fontSize:'0.75rem', color:'#64748b', marginTop:'8px'}}>标准CT: 45min / 实际: 32min</div>
                                </div>

                                <div className="mes-card">
                                    <span className="mes-card-label">物料状态</span>
                                    <div style={{marginTop:'8px', display:'flex', flexDirection:'column', gap:'8px'}}>
                                        {currentOrder.materials.map((m, i) => (
                                            <div key={i} style={{display:'flex', justifyContent:'space-between', fontSize:'0.875rem'}}>
                                                <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', width:'96px'}} title={m.name}>{m.name}</span>
                                                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                                    <span style={{fontWeight:'bold', color:'#1f2937'}}>{m.consumed}</span>
                                                    <span style={{fontSize:'0.75rem', color:'#9ca3af'}}>/ {m.required}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setActiveModal('MATERIAL')}
                                        style={{marginTop:'8px', width:'100%', padding:'6px', fontSize:'0.75rem', fontWeight:'bold', color:'#2563eb', backgroundColor:'#eff6ff', border:'none', borderRadius:'4px', cursor:'pointer'}}
                                    >
                                        补料 / 呼叫送料
                                    </button>
                                </div>

                                <div className="mes-card">
                                    <span className="mes-card-label">良率监控 (YIELD)</span>
                                    <div className="mes-kpi-value-row">
                                        <span className="mes-kpi-big" style={{color:'#16a34a'}}>98.5%</span>
                                        <BarChart3 className="text-green-200" size={40} color="#bbf7d0" />
                                    </div>
                                    <div style={{fontSize:'0.75rem', color:'#64748b', marginTop:'8px', display:'flex', gap:'8px'}}>
                                        <span style={{color:'#ef4444', fontWeight:'500'}}>不良: 1 pcs</span>
                                        <span style={{color:'#cbd5e1'}}>|</span>
                                        <span>报废: 0</span>
                                    </div>
                                </div>
                            </div>

                            {/* Process Route Stepper */}
                            <div className="mes-card" style={{marginBottom:'10px', padding:'10px'}}>
                                <h3 style={{fontWeight:'bold', color:'#1f2937', marginBottom:'10px', display:'flex', alignItems:'center', gap:'8px'}}>
                                    <History size={20} color="#64748b" />
                                    工艺路线执行监控
                                </h3>
                                <div className="mes-stepper-container">
                                    <div className="mes-stepper-line"></div>

                                    {currentOrder.routing.map((step, index) => {
                                        const isCurrent = index === currentOrder.currentStepIndex;
                                        const isCompleted = index < currentOrder.currentStepIndex;
                                        const isQC = step.type === 'QC';

                                        return (
                                            <div key={step.id} className="mes-step-item">
                                                <div className={`mes-step-circle ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''} ${currentOrder.status === 'RUNNING' && isCurrent ? 'running' : ''}`}>
                                                    {isCompleted ? <CheckCircle size={24} /> : index + 1}
                                                </div>

                                                <div className={`mes-step-label ${isCurrent ? 'active' : ''}`}>
                                                    <div>{step.name}</div>
                                                    {isQC && <span className="mes-qc-badge">QMES质检</span>}
                                                    {step.operator && <div style={{fontSize:'0.65rem', color:'#9ca3af', marginTop:'4px'}}>Op: {step.operator}</div>}
                                                </div>

                                                {isCurrent && <div className="mes-current-tag">当前作业</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Core Operations Panel */}
                            <div className="mes-ops-grid">

                                {/* Left: Standard Operations */}
                                <div className="mes-card">
                                    <h3 style={{fontWeight:'bold', color:'#374151', marginBottom:'16px'}}>作业控制</h3>
                                    <div className="mes-btn-grid">

                                        {currentOrder.status !== 'RUNNING' ? (
                                            <button
                                                onClick={() => handleStatusChange('RUNNING')}
                                                className="mes-big-btn btn-start"
                                            >
                                                <Play size={40} fill="currentColor" />
                                                <span className="mes-btn-title">开工 (Start)</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleStatusChange('PAUSED')}
                                                className="mes-big-btn btn-pause"
                                            >
                                                <Pause size={40} fill="currentColor" />
                                                <span className="mes-btn-title">暂停 (Pause)</span>
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setCurrentView('OPERATOR_REPORT')}
                                            disabled={currentOrder.status !== 'RUNNING'}
                                            className="mes-big-btn btn-report"
                                        >
                                            <Package size={32} />
                                            <span className="mes-btn-title">过程报工</span>
                                            <span className="mes-btn-sub">Report Qty</span>
                                        </button>

                                        <button
                                            onClick={() => setCurrentView('QC_INSPECTOR')}
                                            disabled={currentOrder.status !== 'RUNNING' && !currentStep.qcRequired}
                                            className={`mes-big-btn btn-qc ${currentStep.qcRequired ? 'required' : ''}`}
                                        >
                                            {currentStep.qcRequired && (
                                                <span style={{position:'absolute', top:'8px', right:'8px', display:'flex', height:'12px', width:'12px'}}>
                          <span style={{animation:'pulse 1s cubic-bezier(0, 0, 0.2, 1) infinite', position:'absolute', display:'inline-flex', height:'100%', width:'100%', borderRadius:'50%', backgroundColor:'#c084fc', opacity:0.75}}></span>
                          <span style={{position:'relative', display:'inline-flex', borderRadius:'50%', height:'12px', width:'12px', backgroundColor:'#a855f7'}}></span>
                        </span>
                                            )}
                                            <ClipboardList size={32} />
                                            <span className="mes-btn-title">QMES 质检</span>
                                            <span className="mes-btn-sub">Record QC</span>
                                        </button>

                                        <button
                                            onClick={handleNextStep}
                                            disabled={currentOrder.status !== 'RUNNING'}
                                            className="mes-big-btn btn-finish"
                                        >
                                            <ArrowRight size={32} />
                                            <span className="mes-btn-title">工序完工</span>
                                            <span className="mes-btn-sub">Next Step</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Right: Andon & Exception */}
                                <div className="mes-card">
                                    <h3 style={{fontWeight:'bold', color:'#374151', marginBottom:'16px'}}>操作面板</h3>
                                    <div className="mes-btn-grid-2">
                                        <button
                                            onClick={() => setActiveModal('ABNORMAL')}
                                            className="mes-big-btn btn-andon"
                                        >
                                            <AlertTriangle size={28} />
                                            <span className="mes-btn-title">异常呼叫</span>
                                            <span className="mes-btn-sub">品质/设备异常</span>
                                        </button>

                                        <button
                                            onClick={() => setActiveModal('REPAIR')}
                                            className="mes-big-btn btn-repair"
                                        >
                                            <Wrench size={28} />
                                            <span className="mes-btn-title">设备报修</span>
                                            <span className="mes-btn-sub">Machine Down</span>
                                        </button>

                                        <button
                                            onClick={() => setActiveModal('MATERIAL')}
                                            className="mes-big-btn btn-agv"
                                        >
                                            <Truck size={28} />
                                            <span className="mes-btn-title">呼叫送料</span>
                                            <span className="mes-btn-sub">请求送料</span>
                                        </button>

                                        <button
                                            onClick={() => setActiveModal('SOP')}
                                            className="mes-big-btn btn-sop"
                                        >
                                            <Menu size={28} />
                                            <span className="mes-btn-title">作业指导书</span>
                                            <span className="mes-btn-sub">SOP/SIP</span>
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Footer Status Bar */}
                        <footer className="mes-footer">
                            <div style={{display:'flex', gap:'16px'}}>
                                <span>系统状态: 在线 (12ms)</span>
                                <span>MES版本: v3.2.1-semi</span>
                            </div>
                            <div>
                                {/* 版权信息已移除 */}
                            </div>
                        </footer>
                    </>
                )}

                {currentView === 'OPERATOR_REPORT' && (
                    <OperatorReportingBoard
                        order={currentOrder}
                        step={currentStep}
                        onBack={() => setCurrentView('DASHBOARD')}
                        onSubmit={() => {
                            alert("报工成功！产量已更新。");
                            setCurrentView('DASHBOARD');
                        }}
                    />
                )}

                {currentView === 'QC_INSPECTOR' && (
                    <QualityInspectionBoard
                        order={currentOrder}
                        step={currentStep}
                        onBack={() => setCurrentView('DASHBOARD')}
                        onSubmit={() => {
                            alert("质检结果已提交，判定为：合格");
                            setCurrentView('DASHBOARD');
                        }}
                    />
                )}

                {/* --- Modals 挂载点 --- */}
                <AbnormalEventDetail
                    isOpen={activeModal === 'ABNORMAL'}
                    onClose={() => setActiveModal(null)}
                    onSubmit={() => setActiveModal(null)}
                    orderId={selectedOrderId}
                    stepName={currentStep.name}
                />

                <DeviceRepairModal
                    isOpen={activeModal === 'REPAIR'}
                    onClose={() => setActiveModal(null)}
                    onSubmit={() => setActiveModal(null)}
                    station={MOCK_DATA.currentUser.station}
                />

                <SOPModal
                    isOpen={activeModal === 'SOP'}
                    onClose={() => setActiveModal(null)}
                    stepName={currentStep.name}
                />

                {/* 简单的物料呼叫模拟 Modal */}
                {activeModal === 'MATERIAL' && (
                    <div className="mes-modal-overlay">
                        <div className="mes-modal-content" style={{maxWidth:'400px'}}>
                            <div className="mes-modal-body">
                                <h3 style={{fontWeight:'bold', fontSize:'1.125rem', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px'}}><Box /> 呼叫物料配送</h3>
                                <p style={{fontSize:'0.875rem', color:'#4b5563', marginBottom:'16px'}}>请选择需要配送到机台的物料：</p>
                                <div style={{display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px'}}>
                                    <label style={{display:'flex', alignItems:'center', gap:'8px', padding:'8px', border:'1px solid #e5e7eb', borderRadius:'4px', cursor:'pointer'}}>
                                        <input type="checkbox" defaultChecked />
                                        <span style={{fontSize:'0.875rem'}}>聚氨酯预聚体 (20kg桶装)</span>
                                    </label>
                                    <label style={{display:'flex', alignItems:'center', gap:'8px', padding:'8px', border:'1px solid #e5e7eb', borderRadius:'4px', cursor:'pointer'}}>
                                        <input type="checkbox" />
                                        <span style={{fontSize:'0.875rem'}}>去离子水 (DI Water)</span>
                                    </label>
                                </div>
                                <div style={{display:'flex', justifyContent:'flex-end', gap:'8px'}}>
                                    <button onClick={() => setActiveModal(null)} className="mes-btn mes-btn-secondary">取消</button>
                                    <button onClick={() => { alert("AGV调度指令已下发"); setActiveModal(null); }} className="mes-btn mes-btn-primary">确认呼叫</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}