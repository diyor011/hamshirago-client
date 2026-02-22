import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import useWindowSize from '../../hooks/useWindowSize'

export default function Register() {
  const navigate = useNavigate()
  const { isDesktop } = useWindowSize()
  const [step, setStep] = useState(1)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [devCode, setDevCode] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', password: '' })

  const inputWrap = (name) => ({
    display: 'flex', alignItems: 'center',
    background: focused === name ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.04)',
    border: `1.5px solid ${focused === name ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 14, transition: 'all 0.2s',
    boxShadow: focused === name ? '0 0 0 4px rgba(59,130,246,0.12)' : 'none',
  })

  const inputEl = {
    flex: 1, padding: '15px 16px', border: 'none', outline: 'none',
    fontSize: 15, color: 'white', background: 'transparent', fontWeight: 500,
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/register', form)
      setDevCode(res.data.devCode || '')
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 3) document.getElementById(`otp-${index + 1}`).focus()
  }

  const handleOtpKey = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`).focus()
  }

  const handleVerify = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/verify-otp', { phone: form.phone, code: otp.join('') })
      localStorage.setItem('token', res.data.token)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Неверный код')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#070B14' }}>

      {/* Фоновые блобы */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', left: '15%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)' }} />
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

          {/* Контент */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
              Быстрая регистрация
            </p>
            <h2 style={{ color: 'white', fontSize: 44, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 40 }}>
              Готово за<br/><span style={{ color: '#3B82F6' }}>60 секунд</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { n: '01', t: 'Введите данные' },
                { n: '02', t: 'Подтвердите номер' },
                { n: '03', t: 'Вызывайте медсестру' },
              ].map((s, i) => {
                const active = step === i + 1
                const done = step > i + 1
                return (
                  <motion.div key={s.n}
                    animate={{
                      background: active ? 'rgba(59,130,246,0.15)' : done ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.03)',
                      borderColor: active ? 'rgba(59,130,246,0.4)' : done ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.06)',
                    }}
                    transition={{ duration: 0.4 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 14, border: '1px solid' }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1, color: active ? '#60A5FA' : done ? '#34D399' : 'rgba(255,255,255,0.2)' }}>
                      {done ? '✓' : s.n}
                    </span>
                    <span style={{ color: active ? 'white' : done ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)', fontWeight: 600, fontSize: 14 }}>
                      {s.t}
                    </span>
                    {active && <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: '#3B82F6', boxShadow: '0 0 10px #3B82F6' }} />}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>
            © 2025 HamshiraGo · Ташкент, Узбекистан
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
        padding: isDesktop ? '40px 32px' : '24px 16px',
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
      }}>

        {/* Лого только на мобиле */}
        {!isDesktop && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}
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
          style={{ width: '100%', maxWidth: 420 }}
        >
          {/* Прогресс бар */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {[1, 2].map(s => (
              <motion.div key={s}
                animate={{ background: step >= s ? '#3B82F6' : 'rgba(255,255,255,0.08)' }}
                transition={{ duration: 0.4 }}
                style={{ flex: 1, height: 3, borderRadius: 99 }}
              />
            ))}
          </div>

          {/* Стеклянная карточка */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24, padding: isDesktop ? '36px' : '24px',
            backdropFilter: 'blur(20px)',
            width: '100%',
          }}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="s1"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
                >
                  <p style={{ color: '#60A5FA', fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Шаг 1 из 2</p>
                  <h1 style={{ fontSize: isDesktop ? 26 : 22, fontWeight: 900, color: 'white', letterSpacing: '-0.5px', marginBottom: 6 }}>Создать аккаунт</h1>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 24 }}>
                    Уже есть аккаунт?{' '}
                    <Link to="/login" style={{ color: '#60A5FA', fontWeight: 700, textDecoration: 'none' }}>Войти</Link>
                  </p>

                  <form onSubmit={handleSubmit}>
                    {[
                      { label: 'Ваше имя', name: 'name', type: 'text', placeholder: 'Алишер Каримов' },
                      { label: 'Номер телефона', name: 'phone', type: 'tel', placeholder: '+998 90 000 00 00' },
                    ].map(f => (
                      <div key={f.name} style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8 }}>{f.label}</label>
                        <div style={inputWrap(f.name)}>
                          {f.name === 'phone' && (
                            <div style={{ padding: '0 14px', borderRight: '1.5px solid rgba(255,255,255,0.08)', fontSize: 18, display: 'flex', alignItems: 'center', alignSelf: 'stretch' }}>🇺🇿</div>
                          )}
                          <input type={f.type} name={f.name} placeholder={f.placeholder}
                            value={form[f.name]} onChange={handleChange}
                            onFocus={() => setFocused(f.name)} onBlur={() => setFocused('')}
                            required style={inputEl}
                          />
                        </div>
                      </div>
                    ))}

                    <div style={{ marginBottom: 24 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8 }}>Пароль</label>
                      <div style={inputWrap('password')}>
                        <input type={showPass ? 'text' : 'password'} name="password"
                          placeholder="Минимум 6 символов" value={form.password} onChange={handleChange}
                          onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                          required style={inputEl}
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          style={{ padding: '0 16px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 18 }}>
                          {showPass ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: 12, padding: '12px 16px', color: '#FCA5A5',
                        fontSize: 14, fontWeight: 500, marginBottom: 16
                      }}>⚠️ {error}</motion.div>
                    )}

                    <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                      style={{
                        width: '100%', padding: 16, borderRadius: 14, border: 'none',
                        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                        color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: '0 4px 32px rgba(37,99,235,0.35)',
                      }}>
                      {loading ? <span className="loading loading-spinner loading-sm" /> : <>Продолжить <span style={{ fontSize: 18 }}>→</span></>}
                    </motion.button>
                  </form>
                </motion.div>

              ) : (
                <motion.div key="s2"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
                >
                  <p style={{ color: '#60A5FA', fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Шаг 2 из 2</p>
                  <h1 style={{ fontSize: isDesktop ? 26 : 22, fontWeight: 900, color: 'white', letterSpacing: '-0.5px', marginBottom: 6 }}>Введите код</h1>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 24 }}>
                    Отправили на <span style={{ color: 'white', fontWeight: 700 }}>{form.phone}</span>
                  </p>

                  {/* OTP поля */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 28, width: '100%' }}>
                    {otp.map((d, i) => (
                      <input key={i} id={`otp-${i}`} type="text" inputMode="numeric"
                        maxLength={1} value={d}
                        onChange={e => handleOtpChange(e.target.value, i)}
                        onKeyDown={e => handleOtpKey(e, i)}
                        style={{
                          width: 0, flexGrow: 1,
                          height: 60, textAlign: 'center', fontSize: 24, fontWeight: 900,
                          color: 'white', outline: 'none',
                          background: d ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                          border: `1.5px solid ${d ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: 14, transition: 'all 0.2s',
                          boxShadow: d ? '0 0 0 4px rgba(59,130,246,0.1)' : 'none',
                        }}
                      />
                    ))}
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: 12, padding: '12px 16px', color: '#FCA5A5',
                      fontSize: 14, fontWeight: 500, marginBottom: 16
                    }}>⚠️ {error}</motion.div>
                  )}

                  <motion.button whileTap={{ scale: 0.98 }} onClick={handleVerify}
                    disabled={loading || otp.join('').length < 4}
                    style={{
                      width: '100%', padding: 16, borderRadius: 14, border: 'none',
                      background: otp.join('').length < 4
                        ? 'rgba(255,255,255,0.06)'
                        : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      color: otp.join('').length < 4 ? 'rgba(255,255,255,0.2)' : 'white',
                      fontSize: 16, fontWeight: 800,
                      cursor: otp.join('').length < 4 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: otp.join('').length === 4 ? '0 4px 32px rgba(37,99,235,0.35)' : 'none',
                      transition: 'all 0.3s', marginBottom: 10,
                    }}>
                    {loading ? <span className="loading loading-spinner loading-sm" /> : 'Подтвердить ✓'}
                  </motion.button>

                  <button onClick={() => { setStep(1); setOtp(['','','','']); setError('') }}
                    style={{ width: '100%', padding: 12, background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
                    ← Изменить номер
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
