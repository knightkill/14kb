import request from 'supertest'
import app from '../../src/app.js'

describe('api', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({status: 'ok'})
  })

  test('POST /contact accepts payload', async () => {
    const res = await request(app)
      .post('/contact')
      .send({name: 'a', email: 'a@b.c', message: 'hi'})
    expect(res.status).toBe(200)
    expect(res.body).toEqual({received: true})
  })
})
