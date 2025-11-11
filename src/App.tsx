import { useEffect, useState } from 'react'
import './App.css'
import {
  createBrowserRouter,
  RouterProvider,
  Link,
  Outlet,
  useNavigate,
} from 'react-router-dom'
import TimesList from './pages/TimesList'
import Admin from './pages/Admin'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { auth, signOut, onAuthStateChanged } from './firebase'

function Layout() {
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  return (
    <div>
      <nav style={{ display: 'flex', gap: 12, padding: 12 }}>
        <Link to="/">Tiempos</Link>
        <Link to="/admin">Admin</Link>
        {user ? (
          <button onClick={handleLogout}>Cerrar sesión</button>
        ) : (
          <Link to="/login">Iniciar sesión</Link>
        )}
      </nav>
      <Outlet />
    </div>
  )
}

// NOTE: When deploying to GitHub Pages under a repository (project page)
// the app is served under a subpath (e.g. '/pagina-de-tiempos/').
// We must set the router basename to the same subpath so route matching
// works correctly when the app is loaded from that subpath.
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <TimesList /> },
        { path: 'login', element: <Login /> },
        { path: 'admin', element: <ProtectedRoute><Admin /></ProtectedRoute> },
      ],
    },
  ],
  // Opt into the v7 relative splat path behavior and set basename for GH Pages
  { future: { v7_relativeSplatPath: true }, basename: '/pagina-de-tiempos' },
)

function App() {
  return <RouterProvider router={router} />
}

export default App
