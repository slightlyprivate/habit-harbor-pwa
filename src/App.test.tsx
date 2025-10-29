import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'

test('renders Habit Log title', () => {
  render(<App />)
  expect(screen.getByText('Habit Log')).toBeInTheDocument()
})
