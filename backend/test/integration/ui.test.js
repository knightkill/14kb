/** @jest-environment jsdom */
/* eslint-env browser */
import { render, fireEvent } from '@testing-library/preact'
import { h } from 'preact'
import { jest } from '@jest/globals'
import htm from 'htm'

global.htm = htm
const { default: App } = await import('../../../frontend/app.js')

describe('ui', () => {
  beforeEach(() => {
    document.body.className = ''
    global.fetch = jest.fn().mockResolvedValue({ok: true})
  })

  test('toggles dark mode', () => {
    const { getByText } = render(h(App))
    const btn = getByText('toggle')
    expect(document.body.classList.contains('dark')).toBe(false)
    fireEvent.click(btn)
    expect(document.body.classList.contains('dark')).toBe(true)
  })

  test('submits contact form', () => {
    const { getByPlaceholderText, getByText } = render(h(App))
    fireEvent.input(getByPlaceholderText('name'), {target: {name: 'name', value: 'a'}})
    fireEvent.input(getByPlaceholderText('email'), {target: {name: 'email', value: 'a@b.c'}})
    fireEvent.input(getByPlaceholderText('message'), {target: {name: 'message', value: 'hi'}})
    fireEvent.click(getByText('send'))
    expect(global.fetch).toHaveBeenCalledWith('/contact', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name: 'a', email: 'a@b.c', message: 'hi'})
    })
  })
})
