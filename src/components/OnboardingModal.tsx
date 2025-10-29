import React, { useEffect, useRef, useState } from 'react'

type Template = {
  name: string
  emoji: string
  cadence: 'daily' | 'weekly' | 'weekdays'
  targetType: 'checkbox' | 'minutes' | 'count'
  targetValue?: number
}

const TEMPLATES: Template[] = [
  { name: 'Water', emoji: '💧', cadence: 'daily', targetType: 'count', targetValue: 8 },
  { name: 'Reading', emoji: '📖', cadence: 'daily', targetType: 'minutes', targetValue: 10 },
  { name: 'Walk', emoji: '🚶', cadence: 'daily', targetType: 'minutes', targetValue: 20 },
  { name: 'Meditate', emoji: '🧘', cadence: 'daily', targetType: 'minutes', targetValue: 10 },
  { name: 'Sleep by 11', emoji: '😴', cadence: 'weekdays', targetType: 'checkbox' },
  { name: 'Write', emoji: '✍️', cadence: 'daily', targetType: 'minutes', targetValue: 15 },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: {
    name: string
    icon?: string
    frequency?: 'daily' | 'weekly' | 'weekdays'
    targetType?: 'checkbox' | 'minutes' | 'count'
    targetValue?: number
    reminderNote?: string
    motivation?: string
  }) => Promise<void> | void
}

export default function OnboardingModal({ isOpen, onClose, onComplete }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'weekdays'>('daily')
  const [targetType, setTargetType] = useState<'checkbox' | 'minutes' | 'count'>('checkbox')
  const [targetValue, setTargetValue] = useState<number | undefined>(undefined)
  const [reminderNote, setReminderNote] = useState('')
  const [motivation, setMotivation] = useState('')

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => setVisible(true), 0)
    return () => { document.body.style.overflow = prev; clearTimeout(t); setVisible(false); setStep(1) }
  }, [isOpen])

  if (!isOpen) return null

  const applyTemplate = (tpl: Template) => {
    setName(tpl.name)
    setIcon(tpl.emoji)
    setFrequency(tpl.cadence)
    setTargetType(tpl.targetType)
    setTargetValue(tpl.targetValue)
    setStep(2)
  }

  const finish = async () => {
    await onComplete({ name: name.trim(), icon: icon || undefined, frequency, targetType, targetValue, reminderNote: reminderNote.trim() || undefined, motivation: motivation.trim() || undefined })
    onClose()
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div ref={dialogRef} className={`w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-lg transition transform duration-200 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Quick-start</h2>
              <p className="text-sm text-muted mb-4">Choose a template or start custom.</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {TEMPLATES.map(t => (
                  <button key={t.name} onClick={() => applyTemplate(t)} className="border border-border rounded-xl p-3 text-left hover:bg-background">
                    <div className="text-2xl" aria-hidden>{t.emoji}</div>
                    <div className="mt-1 font-medium">{t.name}</div>
                    <div className="text-xs text-muted">{t.cadence}</div>
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <div className="text-sm font-medium mb-1">Custom</div>
                <div className="grid grid-cols-3 gap-2">
                  <input placeholder="Name" className="input col-span-2" value={name} onChange={(e) => setName(e.target.value)} />
                  <input placeholder="Emoji" className="input" value={icon} onChange={(e) => setIcon(e.target.value)} />
                </div>
                <div className="mt-3 flex justify-end">
                  <button className="btn btn-primary" disabled={!name.trim()} onClick={() => setStep(2)}>Next</button>
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Cadence & Rules</h2>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button className={`btn ${frequency==='daily'?'btn-primary':'btn-secondary'}`} onClick={() => setFrequency('daily')}>Daily</button>
                <button className={`btn ${frequency==='weekly'?'btn-primary':'btn-secondary'}`} onClick={() => setFrequency('weekly')}>Weekly</button>
                <button className={`btn ${frequency==='weekdays'?'btn-primary':'btn-secondary'}`} onClick={() => setFrequency('weekdays')}>Weekdays</button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button className={`btn ${targetType==='checkbox'?'btn-primary':'btn-secondary'}`} onClick={() => setTargetType('checkbox')}>Check</button>
                <button className={`btn ${targetType==='minutes'?'btn-primary':'btn-secondary'}`} onClick={() => setTargetType('minutes')}>Minutes</button>
                <button className={`btn ${targetType==='count'?'btn-primary':'btn-secondary'}`} onClick={() => setTargetType('count')}>Count</button>
              </div>
              {(targetType==='minutes' || targetType==='count') && (
                <div className="mb-3">
                  <input type="number" className="input" placeholder="Target value" value={targetValue ?? ''} onChange={(e) => setTargetValue(Number(e.target.value))} />
                </div>
              )}
              <div className="mb-4">
                <input className="input" placeholder="Reminder (optional note)" value={reminderNote} onChange={(e) => setReminderNote(e.target.value)} />
              </div>
              <div className="flex justify-between">
                <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>Next</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Motivation</h2>
              <p className="text-sm text-muted mb-3">One line that nudges you later.</p>
              <input className="input mb-4" placeholder="Why this matters" value={motivation} onChange={(e) => setMotivation(e.target.value)} />
              <div className="flex justify-between">
                <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
                <button className="btn btn-primary" onClick={finish}>Finish</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

