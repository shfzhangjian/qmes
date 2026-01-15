/**
 * @file: src/features/Business/PartnerDetail.jsx
 * @description: 客商信息详情编辑
 * - [Style] 引用 sys-comm-detail.css 和 PartnerDetail.css
 */
import React, { useState, useEffect } from 'react';
import BaseModal from '../../components/Common/BaseModal';
import '../../styles/sys-comm-detail.css';
import './PartnerDetail.css';

const PartnerDetail = ({ visible, record, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({});
    const [activeTab, setActiveTab] = useState('base'); // base, finance, address

    useEffect(() => {
        if (visible) {
            setFormData(record || {
                code: '', name: '', type: '客户', level: '一般',
                contact: '', phone: '', email: '', region: '华东区',
                address: '', credit: '', status: '启用', desc: ''
            });
            setActiveTab('base');
        }
    }, [visible, record]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <BaseModal
            visible={visible}
            title={record?.id ? "编辑客商档案" : "新增客商档案"}
            width="750px"
            onClose={onClose}
            footer={
                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <button className="btn outline" onClick={onClose}>取消</button>
                    <button className="btn btn-primary" onClick={() => onSubmit(formData)}>保存</button>
                </div>
            }
        >
            <div className="partner-detail-container">
                {/* 顶部简要信息卡 */}
                <div className="partner-header-card">
                    <div className="ph-icon">
                        <i className={`ri-${formData.type === '供应商' ? 'store-2-fill' : 'building-4-fill'}`}></i>
                    </div>
                    <div className="ph-info">
                        <div className="ph-title">{formData.name || '未命名客商'}</div>
                        <div className="ph-tags">
                            <span className="q-tag primary">{formData.type}</span>
                            <span className="q-tag">{formData.level}</span>
                            <span className="q-tag">{formData.region}</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="partner-tabs">
                    <div className={`pt-tab ${activeTab==='base'?'active':''}`} onClick={()=>setActiveTab('base')}>基本信息</div>
                    <div className={`pt-tab ${activeTab==='finance'?'active':''}`} onClick={()=>setActiveTab('finance')}>财务信息</div>
                    <div className={`pt-tab ${activeTab==='address'?'active':''}`} onClick={()=>setActiveTab('address')}>收发货地址</div>
                </div>

                <div className="partner-tab-content">
                    {/* 基本信息 */}
                    {activeTab === 'base' && (
                        <div className="form-grid-2">
                            <div className="form-item">
                                <label className="required">客商编码</label>
                                <input className="std-input" value={formData.code} onChange={e => handleChange('code', e.target.value)} disabled={!!record} placeholder="自动生成" />
                            </div>
                            <div className="form-item">
                                <label className="required">客商名称</label>
                                <input className="std-input" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                            </div>
                            <div className="form-item">
                                <label className="required">客商类型</label>
                                <select className="std-input" value={formData.type} onChange={e => handleChange('type', e.target.value)}>
                                    <option>客户</option><option>供应商</option><option>外协厂</option><option>合作伙伴</option>
                                </select>
                            </div>
                            <div className="form-item">
                                <label>等级/资质</label>
                                <select className="std-input" value={formData.level} onChange={e => handleChange('level', e.target.value)}>
                                    <option>战略</option><option>重点</option><option>合格</option><option>一般</option><option>潜在</option><option>黑名单</option>
                                </select>
                            </div>
                            <div className="form-item">
                                <label className="required">首要联系人</label>
                                <input className="std-input" value={formData.contact} onChange={e => handleChange('contact', e.target.value)} />
                            </div>
                            <div className="form-item">
                                <label className="required">联系电话</label>
                                <input className="std-input" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
                            </div>
                            <div className="form-item">
                                <label>电子邮箱</label>
                                <input className="std-input" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                            </div>
                            <div className="form-item">
                                <label>状态</label>
                                <select className="std-input" value={formData.status} onChange={e => handleChange('status', e.target.value)}>
                                    <option>启用</option><option>停用</option><option>冻结</option>
                                </select>
                            </div>
                            <div className="form-item" style={{gridColumn:'span 2'}}>
                                <label>备注说明</label>
                                <textarea className="std-input" style={{height:'60px', paddingTop:'8px'}} value={formData.desc} onChange={e => handleChange('desc', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* 财务信息 (占位) */}
                    {activeTab === 'finance' && (
                        <div className="form-grid-2">
                            <div className="form-item">
                                <label>纳税人识别号</label>
                                <input className="std-input" placeholder="输入税号" />
                            </div>
                            <div className="form-item">
                                <label>开户银行</label>
                                <input className="std-input" placeholder="输入开户行" />
                            </div>
                            <div className="form-item" style={{gridColumn:'span 2'}}>
                                <label>银行账号</label>
                                <input className="std-input" placeholder="输入账号" />
                            </div>
                            <div className="form-item">
                                <label>信用等级</label>
                                <input className="std-input" value={formData.credit} onChange={e => handleChange('credit', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* 地址信息 (占位) */}
                    {activeTab === 'address' && (
                        <div className="form-grid-1">
                            <div className="form-item">
                                <label>注册地址</label>
                                <input className="std-input" value={formData.address} onChange={e => handleChange('address', e.target.value)} />
                            </div>
                            <div className="form-item">
                                <label>收货地址</label>
                                <input className="std-input" placeholder="同注册地址" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </BaseModal>
    );
};

export default PartnerDetail;