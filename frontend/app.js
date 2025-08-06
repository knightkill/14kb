import { h, render } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import htm from 'htm'

const html = htm.bind(h)

export default function App () {
  const [dark, setDark] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  useEffect(() => {
    document.body.className = dark ? 'dark' : ''
  }, [dark])

  const update = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = e => {
    e.preventDefault()
    fetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
  }

  return html`<div>
    <header>
      <h1>14KB Portfolio</h1>
      <button onClick=${() => setDark(!dark)}>toggle</button>
    </header>
    <main>
      <p>minimal portfolio</p>
      <form onSubmit=${submit}>
        <input placeholder="name" name="name" value=${form.name} onInput=${update} />
        <input placeholder="email" name="email" type="email" value=${form.email} onInput=${update} />
        <textarea placeholder="message" name="message" onInput=${update}>${form.message}</textarea>
        <button type="submit">send</button>
      </form>
    </main>
    <footer>
      <small>&copy; 2024</small>
    </footer>
  </div>`
}

export function init () {
  render(html`<${App}/>`, document.getElementById('app'))
}

if (typeof document !== 'undefined' && document.getElementById('app')) {
  init()
}
