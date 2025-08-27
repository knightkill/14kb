import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import os from 'os'
import path from 'path'

const env = {
  ...process.env,
  http_proxy: '',
  https_proxy: '',
  HTTP_PROXY: '',
  HTTPS_PROXY: ''
}

if (process.argv.includes('--quick')) {
  process.env.NODE_ENV = 'test'
  const { default: app } = await import('../../src/app.js')
  const server = app.listen(3000)
  
  await new Promise(res => server.on('listening', res))
  console.log('Server started on port 3000')
  
  // Wait a bit more to ensure server is fully ready
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Test server connectivity first
  try {
    execSync('curl -f http://127.0.0.1:3000/health', { stdio: 'inherit', timeout: 5000 })
    console.log('Server health check passed, running artillery test...')
  } catch (error) {
    console.error('Server health check failed:', error.message)
    server.close()
    process.exit(1)
  }
  
  try {
    execSync('npx artillery quick --count 1 --num 1 http://127.0.0.1:3000/health', {
      stdio: 'inherit',
      env,
      timeout: 10000
    })
    console.log('Quick stress test completed successfully')
  } catch (error) {
    console.error('Artillery test failed:', error.message)
    server.close()
    process.exit(1)
  } finally {
    server.close()
  }
  process.exit(0)
}

const script = path.join('test', 'stress', 'high-concurrency.yml')
const out = path.join(os.tmpdir(), 'artillery-report.json')
execSync(`npx artillery run ${script} -o ${out}`, {stdio: 'inherit', env})
const data = JSON.parse(readFileSync(out))
const p90 = data.aggregate.latency?.p90 || 0
const errors = data.aggregate.errors || {}
const totalErrors = Object.values(errors).reduce((a, b) => a + b, 0)
const totalRequests = data.aggregate.requestsCompleted || 1
const errorRate = totalErrors / totalRequests
const cpu = os.loadavg()[0] / os.cpus().length
const mem = process.memoryUsage().rss / os.totalmem()
if (p90 > 200 || errorRate > 0.001 || cpu > 0.7 || mem > 0.7) {
  console.error('stress thresholds exceeded')
  process.exit(1)
}
