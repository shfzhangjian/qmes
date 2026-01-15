/**
 * @file: src/features/Production/QcItemPicker.jsx
 * @description: 检验项目通用选择器 (严格匹配 qcLib 结构)
 */
import React, { useState, useEffect } from 'react';
import BaseModal from '../../components/Common/BaseModal';
import libraryData from '../../data/mock/processMeta.json'; // 使用统一的元数据
import './production.css';

const QcItemPicker = ({ visible, onClose, onSelect }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [list, setList] = useState([]);

    useEffect(() => {
        if (visible) {
            setSelectedIds([]);
            setKeyword('');
            setList(libraryData.qcLib); // 直接使用 qcLib
        }
    }, [visible]);

    const handleSearch = (val) => {
        setKeyword(val);
        const lower = val.toLowerCase();
        setList(libraryData.qcLib.filter(i =>
            i.name.includes(val) ||
            (i.stdCode && i.stdCode.toLowerCase().includes(lower)) ||
            (i.category && i.category.includes(val))
        ));
    };

    const toggleSelect = (item) => {
        if (selectedIds.includes(item.id)) {
            setSelectedIds(selectedIds.filter(id => id !== item.id));
        } else {
            setSelectedIds([...selectedIds, item.id]);
        }
    };

    const handleConfirm = () => {
        const selectedItems = libraryData.qcLib.filter(i => selectedIds.includes(i.id));
        onSelect(selectedItems);
        onClose();
    };

    return (
        <BaseModal
            visible={visible}
            title="引入标准检验项目 (从基础库)"
            width="1200px" // 增加宽度以容纳更多列
            onClose={onClose}
            footer={
                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <button className="btn outline" onClick={onClose}>取消</button>
                    <button className="btn btn-primary" onClick={handleConfirm} disabled={selectedIds.length===0}>
                        确认引入 ({selectedIds.length})
                    </button>
                </div>
            }
        >
            <div style={{padding:'10px 0'}}>
                <input
                    className="std-input"
                    placeholder="搜索项目名称、分类或标准号..."
                    value={keyword}
                    onChange={e => handleSearch(e.target.value)}
                    style={{marginBottom:'10px'}}
                />
                <div className="table-scroll" style={{height:'450px'}}>
                    <table className="sub-table">
                        {/* 列定义严格匹配 qcLib */}
                        <thead>
                        <tr>
                            <th width="40" className="center">选</th>
                            <th width="80">分类</th>
                            <th width="120">项目名称</th>
                            <th width="100">引用标准</th>
                            <th width="80">规格值</th>
                            <th width="50" className="center">单位</th>
                            <th width="50" className="center">SPC</th>
                            <th width="80">工具</th>
                            <th width="80">方法</th>
                            <th width="60">样本</th>
                            <th width="60">位置</th>
                            <th width="60">频次</th>
                            <th width="80">判定</th>
                        </tr>
                        </thead>
                        <tbody>
                        {list.map(item => (
                            <tr key={item.id} onClick={() => toggleSelect(item)} style={{cursor:'pointer', background: selectedIds.includes(item.id) ? '#e6f7ff' : ''}}>
                                <td className="center">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(item.id)}
                                        readOnly
                                    />
                                </td>
                                <td><span className="q-tag">{item.category}</span></td>
                                <td style={{fontWeight:'bold'}}>{item.name}</td>
                                <td style={{color:'#1890ff'}}>{item.stdCode}</td>
                                <td>{item.stdVal}</td>
                                <td className="center">{item.stdUnit}</td>
                                <td className="center">{item.spc ? '✅' : '-'}</td>
                                <td>{item.tool}</td>
                                <td>{item.method}</td>
                                <td>{item.sample}</td>
                                <td>{item.pos}</td>
                                <td>{item.freq}</td>
                                <td>{item.judge}</td>
                            </tr>
                        ))}
                        {list.length === 0 && <tr><td colSpan={13} className="center text-gray">无匹配数据</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </BaseModal>
    );
};

export default QcItemPicker;