import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

test('index.html has correct title', () => {
  const file = path.resolve(__dirname, '../../../frontend/index.html')
  const html = fs.readFileSync(file, 'utf8')
  expect(html).toContain('<title>14KB Portfolio</title>')
})
