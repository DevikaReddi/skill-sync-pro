import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders headline', () => {
    render(<App />)
    expect(screen.getByText(/SkillSync Pro/i)).toBeInTheDocument()
  })

  it('shows system status', () => {
    render(<App />)
    expect(screen.getByText(/System Status/i)).toBeInTheDocument()
  })
})
