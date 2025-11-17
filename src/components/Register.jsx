import { useState } from 'react'

export default function Register({ onRegistered }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('technician')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = { name, email, role, password_hash: password }
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Registratie mislukt')
      const user = await res.json()
      onRegistered(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Naam</label>
        <input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium">Rol</label>
        <select value={role} onChange={(e)=>setRole(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
          <option value="technician">Monteur</option>
          <option value="office">Kantoor</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Wachtwoord</label>
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" required />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">{loading ? 'Bezig...' : 'Account aanmaken'}</button>
    </form>
  )
}
