/** @jest-environment node */
import request from 'supertest'
import app from '../../src/app.js'
import { contacts } from '../../src/routes.js'

describe('api', () => {
  beforeEach(() => {
    contacts.length = 0
  })
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({status: 'ok'})
  })

  test('POST /contact accepts payload', async () => {
    const payload = {name: 'a', email: 'a@b.c', message: 'hi'}
    const res = await request(app).post('/contact').send(payload)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({received: true})
    expect(contacts).toContainEqual(payload)
  })
})
