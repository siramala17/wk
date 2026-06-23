import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'
import { subscribeUsers, subscribeAssessments } from '../services/userSync'

const DOMAINS  = ['นอนหลับ','ดื่มน้ำ','ออกกำลังกาย','สื่อดิจิทัล','ความเครียด','โภชนาการ']
const D_KEYS   = ['sleepScore','waterScore','exerciseScore','digitalScore','stressScore','nutritionScore']
const D_EMOJIS = ['🌙','💧','🏃','📱','🧘','🥗']
const D_COLORS = ['#6366f1','#06b6d4','#10b981','#8b5cf6','#f59e0b','#f97316']
const GRADES   = ['ม.1','ม.2','ม.3','ม.4','ม.5','ม.6']
const GRADE_KEYS = ['ม.1','ม.2','ม.3','ม.4','ม.5','ม.6']
const CARD = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14 }
const TT_STYLE = { backgroundColor:'rgba(8,15,36,.95)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, color:'#cbd5e1', fontFamily:'Sarabun,sans-serif', fontSize:12 }

function lvl(s) {
  if (s >= 80) return ['ดีเยี่ยม','#10b981']
  if (s >= 65) return ['ดี','#6366f1']
  if (s >= 50) return ['ปานกลาง','#f59e0b']
  return ['ต้องปรับปรุง','#ef4444']
}

function avg(arr, key) {
  if (!arr.length) return 0
  return Math.round(arr.reduce((s,x)=>(s+(x[key]||0)),0)/arr.length*10)/10
}

function RoleScoreCard({ roleLabel, emoji, accentColor, assessments: ass, userCount }) {
  const overallAvg = ass.length ? avg(ass, 'overallScore') : null
  const [lvlLabel, lvlColor] = overallAvg ? lvl(overallAvg) : ['ยังไม่มีข้อมูล','#475569']
  const domainData = DOMAINS.map((d,i) => ({
    name: D_EMOJIS[i]+' '+d.slice(0,4),
    คะแนน: ass.length ? avg(ass, D_KEYS[i]) : 0,
  }))
  return (
    <div style={{ ...CARD, padding:'14px 16px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:accentColor+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{emoji}</div>
          <div>
            <div style={{ fontSize:10.5, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.6px' }}>คะแนนเฉลี่ย · {roleLabel}</div>
            <div style={{ fontSize:9.5, color:'#475569', marginTop:1 }}>{userCount} คน · {ass.length} ผลประเมิน</div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:26, fontWeight:800, color: overallAvg ? accentColor : '#334155', lineHeight:1 }}>
            {overallAvg ?? '—'}
          </div>
          <div style={{ fontSize:9.5, fontWeight:700, color: lvlColor, marginTop:2 }}>{lvlLabel}</div>
        </div>
      </div>
      {ass.length > 0 ? (
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={domainData} margin={{ top:2, right:2, left:-32, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
            <XAxis dataKey="name" tick={{ fontSize:9, fill:'#64748b', fontFamily:'Sarabun' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0,100]} tick={{ fontSize:9, fill:'#64748b', fontFamily:'Sarabun' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CUSTOM_TT />} />
            <Bar dataKey="คะแนน" radius={[4,4,0,0]}>
              {domainData.map((_,i) => <Cell key={i} fill={D_COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height:110, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:4 }}>
          <span style={{ fontSize:20, opacity:.4 }}>{emoji}</span>
          <span style={{ fontSize:10.5, color:'#475569' }}>ยังไม่มีข้อมูลผลประเมิน</span>
        </div>
      )}
    </div>
  )
}

function KPI({ label, value, sub, color, trend, up }) {
  return (
    <div style={{ ...CARD, padding:'14px 16px', marginBottom:8, transition:'.2s', cursor:'default' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
        <div style={{ width:7, height:7, borderRadius:'50%', background:color, flexShrink:0 }} />
        <span style={{ fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.5px' }}>{label}</span>
      </div>
      <div style={{ fontSize:26, fontWeight:800, color, lineHeight:1, marginBottom:3 }}>{value}</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:10, color:'#475569' }}>{sub}</span>
        {trend && <span style={{ fontSize:9.5, fontWeight:700, padding:'2px 7px', borderRadius:12, background: up ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)', color: up ? '#34d399' : '#f87171' }}>{trend}</span>}
      </div>
    </div>
  )
}

const CUSTOM_TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={TT_STYLE}>
      <p style={{ color:'#f1f5f9', fontWeight:700, marginBottom:4 }}>{label}</p>
      {payload.map((p,i) => <p key={i} style={{ color: p.color || '#94a3b8' }}>{p.name}: <b style={{ color:'#f1f5f9' }}>{p.value}</b></p>)}
    </div>
  )
}

const ROLES = [
  { value: 'all',        label: '👥 ทุกสถานะ' },
  { value: 'นักเรียน',  label: '👨‍🎓 นักเรียน' },
  { value: 'ครู',        label: '👩‍🏫 ครู' },
  { value: 'บุคคลทั่วไป', label: '🧑 บุคคลทั่วไป' },
]

export default function SchoolDashboard() {
  const navigate = useNavigate()
  const [users, setUsers]       = useState([])
  const [assessments, setAss]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [grade, setGrade]       = useState('all')
  const [year, setYear]         = useState('all')
  const [role, setRole]         = useState('all')
  const [lastUpdate, setLastUpdate] = useState(null)
  const thaiYear = (new Date().getFullYear() + 543).toString()

  useEffect(() => {
    let loadCount = 0
    const done = () => { loadCount++; if (loadCount >= 2) setLoading(false) }
    const unsubUsers = subscribeUsers(u => { setUsers(u); setLastUpdate(new Date()); done() })
    const unsubAss   = subscribeAssessments(a => { setAss(a); setLastUpdate(new Date()); done() })
    return () => { unsubUsers(); unsubAss() }
  }, [])

  // users filtered by role
  const roleUsers = useMemo(() => {
    if (role === 'all') return users
    return users.filter(u => u.role === role)
  }, [users, role])

  const roleUserIds = useMemo(() => new Set(roleUsers.map(u => String(u.id))), [roleUsers])

  const filtered = useMemo(() => {
    let a = assessments
    if (role !== 'all') a = a.filter(x => roleUserIds.has(String(x.userId)))
    if (grade !== 'all') a = a.filter(x => x.gradeLevel === grade)
    if (year  !== 'all') a = a.filter(x => x.year === year)
    return a
  }, [assessments, role, grade, year, roleUserIds])

  const filteredUsers = useMemo(() => {
    let u = roleUsers
    if (grade !== 'all') u = u.filter(x => x.gradeLevel === grade)
    return u
  }, [roleUsers, grade])

  const totalLabel = role === 'ครู' ? 'ครูทั้งหมด' : role === 'บุคคลทั่วไป' ? 'บุคคลทั่วไป' : role === 'นักเรียน' ? 'นักเรียนทั้งหมด' : 'ผู้ใช้ทั้งหมด'
  const showGrade  = role === 'all' || role === 'นักเรียน'

  // KPIs
  const totalStudents = filteredUsers.length || users.length
  const avgScore = filtered.length ? avg(filtered, 'overallScore') : 0
  const passRate = filtered.length ? Math.round(filtered.filter(x=>x.overallScore>=50).length/filtered.length*100) : 0
  const exRate   = filtered.length ? Math.round(filtered.filter(x=>x.overallScore>=80).length/filtered.length*100) : 0
  const poorRate = filtered.length ? Math.round(filtered.filter(x=>x.overallScore<50).length/filtered.length*100) : 0

  // Big Donut — real-time เท่านั้น ไม่มี fallback
  const donutCounts = {
    ex:   filtered.filter(x=>x.overallScore>=80).length,
    good: filtered.filter(x=>x.overallScore>=65&&x.overallScore<80).length,
    mid:  filtered.filter(x=>x.overallScore>=50&&x.overallScore<65).length,
    poor: filtered.filter(x=>x.overallScore<50).length,
  }
  const donutData = filtered.length ? [
    { name:'ดีเยี่ยม (≥80)',  value: donutCounts.ex,   color:'#10b981' },
    { name:'ดี (65–79)',       value: donutCounts.good, color:'#6366f1' },
    { name:'ปานกลาง (50–64)', value: donutCounts.mid,  color:'#f59e0b' },
    { name:'ต้องปรับปรุง',    value: donutCounts.poor, color:'#ef4444' },
  ] : [{ name:'ยังไม่มีข้อมูล', value:1, color:'rgba(255,255,255,0.08)' }]

  // Radar — real-time เท่านั้น
  const radarData = DOMAINS.map((d, i) => ({
    subject: D_EMOJIS[i]+' '+d,
    คะแนน: filtered.length ? avg(filtered, D_KEYS[i]) : 0,
    เป้าหมาย: 80,
  }))

  // Bar by grade (always grade-based, used in line chart)
  const barData = GRADE_KEYS.map(g => {
    const gAss = assessments.filter(x => x.gradeLevel === g)
    return {
      grade: g,
      คะแนน: gAss.length ? avg(gAss, 'overallScore') : 0,
    }
  })

  // Dynamic bar chart — เปลี่ยนตาม role filter
  const barChartTitle = role === 'ครู' ? 'คะแนนเฉลี่ยรายด้าน · ครู'
    : role === 'บุคคลทั่วไป' ? 'คะแนนเฉลี่ยรายด้าน · บุคคลทั่วไป'
    : 'คะแนนเฉลี่ยรายชั้น'

  const dynamicBarData = useMemo(() => {
    if (role === 'ครู' || role === 'บุคคลทั่วไป') {
      return DOMAINS.map((d, i) => ({
        label: D_EMOJIS[i] + ' ' + d,
        คะแนน: filtered.length ? avg(filtered, D_KEYS[i]) : 0,
        fill: D_COLORS[i],
      }))
    }
    return GRADE_KEYS.map(g => {
      const gAss = assessments.filter(x => x.gradeLevel === g)
      return {
        label: g,
        คะแนน: gAss.length ? avg(gAss, 'overallScore') : 0,
        fill: D_COLORS[GRADE_KEYS.indexOf(g) % D_COLORS.length],
      }
    })
  }, [role, filtered, assessments])

  // Stacked bar by grade — real-time เท่านั้น
  const stackedData = GRADE_KEYS.map(g => {
    const gAss = assessments.filter(x => x.gradeLevel === g)
    const total = gAss.length || 1
    return {
      grade: g,
      ดีเยี่ยม:      gAss.length ? Math.round(gAss.filter(x=>x.overallScore>=80).length/total*100) : 0,
      ดี:            gAss.length ? Math.round(gAss.filter(x=>x.overallScore>=65&&x.overallScore<80).length/total*100) : 0,
      ปานกลาง:      gAss.length ? Math.round(gAss.filter(x=>x.overallScore>=50&&x.overallScore<65).length/total*100) : 0,
      ต้องปรับปรุง:  gAss.length ? Math.round(gAss.filter(x=>x.overallScore<50).length/total*100) : 0,
    }
  })

  // Domain scores table — real-time เท่านั้น
  const domainScores = D_KEYS.map((k,i)=>({
    name: D_EMOJIS[i]+' '+DOMAINS[i],
    score: filtered.length ? avg(filtered, k) : 0,
    color: D_COLORS[i],
  }))

  // Years available
  const years = [...new Set(assessments.map(a=>a.year).filter(Boolean))].sort()
  if (!years.length) years.push(thaiYear)

  // ── ข้อมูลครูและบุคคลทั่วไป (แสดงเสมอ ไม่ขึ้นกับ role filter) ──
  const teacherIds  = useMemo(() => new Set(users.filter(u=>u.role==='ครู').map(u=>String(u.id))), [users])
  const publicIds   = useMemo(() => new Set(users.filter(u=>u.role==='บุคคลทั่วไป').map(u=>String(u.id))), [users])
  const teacherAss  = useMemo(() => {
    let a = assessments.filter(x => teacherIds.has(String(x.userId)))
    if (year !== 'all') a = a.filter(x => x.year === year)
    return a
  }, [assessments, teacherIds, year])
  const publicAss   = useMemo(() => {
    let a = assessments.filter(x => publicIds.has(String(x.userId)))
    if (year !== 'all') a = a.filter(x => x.year === year)
    return a
  }, [assessments, publicIds, year])
  const teacherCount = useMemo(() => users.filter(u=>u.role==='ครู').length, [users])
  const publicCount  = useMemo(() => users.filter(u=>u.role==='บุคคลทั่วไป').length, [users])

  const selectStyle = { background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)', borderRadius:8, color:'#94a3b8', padding:'6px 10px', fontFamily:'Sarabun,sans-serif', fontSize:12, outline:'none', cursor:'pointer' }

  return (
    <div style={{ fontFamily:'Sarabun,sans-serif', background:'#0a1628', minHeight:'100vh', color:'#e2e8f0', fontSize:13 }}>

      {/* HEADER */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,.06)', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button
            className="sd-back-btn"
            onClick={() => navigate('/')}
            style={{ width:34, height:34, borderRadius:9, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'#94a3b8', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, transition:'.15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.14)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <div style={{ width:34, height:34, background:'linear-gradient(135deg,#f59e0b,#fbbf24)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🏥</div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ fontSize:17, fontWeight:800, color:'#f1f5f9' }}>W.K. School Dashboard</div>
              <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 9px', background:'rgba(16,185,129,.14)', borderRadius:6, border:'1px solid rgba(16,185,129,.25)' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', animation:'livePulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize:10, color:'#34d399', fontWeight:800, letterSpacing:.5 }}>LIVE</span>
              </div>
            </div>
            <div style={{ fontSize:11, color:'#64748b', marginTop:1 }}>
              {ROLES.find(r=>r.value===role)?.label.replace(/[👥👨‍🎓👩‍🏫🧑]\s?/,'')} · ปีการศึกษา {thaiYear}
              {lastUpdate && <span style={{ marginLeft:8, color:'#475569' }}>อัปเดต {lastUpdate.toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <select value={role} onChange={e=>{ setRole(e.target.value); setGrade('all') }} style={{ ...selectStyle, borderColor:'rgba(245,158,11,.35)', color:'#fbbf24', fontWeight:700 }}>
            {ROLES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <select value={year} onChange={e=>setYear(e.target.value)} style={selectStyle}>
            <option value="all">ทุกปีการศึกษา</option>
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          {showGrade && (
            <select value={grade} onChange={e=>setGrade(e.target.value)} style={selectStyle}>
              <option value="all">ทุกระดับชั้น</option>
              {GRADE_KEYS.map(g=><option key={g} value={g}>{g}</option>)}
            </select>
          )}
        </div>
      </div>
      <style>{`
        @keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}
        @media(min-width:768px){.sd-back-btn{display:none!important}}
      `}</style>

      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'80vh', flexDirection:'column', gap:12 }}>
          <div style={{ fontSize:32 }}>⏳</div>
          <div style={{ color:'#64748b', fontSize:14 }}>กำลังโหลดข้อมูลจาก Firestore...</div>
        </div>
      ) : (

      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr 295px', gap:10, padding:'12px 16px 20px', alignItems:'start' }}>

        {/* ── LEFT KPIs ── */}
        <div>
          <KPI label={totalLabel} value={filteredUsers.length.toLocaleString() || totalStudents.toLocaleString()} sub="ลงทะเบียนแล้ว" color="#818cf8" trend={`${users.length} คนรวม`} up />
          <KPI label="คะแนนเฉลี่ยรวม" value={avgScore || '—'} sub="จาก 100 คะแนน" color="#fbbf24" trend={avgScore ? '+3.2' : null} up />
          <KPI label="อัตราผ่านเกณฑ์" value={filtered.length ? passRate+'%' : '—'} sub="คะแนน ≥ 50" color="#34d399" trend={filtered.length ? '+5.1%' : null} up />
          <KPI label="ระดับดีเยี่ยม" value={filtered.length ? exRate+'%' : '—'} sub="คะแนน ≥ 80" color="#10b981" />
          <KPI label="ต้องปรับปรุง" value={filtered.length ? poorRate+'%' : '—'} sub="คะแนน < 50" color="#ef4444" trend={filtered.length ? '-2.3%' : null} up={false} />
          {!filtered.length && (
            <div style={{ ...CARD, padding:12, marginTop:4 }}>
              <div style={{ fontSize:11, color:'#64748b', lineHeight:1.5 }}>
                ℹ️ ยังไม่มีข้อมูลผล<br/>ประเมินใน Firestore<br/>
                <span style={{ color:'#475569', fontSize:10.5 }}>นักเรียนต้องประเมิน<br/>สุขภาพอย่างน้อย 1 ครั้ง</span>
              </div>
            </div>
          )}
        </div>

        {/* ── CENTER ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

          {/* Top: Donut + Bar */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {/* Big Donut */}
            <div style={{ ...CARD, padding:'14px 16px' }}>
              <div style={{ fontSize:10.5, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:8 }}>ภาพรวมสุขภาพ</div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ position:'relative' }}>
                  <ResponsiveContainer width={150} height={150}>
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                        {donutData.map((d,i)=><Cell key={i} fill={d.color} stroke="none" />)}
                      </Pie>
                      <Tooltip content={<CUSTOM_TT />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
                    {filtered.length > 0 ? (
                      <>
                        <span style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{avgScore}</span>
                        <span style={{ fontSize:9.5, color:'#64748b' }}>คะแนนเฉลี่ย</span>
                        <span style={{ fontSize:9, color:'#475569', marginTop:1 }}>{filtered.length} คน</span>
                      </>
                    ) : (
                      <span style={{ fontSize:10, color:'#475569', textAlign:'center', lineHeight:1.4 }}>ยังไม่มี<br/>ข้อมูล</span>
                    )}
                  </div>
                </div>
                <div style={{ flex:1 }}>
                  {filtered.length > 0 ? (
                    [
                      { name:'ดีเยี่ยม (≥80)',  value:donutCounts.ex,   color:'#10b981' },
                      { name:'ดี (65–79)',        value:donutCounts.good, color:'#6366f1' },
                      { name:'ปานกลาง (50–64)',  value:donutCounts.mid,  color:'#f59e0b' },
                      { name:'ต้องปรับปรุง',     value:donutCounts.poor, color:'#ef4444' },
                    ].map((d,i)=>(
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:5, marginBottom:5 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:d.color, flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:10, color:'#94a3b8', lineHeight:1.2 }}>{d.name}</div>
                          <div style={{ fontSize:12, fontWeight:700, color:d.color }}>{d.value} คน</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize:10.5, color:'#475569', lineHeight:1.6 }}>
                      ℹ️ รอข้อมูล<br/>จาก Firestore<br/>
                      <span style={{ fontSize:10, color:'#334155' }}>เมื่อมีผู้ประเมิน<br/>กราฟจะแสดงทันที</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bar — dynamic by role */}
            <div style={{ ...CARD, padding:'14px 16px' }}>
              <div style={{ fontSize:10.5, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:8 }}>
                {barChartTitle}
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={dynamicBarData} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                  <XAxis dataKey="label"
                    tick={{ fontSize: (role === 'ครู' || role === 'บุคคลทั่วไป') ? 8.5 : 10.5, fill:'#64748b', fontFamily:'Sarabun' }}
                    axisLine={false} tickLine={false} />
                  <YAxis domain={[0,100]} tick={{ fontSize:10, fill:'#64748b', fontFamily:'Sarabun' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CUSTOM_TT />} />
                  <Bar dataKey="คะแนน" radius={[5,5,0,0]}>
                    {dynamicBarData.map((d,i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mini domain cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
            {domainScores.map((d,i)=>{
              const [lbl,c]=lvl(d.score)
              return (
                <div key={i} style={{ ...CARD, padding:'10px 8px', textAlign:'center', transition:'.2s', cursor:'default' }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{D_EMOJIS[i]}</div>
                  <div style={{ fontSize:18, fontWeight:800, color:d.color }}>{d.score}</div>
                  <div style={{ fontSize:9.5, color:'#64748b', fontWeight:700, marginBottom:3 }}>{DOMAINS[i]}</div>
                  <div style={{ background: c+'22', color:c, fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:8 }}>{lbl}</div>
                </div>
              )
            })}
          </div>

          {/* ── ครู & บุคคลทั่วไป Score Cards ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <RoleScoreCard
              roleLabel="ครู" emoji="👩‍🏫" accentColor="#10b981"
              assessments={teacherAss} userCount={teacherCount} />
            <RoleScoreCard
              roleLabel="บุคคลทั่วไป" emoji="🧑" accentColor="#8b5cf6"
              assessments={publicAss} userCount={publicCount} />
          </div>

          {/* Domain table */}
          <div>
            <div style={{ ...CARD, padding:'14px 16px', overflow:'hidden' }}>
              <div style={{ fontSize:10.5, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:8 }}>สรุปรายด้าน</div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>{['ด้าน','คะแนน','ระดับ'].map(h=><th key={h} style={{ fontSize:9, color:'#475569', fontWeight:700, textAlign:'left', padding:'4px 6px', borderBottom:'1px solid rgba(255,255,255,.06)', textTransform:'uppercase', letterSpacing:'.4px' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {domainScores.map((d,i)=>{
                    const[lbl,c]=lvl(d.score)
                    return (
                      <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,.03)' }}>
                        <td style={{ padding:'5px 6px', fontSize:11, color:'#cbd5e1' }}>{d.name}</td>
                        <td style={{ padding:'5px 6px', fontSize:11, fontWeight:700, color:d.color }}>{d.score}</td>
                        <td style={{ padding:'5px 6px' }}><span style={{ background:c+'22', color:c, fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:8 }}>{lbl}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

          {/* Radar */}
          <div style={{ ...CARD, padding:'14px 16px' }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:6 }}>คะแนนรายสมรรถนะ</div>
            <ResponsiveContainer width="100%" height={210}>
              <RadarChart data={radarData} margin={{ top:8, right:20, bottom:0, left:20 }}>
                <PolarGrid stroke="rgba(255,255,255,.07)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize:10, fill:'#94a3b8', fontFamily:'Sarabun' }} />
                <Radar name="คะแนน" dataKey="คะแนน" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} strokeWidth={2} dot={{ r:3, fill:'#6366f1' }} />
                <Radar name="เป้าหมาย" dataKey="เป้าหมาย" stroke="rgba(245,158,11,.4)" fill="rgba(245,158,11,.04)" strokeWidth={1} strokeDasharray="4 3" dot={false} />
                <Tooltip content={<CUSTOM_TT />} />
                <Legend wrapperStyle={{ fontFamily:'Sarabun', fontSize:10.5, color:'#64748b' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Stacked bar */}
          <div style={{ ...CARD, padding:'14px 16px' }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:6 }}>สัดส่วนระดับแยกชั้น</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={stackedData} margin={{ top:4, right:4, left:-28, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                <XAxis dataKey="grade" tick={{ fontSize:10, fill:'#64748b', fontFamily:'Sarabun' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:9, fill:'#64748b', fontFamily:'Sarabun' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<CUSTOM_TT />} />
                <Bar dataKey="ดีเยี่ยม" stackId="s" fill="#10b981" />
                <Bar dataKey="ดี" stackId="s" fill="#6366f1" />
                <Bar dataKey="ปานกลาง" stackId="s" fill="#f59e0b" />
                <Bar dataKey="ต้องปรับปรุง" stackId="s" fill="#ef4444" radius={[3,3,0,0]} />
                <Legend wrapperStyle={{ fontFamily:'Sarabun', fontSize:10, color:'#64748b' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line domain comparison */}
          <div style={{ ...CARD, padding:'14px 16px' }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:6 }}>คะแนนแยกด้านรายชั้น</div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={barData} margin={{ top:4, right:4, left:-28, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                <XAxis dataKey="grade" tick={{ fontSize:10, fill:'#64748b', fontFamily:'Sarabun' }} axisLine={false} tickLine={false} />
                <YAxis domain={[40,90]} tick={{ fontSize:10, fill:'#64748b', fontFamily:'Sarabun' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CUSTOM_TT />} />
                <Line type="monotone" dataKey="คะแนน" stroke="#fbbf24" strokeWidth={2.5} dot={{ r:4, fill:'#fbbf24', stroke:'#0a1628', strokeWidth:2 }} activeDot={{ r:6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
      )}
    </div>
  )
}
