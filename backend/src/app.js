import express from 'express'
import routes from './routes.js'

const app = express()
app.use(express.json())
app.use('/', routes)

export default app

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000
  app.listen(port, () => console.log(`api listening on ${port}`))
}
