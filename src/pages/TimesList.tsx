import React, { useEffect, useState } from 'react'
import { db, collection, query, orderBy, getDocs } from '../firebase'
import { formatMsToDisplay, parseTimeStringToMs } from '../utils/time'

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

  return (
    <div style={{ padding: 12 }}>
      <h2>Tiempos de la pista - Medellín</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Tramo</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Carro</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Nombre conductor</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Tiempo</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Nota</th>
            </tr>
          </thead>
          <tbody>
            {times.map((t) => (
              <tr key={t.id}>
                <td style={{ border: '1px solid #eee', padding: 8 }}>{t.tramo}</td>
                <td style={{ border: '1px solid #eee', padding: 8 }}>{t.carro}</td>
                <td style={{ border: '1px solid #eee', padding: 8 }}>{t.nombre}</td>
                <td style={{ border: '1px solid #eee', padding: 8 }}>{displayTime(t)}</td>
                <td style={{ border: '1px solid #eee', padding: 8 }}>{t.nota || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default TimesList
