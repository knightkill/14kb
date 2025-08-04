import { Router } from 'express'

const contacts = []
const router = Router()

router.get('/health', (req, res) => {
  res.json({status: 'ok'})
})

router.post('/contact', (req, res) => {
  contacts.push(req.body)
  res.json({received: true})
})

export { contacts }
export default router
