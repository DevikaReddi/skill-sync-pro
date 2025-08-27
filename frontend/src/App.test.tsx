import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Mock the API service
vi.mock('./services/api', () => ({
  default: {
    checkHealth: vi.fn(() => Promise.resolve(true))
  }
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('App', () => {
  it('renders headline', () => {
    render(<App />)
    // The headline is in the Header component
    expect(screen.getByText(/SkillSync Pro/i)).toBeInTheDocument()
  })

  it('shows tab navigation', () => {
    render(<App />)
    expect(screen.getByText(/Input/i)).toBeInTheDocument()
    expect(screen.getByText(/Results/i)).toBeInTheDocument()
  })
  
  it('renders footer', () => {
    render(<App />)
    expect(screen.getByText(/Built with/i)).toBeInTheDocument()
  })
})
