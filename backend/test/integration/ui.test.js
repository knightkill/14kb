/** @jest-environment jsdom */
/* eslint-env browser */
import { render } from '@testing-library/preact'
import { h } from 'preact'
import htm from 'htm'

global.htm = htm
const { default: App } = await import('../../../frontend/app.js')

describe('ui', () => {
  test('renders portfolio content', () => {
    const { getByText } = render(h(App))
    getByText('Hardip Patel')
    getByText('Stats')
    getByText(/Weight/)
    getByText(/80\.40 kg/)
    getByText('Projects')
    getByText(/Portfolio/)
    getByText('Work')
    getByText(/Atyantik Technologies/)
  })
})
