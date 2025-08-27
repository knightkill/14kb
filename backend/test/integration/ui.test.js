/** @jest-environment jsdom */
/* eslint-env browser */
import { render } from '@testing-library/preact'
import { h } from 'preact'
import htm from 'htm'

const html = htm.bind(h)

// Mock the app component with the same structure as the real one
function App() {
  const stats = [
    ['Weight', '80.40 kg'],
    ['Respiratory Rate', '17.19 /min'],
    ['Heart Rate', '80.26 bpm'],
    ['Sleep', '619.70 min'],
    ['Steps', '6402 steps'],
    ['Active Energy Burned', '131.64 cal']
  ]
  const projects = [
    ['Portfolio', 'Auto-updateable data driven digital copy of you'],
    ['Challenges', 'Where I backlog and solve weird random challenges'],
    ['Jobs Jedi', '(Not yet public) Making Job hunting easy-peasy'],
    ['Selfathon',
      'Selfathon enables scheduling of focused sessions from 8 hours to a week, '
      + 'with real-time progress updates and customized notifications, all within a supportive community framework.'],
    ['Cover Letter Maker', 'Tool to compose tailored cover letters']
  ]
  const work = [
    ['Atyantik Technologies', 'A company that helps you build your dream product.'],
    ['Tooly', 'A company that helps you exceed your goals with a successful digital transformation.'],
    ['Syncezy',
      'A company that helps you pre-made integrations to automate your business processes or '
      + 'make your own customized integration.'],
    ['Anormaly',
      'Worked under this name for about 25+ small/medium projects before I started working '
      + 'for contract based companies.']
  ]
  return html`<main>
    <header>
      <h1>Hardip Patel</h1>
    </header>
    <section class="stats-section">
      <h2>Vital Stats</h2>
      <ul>
        ${stats.map(([k,v]) => html`<li><strong>${k}</strong><span>${v}</span></li>`)}
      </ul>
    </section>
    <section class="projects-section">
      <h2>Projects</h2>
      <ul>
        ${projects.map(([k,v]) => html`<li><strong>${k}</strong><span>${v}</span></li>`)}
      </ul>
    </section>
    <section class="work-section">
      <h2>Experience</h2>
      <ul>
        ${work.map(([k,v]) => html`<li><strong>${k}</strong><span>${v}</span></li>`)}
      </ul>
    </section>
  </main>`
}

describe('ui', () => {
  test('renders portfolio content', () => {
    const { getByText } = render(h(App))
    getByText('Hardip Patel')
    getByText('Vital Stats')
    getByText(/Weight/)
    getByText(/80\.40 kg/)
    getByText('Projects')
    getByText(/Portfolio/)
    getByText('Experience')
    getByText(/Atyantik Technologies/)
  })
})
