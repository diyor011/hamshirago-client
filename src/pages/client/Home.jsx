import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { io } from 'socket.io-client'
import BottomNav from '../../components/layout/BottomNav'
import ActiveOrder from '../../components/home/ActiveOrder'
import MapSection from '../../components/home/MapSection'
import useWindowSize from '../../hooks/useWindowSize'
import api from '../../api/axios'

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '')

// Иконки и цвета по категории
const CATEGORY_STYLE = {
  injection:  { color: '#3B82F6', glow: 'rgba(59,130,246,0.25)', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2.5L21 9"/><path d="M8 9l7-7 6 6-7 7-6-6z"/><path d="M11 12l-7 7"/><path d="M3 21l2-2"/><line x1="13" y1="6" x2="18" y2="11"/></svg> },
  iv_drip:    { color: '#8B5CF6', glow: 'rgba(139,92,246,0.25)',  svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C9 2 7 4.5 7 7c0 4 3 8 5 10 2-2 5-6 5-10 0-2.5-2-5-5-5z"/><line x1="12" y1="17" x2="12" y2="22"/><line x1="9" y1="22" x2="15" y2="22"/><line x1="9" y1="9" x2="15" y2="9"/></svg> },
  checkup:    { color: '#10B981', glow: 'rgba(16,185,129,0.25)',  svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,12 5,12 7,6 10,18 13,10 15,14 17,12 22,12"/></svg> },
  wound_care: { color: '#EF4444', glow: 'rgba(239,68,68,0.25)',   svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="18" height="6" rx="3"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/></svg> },
  caregiving: { color: '#EC4899', glow: 'rgba(236,72,153,0.25)',  svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  lab:        { color: '#06B6D4', glow: 'rgba(6,182,212,0.25)',   svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6"/><path d="M10 3v7L6 17a2 2 0 001.8 3h8.4A2 2 0 0018 17l-4-7V3"/></svg> },
  cardio:     { color: '#F59E0B', glow: 'rgba(245,158,11,0.25)',  svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
}

function ServiceIcon({ service, size = 46 }) {
  const s = CATEGORY_STYLE[service.category] || CATEGORY_STYLE.injection
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: -5, borderRadius: 20, background: `radial-gradient(circle, ${s.color}30 0%, transparent 70%)`, filter: 'blur(6px)' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 15, background: `linear-gradient(145deg, ${s.color}28 0%, ${s.color}0d 100%)`, border: `1px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, overflow: 'hidden' }}>
        <div style={{ width: size * 0.48, height: size * 0.48, position: 'relative', zIndex: 1 }}>
          {s.svg}
        </div>
      </div>
    </div>
  )
}

const SLIDES = [
  { tag: '🎁 Акция', title: 'Скидка 30%\nна первый вызов', sub: 'Промокод FIRST30 при оформлении', from: '#0F2460', to: '#1E40AF', accent: '#93C5FD', shape: '#1D4ED8' },
  { tag: '⭐ Качество', title: 'Опыт\nспециалистов 3+ лет', sub: 'Строгая проверка и сертификация', from: '#1E0A3C', to: '#4C1D95', accent: '#C4B5FD', shape: '#6D28D9' },
  { tag: '⚡ Скорость', title: 'Медсестра\nза 20 минут', sub: 'Работаем 24/7 по всему Ташкенту', from: '#042F2E', to: '#065F46', accent: '#6EE7B7', shape: '#047857' },
]

function Sidebar({ userName }) {
  const NAV = [
    { icon: '🏠', label: 'Главная', active: true },
    { icon: '📋', label: 'Мои заказы', active: false },
    { icon: '🗺️', label: 'Карта', active: false },
    { icon: '👤', label: 'Профиль', active: false },
  ]
  return (
    <div style={{ width: 260, flexShrink: 0, background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '28px 0', position: 'sticky', top: 0, height: '100vh' }}>
      <div style={{ padding: '0 24px 32px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="#2563EB"/><rect x="16" y="8" width="4" height="20" rx="2" fill="white"/><rect x="8" y="16" width="20" height="4" rx="2" fill="white"/></svg>
        <span style={{ fontWeight: 900, fontSize: 18, color: 'white' }}>Hamshira<span style={{ color: '#60A5FA' }}>Go</span></span>
      </div>
      <div style={{ padding: '16px 24px', margin: '0 16px 24px', background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: 'white' }}>{(userName?.[0] || 'U').toUpperCase()}</div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{userName || 'Пользователь'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
              <span style={{ color: '#34D399', fontSize: 11, fontWeight: 600 }}>Онлайн</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '0 12px' }}>
        {NAV.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, marginBottom: 4, cursor: 'pointer', background: item.active ? 'rgba(59,130,246,0.12)' : 'transparent', border: `1px solid ${item.active ? 'rgba(59,130,246,0.2)' : 'transparent'}` }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span style={{ color: item.active ? 'white' : 'rgba(255,255,255,0.35)', fontSize: 14, fontWeight: item.active ? 700 : 500 }}>{item.label}</span>
            {item.active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' }} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function NurseCard({ nurse, onCall }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 50, height: 50, borderRadius: 16, background: 'linear-gradient(135deg,rgba(16,185,129,0.5),rgba(16,185,129,0.2))', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: 'white' }}>
          {nurse.name?.[0]}
        </div>
        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: '#10B981', border: '2px solid #060A12' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nurse.name}</div>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{nurse.specialties?.join(', ')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
          <span style={{ color: '#FBBF24', fontSize: 11, fontWeight: 700 }}>★ {nurse.rating}</span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>·</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{nurse.experience} лет опыта</span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>·</span>
          <span style={{ color: '#34D399', fontSize: 11, fontWeight: 600 }}>{nurse.distance} км</span>
        </div>
      </div>
      <motion.button whileTap={{ scale: 0.95 }} onClick={onCall}
        style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 10, border: 'none', background: '#2563EB', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
        Вызвать
      </motion.button>
    </div>
  )
}

// Модал выбора адреса/GPS
function LocationModal({ onConfirm, onClose }) {
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')
  const [gpsError, setGpsError] = useState('')

  const useGps = () => {
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false)
        onConfirm({ lat: pos.coords.latitude, lng: pos.coords.longitude, address: 'Моё местоположение' })
      },
      () => { setGpsError('Нет доступа к геолокации'); setLoading(false) },
      { enableHighAccuracy: true }
    )
  }

  const useAddress = () => {
    if (!address.trim()) return
    // Ташкент по умолчанию — центр
    onConfirm({ lat: 41.2995, lng: 69.2401, address: address.trim() })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100, padding: 20 }}
    >
      <motion.div
        initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
        style={{ width: '100%', maxWidth: 480, background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 28 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>Укажите ваш адрес</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={useGps} disabled={loading}
          style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#1D4ED8,#2563EB)', color: loading ? 'rgba(255,255,255,0.3)' : 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginBottom: 12, boxShadow: '0 6px 20px rgba(37,99,235,0.35)' }}>
          {loading ? 'Получаем координаты...' : '📍 Использовать GPS'}
        </motion.button>

        {gpsError && <p style={{ color: '#FCA5A5', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>{gpsError}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={address} onChange={e => setAddress(e.target.value)}
            placeholder="Введите адрес вручную..."
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', color: 'white', fontSize: 14, outline: 'none' }}
          />
          <motion.button whileTap={{ scale: 0.97 }} onClick={useAddress}
            style={{ padding: '12px 16px', borderRadius: 12, border: 'none', background: 'rgba(59,130,246,0.2)', color: '#60A5FA', fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            OK
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Home() {
  const [userName, setUserName] = useState('')
  const [services, setServices] = useState([])
  const [nearbyNurses, setNearbyNurses] = useState([])
  const [clientLocation, setClientLocation] = useState(null)
  const [selected, setSelected] = useState(null)
  const [ordering, setOrdering] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [activeOrder, setActiveOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem('activeOrder')) } catch { return null }
  })
  const [activeNursePos, setActiveNursePos] = useState(null)
  const { isDesktop, isMobile } = useWindowSize()
  const socketRef = useRef(null)

  // Читаем имя из токена
  useEffect(() => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const p = JSON.parse(atob(token.split('.')[1]))
        setUserName(p.name || '')
      }
    } catch {}
  }, [])

  // Загружаем услуги
  useEffect(() => {
    api.get('/services').then(r => setServices(r.data)).catch(() => {})
  }, [])

  // Автоматически запрашиваем GPS при загрузке
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setClientLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: 'Моё местоположение',
        })
      },
      () => {} // молча игнорируем отказ — пользователь сам нажмёт кнопку
    )
  }, [])

  // Загружаем ближайших медсестёр когда есть локация
  const fetchNearbyNurses = (loc) => {
    // radius=50 — список "Свободные медсёстры" показывает всех в округе
    // На карте и в заказах используется строго 5-10 км (фильтр ниже и бэкенд)
    api.get(`/nurses/nearby?lat=${loc.lat}&lng=${loc.lng}&radius=50`)
      .then(r => setNearbyNurses(r.data))
      .catch(() => {})
  }

  useEffect(() => {
    if (!clientLocation) return
    fetchNearbyNurses(clientLocation)
    // Обновляем каждые 10 секунд — медсёстры могут выходить/уходить с найма
    const interval = setInterval(() => fetchNearbyNurses(clientLocation), 10000)
    return () => clearInterval(interval)
  }, [clientLocation])

  // Сокет для трекинга заказа
  useEffect(() => {
    if (!activeOrder) return

    const socket = io(SOCKET_URL)
    socketRef.current = socket
    socket.emit('order:watch', { orderId: activeOrder.id })

    socket.on('order:matched', ({ nurse, eta }) => {
      setActiveOrder(prev => ({ ...prev, status: 'accepted', nurse, eta }))
    })

    socket.on('nurse:moved', ({ lat, lng, eta }) => {
      setActiveNursePos({ lat, lng, name: activeOrder.nurse?.name })
      setActiveOrder(prev => ({ ...prev, eta, status: prev.status === 'accepted' ? 'on_way' : prev.status }))
    })

    socket.on('order:updated', ({ status }) => {
      setActiveOrder(prev => ({ ...prev, status }))
      if (status === 'completed') closeOrder()
    })

    // Все медсёстры отказали или офлайн
    socket.on('order:no_nurses', () => {
      closeOrder()
      alert('😔 Нет доступных медсестёр рядом. Попробуйте позже или измените адрес.')
    })

    return () => socket.disconnect()
  }, [activeOrder?.id])

  // Синхронизируем activeOrder с localStorage
  useEffect(() => {
    if (activeOrder) localStorage.setItem('activeOrder', JSON.stringify(activeOrder))
    else localStorage.removeItem('activeOrder')
  }, [activeOrder])

  // Открыть модал локации перед заказом
  const handleCallService = () => {
    if (!clientLocation) { setShowLocationModal(true); return }
    placeOrder(selected)
  }

  const onLocationConfirmed = (loc) => {
    setClientLocation(loc)
    setShowLocationModal(false)
    if (selected) placeOrder(selected, loc)
  }

  const placeOrder = async (service, loc = clientLocation) => {
    if (!loc) { setShowLocationModal(true); return }
    setOrdering(true)
    try {
      const { data } = await api.post('/orders', {
        serviceId: service.id,
        lat: loc.lat,
        lng: loc.lng,
        address: loc.address,
      })
      const catStyle = CATEGORY_STYLE[service.category] || CATEGORY_STYLE.injection
      setActiveOrder({
        id: data.order.id,
        status: 'pending',
        eta: null,
        service: { name: service.name, icon: service.icon || catStyle.svg, title: service.name },
        nurse: null,
        price: service.price,
        notified: data.notified,
      })
      setSelected(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка создания заказа')
    }
    setOrdering(false)
  }

  const closeOrder = () => {
    localStorage.removeItem('activeOrder')
    setActiveOrder(null)
    setActiveNursePos(null)
    socketRef.current?.disconnect()
  }

  // Для карты — только в радиусе 10 км (чтобы не загромождать)
  const nursesForMap = nearbyNurses.filter(n => n.distance <= 10)

  // Обогащаем данные медсестёр для UI
  const serviceList = services.map(s => ({
    ...s,
    ...( CATEGORY_STYLE[s.category] || CATEGORY_STYLE.injection),
    title: s.name,
    time: `${s.duration} мин`,
  }))

  const mainContent = (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: isMobile ? 90 : 40 }}>

      {/* Хедер */}
      <div style={{ padding: isDesktop ? '28px 32px 20px' : '20px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ color: 'white', fontSize: isDesktop ? 26 : 22, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 5 }}>
            {userName || 'Добро пожаловать'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: clientLocation ? '#10B981' : '#F59E0B', boxShadow: `0 0 8px ${clientLocation ? '#10B981' : '#F59E0B'}` }} />
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 600 }}>
              {clientLocation ? clientLocation.address : 'Ташкент • Укажите локацию'}
            </span>
          </div>
        </motion.div>

        {!isDesktop && (
          <button
            onClick={() => setShowLocationModal(true)}
            style={{ padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}
          >
            📍 Адрес
          </button>
        )}
      </div>

      <div style={{ padding: isDesktop ? '0 32px' : '0 20px' }}>

        {/* Активный заказ */}
        <AnimatePresence>
          {activeOrder && (
            <ActiveOrder order={activeOrder} onClose={closeOrder} />
          )}
        </AnimatePresence>

        {/* Баннеры */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ marginBottom: 28 }}>
          <style>{`.hswiper .swiper-pagination-bullet{background:rgba(255,255,255,0.3)!important;width:6px!important;height:6px!important;opacity:1!important;transition:all .3s}.hswiper .swiper-pagination-bullet-active{background:white!important;width:20px!important;border-radius:3px!important}.hswiper .swiper-pagination{bottom:14px!important}`}</style>
          <Swiper className="hswiper" modules={[Autoplay, Pagination]} autoplay={{ delay: 3800, disableOnInteraction: false }} pagination={{ clickable: true }} loop style={{ borderRadius: 22 }}>
            {SLIDES.map((s, i) => (
              <SwiperSlide key={i}>
                <div style={{ background: `linear-gradient(145deg,${s.from},${s.to})`, padding: isDesktop ? '36px 32px 52px' : '28px 24px 46px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: `${s.shape}50` }} />
                  <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 99, padding: '5px 12px', marginBottom: 14 }}>
                    <span style={{ color: s.accent, fontSize: 12, fontWeight: 700 }}>{s.tag}</span>
                  </div>
                  <h2 style={{ color: 'white', fontSize: isDesktop ? 32 : 26, fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.8px', marginBottom: 10, whiteSpace: 'pre-line' }}>{s.title}</h2>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 22 }}>{s.sub}</p>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowLocationModal(true)} style={{ background: 'white', border: 'none', borderRadius: 12, padding: '11px 22px', fontSize: 14, fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}>
                    Вызвать →
                  </motion.button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        <div style={{ display: isDesktop ? 'grid' : 'block', gridTemplateColumns: isDesktop ? '1fr 380px' : undefined, gap: isDesktop ? 24 : 0 }}>

          {/* Левая колонка */}
          <div>
            {/* Услуги */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>Услуги</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {serviceList.map((s, i) => (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelected(selected?.id === s.id ? null : s)}
                    style={{
                      background: selected?.id === s.id ? `${s.color}15` : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${selected?.id === s.id ? s.color + '45' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: 18, padding: '16px 10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                      boxShadow: selected?.id === s.id ? `0 8px 28px ${s.glow}` : 'none',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    }}
                  >
                    <ServiceIcon service={s} size={46} />
                    <div style={{ color: 'white', fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>{s.name}</div>
                    <div style={{ color: s.color, fontSize: 11, fontWeight: 700 }}>
                      {s.priceNegotiable ? 'Договорная' : `${s.price?.toLocaleString()} сум`}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Раскрытая услуга */}
            <AnimatePresence>
              {selected && (
                <motion.div key={selected.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 28 }}>
                  <div style={{ background: `${selected.color}12`, border: `1.5px solid ${selected.color}30`, borderRadius: 20, padding: 22, boxShadow: `0 12px 40px ${selected.glow}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                      <ServiceIcon service={selected} size={52} />
                      <div style={{ flex: 1 }}>
                        <div style={{ color: 'white', fontSize: 17, fontWeight: 900 }}>{selected.name}</div>
                        <div style={{ color: selected.color, fontSize: 12, fontWeight: 600, marginTop: 2 }}>⏱ {selected.duration} мин</div>
                      </div>
                      <button onClick={() => setSelected(null)} style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>{selected.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginBottom: 2 }}>Стоимость</p>
                        {selected.priceNegotiable
                          ? <span style={{ color: '#EC4899', fontSize: 22, fontWeight: 900 }}>Договорная</span>
                          : <p style={{ color: 'white', fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px', margin: 0 }}>{selected.price?.toLocaleString()} <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>сум</span></p>
                        }
                      </div>
                      {nearbyNurses.length === 0 && !activeOrder && (
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>
                          😔 Нет медсестёр<br/>рядом
                        </div>
                      )}
                      {nearbyNurses.length > 0 && (
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={handleCallService}
                          disabled={ordering || !!activeOrder}
                          style={{ background: ordering ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg,${selected.color},${selected.color}cc)`, border: 'none', borderRadius: 14, padding: '13px 26px', fontSize: 14, fontWeight: 800, color: ordering ? 'rgba(255,255,255,0.3)' : 'white', cursor: ordering || activeOrder ? 'not-allowed' : 'pointer', boxShadow: ordering ? 'none' : `0 6px 20px ${selected.glow}`, transition: 'all 0.3s', minWidth: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                          {ordering ? (
                            <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', borderTopColor: 'rgba(255,255,255,0.5)' }} /> Ищем...</>
                          ) : activeOrder ? 'Уже есть заказ' : 'Вызвать →'}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ближайшие медсёстры */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>Ближайшие медсёстры</h2>
                {!clientLocation && (
                  <button onClick={() => setShowLocationModal(true)} style={{ color: '#3B82F6', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none' }}>Показать →</button>
                )}
              </div>
              {nearbyNurses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {nearbyNurses.map(n => (
                    <NurseCard key={n.id} nurse={n} onCall={() => {
                      setShowLocationModal(!clientLocation)
                    }} />
                  ))}
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                  {clientLocation ? '😔 Нет свободных медсестёр рядом' : '📍 Укажите ваше местоположение'}
                </div>
              )}
            </motion.div>
          </div>

          {/* Карта */}
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} style={{ position: isDesktop ? 'sticky' : 'static', top: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>Карта</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 99, padding: '5px 12px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                  <span style={{ color: '#34D399', fontSize: 12, fontWeight: 700 }}>
                    {nursesForMap.length > 0 ? `${nursesForMap.length} рядом` : nearbyNurses.length > 0 ? `${nearbyNurses.length} доступных` : 'Ищем...'}
                  </span>
                </div>
              </div>

              <MapSection
                height={isDesktop ? 320 : 220}
                clientLocation={clientLocation}
                nurses={nursesForMap}
                activeNurse={activeNursePos}
              />

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                {[
                  { icon: '📍', label: 'Ваш адрес', val: clientLocation?.address || 'Не задан' },
                  { icon: '⏱', label: 'Прибытие', val: activeOrder?.eta ? `~${activeOrder.eta} мин` : nearbyNurses[0] ? `~${Math.round(nearbyNurses[0].distance / 30 * 60)} мин` : '—' },
                ].map(item => (
                  <div key={item.label} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '13px 15px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginBottom: 4 }}>{item.icon} {item.label}</p>
                    <p style={{ color: 'white', fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.val}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#060A12', display: 'flex', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,0.07) 0%,transparent 70%)' }} />
      </div>

      {isDesktop && <Sidebar userName={userName} />}

      <div style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 1 }}>
        {mainContent}
      </div>

      {isMobile && <BottomNav />}

      {/* Модал локации */}
      <AnimatePresence>
        {showLocationModal && (
          <LocationModal onConfirm={onLocationConfirmed} onClose={() => setShowLocationModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
