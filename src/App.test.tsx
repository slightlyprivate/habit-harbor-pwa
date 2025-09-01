import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'

test('renders Habit Harbor title', () => {
  render(<App />)
  expect(screen.getByText('Habit Harbor')).toBeInTheDocument()
})