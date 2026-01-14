import React from 'react';
import '../../styles/components.css';

/**
 * 智能配置表单
 * @param {Array} fields - 字段配置 [{ label, name, type, options, span, required }]
 * @param {Object} data - 表单数据
 * @param {Function} onChange - 数据变更回调 (key, value) => {}
 * @param {Number} columns - 栅格列数 (2, 3, 4)
 */
const SmartForm = ({ fields = [], data = {}, onChange, columns = 3 }) => {

    const handleChange = (name, val) => {
        if(onChange) onChange(name, val);
    };

    return (
        <div className={`q-form-grid cols-${columns}`}>
            {fields.map((field, idx) => {
                const span = field.span || 1;
                return (
                    <div
                        key={field.name || idx}
                        className="q-form-item"
                        style={{ gridColumn: `span ${span}` }}
                    >
                        {field.label && (
                            <label className={`q-form-label ${field.required ? 'required' : ''}`}>
                                {field.label}
                            </label>
                        )}

                        {/* 控件渲染工厂 */}
                        {(() => {
                            switch (field.type) {
                                case 'select':
                                    return (
                                        <select
                                            className="aip-input"
                                            value={data[field.name] || ''}
                                            onChange={e => handleChange(field.name, e.target.value)}
                                            disabled={field.disabled}
                                        >
                                            <option value="">请选择</option>
                                            {field.options && field.options.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    );
                                case 'date':
                                    return (
                                        <input
                                            type="date"
                                            className="aip-input"
                                            value={data[field.name] || ''}
                                            onChange={e => handleChange(field.name, e.target.value)}
                                            disabled={field.disabled}
                                        />
                                    );
                                case 'textarea':
                                    return (
                                        <textarea
                                            className="aip-input"
                                            rows={field.rows || 3}
                                            value={data[field.name] || ''}
                                            onChange={e => handleChange(field.name, e.target.value)}
                                            disabled={field.disabled}
                                        />
                                    );
                                case 'display':
                                    return (
                                        <div style={{padding:'10px', background:'#f5f5f5', borderRadius:'4px', fontSize:'14px'}}>
                                            {data[field.name] || '-'}
                                        </div>
                                    )
                                default: // text, number, password
                                    return (
                                        <input
                                            type={field.type || 'text'}
                                            className="aip-input"
                                            value={data[field.name] || ''}
                                            onChange={e => handleChange(field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                            disabled={field.disabled}
                                        />
                                    );
                            }
                        })()}
                    </div>
                );
            })}
        </div>
    );
};

export default SmartForm;