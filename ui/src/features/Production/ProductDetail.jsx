/**
 * @file: src/features/Production/ProductDetail.jsx
 * @description: 产品档案详情/编辑
 * - [Feature] 支持基本信息、工艺关联、扩展属性
 * - [UI] 左侧图片，右侧表单布局
 */
import React, { useState, useEffect } from 'react';
import BaseModal from '../../components/Common/BaseModal';
import '../../styles/sys-comm-detail.css'; // 复用系统通用样式
import './ProductDetail.css'; // 组件专用样式

const ProductDetail = ({ visible, record, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (visible) {
            if (record) {
                setFormData({ ...record });
            } else {
                setFormData({
                    code: '', name: '', category: '抛光耗材', spec: '', unit: 'pcs',
                    process: '', bom: '', manager: '', status: '启用', remark: ''
                });
            }
        }
    }, [visible, record]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <BaseModal
            visible={visible}
            title={record ? "编辑产品档案" : "新建产品档案"}
            width="800px"
            onClose={onClose}
            footer={
                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <button className="btn outline" onClick={onClose}>取消</button>
                    <button className="btn btn-primary" onClick={() => onSubmit(formData)}>保存</button>
                </div>
            }
        >
            <div className="prod-form-container">
                <div className="prod-layout-grid">
                    {/* 左侧：图片/图标 */}
                    <div>
                        <div className="prod-image-uploader">
                            <i className="ri-image-add-line"></i>
                            <span>上传产品图</span>
                        </div>
                        <div style={{marginTop:'10px', fontSize:'12px', color:'#999', lineHeight:'1.5'}}>
                            支持 JPG/PNG<br/>最大 2MB
                        </div>
                    </div>

                    {/* 右侧：表单 */}
                    <div className="form-section">
                        <div className="form-grid-2">
                            <div className="form-item">
                                <label className="required">产品编码</label>
                                <input className="std-input" value={formData.code || ''} onChange={e => handleChange('code', e.target.value)} placeholder="自动生成或手动输入" disabled={!!record} />
                            </div>
                            <div className="form-item">
                                <label className="required">产品名称</label>
                                <input className="std-input" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
                            </div>
                            <div className="form-item">
                                <label className="required">产品分类</label>
                                <select className="std-input" value={formData.category || '抛光耗材'} onChange={e => handleChange('category', e.target.value)}>
                                    <option>抛光耗材</option>
                                    <option>光刻耗材</option>
                                    <option>工装夹具</option>
                                    <option>半成品</option>
                                    <option>其他</option>
                                </select>
                            </div>
                            <div className="form-item">
                                <label className="required">计量单位</label>
                                <select className="std-input" value={formData.unit || 'pcs'} onChange={e => handleChange('unit', e.target.value)}>
                                    <option value="片">片 (Piece)</option>
                                    <option value="盒">盒 (Box)</option>
                                    <option value="个">个 (Unit)</option>
                                    <option value="卷">卷 (Roll)</option>
                                    <option value="kg">千克 (kg)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-item" style={{marginTop:'15px'}}>
                            <label className="required">规格型号</label>
                            <input className="std-input" value={formData.spec || ''} onChange={e => handleChange('spec', e.target.value)} placeholder="如：D300mm*T2.0mm / 孔隙率30%" />
                        </div>

                        <div style={{borderTop:'1px dashed #eee', margin:'20px 0'}}></div>

                        <div className="form-grid-2">
                            <div className="form-item">
                                <label>默认工艺路线</label>
                                <div style={{display:'flex', gap:'8px'}}>
                                    <input className="std-input" value={formData.process || ''} placeholder="点击选择工艺" readOnly />
                                    <button className="mini-btn outline"><i className="ri-search-line"></i></button>
                                </div>
                            </div>
                            <div className="form-item">
                                <label>默认BOM版本</label>
                                <div style={{display:'flex', gap:'8px'}}>
                                    <input className="std-input" value={formData.bom || ''} placeholder="点击选择BOM" readOnly />
                                    <button className="mini-btn outline"><i className="ri-search-line"></i></button>
                                </div>
                            </div>
                            <div className="form-item">
                                <label>负责人</label>
                                <input className="std-input" value={formData.manager || ''} onChange={e => handleChange('manager', e.target.value)} />
                            </div>
                            <div className="form-item">
                                <label>状态</label>
                                <select className="std-input" value={formData.status || '启用'} onChange={e => handleChange('status', e.target.value)}>
                                    <option>启用</option>
                                    <option>停用</option>
                                    <option>研发中</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-item" style={{marginTop:'15px'}}>
                            <label>备注说明</label>
                            <textarea className="std-input" style={{height:'60px', paddingTop:'8px'}} value={formData.remark || ''} onChange={e => handleChange('remark', e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export default ProductDetail;