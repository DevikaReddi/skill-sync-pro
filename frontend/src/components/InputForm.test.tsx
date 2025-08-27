import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InputForm } from './InputForm'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    promise: vi.fn(),
  },
}))

describe('InputForm', () => {
  it('renders input form heading', () => {
    render(<InputForm />)
    expect(screen.getByText(/Analyze Your Resume Match/i)).toBeInTheDocument()
  })

  it('renders sample data button', () => {
    render(<InputForm />)
    expect(screen.getByText(/Load Sample Data/i)).toBeInTheDocument()
  })

  it('renders analyze button', () => {
    render(<InputForm />)
    expect(screen.getByText(/Analyze Match/i)).toBeInTheDocument()
  })
})
