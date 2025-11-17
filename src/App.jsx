import { useEffect, useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Header from './components/Header'

function App() {
  const [auth, setAuth] = useState({ token: localStorage.getItem('token'), user: null })
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    const load = async () => {
      if (auth.token && !auth.user) {
        try {
          const res = await fetch(`${baseUrl}/auth/me`, { headers: { Authorization: `Bearer ${auth.token}` } })
          if (res.ok) {
            const user = await res.json()
            setAuth(a => ({ ...a, user }))
          }
        } catch {}
      }
    }
    load()
  }, [auth.token])

  const logout = () => {
    localStorage.removeItem('token')
    setAuth({ token: null, user: null })
  }

  if (!auth.token || !auth.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 space-y-6">
          <div className="flex items-center justify-center"><Header /></div>
          <Login onLoggedIn={setAuth} />
          <div className="relative">
            <div className="flex items-center my-2"><div className="flex-1 h-px bg-gray-200"></div><span className="px-3 text-xs text-gray-400">of</span><div className="flex-1 h-px bg-gray-200"></div></div>
          </div>
          <Register onRegistered={() => {}} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="flex items-center justify-between bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-3"><Header /></div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Ingelogd als</p>
          <h2 className="text-lg font-semibold">{auth.user.name} · {auth.user.role === 'office' ? 'Kantoor' : 'Monteur'}</h2>
        </div>
        <button onClick={logout} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded">Uitloggen</button>
      </header>

      {auth.user.role === 'technician' ? <TechnicianView token={auth.token} /> : <OfficeView token={auth.token} />}
    </div>
  )
}

function TechnicianView({ token }) {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [items, setItems] = useState([])
  const [sku, setSku] = useState('')
  const [qty, setQty] = useState(0)

  const load = async () => {
    const res = await fetch(`${baseUrl}/stock/mine`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setItems(await res.json())
  }
  useEffect(()=>{ load() }, [])

  const update = async () => {
    const res = await fetch(`${baseUrl}/stock/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sku, quantity: Number(qty) })
    })
    if (res.ok) { setSku(''); setQty(0); load() }
  }

  return (
    <div className="mt-6 grid gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Mijn voorraad</h3>
        <ul className="divide-y">
          {items.map(i => (
            <li key={i.id} className="py-2 flex justify-between">
              <span>{i.sku}</span>
              <span className="font-medium">{i.quantity}</span>
            </li>
          ))}
          {items.length===0 && <p className="text-sm text-gray-500">Nog geen items</p>}
        </ul>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Voorraad bijwerken</h3>
        <div className="grid grid-cols-3 gap-3">
          <input value={sku} onChange={e=>setSku(e.target.value)} placeholder="SKU" className="border rounded px-3 py-2" />
          <input type="number" value={qty} onChange={e=>setQty(e.target.value)} placeholder="Aantal" className="border rounded px-3 py-2" />
          <button onClick={update} className="bg-blue-700 hover:bg-blue-800 text-white rounded px-3 py-2">Opslaan</button>
        </div>
      </div>
    </div>
  )
}

function OfficeView({ token }) {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [rows, setRows] = useState([])

  const load = async () => {
    const res = await fetch(`${baseUrl}/stock/overview`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setRows(await res.json())
  }
  useEffect(()=>{ load() }, [])

  return (
    <div className="mt-6 bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Live voorraad per monteur</h3>
      <div className="grid grid-cols-4 text-xs font-medium text-gray-500">
        <div>Gebruiker</div><div>SKU</div><div>Aantal</div><div>ID</div>
      </div>
      <div className="divide-y">
        {rows.map(r => (
          <div key={r.id} className="grid grid-cols-4 py-2 text-sm">
            <div>{r.user_id}</div>
            <div>{r.sku}</div>
            <div>{r.quantity}</div>
            <div className="text-gray-400">{r.id}</div>
          </div>
        ))}
        {rows.length===0 && <p className="text-sm text-gray-500">Nog geen data</p>}
      </div>
    </div>
  )
}

export default App
