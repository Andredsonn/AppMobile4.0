import React, { useState } from 'react'

export type MidasProfile = {
  race?: string
  gender?: string
  color?: string
}

export function MidasWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<string[]>([
    'Olá! Eu sou Midas. Posso dar insights financeiros.'
  ])
  const [input, setInput] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profile, setProfile] = useState<MidasProfile>({})

  React.useEffect(() => {
    const token = localStorage.getItem('demo-token')
    if (!token) return
    fetch('/api/midas/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d?.profile) setProfile(d.profile)
      })
      .catch(() => {})
  }, [])

  function toggle() {
    setOpen(!open)
  }

  function sendTip() {
    setMessages((m) => [...m, 'Dica: Separe contas pessoais e empresariais.'])
  }

  async function sendMessage() {
    if (!input) return
    setMessages((m) => [...m, `Você: ${input}`])
    const token = localStorage.getItem('demo-token')

    try {
      const res = await fetch('/api/midas/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: input }),
      })

      const data = await res.json()

      setMessages((m) => [...m, data.reply || 'Sem resposta do assistente.'])
    } catch (e) {
      setMessages((m) => [...m, 'Erro ao contatar MIDAS.'])
    } finally {
      setInput('')
    }
  }

  function saveProfile() {
    const token = localStorage.getItem('demo-token')
    fetch('/api/midas/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(profile),
    })
      .then((r) => r.json())
      .then((d) => {
        setMessages((m) => [...m, 'Perfil salvo com sucesso.'])
        setSettingsOpen(false)
      })
      .catch(() => setMessages((m) => [...m, 'Erro ao salvar perfil.']))
  }

  return (
    <div>
      <button
        aria-label="midas-toggle"
        onClick={toggle}
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'gold',
          border: 'none',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}
      >
        M
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="midas-balloons"
          style={{ position: 'fixed', right: 100, bottom: 90, width: 280 }}
        >
          <div style={{ marginBottom: 8 }}>
            <button onClick={() => setSettingsOpen(!settingsOpen)}>Personalizar</button>
          </div>
          {settingsOpen && (
            <div style={{ marginBottom: 8, background: '#f6f6f6', padding: 8, borderRadius: 8 }}>
              <div>
                <label>Raça: </label>
                <select value={profile.race || ''} onChange={(e) => setProfile({ ...profile, race: e.target.value })}>
                  <option value="">Padrão</option>
                  <option value="branco">Branco</option>
                  <option value="negro">Negro</option>
                  <option value="pardo">Pardo</option>
                </select>
              </div>
              <div>
                <label>Sexo: </label>
                <select value={profile.gender || ''} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
                  <option value="">Padrão</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              </div>
              <div>
                <label>Cor: </label>
                <input value={profile.color || ''} onChange={(e) => setProfile({ ...profile, color: e.target.value })} />
              </div>
              <div style={{ marginTop: 8 }}>
                <button onClick={saveProfile}>Salvar</button>
              </div>
            </div>
          )}
          {messages.map((t, i) => (
            <div key={i} style={{ background: '#fff', padding: 8, marginBottom: 8, borderRadius: 8 }}>
              {t}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              aria-label="midas-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva sua pergunta para o Midas"
              style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
            />
            <button onClick={sendMessage}>Enviar</button>
            <button onClick={sendTip}>Dica</button>
            <button onClick={() => setOpen(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MidasWidget
