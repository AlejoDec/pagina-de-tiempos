import React, { useEffect, useState } from 'react'
// Navigate not needed here
import { auth, onAuthStateChanged, isAdmin } from '../firebase'

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [ok, setOk] = useState(false)
  const [uid, setUid] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setErrorMsg(null)
      if (u) {
        setUid(u.uid)
        try {
          const adm = await isAdmin(u.uid)
          setOk(adm)
          if (!adm) setErrorMsg('No existe un documento admin para este usuario (admins/{uid}).')
        } catch (e: unknown) {
          // isAdmin already logs, but capture a friendly message here
          console.error('isAdmin check failed', e)
          const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message?: unknown }).message) : String(e)
          setErrorMsg(msg)
          setOk(false)
        }
      } else {
        setUid(null)
        setOk(false)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  if (loading) return <div style={{ padding: 12 }}>Comprobando permisos...</div>

  // If there is an error (permissions or otherwise), show a helpful message instead of silent redirect
  if (!ok) {
    return (
      <div style={{ padding: 12 }}>
        <h3>Acceso denegado</h3>
        <p>No tienes permisos para acceder a esta página de administración.</p>
        {uid && <p><strong>UID:</strong> {uid}</p>}
        {errorMsg && (
          <div style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
            <strong>Detalle:</strong>
            <div>{errorMsg}</div>
          </div>
        )}
        <p>Pasos recomendados:</p>
        <ol>
          <li>Asegúrate de que has iniciado sesión correctamente.</li>
          <li>En la consola de Firebase, crea un documento en <code>{'admins/{uid}'}</code> con el UID mostrado arriba.</li>
          <li>Revisa las reglas de Firestore para permitir lectura de <code>{'admins/{userId}'}</code> por el usuario autenticado.</li>
        </ol>
        <p>
          Si quieres, <a href="/login">inicia sesión</a> con otro usuario o contacta al administrador del proyecto.
        </p>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
