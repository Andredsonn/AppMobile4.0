import React, { useState } from 'react'
import MidasWidget from '../components/MidasWidget'

export function MidasDemoPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/demo-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      if (!res.ok) throw new Error('Auth failed')
      const data = await res.json()
      localStorage.setItem('demo-token', data.token)
      setMessage('Login successful')
    } catch (err) {
      setMessage('Login failed')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>MIDAS Demo</h2>
      <form onSubmit={login}>
        <div>
          <label htmlFor="demo-username">Usuário: </label>
          <input id="demo-username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label htmlFor="demo-password">Senha: </label>
          <input id="demo-password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </div>
        <button type="submit">Entrar</button>
      </form>
      {message && <div role="status">{message}</div>}

      <MidasWidget />
    </div>
  )
}

export default MidasDemoPage
