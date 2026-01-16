import React, { useState, useEffect, useMemo } from 'react';
import {
    Play, Pause, Square, ClipboardList, Box, Wrench, AlertTriangle,
    CheckCircle, History, ArrowRight, BarChart3, AlertOctagon,
    Package, Truck, Thermometer, Activity, XCircle, Search, Menu,
    ChevronLeft, Save, Upload, Camera, Scale, Clock, CheckSquare
} from 'lucide-react';

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
            status: "RUNNING", // PENDING, RUNNING, PAUSED, COMPLETED
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-red-600 px-6 py-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2 font-bold text-lg">
                        <AlertTriangle className="h-6 w-6" />
                        <span>异常事件报告 (Andon)</span>
                    </div>
                    <button onClick={onClose} className="hover:bg-red-700 p-1 rounded"><XCircle /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-red-50 p-3 rounded border border-red-100 text-sm text-red-800">
                        <strong>关联工单:</strong> {orderId} <br/>
                        <strong>发生工序:</strong> {stepName}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">异常类型</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['设备故障', '物料异常', '工艺品质', '安全隐患', '缺料等待', '其他'].map(type => (
                                <button key={type} className="border rounded py-2 text-sm hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500">
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
                        <textarea className="w-full border rounded-md p-2 h-24 focus:ring-red-500 focus:border-red-500" placeholder="请详细描述异常现象、发生时间及初步影响..."></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
                        <button onClick={() => { alert("异常已上报，并推送到班组长看板"); onSubmit(); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md">
                            立即上报并呼叫
                        </button>
                    </div>
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
        <div className="flex flex-col h-screen bg-gray-50 animate-in slide-in-from-right duration-300">
            {/* 顶栏 */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-blue-700 rounded-lg transition-colors"><ChevronLeft size={24} /></button>
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2"><Package /> 生产报工工作台</h2>
                        <div className="text-xs text-blue-100 opacity-80">{order.id} | {order.productName}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-lg">{step.name}</div>
                    <div className="text-xs bg-blue-700 px-2 py-0.5 rounded">OP: 张工</div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-12 gap-6">
                {/* 左侧：产量录入 (占据主要视觉) */}
                <div className="col-span-8 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 border-b pb-2">
                            <Scale className="text-blue-500"/> 本次产出录入 (Output Entry)
                        </h3>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="bg-green-50 rounded-xl p-6 border border-green-100 flex flex-col items-center">
                                <span className="text-green-800 font-bold text-lg mb-4">合格品数量 (OK)</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setGoodQty(Math.max(0, goodQty - 1))} className="w-12 h-12 bg-white rounded-full shadow border border-green-200 text-2xl font-bold text-green-600 hover:bg-green-100">-</button>
                                    <input
                                        type="number"
                                        value={goodQty}
                                        onChange={(e) => setGoodQty(Number(e.target.value))}
                                        className="w-40 text-center text-5xl font-bold bg-transparent border-b-2 border-green-300 focus:outline-none focus:border-green-600 text-slate-800"
                                    />
                                    <button onClick={() => setGoodQty(goodQty + 1)} className="w-12 h-12 bg-white rounded-full shadow border border-green-200 text-2xl font-bold text-green-600 hover:bg-green-100">+</button>
                                </div>
                                <span className="text-xs text-green-600 mt-2">单位: PCS</span>
                            </div>

                            <div className="bg-red-50 rounded-xl p-6 border border-red-100 flex flex-col items-center">
                                <span className="text-red-800 font-bold text-lg mb-4">不良品数量 (NG)</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setBadQty(Math.max(0, badQty - 1))} className="w-12 h-12 bg-white rounded-full shadow border border-red-200 text-2xl font-bold text-red-600 hover:bg-red-100">-</button>
                                    <input
                                        type="number"
                                        value={badQty}
                                        onChange={(e) => setBadQty(Number(e.target.value))}
                                        className="w-40 text-center text-5xl font-bold bg-transparent border-b-2 border-red-300 focus:outline-none focus:border-red-600 text-slate-800"
                                    />
                                    <button onClick={() => setBadQty(badQty + 1)} className="w-12 h-12 bg-white rounded-full shadow border border-red-200 text-2xl font-bold text-red-600 hover:bg-red-100">+</button>
                                </div>
                                <span className="text-xs text-red-600 mt-2">需关联不良代码</span>
                            </div>
                        </div>

                        {badQty > 0 && (
                            <div className="mt-6 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">不良原因选择 (Defect Code)</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['外观划痕', '尺寸超差', '崩边', '杂质污染'].map(reason => (
                                        <button key={reason} className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-red-100 hover:text-red-700 border border-transparent hover:border-red-200 transition-colors">
                                            {reason}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                            <Box className="text-orange-500"/> 关键物料投料消耗 (Material Consumption)
                        </h3>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="p-3">物料名称</th>
                                <th className="p-3">批次号 (Batch)</th>
                                <th className="p-3">消耗数量</th>
                                <th className="p-3">操作</th>
                            </tr>
                            </thead>
                            <tbody>
                            {order.materials.map((mat, i) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="p-3 font-medium">{mat.name}</td>
                                    <td className="p-3 font-mono text-gray-500">{mat.batch || '扫码录入'}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <input type="text" className="w-20 border rounded p-1 text-center" defaultValue="10" />
                                            <span className="text-gray-500">kg</span>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <button className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Camera size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 右侧：工时与提交 */}
                <div className="col-span-4 flex flex-col gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <Clock className="text-purple-500"/> 工时确认
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500 block mb-1">机器工时 (Machine Hours)</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" value={machineHours} className="border rounded p-2 w-full font-bold" readOnly />
                                    <span className="text-gray-500">H</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 block mb-1">人工工时 (Man Hours)</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" defaultValue={4.5} className="border rounded p-2 w-full font-bold" />
                                    <span className="text-gray-500">H</span>
                                </div>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200">
                                提示：当前班次标准工时为 8H，请确认是否存在停机时间。
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onSubmit}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg flex items-center justify-center gap-2 text-xl font-bold transform active:scale-95 transition-all"
                    >
                        <Save size={24} /> 确认报工
                    </button>

                    <button
                        onClick={onBack}
                        className="w-full py-3 bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 font-bold"
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
        <div className="flex flex-col h-screen bg-gray-100 animate-in slide-in-from-right duration-300">
            {/* 顶栏 */}
            <div className="bg-purple-700 text-white p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-purple-800 rounded-lg transition-colors"><ChevronLeft size={24} /></button>
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2"><ClipboardList /> QMES 质检执行工作台</h2>
                        <div className="text-xs text-purple-200 opacity-80">{order.id} | {order.productName}</div>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="text-right">
                        <div className="font-bold text-lg">{step.name} (IPQC)</div>
                        <div className="text-xs text-purple-200">检验员: QC-009</div>
                    </div>
                    <button className="bg-white/10 hover:bg-white/20 p-2 rounded text-sm">查看 SIP 标准书</button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-12">
                {/* 左侧：检验标准/图示 */}
                <div className="col-span-4 bg-white border-r border-gray-200 p-6 overflow-y-auto">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Menu size={18} /> 检验规范 (Inspection Std)
                    </h3>

                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h4 className="font-bold text-sm text-gray-700 mb-2">1. 表面缺陷检测</h4>
                            <div className="aspect-video bg-gray-200 rounded flex items-center justify-center text-gray-400 mb-2">
                                [产品外观标准示意图]
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                - 观察距离: 30cm <br/>
                                - 光照强度: &gt;1000 Lux <br/>
                                - 重点检查区域: 中心有效区 Ø200mm
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h4 className="font-bold text-sm text-gray-700 mb-2">2. 尺寸测量点位</h4>
                            <div className="aspect-square bg-gray-200 rounded flex items-center justify-center text-gray-400 mb-2">
                                [多点测厚位置图]
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                - 使用工具: 数显千分尺 <br/>
                                - 测量点数: 5点 (中心+四周)
                            </p>
                        </div>
                    </div>
                </div>

                {/* 右侧：检验录入单 */}
                <div className="col-span-8 bg-gray-50 p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-6">

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                                <span className="font-bold text-gray-700">检验项目录入</span>
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-200">抽样数量: 5 PCS</span>
                            </div>

                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left w-1/4">检验项目</th>
                                    <th className="px-6 py-3 text-left w-1/4">规格/标准</th>
                                    <th className="px-6 py-3 text-left w-1/3">实测记录</th>
                                    <th className="px-6 py-3 text-center">判定</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                <tr className="hover:bg-blue-50/30">
                                    <td className="px-6 py-4 font-medium">表面划痕</td>
                                    <td className="px-6 py-4 text-gray-500">无明显划痕, 凹坑&lt;0.1mm</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button className="flex-1 py-1.5 border border-green-200 bg-green-50 text-green-700 rounded hover:bg-green-100 text-xs font-bold">OK</button>
                                            <button className="flex-1 py-1.5 border border-gray-200 text-gray-500 rounded hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs">NG</button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center"><CheckCircle size={18} className="text-green-500 mx-auto"/></td>
                                </tr>
                                <tr className="hover:bg-blue-50/30">
                                    <td className="px-6 py-4 font-medium">总厚度 (Thickness)</td>
                                    <td className="px-6 py-4 text-gray-500">1.270 ± 0.020 mm</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <input type="number" placeholder="Value 1" className="w-20 border rounded p-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                            <input type="number" placeholder="Value 2" className="w-20 border rounded p-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                            <input type="number" placeholder="Value 3" className="w-20 border rounded p-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center"><span className="text-gray-300">-</span></td>
                                </tr>
                                <tr className="hover:bg-blue-50/30">
                                    <td className="px-6 py-4 font-medium">硬度 (Hardness)</td>
                                    <td className="px-6 py-4 text-gray-500">55 ± 5 Shore D</td>
                                    <td className="px-6 py-4">
                                        <input type="number" placeholder="实测值" className="w-full border rounded p-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                    </td>
                                    <td className="px-6 py-4 text-center"><span className="text-gray-300">-</span></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h4 className="font-bold text-gray-700 mb-4">异常及附件</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">上传图片/附件</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-blue-400 cursor-pointer transition-colors">
                                        <Camera size={24} className="mb-2"/>
                                        <span className="text-xs">点击拍摄或上传照片</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">质检备注</label>
                                    <textarea className="w-full border rounded-lg p-3 h-24 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none" placeholder="输入任何额外的检验发现..."></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="pass" className="w-5 h-5 text-purple-600 rounded" />
                                <label htmlFor="pass" className="text-sm font-bold text-gray-700 select-none">我确认以上检验数据真实有效</label>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={onBack} className="px-6 py-3 bg-white border border-gray-300 text-gray-600 rounded-lg font-bold hover:bg-gray-50">暂存</button>
                                <button onClick={onSubmit} className="px-8 py-3 bg-purple-600 text-white rounded-lg font-bold shadow-lg hover:bg-purple-700 flex items-center gap-2">
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
export default function App() {
    // 视图状态控制: 'DASHBOARD' | 'OPERATOR_REPORT' | 'QC_INSPECTOR'
    const [currentView, setCurrentView] = useState('DASHBOARD');

    const [selectedOrderId, setSelectedOrderId] = useState("WO-20240520-001");
    const [orders, setOrders] = useState(MOCK_DATA.workOrders);

    // Modal States (仅用于 Dashboard 中的辅助功能)
    const [activeModal, setActiveModal] = useState(null);

    const currentOrder = useMemo(() =>
            orders.find(o => o.id === selectedOrderId) || orders[0]
        , [selectedOrderId, orders]);

    const currentStep = currentOrder.routing[currentOrder.currentStepIndex] || {};

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

    const getStatusColor = (status) => {
        switch(status) {
            case 'RUNNING': return 'bg-green-500 text-white animate-pulse';
            case 'PAUSED': return 'bg-amber-500 text-white';
            case 'COMPLETED': return 'bg-blue-500 text-white';
            default: return 'bg-gray-400 text-white';
        }
    };

    // --- 视图路由渲染 ---

    if (currentView === 'OPERATOR_REPORT') {
        return (
            <OperatorReportingBoard
                order={currentOrder}
                step={currentStep}
                onBack={() => setCurrentView('DASHBOARD')}
                onSubmit={() => {
                    alert("报工成功！产量已更新。");
                    setCurrentView('DASHBOARD');
                }}
            />
        );
    }

    if (currentView === 'QC_INSPECTOR') {
        return (
            <QualityInspectionBoard
                order={currentOrder}
                step={currentStep}
                onBack={() => setCurrentView('DASHBOARD')}
                onSubmit={() => {
                    alert("质检结果已提交，判定为：合格");
                    setCurrentView('DASHBOARD');
                }}
            />
        );
    }

    // 默认 Dashboard 视图
    return (
        <div className="flex h-screen bg-gray-100 font-sans text-slate-800 overflow-hidden">

            {/* 1. 左侧侧边栏：工单队列 */}
            <aside className="w-80 bg-white shadow-xl flex flex-col border-r border-gray-200 z-10">
                <div className="p-5 border-b border-gray-200 bg-slate-800 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-blue-500 p-1.5 rounded-lg"><Activity size={20} /></div>
                        <h1 className="font-bold text-lg tracking-wide">MES 作业看板</h1>
                    </div>
                    <div className="text-xs text-slate-400">
                        {MOCK_DATA.currentUser.shift} | {MOCK_DATA.currentUser.station}
                    </div>
                </div>

                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                        <input type="text" placeholder="扫描工单号 / 批次号" className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {orders.map(order => (
                        <div
                            key={order.id}
                            onClick={() => setSelectedOrderId(order.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                                selectedOrderId === order.id
                                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                    : 'bg-white border-gray-200 hover:border-blue-300'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-mono text-xs font-bold text-slate-500">{order.id}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    order.status === 'RUNNING' ? 'bg-green-100 text-green-700' :
                                        order.status === 'PAUSED' ? 'bg-amber-100 text-amber-700' :
                                            'bg-gray-100 text-gray-600'
                                }`}>
                  {order.status === 'RUNNING' ? '生产中' : order.status === 'PAUSED' ? '暂停' : '待产'}
                </span>
                            </div>
                            <h3 className="font-bold text-sm text-slate-800 mb-1">{order.productName}</h3>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>进度: {Math.round((order.completedQty / order.planQty) * 100)}%</span>
                                <span>当前: {order.routing[order.currentStepIndex]?.name || '完成'}</span>
                            </div>
                            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div
                                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${(order.completedQty / order.planQty) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* 2. 主内容区域 */}
            <main className="flex-1 flex flex-col overflow-hidden relative">

                {/* Header */}
                <header className="bg-white h-16 border-b border-gray-200 flex justify-between items-center px-6 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className={`h-3 w-3 rounded-full ${orders.some(o => o.status === 'RUNNING') ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                        <span className="font-bold text-gray-700 text-lg">
               {currentOrder.productName}
                            <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                 {currentOrder.productCode}
               </span>
             </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Thermometer size={18} />
                            <span>车间温度: 22.5°C</span>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-mono font-bold text-slate-800 leading-none">09:42:15</div>
                            <div className="text-xs text-gray-400">2024-05-24 星期五</div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">

                    {/* Top Cards: KPI & Progress */}
                    <div className="grid grid-cols-4 gap-6 mb-6">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                            <span className="text-sm text-gray-500 font-medium uppercase">生产进度 (Qty)</span>
                            <div className="flex items-end justify-between mt-2">
                                <span className="text-4xl font-bold text-blue-600">{currentOrder.completedQty}</span>
                                <span className="text-xl text-gray-400 font-medium mb-1">/ {currentOrder.planQty}</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 mt-3 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full" style={{width: `${(currentOrder.completedQty/currentOrder.planQty)*100}%`}}></div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                            <span className="text-sm text-gray-500 font-medium uppercase">当前工序状态</span>
                            <div className="mt-2 flex items-center gap-3">
                                <div className={`px-4 py-2 rounded-lg font-bold text-xl flex items-center gap-2 ${getStatusColor(currentOrder.status)}`}>
                                    {currentOrder.status === 'RUNNING' && <Activity className="animate-spin-slow" size={20} />}
                                    {currentOrder.status}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">标准CT: 45min / 实际: 32min</div>
                        </div>

                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                            <span className="text-sm text-gray-500 font-medium uppercase">物料状态</span>
                            <div className="mt-2 space-y-2">
                                {currentOrder.materials.map((m, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="truncate w-24" title={m.name}>{m.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-800 font-bold">{m.consumed}</span>
                                            <span className="text-gray-400 text-xs">/ {m.required}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setActiveModal('MATERIAL')}
                                className="mt-2 w-full py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                            >
                                补料 / 呼叫送料
                            </button>
                        </div>

                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                            <span className="text-sm text-gray-500 font-medium uppercase">良率监控 (YIELD)</span>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-4xl font-bold text-green-600">98.5%</span>
                                <BarChart3 className="text-green-200 h-10 w-10" />
                            </div>
                            <div className="text-xs text-gray-500 mt-2 flex gap-2">
                                <span className="text-red-500 font-medium">不良: 1 pcs</span>
                                <span className="text-gray-300">|</span>
                                <span>报废: 0</span>
                            </div>
                        </div>
                    </div>

                    {/* Process Route Stepper */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <History size={20} className="text-gray-500" />
                            工艺路线执行监控 (Process Routing)
                        </h3>
                        <div className="flex items-center justify-between relative px-4">
                            {/* Connector Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 -translate-y-1/2"></div>

                            {currentOrder.routing.map((step, index) => {
                                const isCurrent = index === currentOrder.currentStepIndex;
                                const isCompleted = index < currentOrder.currentStepIndex;
                                const isQC = step.type === 'QC';

                                return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center group">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center border-4 font-bold text-lg transition-all duration-300
                      ${isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                                isCurrent ? (currentOrder.status === 'RUNNING' ? 'bg-white border-green-500 text-green-600 scale-110 shadow-lg' : 'bg-white border-blue-500 text-blue-600 scale-110 shadow-lg') :
                                                    'bg-white border-gray-300 text-gray-300'}`}
                                        >
                                            {isCompleted ? <CheckCircle size={24} /> : index + 1}
                                        </div>

                                        <div className={`mt-4 text-center w-32 transition-colors ${isCurrent ? 'font-bold text-slate-800' : 'text-gray-500'}`}>
                                            <div className="text-sm">{step.name}</div>
                                            {isQC && <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded font-bold">QMES质检</span>}
                                            {step.operator && <div className="text-[10px] text-gray-400 mt-1">Op: {step.operator}</div>}
                                        </div>

                                        {isCurrent && (
                                            <div className="absolute -top-10 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg animate-bounce">
                                                当前作业
                                                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Core Operations Panel */}
                    <div className="grid grid-cols-3 gap-6 h-64">

                        {/* Left: Standard Operations */}
                        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-700 mb-4">作业控制 (Operation Control)</h3>
                            <div className="grid grid-cols-4 gap-4 h-full pb-8">

                                {currentOrder.status !== 'RUNNING' ? (
                                    <button
                                        onClick={() => handleStatusChange('RUNNING')}
                                        className="col-span-1 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg flex flex-col items-center justify-center gap-2 transform active:scale-95 transition-all"
                                    >
                                        <Play size={40} fill="currentColor" />
                                        <span className="font-bold text-lg">开工 (Start)</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleStatusChange('PAUSED')}
                                        className="col-span-1 bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl shadow-lg flex flex-col items-center justify-center gap-2 transform active:scale-95 transition-all"
                                    >
                                        <Pause size={40} fill="currentColor" />
                                        <span className="font-bold text-lg">暂停 (Pause)</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => setCurrentView('OPERATOR_REPORT')}
                                    disabled={currentOrder.status !== 'RUNNING'}
                                    className="col-span-1 bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 text-blue-700 rounded-xl flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-transform"
                                >
                                    <Package size={32} />
                                    <span className="font-bold">过程报工</span>
                                    <span className="text-xs opacity-70">Report Qty</span>
                                </button>

                                <button
                                    onClick={() => setCurrentView('QC_INSPECTOR')}
                                    disabled={currentOrder.status !== 'RUNNING' && !currentStep.qcRequired}
                                    className={`col-span-1 border-2 rounded-xl flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative transform hover:scale-[1.02] transition-transform
                    ${currentStep.qcRequired ? 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                                >
                                    {currentStep.qcRequired && <span className="absolute top-2 right-2 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span></span>}
                                    <ClipboardList size={32} />
                                    <span className="font-bold">QMES 质检</span>
                                    <span className="text-xs opacity-70">Record QC</span>
                                </button>

                                <button
                                    onClick={handleNextStep}
                                    disabled={currentOrder.status !== 'RUNNING'}
                                    className="col-span-1 bg-gray-800 hover:bg-black text-white rounded-xl flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ArrowRight size={32} />
                                    <span className="font-bold">工序完工</span>
                                    <span className="text-xs opacity-70">Next Step</span>
                                </button>
                            </div>
                        </div>

                        {/* Right: Andon & Exception */}
                        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-700 mb-4">辅助与异常 (Andon)</h3>
                            <div className="grid grid-cols-2 gap-4 h-full pb-8">
                                <button
                                    onClick={() => setActiveModal('ABNORMAL')}
                                    className="bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 rounded-xl flex flex-col items-center justify-center gap-1 p-2"
                                >
                                    <AlertTriangle size={28} />
                                    <span className="font-bold">异常呼叫</span>
                                    <span className="text-xs text-center">品质/设备异常</span>
                                </button>

                                <button
                                    onClick={() => alert("呼叫维修人员中...通知已发送至设备部")}
                                    className="bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-600 rounded-xl flex flex-col items-center justify-center gap-1 p-2"
                                >
                                    <Wrench size={28} />
                                    <span className="font-bold">设备报修</span>
                                    <span className="text-xs text-center">Machine Down</span>
                                </button>

                                <button
                                    onClick={() => setActiveModal('MATERIAL')}
                                    className="bg-cyan-50 border border-cyan-200 hover:bg-cyan-100 text-cyan-600 rounded-xl flex flex-col items-center justify-center gap-1 p-2"
                                >
                                    <Truck size={28} />
                                    <span className="font-bold">AGV 呼叫</span>
                                    <span className="text-xs text-center">请求送料</span>
                                </button>

                                <button className="bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl flex flex-col items-center justify-center gap-1 p-2">
                                    <Menu size={28} />
                                    <span className="font-bold">作业指导书</span>
                                    <span className="text-xs text-center">SOP/SIP</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Status Bar */}
                <footer className="h-10 bg-slate-800 text-slate-300 text-xs flex items-center justify-between px-6 z-10">
                    <div className="flex gap-4">
                        <span>系统状态: 在线 (12ms)</span>
                        <span>MES版本: v3.2.1-semi</span>
                    </div>
                    <div>
                        © 2024 新型显示与半导体材料智能制造平台
                    </div>
                </footer>

                {/* --- Modals 挂载点 --- */}
                <AbnormalEventDetail
                    isOpen={activeModal === 'ABNORMAL'}
                    onClose={() => setActiveModal(null)}
                    onSubmit={() => setActiveModal(null)}
                    orderId={selectedOrderId}
                    stepName={currentStep.name}
                />

                {/* 简单的物料呼叫模拟 Modal */}
                {activeModal === 'MATERIAL' && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-lg w-96 p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Box /> 呼叫物料配送</h3>
                            <p className="text-sm text-gray-600 mb-4">请选择需要配送到机台的物料：</p>
                            <div className="space-y-2 mb-4">
                                <label className="flex items-center gap-2 p-2 border rounded hover:bg-blue-50 cursor-pointer">
                                    <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                                    <span className="text-sm">聚氨酯预聚体 (20kg桶装)</span>
                                </label>
                                <label className="flex items-center gap-2 p-2 border rounded hover:bg-blue-50 cursor-pointer">
                                    <input type="checkbox" className="rounded text-blue-600" />
                                    <span className="text-sm">去离子水 (DI Water)</span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setActiveModal(null)} className="px-3 py-1.5 text-gray-600 text-sm">取消</button>
                                <button onClick={() => { alert("AGV调度指令已下发"); setActiveModal(null); }} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">确认呼叫</button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}