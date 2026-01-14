/**
 * @file: src/features/QMS/NonConformingList.jsx
 * @version: v2.0.0
 * @description: 不合格品处置单管理 (HC/R-23-1-01)
 * 界面重构：完全还原 PDF 表格排版，重点处理“评审会签”区域的复杂嵌套结构。
 * @author: AI Copilot
 * @createDate: 2026-01-14
 * @lastModified: 2026-01-14 10:10:00
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import BaseModal from '../../components/Common/BaseModal';
import SmartForm from '../../components/Common/SmartForm';

const NonConformingList = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState({});

    // --- 模拟数据 ---
    const mockData = [
        { id: 'NCR-2026-055', name: 'HC-OCA-50u', qty: '500m', step: '涂布', reason: '晶点超标', status: 'reviewing' },
        { id: 'NCR-2026-056', name: 'PET基膜', qty: '20卷', step: 'IQC', reason: '厚度不均', status: 'closed' },
    ];

    const columns = [
        { title: '单号', dataIndex: 'id', width: 120, fixed: 'left' },
        { title: '品名', dataIndex: 'name', width: 120 },
        { title: '发生工序', dataIndex: 'step', width: 80 },
        { title: '不合格数量', dataIndex: 'qty', width: 100 },
        { title: '不良描述', dataIndex: 'reason', width: 200 },
        { title: '状态', dataIndex: 'status', width: 100, render: v => v === 'closed' ? <span className="q-tag success">已结单</span> : <span className="q-tag processing">会签中</span> },
        { title: '操作', key: 'op', fixed: 'right', width: 100, render: (_, r) => <button className="small-btn outline" onClick={() => handleEdit(r)} style={{ color: '#1890ff' }}>评审</button> }
    ];

    const handleEdit = (r) => {
        setCurrentRecord(r || {});
        setModalVisible(true);
    };

    // --- PDF 样式辅助组件 (复用) ---
    const Cell = ({ children, span = 1, className = '', style = {} }) => (
        <div className={`pdf-cell ${className}`} style={{ gridColumn: `span ${span}`, ...style }}>
            {children}
        </div>
    );
    const Input = ({ value }) => <input type="text" className="pdf-input" defaultValue={value} />;
    const CheckBox = ({ label }) => <label style={{marginRight:'8px'}}><input type="checkbox"/> {label}</label>;

    return (
        <PageLayout
            searchForm={
                <SmartForm
                    fields={[{ label: '单据编号', name: 'id' }, { label: '品名', name: 'name' }]}
                    columns={4}
                />
            }
            toolbar={<button className="btn btn-primary" onClick={() => handleEdit({})}><i className="ri-add-line"></i> 开具处置单</button>}
        >
            <QueryTable columns={columns} dataSource={mockData} pagination={{ total: 2, current: 1, pageSize: 10 }} onPageChange={() => { }} />

            <BaseModal visible={modalVisible} title="不合格品处置单" width="950px" onClose={() => setModalVisible(false)} onOk={() => setModalVisible(false)}>
                <div className="pdf-container">
                    {/* Header */}
                    <div style={{ textAlign: 'center', position: 'relative', marginBottom: '15px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px' }}>不合格品处置单</div>
                        <div style={{ position: 'absolute', right: 0, top: 0, fontSize: '12px', textAlign: 'left' }}>
                            <div>编号: <span style={{ textDecoration: 'underline' }}>{currentRecord.id || 'HC/R-23-1-01'}</span></div>
                            <div>版本版次号: A4</div>
                            <div>序号: 001</div>
                        </div>
                    </div>

                    {/* Main Table */}
                    <div className="pdf-grid-ncr">
                        {/* 第一行: 类型/发生日期/品名/数量 */}
                        <Cell className="bg-gray center v-center">类型</Cell>
                        <Cell className="v-center"><CheckBox label="半成品" /> <CheckBox label="成品" /></Cell>
                        <Cell className="bg-gray center v-center">发生日期</Cell>
                        <Cell><Input /></Cell>
                        <Cell className="bg-gray center v-center">品名</Cell>
                        <Cell><Input value={currentRecord.name}/></Cell>
                        <Cell className="bg-gray center v-center">数量</Cell>
                        <Cell><Input value={currentRecord.qty}/></Cell>

                        {/* 第二行: 发生工序/规格/批号/空 */}
                        <Cell className="bg-gray center v-center">发生工序</Cell>
                        <Cell><Input value={currentRecord.step}/></Cell>
                        <Cell className="bg-gray center v-center">规格</Cell>
                        <Cell><Input /></Cell>
                        <Cell className="bg-gray center v-center">批号</Cell>
                        <Cell span={3}><Input /></Cell>

                        {/* 不合格说明区 */}
                        <Cell className="bg-gray center v-center" style={{ writingMode: 'vertical-rl' }}>不合格说明</Cell>
                        <Cell span={7} className="no-padding">
                            <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
                                <div style={{flex:1, borderBottom:'1px solid #000', padding:'5px'}}>
                                    <div style={{fontWeight:'bold'}}>不良描述:</div>
                                    <textarea className="pdf-input" rows={3} defaultValue={currentRecord.reason}></textarea>
                                </div>
                                <div style={{padding:'5px', display:'flex', alignItems:'center'}}>
                                    <span style={{fontWeight:'bold', marginRight:'10px'}}>品质确认:</span>
                                    <span style={{marginRight:'20px'}}>担当: <input style={{width:'80px', borderBottom:'1px solid #000', borderTop:'none',borderLeft:'none',borderRight:'none'}}/></span>
                                    <span style={{marginRight:'20px'}}>确认: <input style={{width:'80px', borderBottom:'1px solid #000', borderTop:'none',borderLeft:'none',borderRight:'none'}}/></span>
                                </div>
                            </div>
                        </Cell>

                        {/* 不合格等级 */}
                        <Cell className="bg-gray center v-center">不合格等级</Cell>
                        <Cell span={7} className="v-center">
                            <CheckBox label="轻微" />
                            <CheckBox label="一般" />
                            <CheckBox label="严重" />
                        </Cell>

                        {/* 责任单位 */}
                        <Cell className="bg-gray center v-center">责任单位</Cell>
                        <Cell span={7} className="v-center">
                            <CheckBox label="研发部" />
                            <CheckBox label="工艺部" />
                            <CheckBox label="生产部" />
                            <CheckBox label="设备部" />
                            <CheckBox label="品质部" />
                        </Cell>

                        {/* --- 评审会签区域 (Header) --- */}
                        <Cell className="bg-gray center v-center" style={{gridRow:'span 5', writingMode: 'vertical-rl', letterSpacing:'5px'}}>评审会签</Cell>

                        {/* 部门表头 */}
                        <Cell className="bg-gray center">部门</Cell>
                        <Cell className="bg-gray center" span={3}>意见 (勾选)</Cell>
                        <Cell className="bg-gray center" span={3}>签字 / 日期</Cell>

                        {/* 研发部 */}
                        <Cell className="center v-center">研发部</Cell>
                        <Cell span={3} className="v-center justify-around">
                            <CheckBox label="降级" /> <CheckBox label="返工" /> <CheckBox label="报废" /> <CheckBox label="特采" />
                        </Cell>
                        <Cell span={3} className="center v-center hand-write">Jim / 1.14</Cell>

                        {/* 生产部 */}
                        <Cell className="center v-center">生产部</Cell>
                        <Cell span={3} className="v-center justify-around">
                            <CheckBox label="降级" /> <CheckBox label="返工" /> <CheckBox label="报废" /> <CheckBox label="特采" />
                        </Cell>
                        <Cell span={3} className="center v-center"></Cell>

                        {/* 品质部 */}
                        <Cell className="center v-center">品质部</Cell>
                        <Cell span={3} className="v-center justify-around">
                            <CheckBox label="降级" /> <CheckBox label="返工" /> <CheckBox label="报废" /> <CheckBox label="特采" />
                        </Cell>
                        <Cell span={3} className="center v-center"></Cell>

                        {/* 工艺部 */}
                        <Cell className="center v-center">工艺部</Cell>
                        <Cell span={3} className="v-center justify-around">
                            <CheckBox label="降级" /> <CheckBox label="返工" /> <CheckBox label="报废" /> <CheckBox label="特采" />
                        </Cell>
                        <Cell span={3} className="center v-center"></Cell>

                        {/* --- 最终结论区域 --- */}
                        <Cell className="bg-gray center v-center" style={{gridRow:'span 2', writingMode: 'vertical-rl'}}>最终结论</Cell>

                        {/* 事业部总监 */}
                        <Cell className="center v-center">事业部总监</Cell>
                        <Cell span={3} className="v-center justify-around">
                            <CheckBox label="降级" /> <CheckBox label="返工" /> <CheckBox label="报废" /> <CheckBox label="特采" />
                        </Cell>
                        <Cell span={3} className="center v-center text-gray">签字 / 日期</Cell>

                        {/* 总经理 */}
                        <Cell className="center v-center">总经理</Cell>
                        <Cell span={3} className="v-center justify-around">
                            <CheckBox label="降级" /> <CheckBox label="返工" /> <CheckBox label="报废" /> <CheckBox label="特采" />
                        </Cell>
                        <Cell span={3} className="center v-center text-gray">签字 / 日期</Cell>

                    </div>

                    {/* Footer Info */}
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginTop:'10px'}}>
                        <div>制定/修订部门: 材料事业部品质</div>
                        <div>制定日期: 2018.06.25</div>
                        <div>修订日期: 2025.07.14</div>
                        <div>保管期限: 10年</div>
                    </div>
                </div>

                <style>{`
                    .pdf-container {
                        font-family: "SimSun", serif;
                        color: #000;
                        padding: 10px;
                    }
                    .pdf-grid-ncr {
                        display: grid;
                        /* 8列: 标题列窄, 内容列宽 */
                        grid-template-columns: 40px 80px 1fr 80px 1fr 80px 1fr 1fr;
                        border-top: 2px solid #000;
                        border-left: 2px solid #000;
                    }
                    .pdf-cell {
                        border-right: 1px solid #000;
                        border-bottom: 1px solid #000;
                        padding: 4px;
                        font-size: 13px;
                        background: #fff;
                    }
                    /* 右边框和下边框加粗 */
                    .pdf-grid-ncr > div:nth-last-child(-n+8) { border-bottom: 2px solid #000; }
                    /* 这个不太好通过nth-child通用匹配右边框，因为有跨列 */
                    
                    .bg-gray { background: #f0f0f0; }
                    .center { text-align: center; justify-content: center; }
                    .v-center { display: flex; align-items: center; }
                    .justify-around { justify-content: space-around; }
                    
                    .pdf-input {
                        width: 100%; border: none; outline: none; background: transparent;
                        font-family: inherit; font-size: inherit;
                    }
                    .no-padding { padding: 0; }
                    .hand-write { 
                        font-family: 'Brush Script MT', cursive; 
                        color: #1890ff; 
                        font-size: 18px; 
                    }
                    .text-gray { color: #ccc; }
                `}</style>
            </BaseModal>
        </PageLayout>
    );
};

export default NonConformingList;