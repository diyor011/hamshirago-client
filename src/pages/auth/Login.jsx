import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import useWindowSize from '../../hooks/useWindowSize'

export default function Login() {
  const navigate = useNavigate()
  const { isDesktop } = useWindowSize()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')
  const [form, setForm] = useState({ phone: '', password: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.token)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Неверный номер или пароль')
    } finally {
      setLoading(false)
    }
  }

  const inputWrap = (name) => ({
    display: 'flex',
    alignItems: 'center',
    background: focused === name ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.04)',
    border: `1.5px solid ${focused === name ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 14,
    transition: 'all 0.2s',
    boxShadow: focused === name ? '0 0 0 4px rgba(59,130,246,0.12)' : 'none',
  })

  const inputEl = {
    flex: 1, padding: '15px 16px', border: 'none', outline: 'none',
    fontSize: 15, color: 'white', background: 'transparent', fontWeight: 500,
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#070B14' }}>

      {/* Фоновые элементы */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)' }} />
      </div>

      {/* Левая панель — только на десктопе */}
      {isDesktop && (
        <div style={{
          width: '48%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: 52, position: 'relative', zIndex: 1,
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}>
          {/* Лого */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <rect width="38" height="38" rx="11" fill="#2563EB"/>
              <rect x="17" y="9" width="4" height="20" rx="2" fill="white"/>
              <rect x="9" y="17" width="20" height="4" rx="2" fill="white"/>
            </svg>
            <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.5px', color: 'white' }}>
              Hamshira<span style={{ color: '#60A5FA' }}>Go</span>
            </span>
          </div>

          {/* Центральный контент */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 99, padding: '6px 14px', marginBottom: 28 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 8px #34D399' }} />
              <span style={{ color: '#93C5FD', fontSize: 13, fontWeight: 600 }}>Работаем 24/7 по Ташкенту</span>
            </div>

            <h2 style={{ color: 'white', fontSize: 46, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 24 }}>
              Медсестра<br/>у вас дома<br/><span style={{ color: '#3B82F6' }}>за 20 минут</span>
            </h2>

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, lineHeight: 1.6, marginBottom: 40, maxWidth: 360 }}>
              Профессиональные медицинские услуги на дому — уколы, капельницы, измерение давления.
            </p>

            {/* Статы */}
            <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
              {[
                { num: '2 400+', label: 'Пациентов' },
                { num: '3+ лет', label: 'Опыт врачей' },
                { num: '4.9 ★', label: 'Рейтинг' },
              ].map((s, i) => (
                <div key={s.label} style={{
                  flex: 1, padding: '20px 16px', textAlign: 'center',
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }}>
                  <div style={{ color: 'white', fontWeight: 900, fontSize: 20, letterSpacing: '-0.5px' }}>{s.num}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Аватары */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex' }}>
              {['#F59E0B','#10B981','#8B5CF6','#EF4444'].map((c, i) => (
                <div key={i} style={{
                  width: 36, height: 36, borderRadius: '50%', background: c,
                  border: '2px solid #070B14', marginLeft: i ? -10 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: 'white',
                }}>
                  {['А','М','З','Н'][i]}
                </div>
              ))}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Уже доверяют тысячи клиентов</span>
          </div>
        </div>
      )}

      {/* Правая панель (на мобиле — вся страница) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isDesktop ? '32px 24px' : '24px 16px',
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
      }}>

        {/* Лого только на мобиле */}
        {!isDesktop && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}
          >
            <svg width="36" height="36" viewBox="0 0 38 38" fill="none">
              <rect width="38" height="38" rx="11" fill="#2563EB"/>
              <rect x="17" y="9" width="4" height="20" rx="2" fill="white"/>
              <rect x="9" y="17" width="20" height="4" rx="2" fill="white"/>
            </svg>
            <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px', color: 'white' }}>
              Hamshira<span style={{ color: '#60A5FA' }}>Go</span>
            </span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          {/* Форма карточка */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            padding: isDesktop ? 36 : 24,
            backdropFilter: 'blur(20px)',
          }}>
            <p style={{ color: '#60A5FA', fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
              С возвращением
            </p>
            <h1 style={{ fontSize: isDesktop ? 28 : 24, fontWeight: 900, color: 'white', letterSpacing: '-0.5px', marginBottom: 6 }}>
              Вход в аккаунт
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 28 }}>
              Нет аккаунта?{' '}
              <Link to="/register" style={{ color: '#60A5FA', fontWeight: 700, textDecoration: 'none' }}>
                Зарегистрируйтесь
              </Link>
            </p>

            <form onSubmit={handleSubmit}>
              {/* Телефон */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8 }}>
                  Номер телефона
                </label>
                <div style={inputWrap('phone')}>
                  <div style={{ padding: '0 14px', borderRight: '1.5px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: 18, display: 'flex', alignItems: 'center', alignSelf: 'stretch' }}>
                    🇺🇿
                  </div>
                  <input
                    type="tel" name="phone" placeholder="+998 90 000 00 00"
                    value={form.phone} onChange={handleChange}
                    onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                    required style={{ ...inputEl }}
                  />
                </div>
              </div>

              {/* Пароль */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8 }}>
                  Пароль
                </label>
                <div style={inputWrap('password')}>
                  <input
                    type={showPass ? 'text' : 'password'} name="password"
                    placeholder="••••••••" value={form.password} onChange={handleChange}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                    required style={{ ...inputEl }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ padding: '0 16px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 18, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', color: '#FCA5A5', fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
                  ⚠️ {error}
                </motion.div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                  background: loading ? 'rgba(59,130,246,0.4)' : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: 'white', fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 32px rgba(37,99,235,0.4)', letterSpacing: '-0.2px',
                }}
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : <>Войти <span style={{ fontSize: 18 }}>→</span></>}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
