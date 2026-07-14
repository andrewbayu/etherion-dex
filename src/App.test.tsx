import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { DEMO_EMAIL, DEMO_PASSWORD } from './data'

describe('Etherion demo access', () => {
  beforeEach(() => localStorage.clear())

  it('shows the public demo credentials', () => {
    render(<App />)
    expect(screen.getByText(DEMO_EMAIL, { exact: false })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /welcome to the research desk/i })).toBeInTheDocument()
  })

  it('rejects incorrect credentials without revealing account details', async () => {
    const user = userEvent.setup()
    render(<App />)
    const password = screen.getByLabelText('Password')
    await user.clear(password)
    await user.type(password, 'wrong-password')
    await user.click(screen.getByRole('button', { name: /enter demo/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('do not match')
  })

  it('opens the product workspace with the demo account', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByDisplayValue(DEMO_EMAIL)).toBeInTheDocument()
    expect(screen.getByDisplayValue(DEMO_PASSWORD)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /enter demo/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /good morning, alex/i })).toBeInTheDocument())
    expect(screen.getByRole('heading', { name: 'AI watchlist' })).toBeInTheDocument()
    expect(localStorage.getItem('etherion-demo-session')).toBe('active')
  })
})
