import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import htm from 'https://esm.sh/htm@3.1.1'

const html = htm.bind(h)

export default function App() {
  const [dark, setDark] = useState(false)
  const [form, setForm] = useState({name: '', email: '', message: ''})
  useEffect(() => {
    document.body.classList.toggle('dark', dark)
  }, [dark])
  const change = e => setForm({...form, [e.target.name]: e.target.value})
  const submit = e => {
    e.preventDefault()
    fetch('/contact', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(form)
    })
  }
  return html`
    <header>
      <h1>Hardip Patel</h1>
      <button class='toggle-btn' onClick=${() => setDark(!dark)}>toggle</button>
    </header>
    <p class='intro'>Product designer crafting minimal, high-impact interfaces.</p>
    <p class='intro'>Latest thought: "Measure productivity with at least 40% uplift."</p>
    <form onSubmit=${submit}>
      <input class='form-input' placeholder='name' name='name' value=${form.name} onInput=${change} />
      <input class='form-input' placeholder='email' name='email' type='email' value=${form.email} onInput=${change} />
      <textarea class='form-input' placeholder='message' name='message' value=${form.message} onInput=${change}></textarea>
      <button class='submit-btn' type='submit'>send</button>
    </form>
    <footer><small>&copy; 2024 Hardip Patel</small></footer>
  `
}
