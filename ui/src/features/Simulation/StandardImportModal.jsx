/**
 * @file: src/features/Simulation/StandardImportModal.jsx
 * @version: v1.0.0
 * @description: IT场景 - 标准导入模拟弹窗
 * 实现文件上传、解析预览及分发同步的三步走流程。
 * @lastModified: 2026-01-13 23:30:00
 */
import React, { useContext, useState } from 'react';
import { SimulationContext } from '../../context/SimulationContext';

const StandardImportModal = () => {
    const { closeModal, importStandard } = useContext(SimulationContext);
    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);

    const handleImport = () => {
        setUploading(true);
        // 模拟解析过程
        setTimeout(() => {
            importStandard();
            setUploading(false);
        }, 1500);
    };

    return (
        <div className="aip-modal-body" style={{ padding: '20px' }}>
            {/* 步骤条 */}
            <div style={{ display: 'flex', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', color: step >= 1 ? '#1890ff' : '#999' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step >= 1 ? '#1890ff' : '#eee', color: '#fff', textAlign: 'center', lineHeight: '24px', marginRight: '8px' }}>1</div>
                    <span>文件上传</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', color: step >= 2 ? '#1890ff' : '#999' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step >= 2 ? '#1890ff' : '#eee', color: '#fff', textAlign: 'center', lineHeight: '24px', marginRight: '8px' }}>2</div>
                    <span>解析预览</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', color: step >= 3 ? '#1890ff' : '#999' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step >= 3 ? '#1890ff' : '#eee', color: '#fff', textAlign: 'center', lineHeight: '24px', marginRight: '8px' }}>3</div>
                    <span>分发同步</span>
                </div>
            </div>

            {step === 1 && (
                <div style={{ textAlign: 'center', padding: '40px', border: '2px dashed #d9d9d9', borderRadius: '8px', background: '#fafafa' }}>
                    <i className="ri-file-upload-line" style={{ fontSize: '48px', color: '#1890ff' }}></i>
                    <p style={{ margin: '20px 0', color: '#666' }}>将《进料检验标准 V2.0.pdf》或 Excel 文件拖拽至此</p>
                    <button className="btn btn-primary" onClick={() => setStep(2)}>选择文件 (模拟上传)</button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <div style={{ marginBottom: '15px', fontWeight: 'bold' }}>解析预览: 进料检验标准 V2.0</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead style={{ background: '#f5f5f5' }}>
                        <tr>
                            <th style={{ padding: '8px', border: '1px solid #eee' }}>物料编码</th>
                            <th style={{ padding: '8px', border: '1px solid #eee' }}>检验项目</th>
                            <th style={{ padding: '8px', border: '1px solid #eee' }}>标准值</th>
                            <th style={{ padding: '8px', border: '1px solid #eee' }}>AQL</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td style={{ padding: '8px', border: '1px solid #eee' }}>M-PET-001</td>
                            <td style={{ padding: '8px', border: '1px solid #eee' }}>基膜厚度</td>
                            <td style={{ padding: '8px', border: '1px solid #eee' }}>50±2 µm</td>
                            <td style={{ padding: '8px', border: '1px solid #eee' }}>0.4</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px', border: '1px solid #eee' }}>M-PET-001</td>
                            <td style={{ padding: '8px', border: '1px solid #eee' }}>透光率</td>
                            <td style={{ padding: '8px', border: '1px solid #eee' }}>&gt; 92%</td>
                            <td style={{ padding: '8px', border: '1px solid #eee' }}>0.65</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px', border: '1px solid #eee' }}>M-GLUE-A</td>
                            <td style={{ padding: '8px', border: '1px solid #eee' }}>初粘力</td>
                            <td style={{ padding: '8px', border: '1px solid #eee' }}>&gt; 1200g</td>
                            <td style={{ padding: '8px', border: '1px solid #eee' }}>1.0</td>
                        </tr>
                        </tbody>
                    </table>
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button className="btn outline" onClick={() => setStep(1)}>上一步</button>
                        <button className="btn btn-primary" onClick={handleImport} disabled={uploading}>
                            {uploading ? '导入中...' : '确认导入并分发'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StandardImportModal;