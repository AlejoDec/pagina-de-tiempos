import React, { useEffect, useState } from 'react'
import { db, collection, query, orderBy, getDocs } from '../firebase'
import { formatMsToDisplay, parseTimeStringToMs } from '../utils/time'
import VideosGrid from '../components/VideosGrid'

type TimeItem = {
  id: string
  tramo: string
  carro: string
  nombre: string
  tiempo?: string
  tiempoMs?: number
  nota?: string
}

const TimesList: React.FC = () => {
  const [times, setTimes] = useState<TimeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [nombreFilter, setNombreFilter] = useState('')
  const [carroFilter, setCarroFilter] = useState('')
  const [tramoFilter, setTramoFilter] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, 'times'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        const items = snap.docs.map((d) => {
          const data = d.data() as Partial<TimeItem>
          return {
            id: d.id,
            tramo: data.tramo || '',
            carro: data.carro || '',
            nombre: data.nombre || '',
            tiempo: data.tiempo,
            tiempoMs: data.tiempoMs,
            nota: data.nota || '',
          } as TimeItem
        })
        setTimes(items)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const displayTime = (t: TimeItem) => {
    if (typeof t.tiempoMs === 'number') return formatMsToDisplay(t.tiempoMs)
    if (t.tiempo) {
      const parsed = parseTimeStringToMs(t.tiempo)
      if (parsed != null) return formatMsToDisplay(parsed)
      return t.tiempo
    }
    return ''
  }

  const getMsValue = (t: TimeItem) => {
    if (typeof t.tiempoMs === 'number') return t.tiempoMs
    if (t.tiempo) {
      const parsed = parseTimeStringToMs(t.tiempo)
      if (parsed != null) return parsed
    }
    return Number.POSITIVE_INFINITY
  }

  // Apply filters (case-insensitive contains) and sort by time ascending
  const filtered = times
    .filter((t) => {
      const nombreOk = nombreFilter.trim() === '' || t.nombre.toLowerCase().includes(nombreFilter.trim().toLowerCase())
      const carroOk = carroFilter.trim() === '' || t.carro.toLowerCase().includes(carroFilter.trim().toLowerCase())
      const tramoOk = tramoFilter.trim() === '' || t.tramo.toLowerCase().includes(tramoFilter.trim().toLowerCase())
      return nombreOk && carroOk && tramoOk
    })
    .sort((a, b) => getMsValue(a) - getMsValue(b))

  return (
    <div style={{ padding: 12 }}>
      <h2>Tiempos de la pista - Medellín</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <input
              placeholder="Filtrar por nombre"
              value={nombreFilter}
              onChange={(e) => setNombreFilter(e.target.value)}
              style={{ padding: 6 }}
            />
            <input
              placeholder="Filtrar por carro"
              value={carroFilter}
              onChange={(e) => setCarroFilter(e.target.value)}
              style={{ padding: 6 }}
            />
            <input
              placeholder="Filtrar por tramo"
              value={tramoFilter}
              onChange={(e) => setTramoFilter(e.target.value)}
              style={{ padding: 6 }}
            />
          </div>

          <div className="times-container">
            <table className="times-table">
              <thead>
                <tr>
                  <th className="pos">Pos</th>
                  <th>Tramo</th>
                  <th>Carro</th>
                  <th>Nombre conductor</th>
                  <th>Tiempo</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => {
                  const pos = idx + 1
                  const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : String(pos)
                  return (
                    <tr key={t.id}>
                      <td className="pos" data-label="Pos">
                        {medal}
                      </td>
                      <td data-label="Tramo">{t.tramo}</td>
                      <td data-label="Carro">{t.carro}</td>
                      <td data-label="Nombre">{t.nombre}</td>
                      <td data-label="Tiempo">{displayTime(t)}</td>
                      <td data-label="Nota">{t.nota || ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      {/* Videos section below the table */}
      <VideosGrid />
    </div>
  )
}

export default TimesList
