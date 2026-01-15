/**
 * @file: src/features/Production/MaterialList.jsx
 * @description: 物料主数据管理
 * - [UI] 统一搜索栏和面包屑导航
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import QueryTable from '../../components/Common/QueryTable';
import SmartForm from '../../components/Common/SmartForm';
import BaseModal from '../../components/Common/BaseModal';
import './production.css';

const MaterialList = () => {
    // --- 状态 ---
    const [queryParams, setQueryParams] = useState({ keyword: '', type: '', status: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);

    // --- 模拟数据 ---
    const [dataList] = useState([
        { id: 'MAT-RM-001', code: 'PUR-PRE-A80', name: '聚氨酯预聚体-A80', type: '原材料', spec: '200kg/桶', unit: 'kg', warehouse: '化学品冷库', shelfLife: '90天', storage: '2-8℃ 避光', status: '启用' },
        { id: 'MAT-RM-002', code: 'CUR-AGENT-B', name: 'MOCA固化剂', type: '原材料', spec: '25kg/袋', unit: 'kg', warehouse: '化学品常温库', shelfLife: '180天', storage: '常温干燥', status: '启用' },
        { id: 'MAT-RM-003', code: 'PORE-FORMER-C', name: '高分子微球发泡剂', type: '原材料', spec: '5kg/瓶', unit: 'g', warehouse: '化学品常温库', shelfLife: '365天', storage: '防潮', status: '启用' },
        { id: 'MAT-SM-101', code: 'CAKE-IC1000', name: 'CMP抛光垫毛坯(固化后)', type: '半成品', spec: 'D800mm*T20mm', unit: '片', warehouse: '半成品周转区', shelfLife: '30天', storage: '恒温恒湿', status: '启用' },
        { id: 'MAT-FG-201', code: 'PAD-CMP-300', name: '12寸晶圆CMP抛光垫', type: '成品', spec: '300mm/开槽/背胶', unit: '片', warehouse: '成品立库', shelfLife: '365天', storage: 'Class 1000', status: '启用' },
        { id: 'MAT-FG-202', code: 'MSK-BLK-6025', name: '6025空白掩膜版', type: '成品', spec: '6*6*0.25英寸', unit: '片', warehouse: '百级洁净库', shelfLife: '365天', storage: 'Class 100', status: '试产' },
    ]);

    // --- 配置 ---
    const columns = [
        { title: '物料编码', dataIndex: 'code', width: 140, fixed: 'left', render: t => <b style={{color:'#1890ff', fontFamily:'monospace'}}>{t}</b> },
        { title: '物料名称', dataIndex: 'name', width: 200 },
        { title: '物料类型', dataIndex: 'type', width: 100,
            render: t => <span className={`q-tag ${t==='成品'?'success':(t==='原材料'?'primary':'warning')}`}>{t}</span>
        },
        { title: '规格型号', dataIndex: 'spec', width: 150 },
        { title: '基本单位', dataIndex: 'unit', width: 80, align: 'center' },
        { title: '存储条件', dataIndex: 'storage', width: 120, render: t => <span style={{fontSize:'12px', color:'#666'}}>{t}</span> },
        { title: '保质期', dataIndex: 'shelfLife', width: 90, align:'center' },
        { title: '默认仓库', dataIndex: 'warehouse', width: 120 },
        { title: '状态', dataIndex: 'status', width: 80, align: 'center',
            render: t => <span style={{color: t==='启用'?'#52c41a':'#faad14', fontWeight:'bold'}}>● {t}</span>
        },
        {
            title: '操作', key: 'op', fixed: 'right', width: 140,
            render: (_, r) => (
                <div style={{display:'flex', gap:'8px'}}>
                    <button className="small-btn outline" onClick={()=>handleEdit(r)}>编辑</button>
                    {r.type === '成品' && <button className="small-btn outline" style={{color:'#1890ff'}}>BOM</button>}
                </div>
            )
        }
    ];

    const handleEdit = (r) => { setCurrentRecord(r); setModalVisible(true); };
    const handleAdd = () => { setCurrentRecord({}); setModalVisible(true); };

    return (
        <PageLayout
            // 1. 搜索表单
            searchForm={
                <SmartForm
                    fields={[
                        { label: '关键词', name: 'keyword', placeholder: '编码/名称', span: 1 },
                        { label: '物料类型', name: 'type', type: 'select', options: ['原材料','半成品','成品','辅材'].map(v=>({label:v, value:v})), span: 1 },
                        { label: '状态', name: 'status', type: 'select', options: [{label:'启用',value:'启用'},{label:'停用',value:'停用'}], span: 1 }
                    ]}
                    data={queryParams}
                    onChange={(k, v) => setQueryParams({ ...queryParams, [k]: v })}
                    columns={4}
                />
            }
            // 2. 工具栏
            toolbar={
                <>
                    <div style={{fontWeight:'bold'}}>生产基础 &gt; 物料定义</div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button className="btn outline"><i className="ri-download-line"></i> 导入</button>
                        <button className="btn btn-primary" onClick={handleAdd}><i className="ri-add-line"></i> 新增物料</button>
                    </div>
                </>
            }
        >
            <QueryTable columns={columns} dataSource={dataList} pagination={{total:dataList.length, pageSize: 10}} />

            {/* 编辑弹窗 */}
            <BaseModal
                visible={modalVisible}
                title={currentRecord?.id ? "编辑物料信息" : "新增物料"}
                onClose={()=>setModalVisible(false)}
                width="800px"
            >
                <div className="form-grid-2">
                    <div className="form-item">
                        <label className="required">物料编码</label>
                        <input className="std-input" defaultValue={currentRecord?.code} placeholder="系统自动生成" disabled={!!currentRecord?.code} />
                    </div>
                    <div className="form-item">
                        <label className="required">物料名称</label>
                        <input className="std-input" defaultValue={currentRecord?.name} placeholder="请输入名称" />
                    </div>
                    <div className="form-item">
                        <label>规格型号</label>
                        <input className="std-input" defaultValue={currentRecord?.spec} />
                    </div>
                    <div className="form-item">
                        <label className="required">物料类型</label>
                        <select className="std-input" defaultValue={currentRecord?.type}>
                            <option>原材料</option><option>半成品</option><option>成品</option><option>辅材</option>
                        </select>
                    </div>

                    <div className="form-item">
                        <label>基本单位</label>
                        <select className="std-input" defaultValue={currentRecord?.unit}>
                            <option>kg</option><option>g</option><option>L</option><option>片</option><option>卷</option><option>箱</option>
                        </select>
                    </div>
                    <div className="form-item">
                        <label>默认仓库</label>
                        <select className="std-input" defaultValue={currentRecord?.warehouse}>
                            <option>化学品冷库</option><option>化学品常温库</option><option>半成品周转区</option><option>成品立库</option>
                        </select>
                    </div>
                </div>

                <div style={{borderTop:'1px solid #eee', margin:'10px 0'}}></div>
                <h4 style={{fontSize:'14px', margin:'10px 0', color:'#1890ff'}}>行业管控属性</h4>

                <div className="form-grid-3">
                    <div className="form-item">
                        <label>存储环境要求</label>
                        <select className="std-input" defaultValue={currentRecord?.storage}>
                            <option>常温干燥</option><option>冷藏(2-8℃)</option><option>避光防潮</option><option>Class 1000</option>
                        </select>
                    </div>
                    <div className="form-item">
                        <label>保质期 (天)</label>
                        <input className="std-input" defaultValue={currentRecord?.shelfLife?.replace('天','')} type="number" placeholder="如: 90" />
                    </div>
                    <div className="form-item">
                        <label>复检周期 (天)</label>
                        <input className="std-input" placeholder="保质期前多久复检" />
                    </div>
                </div>
            </BaseModal>
        </PageLayout>
    );
};

export default MaterialList;