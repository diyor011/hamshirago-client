import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const TABS = [
  { path: '/home', icon: '🏠', label: 'Главная' },
  { path: '/orders', icon: '📋', label: 'Заказы' },
  { path: '/map', icon: '🗺️', label: 'Карта' },
  { path: '/profile', icon: '👤', label: 'Профиль' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(7,11,20,0.92)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      padding: '12px 8px calc(20px + env(safe-area-inset-bottom))',
      display: 'flex', justifyContent: 'space-around',
    }}>
      {TABS.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '6px 16px', borderRadius: 14,
              transition: 'all 0.2s', position: 'relative',
            }}
          >
            {active && (
              <motion.div
                layoutId="nav-active"
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(59,130,246,0.12)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: 14,
                }}
              />
            )}
            <span style={{ fontSize: 22, position: 'relative' }}>{tab.icon}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, position: 'relative',
              color: active ? '#60A5FA' : 'rgba(255,255,255,0.3)',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
