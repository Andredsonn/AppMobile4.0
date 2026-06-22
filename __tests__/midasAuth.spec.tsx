import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MidasDemoPage from '../../src/pages/MidasDemoPage'

describe('Midas demo auth', () => {
  it('logs in with Admin / Senha@123', async () => {
    const user = userEvent.setup()

    // mock fetch for demo-auth
    vi.stubGlobal('fetch', vi.fn(async (input, init) => {
      if (typeof input === 'string' && input.endsWith('/api/demo-auth')) {
        const body = JSON.parse(String(init?.body))
        if (body.username === 'Admin' && body.password === 'Senha@123') {
          return { ok: true, json: async () => ({ token: 'demo-token' }) } as any
        }
        return { ok: false, status: 401, json: async () => ({ message: 'Invalid' }) } as any
      }
      return { ok: false } as any
    }))

    render(<MidasDemoPage />)

    await user.type(screen.getByLabelText(/usuário/i), 'Admin')
    await user.type(screen.getByLabelText(/senha/i), 'Senha@123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(/login successful/i)
  })
})
