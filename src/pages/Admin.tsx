import React, { useEffect, useState } from 'react'
import { db, collection, getDocs, addDoc, setDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from '../firebase'
import { parseTimeStringToMs, formatMsToDisplay } from '../utils/time'

type TimeItem = {
  id?: string
  tramo: string
  carro: string
  nombre: string
  tiempo: string
  tiempoMs?: number
  nota?: string
}

const Admin: React.FC = () => {
  const [items, setItems] = useState<TimeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<TimeItem>({ tramo: '', carro: '', nombre: '', tiempo: '', nota: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'times'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TimeItem, 'id'>) })))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setFormError(null)
      // parse tiempo input into milliseconds and a normalized display string
      const parsed = parseTimeStringToMs(form.tiempo)
      const tiempoMs = parsed ?? null
      // if user typed something but we couldn't parse it, reject
      if (form.tiempo && tiempoMs == null) {
        setFormError('Formato de tiempo no válido. Usa MM:SS:ms (ej. 01:23:456) o MM:SS.ms, SS.ms, SS')
        return
      }
      const tiempoDisplay = tiempoMs != null ? formatMsToDisplay(tiempoMs) : form.tiempo

  const payload: Record<string, unknown> = { ...form, tiempo: tiempoDisplay, createdAt: serverTimestamp() }
      if (tiempoMs != null) payload.tiempoMs = tiempoMs

      if (editingId) {
        await setDoc(doc(db, 'times', editingId), { ...payload, updatedAt: serverTimestamp() }, { merge: true })
      } else {
        await addDoc(collection(db, 'times'), payload)
      }
      setForm({ tramo: '', carro: '', nombre: '', tiempo: '', nota: '' })
      setEditingId(null)
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  const handleEdit = (it: TimeItem) => {
    setEditingId(it.id ?? null)
    // prefill tiempo input: prefer the stored display or format from tiempoMs
    const tiempoPrefill = it.tiempo || (it.tiempoMs != null ? formatMsToDisplay(it.tiempoMs) : '')
    setForm({ tramo: it.tramo || '', carro: it.carro || '', nombre: it.nombre || '', tiempo: tiempoPrefill, nota: it.nota || '' })
  }

  const handleDelete = async (id?: string) => {
    if (!id) return
    if (!confirm('Eliminar este tiempo?')) return
    try {
      await deleteDoc(doc(db, 'times', id))
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <h2>Admin - CRUD de tiempos</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <input placeholder="Tramo" value={form.tramo} onChange={(e) => setForm({ ...form, tramo: e.target.value })} />
        <input placeholder="Carro" value={form.carro} onChange={(e) => setForm({ ...form, carro: e.target.value })} />
        <input placeholder="Nombre conductor" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
  <input placeholder="Tiempo (mm:ss:ms, p.ej. 01:23:456)" value={form.tiempo} onChange={(e) => setForm({ ...form, tiempo: e.target.value })} />
  <small>Formato aceptado: MM:SS:ms (ej. 01:23:456) o MM:SS.ms; también acepta SS.ms o SS</small>
    {formError && <div style={{ color: 'red' }}>{formError}</div>}
        <input placeholder="Nota" value={form.nota} onChange={(e) => setForm({ ...form, nota: e.target.value })} />
          <button type="submit">{editingId ? 'Guardar cambios' : 'Agregar tiempo'}</button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ tramo: '', carro: '', nombre: '', tiempo: '', nota: '' }) }}>
              Cancelar
            </button>
          )}
      </form>

      <hr />

      {loading ? <p>Cargando...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Tramo</th>
              <th>Carro</th>
              <th>Nombre</th>
              <th>Tiempo</th>
              <th>Nota</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.tramo}</td>
                <td>{it.carro}</td>
                <td>{it.nombre}</td>
                <td>{it.tiempo}</td>
                <td>{it.nota}</td>
                <td>
                  <button onClick={() => handleEdit(it)}>Editar</button>
                  <button onClick={() => handleDelete(it.id)}>Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Admin
