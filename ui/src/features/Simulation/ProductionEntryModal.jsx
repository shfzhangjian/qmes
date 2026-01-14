/**
 * @file: src/features/Simulation/ProductionEntryModal.jsx
 * @version: v1.0.0
 * @description: OP场景 - 生产记录填报模拟弹窗
 * 支持显示当前机台与工单信息，并模拟从 PLC 读取实时工艺参数的过程。
 * @lastModified: 2026-01-13 23:30:00
 */
import React, { useState, useContext } from 'react';
import { SimulationContext } from '../../context/SimulationContext';

const ProductionEntryModal = () => {
    const { closeModal } = useContext(SimulationContext);
    const [loadingPLC, setLoadingPLC] = useState(false);
    const [formData, setFormData] = useState({
        machineId: 'Coater-03',
        batchNo: 'WO-20260113-001',
        speed: '',
        temp: '',
        tension: '',
        viscosity: ''
    });

    const handleReadPLC = () => {
        setLoadingPLC(true);
        // 模拟读取 PLC 数据
        setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                speed: '45.2',
                temp: '120.5',
                tension: '240',
                viscosity: '1500'
            }));
            setLoadingPLC(false);
        }, 800);
    };

    const handleSubmit = () => {
        alert("生产数据已提交！");
        closeModal();
    };

    return (
        <div className="aip-modal-body" style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="aip-form-group">
                    <label>机台编号</label>
                    <input className="aip-input" value={formData.machineId} readOnly style={{ background: '#f5f5f5' }} />
                </div>
                <div className="aip-form-group">
                    <label>工单批次</label>
                    <input className="aip-input" value={formData.batchNo} readOnly style={{ background: '#f5f5f5' }} />
                </div>
            </div>

            <div style={{ padding: '15px', background: '#f0f7ff', borderRadius: '6px', marginBottom: '20px', border: '1px solid #adc6ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ fontWeight: 'bold', color: '#1890ff' }}><i className="ri-sensor-line"></i> 工艺参数采集</div>
                    <button className="small-btn outline" onClick={handleReadPLC} disabled={loadingPLC} style={{ background: '#fff' }}>
                        {loadingPLC ? <i className="ri-loader-4-line spin"></i> : <i className="ri-download-cloud-2-line"></i>}
                        读取 PLC 数据
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="aip-form-group">
                        <label>涂布速度 (m/min)</label>
                        <input className="aip-input" value={formData.speed} onChange={e => setFormData({ ...formData, speed: e.target.value })} />
                    </div>
                    <div className="aip-form-group">
                        <label>烘箱温度 (°C)</label>
                        <input className="aip-input" value={formData.temp} onChange={e => setFormData({ ...formData, temp: e.target.value })} />
                    </div>
                    <div className="aip-form-group">
                        <label>收卷张力 (N)</label>
                        <input className="aip-input" value={formData.tension} onChange={e => setFormData({ ...formData, tension: e.target.value })} />
                    </div>
                    <div className="aip-form-group">
                        <label>胶水粘度 (cps)</label>
                        <input className="aip-input" value={formData.viscosity} onChange={e => setFormData({ ...formData, viscosity: e.target.value })} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn outline" onClick={closeModal}>取消</button>
                <button className="btn btn-primary" onClick={handleSubmit}>确认提交</button>
            </div>
        </div>
    );
};

export default ProductionEntryModal;