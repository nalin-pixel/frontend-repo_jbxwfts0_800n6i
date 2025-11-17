import { useState } from 'react'

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const form = new URLSearchParams()
      form.append('username', email)
      form.append('password', password)
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form,
      })
      if (!res.ok) throw new Error('Onjuiste inloggegevens')
      const data = await res.json()
      localStorage.setItem('token', data.access_token)
      const me = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      })
      const meData = await me.json()
      onLoggedIn({ token: data.access_token, user: meData })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium">Wachtwoord</label>
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" required />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">{loading ? 'Bezig...' : 'Inloggen'}</button>
    </form>
  )
}
