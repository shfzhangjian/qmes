/**
 * @file: src/components/Common/UploadModal.jsx
 * @description: 通用文件上传组件
 */
import React, { useState, useRef } from 'react';
import '../../styles/components.css';
import './UploadModal.css';

const UploadModal = ({ visible, onClose, onUploadSuccess }) => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const inputRef = useRef(null);

    if (!visible) return null;

    const handleDrag = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) addFiles(e.dataTransfer.files);
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) addFiles(e.target.files);
    };

    const addFiles = (newFiles) => {
        const fileList = Array.from(newFiles).map(file => ({
            file, name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        }));
        setFiles(prev => [...prev, ...fileList]);
    };

    const startUpload = () => {
        if (files.length === 0) return;
        setUploading(true); setProgress(0);
        const interval = setInterval(() => {
            setProgress(old => {
                if (old >= 100) {
                    clearInterval(interval); setUploading(false);
                    if (onUploadSuccess) onUploadSuccess(files.map(f => ({ name: f.name, size: f.size, type: f.name.endsWith('.pdf')?'pdf':'img' })));
                    onClose(); return 100;
                }
                return old + Math.random() * 20;
            });
        }, 300);
    };

    return (
        <div className="aip-global-overlay open" style={{zIndex: 3000}}>
            <div className="aip-modal-container um-modal-size">
                <div className="aip-modal-header">
                    <div className="aip-modal-title">上传附件</div>
                    <i className="ri-close-line icon-btn" onClick={onClose}></i>
                </div>
                <div className="aip-modal-body" style={{ padding: '20px' }}>
                    <div className={`um-drop-zone ${dragActive ? 'active' : ''}`}
                         onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                         onClick={() => inputRef.current.click()}
                    >
                        <input ref={inputRef} type="file" multiple onChange={handleChange} style={{ display: 'none' }} />
                        <i className="ri-upload-cloud-2-line um-icon-cloud"></i>
                        <p className="um-text-main">点击或将文件拖拽到这里上传</p>
                        <p className="um-text-sub">支持 PDF, JPG, PNG, Excel (Max: 10MB)</p>
                    </div>
                    {files.length > 0 && (
                        <div className="um-file-list">
                            {files.map((item, idx) => (
                                <div key={idx} className="um-file-item">
                                    <i className="ri-file-text-line um-file-icon"></i>
                                    <div className="um-file-info">{item.name} <span className="um-file-size">({item.size})</span></div>
                                    <i className="ri-close-circle-fill um-action-delete" onClick={() => setFiles(files.filter((_, i) => i !== idx))}></i>
                                </div>
                            ))}
                        </div>
                    )}
                    {uploading && (
                        <div className="um-progress-wrapper">
                            <div className="um-progress-info"><span>上传中...</span><span>{Math.round(progress)}%</span></div>
                            <div className="um-progress-track"><div className="um-progress-bar" style={{ width: `${progress}%` }}></div></div>
                        </div>
                    )}
                </div>
                <div className="um-footer">
                    <button className="btn outline" onClick={onClose} disabled={uploading} style={{ marginRight: '10px' }}>取消</button>
                    <button className="btn btn-primary" onClick={startUpload} disabled={uploading || files.length === 0}>{uploading ? '处理中' : '开始上传'}</button>
                </div>
            </div>
        </div>
    );
};
export default UploadModal;