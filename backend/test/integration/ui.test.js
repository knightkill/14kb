/* global document */
import { h } from 'preact'
import { jest } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/preact'
import App from 'frontend/app.js'

describe('App UI', () => {
  test('toggles dark mode', () => {
    render(h(App))
    const btn = screen.getByText('toggle')
    expect(document.body.classList.contains('dark')).toBe(false)
    fireEvent.click(btn)
    expect(document.body.classList.contains('dark')).toBe(true)
  })

  test('submits contact form', async () => {
    const fetchSpy = jest.fn().mockResolvedValue({})
    global.fetch = fetchSpy
    render(h(App))
    fireEvent.input(screen.getByPlaceholderText('name'), { target: { value: 'a' } })
    fireEvent.input(screen.getByPlaceholderText('email'), { target: { value: 'b' } })
    fireEvent.input(screen.getByPlaceholderText('message'), { target: { value: 'c' } })
    fireEvent.submit(screen.getByRole('button', { name: 'send' }).closest('form'))
    expect(fetchSpy).toHaveBeenCalled()
  })
})
