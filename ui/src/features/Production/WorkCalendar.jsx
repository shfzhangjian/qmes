/**
 * @file: src/features/Production/WorkCalendar.jsx
 * @description: 生产日历与班次定义
 * - [UI] 统一面包屑导航
 */
import React, { useState } from 'react';
import PageLayout from '../../components/Common/PageLayout';
import './production.css';

const WorkCalendar = () => {
    // --- 模拟状态 ---
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(1);
    const [shifts] = useState([
        { id: 'S1', name: '白班 (Day)', time: '08:00 - 20:00', type: 'D' },
        { id: 'S2', name: '夜班 (Night)', time: '20:00 - 08:00 (+1)', type: 'N' }
    ]);

    // 生成日历数据 (简单的 1月 模拟)
    const days = Array.from({length: 31}, (_, i) => {
        const d = i + 1;
        const date = new Date(year, month - 1, d);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        return {
            date: d,
            isWeekend,
            shifts: isWeekend ? [] : ['D', 'N'] // 周末休息，工作日两班倒
        };
    });

    // 补齐前面空白
    const blanks = Array.from({length: 4}, (_, i) => null);
    const calendarCells = [...blanks, ...days];

    return (
        <PageLayout
            // 工具栏：因为日历界面没有搜索表单，所以这里工具栏承担了筛选年份的功能
            toolbar={
                <>
                    <div style={{fontWeight:'bold'}}>生产基础 &gt; 生产日历</div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <select className="std-input" style={{width:'100px'}} value={year} onChange={e=>setYear(e.target.value)}>
                            <option>2026</option><option>2025</option>
                        </select>
                        <select className="std-input" style={{width:'80px'}} value={month} onChange={e=>setMonth(e.target.value)}>
                            <option value="1">1月</option><option value="2">2月</option>
                        </select>
                        <button className="btn outline">班次定义</button>
                        <button className="btn btn-primary">应用排班规则</button>
                    </div>
                </>
            }
        >
            <div style={{display:'flex', height:'100%', gap:'20px', padding:'20px', overflow:'hidden'}}>
                {/* 左侧：班次列表 */}
                <div style={{width:'250px', background:'#fff', border:'1px solid #eee', borderRadius:'4px', padding:'15px'}}>
                    <h4 style={{marginTop:0, marginBottom:'15px'}}>班次定义 (Shift Models)</h4>
                    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                        {shifts.map(s => (
                            <div key={s.id} style={{border:'1px solid #eee', padding:'10px', borderRadius:'4px', borderLeft:`4px solid ${s.type==='D'?'#faad14':'#1890ff'}`}}>
                                <div style={{fontWeight:'bold'}}>{s.name}</div>
                                <div style={{fontSize:'12px', color:'#666', marginTop:'4px'}}><i className="ri-time-line"></i> {s.time}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{marginTop:'20px', paddingTop:'10px', borderTop:'1px dashed #eee'}}>
                        <div style={{fontSize:'12px', color:'#999'}}>* 拖拽班次到右侧日历可单独调整</div>
                    </div>
                </div>

                {/* 右侧：日历网格 */}
                <div style={{flex:1, display:'flex', flexDirection:'column'}}>
                    <div className="calendar-grid">
                        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                            <div key={d} className="calendar-cell header">{d}</div>
                        ))}
                        {calendarCells.map((day, i) => (
                            <div key={i} className="calendar-cell" style={{background: day && day.isWeekend ? '#fafafa' : '#fff'}}>
                                {day && (
                                    <>
                                        <div style={{fontWeight:'bold', color: day.isWeekend?'#ff4d4f':'#333'}}>{day.date}</div>
                                        <div style={{flex:1, display:'flex', flexDirection:'column', gap:'2px'}}>
                                            {day.shifts.map(s => (
                                                <div key={s} className={`shift-item shift-${s}`}>
                                                    {s==='D'?'白班 (08-20)':'夜班 (20-08)'}
                                                </div>
                                            ))}
                                            {day.shifts.length === 0 && <div style={{fontSize:'11px', color:'#ccc', marginTop:'10px', textAlign:'center'}}>休息</div>}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default WorkCalendar;