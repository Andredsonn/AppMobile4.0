import React from 'react'
import { vi, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

function TestButton({ onClick }: { onClick?: () => void }) {
  return <button onClick={onClick}>Clique</button>
}

describe('button', () => {
  it('renders and responds to clicks', async () => {
    const user = userEvent.setup()
    const handle = vi.fn()

    render(<TestButton onClick={handle} />)

    const btn = screen.getByRole('button', { name: /clique/i })
    await user.click(btn)

    expect(handle).toHaveBeenCalled()
  })
})
