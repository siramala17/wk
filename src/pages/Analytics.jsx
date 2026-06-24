import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lightbulb, CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles, Brain } from 'lucide-react'
import { useHealth } from '../context/HealthContext'
import { useLang } from '../context/LangContext'
import { generateRecommendations, getHealthLevel } from '../utils/healthScore'


function AiInsightBanner({ assessment, t }) {
  const a = t.analytics
  const level = getHealthLevel(assessment.overallScore)
  const weakAreas = [
    assessment.sleepScore     < 65 && a.weakAreas.sleep,
    assessment.digitalScore   < 65 && a.weakAreas.screen,
    assessment.stressScore    < 65 && a.weakAreas.stress,
    assessment.exerciseScore  < 65 && a.weakAreas.exercise,
    assessment.waterScore     < 65 && a.weakAreas.water,
    assessment.nutritionScore < 65 && a.weakAreas.nutrition,
  ].filter(Boolean)

  return (
    <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-3xl p-5 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center">
            <Sparkles size={16} className="text-yellow-900" />
          </div>
          <div>
            <p className="text-indigo-200 text-xs">AI Health Analysis</p>
            <p className="font-bold text-sm">{a.aiTitle}</p>
          </div>
        </div>
        <p className="text-indigo-100 text-sm leading-relaxed">
          {level.emoji} {a.overallAt} <strong className="text-white">{level.label}</strong>
          {weakAreas.length > 0 && (
            <> {a.improveAt} <strong className="text-yellow-300">{weakAreas.join(', ')}</strong></>
          )}
          {weakAreas.length === 0 && <> {a.allGood}</>}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${assessment.overallScore}%` }} />
          </div>
          <span className="text-sm font-bold text-yellow-300">{assessment.overallScore}/100</span>
        </div>
      </div>
    </div>
  )
}

function RecCard({ rec, completedTips, toggleTip, t }) {
  const a = t.analytics
  const [expanded, setExpanded] = useState(true)
  const done  = rec.tips.filter(tip => completedTips.includes(tip.id)).length
  const total = rec.tips.length

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-indigo-50 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full px-4 py-4 flex items-center gap-3 text-left hover:bg-indigo-50/50 transition-colors">
        <span className="text-2xl">{rec.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">{rec.category}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${rec.priorityColor}`}>{rec.priority}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{done}/{total} {a.doneLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(done / total) * 100}%` }} />
          </div>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-indigo-50">
          <div className="bg-indigo-50 rounded-xl p-3 my-3">
            <div className="flex items-start gap-2">
              <Brain size={14} className="text-indigo-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-indigo-700 leading-relaxed">{rec.aiInsight}</p>
            </div>
          </div>
          <div className="space-y-2">
            {rec.tips.map(tip => {
              const isDone = completedTips.includes(tip.id)
              return (
                <button key={tip.id} onClick={() => toggleTip(tip.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                    isDone ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 hover:bg-indigo-50 border border-transparent'
                  }`}
                >
                  {isDone
                    ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <Circle size={18} className="text-slate-300 flex-shrink-0 mt-0.5" />
                  }
                  <span className={`text-sm leading-relaxed ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {tip.text}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function RecommendationsContent({ latestAssessment, completedTips, toggleTip, t }) {
  const a = t.analytics
  if (!latestAssessment) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-10 text-center">
        <p className="text-6xl mb-4">🤔</p>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{a.noData}</h2>
        <p className="text-sm text-slate-500 mb-6">{a.noDataSub}</p>
        <Link to="/assessment" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors">
          {a.startAssess}
        </Link>
      </div>
    )
  }

  const recs = generateRecommendations(latestAssessment)
  const completedCount = completedTips.length
  const totalTips = recs.reduce((s, r) => s + r.tips.length, 0)

  return (
    <div className="space-y-4">
      <AiInsightBanner assessment={latestAssessment} t={t} />

      {totalTips > 0 && (
        <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-indigo-50">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700">{a.progress}</p>
            <p className="text-xs text-slate-400">{completedCount} {a.of} {totalTips} {a.recs}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-indigo-700">{Math.round((completedCount / totalTips) * 100)}%</p>
          </div>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden self-center">
            <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${(completedCount / totalTips) * 100}%` }} />
          </div>
        </div>
      )}

      {recs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-6xl mb-4">🌟</p>
          <h2 className="text-xl font-bold text-slate-800 mb-2">{a.excellent}</h2>
          <p className="text-sm text-slate-500 mb-4">{a.excellentSub}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recs.map(rec => (
            <RecCard key={rec.id} rec={rec} completedTips={completedTips} toggleTip={toggleTip} t={t} />
          ))}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
        <p className="text-sm font-bold text-yellow-800 mb-3">{a.tipsTitle}</p>
        <div className="space-y-2">
          {a.generalTips.map(tip => (
            <p key={tip} className="text-xs text-yellow-700 leading-relaxed">{tip}</p>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link to="/assessment" className="text-sm text-indigo-600 font-medium hover:underline">
          {a.reassess}
        </Link>
      </div>
    </div>
  )
}

export default function Analytics() {
  const { latestAssessment, completedTips, toggleTip } = useHealth()
  const { t } = useLang()
  const a = t.analytics

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
          <Lightbulb size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{a.tabAI}</h1>
          <p className="text-xs text-slate-500">{a.subtitle}</p>
        </div>
      </div>

      <RecommendationsContent
        latestAssessment={latestAssessment}
        completedTips={completedTips}
        toggleTip={toggleTip}
        t={t}
      />
    </div>
  )
}
