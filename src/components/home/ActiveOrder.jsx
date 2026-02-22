import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  { key: 'accepted', label: 'Принята',  icon: '✓' },
  { key: 'on_way',   label: 'В пути',   icon: '🚗' },
  { key: 'arrived',  label: 'Прибыла',  icon: '📍' },
  { key: 'working',  label: 'Работает', icon: '💉' },
]
const STEP_INDEX = { accepted: 0, on_way: 1, arrived: 2, working: 3 }

export default function ActiveOrder({ order, onClose }) {
  const [liveEta, setLiveEta] = useState(order.eta)
  useEffect(() => { setLiveEta(order.eta) }, [order.eta])

  const isPending = order.status === 'pending'
  const stepIdx = isPending ? -1 : (STEP_INDEX[order.status] ?? 0)
  const nurseColor = '#8B5CF6'
  const nurseAvatar = order.nurse?.name?.[0] || '👩'

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${isPending ? 'rgba(245,158,11,0.35)' : 'rgba(59,130,246,0.3)'}`,
        borderRadius: 22, padding: 20, marginBottom: 20,
        position: 'relative', overflow: 'hidden',
        boxShadow: isPending ? '0 8px 32px rgba(245,158,11,0.1)' : '0 8px 32px rgba(37,99,235,0.15)',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(135deg, rgba(37,99,235,0.06) 0%, transparent 60%)' }} />

      {/* Пульс */}
      <div style={{ position: 'absolute', top: 20, right: 52 }}>
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 8, height: 8, borderRadius: '50%', background: isPending ? '#F59E0B' : '#10B981', boxShadow: `0 0 10px ${isPending ? '#F59E0B' : '#10B981'}` }}
        />
      </div>

      {/* Закрыть */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 16,
        background: 'rgba(255,255,255,0.06)', border: 'none',
        borderRadius: 8, width: 28, height: 28, color: 'rgba(255,255,255,0.3)',
        cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>

      {/* ── СТАТУС: ИЩЕМ МЕДСЕСТРУ ── */}
      {isPending ? (
        <div>
          <span style={{ color: '#F59E0B', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>
            ● Поиск медсестры
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            {/* Спиннер-аватар */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 46, height: 46, borderRadius: '50%',
                  border: '3px solid rgba(245,158,11,0.15)',
                  borderTopColor: '#F59E0B',
                  position: 'absolute', inset: 0,
                }}
              />
              <div style={{
                width: 46, height: 46, borderRadius: '50%',
                background: 'rgba(245,158,11,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>👩‍⚕️</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 15, marginBottom: 3 }}>
                Ищем ближайшую медсестру...
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                {order.service?.name || order.service?.title}
              </div>
            </div>
          </div>
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ fontSize: 13, color: '#F59E0B' }}
            >
              ⏳
            </motion.div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              Уведомляем медсестёр поблизости. Обычно &lt; 1 минуты
            </span>
          </div>
        </div>
      ) : (
        /* ── СТАТУС: ПРИНЯТА И ДАЛЕЕ ── */
        <div>
          <span style={{ color: '#34D399', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
            ● Активный заказ
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingRight: 40 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14, flexShrink: 0,
              background: `linear-gradient(135deg, ${nurseColor}80, ${nurseColor}40)`,
              border: `2px solid ${nurseColor}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 900, color: 'white',
            }}>
              {nurseAvatar}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>
                {order.nurse?.name || 'Медсестра назначена'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>
                {order.service?.icon} {order.service?.name || order.service?.title}
                {order.nurse?.rating ? ` · ★ ${order.nurse.rating}` : ''}
              </div>
            </div>

            {order.status === 'on_way' && liveEta > 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#60A5FA', fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px' }}>
                  {liveEta}<span style={{ fontSize: 13, fontWeight: 500 }}> мин</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>до прибытия</div>
              </div>
            )}
            {order.status === 'arrived' && (
              <div style={{ color: '#34D399', fontSize: 13, fontWeight: 700 }}>Прибыла ✓</div>
            )}
            {order.status === 'working' && (
              <div style={{ color: '#F59E0B', fontSize: 13, fontWeight: 700 }}>Работает...</div>
            )}
          </div>

          {/* Шаги */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {STEPS.map((step, i) => {
              const done = i < stepIdx
              const active = i === stepIdx
              const last = i === STEPS.length - 1
              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: last ? 0 : 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <motion.div
                      animate={{
                        background: active ? '#3B82F6' : done ? '#10B981' : 'rgba(255,255,255,0.08)',
                        boxShadow: active ? '0 0 12px rgba(59,130,246,0.6)' : 'none',
                      }}
                      style={{
                        width: 30, height: 30, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, color: 'white', fontWeight: 800,
                        border: `1.5px solid ${active ? '#3B82F6' : done ? '#10B981' : 'rgba(255,255,255,0.1)'}`,
                        flexShrink: 0,
                      }}
                    >
                      {done ? '✓' : active
                        ? <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>{step.icon}</motion.span>
                        : step.icon}
                    </motion.div>
                    <span style={{ color: active ? 'white' : done ? '#34D399' : 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {step.label}
                    </span>
                  </div>
                  {!last && (
                    <div style={{ flex: 1, height: 2, margin: '0 4px', marginBottom: 16, borderRadius: 99, background: done ? '#10B981' : 'rgba(255,255,255,0.06)', transition: 'background 0.5s' }} />
                  )}
                </div>
              )
            })}
          </div>

          <button style={{
            width: '100%', marginTop: 16, padding: '11px',
            background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: 12, color: '#60A5FA', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>
            💬 Написать медсестре
          </button>
        </div>
      )}
    </motion.div>
  )
}
