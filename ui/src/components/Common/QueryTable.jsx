import React, { useState, useEffect } from 'react';
import '../../styles/components.css';

/**
 * 通用查询表格组件
 * @param {Array} columns - 列定义 [{ title, dataIndex, width, render, fixed: 'left'|'right' }]
 * @param {Array} dataSource - 数据源
 * @param {Object} pagination - 分页对象 { current, pageSize, total }
 * @param {Function} onPageChange - 分页回调 (page, pageSize) => {}
 * @param {Boolean} rowSelection - 是否开启行选择
 * @param {Function} onSelectChange - 选择回调 (selectedRowKeys, selectedRows) => {}
 * @param {Boolean} loading - 加载状态
 */
const QueryTable = ({
                        columns = [],
                        dataSource = [],
                        pagination,
                        onPageChange,
                        rowSelection = false,
                        onSelectChange,
                        loading = false,
                        rowKey = 'id'
                    }) => {
    const [selectedKeys, setSelectedKeys] = useState([]);

    // 处理全选
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allKeys = dataSource.map(item => item[rowKey]);
            setSelectedKeys(allKeys);
            if(onSelectChange) onSelectChange(allKeys, dataSource);
        } else {
            setSelectedKeys([]);
            if(onSelectChange) onSelectChange([], []);
        }
    };

    // 处理单选
    const handleSelectRow = (key, record, checked) => {
        let newKeys = [];
        if (checked) {
            newKeys = [...selectedKeys, key];
        } else {
            newKeys = selectedKeys.filter(k => k !== key);
        }
        setSelectedKeys(newKeys);
        if(onSelectChange) {
            const newRows = dataSource.filter(item => newKeys.includes(item[rowKey]));
            onSelectChange(newKeys, newRows);
        }
    };

    const isAllSelected = dataSource.length > 0 && selectedKeys.length === dataSource.length;
    const isIndeterminate = selectedKeys.length > 0 && selectedKeys.length < dataSource.length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* 表格主体 */}
            <div className="q-table-wrapper">
                {loading && (
                    <div style={{position:'absolute', inset:0, background:'rgba(255,255,255,0.6)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <i className="ri-loader-4-line spin" style={{fontSize:'24px', color:'#1890ff'}}></i>
                    </div>
                )}
                <table className="q-table">
                    <thead>
                    <tr>
                        {rowSelection && (
                            <th style={{ width: '40px', textAlign: 'center' }} className="fixed-left">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    ref={input => { if(input) input.indeterminate = isIndeterminate; }}
                                    onChange={handleSelectAll}
                                />
                            </th>
                        )}
                        {columns.map((col, idx) => (
                            <th
                                key={col.key || col.dataIndex || idx}
                                style={{ width: col.width, textAlign: col.align || 'left' }}
                                className={col.fixed ? `fixed-${col.fixed}` : ''}
                            >
                                {col.title}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {dataSource.length > 0 ? dataSource.map((record, rIdx) => {
                        const key = record[rowKey] || rIdx;
                        const isSelected = selectedKeys.includes(key);
                        return (
                            <tr key={key} style={{ background: isSelected ? '#e6f7ff' : undefined }}>
                                {rowSelection && (
                                    <td style={{ textAlign: 'center' }} className="fixed-left">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => handleSelectRow(key, record, e.target.checked)}
                                        />
                                    </td>
                                )}
                                {columns.map((col, cIdx) => (
                                    <td
                                        key={col.key || col.dataIndex || cIdx}
                                        style={{ textAlign: col.align || 'left' }}
                                        className={col.fixed ? `fixed-${col.fixed}` : ''}
                                    >
                                        {col.render ? col.render(record[col.dataIndex], record, rIdx) : record[col.dataIndex]}
                                    </td>
                                ))}
                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan={columns.length + (rowSelection ? 1 : 0)} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                暂无数据
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* 分页栏 */}
            {pagination && (
                <div className="q-pagination">
                    <div style={{ fontSize: '12px', color: '#999' }}>
                        共 {pagination.total} 条记录
                        {rowSelection && selectedKeys.length > 0 && <span style={{marginLeft:'10px', color:'#1890ff'}}>已选 {selectedKeys.length} 项</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                            className="btn-page small"
                            disabled={pagination.current === 1}
                            onClick={() => onPageChange(pagination.current - 1, pagination.pageSize)}
                        >上一页</button>
                        <span style={{ fontSize: '12px', padding: '2px 8px' }}>{pagination.current}</span>
                        <button
                            className="btn-page small"
                            disabled={pagination.current * pagination.pageSize >= pagination.total}
                            onClick={() => onPageChange(pagination.current + 1, pagination.pageSize)}
                        >下一页</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QueryTable;