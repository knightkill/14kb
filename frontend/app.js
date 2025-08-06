import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'

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
      <h1>14KB Portfolio</h1>
      <button onClick=${() => setDark(!dark)}>toggle</button>
    </header>
    <main>
      <p>minimal portfolio</p>
      <form onSubmit=${submit}>
        <input placeholder='name' name='name' value=${form.name} onInput=${change} />
        <input placeholder='email' name='email' type='email' value=${form.email} onInput=${change} />
        <textarea placeholder='message' name='message' value=${form.message} onInput=${change}></textarea>
        <button type='submit'>send</button>
      </form>
    </main>
    <footer><small>&copy; 2024</small></footer>
  `
}
