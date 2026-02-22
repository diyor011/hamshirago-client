import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

const userIconHtml = `
  <div style="position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px;">
    <div style="position:absolute;width:24px;height:24px;border-radius:50%;background:rgba(59,130,246,0.25);animation:pulse 2s infinite;"></div>
    <div style="width:14px;height:14px;background:#3B82F6;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 8px rgba(59,130,246,0.6);position:relative;z-index:1;"></div>
  </div>
  <style>@keyframes pulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.8);opacity:0}}</style>
`

const makeNurseIconHtml = (name, isActive = false) => `
  <div style="
    background:linear-gradient(135deg,${isActive ? '#2563EB,#7C3AED' : '#059669,#10B981'});
    border-radius:10px;padding:5px 10px;
    color:white;font-size:11px;font-weight:800;
    border:1.5px solid rgba(255,255,255,0.25);
    box-shadow:0 4px 14px ${isActive ? 'rgba(37,99,235,0.5)' : 'rgba(16,185,129,0.5)'};
    white-space:nowrap;display:flex;align-items:center;gap:5px;
  ">
    <span>${isActive ? '🔵' : '🏥'}</span> ${name || 'Медсестра'}
  </div>
`

export default function MapSection({ height = 240, clientLocation, nurses = [], activeNurse = null }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const userMarkerRef = useRef(null)
  const nurseMarkersRef = useRef([])
  const activeNurseMarkerRef = useRef(null)
  const activeRouteRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)

  // Инициализация карты
  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return
    const center = clientLocation
      ? [clientLocation.lat, clientLocation.lng]
      : [41.2995, 69.2401]

    const map = L.map(mapRef.current, {
      center,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map)
    mapInstance.current = map

    // Ждём пока контейнер полностью отрендерится, потом пересчитываем размер
    setTimeout(() => {
      map.invalidateSize()
      setMapReady(true)
    }, 100)

    const onResize = () => map.invalidateSize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      map.remove()
      mapInstance.current = null
      setMapReady(false)
    }
  }, [])

  // Маркер клиента
  useEffect(() => {
    const map = mapInstance.current
    if (!map || !mapReady) return

    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
    }

    const pos = clientLocation || { lat: 41.2995, lng: 69.2401 }
    const icon = L.divIcon({ html: userIconHtml, iconSize: [24, 24], iconAnchor: [12, 12], className: '' })
    userMarkerRef.current = L.marker([pos.lat, pos.lng], { icon }).addTo(map)

    if (clientLocation) map.setView([pos.lat, pos.lng], 14)
  }, [clientLocation, mapReady])

  // Маркеры доступных медсестёр — зависит от mapReady чтобы не было гонки
  useEffect(() => {
    const map = mapInstance.current
    if (!map || !mapReady) return

    nurseMarkersRef.current.forEach(m => m.remove())
    nurseMarkersRef.current = []

    nurses.forEach(nurse => {
      if (!nurse.currentLatitude || !nurse.currentLongitude) return
      const icon = L.divIcon({
        html: makeNurseIconHtml(nurse.name?.split(' ')[0]),
        iconSize: [110, 30], iconAnchor: [55, 30], className: '',
      })
      const marker = L.marker([nurse.currentLatitude, nurse.currentLongitude], { icon }).addTo(map)
      nurseMarkersRef.current.push(marker)
    })
  }, [nurses, mapReady])

  // Активная медсестра (движется к клиенту)
  useEffect(() => {
    const map = mapInstance.current
    if (!map || !mapReady) return

    if (activeNurseMarkerRef.current) activeNurseMarkerRef.current.remove()
    if (activeRouteRef.current) activeRouteRef.current.remove()

    if (!activeNurse) return

    const icon = L.divIcon({
      html: makeNurseIconHtml(activeNurse.name?.split(' ')[0], true),
      iconSize: [120, 30], iconAnchor: [60, 30], className: '',
    })
    activeNurseMarkerRef.current = L.marker([activeNurse.lat, activeNurse.lng], { icon }).addTo(map)

    // Маршрут от медсестры к клиенту
    if (clientLocation) {
      activeRouteRef.current = L.polyline(
        [[activeNurse.lat, activeNurse.lng], [clientLocation.lat, clientLocation.lng]],
        { color: '#3B82F6', weight: 2.5, opacity: 0.6, dashArray: '8 6' }
      ).addTo(map)

      // Показываем обоих на карте
      map.fitBounds([
        [activeNurse.lat, activeNurse.lng],
        [clientLocation.lat, clientLocation.lng],
      ], { padding: [40, 40] })
    }
  }, [activeNurse, clientLocation, mapReady])

  return (
    <div style={{
      borderRadius: 24, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div ref={mapRef} style={{ height, width: '100%', background: '#111827' }} />
    </div>
  )
}
