/**
 * @file: src/features/QMES/NonConformingList.jsx
 * @version: v2.1.0
 * @description: 不合格品处置单管理 (HC/R-23-1-01)
 * - [UI Fix] 2026-01-14: 优化表格外框样式，实现全封闭 2px 边框包裹。
 * - [Feature] 2026-01-14: 增加关联单据结案状态检查。当状态为 'closed' 且 isRelated='是' 时，底部显示关联结案链接，点击可弹出关联详情。
 * @author: AI Copilot
 * @lastModified: 2026-01-14 12:45:00
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import BaseModal from '../../components/Common/BaseModal';
import SmartForm from '../../components/Common/SmartForm';

const NonConformingList = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [relatedModalVisible, setRelatedModalVisible] = useState(false); // 关联单据弹窗状态
    const [currentRecord, setCurrentRecord] = useState({});

    // --- 模拟数据 (Update: 增加关联结案场景) ---
    const mockData = [
        { id: 'NCR-2026-055', name: 'HC-OCA-50u', qty: '500m', step: '涂布', reason: '晶点超标', status: 'reviewing', isRelated: '否' },
        { id: 'NCR-2026-056', name: 'PET基膜', qty: '20卷', step: 'IQC', reason: '厚度不均', status: 'closed', isRelated: '是', relatedId: 'ABN-2026-009' },
    ];

    const columns = [
        { title: '单号', dataIndex: 'id', width: 120, fixed: 'left' },
        { title: '品名', dataIndex: 'name', width: 120 },
        { title: '发生工序', dataIndex: 'step', width: 80 },
        { title: '不合格数量', dataIndex: 'qty', width: 100 },
        { title: '不良描述', dataIndex: 'reason', width: 200 },
        { title: '状态', dataIndex: 'status', width: 100, render: v => v === 'closed' ? <span className="q-tag success">已结单</span> : <span className="q-tag processing">会签中</span> },
        { title: '关联产品', dataIndex: 'isRelated', width: 80, render: v => v === '是' ? <span style={{color:'#faad14', fontWeight:'bold'}}>是</span> : '否' },
        { title: '操作', key: 'op', fixed: 'right', width: 100, render: (_, r) => <button className="small-btn outline" onClick={() => handleEdit(r)} style={{ color: '#1890ff' }}>{r.status==='closed'?'查看':'评审'}</button> }
    ];

    const handleEdit = (r) => {
        setCurrentRecord(r || {});
        setModalVisible(true);
    };

    // --- PDF 样式辅助组件 ---
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

            {/* 主要处置单弹窗 */}
            <BaseModal visible={modalVisible} title="不合格品处置单" width="950px" onClose={() => setModalVisible(false)} onOk={() => setModalVisible(false)}>
                <div className="pdf-container">
                    <div style={{ textAlign: 'center', position: 'relative', marginBottom: '15px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px' }}>不合格品处置单</div>
                        <div style={{ position: 'absolute', right: 0, top: 0, fontSize: '12px', textAlign: 'left' }}>
                            <div>编号: <span style={{ textDecoration: 'underline' }}>{currentRecord.id || 'HC/R-23-1-01'}</span></div>
                            <div>版本版次号: A4</div>
                        </div>
                    </div>

                    <div className="pdf-grid-ncr">
                        {/* 1. 基础信息 */}
                        <Cell className="bg-gray center v-center">类型</Cell>
                        <Cell className="v-center"><CheckBox label="半成品" /> <CheckBox label="成品" /></Cell>
                        <Cell className="bg-gray center v-center">发生日期</Cell>
                        <Cell><Input /></Cell>
                        <Cell className="bg-gray center v-center">品名</Cell>
                        <Cell><Input value={currentRecord.name}/></Cell>
                        <Cell className="bg-gray center v-center">数量</Cell>
                        <Cell><Input value={currentRecord.qty}/></Cell>

                        <Cell className="bg-gray center v-center">发生工序</Cell>
                        <Cell><Input value={currentRecord.step}/></Cell>
                        <Cell className="bg-gray center v-center">规格</Cell>
                        <Cell><Input /></Cell>
                        <Cell className="bg-gray center v-center">批号</Cell>
                        <Cell span={3}><Input /></Cell>

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
                                </div>
                            </div>
                        </Cell>

                        {/* ... 等级与责任单位 (省略重复代码以聚焦核心修改) ... */}
                        <Cell className="bg-gray center v-center">不合格等级</Cell>
                        <Cell span={7} className="v-center"><CheckBox label="轻微" /> <CheckBox label="一般" /> <CheckBox label="严重" /></Cell>
                        <Cell className="bg-gray center v-center">责任单位</Cell>
                        <Cell span={7} className="v-center"><CheckBox label="生产部" /> <CheckBox label="品质部" /></Cell>

                        {/* ... 评审会签区域 (保持原样) ... */}
                        <Cell className="bg-gray center v-center" style={{gridRow:'span 5', writingMode: 'vertical-rl', letterSpacing:'5px'}}>评审会签</Cell>
                        <Cell className="bg-gray center">部门</Cell>
                        <Cell className="bg-gray center" span={3}>意见 (勾选)</Cell>
                        <Cell className="bg-gray center" span={3}>签字 / 日期</Cell>

                        {/* 示例：研发部 */}
                        <Cell className="center v-center">研发部</Cell>
                        <Cell span={3} className="v-center justify-around"><CheckBox label="返工" /> <CheckBox label="报废" /></Cell>
                        <Cell span={3} className="center v-center hand-write">Jim / 1.14</Cell>
                        {/* (省略其他部门行...) */}
                        <Cell className="center v-center">生产部</Cell>
                        <Cell span={3} className="v-center justify-around"><CheckBox label="返工" /></Cell>
                        <Cell span={3} className="center v-center"></Cell>
                        <Cell className="center v-center">品质部</Cell>
                        <Cell span={3} className="v-center justify-around"><CheckBox label="返工" /></Cell>
                        <Cell span={3} className="center v-center"></Cell>
                        <Cell className="center v-center">工艺部</Cell>
                        <Cell span={3} className="v-center justify-around"><CheckBox label="返工" /></Cell>
                        <Cell span={3} className="center v-center"></Cell>

                        {/* --- 最终结论与关联结案 --- */}
                        <Cell className="bg-gray center v-center" style={{gridRow:'span 2', writingMode: 'vertical-rl'}}>最终结论</Cell>
                        <Cell className="center v-center">总监/总经理</Cell>
                        <Cell span={3} className="v-center justify-around"><CheckBox label="报废" /> <CheckBox label="特采" /></Cell>
                        <Cell span={3} className="center v-center text-gray">签字 / 日期</Cell>

                        {/* [New Feature] 关联单据状态显示区 */}
                        {currentRecord.status === 'closed' && currentRecord.isRelated === '是' && (
                            <>
                                <Cell className="center v-center bg-gray" style={{fontWeight:'bold', color:'#1890ff'}}>关联结案</Cell>
                                <Cell span={6} className="v-center" style={{justifyContent:'space-between', padding:'0 20px'}}>
                                    <span>
                                        <i className="ri-link-m"></i> 关联异常单:
                                        <b style={{marginLeft:'5px'}}>{currentRecord.relatedId}</b>
                                    </span>
                                    <span className="q-tag success">已同步结案</span>
                                    <button
                                        className="small-btn outline"
                                        onClick={() => setRelatedModalVisible(true)}
                                        style={{cursor:'pointer', border:'1px solid #1890ff', color:'#1890ff', padding:'2px 8px', borderRadius:'4px'}}
                                    >
                                        查看详情 <i className="ri-external-link-line"></i>
                                    </button>
                                </Cell>
                            </>
                        )}
                        {/* 如果未结案或不关联，用空行填充保持表格完整性 (Optional) */}
                        {!(currentRecord.status === 'closed' && currentRecord.isRelated === '是') && (
                            <>
                                <Cell className="center v-center">备注</Cell>
                                <Cell span={6}></Cell>
                            </>
                        )}
                    </div>

                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginTop:'10px'}}>
                        <div>注: 关联单据需同步结案</div>
                        <div>保管期限: 10年</div>
                    </div>
                </div>

                <style>{`
                    .pdf-container { font-family: "SimSun", serif; color: #000; padding: 10px; }
                    .pdf-grid-ncr {
                        display: grid;
                        grid-template-columns: 40px 80px 1fr 80px 1fr 80px 1fr 1fr;
                        /* [Fix] 外框全包裹: 使用 border 代替原来的 top/left border */
                        border: 2px solid #000;
                        /* 防止内部边框重叠，可略微调整 gap 或 margin，这里使用负 margin 技术或依赖 collapse */
                    }
                    .pdf-cell {
                        border-right: 1px solid #000;
                        border-bottom: 1px solid #000;
                        padding: 4px; font-size: 13px; background: #fff;
                    }
                    /* [Fix] 移除最右侧和最底部的边框，依靠容器的 2px 边框 (Visual Trick) */
                    /* 或者保持内部 1px，外部 2px 覆盖。简单做法是让容器 border 包住所有 */
                    
                    .bg-gray { background: #f0f0f0; }
                    .center { text-align: center; justify-content: center; }
                    .v-center { display: flex; align-items: center; }
                    .justify-around { justify-content: space-around; }
                    .pdf-input { width: 100%; border: none; outline: none; background: transparent; }
                    .no-padding { padding: 0; }
                    .hand-write { font-family: 'Brush Script MT', cursive; color: #1890ff; font-size: 18px; }
                    .text-gray { color: #ccc; }
                `}</style>
            </BaseModal>

            {/* [New] 关联单据详情弹窗 (模拟) */}
            <BaseModal
                visible={relatedModalVisible}
                title={`关联异常单详情: ${currentRecord.relatedId}`}
                width="800px"
                onClose={() => setRelatedModalVisible(false)}
                footer={null} // 只读模式，无底部按钮
            >
                <div style={{padding:'20px', textAlign:'center'}}>
                    <div className="q-tag success" style={{marginBottom:'20px', fontSize:'16px'}}>状态: 已结案</div>
                    <p>此处加载异常单 {currentRecord.relatedId} 的只读详情...</p>
                    <p style={{color:'#999'}}>(这是一个模拟的嵌套表单视图)</p>
                </div>
            </BaseModal>
        </PageLayout>
    );
};

export default NonConformingList;