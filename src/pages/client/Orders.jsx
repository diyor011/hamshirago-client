import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/layout/BottomNav'
import useWindowSize from '../../hooks/useWindowSize'

const STATUS_MAP = {
  done:      { label: 'Выполнен',  color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)'  },
  cancelled: { label: 'Отменён',   color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
  on_way:    { label: 'В пути',    color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)'  },
  working:   { label: 'Работает',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
}

const MOCK_ORDERS = [
  {
    id: 1, status: 'done',
    service: { icon: '💉', title: 'Укол', color: '#3B82F6' },
    nurse: { name: 'Малика Юсупова', avatar: 'М', color: '#8B5CF6' },
    price: '35 000', date: '21 фев 2026', time: '14:30',
  },
  {
    id: 2, status: 'done',
    service: { icon: '🩸', title: 'Капельница', color: '#8B5CF6' },
    nurse: { name: 'Зулайхо Рашидова', avatar: 'З', color: '#10B981' },
    price: '80 000', date: '18 фев 2026', time: '10:00',
  },
  {
    id: 3, status: 'cancelled',
    service: { icon: '🫀', title: 'Давление', color: '#10B981' },
    nurse: { name: 'Нилуфар Каримова', avatar: 'Н', color: '#F59E0B' },
    price: '15 000', date: '15 фев 2026', time: '09:15',
  },
  {
    id: 4, status: 'done',
    service: { icon: '🩺', title: 'Осмотр', color: '#F59E0B' },
    nurse: { name: 'Малика Юсупова', avatar: 'М', color: '#8B5CF6' },
    price: '50 000', date: '10 фев 2026', time: '16:45',
  },
]

const FILTERS = ['Все', 'Выполнен', 'Отменён']

function OrderCard({ order, index }) {
  const [expanded, setExpanded] = useState(false)
  const st = STATUS_MAP[order.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => setExpanded(!expanded)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, overflow: 'hidden',
        cursor: 'pointer', transition: 'border-color 0.2s',
        marginBottom: 10,
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
    >
      <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Иконка услуги */}
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: `${order.service.color}15`,
          border: `1px solid ${order.service.color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>
          {order.service.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>{order.service.title}</span>
            <div style={{ padding: '2px 8px', borderRadius: 99, background: st.bg, border: `1px solid ${st.border}` }}>
              <span style={{ color: st.color, fontSize: 11, fontWeight: 700 }}>{st.label}</span>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
            {order.date} • {order.time}
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ color: 'white', fontWeight: 900, fontSize: 15 }}>{order.price}</div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 2 }}>сум</div>
        </div>

        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginLeft: 4 }}
        >▼</motion.div>
      </div>

      {/* Раскрытая часть */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ paddingTop: 16, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `linear-gradient(135deg,${order.nurse.color}70,${order.nurse.color}40)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 900, color: 'white',
                }}>
                  {order.nurse.avatar}
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{order.nurse.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Медсестра</div>
                </div>
              </div>

              {order.status === 'done' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{
                    flex: 1, padding: '11px', background: 'rgba(59,130,246,0.12)',
                    border: '1px solid rgba(59,130,246,0.25)', borderRadius: 12,
                    color: '#60A5FA', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}>
                    🔄 Повторить заказ
                  </button>
                  <button style={{
                    flex: 1, padding: '11px', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                    color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}>
                    ⭐ Оценить
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Orders() {
  const [filter, setFilter] = useState('Все')
  const navigate = useNavigate()
  const { isMobile } = useWindowSize()

  const filtered = MOCK_ORDERS.filter(o => {
    if (filter === 'Все') return true
    return STATUS_MAP[o.status].label === filter
  })

  return (
    <div style={{ minHeight: '100vh', background: '#060A12', paddingBottom: isMobile ? 90 : 40 }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,0.07) 0%,transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', padding: '0 20px' }}>

        {/* Хедер */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '24px 0 20px', display: 'flex', alignItems: 'center', gap: 14 }}
        >
          <button
            onClick={() => navigate('/home')}
            style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >←</button>
          <div>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 900, letterSpacing: '-0.4px' }}>Мои заказы</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 2 }}>{MOCK_ORDERS.length} заказа всего</p>
          </div>
        </motion.div>

        {/* Фильтры */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          style={{ display: 'flex', gap: 8, marginBottom: 24 }}
        >
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px', borderRadius: 99, border: 'none', cursor: 'pointer',
                background: filter === f ? '#2563EB' : 'rgba(255,255,255,0.05)',
                color: filter === f ? 'white' : 'rgba(255,255,255,0.35)',
                fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
                boxShadow: filter === f ? '0 4px 14px rgba(37,99,235,0.35)' : 'none',
              }}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Список заказов */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filtered.map((order, i) => <OrderCard key={order.id} order={order} index={i} />)}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '60px 0' }}
            >
              <div style={{ fontSize: 52, marginBottom: 16 }}>📋</div>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Нет заказов</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginBottom: 28 }}>
                Здесь появятся ваши заказы
              </div>
              <button
                onClick={() => navigate('/home')}
                style={{ padding: '13px 28px', background: '#2563EB', border: 'none', borderRadius: 14, color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(37,99,235,0.35)' }}
              >
                Вызвать медсестру →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {isMobile && <BottomNav />}
    </div>
  )
}
